// Procedurally synthesizes the 8 soundboard effects into 16-bit mono WAV files.
// React Native has no Web Audio API, so we do the oscillator / noise / envelope
// synthesis here once and bundle the results. Run: node scripts/gen-sounds.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 22050;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

// Deterministic noise so the output is reproducible.
let seed = 1337;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;

const buf = (sec) => new Float32Array(Math.floor(sec * SR));
const saw = (ph) => 2 * (ph - Math.floor(ph + 0.5));
const square = (ph) => (ph % 1 < 0.5 ? 1 : -1);

function lowpass(x, cutoff) {
  const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
  let y = 0;
  return x.map((v) => (y += a * (v - y)));
}
function highpass(x, cutoff) {
  const lp = lowpass(x, cutoff);
  return x.map((v, i) => v - lp[i]);
}
function adsr(t, dur, a, r) {
  if (t < a) return t / a;
  if (t > dur - r) return Math.max(0, (dur - t) / r);
  return 1;
}
function mixInto(target, src, offsetSec, gain = 1) {
  const off = Math.floor(offsetSec * SR);
  for (let i = 0; i < src.length && off + i < target.length; i++) target[off + i] += src[i] * gain;
}
function normalize(x, peak = 0.9) {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  return m === 0 ? x : x.map((v) => (v / m) * peak);
}

// ---------- Instruments ----------
function hornBlast(dur) {
  const x = buf(dur);
  const freqs = [349, 440, 523, 352, 437];
  const ph = freqs.map(() => rnd());
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    let v = 0;
    freqs.forEach((f, k) => {
      ph[k] += (f * (1 + 0.004 * Math.sin(2 * Math.PI * 6 * t))) / SR;
      v += saw(ph[k]);
    });
    x[i] = Math.tanh(v * 0.9) * adsr(t, dur, 0.015, 0.05);
  }
  return lowpass(x, 3200);
}

function airhorn() {
  const out = buf(1.6);
  mixInto(out, hornBlast(0.18), 0);
  mixInto(out, hornBlast(0.18), 0.24);
  mixInto(out, hornBlast(1.05), 0.5);
  return normalize(out);
}

function crowd(dur, swell, cutoff) {
  const x = buf(dur);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / swell) * adsr(t, dur, 0.01, 0.9);
    const flutter = 0.75 + 0.25 * Math.sin(2 * Math.PI * (3 + 2 * Math.sin(t)) * t);
    x[i] = noise() * env * flutter;
  }
  return highpass(lowpass(lowpass(x, cutoff), cutoff * 1.4), 180);
}

function voices(dur, base, count, vowelCut, glide) {
  const x = buf(dur);
  const ph = Array.from({ length: count }, () => rnd());
  const det = Array.from({ length: count }, () => 0.85 + rnd() * 0.35);
  const vib = Array.from({ length: count }, () => 4 + rnd() * 3);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    let v = 0;
    for (let k = 0; k < count; k++) {
      const f = base * det[k] * (1 + glide * (t / dur)) * (1 + 0.02 * Math.sin(2 * Math.PI * vib[k] * t));
      ph[k] += f / SR;
      v += saw(ph[k]);
    }
    x[i] = (v / count) * adsr(t, dur, 0.25, 0.6);
  }
  return lowpass(lowpass(x, vowelCut), vowelCut);
}

function goalRoar() {
  const out = buf(3.2);
  mixInto(out, crowd(3.2, 0.35, 2400), 0, 1);
  mixInto(out, voices(3.0, 260, 14, 1400, 0.12), 0.05, 0.9);
  return normalize(out);
}

function crowdBoo() {
  const out = buf(2.6);
  mixInto(out, crowd(2.6, 0.5, 900), 0, 0.55);
  mixInto(out, voices(2.5, 118, 16, 520, -0.12), 0, 1.4);
  return normalize(out);
}

function whistleTone(dur) {
  const x = buf(dur);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const trill = 0.5 + 0.5 * Math.sign(Math.sin(2 * Math.PI * 34 * t));
    const f = 2750 + 180 * trill;
    ph += f / SR;
    x[i] = (Math.sin(2 * Math.PI * ph) * (0.75 + 0.25 * trill) + noise() * 0.08) * adsr(t, dur, 0.01, 0.04);
  }
  return x;
}

function whistle() {
  const out = buf(1.5);
  mixInto(out, whistleTone(0.16), 0);
  mixInto(out, whistleTone(0.16), 0.24);
  mixInto(out, whistleTone(0.85), 0.52);
  return normalize(out, 0.8);
}

function tromboneNote(freq, dur, wobble) {
  const x = buf(dur);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const vib = wobble ? 1 + 0.03 * Math.sin(2 * Math.PI * 5.5 * t) * Math.min(1, t / 0.3) : 1;
    const bend = 1 - 0.015 * (t / dur);
    ph += (freq * vib * bend) / SR;
    x[i] = (saw(ph) * 0.7 + square(ph) * 0.3) * adsr(t, dur, 0.04, 0.12);
  }
  return lowpass(lowpass(x, 1100), 1500);
}

function sadTrombone() {
  const out = buf(2.9);
  const notes = [
    [293.66, 0.42],
    [277.18, 0.42],
    [261.63, 0.42],
    [246.94, 1.5],
  ];
  let t = 0;
  notes.forEach(([f, d], idx) => {
    mixInto(out, tromboneNote(f, d, idx === 3), t);
    t += d + 0.02;
  });
  return normalize(out);
}

function drum(f0, f1, dur, noiseAmt) {
  const x = buf(dur);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const f = f1 + (f0 - f1) * Math.exp(-t * 30);
    ph += f / SR;
    const env = Math.exp(-t * (4 / dur));
    x[i] = (Math.sin(2 * Math.PI * ph) + noise() * noiseAmt * Math.exp(-t * 40)) * env;
  }
  return x;
}

function cymbal(dur) {
  const x = buf(dur);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] = noise() * Math.exp(-t * 3.2);
  }
  return highpass(highpass(x, 5000), 4000);
}

function rimshot() {
  const out = buf(2.0);
  mixInto(out, drum(320, 180, 0.22, 0.35), 0);
  mixInto(out, drum(200, 110, 0.3, 0.3), 0.2);
  mixInto(out, drum(160, 60, 0.35, 0.2), 0.42, 0.9);
  mixInto(out, cymbal(1.5), 0.42, 1.1);
  return normalize(out);
}

function dramaticBoom() {
  const dur = 3.0;
  const x = buf(dur);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const f = 28 + 70 * Math.exp(-t * 3);
    ph += f / SR;
    const env = t < 0.01 ? t / 0.01 : Math.exp(-t * 1.2);
    x[i] = Math.tanh(1.8 * Math.sin(2 * Math.PI * ph)) * env;
  }
  const rumble = lowpass(lowpass(buf(dur).map((_, i) => noise() * Math.exp((-i / SR) * 1.6)), 160), 160);
  const out = buf(dur);
  mixInto(out, x, 0);
  mixInto(out, rumble, 0, 2.5);
  mixInto(out, highpass(buf(0.15).map(() => noise()), 800), 0, 0.25);
  return normalize(out, 0.95);
}

function thump(f, dur) {
  const x = buf(dur);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    ph += (f * (1 + 0.6 * Math.exp(-t * 25))) / SR;
    x[i] = Math.sin(2 * Math.PI * ph) * (t < 0.008 ? t / 0.008 : Math.exp(-t * 18));
  }
  return lowpass(x, 300);
}

function heartbeat() {
  const out = buf(2.6);
  for (let b = 0; b < 3; b++) {
    const t0 = b * 0.85;
    mixInto(out, thump(58, 0.3), t0, 1);
    mixInto(out, thump(48, 0.3), t0 + 0.22, 0.75);
  }
  return normalize(out, 0.95);
}

// ---------- WAV writer ----------
function writeWav(name, samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  writeFileSync(join(OUT, `${name}.wav`), Buffer.concat([h, data]));
  console.log(`  ${name}.wav  ${(samples.length / SR).toFixed(2)}s`);
}

mkdirSync(OUT, { recursive: true });
console.log('Synthesizing soundboard ->', OUT);
writeWav('airhorn', airhorn());
writeWav('goal', goalRoar());
writeWav('boo', crowdBoo());
writeWav('whistle', whistle());
writeWav('trombone', sadTrombone());
writeWav('rimshot', rimshot());
writeWav('boom', dramaticBoom());
writeWav('heartbeat', heartbeat());
