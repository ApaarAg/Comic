/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/audio/voiceActingBible.ts
 *
 * Canonical Acting Direction & Emotional Architecture for all 34 dialogue lines.
 * Generated automatically from Storyverse Audio Experience 2.0 specifications.
 */

export interface ActingDirection {
  characterId: string;
  characterName: string;
  dialogueId: string;
  sceneId: string;
  originalText: string;
  primaryEmotion: string;
  secondaryEmotion: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  pace: 'slow' | 'measured' | 'moderate' | 'rapid' | 'breathless';
  vocalEnergy: 'whispered' | 'intimate' | 'grounded' | 'projected' | 'explosive';
  pitchAndEmphasis: string;
  pausesAndTiming: string;
  vocalCues: string;
  emotionalArc: string;
  elevenVoiceSettings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

export const VOICE_ACTING_BIBLE: ReadonlyArray<ActingDirection> = [
  {
    "characterId": "mrs_shah",
    "characterName": "Mrs. Shah",
    "dialogueId": "s02-01",
    "sceneId": "scene-02",
    "originalText": "I told you we should have left an hour ago! Do you hear this traffic?!",
    "primaryEmotion": "Frustration",
    "secondaryEmotion": "Labor Pain Urgency",
    "intensity": 4,
    "pace": "rapid",
    "vocalEnergy": "projected",
    "pitchAndEmphasis": "Sharp, rising pitch on \"hour ago\", harsh cutting emphasis on \"traffic\"",
    "pausesAndTiming": "Sharp intake of breath at start; 0.2s pause before question",
    "vocalCues": "Painful gasp on inhale; breathless strain through clenched teeth",
    "emotionalArc": "Starts with accusatory marital irritation, immediately overwhelmed by a sudden labor contraction",
    "elevenVoiceSettings": {
      "stability": 0.32,
      "similarity_boost": 0.85,
      "style": 0.55,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "driver",
    "characterName": "Cab Driver",
    "dialogueId": "s02-02",
    "sceneId": "scene-02",
    "originalText": "Madam, hold on—every lane is locked solid across B.K.C.!",
    "primaryEmotion": "Stress",
    "secondaryEmotion": "Defensive Empathy",
    "intensity": 3,
    "pace": "rapid",
    "vocalEnergy": "projected",
    "pitchAndEmphasis": "Mid-register shout over car horn; emphasis on \"hold on\" and \"locked solid\"",
    "pausesAndTiming": "0.15s dash pause after \"hold on\"; rushed delivery on \"across B.K.C.\"",
    "vocalCues": "Strained voice fighting street noise; slight defensive grunt on wheel turn",
    "emotionalArc": "Instinctive defense against customer yelling, turning into genuine helplessness about the traffic jam",
    "elevenVoiceSettings": {
      "stability": 0.4,
      "similarity_boost": 0.8,
      "style": 0.45,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "mrs_shah",
    "characterName": "Mrs. Shah",
    "dialogueId": "s02-03",
    "sceneId": "scene-02",
    "originalText": "...The baby is coming.",
    "primaryEmotion": "Intense Physical Pain / Labor Contraction",
    "secondaryEmotion": "Fear & Urgency",
    "intensity": 5,
    "pace": "urgent",
    "vocalEnergy": "strained / shouted through contraction",
    "pitchAndEmphasis": "Sharp breath intake; intense labor urgency on \"baby is coming\"",
    "pausesAndTiming": "Sudden sharp contraction intake before line; strained vocal cords",
    "vocalCues": "Gasping breath catch, authentic labor panic cutting through traffic noise",
    "emotionalArc": "Acute physical labor contraction surging to full intensity inside the gridlocked cab",
    "elevenVoiceSettings": {
      "stability": 0.32,
      "similarity_boost": 0.85,
      "style": 0.65,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "dhiraj",
    "characterName": "Dhiraj",
    "dialogueId": "s03-01",
    "sceneId": "scene-03",
    "originalText": "Listen, the whole discourse still reproduces the same patriarchal power equations—nobody actually examines who holds the lens.",
    "primaryEmotion": "Intellectual Pretentiousness",
    "secondaryEmotion": "Performative Earnestness",
    "intensity": 2,
    "pace": "moderate",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Slightly nasal mid-tone; patronizing emphasis on \"discourse\" and \"holds the lens\"",
    "pausesAndTiming": "Casual party conversational flow; slight 0.2s pause at em-dash",
    "vocalCues": "Smug half-breath chuckle before \"nobody actually examines\"",
    "emotionalArc": "Unprompted lecture at a noisy party, completely oblivious to his listener drifting toward the window",
    "elevenVoiceSettings": {
      "stability": 0.65,
      "similarity_boost": 0.75,
      "style": 0.2,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "death",
    "characterName": "Death",
    "dialogueId": "s04-01",
    "sceneId": "scene-04",
    "originalText": "Hold the door!",
    "primaryEmotion": "Impatient Authority",
    "secondaryEmotion": "Mild Annoyance",
    "intensity": 3,
    "pace": "rapid",
    "vocalEnergy": "projected",
    "pitchAndEmphasis": "Regal, sharp command; heavy dynamic punch on \"door\"",
    "pausesAndTiming": "Abrupt, clipped delivery",
    "vocalCues": "Rushing heel footsteps; swift, resonant breath",
    "emotionalArc": "The absolute ruler of mortal endings expecting corporate elevators to wait for her",
    "elevenVoiceSettings": {
      "stability": 0.45,
      "similarity_boost": 0.85,
      "style": 0.4,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "agni",
    "characterName": "Agni",
    "dialogueId": "s04-02",
    "sceneId": "scene-04",
    "originalText": "This way, please. He is expecting you.",
    "primaryEmotion": "Polite Bureaucracy",
    "secondaryEmotion": "Suppressed Nervousness",
    "intensity": 2,
    "pace": "measured",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Smooth corporate receptionist tone; deference on \"He is expecting you\"",
    "pausesAndTiming": "Paced, formal rhythm; 0.3s comma pause after \"please\"",
    "vocalCues": "Crisp enunciation; quiet professional intake",
    "emotionalArc": "Carefully neutral administrative professionalism concealing the impending disaster",
    "elevenVoiceSettings": {
      "stability": 0.7,
      "similarity_boost": 0.8,
      "style": 0.15,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "god",
    "characterName": "Purveyor of All Goodness",
    "dialogueId": "s04-03",
    "sceneId": "scene-04",
    "originalText": "Come, come. Have a seat.",
    "primaryEmotion": "Casual Warmth",
    "secondaryEmotion": "Corporate Euphemism",
    "intensity": 1,
    "pace": "moderate",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Booming, affable executive baritone; warm descent on \"Have a seat\"",
    "pausesAndTiming": "Breezy cadence; light pause between \"Come, come\" and invitation",
    "vocalCues": "Friendly vocal chuckle; arm gesture rustle",
    "emotionalArc": "Disarming faux-paternal friendliness designed to cushion an execution",
    "elevenVoiceSettings": {
      "stability": 0.6,
      "similarity_boost": 0.8,
      "style": 0.25,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "god",
    "characterName": "Purveyor of All Goodness",
    "dialogueId": "s04-04",
    "sceneId": "scene-04",
    "originalText": "So, Death... tell me, how're things? Work, life, friendships... hobbies?",
    "primaryEmotion": "Forced Small Talk",
    "secondaryEmotion": "Executive Detachment",
    "intensity": 2,
    "pace": "moderate",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Inquisitive upward inflection on \"things?\", playful enumeration on \"hobbies?\"",
    "pausesAndTiming": "0.4s pause after \"Death...\"; trailing pauses between checklist items",
    "vocalCues": "Amused throat clearing; leisurely chair swivel",
    "emotionalArc": "Superficial 1-on-1 performance review checklist before dropping the hammer",
    "elevenVoiceSettings": {
      "stability": 0.55,
      "similarity_boost": 0.8,
      "style": 0.3,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "death",
    "characterName": "Death",
    "dialogueId": "s04-05",
    "sceneId": "scene-04",
    "originalText": "W-what am I doing here, Sir?",
    "primaryEmotion": "Suspicion",
    "secondaryEmotion": "Unsettled Vulnerability",
    "intensity": 3,
    "pace": "measured",
    "vocalEnergy": "intimate",
    "pitchAndEmphasis": "Stutter on \"W-what\"; guarded hesitation on formal \"Sir\"",
    "pausesAndTiming": "Micro-stumble on opening syllable; guarded silence before \"Sir\"",
    "vocalCues": "Subtle throat swallow; cautious breath",
    "emotionalArc": "Regal confidence faltering as instinct detects an existential ambush",
    "elevenVoiceSettings": {
      "stability": 0.4,
      "similarity_boost": 0.85,
      "style": 0.45,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "god",
    "characterName": "Purveyor of All Goodness",
    "dialogueId": "s04-06",
    "sceneId": "scene-04",
    "originalText": "How long have you been with us, Death? Feels like an eternity, doesn't it?",
    "primaryEmotion": "Feigned Nostalgia",
    "secondaryEmotion": "Calculated Setup",
    "intensity": 2,
    "pace": "measured",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Wistful pitch slide on \"eternity\"; conversational tag on \"doesn't it?\"",
    "pausesAndTiming": "0.3s break between rhetorical questions",
    "vocalCues": "Gentle nostalgic smile audible in tone",
    "emotionalArc": "Setting up the semantic joke before pulling the rug out",
    "elevenVoiceSettings": {
      "stability": 0.6,
      "similarity_boost": 0.8,
      "style": 0.25,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "death",
    "characterName": "Death",
    "dialogueId": "s04-07",
    "sceneId": "scene-04",
    "originalText": "I have actually been here for an eternity.",
    "primaryEmotion": "Deadpan Literalism",
    "secondaryEmotion": "Cosmic Pride",
    "intensity": 2,
    "pace": "slow",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Flat, dry, aristocratic delivery; deliberate emphasis on \"actually\" and \"eternity\"",
    "pausesAndTiming": "Even, unhurried syllable spacing",
    "vocalCues": "Cool, steady exhale; zero amusement",
    "emotionalArc": "Stating ontological fact to remind him who he is speaking to",
    "elevenVoiceSettings": {
      "stability": 0.5,
      "similarity_boost": 0.85,
      "style": 0.25,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "god",
    "characterName": "Purveyor of All Goodness",
    "dialogueId": "s04-08",
    "sceneId": "scene-04",
    "originalText": "Yes, Death. I'm afraid we're letting you go.",
    "primaryEmotion": "Casual Indifference",
    "secondaryEmotion": "Mild Sympathy",
    "intensity": 3,
    "pace": "measured",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Downward, final cadence on \"letting you go\"; calm, flat, boardroom finality",
    "pausesAndTiming": "0.3s pause after \"Yes, Death.\"",
    "vocalCues": "Soft sigh of mild managerial inconvenience",
    "emotionalArc": "Firing an immortal cosmic consequence as if cancelling a software subscription",
    "elevenVoiceSettings": {
      "stability": 0.65,
      "similarity_boost": 0.8,
      "style": 0.2,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "death",
    "characterName": "Death",
    "dialogueId": "s04-09",
    "sceneId": "scene-04",
    "originalText": "WHAT?! I'm an absolute consequence. It's in the job description! Send down a plague! Strike the child with lightning!",
    "primaryEmotion": "Outrage",
    "secondaryEmotion": "Desperate Indignation",
    "intensity": 5,
    "pace": "rapid",
    "vocalEnergy": "explosive",
    "pitchAndEmphasis": "Screamed high-register \"WHAT?!\"; furious staccato on \"job description!\"; booming commands on \"plague!\" and \"lightning!\"",
    "pausesAndTiming": "Violent gasp after \"WHAT?!\"; rapid-fire demands without breathing",
    "vocalCues": "Voice cracking with celestial rage; fierce air blast",
    "emotionalArc": "Cosmic authority shattered in an instant, exploding into pure indignant rebellion",
    "elevenVoiceSettings": {
      "stability": 0.22,
      "similarity_boost": 0.85,
      "style": 0.7,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "god",
    "characterName": "Purveyor of All Goodness",
    "dialogueId": "s04-10",
    "sceneId": "scene-04",
    "originalText": "You know how corporate feels about that kind of stuff.",
    "primaryEmotion": "Dismissive Amusement",
    "secondaryEmotion": "Bureaucratic Finality",
    "intensity": 2,
    "pace": "moderate",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Casual shrug in tone; dismissive slur on \"that kind of stuff\"",
    "pausesAndTiming": "Unbothered, relaxed timing",
    "vocalCues": "Dry chuckle; light wave of the hand",
    "emotionalArc": "Brushing off apocalyptic plagues as a minor PR headache",
    "elevenVoiceSettings": {
      "stability": 0.62,
      "similarity_boost": 0.8,
      "style": 0.25,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "death",
    "characterName": "Death",
    "dialogueId": "s04-11",
    "sceneId": "scene-04",
    "originalText": "This is all I've ever done. What am I supposed to do?",
    "primaryEmotion": "Existential Despair",
    "secondaryEmotion": "Quiet Helplessness",
    "intensity": 4,
    "pace": "slow",
    "vocalEnergy": "whispered",
    "pitchAndEmphasis": "Low, hollow register; vulnerable rising query on \"supposed to do?\"",
    "pausesAndTiming": "0.5s dead silence after first sentence; fragile second sentence",
    "vocalCues": "Trembling voice; quiet, hollow exhale; tears held back",
    "emotionalArc": "The goddess of death reduced to an unemployed mortal, staring into an empty void",
    "elevenVoiceSettings": {
      "stability": 0.38,
      "similarity_boost": 0.88,
      "style": 0.5,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "death",
    "characterName": "Death",
    "dialogueId": "s06-01",
    "sceneId": "scene-06",
    "originalText": "Agni?",
    "primaryEmotion": "Hesitant Manipulation",
    "secondaryEmotion": "Tentative Hope",
    "intensity": 2,
    "pace": "slow",
    "vocalEnergy": "intimate",
    "pitchAndEmphasis": "Soft, questioning upward inflection; unusually gentle",
    "pausesAndTiming": "Single word lingering in empty corridor",
    "vocalCues": "Quiet step forward; soft throat clearing",
    "emotionalArc": "Probing her subordinate to see if loyalty still survives termination",
    "elevenVoiceSettings": {
      "stability": 0.48,
      "similarity_boost": 0.85,
      "style": 0.35,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "agni",
    "characterName": "Agni",
    "dialogueId": "s06-02",
    "sceneId": "scene-06",
    "originalText": "I know what you're thinking and the answer is no.",
    "primaryEmotion": "Firm Resistance",
    "secondaryEmotion": "Defensive Guilt",
    "intensity": 3,
    "pace": "rapid",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Flat refusal; hard emphasis on \"no\"",
    "pausesAndTiming": "Fast, preemptive cut-off before she can speak",
    "vocalCues": "Snappy enunciation; averting eyes",
    "emotionalArc": "Trying to protect his own job by shutting down treason immediately",
    "elevenVoiceSettings": {
      "stability": 0.55,
      "similarity_boost": 0.8,
      "style": 0.3,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "agni",
    "characterName": "Agni",
    "dialogueId": "s06-03",
    "sceneId": "scene-06",
    "originalText": "Oh, fiiiine... fine, what do you want?",
    "primaryEmotion": "Exasperation",
    "secondaryEmotion": "Grudging Loyalty",
    "intensity": 3,
    "pace": "moderate",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Drawn out groan on \"fiiiine\"; resigned descent on \"what do you want?\"",
    "pausesAndTiming": "Elongated vowel; weary pause before question",
    "vocalCues": "Heavy, defeated sigh; shoulder slump",
    "emotionalArc": "Inevitably folding under his former boss's imposing presence",
    "elevenVoiceSettings": {
      "stability": 0.45,
      "similarity_boost": 0.8,
      "style": 0.4,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "death",
    "characterName": "Death",
    "dialogueId": "s06-04",
    "sceneId": "scene-06",
    "originalText": "When you send me down and give me a mortal body, can you put me close to the child?",
    "primaryEmotion": "Calculated Determination",
    "secondaryEmotion": "Concealed Vengeance",
    "intensity": 3,
    "pace": "measured",
    "vocalEnergy": "intimate",
    "pitchAndEmphasis": "Conspiratorial whisper; subtle emphasis on \"close to the child\"",
    "pausesAndTiming": "Carefully measured cadence; conspiratorial proximity",
    "vocalCues": "Lowered vocal register; tight focused breath",
    "emotionalArc": "Laying the trap — disguising an assassination mission as a relocation favor",
    "elevenVoiceSettings": {
      "stability": 0.52,
      "similarity_boost": 0.85,
      "style": 0.35,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "death",
    "characterName": "Death",
    "dialogueId": "s06-05",
    "sceneId": "scene-06",
    "originalText": "I'll be a mortal then. My actions. My consequences.",
    "primaryEmotion": "Defiant Pride",
    "secondaryEmotion": "Grim Resolution",
    "intensity": 4,
    "pace": "slow",
    "vocalEnergy": "projected",
    "pitchAndEmphasis": "Staccato, oath-like rhythm on \"My actions. My consequences.\"",
    "pausesAndTiming": "Heavy 0.4s pauses between each declarative sentence",
    "vocalCues": "Resonant chest delivery; firm jaw",
    "emotionalArc": "Accepting mortality not as a punishment, but as a loophole for revenge",
    "elevenVoiceSettings": {
      "stability": 0.42,
      "similarity_boost": 0.88,
      "style": 0.45,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "laila",
    "characterName": "Laila Starr",
    "dialogueId": "s07-01",
    "sceneId": "scene-07",
    "originalText": "Ohhhhh, that feels awful.",
    "primaryEmotion": "Physical Agony",
    "secondaryEmotion": "Grogginess",
    "intensity": 4,
    "pace": "slow",
    "vocalEnergy": "whispered",
    "pitchAndEmphasis": "Long groaning vocal fry on \"Ohhhhh\"; raspy, dry emphasis on \"awful\"",
    "pausesAndTiming": "Slow awakening struggle; words barely formed",
    "vocalCues": "Deep pained groan; dry mouth swallow; ragged intake",
    "emotionalArc": "First sensation of human nerve endings after falling six stories: pure blunt agony",
    "elevenVoiceSettings": {
      "stability": 0.28,
      "similarity_boost": 0.85,
      "style": 0.6,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "munmun",
    "characterName": "Munmun",
    "dialogueId": "s07-02",
    "sceneId": "scene-07",
    "originalText": "Yeah, well... you were dead for a good twenty minutes or so.",
    "primaryEmotion": "Childlike Casuallness",
    "secondaryEmotion": "Fascinated Amusement",
    "intensity": 2,
    "pace": "moderate",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Breezy boyish shrug; casual emphasis on \"twenty minutes or so\"",
    "pausesAndTiming": "Light pause after \"Yeah, well...\"",
    "vocalCues": "Floating spectral resonance; youthful airy timbre",
    "emotionalArc": "A ghost boy stating medical resuscitation as if discussing yesterday's cartoon",
    "elevenVoiceSettings": {
      "stability": 0.55,
      "similarity_boost": 0.8,
      "style": 0.3,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "laila",
    "characterName": "Laila Starr",
    "dialogueId": "s07-03",
    "sceneId": "scene-07",
    "originalText": "Who're you?",
    "primaryEmotion": "Disorientation",
    "secondaryEmotion": "Wary Confusion",
    "intensity": 3,
    "pace": "slow",
    "vocalEnergy": "intimate",
    "pitchAndEmphasis": "Hoarse, rasping whisper; guarded rise on \"you?\"",
    "pausesAndTiming": "Strained single breath",
    "vocalCues": "Weak breath; squinting eye flutter in voice",
    "emotionalArc": "Trying to focus blurry mortal vision on a glowing spectral child floating above her bed",
    "elevenVoiceSettings": {
      "stability": 0.45,
      "similarity_boost": 0.85,
      "style": 0.4,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "munmun",
    "characterName": "Munmun",
    "dialogueId": "s07-04",
    "sceneId": "scene-07",
    "originalText": "I-I'm a ghost! And your name... it's on your wrist.",
    "primaryEmotion": "Eager Self-Importance",
    "secondaryEmotion": "Helpful Curiosity",
    "intensity": 3,
    "pace": "rapid",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Proud stutter on \"I-I'm a ghost!\"; pointing excitement on \"on your wrist\"",
    "pausesAndTiming": "Excited burst; brief pause after \"name...\" as he gestures",
    "vocalCues": "Boyish giggle; enthusiastic whisper",
    "emotionalArc": "Thrilled to meet someone who can actually see and hear him in the hospital ward",
    "elevenVoiceSettings": {
      "stability": 0.4,
      "similarity_boost": 0.8,
      "style": 0.45,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "laila",
    "characterName": "Laila Starr",
    "dialogueId": "s07-05",
    "sceneId": "scene-07",
    "originalText": "L-Laila Starr...",
    "primaryEmotion": "Disbelief",
    "secondaryEmotion": "Alien Identity",
    "intensity": 3,
    "pace": "slow",
    "vocalEnergy": "whispered",
    "pitchAndEmphasis": "Unfamiliar mouth shape on \"L-Laila\"; trailing murmur on \"Starr...\"",
    "pausesAndTiming": "Slowly reading letter by letter off plastic wristband",
    "vocalCues": "Faint tremble; breath of strange novelty",
    "emotionalArc": "Death testing her new human name for the very first time on her tongue",
    "elevenVoiceSettings": {
      "stability": 0.42,
      "similarity_boost": 0.88,
      "style": 0.4,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "munmun",
    "characterName": "Munmun",
    "dialogueId": "s07-06",
    "sceneId": "scene-07",
    "originalText": "So... what next, Laila Starr?",
    "primaryEmotion": "Inquisitive Excitement",
    "secondaryEmotion": "Adventure Anticipation",
    "intensity": 3,
    "pace": "moderate",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Playful lilt on \"what next\"; melodic pronunciation of full name",
    "pausesAndTiming": "0.3s pause after \"So...\"; inviting cadence",
    "vocalCues": "Eager boyish smile audible",
    "emotionalArc": "Inviting her into whatever wild scheme comes next",
    "elevenVoiceSettings": {
      "stability": 0.5,
      "similarity_boost": 0.8,
      "style": 0.35,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "munmun",
    "characterName": "Munmun",
    "dialogueId": "s08-01",
    "sceneId": "scene-08",
    "originalText": "His name is Darius. He's got a name! You can't kill someone with a name!",
    "primaryEmotion": "Panic & Urgency",
    "secondaryEmotion": "Desperate Moral Pleading",
    "intensity": 5,
    "pace": "breathless",
    "vocalEnergy": "explosive",
    "pitchAndEmphasis": "Shrill, frantic pitch on \"Darius\"; breaking voice on \"someone with a name!\"",
    "pausesAndTiming": "Rapid-fire, gasping staccato between sentences",
    "vocalCues": "Tearful break; desperate air intake; trembling ghost echo",
    "emotionalArc": "A terrified child screaming the ultimate moral barrier to stop an executioner",
    "elevenVoiceSettings": {
      "stability": 0.2,
      "similarity_boost": 0.85,
      "style": 0.7,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "laila",
    "characterName": "Laila Starr",
    "dialogueId": "s08-02",
    "sceneId": "scene-08",
    "originalText": "What? W-why did you tell me that? I... I can't!",
    "primaryEmotion": "Horrified Hesitation",
    "secondaryEmotion": "Crushing Guilt",
    "intensity": 5,
    "pace": "breathless",
    "vocalEnergy": "projected",
    "pitchAndEmphasis": "Choked stutter on \"W-why\"; breaking falter on \"I... I can't!\"",
    "pausesAndTiming": "Fractured pauses; gasping breath between \"I...\" and \"I can't!\"",
    "vocalCues": "Sudden sharp sob; trembling hands audible in vocal vibration",
    "emotionalArc": "Her cold cosmic purpose destroyed by the weight of a baby's humanity",
    "elevenVoiceSettings": {
      "stability": 0.22,
      "similarity_boost": 0.9,
      "style": 0.75,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "security",
    "characterName": "Hospital Guard",
    "dialogueId": "s08-03",
    "sceneId": "scene-08",
    "originalText": "There she is! Oh my God—she's alive! Hey you! Put that baby down!",
    "primaryEmotion": "Shocked Alarm",
    "secondaryEmotion": "Authoritative Panic",
    "intensity": 4,
    "pace": "rapid",
    "vocalEnergy": "explosive",
    "pitchAndEmphasis": "Stunned gasp on \"alive!\"; harsh commanding bark on \"Put that baby down!\"",
    "pausesAndTiming": "Disbelief dash at \"Oh my God—\"; abrupt shouting rhythm",
    "vocalCues": "Heavy running boot footsteps; chest heavy shout",
    "emotionalArc": "Seeing a dead patient resurrected and holding a baby, instantly switching to law enforcement crisis mode",
    "elevenVoiceSettings": {
      "stability": 0.35,
      "similarity_boost": 0.82,
      "style": 0.5,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "laila",
    "characterName": "Laila Starr",
    "dialogueId": "s10-01",
    "sceneId": "scene-10",
    "originalText": "Have you been standing there watching me sleep this whole time? Ugggh... what happened? How did I get here?",
    "primaryEmotion": "Groggy Irritation",
    "secondaryEmotion": "Baffled Disorientation",
    "intensity": 3,
    "pace": "moderate",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Dry, waking morning rasp; grumbling groan on \"Ugggh...\"; bewildered rise on \"get here?\"",
    "pausesAndTiming": "Groan separates the suspicion from the existential confusion",
    "vocalCues": "Morning throat rasp; waking yawn/groan; rubbing eyes sound in voice",
    "emotionalArc": "Waking up after eight years in limbo, irritated that her friend is staring at her like a creep",
    "elevenVoiceSettings": {
      "stability": 0.38,
      "similarity_boost": 0.85,
      "style": 0.45,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "pranah",
    "characterName": "Pranah",
    "dialogueId": "s10-02",
    "sceneId": "scene-10",
    "originalText": "You died. Run over by a twelve-wheeler. But I brought you back.",
    "primaryEmotion": "Affectionate Calm",
    "secondaryEmotion": "Casual Omnipotence",
    "intensity": 2,
    "pace": "slow",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Gentle, warm, steady baritone; matter-of-fact drop on \"twelve-wheeler\"; tender warmth on \"brought you back\"",
    "pausesAndTiming": "0.4s pause between short, punchy factual declarations",
    "vocalCues": "Warm morning tea sipping breath; affectionate smile",
    "emotionalArc": "Explaining a horrific road death over morning chai with supreme divine calm",
    "elevenVoiceSettings": {
      "stability": 0.65,
      "similarity_boost": 0.85,
      "style": 0.2,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "laila",
    "characterName": "Laila Starr",
    "dialogueId": "s10-03",
    "sceneId": "scene-10",
    "originalText": "I couldn't do it, Pran. He was just a baby... How could you bring someone like that into being?",
    "primaryEmotion": "Lingering Grief",
    "secondaryEmotion": "Moral Accusation",
    "intensity": 4,
    "pace": "slow",
    "vocalEnergy": "intimate",
    "pitchAndEmphasis": "Soft, tender, vulnerable drop on \"Pran\"; heavy mournful question on \"into being?\"",
    "pausesAndTiming": "0.4s trailing pause after \"baby...\"; deep breath before accusation",
    "vocalCues": "Subtle voice break; aching quiet exhale",
    "emotionalArc": "Confessing her failure to kill the child, and confronting Life itself for inventing mortality",
    "elevenVoiceSettings": {
      "stability": 0.32,
      "similarity_boost": 0.88,
      "style": 0.55,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "pranah",
    "characterName": "Pranah",
    "dialogueId": "s10-04",
    "sceneId": "scene-10",
    "originalText": "Hey, I only give them a lifetime, every one of them. What they do with it is between them and... you, I suppose.",
    "primaryEmotion": "Philosophical Warmth",
    "secondaryEmotion": "Gentle Teasing",
    "intensity": 2,
    "pace": "measured",
    "vocalEnergy": "grounded",
    "pitchAndEmphasis": "Soft, soothing reassurance on \"lifetime\"; playful fond emphasis on \"...you, I suppose\"",
    "pausesAndTiming": "Reflective hesitation before \"you, I suppose\"",
    "vocalCues": "Gentle, affectionate laugh; steam rising off morning tea",
    "emotionalArc": "Affirming that Life and Death are partners in this dance, comforting her without taking away her purpose",
    "elevenVoiceSettings": {
      "stability": 0.6,
      "similarity_boost": 0.85,
      "style": 0.25,
      "use_speaker_boost": true
    }
  },
  {
    "characterId": "laila",
    "characterName": "Laila Starr",
    "dialogueId": "s10-05",
    "sceneId": "scene-10",
    "originalText": "...he's not a baby anymore.",
    "primaryEmotion": "Chilling Resolve",
    "secondaryEmotion": "Awakened Purpose",
    "intensity": 4,
    "pace": "slow",
    "vocalEnergy": "whispered",
    "pitchAndEmphasis": "Quiet, cool, razor-sharp whisper; deliberate emphasis on \"anymore\"",
    "pausesAndTiming": "0.6s trailing silence before line; resolute closing cadence",
    "vocalCues": "Sharp, focused intake; cool calm settling into eyes",
    "emotionalArc": "Realizing eight years have passed: Darius is no longer an innocent infant. The hunt resumes.",
    "elevenVoiceSettings": {
      "stability": 0.45,
      "similarity_boost": 0.88,
      "style": 0.4,
      "use_speaker_boost": true
    }
  }
];

export function getActingDirection(dialogueId: string): ActingDirection | undefined {
  return VOICE_ACTING_BIBLE.find((d) => d.dialogueId === dialogueId);
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCKED NARRATOR PRODUCTION CONFIGURATION (Storyverse 3.1)
// ─────────────────────────────────────────────────────────────────────────────

export interface NarratorConfig {
  provider: 'elevenlabs';
  voiceName: string;
  voiceId: string;
  settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
    speed?: number;
  };
  description: string;
}

export const NARRATOR_APPROVED_CONFIG: NarratorConfig = {
  provider: 'elevenlabs',
  voiceName: 'Brian',
  voiceId: 'nPczCjzI2devNBz1zQrb',
  settings: {
    stability: 0.52,
    similarity_boost: 0.82,
    style: 0.25,
    use_speaker_boost: true,
    speed: 1.05,
  },
  description:
    'APPROVED FINAL NARRATOR (Storyverse 3.1): Brian — Warm, rich, expressive Indian English cinematic storyteller at 1.05x slightly brisker cadence, zero pitch distortion, authentic Mumbai graphic novel delivery.',
};

export interface NarrationActingDirection {
  id: string;
  sceneId: string;
  originalText: string;
  audioSrc: string;
  primaryEmotion: string;
  toneAndTexture: string;
  pacing: string;
  vocalCues: string;
  voiceSettings: NarratorConfig['settings'];
}

export const NARRATION_ACTING_BIBLE: ReadonlyArray<NarrationActingDirection> = [
  {
    id: 's00-01',
    sceneId: 'scene-00',
    originalText:
      'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline. Down where the elevated highway curves between glass towers, the city exhaled in horns and heat.',
    audioSrc: '/assets/audio/voices/narrator/scene-00-opening-canvas.mp3',
    primaryEmotion: 'Atmospheric Wonder & Grounded Urban Heat',
    toneAndTexture: 'Deep, rich chest baritone with textured vocal rasp; warm dusk resonance.',
    pacing: '1.05x slightly brisker conversational cadence; natural breathing, crisp clause boundaries.',
    vocalCues: 'Gentle acoustic breath before "It began"; seamless inflection between skyline and highway.',
    voiceSettings: { stability: 0.52, similarity_boost: 0.82, style: 0.24, use_speaker_boost: true },
  },
  {
    id: 's01-01',
    sceneId: 'scene-01',
    originalText: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.',
    audioSrc: '/assets/audio/voices/narrator/scene-01-opening.mp3',
    primaryEmotion: 'Atmospheric Wonder & Mythological Reverence',
    toneAndTexture: 'Deep, rich chest baritone with textured vocal rasp; warm dusk resonance.',
    pacing: 'Slow, expansive cinematic storytelling pace; relaxed breathing.',
    vocalCues: 'Soft acoustic breath intake before "It began"; slight lingering warmth on "Mumbai skyline".',
    voiceSettings: { stability: 0.40, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
  },
  {
    id: 's01-02',
    sceneId: 'scene-01',
    originalText: 'Down where the elevated highway curves between glass towers, the city exhaled in horns and heat.',
    audioSrc: '/assets/audio/voices/narrator/scene-01-highway.mp3',
    primaryEmotion: 'Grounded Urban Observation',
    toneAndTexture: 'World-weary warmth; textured vocal rasp on "exhaled", gentle downward lilt.',
    pacing: 'Measured, flowing cadence matching the curving highway visual.',
    vocalCues: 'Acoustic breath catch on "exhaled"; sensory weight on "horns and heat".',
    voiceSettings: { stability: 0.40, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
  },
  {
    id: 's02-conn-01',
    sceneId: 'scene-02',
    originalText: 'On the B.K.C. overpass, one city became many cities — each trapped inside its own small metal shell.',
    audioSrc: '/assets/audio/voices/narrator/scene-02-connector.mp3',
    primaryEmotion: 'Philosophical Detachment',
    toneAndTexture: 'Contemplative, low resonant timbre; reflective observation of mortal isolation.',
    pacing: 'Deliberate mid-sentence pause before "each trapped inside".',
    vocalCues: '0.3s caesura after the em-dash; intimate close-mic delivery.',
    voiceSettings: { stability: 0.42, similarity_boost: 0.85, style: 0.30, use_speaker_boost: true },
  },
  {
    id: 's03-02',
    sceneId: 'scene-03',
    originalText: '...Beneath gentle curls of raven hair, her eyes stayed fixed on distant city lights while her thoughts drifted like cigarette smoke.',
    audioSrc: '/assets/audio/voices/narrator/s03-02-window.mp3',
    primaryEmotion: 'Poetic Melancholy & Quiet Longing',
    toneAndTexture: 'Soft, intimate baritone register; velvety gravel with tender vulnerability.',
    pacing: 'Slow, floating cadence mimicking drifting smoke.',
    vocalCues: 'Hushed breath out on "cigarette smoke"; gentle vocal trailing.',
    voiceSettings: { stability: 0.38, similarity_boost: 0.85, style: 0.40, use_speaker_boost: true },
  },
  {
    id: 's04-conn-01',
    sceneId: 'scene-04',
    originalText: 'Beyond the mortal clouds, in a place where endings are drafted like memos, something unprecedented was happening.',
    audioSrc: '/assets/audio/voices/narrator/scene-04-connector.mp3',
    primaryEmotion: 'Dry Cosmic Irony & Mythological Scale',
    toneAndTexture: 'Solemn baritone gravity undercut by subtle dry wit on "drafted like memos".',
    pacing: 'Grand opening cadence transitioning into wry observation.',
    vocalCues: 'Micro-pause before "unprecedented"; subtle vocal arch.',
    voiceSettings: { stability: 0.40, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
  },
  {
    id: 's05-01',
    sceneId: 'scene-05',
    originalText: 'It was around that time that the girl from the window at the party was falling through the air — two floors down and fast approaching the ground.',
    audioSrc: '/assets/audio/voices/narrator/s05-01-fall.mp3',
    primaryEmotion: 'Dramatic Suspense & Inevitability',
    toneAndTexture: 'Tightening vocal tension; chest resonance held taut.',
    pacing: 'Decelerating delivery, suspending time on "falling through the air".',
    vocalCues: 'Held breath through "approaching the ground"; chilling calm.',
    voiceSettings: { stability: 0.38, similarity_boost: 0.85, style: 0.42, use_speaker_boost: true },
  },
  {
    id: 's05-02',
    sceneId: 'scene-05',
    originalText: "Just as she hit the ground, Mrs. Shah was in the Amravati Hospital squeezing her husband's hand with such strength that he was screaming louder than her.",
    audioSrc: '/assets/audio/voices/narrator/s05-02-birth.mp3',
    primaryEmotion: 'Tragicomic Convergence',
    toneAndTexture: 'Dual emotional texture: solemn mortal impact on "hit the ground", warm human humor on "screaming louder".',
    pacing: 'Dynamic tempo shift between the two halves of the sentence.',
    vocalCues: 'Subtle affectionate warmth on "screaming louder than her".',
    voiceSettings: { stability: 0.40, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
  },
  {
    id: 's05-03',
    sceneId: 'scene-05',
    originalText: 'As the midwife urged her into one last push, a new life came into being. A beautiful thing that would go on to be the cause of much consternation in his many years to come.',
    audioSrc: '/assets/audio/voices/narrator/s05-03-darius.mp3',
    primaryEmotion: 'Prophetic Portent & Mythological Grandeur',
    toneAndTexture: 'Full, resonant chest baritone; majestic, timeless storytelling presence.',
    pacing: 'Stately, measured pacing with lingering emphasis on "consternation".',
    vocalCues: 'Deep chest resonance on "A beautiful thing"; fateful drop on "many years to come".',
    voiceSettings: { stability: 0.40, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
  },
  {
    id: 's06-conn-01',
    sceneId: 'scene-06',
    originalText: 'A deal was being struck — the kind that bends the fabric of everything.',
    audioSrc: '/assets/audio/voices/narrator/scene-06-connector.mp3',
    primaryEmotion: 'Cosmic Weight & Irreversible Consequence',
    toneAndTexture: 'Low, rumbling baritone gravel; cosmic quietude.',
    pacing: 'Deliberate pause at em-dash; heavy, downward-pitch conclusion.',
    vocalCues: '0.4s breathless pause; deep gravel on "everything".',
    voiceSettings: { stability: 0.42, similarity_boost: 0.85, style: 0.32, use_speaker_boost: true },
  },
  {
    id: 's07-conn-01',
    sceneId: 'scene-07',
    originalText: 'She woke up in a body that felt borrowed, in a room that smelled of antiseptic and second chances.',
    audioSrc: '/assets/audio/voices/narrator/scene-07-connector.mp3',
    primaryEmotion: 'Fragile Mortal Awakening',
    toneAndTexture: 'Intimate, close-mic rasp; soft, compassionate observation.',
    pacing: 'Gentle, unhurried cadence with tactile pauses.',
    vocalCues: 'Subtle vocal breathiness on "borrowed"; warm acoustic landing on "second chances".',
    voiceSettings: { stability: 0.38, similarity_boost: 0.85, style: 0.38, use_speaker_boost: true },
  },
  {
    id: 's08-conn-01',
    sceneId: 'scene-08',
    originalText: 'The neo-natal ward held its breath. Death held a baby.',
    audioSrc: '/assets/audio/voices/narrator/scene-08-connector.mp3',
    primaryEmotion: 'Breathless Stillness & Paradoxical Tenderness',
    toneAndTexture: 'Very quiet, hushed baritone whisper; reverent awe.',
    pacing: 'Substantial pause between the two short sentences; immense stillness.',
    vocalCues: 'Acoustic inhale during pause; gentle drop in pitch on "held a baby".',
    voiceSettings: { stability: 0.40, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
  },
  {
    id: 's09-01',
    sceneId: 'scene-09',
    originalText: 'And in Mumbai, even at that late hour, great thundering wheels of commerce rolled on unfettered.',
    audioSrc: '/assets/audio/voices/narrator/s09-01-commerce.mp3',
    primaryEmotion: 'Inexorable Mechanical Momentum',
    toneAndTexture: 'Deep, driving baritone projection; heavy acoustic weight.',
    pacing: 'Rhythmic, inexorable cadence mirroring heavy truck tires on wet highway.',
    vocalCues: 'Strong chest resonance on "thundering wheels"; cutting clarity on "unfettered".',
    voiceSettings: { stability: 0.40, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
  },
  {
    id: 's09-02',
    sceneId: 'scene-09',
    originalText: 'And so, only a few minutes away from midnight, Laila Starr met her death once again.',
    audioSrc: '/assets/audio/voices/narrator/s09-02-midnight.mp3',
    primaryEmotion: 'Poetic Fatalism & Tragedy',
    toneAndTexture: 'Somber, melancholic baritone; quiet grief overlaid with destiny.',
    pacing: 'Slow, deliberate descent toward finality.',
    vocalCues: 'Soft trailing vocal decay on "once again"; quiet acoustic landing.',
    voiceSettings: { stability: 0.38, similarity_boost: 0.85, style: 0.40, use_speaker_boost: true },
  },
  {
    id: 's10-conn-01',
    sceneId: 'scene-10',
    originalText: 'Eight years later, the sun rose anyway — as it always has, as it always will.',
    audioSrc: '/assets/audio/voices/narrator/scene-10-connector.mp3',
    primaryEmotion: 'Enduring Peace & Philosophical Timelessness',
    toneAndTexture: 'Warm, sunlit baritone resolution; comforting acoustic warmth and peace.',
    pacing: 'Expansive, peaceful, rhythmic cadence.',
    vocalCues: 'Gentle warm sigh in the voice on "anyway"; lingering serene fade on "always will".',
    voiceSettings: { stability: 0.42, similarity_boost: 0.85, style: 0.30, use_speaker_boost: true },
  },
];

export function getNarrationDirection(narrationId: string): NarrationActingDirection | undefined {
  return NARRATION_ACTING_BIBLE.find((n) => n.id === narrationId);
}

