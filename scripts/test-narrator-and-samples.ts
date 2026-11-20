import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error('Missing ELEVENLABS_API_KEY');
  process.exit(1);
}

async function synth(text: string, voiceId: string, settings: any, outPath: string) {
  console.log(`Synthesizing with voiceId ${voiceId} -> ${path.basename(outPath)}...`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey || '',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: settings,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`  FAIL (${res.status}):`, err);
    return false;
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
  console.log(`  OK (${buf.length} bytes written)`);
  return true;
}

async function main() {
  console.log('=== TESTING CANDIDATES FOR NARRATOR, DEATH & LAILA ===\n');

  const narratorText = 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.';
  
  // 1. Narrator Candidate A: Brian (Deep, Resonant and Comforting)
  await synth(
    narratorText,
    'nPczCjzI2devNBz1zQrb',
    { stability: 0.60, similarity_boost: 0.88, style: 0.20, use_speaker_boost: true },
    path.resolve(ROOT_DIR, 'public/assets/audio/voices/narrator/sample-brian.mp3')
  );

  // 2. Narrator Candidate B: Adam (Dominant, Firm Baritone)
  await synth(
    narratorText,
    'pNInz6obpgDQGcFmaJgB',
    { stability: 0.65, similarity_boost: 0.85, style: 0.15, use_speaker_boost: true },
    path.resolve(ROOT_DIR, 'public/assets/audio/voices/narrator/sample-adam.mp3')
  );

  // 3. Death: Daniel (Aristocratic Baritone)
  const deathText = "WHAT?! I'm an absolute consequence. It's in the job description! Send down a plague! Strike the child with lightning!";
  await synth(
    deathText,
    'onwK4e9ZLuTAKqWW03F9',
    { stability: 0.65, similarity_boost: 0.80, style: 0.25, use_speaker_boost: true },
    path.resolve(ROOT_DIR, 'public/assets/audio/voices/death/s04-09-death-outrage.mp3')
  );

  // 4. Laila Starr Candidate A: Alice (Clear, articulate, British/cosmopolitan)
  const lailaText = "Ohhhhh, that feels awful... Who're you?";
  await synth(
    lailaText,
    'Xb7hH8MSUJpSbSDYk0k2',
    { stability: 0.50, similarity_boost: 0.80, style: 0.35, use_speaker_boost: true },
    path.resolve(ROOT_DIR, 'public/assets/audio/voices/laila/sample-alice.mp3')
  );

  // 5. Laila Starr Candidate B: Lily (Velvety, expressive actress)
  await synth(
    lailaText,
    'pFZP5JQG7iQjIQuC4Bku',
    { stability: 0.48, similarity_boost: 0.82, style: 0.30, use_speaker_boost: true },
    path.resolve(ROOT_DIR, 'public/assets/audio/voices/laila/sample-lily.mp3')
  );

  console.log('\nAll candidate recordings finished!');
}

main().catch(console.error);
