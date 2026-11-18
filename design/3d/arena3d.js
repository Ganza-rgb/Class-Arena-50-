// Arena 3D live runtime — draws every [data-3d] slot on a page with ONE shared WebGL renderer
// (scissor viewports), so a page can show dozens of live objects. Models come from kit.js.
import * as THREE from 'three';
import { blob, coin, confetti, crown, giftBox, glassChart, heart, likeBubble, megaphone, podium, star, studio, trophy, warning, bell } from './kit.js';

export const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let motionOn = !PREFERS_REDUCED;
export const setMotion = (on) => { motionOn = on; };

const canvas = document.createElement('canvas');
canvas.setAttribute('aria-hidden', 'true');
Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: '40' });
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x000000, 0);
renderer.autoClear = false;

const slots = [];
const pointer = { x: 0, y: 0 };
window.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
});

export function mount(el, build) {
  const scene = new THREE.Scene();
  studio(scene, renderer);
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
  camera.position.set(0, 0, 7);
  const api = build({ scene, camera }) ?? {};
  slots.push({ el, clip: el.closest('[data-clip]'), scene, camera, update: api.update, p: { x: 0, y: 0 }, frozen: 1.3 + Math.random() });
}

let last = performance.now();
let clock = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (motionOn) clock += dt;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const size = renderer.getSize(new THREE.Vector2());
  if (size.x !== W || size.y !== H) renderer.setSize(W, H, false);
  renderer.setScissorTest(false);
  renderer.clear();
  renderer.setScissorTest(true);
  for (const s of slots) {
    const r = s.el.getBoundingClientRect();
    let l = Math.max(r.left, 0), t = Math.max(r.top, 0), rr = Math.min(r.right, W), b = Math.min(r.bottom, H);
    if (s.clip) {
      const c = s.clip.getBoundingClientRect();
      l = Math.max(l, c.left); t = Math.max(t, c.top); rr = Math.min(rr, c.right); b = Math.min(b, c.bottom);
    }
    if (rr <= l || b <= t || r.width < 2 || r.height < 2) continue;
    const k = motionOn ? 0.06 : 1;
    s.p.x += ((motionOn ? pointer.x : 0) - s.p.x) * k;
    s.p.y += ((motionOn ? pointer.y : 0) - s.p.y) * k;
    s.camera.aspect = r.width / r.height;
    s.camera.updateProjectionMatrix();
    s.update?.(motionOn ? clock : s.frozen, s.p);
    renderer.setViewport(r.left, H - r.bottom, r.width, r.height);
    renderer.setScissor(l, H - b, rr - l, b - t);
    renderer.render(s.scene, s.camera);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------------------------------------------------------------- animation helpers
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3(1, 1, 1);
function animateConfetti(inst, t) {
  inst.userData.seeds.forEach((s, i) => {
    _e.set(t * s.s * 3 + s.r, t * s.s * 2 + s.r, 0);
    _q.setFromEuler(_e);
    _v.set(s.x + Math.sin(t + s.r) * 0.15, ((s.y - t * s.s + 20) % 4) - 2, s.z);
    _m.compose(_v, _q, _s);
    inst.setMatrixAt(i, _m);
  });
  inst.instanceMatrix.needsUpdate = true;
}
export function animateBlob(a, t, p) {
  const ph = a.userData.phase;
  const breathe = Math.sin(t * 2 + ph) * 0.025;
  a.children[0].scale.set(1 + breathe, 0.94 - breathe, 0.96 + breathe);
  const cycle = (t + ph) % 4.2;
  const lid = cycle < 0.12 ? Math.max(0.08, Math.abs(cycle - 0.06) / 0.06) : 1;
  for (const e of a.userData.eyes) {
    e.scale.y = lid;
    e.userData.pupil.position.x = p.x * 0.07;
    e.userData.pupil.position.y = p.y * 0.06;
  }
}

const float = (o, t, amp = 0.08, speed = 1.1, ph = 0) => { o.position.y = (o.userData.baseY ?? 0) + Math.sin(t * speed + ph) * amp; };
const tilt = (o, p, base = 0, k = 0.35) => { o.rotation.y = base + p.x * k; o.rotation.x = -p.y * k * 0.6; };

export const SCENES = {
  trophy: ({ scene, camera }) => {
    const tr = trophy();
    const conf = confetti();
    const s1 = star(); s1.scale.setScalar(0.22); s1.position.set(-1.35, 0.9, 0.3);
    const s2 = star(0xdfe6ff); s2.scale.setScalar(0.16); s2.position.set(1.3, 1.25, -0.2);
    scene.add(tr, conf, s1, s2);
    camera.position.set(0, 0.1, 7.4);
    return { update: (t, p) => { float(tr, t, 0.07); tilt(tr, p, Math.sin(t * 0.45) * 0.35); s1.rotation.z = t * 0.6; s2.rotation.z = -t * 0.5; float(s1, t, 0.12, 1.4, 1); float(s2, t, 0.1, 1.2, 2); animateConfetti(conf, t); } };
  },
  coin: ({ scene, camera }) => {
    const c = coin();
    scene.add(c);
    camera.position.z = 5.2;
    return { update: (t, p) => { c.rotation.y = t * 1.1 + p.x * 0.4; c.rotation.x = -p.y * 0.3; float(c, t, 0.05, 2); } };
  },
  crown: ({ scene, camera }) => {
    const c = crown('gold');
    scene.add(c);
    camera.position.set(0, 1.2, 5.6);
    camera.lookAt(0, 0.2, 0);
    return { update: (t, p) => { c.rotation.y = t * 0.5 + p.x * 0.4; float(c, t, 0.05, 1.5); } };
  },
  heart: ({ scene, camera }) => {
    const h = heart();
    scene.add(h);
    camera.position.z = 6;
    return { update: (t, p) => { h.scale.setScalar(1 + Math.max(0, Math.sin(t * 5)) ** 8 * 0.12); tilt(h, p, Math.sin(t * 0.8) * 0.25); } };
  },
  like: ({ scene, camera }) => {
    const b = likeBubble();
    scene.add(b);
    camera.position.z = 6.4;
    return { update: (t, p) => { float(b, t, 0.1, 0.9); tilt(b, p, -0.35 + Math.sin(t * 0.6) * 0.15); b.rotation.z = Math.sin(t * 0.7) * 0.06; } };
  },
  bell: ({ scene, camera }) => {
    const b = bell();
    scene.add(b);
    camera.position.set(0, 0.2, 5.4);
    return { update: (t, p) => { b.rotation.z = (t % 4) < 1 ? Math.sin(t * 18) * 0.18 * (1 - (t % 4)) : 0; tilt(b, p, 0.3); } };
  },
  megaphone: ({ scene, camera }) => {
    const m = megaphone();
    scene.add(m);
    camera.position.z = 5.6;
    return { update: (t, p) => { m.scale.setScalar(1 + Math.max(0, Math.sin(t * 3)) ** 6 * 0.06); m.rotation.y = -0.5 + p.x * 0.4; } };
  },
  warning: ({ scene, camera }) => {
    const w = warning();
    scene.add(w);
    camera.position.z = 5.6;
    return { update: (t, p) => { tilt(w, p, Math.sin(t * 0.7) * 0.3); float(w, t, 0.05, 1.3); } };
  },
  gift: ({ scene, camera }) => {
    const gb = giftBox();
    scene.add(gb);
    camera.position.set(0, 1.4, 5.6);
    camera.lookAt(0, 0.2, 0);
    return { update: (t, p) => { gb.rotation.y = 0.6 + Math.sin(t * 0.6) * 0.35 + p.x * 0.3; const hop = Math.max(0, Math.sin(t * 2.2)) ** 10; gb.position.y = hop * 0.2; gb.rotation.z = hop * 0.05; } };
  },
  chart: ({ scene, camera }) => {
    const c = glassChart();
    scene.add(c);
    camera.position.z = 6.4;
    return {
      update: (t, p) => {
        tilt(c, p, 0.45 + Math.sin(t * 0.5) * 0.12);
        float(c, t, 0.08, 0.8);
        c.userData.bars.forEach((b, i) => { const h = b.userData.h * (0.85 + 0.15 * Math.sin(t * 1.3 + i)); b.scale.y = h; b.position.y = -0.7 + h / 2; });
      },
    };
  },
  podium: ({ scene, camera }) => {
    const pd = podium();
    scene.add(pd);
    camera.position.set(0, 1.5, 8.2);
    camera.lookAt(0, 0.25, 0);
    pd.userData.avatars.forEach((a) => { a.userData.baseY = a.position.y; });
    return {
      update: (t, p) => {
        pd.rotation.y = p.x * 0.22 + Math.sin(t * 0.3) * 0.06;
        pd.userData.avatars.forEach((a, i) => { a.position.y = a.userData.baseY + Math.abs(Math.sin(t * 2 + i)) * 0.06; animateBlob(a, t, p); });
      },
    };
  },
  blob: ({ scene, camera }, el) => {
    const a = blob({ color: parseInt((el?.dataset.color ?? '#7c5cff').slice(1), 16), hat: el?.dataset.hat ?? 'none' });
    scene.add(a);
    camera.position.z = 4.6;
    return { update: (t, p) => { animateBlob(a, t, p); a.rotation.y = p.x * 0.35; a.rotation.x = -p.y * 0.2; float(a, t, 0.04, 2, a.userData.phase); } };
  },
};

export function mountAll(root = document) {
  root.querySelectorAll('[data-3d]').forEach((el) => {
    const make = SCENES[el.dataset['3d']];
    if (make) mount(el, (ctx) => make(ctx, el));
  });
}
