import { SCENE_NARRATION_BEATS } from '../src/narrative/narrativeManifest';
import fs from 'node:fs';
import path from 'node:path';

console.log('=== AUDITING 14 NARRATION BEATS ===\n');

SCENE_NARRATION_BEATS.forEach((beat, idx) => {
  const fullAudioPath = path.resolve('public' + beat.audioSrc);
  const exists = fs.existsSync(fullAudioPath);
  const size = exists ? fs.statSync(fullAudioPath).size : 0;
  console.log(`${idx + 1}. [${beat.id}] (${beat.sceneId}) Trigger: ${beat.triggerProgress} | Exists: ${exists} (${size} B)`);
  console.log(`   Path: ${beat.audioSrc}`);
  console.log(`   Text: "${beat.text}"\n`);
});
