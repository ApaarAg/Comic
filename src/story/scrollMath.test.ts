import test from 'node:test';
import assert from 'node:assert/strict';
import {
  blendHexColors,
  buildWeightedWordTimings,
  clamp01,
  computeAudioMixLevels,
  computeImpactZoom,
  computeNormalizedSceneBounds,
  computeParallaxY,
  computeParallelEditState,
  computePrologueVisualState,
  computeSceneJourneySegments,
  computeShaderTransitionEnvelope,
  computeVideoScrubTime,
  computeVisibleWordCount,
  getLocalProgress,
  resolveActiveSceneByOffsets,
  resolveActiveSceneIndex,
  resolveBubblePlacement,
  resolvePrologueMomentIndex,
  resolveScrollDialogueBeat,
  resolveSyncedWordStates,
  resolveVisibleWordsFromTiming,
  selectBackdropMode,
  shouldPreloadSceneVideo,
  stepDialogueIndex,
} from './scrollMath';
import { PROLOGUE_MOMENTS } from './prologueScript';
import { CHAPTER_DIALOGUE_SEQUENCES } from './dialogueManifest';

test('resolveActiveSceneByOffsets tracks active scene using viewport focal line', () => {
  const tops = [0, 1200, 2800, 4500];
  assert.equal(resolveActiveSceneByOffsets(0, 900, tops), 0);
  assert.equal(resolveActiveSceneByOffsets(900, 900, tops), 1); // focal = 1215 >= 1200
  assert.equal(resolveActiveSceneByOffsets(2600, 900, tops), 2); // focal = 2915 >= 2800
  assert.equal(resolveActiveSceneByOffsets(4300, 900, tops), 3); // focal = 4615 >= 4500
});

test('clamp01 bounds values cleanly and handles non-finite inputs', () => {
  assert.equal(clamp01(-0.5), 0);
  assert.equal(clamp01(0.42), 0.42);
  assert.equal(clamp01(1.8), 1);
  assert.equal(clamp01(Number.NaN), 0);
  assert.equal(clamp01(Number.POSITIVE_INFINITY), 0);
});

test('getLocalProgress normalizes global progress within scene range', () => {
  assert.equal(getLocalProgress(0.1, 0.2, 0.6), 0);
  assert.ok(Math.abs(getLocalProgress(0.4, 0.2, 0.6) - 0.5) < 1e-12);
  assert.equal(getLocalProgress(0.8, 0.2, 0.6), 1);
  assert.equal(getLocalProgress(0.5, 0.5, 0.5), 0);
});

test('resolveActiveSceneIndex identifies current scene across boundaries', () => {
  const scenes = [
    { start: 0, end: 0.3 },
    { start: 0.3, end: 0.7 },
    { start: 0.7, end: 1.0 },
  ];
  assert.equal(resolveActiveSceneIndex(0, scenes), 0);
  assert.equal(resolveActiveSceneIndex(0.299, scenes), 0);
  assert.equal(resolveActiveSceneIndex(0.3, scenes), 1);
  assert.equal(resolveActiveSceneIndex(0.75, scenes), 2);
  assert.equal(resolveActiveSceneIndex(1.0, scenes), 2);
});

test('computeParallaxY centers movement around midpoint', () => {
  assert.equal(computeParallaxY(0, 100), -50);
  assert.equal(computeParallaxY(0.5, 100), 0);
  assert.equal(computeParallaxY(1, 100), 50);
});

test('computeParallelEditState synchronizes fall and birth to peak convergence', () => {
  const early = computeParallelEditState(0.1);
  const peak = computeParallelEditState(0.78);
  const late = computeParallelEditState(0.98);

  assert.ok(early.fallProgress > early.birthProgress);
  assert.equal(peak.fallProgress, 1);
  assert.ok(peak.convergence > 0.95);
  assert.equal(late.birthProgress, 1);
});

test('computeImpactZoom escalates scale and triggers impact window near climax', () => {
  const start = computeImpactZoom(0);
  const mid = computeImpactZoom(0.5);
  const impact = computeImpactZoom(0.9);

  assert.equal(start.scale, 1);
  assert.equal(start.isImpactWindow, false);
  assert.ok(mid.scale > 1 && mid.scale < 1.18);
  assert.equal(impact.isImpactWindow, true);
  assert.ok(impact.headlightIntensity > 0.9);
});

test('blendHexColors interpolates between two colors smoothly', () => {
  assert.equal(blendHexColors('#000000', '#ffffff', 0), '#000000');
  assert.equal(blendHexColors('#000000', '#ffffff', 1), '#ffffff');
  assert.equal(blendHexColors('#000000', '#fe0064', 0.5), '#7f0032');
});

test('computeNormalizedSceneBounds aligns scene ranges with DOM focal lines', () => {
  const bounds = computeNormalizedSceneBounds([0, 2350, 6350], 10000, 1000);
  assert.equal(bounds.length, 3);
  assert.equal(bounds[0].start, 0);
  assert.ok(Math.abs(bounds[0].end - 0.2) < 1e-9);
  assert.ok(Math.abs(bounds[1].start - 0.2) < 1e-9);
  assert.ok(Math.abs(bounds[1].end - 0.6) < 1e-9);
  assert.equal(bounds[2].end, 1);
});

test('computeSceneJourneySegments tracks completed, active, and upcoming scenes', () => {
  const makeScene = (index: number, start: number, end: number, accent: string) => ({
    id: `scene-0${index}`,
    index,
    title: `Scene ${index}`,
    subtitle: 'Sub',
    timecode: '12:00',
    start,
    end,
    theme: { bg: '#000000', surface: '#111111', text: '#ffffff', accent, mood: 'sunset' as const },
  });
  const scenes = [
    makeScene(1, 0, 0.25, '#f28b50'),
    makeScene(2, 0.25, 0.75, '#e66c8b'),
    makeScene(3, 0.75, 1.0, '#6dc4e0'),
  ];

  const segments = computeSceneJourneySegments(0.5, scenes, 1);
  assert.equal(segments[0].fillRatio, 1);
  assert.equal(segments[0].isCompleted, true);
  assert.ok(Math.abs(segments[1].fillRatio - 0.5) < 1e-9);
  assert.equal(segments[1].isActive, true);
  assert.equal(segments[2].fillRatio, 0);
  assert.equal(segments[2].isCompleted, false);

  const endSegments = computeSceneJourneySegments(1.0, scenes, 2);
  assert.equal(endSegments[2].fillRatio, 1);
  assert.equal(endSegments[2].isCompleted, true);
});

test('computeVideoScrubTime maps normalized scroll progress cleanly into safe seek range', () => {
  assert.equal(computeVideoScrubTime(0, 8, 0.08), 0);
  assert.equal(computeVideoScrubTime(0.5, 8, 0.08), 3.96);
  assert.equal(computeVideoScrubTime(1.2, 8, 0.08), 7.92);
  assert.equal(computeVideoScrubTime(0.5, Number.NaN), 0);
  assert.equal(computeVideoScrubTime(Number.NaN, 10), 0);
});

test('shouldPreloadSceneVideo buffers only active and adjacent scenes', () => {
  assert.equal(shouldPreloadSceneVideo(3, 3, 1), 'auto');
  assert.equal(shouldPreloadSceneVideo(2, 3, 1), 'metadata');
  assert.equal(shouldPreloadSceneVideo(4, 3, 1), 'metadata');
  assert.equal(shouldPreloadSceneVideo(6, 3, 1), 'none');
});

test('selectBackdropMode respects reduced motion, errors, and mobile poster preference', () => {
  assert.equal(
    selectBackdropMode({ reducedMotion: true, isMobileViewport: false, hasVideoError: false }),
    'poster',
  );
  assert.equal(
    selectBackdropMode({
      reducedMotion: false,
      isMobileViewport: true,
      preferMobilePoster: true,
      hasVideoError: false,
    }),
    'poster',
  );
  assert.equal(
    selectBackdropMode({ reducedMotion: false, isMobileViewport: false, hasVideoError: true }),
    'poster',
  );
  assert.equal(
    selectBackdropMode({
      reducedMotion: false,
      isMobileViewport: false,
      preferMobilePoster: true,
      hasVideoError: false,
    }),
    'video',
  );
});

test('computeAudioMixLevels respects mute toggles and ducks ambience under active voices', () => {
  const muted = computeAudioMixLevels({
    masterMuted: true,
    ambienceVolume: 0.8,
    sfxVolume: 0.9,
    voiceVolume: 1,
    ambienceMuted: false,
    sfxMuted: false,
    voiceMuted: false,
    isVoiceActive: true,
  });
  assert.equal(muted.ambienceGain, 0);
  assert.equal(muted.sfxGain, 0);
  assert.equal(muted.voiceGain, 0);

  const active = computeAudioMixLevels({
    masterMuted: false,
    ambienceVolume: 0.5,
    sfxVolume: 0.7,
    voiceVolume: 0.9,
    ambienceMuted: false,
    sfxMuted: false,
    voiceMuted: false,
    isVoiceActive: true,
  });
<<<<<<< HEAD
  assert.equal(active.duckFactor, 0.38);
  assert.equal(active.ambienceGain, 0.275);
=======
  assert.equal(active.duckFactor, 0.42);
  assert.equal(active.ambienceGain, 0.21);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
  assert.equal(active.voiceGain, 0.9);
});

test('stepDialogueIndex and computeVisibleWordCount bound indices and text reveal smoothly', () => {
  assert.equal(stepDialogueIndex(0, -1, 5), 0);
  assert.equal(stepDialogueIndex(0, 1, 5), 1);
  assert.equal(stepDialogueIndex(4, 2, 5), 4);
  assert.equal(computeVisibleWordCount('Hold the door please now', 0.4), 2);
  assert.equal(computeVisibleWordCount('Hold the door please now', 1), 5);
});

test('computeShaderTransitionEnvelope shapes bell-curve intensity for shader uniforms', () => {
  const start = computeShaderTransitionEnvelope(0, 'ink-spread');
  const mid = computeShaderTransitionEnvelope(0.5, 'celestial-portal');
  const end = computeShaderTransitionEnvelope(1, 'dawn-mist');

  assert.equal(start.intensity, 0);
  assert.equal(mid.intensity, 1);
  assert.ok(end.intensity < 0.01);
  assert.equal(end.dissolve, 1);
});

<<<<<<< HEAD
test('computePrologueVisualState progresses across 5 cinematic scenes: darkness, Mumbai, narration, title, and portal', () => {
  const mA = computePrologueVisualState(0.06, PROLOGUE_MOMENTS);
  const mB = computePrologueVisualState(0.30, PROLOGUE_MOMENTS);
  const mC = computePrologueVisualState(0.50, PROLOGUE_MOMENTS);
  const mD = computePrologueVisualState(0.72, PROLOGUE_MOMENTS);
  const mE = computePrologueVisualState(0.95, PROLOGUE_MOMENTS);

  // Scene A: Darkness
  assert.equal(resolvePrologueMomentIndex(0.06, PROLOGUE_MOMENTS), 0);
  assert.ok(mA.darknessVeilOpacity > 0.9);
  assert.equal(mA.mumbaiReveal, 0);
  assert.equal(mA.narrationOpacity, 0);
  assert.equal(mA.titleReveal, 0);

  // Scene B: Mumbai Skyline slowly revealed
  assert.equal(resolvePrologueMomentIndex(0.30, PROLOGUE_MOMENTS), 1);
  assert.ok(mB.mumbaiReveal > 0.6);
  assert.equal(mB.titleReveal, 0);
  assert.equal(mB.narrationOpacity, 0);

  // Scene C: Narration with approved Prabhat Neural voice + cinematic captions
  assert.equal(resolvePrologueMomentIndex(0.50, PROLOGUE_MOMENTS), 2);
  assert.ok(mC.narrationOpacity > 0.8);
  assert.equal(mC.activeNarrationIndex, 0);

  // Scene D: Title Reveal with elegant typography
  assert.equal(resolvePrologueMomentIndex(0.72, PROLOGUE_MOMENTS), 3);
  assert.ok(mD.titleReveal > 0.7);
  assert.equal(mD.narrationOpacity, 0);

  // Scene E: Enter the comic into original artwork
  assert.equal(resolvePrologueMomentIndex(0.95, PROLOGUE_MOMENTS), 4);
  assert.ok(mE.portalProgress > 0.6);
  assert.ok(mE.cameraZoom > mB.cameraZoom);
=======
test('computePrologueVisualState progresses across darkness, title, Mumbai, narration, and portal', () => {
  const m0 = computePrologueVisualState(0.04, PROLOGUE_MOMENTS);
  const m1 = computePrologueVisualState(0.26, PROLOGUE_MOMENTS);
  const m2 = computePrologueVisualState(0.46, PROLOGUE_MOMENTS);
  const m3 = computePrologueVisualState(0.62, PROLOGUE_MOMENTS);
  const m4 = computePrologueVisualState(0.78, PROLOGUE_MOMENTS);
  const m5 = computePrologueVisualState(0.96, PROLOGUE_MOMENTS);

  assert.equal(resolvePrologueMomentIndex(0.04, PROLOGUE_MOMENTS), 0);
  assert.equal(m0.titleReveal, 0);
  assert.equal(m0.mumbaiReveal, 0);
  assert.ok(m1.momentIndex === 1 && m1.titleReveal > 0.7);
  assert.ok(m2.momentIndex === 2 && m2.mumbaiReveal > 0.6);
  assert.ok(m3.momentIndex === 3 && m3.narrationOpacity > 0.8 && m3.activeNarrationIndex === 0);
  assert.ok(m4.momentIndex === 4 && m4.activeNarrationIndex === 1 && m4.cameraZoom > m1.cameraZoom);
  assert.ok(m5.momentIndex === 5 && m5.portalProgress > 0.6);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
});

test('resolveBubblePlacement computes directional SVG tail positions cleanly', () => {
  const left = resolveBubblePlacement('left', 'comic');
  const right = resolveBubblePlacement('right', 'spectral');
  const caption = resolveBubblePlacement('right', 'caption');

  assert.equal(left.tailSide, 'left');
  assert.equal(left.tailXPercent, 18);
  assert.equal(right.tailSide, 'right');
  assert.equal(right.tailXPercent, 82);
  assert.equal(caption.tailSide, 'center');
});

test('resolveScrollDialogueBeat advances forward cleanly and applies hysteresis on micro-scroll back', () => {
  const beats = [
    { triggerProgress: 0.05 },
    { triggerProgress: 0.45 },
    { triggerProgress: 0.8 },
  ];
  assert.equal(resolveScrollDialogueBeat(0.0, beats, 0), 0);
  assert.equal(resolveScrollDialogueBeat(0.45, beats, 0), 1);
  assert.equal(resolveScrollDialogueBeat(0.85, beats, 1), 2);
  // Micro-scroll slightly behind threshold (0.45 - 0.015 = 0.435 >= 0.45 - 0.025) stays on beat 1
  assert.equal(resolveScrollDialogueBeat(0.435, beats, 1, 0.025), 1);
  // Intentional scroll further back (0.39 < 0.425) returns to beat 0
  assert.equal(resolveScrollDialogueBeat(0.39, beats, 1, 0.025), 0);
});

test('resolveVisibleWordsFromTiming uses word timestamps when available and calibrated cadence otherwise', () => {
  const text = 'Hold the elevator door';
  const timings = [
    { word: 'Hold', startSec: 0, endSec: 0.4 },
    { word: 'the', startSec: 0.45, endSec: 0.7 },
    { word: 'elevator', startSec: 0.75, endSec: 1.3 },
    { word: 'door', startSec: 1.35, endSec: 1.8 },
  ];

  const syncedMid = resolveVisibleWordsFromTiming(text, 0.8, 2.0, timings);
  assert.equal(syncedMid.timingMode, 'word-timestamps');
  assert.equal(syncedMid.visibleCount, 3);

  const estStart = resolveVisibleWordsFromTiming(text, 0, 3.0);
  const estEnd = resolveVisibleWordsFromTiming(text, 2.6, 3.0);
  assert.equal(estStart.timingMode, 'estimated-duration');
  assert.ok(estStart.visibleCount >= 1 && estStart.visibleCount < estEnd.totalWords);
  assert.equal(estEnd.visibleCount, 4);
});

test('CHAPTER_DIALOGUE_SEQUENCES have monotonic triggerProgress, valid modes, and structured voice paths', () => {
  const sequenceEntries = Object.entries(CHAPTER_DIALOGUE_SEQUENCES);
  assert.ok(sequenceEntries.length >= 10);

  for (const [seqId, lines] of sequenceEntries) {
    assert.ok(lines.length > 0, `Sequence ${seqId} should have at least one beat`);
    let prevProgress = -1;
    for (const line of lines) {
      assert.ok(
        line.triggerProgress >= 0 && line.triggerProgress <= 1,
        `${line.id} triggerProgress out of range`,
      );
      assert.ok(
        line.triggerProgress > prevProgress,
        `${line.id} triggerProgress must be strictly increasing`,
      );
      prevProgress = line.triggerProgress;
      assert.ok(
        line.mode === 'dialogue' || line.mode === 'narrator',
        `${line.id} invalid mode`,
      );
      assert.ok(
        line.sourceOrigin === 'comic' || line.sourceOrigin === 'connective',
        `${line.id} invalid sourceOrigin`,
      );
      assert.ok(
        line.audioSrc.startsWith('/assets/audio/voices/'),
        `${line.id} audioSrc must reside under /assets/audio/voices/`,
      );
      assert.ok(line.duration > 0, `${line.id} duration must be positive`);
    }
  }
});

test('buildWeightedWordTimings generates monotonic timings respecting length and punctuation pauses', () => {
  const timings = buildWeightedWordTimings('Stop! Wait here, quickly.', 4.0);
  assert.equal(timings.length, 4);
  for (let i = 0; i < timings.length; i++) {
    assert.ok(timings[i].endSec > timings[i].startSec);
    if (i > 0) {
      assert.ok(timings[i].startSec >= timings[i - 1].endSec - 0.002);
    }
  }
  const waitDur = timings[1].endSec - timings[1].startSec;
  const stopDur = timings[0].endSec - timings[0].startSec; // includes '!' pause
  assert.ok(stopDur > waitDur);
});

test('resolveSyncedWordStates tracks spoken, current, and upcoming words across timestamps and duration', () => {
  const text = 'Hold the elevator door';
  const timings = [
    { word: 'Hold', startSec: 0, endSec: 0.4 },
    { word: 'the', startSec: 0.4, endSec: 0.7 },
    { word: 'elevator', startSec: 0.7, endSec: 1.4 },
    { word: 'door', startSec: 1.4, endSec: 1.9 },
  ];

  const mid = resolveSyncedWordStates(text, 1.05, 2.0, timings);
  assert.equal(mid.timingMode, 'word-timestamps');
  assert.equal(mid.activeWordIndex, 2);
  assert.equal(mid.words[0].status, 'spoken');
  assert.equal(mid.words[1].status, 'spoken');
  assert.equal(mid.words[2].status, 'current');
  assert.equal(mid.words[3].status, 'upcoming');
  assert.ok(mid.words[2].wordProgress > 0.4 && mid.words[2].wordProgress < 0.6);

  const estStart = resolveSyncedWordStates(text, 0.05, 3.0);
  const estEnd = resolveSyncedWordStates(text, 2.8, 3.0);
  assert.equal(estStart.timingMode, 'estimated-duration');
  assert.equal(estStart.words[0].status, 'current');
  assert.equal(estStart.words[3].status, 'upcoming');
  assert.equal(estEnd.progress, 1);
  assert.ok(estEnd.words.every((w) => w.status === 'spoken'));
});


