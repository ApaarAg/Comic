import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENE_NARRATION_BEATS } from '../src/narrative/narrativeManifest';
import { CHAPTER_DIALOGUE_SEQUENCES } from '../src/story/dialogueManifest';
import { REQUIRED_VOICE_ASSETS } from '../src/story/voiceManifest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function main() {
  console.log('======================================================');
  console.log(' STORYVERSE — ELEVENLABS CREDENTIALS & ASSET AUDIT');
  console.log('======================================================\n');

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('[ERROR] ELEVENLABS_API_KEY is missing in .env!');
    process.exit(1);
  }

  console.log(`[1] API Key detected: ${apiKey.slice(0, 6)}...${apiKey.slice(-4)} (length: ${apiKey.length})`);

  // Check User / Subscription (Optional permission: user_read)
  try {
    const subRes = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
      headers: { 'xi-api-key': apiKey },
    });
    if (subRes.ok) {
      const sub = await subRes.json();
      console.log(`[OK] ElevenLabs Subscription:`);
      console.log(`     Tier:            ${sub.tier}`);
      console.log(`     Characters used: ${sub.character_count} / ${sub.character_limit}`);
      console.log(`     Can extend:      ${sub.can_extend_character_limit}`);
      console.log(`     Reset date:      ${new Date(sub.next_character_count_reset_unix * 1000).toISOString()}`);
    } else {
      console.log(`[INFO] Subscription endpoint skipped (${subRes.status}): API key is scoped without user_read permission.`);
    }
  } catch (err: any) {
    console.log('[INFO] Subscription endpoint error:', err.message);
  }

  // Fetch Available Voices (voices_read)
  let voices: any[] = [];
  try {
    const voicesRes = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
    });
    if (!voicesRes.ok) {
      console.error(`[WARN] Voices fetch failed (${voicesRes.status}):`, await voicesRes.text());
    } else {
      const vdata = await voicesRes.json();
      voices = vdata.voices || [];
      console.log(`\n[2] Available Voices in ElevenLabs Account (${voices.length} total):`);
      for (const v of voices) {
        const labels = Object.entries(v.labels || {})
          .map(([k, val]) => `${k}=${val}`)
          .join(', ');
        console.log(`     • [${v.voice_id}] "${v.name}" (${v.category || 'premade'}) -> ${labels || 'no labels'}`);
      }
    }
  } catch (err: any) {
    console.error('[ERROR] Network error fetching voices:', err.message);
  }

  // Verify the 48 dialogue entries in manifest.json
  console.log('\n[3] Auditing Manifest Entries (public/assets/audio/voices/manifest.json)...');
  const manifestPath = path.resolve(ROOT_DIR, 'public/assets/audio/voices/manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('[ERROR] manifest.json does not exist!');
    process.exit(1);
  }

  const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const records: any[] = manifestData.records || [];
  console.log(`     Manifest record count: ${records.length}`);

  let errors = 0;
  const narrationRecords = records.filter((r) => r.category === 'narration');
  const dialogueRecords = records.filter((r) => r.category === 'dialogue');

  console.log(`     - Narration records: ${narrationRecords.length}`);
  console.log(`     - Dialogue records:  ${dialogueRecords.length}`);

  // Cross-reference with SCENE_NARRATION_BEATS
  for (const beat of SCENE_NARRATION_BEATS) {
    const rec = records.find((r) => r.id === beat.id);
    if (!rec) {
      console.error(`     [FAIL] Narration beat ${beat.id} missing in manifest!`);
      errors++;
    } else {
      if (rec.transcript.trim() !== beat.text.trim()) {
        console.error(`     [FAIL] Transcript mismatch in ${beat.id}`);
        errors++;
      }
      if (rec.characterId !== 'narrator') {
        console.error(`     [FAIL] Speaker mismatch in ${beat.id}: expected narrator, got ${rec.characterId}`);
        errors++;
      }
    }
  }

  // Cross-reference with CHAPTER_DIALOGUE_SEQUENCES & REQUIRED_VOICE_ASSETS
  for (const line of REQUIRED_VOICE_ASSETS) {
    const rec = records.find((r) => r.id === line.lineId);
    if (!rec) {
      console.error(`     [FAIL] Dialogue line ${line.lineId} missing in manifest!`);
      errors++;
    } else {
      if (rec.transcript.trim() !== line.transcript.trim()) {
        console.error(`     [FAIL] Transcript mismatch in ${line.lineId}`);
        errors++;
      }
      if (rec.characterId !== line.character) {
        console.error(`     [FAIL] Speaker mismatch in ${line.lineId}: expected ${line.character}, got ${rec.characterId}`);
        errors++;
      }
    }
  }

  if (errors === 0) {
    console.log('     [OK] All 48 entries validated with 100% speaker & transcript accuracy!');
  } else {
    console.error(`     [FAIL] Encountered ${errors} validation errors in manifest.`);
  }

  // Write a JSON dump of available voices for profile selection
  const voiceDumpPath = path.resolve(__dirname, 'available-voices.json');
  fs.writeFileSync(voiceDumpPath, JSON.stringify(voices, null, 2));
  console.log(`\nDumped available voices to ${path.relative(ROOT_DIR, voiceDumpPath)}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
