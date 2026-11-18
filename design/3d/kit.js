// Arena 3D kit — original procedural 3D models for Class Arena. No DOM side effects:
// used by the live runtime (arena3d.js) and by the sprite renderer (sprites.html).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const { Group, Mesh, Vector2, Vector3, Color } = THREE;
const PI = Math.PI;

// ================================================================ environment & lights
const envCache = new WeakMap();
export function envFor(renderer) {
  if (!envCache.has(renderer)) envCache.set(renderer, new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture);
  return envCache.get(renderer);
}
export function studio(scene, renderer, { cool = 0x7c5cff, warm = 0xfff0d8, coolPower = 10 } = {}) {
  scene.environment = envFor(renderer);
  const key = new THREE.DirectionalLight(warm, 2.1);
  key.position.set(3, 5, 6);
  const rim = new THREE.PointLight(cool, coolPower, 14);
  rim.position.set(-3.5, 2, 1);
  const fill = new THREE.HemisphereLight(0xdfeaff, 0x2a1d10, 0.55);
  scene.add(key, rim, fill);
}

// ================================================================ materials
const phys = (o) => new THREE.MeshPhysicalMaterial(o);
export const MAT = {
  gold: () => phys({ color: 0xffbd3a, metalness: 1, roughness: 0.2, clearcoat: 0.5, clearcoatRoughness: 0.12 }),
  silver: () => phys({ color: 0xe4e9f3, metalness: 1, roughness: 0.17, clearcoat: 0.5 }),
  bronze: () => phys({ color: 0xd9874e, metalness: 1, roughness: 0.27, clearcoat: 0.4 }),
  metal: (c) => phys({ color: c, metalness: 1, roughness: 0.24, clearcoat: 0.4 }),
  candy: (c) => phys({ color: c, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.06, sheen: 0.25 }),
  matte: (c) => phys({ color: c, roughness: 0.62, clearcoat: 0.15 }),
  gem: (c) => phys({ color: c, roughness: 0.04, clearcoat: 1, iridescence: 0.5, metalness: 0.1 }),
  glow: (c, i = 1.2) => phys({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.3 }),
  skin: (c) => phys({ color: c, roughness: 0.46, sheen: 1, sheenRoughness: 0.55, sheenColor: new Color(0xffffff), clearcoat: 0.3, clearcoatRoughness: 0.3 }),
  glass: (c = 0xdcefff, tint = 0.9) =>
    phys({ color: c, transmission: tint, roughness: 0.06, thickness: 0.9, ior: 1.45, clearcoat: 1, attenuationColor: new Color(c), attenuationDistance: 2.4 }),
  ink: () => phys({ color: 0x15161c, roughness: 0.2, clearcoat: 1 }),
  marble: () => phys({ map: marbleTexture(), roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 }),
  wood: (c = 0xc98a4b) => phys({ color: c, map: stripeTexture('#ffffff', 'rgba(120,70,30,.35)', 18, true), roughness: 0.55, clearcoat: 0.35 }),
  paper: (map) => phys({ color: 0xfbf7ee, map: map ?? null, roughness: 0.85, side: THREE.DoubleSide }),
  tex: (map, o = {}) => phys({ map, roughness: 0.4, clearcoat: 0.6, ...o }),
};

// ================================================================ canvas textures
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
let _marble = null;
function marbleTexture() {
  if (_marble) return _marble;
  _marble = canvasTex(512, 512, (g) => {
    const grd = g.createLinearGradient(0, 0, 512, 512);
    grd.addColorStop(0, '#232a3b');
    grd.addColorStop(1, '#151a26');
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 512);
    let seed = 7;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 26; i++) {
      g.strokeStyle = `rgba(${170 + r() * 60},${180 + r() * 60},${210 + r() * 40},${0.05 + r() * 0.16})`;
      g.lineWidth = 0.6 + r() * 2.2;
      g.beginPath();
      let x = r() * 512, y = r() * 512;
      g.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        x += (r() - 0.3) * 180;
        y += (r() - 0.5) * 140;
        g.quadraticCurveTo(x - 40 + r() * 80, y - 40 + r() * 80, x, y);
      }
      g.stroke();
    }
  });
  return _marble;
}
function stripeTexture(a, b, n = 8, wobble = false) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = a;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = b;
    for (let i = 0; i < n; i++) {
      g.lineWidth = 2 + (i % 3);
      g.beginPath();
      const y = (i + 0.5) * (h / n);
      g.moveTo(0, y);
      if (wobble) g.bezierCurveTo(w * 0.3, y + 8, w * 0.6, y - 8, w, y + 3);
      else g.lineTo(w, y);
      g.stroke();
    }
  });
}
export function textTexture(text, { size = 256, fill, font = '900 180px "Roboto Slab", Georgia, serif', bg = null, stroke = null } = {}) {
  return canvasTex(size, size, (g) => {
    if (bg) {
      g.fillStyle = bg;
      g.fillRect(0, 0, size, size);
    }
    let style = fill;
    if (!style) {
      const grd = g.createLinearGradient(0, 30, 0, size - 30);
      grd.addColorStop(0, '#fff3c4');
      grd.addColorStop(0.5, '#ffd36a');
      grd.addColorStop(1, '#b97a14');
      style = grd;
    }
    g.fillStyle = style;
    g.font = font;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    if (stroke) {
      g.lineWidth = 10;
      g.strokeStyle = stroke;
      g.strokeText(text, size / 2, size / 2 + 6);
    }
    g.fillText(text, size / 2, size / 2 + 6);
  });
}
const linesTexture = (head = '#e2483d') =>
  canvasTex(256, 320, (g, w, h) => {
    g.fillStyle = '#fbf7ee';
    g.fillRect(0, 0, w, h);
    g.fillStyle = head;
    g.fillRect(24, 26, w - 48, 34);
    g.fillStyle = '#c9c2b2';
    for (let i = 0; i < 8; i++) g.fillRect(24, 84 + i * 26, (w - 48) * (i % 3 === 2 ? 0.6 : 1), 9);
  });
const checkerTexture = () =>
  canvasTex(256, 192, (g, w, h) => {
    const s = 32;
    for (let y = 0; y < h / s; y++) for (let x = 0; x < w / s; x++) {
      g.fillStyle = (x + y) % 2 ? '#111' : '#fafafa';
      g.fillRect(x * s, y * s, s, s);
    }
  });

// ================================================================ primitives
const rb = (w, h, d, r, m, seg = 4) => new Mesh(new RoundedBoxGeometry(w, h, d, seg, r), m);
const sph = (r, m, ws = 48) => new Mesh(new THREE.SphereGeometry(r, ws, Math.round(ws * 0.75)), m);
const cyl = (rt, rbot, h, m, s = 48) => new Mesh(new THREE.CylinderGeometry(rt, rbot, h, s), m);
const capsule = (r, l, m) => new Mesh(new THREE.CapsuleGeometry(r, l, 8, 24), m);
const torus = (R, r, m, arc = PI * 2) => new Mesh(new THREE.TorusGeometry(R, r, 20, 72, arc), m);
const cone = (r, h, m, s = 40) => new Mesh(new THREE.ConeGeometry(r, h, s), m);
function at(o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1) {
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, rz);
  if (s !== 1) o.scale.setScalar(s);
  return o;
}
const grp = (...c) => {
  const g = new Group();
  c.forEach((x) => g.add(x));
  return g;
};
function lathe(pts, mat, seg = 96) {
  const m = new Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new Vector2(x, y)), seg), mat);
  m.material.side = THREE.DoubleSide;
  return m;
}
function extrude(shape, depth, bevel, mat, curve = 40) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 6, curveSegments: curve });
  geo.center();
  return new Mesh(geo, mat);
}
const plane = (w, h, mat) => new Mesh(new THREE.PlaneGeometry(w, h), mat);
const label = (text, size, opts) => plane(size, size, new THREE.MeshBasicMaterial({ map: textTexture(text, opts), transparent: true, toneMapped: false }));

function poly(points) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}
function starShape(outer = 1, inner = 0.45, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * PI * 2 + PI / 2;
    const r = i % 2 ? inner : outer;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return poly(pts);
}
function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.9);
  s.bezierCurveTo(-0.15, -0.75, -1.05, -0.25, -1.0, 0.25);
  s.bezierCurveTo(-0.95, 0.78, -0.32, 0.98, 0, 0.55);
  s.bezierCurveTo(0.32, 0.98, 0.95, 0.78, 1.0, 0.25);
  s.bezierCurveTo(1.05, -0.25, 0.15, -0.75, 0, -0.9);
  return s;
}
function roundedTri(r = 0.18) {
  const s = new THREE.Shape();
  const pts = [new Vector2(0, 1), new Vector2(-1.05, -0.8), new Vector2(1.05, -0.8)];
  pts.forEach((p, i) => {
    const a = p.clone().lerp(pts[(i + 2) % 3], r);
    const b = p.clone().lerp(pts[(i + 1) % 3], r);
    if (i === 0) s.moveTo(a.x, a.y);
    else s.lineTo(a.x, a.y);
    s.quadraticCurveTo(p.x, p.y, b.x, b.y);
  });
  s.closePath();
  return s;
}

/** Soft fake contact shadow (tagged so sprite renders can drop it). */
export function contactShadow(w = 2, opacity = 0.45) {
  const t = canvasTex(128, 128, (g) => {
    const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    grd.addColorStop(0, `rgba(0,0,0,${opacity})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  });
  const m = plane(w, w * 0.5, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
  m.rotation.x = -PI / 2;
  m.userData.shadow = true;
  return m;
}

// ================================================================ core objects
export function trophy() {
  const g = new Group();
  const gold = MAT.gold();
  g.add(lathe([[0, -0.62], [0.2, -0.62], [0.13, -0.5], [0.1, -0.25], [0.15, -0.12], [0.44, 0.02], [0.67, 0.3], [0.77, 0.7], [0.79, 1.0], [0.73, 1.02], [0.69, 0.72], [0.59, 0.36], [0.36, 0.12], [0, 0.08]], gold));
  g.add(at(torus(0.76, 0.035, gold), 0, 1.0, 0, PI / 2));
  g.add(at(cyl(0.34, 0.48, 0.14, gold, 64), 0, -0.69));
  g.add(at(rb(1.25, 0.5, 1.25, 0.08, MAT.marble()), 0, -1.01));
  g.add(at(rb(0.66, 0.22, 0.04, 0.02, gold, 2), 0, -1.01, 0.63));
  const arc = PI * 1.1;
  for (const s of [-1, 1]) g.add(at(torus(0.3, 0.055, gold, arc), s * 0.74, 0.58, 0, 0, 0, s > 0 ? -arc / 2 : PI - arc / 2));
  g.add(at(extrude(starShape(0.2, 0.09), 0.04, 0.02, MAT.gold()), 0, 0.5, 0.62, -0.25));
  g.add(at(contactShadow(2.4), 0, -1.27));
  return g;
}

export function crown(metal = 'gold', gemColor = 0xff2e5b) {
  const g = new Group();
  const m = MAT[metal]();
  const band = new Mesh(new THREE.CylinderGeometry(0.76, 0.7, 0.42, 72, 1, true), m);
  band.material.side = THREE.DoubleSide;
  g.add(band);
  for (const [y, r, t] of [[-0.21, 0.71, 0.05], [0.21, 0.765, 0.04]]) g.add(at(torus(r, t, m), 0, y, 0, PI / 2));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * PI * 2;
    g.add(at(cone(0.19, 0.55, m, 32), Math.cos(a) * 0.73, 0.47, Math.sin(a) * 0.73, Math.sin(a) * 0.18, 0, -Math.cos(a) * 0.18));
    g.add(at(sph(0.085, m, 24), Math.cos(a) * 0.8, 0.76, Math.sin(a) * 0.8));
    const gem = new Mesh(new THREE.OctahedronGeometry(0.1, 0), MAT.gem(i % 2 ? 0x3a7bff : gemColor));
    const b = a + PI / 5;
    gem.position.set(Math.cos(b) * 0.765, 0, Math.sin(b) * 0.765);
    gem.lookAt(0, 0, 0);
    g.add(gem);
  }
  return g;
}

export function coin(face = null) {
  const g = new Group();
  const gold = MAT.gold();
  g.add(at(cyl(1, 1, 0.16, gold, 96), 0, 0, 0, PI / 2));
  g.add(torus(1, 0.075, gold));
  g.add(at(torus(0.78, 0.03, gold), 0, 0, 0.09));
  if (face) g.add(at(label(face, 1.3, { fill: '#8a5a00', font: '900 150px Fredoka, Arial' }), 0, 0, 0.1));
  else {
    g.add(at(extrude(starShape(0.5, 0.22), 0.05, 0.03, MAT.gold()), 0, 0, 0.1));
    g.add(at(extrude(starShape(0.5, 0.22), 0.05, 0.03, MAT.gold()), 0, 0, -0.1));
  }
  return g;
}

export const heart = (color = 0xff2d55) => extrude(heartShape(), 0.35, 0.18, MAT.candy(color));

export function likeBubble(color = 0xff2d55) {
  const g = new Group();
  g.add(rb(2, 2, 0.7, 0.42, MAT.glass(color, 0.55), 6));
  g.add(at(cone(0.32, 0.6, MAT.glass(color, 0.55), 4), -0.55, -1.12, 0, 0, 0, PI + 0.5));
  g.add(at(heart(0xffffff), 0, 0, 0.32, 0, 0, 0, 0.48));
  return g;
}

export function bell() {
  const gold = MAT.gold();
  return grp(
    lathe([[0, 1.0], [0.12, 1.0], [0.19, 0.9], [0.31, 0.74], [0.38, 0.4], [0.45, 0.05], [0.62, -0.24], [0.67, -0.35], [0.6, -0.37], [0.4, -0.22], [0, -0.17]], gold),
    at(torus(0.12, 0.035, gold), 0, 1.08),
    at(sph(0.13, gold, 24), 0, -0.45),
  );
}

export function megaphone(body = 0xf2f4f8, accent = 0xff3b4e) {
  const g = grp(
    lathe([[0.17, -0.9], [0.22, -0.5], [0.68, 0.58], [0.78, 0.72], [0.72, 0.75], [0.63, 0.62], [0.15, -0.45]], MAT.candy(body)),
    at(torus(0.75, 0.06, MAT.candy(accent)), 0, 0.73, 0, PI / 2),
    at(cyl(0.2, 0.2, 0.16, MAT.candy(accent), 32), 0, -0.92),
    at(rb(0.2, 0.55, 0.22, 0.06, MAT.ink(), 3), 0.32, -0.45, 0, 0, 0, -0.3),
  );
  g.rotation.z = -PI / 2 + 0.35;
  return grp(g);
}

export function warning() {
  return grp(
    extrude(roundedTri(), 0.3, 0.12, MAT.candy(0xff3347)),
    at(capsule(0.09, 0.45, MAT.candy(0xffffff)), 0, 0.12, 0.3),
    at(sph(0.1, MAT.candy(0xffffff), 24), 0, -0.46, 0.3),
  );
}

export function giftBox(color = 0xff3d7f) {
  const gold = MAT.gold();
  const g = grp(rb(1.2, 0.95, 1.2, 0.08, MAT.candy(color)), at(rb(1.34, 0.28, 1.34, 0.08, MAT.candy(color)), 0, 0.6));
  g.add(at(new Mesh(new THREE.BoxGeometry(0.2, 1.27, 1.25), gold), 0, 0.12), at(new Mesh(new THREE.BoxGeometry(1.25, 1.27, 0.2), gold), 0, 0.12));
  for (const s of [-1, 1]) g.add(at(torus(0.24, 0.07, gold), s * 0.22, 0.92, 0, 0, 0, s * 0.6));
  return g;
}

export const star = (color) => extrude(starShape(1, 0.46), 0.3, 0.12, color ? MAT.candy(color) : MAT.gold());

export function glassChart() {
  const g = grp(rb(2, 2, 0.7, 0.32, MAT.glass(0xe3f1ff, 1), 6));
  const bars = [];
  [0.55, 0.95, 0.7, 1.25].forEach((h, i) => {
    const b = rb(0.26, 1, 0.26, 0.06, phys({ color: 0xbfe2ff, emissive: 0x3b8bff, emissiveIntensity: 0.6, roughness: 0.2, clearcoat: 1 }), 2);
    b.position.set(-0.6 + i * 0.4, -0.7 + h / 2, 0);
    b.scale.y = h;
    b.userData.h = h;
    bars.push(b);
    g.add(b);
  });
  g.userData.bars = bars;
  return g;
}

/** Original mascot: a soft blob with expressive face options. */
export function blob({ color = 0x7c5cff, hat = 'none', face = 'smile' } = {}) {
  const g = new Group();
  const body = sph(1, MAT.skin(color), 64);
  body.scale.set(1, 0.94, 0.96);
  g.add(body);
  const eyes = [];
  const ink = MAT.ink();
  for (const s of [-1, 1]) {
    if (face === 'laugh' || (face === 'wink' && s > 0)) {
      g.add(at(torus(0.14, 0.04, ink, PI), s * 0.33, 0.12, 0.9));
      continue;
    }
    if (face === 'cool') continue;
    const eye = new Group();
    const white = sph(0.24, MAT.candy(0xffffff), 32);
    white.scale.z = 0.6;
    const pupil = at(sph(0.12, ink, 24), 0, 0, 0.12);
    eye.add(white, pupil, at(sph(0.035, new THREE.MeshBasicMaterial({ color: 0xffffff }), 12), 0.04, 0.05, 0.22));
    eye.position.set(s * 0.33, 0.16, 0.84);
    eye.userData.pupil = pupil;
    eyes.push(eye);
    g.add(eye);
  }
  if (face === 'cool') {
    for (const s of [-1, 1]) g.add(at(rb(0.46, 0.26, 0.12, 0.08, MAT.ink(), 3), s * 0.3, 0.18, 0.9));
    g.add(at(rb(0.2, 0.05, 0.05, 0.02, MAT.ink(), 2), 0, 0.22, 0.97));
  }
  for (const s of [-1, 1]) {
    const cheek = at(sph(0.12, new THREE.MeshBasicMaterial({ color: 0xff7aa8, transparent: true, opacity: 0.55 }), 16), s * 0.55, -0.14, 0.8);
    cheek.scale.z = 0.3;
    g.add(cheek);
  }
  if (face === 'laugh') {
    const m = at(sph(0.26, MAT.matte(0x4a1220), 32), 0, -0.24, 0.84);
    m.scale.set(1, 0.8, 0.5);
    g.add(m, at(sph(0.12, MAT.candy(0xff7a9a), 16), 0, -0.34, 0.95));
    for (const s of [-1, 1]) {
      const tear = at(sph(0.11, MAT.glass(0x7fd0ff, 0.6), 16), s * 0.62, 0.0, 0.72);
      tear.scale.set(0.8, 1.3, 0.6);
      g.add(tear);
    }
  } else if (face === 'shh') {
    g.add(at(capsule(0.07, 0.4, MAT.skin(color)), 0.05, -0.2, 0.98, 0, 0, 0.1));
  } else {
    g.add(at(torus(0.13, 0.035, ink, PI), 0, -0.18, 0.95, 0, 0, PI));
  }
  if (hat === 'gold' || hat === 'silver' || hat === 'bronze') g.add(at(crown(hat), 0, 0.98, 0, 0, 0, 0.12, 0.48));
  else if (hat === 'cap') {
    const m = MAT.candy(0x2b62ff);
    g.add(at(new Mesh(new THREE.SphereGeometry(0.72, 48, 24, 0, PI * 2, 0, PI / 2), m), 0, 0.55), at(rb(0.9, 0.06, 0.6, 0.03, m, 2), 0, 0.58, 0.62));
  } else if (hat === 'phones') {
    g.add(at(torus(0.98, 0.06, MAT.ink(), PI), 0, 0.05));
    for (const s of [-1, 1]) g.add(at(cyl(0.26, 0.26, 0.2, MAT.candy(0xff3d7f), 32), s * 1.0, 0.05, 0, 0, 0, PI / 2));
  } else if (hat === 'beanie') {
    const m = MAT.matte(0xff7a1a);
    g.add(at(new Mesh(new THREE.SphereGeometry(0.86, 48, 24, 0, PI * 2, 0, PI / 2.2), m), 0, 0.3), at(torus(0.8, 0.12, m), 0, 0.42, 0, PI / 2), at(sph(0.2, m, 24), 0, 1.18));
  } else if (hat === 'bow') {
    const m = MAT.candy(0xff3d8b);
    for (const s of [-1, 1]) g.add(at(cone(0.24, 0.5, m, 24), s * 0.24, 0.98, 0, 0, 0, s * PI / 2, 1));
    g.add(at(sph(0.11, m, 16), 0, 0.98));
  } else if (hat === 'grad') {
    g.add(at(gradCap(), 0, 0.92, 0, 0, 0, -0.1, 0.62));
  } else if (hat === 'fedora') {
    const m = MAT.matte(0x4a3326);
    g.add(at(cyl(1.08, 1.08, 0.06, m, 64), 0, 0.72), at(cyl(0.6, 0.68, 0.5, m, 48), 0, 0.98), at(cyl(0.685, 0.685, 0.12, MAT.candy(0xd83a3a), 48), 0, 0.8));
  }
  g.userData.eyes = eyes;
  g.userData.phase = Math.random() * 10;
  return g;
}

export function podium() {
  const g = new Group();
  const spots = [
    { x: -1.42, h: 1.45, n: '2', hat: 'silver', color: 0x4fa8ff },
    { x: 0, h: 1.95, n: '1', hat: 'gold', color: 0xff8fb8 },
    { x: 1.42, h: 1.15, n: '3', hat: 'bronze', color: 0xffb35c },
  ];
  const avatars = [];
  for (const s of spots) {
    g.add(at(rb(1.32, s.h, 1.2, 0.07, MAT.marble()), s.x, s.h / 2 - 1.2));
    g.add(at(label(s.n, 0.62), s.x, s.h - 1.62, 0.61));
    const a = at(blob({ color: s.color, hat: s.hat }), s.x, s.h - 0.72, 0.05, 0, 0, 0, 0.5);
    avatars.push(a);
    g.add(a);
  }
  g.add(at(contactShadow(5.5, 0.6), 0, -1.21));
  g.userData.avatars = avatars;
  return g;
}

export function confetti(n = 46) {
  const inst = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.07, 0.13), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, metalness: 0.4, roughness: 0.35 }), n);
  const palette = [0xffc93a, 0xff4f9a, 0x7c5cff, 0x3fd2ff, 0x9dff6a].map((c) => new Color(c));
  const seeds = [];
  for (let i = 0; i < n; i++) {
    inst.setColorAt(i, palette[i % palette.length]);
    seeds.push({ x: (Math.random() - 0.5) * 4, y: Math.random() * 4 - 2, z: (Math.random() - 0.5) * 1.5, s: 0.25 + Math.random() * 0.5, r: Math.random() * 6 });
  }
  inst.userData.seeds = seeds;
  return inst;
}

// ================================================================ props library
export function gradCap() {
  const ink = MAT.ink();
  return grp(
    at(rb(1.8, 0.08, 1.8, 0.03, ink, 2), 0, 0.3, 0, 0, PI / 4),
    at(cyl(0.68, 0.74, 0.5, ink, 48), 0, 0.04),
    at(sph(0.08, MAT.gold(), 16), 0, 0.36),
    at(capsule(0.025, 0.6, MAT.gold()), 0.55, 0.0, 0.55, 0, 0, 0.1),
    at(cyl(0.07, 0.1, 0.3, MAT.gold(), 16), 0.58, -0.35, 0.55),
  );
}

export function soccerBall() {
  const g = grp(sph(1, MAT.candy(0xffffff), 64));
  const ico = new THREE.IcosahedronGeometry(1, 0);
  const p = ico.getAttribute('position');
  const seen = [];
  for (let i = 0; i < p.count; i++) {
    const v = new Vector3().fromBufferAttribute(p, i).normalize();
    if (seen.some((s) => s.distanceTo(v) < 0.01)) continue;
    seen.push(v);
    const patch = cyl(0.36, 0.36, 0.08, MAT.candy(0x16181f), 5);
    patch.position.copy(v.clone().multiplyScalar(0.965));
    patch.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), v);
    g.add(patch);
  }
  return g;
}

export function envelope() {
  const paper = MAT.candy(0xfff4ea);
  return grp(
    rb(2, 1.3, 0.22, 0.08, paper),
    at(extrude(poly([[-0.98, 0], [0.98, 0], [0, -0.75]]), 0.04, 0.02, MAT.candy(0xffe6da)), 0, 0.28, 0.13),
    at(heart(0xff2d55), 0, -0.06, 0.22, 0, 0, 0, 0.32),
  );
}

export function ghost() {
  const m = MAT.candy(0xf6f7ff);
  const g = grp(lathe([[0, 1.1], [0.42, 1.02], [0.72, 0.72], [0.84, 0.25], [0.84, -0.45], [0, -0.45]], m));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * PI * 2;
    g.add(at(sph(0.24, m, 24), Math.cos(a) * 0.62, -0.5, Math.sin(a) * 0.62));
  }
  const ink = MAT.ink();
  for (const s of [-1, 1]) {
    const e = at(sph(0.11, ink, 16), s * 0.26, 0.5, 0.74);
    e.scale.y = 1.4;
    g.add(e, at(sph(0.17, m, 16), s * 0.9, 0.05, 0.1));
    const c = at(sph(0.1, new THREE.MeshBasicMaterial({ color: 0xff8fb3, transparent: true, opacity: 0.6 }), 12), s * 0.45, 0.28, 0.72);
    c.scale.z = 0.3;
    g.add(c);
  }
  const mouth = at(sph(0.16, MAT.matte(0x3a1020), 24), 0, 0.18, 0.8);
  mouth.scale.set(1, 1.2, 0.5);
  g.add(mouth, at(sph(0.08, MAT.candy(0xff6f91), 16), 0, 0.1, 0.86));
  return g;
}

export function heartArrow() {
  return grp(
    heart(0xff2d55),
    at(cyl(0.035, 0.035, 2.8, MAT.gold(), 12), 0, 0, 0.3, 0, 0, 0.85),
    at(cone(0.12, 0.3, MAT.silver(), 16), -1.06, 0.73, 0.3, 0, 0, 0.85),
    at(rb(0.22, 0.3, 0.03, 0.02, MAT.candy(0x7c5cff), 2), 1.0, -0.7, 0.3, 0, 0, 0.85),
    at(rb(0.22, 0.3, 0.03, 0.02, MAT.candy(0x7c5cff), 2), 0.9, -0.6, 0.3, 0, 0, 0.85),
  );
}

export function ballotBox() {
  return grp(
    rb(1.6, 1.2, 1.3, 0.1, MAT.candy(0x4a63ff)),
    at(rb(0.9, 0.06, 0.25, 0.03, MAT.ink(), 2), 0, 0.6, 0),
    at(rb(0.75, 0.9, 0.03, 0.02, MAT.paper(), 2), 0, 0.95, 0, 0, 0, -0.08),
    at(capsule(0.05, 0.14, MAT.candy(0x26c24f)), -0.12, 0.92, 0.04, 0, 0, 0.8),
    at(capsule(0.05, 0.36, MAT.candy(0x26c24f)), 0.08, 1.0, 0.04, 0, 0, -0.6),
    at(label('VOTE', 1, { fill: '#ffffff', font: '900 70px Fredoka, Arial' }), 0, -0.05, 0.66),
  );
}

export function sparkles() {
  const four = (r) => starShape(r, r * 0.28, 4);
  return grp(
    extrude(four(1), 0.2, 0.1, MAT.gold()),
    at(extrude(four(0.5), 0.15, 0.08, MAT.candy(0xff6fb5)), 0.95, 0.75, 0.1),
    at(extrude(four(0.35), 0.12, 0.06, MAT.candy(0x5fd3ff)), -0.9, -0.75, 0.1),
  );
}

export function medal(text = '1', metal = 'gold', ribbon = [0x2b62ff, 0xff3b4e]) {
  const m = MAT[metal]();
  return grp(
    at(rb(0.4, 1.2, 0.06, 0.03, MAT.candy(ribbon[0]), 2), -0.3, 1.0, -0.05, 0, 0, 0.32),
    at(rb(0.4, 1.2, 0.06, 0.03, MAT.candy(ribbon[1]), 2), 0.3, 1.0, -0.06, 0, 0, -0.32),
    at(cyl(0.85, 0.85, 0.16, m, 72), 0, 0, 0, PI / 2),
    torus(0.85, 0.06, m),
    at(label(text, 1.1, { fill: metal === 'gold' ? '#8a5a00' : metal === 'silver' ? '#5b6474' : '#7a3d16', font: '900 170px "Roboto Slab", Georgia' }), 0, 0, 0.09),
  );
}

export function rosette() {
  const g = grp(at(cyl(0.95, 0.95, 0.12, MAT.candy(0x2b62ff), 18), 0, 0, -0.02, PI / 2), at(cyl(0.7, 0.7, 0.18, MAT.gold(), 64), 0, 0, 0, PI / 2));
  g.add(at(extrude(starShape(0.4, 0.18), 0.06, 0.03, MAT.gold()), 0, 0, 0.12));
  g.add(at(rb(0.34, 1.0, 0.05, 0.02, MAT.candy(0x2b62ff), 2), -0.25, -1.0, -0.06, 0, 0, -0.2), at(rb(0.34, 1.0, 0.05, 0.02, MAT.candy(0x2b62ff), 2), 0.25, -1.0, -0.07, 0, 0, 0.2));
  return g;
}

export function spinWheel() {
  const g = new Group();
  const cols = [0xff4f6a, 0xffc93a, 0x3fc7ff, 0x7c5cff, 0x3ddc84, 0xff8a1f, 0xff6fb5, 0x2b62ff];
  const disc = new Group();
  cols.forEach((c, i) => disc.add(new Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 24, 1, false, (i / 8) * PI * 2, PI / 4), MAT.candy(c))));
  disc.rotation.x = PI / 2;
  g.add(disc, torus(1.2, 0.07, MAT.gold()), at(sph(0.16, MAT.gold(), 24), 0, 0, 0.14));
  g.add(at(cone(0.16, 0.36, MAT.gold(), 24), 0, 1.32, 0.12, 0, 0, PI));
  g.add(at(rb(0.22, 1.1, 0.22, 0.05, MAT.wood()), 0, -1.35, -0.2), at(rb(1.2, 0.18, 0.6, 0.06, MAT.wood()), 0, -1.9, -0.2));
  return g;
}

export function goal(withBall = true, high = false) {
  const w = MAT.candy(0xffffff);
  const g = grp(at(cyl(0.06, 0.06, 1.4, w, 16), -1.3, 0), at(cyl(0.06, 0.06, 1.4, w, 16), 1.3, 0), at(cyl(0.06, 0.06, 2.66, w, 16), 0, 0.7, 0, 0, 0, PI / 2));
  const net = new Mesh(new THREE.PlaneGeometry(2.6, 1.4, 13, 7), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.55 }));
  g.add(at(net, 0, 0, -0.45));
  if (withBall) g.add(at(soccerBall(), high ? 0.9 : 0.5, high ? 0.75 : -0.35, 0.35, 0.4, 0.3, 0, 0.32));
  return g;
}

export function bingoCard() {
  const g = grp(rb(1.8, 2.1, 0.16, 0.14, MAT.candy(0xffffff)), at(rb(1.8, 0.45, 0.18, 0.14, MAT.candy(0xff3b5c)), 0, 0.83));
  g.add(at(label('BINGO', 1.2, { fill: '#fff', font: '900 64px Fredoka, Arial' }), 0, 0.84, 0.1));
  const marked = [0, 4, 8, 2];
  for (let i = 0; i < 9; i++) {
    const x = -0.55 + (i % 3) * 0.55;
    const y = 0.25 - Math.floor(i / 3) * 0.5;
    g.add(at(cyl(0.2, 0.2, 0.06, MAT.candy(marked.includes(i) ? 0xffc93a : 0xe8e4f4), 32), x, y, 0.1, PI / 2));
  }
  return g;
}

function sword() {
  const blade = extrude(poly([[-0.09, 0], [0.09, 0], [0.09, 1.7], [0, 1.95], [-0.09, 1.7]]), 0.04, 0.02, MAT.silver());
  return grp(at(blade, 0, 0.55), at(rb(0.7, 0.12, 0.16, 0.05, MAT.gold(), 2), 0, -0.45), at(cyl(0.07, 0.07, 0.55, MAT.matte(0x5a3324), 16), 0, -0.78), at(sph(0.11, MAT.gold(), 16), 0, -1.08));
}
export const swords = () => grp(at(sword(), -0.15, 0, 0, 0, 0, -0.7), at(sword(), 0.15, 0, 0.1, 0, 0, 0.7));

export const prohibited = () => grp(torus(1, 0.16, MAT.candy(0xff2e45)), at(rb(1.85, 0.3, 0.3, 0.12, MAT.candy(0xff2e45)), 0, 0, 0, 0, 0, PI / 4));

export function spoon() {
  const w = MAT.wood(0xd4995a);
  const bowl = sph(0.55, w);
  bowl.scale.set(1, 1.35, 0.32);
  return grp(at(bowl, 0, 0.6), at(capsule(0.09, 1.8, w), 0, -0.75), at(sph(0.14, w), 0, -1.75));
}

export function detective() {
  const g = blob({ color: 0x9ad5ff, hat: 'fedora' });
  const lens = grp(torus(0.32, 0.06, MAT.gold()), at(cyl(0.3, 0.3, 0.02, MAT.glass(0xcfeaff, 0.95), 32), 0, 0, 0, PI / 2), at(capsule(0.06, 0.5, MAT.matte(0x5a3324)), 0.32, -0.42, 0, 0, 0, 0.6));
  g.add(at(lens, 0.85, -0.35, 0.7, 0, -0.3, 0));
  return g;
}

export function speechBubble(text = '?', color = 0xffffff, textColor = '#7c5cff') {
  return grp(
    rb(1.8, 1.25, 0.35, 0.4, MAT.candy(color), 6),
    at(cone(0.26, 0.5, MAT.candy(color), 4), -0.5, -0.75, 0, 0, 0, PI + 0.5),
    at(label(text, 1.1, { fill: textColor, font: '900 170px Fredoka, Arial' }), 0, 0, 0.19),
  );
}

export function gossip() {
  const g = blob({ color: 0xb98cff, face: 'shh' });
  g.add(at(speechBubble('?'), 0.95, 0.95, 0.2, 0, 0, 0, 0.42));
  return g;
}

export function stopwatch() {
  return grp(
    at(cyl(1, 1, 0.42, MAT.candy(0xff4f6a), 72), 0, 0, 0, PI / 2),
    at(cyl(0.84, 0.84, 0.05, MAT.candy(0xffffff), 72), 0, 0, 0.21, PI / 2),
    at(rb(0.07, 0.62, 0.04, 0.02, MAT.ink(), 2), 0, 0.27, 0.25),
    at(rb(0.07, 0.4, 0.04, 0.02, MAT.candy(0xff4f6a), 2), 0.16, -0.1, 0.26, 0, 0, -2.2),
    at(sph(0.07, MAT.ink(), 16), 0, 0, 0.26),
    at(cyl(0.14, 0.14, 0.3, MAT.silver(), 24), 0, 1.13),
    at(torus(0.2, 0.05, MAT.silver()), 0, 1.36),
  );
}

export function fire() {
  const outer = lathe([[0, 1.4], [0.22, 0.95], [0.5, 0.4], [0.58, 0], [0.45, -0.35], [0, -0.48]], phys({ color: 0xff4d0a, emissive: 0xff3a00, emissiveIntensity: 0.55, roughness: 0.3, clearcoat: 1 }));
  const inner = at(lathe([[0, 1.0], [0.18, 0.62], [0.36, 0.2], [0.38, -0.08], [0.25, -0.3], [0, -0.38]], phys({ color: 0xffb21a, emissive: 0xff9500, emissiveIntensity: 0.6, roughness: 0.3, clearcoat: 1 })), 0, -0.05, 0.3, 0, 0, 0, 0.8);
  return grp(outer, inner);
}
export const heartFire = () => grp(at(fire(), 0, 0.3, -0.4, 0, 0, 0, 1.15), at(heart(0xff2d55), 0, -0.2, 0.2, 0, 0, 0, 0.85));

export function hand(color = 0xffc48a, glove = false) {
  const m = glove ? MAT.candy(color) : MAT.skin(color);
  const g = grp(rb(1.05, 1.1, 0.42, 0.2, m));
  [-0.36, -0.12, 0.12, 0.36].forEach((x, i) => g.add(at(capsule(0.14, [0.45, 0.6, 0.58, 0.42][i], m), x, 0.9 + [0, 0.07, 0.06, -0.02][i], 0, 0, 0, -x * 0.25)));
  g.add(at(capsule(0.15, 0.45, m), -0.62, 0.05, 0.05, 0, 0, 0.95));
  if (glove) g.add(at(rb(1.1, 0.35, 0.48, 0.14, MAT.candy(0xffffff)), 0, -0.7));
  return g;
}

export function thumb(up = true) {
  const m = MAT.skin(0xffc48a);
  const g = grp(rb(1.05, 0.95, 0.8, 0.28, m));
  [0.25, 0.0, -0.25].forEach((y) => g.add(at(capsule(0.13, 0.55, m), 0.08, y, 0.38, 0, 0, PI / 2)));
  g.add(at(capsule(0.17, 0.6, m), -0.25, 0.8, 0.1, 0, 0, 0.15));
  g.add(at(rb(0.6, 0.35, 0.82, 0.12, MAT.candy(up ? 0x2b62ff : 0xff3b4e)), 0.1, -0.62));
  if (!up) g.rotation.z = PI;
  return g;
}

export function bomb() {
  const curve = new THREE.CatmullRomCurve3([new Vector3(0, 0.95, 0), new Vector3(0.15, 1.25, 0), new Vector3(0.45, 1.35, 0.05), new Vector3(0.6, 1.2, 0.1)]);
  return grp(
    sph(0.9, phys({ color: 0x1d1f2a, roughness: 0.15, clearcoat: 1, metalness: 0.3 }), 64),
    at(cyl(0.26, 0.3, 0.28, MAT.silver(), 32), 0, 0.88),
    new Mesh(new THREE.TubeGeometry(curve, 24, 0.05, 10), MAT.matte(0xd8c29a)),
    at(extrude(starShape(0.22, 0.09, 6), 0.06, 0.03, MAT.glow(0xffd23a, 2)), 0.62, 1.22, 0.12),
  );
}

export function signpost() {
  const arrow = (c, dir) => {
    const s = poly([[-0.8, -0.22], [0.5, -0.22], [0.5, -0.38], [0.85, 0], [0.5, 0.38], [0.5, 0.22], [-0.8, 0.22]]);
    const m = extrude(s, 0.12, 0.05, MAT.candy(c));
    if (dir < 0) m.rotation.y = PI;
    return m;
  };
  return grp(at(cyl(0.08, 0.08, 2.6, MAT.wood(), 16), 0, -0.2), at(arrow(0x2b62ff, 1), 0.45, 0.65, 0.12), at(arrow(0xff4f9a, -1), -0.45, 0.05, 0.12), at(cyl(0.5, 0.6, 0.15, MAT.matte(0x4f9a3c), 32), 0, -1.5));
}

export function masks() {
  const mask = (c, happy) => {
    const f = sph(0.7, MAT.candy(c), 48);
    f.scale.set(1, 1.1, 0.4);
    const ink = MAT.ink();
    const g = grp(f, at(sph(0.11, ink, 16), -0.25, 0.2, 0.26), at(sph(0.11, ink, 16), 0.25, 0.2, 0.26), at(torus(0.24, 0.05, ink, PI), 0, happy ? -0.15 : -0.32, 0.27, 0, 0, happy ? PI : 0));
    return g;
  };
  return grp(at(mask(0xffc93a, true), -0.42, 0.15, 0, 0, 0.25, 0.2), at(mask(0x7c5cff, false), 0.48, -0.15, 0.2, 0, -0.25, -0.2));
}

export function newspaper() {
  const tex = linesTexture('#2a2a2a');
  return grp(at(rb(1.25, 1.65, 0.04, 0.02, MAT.paper(tex), 2), -0.32, 0, 0, 0, 0.35, -0.08), at(rb(1.25, 1.65, 0.04, 0.02, MAT.paper(linesTexture('#e2483d')), 2), 0.32, 0.05, 0.1, 0, -0.3, 0.06));
}

export function crystalBall() {
  const g = grp(sph(0.95, MAT.glass(0xe9dcff, 0.95), 64));
  g.add(at(new Mesh(new THREE.TorusKnotGeometry(0.32, 0.08, 96, 12, 2, 3), MAT.glow(0xa86bff, 1.6)), 0, 0.05));
  g.add(at(lathe([[0.55, -0.75], [0.8, -1.05], [0.85, -1.25], [0, -1.25]], MAT.gold()), 0, 0));
  return g;
}

export function target() {
  const g = new Group();
  [[1, 0xff3b4e], [0.78, 0xffffff], [0.56, 0xff3b4e], [0.34, 0xffffff], [0.14, 0xffc93a]].forEach(([r, c], i) => g.add(at(cyl(r, r, 0.14 + i * 0.02, MAT.candy(c), 64), 0, 0, i * 0.02, PI / 2)));
  g.add(at(grp(cyl(0.035, 0.035, 1.1, MAT.silver(), 12), at(cone(0.06, 0.2, MAT.silver(), 12), 0, -0.62, 0, PI), at(rb(0.25, 0.3, 0.02, 0.01, MAT.candy(0x2b62ff), 2), 0, 0.52)), 0.3, 0.35, 0.6, 0.9, 0, -0.5));
  return g;
}

export const rope = () => new Mesh(new THREE.TorusKnotGeometry(0.72, 0.17, 160, 18, 2, 3), MAT.matte(0xc9945a));

export function chequeredFlag() {
  const geo = new THREE.PlaneGeometry(1.5, 1, 24, 12);
  const p = geo.getAttribute('position');
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 3.2) * 0.1);
  geo.computeVertexNormals();
  const flag = new Mesh(geo, phys({ map: checkerTexture(), roughness: 0.6, side: THREE.DoubleSide }));
  return grp(at(cyl(0.05, 0.05, 2.6, MAT.silver(), 16), -0.78, -0.3), at(sph(0.1, MAT.gold(), 16), -0.78, 1.02), at(flag, 0, 0.5, 0, 0, 0.1));
}

export function palette() {
  const s = new THREE.Shape();
  s.absellipse(0, 0, 1.2, 0.9, 0, PI * 2);
  const hole = new THREE.Path();
  hole.absellipse(-0.6, -0.3, 0.18, 0.15, 0, PI * 2);
  s.holes.push(hole);
  const g = grp(extrude(s, 0.1, 0.05, MAT.wood(0xd7a467)));
  [[0.55, 0.35, 0xff3b4e], [0.15, 0.55, 0xffc93a], [-0.3, 0.45, 0x3ddc84], [0.7, -0.15, 0x2b62ff], [0.25, -0.45, 0x7c5cff]].forEach(([x, y, c]) => {
    const b = sph(0.2, MAT.candy(c), 24);
    b.scale.z = 0.4;
    g.add(at(b, x, y, 0.1));
  });
  return g;
}

export function wingedBall() {
  const wing = (s) => {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.bezierCurveTo(0.4, 0.5, 1.0, 0.6, 1.2, 0.4);
    sh.bezierCurveTo(0.9, 0.25, 1.0, 0.05, 0.8, -0.05);
    sh.bezierCurveTo(0.5, -0.1, 0.3, -0.2, 0, 0);
    const m = extrude(sh, 0.05, 0.03, MAT.candy(0xffffff));
    m.scale.x = s;
    return m;
  };
  return grp(soccerBall(), at(wing(1), 1.25, 0.25, -0.1, 0, 0, 0.2), at(wing(-1), -1.25, 0.25, -0.1, 0, 0, -0.2));
}

export function simonPad() {
  const g = new Group();
  [0x3ddc84, 0xff3b4e, 0x2b62ff, 0xffc93a].forEach((c, i) => g.add(new Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.26, 32, 1, false, (i / 4) * PI * 2 + 0.05, PI / 2 - 0.1), MAT.candy(c))));
  g.add(cyl(0.42, 0.42, 0.32, MAT.ink(), 48), at(cyl(1.22, 1.22, 0.18, MAT.ink(), 64), 0, -0.06));
  g.rotation.x = 1.1;
  return grp(g);
}

export const bolt = () => extrude(poly([[0.15, 1.2], [-0.6, -0.1], [-0.05, -0.1], [-0.25, -1.2], [0.6, 0.25], [0.05, 0.25], [0.35, 1.2]]), 0.3, 0.1, MAT.candy(0xffc21a));

export function scissors() {
  const blade = () => extrude(poly([[0, 0], [0.12, 0.05], [0.18, 1.5], [0.03, 1.6]]), 0.05, 0.02, MAT.silver());
  return grp(
    at(blade(), 0.22, 0.65, 0.05, 0, 0, -0.22),
    (() => { const b = at(blade(), -0.22, 0.65, 0, 0, 0, 0.22); b.scale.x = -1; return b; })(),
    at(torus(0.32, 0.08, MAT.candy(0xff3b4e)), -0.4, -0.55, 0),
    at(torus(0.32, 0.08, MAT.candy(0xff3b4e)), 0.4, -0.55, 0),
    at(sph(0.07, MAT.gold(), 16), 0, 0, 0.08),
  );
}

export function rock() {
  const geo = new THREE.DodecahedronGeometry(1, 1);
  const p = geo.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const v = new Vector3().fromBufferAttribute(p, i);
    const k = 1 + Math.sin(v.x * 5) * 0.06 + Math.cos(v.y * 4 + v.z * 3) * 0.07;
    v.multiplyScalar(k);
    p.setXYZ(i, v.x, v.y * 0.8, v.z);
  }
  geo.computeVertexNormals();
  return new Mesh(geo, phys({ color: 0x8d8f99, roughness: 0.8, flatShading: true }));
}

export function paperSheet() {
  const geo = new THREE.PlaneGeometry(1.5, 1.9, 24, 24);
  const p = geo.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const d = p.getX(i) + p.getY(i) - 1.0;
    if (d > 0) p.setZ(i, d * d * 0.55);
  }
  geo.computeVertexNormals();
  return new Mesh(geo, MAT.paper(linesTexture('#2b62ff')));
}

function cardTex(rank, suit, red) {
  return canvasTex(256, 360, (g, w, h) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, w, h);
    g.fillStyle = red ? '#d63a3a' : '#16181f';
    g.font = '800 64px Fredoka, Arial';
    g.fillText(rank, 22, 72);
    g.font = '200px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(suit, w / 2, h / 2 + 20);
  });
}
export function cards() {
  return grp(
    at(rb(1.1, 1.55, 0.04, 0.08, MAT.tex(cardTex('K', '♠', false)), 2), -0.35, 0, 0, 0, 0, 0.25),
    at(rb(1.1, 1.55, 0.04, 0.08, MAT.tex(cardTex('A', '♥', true)), 2), 0.35, 0.05, 0.08, 0, 0, -0.2),
  );
}

export function abacus() {
  const w = MAT.wood(0x9b5a2c);
  const g = grp(at(rb(2.1, 0.16, 0.3, 0.05, w), 0, 1), at(rb(2.1, 0.16, 0.3, 0.05, w), 0, -1), at(rb(0.16, 2.1, 0.3, 0.05, w), -1, 0), at(rb(0.16, 2.1, 0.3, 0.05, w), 1, 0));
  const cols = [0xff3b4e, 0xffc93a, 0x3ddc84, 0x2b62ff];
  for (let r = 0; r < 4; r++) {
    const y = 0.65 - r * 0.43;
    g.add(at(cyl(0.025, 0.025, 1.9, MAT.silver(), 8), 0, y, 0, 0, 0, PI / 2));
    for (let b = 0; b < 4; b++) {
      const bead = sph(0.15, MAT.candy(cols[r]), 24);
      bead.scale.x = 0.7;
      g.add(at(bead, -0.75 + b * 0.3 + (b > 1 ? 0.6 : 0) - r * 0.1, y));
    }
  }
  return g;
}

export function dice() {
  const g = grp(rb(1.3, 1.3, 1.3, 0.24, MAT.candy(0xffffff), 6));
  const pip = (x, y, z) => g.add(at(sph(0.12, MAT.candy(0x1c1d26), 16), x, y, z));
  [[-0.33, 0.33], [0.33, 0.33], [0, 0], [-0.33, -0.33], [0.33, -0.33]].forEach(([x, y]) => pip(x, y, 0.62));
  [[-0.3, 0.3], [0.3, -0.3]].forEach(([x, z]) => pip(x, 0.62, z));
  [[0.3, 0.3], [0, 0], [-0.3, -0.3]].forEach(([y, z]) => pip(0.62, y, z));
  return g;
}

function mapTex() {
  return canvasTex(384, 256, (g, w, h) => {
    g.fillStyle = '#7fd0ea';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#7cc45a';
    [[90, 90, 70], [250, 150, 90], [320, 60, 40]].forEach(([x, y, r]) => {
      g.beginPath();
      g.ellipse(x, y, r, r * 0.7, 0.4, 0, PI * 2);
      g.fill();
    });
    g.strokeStyle = '#e2483d';
    g.lineWidth = 6;
    g.setLineDash([12, 10]);
    g.beginPath();
    g.moveTo(60, 200);
    g.bezierCurveTo(140, 120, 220, 220, 330, 70);
    g.stroke();
  });
}
export function foldedMap() {
  const tex = mapTex();
  const g = new Group();
  for (let i = 0; i < 3; i++) {
    const t = tex.clone();
    t.repeat.set(1 / 3, 1);
    t.offset.set(i / 3, 0);
    t.needsUpdate = true;
    g.add(at(rb(0.85, 1.5, 0.03, 0.01, MAT.paper(t), 1), -0.82 + i * 0.82, 0, i % 2 ? -0.25 : 0, 0, i % 2 ? 0.55 : -0.55));
  }
  return g;
}

export function money() {
  const note = canvasTex(320, 160, (g, w, h) => {
    g.fillStyle = '#3cbf6e';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#1f8a48';
    g.lineWidth = 10;
    g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#eaffef';
    g.font = '900 90px Fredoka, Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('€', w / 2, h / 2 + 4);
  });
  const g = new Group();
  for (let i = 0; i < 3; i++) g.add(at(rb(1.9, 0.95, 0.05, 0.03, MAT.tex(note, { roughness: 0.7, clearcoat: 0.1 }), 2), i * 0.05, i * 0.12 - 0.1, i * 0.06, -0.3, 0, -0.08 + i * 0.08));
  g.add(at(coin(), 0.75, -0.55, 0.45, 0.2, -0.4, 0, 0.4));
  return g;
}

export function clipboard() {
  return grp(
    rb(1.45, 1.95, 0.1, 0.1, MAT.wood(0xb67a43)),
    at(rb(1.22, 1.55, 0.02, 0.01, MAT.paper(linesTexture('#3ddc84')), 1), 0, -0.1, 0.07),
    at(rb(0.7, 0.28, 0.16, 0.06, MAT.silver(), 2), 0, 0.88, 0.07),
  );
}

export function rankCards() {
  const c = (t, color, metal) => grp(rb(0.85, 1.2, 0.05, 0.08, MAT.candy(color), 2), at(label(t, 0.9, { fill: metal, font: '900 180px "Roboto Slab", Georgia' }), 0, 0, 0.04));
  return grp(at(c('3', 0xffe6d3, '#b0602b'), 0.6, -0.1, 0, 0, 0, -0.3), at(c('2', 0xeef1f8, '#6d7686'), -0.6, -0.1, 0.05, 0, 0, 0.3), at(c('1', 0xfff2c8, '#c08a00'), 0, 0.1, 0.12));
}

export function calendar() {
  return grp(
    rb(1.6, 1.6, 0.25, 0.16, MAT.candy(0xffffff)),
    at(rb(1.6, 0.5, 0.27, 0.16, MAT.candy(0xff3b4e)), 0, 0.56),
    at(label('SAT', 1.0, { fill: '#fff', font: '900 80px Fredoka, Arial' }), 0, 0.57, 0.15),
    at(label('14', 1.2, { fill: '#2a2a35', font: '900 140px "Roboto Slab", Georgia' }), 0, -0.2, 0.14),
    at(torus(0.12, 0.04, MAT.silver()), -0.45, 0.85, 0, 0, PI / 2),
    at(torus(0.12, 0.04, MAT.silver()), 0.45, 0.85, 0, 0, PI / 2),
  );
}

export function microphone() {
  const head = sph(0.62, MAT.silver(), 48);
  const grille = sph(0.635, new THREE.MeshBasicMaterial({ color: 0x3a3d48, wireframe: true }), 18);
  return grp(at(head, 0, 0.7), at(grille, 0, 0.7), at(torus(0.6, 0.06, MAT.gold()), 0, 0.5, 0, PI / 2), at(cyl(0.22, 0.15, 1.4, MAT.ink(), 32), 0, -0.4), at(rb(0.12, 0.25, 0.06, 0.03, MAT.candy(0xff3b4e), 2), 0, -0.1, 0.2));
}

export function clown() {
  const g = blob({ color: 0xffffff, face: 'laugh' });
  g.add(at(sph(0.2, MAT.candy(0xff2e45), 24), 0, 0.0, 1.0));
  [[0.85, 0.5, 0xff3b4e], [1.0, 0.1, 0xffc93a], [0.9, -0.3, 0x3ddc84], [-0.85, 0.5, 0x2b62ff], [-1.0, 0.1, 0x7c5cff], [-0.9, -0.3, 0xff6fb5]].forEach(([x, y, c]) => g.add(at(sph(0.3, MAT.matte(c), 24), x, y, -0.1)));
  return g;
}

export function scales() {
  const gold = MAT.gold();
  const pan = () => grp(lathe([[0, -0.1], [0.5, -0.05], [0.55, 0.05], [0.5, 0.06], [0, -0.04]], gold), at(cyl(0.012, 0.012, 0.9, gold, 6), -0.25, 0.45, 0, 0, 0, -0.3), at(cyl(0.012, 0.012, 0.9, gold, 6), 0.25, 0.45, 0, 0, 0, 0.3));
  return grp(at(cyl(0.07, 0.07, 2.2, gold, 16), 0, 0), at(cyl(0.5, 0.6, 0.15, gold, 48), 0, -1.1), at(rb(2.4, 0.1, 0.12, 0.04, gold, 2), 0, 1.0, 0, 0, 0, 0.08), at(pan(), -1.1, 0.0), at(pan(), 1.1, -0.2), at(sph(0.12, gold, 16), 0, 1.15));
}

export function scroll() {
  const parch = canvasTex(256, 320, (g, w, h) => {
    g.fillStyle = '#f3e3b8';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#b89a5e';
    for (let i = 0; i < 9; i++) g.fillRect(30, 40 + i * 28, (w - 60) * (i % 4 === 3 ? 0.55 : 1), 8);
  });
  const w = MAT.matte(0xe7d09a);
  return grp(rb(1.5, 1.8, 0.03, 0.01, MAT.paper(parch), 1), at(cyl(0.16, 0.16, 1.7, w, 32), 0, 0.95, 0.06, 0, 0, PI / 2), at(cyl(0.16, 0.16, 1.7, w, 32), 0, -0.95, 0.06, 0, 0, PI / 2), at(cyl(0.05, 0.05, 1.9, MAT.wood(0x8a4f22), 12), 0, 0.95, 0.06, 0, 0, PI / 2), at(cyl(0.05, 0.05, 1.9, MAT.wood(0x8a4f22), 12), 0, -0.95, 0.06, 0, 0, PI / 2));
}

export const explosion = (outer = 0xff3b30, inner = 0xffc21a) => grp(extrude(starShape(1.2, 0.62, 11), 0.3, 0.1, MAT.candy(outer)), at(extrude(starShape(0.72, 0.4, 9), 0.3, 0.08, MAT.candy(inner)), 0, 0, 0.2));

export function headphones() {
  const band = MAT.candy(0x2a2d3a);
  const cup = MAT.candy(0xff4f9a);
  return grp(at(torus(0.98, 0.09, band, PI), 0, 0.05), ...[-1, 1].flatMap((s) => [at(cyl(0.38, 0.38, 0.36, cup, 48), s * 1.0, -0.15, 0, 0, 0, PI / 2), at(cyl(0.3, 0.3, 0.1, MAT.matte(0x22242e), 48), s * 0.8, -0.15, 0, 0, 0, PI / 2)]));
}

export function drum() {
  const g = grp(cyl(1, 1, 0.9, MAT.candy(0xff3b4e), 64), at(cyl(0.98, 0.98, 0.04, MAT.candy(0xfffaf0), 64), 0, 0.47), at(torus(1.0, 0.06, MAT.gold()), 0, 0.46, 0, PI / 2), at(torus(1.0, 0.06, MAT.gold()), 0, -0.46, 0, PI / 2));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * PI * 2;
    g.add(at(cyl(0.025, 0.025, 0.9, MAT.gold(), 8), Math.cos(a) * 1.01, 0, Math.sin(a) * 1.01, 0, 0, Math.cos(a) * 0.0 + (i % 2 ? 0.25 : -0.25)));
  }
  g.add(at(capsule(0.05, 1.5, MAT.wood(0xe0b27a)), -0.3, 1.0, 0.3, 0, 0, 0.9), at(capsule(0.05, 1.5, MAT.wood(0xe0b27a)), 0.3, 1.0, 0.3, 0, 0, -0.9));
  g.rotation.x = 0.35;
  return grp(g);
}

export function vinyl() {
  const grooves = canvasTex(256, 256, (g, w) => {
    g.fillStyle = '#121318';
    g.fillRect(0, 0, w, w);
    for (let r = 40; r < 126; r += 3) {
      g.strokeStyle = `rgba(255,255,255,${0.03 + (r % 9 === 0 ? 0.05 : 0)})`;
      g.beginPath();
      g.arc(w / 2, w / 2, r, 0, PI * 2);
      g.stroke();
    }
  });
  return grp(
    at(cyl(1.2, 1.2, 0.05, phys({ map: grooves, roughness: 0.25, clearcoat: 1 }), 96), 0, 0, 0, PI / 2),
    at(cyl(0.42, 0.42, 0.06, MAT.candy(0xff4f9a), 64), 0, 0, 0.01, PI / 2),
    at(cyl(0.05, 0.05, 0.08, MAT.ink(), 16), 0, 0, 0.02, PI / 2),
  );
}

export const laughMascot = () => blob({ color: 0xffc93a, face: 'laugh' });

export function clapper() {
  const stripes = canvasTex(256, 64, (g, w, h) => {
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? '#fafafa' : '#16181f';
      g.beginPath();
      g.moveTo(i * 36, 0);
      g.lineTo(i * 36 + 36, 0);
      g.lineTo(i * 36 + 16, h);
      g.lineTo(i * 36 - 20, h);
      g.fill();
    }
  });
  return grp(
    rb(1.9, 1.25, 0.14, 0.06, MAT.ink()),
    at(rb(1.9, 0.3, 0.15, 0.04, MAT.tex(stripes), 2), 0, 0.78),
    at(rb(1.9, 0.3, 0.15, 0.04, MAT.tex(stripes), 2), 0.08, 1.12, 0, 0, 0, 0.22),
    at(label('GIF', 1.0, { fill: '#ffc93a', font: '900 120px Fredoka, Arial' }), 0, -0.1, 0.08),
  );
}

export function framedPicture() {
  const art = canvasTex(320, 240, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#7fd0ff');
    sky.addColorStop(1, '#dff4ff');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd23a';
    g.beginPath();
    g.arc(240, 60, 28, 0, PI * 2);
    g.fill();
    g.fillStyle = '#4fae5a';
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(90, 110);
    g.lineTo(170, h);
    g.fill();
    g.fillStyle = '#3d8f4a';
    g.beginPath();
    g.moveTo(110, h);
    g.lineTo(210, 90);
    g.lineTo(320, h);
    g.fill();
  });
  return grp(rb(2.1, 1.7, 0.16, 0.06, MAT.gold()), at(plane(1.75, 1.35, phys({ map: art, roughness: 0.5 })), 0, 0, 0.085));
}

export function gamepad(color = 0x7c5cff) {
  const m = MAT.candy(color);
  const g = grp(rb(1.9, 0.95, 0.55, 0.42, m, 6));
  for (const s of [-1, 1]) {
    const grip = sph(0.5, m, 32);
    grip.scale.set(0.9, 1.1, 0.95);
    g.add(at(grip, s * 0.72, -0.35, 0));
  }
  const ink = MAT.ink();
  g.add(at(rb(0.42, 0.13, 0.08, 0.03, ink, 2), -0.55, 0.08, 0.29), at(rb(0.13, 0.42, 0.08, 0.03, ink, 2), -0.55, 0.08, 0.29));
  [[0.48, 0.2, 0x3ddc84], [0.62, 0.06, 0xff3b4e], [0.34, 0.06, 0x2b62ff], [0.48, -0.08, 0xffc93a]].forEach(([x, y, c]) => g.add(at(sph(0.075, MAT.candy(c), 16), x, y + 0.02, 0.3)));
  g.add(at(cyl(0.12, 0.12, 0.1, ink, 24), -0.22, -0.22, 0.3, PI / 2), at(cyl(0.12, 0.12, 0.1, ink, 24), 0.22, -0.22, 0.3, PI / 2));
  return g;
}

export function joystick() {
  return grp(rb(1.5, 0.42, 1.3, 0.16, MAT.candy(0x2b2d3a)), at(cyl(0.07, 0.09, 1.0, MAT.silver(), 16), 0, 0.65, 0, -0.2), at(sph(0.3, MAT.candy(0xff3b4e), 32), 0, 1.18, -0.1), at(cyl(0.16, 0.16, 0.1, MAT.candy(0xffc93a), 24), 0.45, 0.24, 0.3));
}

export function partyPopper() {
  const g = grp(at(cyl(0.62, 0.1, 1.4, MAT.tex(stripeTexture('#ffc93a', '#ff4f9a', 6), { roughness: 0.3 }), 48), 0, -0.35, 0, 0, 0, 0.6));
  const cols = [0xff4f9a, 0x3fd2ff, 0xffc93a, 0x7c5cff, 0x3ddc84];
  for (let i = 0; i < 16; i++) {
    const a = -0.4 + (i / 16) * 1.9;
    const r = 0.9 + (i % 4) * 0.25;
    const piece = i % 3 ? capsule(0.04, 0.22, MAT.candy(cols[i % 5])) : sph(0.08, MAT.candy(cols[i % 5]), 12);
    g.add(at(piece, -0.35 + Math.cos(a + 0.6) * r * 0.9, 0.3 + Math.sin(a + 0.6) * r * 0.8, 0.1 * (i % 3), 0, 0, a * 3));
  }
  return g;
}

export function gear() {
  const s = new THREE.Shape();
  const n = 10;
  for (let i = 0; i < n * 4; i++) {
    const a = (i / (n * 4)) * PI * 2;
    const r = i % 4 < 2 ? 1.0 : 0.78;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  const h = new THREE.Path();
  h.absarc(0, 0, 0.32, 0, PI * 2, true);
  s.holes.push(h);
  return extrude(s, 0.28, 0.06, MAT.metal(0xbfc6d4), 24);
}

export function house() {
  const roof = extrude(poly([[-0.95, 0], [0.95, 0], [0, 0.75]]), 1.25, 0.04, MAT.candy(0xff5a3d));
  roof.rotation.y = 0;
  return grp(rb(1.45, 1.05, 1.15, 0.06, MAT.candy(0xfff3df)), at(roof, 0, 0.88, 0), at(rb(0.36, 0.6, 0.06, 0.04, MAT.wood(0x9b5a2c), 2), 0, -0.23, 0.58), at(rb(0.34, 0.3, 0.06, 0.04, MAT.glass(0x9fd8ff, 0.6), 2), 0.42, 0.15, 0.58));
}

export function skull() {
  const ivory = MAT.candy(0xf7f2e6);
  const g = grp(sph(0.9, ivory, 48), at(rb(0.8, 0.5, 0.7, 0.18, ivory), 0, -0.68, 0.18));
  for (const s of [-1, 1]) {
    const e = sph(0.24, MAT.matte(0x1b1a20), 24);
    e.scale.set(1, 1.1, 0.5);
    g.add(at(e, s * 0.33, -0.08, 0.76));
  }
  g.add(at(cone(0.09, 0.18, MAT.matte(0x1b1a20), 3), 0, -0.4, 0.86, 0, 0, PI));
  [-0.24, -0.08, 0.08, 0.24].forEach((x) => g.add(at(rb(0.04, 0.16, 0.04, 0.01, MAT.matte(0x1b1a20), 1), x, -0.72, 0.54)));
  return g;
}

export function baseballCap(color = 0x2b62ff) {
  const m = MAT.candy(color);
  return grp(new Mesh(new THREE.SphereGeometry(0.9, 48, 24, 0, PI * 2, 0, PI / 2), m), at(rb(1.1, 0.07, 0.8, 0.03, m, 2), 0, 0.02, 0.85, 0.1), at(sph(0.08, m, 12), 0, 0.9));
}

export function musicNotes() {
  const m = MAT.candy(0x7c5cff);
  const head = (x, y) => {
    const h = sph(0.26, m, 32);
    h.scale.set(1.2, 0.85, 0.7);
    return at(h, x, y, 0, 0, 0, 0.35);
  };
  return grp(head(-0.55, -0.6), head(0.55, -0.35), at(cyl(0.05, 0.05, 1.4, m, 12), -0.29, 0.1), at(cyl(0.05, 0.05, 1.4, m, 12), 0.81, 0.35), at(rb(1.15, 0.2, 0.1, 0.04, m, 2), 0.26, 0.92, 0, 0, 0, 0.2));
}

export function speaker() {
  const g = grp(rb(1.3, 1.7, 1.0, 0.14, MAT.candy(0x2a2d3a)));
  g.add(at(lathe([[0.55, 0], [0.5, -0.05], [0.15, -0.25], [0, -0.25]], MAT.silver()), 0, -0.3, 0.52, PI / 2));
  g.add(at(lathe([[0.25, 0], [0.22, -0.03], [0.05, -0.12], [0, -0.12]], MAT.silver()), 0, 0.5, 0.52, PI / 2));
  for (const r of [0.55, 0.85]) g.add(at(torus(r, 0.04, MAT.glow(0x3fd2ff, 1.2), PI / 2), 0.75, -0.3, 0.3, 0, 0, -PI / 4));
  return g;
}

export function rocket() {
  const body = lathe([[0, 1.3], [0.25, 1.0], [0.42, 0.5], [0.45, -0.3], [0.38, -0.7], [0, -0.7]], MAT.candy(0xf4f5fa));
  const g = grp(body, at(torus(0.17, 0.04, MAT.gold()), 0, 0.45, 0.4), at(cyl(0.15, 0.15, 0.04, MAT.glass(0x7fd0ff, 0.7), 32), 0, 0.45, 0.42, PI / 2));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * PI * 2;
    const fin = extrude(poly([[0, 0], [0.45, -0.3], [0.45, -0.55], [0, -0.35]]), 0.06, 0.03, MAT.candy(0xff3b4e));
    g.add(at(fin, Math.cos(a) * 0.45, -0.45, Math.sin(a) * 0.45, 0, -a, 0));
  }
  g.add(at(fire(), 0, -1.15, 0, PI, 0, 0, 0.45));
  g.rotation.z = -0.6;
  return grp(g);
}

export function trashBin() {
  const m = MAT.metal(0xa9b1c0);
  return grp(lathe([[0.62, 0.8], [0.52, -0.85], [0, -0.85]], m), at(cyl(0.72, 0.72, 0.12, m, 48), 0, 0.92), at(torus(0.18, 0.05, m, PI), 0, 1.0), ...[-0.25, 0, 0.25].map((x) => at(rb(0.06, 1.3, 0.06, 0.02, MAT.metal(0x8a93a3), 1), x, 0, 0.6)));
}

export function tomato() {
  const t = sph(1, MAT.candy(0xff3b30), 64);
  t.scale.set(1, 0.85, 1);
  const g = grp(t);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * PI * 2;
    g.add(at(cone(0.12, 0.55, MAT.candy(0x2fae4f), 12), Math.cos(a) * 0.25, 0.84, Math.sin(a) * 0.25, Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2));
  }
  g.add(at(cyl(0.05, 0.06, 0.3, MAT.candy(0x2fae4f), 12), 0, 0.98));
  return g;
}

export function eyesPair() {
  const g = new Group();
  for (const s of [-1, 1]) {
    const w = sph(0.6, MAT.candy(0xffffff), 48);
    w.scale.set(0.85, 1.05, 0.8);
    g.add(at(w, s * 0.55, 0), at(sph(0.26, MAT.candy(0x3a6bff), 32), s * 0.55 + 0.08, -0.05, 0.4), at(sph(0.14, MAT.ink(), 24), s * 0.55 + 0.1, -0.05, 0.56), at(sph(0.05, new THREE.MeshBasicMaterial({ color: 0xffffff }), 12), s * 0.55 + 0.16, 0.02, 0.66));
  }
  return g;
}

export function lightbulb() {
  return grp(
    at(sph(0.8, MAT.glass(0xfff4c8, 0.9), 64), 0, 0.35),
    at(new Mesh(new THREE.TorusKnotGeometry(0.16, 0.03, 64, 8, 2, 5), MAT.glow(0xffb02e, 2.2)), 0, 0.3),
    at(cyl(0.38, 0.32, 0.5, MAT.silver(), 32), 0, -0.6),
    at(torus(0.37, 0.04, MAT.silver()), 0, -0.48, 0, PI / 2),
    at(torus(0.35, 0.04, MAT.silver()), 0, -0.64, 0, PI / 2),
    at(sph(0.16, MAT.ink(), 16), 0, -0.88),
  );
}

export function ticket() {
  const s = new THREE.Shape();
  s.moveTo(-1.2, -0.6);
  s.lineTo(1.2, -0.6);
  s.lineTo(1.2, -0.18);
  s.absarc(1.2, 0, 0.18, -PI / 2, PI / 2, true);
  s.lineTo(1.2, 0.6);
  s.lineTo(-1.2, 0.6);
  s.lineTo(-1.2, 0.18);
  s.absarc(-1.2, 0, 0.18, PI / 2, -PI / 2, true);
  s.closePath();
  return grp(extrude(s, 0.12, 0.04, MAT.candy(0xff4f9a)), at(label('ADMIT 1', 2.0, { fill: '#fff', font: '900 52px Fredoka, Arial' }), 0, 0, 0.1));
}

export function stadium() {
  return grp(lathe([[1.0, -0.3], [1.35, 0.35], [1.25, 0.38], [0.92, -0.18], [0, -0.18]], MAT.candy(0xe9ecf5)), at(cyl(0.9, 0.9, 0.06, MAT.matte(0x3fae4f), 64), 0, -0.2), at(torus(1.3, 0.05, MAT.candy(0xff3b4e)), 0, 0.36, 0, PI / 2));
}

export function hourglass() {
  const w = MAT.wood(0x9b5a2c);
  const g = grp(at(cyl(0.75, 0.75, 0.16, w, 32), 0, 1.05), at(cyl(0.75, 0.75, 0.16, w, 32), 0, -1.05));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * PI * 2;
    g.add(at(cyl(0.05, 0.05, 2.0, w, 8), Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6));
  }
  g.add(lathe([[0, 0.95], [0.45, 0.85], [0.48, 0.4], [0.08, 0.02], [0.48, -0.4], [0.45, -0.85], [0, -0.95]], MAT.glass(0xe8f4ff, 0.95)));
  g.add(at(cone(0.38, 0.4, MAT.candy(0xffc93a), 32), 0, -0.68), at(cone(0.25, 0.25, MAT.candy(0xffc93a), 32), 0, 0.4, 0, PI));
  return g;
}

export function fireworks() {
  const g = new Group();
  const cols = [0xff4f9a, 0xffc93a, 0x3fd2ff, 0x7c5cff, 0x3ddc84];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * PI * 2;
    g.add(at(capsule(0.04, 0.45, MAT.glow(cols[i % 5], 1.3)), Math.cos(a) * 0.75, Math.sin(a) * 0.75, 0, 0, 0, a - PI / 2));
    g.add(at(sph(0.08, MAT.glow(cols[(i + 2) % 5], 1.6), 12), Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0));
  }
  g.add(sph(0.18, MAT.glow(0xfff4c8, 2.5), 16));
  return g;
}

export function robot() {
  const g = grp(rb(1.4, 1.15, 1.0, 0.28, MAT.silver()), at(rb(1.1, 0.55, 0.1, 0.2, MAT.ink()), 0, 0.05, 0.5));
  for (const s of [-1, 1]) g.add(at(sph(0.12, MAT.glow(0x3fd2ff, 2), 16), s * 0.25, 0.08, 0.56), at(cyl(0.16, 0.16, 0.2, MAT.candy(0xff3b4e), 24), s * 0.78, 0, 0, 0, 0, PI / 2));
  g.add(at(cyl(0.04, 0.04, 0.45, MAT.silver(), 12), 0, 0.8), at(sph(0.11, MAT.candy(0xff3b4e), 16), 0, 1.05));
  return g;
}

export function whistle() {
  const m = MAT.silver();
  return grp(at(cyl(0.55, 0.55, 0.7, m, 48), 0, 0, 0, PI / 2), at(rb(0.9, 0.35, 0.5, 0.1, m, 3), 0.75, 0.18), at(torus(0.18, 0.05, MAT.candy(0xff3b4e)), -0.55, 0.45, 0), at(cyl(0.2, 0.2, 0.05, MAT.ink(), 24), 0.1, 0.56, 0));
}

export function trumpet() {
  const gold = MAT.gold();
  return grp(lathe([[0.06, -1.2], [0.08, -0.2], [0.18, 0.5], [0.45, 0.95], [0.5, 1.0], [0.44, 1.0], [0.06, -0.2]], gold), ...[-0.55, -0.3, -0.05].map((y) => at(cyl(0.07, 0.07, 0.4, gold, 16), 0.16, y, 0, 0, 0, PI / 2)), at(torus(0.3, 0.04, gold, PI), 0.18, -0.75, 0, 0, 0, -PI / 2)).rotateZ(-0.9);
}

export function airhorn() {
  return grp(cyl(0.42, 0.42, 1.1, MAT.candy(0xff3b4e), 48), at(cyl(0.44, 0.44, 0.1, MAT.silver(), 48), 0, 0.58), at(lathe([[0.08, 0], [0.12, 0.4], [0.45, 1.0], [0.4, 1.02], [0.06, 0.3]], MAT.candy(0xf4f5fa)), 0.0, 0.6, 0, 0, 0, -0.5)).rotateZ(0.25);
}

// ================================================================ registry: every art key the app uses
const AV = [
  { color: 0x5fb4ff, hat: 'cap' },
  { color: 0xff8fb8, hat: 'bow' },
  { color: 0xffb35c, hat: 'beanie' },
  { color: 0x8b6bff, hat: 'phones' },
  { color: 0x3ddc84, hat: 'grad' },
  { color: 0xff6b6b, hat: 'none', face: 'wink' },
  { color: 0x52d6c4, hat: 'cap' },
  { color: 0xffd34d, hat: 'none', face: 'cool' },
  { color: 0xb98cff, hat: 'beanie' },
  { color: 0xff9f43, hat: 'phones' },
  { color: 0x7fe0ff, hat: 'bow' },
  { color: 0xffffff, hat: 'grad' },
];

export const PROPS = {
  // modules
  'crush-board': envelope,
  confessions: ghost,
  'rizz-meter': heartArrow,
  polls: ballotBox,
  aura: sparkles,
  admirer: () => grp(blob({ color: 0xff8fb8, face: 'shh' }), at(heart(0xff2d55), 0.95, 0.85, 0.3, 0, 0, 0.3, 0.3)),
  bracket: trophy,
  league: () => medal('1', 'gold'),
  'hype-poster': () => megaphone(0xf2f4f8, 0x2b62ff),
  'team-wheel': spinWheel,
  pens: () => goal(true, false),
  bingo: bingoCard,
  rivalry: swords,
  wso: () => crown('gold'),
  handicap: prohibited,
  'wooden-spoon': spoon,
  imposter: detective,
  'who-in-class': gossip,
  'five-second': stopwatch,
  'truth-dare': heartFire,
  never: () => hand(0xffc48a),
  bomb,
  wyr: signpost,
  charades: masks,
  taboo: () => grp(speechBubble('', 0xffffff), at(prohibited(), 0, 0, 0.25, 0, 0, 0, 0.45)),
  bluff: newspaper,
  wavelength: crystalBall,
  victim: target,
  tug: rope,
  'keeper-duel': () => hand(0x2fd65a, true),
  crossbar: () => goal(true, true),
  'f1-lights': chequeredFlag,
  stroop: palette,
  flappy: wingedBall,
  simon: simonPad,
  'tap-battle': bolt,
  rps: scissors,
  hilo: cards,
  math: abacus,
  dice,
  career: foldedMap,
  fees: money,
  sbs: clipboard,
  'blind-rank': rankCards,
  predictor: calendar,
  commentary: microphone,
  delusion: clown,
  banter: scales,
  'here-we-go': () => megaphone(0xff3b4e, 0xffc93a),
  certificate: rosette,
  'lecturer-excuse': scroll,
  'roast-name': () => explosion(0xff3b30, 0xffc21a),
  songs: headphones,
  beats: drum,
  'song-drop': vinyl,
  memes: laughMascot,
  gifs: clapper,
  'meme-maker': framedPicture,
  // UI
  games: () => gamepad(0x7c5cff),
  ranking: trophy,
  party: partyPopper,
  settings: gear,
  home: house,
  bell,
  cap: gradCap,
  heart: () => heart(0xff2d55),
  'two-hearts': () => grp(at(heart(0xff2d55), -0.35, -0.2, 0, 0, 0, 0.2, 0.75), at(heart(0xff6fb5), 0.55, 0.45, 0.3, 0, 0, -0.25, 0.5)),
  'sparkling-heart': () => grp(heart(0xff2d55), at(sparkles(), 0.85, 0.75, 0.4, 0, 0, 0, 0.35)),
  fire,
  skull,
  'billed-cap': () => baseballCap(0x2b62ff),
  laugh: laughMascot,
  ball: soccerBall,
  notes: musicNotes,
  confetti: partyPopper,
  joystick,
  speaker,
  crown: () => crown('gold'),
  medal1: () => medal('1', 'gold'),
  medal2: () => medal('2', 'silver', [0x7c5cff, 0x3fd2ff]),
  medal3: () => medal('3', 'bronze', [0xff8a1f, 0x3ddc84]),
  star: () => star(),
  rocket,
  'thumbs-up': () => thumb(true),
  'thumbs-down': () => thumb(false),
  trash: trashBin,
  tomato,
  eyes: eyesPair,
  lightbulb,
  ticket,
  stadium,
  robot,
  speech: () => speechBubble('…'),
  hourglass,
  fireworks,
  'rps-rock': rock,
  'rps-paper': paperSheet,
  'rps-scissors': scissors,
  // soundboard
  's-airhorn': airhorn,
  's-goal': soccerBall,
  's-boo': () => thumb(false),
  's-whistle': whistle,
  's-trombone': trumpet,
  's-rimshot': drum,
  's-boom': () => explosion(0xff4f9a, 0xffc93a),
  's-heartbeat': () => heart(0xff4f6a),
  // mascot avatars
  ...Object.fromEntries(AV.map((o, i) => [`av-${i + 1}`, () => blob(o)])),
};
