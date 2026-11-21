/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * scripts/generate-mrs-shah-audition.ts
 *
 * Generates Mrs. Shah childbirth audition takes for s02-03:
 * Dialogue: "...The baby is coming."
 * Acting Direction:
 * - Intense physical pain & labor contractions
 * - Breathlessness, urgency, fear
 * - Strained vocal delivery without sounding cartoonish
 * - Preserves original dialogue words exactly
 * - DOES NOT overwrite production file s02-03-mrs-shah-baby.mp3
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('public/assets/audio/auditions/acting');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Sarah voice ID (used for Mrs. Shah across project)
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

const TAKES = [
  {
    takeId: 'take-1-urgent-contraction',
    label: 'Take 1: Intense Contraction Urgency',
    text: '...The baby is coming.',
    settings: {
      stability: 0.32,
      similarity_boost: 0.85,
      style: 0.65,
      use_speaker_boost: true,
    },
    notes: 'Higher emotional tension, sharp breath intake, intense labor urgency on "baby is coming".',
  },
  {
    takeId: 'take-2-strained-labor-surge',
    label: 'Take 2: Strained Labor Surge & Breathlessness',
    text: '...The baby is coming!',
    settings: {
      stability: 0.26,
      similarity_boost: 0.82,
      style: 0.72,
      use_speaker_boost: true,
    },
    notes: 'Maximal contraction strain, breathless break, shouting through the pain.',
  },
];

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not set in environment');
  }

  console.log('=== GENERATING MRS. SHAH CHILDBIRTH AUDITIONS (s02-03) ===\n');

  for (const take of TAKES) {
    const filename = `audition-s02-03-mrs_shah-${take.takeId}.mp3`;
    const outPath = path.join(OUT_DIR, filename);

    console.log(`Generating [${take.takeId}]...`);
    console.log(`  Settings: stability=${take.settings.stability}, similarity=${take.settings.similarity_boost}, style=${take.settings.style}`);
    console.log(`  Text: "${take.text}"`);

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: take.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: take.settings,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`  ✗ ElevenLabs API error ${res.status}:`, errText);
      continue;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outPath, buf);
    console.log(`  ✓ Successfully wrote ${filename} (${buf.length} bytes)\n`);
  }

  // Copy to dist/assets/audio/auditions/acting if dist exists
  const distDir = path.resolve('dist/assets/audio/auditions/acting');
  if (fs.existsSync(distDir)) {
    for (const take of TAKES) {
      const filename = `audition-s02-03-mrs_shah-${take.takeId}.mp3`;
      const srcFile = path.join(OUT_DIR, filename);
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, path.join(distDir, filename));
      }
    }
    console.log('✓ Synced audition files to dist/assets/audio/auditions/acting');
  }
}

main().catch((err) => {
  console.error('Fatal error in audition generation:', err);
  process.exit(1);
});
