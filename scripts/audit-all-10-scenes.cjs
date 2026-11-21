const fs = require('fs');
const path = require('path');

console.log('=== STORYVERSE 4.0 FULL REPOSITORY ASSET & CODE AUDIT ===\n');

const scenesDir = path.join(__dirname, '../src/components/scenes');
const sceneFiles = fs.readdirSync(scenesDir).filter(f => f.endsWith('.tsx'));

let missingCount = 0;
let totalImages = 0;

console.log('--- 1. AUDITING SCENE COMPONENT ARTWORK ---');
for (const file of sceneFiles) {
  const content = fs.readFileSync(path.join(scenesDir, file), 'utf8');
  const imgRegex = /src=["'](\/assets\/[^"']+)["']/g;
  let m;
  const found = [];
  while ((m = imgRegex.exec(content)) !== null) {
    found.push(m[1]);
  }
  
  const missingInScene = [];
  for (const src of found) {
    totalImages++;
    const diskPath = path.join(__dirname, '../public', src);
    if (!fs.existsSync(diskPath)) {
      missingInScene.push(src);
      missingCount++;
    }
  }

  if (missingInScene.length > 0) {
    console.log(`[FAIL] ${file} has ${missingInScene.length} missing assets:`, missingInScene);
  } else {
    console.log(`[PASS] ${file} (${found.length} assets verified)`);
  }
}

console.log('\n--- 2. AUDITING STORYTIMELINE AUDIO ASSETS ---');
const timelineContent = fs.readFileSync(path.join(__dirname, '../src/story/storyTimeline.ts'), 'utf8');
const audioRegex = /audioSrc:\s*['"](\/assets\/[^'"]+)['"]/g;
let mAudio;
let totalAudio = 0;
let missingAudio = 0;
while ((mAudio = audioRegex.exec(timelineContent)) !== null) {
  totalAudio++;
  const audioPath = mAudio[1];
  const diskPath = path.join(__dirname, '../public', audioPath);
  if (!fs.existsSync(diskPath)) {
    console.log(`[MISSING AUDIO] ${audioPath}`);
    missingAudio++;
  }
}
console.log(`Total Timeline Audio Tracks Checked: ${totalAudio} | Missing: ${missingAudio}`);

console.log('\n--- 3. AUDITING TRANSITIONS IN APP.TSX ---');
const appContent = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
const transRegex = /<CinematicTransition[\s\S]*?artworkUrl=["'](\/assets\/[^"']+)["']/g;
let mTrans;
let totalTrans = 0;
let missingTrans = 0;
while ((mTrans = transRegex.exec(appContent)) !== null) {
  totalTrans++;
  const transArt = mTrans[1];
  const diskPath = path.join(__dirname, '../public', transArt);
  if (!fs.existsSync(diskPath)) {
    console.log(`[MISSING TRANSITION ART] ${transArt}`);
    missingTrans++;
  }
}
console.log(`Total Transition Artwork Checked: ${totalTrans} | Missing: ${missingTrans}`);

console.log('\n--- AUDIT SUMMARY ---');
console.log(`Total Images Audited: ${totalImages} | Missing: ${missingCount}`);
console.log(`Total Audio Audited: ${totalAudio} | Missing: ${missingAudio}`);
console.log(`Total Transitions Audited: ${totalTrans} | Missing: ${missingTrans}`);
