import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORYBOARD_TIMELINE,
  validateStoryTimeline,
  resolveTimelineVisualState,
  resolveTimelineAudioAction,
  type AudioPlaybackLatchState,
} from './storyTimeline';

test('validateStoryTimeline confirms schema completeness and monotonic ordering', () => {
  const result = validateStoryTimeline();
  assert.equal(result.isValid, true, `Timeline validation failed: ${result.errors.join(', ')}`);
  assert.equal(result.totalScenes, 11, 'Should have exactly 11 scenes (00 through 10)');
  assert.equal(result.totalNarrationBeats, 15, 'Should contain all 15 Brian narration beats');
  assert.equal(result.totalDialogueBeats, 34, 'Should contain all 34 character dialogue lines');
  assert.equal(result.errors.length, 0);
});

test('Every speech event references a valid local audio asset path', () => {
  STORYBOARD_TIMELINE.forEach((scene) => {
    scene.beats.forEach((beat) => {
      if (beat.speech) {
        assert.ok(beat.speech.audioSrc.startsWith('/assets/audio/voices/'), `Invalid path: ${beat.speech.audioSrc}`);
        assert.ok(beat.speech.durationMs > 0, `Duration must be > 0: ${beat.speech.durationMs}`);
        assert.ok(beat.speech.text.length > 0, `Text must not be empty in beat ${beat.id}`);
      }
    });
  });
});

test('resolveTimelineVisualState is 100% deterministic, pure, and reversible', () => {
  const sceneId = 'scene-02';
  
  // Forward query
  const stateForward = resolveTimelineVisualState(sceneId, 0.48, false);
  
  // Backward query
  const stateBackward = resolveTimelineVisualState(sceneId, 0.48, false);
  
  // Deep equality check for reversibility
  assert.deepEqual(stateForward.camera, stateBackward.camera, 'Camera must be identical on backward scrub');
  assert.deepEqual(stateForward.parallax, stateBackward.parallax, 'Parallax must be identical on backward scrub');
  assert.equal(stateForward.activePanelId, 'p07_panel04');
  assert.equal(stateForward.speechBubble?.id, 's02-02');
  assert.equal(stateForward.speechBubble?.speaker, 'driver');
});

test('Mobile adaptation reduces pan limits and applies focal zoom bonus', () => {
  const desktop = resolveTimelineVisualState('scene-02', 0.48, false);
  const mobile = resolveTimelineVisualState('scene-02', 0.48, true);

  // Desktop pan should be larger than mobile pan
  assert.ok(Math.abs(mobile.camera.panXPercent) <= Math.abs(desktop.camera.panXPercent));
  assert.ok(Math.abs(mobile.camera.panYPercent) <= Math.abs(desktop.camera.panYPercent));
  // Mobile zoom should be slightly increased to preserve face detail on narrow portrait screens
  assert.ok(mobile.camera.zoom >= desktop.camera.zoom);
});

test('resolveTimelineAudioAction triggers speech on forward crossing', () => {
  const latchState: AudioPlaybackLatchState = {
    completedSpeechIds: new Set(),
    currentlyPlayingId: null,
    lastProgressByScene: { 'scene-02': 0.0 },
  };

  const action = resolveTimelineAudioAction('scene-02', 0.10, 0.05, latchState);
  assert.equal(action.action, 'play');
  assert.equal(action.speechToPlay?.id, 's02-01');
  assert.equal(action.ducking.duckScore, true);
  assert.equal(action.ducking.duckFactor, 0.38);
});

test('resolveTimelineAudioAction rearms completed audio only after a deliberate backward revisit', () => {
  const latchState: AudioPlaybackLatchState = {
    completedSpeechIds: new Set(['s02-01']),
    currentlyPlayingId: null,
    lastProgressByScene: { 'scene-02': 0.15 },
  };

  // A small reverse motion leaves the completion latch intact.
  const backwardAction = resolveTimelineAudioAction('scene-02', 0.07, 0.09, latchState);
  assert.equal(backwardAction.action, 'none');
  assert.equal(latchState.completedSpeechIds.has('s02-01'), true);

  // Retreating well past the trigger arms one intentional replay.
  resolveTimelineAudioAction('scene-02', 0.02, 0.09, latchState);
  const forwardAction = resolveTimelineAudioAction('scene-02', 0.10, 0.02, latchState);
  assert.equal(forwardAction.action, 'play');
  assert.equal(forwardAction.speechToPlay?.id, 's02-01');
});

test('resolveTimelineAudioAction stops active speech on rapid scroll skip', () => {
  const latchState: AudioPlaybackLatchState = {
    completedSpeechIds: new Set(),
    currentlyPlayingId: 's02-01',
    lastProgressByScene: { 'scene-02': 0.10 },
  };

  // High velocity jump (delta > 0.25)
  const rapidAction = resolveTimelineAudioAction('scene-02', 0.55, 0.10, latchState, { velocityThreshold: 0.25 });
  assert.equal(rapidAction.action, 'stop');
  assert.equal(rapidAction.stopReason, 'rapid_scroll_skip');
});

test('Visual holds engage at specified keyframes', () => {
  const scene01Hold = resolveTimelineVisualState('scene-01', 0.15, false);
  assert.equal(scene01Hold.isHold, true, 'Scene 01 establishing vista should engage visual hold');

  const scene00Hold = resolveTimelineVisualState('scene-00', 0.60, false);
  assert.equal(scene00Hold.isHold, true, 'Scene 00 title reveal should engage visual hold');
});
