import { SCENE_NARRATION_BEATS } from '../src/narrative/narrativeManifest';
import { CHAPTER_DIALOGUE_SEQUENCES } from '../src/story/dialogueManifest';
import { REQUIRED_VOICE_ASSETS } from '../src/story/voiceManifest';

console.log('--- COMPARING ALL 48 LINES ACROSS ALL MANIFESTS ---');

const dialogueMap = new Map();
for (const seq of Object.values(CHAPTER_DIALOGUE_SEQUENCES)) {
  for (const line of seq) {
    dialogueMap.set(line.id, line);
  }
}

const narrationMap = new Map();
for (const beat of SCENE_NARRATION_BEATS) {
  narrationMap.set(beat.id, beat);
}

console.log(`Unique Dialogue entries: ${dialogueMap.size}`);
console.log(`Unique Narration beats:  ${narrationMap.size}`);

// Check overlaps
for (const [id, beat] of narrationMap) {
  if (dialogueMap.has(id)) {
    const dLine = dialogueMap.get(id);
    console.log(`\nOverlapping ID: [${id}]`);
    console.log(`  Narration text: "${beat.text}"`);
    console.log(`  Dialogue text:  "${dLine.text}"`);
    console.log(`  Match?          ${beat.text === dLine.text}`);
    console.log(`  Narration speaker: narrator`);
    console.log(`  Dialogue speaker:  ${dLine.speaker}`);
  }
}
