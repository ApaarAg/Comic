import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const VOICES_DIR = path.resolve(ROOT_DIR, 'public/assets/audio/voices');
const MANIFEST_PATH = path.join(VOICES_DIR, 'manifest.json');

async function main() {
  console.log('======================================================');
  console.log(' STORYVERSE — COMPLETE AUDIO PRODUCTION VERIFICATION');
  console.log('======================================================\n');

  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifest not found at ${MANIFEST_PATH}`);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const records = manifest.records || [];
  console.log(`Manifest contains ${records.length} total records.`);

  let existCount = 0;
  let totalBytes = 0;
  const missingFiles: string[] = [];
  const smallFiles: string[] = [];
  const characterStats: Record<string, { count: number; totalBytes: number }> = {};
  const sceneStats: Record<string, number> = {};

  for (const r of records) {
    const fullPath = path.resolve(ROOT_DIR, 'public', r.audioPath.replace(/^\//, ''));
    const exists = fs.existsSync(fullPath);
    const size = exists ? fs.statSync(fullPath).size : 0;

    characterStats[r.characterId] = characterStats[r.characterId] || { count: 0, totalBytes: 0 };
    characterStats[r.characterId].count++;
    characterStats[r.characterId].totalBytes += size;

    sceneStats[r.sceneId] = (sceneStats[r.sceneId] || 0) + 1;

    if (!exists) {
      missingFiles.push(`[${r.characterId}] ${r.id}: ${r.audioPath}`);
    } else if (size < 1000) {
      smallFiles.push(`[${r.characterId}] ${r.id}: ${r.audioPath} (${size} B)`);
    } else {
      existCount++;
      totalBytes += size;
    }
  }

  console.log(`\nFiles verified on disk: ${existCount} / ${records.length}`);
  console.log(`Total audio payload size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

  console.log('\n--- BREAKDOWN BY CHARACTER ---');
  for (const [char, s] of Object.entries(characterStats)) {
    console.log(`- ${char.padEnd(12)}: ${s.count} files (${(s.totalBytes / 1024).toFixed(1)} KB)`);
  }

  console.log('\n--- BREAKDOWN BY SCENE ---');
  for (const [scene, count] of Object.entries(sceneStats)) {
    console.log(`- ${scene.padEnd(10)}: ${count} audio cues`);
  }

  if (missingFiles.length > 0) {
    console.error('\n[!] MISSING FILES:');
    for (const m of missingFiles) console.error(`  - ${m}`);
  }

  if (smallFiles.length > 0) {
    console.error('\n[!] FILES SUSPICIOUSLY SMALL (<1KB):');
    for (const s of smallFiles) console.error(`  - ${s}`);
  }

  // HTTP Playback Check via Local Dev Server
  console.log('\n--- VERIFYING HTTP SERVING VIA DEV SERVER (http://localhost:3000) ---');
  let httpSuccess = 0;
  let httpFail = 0;

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const url = `http://localhost:3000${r.audioPath}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        httpSuccess++;
      } else {
        console.error(`  FAIL HTTP ${res.status}: ${url}`);
        httpFail++;
      }
    } catch (e: any) {
      console.error(`  FETCH ERROR: ${url} - ${e.message}`);
      httpFail++;
    }
  }

  console.log(`HTTP check complete: ${httpSuccess} OK / ${httpFail} FAILED`);

  if (missingFiles.length === 0 && smallFiles.length === 0 && httpFail === 0) {
    console.log('\n======================================================');
    console.log(' ALL 48 AUDIO RECORDINGS FULLY VERIFIED ON DISK & HTTP');
    console.log('======================================================\n');
  } else {
    throw new Error(`Audio verification failed: ${missingFiles.length} missing, ${smallFiles.length} small, ${httpFail} HTTP errors.`);
  }
}

main().catch((err) => {
  console.error('Fatal verification error:', err.message);
  process.exit(1);
});
