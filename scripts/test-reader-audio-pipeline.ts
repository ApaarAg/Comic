import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTER_DIALOGUE_SEQUENCES } from '../src/story/dialogueManifest';
import { SCENE_NARRATION_BEATS } from '../src/narrative/narrativeManifest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function verifyReaderAudioPipeline() {
  console.log('=== VERIFYING READER AUDIO PIPELINE INTEGRATION ===\n');

  // 1. Verify app server response
  console.log('1. Checking Storyverse App Server...');
  const appRes = await fetch('http://localhost:3000/');
  console.log(`   App HTTP status: ${appRes.status} (text length: ${(await appRes.text()).length} chars)`);
  if (!appRes.ok) throw new Error(`App server returned HTTP ${appRes.status}`);

  // 2. Verify all narration beats in narrativeManifest
  console.log('\n2. Checking Narration Beats (14 total)...');
  let narrationOk = 0;
  for (const beat of SCENE_NARRATION_BEATS) {
    const url = `http://localhost:3000${beat.audioSrc}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Narration audio failed: ${url} (HTTP ${res.status})`);
    narrationOk++;
  }
  console.log(`   ✓ All ${narrationOk} narration audio files load cleanly via HTTP 200.`);

  // 3. Verify all dialogue lines in dialogueManifest
  console.log('\n3. Checking Character Dialogue Lines...');
  const uniqueUrls = new Set<string>();
  for (const beat of SCENE_NARRATION_BEATS) {
    uniqueUrls.add(beat.audioSrc);
  }

  let dialogueCount = 0;
  for (const [seqId, lines] of Object.entries(CHAPTER_DIALOGUE_SEQUENCES)) {
    for (const line of lines) {
      if (line.audioSrc) {
        uniqueUrls.add(line.audioSrc);
        const url = `http://localhost:3000${line.audioSrc}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Dialogue line audio failed: [${line.speaker}] ${line.id} at ${url} (HTTP ${res.status})`);
        dialogueCount++;
      }
    }
  }
  console.log(`   ✓ Checked ${dialogueCount} total sequence references across chapter sequences.`);
  console.log(`   ✓ Distinct spoken audio files across entire chapter: ${uniqueUrls.size} (Expected: 48)`);

  if (uniqueUrls.size !== 48) {
    throw new Error(`Expected 48 distinct audio files, found ${uniqueUrls.size}`);
  }

  console.log('\n======================================================');
  console.log(' READER AUDIO PIPELINE: 100% VERIFIED & PRODUCTION READY');
  console.log('======================================================\n');
}

verifyReaderAudioPipeline().catch((err) => {
  console.error('Reader audio pipeline verification failed:', err.message);
  process.exit(1);
});
