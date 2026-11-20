import { CHAPTER_SCENES } from '../src/story/chapter1Data';

const BASE_URL = 'http://localhost:3000';

const SCORE_PATHS = [
  '/assets/audio/music/scene_01_music_a.wav',
  '/assets/audio/music/scene_01_music_b.wav',
  '/assets/audio/music/scene_02_music.wav',
  '/assets/audio/music/scene_03_music.wav',
  '/assets/audio/music/scene_04_music_a.wav',
  '/assets/audio/music/scene_04_music_b.wav',
  '/assets/audio/music/scene_05_music_a.wav',
  '/assets/audio/music/scene_05_music_b.wav',
  '/assets/audio/music/scene_06_music_a.wav',
  '/assets/audio/music/scene_06_music_b.wav',
  '/assets/audio/music/scene_07_music.wav',
  '/assets/audio/music/scene_08_music.wav',
  '/assets/audio/music/scene_09_music.wav',
  '/assets/audio/music/scene_10_music_a.wav',
  '/assets/audio/music/scene_10_music_b.wav',
];

const MOTIF_PATHS = [
  '/assets/audio/music/motif_storyverse.wav',
  '/assets/audio/music/motif_death.wav',
  '/assets/audio/music/motif_laila.wav',
  '/assets/audio/music/motif_transformation.wav',
];

const AMBIENCE_PATHS = [
  '/assets/audio/soundscapes/scene_01_mumbai.wav',
  '/assets/audio/soundscapes/scene_02_traffic.wav',
  '/assets/audio/soundscapes/scene_03_party.wav',
  '/assets/audio/soundscapes/scene_04_death_world.wav',
  '/assets/audio/soundscapes/scene_05_convergence.wav',
  '/assets/audio/soundscapes/scene_06_transformation.wav',
  '/assets/audio/soundscapes/scene_07_hospital.wav',
  '/assets/audio/soundscapes/scene_08_escape.wav',
  '/assets/audio/soundscapes/scene_09_truck.wav',
  '/assets/audio/soundscapes/scene_10_eight_years_later.wav',
];

const SFX_PATHS = [
  '/assets/audio/sfx_bubble.wav',
  '/assets/audio/sfx_discover.wav',
  '/assets/audio/sfx_ding.wav',
  '/assets/audio/sfx_horn.wav',
  '/assets/audio/sfx_thunder.wav',
  '/assets/audio/sfx_flatline.wav',
  '/assets/audio/sfx_truck.wav',
  '/assets/audio/sfx_transition.wav',
];

async function run() {
  console.log('=== VERIFYING READER AUDIO ASSETS & ENDPOINTS ===\n');

  let failCount = 0;

  async function check(url: string, category: string) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.status === 200) {
        console.log(`[PASS] (${category}) ${url}`);
      } else {
        console.error(`[FAIL] (${category}) ${url} -> HTTP ${res.status}`);
        failCount++;
      }
    } catch (e: any) {
      console.error(`[ERROR] (${category}) ${url} -> ${e.message}`);
      failCount++;
    }
  }

  // 1. Pages
  await check(`${BASE_URL}/`, 'Page');
  await check(`${BASE_URL}/audio-experience-audition.html`, 'Page');

  // 2. Score
  for (const path of SCORE_PATHS) {
    await check(`${BASE_URL}${path}`, 'Score');
  }

  // 3. Motifs
  for (const path of MOTIF_PATHS) {
    await check(`${BASE_URL}${path}`, 'Motif');
  }

  // 4. Ambience
  for (const path of AMBIENCE_PATHS) {
    await check(`${BASE_URL}${path}`, 'Ambience');
  }

  // 5. SFX
  for (const path of SFX_PATHS) {
    await check(`${BASE_URL}${path}`, 'SFX');
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Total checks: ${2 + SCORE_PATHS.length + MOTIF_PATHS.length + AMBIENCE_PATHS.length + SFX_PATHS.length}`);
  console.log(`Failed checks: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('All 3-layer audio assets and endpoints verified 100% OK!');
  }
}

run();
