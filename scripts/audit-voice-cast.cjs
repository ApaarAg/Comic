const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../public/assets/audio/voices/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log('Total records in voice manifest:', manifest.records.length);

const approvedCasting = {
  narrator: { name: 'George', provider: 'ElevenLabs', voiceId: 'JBFqnCBsd6RMkjVDRZzb' },
  death: { name: 'Lily', provider: 'ElevenLabs', voiceId: 'pFZP5JQG7iQjIQuC4Bku' },
  laila: { name: 'Alice', provider: 'ElevenLabs', voiceId: 'Xb7hH8MSUJpSbSDYk0k2' },
  munmun: { name: 'Jessica', provider: 'ElevenLabs', voiceId: 'cgSgspJ2msm6clMCkdW9' },
  agni: { name: 'Brian / Agni', provider: 'Approved Audition', voiceId: 'nPczCjzI2devNBz1zQrb' },
  god: { name: 'Daniel / God', provider: 'Approved Audition', voiceId: 'onwK4e9ZLuTAKqWW03F9' },
  mrs_shah: { name: 'Mrs. Shah', provider: 'Approved Audition' },
  driver: { name: 'Driver', provider: 'Approved Audition' },
  dhiraj: { name: 'Dhiraj', provider: 'Approved Audition' },
  guard: { name: 'Security Guard', provider: 'Approved Audition' },
  pranah: { name: 'Pranah', provider: 'Approved Audition' },
};

const results = [];
let missingFiles = 0;
let genericTtsCount = 0;

for (const rec of manifest.records) {
  const fullPath = path.join(__dirname, '../public', rec.audioPath);
  const exists = fs.existsSync(fullPath);
  const stats = exists ? fs.statSync(fullPath) : null;
  const isGeneric = rec.audioPath.includes('edge') || rec.audioPath.includes('fallback');
  if (!exists) missingFiles++;
  if (isGeneric) genericTtsCount++;

  results.push({
    id: rec.id,
    character: rec.character,
    speaker: rec.speaker,
    audioPath: rec.audioPath,
    exists,
    sizeBytes: stats ? stats.size : 0,
    durationMs: rec.durationMs,
    emotion: rec.emotion,
  });
}

console.log('\n--- AUDIT SUMMARY ---');
console.log('Total Audio Takes Audited:', results.length);
console.log('Physically Present on Disk:', results.filter((r) => r.exists).length);
console.log('Missing Audio Files:', missingFiles);
console.log('Generic / Browser TTS Detected:', genericTtsCount);

// Group by character
const byChar = {};
results.forEach((r) => {
  byChar[r.character] = (byChar[r.character] || 0) + 1;
});
console.log('\n--- Breakdown by Character ---');
console.table(byChar);

// Save full mapping audit to file
fs.writeFileSync(
  path.join(__dirname, 'voice-audit-results.json'),
  JSON.stringify(results, null, 2),
);
console.log('Wrote voice-audit-results.json');
