import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';

async function testTTS() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  console.log('Testing gemini-2.5-flash-preview-tts...');
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Puck'
            }
          }
        }
      }
    });

    console.log('Candidates count:', res.candidates?.length);
    const candidate = res.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    console.log('Part keys:', part ? Object.keys(part) : 'null');
    if (part?.inlineData?.data) {
      console.log('Inline data mimeType:', part.inlineData.mimeType, 'length:', part.inlineData.data.length);
      const buf = Buffer.from(part.inlineData.data, 'base64');
      fs.writeFileSync('test-tts.wav', buf);
      console.log('Wrote test-tts.wav:', buf.length, 'bytes');
    }
  } catch (err: any) {
    console.error('Error with gemini-2.5-flash-preview-tts:', err);
  }
}

testTTS().catch(console.error);
