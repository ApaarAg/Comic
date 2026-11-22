# Graph Report - Comic-main  (2026-11-22)

## Corpus Check
- Large corpus: 572 files · ~286,447 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1346 nodes · 2865 edges · 82 communities (71 shown, 11 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 163 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Cinematic Refinement Verification
- Scene Audio & Ambience Architecture
- Cinematic Score & Leitmotif Synthesis
- React Viewport & Comic Animation
- Instrument Synthesis & Audio DSP
- Audit & Analysis Diagnostics
- Voice Playback & Speech Synchronization
- Voice Manifest Inventory
- Three.js Shaders & Scene Transitions
- Application Lifecycle & UI Shell
- Character Voice Player Engine
- TTS Generation & Line Catalogue
- Narration Manifest & Canonical Mapping
- GenAI & Voice Audition Pipeline
- Story Timeline & Narrative Engine Tests
- Build Audio Assets.Mjs Subsystem
- Packageon Subsystem
- Test Audio Scroll Lifecycle
- Qa Content Discrepancy Subsystem
- Canonicalaudiomanifest Subsystem
- Validate Readability Audit
- Dependencies Subsystem
- Sv430 Chapter Audit Subsystem
- Record Mobile Journey Subsystem
- Reproduce Audio Sync Issues
- Sv430 Post Audit Subsystem
- Verify Sv426 Subsystem
- Capture Polish Screenshots
- Capture Readability Screenshot
- Verify Scene01 And Integration
- Verify Scene05 Visuals Subsystem
- Audit Panel Metrics Subsystem
- Tsconfigon Subsystem
- Check Tops Subsystem
- Test Stage2 Cdp Subsystem
- Test Storyverse 3 0 E2E Subsystem
- Verify Storyverse 3 1 Subsystem
- Capture Pacing Screenshot
- Run Browser Qa Subsystem
- Express@^4.21.2 Subsystem
- Build Scene Videos.Mjs Subsystem
- Compare Metrics Subsystem
- Trace Investigation Subsystem
- Analyze Empirical Audit Subsystem
- Measure Narration Durations
- Audit Brian Narration Subsystem
- Debug S10 Subsystem
- Capture Bugfix Screenshot
- Test Pacing Audio Subsystem
- Test Release Candidate Prod
- Test Storyverse 4 0 Suite
- Verify Final Pre Deployment
- Verify Opening Canvas Narratio
- Verify Reader Brian Narration
- Scripts Subsystem
- Diagnose Character Voices
- Json Subsystem
- Inspect P13 15 Subsystem
- Audit Text Completeness Subsystem
- Generate Narrator Auditions
- Test Opening Pause Resume
- Test Scroll Audio Events Subsystem
- Test Word Sync And Replay
- Generate Additional Production
- Generate Brian Full Narration
- Verify All Produced Audio
- Vercelon Subsystem
- Generate Brian Pacing Audition
- Test Narrator And Samples
- Videomanifest Subsystem
- Manifeston Subsystem
- Run Prod E2E Subsystem
- Project Overview Subsystem
- Textcompletenessaudit Subsystem
- Veovideoprompts Subsystem
- Voicecastingroster Subsystem
- Voiceperformanceplan Subsystem

## God Nodes (most connected - your core abstractions)
1. `SceneAudioManager` - 53 edges
2. `CharacterVoicePlayer` - 38 edges
3. `react` - 30 edges
4. `clamp01()` - 29 edges
5. `StereoTrack` - 28 edges
6. `CinematicViewportStage` - 26 edges
7. `StereoTrack` - 25 edges
8. `App()` - 25 edges
9. `InspectedPanelData` - 24 edges
10. `SceneVideoBackdrop()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `verifyRefinement()` --calls--> `computePrologueVisualState()`  [EXTRACTED]
  scripts/verify-cinematic-refinement.ts → src/story/scrollMath.ts
- `CinematicViewportStageProps` --references--> `ResolvedVisualState`  [EXTRACTED]
  src/components/CinematicViewportStage.tsx → src/story/storyTimeline.ts
- `SceneProps` --references--> `InspectedPanelData`  [EXTRACTED]
  src/components/scenes/Scene01Mumbai.tsx → src/components/PanelInspectorModal.tsx
- `debugSamples()` --calls--> `generateTarget()`  [EXTRACTED]
  scripts/test-samples-debug.ts → scripts/generate-voices.ts
- `App()` --calls--> `Scene02Traffic`  [EXTRACTED]
  src/App.tsx → src/components/scenes/Scene02Traffic.tsx

## Import Cycles
- None detected.

## Communities (82 total, 11 thin omitted)

### Community 0 - "Cinematic Refinement Verification"
Cohesion: 0.07
Nodes (51): __dirname, __filename, ROOT_DIR, verifyRefinement(), AMBIENCE_PATHS, MOTIF_PATHS, run(), SCORE_PATHS (+43 more)

### Community 1 - "Scene Audio & Ambience Architecture"
Cohesion: 0.08
Nodes (14): AudioProductionArchitecture, AMBIENCE_SOURCES, AmbienceTrackId, AudioMixerSnapshot, MOOD_TO_AMBIENCE, MOTIF_SOURCES, MotifId, SceneAudioManager (+6 more)

### Community 2 - "Cinematic Score & Leitmotif Synthesis"
Cohesion: 0.14
Nodes (47): compMotifDeathBrass(), compMotifDeathSuspended(), compMotifLailaFragile(), compMotifLailaResolved(), compMotifStoryverseFull(), compMotifStoryverseMinimal(), compMotifTransformationRadiant(), compScene01A() (+39 more)

### Community 3 - "React Viewport & Comic Animation"
Cohesion: 0.19
Nodes (32): lucide-react, react, CharacterAnimator(), CinematicViewportStage, ComicPanel(), ComicPanelProps, InteractiveHotspot(), InteractiveHotspotProps (+24 more)

### Community 4 - "Instrument Synthesis & Audio DSP"
Cohesion: 0.20
Nodes (35): addBansuriPhrase(), addCelestialBell(), addChoirPad(), addIndianDrone(), addLowBrassSwell(), addPercussionHit(), addPianoNote(), addStringsChord() (+27 more)

### Community 5 - "Audit & Analysis Diagnostics"
Cohesion: 0.06
Nodes (26): analysis, data, fs, path, viewports, counts, fs, panelMetadata (+18 more)

### Community 6 - "Voice Playback & Speech Synchronization"
Cohesion: 0.11
Nodes (30): AudioSynchronizationSystem, VoiceActingBible, gsap, characterVoicePlayer, VoiceAssetState, VoiceCancellationReason, VoiceEventLifecycle, VoicePlaybackCallbacks (+22 more)

### Community 7 - "Voice Manifest Inventory"
Cohesion: 0.09
Nodes (22): availableCount, generatedAt, records, totalLines, dialogueChars, narrationChars, CdpConnection, delay() (+14 more)

### Community 8 - "Three.js Shaders & Scene Transitions"
Cohesion: 0.08
Nodes (23): three@^0.187.0, three, CinematicTransitionProps, KIND_INDEX, loadThree(), EntryVeilProps, OPENING_PASSAGE_WORDS, PROLOGUE_MOTES (+15 more)

### Community 9 - "Application Lifecycle & UI Shell"
Cohesion: 0.11
Nodes (27): App(), getPrefersReducedMotion(), PanelInspectorModal, Scene03Party, Scene04DeathsWorld, Scene05TwoEvents, Scene06LailaMortal, Scene07Hospital (+19 more)

### Community 11 - "TTS Generation & Line Catalogue"
Cohesion: 0.11
Nodes (24): msedge-tts@^2.1.1, msedge-tts, buildCompleteLineCatalogue(), CharacterVoiceProfile, checkCredentials(), CredentialStatus, __dirname, __filename (+16 more)

### Community 12 - "Narration Manifest & Canonical Mapping"
Cohesion: 0.10
Nodes (19): NarrationRefinement, CANONICAL_MAPPING, CanonicalEntry, __dirname, __filename, ROOT_DIR, __dirname, __filename (+11 more)

### Community 13 - "GenAI & Voice Audition Pipeline"
Cohesion: 0.11
Nodes (14): @google/genai@^2.4.0, dotenv, @google/genai, AUDITION_DIR, ELEVEN_CANDIDATES, PASSAGES, AUDITION_DIR, generateElevenKabeer() (+6 more)

### Community 14 - "Story Timeline & Narrative Engine Tests"
Cohesion: 0.12
Nodes (19): BubbleAnchorSide, CharacterExpression, AudioBusPriority, AudioCueEvent, AudioPlaybackLatchState, CameraCoordinates, EmbeddedSpeechBubble, InterruptionPolicy (+11 more)

### Community 15 - "Build Audio Assets.Mjs Subsystem"
Cohesion: 0.09
Nodes (10): OUT_DIR, NUM_SAMPLES, OUT_DIR, ACTING_BIBLE, ActingDirection, AUDITION_LINE_IDS, OUT_DIR, VOICE_ID_MAP (+2 more)

### Community 16 - "Packageon Subsystem"
Cohesion: 0.12
Nodes (23): devDependencies, autoprefixer@^10.4.21, esbuild@^0.28.2, tailwindcss@^4.3.3, tsx@^4.21.0, @types/express@^4.17.21, @types/node@^22.14.0, @types/react@^19.3.0 (+15 more)

### Community 17 - "Test Audio Scroll Lifecycle"
Cohesion: 0.12
Nodes (17): assert, CdpClient, delay(), fs, getJson(), http, main(), os (+9 more)

### Community 18 - "Qa Content Discrepancy Subsystem"
Cohesion: 0.09
Nodes (17): allSequenceLines, allUniqueAudio, dialogueLinesOnly, __dirname, __filename, manifest, manifestPath, narratorLinesInSequences (+9 more)

### Community 19 - "Canonicalaudiomanifest Subsystem"
Cohesion: 0.14
Nodes (15): CanonicalAudioManifest, dialogueMap, narrationMap, __dirname, __filename, ROOT_DIR, CHAPTER_DIALOGUE_SEQUENCES, CharacterStyleMeta (+7 more)

### Community 20 - "Validate Readability Audit"
Cohesion: 0.13
Nodes (15): BEATS_BY_SCENE, CdpClient, delay(), fs, getJson(), http, main(), os (+7 more)

### Community 21 - "Dependencies Subsystem"
Cohesion: 0.10
Nodes (21): dependencies, dotenv@^17.2.3, gsap@^3.15.1, howler@^2.2.4, lenis@^1.3.27, lucide-react@^0.546.0, motion@^12.23.24, react@^19.0.1 (+13 more)

### Community 22 - "Sv430 Chapter Audit Subsystem"
Cohesion: 0.13
Nodes (14): AUDIT_STOPS, CdpClient, delay(), fs, getJson(), http, main(), os (+6 more)

### Community 23 - "Record Mobile Journey Subsystem"
Cohesion: 0.17
Nodes (12): CdpConnection, delay(), encodeFramesToWebm(), fetchJson(), fs, http, path, runMobileAudit() (+4 more)

### Community 24 - "Reproduce Audio Sync Issues"
Cohesion: 0.13
Nodes (14): assert, CdpClient, delay(), fs, getJson(), http, os, path (+6 more)

### Community 25 - "Sv430 Post Audit Subsystem"
Cohesion: 0.14
Nodes (13): CdpClient, delay(), fs, getJson(), http, main(), os, path (+5 more)

### Community 26 - "Verify Sv426 Subsystem"
Cohesion: 0.14
Nodes (13): CdpClient, delay(), fs, getJson(), http, main(), os, path (+5 more)

### Community 27 - "Capture Polish Screenshots"
Cohesion: 0.14
Nodes (13): CdpClient, delay(), fs, getJson(), http, main(), os, path (+5 more)

### Community 28 - "Capture Readability Screenshot"
Cohesion: 0.14
Nodes (13): CdpClient, delay(), fs, getJson(), http, main(), os, path (+5 more)

### Community 29 - "Verify Scene01 And Integration"
Cohesion: 0.14
Nodes (13): CdpClient, delay(), fs, getJson(), http, main(), os, path (+5 more)

### Community 30 - "Verify Scene05 Visuals Subsystem"
Cohesion: 0.14
Nodes (13): CdpClient, delay(), fs, getJson(), http, main(), os, path (+5 more)

### Community 31 - "Audit Panel Metrics Subsystem"
Cohesion: 0.15
Nodes (13): CdpClient, delay(), fs, getJson(), http, main(), os, path (+5 more)

### Community 32 - "Tsconfigon Subsystem"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+9 more)

### Community 33 - "Check Tops Subsystem"
Cohesion: 0.15
Nodes (9): { spawn }, test(), WebSocket, { spawn }, test(), WebSocket, { spawn }, test() (+1 more)

### Community 34 - "Test Stage2 Cdp Subsystem"
Cohesion: 0.22
Nodes (9): CdpClient, delay(), fetchJson(), fs, http, path, run(), { spawn } (+1 more)

### Community 35 - "Test Storyverse 3 0 E2E Subsystem"
Cohesion: 0.22
Nodes (9): CdpClient, delay(), fetchJson(), fs, http, path, runTests(), { spawn } (+1 more)

### Community 36 - "Verify Storyverse 3 1 Subsystem"
Cohesion: 0.23
Nodes (9): CdpClient, delay(), fetchJson(), fs, http, path, runQa(), { spawn } (+1 more)

### Community 37 - "Capture Pacing Screenshot"
Cohesion: 0.22
Nodes (9): CdpConnection, delay(), fetchJson(), fs, http, main(), path, { spawn } (+1 more)

### Community 38 - "Run Browser Qa Subsystem"
Cohesion: 0.24
Nodes (7): CDPClient, __dirname, __filename, ROOT_DIR, runQA(), SCREENSHOTS_DIR, sleep()

### Community 39 - "Express@^4.21.2 Subsystem"
Cohesion: 0.17
Nodes (11): express@^4.21.2, vite@^8.3.0, express, vite, __dirname, getAiClient(), PORT, startServer() (+3 more)

### Community 40 - "Build Scene Videos.Mjs Subsystem"
Cohesion: 0.23
Nodes (8): alreadyValid(), asset(), buildDualLoop(), FORCE, OUT_DIR, preparePlate(), runFfmpeg(), TMP_DIR

### Community 41 - "Compare Metrics Subsystem"
Cohesion: 0.15
Nodes (12): baseline, baselinePath, classShifts, fs, metadata, metadataPath, outPath, path (+4 more)

### Community 42 - "Trace Investigation Subsystem"
Cohesion: 0.21
Nodes (10): assert, delay(), fs, http, main(), evaluate(), send(), path (+2 more)

### Community 43 - "Analyze Empirical Audit Subsystem"
Cohesion: 0.18
Nodes (10): classCount, fs, outPath, panelEvaluations, panelMap, path, raw, rawPath (+2 more)

### Community 44 - "Measure Narration Durations"
Cohesion: 0.24
Nodes (9): delay(), fetchJson(), FILES, fs, http, main(), path, { spawn } (+1 more)

### Community 45 - "Audit Brian Narration Subsystem"
Cohesion: 0.22
Nodes (8): checkHttp(), data, DIR, fs, http, MANIFEST_PATH, path, run()

### Community 46 - "Debug S10 Subsystem"
Cohesion: 0.22
Nodes (8): fs, http, os, path, PROFILE_DIR, { spawn }, test(), WebSocket

### Community 47 - "Capture Bugfix Screenshot"
Cohesion: 0.27
Nodes (8): delay(), fetchJson(), fs, http, path, run(), { spawn }, WebSocket

### Community 48 - "Test Pacing Audio Subsystem"
Cohesion: 0.27
Nodes (8): delay(), fetchJson(), fs, http, path, run(), { spawn }, WebSocket

### Community 49 - "Test Release Candidate Prod"
Cohesion: 0.27
Nodes (8): delay(), fetchJson(), fs, http, path, run(), { spawn }, WebSocket

### Community 50 - "Test Storyverse 4 0 Suite"
Cohesion: 0.27
Nodes (8): delay(), fetchJson(), fs, http, path, run(), { spawn }, WebSocket

### Community 51 - "Verify Final Pre Deployment"
Cohesion: 0.27
Nodes (8): delay(), fetchJson(), fs, http, path, run(), { spawn }, WebSocket

### Community 52 - "Verify Opening Canvas Narratio"
Cohesion: 0.27
Nodes (8): delay(), fetchJson(), fs, http, main(), path, { spawn }, WebSocket

### Community 53 - "Verify Reader Brian Narration"
Cohesion: 0.27
Nodes (8): delay(), fetchJson(), fs, http, main(), path, { spawn }, WebSocket

### Community 54 - "Scripts Subsystem"
Cohesion: 0.22
Nodes (9): scripts, build, clean, dev, lint, preview, start, test (+1 more)

### Community 55 - "Diagnose Character Voices"
Cohesion: 0.25
Nodes (8): checkHttp(), dialogueRecords, fs, http, manifest, manifestPath, path, runDiagnostic()

### Community 56 - "Json Subsystem"
Cohesion: 0.46
Nodes (4): main(), parse_mp3(), parse_wav(), verify_file()

### Community 57 - "Inspect P13 15 Subsystem"
Cohesion: 0.25
Nodes (7): dir, files, fs, meta, metaPath, path, ROOT

### Community 58 - "Audit Text Completeness Subsystem"
Cohesion: 0.25
Nodes (6): ALL_DIALOGUE_LINES, __dirname, __filename, PanelTextItem, ROOT_DIR, ScenePanelAudit

### Community 59 - "Generate Narrator Auditions"
Cohesion: 0.36
Nodes (7): AUDITION_DIR, GEMINI_CANDIDATES, generateElevenBrian(), generateGeminiCandidate(), main(), PASSAGES, pcmToWav()

### Community 60 - "Test Opening Pause Resume"
Cohesion: 0.36
Nodes (6): delay(), fetchJson(), http, run(), { spawn }, WebSocket

### Community 61 - "Test Scroll Audio Events Subsystem"
Cohesion: 0.36
Nodes (6): delay(), fetchJson(), http, run(), { spawn }, WebSocket

### Community 62 - "Test Word Sync And Replay"
Cohesion: 0.36
Nodes (6): delay(), fetchJson(), http, run(), { spawn }, WebSocket

### Community 63 - "Generate Additional Production"
Cohesion: 0.38
Nodes (6): __dirname, __filename, main(), ROOT_DIR, synthesizeEdge(), synthesizeEleven()

### Community 64 - "Generate Brian Full Narration"
Cohesion: 0.33
Nodes (6): AUDITION_DIR, generateTrack(), main(), NARRATION_SPECS, NarrationSpec, NARRATOR_DIR

### Community 65 - "Verify All Produced Audio"
Cohesion: 0.29
Nodes (5): __dirname, __filename, MANIFEST_PATH, ROOT_DIR, VOICES_DIR

### Community 66 - "Vercelon Subsystem"
Cohesion: 0.29
Nodes (6): buildCommand, cleanUrls, headers, outputDirectory, rewrites, version

### Community 67 - "Generate Brian Pacing Audition"
Cohesion: 0.40
Nodes (5): AUDITION_DIR, generateClip(), main(), PASSAGES, SPEEDS

### Community 68 - "Test Narrator And Samples"
Cohesion: 0.40
Nodes (5): __dirname, __filename, main(), ROOT_DIR, synth()

### Community 69 - "Videomanifest Subsystem"
Cohesion: 0.33
Nodes (5): SCENE_BACKDROP_MAP, SCENE_VIDEOS, SceneBackdropBinding, SceneVideoId, SceneVideoSpec

### Community 70 - "Manifeston Subsystem"
Cohesion: 0.40
Nodes (4): availableCount, generatedAt, records, totalLines

### Community 71 - "Run Prod E2E Subsystem"
Cohesion: 0.60
Nodes (4): delay(), main(), { spawn }, waitForPort()

## Knowledge Gaps
- **10 isolated node(s):** `Project Overview`, `AudioProductionArchitecture`, `VoicePerformancePlan`, `NarrationRefinement`, `CanonicalAudioManifest` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 578 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `runAudit()` connect `Voice Manifest Inventory` to `Story Timeline & Narrative Engine Tests`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **What connects `Project Overview`, `AudioProductionArchitecture`, `VoicePerformancePlan` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Cinematic Refinement Verification` be split into smaller, more focused modules?**
  _Cohesion score 0.0672316384180791 - nodes in this community are weakly interconnected._
- **Why does `dotenv` connect `GenAI & Voice Audition Pipeline` to `Generate Brian Full Narration`, `Verify All Produced Audio`, `Generate Brian Pacing Audition`, `Test Narrator And Samples`, `Express@^4.21.2 Subsystem`, `TTS Generation & Line Catalogue`, `Build Audio Assets.Mjs Subsystem`, `Packageon Subsystem`, `Qa Content Discrepancy Subsystem`, `Canonicalaudiomanifest Subsystem`, `Dependencies Subsystem`, `Generate Narrator Auditions`, `Generate Additional Production`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `Scene Audio & Ambience Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.08395989974937343 - nodes in this community are weakly interconnected._
- **Why does `SceneAudioManager` connect `Scene Audio & Ambience Architecture` to `Cinematic Refinement Verification`, `Three.js Shaders & Scene Transitions`, `React Viewport & Comic Animation`, `Voice Playback & Speech Synchronization`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `Cinematic Score & Leitmotif Synthesis` be split into smaller, more focused modules?**
  _Cohesion score 0.13570391872278664 - nodes in this community are weakly interconnected._