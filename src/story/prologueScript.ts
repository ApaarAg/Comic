export interface PrologueNarrationBeat {
  id: string;
  momentIndex: number;
  label: string;
  text: string;
  durationMs: number;
  voiceAsset: string;
}

export interface PrologueMomentMeta {
  index: number;
  id: string;
  code: string;
  title: string;
  start: number;
  end: number;
}

/**
 * 5-Part Immersive Cinematic Prologue Sequence:
 * - Scene A: Darkness & subtle ambient sound (0.00 – 0.20)
 * - Scene B: Mumbai skyline slowly revealed with depth/parallax/movement (0.20 – 0.40)
 * - Scene C: Narration with approved Prabhat Neural voice + cinematic captions (0.40 – 0.65)
 * - Scene D: Title Reveal with elegant typography (0.65 – 0.85)
 * - Scene E: Seamless enter into comic / original artwork (0.85 – 1.00)
 */
export const PROLOGUE_MOMENTS: ReadonlyArray<PrologueMomentMeta> = [
  {
    index: 0,
    id: 'scene-a-darkness',
    code: 'A',
    title: 'The Darkness',
    start: 0.0,
    end: 0.20,
  },
  {
    index: 1,
    id: 'scene-b-mumbai',
    code: 'B',
    title: 'Mumbai Skyline',
    start: 0.20,
    end: 0.40,
  },
  {
    index: 2,
    id: 'scene-c-narration',
    code: 'C',
    title: 'The Chronicle',
    start: 0.40,
    end: 0.65,
  },
  {
    index: 3,
    id: 'scene-d-title',
    code: 'D',
    title: 'Once Upon a Falling Starr',
    start: 0.65,
    end: 0.85,
  },
  {
    index: 4,
    id: 'scene-e-enter',
    code: 'E',
    title: 'Enter Chapter One',
    start: 0.85,
    end: 1.0,
  },
];

export const PROLOGUE_NARRATION_BEATS: ReadonlyArray<PrologueNarrationBeat> = [
  {
    id: 'prologue-narration-01',
    momentIndex: 0,
    label: 'The Chronicle · Mumbai, Late December',
    text: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.',
    durationMs: 5526,
    voiceAsset: '/assets/audio/voices/narrator/scene-01-opening.mp3',
  },
];
