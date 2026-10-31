// R1 3D for the yoga demo. Model: Unitree unitree_mujoco R1 (BSD-3), exported by r1-studio.
// Adapted from r1-studio/studio/web/js/robot3d.js: adds legs, waist roll, a sim-only body tilt
// and automatic grounding (lowest point of the body touches the floor).
import * as THREE from "three";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { JMAP, ALL_KEYS } from "./joints.js";

export class Robot3D {
  constructor(el) {
    this.el = el;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.05, 50);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    el.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.joints = {};
    this.links = [];
    this.q = {}; ALL_KEYS.forEach((k) => (this.q[k] = 0));
    this.base = new THREE.Group(); this.scene.add(this.base);
    this.tilt = new THREE.Group(); this.base.add(this.tilt);
    this.inner = new THREE.Group(); this.tilt.add(this.inner);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xb0b0a8, 2.2));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(2, 4, -3); this.scene.add(sun);
    this.scene.add(new THREE.GridHelper(6, 24, 0xcfcfc8, 0xe2e2dc));
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.0), new THREE.MeshBasicMaterial({ color: 0xF2E6E8, side: THREE.DoubleSide }));
    mat.rotation.x = -Math.PI / 2; mat.position.y = 0.001; this.scene.add(mat); // yoga mat
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.95, 2.0, 64), new THREE.MeshBasicMaterial({ color: 0xD90429, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; this.scene.add(ring); // 2 m safety line
    this.view("front");
    new ResizeObserver(() => this.resize()).observe(el);
    this.resize();
    this._v = new THREE.Vector3();
    const tick = () => { this.controls.update(); this.renderer.render(this.scene, this.camera); requestAnimationFrame(tick); };
    tick();
  }

  resize() {
    const w = this.el.clientWidth, h = this.el.clientHeight;
    this.renderer.setSize(w, h); this.camera.aspect = w / Math.max(1, h); this.camera.updateProjectionMatrix();
  }

  view(name) {
    const v = { front: [[0, 1.0, -3.0], [0, 0.75, 0]], side: [[3.0, 1.0, -0.2], [0, 0.75, 0]], three: [[2.0, 1.4, -2.4], [0, 0.7, 0]] }[name];
    this.camera.position.set(...v[0]); this.controls.target.set(...v[1]);
  }

  async load(url = "model/r1.json") {
    const meta = await (await fetch(url)).json();
    const bin = await (await fetch(url.replace(".json", ".bin"))).arrayBuffer();
    const mat = new THREE.MeshStandardMaterial({ color: 0xdfe2ea, metalness: 0.35, roughness: 0.45 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x2a2a2e, metalness: 0.2, roughness: 0.6 });
    const root = new THREE.Group(); root.rotation.x = -Math.PI / 2; root.rotation.z = Math.PI / 2;
    this.inner.add(root);
    const groups = [];
    meta.bodies.forEach((b) => {
      const g = new THREE.Group();
      g.position.set(...b.pos);
      g.quaternion.set(b.quat[1], b.quat[2], b.quat[3], b.quat[0]);
      let holder = g;
      if (b.joint) {
        const pivot = new THREE.Group(); pivot.position.set(...b.joint.pos);
        const inn = new THREE.Group(); inn.position.set(...b.joint.pos.map((v) => -v));
        g.add(pivot); pivot.add(inn); holder = inn;
        this.joints[b.joint.name] = { pivot, axis: new THREE.Vector3(...b.joint.axis), range: b.joint.range };
      }
      const box = new THREE.Box3();
      for (const m of b.meshes) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(bin, m.v[0], m.v[1] * 3), 3));
        geo.setIndex(new THREE.BufferAttribute(new Uint32Array(bin, m.f[0], m.f[1] * 3), 1));
        geo.computeVertexNormals(); geo.computeBoundingBox(); box.union(geo.boundingBox);
        const lum = m.rgba[0] + m.rgba[1] + m.rgba[2];
        holder.add(new THREE.Mesh(geo, lum < 1 ? dark : mat));
      }
      if (!box.isEmpty()) {
        const c = []; for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) c.push(new THREE.Vector3(x, y, z));
        this.links.push({ holder, corners: c });
      }
      groups.push({ g, holder, name: b.name });
      (b.parent >= 0 ? groups[b.parent].holder : root).add(g);
    });
    groups[0].g.position.z = meta.standing_z;
    this.tilt.position.y = meta.standing_z; this.inner.position.y = -meta.standing_z;
    this.apply();
  }

  range(key) { const j = this.joints[JMAP[key]]; return j && j.range; }

  apply() {
    for (const k of ALL_KEYS) {
      const j = this.joints[JMAP[k]];
      if (!j) continue;
      let v = this.q[k];
      if (j.range) v = Math.min(j.range[1], Math.max(j.range[0], v));
      j.pivot.quaternion.setFromAxisAngle(j.axis, v);
    }
    this.tilt.rotation.set(this.q.tx || 0, 0, this.q.tz || 0);
    this.ground();
  }

  // Keep the lowest point of the robot on the floor (sim only)
  ground() {
    this.base.position.y = 0; this.base.updateMatrixWorld(true);
    let min = Infinity;
    for (const l of this.links) for (const c of l.corners) { this._v.copy(c).applyMatrix4(l.holder.matrixWorld); if (this._v.y < min) min = this._v.y; }
    if (isFinite(min)) this.base.position.y = -min;
  }

  set(q) { Object.assign(this.q, q); this.apply(); }

  animate(ms, fn, signal) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const step = (now) => {
        if (signal && signal.aborted) return resolve(false);
        const s = Math.min(1, (now - t0) / ms); fn(s);
        s < 1 ? requestAnimationFrame(step) : resolve(true);
      };
      requestAnimationFrame(step);
    });
  }

  // Smoothstep move from current q to target over ms
  moveTo(target, ms, signal) {
    const start = { ...this.q };
    const full = {}; ALL_KEYS.forEach((k) => (full[k] = target[k] ?? 0));
    return this.animate(ms, (s) => { s = s * s * (3 - 2 * s); for (const k of ALL_KEYS) this.q[k] = start[k] + (full[k] - start[k]) * s; this.apply(); }, signal);
  }
}
