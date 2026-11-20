import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function testTts() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  console.log('Testing ElevenLabs TTS with apiKey length:', apiKey?.length);

  // Default George voice ID from Voice Design Bible
  const testVoiceId = 'JBFqnCBsd6RMkjVDRZzb'; // George
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${testVoiceId}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey || '',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: 'Testing ElevenLabs voice synthesis for Storyverse.',
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
        },
      }),
    });

    console.log('TTS Status:', res.status);
    if (!res.ok) {
      const errText = await res.text();
      console.error('TTS Error:', errText);
    } else {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log(`[SUCCESS] TTS generated ${buf.length} bytes of MP3 audio!`);
    }
  } catch (err: any) {
    console.error('Network error during TTS:', err.message);
  }
}

testTts();
