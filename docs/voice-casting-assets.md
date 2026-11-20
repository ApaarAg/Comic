# Character Voice Acting Assets — Production Specification

`CharacterVoicePlayer` intentionally **does not use robotic browser text-to-speech (`window.speechSynthesis`)** and does not invent or fake generated studio voice files.

When recorded human or studio voice files are placed at the paths below, `CharacterVoicePlayer` automatically loads and plays them through the `Howler.js` Voice bus with automatic ambience ducking and zero overlapping voices. Until those files exist, dialogue plays via timed ink-reveal choreography with full visual subtitle focus and never fakes audio presence.

## Mixer Bus Architecture
- **Character Voices** (`voice` bus): Isolated gain + auto-ducks ambient music/SFX by ~55% while active.
- **Background Ambience** (`ambience` bus): Scene-specific atmospheric stems (`/public/assets/audio/amb_*.wav`).
- **Environmental & Interaction SFX** (`sfx` bus): Speech bubble pops, hotspots, elevator ding, horns, thunder, flatline, truck horn.

## Required Voice Files (`44.1kHz / 48kHz Mono MP3 or WAV`, normalized `-16 LUFS`)

| Line ID | Scene | Character | File Path | Vocal Direction | Script Line |
|---|---|---|---|---|---|
| `s02-01` | Scene 02 | Mrs. Shah | `/public/assets/audio/voices/s02_01_mrs_shah.mp3` | Breathless panic over phone | "I told you we should have left an hour ago! Do you hear this traffic?!" |
| `s02-02` | Scene 02 | Cab Driver | `/public/assets/audio/voices/s02_02_driver.mp3` | Harried street urgency | "Madam, hold on—every lane is locked solid across B.K.C.!" |
| `s02-03` | Scene 02 | Mrs. Shah | `/public/assets/audio/voices/s02_03_mrs_shah_baby.mp3` | Sudden sharp realization | "...The baby is coming." |
| `s03-01` | Scene 03 | Dhiraj | `/public/assets/audio/voices/s03_01_dhiraj.mp3` | Earnest college party chatter | "Listen, the whole discourse still reproduces the same patriarchal power equations..." |
| `s03-02` | Scene 03 | Girl / Narrator | `/public/assets/audio/voices/s03_02_narrator_window.mp3` | Quiet detached reflection | "...Beneath gentle curls of raven hair, her eyes stayed fixed on distant city lights..." |
| `s04-01` | Scene 04 | Death | `/public/assets/audio/voices/s04_01_death_hold.mp3` | Sharp, crisp command | "Hold the door!" |
| `s04-02` | Scene 04 | Agni | `/public/assets/audio/voices/s04_02_agni_way.mp3` | Courteous aide | "This way, please. He is expecting you." |
| `s04-03` | Scene 04 | Purveyor of All Goodness | `/public/assets/audio/voices/s04_03_god_seat.mp3` | Velvety corporate deity | "Come, come. Have a seat." |
| `s04-04` | Scene 04 | Purveyor of All Goodness | `/public/assets/audio/voices/s04_04_god_hobbies.mp3` | Casual small talk | "So, Death... tell me, how're things? Work, life, friendships... hobbies?" |
| `s04-05` | Scene 04 | Death | `/public/assets/audio/voices/s04_05_death_why.mp3` | Guarded, slightly stiff | "W-what am I doing here, Sir?" |
| `s04-06` | Scene 04 | Purveyor of All Goodness | `/public/assets/audio/voices/s04_06_god_eternity.mp3` | Measured, mild | "How long have you been with us, Death? Feels like an eternity, doesn't it?" |
| `s04-07` | Scene 04 | Death | `/public/assets/audio/voices/s04_07_death_eternity.mp3` | Deadpan literal | "I have actually been here for an eternity." |
| `s04-08` | Scene 04 | Purveyor of All Goodness | `/public/assets/audio/voices/s04_08_god_fired.mp3` | Gentle finality | "Yes, Death. I'm afraid we're letting you go." |
| `s04-09` | Scene 04 | Death | `/public/assets/audio/voices/s04_09_death_outrage.mp3` | Exploding incredulity | "WHAT?! I'm an absolute consequence. It's in the job description!..." |
| `s04-10` | Scene 04 | Purveyor of All Goodness | `/public/assets/audio/voices/s04_10_god_corporate.mp3` | Unbothered diplomacy | "You know how corporate feels about that kind of stuff." |
| `s04-11` | Scene 04 | Death | `/public/assets/audio/voices/s04_11_death_lost.mp3` | Quiet devastation | "This is all I've ever done. What am I supposed to do?" |
| `s06-01` .. `s06-05` | Scene 06 | Death & Agni | `/public/assets/audio/voices/s06_*.mp3` | Elevator bargain beats | See `src/story/dialogueManifest.ts` |
| `s07-01` .. `s07-06` | Scene 07 | Laila Starr & Munmun | `/public/assets/audio/voices/s07_*.mp3` | Raw mortal awakening & ghost banter | See `src/story/dialogueManifest.ts` |
| `s08-01` .. `s08-03` | Scene 08 | Munmun, Laila, Guard | `/public/assets/audio/voices/s08_*.mp3` | Whispered grace & ward chase | See `src/story/dialogueManifest.ts` |
| `s10-01` .. `s10-05` | Scene 10 | Laila & Pranah | `/public/assets/audio/voices/s10_*.mp3` | Quiet morning harbour epilogue | See `src/story/dialogueManifest.ts` |
