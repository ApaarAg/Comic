import { REQUIRED_VOICE_ASSETS } from '../src/story/voiceManifest';
import { SCENE_NARRATION_BEATS } from '../src/narrative/narrativeManifest';

console.log('=== COMPLETE DIALOGUE & NARRATION LINE CATALOG ===\n');

console.log('--- CONTINUOUS NARRATION BEATS (' + SCENE_NARRATION_BEATS.length + ') ---');
for (const beat of SCENE_NARRATION_BEATS) {
  console.log(`[${beat.sceneId}] ${beat.id} | dur=${beat.durationMs}ms | style=${beat.captionStyle}`);
  console.log(`   Path: ${beat.audioSrc}`);
  console.log(`   Text: "${beat.text}"`);
}

console.log('\n--- CHAPTER DIALOGUE LINES (' + REQUIRED_VOICE_ASSETS.length + ') ---');
for (const line of REQUIRED_VOICE_ASSETS) {
  console.log(`[${line.sceneId}] ${line.lineId} (${line.character}) | dur=${line.targetPath}`);
  console.log(`   Direction: ${line.directionNote}`);
  console.log(`   Text: "${line.transcript}"`);
}
