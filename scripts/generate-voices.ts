/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * scripts/generate-voices.ts
 *
 * Automated Voice Production Pipeline for Storyverse.
 * Generates character dialogue and narration voice assets using ElevenLabs or Google Cloud TTS.
 *
 * Usage:
 *   npx tsx scripts/generate-voices.ts --check-credentials
 *   npx tsx scripts/generate-voices.ts --samples [--provider=elevenlabs|google]
 *   npx tsx scripts/generate-voices.ts --all [--provider=elevenlabs|google]
 *   npx tsx scripts/generate-voices.ts --manifest
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REQUIRED_VOICE_ASSETS, type VoiceAssetRequirement } from '../src/story/voiceManifest';
import { SCENE_NARRATION_BEATS, type NarrationBeat } from '../src/narrative/narrativeManifest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const VOICES_DIR = path.resolve(ROOT_DIR, 'public/assets/audio/voices');
const MANIFEST_FILE = path.join(VOICES_DIR, 'manifest.json');

// ─────────────────────────────────────────────────────────────────────────────
// Voice Identity Mapping (Acoustic profiles from Voice Design Bible)
// ─────────────────────────────────────────────────────────────────────────────

export interface CharacterVoiceProfile {
  characterId: string;
  name: string;
  elevenLabsVoiceId: string;
  elevenLabsSettings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  googleTtsVoice: {
    languageCode: string;
    name: string;
    ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  };
  googleAudioConfig: {
    speakingRate: number;
    pitch: number;
  };
  emotionGuidance: string;
}

export const VOICE_PROFILES: Record<string, CharacterVoiceProfile> = {
  narrator: {
    characterId: 'narrator',
    name: 'The Chronicle',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_NARRATOR || 'JBFqnCBsd6RMkjVDRZzb', // George
    elevenLabsSettings: { stability: 0.75, similarity_boost: 0.85, style: 0.15 },
    googleTtsVoice: { languageCode: 'en-IN', name: 'en-IN-Wavenet-B', ssmlGender: 'MALE' },
    googleAudioConfig: { speakingRate: 0.92, pitch: -1.5 },
    emotionGuidance: 'Measured, warm, literary observer. Intimate close-mic, no rush.',
  },
  death: {
    characterId: 'death',
    name: 'Death',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_DEATH || 'onwK4e9ZLuTAKqWW03F9', // Daniel
    elevenLabsSettings: { stability: 0.65, similarity_boost: 0.80, style: 0.25 },
    googleTtsVoice: { languageCode: 'en-GB', name: 'en-GB-Neural2-D', ssmlGender: 'MALE' },
    googleAudioConfig: { speakingRate: 0.96, pitch: -2.8 },
    emotionGuidance: 'Commanding, velvety baritone with crisp poise cracking into incredulity.',
  },
  laila: {
    characterId: 'laila',
    name: 'Laila Starr',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_LAILA || 'oWAxZDx7w5VEj9dCyTeq', // Alice (expressive, articulate, dry mortal wit)
    elevenLabsSettings: { stability: 0.50, similarity_boost: 0.80, style: 0.35 },
    googleTtsVoice: { languageCode: 'en-IN', name: 'en-IN-Neural2-A', ssmlGender: 'FEMALE' },
    googleAudioConfig: { speakingRate: 0.98, pitch: 0.2 },
    emotionGuidance: 'Husky, breathless, mortal aches, dry mordant humor concealing empathy.',
  },
  god: {
    characterId: 'god',
    name: 'Purveyor of All Goodness',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_GOD || 'pNInz6obpgDQGcFmaJgB', // Adam (deep, resonant, smiling divine authority)
    elevenLabsSettings: { stability: 0.80, similarity_boost: 0.85, style: 0.10 },
    googleTtsVoice: { languageCode: 'en-IN', name: 'en-IN-Wavenet-B', ssmlGender: 'MALE' },
    googleAudioConfig: { speakingRate: 0.88, pitch: -2.2 },
    emotionGuidance: 'Golden warm bass, smiling vocal cords, disarming corporate-divine finality.',
  },
  munmun: {
    characterId: 'munmun',
    name: 'Munmun',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_MUNMUN || 'MF3mGyEYCl7XYWbV9V6O', // Elli
    elevenLabsSettings: { stability: 0.48, similarity_boost: 0.75, style: 0.35 },
    googleTtsVoice: { languageCode: 'en-IN', name: 'en-IN-Neural2-D', ssmlGender: 'FEMALE' },
    googleAudioConfig: { speakingRate: 1.08, pitch: 3.2 },
    emotionGuidance: 'Silvery, bright, quirky teenage ghost in a moonlit ward.',
  },
  agni: {
    characterId: 'agni',
    name: 'Agni',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_AGNI || 'TxGEqnHWrfWFTfGW9XjX', // Josh
    elevenLabsSettings: { stability: 0.65, similarity_boost: 0.75, style: 0.15 },
    googleTtsVoice: { languageCode: 'en-IN', name: 'en-IN-Wavenet-D', ssmlGender: 'MALE' },
    googleAudioConfig: { speakingRate: 1.02, pitch: 0.8 },
    emotionGuidance: 'Polite, slightly harried celestial bureaucrat trying to keep diplomatic peace.',
  },
  mrs_shah: {
    characterId: 'mrs_shah',
    name: 'Mrs. Shah',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_MRS_SHAH || 'pMsXgqR3gPkWg3m7R7wK', // Serena
    elevenLabsSettings: { stability: 0.35, similarity_boost: 0.80, style: 0.40 },
    googleTtsVoice: { languageCode: 'en-IN', name: 'en-IN-Wavenet-A', ssmlGender: 'FEMALE' },
    googleAudioConfig: { speakingRate: 1.15, pitch: 2.0 },
    emotionGuidance: 'Breathless panic over the phone; rising urgency as labor pains strike.',
  },
  driver: {
    characterId: 'driver',
    name: 'Cab Driver',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_DRIVER || 'IKne3meq5aSn9XLyUdCD', // Charlie
    elevenLabsSettings: { stability: 0.55, similarity_boost: 0.70 },
    googleTtsVoice: { languageCode: 'en-IN', name: 'en-IN-Wavenet-C', ssmlGender: 'MALE' },
    googleAudioConfig: { speakingRate: 1.10, pitch: 1.2 },
    emotionGuidance: 'Flustered Mumbai taxi street urgency over traffic noise.',
  },
  dhiraj: {
    characterId: 'dhiraj',
    name: 'Dhiraj',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_DHIRAJ || 'SOYHLrjzK2X1ezoPC6cr', // Harry
    elevenLabsSettings: { stability: 0.58, similarity_boost: 0.72 },
    googleTtsVoice: { languageCode: 'en-IN', name: 'en-IN-Neural2-B', ssmlGender: 'MALE' },
    googleAudioConfig: { speakingRate: 1.08, pitch: 1.5 },
    emotionGuidance: 'Animated, slightly pretentious university film-student swagger.',
  },
  girl: {
    characterId: 'girl',
    name: 'Girl at the Window',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_GIRL || 'piTKgcLEGmPE4e6mEKli', // Nicole
    elevenLabsSettings: { stability: 0.75, similarity_boost: 0.82 },
    googleTtsVoice: { languageCode: 'en-IN', name: 'en-IN-Wavenet-A', ssmlGender: 'FEMALE' },
    googleAudioConfig: { speakingRate: 0.88, pitch: -0.8 },
    emotionGuidance: 'Quiet, detached, poetic internal reflection looking out at city lights.',
  },
  security: {
    characterId: 'security',
    name: 'Hospital Security',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_SECURITY || 'N2lVS1w4EtoT3dr4eOWO', // Marcus
    elevenLabsSettings: { stability: 0.60, similarity_boost: 0.75 },
    googleTtsVoice: { languageCode: 'en-IN', name: 'en-IN-Wavenet-B', ssmlGender: 'MALE' },
    googleAudioConfig: { speakingRate: 1.18, pitch: -1.0 },
    emotionGuidance: 'Booming, urgent raised voice echoing down hospital stairwell.',
  },
  pranah: {
    characterId: 'pranah',
    name: 'Pranah',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_PRANAH || 'VR6AewLTigWG4xSOukaG', // Arnold
    elevenLabsSettings: { stability: 0.72, similarity_boost: 0.80 },
    googleTtsVoice: { languageCode: 'en-IN', name: 'en-IN-Wavenet-B', ssmlGender: 'MALE' },
    googleAudioConfig: { speakingRate: 0.86, pitch: -3.5 },
    emotionGuidance: 'Serene, affectionate, softly amused warmth over morning tea.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Credential Verification
// ─────────────────────────────────────────────────────────────────────────────

export interface CredentialStatus {
  hasElevenLabs: boolean;
  hasGoogleTts: boolean;
  hasGemini: boolean;
  activeProvider: 'elevenlabs' | 'google' | 'none';
}

export function checkCredentials(): CredentialStatus {
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  const hasElevenLabs = Boolean(elevenKey && elevenKey.trim().length > 10 && !elevenKey.includes('YOUR_'));

  const googleKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasGoogleTts = Boolean(googleKey && googleKey.trim().length > 10);

  const geminiKey = process.env.GEMINI_API_KEY;
  const hasGemini = Boolean(geminiKey && geminiKey.trim().length > 10 && geminiKey !== 'MY_GEMINI_API_KEY');

  const activeProvider = hasElevenLabs ? 'elevenlabs' : hasGoogleTts ? 'google' : 'none';

  return { hasElevenLabs, hasGoogleTts, hasGemini, activeProvider };
}

// ─────────────────────────────────────────────────────────────────────────────
// ElevenLabs API Client
// ─────────────────────────────────────────────────────────────────────────────

async function generateElevenLabsAudio(
  text: string,
  voiceProfile: CharacterVoiceProfile,
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');

  const voiceId = voiceProfile.elevenLabsVoiceId;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: voiceProfile.elevenLabsSettings,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ─────────────────────────────────────────────────────────────────────────────
// Google Cloud TTS Client (REST API)
// ─────────────────────────────────────────────────────────────────────────────

async function generateGoogleTtsAudio(
  text: string,
  voiceProfile: CharacterVoiceProfile,
): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_TTS_API_KEY not configured');

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: voiceProfile.googleTtsVoice,
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: voiceProfile.googleAudioConfig.speakingRate,
        pitch: voiceProfile.googleAudioConfig.pitch,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google TTS API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { audioContent?: string };
  if (!data.audioContent) throw new Error('No audioContent returned from Google TTS');

  return Buffer.from(data.audioContent, 'base64');
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch Generator Core
// ─────────────────────────────────────────────────────────────────────────────

export interface GenerationTarget {
  id: string;
  character: string;
  sceneId: string;
  transcript: string;
  targetPath: string;
  durationMs: number;
  category: 'narration' | 'dialogue';
}

export function buildCompleteLineCatalogue(): GenerationTarget[] {
  const list: GenerationTarget[] = [];

  // Narration Beats
  for (const beat of SCENE_NARRATION_BEATS) {
    list.push({
      id: beat.id,
      character: 'narrator',
      sceneId: beat.sceneId,
      transcript: beat.text,
      targetPath: path.resolve(ROOT_DIR, `public${beat.audioSrc}`),
      durationMs: beat.durationMs,
      category: 'narration',
    });
  }

  // Character Dialogue
  for (const line of REQUIRED_VOICE_ASSETS) {
    // Avoid duplicates if already in narration beats
    if (!list.some((item) => item.id === line.lineId)) {
      list.push({
        id: line.lineId,
        character: line.character,
        sceneId: line.sceneId,
        transcript: line.transcript,
        targetPath: path.resolve(ROOT_DIR, line.targetPath),
        durationMs: 3500, // standard dialogue line estimation
        category: line.mode === 'narrator' ? 'narration' : 'dialogue',
      });
    }
  }

  return list;
}

export async function generateTarget(
  target: GenerationTarget,
  provider: 'elevenlabs' | 'google',
): Promise<{ success: boolean; error?: string; bytesWritten?: number }> {
  const profile = VOICE_PROFILES[target.character] || VOICE_PROFILES.narrator;
  fs.mkdirSync(path.dirname(target.targetPath), { recursive: true });

  try {
    let buffer: Buffer;
    if (provider === 'elevenlabs') {
      buffer = await generateElevenLabsAudio(target.transcript, profile);
    } else {
      buffer = await generateGoogleTtsAudio(target.transcript, profile);
    }

    fs.writeFileSync(target.targetPath, buffer);
    return { success: true, bytesWritten: buffer.length };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Manifest Publisher
// ─────────────────────────────────────────────────────────────────────────────

export interface VoiceManifestRecord {
  id: string;
  characterId: string;
  characterName: string;
  sceneId: string;
  category: 'narration' | 'dialogue';
  transcript: string;
  audioPath: string;
  durationMs: number;
  fileExists: boolean;
  fileSizeBytes: number;
  emotion: string;
}

export function generateVoiceManifest(): { records: VoiceManifestRecord[]; availableCount: number } {
  const catalogue = buildCompleteLineCatalogue();
  const records: VoiceManifestRecord[] = [];
  let availableCount = 0;

  for (const item of catalogue) {
    const fileExists = fs.existsSync(item.targetPath);
    const size = fileExists ? fs.statSync(item.targetPath).size : 0;
    if (fileExists) availableCount++;

    const profile = VOICE_PROFILES[item.character] || VOICE_PROFILES.narrator;
    const relPath = path.relative(path.resolve(ROOT_DIR, 'public'), item.targetPath).replace(/\\/g, '/');

    records.push({
      id: item.id,
      characterId: item.character,
      characterName: profile.name,
      sceneId: item.sceneId,
      category: item.category,
      transcript: item.transcript,
      audioPath: `/${relPath}`,
      durationMs: item.durationMs,
      fileExists,
      fileSizeBytes: size,
      emotion: profile.emotionGuidance,
    });
  }

  fs.mkdirSync(VOICES_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), totalLines: records.length, availableCount, records }, null, 2));

  return { records, availableCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI Command Dispatcher
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const creds = checkCredentials();

  console.log('\n======================================================');
  console.log(' STORYVERSE — CHARACTER VOICE PRODUCTION PIPELINE');
  console.log('======================================================\n');

  if (args.includes('--check-credentials') || args.length === 0) {
    console.log('CREDENTIAL CHECK:');
    console.log(`- ElevenLabs API:   ${creds.hasElevenLabs ? 'CONFIGURED [OK]' : 'MISSING'}`);
    console.log(`- Google TTS API:   ${creds.hasGoogleTts ? 'CONFIGURED [OK]' : 'MISSING'}`);
    console.log(`- Gemini API:       ${creds.hasGemini ? 'CONFIGURED [OK]' : 'MISSING'}`);
    console.log(`- Active Provider:  ${creds.activeProvider.toUpperCase()}`);

    if (creds.activeProvider === 'none') {
      console.log('\n[!] ACTION REQUIRED TO GENERATE AUDIO ASSETS:');
      console.log('To generate live character voices and narration, configure one of the following in your .env file:');
      console.log('  Option A (Recommended for cinema grade):');
      console.log('    ELEVENLABS_API_KEY="your-elevenlabs-api-key"');
      console.log('  Option B (High quality Indian-English Neural2):');
      console.log('    GOOGLE_TTS_API_KEY="your-google-cloud-api-key"');
      console.log('    or GEMINI_API_KEY="your-gemini-api-key"');
    }
  }

  // Update Manifest
  const manifestResult = generateVoiceManifest();
  console.log(`\nManifest updated at ${path.relative(ROOT_DIR, MANIFEST_FILE)}`);
  console.log(`- Total voice catalog lines: ${manifestResult.records.length}`);
  console.log(`- Audio files on disk:      ${manifestResult.availableCount}`);

  // Sample Generation
  if (args.includes('--samples')) {
    console.log('\n--- SAMPLE VOICE GENERATION (Narrator, Death, Laila) ---');
    if (creds.activeProvider === 'none') {
      console.log('[ERROR] Cannot generate audio without credentials. Set ELEVENLABS_API_KEY or GOOGLE_TTS_API_KEY in .env');
      process.exit(1);
    }

    const provider = args.find((a) => a.startsWith('--provider='))?.split('=')[1] as 'elevenlabs' | 'google' || creds.activeProvider as 'elevenlabs' | 'google';
    const samples = [
      { id: 's01-01', character: 'narrator', text: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.' },
      { id: 's04-09', character: 'death', text: "WHAT?! I'm an absolute consequence. It's in the job description! Send down a plague! Strike the child with lightning!" },
      { id: 's07-01', character: 'laila', text: 'Ohhhhh, that feels awful... Who\'re you?' },
    ];

    for (const sample of samples) {
      const target = manifestResult.records.find((r) => r.id === sample.id);
      if (!target) continue;
      console.log(`Generating sample: [${sample.character}] ${sample.id}...`);
      const fullTarget: GenerationTarget = {
        id: target.id,
        character: target.characterId,
        sceneId: target.sceneId,
        transcript: target.transcript,
        targetPath: path.resolve(ROOT_DIR, `public${target.audioPath}`),
        durationMs: target.durationMs,
        category: target.category,
      };
      const res = await generateTarget(fullTarget, provider);
      if (res.success) {
        console.log(`  -> Wrote ${res.bytesWritten} bytes to ${target.audioPath}`);
      } else {
        console.error(`  -> Failed: ${res.error}`);
      }
    }
  }

  // Full Batch Generation
  if (args.includes('--all')) {
    console.log('\n--- FULL BATCH VOICE GENERATION ---');
    if (creds.activeProvider === 'none') {
      console.log('[ERROR] Cannot generate audio without credentials. Set ELEVENLABS_API_KEY or GOOGLE_TTS_API_KEY in .env');
      process.exit(1);
    }

    const provider = args.find((a) => a.startsWith('--provider='))?.split('=')[1] as 'elevenlabs' | 'google' || creds.activeProvider as 'elevenlabs' | 'google';
    const catalogue = buildCompleteLineCatalogue();
    console.log(`Processing ${catalogue.length} lines with ${provider.toUpperCase()}...`);

    let successCount = 0;
    for (let i = 0; i < catalogue.length; i++) {
      const item = catalogue[i];
      process.stdout.write(`[${i + 1}/${catalogue.length}] ${item.character} - ${item.id}... `);
      const res = await generateTarget(item, provider);
      if (res.success) {
        console.log(`OK (${res.bytesWritten} B)`);
        successCount++;
      } else {
        console.log(`FAIL (${res.error})`);
      }
      // Small delay between calls to respect rate limits
      await new Promise((r) => setTimeout(r, 250));
    }

    console.log(`\nBatch complete: ${successCount}/${catalogue.length} audio files generated.`);
    generateVoiceManifest();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('Fatal pipeline error:', err);
    process.exit(1);
  });
}
