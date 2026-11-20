import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const OUT_DIR = path.resolve('public/assets/videos');
const TMP_DIR = path.join(os.tmpdir(), 'laila-video-plates');
const FORCE = process.argv.includes('--force');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

function asset(name) {
  return path.resolve('public/assets/chapter1', name);
}

function alreadyValid(outName) {
  if (FORCE) return false;
  const p = path.join(OUT_DIR, outName);
  if (!fs.existsSync(p) || fs.statSync(p).size < 100_000) return false;
  try {
    execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width', '-of', 'csv=p=0', p], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function runFfmpeg(args, label) {
  console.log(`[video-build] ${label}...`);
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], {
    stdio: 'inherit',
  });
}

// Pre-grade & pre-blur a single static frame once (fast single-frame pass)
function preparePlate(srcName, outTag, { width = 2240, height = 1260, blur = 14, eqFilter, preCrop = '' }) {
  const outPath = path.join(TMP_DIR, `${outTag}.png`);
  const scaleCrop =
    width === 2160
      ? `scale=${width}:${height}:flags=lanczos`
      : `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
  const pre = preCrop ? `${preCrop},` : '';
  runFfmpeg(
    [
      '-i',
      asset(srcName),
      '-vf',
      `${pre}${scaleCrop},format=rgba,${eqFilter},gblur=sigma=${blur}`,
      '-frames:v',
      '1',
      outPath,
    ],
    `Preparing plate ${outTag}`,
  );
  return outPath;
}

// 1. VIDEO 01 — MUMBAI CITY (scrubbed aerial dusk glide below caption box down to BKC overpass)
if (!alreadyValid('scene01_mumbai.mp4')) {
  const p01 = preparePlate('p06_panel01.webp', 'v01_mumbai', {
    width: 2160,
    height: 3277,
    blur: 10,
    eqFilter: 'eq=brightness=-0.04:saturation=1.22:contrast=1.05',
  });
  runFfmpeg(
    [
      '-loop', '1', '-t', '8', '-r', '24', '-i', p01,
      '-vf',
      "crop=1920:1080:x='120-45*sin(PI*t/8)':y='(ih-1080)*(0.18+0.78*(t/8))',format=yuv420p",
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      path.join(OUT_DIR, 'scene01_mumbai.mp4'),
    ],
    'Encoding scene01_mumbai.mp4 (1080p scrub)',
  );
} else {
  console.log('[video-build] Skipping existing valid scene01_mumbai.mp4');
}

// Fast native SIMD fade + overlay loop: Plate B fades in over Plate A (t=1..3.4s) and back out (t=4.6..7.0s)
// so t=0s === t=8s cleanly without slow per-pixel expression evaluation.
function buildDualLoop({
  outName,
  plateA,
  plateB,
  panAx = 75,
  panAy = 42,
  panBx = -70,
  panBy = -38,
  blur = 14,
  tintA = 'eq=brightness=-0.06:saturation=1.18:contrast=1.05',
  tintB = 'eq=brightness=-0.06:saturation=1.2:contrast=1.05',
}) {
  if (alreadyValid(outName)) {
    console.log(`[video-build] Skipping existing valid ${outName}`);
    return;
  }

  const prepA = preparePlate(plateA, `${outName}_a`, { blur, eqFilter: tintA });
  const prepB = preparePlate(plateB, `${outName}_b`, { blur, eqFilter: tintB });

  const filter = [
    `[0:v]crop=1920:1080:x='160+${panAx}*sin(2*PI*t/8)':y='90+${panAy}*cos(2*PI*t/8)',format=yuva420p[a];`,
    `[1:v]crop=1920:1080:x='160+${panBx}*sin(2*PI*t/8)':y='90+${panBy}*cos(2*PI*t/8)',format=yuva420p,`,
    `fade=t=in:st=1.0:d=2.4:alpha=1,fade=t=out:st=4.6:d=2.4:alpha=1[b];`,
    `[a][b]overlay=0:0:shortest=1,format=yuv420p[v]`,
  ].join('');

  runFfmpeg(
    [
      '-loop', '1', '-t', '8', '-r', '24', '-i', prepA,
      '-loop', '1', '-t', '8', '-r', '24', '-i', prepB,
      '-filter_complex', filter,
      '-map', '[v]',
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      path.join(OUT_DIR, outName),
    ],
    `Encoding ${outName} (1080p seamless loop)`,
  );
}

// 2. VIDEO 02 — MUMBAI TRAFFIC
buildDualLoop({
  outName: 'scene02_traffic.mp4',
  plateA: 'p07_panel02.webp',
  plateB: 'p07_panel03.webp',
  panAx: 95,
  panAy: 30,
  panBx: -90,
  panBy: -26,
  blur: 16,
  tintA: 'eq=brightness=-0.06:saturation=1.28:contrast=1.08',
  tintB: 'eq=brightness=-0.08:saturation=1.22:contrast=1.06',
});

// 3. VIDEO 03 — COLLEGE PARTY
buildDualLoop({
  outName: 'scene03_party.mp4',
  plateA: 'p08_panel01.webp',
  plateB: 'p08_panel06.webp',
  panAx: 60,
  panAy: 36,
  panBx: -55,
  panBy: 30,
  blur: 14,
  tintA: 'eq=brightness=-0.06:saturation=1.24:contrast=1.06',
  tintB: 'eq=brightness=-0.08:saturation=1.26:contrast=1.08',
});

// 4. VIDEO 04 — DEATH'S OFFICE
buildDualLoop({
  outName: 'scene04_office.mp4',
  plateA: 'p09_panel01.webp',
  plateB: 'p10_panel04.webp',
  panAx: 50,
  panAy: 48,
  panBx: -45,
  panBy: -44,
  blur: 12,
  tintA: 'eq=brightness=-0.03:saturation=1.18:contrast=1.04',
  tintB: 'eq=brightness=-0.04:saturation=1.15:contrast=1.05',
});

// 5. VIDEO 05 — HOSPITAL
buildDualLoop({
  outName: 'scene05_hospital.mp4',
  plateA: 'p16_panel01.webp',
  plateB: 'p16_panel04.webp',
  panAx: 36,
  panAy: 22,
  panBx: -34,
  panBy: -20,
  blur: 14,
  tintA: 'eq=brightness=-0.08:saturation=1.08:contrast=1.08',
  tintB: 'eq=brightness=-0.10:saturation=1.04:contrast=1.1',
});

// 6. VIDEO 06 — TRANSFORMATION
if (!alreadyValid('scene06_transformation.mp4')) {
  const t0 = preparePlate('p15_panel05.webp', 'v06_0', {
    blur: 18,
    preCrop: 'crop=iw*0.56:ih*0.72:0:ih*0.26',
    eqFilter: 'eq=brightness=-0.05:saturation=1.24:contrast=1.08',
  });
  const t1 = preparePlate('p17_panel01.webp', 'v06_1', {
    blur: 18,
    preCrop: 'crop=iw*0.7:ih*0.65:0:ih*0.32',
    eqFilter: 'eq=brightness=-0.04:saturation=1.3:contrast=1.1',
  });
  const t2 = preparePlate('p24_panel03.webp', 'v06_2', {
    blur: 16,
    eqFilter: 'eq=brightness=-0.07:saturation=1.28:contrast=1.1',
  });

  runFfmpeg(
    [
      '-loop', '1', '-t', '3.6', '-r', '24', '-i', t0,
      '-loop', '1', '-t', '3.6', '-r', '24', '-i', t1,
      '-loop', '1', '-t', '3.6', '-r', '24', '-i', t2,
      '-filter_complex',
      [
        "[0:v]crop=1920:1080:x='160+55*sin(PI*t/3.6)':y='90-45*cos(PI*t/3.6)'[v0];",
        "[1:v]crop=1920:1080:x='160-50*sin(PI*t/3.6)':y='90+45*sin(PI*t/3.6)'[v1];",
        "[2:v]crop=1920:1080:x='160+45*cos(PI*t/3.6)':y='90-40*sin(PI*t/3.6)'[v2];",
        '[v0][v1]xfade=transition=fade:duration=1.4:offset=2.2[x1];',
        '[x1][v2]xfade=transition=fade:duration=1.4:offset=4.4,format=yuv420p[v]',
      ].join(''),
      '-map', '[v]',
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      path.join(OUT_DIR, 'scene06_transformation.mp4'),
    ],
    'Encoding scene06_transformation.mp4 (1080p multi-stage scrub/loop)',
  );
} else {
  console.log('[video-build] Skipping existing valid scene06_transformation.mp4');
}

// 7. VIDEO 07 — FINAL CITY ENVIRONMENT
buildDualLoop({
  outName: 'scene07_final_city.mp4',
  plateA: 'p25_panel01.webp',
  plateB: 'p27_panel01.webp',
  panAx: 42,
  panAy: 24,
  panBx: -40,
  panBy: -22,
  blur: 11,
  tintA: 'eq=brightness=-0.03:saturation=1.14:contrast=1.03',
  tintB: 'eq=brightness=-0.04:saturation=1.16:contrast=1.04',
});

console.log('[video-build] All 7 scene background videos ready.');
