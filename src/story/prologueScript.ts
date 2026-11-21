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

<<<<<<< HEAD
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
=======
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
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
    end: 1.0,
  },
];

<<<<<<< HEAD
export const PROLOGUE_NARRATION_BEATS: ReadonlyArray<PrologueNarrationBeat> = [
  {
    id: 'prologue-narration-01',
    momentIndex: 0,
    label: 'The Opening Canvas · Once Upon a Falling Starr',
    text: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline. Down where the elevated highway curves between glass towers, the city exhaled in horns and heat.',
    durationMs: 11378,
    voiceAsset: '/assets/audio/voices/narrator/scene-00-opening-canvas.mp3',
=======
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
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
  },
];
