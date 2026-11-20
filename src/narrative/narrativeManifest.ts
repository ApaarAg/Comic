/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * narrativeManifest.ts
 * Structured scroll-keyed narration beats for all 10 scenes of Chapter 1.
 *
 * Each beat defines:
 * - Spoken text & audio recording reference
 * - Whole-chapter scroll trigger point [0..1]
 * - Co-choreographed visual direction (camera pan/zoom, lighting, environment, SFX)
 * - Caption style & source origin (comic vs connective)
 */

export type NarrationCaptionStyle = 'cinematic' | 'whisper' | 'dramatic';
export type NarrationSourceOrigin = 'comic' | 'connective';

export interface VisualChoreographySpec {
  /** Vertical camera pan target on scene comic panel [0..1] */
  cameraPanPercent?: number;
  /** Multi-plane camera scale factor [1.0..1.15] */
  cameraZoom?: number;
  /** Skyline layer reveal opacity [0.2..1.0] */
  skylineOpacity?: number;
  /** Motion backdrop video activity or playback rate */
  videoActive?: boolean;
  /** Environmental traffic animation intensity */
  trafficSpeed?: 'slow' | 'crawling' | 'gridlock';
  /** Atmospheric dusk motes / particle intensity [0..1] */
  particulateDensity?: number;
  /** Synchronous ambient SFX cue to dispatch */
  sfxCue?: 'discover' | 'horn' | 'transition' | 'bubble' | 'thunder' | 'ding';
  /** Description of the director's visual intent for this beat */
  cinematicNote?: string;
}

export interface NarrationBeat {
  id: string;
  sceneId: string;
  text: string;
  /** Path under /assets/audio/voices/narrator/ */
  audioSrc: string;
  /** Whole-chapter scroll progress [0..1] */
  triggerProgress: number;
  durationMs: number;
  captionStyle: NarrationCaptionStyle;
  sourceOrigin?: NarrationSourceOrigin;
  /** Co-choreographed visual staging */
  visualChoreography?: VisualChoreographySpec;
}

// ---------------------------------------------------------------------------
// Scene bounds (from chapter1Data.ts)
// ---------------------------------------------------------------------------
const SCENE_BOUNDS: Record<string, { start: number; end: number }> = {
  'scene-01': { start: 0.0,  end: 0.09 },
  'scene-02': { start: 0.09, end: 0.18 },
  'scene-03': { start: 0.18, end: 0.27 },
  'scene-04': { start: 0.27, end: 0.39 },
  'scene-05': { start: 0.39, end: 0.51 },
  'scene-06': { start: 0.51, end: 0.61 },
  'scene-07': { start: 0.61, end: 0.72 },
  'scene-08': { start: 0.72, end: 0.83 },
  'scene-09': { start: 0.83, end: 0.91 },
  'scene-10': { start: 0.91, end: 1.0  },
};

/** Remap a per-scene triggerProgress [0..1] to the whole-chapter progress. */
function remap(sceneId: string, localProgress: number): number {
  const b = SCENE_BOUNDS[sceneId];
  if (!b) return localProgress;
  return +(b.start + localProgress * (b.end - b.start)).toFixed(5);
}

// ---------------------------------------------------------------------------
// Beats sourced from dialogueManifest.ts with Bespoke Visual Choreography
// ---------------------------------------------------------------------------

export const SCENE_NARRATION_BEATS: NarrationBeat[] = [
  // ── SCENE 01: The City of Mumbai (0.00 – 0.09) ───────────────────────────
  {
    id: 's01-01',
    sceneId: 'scene-01',
    text: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.',
    audioSrc: '/assets/audio/voices/narrator/scene-01-opening.mp3',
    triggerProgress: remap('scene-01', 0.04),
    durationMs: 4800,
    captionStyle: 'cinematic',
    sourceOrigin: 'comic',
    visualChoreography: {
      cameraPanPercent: 0.05,
      cameraZoom: 1.02,
      skylineOpacity: 0.65,
      videoActive: true,
      particulateDensity: 0.8,
      trafficSpeed: 'slow',
      sfxCue: 'discover',
      cinematicNote: 'Camera framed on high sunset clouds, crimson solar corona, distant Mumbai towers.',
    },
  },
  {
    id: 's01-02',
    sceneId: 'scene-01',
    text: 'Down where the elevated highway curves between glass towers, the city exhaled in horns and heat.',
    audioSrc: '/assets/audio/voices/narrator/scene-01-highway.mp3',
    triggerProgress: remap('scene-01', 0.56),
    durationMs: 4400,
    captionStyle: 'whisper',
    sourceOrigin: 'connective',
    visualChoreography: {
      cameraPanPercent: 0.62,
      cameraZoom: 1.06,
      skylineOpacity: 0.40,
      videoActive: true,
      particulateDensity: 0.6,
      trafficSpeed: 'crawling',
      sfxCue: 'horn',
      cinematicNote: 'Camera glides down splash plate into the curving concrete BKC overpass and headlights.',
    },
  },

  // ── SCENE 02: The Chaotic Journey (0.09 – 0.18) ──────────────────────────
  {
    id: 's02-conn-01',
    sceneId: 'scene-02',
    text: 'On the B.K.C. overpass, one city became many cities — each trapped inside its own small metal shell.',
    audioSrc: '/assets/audio/voices/narrator/scene-02-connector.mp3',
    triggerProgress: remap('scene-02', 0.22),
    durationMs: 4000,
    captionStyle: 'whisper',
    sourceOrigin: 'connective',
    visualChoreography: {
      cameraZoom: 1.04,
      trafficSpeed: 'gridlock',
      sfxCue: 'horn',
      cinematicNote: 'Atmospheric bridge over cab gridlock as Mrs. Shah calls from the backseat.',
    },
  },

  // ── SCENE 03: The College Party (0.18 – 0.27) ────────────────────────────
  {
    id: 's03-02',
    sceneId: 'scene-03',
    text: '...Beneath gentle curls of raven hair, her eyes stayed fixed on distant city lights while her thoughts drifted like cigarette smoke.',
    audioSrc: '/assets/audio/voices/narrator/s03-02-window.mp3',
    triggerProgress: remap('scene-03', 0.58),
    durationMs: 4800,
    captionStyle: 'cinematic',
    sourceOrigin: 'comic',
    visualChoreography: {
      cameraZoom: 1.08,
      sfxCue: 'discover',
      cinematicNote: 'Window perspective looking out from the 6th-floor party over the midnight skyline.',
    },
  },

  // ── SCENE 04: Death\'s World (0.27 – 0.39) ─────────────────────────────────
  {
    id: 's04-conn-01',
    sceneId: 'scene-04',
    text: 'Beyond the mortal clouds, in a place where endings are drafted like memos, something unprecedented was happening.',
    audioSrc: '/assets/audio/voices/narrator/scene-04-connector.mp3',
    triggerProgress: remap('scene-04', 0.14),
    durationMs: 4600,
    captionStyle: 'dramatic',
    sourceOrigin: 'connective',
    visualChoreography: {
      cameraZoom: 1.03,
      sfxCue: 'ding',
      cinematicNote: 'Surreal silvered celestial tower elevator ascending past mortal concerns.',
    },
  },

  // ── SCENE 05: Two Events, One Moment (0.39 – 0.51) ───────────────────────
  {
    id: 's05-01',
    sceneId: 'scene-05',
    text: 'It was around that time that the girl from the window at the party was falling through the air — two floors down and fast approaching the ground.',
    audioSrc: '/assets/audio/voices/narrator/s05-01-fall.mp3',
    triggerProgress: remap('scene-05', 0.04),
    durationMs: 5200,
    captionStyle: 'dramatic',
    sourceOrigin: 'comic',
    visualChoreography: {
      cameraPanPercent: 0.35,
      cameraZoom: 1.05,
      sfxCue: 'bubble',
      cinematicNote: 'The fall: vertical downward perspective tracking the plummeting girl.',
    },
  },
  {
    id: 's05-02',
    sceneId: 'scene-05',
    text: "Just as she hit the ground, Mrs. Shah was in the Amravati Hospital squeezing her husband's hand with such strength that he was screaming louder than her.",
    audioSrc: '/assets/audio/voices/narrator/s05-02-birth.mp3',
    triggerProgress: remap('scene-05', 0.42),
    durationMs: 5400,
    captionStyle: 'cinematic',
    sourceOrigin: 'comic',
    visualChoreography: {
      cameraPanPercent: 0.65,
      cameraZoom: 1.04,
      sfxCue: 'bubble',
      cinematicNote: 'Hospital delivery room: urgency, harsh light, simultaneous convergence.',
    },
  },
  {
    id: 's05-03',
    sceneId: 'scene-05',
    text: 'As the midwife urged her into one last push, a new life came into being. A beautiful thing that would go on to be the cause of much consternation in his many years to come.',
    audioSrc: '/assets/audio/voices/narrator/s05-03-darius.mp3',
    triggerProgress: remap('scene-05', 0.74),
    durationMs: 5800,
    captionStyle: 'cinematic',
    sourceOrigin: 'comic',
    visualChoreography: {
      cameraPanPercent: 0.95,
      cameraZoom: 1.02,
      sfxCue: 'discover',
      cinematicNote: 'Darius Shah is born: the moment mortality begins its timer.',
    },
  },

  // ── SCENE 06: Laila Becomes Mortal (0.51 – 0.61) ─────────────────────────
  {
    id: 's06-conn-01',
    sceneId: 'scene-06',
    text: 'A deal was being struck — the kind that bends the fabric of everything.',
    audioSrc: '/assets/audio/voices/narrator/scene-06-connector.mp3',
    triggerProgress: remap('scene-06', 0.52),
    durationMs: 3200,
    captionStyle: 'dramatic',
    sourceOrigin: 'connective',
    visualChoreography: {
      cameraZoom: 1.06,
      sfxCue: 'thunder',
      cinematicNote: 'Descent in storm: cosmic energy spirals down toward concrete.',
    },
  },

  // ── SCENE 07: The Hospital (0.61 – 0.72) ─────────────────────────────────
  {
    id: 's07-conn-01',
    sceneId: 'scene-07',
    text: 'She woke up in a body that felt borrowed, in a room that smelled of antiseptic and second chances.',
    audioSrc: '/assets/audio/voices/narrator/scene-07-connector.mp3',
    triggerProgress: remap('scene-07', 0.12),
    durationMs: 3800,
    captionStyle: 'whisper',
    sourceOrigin: 'connective',
    visualChoreography: {
      cameraZoom: 1.02,
      sfxCue: 'bubble',
      cinematicNote: 'Awakening in mortality: cold fluorescent clinic light, heart monitor flatline recovery.',
    },
  },

  // ── SCENE 08: The Escape (0.72 – 0.83) ───────────────────────────────────
  {
    id: 's08-conn-01',
    sceneId: 'scene-08',
    text: 'The neo-natal ward held its breath. Death held a baby.',
    audioSrc: '/assets/audio/voices/narrator/scene-08-connector.mp3',
    triggerProgress: remap('scene-08', 0.25),
    durationMs: 3000,
    captionStyle: 'dramatic',
    sourceOrigin: 'connective',
    visualChoreography: {
      cameraZoom: 1.05,
      sfxCue: 'discover',
      cinematicNote: 'Room 7: moonlight and glass, an impossible tender hesitation.',
    },
  },

  // ── SCENE 09: The Second Death (0.83 – 0.91) ─────────────────────────────
  {
    id: 's09-01',
    sceneId: 'scene-09',
    text: 'And in Mumbai, even at that late hour, great thundering wheels of commerce rolled on unfettered.',
    audioSrc: '/assets/audio/voices/narrator/s09-01-commerce.mp3',
    triggerProgress: remap('scene-09', 0.05),
    durationMs: 4200,
    captionStyle: 'dramatic',
    sourceOrigin: 'comic',
    visualChoreography: {
      cameraZoom: 1.07,
      sfxCue: 'horn',
      cinematicNote: 'Midnight rain, blinding truck headlights, impact approach.',
    },
  },
  {
    id: 's09-02',
    sceneId: 'scene-09',
    text: 'And so, only a few minutes away from midnight, Laila Starr met her death once again.',
    audioSrc: '/assets/audio/voices/narrator/s09-02-midnight.mp3',
    triggerProgress: remap('scene-09', 0.58),
    durationMs: 4000,
    captionStyle: 'cinematic',
    sourceOrigin: 'comic',
    visualChoreography: {
      cameraZoom: 1.12,
      sfxCue: 'transition',
      cinematicNote: 'Blackout impact: sound and vision fracture into quiet.',
    },
  },

  // ── SCENE 10: Eight Years Later (0.91 – 1.00) ────────────────────────────
  {
    id: 's10-conn-01',
    sceneId: 'scene-10',
    text: 'Eight years later, the sun rose anyway — as it always has, as it always will.',
    audioSrc: '/assets/audio/voices/narrator/scene-10-connector.mp3',
    triggerProgress: remap('scene-10', 0.08),
    durationMs: 3400,
    captionStyle: 'cinematic',
    sourceOrigin: 'connective',
    visualChoreography: {
      cameraZoom: 1.01,
      sfxCue: 'discover',
      cinematicNote: 'Peaceful dawn tea with Pranah over the Gateway of India harbour.',
    },
  },
];
