import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTER_DIALOGUE_SEQUENCES } from '../src/story/dialogueManifest';
import { SCENE_NARRATION_BEATS } from '../src/narrative/narrativeManifest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const manifestPath = path.join(ROOT_DIR, 'public/assets/audio/voices/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const manifestRecords = manifest.records || [];

const allSequenceLines = Object.values(CHAPTER_DIALOGUE_SEQUENCES).flat();
const dialogueLinesOnly = allSequenceLines.filter(l => l.mode === 'dialogue');
const narratorLinesInSequences = allSequenceLines.filter(l => l.mode === 'narrator');

console.log('=== DISCREPANCY ANALYSIS ===\n');
console.log(`Total sequence lines in dialogueManifest: ${allSequenceLines.length}`);
console.log(`- Character dialogue lines (mode='dialogue'): ${dialogueLinesOnly.length}`);
console.log(`- Narration lines in sequences (mode='narrator'): ${narratorLinesInSequences.length}`);
console.log(`\nContinuous narration beats in narrativeManifest: ${SCENE_NARRATION_BEATS.length}`);
console.log(`Manifest audio records in manifest.json: ${manifestRecords.length}`);

console.log('\n--- Narration lines cross-listed in dialogueManifest ---');
for (const nl of narratorLinesInSequences) {
  const matchingBeat = SCENE_NARRATION_BEATS.find(b => b.audioSrc === nl.audioSrc);
  console.log(`Line ID: ${nl.id} | Scene: ${nl.sceneId} | Speaker: ${nl.speakerLabel} | Audio: ${nl.audioSrc}`);
  console.log(`  -> Matches narrativeManifest Beat: ${matchingBeat ? matchingBeat.id : 'NONE'}`);
}

const uniqueAudioSequence = new Set(allSequenceLines.map(l => l.audioSrc));
const uniqueAudioNarration = new Set(SCENE_NARRATION_BEATS.map(b => b.audioSrc));
const allUniqueAudio = new Set([...uniqueAudioSequence, ...uniqueAudioNarration]);

console.log(`\nUnique audio in dialogueManifest: ${uniqueAudioSequence.size}`);
console.log(`Unique audio in narrativeManifest: ${uniqueAudioNarration.size}`);
console.log(`Total union of unique audio tracks: ${allUniqueAudio.size}`);

// Verify on-disk presence of all 48 unique files
let onDiskCount = 0;
for (const p of allUniqueAudio) {
  const full = path.join(ROOT_DIR, 'public', p.replace(/^\//, ''));
  if (fs.existsSync(full)) {
    onDiskCount++;
  } else {
    console.error(`MISSING ON DISK: ${p}`);
  }
}
console.log(`Total audio tracks confirmed present on disk: ${onDiskCount} / ${allUniqueAudio.size}`);
