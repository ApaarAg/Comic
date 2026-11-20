import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { MsEdgeTTS } from 'msedge-tts';
import fs from 'node:fs';

async function main() {
  console.log('=== INVESTIGATING TTS PROVIDERS FOR AUDIO EXPERIENCE 2.0 ===\n');

  // 1. Check ElevenLabs Indian & Deep Voices
  const xiKey = process.env.ELEVENLABS_API_KEY;
  console.log('1. Checking ElevenLabs Account Voices...');
  if (xiKey) {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': xiKey }
    });
    if (res.ok) {
      const data = await res.json();
      const indianVoices = data.voices.filter((v: any) =>
        (v.labels?.accent?.toLowerCase() || '').includes('indian') ||
        v.name.toLowerCase().includes('indian') ||
        ['kabeer', 'rohit', 'arjun', 'piku'].some(k => v.name.toLowerCase().includes(k))
      );
      console.log(`  Found ${indianVoices.length} Indian voices in ElevenLabs account:`);
      for (const v of indianVoices) {
        console.log(`   - [${v.voice_id}] "${v.name}" (${v.category}, ${v.labels?.gender}, ${v.labels?.age || 'age N/A'})`);
      }
    } else {
      console.log('  ElevenLabs /v1/voices status:', res.status);
    }
  }

  // 2. Check MsEdgeTTS / Azure HD TTS Indian Voices
  console.log('\n2. Checking MsEdgeTTS / Azure Voices...');
  try {
    const tts = new MsEdgeTTS();
    const voices = await tts.getVoices();
    const indianVoices = voices.filter((v) =>
      v.Locale.includes('IN') || v.ShortName.includes('IN')
    );
    console.log(`  Found ${indianVoices.length} Indian voices in Edge/Azure:`);
    for (const v of indianVoices) {
      console.log(`   - ${v.ShortName} (${v.Gender}) : ${v.FriendlyName}`);
    }
  } catch (err: any) {
    console.log('  Edge TTS error:', err.message);
  }

  // 3. Check Google Gemini TTS
  console.log('\n3. Checking Google Gemini TTS...');
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    console.log('  Testing Gemini 2.5 Flash Preview TTS voices...');
    const testVoices = ['Fenrir', 'Charon', 'Puck', 'Aoede', 'Kore'];
    for (const vName of testVoices) {
      try {
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-tts',
          contents: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.',
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: vName
                }
              }
            }
          }
        });
        const inlineData = res.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        console.log(`   - Voice "${vName}": ${inlineData && inlineData.data ? '✅ SUCCESS (' + inlineData.mimeType + ', len: ' + inlineData.data.length + ')' : '❌ No data'}`);
      } catch (e: any) {
        console.log(`   - Voice "${vName}": ❌ ${e.message}`);
      }
    }
  }
}

main().catch(console.error);
