export interface SceneRange {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  timecode: string;
  /** Normalized scroll start [0..1] */
  start: number;
  /** Normalized scroll end [0..1] */
  end: number;
  theme: {
    bg: string;
    surface: string;
    text: string;
    accent: string;
    mood: 'prologue' | 'sunset' | 'traffic' | 'twilight' | 'celestial' | 'split' | 'descent' | 'clinical' | 'chase' | 'impact' | 'dawn';
  };
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

/**
 * Maps a global scroll progress [0..1] into a local scene progress [0..1]
 * given scene bounds [start, end].
 */
export function getLocalProgress(globalProgress: number, start: number, end: number): number {
  const span = end - start;
  if (span <= 0) return 0;
  return clamp01((globalProgress - start) / span);
}

/**
 * Finds the active scene index for a given normalized scroll progress [0..1].
 */
export function resolveActiveSceneIndex(
  globalProgress: number,
  scenes: ReadonlyArray<Pick<SceneRange, 'start' | 'end'>>,
): number {
  if (scenes.length === 0) return 0;
  const p = clamp01(globalProgress);
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    if (p >= s.start && (p < s.end || i === scenes.length - 1)) {
      return i;
    }
  }
  return scenes.length - 1;
}

/**
 * Resolves the active scene index from actual DOM section top offsets and current scroll position.
 * Uses a viewport focal line (scrollY + viewportHeight * 0.35) so scene transitions occur naturally
 * as the incoming scene claims the upper-middle of the viewport.
 */
export function resolveActiveSceneByOffsets(
  scrollY: number,
  viewportHeight: number,
  sectionTops: ReadonlyArray<number>,
): number {
  if (sectionTops.length === 0) return 0;
  const focalY = Math.max(0, scrollY) + Math.max(0, viewportHeight) * 0.35;
  let active = 0;
  for (let i = 0; i < sectionTops.length; i++) {
    if (focalY >= sectionTops[i]) {
      active = i;
    } else {
      break;
    }
  }
  return active;
}

/**
 * Computes parallax vertical offset in pixels based on element progress [0..1]
 * and depth factor (negative moves slower/upward, positive moves deeper).
 */
export function computeParallaxY(localProgress: number, depthPx: number): number {
  const centered = clamp01(localProgress) - 0.5;
  return Math.round(centered * depthPx * 100) / 100;
}

/**
 * Computes synchronized parallel-editing phase values for Scene 05 (Two Events, One Moment).
 * - fallProgress: the girl plummeting two floors from the party window
 * - birthProgress: Mrs. Shah giving birth to Darius in Amravati Hospital
 * - convergence: peaks at 1.0 when both events collide at the exact instant (t = 0.65..0.85)
 */
export function computeParallelEditState(localProgress: number): {
  fallProgress: number;
  birthProgress: number;
  convergence: number;
  splitRatio: number;
} {
  const t = clamp01(localProgress);
  const fallProgress = clamp01(t / 0.78);
  const birthProgress = clamp01((t - 0.12) / 0.78);
  // Convergence peaks around t = 0.78 when hitting the ground and first breath collide
  const distFromPeak = Math.abs(t - 0.78);
  const convergence = clamp01(1 - distFromPeak / 0.22);
  // Split ratio subtly shifts from 50/50 toward 48/52 -> 50/50 with tension
  const splitRatio = 0.5 + Math.sin(t * Math.PI * 2) * 0.04;
  return {
    fallProgress,
    birthProgress,
    convergence,
    splitRatio,
  };
}

/**
 * Computes dramatic zoom scale & intensity for Scene 09 (The Second Death).
 * Progresses smoothly from 1.0 -> 1.18 before impact flash at t >= 0.84.
 */
export function computeImpactZoom(localProgress: number): {
  scale: number;
  headlightIntensity: number;
  isImpactWindow: boolean;
} {
  const t = clamp01(localProgress);
  const eased = t * t * (3 - 2 * t);
  const scale = 1 + eased * 0.18;
  const headlightIntensity = clamp01((t - 0.2) / 0.65);
  const isImpactWindow = t >= 0.84;
  return { scale, headlightIntensity, isImpactWindow };
}

/**
 * Parses a hex color '#RRGGBB' into [r, g, b] and blends two hex colors.
 */
export function blendHexColors(hexA: string, hexB: string, t: number): string {
  const parse = (hex: string): [number, number, number] => {
    const clean = hex.replace('#', '');
    const full = clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean.padEnd(6, '0').slice(0, 6);
    const num = parseInt(full, 16);
    if (Number.isNaN(num)) return [12, 18, 32];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const ratio = clamp01(t);
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export interface SceneBound {
  start: number;
  end: number;
}

export interface SceneJourneySegment {
  id: string;
  index: number;
  title: string;
  timecode: string;
  accent: string;
  start: number;
  end: number;
  widthPct: number;
  fillRatio: number;
  isCompleted: boolean;
  isActive: boolean;
}

/**
 * Converts actual DOM section top positions into normalized [0..1] scroll bounds
 * aligned with resolveActiveSceneByOffsets focal transitions.
 */
export function computeNormalizedSceneBounds(
  sectionTops: ReadonlyArray<number>,
  maxScroll: number,
  viewportHeight: number,
): SceneBound[] {
  if (sectionTops.length === 0) return [];
  const safeMax = Math.max(1, maxScroll);
  const focalOffset = Math.max(0, viewportHeight) * 0.35;

  const entryPoints = sectionTops.map((top, idx) => {
    if (idx === 0) return 0;
    return clamp01((top - focalOffset) / safeMax);
  });

  // Enforce monotonic non-decreasing entry points with minimum visible span
  for (let i = 1; i < entryPoints.length; i++) {
    if (entryPoints[i] < entryPoints[i - 1]) {
      entryPoints[i] = entryPoints[i - 1];
    }
  }

  return entryPoints.map((start, idx) => {
    const rawEnd = idx === entryPoints.length - 1 ? 1 : entryPoints[idx + 1];
    const end = Math.max(start, rawEnd);
    return { start, end };
  });
}

/**
 * Computes per-scene progress segments across the total chapter reading journey.
 */
export function computeSceneJourneySegments(
  globalProgress: number,
  scenes: ReadonlyArray<SceneRange>,
  activeSceneIndex: number,
  customBounds?: ReadonlyArray<SceneBound>,
): SceneJourneySegment[] {
  if (scenes.length === 0) return [];
  const p = clamp01(globalProgress);
  const useCustom = customBounds && customBounds.length === scenes.length;

  return scenes.map((scene, idx) => {
    const start = useCustom ? clamp01(customBounds[idx].start) : clamp01(scene.start);
    const end = useCustom ? clamp01(customBounds[idx].end) : clamp01(scene.end);
    const span = Math.max(0.01, end - start);
    const isCompleted = idx < activeSceneIndex || p >= 0.999;
    const isActive = idx === activeSceneIndex;

    let fillRatio = 0;
    if (isCompleted) {
      fillRatio = 1;
    } else if (idx > activeSceneIndex && p <= start) {
      fillRatio = 0;
    } else {
      fillRatio = end > start ? clamp01((p - start) / (end - start)) : isActive ? 1 : 0;
    }

    return {
      id: scene.id,
      index: scene.index,
      title: scene.title,
      timecode: scene.timecode,
      accent: scene.theme.accent,
      start,
      end,
      widthPct: span * 100,
      fillRatio,
      isCompleted,
      isActive,
    };
  });
}

/**
 * Maps a normalized [0..1] scroll progress into a safe HTMLVideoElement timestamp
 * within [0, durationSeconds - safeMarginSeconds], handling non-finite durations cleanly.
 */
export function computeVideoScrubTime(
  progress: number,
  durationSeconds: number,
  safeMarginSeconds = 0.08,
): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  const clampedMargin = Math.max(0, Math.min(safeMarginSeconds, durationSeconds * 0.25));
  const maxSeek = Math.max(0, durationSeconds - clampedMargin);
  return Math.round(clamp01(progress) * maxSeek * 1000) / 1000;
}

/**
 * Determines HTML5 video preload strategy based on distance from the active scene
 * so only current and adjacent scenes buffer media.
 */
export function shouldPreloadSceneVideo(
  sceneIndex: number,
  activeSceneIndex: number,
  radius = 1,
): 'auto' | 'metadata' | 'none' {
  if (!Number.isFinite(sceneIndex) || !Number.isFinite(activeSceneIndex)) return 'none';
  const distance = Math.abs(Math.round(sceneIndex) - Math.round(activeSceneIndex));
  if (distance === 0) return 'auto';
  if (distance <= Math.max(0, Math.round(radius))) return 'metadata';
  return 'none';
}

/**
 * Decides whether a scene backdrop should render active video playback or fall back
 * cleanly to a static high-resolution comic artwork poster.
 */
export function selectBackdropMode(options: {
  reducedMotion: boolean;
  isMobileViewport: boolean;
  preferMobilePoster?: boolean;
  hasVideoError: boolean;
}): 'video' | 'poster' {
  if (options.reducedMotion || options.hasVideoError) return 'poster';
  if (options.isMobileViewport && options.preferMobilePoster) return 'poster';
  return 'video';
}

export interface AudioBusSettings {
  masterMuted: boolean;
  ambienceVolume: number;
  scoreVolume?: number;
  sfxVolume: number;
  voiceVolume: number;
  ambienceMuted: boolean;
  scoreMuted?: boolean;
  sfxMuted: boolean;
  voiceMuted: boolean;
  isVoiceActive: boolean;
}

export interface ComputedAudioMix {
  ambienceGain: number;
  scoreGain: number;
  sfxGain: number;
  voiceGain: number;
  duckFactor: number;
}

/**
 * Computes effective Howler bus volumes with cinematic dynamic mixing targets:
 * - Voice: Reference level (0.95 ~ 0 dB)
 * - Music without speech: -8 to -12 dB relative to voice (~0.30)
 * - Music during speech: -15 to -20 dB below voice (~0.114, duckFactor = 0.38)
 * - Ambience without speech: -18 to -24 dB relative to voice (~0.10)
 * - Ambience during speech: -24 dB below voice (~0.05)
 * - Master output: Soft-clipped ceiling avoiding inter-sample peaks
 */
export function computeAudioMixLevels(settings: AudioBusSettings): ComputedAudioMix {
  if (settings.masterMuted) {
    return { ambienceGain: 0, scoreGain: 0, sfxGain: 0, voiceGain: 0, duckFactor: 1 };
  }
  const duckFactor = settings.isVoiceActive ? 0.38 : 1;
  const ambienceDucking = settings.isVoiceActive ? 0.55 : 1;
  const ambienceVolume = settings.ambienceVolume ?? 0.10;
  const scoreVolume = settings.scoreVolume ?? 0.30;
  const sfxVolume = settings.sfxVolume ?? 0.45;
  const voiceVolume = settings.voiceVolume ?? 0.95;

  const ambienceGain = settings.ambienceMuted
    ? 0
    : Math.round(clamp01(ambienceVolume) * ambienceDucking * 1000) / 1000;
  const scoreGain = (settings.scoreMuted ?? false)
    ? 0
    : Math.round(clamp01(scoreVolume) * duckFactor * 1000) / 1000;
  const sfxGain = settings.sfxMuted
    ? 0
    : Math.round(clamp01(sfxVolume) * (settings.isVoiceActive ? 0.75 : 1) * 1000) / 1000;
  const voiceGain = settings.voiceMuted
    ? 0
    : Math.round(clamp01(voiceVolume) * 1000) / 1000;

  return { ambienceGain, scoreGain, sfxGain, voiceGain, duckFactor };
}

/**
 * Pure sequential dialogue index stepper clamped safely to [0, totalLines - 1].
 */
export function stepDialogueIndex(currentIndex: number, delta: number, totalLines: number): number {
  if (!Number.isFinite(totalLines) || totalLines <= 0) return 0;
  const maxIndex = Math.max(0, Math.floor(totalLines) - 1);
  const safeCurrent = Number.isFinite(currentIndex) ? Math.floor(currentIndex) : 0;
  const safeDelta = Number.isFinite(delta) ? Math.trunc(delta) : 0;
  return Math.max(0, Math.min(maxIndex, safeCurrent + safeDelta));
}

/**
 * Splits a dialogue string into tokens and computes visible count for smooth comic bubble reveal.
 */
export function computeVisibleWordCount(text: string, revealProgress: number): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const p = clamp01(revealProgress);
  if (p >= 0.999) return words.length;
  return Math.max(1, Math.ceil(words.length * p));
}

export type TransitionEffectKind =
  | 'ink-spread'
  | 'panel-slice'
  | 'celestial-portal'
  | 'temporal-split'
  | 'storm-dissolve'
  | 'kinetic-sweep'
  | 'dawn-mist';

/**
 * Shapes scroll progress [0..1] into transition envelope peaking around midpoint
 * for WebGL shader transitions between chapters.
 */
export function computeShaderTransitionEnvelope(
  progress: number,
  kind: TransitionEffectKind,
): { intensity: number; warp: number; dissolve: number } {
  const t = clamp01(progress);
  const bell = Math.sin(t * Math.PI);
  if (kind === 'storm-dissolve') {
    const crack = Math.pow(bell, 0.75);
    return {
      intensity: Math.round(crack * 1000) / 1000,
      warp: Math.round((0.4 + crack * 0.6) * 1000) / 1000,
      dissolve: Math.round(t * 1000) / 1000,
    };
  }
  if (kind === 'celestial-portal') {
    const smooth = t * t * (3 - 2 * t);
    return {
      intensity: Math.round(bell * 1000) / 1000,
      warp: Math.round(smooth * 1000) / 1000,
      dissolve: Math.round((0.25 + bell * 0.75) * 1000) / 1000,
    };
  }
  return {
    intensity: Math.round(bell * 1000) / 1000,
    warp: Math.round(bell * 0.85 * 1000) / 1000,
    dissolve: Math.round(t * 1000) / 1000,
  };
}

export interface PrologueMomentBounds {
  start: number;
  end: number;
}

export interface PrologueVisualState {
  progress: number;
  momentIndex: number;
  darknessVeilOpacity: number;
  titleReveal: number;
  mumbaiReveal: number;
  cameraZoom: number;
  cameraPanY: number;
  narrationOpacity: number;
  activeNarrationIndex: number;
  portalProgress: number;
}

/**
 * Resolves the active prologue moment index [0..moments.length-1] from normalized scroll progress [0..1].
 */
export function resolvePrologueMomentIndex(
  progress: number,
  moments: ReadonlyArray<PrologueMomentBounds>,
): number {
  if (moments.length === 0) return 0;
  const p = clamp01(progress);
  for (let i = 0; i < moments.length; i++) {
    const m = moments[i];
    if (p >= m.start && (p < m.end || i === moments.length - 1)) {
      return i;
    }
  }
  return moments.length - 1;
}

/**
 * Computes continuous scroll-scrubbed cinematic camera, lighting, and layer values across the 5 prologue scenes:
 * - Scene A: Darkness (0.00 – 0.20)
 * - Scene B: Mumbai Skyline slowly revealed with depth/parallax (0.20 – 0.40)
 * - Scene C: Narration with approved Prabhat Neural voice + cinematic captions (0.40 – 0.65)
 * - Scene D: Title Reveal with elegant typography (0.65 – 0.85)
 * - Scene E: Seamless enter into comic / original artwork (0.85 – 1.00)
 */
export function computePrologueVisualState(
  progress: number,
  moments: ReadonlyArray<PrologueMomentBounds>,
): PrologueVisualState {
  const p = clamp01(progress);
  const momentIndex = resolvePrologueMomentIndex(p, moments);

  // Scene A Darkness Veil: 1.0 at start, smoothly dissolves away as Scene B approaches (0.16 -> 0.28)
  const darknessVeilOpacity = Math.round((1 - clamp01((p - 0.16) / 0.14)) * 1000) / 1000;

  // Scene B Mumbai Skyline Reveal: starts emerging around 0.18, fully visible by 0.36, stays active
  const mumbaiReveal = Math.round(clamp01((p - 0.18) / 0.18) * 1000) / 1000;

  // Scene C Narration with Prabhat Neural: active from 0.40 to 0.65 (fadeIn 0.38-0.44, fadeOut 0.61-0.66)
  const narrationIn = clamp01((p - 0.38) / 0.06);
  const narrationOut = 1 - clamp01((p - 0.61) / 0.05);
  const narrationOpacity = Math.round(narrationIn * narrationOut * 1000) / 1000;
  const activeNarrationIndex = 0;

  // Scene D Title Reveal: active from 0.65 to 0.85 (fadeIn 0.64-0.70, fadeOut 0.81-0.86)
  const titleIn = clamp01((p - 0.64) / 0.06);
  const titleOut = 1 - clamp01((p - 0.81) / 0.05);
  const titleReveal = Math.round(titleIn * titleOut * 1000) / 1000;

  // Camera Zoom & Pan across the 5 scenes
  const easedP = p * p * (3 - 2 * p);
  const cameraZoom = Math.round((1 + easedP * 0.22) * 1000) / 1000;
  const cameraPanY = Math.round((0.5 - easedP) * 24 * 100) / 100;

  // Scene E Portal Dive: accelerates from 0.85 to 1.00 into original comic artwork
  const portalProgress = Math.round(clamp01((p - 0.85) / 0.15) * 1000) / 1000;

  return {
    progress: p,
    momentIndex,
    darknessVeilOpacity,
    titleReveal,
    mumbaiReveal,
    cameraZoom,
    cameraPanY,
    narrationOpacity,
    activeNarrationIndex,
    portalProgress,
  };
}

export interface BubblePlacement {
  alignClass: string;
  tailSide: 'left' | 'right' | 'center';
  tailXPercent: number;
}

/**
 * Computes responsive comic speech bubble alignment and SVG tail anchor position
 * so bubbles point toward speakers without crowding edges on desktop or mobile.
 */
export function resolveBubblePlacement(
  side: 'left' | 'right' | 'center' | 'bottom',
  shape: 'comic' | 'celestial' | 'spectral' | 'caption',
): BubblePlacement {
  if (shape === 'caption' || side === 'center' || side === 'bottom') {
    return {
      alignClass: 'mx-auto items-center',
      tailSide: 'center',
      tailXPercent: 50,
    };
  }
  if (side === 'right') {
    return {
      alignClass: 'ml-auto items-end',
      tailSide: 'right',
      tailXPercent: 82,
    };
  }
  return {
    alignClass: 'mr-auto items-start',
    tailSide: 'left',
    tailXPercent: 18,
  };
}

export interface WordTimingEntry {
  word: string;
  startSec: number;
  endSec: number;
}

export interface ScrollDialogueBeatSpec {
  id: string;
  triggerProgress: number;
  durationSec: number;
  wordTimings?: ReadonlyArray<WordTimingEntry>;
}

/**
 * Resolves the active dialogue beat index from normalized scroll progress [0..1]
 * with a small hysteresis band around transitions so tiny scroll micro-adjustments
 * do not toggle beats or restart audio unexpectedly.
 */
export function resolveScrollDialogueBeat(
  localProgress: number,
  beats: ReadonlyArray<Pick<ScrollDialogueBeatSpec, 'triggerProgress'>>,
  currentIndex = 0,
  hysteresis = 0.025,
): number {
  if (beats.length === 0) return 0;
  const p = clamp01(localProgress);
  const safeCurrent = Math.max(0, Math.min(beats.length - 1, Math.floor(currentIndex)));
  const safeHyst = Math.max(0, Math.min(0.1, hysteresis));

  let candidate = 0;
  for (let i = 0; i < beats.length; i++) {
    if (p >= beats[i].triggerProgress) {
      candidate = i;
    } else {
      break;
    }
  }

  // Apply hysteresis when stepping backwards across a trigger threshold
  if (candidate < safeCurrent) {
    const stayThreshold = beats[safeCurrent].triggerProgress - safeHyst;
    if (p >= stayThreshold) {
      return safeCurrent;
    }
  }

  return candidate;
}

/**
 * Computes progressive word reveal count synchronized either to explicit word-level
 * timestamps (when available) or an honest duration-calibrated reading cadence.
 */
export function resolveVisibleWordsFromTiming(
  text: string,
  elapsedSec: number,
  durationSec: number,
  wordTimings?: ReadonlyArray<WordTimingEntry>,
): {
  visibleCount: number;
  totalWords: number;
  progress: number;
  timingMode: 'word-timestamps' | 'estimated-duration';
} {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  if (totalWords === 0) {
    return {
      visibleCount: 0,
      totalWords: 0,
      progress: 1,
      timingMode: wordTimings && wordTimings.length > 0 ? 'word-timestamps' : 'estimated-duration',
    };
  }

  const safeElapsed = Math.max(0, Number.isFinite(elapsedSec) ? elapsedSec : 0);

  if (wordTimings && wordTimings.length > 0) {
    let spokenCount = 1;
    for (let i = 0; i < wordTimings.length; i++) {
      if (safeElapsed >= wordTimings[i].startSec) {
        spokenCount = i + 1;
      }
    }
    const visibleCount = Math.min(totalWords, Math.max(1, spokenCount));
    return {
      visibleCount,
      totalWords,
      progress: clamp01(visibleCount / totalWords),
      timingMode: 'word-timestamps',
    };
  }

  // Honest estimated cadence calibrated to clip duration:
  // reveal completes at ~82% of duration so the full sentence lingers comfortably before exit.
  const safeDuration = Math.max(0.8, Number.isFinite(durationSec) ? durationSec : 2.8);
  const revealWindowSec = Math.min(4.8, Math.max(0.75, safeDuration * 0.82));
  const rawFraction = clamp01(safeElapsed / revealWindowSec);
  const smoothProgress = clamp01(0.14 + rawFraction * 0.86);
  const visibleCount = computeVisibleWordCount(text, smoothProgress);

  return {
    visibleCount,
    totalWords,
    progress: smoothProgress,
    timingMode: 'estimated-duration',
  };
}

export type WordRevealStatus = 'spoken' | 'current' | 'upcoming';

export interface SyncedWordToken {
  word: string;
  index: number;
  startSec: number;
  endSec: number;
  status: WordRevealStatus;
  wordProgress: number;
}

export interface SyncedWordRevealState {
  words: SyncedWordToken[];
  visibleCount: number;
  activeWordIndex: number;
  totalWords: number;
  progress: number;
  timingMode: 'word-timestamps' | 'estimated-duration';
}

/**
 * Generates monotonic per-word start/end timestamps across durationSec weighted
 * by word length and natural clause punctuation pauses (commas, dashes, periods).
 */
export function buildWeightedWordTimings(
  text: string,
  durationSec: number,
): WordTimingEntry[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const safeDuration = Math.max(0.8, Number.isFinite(durationSec) ? durationSec : 2.8);
  const revealWindowSec = Math.min(5.4, Math.max(0.75, safeDuration * 0.84));

  const weights = words.map((raw) => {
    const cleanLen = raw.replace(/[^a-zA-Z0-9]/g, '').length;
    let weight = 0.55 + Math.max(1, cleanLen) * 0.14;
    if (/[.!?…]$/.test(raw)) {
      weight += 0.55;
    } else if (/[—–]$/.test(raw) || raw.includes('—') || raw.includes('...')) {
      weight += 0.42;
    } else if (/[,;:]$/.test(raw)) {
      weight += 0.35;
    }
    return weight;
  });

  const totalWeight = weights.reduce((acc, w) => acc + w, 0) || words.length;
  let cursor = 0;

  return words.map((word, idx) => {
    const slice = (weights[idx] / totalWeight) * revealWindowSec;
    const startSec = Math.round(cursor * 1000) / 1000;
    cursor += slice;
    const endSec =
      idx === words.length - 1
        ? Math.round(revealWindowSec * 1000) / 1000
        : Math.round(cursor * 1000) / 1000;
    return { word, startSec, endSec };
  });
}

/**
 * Computes progressive per-word synchronization state ('spoken' | 'current' | 'upcoming')
 * using explicit forced-alignment wordTimings when provided, or natural punctuation-weighted
 * duration pacing otherwise.
 */
export function resolveSyncedWordStates(
  text: string,
  elapsedSec: number,
  durationSec: number,
  wordTimings?: ReadonlyArray<WordTimingEntry>,
): SyncedWordRevealState {
  const rawWords = text.trim().split(/\s+/).filter(Boolean);
  const totalWords = rawWords.length;
  const hasExplicitTimings = Boolean(wordTimings && wordTimings.length > 0);
  const timingMode: 'word-timestamps' | 'estimated-duration' = hasExplicitTimings
    ? 'word-timestamps'
    : 'estimated-duration';

  if (totalWords === 0) {
    return {
      words: [],
      visibleCount: 0,
      activeWordIndex: -1,
      totalWords: 0,
      progress: 1,
      timingMode,
    };
  }

  const safeElapsed = Math.max(0, Number.isFinite(elapsedSec) ? elapsedSec : 0);
  const entries =
    hasExplicitTimings && wordTimings
      ? rawWords.map((word, idx) => {
          const matched = wordTimings[idx];
          if (matched) return matched;
          const lastEnd = wordTimings[wordTimings.length - 1]?.endSec ?? Math.max(1, durationSec);
          return { word, startSec: lastEnd, endSec: lastEnd + 0.2 };
        })
      : buildWeightedWordTimings(text, durationSec);

  const finalEnd = entries[entries.length - 1]?.endSec ?? Math.max(0.8, durationSec * 0.84);
  const isComplete = safeElapsed >= finalEnd;

  let activeWordIndex = isComplete ? totalWords - 1 : 0;
  let visibleCount = 0;

  const tokens: SyncedWordToken[] = entries.map((entry, idx) => {
    const start = Math.max(0, entry.startSec);
    const end = Math.max(start + 0.05, entry.endSec);

    let status: WordRevealStatus;
    let wordProgress: number;

    if (isComplete || safeElapsed >= end) {
      status = 'spoken';
      wordProgress = 1;
      visibleCount += 1;
    } else if (safeElapsed >= start || (idx === 0 && safeElapsed >= 0)) {
      status = 'current';
      activeWordIndex = idx;
      wordProgress = clamp01((safeElapsed - start) / (end - start));
      visibleCount += 1;
    } else {
      status = 'upcoming';
      wordProgress = 0;
    }

    return {
      word: rawWords[idx] ?? entry.word,
      index: idx,
      startSec: start,
      endSec: end,
      status,
      wordProgress,
    };
  });

  if (isComplete) {
    activeWordIndex = totalWords - 1;
  }

  const revealSpan = Math.max(0.5, finalEnd);
  const progress = isComplete ? 1 : clamp01(safeElapsed / revealSpan);

  return {
    words: tokens,
    visibleCount: Math.max(1, Math.min(totalWords, visibleCount)),
    activeWordIndex,
    totalWords,
    progress,
    timingMode,
  };
}
