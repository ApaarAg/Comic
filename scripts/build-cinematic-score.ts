/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * scripts/build-cinematic-score.ts
 *
 * Professional Cinematic Film Score Synthesis Engine for Storyverse Chapter 01.
 *
 * Generates:
 * 1. 4 Standalone Canonical Leitmotifs:
 *    - Storyverse Central Motif
 *    - Death's Cosmic Requiem Motif
 *    - Laila's Mortality & Grief Motif
 *    - Mortality & Transformation Shimmer Motif
 *
 * 2. 15 Scene Score Tracks (with Approach A and Approach B for Scenes 01, 04, 05, 06, 10):
 *    - Scene 01: Symphonic Dawn (A) vs Raga Noir (B)
 *    - Scene 02: Gridlock Tension
 *    - Scene 03: Rooftop Reverie
 *    - Scene 04: Cosmic Requiem (A) vs Ethereal Bureaucracy (B)
 *    - Scene 05: Convergence Fugue (A) vs Dual Destinies (B)
 *    - Scene 06: Celestial Fall (A) vs Transcendence (B)
 *    - Scene 07: Neonatal Sanctuary
 *    - Scene 08: Fugitive Shadows
 *    - Scene 09: Midnight Impact
 *    - Scene 10: Gateway at Dawn (A) vs Eternal Return (B)
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
// Stereo Buffer Class & Synthesis Primitives
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

    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);

    // fmt subchunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(SAMPLE_RATE, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);

    // data subchunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    let offset = 44;
    for (let i = 0; i < this.length; i++) {
      // Soft saturation clamp
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
// Note Frequencies Helper
// ─────────────────────────────────────────────────────────────────────────────

const NOTE_FREQ: Record<string, number> = {
  C2: 65.41, D2: 73.42, Eb2: 77.78, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, Bb2: 116.54, B2: 123.47,
  C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, Bb5: 932.33, B5: 987.77,
  C6: 1046.50, D6: 1174.66,
};

// ─────────────────────────────────────────────────────────────────────────────
// High-Fidelity Synthesizers
// ─────────────────────────────────────────────────────────────────────────────

/** Polyphonic Warm Orchestral Strings */
function addStringsChord(
  track: StereoTrack,
  startSec: number,
  durationSec: number,
  notes: number[],
  gain = 0.25,
  pan = 0.0,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durationSec * SAMPLE_RATE);
  const end = Math.min(track.length, start + totalSamples);
  const attack = Math.floor(Math.min(1.5, durationSec * 0.3) * SAMPLE_RATE);
  const release = Math.floor(Math.min(2.0, durationSec * 0.4) * SAMPLE_RATE);

  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  for (const freq of notes) {
    const detune1 = freq * 0.997;
    const detune2 = freq * 1.003;
    let phase1 = 0;
    let phase2 = 0;
    let phase3 = 0;

    for (let i = start; i < end; i++) {
      const idx = i - start;
      // Envelope
      let env = 1.0;
      if (idx < attack) env = idx / attack;
      else if (idx > totalSamples - release) env = (totalSamples - idx) / release;

      // Vibrato
      const vibrato = 1.0 + 0.004 * Math.sin((2 * Math.PI * 5.2 * idx) / SAMPLE_RATE);

      phase1 += (2 * Math.PI * freq * vibrato) / SAMPLE_RATE;
      phase2 += (2 * Math.PI * detune1 * vibrato) / SAMPLE_RATE;
      phase3 += (2 * Math.PI * detune2 * vibrato) / SAMPLE_RATE;

      // Warm saw + sine hybrid
      const saw1 = (phase1 / Math.PI) % 2 - 1;
      const saw2 = (phase2 / Math.PI) % 2 - 1;
      const saw3 = (phase3 / Math.PI) % 2 - 1;
      const sub = Math.sin(phase1 * 0.5);

      const sample = (saw1 * 0.35 + saw2 * 0.25 + saw3 * 0.25 + sub * 0.15) * env * gain;

      track.left[i] += sample * leftPan;
      track.right[i] += sample * rightPan;
    }
  }
}

/** Felt / Grand Piano Pluck */
function addPianoNote(
  track: StereoTrack,
  startSec: number,
  freq: number,
  gain = 0.3,
  pan = 0.0,
  decaySec = 4.0,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(decaySec * SAMPLE_RATE);
  const end = Math.min(track.length, start + totalSamples);

  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  let phase1 = 0;
  let phase2 = 0;
  let phase3 = 0;

  for (let i = start; i < end; i++) {
    const idx = i - start;
    const t = idx / SAMPLE_RATE;
    // Acoustic exponential decay
    const env = Math.exp(-t * 1.8);
    // Harmonic overtones decay faster than fundamental
    const env2 = Math.exp(-t * 3.5);
    const env3 = Math.exp(-t * 5.5);

    phase1 += (2 * Math.PI * freq) / SAMPLE_RATE;
    phase2 += (2 * Math.PI * freq * 2.001) / SAMPLE_RATE;
    phase3 += (2 * Math.PI * freq * 3.002) / SAMPLE_RATE;

    const s1 = Math.sin(phase1);
    const s2 = Math.sin(phase2) * 0.45 * env2;
    const s3 = Math.sin(phase3) * 0.2 * env3;
    const hammer = idx < 200 ? (Math.random() * 2 - 1) * 0.15 * (1 - idx / 200) : 0;

    const sample = (s1 + s2 + s3 + hammer) * env * gain;
    track.left[i] += sample * leftPan;
    track.right[i] += sample * rightPan;
  }
}

/** Celestial Bell / Glockenspiel */
function addCelestialBell(
  track: StereoTrack,
  startSec: number,
  freq: number,
  gain = 0.2,
  pan = 0.0,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(5.0 * SAMPLE_RATE);
  const end = Math.min(track.length, start + totalSamples);

  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  // Inharmonic bell ratios
  const f1 = freq;
  const f2 = freq * 2.756;
  const f3 = freq * 5.404;

  let p1 = 0, p2 = 0, p3 = 0;

  for (let i = start; i < end; i++) {
    const t = (i - start) / SAMPLE_RATE;
    const env1 = Math.exp(-t * 1.2);
    const env2 = Math.exp(-t * 3.0);
    const env3 = Math.exp(-t * 6.0);

    p1 += (2 * Math.PI * f1) / SAMPLE_RATE;
    p2 += (2 * Math.PI * f2) / SAMPLE_RATE;
    p3 += (2 * Math.PI * f3) / SAMPLE_RATE;

    const s = (Math.sin(p1) * env1 * 0.6 + Math.sin(p2) * env2 * 0.3 + Math.sin(p3) * env3 * 0.15) * gain;
    track.left[i] += s * leftPan;
    track.right[i] += s * rightPan;
  }
}

/** Ethereal Celestial Choir Pad */
function addChoirPad(
  track: StereoTrack,
  startSec: number,
  durationSec: number,
  notes: number[],
  gain = 0.2,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durationSec * SAMPLE_RATE);
  const end = Math.min(track.length, start + totalSamples);
  const attack = Math.floor(Math.min(2.0, durationSec * 0.35) * SAMPLE_RATE);
  const release = Math.floor(Math.min(2.5, durationSec * 0.4) * SAMPLE_RATE);

  for (const freq of notes) {
    let phase = 0;
    for (let i = start; i < end; i++) {
      const idx = i - start;
      let env = 1.0;
      if (idx < attack) env = idx / attack;
      else if (idx > totalSamples - release) env = (totalSamples - idx) / release;

      const vibrato = 1.0 + 0.005 * Math.sin((2 * Math.PI * 4.8 * idx) / SAMPLE_RATE);
      phase += (2 * Math.PI * freq * vibrato) / SAMPLE_RATE;

      // Vocal formant modulation (mix of /a/ and /o/)
      const raw = Math.sin(phase) + 0.4 * Math.sin(phase * 2) + 0.2 * Math.sin(phase * 3);
      const tremolo = 0.85 + 0.15 * Math.sin((2 * Math.PI * 0.8 * idx) / SAMPLE_RATE);
      const sample = raw * env * tremolo * gain;

      // Wide stereo panning
      track.left[i] += sample * 0.7;
      track.right[i] += sample * 0.9;
    }
  }
}

/** Indian Tanpura & Ambient Sitar Swell */
function addIndianDrone(
  track: StereoTrack,
  startSec: number,
  durationSec: number,
  rootFreq = NOTE_FREQ.D2,
  gain = 0.22,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durationSec * SAMPLE_RATE);
  const end = Math.min(track.length, start + totalSamples);

  // Sa - Pa - Sa' - Sa' tuning
  const sa1 = rootFreq;
  const pa = rootFreq * 1.498; // Perfect fifth
  const sa2 = rootFreq * 2.0;

  let p1 = 0, p2 = 0, p3 = 0;
  for (let i = start; i < end; i++) {
    const idx = i - start;
    p1 += (2 * Math.PI * sa1) / SAMPLE_RATE;
    p2 += (2 * Math.PI * pa) / SAMPLE_RATE;
    p3 += (2 * Math.PI * sa2) / SAMPLE_RATE;

    // Jawari buzzing harmonics
    const buzz1 = Math.sin(p1) + 0.5 * Math.sin(p1 * 3) + 0.25 * Math.sin(p1 * 5);
    const buzz2 = Math.sin(p2) + 0.4 * Math.sin(p2 * 2);
    const buzz3 = Math.sin(p3) + 0.3 * Math.sin(p3 * 4);

    const lfo = 0.7 + 0.3 * Math.sin((2 * Math.PI * 0.25 * idx) / SAMPLE_RATE);
    const sample = (buzz1 * 0.45 + buzz2 * 0.35 + buzz3 * 0.2) * lfo * gain;

    track.left[i] += sample * 0.65;
    track.right[i] += sample * 0.75;
  }
}

/** Bansuri Flute Lyrical Line */
function addBansuriPhrase(
  track: StereoTrack,
  startSec: number,
  notes: { freq: number; dur: number }[],
  gain = 0.25,
  pan = 0.1,
) {
  let currentSec = startSec;
  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  for (const n of notes) {
    const start = Math.floor(currentSec * SAMPLE_RATE);
    const totalSamples = Math.floor(n.dur * SAMPLE_RATE);
    const end = Math.min(track.length, start + totalSamples);
    const attack = Math.floor(0.15 * SAMPLE_RATE);
    const release = Math.floor(0.25 * SAMPLE_RATE);

    let phase = 0;
    for (let i = start; i < end; i++) {
      const idx = i - start;
      let env = 1.0;
      if (idx < attack) env = idx / attack;
      else if (idx > totalSamples - release) env = (totalSamples - idx) / release;

      const vibrato = 1.0 + 0.007 * Math.sin((2 * Math.PI * 5.5 * idx) / SAMPLE_RATE);
      phase += (2 * Math.PI * n.freq * vibrato) / SAMPLE_RATE;

      // Breathy flute: fundamental + second harmonic + filtered breath hiss
      const s1 = Math.sin(phase);
      const s2 = Math.sin(phase * 2) * 0.25;
      const breath = (Math.random() * 2 - 1) * 0.08 * env;

      const sample = (s1 + s2 + breath) * env * gain;
      track.left[i] += sample * leftPan;
      track.right[i] += sample * rightPan;
    }
    currentSec += n.dur;
  }
}

/** Taiko & Orchestral Percussion Hit */
function addPercussionHit(
  track: StereoTrack,
  startSec: number,
  baseFreq = 65,
  gain = 0.35,
  pan = 0.0,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(1.8 * SAMPLE_RATE);
  const end = Math.min(track.length, start + totalSamples);

  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  let phase = 0;
  for (let i = start; i < end; i++) {
    const idx = i - start;
    const t = idx / SAMPLE_RATE;
    const env = Math.exp(-t * 4.5);
    // Pitch envelope drop
    const pitchDrop = baseFreq * (1.0 + 1.8 * Math.exp(-t * 25));
    phase += (2 * Math.PI * pitchDrop) / SAMPLE_RATE;

    const membrane = Math.sin(phase) + 0.3 * Math.sin(phase * 1.95);
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 30) * 0.4;
    const sample = (membrane + noise) * env * gain;

    track.left[i] += sample * leftPan;
    track.right[i] += sample * rightPan;
  }
}

/** Deep Orchestral Low Brass / Horn Swell */
function addLowBrassSwell(
  track: StereoTrack,
  startSec: number,
  durationSec: number,
  freq: number,
  gain = 0.3,
  pan = -0.15,
) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durationSec * SAMPLE_RATE);
  const end = Math.min(track.length, start + totalSamples);
  const attack = Math.floor(durationSec * 0.4 * SAMPLE_RATE);
  const release = Math.floor(durationSec * 0.4 * SAMPLE_RATE);

  const leftPan = Math.cos(((pan + 1) * Math.PI) / 4);
  const rightPan = Math.sin(((pan + 1) * Math.PI) / 4);

  let phase = 0;
  for (let i = start; i < end; i++) {
    const idx = i - start;
    let env = 1.0;
    if (idx < attack) env = idx / attack;
    else if (idx > totalSamples - release) env = (totalSamples - idx) / release;

    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    // Resonant brass harmonics
    const s = (Math.sin(phase) + 0.6 * Math.sin(phase * 2) + 0.3 * Math.sin(phase * 3)) * env * gain;

    track.left[i] += s * leftPan;
    track.right[i] += s * rightPan;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSITION BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

console.log('Generating Storyverse Cinematic Film Score Suite...');

// ── 1. The 4 Canonical Leitmotifs ───────────────────────────────────────────

function buildMotifStoryverse(): StereoTrack {
  const track = new StereoTrack(8.0);
  // Central Theme: Dm modal melody (D4 - F4 - G4 - A4 - F4 - E4 - D4)
  addStringsChord(track, 0, 8.0, [NOTE_FREQ.D2, NOTE_FREQ.A2, NOTE_FREQ.D3], 0.22);
  const melody = [
    { freq: NOTE_FREQ.D4, dur: 1.0 },
    { freq: NOTE_FREQ.F4, dur: 1.0 },
    { freq: NOTE_FREQ.G4, dur: 1.0 },
    { freq: NOTE_FREQ.A4, dur: 1.8 },
    { freq: NOTE_FREQ.F4, dur: 1.0 },
    { freq: NOTE_FREQ.E4, dur: 1.0 },
    { freq: NOTE_FREQ.D4, dur: 1.2 },
  ];
  addBansuriPhrase(track, 0.4, melody, 0.28, 0.0);
  addIndianDrone(track, 0, 8.0, NOTE_FREQ.D2, 0.18);
  track.applyEnvelope(0.5, 1.2);
  track.normalize(0.82);
  return track;
}

function buildMotifDeath(): StereoTrack {
  const track = new StereoTrack(8.0);
  // Death's Motif: Low Dm - Bbmaj7 - Gm6 - A7 brass & choir progression
  addLowBrassSwell(track, 0, 4.0, NOTE_FREQ.D2, 0.32, -0.2);
  addLowBrassSwell(track, 4.0, 4.0, NOTE_FREQ.Bb2, 0.30, -0.2);
  addChoirPad(track, 0.5, 3.8, [NOTE_FREQ.F3, NOTE_FREQ.A3, NOTE_FREQ.D4], 0.25);
  addChoirPad(track, 4.2, 3.8, [NOTE_FREQ.F3, NOTE_FREQ.Bb3, NOTE_FREQ.D4], 0.25);
  addPianoNote(track, 0.8, NOTE_FREQ.D3, 0.35, 0.1);
  addPianoNote(track, 4.5, NOTE_FREQ.Bb2, 0.35, 0.1);
  track.applyEnvelope(0.4, 1.0);
  track.normalize(0.85);
  return track;
}

function buildMotifLaila(): StereoTrack {
  const track = new StereoTrack(8.0);
  // Laila's Motif: Fragile piano & warm cello lyrical line (F4 - E4 - D4 - C#4 - D4 - A3)
  addStringsChord(track, 0, 8.0, [NOTE_FREQ.D3, NOTE_FREQ.F3, NOTE_FREQ.A3], 0.18, -0.3);
  const notes = [
    { t: 0.5, f: NOTE_FREQ.F4 },
    { t: 1.6, f: NOTE_FREQ.E4 },
    { t: 2.8, f: NOTE_FREQ.D4 },
    { t: 4.0, f: NOTE_FREQ.C4 },
    { t: 5.2, f: NOTE_FREQ.D4 },
    { t: 6.4, f: NOTE_FREQ.A3 },
  ];
  for (const n of notes) {
    addPianoNote(track, n.t, n.f, 0.32, 0.15, 2.5);
  }
  track.applyEnvelope(0.3, 1.0);
  track.normalize(0.80);
  return track;
}

function buildMotifTransformation(): StereoTrack {
  const track = new StereoTrack(8.0);
  // Transformation Motif: Interlocking celestial bells & choir arpeggios
  addChoirPad(track, 0, 8.0, [NOTE_FREQ.A3, NOTE_FREQ.E4, NOTE_FREQ.A4], 0.22);
  const bellPitches = [NOTE_FREQ.D5, NOTE_FREQ.F5, NOTE_FREQ.A5, NOTE_FREQ.D6, NOTE_FREQ.C6, NOTE_FREQ.A5, NOTE_FREQ.F5];
  for (let i = 0; i < bellPitches.length; i++) {
    addCelestialBell(track, 0.4 + i * 0.9, bellPitches[i], 0.26, (i % 2 === 0 ? -0.4 : 0.4));
  }
  track.applyEnvelope(0.5, 1.2);
  track.normalize(0.80);
  return track;
}

// ── 2. The 15 Scene Score Compositions (15s Seamless Loops) ─────────────────

// Scene 01 Approach A: "Symphonic Dawn" (Orchestral strings, bansuri flute swells, expansive skyline opening)
function buildScene01ApproachA(): StereoTrack {
  const t = new StereoTrack(15.0);
  addIndianDrone(t, 0, 15.0, NOTE_FREQ.D2, 0.20);
  addStringsChord(t, 0, 7.5, [NOTE_FREQ.D2, NOTE_FREQ.A2, NOTE_FREQ.F3, NOTE_FREQ.A3], 0.22, -0.2);
  addStringsChord(t, 7.0, 8.0, [NOTE_FREQ.G2, NOTE_FREQ.D3, NOTE_FREQ.Bb3, NOTE_FREQ.D4], 0.24, -0.2);
  const melody = [
    { freq: NOTE_FREQ.D4, dur: 1.8 },
    { freq: NOTE_FREQ.F4, dur: 1.8 },
    { freq: NOTE_FREQ.A4, dur: 3.2 },
    { freq: NOTE_FREQ.G4, dur: 2.2 },
    { freq: NOTE_FREQ.F4, dur: 2.0 },
    { freq: NOTE_FREQ.E4, dur: 2.0 },
    { freq: NOTE_FREQ.D4, dur: 2.0 },
  ];
  addBansuriPhrase(t, 1.0, melody, 0.28, 0.15);
  addCelestialBell(t, 0.5, NOTE_FREQ.D5, 0.18, 0.4);
  addCelestialBell(t, 7.5, NOTE_FREQ.G5, 0.18, -0.4);
  t.applyEnvelope(1.0, 1.5);
  t.normalize(0.82);
  return t;
}

// Scene 01 Approach B: "Raga Noir" (Low tanpura drone, melancholic cello melody, dusk pads)
function buildScene01ApproachB(): StereoTrack {
  const t = new StereoTrack(15.0);
  addIndianDrone(t, 0, 15.0, NOTE_FREQ.D2, 0.28);
  addLowBrassSwell(t, 1.0, 6.0, NOTE_FREQ.D2, 0.24, -0.3);
  addLowBrassSwell(t, 7.5, 6.5, NOTE_FREQ.A2, 0.22, -0.3);
  addStringsChord(t, 0.5, 14.5, [NOTE_FREQ.D3, NOTE_FREQ.F3, NOTE_FREQ.A3], 0.20, 0.25);
  const pianoNotes = [
    { t: 1.5, f: NOTE_FREQ.D4 },
    { t: 3.8, f: NOTE_FREQ.Eb4 },
    { t: 6.0, f: NOTE_FREQ.D4 },
    { t: 8.5, f: NOTE_FREQ.Bb3 },
    { t: 11.2, f: NOTE_FREQ.A3 },
  ];
  for (const p of pianoNotes) {
    addPianoNote(t, p.t, p.f, 0.32, 0.1, 3.5);
  }
  t.applyEnvelope(1.0, 1.5);
  t.normalize(0.80);
  return t;
}

// Scene 02: "Gridlock Tension" (Rhythmic tension, low percussion, pulsing bass)
function buildScene02(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Pulsing bass line at 100 BPM (0.6s per beat)
  const bassNotes = [NOTE_FREQ.C2, NOTE_FREQ.C2, NOTE_FREQ.Eb2, NOTE_FREQ.F2];
  for (let step = 0; step < 24; step++) {
    const sec = step * 0.6;
    const note = bassNotes[step % bassNotes.length];
    addPianoNote(t, sec, note, 0.28, 0.0, 0.5);
    if (step % 2 === 0) {
      addPercussionHit(t, sec, 70, 0.32, step % 4 === 0 ? -0.2 : 0.2);
    }
  }
  addLowBrassSwell(t, 2.0, 5.0, NOTE_FREQ.C2, 0.26, -0.4);
  addLowBrassSwell(t, 8.0, 5.5, NOTE_FREQ.Eb2, 0.28, -0.4);
  addStringsChord(t, 1.0, 13.0, [NOTE_FREQ.G3, NOTE_FREQ.C4, NOTE_FREQ.Eb4], 0.18, 0.3);
  t.applyEnvelope(0.8, 1.2);
  t.normalize(0.84);
  return t;
}

// Scene 03: "Rooftop Reverie" (Contemporary party atmosphere, filtered electronic rhythm)
function buildScene03(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Lo-Fi filtered 4-on-the-floor kick at 116 BPM (0.517s per beat)
  for (let i = 0; i < 28; i++) {
    const sec = i * 0.517;
    addPercussionHit(t, sec, 55, 0.25, 0.0);
  }
  // Muffled Rhodes/Piano electric chord progression
  addStringsChord(t, 0, 7.5, [NOTE_FREQ.F3, NOTE_FREQ.A3, NOTE_FREQ.C4, NOTE_FREQ.E4], 0.20, -0.25);
  addStringsChord(t, 7.5, 7.5, [NOTE_FREQ.D3, NOTE_FREQ.F3, NOTE_FREQ.A3, NOTE_FREQ.C4], 0.20, 0.25);
  const leadNotes = [
    { t: 2.0, f: NOTE_FREQ.A4 },
    { t: 4.2, f: NOTE_FREQ.G4 },
    { t: 6.4, f: NOTE_FREQ.E4 },
    { t: 9.8, f: NOTE_FREQ.F4 },
    { t: 12.0, f: NOTE_FREQ.D4 },
  ];
  for (const l of leadNotes) {
    addCelestialBell(t, l.t, l.f, 0.15, 0.3);
  }
  t.applyEnvelope(1.0, 1.2);
  t.normalize(0.78);
  return t;
}

// Scene 04 Approach A: "Cosmic Requiem" (Dark orchestral atmosphere, deep strings, low brass, subtle choir)
function buildScene04ApproachA(): StereoTrack {
  const t = new StereoTrack(15.0);
  addLowBrassSwell(t, 0.5, 7.0, NOTE_FREQ.D2, 0.34, -0.3);
  addLowBrassSwell(t, 7.5, 7.0, NOTE_FREQ.Bb2, 0.32, -0.3);
  addChoirPad(t, 1.0, 6.5, [NOTE_FREQ.A3, NOTE_FREQ.D4, NOTE_FREQ.F4], 0.26);
  addChoirPad(t, 8.0, 6.5, [NOTE_FREQ.Bb3, NOTE_FREQ.D4, NOTE_FREQ.F4], 0.26);
  const pianoMotif = [
    { t: 2.5, f: NOTE_FREQ.D3 },
    { t: 5.0, f: NOTE_FREQ.F3 },
    { t: 9.5, f: NOTE_FREQ.Bb2 },
    { t: 12.0, f: NOTE_FREQ.A2 },
  ];
  for (const p of pianoMotif) {
    addPianoNote(t, p.t, p.f, 0.35, 0.2, 4.0);
  }
  addCelestialBell(t, 4.0, NOTE_FREQ.D6, 0.18, 0.4);
  addCelestialBell(t, 11.0, NOTE_FREQ.C6, 0.18, -0.4);
  t.applyEnvelope(1.2, 1.5);
  t.normalize(0.82);
  return t;
}

// Scene 04 Approach B: "Ethereal Bureaucracy" (Cold sustained string cluster, distant glass chime, hollow grandeur)
function buildScene04ApproachB(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Suspended Dm(maj7) string cluster (D, F, A, C#)
  addStringsChord(t, 0, 15.0, [NOTE_FREQ.D2, NOTE_FREQ.D3, NOTE_FREQ.F3, NOTE_FREQ.A3, NOTE_FREQ.C4], 0.25, 0.0);
  addLowBrassSwell(t, 3.0, 9.0, NOTE_FREQ.D2, 0.28, -0.2);
  const bellSequence = [
    { t: 1.0, f: NOTE_FREQ.C6 },
    { t: 4.5, f: NOTE_FREQ.A5 },
    { t: 8.0, f: NOTE_FREQ.F5 },
    { t: 11.5, f: NOTE_FREQ.D5 },
  ];
  for (const b of bellSequence) {
    addCelestialBell(t, b.t, b.f, 0.22, 0.35);
  }
  t.applyEnvelope(1.2, 1.5);
  t.normalize(0.80);
  return t;
}

// Scene 05 Approach A: "Convergence Fugue" (Gradually rising orchestral tension, repeating motifs, heartbeat pulse)
function buildScene05ApproachA(): StereoTrack {
  const t = new StereoTrack(15.0);
  // 64 BPM visceral heartbeat pulse (0.9375s interval)
  for (let i = 0; i < 16; i++) {
    const sec = i * 0.9375;
    addPercussionHit(t, sec, 48, 0.30 + i * 0.015, -0.1);
    addPercussionHit(t, sec + 0.22, 44, 0.22 + i * 0.015, 0.1);
  }
  // Rising string tension (Dm -> Em -> F -> G)
  addStringsChord(t, 0, 4.0, [NOTE_FREQ.D3, NOTE_FREQ.F3, NOTE_FREQ.A3], 0.18, -0.2);
  addStringsChord(t, 4.0, 4.0, [NOTE_FREQ.E3, NOTE_FREQ.G3, NOTE_FREQ.B3], 0.22, -0.2);
  addStringsChord(t, 8.0, 4.0, [NOTE_FREQ.F3, NOTE_FREQ.A3, NOTE_FREQ.C4], 0.26, -0.2);
  addStringsChord(t, 12.0, 3.0, [NOTE_FREQ.G3, NOTE_FREQ.B3, NOTE_FREQ.D4], 0.30, -0.2);
  // The Laila and Death motif fragments colliding
  const lead = [
    { t: 2.0, f: NOTE_FREQ.D4 },
    { t: 5.5, f: NOTE_FREQ.E4 },
    { t: 9.0, f: NOTE_FREQ.F4 },
    { t: 12.5, f: NOTE_FREQ.A4 },
  ];
  for (const l of lead) {
    addPianoNote(t, l.t, l.f, 0.32, 0.25, 2.0);
  }
  t.applyEnvelope(0.8, 1.2);
  t.normalize(0.85);
  return t;
}

// Scene 05 Approach B: "Dual Destinies" (Syncopated timpani, contrapuntal cello and violin, climactic suspension)
function buildScene05ApproachB(): StereoTrack {
  const t = new StereoTrack(15.0);
  for (let i = 0; i < 12; i++) {
    const sec = i * 1.25;
    addPercussionHit(t, sec, 58, 0.32, 0.0);
  }
  addLowBrassSwell(t, 0, 7.5, NOTE_FREQ.D2, 0.28, -0.3);
  addLowBrassSwell(t, 7.5, 7.5, NOTE_FREQ.G2, 0.32, -0.3);
  addStringsChord(t, 0, 15.0, [NOTE_FREQ.D3, NOTE_FREQ.A3, NOTE_FREQ.D4], 0.22, 0.3);
  const piano = [
    { t: 1.0, f: NOTE_FREQ.F4 },
    { t: 4.0, f: NOTE_FREQ.A4 },
    { t: 8.0, f: NOTE_FREQ.G4 },
    { t: 11.5, f: NOTE_FREQ.Bb4 },
  ];
  for (const p of piano) {
    addPianoNote(t, p.t, p.f, 0.34, 0.15, 3.0);
  }
  t.applyEnvelope(0.8, 1.2);
  t.normalize(0.84);
  return t;
}

// Scene 06 Approach A: "Celestial Fall" (Emotional orchestral release, ethereal vocal textures, delicate bells)
function buildScene06ApproachA(): StereoTrack {
  const t = new StereoTrack(15.0);
  addChoirPad(t, 0, 15.0, [NOTE_FREQ.D4, NOTE_FREQ.F4, NOTE_FREQ.A4, NOTE_FREQ.C5], 0.28);
  addStringsChord(t, 0, 7.5, [NOTE_FREQ.D2, NOTE_FREQ.A2, NOTE_FREQ.D3], 0.22, -0.3);
  addStringsChord(t, 7.5, 7.5, [NOTE_FREQ.Bb2, NOTE_FREQ.F3, NOTE_FREQ.Bb3], 0.25, -0.3);
  const bellRun = [
    { t: 1.0, f: NOTE_FREQ.A5 },
    { t: 3.2, f: NOTE_FREQ.F5 },
    { t: 5.5, f: NOTE_FREQ.D5 },
    { t: 8.0, f: NOTE_FREQ.Bb5 },
    { t: 10.5, f: NOTE_FREQ.A5 },
    { t: 12.8, f: NOTE_FREQ.F5 },
  ];
  for (const b of bellRun) {
    addCelestialBell(t, b.t, b.f, 0.24, (b.t % 2 === 0 ? 0.3 : -0.3));
  }
  t.applyEnvelope(1.0, 1.5);
  t.normalize(0.80);
  return t;
}

// Scene 06 Approach B: "Transcendence" (Warm major-seventh strings, delicate glockenspiel, breathless stillness)
function buildScene06ApproachB(): StereoTrack {
  const t = new StereoTrack(15.0);
  addStringsChord(t, 0, 7.5, [NOTE_FREQ.F3, NOTE_FREQ.A3, NOTE_FREQ.C4, NOTE_FREQ.E4], 0.24, 0.0);
  addStringsChord(t, 7.5, 7.5, [NOTE_FREQ.D3, NOTE_FREQ.F3, NOTE_FREQ.A3, NOTE_FREQ.C4], 0.24, 0.0);
  addChoirPad(t, 2.0, 11.0, [NOTE_FREQ.C4, NOTE_FREQ.E4, NOTE_FREQ.G4], 0.20);
  const notes = [
    { t: 2.0, f: NOTE_FREQ.E5 },
    { t: 5.0, f: NOTE_FREQ.C5 },
    { t: 8.5, f: NOTE_FREQ.A4 },
    { t: 11.5, f: NOTE_FREQ.G4 },
  ];
  for (const n of notes) {
    addPianoNote(t, n.t, n.f, 0.30, 0.2, 3.5);
  }
  t.applyEnvelope(1.0, 1.5);
  t.normalize(0.80);
  return t;
}

// Scene 07: "Neonatal Sanctuary" (Minimal piano, sparse strings, emotional vulnerability)
function buildScene07(): StereoTrack {
  const t = new StereoTrack(15.0);
  // Extremely sparse, poignant felt piano playing Laila's Motif in isolation
  addStringsChord(t, 0, 15.0, [NOTE_FREQ.D3, NOTE_FREQ.A3], 0.15, -0.3);
  const sparsePiano = [
    { t: 1.2, f: NOTE_FREQ.D4 },
    { t: 3.5, f: NOTE_FREQ.F4 },
    { t: 6.0, f: NOTE_FREQ.E4 },
    { t: 9.0, f: NOTE_FREQ.D4 },
    { t: 12.0, f: NOTE_FREQ.A3 },
  ];
  for (const sp of sparsePiano) {
    addPianoNote(t, sp.t, sp.f, 0.32, 0.1, 4.0);
  }
  addCelestialBell(t, 7.0, NOTE_FREQ.A5, 0.14, 0.35);
  t.applyEnvelope(1.0, 1.5);
  t.normalize(0.76);
  return t;
}

// Scene 08: "Fugitive Shadows" (Urgent rhythmic orchestration, low percussion, accelerating string patterns)
function buildScene08(): StereoTrack {
  const t = new StereoTrack(15.0);
  // 120 BPM driving pulse (0.5s interval)
  for (let i = 0; i < 30; i++) {
    const sec = i * 0.5;
    addPercussionHit(t, sec, 62, 0.28, i % 2 === 0 ? -0.2 : 0.2);
    addPianoNote(t, sec, NOTE_FREQ.D2, 0.20, 0.0, 0.4);
  }
  // Staccato string sweeps
  addStringsChord(t, 0, 5.0, [NOTE_FREQ.D3, NOTE_FREQ.F3], 0.22, -0.3);
  addStringsChord(t, 5.0, 5.0, [NOTE_FREQ.Eb3, NOTE_FREQ.G3], 0.25, -0.3);
  addStringsChord(t, 10.0, 5.0, [NOTE_FREQ.F3, NOTE_FREQ.A3], 0.28, -0.3);
  addLowBrassSwell(t, 7.5, 7.0, NOTE_FREQ.D2, 0.32, 0.3);
  t.applyEnvelope(0.8, 1.0);
  t.normalize(0.85);
  return t;
}

// Scene 09: "Midnight Impact" (Dark cinematic tension, deep orchestral impacts, gradual musical build)
function buildScene09(): StereoTrack {
  const t = new StereoTrack(15.0);
  addLowBrassSwell(t, 0, 15.0, NOTE_FREQ.D2, 0.35, -0.3);
  addIndianDrone(t, 0, 15.0, NOTE_FREQ.D2, 0.22);
  addStringsChord(t, 0, 10.0, [NOTE_FREQ.D3, NOTE_FREQ.F3, NOTE_FREQ.Ab3], 0.26, 0.2);
  // Heavy orchestral impacts building in intensity
  addPercussionHit(t, 2.0, 50, 0.32, -0.2);
  addPercussionHit(t, 6.0, 48, 0.38, 0.2);
  addPercussionHit(t, 10.0, 45, 0.45, 0.0);
  addPercussionHit(t, 13.5, 40, 0.55, 0.0); // Climax impact
  addChoirPad(t, 4.0, 10.0, [NOTE_FREQ.F4, NOTE_FREQ.Ab4, NOTE_FREQ.D5], 0.24);
  t.applyEnvelope(1.0, 1.2);
  t.normalize(0.85);
  return t;
}

// Scene 10 Approach A: "Gateway at Dawn" (Warm piano and strings, gentle Indian acoustic textures, reflective bittersweet resolution)
function buildScene10ApproachA(): StereoTrack {
  const t = new StereoTrack(15.0);
  addIndianDrone(t, 0, 15.0, NOTE_FREQ.D2, 0.22);
  addStringsChord(t, 0, 7.5, [NOTE_FREQ.D3, NOTE_FREQ.F3, NOTE_FREQ.A3], 0.20, -0.25);
  addStringsChord(t, 7.5, 7.5, [NOTE_FREQ.G3, NOTE_FREQ.B3, NOTE_FREQ.D4], 0.22, -0.25);
  const pianoLailaResolution = [
    { t: 1.5, f: NOTE_FREQ.D4 },
    { t: 3.8, f: NOTE_FREQ.F4 },
    { t: 6.2, f: NOTE_FREQ.A4 },
    { t: 9.0, f: NOTE_FREQ.G4 },
    { t: 11.5, f: NOTE_FREQ.E4 },
    { t: 13.2, f: NOTE_FREQ.D4 },
  ];
  for (const plr of pianoLailaResolution) {
    addPianoNote(t, plr.t, plr.f, 0.32, 0.15, 3.0);
  }
  const bansuriWarmth = [
    { freq: NOTE_FREQ.A4, dur: 2.5 },
    { freq: NOTE_FREQ.B4, dur: 2.0 },
    { freq: NOTE_FREQ.D5, dur: 3.5 },
  ];
  addBansuriPhrase(t, 5.0, bansuriWarmth, 0.24, -0.1);
  addCelestialBell(t, 1.0, NOTE_FREQ.D5, 0.16, 0.35);
  addCelestialBell(t, 8.5, NOTE_FREQ.D5, 0.16, 0.35);
  t.applyEnvelope(1.0, 1.5);
  t.normalize(0.80);
  return t;
}

// Scene 10 Approach B: "Eternal Return" (Solo cello carrying Laila's motif, soft Rhodes piano, ocean breeze peaceful resolve)
function buildScene10ApproachB(): StereoTrack {
  const t = new StereoTrack(15.0);
  addStringsChord(t, 0, 15.0, [NOTE_FREQ.D2, NOTE_FREQ.A2, NOTE_FREQ.F3, NOTE_FREQ.A3], 0.26, 0.0);
  const celloMotif = [
    { freq: NOTE_FREQ.F3, dur: 2.5 },
    { freq: NOTE_FREQ.E3, dur: 2.0 },
    { freq: NOTE_FREQ.D3, dur: 3.0 },
    { freq: NOTE_FREQ.A2, dur: 3.5 },
    { freq: NOTE_FREQ.D3, dur: 3.5 },
  ];
  addBansuriPhrase(t, 0.8, celloMotif, 0.26, 0.0);
  const bellWarmth = [
    { t: 2.0, f: NOTE_FREQ.D5 },
    { t: 6.0, f: NOTE_FREQ.A5 },
    { t: 10.0, f: NOTE_FREQ.F5 },
    { t: 13.0, f: NOTE_FREQ.D5 },
  ];
  for (const bw of bellWarmth) {
    addCelestialBell(t, bw.t, bw.f, 0.20, bw.t % 2 === 0 ? 0.3 : -0.3);
  }
  t.applyEnvelope(1.2, 1.5);
  t.normalize(0.80);
  return t;
}

// ── 3. Render and Export ───────────────────────────────────────────────────

interface TrackExport {
  filename: string;
  builder: () => StereoTrack;
  title: string;
  category: 'motif' | 'scene-score';
}

const EXPORTS: TrackExport[] = [
  // Canonical Motifs
  { filename: 'motif_storyverse.wav', builder: buildMotifStoryverse, title: 'Storyverse Central Motif', category: 'motif' },
  { filename: 'motif_death.wav', builder: buildMotifDeath, title: "Death's Cosmic Requiem Motif", category: 'motif' },
  { filename: 'motif_laila.wav', builder: buildMotifLaila, title: "Laila's Mortality & Grief Motif", category: 'motif' },
  { filename: 'motif_transformation.wav', builder: buildMotifTransformation, title: 'Mortality & Transformation Shimmer Motif', category: 'motif' },

  // Scene Score Tracks
  { filename: 'scene_01_music_a.wav', builder: buildScene01ApproachA, title: 'Scene 01 (Approach A) — Symphonic Dawn', category: 'scene-score' },
  { filename: 'scene_01_music_b.wav', builder: buildScene01ApproachB, title: 'Scene 01 (Approach B) — Raga Noir', category: 'scene-score' },
  { filename: 'scene_02_music.wav', builder: buildScene02, title: 'Scene 02 — Gridlock Tension', category: 'scene-score' },
  { filename: 'scene_03_music.wav', builder: buildScene03, title: 'Scene 03 — Rooftop Reverie', category: 'scene-score' },
  { filename: 'scene_04_music_a.wav', builder: buildScene04ApproachA, title: "Scene 04 (Approach A) — Cosmic Requiem", category: 'scene-score' },
  { filename: 'scene_04_music_b.wav', builder: buildScene04ApproachB, title: "Scene 04 (Approach B) — Ethereal Bureaucracy", category: 'scene-score' },
  { filename: 'scene_05_music_a.wav', builder: buildScene05ApproachA, title: 'Scene 05 (Approach A) — Convergence Fugue', category: 'scene-score' },
  { filename: 'scene_05_music_b.wav', builder: buildScene05ApproachB, title: 'Scene 05 (Approach B) — Dual Destinies', category: 'scene-score' },
  { filename: 'scene_06_music_a.wav', builder: buildScene06ApproachA, title: 'Scene 06 (Approach A) — Celestial Fall', category: 'scene-score' },
  { filename: 'scene_06_music_b.wav', builder: buildScene06ApproachB, title: 'Scene 06 (Approach B) — Transcendence', category: 'scene-score' },
  { filename: 'scene_07_music.wav', builder: buildScene07, title: 'Scene 07 — Neonatal Sanctuary', category: 'scene-score' },
  { filename: 'scene_08_music.wav', builder: buildScene08, title: 'Scene 08 — Fugitive Shadows', category: 'scene-score' },
  { filename: 'scene_09_music.wav', builder: buildScene09, title: 'Scene 09 — Midnight Impact', category: 'scene-score' },
  { filename: 'scene_10_music_a.wav', builder: buildScene10ApproachA, title: 'Scene 10 (Approach A) — Gateway at Dawn', category: 'scene-score' },
  { filename: 'scene_10_music_b.wav', builder: buildScene10ApproachB, title: 'Scene 10 (Approach B) — Eternal Return', category: 'scene-score' },
];

for (const item of EXPORTS) {
  const filePath = path.join(MUSIC_DIR, item.filename);
  const track = item.builder();
  const wavBuf = track.toWavBuffer();
  fs.writeFileSync(filePath, wavBuf);
  console.log(`[DONE] ${item.title.padEnd(45)} -> ${item.filename} (${(wavBuf.length / 1024).toFixed(1)} KB)`);
}

console.log('\nAll 19 cinematic score compositions successfully rendered and exported to public/assets/audio/music/!');
