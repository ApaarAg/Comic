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

export const PROLOGUE_MOMENTS: ReadonlyArray<PrologueMomentMeta> = [
  {
    index: 0,
    id: 'moment-01-darkness',
    code: 'I',
    title: 'The Darkness',
    start: 0.0,
    end: 0.16,
  },
  {
    index: 1,
    id: 'moment-02-title',
    code: 'II',
    title: 'Once Upon a Falling Starr',
    start: 0.16,
    end: 0.34,
  },
  {
    index: 2,
    id: 'moment-03-mumbai',
    code: 'III',
    title: 'Mumbai Emerges',
    start: 0.34,
    end: 0.54,
  },
  {
    index: 3,
    id: 'moment-04-story',
    code: 'IV',
    title: 'The Premise',
    start: 0.54,
    end: 0.74,
  },
  {
    index: 4,
    id: 'moment-05-buildup',
    code: 'V',
    title: 'The Convergence',
    start: 0.74,
    end: 0.9,
  },
  {
    index: 5,
    id: 'moment-06-enter',
    code: 'VI',
    title: 'Enter Chapter One',
    start: 0.9,
    end: 1.0,
  },
];

/**
 * Short cinematic synopsis narration beats adapted from the official premise of
 * The Many Deaths of Laila Starr (without inventing comic dialogue or reproducing copyrighted pages).
 * Voice files remain optional: CharacterVoicePlayer checks /api/voice-assets honestly
 * and executes synchronized visual caption cadence when studio recordings are not present.
 */
export const PROLOGUE_NARRATION_BEATS: ReadonlyArray<PrologueNarrationBeat> = [
  {
    id: 'prologue-narration-01',
    momentIndex: 3,
    label: 'Prologue · Mumbai, Late December',
    text: 'In the skies above Mumbai, the avatar of Death has just been made redundant—for tonight, a child will be born destined to bring humanity eternal life.',
    durationMs: 6400,
    voiceAsset: '/assets/audio/voices/narrator/prologue-01-redundancy.mp3',
  },
  {
    id: 'prologue-narration-02',
    momentIndex: 4,
    label: 'Prologue · A Mortal Second Chance',
    text: 'Cast out into the freshly fallen body of a young woman named Laila Starr, Death descends into neon heat and monsoon dusk to find the boy before eternity begins.',
    durationMs: 6800,
    voiceAsset: '/assets/audio/voices/narrator/prologue-02-descent.mp3',
  },
];
