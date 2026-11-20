import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const AUDITION_DIR = path.resolve('public/assets/audio/auditions/narrator');
fs.mkdirSync(AUDITION_DIR, { recursive: true });

const PASSAGES = {
  a: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.',
  b: 'And so, only a few minutes away from midnight, Laila Starr met her death once again.',
  c: 'Eight years later, the sun rose anyway — as it always has, as it always will.',
};

const ELEVEN_CANDIDATES = [
  {
    id: 'cand2-eleven-daniel',
    name: 'Candidate 2: ElevenLabs Daniel (Authoritative Broadcaster Baritone)',
    voiceId: 'onwK4e9ZLuTAKqWW03F9',
    settings: { stability: 0.55, similarity_boost: 0.85, style: 0.30, use_speaker_boost: true }
  },
  {
    id: 'cand3-eleven-george',
    name: 'Candidate 3: ElevenLabs George (Warm, Textured Storyteller)',
    voiceId: 'JBFqnCBsd6RMkjVDRZzb',
    settings: { stability: 0.50, similarity_boost: 0.80, style: 0.35, use_speaker_boost: true }
  },
  {
    id: 'cand5-eleven-adam',
    name: 'Candidate 5: ElevenLabs Adam (Dominant, Resonant Baritone)',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    settings: { stability: 0.58, similarity_boost: 0.82, style: 0.25, use_speaker_boost: true }
  }
];

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not set');

  for (const cand of ELEVEN_CANDIDATES) {
    console.log(`\nGenerating ${cand.name}...`);
    for (const [key, text] of Object.entries(PASSAGES)) {
      const filename = `${cand.id}-${key}.mp3`;
      const outPath = path.join(AUDITION_DIR, filename);

      console.log(`  - Passage ${key.toUpperCase()} -> ${filename}...`);
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${cand.voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: cand.settings,
        }),
      });

      if (!res.ok) {
        console.error(`    ✗ Error (${res.status}):`, await res.text());
        continue;
      }

      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(outPath, buf);
      console.log(`    ✓ Saved (${buf.length} bytes)`);
    }
  }

  console.log('\nElevenLabs narrator candidate generation complete!');
}

main().catch(console.error);
