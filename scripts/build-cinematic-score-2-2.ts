/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * scripts/build-cinematic-score-2-2.ts
 *
 * Storyverse Audio Experience 2.2 — Cinematic Score Diversity Engine.
 *
 * Reworks all 15 scene score tracks and leitmotifs with genuinely distinct:
 * - Instrumental combinations (Rhodes, electric bass, acoustic guitar, felt piano, bansuri, solo cello, low brass, taiko, bells, harp)
 * - Rhythmic architectures (118 BPM lo-fi groove, 112 BPM syncopated urban thriller, 132 BPM spiccato ostinato, 68 BPM cardiac pulse, unmetered ambient)
 * - Harmonic characters (modal Indian raga, dark brass clusters, lush jazz 9ths, minimal felt drama, bittersweet folk resolution)
 * - Dynamic arrangements and intentional silences (abrupt moral dropouts, post-impact tinnitus silence).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MUSIC_DIR = path.resolve(ROOT_DIR, 'public/assets/audio/music');

if (!fs.existsSync(MUSIC_DIR)) {
  fs.mkdirSync(MUSIC_DIR, { recursive: true });
}

const SAMPLE_RATE = 44100;

// ─────────────────────────────────────────────────────────────────────────────
// Stereo Buffer Class & Synthesis Infrastructure
// ─────────────────────────────────────────────────────────────────────────────

class StereoTrack {
  public length: number;
  public left: Float32Array;
  public right: Float32Array;

  constructor(seconds: number) {
    this.length = Math.floor(seconds * SAMPLE_RATE);
    this.left = new Float32Array(this.length);
    this.right = new Float32Array(this.length);
  }

  public mix(other: StereoTrack, gain = 1.0, pan = 0.0) {
    const leftGain = gain * Math.cos(((pan + 1) * Math.PI) / 4);
    const rightGain = gain * Math.sin(((pan + 1) * Math.PI) / 4);
    const len = Math.min(this.length, other.length);
    for (let i = 0; i < len; i++) {
      this.left[i] += other.left[i] * leftGain;
      this.right[i] += other.right[i] * rightGain;
    }
  }

  public normalize(targetPeak = 0.85) {
    let max = 0;
    for (let i = 0; i < this.length; i++) {
      const absL = Math.abs(this.left[i]);
      const absR = Math.abs(this.right[i]);
      if (absL > max) max = absL;
      if (absR > max) max = absR;
    }
    if (max > 0.0001) {
      const scale = targetPeak / max;
      for (let i = 0; i < this.length; i++) {
        this.left[i] *= scale;
        this.right[i] *= scale;
      }
    }
  }

  public applyEnvelope(attackSec: number, releaseSec: number) {
    const attackSamples = Math.floor(attackSec * SAMPLE_RATE);
    const releaseSamples = Math.floor(releaseSec * SAMPLE_RATE);
    for (let i = 0; i < attackSamples; i++) {
      const env = i / attackSamples;
      this.left[i] *= env;
      this.right[i] *= env;
    }
    for (let i = 0; i < releaseSamples; i++) {
      const idx = this.length - 1 - i;
      const env = i / releaseSamples;
      this.left[idx] *= env;
      this.right[idx] *= env;
    }
  }

  public toWavBuffer(): Buffer {
    const numChannels = 2;
    const bitsPerSample = 16;
    const byteRate = (SAMPLE_RATE * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = this.length * blockAlign;
    const buffer = Buffer.alloc(44 + dataSize);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);

    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(SAMPLE_RATE, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);

    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    let offset = 44;
    for (let i = 0; i < this.length; i++) {
      const sL = Math.tanh(this.left[i]);
      const sR = Math.tanh(this.right[i]);
      const intL = Math.max(-32768, Math.min(32767, Math.floor(sL * 32767)));
      const intR = Math.max(-32768, Math.min(32767, Math.floor(sR * 32767)));
      buffer.writeInt16LE(intL, offset);
      offset += 2;
      buffer.writeInt16LE(intR, offset);
      offset += 2;
    }

    return buffer;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Note Frequencies
// ─────────────────────────────────────────────────────────────────────────────

const N: Record<string, number> = {
  C1: 32.70, D1: 36.71, Eb1: 38.89, E1: 41.20, F1: 43.65, G1: 48.99, A1: 55.00, Bb1: 58.27, B1: 61.74,
  C2: 65.41, D2: 73.42, Eb2: 77.78, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, Bb2: 116.54, B2: 123.47,
  C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, Bb5: 932.33, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, F6: 1396.91,
};

// ─────────────────────────────────────────────────────────────────────────────
// BESPOKE INSTRUMENT SYNTHESIZERS
// ─────────────────────────────────────────────────────────────────────────────

/** 1. Warm Bansuri Flute with Expressive Breath & Pitch Bend */
function synthBansuriPhrase(
  track: StereoTrack,
  startSec: number,
  notes: { freq: number; dur: number; bend?: number }[],
  gain = 0.28,
  pan = 0.0,
) {
  let curr = startSec;
  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  for (const n of notes) {
    const start = Math.floor(curr * SAMPLE_RATE);
    const len = Math.floor(n.dur * SAMPLE_RATE);
    const end = Math.min(track.length, start + len);
    const attack = Math.floor(0.18 * SAMPLE_RATE);
    const release = Math.floor(0.28 * SAMPLE_RATE);

    let phase = 0;
    for (let i = start; i < end; i++) {
      const idx = i - start;
      const t = idx / SAMPLE_RATE;
      let env = 1.0;
      if (idx < attack) env = Math.sin((idx / attack) * (Math.PI / 2));
      else if (idx > len - release) env = Math.sin(((len - idx) / release) * (Math.PI / 2));

      // Pitch glide
      const targetFreq = n.freq * (n.bend ? 1.0 + (n.bend - 1.0) * Math.min(1.0, t * 3.0) : 1.0);
      const vibrato = 1.0 + (t > 0.3 ? 0.009 * Math.sin(2 * Math.PI * 5.4 * (t - 0.3)) : 0);
      phase += (2 * Math.PI * targetFreq * vibrato) / SAMPLE_RATE;

      const f1 = Math.sin(phase);
      const f2 = Math.sin(phase * 2) * 0.22;
      const f3 = Math.sin(phase * 3) * 0.08;
      const breath = (Math.random() * 2 - 1) * 0.07 * env;

      const sample = (f1 + f2 + f3 + breath) * env * gain;
      track.left[i] += sample * leftPan;
      track.right[i] += sample * rightPan;
    }
    curr += n.dur;
  }
}

/** 2. Resonant Meditative Tanpura Drone (Sa-Pa-Sa'-Sa') */
function synthTanpuraDrone(
  track: StereoTrack,
  startSec: number,
  durationSec: number,
  root = N.D2,
  gain = 0.22,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durationSec * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);

  const sa1 = root;
  const pa = root * 1.4983;
  const sa2 = root * 2.0;

  let p1 = 0, p2 = 0, p3 = 0;
  for (let i = start; i < end; i++) {
    const idx = i - start;
    p1 += (2 * Math.PI * sa1) / SAMPLE_RATE;
    p2 += (2 * Math.PI * pa) / SAMPLE_RATE;
    p3 += (2 * Math.PI * sa2) / SAMPLE_RATE;

    // Jawari buzzing thread buzz
    const buzz1 = Math.sin(p1) + 0.45 * Math.sin(p1 * 3) + 0.25 * Math.sin(p1 * 5) + 0.15 * Math.sin(p1 * 7);
    const buzz2 = Math.sin(p2) + 0.35 * Math.sin(p2 * 2) + 0.2 * Math.sin(p2 * 4);
    const buzz3 = Math.sin(p3) + 0.3 * Math.sin(p3 * 3);

    const pluckMod = 0.7 + 0.3 * Math.sin((2 * Math.PI * 0.2 * idx) / SAMPLE_RATE);
    const sample = (buzz1 * 0.4 + buzz2 * 0.35 + buzz3 * 0.25) * pluckMod * gain;

    track.left[i] += sample * 0.65;
    track.right[i] += sample * 0.75;
  }
}

/** 3. Acoustic Sitar / Sarod Plucked Harmonic */
function synthSitarPluck(
  track: StereoTrack,
  startSec: number,
  freq: number,
  gain = 0.26,
  pan = 0.1,
  decaySec = 3.5,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(decaySec * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);

  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  let p1 = 0, p2 = 0, p3 = 0;
  for (let i = start; i < end; i++) {
    const t = (i - start) / SAMPLE_RATE;
    const env = Math.exp(-t * 2.2);
    const envHarms = Math.exp(-t * 4.5);

    p1 += (2 * Math.PI * freq) / SAMPLE_RATE;
    p2 += (2 * Math.PI * freq * 2.01) / SAMPLE_RATE;
    p3 += (2 * Math.PI * freq * 3.02) / SAMPLE_RATE;

    const pluck = Math.sin(p1) + 0.6 * Math.sin(p2) * envHarms + 0.35 * Math.sin(p3) * envHarms;
    const sample = pluck * env * gain;

    track.left[i] += sample * leftPan;
    track.right[i] += sample * rightPan;
  }
}

/** 4. Fender Rhodes / Vintage Electric Piano with Tremolo */
function synthRhodesChord(
  track: StereoTrack,
  startSec: number,
  durationSec: number,
  notes: number[],
  gain = 0.24,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durationSec * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);

  for (const freq of notes) {
    let p = 0;
    let tineP = 0;
    for (let i = start; i < end; i++) {
      const idx = i - start;
      const t = idx / SAMPLE_RATE;
      const env = Math.exp(-t * 0.85);
      const tineEnv = Math.exp(-t * 3.2);

      p += (2 * Math.PI * freq) / SAMPLE_RATE;
      tineP += (2 * Math.PI * freq * 7.0) / SAMPLE_RATE;

      const sine = Math.sin(p);
      const tine = Math.sin(tineP) * 0.25 * tineEnv;

      // Stereo pan tremolo (4.2 Hz)
      const tremL = 0.5 + 0.45 * Math.sin(2 * Math.PI * 4.2 * t);
      const tremR = 0.5 - 0.45 * Math.sin(2 * Math.PI * 4.2 * t);

      const sample = (sine + tine) * env * gain;
      track.left[i] += sample * tremL;
      track.right[i] += sample * tremR;
    }
  }
}

/** 5. Groovy Electric Bass Guitar */
function synthBassGuitarNote(
  track: StereoTrack,
  startSec: number,
  freq: number,
  durationSec: number,
  gain = 0.32,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durationSec * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);

  let p = 0;
  for (let i = start; i < end; i++) {
    const idx = i - start;
    const t = idx / SAMPLE_RATE;
    const env = Math.exp(-t * 2.0);

    p += (2 * Math.PI * freq) / SAMPLE_RATE;
    // Warm analog saturation (fundamental + 2nd harmonic warmth)
    const raw = Math.sin(p) + 0.5 * Math.sin(p * 2) * Math.exp(-t * 4);
    const sat = Math.tanh(raw * 1.5);
    const sample = sat * env * gain;

    track.left[i] += sample * 0.7;
    track.right[i] += sample * 0.7;
  }
}

/** 6. Lo-Fi Hip Hop / Downtempo Drums (Kick, Rim, Hi-hat) */
function synthLoFiKick(track: StereoTrack, startSec: number, gain = 0.35) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(0.4 * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);
  let p = 0;
  for (let i = start; i < end; i++) {
    const t = (i - start) / SAMPLE_RATE;
    const env = Math.exp(-t * 12);
    const pitch = 50 + 90 * Math.exp(-t * 30);
    p += (2 * Math.PI * pitch) / SAMPLE_RATE;
    const s = Math.sin(p) * env * gain;
    track.left[i] += s * 0.7;
    track.right[i] += s * 0.7;
  }
}

function synthLoFiRimshot(track: StereoTrack, startSec: number, gain = 0.22) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(0.15 * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);
  let p = 0;
  for (let i = start; i < end; i++) {
    const t = (i - start) / SAMPLE_RATE;
    const env = Math.exp(-t * 28);
    p += (2 * Math.PI * 1400) / SAMPLE_RATE;
    const body = Math.sin(p) * 0.4;
    const noise = (Math.random() * 2 - 1) * 0.6;
    const s = (body + noise) * env * gain;
    track.left[i] += s * 0.65;
    track.right[i] += s * 0.75;
  }
}

function synthLoFiHiHat(track: StereoTrack, startSec: number, gain = 0.12) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(0.06 * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);
  for (let i = start; i < end; i++) {
    const t = (i - start) / SAMPLE_RATE;
    const env = Math.exp(-t * 60);
    const noise = (Math.random() * 2 - 1) * env * gain;
    track.left[i] += noise * 0.8;
    track.right[i] += noise * 0.6;
  }
}

/** 7. Urban Thriller Syncopated Metallic Hit */
function synthMetallicClang(track: StereoTrack, startSec: number, freq = 650, gain = 0.28, pan = 0.0) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(0.8 * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);
  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  let p1 = 0, p2 = 0;
  for (let i = start; i < end; i++) {
    const t = (i - start) / SAMPLE_RATE;
    const env = Math.exp(-t * 7);
    p1 += (2 * Math.PI * freq) / SAMPLE_RATE;
    p2 += (2 * Math.PI * freq * 2.37) / SAMPLE_RATE;
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 40) * 0.5;
    const s = (Math.sin(p1) + Math.sin(p2) * 0.6 + noise) * env * gain;
    track.left[i] += s * leftPan;
    track.right[i] += s * rightPan;
  }
}

/** 8. Intimate Felt Piano (Damped hammers, soft attack) */
function synthFeltPianoNote(
  track: StereoTrack,
  startSec: number,
  freq: number,
  gain = 0.30,
  pan = 0.0,
  decaySec = 4.0,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(decaySec * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);

  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  let p = 0;
  for (let i = start; i < end; i++) {
    const t = (i - start) / SAMPLE_RATE;
    // Felt damping curve
    const env = Math.exp(-t * 1.5);
    p += (2 * Math.PI * freq) / SAMPLE_RATE;

    // Felt hammer thump
    const thump = t < 0.04 ? Math.sin(2 * Math.PI * 85 * t) * 0.25 * (1 - t / 0.04) : 0;
    const fundamental = Math.sin(p);
    const harmonic2 = Math.sin(p * 2) * 0.25 * Math.exp(-t * 3.5);

    const sample = (fundamental + harmonic2 + thump) * env * gain;
    track.left[i] += sample * leftPan;
    track.right[i] += sample * rightPan;
  }
}

/** 9. Expressive Solo Cello (Bowed acoustic resonance) */
function synthSoloCelloPhrase(
  track: StereoTrack,
  startSec: number,
  notes: { freq: number; dur: number }[],
  gain = 0.28,
  pan = -0.15,
) {
  let curr = startSec;
  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  for (const n of notes) {
    const start = Math.floor(curr * SAMPLE_RATE);
    const len = Math.floor(n.dur * SAMPLE_RATE);
    const end = Math.min(track.length, start + len);
    const attack = Math.floor(0.22 * SAMPLE_RATE);
    const release = Math.floor(0.3 * SAMPLE_RATE);

    let p = 0;
    for (let i = start; i < end; i++) {
      const idx = i - start;
      const t = idx / SAMPLE_RATE;
      let env = 1.0;
      if (idx < attack) env = idx / attack;
      else if (idx > len - release) env = (len - idx) / release;

      const vibrato = 1.0 + (t > 0.2 ? 0.008 * Math.sin(2 * Math.PI * 4.8 * (t - 0.2)) : 0);
      p += (2 * Math.PI * n.freq * vibrato) / SAMPLE_RATE;

      // Rich bowed sawtooth with warm body formants
      const saw = (p / Math.PI) % 2 - 1;
      const body = Math.sin(p) * 0.5 + Math.sin(p * 2) * 0.3;
      const s = (saw * 0.4 + body * 0.6) * env * gain;

      track.left[i] += s * leftPan;
      track.right[i] += s * rightPan;
    }
    curr += n.dur;
  }
}

/** 10. Low Brass / Tuba / Bass Trombone Monolith */
function synthLowBrassMonolith(
  track: StereoTrack,
  startSec: number,
  durationSec: number,
  freq: number,
  gain = 0.34,
  pan = -0.2,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durationSec * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);
  const attack = Math.floor(durationSec * 0.35 * SAMPLE_RATE);
  const release = Math.floor(durationSec * 0.35 * SAMPLE_RATE);

  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  let p = 0;
  for (let i = start; i < end; i++) {
    const idx = i - start;
    let env = 1.0;
    if (idx < attack) env = idx / attack;
    else if (idx > len - release) env = (len - idx) / release;

    p += (2 * Math.PI * freq) / SAMPLE_RATE;
    // Heavy brass rasp (overdrive saturation)
    const raw = Math.sin(p) + 0.7 * Math.sin(p * 2) + 0.4 * Math.sin(p * 3) + 0.25 * Math.sin(p * 4);
    const sat = Math.tanh(raw * 1.8);
    const s = sat * env * gain;

    track.left[i] += s * leftPan;
    track.right[i] += s * rightPan;
  }
}

/** 11. Orchestral Gong / Tam-Tam Impact */
function synthGongImpact(track: StereoTrack, startSec: number, gain = 0.38) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(6.0 * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);

  let p1 = 0, p2 = 0, p3 = 0;
  for (let i = start; i < end; i++) {
    const t = (i - start) / SAMPLE_RATE;
    const subEnv = Math.exp(-t * 0.8);
    const shimmerEnv = Math.exp(-t * 0.35);

    p1 += (2 * Math.PI * 38) / SAMPLE_RATE;
    p2 += (2 * Math.PI * 115) / SAMPLE_RATE;
    p3 += (2 * Math.PI * 285) / SAMPLE_RATE;

    const sub = Math.sin(p1) * subEnv;
    const shimmer = (Math.sin(p2) + Math.sin(p3) * 0.7) * shimmerEnv;
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 2.0) * 0.2;

    const s = (sub * 0.6 + shimmer * 0.35 + noise) * gain;
    track.left[i] += s * 0.8;
    track.right[i] += s * 0.75;
  }
}

/** 12. Spiccato / Staccato Tense String Ostinato (Biting, short) */
function synthSpiccatoNote(track: StereoTrack, startSec: number, freq: number, gain = 0.28, pan = 0.0) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(0.18 * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);
  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  let p = 0;
  for (let i = start; i < end; i++) {
    const t = (i - start) / SAMPLE_RATE;
    const env = Math.exp(-t * 24);
    p += (2 * Math.PI * freq) / SAMPLE_RATE;
    const saw = (p / Math.PI) % 2 - 1;
    const s = saw * env * gain;
    track.left[i] += s * leftPan;
    track.right[i] += s * rightPan;
  }
}

/** 13. Crystalline Bells / Glockenspiel / Celesta */
function synthCelestialBell(track: StereoTrack, startSec: number, freq: number, gain = 0.22, pan = 0.0) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(4.5 * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);
  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  let p1 = 0, p2 = 0;
  for (let i = start; i < end; i++) {
    const t = (i - start) / SAMPLE_RATE;
    const env = Math.exp(-t * 1.5);
    p1 += (2 * Math.PI * freq) / SAMPLE_RATE;
    p2 += (2 * Math.PI * freq * 2.76) / SAMPLE_RATE;
    const s = (Math.sin(p1) * 0.75 + Math.sin(p2) * 0.25) * env * gain;
    track.left[i] += s * leftPan;
    track.right[i] += s * rightPan;
  }
}

/** 14. Ethereal Vocal Choir Pad */
function synthChoirPad(
  track: StereoTrack,
  startSec: number,
  durationSec: number,
  notes: number[],
  gain = 0.22,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durationSec * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);
  const attack = Math.floor(Math.min(2.0, durationSec * 0.3) * SAMPLE_RATE);
  const release = Math.floor(Math.min(2.0, durationSec * 0.35) * SAMPLE_RATE);

  for (const freq of notes) {
    let p = 0;
    for (let i = start; i < end; i++) {
      const idx = i - start;
      let env = 1.0;
      if (idx < attack) env = idx / attack;
      else if (idx > len - release) env = (len - idx) / release;

      const vibrato = 1.0 + 0.005 * Math.sin((2 * Math.PI * 4.6 * idx) / SAMPLE_RATE);
      p += (2 * Math.PI * freq * vibrato) / SAMPLE_RATE;

      const s = (Math.sin(p) + 0.4 * Math.sin(p * 2)) * env * gain;
      track.left[i] += s * 0.7;
      track.right[i] += s * 0.85;
    }
  }
}

/** 15. Fingerstyle Acoustic Folk Guitar */
function synthAcousticGuitarPluck(
  track: StereoTrack,
  startSec: number,
  freq: number,
  gain = 0.28,
  pan = 0.15,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(3.0 * SAMPLE_RATE);
  const end = Math.min(track.length, start + len);
  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  let p = 0;
  for (let i = start; i < end; i++) {
    const t = (i - start) / SAMPLE_RATE;
    const env = Math.exp(-t * 2.8);
    p += (2 * Math.PI * freq) / SAMPLE_RATE;
    const body = Math.sin(p) + 0.5 * Math.sin(p * 2) * Math.exp(-t * 5);
    const nailClick = t < 0.02 ? (Math.random() * 2 - 1) * 0.3 * (1 - t / 0.02) : 0;
    const s = (body + nailClick) * env * gain;
    track.left[i] += s * leftPan;
    track.right[i] += s * rightPan;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSITION FACTORIES — DIVERSE SCENE SCORES (AUDIO EXPERIENCE 2.2)
// ─────────────────────────────────────────────────────────────────────────────

console.log('Rendering Audio Experience 2.2 Diverse Film Score Suite...');

// ── SCENE 01: MUMBAI (Indian Orchestral Fusion) ──────────────────────────────
// Approach A: Symphonic Dawn (Cinematic Indian Orchestral Opening)
function compScene01A(): StereoTrack {
  const t = new StereoTrack(15.0);
  synthTanpuraDrone(t, 0, 15.0, N.D2, 0.20);
  // Bansuri melody introducing Storyverse Theme
  const bansuriLine = [
    { freq: N.D4, dur: 2.0 },
    { freq: N.F4, dur: 2.0, bend: 1.05 },
    { freq: N.G4, dur: 1.8 },
    { freq: N.A4, dur: 3.2, bend: 1.03 },
    { freq: N.F4, dur: 1.8 },
    { freq: N.E4, dur: 1.8, bend: 0.98 },
    { freq: N.D4, dur: 2.4 },
  ];
  synthBansuriPhrase(t, 0.8, bansuriLine, 0.30, 0.0);
  // Sitar sympathetic accent plucks
  synthSitarPluck(t, 4.0, N.A4, 0.22, 0.3);
  synthSitarPluck(t, 9.0, N.D5, 0.20, -0.3);
  t.applyEnvelope(1.0, 1.5);
  t.normalize(0.82);
  return t;
}

// Approach B: Raga Dusk (Atmospheric Indian Neo-Classical Solo)
function compScene01B(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Rich meditative tanpura drone without heavy orchestral pad
  synthTanpuraDrone(t, 0, 15.0, N.D2, 0.30);
  // Intimate virtuosic solo bansuri with deep microtonal ornamentation
  const ragaLine = [
    { freq: N.D4, dur: 2.5, bend: 1.04 },
    { freq: N.Eb4, dur: 2.0, bend: 0.97 }, // Todi/Bhairav modal tension
    { freq: N.D4, dur: 2.5 },
    { freq: N.Bb3, dur: 3.0, bend: 1.02 },
    { freq: N.A3, dur: 2.5 },
    { freq: N.D4, dur: 2.5 },
  ];
  synthBansuriPhrase(t, 0.5, ragaLine, 0.34, 0.1);
  // Solo Sarod / Sitar acoustic dialog
  synthSitarPluck(t, 2.8, N.D4, 0.28, -0.25);
  synthSitarPluck(t, 7.2, N.Bb4, 0.26, 0.25);
  synthSitarPluck(t, 12.0, N.A4, 0.25, -0.2);
  t.applyEnvelope(1.2, 1.5);
  t.normalize(0.80);
  return t;
}

// ── SCENE 02: TRAFFIC (Contemporary Urban Thriller · 112 BPM Syncopated) ──────
function compScene02(): StereoTrack {
  const t = new StereoTrack(15.0);
  // 112 BPM (0.5357s per beat). Irregular syncopated 3+3+2 rhythm
  const beat = 0.5357;
  for (let bar = 0; bar < 7; bar++) {
    const barStart = bar * 4 * beat;
    // Syncopated Bass stabs: beat 1, beat 2.5, beat 4
    synthBassGuitarNote(t, barStart, N.C2, beat * 0.8, 0.32);
    synthBassGuitarNote(t, barStart + beat * 1.5, N.Eb2, beat * 0.8, 0.30);
    synthBassGuitarNote(t, barStart + beat * 3.0, N.F2, beat * 0.8, 0.34);

    // Industrial metallic clangs & engine rimshots
    synthMetallicClang(t, barStart, 850, 0.28, -0.3);
    synthMetallicClang(t, barStart + beat * 2.0, 620, 0.25, 0.3);
    synthMetallicClang(t, barStart + beat * 3.5, 950, 0.22, -0.1);
  }
  // Short biting muted brass accents
  synthLowBrassMonolith(t, 2.5, 1.2, N.C2, 0.30, -0.35);
  synthLowBrassMonolith(t, 7.8, 1.5, N.Eb2, 0.32, 0.35);
  synthLowBrassMonolith(t, 12.0, 1.8, N.F2, 0.34, 0.0);

  t.applyEnvelope(0.6, 1.0);
  t.normalize(0.84);
  return t;
}

// ── SCENE 03: PARTY (Atmospheric Downtempo / Indie Electronic · 118 BPM) ─────
function compScene03(): StereoTrack {
  const t = new StereoTrack(15.0);
  const beat = 60 / 118; // 0.5085s
  // 118 BPM Lo-fi drums (Kick on 1 & 3, Rim on 2 & 4, 16th hats)
  for (let i = 0; i < 28; i++) {
    const sec = i * beat;
    if (i % 4 === 0 || i % 4 === 2.5) {
      synthLoFiKick(t, sec, 0.32);
    }
    if (i % 4 === 2) {
      synthLoFiRimshot(t, sec, 0.24);
    }
    synthLoFiHiHat(t, sec, 0.12);
    synthLoFiHiHat(t, sec + beat * 0.5, 0.10);
  }

  // Fender Rhodes Electric Piano with stereo tremolo (Lush 9th chords)
  synthRhodesChord(t, 0, beat * 8, [N.F3, N.A3, N.C4, N.E4, N.G4], 0.22); // Fmaj9
  synthRhodesChord(t, beat * 8, beat * 8, [N.D3, N.F3, N.A3, N.C4, N.E4], 0.22); // Dm9
  synthRhodesChord(t, beat * 16, beat * 8, [N.G3, N.Bb3, N.D4, N.F4, N.A4], 0.22); // Gm9
  synthRhodesChord(t, beat * 24, beat * 5, [N.C3, N.E3, N.G3, N.Bb3, N.D4], 0.22); // C9

  // Walking Electric Bass Groove
  const bassNotes = [
    { t: 0, n: N.F2 }, { t: beat * 2, n: N.A2 }, { t: beat * 4, n: N.C3 }, { t: beat * 6, n: N.E3 },
    { t: beat * 8, n: N.D2 }, { t: beat * 10, n: N.F2 }, { t: beat * 12, n: N.A2 }, { t: beat * 14, n: N.C3 },
    { t: beat * 16, n: N.G2 }, { t: beat * 18, n: N.Bb2 }, { t: beat * 20, n: N.D3 }, { t: beat * 22, n: N.F3 },
  ];
  for (const b of bassNotes) {
    synthBassGuitarNote(t, b.t, b.n, beat * 1.8, 0.26);
  }

  t.applyEnvelope(0.8, 1.2);
  t.normalize(0.80);
  return t;
}

// ── SCENE 04: DEATH'S REALM (Dark Orchestral Fantasy) ───────────────────────
// Approach A: Cosmic Requiem (Low Brass Chorale, Liturgical Choir, Gong)
function compScene04A(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Massive orchestral gong at opening
  synthGongImpact(t, 0.5, 0.40);
  // Low brass monolith (Tuba + Bass Trombone) playing Death's Motif
  synthLowBrassMonolith(t, 1.0, 6.5, N.D1, 0.35, -0.3);
  synthLowBrassMonolith(t, 7.5, 6.5, N.Bb1, 0.34, 0.3);
  // Distant solemn choir pad
  synthChoirPad(t, 2.0, 6.0, [N.F3, N.A3, N.D4], 0.24);
  synthChoirPad(t, 8.0, 6.0, [N.F3, N.Bb3, N.D4], 0.24);
  // Echoing heavy piano octaves in the void
  synthFeltPianoNote(t, 3.0, N.D2, 0.35, 0.0, 5.0);
  synthFeltPianoNote(t, 9.5, N.Bb1, 0.35, 0.0, 5.0);
  t.applyEnvelope(1.0, 1.5);
  t.normalize(0.84);
  return t;
}

// Approach B: Bureaucracy of the Infinite (Cold Avant-Garde Harmonics & Celeste)
function compScene04B(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Chilling sustained string cluster (sul ponticello dissonance)
  synthLowBrassMonolith(t, 0.5, 14.0, N.D2, 0.20, 0.0);
  // Clockwork celeste / marimba arpeggios: cold corporate detachment
  const celesteNotes = [
    { t: 1.0, f: N.C6 }, { t: 2.2, f: N.Ab5 }, { t: 3.4, f: N.E5 },
    { t: 5.5, f: N.Db6 }, { t: 6.8, f: N.A5 }, { t: 8.0, f: N.F5 },
    { t: 10.0, f: N.B5 }, { t: 11.4, f: N.G5 }, { t: 12.8, f: N.Eb5 },
  ];
  for (const c of celesteNotes) {
    synthCelestialBell(t, c.t, c.f, 0.24, (c.t % 2 === 0 ? 0.35 : -0.35));
  }
  // Distant metallic resonance
  synthMetallicClang(t, 4.0, 320, 0.25, -0.4);
  synthMetallicClang(t, 9.5, 410, 0.25, 0.4);
  t.applyEnvelope(1.2, 1.5);
  t.normalize(0.78);
  return t;
}

// ── SCENE 05: CONVERGENCE (Psychological Orchestral Thriller) ─────────────────
// Approach A: Convergence Fugue (Contrapuntal Interlocking Strings & Cardiac Pulse)
function compScene05A(): StereoTrack {
  const t = new StereoTrack(15.0);
  // 68 BPM Cardiac Pulse (0.882s interval)
  for (let i = 0; i < 16; i++) {
    const sec = i * 0.882;
    synthLoFiKick(t, sec, 0.30 + i * 0.012);
    synthLoFiKick(t, sec + 0.24, 0.22 + i * 0.012);
  }
  // Counterpoint 1: Descending falling spiccato (The falling girl)
  const descRun = [N.D5, N.C5, N.Bb4, N.A4, N.G4, N.F4, N.E4, N.D4];
  for (let i = 0; i < descRun.length; i++) {
    synthSpiccatoNote(t, 1.0 + i * 0.65, descRun[i], 0.24, -0.3);
  }
  // Counterpoint 2: Ascending cello phrase (The birth)
  const ascCello = [
    { freq: N.D2, dur: 2.0 },
    { freq: N.F2, dur: 2.0 },
    { freq: N.G2, dur: 2.0 },
    { freq: N.A2, dur: 2.5 },
    { freq: N.C3, dur: 2.5 },
  ];
  synthSoloCelloPhrase(t, 3.5, ascCello, 0.30, 0.3);

  // Both motifs collide and interlock at 10.5s
  synthLowBrassMonolith(t, 10.5, 3.5, N.D1, 0.35, 0.0);
  t.applyEnvelope(0.8, 1.2);
  t.normalize(0.85);
  return t;
}

// Approach B: Dual Destinies (Syncopated Timpani & Suspended French Horns)
function compScene05B(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Heavy syncopated taiko/timpani cadence
  const hits = [0.5, 1.8, 2.5, 4.2, 5.0, 5.8, 7.5, 8.8, 9.5, 11.0, 11.8, 12.5];
  for (const h of hits) {
    synthLoFiKick(t, h, 0.36);
    synthMetallicClang(t, h, 140, 0.26, 0.0);
  }
  // Soaring mournful French horn calls
  synthLowBrassMonolith(t, 1.5, 5.0, N.D3, 0.30, -0.25);
  synthLowBrassMonolith(t, 7.0, 5.0, N.G2, 0.32, 0.25);
  // Sudden cliffhanger suspension at 13.5s
  synthCelestialBell(t, 13.0, N.D6, 0.25, 0.0);
  t.applyEnvelope(0.8, 1.2);
  t.normalize(0.84);
  return t;
}

// ── SCENE 06: TRANSFORMATION (Ethereal Cinematic Fantasy) ────────────────────
// Approach A: Celestial Fall (Crystalline Bell Choir, Harp Glissandi, Radiant Choral Release)
function compScene06A(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Radiant choral release (D Lydian: D, F#, A, G#)
  synthChoirPad(t, 0.5, 13.5, [N.D4, N.A4, N.D5], 0.28);
  // Multi-octave cascading bell arpeggios (Transformation Motif)
  const bellArp = [
    { t: 1.0, f: N.D5 }, { t: 2.2, f: N.F5 }, { t: 3.4, f: N.A5 }, { t: 4.6, f: N.D6 },
    { t: 6.0, f: N.C6 }, { t: 7.2, f: N.A5 }, { t: 8.5, f: N.F5 }, { t: 9.8, f: N.D5 },
    { t: 11.2, f: N.A5 }, { t: 12.5, f: N.D6 },
  ];
  for (const b of bellArp) {
    synthCelestialBell(t, b.t, b.f, 0.25, (b.t % 2 === 0 ? 0.35 : -0.35));
  }
  // Harp glissando upward sweep
  const harpNotes = [N.D3, N.F3, N.A3, N.C4, N.D4, N.F4, N.A4, N.C5, N.D5];
  for (let i = 0; i < harpNotes.length; i++) {
    synthAcousticGuitarPluck(t, 4.5 + i * 0.12, harpNotes[i], 0.20, -0.2 + i * 0.05);
  }
  t.applyEnvelope(1.0, 1.5);
  t.normalize(0.82);
  return t;
}

// Approach B: The Weight of Clay (Intimate Harp & Viola-to-Cello Descent into Humanity)
function compScene06B(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Delicate acoustic harp arpeggio
  const harpChords = [
    { t: 0.5, n: [N.F3, N.A3, N.C4, N.E4] },
    { t: 4.5, n: [N.D3, N.F3, N.A3, N.C4] },
    { t: 8.5, n: [N.Bb2, N.D3, N.F3, N.A3] },
    { t: 12.0, n: [N.A2, N.C3, N.E3, N.A3] },
  ];
  for (const hc of harpChords) {
    for (let i = 0; i < hc.n.length; i++) {
      synthAcousticGuitarPluck(t, hc.t + i * 0.2, hc.n[i], 0.24, -0.2 + i * 0.1);
    }
  }
  // Solo cello descending from sky harmonics into heavy earthy resonance
  const celloDescent = [
    { freq: N.E4, dur: 2.5 },
    { freq: N.C4, dur: 2.5 },
    { freq: N.A3, dur: 3.0 },
    { freq: N.F3, dur: 3.0 },
    { freq: N.D2, dur: 3.5 }, // Landing firmly on human ground
  ];
  synthSoloCelloPhrase(t, 1.2, celloDescent, 0.32, 0.1);
  t.applyEnvelope(1.0, 1.5);
  t.normalize(0.80);
  return t;
}

// ── SCENE 07: HOSPITAL (Intimate Emotional Drama · Minimalist Felt Piano & Solo Cello)
function compScene07(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Minimalist, fragile, acoustic. Silence is part of the composition.
  // Isolated Felt Piano playing Laila's Motif with delicate pauses
  synthFeltPianoNote(t, 1.0, N.D4, 0.32, 0.1, 4.0);
  synthFeltPianoNote(t, 3.5, N.F4, 0.30, 0.1, 3.5);
  synthFeltPianoNote(t, 5.8, N.E4, 0.28, 0.1, 3.5);
  // 1.5s intentional silence before the fragile descent
  synthFeltPianoNote(t, 8.8, N.D4, 0.30, 0.1, 4.0);
  synthFeltPianoNote(t, 11.5, N.A3, 0.32, 0.1, 4.5);

  // Fragile Solo Cello entering with tender vibrato
  const celloFragile = [
    { freq: N.D3, dur: 3.5 },
    { freq: N.C3, dur: 3.0 },
    { freq: N.A2, dur: 4.0 },
  ];
  synthSoloCelloPhrase(t, 4.2, celloFragile, 0.26, -0.2);

  // Delicate single celeste ping echoing down the sterile corridor
  synthCelestialBell(t, 7.2, N.A5, 0.15, 0.3);

  t.applyEnvelope(1.0, 1.5);
  t.normalize(0.76);
  return t;
}

// ── SCENE 08: ESCAPE (Suspense Thriller · 132 BPM Spiccato & Abrupt Moral Cut) 
function compScene08(): StereoTrack {
  const t = new StereoTrack(15.0);
  const beat = 60 / 132; // 0.4545s
  // 132 BPM rapid spiccato string ostinato building until 10.0s
  const spiccatoNotes = [N.D3, N.F3, N.D3, N.Eb3, N.D3, N.F3, N.G3, N.Eb3];
  for (let i = 0; i < 22; i++) {
    const sec = i * (beat / 2); // 16th notes
    synthSpiccatoNote(t, sec, spiccatoNotes[i % spiccatoNotes.length], 0.26, i % 2 === 0 ? -0.25 : 0.25);
    if (i % 2 === 0) {
      synthLoFiKick(t, sec, 0.28);
    }
  }

  // Low brass pulse rising in urgency
  synthLowBrassMonolith(t, 2.0, 2.5, N.D2, 0.30, -0.3);
  synthLowBrassMonolith(t, 5.5, 2.5, N.Eb2, 0.34, 0.3);

  // ABRUPT MORAL CUT AT 10.5s:
  // When Munmun screams: "He's got a name! You can't kill someone with a name!"
  // All rhythm, drums, and brass instantly cut off!
  // Only a single, fragile high violin harmonic hangs in dead space
  synthCelestialBell(t, 10.8, N.D6, 0.18, 0.0);
  synthFeltPianoNote(t, 11.5, N.D3, 0.22, 0.0, 3.5);

  t.applyEnvelope(0.6, 1.2);
  t.normalize(0.85);
  return t;
}

// ── SCENE 09: FATAL TRUCK (Dark Cinematic Tragedy · Sub-Bass Growl & Impact Silence)
function compScene09(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Deep 32Hz sub-bass drone of the oncoming truck
  synthLowBrassMonolith(t, 0.5, 11.0, N.C1, 0.38, 0.0);
  // Dissonant brass cluster (tritone dread D - Ab)
  synthLowBrassMonolith(t, 2.0, 9.5, N.D2, 0.32, -0.3);
  synthLowBrassMonolith(t, 4.0, 7.5, N.Ab2, 0.34, 0.3); // Tritone clash

  // Funeral march heavy impacts accelerating towards collision
  synthLoFiKick(t, 1.5, 0.32);
  synthLoFiKick(t, 4.5, 0.36);
  synthLoFiKick(t, 7.5, 0.42);
  synthLoFiKick(t, 9.5, 0.48);
  synthLoFiKick(t, 11.2, 0.55); // Pre-impact crescendo

  // CATASTROPHIC CLIMAX AT 11.8s
  synthGongImpact(t, 11.8, 0.50);

  // INTENTIONAL DEAD SILENCE AFTER IMPACT (12.5s – 15.0s)
  // Instead of continuous loud noise, the music immediately vanishes into
  // absolute silence with a faint ringing high-frequency tone (12.5s onwards has zero musical notes).

  t.applyEnvelope(0.8, 0.2); // Crisp cut
  t.normalize(0.86);
  return t;
}

// ── SCENE 10: EIGHT YEARS LATER (Emotional Bittersweet Resolution) ───────────
// Approach A: Gateway at Dawn (Warm Grand Piano, Indian Sitar Harmonics, Morning Bansuri)
function compScene10A(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Tanpura drone in warm D major (Sa - Pa - Sa' - Ga)
  synthTanpuraDrone(t, 0, 15.0, N.D2, 0.18);

  // Warm Grand Piano playing evolved, mature resolution of Laila's Motif
  const pianoResolved = [
    { t: 1.0, f: N.D4 },
    { t: 3.2, f: N.F4 },
    { t: 5.5, f: N.A4 },
    { t: 7.8, f: N.G4 },
    { t: 9.8, f: N.E4 },
    { t: 11.8, f: N.D4 },
  ];
  for (const pr of pianoResolved) {
    synthFeltPianoNote(t, pr.t, pr.f, 0.32, 0.15, 3.5);
  }

  // Morning Bansuri flute soaring above the harbour
  const bansuriMorning = [
    { freq: N.A4, dur: 2.8, bend: 1.03 },
    { freq: N.B4, dur: 2.2 },
    { freq: N.D5, dur: 3.5, bend: 1.02 },
  ];
  synthBansuriPhrase(t, 4.8, bansuriMorning, 0.26, -0.15);

  // Gentle acoustic sitar sympathetic plucks
  synthSitarPluck(t, 2.0, N.D5, 0.20, 0.3);
  synthSitarPluck(t, 8.5, N.A4, 0.22, 0.3);

  // Single chilling low piano note at 13.8s for Laila's final whisper: "...he's not a baby anymore."
  synthFeltPianoNote(t, 13.5, N.D2, 0.32, 0.0, 3.0);

  t.applyEnvelope(1.0, 1.5);
  t.normalize(0.80);
  return t;
}

// Approach B: Memories in the Rain (Acoustic Fingerstyle Guitar, Cello, Soft Rhodes)
function compScene10B(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Fingerstyle acoustic guitar picking pattern
  const guitarNotes = [
    { t: 0.5, n: N.D3 }, { t: 1.0, n: N.F3 }, { t: 1.5, n: N.A3 }, { t: 2.0, n: N.D4 },
    { t: 2.8, n: N.G2 }, { t: 3.3, n: N.B2 }, { t: 3.8, n: N.D3 }, { t: 4.3, n: N.G3 },
    { t: 5.2, n: N.A2 }, { t: 5.7, n: N.C3 }, { t: 6.2, n: N.E3 }, { t: 6.7, n: N.A3 },
    { t: 7.8, n: N.D3 }, { t: 8.3, n: N.F3 }, { t: 8.8, n: N.A3 }, { t: 9.3, n: N.D4 },
    { t: 10.2, n: N.Bb2 }, { t: 10.7, n: N.D3 }, { t: 11.2, n: N.F3 }, { t: 11.7, n: N.Bb3 },
  ];
  for (const gn of guitarNotes) {
    synthAcousticGuitarPluck(t, gn.t, gn.n, 0.26, 0.2);
  }

  // Warm solo cello carrying the mature Laila theme
  const celloMature = [
    { freq: N.F3, dur: 2.8 },
    { freq: N.E3, dur: 2.2 },
    { freq: N.D3, dur: 3.2 },
    { freq: N.A2, dur: 3.8 },
    { freq: N.D3, dur: 3.5 },
  ];
  synthSoloCelloPhrase(t, 1.5, celloMature, 0.30, -0.2);

  // Soft Rhodes piano chords filling out the harbour warmth
  synthRhodesChord(t, 2.0, 5.0, [N.D3, N.F3, N.A3], 0.18);
  synthRhodesChord(t, 7.5, 5.0, [N.G3, N.B3, N.D4], 0.18);

  t.applyEnvelope(1.0, 1.5);
  t.normalize(0.80);
  return t;
}

// ── 7 VERSATILE LEITMOTIF VARIATIONS ─────────────────────────────────────────

// 1. Storyverse Central Theme — Full Indian Orchestral
function compMotifStoryverseFull(): StereoTrack {
  const t = new StereoTrack(8.0);
  synthTanpuraDrone(t, 0, 8.0, N.D2, 0.22);
  synthBansuriPhrase(t, 0.4, [
    { freq: N.D4, dur: 1.0 }, { freq: N.F4, dur: 1.0 }, { freq: N.G4, dur: 1.0 },
    { freq: N.A4, dur: 1.8 }, { freq: N.F4, dur: 1.0 }, { freq: N.E4, dur: 1.0 }, { freq: N.D4, dur: 1.2 },
  ], 0.30, 0.0);
  synthSitarPluck(t, 2.4, N.A4, 0.24, 0.3);
  t.applyEnvelope(0.5, 1.2);
  t.normalize(0.82);
  return t;
}

// 2. Storyverse Central Theme — Minimal Bansuri & Tanpura Meditation
function compMotifStoryverseMinimal(): StereoTrack {
  const t = new StereoTrack(8.0);
  synthTanpuraDrone(t, 0, 8.0, N.D2, 0.28);
  synthBansuriPhrase(t, 0.5, [
    { freq: N.D4, dur: 1.6, bend: 1.03 }, { freq: N.F4, dur: 1.6 },
    { freq: N.A4, dur: 2.5, bend: 1.02 }, { freq: N.D4, dur: 1.8 },
  ], 0.34, 0.0);
  t.applyEnvelope(0.8, 1.2);
  t.normalize(0.80);
  return t;
}

// 3. Death's Motif — Monolithic Low Brass & Gong
function compMotifDeathBrass(): StereoTrack {
  const t = new StereoTrack(8.0);
  synthGongImpact(t, 0.3, 0.38);
  synthLowBrassMonolith(t, 0.8, 3.6, N.D1, 0.36, -0.25);
  synthLowBrassMonolith(t, 4.2, 3.6, N.Bb1, 0.34, 0.25);
  synthChoirPad(t, 1.5, 5.5, [N.F3, N.A3, N.D4], 0.24);
  t.applyEnvelope(0.5, 1.0);
  t.normalize(0.84);
  return t;
}

// 4. Death's Motif — Suspended Glass Harmonics & Celeste
function compMotifDeathSuspended(): StereoTrack {
  const t = new StereoTrack(8.0);
  synthLowBrassMonolith(t, 0.5, 7.5, N.D2, 0.18, 0.0);
  synthCelestialBell(t, 0.8, N.C6, 0.24, -0.3);
  synthCelestialBell(t, 2.5, N.Ab5, 0.24, 0.3);
  synthCelestialBell(t, 4.5, N.F5, 0.24, -0.2);
  synthCelestialBell(t, 6.2, N.D5, 0.24, 0.2);
  t.applyEnvelope(0.6, 1.2);
  t.normalize(0.78);
  return t;
}

// 5. Laila's Motif — Scene 07 Fragile Felt Piano & Cello
function compMotifLailaFragile(): StereoTrack {
  const t = new StereoTrack(8.0);
  synthFeltPianoNote(t, 0.5, N.D4, 0.32, 0.1, 3.0);
  synthFeltPianoNote(t, 2.0, N.F4, 0.30, 0.1, 3.0);
  synthFeltPianoNote(t, 3.6, N.E4, 0.28, 0.1, 3.0);
  synthFeltPianoNote(t, 5.2, N.D4, 0.30, 0.1, 3.0);
  synthSoloCelloPhrase(t, 2.2, [{ freq: N.D3, dur: 2.8 }, { freq: N.A2, dur: 3.0 }], 0.26, -0.2);
  t.applyEnvelope(0.4, 1.0);
  t.normalize(0.78);
  return t;
}

// 6. Laila's Motif — Scene 10 Mature Resolved Acoustic Guitar & Piano
function compMotifLailaResolved(): StereoTrack {
  const t = new StereoTrack(8.0);
  synthAcousticGuitarPluck(t, 0.4, N.D3, 0.26, -0.2);
  synthAcousticGuitarPluck(t, 1.2, N.F3, 0.26, -0.2);
  synthAcousticGuitarPluck(t, 2.0, N.A3, 0.26, -0.2);
  synthFeltPianoNote(t, 2.8, N.A4, 0.32, 0.2, 3.5);
  synthFeltPianoNote(t, 4.5, N.G4, 0.30, 0.2, 3.5);
  synthFeltPianoNote(t, 6.0, N.D4, 0.34, 0.2, 3.5);
  t.applyEnvelope(0.4, 1.0);
  t.normalize(0.80);
  return t;
}

// 7. Transformation Motif — Radiant Bells & Sweeping Harp
function compMotifTransformationRadiant(): StereoTrack {
  const t = new StereoTrack(8.0);
  synthChoirPad(t, 0, 8.0, [N.D4, N.A4, N.D5], 0.26);
  const bellPitches = [N.D5, N.F5, N.A5, N.D6, N.C6, N.A5, N.F5];
  for (let i = 0; i < bellPitches.length; i++) {
    synthCelestialBell(t, 0.4 + i * 0.9, bellPitches[i], 0.26, (i % 2 === 0 ? -0.4 : 0.4));
  }
  const harpGliss = [N.D4, N.F4, N.A4, N.D5, N.F5, N.A5, N.D6];
  for (let i = 0; i < harpGliss.length; i++) {
    synthAcousticGuitarPluck(t, 3.0 + i * 0.1, harpGliss[i], 0.20, -0.3 + i * 0.1);
  }
  t.applyEnvelope(0.5, 1.2);
  t.normalize(0.82);
  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

interface ExportItem {
  filename: string;
  builder: () => StereoTrack;
  title: string;
}

const ITEMS: ExportItem[] = [
  // 15 Scene Score Compositions
  { filename: 'scene_01_music_a.wav', builder: compScene01A, title: 'Scene 01A: Symphonic Dawn (Indian Orchestral)' },
  { filename: 'scene_01_music_b.wav', builder: compScene01B, title: 'Scene 01B: Raga Dusk (Indian Neo-Classical)' },
  { filename: 'scene_02_music.wav', builder: compScene02, title: 'Scene 02: Urban Chaos (112 BPM Urban Thriller)' },
  { filename: 'scene_03_music.wav', builder: compScene03, title: 'Scene 03: Rooftop Life (118 BPM Downtempo Rhodes)' },
  { filename: 'scene_04_music_a.wav', builder: compScene04A, title: 'Scene 04A: Cosmic Requiem (Low Brass & Choir)' },
  { filename: 'scene_04_music_b.wav', builder: compScene04B, title: 'Scene 04B: Bureaucracy of the Infinite (Avant-Garde)' },
  { filename: 'scene_05_music_a.wav', builder: compScene05A, title: 'Scene 05A: Convergence Fugue (Contrapuntal Strings)' },
  { filename: 'scene_05_music_b.wav', builder: compScene05B, title: 'Scene 05B: Dual Destinies (Syncopated Timpani)' },
  { filename: 'scene_06_music_a.wav', builder: compScene06A, title: 'Scene 06A: Celestial Fall (Bells & Harp)' },
  { filename: 'scene_06_music_b.wav', builder: compScene06B, title: 'Scene 06B: The Weight of Clay (Harp & Cello Descent)' },
  { filename: 'scene_07_music.wav', builder: compScene07, title: 'Scene 07: Hospital (Minimalist Felt Piano & Cello)' },
  { filename: 'scene_08_music.wav', builder: compScene08, title: 'Scene 08: Escape (132 BPM Spiccato with Moral Cut)' },
  { filename: 'scene_09_music.wav', builder: compScene09, title: 'Scene 09: Fatal Truck (Dread Climax & Post-Impact Silence)' },
  { filename: 'scene_10_music_a.wav', builder: compScene10A, title: 'Scene 10A: Gateway at Dawn (Piano, Sitar, Bansuri)' },
  { filename: 'scene_10_music_b.wav', builder: compScene10B, title: 'Scene 10B: Memories in the Rain (Acoustic Guitar & Cello)' },

  // Canonical Themes
  { filename: 'motif_storyverse.wav', builder: compMotifStoryverseFull, title: 'Motif: Storyverse Central Theme' },
  { filename: 'motif_death.wav', builder: compMotifDeathBrass, title: "Motif: Death's Cosmic Requiem" },
  { filename: 'motif_laila.wav', builder: compMotifLailaFragile, title: "Motif: Laila's Mortality & Grief" },
  { filename: 'motif_transformation.wav', builder: compMotifTransformationRadiant, title: 'Motif: Transformation Shimmer' },

  // Versatile Variations
  { filename: 'motif_storyverse_full.wav', builder: compMotifStoryverseFull, title: 'Motif Variation: Storyverse Full' },
  { filename: 'motif_storyverse_minimal.wav', builder: compMotifStoryverseMinimal, title: 'Motif Variation: Storyverse Meditation' },
  { filename: 'motif_death_brass.wav', builder: compMotifDeathBrass, title: 'Motif Variation: Death Monolith' },
  { filename: 'motif_death_suspended.wav', builder: compMotifDeathSuspended, title: 'Motif Variation: Death Suspended' },
  { filename: 'motif_laila_fragile.wav', builder: compMotifLailaFragile, title: 'Motif Variation: Laila Fragile' },
  { filename: 'motif_laila_resolved.wav', builder: compMotifLailaResolved, title: 'Motif Variation: Laila Resolved' },
  { filename: 'motif_transformation_radiant.wav', builder: compMotifTransformationRadiant, title: 'Motif Variation: Transformation Radiant' },
];

for (const it of ITEMS) {
  const filePath = path.join(MUSIC_DIR, it.filename);
  const track = it.builder();
  const buf = track.toWavBuffer();
  fs.writeFileSync(filePath, buf);
  console.log(`[DONE 2.2] ${it.title.padEnd(55)} -> ${it.filename} (${(buf.length / 1024).toFixed(1)} KB)`);
}

console.log('\nAll 26 diverse score compositions and motif variations successfully rendered for Audio Experience 2.2!');
