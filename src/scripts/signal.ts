/**
 * The hero's cloud of points, in plain WebGL (D-064): no library, one draw
 * call, and the morph runs in the vertex shader, so a frame costs the main
 * thread only a few uniforms. Each form (src/lib/forms.ts) is its own buffer;
 * drawing binds the two either side of the morph.
 */
const VERTEX = `
attribute vec4 aFrom;
attribute vec4 aTo;
attribute vec3 aSeed;
uniform float uMix, uTime, uIn, uScale, uPersp, uPoint, uDepth, uFade, uSwarm, uMaskOn;
uniform vec2 uCentre, uHalf, uMouse;
uniform vec4 uMask;
uniform mat3 uRot;
uniform vec3 uColA, uColB, uBrand;
varying vec3 vColour;
varying float vAlpha;

float bright(float w) {
  if (w < 2.0) return w;
  float head = fract((w - 2.0 - uTime * 0.16) * 3.0);
  return 0.32 + 1.15 * pow(head, 9.0);
}

void main() {
  float wait = aSeed.x * 0.42;
  float t = clamp((uMix - wait) / 0.58, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  float swarm = sin(t * 3.14159);

  vec3 p = mix(aFrom.xyz, aTo.xyz, t);
  p += (aSeed - 0.5) * swarm * 1.1 * uSwarm;
  float turn = swarm * (aSeed.y - 0.5) * 2.2 * uSwarm;
  float c = cos(turn), s = sin(turn);
  p.xz = mat2(c, -s, s, c) * p.xz;

  // Arrival: the points gather from far out.
  p *= 1.0 + (1.0 - uIn) * (1.0 + aSeed.z * 3.0);
  // A slow breath, so nothing is ever quite still.
  p += 0.007 * vec3(sin(uTime * 0.7 + aSeed.x * 40.0), cos(uTime * 0.6 + aSeed.y * 40.0), sin(uTime * 0.5 + aSeed.z * 40.0));

  vec3 q = uRot * p;
  float k = uPersp / (uPersp - q.z);
  vec2 at = q.xy * k * uScale + uCentre;

  // Points step aside for the pointer.
  vec2 away = at - uMouse;
  float r = length(away);
  at += away / max(r, 1.0) * smoothstep(150.0, 0.0, r) * (14.0 + aSeed.x * 22.0);

  gl_Position = vec4(at / uHalf, 0.0, 1.0);

  float l = mix(bright(aFrom.w), bright(aTo.w), t);
  gl_PointSize = (0.85 + aSeed.z * 0.7) * (1.0 + min(l, 1.3) * 0.6) * clamp(k, 0.5, 2.2) * uPoint;

  // Faint structure stays Synovika's teal; what matters takes the form's colour; the very brightest goes to white.
  vec3 colour = mix(uColA, uColB, t);
  colour = mix(uBrand, colour, smoothstep(0.1, 0.42, l));
  colour = mix(colour, vec3(1.0), smoothstep(0.95, 1.45, l) * 0.7);
  vColour = colour;

  float behind = mix(1.0, smoothstep(-0.62, 0.34, q.z), uDepth);
  // Points fade out before they reach the words, with no overlay on the page's background.
  float clear = mix(1.0, smoothstep(uMask.z, uMask.w, dot(at, uMask.xy)), uMaskOn);
  vAlpha = (0.12 + min(l, 1.2) * 0.88) * (0.05 + 0.95 * behind) * uFade * uIn * 0.86 * clear;
}
`;

const FRAGMENT = `
precision mediump float;
varying vec3 vColour;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  float a = smoothstep(0.25, 0.03, d) * vAlpha;
  gl_FragColor = vec4(vColour * a, a);
}
`;

export interface Frame {
  /** The form the cloud is leaving, the one it is heading for, and how far along (0 to 1). */
  from: number;
  to: number;
  mix: number;
  time: number;
  /** Arrival, 0 to 1. */
  arrive: number;
  /** Centre in px from the canvas centre, y up, and px per unit. */
  x: number;
  y: number;
  scale: number;
  rx: number;
  ry: number;
  depth: number;
  fade: number;
  colourA: readonly number[];
  colourB: readonly number[];
  /** Pointer in px from the canvas centre, y up. */
  mouseX: number;
  mouseY: number;
  /** 1 to scatter the points on the way, 0 to glide straight. */
  swarm: number;
  /** Fade points out along a direction: x, y, start, end (px from the canvas centre). */
  mask: readonly number[];
  maskOn: number;
  /** How many points to draw (all of them by default). */
  count?: number;
}

export const PERSPECTIVE = 4.2;

export function rotation(rx: number, ry: number) {
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  // Turn about y, then tilt about x. Column by column, as WebGL reads it.
  return new Float32Array([cy, sx * sy, -cx * sy, 0, cx, sx, sy, -sx * cy, cx * cy]);
}

export function createSignal(canvas: HTMLCanvasElement, N: number, phone: boolean) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'default' });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const seeds = new Float32Array(N * 3);
  let s = 7;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < seeds.length; i++) seeds[i] = rand();
  const seedBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
  const aSeed = gl.getAttribLocation(program, 'aSeed');
  gl.enableVertexAttribArray(aSeed);
  gl.vertexAttribPointer(aSeed, 3, gl.FLOAT, false, 0, 0);

  const aFrom = gl.getAttribLocation(program, 'aFrom');
  const aTo = gl.getAttribLocation(program, 'aTo');
  gl.enableVertexAttribArray(aFrom);
  gl.enableVertexAttribArray(aTo);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const U = {
    mix: u('uMix'),
    time: u('uTime'),
    arrive: u('uIn'),
    scale: u('uScale'),
    persp: u('uPersp'),
    point: u('uPoint'),
    depth: u('uDepth'),
    fade: u('uFade'),
    centre: u('uCentre'),
    half: u('uHalf'),
    mouse: u('uMouse'),
    rot: u('uRot'),
    swarm: u('uSwarm'),
    mask: u('uMask'),
    maskOn: u('uMaskOn'),
    colA: u('uColA'),
    colB: u('uColB'),
    brand: u('uBrand'),
  };
  gl.uniform1f(U.persp, PERSPECTIVE);
  gl.uniform3f(U.brand, 0.08, 0.72, 0.65);
  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);

  const buffers: (WebGLBuffer | null)[] = [];
  let bound = '';

  return {
    /** Hands over a finished form. */
    setForm(i: number, data: Float32Array) {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      buffers[i] = b;
      bound = '';
    },
    has: (i: number) => !!buffers[i],
    resize() {
      const dpr = Math.min(phone ? 1.75 : 1.5, devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.half, w / 2, h / 2);
      gl.uniform1f(U.point, (phone ? 1.3 : 1.6) * dpr);
    },
    draw(f: Frame) {
      const key = `${f.from}-${f.to}`;
      if (key !== bound) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[f.from]!);
        gl.vertexAttribPointer(aFrom, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[f.to]!);
        gl.vertexAttribPointer(aTo, 4, gl.FLOAT, false, 0, 0);
        bound = key;
      }
      gl.uniform1f(U.mix, f.mix);
      gl.uniform1f(U.time, f.time);
      gl.uniform1f(U.arrive, f.arrive);
      gl.uniform1f(U.scale, f.scale);
      gl.uniform1f(U.depth, f.depth);
      gl.uniform1f(U.fade, f.fade);
      gl.uniform1f(U.swarm, f.swarm);
      gl.uniform1f(U.maskOn, f.maskOn);
      gl.uniform4fv(U.mask, f.mask as number[]);
      gl.uniform2f(U.centre, f.x, f.y);
      gl.uniform2f(U.mouse, f.mouseX, f.mouseY);
      gl.uniformMatrix3fv(U.rot, false, rotation(f.rx, f.ry));
      gl.uniform3fv(U.colA, f.colourA as number[]);
      gl.uniform3fv(U.colB, f.colourB as number[]);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, f.count ?? N);
    },
  };
}
