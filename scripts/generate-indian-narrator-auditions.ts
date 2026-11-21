import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

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
  opening: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.',
  reflective: 'She woke up in a body that felt borrowed, in a room that smelled of antiseptic and second chances.',
  dramatic: 'And so, only a few minutes away from midnight, Laila Starr met her death once again.',
};

async function generateElevenKabeer() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('Skipping ElevenLabs: ELEVENLABS_API_KEY is not set');
    return;
  }

  const voiceId = 'CgAFr3tqGBVDpNCRhQZ3'; // Kabeer: Indian Voice Docu's & Suspense

  for (const [key, text] of Object.entries(PASSAGES)) {
    const filename = `cand-eleven-kabeer-${key}.mp3`;
    const outPath = path.join(AUDITION_DIR, filename);

    console.log(`Generating ElevenLabs Kabeer - Passage ${key.toUpperCase()}...`);
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
            stability: 0.62,
            similarity_boost: 0.85,
            style: key === 'dramatic' ? 0.35 : key === 'reflective' ? 0.15 : 0.25,
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

async function generateGeminiCharon() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Skipping Gemini: GEMINI_API_KEY is not set');
    return;
  }
  const ai = new GoogleGenAI({ apiKey });

  for (const [key, text] of Object.entries(PASSAGES)) {
    const filename = `cand-gemini-charon-${key}.wav`;
    const outPath = path.join(AUDITION_DIR, filename);

    console.log(`Generating Gemini Charon - Passage ${key.toUpperCase()}...`);
    try {
      const moodPrompt =
        key === 'opening'
          ? 'Atmospheric, cinematic, evocative Mumbai dusk.'
          : key === 'reflective'
            ? 'Quiet, intimate, contemplative, melancholic whisper of waking in another life.'
            : 'Dramatic, intense, fateful, slow weight of approaching midnight.';

      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: `You are the narrator of a graphic novel set in Mumbai. Deliver with an authentic, natural Indian English accent. Tone: ${moodPrompt}\n\nDeliver the line:\n"${text}"`,
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Charon',
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

async function main() {
  console.log('=== GENERATING INDIAN NARRATOR AUDITIONS ===\n');
  await generateElevenKabeer();
  await generateGeminiCharon();
  console.log('\nAudition generation complete!');
}

main().catch(console.error);
