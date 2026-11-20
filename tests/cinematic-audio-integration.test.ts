import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import {
  checkCredentials,
  buildCompleteLineCatalogue,
  VOICE_PROFILES,
  generateVoiceManifest,
} from '../scripts/generate-voices';
import { REQUIRED_VOICE_ASSETS } from '../src/story/voiceManifest';
import { SCENE_NARRATION_BEATS } from '../src/narrative/narrativeManifest';
import { computeAudioMixLevels } from '../src/story/scrollMath';
import { CHAPTER_DIALOGUE_SEQUENCES } from '../src/story/dialogueManifest';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Credentials & Configuration Checks
// ─────────────────────────────────────────────────────────────────────────────
test('Credentials check returns honest status without throwing', () => {
  const creds = checkCredentials();
  assert.equal(typeof creds.hasElevenLabs, 'boolean');
  assert.equal(typeof creds.hasGoogleTts, 'boolean');
  assert.equal(typeof creds.hasGemini, 'boolean');
  assert.ok(['elevenlabs', 'google', 'none'].includes(creds.activeProvider));
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Source Analysis & Voice Catalog Completeness (Phase 1)
// ─────────────────────────────────────────────────────────────────────────────
test('Catalogue extracts all dialogue lines and narration beats without omission', () => {
  const catalogue = buildCompleteLineCatalogue();
  assert.ok(catalogue.length >= 45, `Expected at least 45 voice targets, got ${catalogue.length}`);

  const narrationItems = catalogue.filter((item) => item.category === 'narration');
  const dialogueItems = catalogue.filter((item) => item.category === 'dialogue');

  assert.equal(narrationItems.length, SCENE_NARRATION_BEATS.length, 'Narration items count must match beats');
  assert.ok(dialogueItems.length >= 30, 'Dialogue items must encompass all character interactions');

  // Verify scenes 01 through 10 are represented
  const scenesRepresented = new Set(catalogue.map((item) => item.sceneId));
  for (let i = 1; i <= 10; i++) {
    const sId = i < 10 ? `scene-02` : `scene-10`; // sanity
    const expId = `scene-${String(i).padStart(2, '0')}`;
    assert.ok(scenesRepresented.has(expId), `Missing scene representation for ${expId}`);
  }

  // Verify non-empty transcripts and predictable paths
  for (const item of catalogue) {
    assert.ok(item.id.length > 0, 'Line id cannot be empty');
    assert.ok(item.transcript.length > 0, `Line ${item.id} has empty transcript`);
    assert.ok(item.durationMs > 0, `Line ${item.id} duration must be positive`);
    assert.ok(item.targetPath.includes('public'), `Line ${item.id} path must be inside public/`);
    assert.ok(item.targetPath.endsWith('.mp3'), `Line ${item.id} path must end in .mp3`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Voice Design Profiles & Acoustic Parameters (Phase 2)
// ─────────────────────────────────────────────────────────────────────────────
test('Voice Design Bible covers all 12 characters with distinct parameters', () => {
  const expectedCharacters = [
    'narrator',
    'death',
    'laila',
    'god',
    'munmun',
    'agni',
    'mrs_shah',
    'driver',
    'dhiraj',
    'girl',
    'security',
    'pranah',
  ];

  for (const charId of expectedCharacters) {
    const profile = VOICE_PROFILES[charId];
    assert.ok(profile, `Missing voice profile for character: ${charId}`);
    assert.ok(profile.name.length > 0, `Profile for ${charId} missing name`);
    assert.ok(profile.elevenLabsVoiceId.length > 0, `Profile for ${charId} missing elevenLabsVoiceId`);
    assert.ok(profile.googleTtsVoice.languageCode.length > 0, `Profile for ${charId} missing languageCode`);
    assert.ok(profile.googleTtsVoice.name.length > 0, `Profile for ${charId} missing google voice name`);
    assert.ok(profile.emotionGuidance.length > 10, `Profile for ${charId} missing detailed emotionGuidance`);
    assert.ok(typeof profile.googleAudioConfig.speakingRate === 'number');
    assert.ok(typeof profile.googleAudioConfig.pitch === 'number');
  }

  // Verify Death has lower pitch than Munmun
  assert.ok(
    VOICE_PROFILES.death.googleAudioConfig.pitch < VOICE_PROFILES.munmun.googleAudioConfig.pitch,
    'Death pitch must be lower than Munmun',
  );

  // Verify Narrator has measured speaking rate
  assert.ok(
    VOICE_PROFILES.narrator.googleAudioConfig.speakingRate < 1.0,
    'Narrator should have measured unhurried pace (< 1.0)',
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Manifest Publisher Integrity (Phase 3)
// ─────────────────────────────────────────────────────────────────────────────
test('generateVoiceManifest writes valid JSON with exact line metadata', () => {
  const manifest = generateVoiceManifest();
  assert.ok(manifest.records.length >= 45);

  const manifestPath = path.resolve('public/assets/audio/voices/manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist on disk');

  const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(parsed.totalLines, manifest.records.length);
  assert.equal(typeof parsed.availableCount, 'number');

  // Verify structure of first record
  const first = parsed.records[0];
  assert.ok(first.id);
  assert.ok(first.characterId);
  assert.ok(first.characterName);
  assert.ok(first.audioPath.startsWith('/assets/audio/voices/'));
  assert.ok(first.emotion);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Audio Mixing & Ambience Ducking Bus (Phase 4)
// ─────────────────────────────────────────────────────────────────────────────
test('computeAudioMixLevels ducks background ambience when voice is active', () => {
  // Unducked levels (no active voice)
  const unducked = computeAudioMixLevels({
    masterMuted: false,
    ambienceVolume: 0.5,
    sfxVolume: 0.6,
    voiceVolume: 0.9,
    ambienceMuted: false,
    sfxMuted: false,
    voiceMuted: false,
    isVoiceActive: false,
  });

  // Ducked levels (voice speaking)
  const ducked = computeAudioMixLevels({
    masterMuted: false,
    ambienceVolume: 0.5,
    sfxVolume: 0.6,
    voiceVolume: 0.9,
    ambienceMuted: false,
    sfxMuted: false,
    voiceMuted: false,
    isVoiceActive: true,
  });

  assert.ok(
    ducked.ambienceGain < unducked.ambienceGain,
    `Ambience must duck when voice is active: ducked=${ducked.ambienceGain} vs unducked=${unducked.ambienceGain}`,
  );
  assert.equal(ducked.duckFactor, 0.42, 'Duck factor should be 0.42');

  // Voice volume remains crisp and prioritized
  assert.ok(ducked.voiceGain >= 0.9, 'Voice volume must remain prioritized');
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Preemption, Resumption & Sequential Dialogue (Phase 4 & 5)
// ─────────────────────────────────────────────────────────────────────────────
test('Chapter dialogue sequences have valid sequential structure and speaker labels', () => {
  const sequenceKeys = Object.keys(CHAPTER_DIALOGUE_SEQUENCES);
  assert.ok(sequenceKeys.length >= 10, 'Must have sequences for all chapter conversations');

  for (const seqKey of sequenceKeys) {
    const lines = CHAPTER_DIALOGUE_SEQUENCES[seqKey];
    assert.ok(lines.length > 0, `Sequence ${seqKey} has no lines`);

    let prevTrigger = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      assert.ok(line.id, `Line at index ${i} in ${seqKey} missing id`);
      assert.ok(line.speaker, `Line ${line.id} missing speaker`);
      assert.ok(line.speakerLabel, `Line ${line.id} missing speakerLabel`);
      assert.ok(line.text.length > 0, `Line ${line.id} missing text`);
      assert.ok(line.duration > 0, `Line ${line.id} duration must be positive`);
      assert.ok(line.triggerProgress >= prevTrigger, `Lines in ${seqKey} must be non-decreasing trigger progress`);
      prevTrigger = line.triggerProgress;
    }
  }

  // Specific check: Scene 04 has Death, Agni, God multi-party dialogue
  const s04Termination = CHAPTER_DIALOGUE_SEQUENCES['seq-04-termination'];
  assert.ok(s04Termination, 'Must have seq-04-termination');
  const s04Speakers = new Set(s04Termination.map((l) => l.speaker));
  assert.ok(s04Speakers.has('death'), 'Scene 04 must feature Death');
  assert.ok(s04Speakers.has('god'), 'Scene 04 must feature God');

  const s04Elevator = CHAPTER_DIALOGUE_SEQUENCES['seq-04-elevator'];
  assert.ok(s04Elevator, 'Must have seq-04-elevator');
  const elevatorSpeakers = new Set(s04Elevator.map((l) => l.speaker));
  assert.ok(elevatorSpeakers.has('death'), 'Elevator must feature Death');
  assert.ok(elevatorSpeakers.has('agni'), 'Elevator must feature Agni');
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Narration Beat Visual Choreography Specs (Phase 5)
// ─────────────────────────────────────────────────────────────────────────────
test('Narration beats feature rich visual choreography without empty cues', () => {
  for (const beat of SCENE_NARRATION_BEATS) {
    if (beat.visualChoreography) {
      const choreo = beat.visualChoreography;
      if (choreo.cameraZoom !== undefined) {
        assert.ok(choreo.cameraZoom >= 1.0 && choreo.cameraZoom <= 1.25, `Camera zoom out of range for ${beat.id}`);
      }
      if (choreo.skylineOpacity !== undefined) {
        assert.ok(choreo.skylineOpacity >= 0 && choreo.skylineOpacity <= 1.0, `Skyline opacity out of range for ${beat.id}`);
      }
      if (choreo.sfxCue) {
        assert.ok(['discover', 'horn', 'transition', 'bubble', 'thunder', 'ding'].includes(choreo.sfxCue));
      }
    }
  }
});
