# STORYVERSE — CANONICAL TEXT AND AUDIO MANIFEST

Document Generated: 2026-11-20T13:01:15.755Z
Chapter: The Many Deaths of Laila Starr — Chapter 01

## 1. Content Count Discrepancy Resolution

Previous reports cited:
- **34 Spoken Character Dialogue Lines**: The unique lines delivered by the 11 cast members.
- **14 Spoken Narration Beats**: The 14 distinct narration recordings delivered by the Narrator (Prabhat Neural).
- **48 Total Spoken Audio Files**: The exact count of unique audio files on disk ($34 + 14 = 48$).

The later audit cited:
- **42 Dialogue Sequence Entries**: In `dialogueManifest.ts`, 8 scene narration beats (e.g. `s01-01`, `s01-02`, `s03-02`, `s05-01`, `s05-02`, `s05-03`, `s09-01`, `s09-02`) were cross-listed with `mode: 'narrator'` to provide local scene scroll anchors alongside character dialogues ($34 + 8 = 42$).
- **14 Continuous Narration Beats**: In `narrativeManifest.ts`, the 14 global chapter beats.
- **56 Summed Entries**: A raw arithmetic sum of the two arrays ($42 + 14 = 56$), which counted the 8 shared narration beats in both data structures.
- **48 Unique Audio Assets**: The deduplicated set of audio files ($42 - 8 + 14 = 48$), which matches the physical recordings exactly ($100\%$ on disk).

## 2. Complete Canonical Mapping Table

| Scene | Panel | Speaker | Type | Exact Source Text | Spoken? | Audio Filename | Visual Caption Location |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| scene-01 | `p06_panel01.webp` | Chronicle (Prabhat Neural) | Narration | "It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline." | ✅ Spoken | `scene-01-opening.mp3` | CinematicCaptionBar & Scene Sequence Caption |
| scene-01 | `p06_panel01.webp` | Chronicle (Prabhat Neural) | Narration | "Down where the elevated highway curves between glass towers, the city exhaled in horns and heat." | ✅ Spoken | `scene-01-highway.mp3` | CinematicCaptionBar & Highway Focal Overlay |
| scene-01 | `p06_panel01.webp` | None | Editorial Caption | "Late December · 4:45 PM" | 👁️ Visual Only | — | Scene Header Eyebrow & Chapter Chrome Subtitle |
| scene-02 | `p07_panel01.webp` | Chronicle (Prabhat Neural) | Narration | "On the B.K.C. overpass, one city became many cities — each trapped inside its own small metal shell." | ✅ Spoken | `scene-02-connector.mp3` | CinematicCaptionBar (Scene 01 -> 02 transition) |
| scene-02 | `p07_panel01.webp` | Mrs. Shah (Sarah) | Dialogue | "I told you we should have left an hour ago! Do you hear this traffic?!" | ✅ Spoken | `s02-01-mrs-shah.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-02 | `p07_panel02.webp` | None | SFX (Visual) | "PIP PIP PIP · HONK HONK · BEEP · BLAARP" | 👁️ Visual Only | — | Artwork sound lettering & Animated kinetic SFX header |
| scene-02 | `p07_panel03.webp` | None | Editorial Caption | "Each time they yelled at him for his dangerous driving..." | 👁️ Visual Only | — | ComicPanel Subtitle Bar beneath p07_panel03 |
| scene-02 | `p07_panel04.webp` | Cab Driver (Charlie) | Dialogue | "Madam, hold on—every lane is locked solid across B.K.C.!" | ✅ Spoken | `s02-02-driver.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-02 | `p07_panel04.webp` | None | Editorial Caption | "...he pointed to a volatile Mrs. Shah in the back, and said..." | 👁️ Visual Only | — | Accessible figcaption & Story text line |
| scene-02 | `p07_panel05.webp` | None | SFX (Visual) | "FWEEEEET" | 👁️ Visual Only | — | Traffic Officer whistle lettering in artwork & Interactive Hotspot |
| scene-02 | `p07_panel06.webp` | Mrs. Shah (Sarah) | Dialogue | "...The baby is coming." | ✅ Spoken | `s02-03-mrs-shah-baby.mp3` | SyncedSpeechBubble (Center) & Story Caption Card |
| scene-03 | `p08_panel01.webp` | None | Editorial Caption | "Meanwhile on the sixth floor of the Aria Towers in Parel, the T.I. Media Studies class of 2019 was having a final year party." | 👁️ Visual Only | — | Establishing story-caption-dark card beside p08_panel01 |
| scene-03 | `p08_panel03.webp` | Dhiraj (Harry) | Dialogue | "Listen, the whole discourse still reproduces the same patriarchal power equations—nobody actually examines who holds the lens." | ✅ Spoken | `s03-01-dhiraj.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-03 | `p08_panel06.webp` | Chronicle (Prabhat Neural) | Narration | "...Beneath gentle curls of raven hair, her eyes stayed fixed on distant city lights while her thoughts drifted like cigarette smoke." | ✅ Spoken | `s03-02-window.mp3` | CinematicCaptionBar & Sequence Caption Card |
| scene-04 | `p09_panel01.webp` | Chronicle (Prabhat Neural) | Narration | "Beyond the mortal clouds, in a place where endings are drafted like memos, something unprecedented was happening." | ✅ Spoken | `scene-04-connector.mp3` | CinematicCaptionBar (Scene 03 -> 04 transition) |
| scene-04 | `p09_panel02.webp` | Death (Lily) | Dialogue | "Hold the door!" | ✅ Spoken | `s04-01-death-hold.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-04 | `p10_panel01.webp` | None | SFX (Visual) | "DING!" | 👁️ Visual Only | — | Artwork sound lettering & Audio chime cue (sfx_ding.wav) |
| scene-04 | `p10_panel03.webp` | Agni (Eric) | Dialogue | "This way, please. He is expecting you." | ✅ Spoken | `s04-02-agni-way.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-04 | `p10_panel07.webp` | Purveyor of All Goodness (Adam) | Dialogue | "Come, come. Have a seat." | ✅ Spoken | `s04-03-god-seat.mp3` | SyncedSpeechBubble (Center) & Artwork Speech Balloon |
| scene-04 | `p11_panel01.webp` | Purveyor of All Goodness (Adam) | Dialogue | "So, Death... tell me, how're things? Work, life, friendships... hobbies?" | ✅ Spoken | `s04-04-god-hobbies.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-04 | `p11_panel02.webp` | Death (Lily) | Dialogue | "W-what am I doing here, Sir?" | ✅ Spoken | `s04-05-death-why.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-04 | `p11_panel03.webp` | None | SFX (Visual) | "TAP TAP TAP" | 👁️ Visual Only | — | Artwork finger-tapping lettering above desk |
| scene-04 | `p11_panel05.webp` | Purveyor of All Goodness (Adam) | Dialogue | "How long have you been with us, Death? Feels like an eternity, doesn't it?" | ✅ Spoken | `s04-06-god-eternity.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-04 | `p11_panel05.webp` | Death (Lily) | Dialogue | "I have actually been here for an eternity." | ✅ Spoken | `s04-07-death-eternity.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-04 | `p11_panel05.webp` | Purveyor of All Goodness (Adam) | Dialogue | "Yes, Death. I'm afraid we're letting you go." | ✅ Spoken | `s04-08-god-fired.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-04 | `p12_panel01.webp` | Death (Lily) | Dialogue | "WHAT?! I'm an absolute consequence. It's in the job description! Send down a plague! Strike the child with lightning!" | ✅ Spoken | `s04-09-death-outrage.mp3` | SyncedSpeechBubble (Center) & Artwork Speech Balloon |
| scene-04 | `p12_panel04.webp` | None | Document/Prop | "On the twelfth day of the twelfth month, shall he be born unto man, the child who shall bring eternal life." | 👁️ Visual Only | — | Page 64 Prophecy File text overlay & Story Caption Card |
| scene-04 | `p12_panel06.webp` | Purveyor of All Goodness (Adam) | Dialogue | "You know how corporate feels about that kind of stuff." | ✅ Spoken | `s04-10-god-corporate.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-04 | `p12_panel07.webp` | Death (Lily) | Dialogue | "This is all I've ever done. What am I supposed to do?" | ✅ Spoken | `s04-11-death-lost.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-05 | `p13_panel02.webp` | None | Document/Prop | "A Mortal World of Possibilities — A helpful guide for an extraordinary life after godhood" | 👁️ Visual Only | — | Artwork brochure title & Interactive Hotspot |
| scene-05 | `p13_panel03.webp` | Chronicle (Prabhat Neural) | Narration | "It was around that time that the girl from the window at the party was falling through the air — two floors down and fast approaching the ground." | ✅ Spoken | `s05-01-fall.mp3` | CinematicCaptionBar & Fall Track Story Caption |
| scene-05 | `p13_panel04.webp` | None | Editorial Caption | "Later, the party-goers would say she slipped from her perch and fell. Yet others would swear that they saw her jump." | 👁️ Visual Only | — | Editorial caption text beneath p13_panel04 |
| scene-05 | `p13_panel05.webp` | Chronicle (Prabhat Neural) | Narration | "Just as she hit the ground, Mrs. Shah was in the Amravati Hospital squeezing her husband's hand with such strength that he was screaming louder than her." | ✅ Spoken | `s05-02-birth.mp3` | CinematicCaptionBar & Birth Track Story Caption |
| scene-05 | `p13_panel06.webp` | Chronicle (Prabhat Neural) | Narration | "As the midwife urged her into one last push, a new life came into being. A beautiful thing that would go on to be the cause of much consternation in his many years to come." | ✅ Spoken | `s05-03-darius.mp3` | CinematicCaptionBar & Convergence Climax Story Caption |
| scene-06 | `p14_panel01.webp` | Chronicle (Prabhat Neural) | Narration | "A deal was being struck — the kind that bends the fabric of everything." | ✅ Spoken | `scene-06-connector.mp3` | CinematicCaptionBar (Scene 05 -> 06 transition) |
| scene-06 | `p14_panel03.webp` | Death (Lily) | Dialogue | "Agni?" | ✅ Spoken | `s06-01-death-agni.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-06 | `p14_panel04.webp` | Agni (Eric) | Dialogue | "I know what you're thinking and the answer is no." | ✅ Spoken | `s06-02-agni-no.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-06 | `p14_panel04.webp` | Agni (Eric) | Dialogue | "Oh, fiiiine... fine, what do you want?" | ✅ Spoken | `s06-03-agni-fine.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-06 | `p15_panel01.webp` | Death (Lily) | Dialogue | "When you send me down and give me a mortal body, can you put me close to the child?" | ✅ Spoken | `s06-04-death-close.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-06 | `p15_panel02.webp` | Death (Lily) | Dialogue | "I'll be a mortal then. My actions. My consequences." | ✅ Spoken | `s06-05-death-mortal.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-06 | `p15_panel05.webp` | None | SFX (Visual) | "KRA-KOOM!" | 👁️ Visual Only | — | Lightning sound lettering in artwork & sfx_thunder.wav |
| scene-07 | `p16_panel01.webp` | Chronicle (Prabhat Neural) | Narration | "She woke up in a body that felt borrowed, in a room that smelled of antiseptic and second chances." | ✅ Spoken | `scene-07-connector.mp3` | CinematicCaptionBar (Scene 06 -> 07 transition) |
| scene-07 | `p16_panel02.webp` | None | Editorial Caption | "They gave her fentanyl and etomidate and rocuronium. They sedated her, intubated her, and defibrillated her." | 👁️ Visual Only | — | Story caption text beneath p16_panel02 |
| scene-07 | `p16_panel03.webp` | None | Editorial Caption | "They charged the paddles all the way up and jolted her full of electricity." | 👁️ Visual Only | — | Story caption text beneath p16_panel03 |
| scene-07 | `p16_panel04.webp` | None | Editorial Caption | "Then at eight minutes past ten, they declared her dead and walked out of the room." | 👁️ Visual Only | — | 10:08 PM story-caption-dark card beside p16_panel04 |
| scene-07 | `p17_panel02.webp` | None | SFX (Visual) | "GAAAAAAH!!" | 👁️ Visual Only | — | Awakening scream lettering in artwork |
| scene-07 | `p17_panel03.webp` | Laila Starr (Alice) | Dialogue | "Ohhhhh, that feels awful." | ✅ Spoken | `s07-01-laila-awful.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-07 | `p17_panel04.webp` | Munmun (Jessica) | Dialogue | "Yeah, well... you were dead for a good twenty minutes or so." | ✅ Spoken | `s07-02-munmun-dead.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-07 | `p17_panel04.webp` | Laila Starr (Alice) | Dialogue | "Who're you?" | ✅ Spoken | `s07-03-laila-who.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-07 | `p18_panel01.webp` | Munmun (Jessica) | Dialogue | "I-I'm a ghost! And your name... it's on your wrist." | ✅ Spoken | `s07-04-munmun-ghost.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-07 | `p18_panel06.webp` | Laila Starr (Alice) | Dialogue | "L-Laila Starr..." | ✅ Spoken | `s07-05-laila-name.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-07 | `p18_panel06.webp` | None | Document/Prop | "NAME: LAILA STARR · AGE: 21 · ORPHAN" | 👁️ Visual Only | — | Hospital admission wristband in artwork & Interactive Hotspot |
| scene-07 | `p18_panel07.webp` | Munmun (Jessica) | Dialogue | "So... what next, Laila Starr?" | ✅ Spoken | `s07-06-munmun-next.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-08 | `p19_panel06.webp` | Chronicle (Prabhat Neural) | Narration | "The neo-natal ward held its breath. Death held a baby." | ✅ Spoken | `scene-08-connector.mp3` | CinematicCaptionBar (Scene 07 -> 08 transition) |
| scene-08 | `p20_panel03.webp` | Munmun (Jessica) | Dialogue | "His name is Darius. He's got a name! You can't kill someone with a name!" | ✅ Spoken | `s08-01-munmun-darius.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-08 | `p21_panel02.webp` | Laila Starr (Alice) | Dialogue | "What? W-why did you tell me that? I... I can't!" | ✅ Spoken | `s08-02-laila-cant.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-08 | `p21_panel01.webp` | None | Editorial Caption | "Amid the pain and despair and all the indignities of a dying body, there is a moment of grace." | 👁️ Visual Only | — | Grace sequence centerpiece story caption |
| scene-08 | `p21_panel03.webp` | None | SFX (Visual) | "WAAAAAAH!" | 👁️ Visual Only | — | Baby Darius crying lettering across p21_panel03 |
| scene-08 | `p21_panel04.webp` | Hospital Guard (Callum) | Dialogue | "There she is! Oh my God—she's alive! Hey you! Put that baby down!" | ✅ Spoken | `s08-03-guard.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-08 | `p23_panel01.webp` | None | SFX (Visual) | "CLUNG!" | 👁️ Visual Only | — | Metal tray sound lettering across p23_panel01 |
| scene-08 | `p23_panel05.webp` | None | Editorial Caption | "And so it was that Laila Starr found herself running toward freedom." | 👁️ Visual Only | — | Exit doorway story caption card |
| scene-09 | `p24_panel01.webp` | None | SFX (Visual) | "Ploc, Ploc, Ploc" | 👁️ Visual Only | — | Bare footstep splash lettering across wet steps in p24_panel01 |
| scene-09 | `p24_panel02.webp` | None | SFX (Visual) | "BLAAAARRRR!" | 👁️ Visual Only | — | Twelve-wheeler truck horn lettering in artwork & sfx_truck.wav |
| scene-09 | `p24_panel02.webp` | Chronicle (Prabhat Neural) | Narration | "And in Mumbai, even at that late hour, great thundering wheels of commerce rolled on unfettered." | ✅ Spoken | `s09-01-commerce.mp3` | CinematicCaptionBar & 11:53 PM Sequence Caption |
| scene-09 | `p24_panel02.webp` | Chronicle (Prabhat Neural) | Narration | "And so, only a few minutes away from midnight, Laila Starr met her death once again." | ✅ Spoken | `s09-02-midnight.mp3` | CinematicCaptionBar & 11:54 PM Climax Caption |
| scene-10 | `p25_panel01.webp` | Chronicle (Prabhat Neural) | Narration | "Eight years later, the sun rose anyway — as it always has, as it always will." | ✅ Spoken | `scene-10-connector.mp3` | CinematicCaptionBar (Scene 09 -> 10 transition) |
| scene-10 | `p25_panel01.webp` | None | Editorial Caption | "It was all over the newspapers for a while. The girl who died and lived and died again. Soon, no one thought about Laila Starr." | 👁️ Visual Only | — | Scene 10 Prologue Header Description |
| scene-10 | `p25_panel04.webp` | None | Editorial Caption | "No one but me, that is... as I watched through the curling steam of my morning tea. The girl with raven hair, who was also Death and meant the world to me." | 👁️ Visual Only | — | Story caption card beside Pranah morning tea artwork |
| scene-10 | `p25_panel06.webp` | Laila Starr (Alice) | Dialogue | "Have you been standing there watching me sleep this whole time? Ugggh... what happened? How did I get here?" | ✅ Spoken | `s10-01-laila-wake.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-10 | `p26_panel03.webp` | Pranah (Brian) | Dialogue | "You died. Run over by a twelve-wheeler. But I brought you back." | ✅ Spoken | `s10-02-pranah-back.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-10 | `p26_panel06.webp` | Laila Starr (Alice) | Dialogue | "I couldn't do it, Pran. He was just a baby... How could you bring someone like that into being?" | ✅ Spoken | `s10-03-laila-baby.mp3` | SyncedSpeechBubble (Left Anchor) & Artwork Speech Balloon |
| scene-10 | `p26_panel07.webp` | Pranah (Brian) | Dialogue | "Hey, I only give them a lifetime, every one of them. What they do with it is between them and... you, I suppose." | ✅ Spoken | `s10-04-pranah-lifetime.mp3` | SyncedSpeechBubble (Right Anchor) & Artwork Speech Balloon |
| scene-10 | `p27_panel02.webp` | Laila Starr (Alice) | Dialogue | "...he's not a baby anymore." | ✅ Spoken | `s10-05-laila-closing.mp3` | SyncedSpeechBubble (Center) & Artwork Speech Balloon |

## 3. Summary Statistics

- **Total Catalogued Text Elements**: 73
- **Total Spoken Elements (Voice Recorded)**: 48 (34 dialogue + 14 narration)
- **Total Visual-Only Elements (Intentionally Unspoken)**: 25
  - Written Comic Sound Effects (SFX): 10
  - Editorial Prose / Establishing Captions: 12
  - Document / In-World Prop Excerpts: 3
- **Distinct Physical Audio Files on Disk**: 48 ($100\%$ verified)
