import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const AUDITION_DIR = path.resolve('public/assets/audio/auditions/narrator');
fs.mkdirSync(AUDITION_DIR, { recursive: true });

const BRIAN_VOICE_ID = 'nPczCjzI2devNBz1zQrb';

const PASSAGES = {
  opening: {
    label: 'Passage 1 · Opening (Atmospheric & Engaging)',
    text: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.',
    style: 0.22,
    stability: 0.54,
  },
  reflective: {
    label: "Passage 2 · Reflective (Warm & Intimate)",
    text: 'She woke up in a body that felt borrowed, in a room that smelled of antiseptic and second chances.',
    style: 0.18,
    stability: 0.56,
  },
  dramatic: {
    label: 'Passage 3 · Dramatic (Urgent & Fateful)',
    text: 'And so, only a few minutes away from midnight, Laila Starr met her death once again.',
    style: 0.30,
    stability: 0.50,
  },
};

const SPEEDS = [
  { rate: 1.00, tag: '100', label: '1.00x · Natural Baseline' },
  { rate: 1.05, tag: '105', label: '1.05x · Slightly Brisker' },
  { rate: 1.10, tag: '110', label: '1.10x · Energetic & Controlled' },
];

async function generateClip(key: 'opening' | 'reflective' | 'dramatic', speedObj: typeof SPEEDS[0]) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not set');
  }

  const passage = PASSAGES[key];
  const filename = `cand-brian-${speedObj.tag}-${key}.mp3`;
  const outPath = path.join(AUDITION_DIR, filename);

  console.log(`Generating Brian [${speedObj.label}] - ${key.toUpperCase()}...`);

  const payload = {
    text: passage.text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: passage.stability,
      similarity_boost: 0.82,
      style: passage.style,
      use_speaker_boost: true,
      speed: speedObj.rate,
    },
  };

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${BRIAN_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ElevenLabs error ${res.status}: ${errText}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buf);
  console.log(`  ✓ Saved ${filename} (${buf.length} bytes)`);

  return {
    filename,
    path: `/assets/audio/auditions/narrator/${filename}`,
    sizeBytes: buf.length,
    speed: speedObj.rate,
    passage: key,
  };
}

async function main() {
  console.log('=== GENERATING BRIAN PACING AUDITIONS (1.00x, 1.05x, 1.10x) ===\n');

  const results = [];

  for (const speed of SPEEDS) {
    console.log(`\n--- Speed Tier: ${speed.label} ---`);
    for (const key of ['opening', 'reflective', 'dramatic'] as const) {
      try {
        const item = await generateClip(key, speed);
        results.push(item);
        // Small delay to be polite to the API
        await new Promise((r) => setTimeout(r, 600));
      } catch (err: any) {
        console.error(`  ✗ Error generating ${key} at ${speed.rate}x:`, err.message);
      }
    }
  }

  const manifestPath = path.join(AUDITION_DIR, 'brian-pacing-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nSaved pacing manifest to ${manifestPath}`);
  console.log(`Generated ${results.length} / 9 pacing tracks.`);
}

main().catch(console.error);
