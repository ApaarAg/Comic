import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORYBOARD_TIMELINE,
  resolveTimelineAudioAction,
  type AudioPlaybackLatchState,
} from '../src/story/storyTimeline';

function createLatch(completedSpeechIds: string[] = []): AudioPlaybackLatchState {
  return {
    completedSpeechIds: new Set(completedSpeechIds),
    currentlyPlayingId: null,
    lastProgressByScene: {},
  };
}

test('every storyboard voice event has one scene owner and a unique event id', () => {
  const owners = new Map<string, string>();
  for (const scene of STORYBOARD_TIMELINE) {
    for (const beat of scene.beats) {
      if (!beat.speech) continue;
      assert.equal(beat.sceneId, scene.id, `${beat.speech.id} must match its timeline scene`);
      assert.equal(owners.has(beat.speech.id), false, `${beat.speech.id} must have one owner`);
      owners.set(beat.speech.id, scene.id);
    }
  }
  assert.equal(owners.size, 48, 'The timeline should own all 14 narration and 34 dialogue recordings');
});

test('Scene 02 narration cannot be selected while Scene 01 owns the timeline', () => {
  const scene01Action = resolveTimelineAudioAction('scene-01', 0.75, 0.70, createLatch());
  const scene02First = STORYBOARD_TIMELINE.find((scene) => scene.id === 'scene-02')!
    .beats.find((beat) => beat.speech)!;
  assert.notEqual(scene01Action.speechToPlay?.id, scene02First.speech?.id);

  const scene02Action = resolveTimelineAudioAction('scene-02', 0.10, 0.05, createLatch());
  assert.equal(scene02Action.speechToPlay?.id, 's02-01');
  assert.equal(scene02First.sceneId, 'scene-02');
});

test('fast scrolling skips passed voice events and catches up only to a nearby current panel', () => {
  const skipped = resolveTimelineAudioAction('scene-02', 0.60, 0.01, createLatch());
  assert.equal(skipped.action, 'none');

  const caughtUp = resolveTimelineAudioAction('scene-02', 0.10, 0.01, createLatch());
  assert.equal(caughtUp.speechToPlay?.id, 's02-01');
});

test('tiny reverse movement preserves completed audio while deliberate revisit rearms it', () => {
  const latch = createLatch(['s02-01']);
  const smallReverse = resolveTimelineAudioAction('scene-02', 0.07, 0.09, latch);
  assert.equal(smallReverse.action, 'none');
  assert.equal(latch.completedSpeechIds.has('s02-01'), true);

  const deliberateReverse = resolveTimelineAudioAction('scene-02', 0.02, 0.09, latch);
  assert.equal(deliberateReverse.action, 'none');
  assert.equal(latch.completedSpeechIds.has('s02-01'), false);

  const revisit = resolveTimelineAudioAction('scene-02', 0.10, 0.02, latch);
  assert.equal(revisit.action, 'play');
  assert.equal(revisit.speechToPlay?.id, 's02-01');
});

test('rapid movement never restarts a line that is already playing', () => {
  const latch = createLatch();
  latch.currentlyPlayingId = 's02-01';
  const action = resolveTimelineAudioAction('scene-02', 0.09, 0.07, latch);
  assert.equal(action.action, 'none');
});
