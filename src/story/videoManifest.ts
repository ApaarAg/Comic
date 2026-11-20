export type SceneVideoId =
  | 'video01_mumbai'
  | 'video02_traffic'
  | 'video03_party'
  | 'video04_office'
  | 'video05_hospital'
  | 'video06_transformation'
  | 'video07_final_city';

export interface SceneVideoSpec {
  id: SceneVideoId;
  code: string;
  title: string;
  /** Served URL under public/assets/videos/ */
  src: string;
  /** High-resolution comic artwork fallback/poster image */
  poster: string;
  /** Primary comic artwork reference path for image-to-video generation */
  referenceImage: string;
  aspectRatio: '16:9';
  resolution: '1080p';
  durationSeconds: number;
  defaultPlaybackMode: 'loop' | 'scrub';
  videoOpacity: number;
  overlayGradient: string;
  veoPrompt: string;
  mobilePrompt: string;
}

export const SCENE_VIDEOS: Record<SceneVideoId, SceneVideoSpec> = {
  video01_mumbai: {
    id: 'video01_mumbai',
    code: 'VIDEO 01',
    title: 'Mumbai City Sunset',
    src: '/assets/videos/scene01_mumbai.mp4',
    poster: '/assets/chapter1/mumbai_skyline_backdrop.jpg',
    referenceImage: 'public/assets/chapter1/p06_panel01.webp',
    aspectRatio: '16:9',
    resolution: '1080p',
    durationSeconds: 8,
    defaultPlaybackMode: 'scrub',
    videoOpacity: 0.42,
    overlayGradient:
      'linear-gradient(180deg, rgba(20, 18, 37, 0.68) 0%, rgba(20, 18, 37, 0.36) 48%, rgba(20, 18, 37, 0.88) 100%)',
    veoPrompt:
      'Cinematic painterly aerial view of Mumbai skyline during a late-December sunset, inspired by Filipe Andrade hand-drawn ink and watercolor illustration. Warm coral-orange sun dipping behind hazy glass skyscrapers, slow drifting clouds, distant winding BKC overpass traffic with tiny glowing headlights, rich pink, sunset orange, deep teal, and indigo color palette. Gentle forward aerial camera tracking, subtle atmospheric haze, 16:9 1080p seamless ambient motion, no text, no flicker.',
    mobilePrompt:
      'Vertical 9:16 framing centered on the setting coral sun and winding overpass traffic below skyscrapers.',
  },
  video02_traffic: {
    id: 'video02_traffic',
    code: 'VIDEO 02',
    title: 'Mumbai Traffic',
    src: '/assets/videos/scene02_traffic.mp4',
    poster: '/assets/chapter1/p07_panel02.webp',
    referenceImage: 'public/assets/chapter1/p07_panel02.webp',
    aspectRatio: '16:9',
    resolution: '1080p',
    durationSeconds: 8,
    defaultPlaybackMode: 'loop',
    videoOpacity: 0.34,
    overlayGradient:
      'linear-gradient(180deg, rgba(20, 18, 37, 0.78) 0%, rgba(28, 24, 36, 0.56) 50%, rgba(19, 22, 43, 0.86) 100%)',
    veoPrompt:
      'Cinematic view of dense chaotic Mumbai evening rush-hour traffic on an elevated overpass, painterly ink-and-wash texture matching editorial comic art. Slowly crawling cars, motorcycles, glowing amber and ruby tail lights streaking softly through warm sunset exhaust haze and cool teal dusk shadows. Restrained handheld parallax camera drift, crisp detail, 16:9 1080p seamless loop, no text.',
    mobilePrompt:
      'Vertical 9:16 crop emphasizing stacked tail-light depth down the crowded overpass canyon.',
  },
  video03_party: {
    id: 'video03_party',
    code: 'VIDEO 03',
    title: 'College Party',
    src: '/assets/videos/scene03_party.mp4',
    poster: '/assets/chapter1/p08_panel02.webp',
    referenceImage: 'public/assets/chapter1/p08_panel02.webp',
    aspectRatio: '16:9',
    resolution: '1080p',
    durationSeconds: 8,
    defaultPlaybackMode: 'loop',
    videoOpacity: 0.34,
    overlayGradient:
      'linear-gradient(180deg, rgba(19, 22, 43, 0.8) 0%, rgba(25, 27, 54, 0.54) 50%, rgba(22, 40, 61, 0.86) 100%)',
    veoPrompt:
      'Atmospheric sixth-floor Mumbai apartment university party at dusk overlooking shimmering twilight city lights. Soft out-of-focus human silhouettes swaying gently in warm magenta and amber interior lighting while delicate wisps of cigarette smoke curl slowly past an open window against deep indigo dusk sky. Smooth subtle camera breathing, painterly comic color grading, 16:9 1080p seamless loop.',
    mobilePrompt:
      'Vertical 9:16 framing focusing on the open sixth-floor window silhouette and drifting smoke against distant city lights.',
  },
  video04_office: {
    id: 'video04_office',
    code: 'VIDEO 04',
    title: "Death's Office",
    src: '/assets/videos/scene04_office.mp4',
    poster: '/assets/chapter1/p10_panel04.webp',
    referenceImage: 'public/assets/chapter1/p10_panel04.webp',
    aspectRatio: '16:9',
    resolution: '1080p',
    durationSeconds: 8,
    defaultPlaybackMode: 'loop',
    videoOpacity: 0.36,
    overlayGradient:
      'linear-gradient(180deg, rgba(22, 40, 61, 0.78) 0%, rgba(28, 56, 83, 0.5) 50%, rgba(35, 53, 84, 0.86) 100%)',
    veoPrompt:
      'Surreal celestial corporate office high beyond mortal clouds inside a slender ivory-silver tower. Expansive floor-to-ceiling glass walls floating amid slow-drifting pastel pink, lavender, soft teal, and cerulean clouds. Ethereal floating dust motes, gentle luminous sunlight shafts, dreamy architectural depth, ultra-slow weightless camera glide, painterly graphic novel aesthetic, 16:9 1080p seamless loop.',
    mobilePrompt:
      'Vertical 9:16 view highlighting tall architectural glass mullions floating above pastel cloud banks.',
  },
  video05_hospital: {
    id: 'video05_hospital',
    code: 'VIDEO 05',
    title: 'Hospital Corridor',
    src: '/assets/videos/scene05_hospital.mp4',
    poster: '/assets/chapter1/p16_panel01.webp',
    referenceImage: 'public/assets/chapter1/p16_panel01.webp',
    aspectRatio: '16:9',
    resolution: '1080p',
    durationSeconds: 8,
    defaultPlaybackMode: 'loop',
    videoOpacity: 0.34,
    overlayGradient:
      'linear-gradient(180deg, rgba(12, 21, 34, 0.82) 0%, rgba(16, 28, 45, 0.56) 50%, rgba(10, 11, 21, 0.88) 100%)',
    veoPrompt:
      'Restrained cinematic night hospital corridor in Amravati. Cool sterile cyan and slate blue fluorescent light reflecting off quiet tiled floors, subtle distant light flicker and gentle shadow movement across glass ward doors, quiet rain ambiance outside windows. Slow measured dolly stillness, moody painterly realism, 16:9 1080p seamless loop.',
    mobilePrompt:
      'Vertical 9:16 composition centered on cool glowing ward doorway and soft corridor reflections.',
  },
  video06_transformation: {
    id: 'video06_transformation',
    code: 'VIDEO 06',
    title: 'Mortal Transformation',
    src: '/assets/videos/scene06_transformation.mp4',
    poster: '/assets/chapter1/p17_panel01.webp',
    referenceImage: 'public/assets/chapter1/p17_panel01.webp',
    aspectRatio: '16:9',
    resolution: '1080p',
    durationSeconds: 8,
    defaultPlaybackMode: 'scrub',
    videoOpacity: 0.4,
    overlayGradient:
      'linear-gradient(180deg, rgba(17, 22, 42, 0.78) 0%, rgba(25, 32, 59, 0.48) 50%, rgba(12, 21, 34, 0.88) 100%)',
    veoPrompt:
      'Abstract cinematic cosmic-to-mortal energy transition inspired by painterly comic art. Deep midnight blue, violet purple, magenta pink, and electric cyan light ribbons and suspended luminous particles swirling downward in slow fluid currents like a soul descending through storm clouds. Soft optical distortion, velvety depth, 16:9 1080p seamless ambient motion.',
    mobilePrompt:
      'Vertical 9:16 cosmic descent channel with downward luminous violet-cyan currents.',
  },
  video07_final_city: {
    id: 'video07_final_city',
    code: 'VIDEO 07',
    title: 'Eight Years Later · Dawn Mumbai',
    src: '/assets/videos/scene07_final_city.mp4',
    poster: '/assets/chapter1/p25_panel01.webp',
    referenceImage: 'public/assets/chapter1/p25_panel01.webp',
    aspectRatio: '16:9',
    resolution: '1080p',
    durationSeconds: 8,
    defaultPlaybackMode: 'loop',
    videoOpacity: 0.38,
    overlayGradient:
      'linear-gradient(180deg, rgba(23, 28, 38, 0.76) 0%, rgba(33, 36, 45, 0.48) 50%, rgba(19, 23, 34, 0.9) 100%)',
    veoPrompt:
      'Peaceful serene early morning in coastal Mumbai eight years later. Pale pastel dawn mist curling gently across harbour waters and the Gateway of India shoreline bathed in soft warm amber sunrise and muted slate blue shadows. Subtle rising morning light mist, tranquil stillness, painterly comic book warmth, 16:9 1080p seamless loop.',
    mobilePrompt:
      'Vertical 9:16 view framing warm dawn sky mist above calm coastal Mumbai water.',
  },
};

export interface SceneBackdropBinding {
  videoId: SceneVideoId;
  playbackMode: 'loop' | 'scrub';
  opacity: number;
}

export const SCENE_BACKDROP_MAP: Record<string, SceneBackdropBinding> = {
  'scene-01': { videoId: 'video01_mumbai', playbackMode: 'scrub', opacity: 0.42 },
  'scene-02': { videoId: 'video02_traffic', playbackMode: 'loop', opacity: 0.34 },
  'scene-03': { videoId: 'video03_party', playbackMode: 'loop', opacity: 0.34 },
  'scene-04': { videoId: 'video04_office', playbackMode: 'loop', opacity: 0.36 },
  'scene-05': { videoId: 'video06_transformation', playbackMode: 'loop', opacity: 0.28 },
  'scene-06': { videoId: 'video06_transformation', playbackMode: 'scrub', opacity: 0.4 },
  'scene-07': { videoId: 'video05_hospital', playbackMode: 'loop', opacity: 0.34 },
  'scene-08': { videoId: 'video05_hospital', playbackMode: 'loop', opacity: 0.3 },
  'scene-09': { videoId: 'video06_transformation', playbackMode: 'scrub', opacity: 0.36 },
  'scene-10': { videoId: 'video07_final_city', playbackMode: 'loop', opacity: 0.38 },
};
