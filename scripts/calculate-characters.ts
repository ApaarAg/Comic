import { SCENE_NARRATION_BEATS } from '../src/narrative/narrativeManifest';
import { VOICE_ACTING_BIBLE } from '../src/audio/voiceActingBible';

const narrationChars = SCENE_NARRATION_BEATS.reduce((acc, b) => acc + b.text.length, 0);
const dialogueChars = VOICE_ACTING_BIBLE.reduce((acc, d) => acc + d.originalText.length, 0);

console.log('Total Narration Characters (14 beats):', narrationChars);
console.log('Total Dialogue Characters (34 lines):', dialogueChars);
console.log('Total Spoken Characters:', narrationChars + dialogueChars);
