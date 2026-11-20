/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * scripts/build-cinematic-soundscapes.ts
 *
 * Synthesizes 10 scene-specific cinematic soundscapes for Storyverse Chapter 01:
 * - Scene 01: Mumbai Sunset Cityscape
 * - Scene 02: B.K.C. Traffic Congestion
 * - Scene 03: College Party Indoor Atmosphere
 * - Scene 04: Death's Cosmic Celestial Realm
 * - Scene 05: Fall & Birth Dramatic Convergence
 * - Scene 06: Transformation & Divine Bargain
 * - Scene 07: Hospital ICU Clinical Room Tone
 * - Scene 08: Neo-Natal Ward Flight & Chase
 * - Scene 09: Twelve-Wheeler Night Rain Climax
 * - Scene 10: Eight Years Later Morning Sunlight
 */

import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('public/assets/audio/soundscapes');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SAMPLE_RATE = 24000;
const DURATION_SEC = 12.0;
const NUM_SAMPLES = Math.floor(SAMPLE_RATE * DURATION_SEC);

function writeWav(filename: string, samples: Float32Array): string {
  const byteLength = samples.length * 2;
  const buffer = Buffer.alloc(44 + byteLength);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + byteLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(byteLength, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, buffer);
  return outPath;
}

function seededNoise(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return (s / 0xffffffff) * 2 - 1;
  };
}

function buildSeamlessLoop(renderSample: (t: number, i: number) => number): Float32Array {
  const crossN = Math.floor(SAMPLE_RATE * 0.8);
  const raw = new Float32Array(NUM_SAMPLES + crossN);
  for (let i = 0; i < raw.length; i++) {
    raw[i] = renderSample(i / SAMPLE_RATE, i);
  }
  const out = new Float32Array(NUM_SAMPLES);
  for (let i = 0; i < NUM_SAMPLES; i++) {
    if (i < crossN) {
      const alpha = i / crossN;
      out[i] = raw[i] * alpha + raw[NUM_SAMPLES + i] * (1 - alpha);
    } else {
      out[i] = raw[i];
    }
  }
  return out;
}

console.log('=== SYNTHESIZING CINEMATIC SCENE SOUNDSCAPES ===\n');

// ── Scene 01: Mumbai Sunset Cityscape ─────────────────────────────────────────
{
  const rand = seededNoise(1001);
  let lp = 0;
  const samples = buildSeamlessLoop((t) => {
    const n = rand();
    lp = lp * 0.96 + n * 0.04;
    const drone =
      Math.sin(2 * Math.PI * 110 * t) * 0.12 +
      Math.sin(2 * Math.PI * 165 * t) * 0.08 +
      Math.sin(2 * Math.PI * 220 * t) * 0.04;
    const wind = lp * (0.35 + 0.15 * Math.sin(2 * Math.PI * 0.15 * t));
    const distantHorn =
      Math.exp(-Math.pow((t % 6) - 2.8, 2) * 60) *
      (Math.sin(2 * Math.PI * 330 * t) + Math.sin(2 * Math.PI * 415 * t)) *
      0.035;
    return (drone * 0.5 + wind * 0.45 + distantHorn) * 0.55;
  });
  const p = writeWav('scene_01_mumbai.wav', samples);
  console.log('✓ Scene 01: Mumbai Sunset ->', path.basename(p));
}

// ── Scene 02: B.K.C. Traffic Congestion ───────────────────────────────────────
{
  const rand = seededNoise(2002);
  let lp = 0;
  let bp = 0;
  const samples = buildSeamlessLoop((t) => {
    const n = rand();
    lp = lp * 0.92 + n * 0.08;
    bp = bp * 0.88 + (n - lp) * 0.12;
    const diesel = (Math.sin(2 * Math.PI * 52 * t) + 0.5 * Math.sin(2 * Math.PI * 104 * t)) * 0.07;
    const horn1 =
      Math.exp(-Math.pow((t % 3.5) - 1.2, 2) * 70) *
      (Math.sin(2 * Math.PI * 440 * t) + Math.sin(2 * Math.PI * 554 * t)) *
      0.06;
    const horn2 =
      Math.exp(-Math.pow((t % 4.8) - 3.2, 2) * 90) *
      (Math.sin(2 * Math.PI * 370 * t) + Math.sin(2 * Math.PI * 466 * t)) *
      0.045;
    const whistle =
      Math.exp(-Math.pow((t % 5.5) - 4.5, 2) * 120) *
      Math.sin(2 * Math.PI * 2800 * t) *
      0.025;
    return (lp * 0.42 + bp * 0.28 + diesel + horn1 + horn2 + whistle) * 0.58;
  });
  const p = writeWav('scene_02_traffic.wav', samples);
  console.log('✓ Scene 02: Traffic Congestion ->', path.basename(p));
}

// ── Scene 03: College Party Indoor Atmosphere ─────────────────────────────────
{
  const rand = seededNoise(3003);
  let lp = 0;
  const samples = buildSeamlessLoop((t) => {
    const n = rand();
    lp = lp * 0.86 + n * 0.14;
    const beatPhase = (t * (124 / 60)) % 1;
    const muffledKick = Math.exp(-beatPhase * 16) * Math.sin(2 * Math.PI * 65 * Math.exp(-beatPhase * 4) * t) * 0.18;
    const offbeatBass = Math.exp(-((beatPhase + 0.5) % 1) * 12) * Math.sin(2 * Math.PI * 82 * t) * 0.09;
    const chatter = lp * 0.28;
    const glassClink =
      Math.exp(-Math.pow((t % 5.2) - 2.1, 2) * 220) *
      Math.sin(2 * Math.PI * 3800 * t) *
      0.03;
    return (muffledKick + offbeatBass + chatter + glassClink) * 0.52;
  });
  const p = writeWav('scene_03_party.wav', samples);
  console.log('✓ Scene 03: College Party ->', path.basename(p));
}

// ── Scene 04: Death\'s Cosmic Celestial Realm ──────────────────────────────────
{
  const samples = buildSeamlessLoop((t) => {
    const sub = Math.sin(2 * Math.PI * 44 * t) * 0.18 + Math.sin(2 * Math.PI * 88 * t) * 0.08;
    const etherPad =
      (Math.sin(2 * Math.PI * 220 * t + Math.sin(t * 0.4)) +
        Math.sin(2 * Math.PI * 277.18 * t) +
        Math.sin(2 * Math.PI * 329.63 * t) +
        Math.sin(2 * Math.PI * 415.3 * t)) *
      0.035;
    const shimmer = Math.sin(2 * Math.PI * 880 * t) * 0.012 * (0.5 + 0.5 * Math.sin(t * 1.2));
    return (sub + etherPad + shimmer) * 0.50;
  });
  const p = writeWav('scene_04_death_world.wav', samples);
  console.log('✓ Scene 04: Death\'s World ->', path.basename(p));
}

// ── Scene 05: Fall & Birth Dramatic Convergence ──────────────────────────────
{
  const rand = seededNoise(5005);
  let lp = 0;
  const samples = buildSeamlessLoop((t) => {
    const n = rand();
    lp = lp * 0.90 + n * 0.10;
    const heartPhase = (t * (64 / 60)) % 1;
    const pulse1 = Math.exp(-heartPhase * 24) * Math.sin(2 * Math.PI * 48 * t) * 0.22;
    const pulse2 = Math.exp(-Math.max(0, heartPhase - 0.22) * 26) * Math.sin(2 * Math.PI * 55 * t) * 0.16;
    const risingTension = Math.sin(2 * Math.PI * (110 + 20 * (t / DURATION_SEC)) * t) * 0.06;
    const clockTick =
      Math.exp(-((t * 2) % 1) * 35) *
      lp *
      0.045;
    return (pulse1 + pulse2 + risingTension + clockTick) * 0.60;
  });
  const p = writeWav('scene_05_convergence.wav', samples);
  console.log('✓ Scene 05: Convergence (Heartbeat & Fall) ->', path.basename(p));
}

// ── Scene 06: Transformation & Divine Bargain ────────────────────────────────
{
  const samples = buildSeamlessLoop((t) => {
    const celPad =
      (Math.sin(2 * Math.PI * 138.59 * t) +
        Math.sin(2 * Math.PI * 174.61 * t) +
        Math.sin(2 * Math.PI * 207.65 * t)) *
      0.08;
    const bell =
      Math.exp(-((t * 0.5) % 1) * 4) *
      (Math.sin(2 * Math.PI * 1108.7 * t) + Math.sin(2 * Math.PI * 1318.5 * t)) *
      0.028;
    const whoosh = Math.sin(2 * Math.PI * 0.2 * t) * 0.05 * Math.sin(2 * Math.PI * 60 * t);
    return (celPad + bell + whoosh) * 0.52;
  });
  const p = writeWav('scene_06_transformation.wav', samples);
  console.log('✓ Scene 06: Transformation Bargain ->', path.basename(p));
}

// ── Scene 07: Hospital ICU Clinical Room Tone ────────────────────────────────
{
  const rand = seededNoise(7007);
  let lp = 0;
  const samples = buildSeamlessLoop((t) => {
    const n = rand();
    lp = lp * 0.94 + n * 0.06;
    const acHum = (Math.sin(2 * Math.PI * 60 * t) * 0.06 + Math.sin(2 * Math.PI * 120 * t) * 0.03) + lp * 0.18;
    const beepPhase = (t * (70 / 60)) % 1;
    const heartMonitor =
      Math.exp(-beepPhase * 50) *
      Math.sin(2 * Math.PI * 1050 * t) *
      0.045;
    return (acHum + heartMonitor) * 0.50;
  });
  const p = writeWav('scene_07_hospital.wav', samples);
  console.log('✓ Scene 07: Hospital ICU Room Tone ->', path.basename(p));
}

// ── Scene 08: Neo-Natal Ward Flight & Chase ──────────────────────────────────
{
  const rand = seededNoise(8008);
  let lp = 0;
  const samples = buildSeamlessLoop((t) => {
    const n = rand();
    lp = lp * 0.90 + n * 0.10;
    const stepPhase = (t * 2.4) % 1;
    const footsteps = Math.exp(-stepPhase * 18) * lp * 0.14;
    const tensePulse = Math.sin(2 * Math.PI * 85 * t) * 0.08 * (0.6 + 0.4 * Math.sin(2 * Math.PI * 0.8 * t));
    const airRush = lp * 0.22 * Math.sin(2 * Math.PI * 0.3 * t);
    return (footsteps + tensePulse + airRush) * 0.56;
  });
  const p = writeWav('scene_08_escape.wav', samples);
  console.log('✓ Scene 08: Hospital Escape ->', path.basename(p));
}

// ── Scene 09: Twelve-Wheeler Night Rain Climax ────────────────────────────────
{
  const rand = seededNoise(9009);
  let lp = 0;
  let hp = 0;
  const samples = buildSeamlessLoop((t) => {
    const n = rand();
    lp = lp * 0.85 + n * 0.15;
    hp = hp * 0.92 + (n - lp) * 0.08;
    const rainHiss = hp * 0.28;
    const truckEngine = (Math.sin(2 * Math.PI * 38 * t) * 0.16 + Math.sin(2 * Math.PI * 76 * t) * 0.08) * (0.7 + 0.3 * Math.sin(t * 0.5));
    const hornBlast =
      Math.exp(-Math.pow((t % 6) - 4.5, 2) * 45) *
      (Math.sin(2 * Math.PI * 220 * t) + Math.sin(2 * Math.PI * 277 * t)) *
      0.08;
    return (rainHiss + truckEngine + hornBlast) * 0.62;
  });
  const p = writeWav('scene_09_truck.wav', samples);
  console.log('✓ Scene 09: Truck Sequence ->', path.basename(p));
}

// ── Scene 10: Eight Years Later Morning Sunlight ─────────────────────────────
{
  const rand = seededNoise(10010);
  let lp = 0;
  const samples = buildSeamlessLoop((t) => {
    const n = rand();
    lp = lp * 0.96 + n * 0.04;
    const morningPad =
      (Math.sin(2 * Math.PI * 174.61 * t) * 0.09 +
        Math.sin(2 * Math.PI * 220 * t) * 0.06 +
        Math.sin(2 * Math.PI * 261.63 * t) * 0.04) *
      (0.85 + 0.15 * Math.sin(t * 0.25));
    const bird1 =
      Math.exp(-Math.pow((t % 3.8) - 1.2, 2) * 180) *
      Math.sin(2 * Math.PI * (3400 + 400 * Math.sin(t * 40)) * t) *
      0.025;
    const bird2 =
      Math.exp(-Math.pow((t % 4.5) - 2.8, 2) * 220) *
      Math.sin(2 * Math.PI * (3800 + 300 * Math.sin(t * 50)) * t) *
      0.022;
    const cupClink =
      Math.exp(-Math.pow((t % 7) - 5.5, 2) * 300) *
      Math.sin(2 * Math.PI * 4200 * t) *
      0.020;
    return (morningPad + lp * 0.15 + bird1 + bird2 + cupClink) * 0.48;
  });
  const p = writeWav('scene_10_eight_years_later.wav', samples);
  console.log('✓ Scene 10: Eight Years Later ->', path.basename(p));
}

console.log('\nAll 10 scene soundscapes rendered successfully!');
