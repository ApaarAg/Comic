/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * scripts/generate-acting-auditions.ts
 *
 * Generates the focused emotional performance audition set for Phase 3:
 * 1. Death's outrage (s04-09)
 * 2. Death's quiet vulnerability (s04-11)
 * 3. Laila's confused awakening (s07-01)
 * 4. Laila's emotional resistance (s08-02)
 * 5. Munmun's frightened urgency (s08-01)
 * 6. God's calm, detached dismissal (s04-08 and s04-10)
 * 7. Supporting character conversation: Mrs. Shah (s02-01) & Cab Driver (s02-02)
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { ACTING_BIBLE } from './build-voice-acting-bible';

const OUT_DIR = path.resolve('public/assets/audio/auditions/acting');
fs.mkdirSync(OUT_DIR, { recursive: true });

const VOICE_ID_MAP: Record<string, string> = {
  death: 'pFZP5JQG7iQjIQuC4Bku', // Lily
  laila: 'Xb7hH8MSUJpSbSDYk0k2', // Alice
  munmun: 'cgSgspJ2msm6clMCkdW9', // Jessica
  god: 'pNInz6obpgDQGcFmaJgB', // Adam
  mrs_shah: 'EXAVITQu4vr4xnSDxMaL', // Sarah
  driver: 'IKne3meq5aSn9XLyUdCD', // Charlie
  pranah: 'nPczCjzI2devNBz1zQrb', // Brian
};

const AUDITION_LINE_IDS = [
  's04-09', // Death outrage
  's04-11', // Death vulnerability
  's07-01', // Laila confused awakening
  's08-02', // Laila emotional resistance
  's08-01', // Munmun frightened urgency
  's04-08', // God dismissal
  's04-10', // God corporate
  's02-01', // Mrs. Shah traffic panic
  's02-02', // Driver traffic response
];

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not set');

  console.log('=== GENERATING PHASE 3 EMOTIONAL ACTING AUDITIONS ===\n');

  for (const lineId of AUDITION_LINE_IDS) {
    const item = ACTING_BIBLE.find((d) => d.dialogueId === lineId);
    if (!item) {
      console.warn(`Could not find acting direction for ${lineId}`);
      continue;
    }

    const voiceId = VOICE_ID_MAP[item.characterId];
    if (!voiceId) {
      console.warn(`No voice ID for character ${item.characterId}`);
      continue;
    }

    const filename = `acting-${item.dialogueId}-${item.characterId}.mp3`;
    const outPath = path.join(OUT_DIR, filename);

    console.log(`Generating [${item.dialogueId}] ${item.characterName} — ${item.primaryEmotion} (Intensity: ${item.intensity}/5)...`);
    console.log(`  Direction: ${item.emotionalArc}`);
    console.log(`  Settings: stab=${item.elevenVoiceSettings.stability}, sim=${item.elevenVoiceSettings.similarity_boost}, style=${item.elevenVoiceSettings.style}`);

    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: item.originalText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: item.elevenVoiceSettings,
        }),
      });

      if (!res.ok) {
        console.error(`  ✗ ElevenLabs error ${res.status}:`, await res.text());
        continue;
      }

      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(outPath, buf);
      console.log(`  ✓ Saved ${filename} (${buf.length} bytes)\n`);
    } catch (err: any) {
      console.error(`  ✗ Error generating ${filename}:`, err.message);
    }
  }

  console.log('Emotional acting audition generation complete!');
}

main().catch(console.error);
