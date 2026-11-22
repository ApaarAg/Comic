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
  assert.equal(owners.size, 49, 'The timeline should own all 15 narration and 34 dialogue recordings');
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

test('Scene 00 does not trigger narration prematurely at scroll position zero or during story summary', () => {
  const latch = createLatch();
  
  // At scroll position zero
  const zeroAction = resolveTimelineAudioAction('scene-00', 0.0, 0.0, latch);
  assert.equal(zeroAction.action, 'none', 'No narration should play at scroll position zero');

  // Small scroll into atmosphere
  const smallScroll = resolveTimelineAudioAction('scene-00', 0.05, 0.0, latch);
  assert.equal(smallScroll.action, 'none', 'Atmosphere beat must not trigger narration');

  // Scrolling into THE STORY introduction summary
  const summaryScroll = resolveTimelineAudioAction('scene-00', 0.20, 0.15, latch);
  assert.equal(summaryScroll.action, 'none', 'Story summary must be purely visual without speech trigger');
});

test('Scene 00 narration triggers only when scroll reaches the opening canvas beat', () => {
  const latch = createLatch();

  // Forward scroll reaching the opening canvas at 0.36
  const canvasAction = resolveTimelineAudioAction('scene-00', 0.38, 0.30, latch);
  assert.equal(canvasAction.action, 'play', 'Narration must trigger when reaching opening canvas beat');
  assert.equal(canvasAction.speechToPlay?.id, 's00-01');
  assert.equal(canvasAction.speechToPlay?.mode, 'narration');

  // Once completed, staying in opening canvas does not restart
  latch.completedSpeechIds.add('s00-01');
  const heldAction = resolveTimelineAudioAction('scene-00', 0.42, 0.39, latch);
  assert.equal(heldAction.action, 'none', 'Completed narration must not retrigger while holding');

  // Deliberate reverse scroll above 0.31 rearms for replay
  resolveTimelineAudioAction('scene-00', 0.28, 0.40, latch);
  assert.equal(latch.completedSpeechIds.has('s00-01'), false, 'Retreating past beat must rearm s00-01');
});

test('Scene 01 triggers s01-01 and s01-02 sequentially at distinct comic panel positions', () => {
  const latch = createLatch();

  // At Stage A (initial skyline artwork), no narration plays
  const stageA = resolveTimelineAudioAction('scene-01', 0.05, 0.0, latch);
  assert.equal(stageA.action, 'none', 'Stage A skyline artwork must not trigger narration');

  // At Stage B (Sunset Horizon · 4:45 PM), first comic narration triggers
  const stageB = resolveTimelineAudioAction('scene-01', 0.21, 0.15, latch);
  assert.equal(stageB.action, 'play');
  assert.equal(stageB.speechToPlay?.id, 's01-01', 'Stage B must trigger s01-01');
  assert.equal(stageB.speechToPlay?.audioSrc, '/assets/audio/voices/narrator/scene-01-opening.mp3');

  // Holding in Stage B does not restart completed s01-01
  latch.completedSpeechIds.add('s01-01');
  const stageBHeld = resolveTimelineAudioAction('scene-01', 0.26, 0.22, latch);
  assert.equal(stageBHeld.action, 'none');

  // Scrolling between Stage B and Stage D does not trigger highway narration prematurely
  const stageC = resolveTimelineAudioAction('scene-01', 0.40, 0.35, latch);
  assert.equal(stageC.action, 'none');

  // Reaching Stage D (Elevated Highway Overpass) triggers s01-02
  const stageD = resolveTimelineAudioAction('scene-01', 0.53, 0.48, latch);
  assert.equal(stageD.action, 'play');
  assert.equal(stageD.speechToPlay?.id, 's01-02', 'Stage D must trigger s01-02');
  assert.equal(stageD.speechToPlay?.audioSrc, '/assets/audio/voices/narrator/scene-01-highway.mp3');
});
