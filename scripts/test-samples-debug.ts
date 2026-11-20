import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateTarget, VOICE_PROFILES } from './generate-voices';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function debugSamples() {
  console.log('=== DEBUGGING SAMPLE GENERATION ===\n');

  console.log('VOICE PROFILES ASSIGNED:');
  console.log('Narrator:', VOICE_PROFILES.narrator.name, 'Voice ID:', VOICE_PROFILES.narrator.elevenLabsVoiceId);
  console.log('Death:', VOICE_PROFILES.death.name, 'Voice ID:', VOICE_PROFILES.death.elevenLabsVoiceId);
  console.log('Laila:', VOICE_PROFILES.laila.name, 'Voice ID:', VOICE_PROFILES.laila.elevenLabsVoiceId);

  // 1. Narrator
  const narratorTarget = {
    id: 's01-01',
    character: 'narrator',
    sceneId: 'scene-01',
    transcript: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.',
    targetPath: path.resolve(ROOT_DIR, 'public/assets/audio/voices/narrator/scene-01-opening.mp3'),
    durationMs: 4800,
    category: 'narration' as const,
  };

  console.log('\n[1] Testing Narrator Generation:');
  try {
    const resNarrator = await generateTarget(narratorTarget, 'elevenlabs');
    console.log('Narrator result:', resNarrator);
  } catch (err: any) {
    console.error('Narrator exception:', err.message);
  }

  // 2. Death
  const deathTarget = {
    id: 's04-09',
    character: 'death',
    sceneId: 'scene-04',
    transcript: "WHAT?! I'm an absolute consequence. It's in the job description! Send down a plague! Strike the child with lightning!",
    targetPath: path.resolve(ROOT_DIR, 'public/assets/audio/voices/death/s04-09-death-outrage.mp3'),
    durationMs: 3500,
    category: 'dialogue' as const,
  };

  console.log('\n[2] Testing Death Generation:');
  try {
    const resDeath = await generateTarget(deathTarget, 'elevenlabs');
    console.log('Death result:', resDeath);
  } catch (err: any) {
    console.error('Death exception:', err.message);
  }

  // 3. Laila Starr
  const lailaTarget = {
    id: 's07-01',
    character: 'laila',
    sceneId: 'scene-07',
    transcript: "Ohhhhh, that feels awful... Who're you?",
    targetPath: path.resolve(ROOT_DIR, 'public/assets/audio/voices/laila/s07-01-laila-awful.mp3'),
    durationMs: 3500,
    category: 'dialogue' as const,
  };

  console.log('\n[3] Testing Laila Generation:');
  try {
    const resLaila = await generateTarget(lailaTarget, 'elevenlabs');
    console.log('Laila result:', resLaila);
  } catch (err: any) {
    console.error('Laila exception:', err.message);
  }
}

debugSamples().catch(console.error);
