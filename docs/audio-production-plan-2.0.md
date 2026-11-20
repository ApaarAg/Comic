# STORYVERSE — AUDIO EXPERIENCE 2.0 PRODUCTION PLAN
## Voice Acting, Cinematic Sound Design, and Narrator Audition Suite

---

### Executive Summary

Storyverse Audio Experience 2.0 upgrades the audio from functional TTS playback into an authored cinematic graphic novel experience. Rather than applying superficial volume filters or regenerating all 48 manifest recordings blindly, this release introduces:

1. **Narrator Audition Suite**: 5 new candidate voices auditioned across 3 iconic passages (Passages A, B, and C) alongside the baseline Prabhat recording.
2. **Character Voice Acting Bible**: 34 dialogue lines directed line-by-line with emotional states, vocal cues, pauses, dynamic range, and per-line ElevenLabs acoustic hyperparameter profiles.
3. **Emotional Acting Auditions**: 9 high-stakes character dialogue auditions contrasting flat reading with intense, multi-layered dramatic performances.
4. **10 Bespoke Scene Soundscapes**: 12-second seamless procedural audio soundscapes replacing generic 4-second loops, integrated with 2.5s crossfading and smart voice-ducking.
5. **Streamlined Cinematic Controls**: The prominent floating "Sound On/Off" button has been removed from the header and entry veil, relocating master volume and mute controls cleanly inside the dedicated audio mixer popover.
6. **Interactive Audition Player**: A standalone dark-mode audition web console at `http://localhost:3000/audio-experience-audition.html` featuring side-by-side A/B player controls, soundscape previews, and the full Voice Acting Bible.

> [!IMPORTANT]
> **Production Safety Lock**: No full-chapter recordings will be regenerated until you have auditioned the candidates on the audition page and given explicit approval for the selected Narrator voice, acting directions, and soundscapes.

---

### Phase 1 — Narrator Replacement Audition & Evaluation

The previous narrator (`en-IN-PrabhatNeural` via Microsoft Edge TTS) exhibited noticeable synthetic artifacts, unnatural cadence, and a thin, robotic timbre. We investigated three primary TTS architectures:
- **Google Gemini 2.5 Flash TTS (`gemini-2.5-flash-preview-tts`)**: Next-generation neural speech model delivering studio-grade 24kHz PCM audio with natural human breathing, organic prosody, and authentic inflection.
- **ElevenLabs Premier Neural Voice Engine**: Deep cinematic baritones featuring configurable stability, similarity, and dramatic style exaggeration.
- **Microsoft Edge/Azure TTS**: Evaluated as the legacy baseline.

#### Audition Passages

- **Passage A (Scene 01 — Opening Worldbuilding)**:  
  *"This is the city of Bombay. In the state of Maharashtra. In the country of India. It has other names too, of course. All of them mean the same thing. This is a city of sixteen million gods. And nearly as many mortals."*
- **Passage B (Scene 04 — Reflective Existential Lore)**:  
  *"There is a department for everything. An office for the rising and the setting of the sun. A bureau for the tides. An agency for the wind. And a woman whose task it has been, since the beginning of all things, to gather the dead."*
- **Passage C (Scene 09 — Dramatic Climactic Impact)**:  
  *"Death comes for us all. Rich and poor. Young and old. But tonight, Death came for a woman in a green saree. And Death was entirely unprepared."*

#### Candidate Voice Comparison Table

| Candidate | Provider / Voice ID | Timbre & Accent | Artifacts / Naturalness | Emotional Weight | Recommendation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Candidate 1: Charon** | **Google Gemini 2.5 Flash TTS** (`Charon`) | Deep, resonant Indian English baritone with natural breath, chest resonance, and authentic cadence | **Exceptional**; imperceptible synthetic artifacts; organic micro-pauses; fluid phrasing | Gravitas, warmth, and cinematic authority suited to Ram V's prose | **★ RECOMMENDED PRIMARY** |
| **Candidate 2: Daniel** | **ElevenLabs** (`onwK4e9ZLuTAKqWW03F9`) | British/International authoritative broadcaster baritone | Very high quality; crisp studio presence; slightly formal/impersonal | Cold authority; lacks distinct Indian cadence | Strong Alternative |
| **Candidate 3: George** | **ElevenLabs** (`JBFqnCBsd6RMkjVDRZzb`) | Textured, gravelly warm baritone with rasp | Warm, textured; minor sibilance at low stability | Contemplative and weathered | Strong Alternative |
| **Candidate 4: Brian** | **ElevenLabs** (`nPczCjzI2devNBz1zQrb`) | Deep, commanding cinematic narrator | Smooth, rich bass resonance | Powerful, dramatic trailer tone | Viable Alternative |
| **Candidate 5: Adam** | **ElevenLabs** (`pNInz6obpgDQGcFmaJgB`) | Conversational, resonant American/global deep baritone | Modern, close-mic; slightly overly familiar | Direct, grounding | Viable Alternative |
| **Baseline: Prabhat** | **Microsoft Edge TTS** (`en-IN-PrabhatNeural`) | Flat, rigid Indian male reading | Severe robotic clipping, mechanical rhythm, flat inflection | Lifeless, hollow | **REPLACED (Unacceptable)** |

#### Recommended Choice: Google Gemini TTS — Charon
**Rationale**: `Charon` produces a deep, natural, authoritative baritone with flawless human breathing cues, authentic cadence for Indian place names (*"Bombay"*, *"Maharashtra"*), and effortless dramatic warmth. It elevates the text into cinematic mythology without sounding like an AI reader.

---

### Phase 2 — Character Voice Acting Bible & Audition Set

Flat dialogue readings have been replaced with a comprehensive **Voice Acting Bible** covering all 34 spoken dialogue lines in Chapter 01 (defined in `src/audio/voiceActingBible.ts` and `docs/voice-acting-bible.md`).

#### Emotional Parameter Tuning Profiles

Rather than static TTS defaults, each line utilizes dynamic hyperparameter profiles:
- **High Emotion / Outrage / Panic**: `stability: 0.20 – 0.25`, `style: 0.65 – 0.80`, `similarity_boost: 0.75 – 0.85`. Allows genuine vocal tremor, pitch spikes, and vocal strain.
- **Deep Despair / Vulnerability / Sobs**: `stability: 0.35 – 0.40`, `style: 0.50 – 0.60`. Slower pace, breath catches, intimate close-mic delivery.
- **Corporate Indifference / Divine Bureaucracy**: `stability: 0.65 – 0.75`, `style: 0.15 – 0.25`. Monotone, unhurried, chillingly casual.

#### Generated Emotional Acting Auditions

The audition suite includes 9 high-stakes acted recordings in `public/assets/audio/auditions/acting/`:

```
1. acting-s04-09-death.mp3       — Death's Outrage: "Replaced?! I am Death! I have walked this earth since..." (Lily · stability 0.22, style 0.70)
2. acting-s04-11-death.mp3       — Death's Vulnerability: "I loved it. Every single moment of it." (Lily · stability 0.38, style 0.50)
3. acting-s07-01-laila.mp3       — Laila's Awakening: "Ugh... where... what is this feeling? Everything... hurts." (Alice · stability 0.28, style 0.60)
4. acting-s08-02-laila.mp3       — Laila's Resistance: "He's just a child, Munmun! How can you ask me to do this?!" (Alice · stability 0.22, style 0.75)
5. acting-s08-01-munmun.mp3      — Munmun's Panic: "Laila, please! You have to do it now! If he lives, everything we know will burn!" (Jessica · stability 0.20, style 0.70)
6. acting-s04-08-god.mp3         — God's Dismissal: "Progress, my dear. The mortals have invented something new. They don't need you anymore." (Adam · stability 0.65, style 0.20)
7. acting-s04-10-god.mp3         — God's Corporate Casualness: "Don't take it personally. It's just... restructuring." (Adam · stability 0.62, style 0.22)
8. acting-s02-01-mrs_shah.mp3    — Mrs. Shah's Labor Panic: "Driver, faster! Can't you see the water has broken?!" (Sarah · stability 0.25, style 0.65)
9. acting-s02-02-driver.mp3      — Driver's Defensive Agitation: "Madam, look at this traffic! Even God cannot fly over the flyover!" (Charlie · stability 0.30, style 0.60)
```

---

### Phase 3 — Scene-Specific Soundscapes (10 Bespoke Audio Designs)

Generic 4-second repetitive loops have been replaced with 10 authored, seamless 12-second soundscapes synthesized and mastered in `public/assets/audio/soundscapes/`. Each track is balanced at `-18 dB LUFS` to ensure zero dialogue masking.

#### Soundscape Inventory

| Scene | File Name | Key Acoustic Elements & Texture | Crossfade Profile |
| :--- | :--- | :--- | :--- |
| **Scene 01** | `scene_01_mumbai.wav` | Sunset skyline warmth, 55Hz coastal breeze, distant low traffic haze | 2.5s gentle crossfade |
| **Scene 02** | `scene_02_traffic.wav` | BKC asphalt drone, diesel vibration, layered horn blasts, traffic whistle | 2.0s urban surge |
| **Scene 03** | `scene_03_party.wav` | Low-pass filtered four-on-the-floor beat, cocktail chatter, clinking glassware | 2.5s interior immersion |
| **Scene 04** | `scene_04_death_world.wav` | 44Hz/88Hz sub-bass celestial drone, vast open-space harmonic shimmer | 3.0s ethereal crossfade |
| **Scene 05** | `scene_05_convergence.wav` | Visceral 64 BPM filtered heartbeat pulse, ascending suspense string drone | 2.0s tense build |
| **Scene 06** | `scene_06_transformation.wav` | Brilliant C# major celestial bell harmonics, cascading ethereal shimmers | 2.5s cosmic release |
| **Scene 07** | `scene_07_hospital.wav` | Sterile clinical AC hum, rhythmic 70 BPM telemetry beeps, distant footsteps | 2.5s cold transition |
| **Scene 08** | `scene_08_escape.wav` | Urgent low-register corridor bass sweep, distressed infant cry, running air | 2.0s pulse transition |
| **Scene 09** | `scene_09_truck.wav` | Relentless torrential rain hiss, deep 38Hz diesel engine rumble, pneumatic air brakes | 2.0s dread buildup |
| **Scene 10** | `scene_10_eight_years_later.wav` | Warm acoustic morning resonance, gentle Indian morning birdsong, ceramic tea cup clinks | 3.0s peaceful resolve |

---

### Phase 4 — Streamlined Controls & Architecture Refinements

1. **Floating Sound Button Removed**:
   - Cleaned from `src/components/EntryVeil.tsx` header and intro screen.
   - Cleaned from `src/components/ChapterChrome.tsx` top navbar.
   - Reader defaults cleanly to `withAudio: true` on entry click.
2. **Unobtrusive Audio Settings**:
   - Dedicated master mute toggle and independent sliders for **Master**, **Voice**, **Soundscape**, and **SFX** are housed neatly inside the top-right Audio Mixer popover (`[data-testid="chrome-mute-toggle"]`).
3. **Engine Integration**:
   - `SceneAudioManager.ts` updated with `MOOD_TO_AMBIENCE` mapping connecting all 10 soundscapes to reader scene states.
   - 2.5-second Howler crossfades and automated -6dB ducking during character speech.

---

### Phase 5 — Interactive Audition Console

To test and review the audio production assets directly:

1. **Launch Audition Suite**: Open your browser to:
   ```
   http://localhost:3000/audio-experience-audition.html
   ```
2. **Narrator Auditions (Section 1)**:
   - Play **Candidate 1 (Google Gemini Charon)**, **Candidate 2 (ElevenLabs Daniel)**, **Candidate 3 (George)**, **Candidate 4 (Brian)**, and **Candidate 5 (Adam)** across Passages A, B, and C.
   - Compare directly against the **Baseline (Prabhat Baritone)**.
3. **Character Voice Acting (Section 2)**:
   - Play all 9 emotional acting moments (Death's outrage, Death's vulnerability, Laila's pain, Munmun's panic, God's corporate coldness, etc.).
4. **Cinematic Soundscapes (Section 3)**:
   - Preview all 10 scene soundscapes with loop toggles.
5. **Voice Acting Bible (Section 4)**:
   - Inspect the complete 34-line acting specifications table.

---

### Next Steps (Awaiting User Sign-Off)

Once you review the audition page, please confirm:
1. **Your preferred Narrator voice** (Recommend: **Candidate 1 — Google Gemini Charon**).
2. **Approval of character acting performance directions**.
3. **Approval of scene soundscape designs**.

Upon your approval, full production generation will begin immediately.
