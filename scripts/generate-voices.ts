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
  edgeVoice?: {
    shortName: string;
    pitch?: string;
    rate?: string;
    volume?: string;
  };
  emotionGuidance: string;
}

export const VOICE_PROFILES: Record<string, CharacterVoiceProfile> = {
  narrator: {
    characterId: 'narrator',
    name: 'The Chronicle',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_NARRATOR || 'nPczCjzI2devNBz1zQrb', // Brian fallback
    elevenLabsSettings: { stability: 0.60, similarity_boost: 0.88, style: 0.20, use_speaker_boost: true },
    googleTtsVoice: { languageCode: 'en-IN', name: 'en-IN-Wavenet-B', ssmlGender: 'MALE' },
    googleAudioConfig: { speakingRate: 0.90, pitch: -3.0 },
    edgeVoice: {
      shortName: 'en-IN-PrabhatNeural',
      pitch: '-4Hz',
      rate: '-10%',
      volume: '+10%',
    },
    emotionGuidance: 'Deep, powerful, mature Indian English male baritone with rich chest resonance. Slow and deliberate pacing, subtle warmth, commanding presence.',
  },
  death: {
    characterId: 'death',
    name: 'Death',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_DEATH || 'pFZP5JQG7iQjIQuC4Bku', // Lily (Velvety, dark aristocratic female poise) | Alt: XrExE9yKIg1WjnnlVkGX (Matilda)
    elevenLabsSettings: { stability: 0.60, similarity_boost: 0.82, style: 0.35, use_speaker_boost: true },
    googleTtsVoice: { languageCode: 'en-GB', name: 'en-GB-Neural2-F', ssmlGender: 'FEMALE' },
    googleAudioConfig: { speakingRate: 0.94, pitch: -2.0 },
    edgeVoice: {
      shortName: 'en-GB-SoniaNeural',
      pitch: '-2Hz',
      rate: '-5%',
    },
    emotionGuidance: 'Regal, elegant female authority with dark velvety composure—cynical confidence cracking into sheer outrage and disbelief when fired.',
  },
  laila: {
    characterId: 'laila',
    name: 'Laila Starr',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_LAILA || 'Xb7hH8MSUJpSbSDYk0k2', // Alice (expressive, articulate, dry mortal wit - APPROVED)
    elevenLabsSettings: { stability: 0.50, similarity_boost: 0.80, style: 0.35, use_speaker_boost: true },
    googleTtsVoice: { languageCode: 'en-IN', name: 'en-IN-Neural2-A', ssmlGender: 'FEMALE' },
    googleAudioConfig: { speakingRate: 0.98, pitch: 0.2 },
    edgeVoice: {
      shortName: 'en-GB-LibbyNeural',
      pitch: '+0Hz',
      rate: '+0%',
    },
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
  hasEdge: boolean;
  activeProvider: 'elevenlabs' | 'google' | 'edge' | 'none';
}

export function checkCredentials(): CredentialStatus {
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  const hasElevenLabs = Boolean(elevenKey && elevenKey.trim().length > 10 && !elevenKey.includes('YOUR_'));

  const googleKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasGoogleTts = Boolean(googleKey && googleKey.trim().length > 10);

  const geminiKey = process.env.GEMINI_API_KEY;
  const hasGemini = Boolean(geminiKey && geminiKey.trim().length > 10 && geminiKey !== 'MY_GEMINI_API_KEY');

  const hasEdge = true; // MsEdgeTTS available locally for Indian English & global neural voices
  const activeProvider = hasElevenLabs ? 'elevenlabs' : hasEdge ? 'edge' : hasGoogleTts ? 'google' : 'none';

  return { hasElevenLabs, hasGoogleTts, hasGemini, hasEdge, activeProvider };
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
// Microsoft Edge TTS Client (High Fidelity Neural Voices / en-IN Indian English)
// ─────────────────────────────────────────────────────────────────────────────

async function generateEdgeAudio(
  text: string,
  voiceProfile: CharacterVoiceProfile,
): Promise<Buffer> {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
  const tts = new MsEdgeTTS();
  const voiceName = voiceProfile.edgeVoice?.shortName || 'en-IN-PrabhatNeural';
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, {
    pitch: voiceProfile.edgeVoice?.pitch,
    rate: voiceProfile.edgeVoice?.rate,
    volume: voiceProfile.edgeVoice?.volume,
  });

  const chunks: Buffer[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
    audioStream.on('end', () => resolve(Buffer.concat(chunks)));
    audioStream.on('error', reject);
  });
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
  provider: 'elevenlabs' | 'google' | 'edge',
): Promise<{ success: boolean; error?: string; bytesWritten?: number }> {
  const profile = VOICE_PROFILES[target.character] || VOICE_PROFILES.narrator;
  fs.mkdirSync(path.dirname(target.targetPath), { recursive: true });

  try {
    let buffer: Buffer;
    if (provider === 'elevenlabs') {
      buffer = await generateElevenLabsAudio(target.transcript, profile);
    } else if (provider === 'edge') {
      buffer = await generateEdgeAudio(target.transcript, profile);
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
    console.log(`- Edge Neural TTS:  ${creds.hasEdge ? 'CONFIGURED [OK]' : 'MISSING'}`);
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

    const provider = (args.find((a) => a.startsWith('--provider='))?.split('=')[1] as 'elevenlabs' | 'google' | 'edge') || (creds.activeProvider as 'elevenlabs' | 'google' | 'edge');
    const samples = [
      {
        id: 's01-01',
        character: 'narrator',
        transcript: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.',
        targetRelPath: 'assets/audio/voices/narrator/scene-01-opening.mp3',
      },
      {
        id: 's04-09',
        character: 'death',
        transcript: "WHAT?! I'm an absolute consequence. It's in the job description! Send down a plague! Strike the child with lightning!",
        targetRelPath: 'assets/audio/voices/death/s04-09-death-outrage.mp3',
      },
      {
        id: 's07-01',
        character: 'laila',
        transcript: "Ohhhhh, that feels awful... Who're you?",
        targetRelPath: 'assets/audio/voices/laila/s07-01-laila-awful.mp3',
      },
    ];

    for (const sample of samples) {
      console.log(`\nGenerating sample: [${sample.character.toUpperCase()}] ${sample.id}...`);
      try {
        const fullTarget: GenerationTarget = {
          id: sample.id,
          character: sample.character,
          sceneId: sample.id.split('-')[0],
          transcript: sample.transcript,
          targetPath: path.resolve(ROOT_DIR, 'public', sample.targetRelPath),
          durationMs: 4000,
          category: sample.character === 'narrator' ? 'narration' : 'dialogue',
        };
        const res = await generateTarget(fullTarget, provider);
        if (res.success) {
          console.log(`  -> SUCCESS: Wrote ${res.bytesWritten} bytes to /${sample.targetRelPath}`);
        } else {
          console.error(`  -> ERROR: ${res.error}`);
        }
      } catch (err: any) {
        console.error(`  -> EXCEPTION for ${sample.character}: ${err.message}`);
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

    const provider = (args.find((a) => a.startsWith('--provider='))?.split('=')[1] as 'elevenlabs' | 'google' | 'edge') || (creds.activeProvider as 'elevenlabs' | 'google' | 'edge');
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
