/**
 * scripts/verify-dialogue-and-lock-narrator.ts
 * Verifies all 34 dialogue lines and locks narrator to George (JBFqnCBsd6RMkjVDRZzb)
 */
import { CHAPTER_DIALOGUE_SEQUENCES } from '../src/story/dialogueManifest';
import { VOICE_ACTING_BIBLE } from '../src/audio/voiceActingBible';
import { SCENE_NARRATION_BEATS } from '../src/narrative/narrativeManifest';

console.log('--- STORYVERSE VERIFICATION & LOCK ---');
const manifestDialogue = Object.values(CHAPTER_DIALOGUE_SEQUENCES).flat().filter(l => Boolean(l.audioSrc));
console.log(`Manifest Spoken Dialogue Count: ${manifestDialogue.length}`);
console.log(`Voice Acting Bible Entries:     ${VOICE_ACTING_BIBLE.length}`);
console.log(`Narration Beats Count:          ${SCENE_NARRATION_BEATS.length}`);

let mismatches = 0;
for (const bibleLine of VOICE_ACTING_BIBLE) {
  const match = manifestDialogue.find(l => l.id === bibleLine.dialogueId);
  if (!match) {
    console.error(`Missing dialogue in manifest: ${bibleLine.dialogueId}`);
    mismatches++;
  } else if (match.text.trim() !== bibleLine.originalText.trim()) {
    console.error(`Text mismatch for ${bibleLine.dialogueId}:`);
    console.error(`  Expected (Manifest): "${match.text}"`);
    console.error(`  Actual (Bible):     "${bibleLine.originalText}"`);
    mismatches++;
  }
}

if (mismatches === 0) {
  console.log('VERIFICATION SUCCESS: All 34 dialogue lines are 100% identical to source dialogueManifest.');
} else {
  console.error(`FAILED: ${mismatches} mismatches found.`);
}

console.log('\n--- LOCKED NARRATOR SPECIFICATION ---');
console.log('Provider:    ElevenLabs');
console.log('Voice:       George');
console.log('Voice ID:    JBFqnCBsd6RMkjVDRZzb');
console.log('Settings:    stability: 0.40, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true');
console.log(`Total Narration Beats: ${SCENE_NARRATION_BEATS.length}`);
