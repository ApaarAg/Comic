import 'dotenv/config';
import fs from 'node:fs';

async function testEleven() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not set');

  const voices = [
    { name: 'Kabeer', id: 'CgAFr3tqGBVDpNCRhQZ3' },
    { name: 'Rohit', id: 'evQzTzga6HvqLviqWOo6' }
  ];

  const text = 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.';

  for (const v of voices) {
    console.log(`Generating with ElevenLabs voice: ${v.name} (${v.id})...`);
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        Accept: 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.78,
          style: 0.35,
          use_speaker_boost: true
        }
      })
    });

    if (!res.ok) {
      console.error(`Error for ${v.name}:`, res.status, await res.text());
      continue;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync('public/assets/audio/auditions/narrator', { recursive: true });
    fs.writeFileSync(`public/assets/audio/auditions/narrator/test-eleven-${v.name.toLowerCase()}.mp3`, buf);
    console.log(`Saved test-eleven-${v.name.toLowerCase()}.mp3: ${buf.length} bytes`);
  }
}

testEleven().catch(console.error);
