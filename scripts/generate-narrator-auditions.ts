/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * scripts/generate-narrator-auditions.ts
 *
 * Generates audition tracks across identical passages for 4 distinct narrator candidates:
 * 1. Google Gemini 3.8/2.5 Flash TTS: Charon (Deep, resonant Indian English male baritone)
 * 2. Google Gemini 3.8/2.5 Flash TTS: Fenrir (Commanding, textured chest-resonant baritone)
 * 3. Google Gemini 3.8/2.5 Flash TTS: Puck (Articulate, expressive Indian English storyteller)
 * 4. ElevenLabs Multilingual v2: Brian (Legendary deep, warm resonant narrator)
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';

const AUDITION_DIR = path.resolve('public/assets/audio/auditions/narrator');
fs.mkdirSync(AUDITION_DIR, { recursive: true });

function pcmToWav(pcmData: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}

const PASSAGES = {
  a: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.',
  b: 'And so, only a few minutes away from midnight, Laila Starr met her death once again.',
  c: 'Eight years later, the sun rose anyway — as it always has, as it always will.',
};

const GEMINI_CANDIDATES = [
  {
    id: 'cand1-gemini-charon',
    name: 'Candidate 1: Gemini Charon',
    voice: 'Charon',
    persona: 'The Chronicle. Deep, resonant, full-bodied male baritone with an authentic, natural Indian English accent. Speak with atmospheric gravity, warm chest resonance, deliberate pacing, and cinematic weight.',
  },
  {
    id: 'cand2-gemini-fenrir',
    name: 'Candidate 2: Gemini Fenrir',
    voice: 'Fenrir',
    persona: 'The Chronicle. Bold, commanding, authoritative mature male baritone with an authentic Indian English accent. Deliver with rich low-register gravitas, subtle gravelly texture, and measured storytelling cadence.',
  },
  {
    id: 'cand3-gemini-puck',
    name: 'Candidate 3: Gemini Puck',
    voice: 'Puck',
    persona: 'The Chronicle. Mature Indian English literary storyteller. Expressive, emotionally nuanced, warm baritone with natural pauses and thoughtful articulation.',
  },
];

async function generateGeminiCandidate(candidate: typeof GEMINI_CANDIDATES[0]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Skipping Gemini: GEMINI_API_KEY is not set');
    return;
  }
  const ai = new GoogleGenAI({ apiKey });

  for (const [key, text] of Object.entries(PASSAGES)) {
    const filename = `${candidate.id}-${key}.wav`;
    const outPath = path.join(AUDITION_DIR, filename);

    console.log(`Generating ${candidate.name} - Passage ${key.toUpperCase()}...`);
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: `You are voice acting as ${candidate.persona}\n\nDeliver the following line:\n"${text}"`,
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: candidate.voice,
              },
            },
          },
        },
      });

      const part = res.candidates?.[0]?.content?.parts?.[0];
      if (part?.inlineData?.data) {
        const rawPcm = Buffer.from(part.inlineData.data, 'base64');
        const wav = pcmToWav(rawPcm, 24000, 1, 16);
        fs.writeFileSync(outPath, wav);
        console.log(`  ✓ Saved ${filename} (${wav.length} bytes)`);
      } else {
        console.error(`  ✗ No audio data returned for ${filename}`);
      }
    } catch (err: any) {
      console.error(`  ✗ Error generating ${filename}:`, err.message);
    }
  }
}

async function generateElevenBrian() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('Skipping ElevenLabs: ELEVENLABS_API_KEY is not set');
    return;
  }

  const voiceId = 'nPczCjzI2devNBz1zQrb'; // Brian - Deep, Resonant and Comforting

  for (const [key, text] of Object.entries(PASSAGES)) {
    const filename = `cand4-eleven-brian-${key}.mp3`;
    const outPath = path.join(AUDITION_DIR, filename);

    console.log(`Generating Candidate 4: ElevenLabs Brian - Passage ${key.toUpperCase()}...`);
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.60,
            similarity_boost: 0.82,
            style: 0.28,
            use_speaker_boost: true,
          },
        }),
      });

      if (!res.ok) {
        console.error(`  ✗ ElevenLabs error ${res.status}:`, await res.text());
        continue;
      }

      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(outPath, buf);
      console.log(`  ✓ Saved ${filename} (${buf.length} bytes)`);
    } catch (err: any) {
      console.error(`  ✗ Error generating ${filename}:`, err.message);
    }
  }
}

async function main() {
  console.log('=== GENERATING NARRATOR AUDITION CANDIDATES ===\n');

  for (const c of GEMINI_CANDIDATES) {
    await generateGeminiCandidate(c);
  }

  await generateElevenBrian();

  console.log('\nNarrator audition generation complete!');
}

main().catch(console.error);
