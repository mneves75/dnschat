// DNS Chat soundtrack: F major, 96 BPM (beat 0.625 s). Effects share the key and the room.
// Cues match index.html. Output: work/mix.wav (48 kHz stereo s16).
import fs from "node:fs";

const SR = 48000,
  DUR = 23.0,
  N = Math.ceil(SR * DUR);
const TAU = Math.PI * 2;
const m2f = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 1234567;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const noise = () => rnd() * 2 - 1;

const bus = () => [new Float32Array(N), new Float32Array(N)];
const B = { drums: bus(), music: bus(), sfx: bus(), verb: bus() };

// Coloca um sinal mono no barramento, com pan de potência igual e envio de reverb.
function place(dst, t0, sig, gain = 1, pan = 0, send = 0) {
  const i0 = Math.round(t0 * SR),
    a = ((pan + 1) * Math.PI) / 4;
  const gl = Math.cos(a) * gain * 1.414,
    gr = Math.sin(a) * gain * 1.414;
  for (let i = 0; i < sig.length; i++) {
    const j = i0 + i;
    if (j < 0 || j >= N) continue;
    dst[0][j] += sig[i] * gl;
    dst[1][j] += sig[i] * gr;
    if (send) {
      B.verb[0][j] += sig[i] * gl * send;
      B.verb[1][j] += sig[i] * gr * send;
    }
  }
}

// Biquad RBJ com corte variável por amostra.
function biquad(sig, type, fc, q = 0.707) {
  const out = new Float32Array(sig.length);
  let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
  for (let i = 0; i < sig.length; i++) {
    const f = Math.min(
      SR * 0.45,
      Math.max(20, typeof fc === "function" ? fc(i / SR) : fc),
    );
    const w = (TAU * f) / SR,
      cs = Math.cos(w),
      al = Math.sin(w) / (2 * q);
    let b0, b1, b2;
    const a0 = 1 + al,
      a1 = -2 * cs,
      a2 = 1 - al;
    if (type === "lp") {
      b0 = (1 - cs) / 2;
      b1 = 1 - cs;
      b2 = b0;
    } else if (type === "hp") {
      b0 = (1 + cs) / 2;
      b1 = -(1 + cs);
      b2 = b0;
    } else {
      b0 = al;
      b1 = 0;
      b2 = -al;
    }
    const x = sig[i],
      y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    out[i] = y;
  }
  return out;
}
const gen = (dur, fn) => {
  const n = Math.round(dur * SR),
    o = new Float32Array(n);
  for (let i = 0; i < n; i++) o[i] = fn(i / SR, i);
  return o;
};
const saw = (p) => 2 * (p - Math.floor(p + 0.5));

// ---------- instrumentos ----------
function kick(t0, g = 1, muffled = false) {
  let ph = 0;
  let s = gen(0.5, (t) => {
    const f = 42 + 120 * Math.exp(-t * 30);
    ph += f / SR;
    const a = Math.min(1, t / 0.002) * Math.exp(-t * 6.5);
    return Math.tanh(1.8 * Math.sin(TAU * ph) * a);
  });
  const click = biquad(
    gen(0.006, (t) => noise() * (1 - t / 0.006)),
    "hp",
    2500,
  );
  for (let i = 0; i < click.length; i++) s[i] += click[i] * 0.35;
  if (muffled) s = biquad(s, "lp", 180);
  place(B.drums, t0, s, 0.9 * g);
}
function hat(t0, g = 1, open = false, pan = 0.2) {
  const s = gen(
    open ? 0.3 : 0.06,
    (t) => noise() * Math.exp(-t / (open ? 0.09 : 0.018)),
  );
  place(
    B.drums,
    t0,
    biquad(biquad(s, "hp", 7500), "hp", 7500),
    0.28 * g,
    pan,
    0.08,
  );
}
function boom(t0, g = 1) {
  let ph = 0;
  const s = gen(1.6, (t) => {
    ph += (34 + 30 * Math.exp(-t * 5)) / SR;
    return Math.sin(TAU * ph) * Math.exp(-t * 2.4) * Math.min(1, t / 0.004);
  });
  place(B.drums, t0, s, 0.75 * g);
}
// Supersaw com filtro envelopado (stabs e pad)
function bass(t0, m, dur = 0.22, g = 1) {
  const f = m2f(m);
  let p1 = 0,
    p2 = 0;
  const s = gen(dur, (t) => {
    p1 += f / SR;
    p2 += (f * 1.005) / SR;
    const e =
      Math.min(1, t / 0.003) *
      Math.exp(-t / 0.16) *
      (t > dur - 0.02 ? (dur - t) / 0.02 : 1);
    return (saw(p1) * 0.6 + (p2 % 1 < 0.5 ? 0.5 : -0.5) * 0.4) * e;
  });
  const fl = biquad(s, "lp", (t) => 250 + 900 * Math.exp(-t / 0.05), 1.2);
  const sub = gen(
    dur,
    (t) =>
      Math.sin(TAU * f * t) *
      Math.min(1, t / 0.004) *
      Math.exp(-t / 0.2) *
      (t > dur - 0.02 ? (dur - t) / 0.02 : 1),
  );
  for (let i = 0; i < fl.length; i++)
    fl[i] = Math.tanh(1.4 * (fl[i] + sub[i] * 0.8));
  place(B.music, t0, fl, 0.42 * g);
}
function pluck(t0, m, g = 1, pan = 0, send = 0.35, dec = 0.16) {
  const f = m2f(m);
  const s = gen(dec * 5, (t) => {
    const e = Math.min(1, t / 0.002) * Math.exp(-t / dec);
    return (
      (Math.sin(TAU * f * t) +
        0.35 * Math.sin(TAU * 2 * f * t) * Math.exp(-t / 0.04) +
        0.12 * saw(f * t)) *
      e
    );
  });
  place(B.sfx, t0, s, 0.2 * g, pan, send);
}
function pad(t0, notes, dur, g = 1, cutFrom = 600, cutTo = 2400) {
  for (const m of notes)
    for (let v = 0; v < 5; v++) {
      const f = m2f(m + (v - 2) * 0.09);
      let ph = rnd();
      const s = gen(dur, (t) => {
        ph += f / SR;
        const e =
          Math.min(1, t / 0.5) *
          (t > dur - 0.4 ? Math.max(0, (dur - t) / 0.4) : 1);
        return saw(ph) * e;
      });
      const fl = biquad(
        s,
        "lp",
        (t) => cutFrom + (cutTo - cutFrom) * Math.min(1, t / dur),
        0.7,
      );
      place(
        B.music,
        t0,
        fl,
        (0.085 * g) / Math.sqrt(5 * notes.length),
        (v - 2) * 0.35,
        0.45,
      );
    }
}
function riser(t0, t1, g = 1) {
  const dur = t1 - t0;
  let ph = 0;
  const s = gen(dur, (t) => {
    const p = t / dur;
    ph += (180 + 900 * p * p) / SR;
    return (noise() * 0.8 + Math.sin(TAU * ph) * 0.25) * Math.pow(p, 2.2);
  });
  place(
    B.sfx,
    t0,
    biquad(s, "bp", (t) => 400 + 7000 * Math.pow(t / dur, 2), 1.1),
    0.5 * g,
    0,
    0.25,
  );
}
function swell(t0, t1, g = 1) {
  const dur = t1 - t0;
  const s = gen(dur, (t) => noise() * Math.pow(t / dur, 3));
  place(B.sfx, t0, biquad(s, "hp", 5000), 0.35 * g, 0, 0.1);
}
function whoosh(tc, g = 1, dir = 1) {
  const dur = 0.42,
    t0 = tc - 0.3;
  const s = gen(dur, (t) => {
    const p = t / dur;
    return noise() * Math.sin(Math.PI * Math.pow(p, 0.7)) ** 2;
  });
  const f = biquad(
    s,
    "bp",
    (t) => {
      const p = t / dur;
      return 300 + 3200 * Math.sin(Math.PI * Math.pow(p, 0.8));
    },
    1.4,
  );
  // pan varre de um lado ao outro
  const i0 = Math.round(t0 * SR);
  for (let i = 0; i < f.length; i++) {
    const j = i0 + i;
    if (j < 0 || j >= N) continue;
    const pan = dir * ((i / f.length) * 2 - 1) * 0.8,
      a = ((pan + 1) * Math.PI) / 4;
    B.sfx[0][j] += f[i] * Math.cos(a) * 0.55 * g;
    B.sfx[1][j] += f[i] * Math.sin(a) * 0.55 * g;
    B.verb[0][j] += f[i] * 0.08 * g;
    B.verb[1][j] += f[i] * 0.08 * g;
  }
}
function tick(t0, g = 1, fq = 3200, pan = 0) {
  const s = gen(
    0.02,
    (t) =>
      (noise() * 0.6 + Math.sin(TAU * fq * t) * 0.6) * Math.exp(-t / 0.004),
  );
  place(B.sfx, t0, biquad(s, "hp", 1800), 0.16 * g, pan, 0.04);
}

// Electric piano (2-op FM) and a soft bell, both warm and short.
function ep(t0, notes, dur, g = 1, pan = 0, send = 0.3) {
  for (const [k, m] of notes.entries()) {
    const f = m2f(m);
    const p = pan + (k / Math.max(1, notes.length - 1) - 0.5) * 0.5;
    const s = gen(dur + 0.6, (t) => {
      const idx = 1.6 * Math.exp(-t / 0.35);
      const e =
        Math.min(1, t / 0.004) *
        Math.exp(-t / 1.1) *
        (t > dur ? Math.max(0, 1 - (t - dur) / 0.6) : 1);
      return (
        (Math.sin(TAU * f * t + idx * Math.sin(TAU * f * t)) +
          0.15 * Math.sin(TAU * 2 * f * t) * Math.exp(-t / 0.2)) *
        e
      );
    });
    place(
      B.music,
      t0,
      biquad(s, "lp", 3200),
      (0.11 * g) / Math.sqrt(notes.length),
      p,
      send,
    );
  }
}
function bell(t0, m, g = 1, pan = 0, send = 0.45) {
  const f = m2f(m);
  const s = gen(
    1.6,
    (t) =>
      (Math.sin(TAU * f * t) * Math.exp(-t / 0.55) +
        0.25 * Math.sin(TAU * 2.76 * f * t) * Math.exp(-t / 0.18) +
        0.1 * Math.sin(TAU * 5.4 * f * t) * Math.exp(-t / 0.07)) *
      Math.min(1, t / 0.002),
  );
  place(B.sfx, t0, s, 0.13 * g, pan, send);
}
function thock(t0, g = 1) {
  let ph = 0;
  const s = gen(0.12, (t) => {
    ph += (170 + 90 * Math.exp(-t * 60)) / SR;
    return (
      Math.sin(TAU * ph) * Math.exp(-t * 38) +
      noise() * 0.25 * Math.exp(-t * 120)
    );
  });
  place(B.sfx, t0, biquad(s, "lp", 2400), 0.3 * g, 0, 0.1);
}
function rim(t0, g = 1) {
  const s = gen(
    0.08,
    (t) => (Math.sin(TAU * 1650 * t) * 0.6 + noise() * 0.5) * Math.exp(-t * 70),
  );
  place(B.drums, t0, biquad(s, "bp", 1800, 1.2), 0.32 * g, -0.12, 0.2);
}

// ---------- arrangement ----------
const BEAT = 0.625,
  DROP = 5.625,
  END_GROOVE = 20.625;
const kicks = [];
const K = (t, g) => {
  kick(t, 0.7 * g, false);
  kicks.push(t);
};

// Hook: quiet EP, key clicks, Enter, one pluck per haiku line.
ep(0.0, [53, 57, 60, 64], 2.4, 1.35);
ep(2.5, [50, 57, 60, 65], 2.9, 1.3);
bass(0.0, 41, 2.4, 0.3);
bass(2.5, 38, 2.9, 0.3);
for (let k = 0; k < 30; k++)
  tick(
    0.45 + k * (0.97 / 30),
    0.32 + 0.1 * rnd(),
    2400 + (k % 4) * 180,
    k % 2 ? 0.12 : -0.12,
  );
thock(1.5, 1);
tick(1.5, 0.5, 2000);
[81, 84, 88].forEach((m, i) =>
  pluck(1.75 + i * 0.3, m, 0.55, (i - 1) * 0.3, 0.45, 0.2),
);
riser(4.3, DROP - 0.05, 0.35);
swell(4.9, DROP - 0.05, 0.4);

// Groove: 5.625 to 20.625.
const CH = [
  { t: 5.625, notes: [50, 53, 57, 60, 64], root: 38 },
  { t: 8.125, notes: [46, 50, 53, 57], root: 34 },
  { t: 10.625, notes: [53, 57, 60, 64], root: 41 },
  { t: 13.125, notes: [48, 53, 55], root: 36, sus: true },
  { t: 15.625, notes: [50, 53, 57, 60, 64], root: 38 },
  { t: 18.125, notes: [46, 50, 53, 57], root: 34 },
];
for (const c of CH) {
  ep(c.t, c.notes, 1.0, 1.0);
  ep(c.t + 1.5 * BEAT, c.notes, 0.5, 0.6);
  if (c.sus) ep(c.t + 2 * BEAT, [48, 52, 55], 1.1, 0.8);
  else ep(c.t + 2.5 * BEAT, c.notes, 0.6, 0.55);
  bass(c.t, c.root, 0.9, 0.8);
  bass(c.t + 2.5 * BEAT, c.root + 7, 0.3, 0.6);
  bass(c.t + 3 * BEAT, c.root + (c.sus ? 0 : 12), 0.5, 0.55);
}
for (let t = DROP; t < END_GROOVE - 0.01; t += BEAT) {
  const b = Math.round((t - DROP) / BEAT) % 4;
  if (b === 0 || b === 2) K(t, 1);
  if (b === 1 || b === 3) rim(t, 0.9);
  hat(t + BEAT / 2, 0.55, false, 0.22);
  hat(t, 0.25, false, -0.22);
}
for (const t of [5.625, 8.75, 14.375, 18.75]) whoosh(t, 0.32, t > 10 ? -1 : 1);

// Reveal: icon lands.
bell(5.9, 89, 0.8, 0.1);
// Demo: tap, typing, send, answer.
tick(9.4, 0.5, 2000, 0.4);
for (let k = 0; k < 12; k++)
  tick(9.6 + k * (0.68 / 12), 0.3 + 0.08 * rnd(), 2600 + (k % 3) * 200, 0.35);
tick(10.36, 0.5, 2000, 0.4);
pluck(10.42, 84, 0.45, 0.35, 0.35, 0.09);
pluck(10.5, 89, 0.5, 0.35, 0.35, 0.12);
bell(11.6, 81, 0.75, 0.3);
bell(11.63, 88, 0.55, 0.3);
// Path: one step per row, the pulse, the answer.
[72, 76, 79].forEach((m, i) =>
  pluck(14.62 + i * 0.4, m, 0.45, -0.3, 0.35, 0.14),
);
[15.85, 16.0, 16.15].forEach((t, i) =>
  tick(t, 0.35, 2200 + i * 150, -0.3 + i * 0.1),
);
pluck(16.34, 84, 0.25, -0.3, 0.3, 0.05);
pluck(16.46, 88, 0.25, -0.3, 0.3, 0.05);
pluck(16.58, 91, 0.25, -0.3, 0.3, 0.05);
bell(16.72, 84, 0.8, -0.3);
bell(16.75, 91, 0.5, -0.3);
// Punchline: three steps up, then the sign-off chord.
[77, 81, 84].forEach((m, i) =>
  pluck(18.8 + i * 0.35, m, 0.6, -0.2 + i * 0.2, 0.4, 0.18),
);
K(END_GROOVE, 1.1);
boom(END_GROOVE, 0.35);
ep(END_GROOVE, [41, 53, 57, 60, 64, 67], 2.0, 1.25, 0, 0.45);
pad(END_GROOVE - 0.1, [53, 60, 64, 67], 2.4, 0.7, 900, 2200);
bass(END_GROOVE, 29, 1.8, 0.6);
bell(20.62, 89, 0.7, 0.15);
bell(20.66, 96, 0.35, 0.15);
// ---------- sidechain no barramento musical ----------
const sc = new Float32Array(N).fill(1);
for (const t of kicks) {
  const i0 = Math.round(t * SR);
  for (let i = 0; i < SR * 0.3 && i0 + i < N; i++) {
    const x = i / SR;
    const g =
      1 - 0.35 * (x < 0.004 ? x / 0.004 : Math.exp(-(x - 0.004) / 0.08));
    sc[i0 + i] = Math.min(sc[i0 + i], g);
  }
}
for (let c = 0; c < 2; c++) for (let i = 0; i < N; i++) B.music[c][i] *= sc[i];

// ---------- reverb (Freeverb) ----------
function freeverb(inp, spread) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => ({
    b: new Float32Array(Math.round(((d + spread) * SR) / 44100)),
    i: 0,
    f: 0,
  }));
  const aps = [556, 441, 341, 225].map((d) => ({
    b: new Float32Array(Math.round(((d + spread) * SR) / 44100)),
    i: 0,
  }));
  const out = new Float32Array(N),
    fb = 0.86,
    damp = 0.25;
  for (let n = 0; n < N; n++) {
    const x = inp[n] * 0.015;
    let y = 0;
    for (const c of combs) {
      const o = c.b[c.i];
      c.f = o * (1 - damp) + c.f * damp;
      c.b[c.i] = x + c.f * fb;
      c.i = (c.i + 1) % c.b.length;
      y += o;
    }
    for (const a of aps) {
      const bo = a.b[a.i];
      const o = -y + bo;
      a.b[a.i] = y + bo * 0.5;
      a.i = (a.i + 1) % a.b.length;
      y = o;
    }
    out[n] = y;
  }
  return out;
}
const vL = freeverb(B.verb[0], 0),
  vR = freeverb(B.verb[1], 23);

// diagnóstico por barramento
{
  const st = (arr) => {
    let pk = 0,
      ss = 0;
    for (let i = 0; i < N; i++) {
      const v = Math.abs(arr[i]);
      pk = Math.max(pk, v);
      ss += v * v;
    }
    return `pk ${pk.toFixed(2)} rms ${Math.sqrt(ss / N).toFixed(3)}`;
  };
  console.log(
    "drums",
    st(B.drums[0]),
    "| music",
    st(B.music[0]),
    "| sfx",
    st(B.sfx[0]),
    "| verb",
    st(vL),
  );
}
// ---------- master ----------
const L = new Float32Array(N),
  R = new Float32Array(N);
let prePk = 0,
  over = 0;
const MG = Number(process.env.MG ?? 1);
// Short dry gap before the drop; the reverb tail keeps going.
const gap = (t) => (t >= DROP - 0.06 && t < DROP ? 0.1 : 1);
for (let i = 0; i < N; i++) {
  const t = i / SR,
    gp = gap(t);
  let l =
    (B.drums[0][i] * 0.4 + B.music[0][i] * 0.95 + B.sfx[0][i] * 0.7) * gp +
    vL[i] * 2.2;
  let r =
    (B.drums[1][i] * 0.4 + B.music[1][i] * 0.95 + B.sfx[1][i] * 0.7) * gp +
    vR[i] * 2.2;
  const fade = t > DUR - 0.7 ? Math.max(0, (DUR - t) / 0.7) : 1,
    fin = Math.min(1, t / 0.004);
  prePk = Math.max(prePk, Math.abs(l), Math.abs(r));
  if (Math.abs(l) > 0.8 || Math.abs(r) > 0.8) over++;
  L[i] = (Math.tanh(l * MG) * fade * fin) / MG;
  R[i] = (Math.tanh(r * MG) * fade * fin) / MG;
}
// Remove DC
for (const ch of [L, R]) {
  let p = 0,
    q = 0;
  for (let i = 0; i < N; i++) {
    const y = ch[i] - p + 0.9995 * q;
    p = ch[i];
    q = y;
    ch[i] = y;
  }
}
let peak = 0;
for (let i = 0; i < N; i++)
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const norm = 0.89 / peak;
const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  pcm.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767),
    i * 4,
  );
  pcm.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767),
    i * 4 + 2,
  );
}
const hdr = Buffer.alloc(44);
hdr.write("RIFF", 0);
hdr.writeUInt32LE(36 + pcm.length, 4);
hdr.write("WAVE", 8);
hdr.write("fmt ", 12);
hdr.writeUInt32LE(16, 16);
hdr.writeUInt16LE(1, 20);
hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(SR, 24);
hdr.writeUInt32LE(SR * 4, 28);
hdr.writeUInt16LE(4, 32);
hdr.writeUInt16LE(16, 34);
hdr.write("data", 36);
hdr.writeUInt32LE(pcm.length, 40);
fs.writeFileSync(
  new URL("./mix.wav", import.meta.url),
  Buffer.concat([hdr, pcm]),
);
console.log(
  "mix.wav ok prePeak",
  prePk.toFixed(3),
  "samples>0.8",
  over,
  "peak",
  peak.toFixed(3),
  "kicks",
  kicks.length,
);
