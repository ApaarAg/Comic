import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const apiKey = process.env.ELEVENLABS_API_KEY;

async function synthesizeEdge(text: string, voiceName: string, options: any, outPaths: string[]) {
  console.log(`[EDGE TTS] Synthesizing "${text.slice(0, 40)}..." with ${voiceName}`);
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, options);

  const chunks: Buffer[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    audioStream.on('data', (c: Buffer) => chunks.push(c));
    audioStream.on('end', () => {
      const buf = Buffer.concat(chunks);
      for (const p of outPaths) {
        fs.mkdirSync(path.dirname(p), { recursive: true });
        fs.writeFileSync(p, buf);
        console.log(`  -> Wrote ${buf.length} bytes to ${path.relative(ROOT_DIR, p)}`);
      }
      resolve(buf);
    });
    audioStream.on('error', reject);
  });
}

async function synthesizeEleven(text: string, voiceId: string, settings: any, outPaths: string[]) {
  console.log(`[ELEVENLABS] Synthesizing "${text.slice(0, 40)}..." with ${voiceId}`);
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');

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
      voice_settings: settings,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs error (${res.status}): ${err}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  for (const p of outPaths) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, buf);
    console.log(`  -> Wrote ${buf.length} bytes to ${path.relative(ROOT_DIR, p)}`);
  }
  return buf;
}

async function main() {
  console.log('=== GENERATING ADDITIONAL PRODUCTION CONSISTENCY TESTS ===\n');

  // 1. Narrator consistency test (s01-02: B.K.C. Highway overpass)
  const narratorLine = 'Down where the elevated highway curves between glass towers, the city exhaled in horns and heat.';
  const narratorPaths = [
    path.resolve(ROOT_DIR, 'public/assets/audio/voices/narrator/s01-02-highway.mp3'),
    path.resolve(ROOT_DIR, 'public/assets/audio/voices/narrator/sample-prabhat-highway-test.mp3')
  ];
  await synthesizeEdge(
    narratorLine,
    'en-IN-PrabhatNeural',
    { pitch: '-4Hz', rate: '-10%', volume: '+10%' },
    narratorPaths
  );

  // 2. Death consistency test (s04-11: Celestial confrontation aftermath)
  const deathLine = "This is all I've ever done. What am I supposed to do?";
  const deathPaths = [
    path.resolve(ROOT_DIR, 'public/assets/audio/voices/death/s04-11-death-lost.mp3'),
    path.resolve(ROOT_DIR, 'public/assets/audio/voices/death/sample-lily-lost-test.mp3')
  ];
  await synthesizeEleven(
    deathLine,
    'pFZP5JQG7iQjIQuC4Bku', // Lily
    { stability: 0.60, similarity_boost: 0.82, style: 0.35, use_speaker_boost: true },
    deathPaths
  );

  console.log('\nConsistency test recordings successfully generated!');
}

main().catch(console.error);
