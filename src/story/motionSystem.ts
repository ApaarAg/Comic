export type MotionMood = 'cinematic' | 'environmental' | 'character' | 'interaction' | 'narrative' | 'transition';

export interface MotionTimingProfile {
  duration: number;
  ease: string;
  stagger: number;
  parallaxDepth: number;
}

/**
 * Unified Motion Design Language for Storyverse — The Many Deaths of Laila Starr.
 * Pacing deliberately varies by narrative emotional register rather than using identical timings everywhere.
 */
export const MOTION_EASING = {
  /** Slow, deliberate filmic camera settle */
  cinematic: 'power3.out',
  /** Refined editorial typographic reveal */
  editorial: 'expo.out',
  /** Brisk, physical street/chase cadence */
  kinetic: 'power2.out',
  /** Unhurried emotional weight for grief, grace, and dawn */
  emotional: 'sine.inOut',
  /** CSS cubic-bezier equivalents for micro-interactions */
  cssSettle: 'cubic-bezier(0.16, 1, 0.3, 1)',
  cssBreath: 'cubic-bezier(0.42, 0, 0.58, 1)',
} as const;

export type ScenePacingRegister = 'action' | 'emotional' | 'atmospheric' | 'celestial';

export const SCENE_PACING_PROFILES: Record<ScenePacingRegister, MotionTimingProfile> = {
  action: {
    duration: 0.48,
    ease: MOTION_EASING.kinetic,
    stagger: 0.06,
    parallaxDepth: 34,
  },
  emotional: {
    duration: 0.95,
    ease: MOTION_EASING.emotional,
    stagger: 0.14,
    parallaxDepth: 16,
  },
  atmospheric: {
    duration: 0.78,
    ease: MOTION_EASING.cinematic,
    stagger: 0.1,
    parallaxDepth: 24,
  },
  celestial: {
    duration: 1.05,
    ease: MOTION_EASING.editorial,
    stagger: 0.12,
    parallaxDepth: 28,
  },
};

export function getScenePacingProfile(
  mood:
    | 'sunset'
    | 'traffic'
    | 'twilight'
    | 'celestial'
    | 'split'
    | 'descent'
    | 'clinical'
    | 'chase'
    | 'impact'
    | 'dawn',
): MotionTimingProfile {
  switch (mood) {
    case 'traffic':
    case 'chase':
    case 'impact':
      return SCENE_PACING_PROFILES.action;
    case 'clinical':
    case 'dawn':
      return SCENE_PACING_PROFILES.emotional;
    case 'celestial':
    case 'descent':
      return SCENE_PACING_PROFILES.celestial;
    default:
      return SCENE_PACING_PROFILES.atmospheric;
  }
}
