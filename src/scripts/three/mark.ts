/**
 * The 3D Synovika mark (brief section 10): the one WebGL object on the site.
 *
 * Built from the traced paths in src/lib/brand-paths.json:
 *  - the four faces of the S, extruded with a small bevel, set at slightly
 *    different depths so the ribbon reads as folded;
 *  - the orbit ring: a true circle with a flat elliptical tube, tilted so
 *    that from the front it projects onto the traced ellipse;
 *  - the sphere, riding the orbit at the traced position.
 *
 * It draws only when something has changed (pose, look, size, an orbit in
 * progress). The caller owns the clock: Phase 2 drives frame() from GSAP's
 * ticker, /lab from requestAnimationFrame while a slider moves.
 * Colours come from tokens.css through tokens.ts, never hard-coded.
 */
import {
  ACESFilmicToneMapping,
  AgXToneMapping,
  Color,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PMREMGenerator,
  PerspectiveCamera,
  PointLight,
  Scene,
  SRGBColorSpace,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type Shape,
} from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import brand from '../../lib/brand-paths.json';
import { hex } from '../../lib/tokens';

export interface Look {
  /** Chrome roughness (brief: about 0.18 to 0.22). */
  roughness: number;
  /** Clearcoat on the teal faces and the sphere. */
  clearcoat: number;
  clearcoatRoughness: number;
  /** Key light direction around the mark, in degrees (0 = from the front, positive = from the left). */
  lightAngle: number;
  /** Key light height, in degrees above the horizon. */
  lightHeight: number;
  lightIntensity: number;
  /** Room light on the chrome. */
  envIntensity: number;
  /** Room light on the teal faces and the sphere (less, so the teal stays deep). */
  tealEnv: number;
  /** Turn of the room around the mark, degrees: moves the reflections. */
  envRotation: number;
  exposure: number;
  tone: 'agx' | 'neutral' | 'aces';
}

export interface Pose {
  /** Turn about the vertical axis, degrees. */
  yaw: number;
  /** Tilt about the horizontal axis, degrees. */
  pitch: number;
  /** Camera distance as a multiple of the resting distance (1 = rest, smaller = closer). */
  dolly: number;
  /** Extra angle of the sphere along its orbit, radians. */
  orbit: number;
}

export const DEFAULT_LOOK: Look = {
  roughness: 0.2,
  clearcoat: 1,
  clearcoatRoughness: 0.06,
  lightAngle: 50,
  lightHeight: 40,
  lightIntensity: 1.3,
  envIntensity: 1.5,
  tealEnv: 0.3,
  envRotation: 140,
  exposure: 1,
  tone: 'neutral',
};
export const REST_POSE: Pose = { yaw: -12, pitch: 6, dolly: 1, orbit: 0 };

/** Logo pixels to world units. */
const S = 1 / 100;
const RING = brand.ring;
/** Ring centre: the mark turns about it, so the orbit stays centred. */
const C = { x: RING.centre.cx, y: RING.centre.cy };
const FACES = ['silver-top', 'teal-top', 'silver-bowl', 'teal-tail'] as const;
/** Depth of each face (logo px, + towards the viewer): the fold. */
const DEPTH: Record<(typeof FACES)[number], number> = { 'silver-top': -10, 'teal-top': 0, 'silver-bowl': 9, 'teal-tail': -10 };
const THICKNESS = 34;
/** Half the mark's width and height in world units (from the traced box), plus a margin. */
const HALF_W = (brand.boxes.mark[2]! / 2) * S * 1.14;
const HALF_H = (brand.boxes.mark[3]! / 2) * S * 1.14;

export interface MarkOptions {
  canvas: HTMLCanvasElement;
  /** 1: lighter geometry at DPR 1. 2: full quality. */
  tier: 1 | 2;
  dpr: number;
  look?: Partial<Look>;
  pose?: Partial<Pose>;
  onContextLost?: () => void;
}

export class Mark {
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(26, 1, 0.1, 100);
  private readonly root = new Group();
  private readonly ringGroup = new Group();
  private readonly sphereOrbit = new Group();
  private readonly sphere: Mesh;
  private readonly key: PointLight;
  private readonly chrome: MeshPhysicalMaterial;
  private readonly teal: MeshPhysicalMaterial;
  private readonly ball: MeshPhysicalMaterial;
  private readonly pmrem: PMREMGenerator;
  look: Look;
  pose: Pose;
  private dirty = true;
  private width = 1;
  private height = 1;
  lost = false;

  constructor(opts: MarkOptions) {
    this.look = { ...DEFAULT_LOOK, ...opts.look };
    this.pose = { ...REST_POSE, ...opts.pose };
    const r = (this.renderer = new WebGLRenderer({ canvas: opts.canvas, alpha: true, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: false }));
    r.setClearColor(0x000000, 0);
    r.outputColorSpace = SRGBColorSpace;
    r.setPixelRatio(opts.dpr);

    this.pmrem = new PMREMGenerator(r);
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.chrome = new MeshPhysicalMaterial({ color: hex('neutral-200'), metalness: 1, roughness: this.look.roughness });
    this.teal = new MeshPhysicalMaterial({ color: hex('teal-600'), metalness: 0, roughness: 0.4, clearcoat: 1, clearcoatRoughness: this.look.clearcoatRoughness });
    this.ball = new MeshPhysicalMaterial({ color: hex('teal-600'), metalness: 0, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.03 });

    // ── The S: four extruded faces in logo space, flipped so y points up ──
    const fine = opts.tier === 2;
    const loader = new SVGLoader();
    const faces = new Group();
    faces.scale.set(S, -S, S);
    faces.position.set(-C.x * S, C.y * S, 0);
    for (const name of FACES) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${brand.paths[name]}"/></svg>`;
      const shapes: Shape[] = loader.parse(svg).paths.flatMap((p) => p.toShapes());
      const geometry = new ExtrudeGeometry(shapes, {
        depth: THICKNESS,
        curveSegments: fine ? 10 : 5,
        bevelEnabled: true,
        bevelThickness: 3,
        bevelSize: 2.5,
        bevelOffset: -2.5,
        bevelSegments: fine ? 4 : 2,
      });
      // Only y is flipped (scale y = -1), so +z still points towards the viewer.
      geometry.translate(0, 0, -THICKNESS / 2 + DEPTH[name]);
      faces.add(new Mesh(geometry, name.startsWith('teal') ? this.teal : this.chrome));
    }
    this.root.add(faces);

    // ── The orbit: a flat band on a true circle, tilted to match the trace ──
    const R = ((RING.outer.a + RING.inner.a) / 2) * S;
    const width = (RING.outer.a - RING.inner.a) * S;
    // A circle whose plane is tilted by angle x towards the viewer projects to an ellipse with ratio sin(x).
    const tilt = Math.asin(RING.centre.b / RING.centre.a);
    // Band thickness that gives the traced width at the top and bottom of the ellipse.
    const minor = (RING.outer.b - RING.inner.b) * S;
    const thickness = Math.max(0.03, (minor - width * Math.sin(tilt)) / Math.cos(tilt));
    const profile: Vector2[] = [];
    const steps = fine ? 24 : 12;
    for (let k = 0; k <= steps; k++) {
      const a = (k / steps) * Math.PI * 2;
      profile.push(new Vector2(R + (width / 2) * Math.cos(a), (thickness / 2) * Math.sin(a)));
    }
    const band = new Mesh(new LatheGeometry(profile, fine ? 200 : 110), this.chrome);
    this.ringGroup.add(band);
    // Sphere on the band's centre line. Lathe angle 0 sits on +z; the traced parameter t is measured from +x.
    const sphereR = brand.sphere.r * S;
    this.sphere = new Mesh(new SphereGeometry(sphereR, fine ? 64 : 32, fine ? 48 : 24), this.ball);
    this.sphere.position.set(R, 0, 0);
    this.sphereOrbit.add(this.sphere);
    this.ringGroup.add(this.sphereOrbit);
    // The band starts flat (edge-on to the viewer). Tilting it by asin(b/a) about x makes it
    // project to the traced ellipse, with its lower half towards the viewer; then turn it to
    // the traced angle (the trace's y points down, so the angle changes sign).
    this.ringGroup.rotation.order = 'ZXY';
    this.ringGroup.rotation.set(tilt, 0, -RING.centre.theta);
    this.root.add(this.ringGroup);

    this.root.position.set(0, 0, 0);
    this.scene.add(this.root);

    // One key light for speculars. A point light (not a directional one) puts a gradient
    // across the flat faces, like the sheen on the render.
    this.key = new PointLight(0xffffff, 0, 0, 2);
    this.scene.add(this.key);

    opts.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.lost = true;
      opts.onContextLost?.();
    });
    this.applyLook();
  }

  /** Change the look (lab sliders). */
  setLook(next: Partial<Look>) {
    Object.assign(this.look, next);
    this.applyLook();
  }

  /** Change the pose (scroll, pointer). */
  setPose(next: Partial<Pose>) {
    for (const [k, v] of Object.entries(next) as [keyof Pose, number][]) {
      if (this.pose[k] !== v) {
        this.pose[k] = v;
        this.dirty = true;
      }
    }
  }

  private applyLook() {
    const l = this.look;
    this.chrome.roughness = l.roughness;
    this.teal.clearcoat = l.clearcoat;
    this.ball.clearcoat = l.clearcoat;
    this.teal.clearcoatRoughness = l.clearcoatRoughness;
    this.chrome.envMapIntensity = l.envIntensity;
    this.teal.envMapIntensity = l.tealEnv;
    this.ball.envMapIntensity = l.tealEnv * 1.4;
    this.scene.environmentRotation.set(0, (l.envRotation * Math.PI) / 180, 0);
    this.key.intensity = l.lightIntensity * 120;
    const az = (l.lightAngle * Math.PI) / 180;
    const el = (l.lightHeight * Math.PI) / 180;
    const d = 7;
    this.key.position.set(-Math.sin(az) * Math.cos(el) * d, Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d);
    this.renderer.toneMapping = l.tone === 'agx' ? AgXToneMapping : l.tone === 'neutral' ? NeutralToneMapping : ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = l.exposure;
    this.dirty = true;
  }

  resize(width: number, height: number) {
    if (width === this.width && height === this.height) return;
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  /** Mark the scene as changed (for example after a background change). */
  invalidate() {
    this.dirty = true;
  }

  /** Draw if anything changed. Returns true if it drew. */
  frame(): boolean {
    if (!this.dirty || this.lost) return false;
    this.dirty = false;
    const p = this.pose;
    this.root.rotation.set((p.pitch * Math.PI) / 180, (p.yaw * Math.PI) / 180, 0);
    this.sphereOrbit.rotation.y = -(brand.sphere.t + p.orbit);
    // Resting distance: the ring's full width and the S's full height fit, with a small margin.
    const t = Math.tan((this.camera.fov * Math.PI) / 360);
    const rest = Math.max(HALF_W / (t * this.camera.aspect), HALF_H / t);
    this.camera.position.set(0, 0, rest * p.dolly);
    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
    return true;
  }

  /** The sphere's centre in CSS pixels from the canvas's top left (for the hand-off to the DOM). */
  sphereOnScreen(): { x: number; y: number; r: number } {
    const v = new Vector3();
    this.sphere.getWorldPosition(v);
    const edge = v.clone().add(new Vector3(brand.sphere.r * S, 0, 0));
    v.project(this.camera);
    edge.project(this.camera);
    const x = ((v.x + 1) / 2) * this.width;
    const y = ((1 - v.y) / 2) * this.height;
    return { x, y, r: Math.abs(((edge.x + 1) / 2) * this.width - x) };
  }

  background(colour: string | null) {
    this.scene.background = colour ? new Color(colour) : null;
    this.dirty = true;
  }

  dispose() {
    this.scene.traverse((o) => {
      if (o instanceof Mesh) {
        o.geometry.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m: Material) => m.dispose());
      }
    });
    this.scene.environment?.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();
  }
}
