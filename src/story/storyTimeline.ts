/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * storyTimeline.ts
 *
 * Storyverse 3.0: Unified Storyboard Timeline Core (Single Source of Truth)
 *
 * Unifies all 11 scenes (Prologue + Scenes 01 to 10), coordinating:
 * 1. Pinned 100vh Virtual Camera Choreography (Pan, Tilt, Zoom, Depth, Holds)
 * 2. 2.5D Multi-Plane Parallax Layer Transforms
 * 3. Exact Comic Panel Visibility and Framing
 * 4. Embedded Character Dialogue Speech Bubbles (34 Verified Takes)
 * 5. Cinematic Chronicle Narration Beats (14 Verified George Takes)
 * 6. Dynamic 4-Layer Audio Bus Events (Voice > Score > Ambience > SFX)
 * 7. Leitmotif Cues & Scene Transitions
 *
 * Architectural Guarantees:
 * - Immutable Timeline Data Structure
 * - 100% Pure & Reversible Visual State Resolution (Smooth forward & backward scrubbing)
 * - Explicit Audio Latching & Rapid-Scroll Hysteresis (Zero duplicate speech / no audio backlogs)
 * - Mobile-Adaptive Camera Framing (Dynamically adjusts pan and zoom limits for narrow viewports)
 */

import type { CharacterId, CharacterExpression, BubbleAnchorSide } from './dialogueManifest';
import type { WordTimingEntry } from './scrollMath';

// ============================================================================
// Core Timeline Types & Interfaces
// ============================================================================

export type StoryEventType =
  | 'camera'
  | 'narration'
  | 'dialogue'
  | 'music'
  | 'ambience'
  | 'sfx'
  | 'leitmotif'
  | 'transition';

export type AudioBusPriority =
  | 'dialogue'     // Priority 1 (highest - preempts/ducks all speech and music)
  | 'narration'    // Priority 2 (ducks music and ambience)
  | 'sfx'          // Priority 3 (spatial cues)
  | 'leitmotif'    // Priority 4 (thematic stings)
  | 'music'        // Priority 5 (background cinematic score)
  | 'ambience';    // Priority 6 (continuous bed)

export type InterruptionPolicy =
  | 'pause_resume'      // Pause narration when dialogue speaks, resume when done
  | 'fade_stop'         // Fast 120ms fade-out if user scrolls away from panel
  | 'ignore_if_passed'; // If rapid scrolling skipped past trigger, do not play

export interface CameraCoordinates {
  /** Horizontal pan target percentage relative to panel center [-50% .. +50%] */
  panXPercent: number;
  /** Vertical pan target percentage relative to panel center [-50% .. +50%] */
  panYPercent: number;
  /** Cinematic camera zoom factor [1.0 .. 1.35] */
  zoom: number;
  /** Camera rotation in degrees [-5deg .. +5deg] */
  rotateDeg?: number;
  /** Whether the camera locks into a steady visual hold at this beat */
  isHold?: boolean;
  /** Focal coordinates for responsive mobile viewport cropping */
  focalPoint?: { xPercent: number; yPercent: number };
}

export interface ParallaxDepthOffsets {
  /** Background horizon offset (slowest: 0.25x - 0.5x) */
  bgOffsetPx: number;
  /** Midground environment offset (1.0x) */
  midOffsetPx: number;
  /** Foreground silhouettes / motes offset (fastest: 1.5x - 2.0x) */
  fgOffsetPx: number;
}

export interface EmbeddedSpeechBubble {
  id: string;
  speaker: CharacterId;
  speakerLabel: string;
  text: string;
  mode: 'dialogue' | 'narration';
  audioSrc: string;
  durationMs: number;
  priority: AudioBusPriority;
  interruptionPolicy: InterruptionPolicy;
  /** Placement side relative to active character / panel */
  placement: BubbleAnchorSide;
  /** Optional normalized anchor coordinates on the panel [0..1] */
  anchor?: { x: number; y: number };
  /** Character emotional expression */
  expression?: CharacterExpression;
  /** Optional word-level alignment timings */
  wordTimings?: ReadonlyArray<WordTimingEntry>;
}

export interface AudioCueEvent {
  cueId: string;
  type: 'sfx' | 'leitmotif';
  audioSrc: string;
  durationMs: number;
  priority: AudioBusPriority;
  volume: number;
}

export interface TransitionOutSpec {
  kind: 'camera-push' | 'dissolve' | 'white-flash' | 'blackout' | 'portal';
  durationProgress: number; // progress duration [0.0 .. 0.15]
  toSceneId: string;
}

export interface TimelineBeat {
  id: string;
  sceneId: string;
  /** Normalized progress within pinned 100vh stage [0.0 .. 1.0] */
  stageProgress: number;
  /** Target comic panel asset (e.g. 'p07_panel01.webp') */
  panelId: string;
  /** Panel caption or description for screen readers and captions */
  panelAlt: string;
  /** Camera framing parameters */
  camera: CameraCoordinates;
  /** Multi-plane 2.5D parallax depths */
  parallax: ParallaxDepthOffsets;
  /** Embedded dialogue or narration speech */
  speech?: EmbeddedSpeechBubble;
  /** Accompanying SFX or leitmotif cue */
  audioCue?: AudioCueEvent;
  /** Visual hold duration in normalized progress */
  holdWindow?: { start: number; end: number };
  /** Active visual panel window in normalized stage progress [start, end] */
  panelWindow?: { start: number; end: number };
  /** Transition into next scene at end of track */
  transitionOut?: TransitionOutSpec;
}

export interface TimelineScene {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  timecode: string;
  /** Virtual scroll track height in viewport units (e.g. 300 = 300vh) */
  trackHeightVh: number;
  /** Approximate global whole-chapter progress range for scrubbing */
  globalRange: { start: number; end: number };
  /** Primary cinematic score (Approach A) */
  defaultScoreTrack: string;
  /** Alternative cinematic score (Approach B for the 5 dual scenes) */
  alternativeScoreTrack?: string;
  /** Environmental soundscape track */
  soundscapeTrack: string;
  /** Continuous ambient loop */
  ambienceTrack: string;
  /** Visual theme colors */
  theme: {
    bg: string;
    surface: string;
    text: string;
    accent: string;
    mood: string;
  };
  /** Chronological list of timeline beats */
  beats: ReadonlyArray<TimelineBeat>;
}

// ============================================================================
// The Unified Storyboard Timeline Manifest (Chronological Single Source)
// ============================================================================

export const STORYBOARD_TIMELINE: ReadonlyArray<TimelineScene> = [
  // ── SCENE 00: CINEMATIC PROLOGUE — THE THRESHOLD ───────────────────────────
  {
    id: 'scene-00',
    index: 0,
    title: 'The Threshold',
    subtitle: 'Beyond the Void · Opening Gesture',
    timecode: '16:40',
    trackHeightVh: 320,
    globalRange: { start: 0.0, end: 0.08 },
    defaultScoreTrack: 'scene_01_music_a',
    soundscapeTrack: 'scene_01_mumbai',
    ambienceTrack: 'amb_mumbai',
    theme: {
      bg: '#05060b',
      surface: '#0d101d',
      text: '#fbf4ea',
      accent: '#e8a84a',
      mood: 'prologue',
    },
    beats: [
      {
        id: 's00-beat-01',
        sceneId: 'scene-00',
        stageProgress: 0.04,
        panelId: 'prologue-darkness',
        panelAlt: 'Deep atmospheric twilight darkness with floating dust motes',
        camera: { panXPercent: 0, panYPercent: -15, zoom: 1.0, isHold: true },
        parallax: { bgOffsetPx: 0, midOffsetPx: 0, fgOffsetPx: 0 },
      },
      {
        id: 's00-beat-02',
        sceneId: 'scene-00',
        stageProgress: 0.18,
        panelId: 'prologue-the-story',
        panelAlt: 'The Story: A short introduction to The Many Deaths of Laila Starr',
        camera: { panXPercent: 0, panYPercent: -10, zoom: 1.02, isHold: true },
        parallax: { bgOffsetPx: 8, midOffsetPx: 16, fgOffsetPx: 30 },
        holdWindow: { start: 0.14, end: 0.24 },
      },
      {
        id: 's00-beat-03',
        sceneId: 'scene-00',
        stageProgress: 0.36,
        panelId: 'prologue-canvas-opening',
        panelAlt: 'The Opening Canvas: Once Upon a Falling Starr — sunset dipping over Mumbai skyline and curving BKC elevated highway',
        camera: { panXPercent: 0, panYPercent: -5, zoom: 1.04, isHold: true },
        parallax: { bgOffsetPx: 16, midOffsetPx: 32, fgOffsetPx: 60 },
        speech: {
          id: 's00-01',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle (Brian · 1.05x)',
          text: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline. Down where the elevated highway curves between glass towers, the city exhaled in horns and heat.',
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/scene-00-opening-canvas.mp3',
          durationMs: 11378,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
        holdWindow: { start: 0.34, end: 0.52 },
      },
      {
        id: 's00-beat-04',
        sceneId: 'scene-00',
        stageProgress: 0.60,
        panelId: 'prologue-title',
        panelAlt: 'Title reveal: The Many Deaths of Laila Starr',
        camera: { panXPercent: 0, panYPercent: 0, zoom: 1.08, isHold: true },
        parallax: { bgOffsetPx: 28, midOffsetPx: 56, fgOffsetPx: 100 },
        audioCue: {
          cueId: 'motif_storyverse',
          type: 'leitmotif',
          audioSrc: '/assets/audio/music/motif_storyverse.wav',
          durationMs: 8000,
          priority: 'leitmotif',
          volume: 0.85,
        },
        holdWindow: { start: 0.58, end: 0.80 },
      },
      {
        id: 's00-beat-05',
        sceneId: 'scene-00',
        stageProgress: 0.92,
        panelId: 'prologue-portal',
        panelAlt: 'Camera pushes forward through sunset clouds into Scene 01',
        camera: { panXPercent: 0, panYPercent: 10, zoom: 1.25, isHold: false },
        parallax: { bgOffsetPx: 40, midOffsetPx: 80, fgOffsetPx: 140 },
        transitionOut: {
          kind: 'camera-push',
          durationProgress: 0.08,
          toSceneId: 'scene-01',
        },
      },
    ],
  },

  // ── SCENE 01: THE CITY OF MUMBAI ──────────────────────────────────────────
  {
    id: 'scene-01',
    index: 1,
    title: 'The City of Mumbai',
    subtitle: 'Late December · 4:45 PM',
    timecode: '16:45',
    trackHeightVh: 300,
    globalRange: { start: 0.08, end: 0.17 },
    defaultScoreTrack: 'scene_01_music_a',
    alternativeScoreTrack: 'scene_01_music_b',
    soundscapeTrack: 'scene_01_mumbai',
    ambienceTrack: 'amb_mumbai',
    theme: {
      bg: '#141225',
      surface: '#231932',
      text: '#fbf4ea',
      accent: '#f28b50',
      mood: 'sunset',
    },
    beats: [
      {
        id: 's01-beat-01',
        sceneId: 'scene-01',
        stageProgress: 0.10,
        panelId: 'p06_panel01',
        panelAlt: 'Panoramic Mumbai splash showing glowing late-December sunset over towers',
        camera: { panXPercent: 0, panYPercent: -20, zoom: 1.02, isHold: true },
        parallax: { bgOffsetPx: 0, midOffsetPx: 0, fgOffsetPx: 0 },
        holdWindow: { start: 0.05, end: 0.25 },
      },
      {
        id: 's01-beat-02',
        sceneId: 'scene-01',
        stageProgress: 0.50,
        panelId: 'p06_panel01',
        panelAlt: 'Camera panning down to the curved concrete elevated highway overpass',
        camera: { panXPercent: 5, panYPercent: 12, zoom: 1.10, isHold: true },
        parallax: { bgOffsetPx: 18, midOffsetPx: 40, fgOffsetPx: 85 },
        speech: {
          id: 's01-02',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle (Brian · 1.05x)',
          text: 'Down where the elevated highway curves between glass towers, the city exhaled in horns and heat.',
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/scene-01-highway.mp3',
          durationMs: 5759,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
        audioCue: {
          cueId: 'discover',
          type: 'sfx',
          audioSrc: '/assets/audio/sfx_discover.wav',
          durationMs: 750,
          priority: 'sfx',
          volume: 0.45,
        },
        holdWindow: { start: 0.45, end: 0.70 },
      },
      {
        id: 's01-beat-03',
        sceneId: 'scene-01',
        stageProgress: 0.88,
        panelId: 'p06_panel01',
        panelAlt: 'Close-in focus on gridlock line of cars leading into Scene 02',
        camera: { panXPercent: 10, panYPercent: 25, zoom: 1.20, isHold: false },
        parallax: { bgOffsetPx: 35, midOffsetPx: 75, fgOffsetPx: 140 },
        transitionOut: {
          kind: 'dissolve',
          durationProgress: 0.12,
          toSceneId: 'scene-02',
        },
      },
    ],
  },

  // ── SCENE 02: THE CHAOTIC JOURNEY ─────────────────────────────────────────
  {
    id: 'scene-02',
    index: 2,
    title: 'The Chaotic Journey',
    subtitle: 'B.K.C. Overpass · Mrs. Shah',
    timecode: '17:10',
    trackHeightVh: 380,
    globalRange: { start: 0.17, end: 0.27 },
    defaultScoreTrack: 'scene_02_music',
    soundscapeTrack: 'scene_02_traffic',
    ambienceTrack: 'amb_traffic',
    theme: {
      bg: '#1c1824',
      surface: '#2a202d',
      text: '#f8f1e7',
      accent: '#e8a84a',
      mood: 'traffic',
    },
    beats: [
      {
        id: 's02-beat-01',
        sceneId: 'scene-02',
        stageProgress: 0.08,
        panelId: 'p07_panel01',
        panelAlt: 'Mrs. Shah shouting into mobile phone in taxi backseat',
        camera: { panXPercent: -8, panYPercent: 0, zoom: 1.15, isHold: true },
        parallax: { bgOffsetPx: 0, midOffsetPx: 0, fgOffsetPx: 0 },
        speech: {
          id: 's02-01',
          speaker: 'mrs_shah',
          speakerLabel: 'Mrs. Shah',
          text: 'I told you we should have left an hour ago! Do you hear this traffic?!',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s02-01-mrs-shah.mp3',
          durationMs: 3740,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'urgent',
        },
        holdWindow: { start: 0.05, end: 0.20 },
      },
      {
        id: 's02-beat-02',
        sceneId: 'scene-02',
        stageProgress: 0.26,
        panelId: 'p07_panel02',
        panelAlt: 'Overpass gridlock with blaring horns and comic sound effects',
        camera: { panXPercent: 0, panYPercent: -5, zoom: 1.05, isHold: false },
        parallax: { bgOffsetPx: 15, midOffsetPx: 30, fgOffsetPx: 60 },
        speech: {
          id: 's02-conn-01',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle',
          text: 'On the B.K.C. overpass, one city became many cities — each trapped inside its own small metal shell.',
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/scene-02-connector.mp3',
          durationMs: 4600,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
        audioCue: {
          cueId: 'horn',
          type: 'sfx',
          audioSrc: '/assets/audio/sfx_horn.wav',
          durationMs: 420,
          priority: 'sfx',
          volume: 0.55,
        },
      },
      {
        id: 's02-beat-03',
        sceneId: 'scene-02',
        stageProgress: 0.48,
        panelId: 'p07_panel04',
        panelAlt: 'Driver gesturing frantically over his shoulder',
        camera: { panXPercent: 8, panYPercent: 5, zoom: 1.18, isHold: true },
        parallax: { bgOffsetPx: 25, midOffsetPx: 55, fgOffsetPx: 100 },
        speech: {
          id: 's02-02',
          speaker: 'driver',
          speakerLabel: 'Cab Driver',
          text: 'Madam, hold on—every lane is locked solid across B.K.C.!',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s02-02-driver.mp3',
          durationMs: 3500,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'left',
          expression: 'shocked',
        },
        holdWindow: { start: 0.42, end: 0.60 },
      },
      {
        id: 's02-beat-04',
        sceneId: 'scene-02',
        stageProgress: 0.72,
        panelId: 'p07_panel05',
        panelAlt: 'Traffic officer waving cab through barricades',
        camera: { panXPercent: -5, panYPercent: 10, zoom: 1.10, isHold: false },
        parallax: { bgOffsetPx: 35, midOffsetPx: 75, fgOffsetPx: 135 },
      },
      {
        id: 's02-beat-05',
        sceneId: 'scene-02',
        stageProgress: 0.88,
        panelId: 'p07_panel06',
        panelAlt: 'Pregnant Mrs. Shah clutching stomach in labor',
        camera: { panXPercent: 0, panYPercent: 0, zoom: 1.25, isHold: true },
        parallax: { bgOffsetPx: 45, midOffsetPx: 95, fgOffsetPx: 170 },
        speech: {
          id: 's02-03',
          speaker: 'mrs_shah',
          speakerLabel: 'Mrs. Shah',
          text: '...The baby is coming.',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s02-03-mrs-shah-baby.mp3',
          durationMs: 1700,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'center',
          expression: 'urgent',
        },
        holdWindow: { start: 0.82, end: 0.96 },
        transitionOut: {
          kind: 'camera-push',
          durationProgress: 0.08,
          toSceneId: 'scene-03',
        },
      },
    ],
  },

  // ── SCENE 03: THE COLLEGE PARTY ───────────────────────────────────────────
  {
    id: 'scene-03',
    index: 3,
    title: 'The College Party',
    subtitle: 'Aria Towers, Parel · Sixth Floor',
    timecode: '18:30',
    trackHeightVh: 320,
    globalRange: { start: 0.27, end: 0.36 },
    defaultScoreTrack: 'scene_03_music',
    soundscapeTrack: 'scene_03_party',
    ambienceTrack: 'amb_party',
    theme: {
      bg: '#13162b',
      surface: '#1d2140',
      text: '#f4eef7',
      accent: '#e66c8b',
      mood: 'twilight',
    },
    beats: [
      {
        id: 's03-beat-01',
        sceneId: 'scene-03',
        stageProgress: 0.15,
        panelId: 'p08_panel02',
        panelAlt: 'Dhiraj animatedly arguing cultural theory at party',
        camera: { panXPercent: -12, panYPercent: -5, zoom: 1.15, isHold: true },
        parallax: { bgOffsetPx: 0, midOffsetPx: 0, fgOffsetPx: 0 },
        speech: {
          id: 's03-01',
          speaker: 'dhiraj',
          speakerLabel: 'Dhiraj',
          text: 'Listen, the whole discourse still reproduces the same patriarchal power equations—nobody actually examines who holds the lens.',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/dhiraj/s03-01-dhiraj.mp3',
          durationMs: 8330,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'contemplative',
        },
        holdWindow: { start: 0.10, end: 0.35 },
      },
      {
        id: 's03-beat-02',
        sceneId: 'scene-03',
        stageProgress: 0.60,
        panelId: 'p08_panel05',
        panelAlt: 'Raven-haired girl perched silently on 6th floor window sill',
        camera: { panXPercent: 12, panYPercent: 10, zoom: 1.22, isHold: true },
        parallax: { bgOffsetPx: 20, midOffsetPx: 45, fgOffsetPx: 80 },
        speech: {
          id: 's03-02',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle',
          text: '...Beneath gentle curls of raven hair, her eyes stayed fixed on distant city lights while her thoughts drifted like cigarette smoke.',
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/s03-02-window.mp3',
          durationMs: 5200,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
        holdWindow: { start: 0.50, end: 0.78 },
      },
      {
        id: 's03-beat-03',
        sceneId: 'scene-03',
        stageProgress: 0.90,
        panelId: 'p08_panel06',
        panelAlt: 'Camera tilts up from open window toward cosmic twilight clouds',
        camera: { panXPercent: 0, panYPercent: -30, zoom: 1.25, isHold: false },
        parallax: { bgOffsetPx: 40, midOffsetPx: 85, fgOffsetPx: 150 },
        transitionOut: {
          kind: 'portal',
          durationProgress: 0.10,
          toSceneId: 'scene-04',
        },
      },
    ],
  },

  // ── SCENE 04: DEATH'S WORLD ───────────────────────────────────────────────
  {
    id: 'scene-04',
    index: 4,
    title: "Death's World",
    subtitle: 'Beyond Mortal Clouds · The Silvered Tower',
    timecode: '19:15',
    trackHeightVh: 420,
    globalRange: { start: 0.36, end: 0.48 },
    defaultScoreTrack: 'scene_04_music_a',
    alternativeScoreTrack: 'scene_04_music_b',
    soundscapeTrack: 'scene_04_death_world',
    ambienceTrack: 'amb_celestial',
    theme: {
      bg: '#16283d',
      surface: '#1f3652',
      text: '#f5f8fc',
      accent: '#e57b98',
      mood: 'celestial',
    },
    beats: [
      {
        id: 's04-beat-01',
        sceneId: 'scene-04',
        stageProgress: 0.06,
        panelId: 'p09_panel01',
        panelAlt: 'The Silvered Tower piercing cosmic clouds',
        camera: { panXPercent: 0, panYPercent: -15, zoom: 1.05, isHold: true },
        parallax: { bgOffsetPx: 0, midOffsetPx: 0, fgOffsetPx: 0 },
        speech: {
          id: 's04-conn-01',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle',
          text: 'Beyond the mortal clouds, in a place where endings are drafted like memos, something unprecedented was happening.',
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/scene-04-connector.mp3',
          durationMs: 4800,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
      },
      {
        id: 's04-beat-02',
        sceneId: 'scene-04',
        stageProgress: 0.16,
        panelId: 'p09_panel03',
        panelAlt: 'Death running to catch celestial elevator doors',
        camera: { panXPercent: -10, panYPercent: 5, zoom: 1.12, isHold: false },
        parallax: { bgOffsetPx: 10, midOffsetPx: 20, fgOffsetPx: 40 },
        speech: {
          id: 's04-01',
          speaker: 'death',
          speakerLabel: 'Death',
          text: 'Hold the door!',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/death/s04-01-death-hold.mp3',
          durationMs: 1180,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'left',
          expression: 'urgent',
        },
      },
      {
        id: 's04-beat-03',
        sceneId: 'scene-04',
        stageProgress: 0.24,
        panelId: 'p10_panel01',
        panelAlt: 'Agni guiding Death toward executive office',
        camera: { panXPercent: 8, panYPercent: 0, zoom: 1.10, isHold: false },
        parallax: { bgOffsetPx: 18, midOffsetPx: 35, fgOffsetPx: 70 },
        speech: {
          id: 's04-02',
          speaker: 'agni',
          speakerLabel: 'Agni',
          text: 'This way, please. He is expecting you.',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s04-02-agni-way.mp3',
          durationMs: 2010,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'neutral',
        },
      },
      {
        id: 's04-beat-04',
        sceneId: 'scene-04',
        stageProgress: 0.35,
        panelId: 'p10_panel03',
        panelAlt: 'God sitting behind executive desk inviting Death to sit',
        camera: { panXPercent: 0, panYPercent: -8, zoom: 1.15, isHold: true },
        parallax: { bgOffsetPx: 25, midOffsetPx: 50, fgOffsetPx: 100 },
        speech: {
          id: 's04-03',
          speaker: 'god',
          speakerLabel: 'Purveyor of All Goodness',
          text: 'Come, come. Have a seat.',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s04-03-god-seat.mp3',
          durationMs: 1460,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'warm',
        },
      },
      {
        id: 's04-beat-05',
        sceneId: 'scene-04',
        stageProgress: 0.44,
        panelId: 'p10_panel05',
        panelAlt: 'God making small talk with Death',
        camera: { panXPercent: 5, panYPercent: 0, zoom: 1.18, isHold: true },
        parallax: { bgOffsetPx: 30, midOffsetPx: 60, fgOffsetPx: 120 },
        speech: {
          id: 's04-04',
          speaker: 'god',
          speakerLabel: 'Purveyor of All Goodness',
          text: "So, Death... tell me, how're things? Work, life, friendships... hobbies?",
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s04-04-god-hobbies.mp3',
          durationMs: 10080,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'warm',
        },
      },
      {
        id: 's04-beat-06',
        sceneId: 'scene-04',
        stageProgress: 0.54,
        panelId: 'p10_panel07',
        panelAlt: 'Death asking why she has been summoned',
        camera: { panXPercent: -8, panYPercent: 5, zoom: 1.20, isHold: true },
        parallax: { bgOffsetPx: 35, midOffsetPx: 70, fgOffsetPx: 135 },
        speech: {
          id: 's04-05',
          speaker: 'death',
          speakerLabel: 'Death',
          text: 'W-what am I doing here, Sir?',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/death/s04-05-death-why.mp3',
          durationMs: 1520,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'left',
          expression: 'contemplative',
        },
      },
      {
        id: 's04-beat-07',
        sceneId: 'scene-04',
        stageProgress: 0.62,
        panelId: 'p11_panel01',
        panelAlt: "God asking how long Death has been with them",
        camera: { panXPercent: 6, panYPercent: -5, zoom: 1.15, isHold: false },
        parallax: { bgOffsetPx: 40, midOffsetPx: 80, fgOffsetPx: 150 },
        speech: {
          id: 's04-06',
          speaker: 'god',
          speakerLabel: 'Purveyor of All Goodness',
          text: "How long have you been with us, Death? Feels like an eternity, doesn't it?",
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s04-06-god-eternity.mp3',
          durationMs: 4050,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'neutral',
        },
      },
      {
        id: 's04-beat-08',
        sceneId: 'scene-04',
        stageProgress: 0.70,
        panelId: 'p11_panel03',
        panelAlt: 'Death confirming her eternal tenure',
        camera: { panXPercent: -6, panYPercent: 0, zoom: 1.20, isHold: false },
        parallax: { bgOffsetPx: 45, midOffsetPx: 90, fgOffsetPx: 165 },
        speech: {
          id: 's04-07',
          speaker: 'death',
          speakerLabel: 'Death',
          text: 'I have actually been here for an eternity.',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/death/s04-07-death-eternity.mp3',
          durationMs: 2250,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'left',
          expression: 'contemplative',
        },
      },
      {
        id: 's04-beat-09',
        sceneId: 'scene-04',
        stageProgress: 0.78,
        panelId: 'p11_panel05',
        panelAlt: 'God delivering the termination notice',
        camera: { panXPercent: 0, panYPercent: -4, zoom: 1.25, isHold: true },
        parallax: { bgOffsetPx: 50, midOffsetPx: 100, fgOffsetPx: 180 },
        speech: {
          id: 's04-08',
          speaker: 'god',
          speakerLabel: 'Purveyor of All Goodness',
          text: "Yes, Death. I'm afraid we're letting you go.",
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s04-08-god-fired.mp3',
          durationMs: 2350,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'commanding',
        },
        audioCue: {
          cueId: 'motif_death',
          type: 'leitmotif',
          audioSrc: '/assets/audio/music/motif_death.wav',
          durationMs: 8000,
          priority: 'leitmotif',
          volume: 0.90,
        },
        holdWindow: { start: 0.76, end: 0.84 },
      },
      {
        id: 's04-beat-10',
        sceneId: 'scene-04',
        stageProgress: 0.85,
        panelId: 'p12_panel01',
        panelAlt: 'Death outraged demanding plagues and lightning',
        camera: { panXPercent: -8, panYPercent: 5, zoom: 1.28, isHold: true },
        parallax: { bgOffsetPx: 55, midOffsetPx: 110, fgOffsetPx: 195 },
        speech: {
          id: 's04-09',
          speaker: 'death',
          speakerLabel: 'Death',
          text: "WHAT?! I'm an absolute consequence. It's in the job description! Send down a plague! Strike the child with lightning!",
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/death/s04-09-death-outrage.mp3',
          durationMs: 8050,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'left',
          expression: 'shocked',
        },
      },
      {
        id: 's04-beat-11',
        sceneId: 'scene-04',
        stageProgress: 0.91,
        panelId: 'p12_panel04',
        panelAlt: 'God explaining corporate feelings',
        camera: { panXPercent: 8, panYPercent: -2, zoom: 1.18, isHold: false },
        parallax: { bgOffsetPx: 60, midOffsetPx: 120, fgOffsetPx: 210 },
        speech: {
          id: 's04-10',
          speaker: 'god',
          speakerLabel: 'Purveyor of All Goodness',
          text: 'You know how corporate feels about that kind of stuff.',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s04-10-god-corporate.mp3',
          durationMs: 2950,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'neutral',
        },
      },
      {
        id: 's04-beat-12',
        sceneId: 'scene-04',
        stageProgress: 0.96,
        panelId: 'p12_panel06',
        panelAlt: 'Death devastated and lost asking what she is supposed to do',
        camera: { panXPercent: 0, panYPercent: 8, zoom: 1.30, isHold: true },
        parallax: { bgOffsetPx: 65, midOffsetPx: 130, fgOffsetPx: 225 },
        speech: {
          id: 's04-11',
          speaker: 'death',
          speakerLabel: 'Death',
          text: "This is all I've ever done. What am I supposed to do?",
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/death/s04-11-death-lost.mp3',
          durationMs: 3190,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'center',
          expression: 'grief',
        },
        transitionOut: {
          kind: 'blackout',
          durationProgress: 0.04,
          toSceneId: 'scene-05',
        },
      },
    ],
  },

  // ── SCENE 05: TWO EVENTS, ONE MOMENT ──────────────────────────────────────
  {
    id: 'scene-05',
    index: 5,
    title: 'Two Events, One Moment',
    subtitle: 'The Fall & The First Breath',
    timecode: '20:02',
    trackHeightVh: 360,
    globalRange: { start: 0.48, end: 0.58 },
    defaultScoreTrack: 'scene_05_music_a',
    alternativeScoreTrack: 'scene_05_music_b',
    soundscapeTrack: 'scene_05_convergence',
    ambienceTrack: 'amb_hospital',
    theme: {
      bg: '#1c1429',
      surface: '#291c3b',
      text: '#f9f2ec',
      accent: '#f06a7e',
      mood: 'split',
    },
    beats: [
      {
        id: 's05-beat-01',
        sceneId: 'scene-05',
        stageProgress: 0.15,
        panelId: 'p13_panel03',
        panelAlt: 'Mortal girl falling from sixth floor balcony through Mumbai night air',
        camera: { panXPercent: 0, panYPercent: -15, zoom: 1.10, isHold: true },
        parallax: { bgOffsetPx: 0, midOffsetPx: 0, fgOffsetPx: 0 },
        speech: {
          id: 's05-01',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle',
          text: 'It was around that time that the girl from the window at the party was falling through the air — two floors down and fast approaching the ground.',
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/s05-01-fall.mp3',
          durationMs: 5400,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
        holdWindow: { start: 0.10, end: 0.32 },
      },
      {
        id: 's05-beat-02',
        sceneId: 'scene-05',
        stageProgress: 0.46,
        panelId: 'p13_panel05',
        panelAlt: 'Delivery room at Amravati Hospital as Mrs. Shah crushes her husband’s hand',
        camera: { panXPercent: 0, panYPercent: 10, zoom: 1.12, isHold: true },
        parallax: { bgOffsetPx: 20, midOffsetPx: 45, fgOffsetPx: 90 },
        speech: {
          id: 's05-02',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle',
          text: "Just as she hit the ground, Mrs. Shah was in the Amravati Hospital squeezing her husband's hand with such strength that he was screaming louder than her.",
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/s05-02-birth.mp3',
          durationMs: 6200,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
        holdWindow: { start: 0.40, end: 0.62 },
      },
      {
        id: 's05-beat-03',
        sceneId: 'scene-05',
        stageProgress: 0.82,
        panelId: 'p13_panel06',
        panelAlt: 'Newborn baby Darius taking his first breath as two fates converge',
        camera: { panXPercent: 0, panYPercent: 0, zoom: 1.20, isHold: true },
        parallax: { bgOffsetPx: 40, midOffsetPx: 85, fgOffsetPx: 160 },
        speech: {
          id: 's05-03',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle',
          text: 'As the midwife urged her into one last push, a new life came into being. A beautiful thing that would go on to be the cause of much consternation in his many years to come.',
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/s05-03-darius.mp3',
          durationMs: 7200,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
        holdWindow: { start: 0.78, end: 0.92 },
        transitionOut: {
          kind: 'white-flash',
          durationProgress: 0.08,
          toSceneId: 'scene-06',
        },
      },
    ],
  },

  // ── SCENE 06: LAILA BECOMES MORTAL ────────────────────────────────────────
  {
    id: 'scene-06',
    index: 6,
    title: 'Laila Becomes Mortal',
    subtitle: 'The Bargain · Descent in Thunder',
    timecode: '20:32',
    trackHeightVh: 360,
    globalRange: { start: 0.58, end: 0.68 },
    defaultScoreTrack: 'scene_06_music_a',
    alternativeScoreTrack: 'scene_06_music_b',
    soundscapeTrack: 'scene_06_transformation',
    ambienceTrack: 'amb_traffic',
    theme: {
      bg: '#11162a',
      surface: '#1b223e',
      text: '#f4f1f8',
      accent: '#63b8d6',
      mood: 'descent',
    },
    beats: [
      {
        id: 's06-beat-01',
        sceneId: 'scene-06',
        stageProgress: 0.12,
        panelId: 'p16_panel02',
        panelAlt: 'Death confronting Agni in the celestial stairwell',
        camera: { panXPercent: -8, panYPercent: -5, zoom: 1.15, isHold: false },
        parallax: { bgOffsetPx: 0, midOffsetPx: 0, fgOffsetPx: 0 },
        speech: {
          id: 's06-01',
          speaker: 'death',
          speakerLabel: 'Death',
          text: 'Agni?',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/death/s06-01-death-agni.mp3',
          durationMs: 810,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'left',
          expression: 'urgent',
        },
      },
      {
        id: 's06-beat-02',
        sceneId: 'scene-06',
        stageProgress: 0.22,
        panelId: 'p16_panel03',
        panelAlt: 'Agni rejecting Death’s request',
        camera: { panXPercent: 8, panYPercent: 0, zoom: 1.12, isHold: false },
        parallax: { bgOffsetPx: 10, midOffsetPx: 20, fgOffsetPx: 40 },
        speech: {
          id: 's06-02',
          speaker: 'agni',
          speakerLabel: 'Agni',
          text: "I know what you're thinking and the answer is no.",
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s06-02-agni-no.mp3',
          durationMs: 2660,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'commanding',
        },
      },
      {
        id: 's06-beat-03',
        sceneId: 'scene-06',
        stageProgress: 0.35,
        panelId: 'p16_panel05',
        panelAlt: 'Agni conceding and asking what Death wants',
        camera: { panXPercent: 6, panYPercent: 5, zoom: 1.15, isHold: false },
        parallax: { bgOffsetPx: 20, midOffsetPx: 40, fgOffsetPx: 75 },
        speech: {
          id: 's06-03',
          speaker: 'agni',
          speakerLabel: 'Agni',
          text: 'Oh, fiiiine... fine, what do you want?',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s06-03-agni-fine.mp3',
          durationMs: 2060,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'neutral',
        },
      },
      {
        id: 's06-beat-04',
        sceneId: 'scene-06',
        stageProgress: 0.50,
        panelId: 'p17_panel01',
        panelAlt: 'Death asking to be placed close to the child in a mortal body',
        camera: { panXPercent: -6, panYPercent: 0, zoom: 1.22, isHold: true },
        parallax: { bgOffsetPx: 30, midOffsetPx: 60, fgOffsetPx: 110 },
        speech: {
          id: 's06-04',
          speaker: 'death',
          speakerLabel: 'Death',
          text: 'When you send me down and give me a mortal body, can you put me close to the child?',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/death/s06-04-death-close.mp3',
          durationMs: 4650,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'left',
          expression: 'commanding',
        },
      },
      {
        id: 's06-beat-05',
        sceneId: 'scene-06',
        stageProgress: 0.65,
        panelId: 'p17_panel03',
        panelAlt: 'Death declaring mortal accountability',
        camera: { panXPercent: 0, panYPercent: 8, zoom: 1.26, isHold: true },
        parallax: { bgOffsetPx: 40, midOffsetPx: 80, fgOffsetPx: 145 },
        speech: {
          id: 's06-05',
          speaker: 'death',
          speakerLabel: 'Death',
          text: "I'll be a mortal then. My actions. My consequences.",
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/death/s06-05-death-mortal.mp3',
          durationMs: 3450,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'center',
          expression: 'commanding',
        },
      },
      {
        id: 's06-beat-06',
        sceneId: 'scene-06',
        stageProgress: 0.82,
        panelId: 'p17_panel04',
        panelAlt: 'Cosmic lightning striking as Death is cast down into Mumbai',
        camera: { panXPercent: 0, panYPercent: 20, zoom: 1.35, isHold: true },
        parallax: { bgOffsetPx: 60, midOffsetPx: 120, fgOffsetPx: 210 },
        speech: {
          id: 's06-conn-01',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle',
          text: 'A deal was being struck — the kind that bends the fabric of everything.',
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/scene-06-connector.mp3',
          durationMs: 4200,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
        audioCue: {
          cueId: 'thunder',
          type: 'sfx',
          audioSrc: '/assets/audio/sfx_thunder.wav',
          durationMs: 1600,
          priority: 'sfx',
          volume: 0.70,
        },
        transitionOut: {
          kind: 'blackout',
          durationProgress: 0.08,
          toSceneId: 'scene-07',
        },
      },
    ],
  },

  // ── SCENE 07: HOSPITAL CORRIDOR ───────────────────────────────────────────
  {
    id: 'scene-07',
    index: 7,
    title: 'Hospital Corridor',
    subtitle: 'Awakening · Amravati Hospital',
    timecode: '20:55',
    trackHeightVh: 380,
    globalRange: { start: 0.68, end: 0.78 },
    defaultScoreTrack: 'scene_07_music',
    soundscapeTrack: 'scene_07_hospital',
    ambienceTrack: 'amb_hospital',
    theme: {
      bg: '#14202b',
      surface: '#1d2c3a',
      text: '#f2f6fa',
      accent: '#7bc8e2',
      mood: 'clinical',
    },
    beats: [
      {
        id: 's07-beat-01',
        sceneId: 'scene-07',
        stageProgress: 0.08,
        panelId: 'p18_panel01',
        panelAlt: 'Blurry fluorescent lights of Amravati hospital recovery ward',
        camera: { panXPercent: 0, panYPercent: -10, zoom: 1.05, isHold: true },
        parallax: { bgOffsetPx: 0, midOffsetPx: 0, fgOffsetPx: 0 },
        speech: {
          id: 's07-conn-01',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle',
          text: 'She woke up in a body that felt borrowed, in a room that smelled of antiseptic and second chances.',
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/scene-07-connector.mp3',
          durationMs: 4400,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
      },
      {
        id: 's07-beat-02',
        sceneId: 'scene-07',
        stageProgress: 0.22,
        panelId: 'p18_panel02',
        panelAlt: 'Laila groaning clutching aching ribs in mortal body',
        camera: { panXPercent: -6, panYPercent: 0, zoom: 1.15, isHold: true },
        parallax: { bgOffsetPx: 10, midOffsetPx: 22, fgOffsetPx: 45 },
        speech: {
          id: 's07-01',
          speaker: 'laila',
          speakerLabel: 'Laila Starr',
          text: 'Ohhhhh, that feels awful.',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/laila/s07-01-laila-awful.mp3',
          durationMs: 1830,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'left',
          expression: 'grief',
        },
      },
      {
        id: 's07-beat-03',
        sceneId: 'scene-07',
        stageProgress: 0.38,
        panelId: 'p18_panel04',
        panelAlt: 'Munmun the spectral crow perched on hospital gurney rail',
        camera: { panXPercent: 8, panYPercent: 5, zoom: 1.18, isHold: false },
        parallax: { bgOffsetPx: 20, midOffsetPx: 42, fgOffsetPx: 80 },
        speech: {
          id: 's07-02',
          speaker: 'munmun',
          speakerLabel: 'Munmun',
          text: 'Yeah, well... you were dead for a good twenty minutes or so.',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/munmun/s07-02-munmun-dead.mp3',
          durationMs: 3400,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'neutral',
        },
      },
      {
        id: 's07-beat-04',
        sceneId: 'scene-07',
        stageProgress: 0.52,
        panelId: 'p19_panel01',
        panelAlt: 'Laila startled looking at Munmun',
        camera: { panXPercent: -8, panYPercent: -2, zoom: 1.20, isHold: false },
        parallax: { bgOffsetPx: 30, midOffsetPx: 60, fgOffsetPx: 110 },
        speech: {
          id: 's07-03',
          speaker: 'laila',
          speakerLabel: 'Laila Starr',
          text: "Who're you?",
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/laila/s07-03-laila-who.mp3',
          durationMs: 1000,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'left',
          expression: 'shocked',
        },
      },
      {
        id: 's07-beat-05',
        sceneId: 'scene-07',
        stageProgress: 0.65,
        panelId: 'p19_panel03',
        panelAlt: 'Munmun pointing to hospital wristband',
        camera: { panXPercent: 6, panYPercent: 4, zoom: 1.22, isHold: false },
        parallax: { bgOffsetPx: 38, midOffsetPx: 75, fgOffsetPx: 135 },
        speech: {
          id: 's07-04',
          speaker: 'munmun',
          speakerLabel: 'Munmun',
          text: "I-I'm a ghost! And your name... it's on your wrist.",
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/munmun/s07-04-munmun-ghost.mp3',
          durationMs: 3140,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'warm',
        },
      },
      {
        id: 's07-beat-06',
        sceneId: 'scene-07',
        stageProgress: 0.78,
        panelId: 'p19_panel06',
        panelAlt: 'Close-up of plastic wristband reading Laila Starr',
        camera: { panXPercent: 0, panYPercent: 0, zoom: 1.30, isHold: true },
        parallax: { bgOffsetPx: 48, midOffsetPx: 95, fgOffsetPx: 170 },
        speech: {
          id: 's07-05',
          speaker: 'laila',
          speakerLabel: 'Laila Starr',
          text: 'L-Laila Starr...',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/laila/s07-05-laila-name.mp3',
          durationMs: 1520,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'center',
          expression: 'contemplative',
        },
        audioCue: {
          cueId: 'motif_laila',
          type: 'leitmotif',
          audioSrc: '/assets/audio/music/motif_laila.wav',
          durationMs: 8000,
          priority: 'leitmotif',
          volume: 0.85,
        },
      },
      {
        id: 's07-beat-07',
        sceneId: 'scene-07',
        stageProgress: 0.90,
        panelId: 'p20_panel03',
        panelAlt: 'Munmun asking what next for Laila Starr',
        camera: { panXPercent: 8, panYPercent: 6, zoom: 1.20, isHold: true },
        parallax: { bgOffsetPx: 58, midOffsetPx: 115, fgOffsetPx: 200 },
        speech: {
          id: 's07-06',
          speaker: 'munmun',
          speakerLabel: 'Munmun',
          text: 'So... what next, Laila Starr?',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/munmun/s07-06-munmun-next.mp3',
          durationMs: 1890,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'warm',
        },
        transitionOut: {
          kind: 'camera-push',
          durationProgress: 0.08,
          toSceneId: 'scene-08',
        },
      },
    ],
  },

  // ── SCENE 08: THE GREAT ESCAPE ────────────────────────────────────────────
  {
    id: 'scene-08',
    index: 8,
    title: 'The Great Escape',
    subtitle: 'The Neo-Natal Ward · Fleeing into Rain',
    timecode: '21:20',
    trackHeightVh: 360,
    globalRange: { start: 0.78, end: 0.87 },
    defaultScoreTrack: 'scene_08_music',
    soundscapeTrack: 'scene_08_escape',
    ambienceTrack: 'amb_hospital',
    theme: {
      bg: '#171f2b',
      surface: '#222d3d',
      text: '#f4f6f8',
      accent: '#64b5f6',
      mood: 'chase',
    },
    beats: [
      {
        id: 's08-beat-01',
        sceneId: 'scene-08',
        stageProgress: 0.12,
        panelId: 'p21_panel01',
        panelAlt: 'Laila slipping into glowing neo-natal ward among baby incubators',
        camera: { panXPercent: 0, panYPercent: -8, zoom: 1.08, isHold: true },
        parallax: { bgOffsetPx: 0, midOffsetPx: 0, fgOffsetPx: 0 },
        speech: {
          id: 's08-conn-01',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle',
          text: 'The neo-natal ward held its breath. Death held a baby.',
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/scene-08-connector.mp3',
          durationMs: 3800,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
      },
      {
        id: 's08-beat-02',
        sceneId: 'scene-08',
        stageProgress: 0.38,
        panelId: 'p21_panel03',
        panelAlt: 'Munmun warning that the child has a name: Darius',
        camera: { panXPercent: 8, panYPercent: 5, zoom: 1.20, isHold: false },
        parallax: { bgOffsetPx: 18, midOffsetPx: 38, fgOffsetPx: 75 },
        speech: {
          id: 's08-01',
          speaker: 'munmun',
          speakerLabel: 'Munmun',
          text: "His name is Darius. He's got a name! You can't kill someone with a name!",
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/munmun/s08-01-munmun-darius.mp3',
          durationMs: 5280,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'urgent',
        },
      },
      {
        id: 's08-beat-03',
        sceneId: 'scene-08',
        stageProgress: 0.62,
        panelId: 'p22_panel02',
        panelAlt: 'Laila hesitating with tears in her eyes unable to harm the child',
        camera: { panXPercent: -6, panYPercent: 0, zoom: 1.26, isHold: true },
        parallax: { bgOffsetPx: 35, midOffsetPx: 70, fgOffsetPx: 130 },
        speech: {
          id: 's08-02',
          speaker: 'laila',
          speakerLabel: 'Laila Starr',
          text: 'What? W-why did you tell me that? I... I can\'t!',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/laila/s08-02-laila-cant.mp3',
          durationMs: 3400,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'left',
          expression: 'grief',
        },
      },
      {
        id: 's08-beat-04',
        sceneId: 'scene-08',
        stageProgress: 0.85,
        panelId: 'p23_panel03',
        panelAlt: 'Hospital security guard bursting in shouting',
        camera: { panXPercent: 10, panYPercent: 12, zoom: 1.18, isHold: true },
        parallax: { bgOffsetPx: 50, midOffsetPx: 100, fgOffsetPx: 185 },
        speech: {
          id: 's08-03',
          speaker: 'security',
          speakerLabel: 'Hospital Security',
          text: "There she is! Oh my God—she's alive! Hey you! Put that baby down!",
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s08-03-guard.mp3',
          durationMs: 6120,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'commanding',
        },
        transitionOut: {
          kind: 'camera-push',
          durationProgress: 0.10,
          toSceneId: 'scene-09',
        },
      },
    ],
  },

  // ── SCENE 09: SECOND DEATH ────────────────────────────────────────────────
  {
    id: 'scene-09',
    index: 9,
    title: 'Second Death',
    subtitle: 'Midnight Collision · The 12-Wheeler',
    timecode: '21:45',
    trackHeightVh: 320,
    globalRange: { start: 0.87, end: 0.94 },
    defaultScoreTrack: 'scene_09_music',
    soundscapeTrack: 'scene_09_truck',
    ambienceTrack: 'amb_traffic',
    theme: {
      bg: '#0f141f',
      surface: '#181e2e',
      text: '#f2f3f7',
      accent: '#e53935',
      mood: 'impact',
    },
    beats: [
      {
        id: 's09-beat-01',
        sceneId: 'scene-09',
        stageProgress: 0.18,
        panelId: 'p24_panel01',
        panelAlt: 'Laila fleeing into dark midnight rain in Mumbai streets',
        camera: { panXPercent: -5, panYPercent: -8, zoom: 1.10, isHold: true },
        parallax: { bgOffsetPx: 0, midOffsetPx: 0, fgOffsetPx: 0 },
        speech: {
          id: 's09-01',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle',
          text: 'And in Mumbai, even at that late hour, great thundering wheels of commerce rolled on unfettered.',
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/s09-01-commerce.mp3',
          durationMs: 4400,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
      },
      {
        id: 's09-beat-02',
        sceneId: 'scene-09',
        stageProgress: 0.55,
        panelId: 'p24_panel02',
        panelAlt: 'Massive blinding halogen truck headlights bearing down on Laila',
        camera: { panXPercent: 0, panYPercent: 0, zoom: 1.30, isHold: true },
        parallax: { bgOffsetPx: 25, midOffsetPx: 55, fgOffsetPx: 110 },
        audioCue: {
          cueId: 'truck',
          type: 'sfx',
          audioSrc: '/assets/audio/sfx_truck.wav',
          durationMs: 1150,
          priority: 'sfx',
          volume: 0.95,
        },
        holdWindow: { start: 0.50, end: 0.70 },
      },
      {
        id: 's09-beat-03',
        sceneId: 'scene-09',
        stageProgress: 0.85,
        panelId: 'p24_panel03',
        panelAlt: 'Impact and sudden darkness as Laila Starr meets second death',
        camera: { panXPercent: 0, panYPercent: 15, zoom: 1.35, isHold: true },
        parallax: { bgOffsetPx: 45, midOffsetPx: 95, fgOffsetPx: 180 },
        speech: {
          id: 's09-02',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle',
          text: 'And so, only a few minutes away from midnight, Laila Starr met her death once again.',
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/s09-02-midnight.mp3',
          durationMs: 4880,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
        audioCue: {
          cueId: 'flatline',
          type: 'sfx',
          audioSrc: '/assets/audio/sfx_flatline.wav',
          durationMs: 1600,
          priority: 'sfx',
          volume: 0.65,
        },
        transitionOut: {
          kind: 'blackout',
          durationProgress: 0.12,
          toSceneId: 'scene-10',
        },
      },
    ],
  },

  // ── SCENE 10: EIGHT YEARS LATER ───────────────────────────────────────────
  {
    id: 'scene-10',
    index: 10,
    title: 'Eight Years Later',
    subtitle: 'Morning Tea · Pranah & Laila Starr',
    timecode: '07:30',
    trackHeightVh: 380,
    globalRange: { start: 0.94, end: 1.0 },
    defaultScoreTrack: 'scene_10_music_a',
    alternativeScoreTrack: 'scene_10_music_b',
    soundscapeTrack: 'scene_10_eight_years_later',
    ambienceTrack: 'amb_dawn',
    theme: {
      bg: '#181b24',
      surface: '#262b3a',
      text: '#faf5ee',
      accent: '#e69a48',
      mood: 'dawn',
    },
    beats: [
      {
        id: 's10-beat-01',
        sceneId: 'scene-10',
        stageProgress: 0.08,
        panelId: 'p25_panel01',
        panelAlt: 'Golden dawn sunlight illuminating tranquil outdoor veranda',
        camera: { panXPercent: 0, panYPercent: -10, zoom: 1.05, isHold: true },
        parallax: { bgOffsetPx: 0, midOffsetPx: 0, fgOffsetPx: 0 },
        speech: {
          id: 's10-conn-01',
          speaker: 'narrator',
          speakerLabel: 'The Chronicle',
          text: 'Eight years later, the sun rose anyway — as it always has, as it always will.',
          mode: 'narration',
          audioSrc: '/assets/audio/voices/narrator/scene-10-connector.mp3',
          durationMs: 4940,
          priority: 'narration',
          interruptionPolicy: 'pause_resume',
          placement: 'bottom',
        },
      },
      {
        id: 's10-beat-02',
        sceneId: 'scene-10',
        stageProgress: 0.28,
        panelId: 'p25_panel06',
        panelAlt: 'Laila stirring on wicker chair waking up',
        camera: { panXPercent: -8, panYPercent: 2, zoom: 1.15, isHold: true },
        parallax: { bgOffsetPx: 12, midOffsetPx: 25, fgOffsetPx: 50 },
        speech: {
          id: 's10-01',
          speaker: 'laila',
          speakerLabel: 'Laila Starr',
          text: 'Have you been standing there watching me sleep this whole time? Ugggh... what happened? How did I get here?',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/laila/s10-01-laila-wake.mp3',
          durationMs: 6610,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'left',
          expression: 'contemplative',
        },
      },
      {
        id: 's10-beat-03',
        sceneId: 'scene-10',
        stageProgress: 0.48,
        panelId: 'p26_panel01',
        panelAlt: 'Pranah smiling pouring tea from ceramic pot',
        camera: { panXPercent: 8, panYPercent: -3, zoom: 1.18, isHold: true },
        parallax: { bgOffsetPx: 24, midOffsetPx: 50, fgOffsetPx: 95 },
        speech: {
          id: 's10-02',
          speaker: 'pranah',
          speakerLabel: 'Pranah',
          text: 'You died. Run over by a twelve-wheeler. But I brought you back.',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s10-02-pranah-back.mp3',
          durationMs: 3800,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'warm',
        },
      },
      {
        id: 's10-beat-04',
        sceneId: 'scene-10',
        stageProgress: 0.68,
        panelId: 'p26_panel02',
        panelAlt: 'Laila asking how Pranah could create a child like that',
        camera: { panXPercent: -6, panYPercent: 5, zoom: 1.22, isHold: true },
        parallax: { bgOffsetPx: 36, midOffsetPx: 75, fgOffsetPx: 140 },
        speech: {
          id: 's10-03',
          speaker: 'laila',
          speakerLabel: 'Laila Starr',
          text: "I couldn't do it, Pran. He was just a baby... How could you bring someone like that into being?",
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/laila/s10-03-laila-baby.mp3',
          durationMs: 6110,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'left',
          expression: 'grief',
        },
      },
      {
        id: 's10-beat-05',
        sceneId: 'scene-10',
        stageProgress: 0.82,
        panelId: 'p26_panel03',
        panelAlt: 'Pranah explaining his philosophy of a lifetime',
        camera: { panXPercent: 6, panYPercent: 0, zoom: 1.20, isHold: false },
        parallax: { bgOffsetPx: 46, midOffsetPx: 95, fgOffsetPx: 175 },
        speech: {
          id: 's10-04',
          speaker: 'pranah',
          speakerLabel: 'Pranah',
          text: 'Hey, I only give them a lifetime, every one of them. What they do with it is between them and... you, I suppose.',
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/supporting/s10-04-pranah-lifetime.mp3',
          durationMs: 4400,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'right',
          expression: 'warm',
        },
      },
      {
        id: 's10-beat-06',
        sceneId: 'scene-10',
        stageProgress: 0.94,
        panelId: 'p27_panel01',
        panelAlt: 'Laila looking out at distant Mumbai horizon with solemn realization',
        camera: { panXPercent: 0, panYPercent: 0, zoom: 1.28, isHold: true },
        parallax: { bgOffsetPx: 56, midOffsetPx: 115, fgOffsetPx: 210 },
        speech: {
          id: 's10-05',
          speaker: 'laila',
          speakerLabel: 'Laila Starr',
          text: "...he's not a baby anymore.",
          mode: 'dialogue',
          audioSrc: '/assets/audio/voices/laila/s10-05-laila-closing.mp3',
          durationMs: 1650,
          priority: 'dialogue',
          interruptionPolicy: 'pause_resume',
          placement: 'center',
          expression: 'contemplative',
        },
        audioCue: {
          cueId: 'motif_laila_resolved',
          type: 'leitmotif',
          audioSrc: '/assets/audio/music/motif_laila_resolved.wav',
          durationMs: 8000,
          priority: 'leitmotif',
          volume: 0.95,
        },
      },
    ],
  },
];

// ============================================================================
// State Resolution Engine (Pure, Deterministic, 100% Reversible)
// ============================================================================

export interface ResolvedVisualState {
  sceneId: string;
  stageProgress: number;
  camera: CameraCoordinates;
  parallax: ParallaxDepthOffsets;
  activeBeatId: string;
  activePanelId: string;
  activePanelAlt: string;
  speechBubble: EmbeddedSpeechBubble | null;
  audioCue: AudioCueEvent | null;
  isHold: boolean;
  transitionOut: TransitionOutSpec | null;
}

export interface AudioPlaybackLatchState {
  completedSpeechIds: Set<string>;
  currentlyPlayingId: string | null;
  lastProgressByScene: Record<string, number>;
}

export interface ResolvedAudioAction {
  action: 'play' | 'stop' | 'preempt' | 'none';
  speechToPlay?: EmbeddedSpeechBubble;
  cueToPlay?: AudioCueEvent;
  stopReason?: 'rapid_scroll_skip' | 'scene_exit' | 'reverse_scroll';
  ducking: {
    duckScore: boolean;
    duckAmbience: boolean;
    duckFactor: number;
  };
}

/**
 * Pure interpolation helper: clamps and smooths between two numbers.
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Resolves the continuous visual camera and panel framing at any stageProgress.
 * Reversible: forward and backward progression through the same progress value
 * yields mathematically identical visual framing.
 */
export function resolveTimelineVisualState(
  sceneId: string,
  stageProgress: number,
  isMobile = false,
): ResolvedVisualState {
  const scene = STORYBOARD_TIMELINE.find((s) => s.id === sceneId) ?? STORYBOARD_TIMELINE[0];
  const beats = scene.beats;

  if (beats.length === 0) {
    return {
      sceneId: scene.id,
      stageProgress,
      camera: { panXPercent: 0, panYPercent: 0, zoom: 1.0 },
      parallax: { bgOffsetPx: 0, midOffsetPx: 0, fgOffsetPx: 0 },
      activeBeatId: '',
      activePanelId: '',
      activePanelAlt: '',
      speechBubble: null,
      audioCue: null,
      isHold: false,
      transitionOut: null,
    };
  }

  const p = Math.max(0, Math.min(1, stageProgress));

  // Find bounding keyframes
  let prevBeat = beats[0];
  let nextBeat = beats[beats.length - 1];

  for (let i = 0; i < beats.length; i++) {
    if (beats[i].stageProgress <= p) {
      prevBeat = beats[i];
    }
    if (beats[i].stageProgress >= p) {
      nextBeat = beats[i];
      break;
    }
  }

  // Calculate local interpolation fraction t [0..1] with hold window support
  let t = 0;
  if (prevBeat.holdWindow && p >= prevBeat.holdWindow.start && p <= prevBeat.holdWindow.end) {
    // Camera is held rock-steady on prevBeat
    t = 0;
  } else if (nextBeat.holdWindow && p >= nextBeat.holdWindow.start && p <= nextBeat.holdWindow.end) {
    // Camera is held rock-steady on nextBeat
    t = 1;
  } else {
    // Travel window between beats
    const travelStart = prevBeat.holdWindow ? prevBeat.holdWindow.end : prevBeat.stageProgress;
    const travelEnd = nextBeat.holdWindow ? nextBeat.holdWindow.start : nextBeat.stageProgress;
    const travelDenom = travelEnd - travelStart;
    if (travelDenom > 0 && p >= travelStart) {
      t = Math.max(0, Math.min(1, (p - travelStart) / travelDenom));
    } else if (p < travelStart) {
      t = 0;
    } else {
      const denom = nextBeat.stageProgress - prevBeat.stageProgress;
      t = denom > 0 ? Math.max(0, Math.min(1, (p - prevBeat.stageProgress) / denom)) : 0;
    }
  }

  // Smoothstep (Hermite) cubic easing for filmic camera movement
  const smoothT = t * t * (3 - 2 * t);

  // Adaptive Mobile scaling: preserve responsive character framing on portrait screens
  const mobileScaleX = isMobile ? 0.85 : 1.0;
  const mobileScaleY = isMobile ? 0.65 : 1.0;
  const mobileZoomBonus = isMobile ? 0.02 : 0.0;

  const panX = lerp(prevBeat.camera.panXPercent, nextBeat.camera.panXPercent, smoothT) * mobileScaleX;
  const panY = lerp(prevBeat.camera.panYPercent, nextBeat.camera.panYPercent, smoothT) * mobileScaleY;
  const zoom = lerp(prevBeat.camera.zoom, nextBeat.camera.zoom, smoothT) + mobileZoomBonus;
  const rotate = lerp(prevBeat.camera.rotateDeg ?? 0, nextBeat.camera.rotateDeg ?? 0, smoothT);

  const bgY = lerp(prevBeat.parallax.bgOffsetPx, nextBeat.parallax.bgOffsetPx, smoothT);
  const midY = lerp(prevBeat.parallax.midOffsetPx, nextBeat.parallax.midOffsetPx, smoothT);
  const fgY = lerp(prevBeat.parallax.fgOffsetPx, nextBeat.parallax.fgOffsetPx, smoothT);

  // Active panel and speech bubble belong to the prevailing beat
  const activeBeat = t < 0.65 ? prevBeat : nextBeat;

  // Active speech bubble remains visible throughout its beat window
  const speechBubble = activeBeat.speech ?? null;
  const audioCue = activeBeat.audioCue ?? null;
  const isHold = !!activeBeat.camera.isHold && (
    !activeBeat.holdWindow || (p >= activeBeat.holdWindow.start && p <= activeBeat.holdWindow.end)
  );
  const transitionOut = nextBeat.transitionOut && p >= nextBeat.stageProgress - (nextBeat.transitionOut.durationProgress ?? 0.1)
    ? nextBeat.transitionOut
    : null;

  return {
    sceneId: scene.id,
    stageProgress: p,
    camera: {
      panXPercent: Math.round(panX * 100) / 100,
      panYPercent: Math.round(panY * 100) / 100,
      zoom: Math.round(zoom * 1000) / 1000,
      rotateDeg: Math.round(rotate * 10) / 10,
      isHold,
      focalPoint: activeBeat.camera.focalPoint,
    },
    parallax: {
      bgOffsetPx: Math.round(bgY * 10) / 10,
      midOffsetPx: Math.round(midY * 10) / 10,
      fgOffsetPx: Math.round(fgY * 10) / 10,
    },
    activeBeatId: activeBeat.id,
    activePanelId: activeBeat.panelId,
    activePanelAlt: activeBeat.panelAlt,
    speechBubble,
    audioCue,
    isHold,
    transitionOut,
  };
}

/**
 * Resolves discrete audio actions with strict forward/backward hysteresis and rapid-scroll prevention.
 */
export function resolveTimelineAudioAction(
  sceneId: string,
  currentProgress: number,
  previousProgress: number,
  latchState: AudioPlaybackLatchState,
  options?: { velocityThreshold?: number },
): ResolvedAudioAction {
  const scene = STORYBOARD_TIMELINE.find((s) => s.id === sceneId);
  if (!scene) {
    return {
      action: 'none',
      ducking: { duckScore: false, duckAmbience: false, duckFactor: 1.0 },
    };
  }

  const delta = currentProgress - previousProgress;
  const isForward = delta > 0;
  const isFastScroll = Math.abs(delta) > (options?.velocityThreshold ?? 0.25);
  const crossedBeats = scene.beats.filter(
    (beat) => beat.speech && previousProgress < beat.stageProgress && currentProgress >= beat.stageProgress,
  );

  // Rapid scroll guard: if user scrolls too fast, cut active voice and avoid firing backlog
  if (isFastScroll && latchState.currentlyPlayingId) {
    return {
      action: 'stop',
      stopReason: 'rapid_scroll_skip',
      ducking: { duckScore: false, duckAmbience: false, duckFactor: 1.0 },
    };
  }

  // Backward scrolling hysteresis: do NOT re-trigger speech if scrolling backward
  if (!isForward) {
    // Arm deliberate replay only after the reader retreats clearly behind a line.
    // Tiny reverse jitter keeps the completed latch intact.
    for (const beat of scene.beats) {
      if (
        beat.speech &&
        previousProgress >= beat.stageProgress &&
        currentProgress < beat.stageProgress - 0.05
      ) {
        latchState.completedSpeechIds.delete(beat.speech.id);
      }
    }

    // If currently playing speech and user reverses past its trigger, gently fade out
    if (latchState.currentlyPlayingId) {
      const playingBeat = scene.beats.find((b) => b.speech?.id === latchState.currentlyPlayingId);
      if (playingBeat && currentProgress < playingBeat.stageProgress - 0.05) {
        return {
          action: 'stop',
          stopReason: 'reverse_scroll',
          ducking: { duckScore: false, duckAmbience: false, duckFactor: 1.0 },
        };
      }
    }
    return {
      action: 'none',
      ducking: {
        duckScore: !!latchState.currentlyPlayingId,
        duckAmbience: !!latchState.currentlyPlayingId,
        duckFactor: latchState.currentlyPlayingId ? 0.38 : 1.0,
      },
    };
  }

  // Forward scroll: only catch the latest crossed event while it is still at
  // its panel. A delayed update must not speak a line the reader passed.
  const latestCrossed = crossedBeats[crossedBeats.length - 1];
  if (!latestCrossed?.speech || currentProgress - latestCrossed.stageProgress > 0.05) {
    return {
      action: 'none',
      ducking: { duckScore: false, duckAmbience: false, duckFactor: 1.0 },
    };
  }

  if (
    latchState.completedSpeechIds.has(latestCrossed.speech.id) ||
    latchState.currentlyPlayingId === latestCrossed.speech.id
  ) {
    return {
      action: 'none',
      ducking: {
        duckScore: !!latchState.currentlyPlayingId,
        duckAmbience: !!latchState.currentlyPlayingId,
        duckFactor: latchState.currentlyPlayingId ? 0.38 : 1.0,
      },
    };
  }

  const isDialogue = latestCrossed.speech.mode === 'dialogue';
  return {
    action: 'play',
    speechToPlay: latestCrossed.speech,
    ducking: {
      duckScore: true,
      duckAmbience: true,
      duckFactor: isDialogue ? 0.38 : 0.45,
    },
  };
}

/**
 * Validates the complete Storyverse 3.0 timeline for integrity, monotonic ordering,
 * and completeness across all 14 narration beats and 34 character dialogue lines.
 */
export function validateStoryTimeline(): {
  isValid: boolean;
  totalScenes: number;
  totalBeats: number;
  totalNarrationBeats: number;
  totalDialogueBeats: number;
  errors: string[];
} {
  const errors: string[] = [];
  let totalBeats = 0;
  let totalNarrationBeats = 0;
  let totalDialogueBeats = 0;

  const narrationIds = new Set<string>();
  const dialogueIds = new Set<string>();

  STORYBOARD_TIMELINE.forEach((scene) => {
    let lastProgress = -1;

    scene.beats.forEach((beat) => {
      totalBeats++;

      // Monotonic check
      if (beat.stageProgress <= lastProgress) {
        errors.push(`Scene ${scene.id}: Beat ${beat.id} progress ${beat.stageProgress} is not strictly greater than previous ${lastProgress}`);
      }
      lastProgress = beat.stageProgress;

      // Range check
      if (beat.stageProgress < 0 || beat.stageProgress > 1) {
        errors.push(`Scene ${scene.id}: Beat ${beat.id} progress ${beat.stageProgress} out of [0..1] range`);
      }

      if (beat.speech) {
        if (beat.speech.mode === 'narration') {
          totalNarrationBeats++;
          if (narrationIds.has(beat.speech.id)) {
            errors.push(`Duplicate narration beat ID: ${beat.speech.id}`);
          }
          narrationIds.add(beat.speech.id);
        } else if (beat.speech.mode === 'dialogue') {
          totalDialogueBeats++;
          if (dialogueIds.has(beat.speech.id)) {
            errors.push(`Duplicate dialogue line ID: ${beat.speech.id}`);
          }
          dialogueIds.add(beat.speech.id);
        }
      }
    });
  });

  if (totalNarrationBeats !== 14) {
    errors.push(`Expected 14 narration beats, found ${totalNarrationBeats}`);
  }

  if (totalDialogueBeats !== 34) {
    errors.push(`Expected 34 dialogue lines, found ${totalDialogueBeats}`);
  }

  return {
    isValid: errors.length === 0,
    totalScenes: STORYBOARD_TIMELINE.length,
    totalBeats,
    totalNarrationBeats,
    totalDialogueBeats,
    errors,
  };
}
