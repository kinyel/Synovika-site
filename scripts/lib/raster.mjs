/**
 * Small raster helpers for tracing the logo: binary masks over a W x H grid
 * (Uint8Array, 1 = set), connected parts, and disk-shaped morphology.
 */

/** Connected parts of a mask (8-connected), largest first. */
export function components(mask, W, H) {
  const label = new Int32Array(W * H).fill(-1);
  const parts = [];
  const steps = [1, -1, W, -W, W + 1, W - 1, -W + 1, -W - 1];
  for (let s = 0; s < W * H; s++) {
    if (!mask[s] || label[s] >= 0) continue;
    const id = parts.length;
    const pixels = [];
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    const stack = [s];
    label[s] = id;
    while (stack.length) {
      const p = stack.pop();
      pixels.push(p);
      const x = p % W, y = (p / W) | 0;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      for (const d of steps) {
        const q = p + d;
        if (q < 0 || q >= W * H) continue;
        // Don't wrap around the left and right edges.
        if (Math.abs((q % W) - x) > 1) continue;
        if (mask[q] && label[q] < 0) {
          label[q] = id;
          stack.push(q);
        }
      }
    }
    parts.push({ id, pixels, size: pixels.length, box: [x0, y0, x1, y1] });
  }
  parts.sort((a, b) => b.size - a.size);
  return { parts, label };
}

const disk = (r) => {
  const out = [];
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r) out.push([dx, dy]);
  return out;
};

export function dilate(mask, W, H, r) {
  const out = new Uint8Array(W * H);
  const d = disk(r);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) continue;
      for (const [dx, dy] of d) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H) out[ny * W + nx] = 1;
      }
    }
  return out;
}

export function erode(mask, W, H, r) {
  const inv = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) inv[i] = mask[i] ? 0 : 1;
  const grown = dilate(inv, W, H, r);
  const out = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) out[i] = grown[i] ? 0 : 1;
  return out;
}

export const close = (mask, W, H, r) => erode(dilate(mask, W, H, r), W, H, r);
export const open = (mask, W, H, r) => dilate(erode(mask, W, H, r), W, H, r);

/** Separable box blur (three passes approximate a Gaussian) on a Float32 field. */
export function blur(field, W, H, radius) {
  let a = Float32Array.from(field);
  let b = new Float32Array(W * H);
  const pass = (src, dst, horizontal) => {
    const n = horizontal ? W : H;
    const m = horizontal ? H : W;
    for (let j = 0; j < m; j++) {
      let acc = 0;
      const at = (i) => (horizontal ? j * W + Math.min(n - 1, Math.max(0, i)) : Math.min(n - 1, Math.max(0, i)) * W + j);
      for (let i = -radius; i <= radius; i++) acc += src[at(i)];
      for (let i = 0; i < n; i++) {
        dst[horizontal ? j * W + i : i * W + j] = acc / (2 * radius + 1);
        acc += src[at(i + radius + 1)] - src[at(i - radius)];
      }
    }
  };
  for (let k = 0; k < 3; k++) {
    pass(a, b, true);
    pass(b, a, false);
  }
  return a;
}
