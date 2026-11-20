import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('public/assets/audio');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SAMPLE_RATE = 22050;

function writeWav(filename, samples) {
  const numSamples = samples.length;
  const byteLength = numSamples * 2;
  const buffer = Buffer.alloc(44 + byteLength);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + byteLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(byteLength, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  fs.writeFileSync(path.join(OUT_DIR, filename), buffer);
}

function seededNoise(seed) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return (s / 0xffffffff) * 2 - 1;
  };
}

/**
 * Generates a seamless crossfaded ambient loop of `durationSec` seconds.
 */
function buildSeamlessLoop(durationSec, renderSample) {
  const n = Math.floor(SAMPLE_RATE * durationSec);
  const crossN = Math.floor(SAMPLE_RATE * 0.45);
  const raw = new Float32Array(n + crossN);
  for (let i = 0; i < raw.length; i++) {
    raw[i] = renderSample(i / SAMPLE_RATE, i);
  }
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (i < crossN) {
      const alpha = i / crossN;
      out[i] = raw[i] * alpha + raw[n + i] * (1 - alpha);
    } else {
      out[i] = raw[i];
    }
  }
  return out;
}

// 1. Ambient: Mumbai Sunset (warm city wind + harmonic evening tanpura-like drone)
{
  const rand = seededNoise(101);
  let lp = 0;
  const samples = buildSeamlessLoop(4.0, (t) => {
    const n = rand();
    lp = lp * 0.94 + n * 0.06;
    const drone =
      Math.sin(2 * Math.PI * 110 * t) * 0.14 +
      Math.sin(2 * Math.PI * 164.81 * t) * 0.09 +
      Math.sin(2 * Math.PI * 220 * t) * 0.04;
    const swell = 0.78 + 0.22 * Math.sin((2 * Math.PI * t) / 4);
    return (drone * swell + lp * 0.35) * 0.65;
  });
  writeWav('amb_mumbai.wav', samples);
}

// 2. Ambient: Mumbai Traffic (filtered urban rumble + subtle rhythmic distance)
{
  const rand = seededNoise(202);
  let lp = 0;
  let bp = 0;
  const samples = buildSeamlessLoop(4.0, (t) => {
    const n = rand();
    lp = lp * 0.9 + n * 0.1;
    bp = bp * 0.85 + (n - lp) * 0.15;
    const rumble = Math.sin(2 * Math.PI * 65 * t) * 0.08;
    const distantHorn =
      Math.exp(-Math.pow((t % 2) - 0.9, 2) * 55) *
      (Math.sin(2 * Math.PI * 330 * t) + Math.sin(2 * Math.PI * 415 * t)) *
      0.045;
    return (lp * 0.55 + bp * 0.22 + rumble + distantHorn) * 0.7;
  });
  writeWav('amb_traffic.wav', samples);
}

// 3. Ambient: College Party (muffled low-pass groove + room air)
{
  const rand = seededNoise(303);
  let lp = 0;
  const samples = buildSeamlessLoop(4.0, (t) => {
    const n = rand();
    lp = lp * 0.95 + n * 0.05;
    const beat = Math.pow(Math.max(0, Math.sin(Math.PI * 2 * t * 1.5)), 6);
    const subPulse = beat * Math.sin(2 * Math.PI * 58 * t) * 0.2;
    const chord =
      (Math.sin(2 * Math.PI * 146.83 * t) + Math.sin(2 * Math.PI * 220 * t)) * 0.045;
    return (lp * 0.28 + subPulse + chord) * 0.72;
  });
  writeWav('amb_party.wav', samples);
}

// 4. Ambient: Celestial Silvered Tower (crystalline high harmonics + airy clouds)
{
  const rand = seededNoise(404);
  let lp = 0;
  const samples = buildSeamlessLoop(4.0, (t) => {
    const n = rand();
    lp = lp * 0.97 + n * 0.03;
    const pad =
      Math.sin(2 * Math.PI * 146.83 * t) * 0.1 +
      Math.sin(2 * Math.PI * 220 * t) * 0.08 +
      Math.sin(2 * Math.PI * 293.66 * t) * 0.05 +
      Math.sin(2 * Math.PI * 440 * t) * (0.025 + 0.02 * Math.sin(2 * Math.PI * 0.5 * t));
    return (pad + lp * 0.16) * 0.65;
  });
  writeWav('amb_celestial.wav', samples);
}

// 5. Ambient: Hospital Ward (hushed clinical air + slow soft monitor pulse)
{
  const rand = seededNoise(505);
  let lp = 0;
  const samples = buildSeamlessLoop(4.0, (t) => {
    const n = rand();
    lp = lp * 0.96 + n * 0.04;
    const blipEnv = Math.exp(-Math.pow((t % 1.0) - 0.12, 2) * 900);
    const blip = blipEnv * Math.sin(2 * Math.PI * 880 * t) * 0.09;
    const hum = Math.sin(2 * Math.PI * 100 * t) * 0.035;
    return (lp * 0.22 + blip + hum) * 0.68;
  });
  writeWav('amb_hospital.wav', samples);
}

// 6. Ambient: Morning Dawn (warm open acoustic fifth + soft coastal sea breeze)
{
  const rand = seededNoise(606);
  let lp = 0;
  const samples = buildSeamlessLoop(4.0, (t) => {
    const n = rand();
    lp = lp * 0.95 + n * 0.05;
    const wave = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.25 * t);
    const warmChord =
      Math.sin(2 * Math.PI * 130.81 * t) * 0.12 +
      Math.sin(2 * Math.PI * 196.0 * t) * 0.09 +
      Math.sin(2 * Math.PI * 261.63 * t) * 0.05;
    return (warmChord + lp * (0.15 + wave * 0.15)) * 0.65;
  });
  writeWav('amb_dawn.wav', samples);
}

// SFX 1: Speech Bubble Ink Pop (crisp short papery pluck)
{
  const dur = 0.14;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 42);
    const pitch = 520 - t * 1400;
    out[i] = Math.sin(2 * Math.PI * Math.max(180, pitch) * t) * env * 0.38;
  }
  writeWav('sfx_bubble.wav', out);
}

// SFX 2: Hotspot / File Discovery Chime
{
  const dur = 0.75;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env1 = Math.exp(-t * 6.5);
    const env2 = t > 0.08 ? Math.exp(-(t - 0.08) * 5.5) : 0;
    out[i] =
      (Math.sin(2 * Math.PI * 659.25 * t) * env1 * 0.25 +
        Math.sin(2 * Math.PI * 987.77 * t) * env2 * 0.22);
  }
  writeWav('sfx_discover.wav', out);
}

// SFX 3: Elevator Ding
{
  const dur = 1.25;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 3.8);
    out[i] =
      (Math.sin(2 * Math.PI * 1046.5 * t) * 0.3 +
        Math.sin(2 * Math.PI * 2093 * t) * 0.08) *
      env;
  }
  writeWav('sfx_ding.wav', out);
}

// SFX 4: Mumbai Traffic Horn
{
  const dur = 0.42;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.03) * Math.min(1, (dur - t) / 0.08);
    const f1 = Math.sin(2 * Math.PI * 349.23 * t) + 0.35 * Math.sin(2 * Math.PI * 698.46 * t);
    const f2 = Math.sin(2 * Math.PI * 440 * t) + 0.35 * Math.sin(2 * Math.PI * 880 * t);
    out[i] = (f1 + f2) * 0.16 * env;
  }
  writeWav('sfx_horn.wav', out);
}

// SFX 5: Thunder Crack & Roll
{
  const rand = seededNoise(909);
  const dur = 1.6;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    lp = lp * 0.92 + rand() * 0.08;
    const crack = t < 0.14 ? Math.exp(-t * 18) * rand() * 0.45 : 0;
    const roll = Math.exp(-t * 2.1) * (lp * 1.4 + Math.sin(2 * Math.PI * (78 - t * 25) * t) * 0.25);
    out[i] = (crack + roll) * 0.72;
  }
  writeWav('sfx_thunder.wav', out);
}

// SFX 6: Hospital Monitor Flatline
{
  const dur = 1.6;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.04) * Math.min(1, (dur - t) / 0.35);
    out[i] = Math.sin(2 * Math.PI * 987.77 * t) * 0.22 * env;
  }
  writeWav('sfx_flatline.wav', out);
}

// SFX 7: Twelve-Wheeler Truck Horn + Sub Impact
{
  const dur = 1.15;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.08) * Math.min(1, (dur - t) / 0.22);
    const brass =
      Math.sin(2 * Math.PI * 130.81 * t) * 0.25 +
      Math.sin(2 * Math.PI * 164.81 * t) * 0.2 +
      Math.sin(2 * Math.PI * 196.0 * t) * 0.18 +
      Math.sin(2 * Math.PI * 261.63 * t) * 0.08;
    out[i] = brass * env;
  }
  writeWav('sfx_truck.wav', out);
}

// SFX 8: Scene Transition Cinematic Swoosh
{
  const rand = seededNoise(777);
  const dur = 0.55;
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin((Math.PI * t) / dur);
    lp = lp * 0.88 + rand() * 0.12;
    out[i] = (lp * 0.5 + Math.sin(2 * Math.PI * (90 + 180 * env) * t) * 0.12) * env;
  }
  writeWav('sfx_transition.wav', out);
}

console.log('Generated audio assets in', OUT_DIR);
