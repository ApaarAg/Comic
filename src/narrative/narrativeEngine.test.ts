import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENE_NARRATION_BEATS } from './narrativeManifest';

test('SCENE_NARRATION_BEATS have valid chapter progress and visual choreography', () => {
  assert.ok(SCENE_NARRATION_BEATS.length >= 10, 'Must have at least 10 narration beats');

  let prevTrigger = -1;
  for (const beat of SCENE_NARRATION_BEATS) {
    assert.ok(beat.id, 'Beat must have an id');
    assert.ok(beat.sceneId, 'Beat must have a sceneId');
    assert.ok(beat.text.length > 5, 'Beat text must not be empty');
    assert.ok(beat.durationMs > 0, 'Duration must be positive');
    assert.ok(beat.triggerProgress >= 0 && beat.triggerProgress <= 1.0, 'Trigger progress must be between 0 and 1');
    assert.ok(beat.triggerProgress >= prevTrigger, `Beats must be monotonically ordered: ${beat.id} (${beat.triggerProgress}) vs prev (${prevTrigger})`);
    prevTrigger = beat.triggerProgress;
  }

  // Scene 01 specific choreography verification
  const s01Beats = SCENE_NARRATION_BEATS.filter((b) => b.sceneId === 'scene-01');
  assert.equal(s01Beats.length, 2, 'Scene 01 should have 2 narration beats');
  assert.ok(s01Beats[0].visualChoreography, 'Scene 01 Beat 1 must have visualChoreography');
  assert.ok(s01Beats[0].visualChoreography?.cameraPanPercent !== undefined, 'Beat 1 must have cameraPanPercent');
  assert.equal(s01Beats[0].visualChoreography?.sfxCue, 'discover', 'Beat 1 sfxCue should be discover');
  assert.equal(s01Beats[1].visualChoreography?.sfxCue, 'horn', 'Beat 2 sfxCue should be horn');
});
