import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing Gemini API key:', apiKey?.slice(0, 10));

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.log('Gemini API key is placeholder');
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Say "Storyverse cinematic audio verification" in one sentence.',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Fenrir', // Deep voice
            },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    if (part?.inlineData?.data) {
      const buffer = Buffer.from(part.inlineData.data, 'base64');
      console.log(`[SUCCESS] Gemini generated ${buffer.length} bytes of audio (${part.inlineData.mimeType})!`);
    } else {
      console.log('No audio returned, response was:', JSON.stringify(response, null, 2));
    }
  } catch (err: any) {
    console.error('Gemini error:', err.message);
  }
}

testGemini();
