import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';

function pcmToWav(pcmData: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const ai = new GoogleGenAI({ apiKey });
  const text = 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.';

  console.log('Generating with Gemini 2.5 Flash Preview TTS (voice: Charon)...');
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: `You are The Chronicle, a deep male baritone cinematic narrator with an authentic Indian English accent. Speak with atmospheric gravity and deliberate pacing:\n\n"${text}"`,
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Charon'
          }
        }
      }
    }
  });

  const part = res.candidates?.[0]?.content?.parts?.[0];
  if (part?.inlineData?.data) {
    const rawPcm = Buffer.from(part.inlineData.data, 'base64');
    const wav = pcmToWav(rawPcm, 24000, 1, 16);
    fs.mkdirSync('public/assets/audio/auditions/narrator', { recursive: true });
    fs.writeFileSync('public/assets/audio/auditions/narrator/test-gemini-charon.wav', wav);
    console.log('Saved valid WAV:', wav.length, 'bytes');
  } else {
    console.error('No inlineData returned');
  }
}

test().catch(console.error);
