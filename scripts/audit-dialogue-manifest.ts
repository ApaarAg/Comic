import { CHAPTER_DIALOGUE_SEQUENCES } from '../src/story/dialogueManifest';
import fs from 'node:fs';
import path from 'node:path';

console.log('=== AUDITING DIALOGUE MANIFEST & AUDIO ASSETS ===\n');

let total = 0;
let existingCount = 0;
let missingCount = 0;

for (const [seqId, lines] of Object.entries(CHAPTER_DIALOGUE_SEQUENCES)) {
  console.log(`\n--- Sequence: ${seqId} (${lines.length} lines) ---`);
  for (const line of lines) {
    total++;
    const fullAudioPath = path.resolve('public' + line.audioSrc);
    const exists = fs.existsSync(fullAudioPath);
    if (exists) {
      existingCount++;
      const size = fs.statSync(fullAudioPath).size;
      console.log(`[EXISTS] ${line.id} | ${line.speaker} | trigger: ${line.triggerProgress} | path: ${line.audioSrc} (${size} bytes) | text: "${line.text.slice(0, 40)}..."`);
    } else {
      missingCount++;
      console.error(`[MISSING] ${line.id} | ${line.speaker} | trigger: ${line.triggerProgress} | path: ${line.audioSrc} | text: "${line.text.slice(0, 40)}..."`);
    }
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Total dialogue lines: ${total}`);
console.log(`Existing audio files: ${existingCount}`);
console.log(`Missing audio files: ${missingCount}`);
