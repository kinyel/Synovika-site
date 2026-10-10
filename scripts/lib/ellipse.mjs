/**
 * Ellipse fitting for the logo's orbit ring. An ellipse is
 * { cx, cy, a, b, theta }: centre, semi-axes (a along the rotated x axis)
 * and rotation in radians (screen coordinates, y down).
 */

/** A point in the ellipse's own frame. */
export function local(e, x, y) {
  const c = Math.cos(e.theta), s = Math.sin(e.theta);
  const dx = x - e.cx, dy = y - e.cy;
  return { u: dx * c + dy * s, v: -dx * s + dy * c };
}

/** Signed distance from the ellipse (Sampson approximation): + outside, - inside. */
export function distance(e, x, y) {
  const { u, v } = local(e, x, y);
  const f = (u * u) / (e.a * e.a) + (v * v) / (e.b * e.b) - 1;
  const gu = (2 * u) / (e.a * e.a), gv = (2 * v) / (e.b * e.b);
  return f / Math.hypot(gu, gv);
}

/** The point at parameter t (radians). */
export function at(e, t) {
  const c = Math.cos(e.theta), s = Math.sin(e.theta);
  const u = e.a * Math.cos(t), v = e.b * Math.sin(t);
  return { x: e.cx + u * c - v * s, y: e.cy + u * s + v * c };
}

/** The parameter of the ellipse point nearest (x, y), by a fine search then refinement. */
export function nearestT(e, x, y) {
  let best = 0, bestD = Infinity;
  for (let i = 0; i < 3600; i++) {
    const t = (i / 3600) * Math.PI * 2;
    const p = at(e, t);
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bestD) (bestD = d), (best = t);
  }
  return best;
}

/** Nelder-Mead minimisation of f over a vector, from x0 with step sizes. */
export function minimise(f, x0, steps, iterations = 4000) {
  const n = x0.length;
  let simplex = [x0.slice()];
  for (let i = 0; i < n; i++) {
    const p = x0.slice();
    p[i] += steps[i];
    simplex.push(p);
  }
  let values = simplex.map(f);
  for (let k = 0; k < iterations; k++) {
    const order = values.map((v, i) => i).sort((i, j) => values[i] - values[j]);
    simplex = order.map((i) => simplex[i]);
    values = order.map((i) => values[i]);
    const centroid = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) centroid[j] += simplex[i][j] / n;
    const worst = simplex[n];
    const towards = (t) => centroid.map((c, j) => c + t * (worst[j] - c));
    const reflected = towards(-1);
    const fr = f(reflected);
    if (fr < values[0]) {
      const expanded = towards(-2);
      const fe = f(expanded);
      if (fe < fr) (simplex[n] = expanded), (values[n] = fe);
      else (simplex[n] = reflected), (values[n] = fr);
    } else if (fr < values[n - 1]) {
      simplex[n] = reflected;
      values[n] = fr;
    } else {
      const contracted = towards(0.5);
      const fc = f(contracted);
      if (fc < values[n]) (simplex[n] = contracted), (values[n] = fc);
      else
        for (let i = 1; i <= n; i++) {
          simplex[i] = simplex[i].map((v, j) => simplex[0][j] + 0.5 * (v - simplex[0][j]));
          values[i] = f(simplex[i]);
        }
    }
    if (Math.abs(values[n] - values[0]) < 1e-10) break;
  }
  const i = values.indexOf(Math.min(...values));
  return simplex[i];
}

/** Fit an ellipse to points [[x, y], ...], starting from a guess. Robust to stray points (Huber loss). */
export function fit(points, guess) {
  const huber = (d, k = 3) => (Math.abs(d) <= k ? 0.5 * d * d : k * (Math.abs(d) - 0.5 * k));
  const cost = ([cx, cy, a, b, theta]) => {
    if (a <= 1 || b <= 1) return Infinity;
    const e = { cx, cy, a, b, theta };
    let sum = 0;
    for (const [x, y] of points) sum += huber(distance(e, x, y));
    return sum / points.length;
  };
  const g = [guess.cx, guess.cy, guess.a, guess.b, guess.theta];
  let x = minimise(cost, g, [20, 20, 20, 10, 0.1]);
  // Restart once from the result: Nelder-Mead can stall.
  x = minimise(cost, x, [4, 4, 4, 2, 0.02]);
  const [cx, cy, a, b, theta] = x;
  return { cx, cy, a, b, theta, cost: cost(x) };
}

/** SVG path for an ellipse (two arcs), optionally scaled about its centre. */
export function path(e, grow = 0) {
  const a = e.a + grow, b = e.b + grow;
  const p0 = at({ ...e, a, b }, 0);
  const p1 = at({ ...e, a, b }, Math.PI);
  const deg = (e.theta * 180) / Math.PI;
  const f = (n) => +n.toFixed(2);
  return `M${f(p0.x)} ${f(p0.y)}A${f(a)} ${f(b)} ${f(deg)} 1 1 ${f(p1.x)} ${f(p1.y)}A${f(a)} ${f(b)} ${f(deg)} 1 1 ${f(p0.x)} ${f(p0.y)}Z`;
}
