/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * scripts/build-voice-acting-bible.ts
 *
 * Generates the complete canonical Voice Acting Bible for all 34 unique character lines.
 * Outputs:
 * - src/audio/voiceActingBible.ts
 * - docs/voice-acting-bible.md
 */

import fs from 'node:fs';
import path from 'node:path';

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

export const ACTING_BIBLE: ReadonlyArray<ActingDirection> = [
  // ── Scene 02: Traffic ───────────────────────────────────────────────────────
  {
    characterId: 'mrs_shah',
    characterName: 'Mrs. Shah',
    dialogueId: 's02-01',
    sceneId: 'scene-02',
    originalText: 'I told you we should have left an hour ago! Do you hear this traffic?!',
    primaryEmotion: 'Frustration',
    secondaryEmotion: 'Labor Pain Urgency',
    intensity: 4,
    pace: 'rapid',
    vocalEnergy: 'projected',
    pitchAndEmphasis: 'Sharp, rising pitch on "hour ago", harsh cutting emphasis on "traffic"',
    pausesAndTiming: 'Sharp intake of breath at start; 0.2s pause before question',
    vocalCues: 'Painful gasp on inhale; breathless strain through clenched teeth',
    emotionalArc: 'Starts with accusatory marital irritation, immediately overwhelmed by a sudden labor contraction',
    elevenVoiceSettings: { stability: 0.32, similarity_boost: 0.85, style: 0.55, use_speaker_boost: true },
  },
  {
    characterId: 'driver',
    characterName: 'Cab Driver',
    dialogueId: 's02-02',
    sceneId: 'scene-02',
    originalText: 'Madam, hold on—every lane is locked solid across B.K.C.!',
    primaryEmotion: 'Stress',
    secondaryEmotion: 'Defensive Empathy',
    intensity: 3,
    pace: 'rapid',
    vocalEnergy: 'projected',
    pitchAndEmphasis: 'Mid-register shout over car horn; emphasis on "hold on" and "locked solid"',
    pausesAndTiming: '0.15s dash pause after "hold on"; rushed delivery on "across B.K.C."',
    vocalCues: 'Strained voice fighting street noise; slight defensive grunt on wheel turn',
    emotionalArc: 'Instinctive defense against customer yelling, turning into genuine helplessness about the traffic jam',
    elevenVoiceSettings: { stability: 0.40, similarity_boost: 0.80, style: 0.45, use_speaker_boost: true },
  },
  {
    characterId: 'mrs_shah',
    characterName: 'Mrs. Shah',
    dialogueId: 's02-03',
    sceneId: 'scene-02',
    originalText: '...The baby is coming.',
    primaryEmotion: 'Vulnerability',
    secondaryEmotion: 'Awe & Dread',
    intensity: 5,
    pace: 'slow',
    vocalEnergy: 'whispered',
    pitchAndEmphasis: 'Drop to low register; trembling whisper on "baby is coming"',
    pausesAndTiming: '0.6s trailing silence before line; slow, deliberate syllables',
    vocalCues: 'Quiet, shuddering exhale; wet breath catch at end',
    emotionalArc: 'Sudden stillness cutting through traffic chaos; realization that labor has begun right in the cab',
    elevenVoiceSettings: { stability: 0.45, similarity_boost: 0.90, style: 0.35, use_speaker_boost: true },
  },

  // ── Scene 03: College Party ─────────────────────────────────────────────────
  {
    characterId: 'dhiraj',
    characterName: 'Dhiraj',
    dialogueId: 's03-01',
    sceneId: 'scene-03',
    originalText: 'Listen, the whole discourse still reproduces the same patriarchal power equations—nobody actually examines who holds the lens.',
    primaryEmotion: 'Intellectual Pretentiousness',
    secondaryEmotion: 'Performative Earnestness',
    intensity: 2,
    pace: 'moderate',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Slightly nasal mid-tone; patronizing emphasis on "discourse" and "holds the lens"',
    pausesAndTiming: 'Casual party conversational flow; slight 0.2s pause at em-dash',
    vocalCues: 'Smug half-breath chuckle before "nobody actually examines"',
    emotionalArc: 'Unprompted lecture at a noisy party, completely oblivious to his listener drifting toward the window',
    elevenVoiceSettings: { stability: 0.65, similarity_boost: 0.75, style: 0.20, use_speaker_boost: true },
  },

  // ── Scene 04: Death\'s World (Elevator & Boardroom) ───────────────────────────
  {
    characterId: 'death',
    characterName: 'Death',
    dialogueId: 's04-01',
    sceneId: 'scene-04',
    originalText: 'Hold the door!',
    primaryEmotion: 'Impatient Authority',
    secondaryEmotion: 'Mild Annoyance',
    intensity: 3,
    pace: 'rapid',
    vocalEnergy: 'projected',
    pitchAndEmphasis: 'Regal, sharp command; heavy dynamic punch on "door"',
    pausesAndTiming: 'Abrupt, clipped delivery',
    vocalCues: 'Rushing heel footsteps; swift, resonant breath',
    emotionalArc: 'The absolute ruler of mortal endings expecting corporate elevators to wait for her',
    elevenVoiceSettings: { stability: 0.45, similarity_boost: 0.85, style: 0.40, use_speaker_boost: true },
  },
  {
    characterId: 'agni',
    characterName: 'Agni',
    dialogueId: 's04-02',
    sceneId: 'scene-04',
    originalText: 'This way, please. He is expecting you.',
    primaryEmotion: 'Polite Bureaucracy',
    secondaryEmotion: 'Suppressed Nervousness',
    intensity: 2,
    pace: 'measured',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Smooth corporate receptionist tone; deference on "He is expecting you"',
    pausesAndTiming: 'Paced, formal rhythm; 0.3s comma pause after "please"',
    vocalCues: 'Crisp enunciation; quiet professional intake',
    emotionalArc: 'Carefully neutral administrative professionalism concealing the impending disaster',
    elevenVoiceSettings: { stability: 0.70, similarity_boost: 0.80, style: 0.15, use_speaker_boost: true },
  },
  {
    characterId: 'god',
    characterName: 'Purveyor of All Goodness',
    dialogueId: 's04-03',
    sceneId: 'scene-04',
    originalText: 'Come, come. Have a seat.',
    primaryEmotion: 'Casual Warmth',
    secondaryEmotion: 'Corporate Euphemism',
    intensity: 1,
    pace: 'moderate',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Booming, affable executive baritone; warm descent on "Have a seat"',
    pausesAndTiming: 'Breezy cadence; light pause between "Come, come" and invitation',
    vocalCues: 'Friendly vocal chuckle; arm gesture rustle',
    emotionalArc: 'Disarming faux-paternal friendliness designed to cushion an execution',
    elevenVoiceSettings: { stability: 0.60, similarity_boost: 0.80, style: 0.25, use_speaker_boost: true },
  },
  {
    characterId: 'god',
    characterName: 'Purveyor of All Goodness',
    dialogueId: 's04-04',
    sceneId: 'scene-04',
    originalText: "So, Death... tell me, how're things? Work, life, friendships... hobbies?",
    primaryEmotion: 'Forced Small Talk',
    secondaryEmotion: 'Executive Detachment',
    intensity: 2,
    pace: 'moderate',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Inquisitive upward inflection on "things?", playful enumeration on "hobbies?"',
    pausesAndTiming: '0.4s pause after "Death..."; trailing pauses between checklist items',
    vocalCues: 'Amused throat clearing; leisurely chair swivel',
    emotionalArc: 'Superficial 1-on-1 performance review checklist before dropping the hammer',
    elevenVoiceSettings: { stability: 0.55, similarity_boost: 0.80, style: 0.30, use_speaker_boost: true },
  },
  {
    characterId: 'death',
    characterName: 'Death',
    dialogueId: 's04-05',
    sceneId: 'scene-04',
    originalText: 'W-what am I doing here, Sir?',
    primaryEmotion: 'Suspicion',
    secondaryEmotion: 'Unsettled Vulnerability',
    intensity: 3,
    pace: 'measured',
    vocalEnergy: 'intimate',
    pitchAndEmphasis: 'Stutter on "W-what"; guarded hesitation on formal "Sir"',
    pausesAndTiming: 'Micro-stumble on opening syllable; guarded silence before "Sir"',
    vocalCues: 'Subtle throat swallow; cautious breath',
    emotionalArc: 'Regal confidence faltering as instinct detects an existential ambush',
    elevenVoiceSettings: { stability: 0.40, similarity_boost: 0.85, style: 0.45, use_speaker_boost: true },
  },
  {
    characterId: 'god',
    characterName: 'Purveyor of All Goodness',
    dialogueId: 's04-06',
    sceneId: 'scene-04',
    originalText: "How long have you been with us, Death? Feels like an eternity, doesn't it?",
    primaryEmotion: 'Feigned Nostalgia',
    secondaryEmotion: 'Calculated Setup',
    intensity: 2,
    pace: 'measured',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Wistful pitch slide on "eternity"; conversational tag on "doesn\'t it?"',
    pausesAndTiming: '0.3s break between rhetorical questions',
    vocalCues: 'Gentle nostalgic smile audible in tone',
    emotionalArc: 'Setting up the semantic joke before pulling the rug out',
    elevenVoiceSettings: { stability: 0.60, similarity_boost: 0.80, style: 0.25, use_speaker_boost: true },
  },
  {
    characterId: 'death',
    characterName: 'Death',
    dialogueId: 's04-07',
    sceneId: 'scene-04',
    originalText: 'I have actually been here for an eternity.',
    primaryEmotion: 'Deadpan Literalism',
    secondaryEmotion: 'Cosmic Pride',
    intensity: 2,
    pace: 'slow',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Flat, dry, aristocratic delivery; deliberate emphasis on "actually" and "eternity"',
    pausesAndTiming: 'Even, unhurried syllable spacing',
    vocalCues: 'Cool, steady exhale; zero amusement',
    emotionalArc: 'Stating ontological fact to remind him who he is speaking to',
    elevenVoiceSettings: { stability: 0.50, similarity_boost: 0.85, style: 0.25, use_speaker_boost: true },
  },
  {
    characterId: 'god',
    characterName: 'Purveyor of All Goodness',
    dialogueId: 's04-08',
    sceneId: 'scene-04',
    originalText: "Yes, Death. I'm afraid we're letting you go.",
    primaryEmotion: 'Casual Indifference',
    secondaryEmotion: 'Mild Sympathy',
    intensity: 3,
    pace: 'measured',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Downward, final cadence on "letting you go"; calm, flat, boardroom finality',
    pausesAndTiming: '0.3s pause after "Yes, Death."',
    vocalCues: 'Soft sigh of mild managerial inconvenience',
    emotionalArc: 'Firing an immortal cosmic consequence as if cancelling a software subscription',
    elevenVoiceSettings: { stability: 0.65, similarity_boost: 0.80, style: 0.20, use_speaker_boost: true },
  },
  {
    characterId: 'death',
    characterName: 'Death',
    dialogueId: 's04-09',
    sceneId: 'scene-04',
    originalText: "WHAT?! I'm an absolute consequence. It's in the job description! Send down a plague! Strike the child with lightning!",
    primaryEmotion: 'Outrage',
    secondaryEmotion: 'Desperate Indignation',
    intensity: 5,
    pace: 'rapid',
    vocalEnergy: 'explosive',
    pitchAndEmphasis: 'Screamed high-register "WHAT?!"; furious staccato on "job description!"; booming commands on "plague!" and "lightning!"',
    pausesAndTiming: 'Violent gasp after "WHAT?!"; rapid-fire demands without breathing',
    vocalCues: 'Voice cracking with celestial rage; fierce air blast',
    emotionalArc: 'Cosmic authority shattered in an instant, exploding into pure indignant rebellion',
    elevenVoiceSettings: { stability: 0.22, similarity_boost: 0.85, style: 0.70, use_speaker_boost: true },
  },
  {
    characterId: 'god',
    characterName: 'Purveyor of All Goodness',
    dialogueId: 's04-10',
    sceneId: 'scene-04',
    originalText: 'You know how corporate feels about that kind of stuff.',
    primaryEmotion: 'Dismissive Amusement',
    secondaryEmotion: 'Bureaucratic Finality',
    intensity: 2,
    pace: 'moderate',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Casual shrug in tone; dismissive slur on "that kind of stuff"',
    pausesAndTiming: 'Unbothered, relaxed timing',
    vocalCues: 'Dry chuckle; light wave of the hand',
    emotionalArc: 'Brushing off apocalyptic plagues as a minor PR headache',
    elevenVoiceSettings: { stability: 0.62, similarity_boost: 0.80, style: 0.25, use_speaker_boost: true },
  },
  {
    characterId: 'death',
    characterName: 'Death',
    dialogueId: 's04-11',
    sceneId: 'scene-04',
    originalText: 'This is all I\'ve ever done. What am I supposed to do?',
    primaryEmotion: 'Existential Despair',
    secondaryEmotion: 'Quiet Helplessness',
    intensity: 4,
    pace: 'slow',
    vocalEnergy: 'whispered',
    pitchAndEmphasis: 'Low, hollow register; vulnerable rising query on "supposed to do?"',
    pausesAndTiming: '0.5s dead silence after first sentence; fragile second sentence',
    vocalCues: 'Trembling voice; quiet, hollow exhale; tears held back',
    emotionalArc: 'The goddess of death reduced to an unemployed mortal, staring into an empty void',
    elevenVoiceSettings: { stability: 0.38, similarity_boost: 0.88, style: 0.50, use_speaker_boost: true },
  },

  // ── Scene 06: The Bargain ───────────────────────────────────────────────────
  {
    characterId: 'death',
    characterName: 'Death',
    dialogueId: 's06-01',
    sceneId: 'scene-06',
    originalText: 'Agni?',
    primaryEmotion: 'Hesitant Manipulation',
    secondaryEmotion: 'Tentative Hope',
    intensity: 2,
    pace: 'slow',
    vocalEnergy: 'intimate',
    pitchAndEmphasis: 'Soft, questioning upward inflection; unusually gentle',
    pausesAndTiming: 'Single word lingering in empty corridor',
    vocalCues: 'Quiet step forward; soft throat clearing',
    emotionalArc: 'Probing her subordinate to see if loyalty still survives termination',
    elevenVoiceSettings: { stability: 0.48, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
  },
  {
    characterId: 'agni',
    characterName: 'Agni',
    dialogueId: 's06-02',
    sceneId: 'scene-06',
    originalText: "I know what you're thinking and the answer is no.",
    primaryEmotion: 'Firm Resistance',
    secondaryEmotion: 'Defensive Guilt',
    intensity: 3,
    pace: 'rapid',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Flat refusal; hard emphasis on "no"',
    pausesAndTiming: 'Fast, preemptive cut-off before she can speak',
    vocalCues: 'Snappy enunciation; averting eyes',
    emotionalArc: 'Trying to protect his own job by shutting down treason immediately',
    elevenVoiceSettings: { stability: 0.55, similarity_boost: 0.80, style: 0.30, use_speaker_boost: true },
  },
  {
    characterId: 'agni',
    characterName: 'Agni',
    dialogueId: 's06-03',
    sceneId: 'scene-06',
    originalText: 'Oh, fiiiine... fine, what do you want?',
    primaryEmotion: 'Exasperation',
    secondaryEmotion: 'Grudging Loyalty',
    intensity: 3,
    pace: 'moderate',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Drawn out groan on "fiiiine"; resigned descent on "what do you want?"',
    pausesAndTiming: 'Elongated vowel; weary pause before question',
    vocalCues: 'Heavy, defeated sigh; shoulder slump',
    emotionalArc: 'Inevitably folding under his former boss\'s imposing presence',
    elevenVoiceSettings: { stability: 0.45, similarity_boost: 0.80, style: 0.40, use_speaker_boost: true },
  },
  {
    characterId: 'death',
    characterName: 'Death',
    dialogueId: 's06-04',
    sceneId: 'scene-06',
    originalText: 'When you send me down and give me a mortal body, can you put me close to the child?',
    primaryEmotion: 'Calculated Determination',
    secondaryEmotion: 'Concealed Vengeance',
    intensity: 3,
    pace: 'measured',
    vocalEnergy: 'intimate',
    pitchAndEmphasis: 'Conspiratorial whisper; subtle emphasis on "close to the child"',
    pausesAndTiming: 'Carefully measured cadence; conspiratorial proximity',
    vocalCues: 'Lowered vocal register; tight focused breath',
    emotionalArc: 'Laying the trap — disguising an assassination mission as a relocation favor',
    elevenVoiceSettings: { stability: 0.52, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
  },
  {
    characterId: 'death',
    characterName: 'Death',
    dialogueId: 's06-05',
    sceneId: 'scene-06',
    originalText: "I'll be a mortal then. My actions. My consequences.",
    primaryEmotion: 'Defiant Pride',
    secondaryEmotion: 'Grim Resolution',
    intensity: 4,
    pace: 'slow',
    vocalEnergy: 'projected',
    pitchAndEmphasis: 'Staccato, oath-like rhythm on "My actions. My consequences."',
    pausesAndTiming: 'Heavy 0.4s pauses between each declarative sentence',
    vocalCues: 'Resonant chest delivery; firm jaw',
    emotionalArc: 'Accepting mortality not as a punishment, but as a loophole for revenge',
    elevenVoiceSettings: { stability: 0.42, similarity_boost: 0.88, style: 0.45, use_speaker_boost: true },
  },

  // ── Scene 07: Hospital Awakening ────────────────────────────────────────────
  {
    characterId: 'laila',
    characterName: 'Laila Starr',
    dialogueId: 's07-01',
    sceneId: 'scene-07',
    originalText: 'Ohhhhh, that feels awful.',
    primaryEmotion: 'Physical Agony',
    secondaryEmotion: 'Grogginess',
    intensity: 4,
    pace: 'slow',
    vocalEnergy: 'whispered',
    pitchAndEmphasis: 'Long groaning vocal fry on "Ohhhhh"; raspy, dry emphasis on "awful"',
    pausesAndTiming: 'Slow awakening struggle; words barely formed',
    vocalCues: 'Deep pained groan; dry mouth swallow; ragged intake',
    emotionalArc: 'First sensation of human nerve endings after falling six stories: pure blunt agony',
    elevenVoiceSettings: { stability: 0.28, similarity_boost: 0.85, style: 0.60, use_speaker_boost: true },
  },
  {
    characterId: 'munmun',
    characterName: 'Munmun',
    dialogueId: 's07-02',
    sceneId: 'scene-07',
    originalText: 'Yeah, well... you were dead for a good twenty minutes or so.',
    primaryEmotion: 'Childlike Casuallness',
    secondaryEmotion: 'Fascinated Amusement',
    intensity: 2,
    pace: 'moderate',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Breezy boyish shrug; casual emphasis on "twenty minutes or so"',
    pausesAndTiming: 'Light pause after "Yeah, well..."',
    vocalCues: 'Floating spectral resonance; youthful airy timbre',
    emotionalArc: 'A ghost boy stating medical resuscitation as if discussing yesterday\'s cartoon',
    elevenVoiceSettings: { stability: 0.55, similarity_boost: 0.80, style: 0.30, use_speaker_boost: true },
  },
  {
    characterId: 'laila',
    characterName: 'Laila Starr',
    dialogueId: 's07-03',
    sceneId: 'scene-07',
    originalText: "Who're you?",
    primaryEmotion: 'Disorientation',
    secondaryEmotion: 'Wary Confusion',
    intensity: 3,
    pace: 'slow',
    vocalEnergy: 'intimate',
    pitchAndEmphasis: 'Hoarse, rasping whisper; guarded rise on "you?"',
    pausesAndTiming: 'Strained single breath',
    vocalCues: 'Weak breath; squinting eye flutter in voice',
    emotionalArc: 'Trying to focus blurry mortal vision on a glowing spectral child floating above her bed',
    elevenVoiceSettings: { stability: 0.45, similarity_boost: 0.85, style: 0.40, use_speaker_boost: true },
  },
  {
    characterId: 'munmun',
    characterName: 'Munmun',
    dialogueId: 's07-04',
    sceneId: 'scene-07',
    originalText: "I-I'm a ghost! And your name... it's on your wrist.",
    primaryEmotion: 'Eager Self-Importance',
    secondaryEmotion: 'Helpful Curiosity',
    intensity: 3,
    pace: 'rapid',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Proud stutter on "I-I\'m a ghost!"; pointing excitement on "on your wrist"',
    pausesAndTiming: 'Excited burst; brief pause after "name..." as he gestures',
    vocalCues: 'Boyish giggle; enthusiastic whisper',
    emotionalArc: 'Thrilled to meet someone who can actually see and hear him in the hospital ward',
    elevenVoiceSettings: { stability: 0.40, similarity_boost: 0.80, style: 0.45, use_speaker_boost: true },
  },
  {
    characterId: 'laila',
    characterName: 'Laila Starr',
    dialogueId: 's07-05',
    sceneId: 'scene-07',
    originalText: 'L-Laila Starr...',
    primaryEmotion: 'Disbelief',
    secondaryEmotion: 'Alien Identity',
    intensity: 3,
    pace: 'slow',
    vocalEnergy: 'whispered',
    pitchAndEmphasis: 'Unfamiliar mouth shape on "L-Laila"; trailing murmur on "Starr..."',
    pausesAndTiming: 'Slowly reading letter by letter off plastic wristband',
    vocalCues: 'Faint tremble; breath of strange novelty',
    emotionalArc: 'Death testing her new human name for the very first time on her tongue',
    elevenVoiceSettings: { stability: 0.42, similarity_boost: 0.88, style: 0.40, use_speaker_boost: true },
  },
  {
    characterId: 'munmun',
    characterName: 'Munmun',
    dialogueId: 's07-06',
    sceneId: 'scene-07',
    originalText: 'So... what next, Laila Starr?',
    primaryEmotion: 'Inquisitive Excitement',
    secondaryEmotion: 'Adventure Anticipation',
    intensity: 3,
    pace: 'moderate',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Playful lilt on "what next"; melodic pronunciation of full name',
    pausesAndTiming: '0.3s pause after "So..."; inviting cadence',
    vocalCues: 'Eager boyish smile audible',
    emotionalArc: 'Inviting her into whatever wild scheme comes next',
    elevenVoiceSettings: { stability: 0.50, similarity_boost: 0.80, style: 0.35, use_speaker_boost: true },
  },

  // ── Scene 08: The Neo-Natal Ward & Escape ────────────────────────────────────
  {
    characterId: 'munmun',
    characterName: 'Munmun',
    dialogueId: 's08-01',
    sceneId: 'scene-08',
    originalText: "His name is Darius. He's got a name! You can't kill someone with a name!",
    primaryEmotion: 'Panic & Urgency',
    secondaryEmotion: 'Desperate Moral Pleading',
    intensity: 5,
    pace: 'breathless',
    vocalEnergy: 'explosive',
    pitchAndEmphasis: 'Shrill, frantic pitch on "Darius"; breaking voice on "someone with a name!"',
    pausesAndTiming: 'Rapid-fire, gasping staccato between sentences',
    vocalCues: 'Tearful break; desperate air intake; trembling ghost echo',
    emotionalArc: 'A terrified child screaming the ultimate moral barrier to stop an executioner',
    elevenVoiceSettings: { stability: 0.20, similarity_boost: 0.85, style: 0.70, use_speaker_boost: true },
  },
  {
    characterId: 'laila',
    characterName: 'Laila Starr',
    dialogueId: 's08-02',
    sceneId: 'scene-08',
    originalText: 'What? W-why did you tell me that? I... I can\'t!',
    primaryEmotion: 'Horrified Hesitation',
    secondaryEmotion: 'Crushing Guilt',
    intensity: 5,
    pace: 'breathless',
    vocalEnergy: 'projected',
    pitchAndEmphasis: 'Choked stutter on "W-why"; breaking falter on "I... I can\'t!"',
    pausesAndTiming: 'Fractured pauses; gasping breath between "I..." and "I can\'t!"',
    vocalCues: 'Sudden sharp sob; trembling hands audible in vocal vibration',
    emotionalArc: 'Her cold cosmic purpose destroyed by the weight of a baby\'s humanity',
    elevenVoiceSettings: { stability: 0.22, similarity_boost: 0.90, style: 0.75, use_speaker_boost: true },
  },
  {
    characterId: 'security',
    characterName: 'Hospital Guard',
    dialogueId: 's08-03',
    sceneId: 'scene-08',
    originalText: 'There she is! Oh my God—she\'s alive! Hey you! Put that baby down!',
    primaryEmotion: 'Shocked Alarm',
    secondaryEmotion: 'Authoritative Panic',
    intensity: 4,
    pace: 'rapid',
    vocalEnergy: 'explosive',
    pitchAndEmphasis: 'Stunned gasp on "alive!"; harsh commanding bark on "Put that baby down!"',
    pausesAndTiming: 'Disbelief dash at "Oh my God—"; abrupt shouting rhythm',
    vocalCues: 'Heavy running boot footsteps; chest heavy shout',
    emotionalArc: 'Seeing a dead patient resurrected and holding a baby, instantly switching to law enforcement crisis mode',
    elevenVoiceSettings: { stability: 0.35, similarity_boost: 0.82, style: 0.50, use_speaker_boost: true },
  },

  // ── Scene 10: Eight Years Later (Epilogue) ──────────────────────────────────
  {
    characterId: 'laila',
    characterName: 'Laila Starr',
    dialogueId: 's10-01',
    sceneId: 'scene-10',
    originalText: 'Have you been standing there watching me sleep this whole time? Ugggh... what happened? How did I get here?',
    primaryEmotion: 'Groggy Irritation',
    secondaryEmotion: 'Baffled Disorientation',
    intensity: 3,
    pace: 'moderate',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Dry, waking morning rasp; grumbling groan on "Ugggh..."; bewildered rise on "get here?"',
    pausesAndTiming: 'Groan separates the suspicion from the existential confusion',
    vocalCues: 'Morning throat rasp; waking yawn/groan; rubbing eyes sound in voice',
    emotionalArc: 'Waking up after eight years in limbo, irritated that her friend is staring at her like a creep',
    elevenVoiceSettings: { stability: 0.38, similarity_boost: 0.85, style: 0.45, use_speaker_boost: true },
  },
  {
    characterId: 'pranah',
    characterName: 'Pranah',
    dialogueId: 's10-02',
    sceneId: 'scene-10',
    originalText: 'You died. Run over by a twelve-wheeler. But I brought you back.',
    primaryEmotion: 'Affectionate Calm',
    secondaryEmotion: 'Casual Omnipotence',
    intensity: 2,
    pace: 'slow',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Gentle, warm, steady baritone; matter-of-fact drop on "twelve-wheeler"; tender warmth on "brought you back"',
    pausesAndTiming: '0.4s pause between short, punchy factual declarations',
    vocalCues: 'Warm morning tea sipping breath; affectionate smile',
    emotionalArc: 'Explaining a horrific road death over morning chai with supreme divine calm',
    elevenVoiceSettings: { stability: 0.65, similarity_boost: 0.85, style: 0.20, use_speaker_boost: true },
  },
  {
    characterId: 'laila',
    characterName: 'Laila Starr',
    dialogueId: 's10-03',
    sceneId: 'scene-10',
    originalText: "I couldn't do it, Pran. He was just a baby... How could you bring someone like that into being?",
    primaryEmotion: 'Lingering Grief',
    secondaryEmotion: 'Moral Accusation',
    intensity: 4,
    pace: 'slow',
    vocalEnergy: 'intimate',
    pitchAndEmphasis: 'Soft, tender, vulnerable drop on "Pran"; heavy mournful question on "into being?"',
    pausesAndTiming: '0.4s trailing pause after "baby..."; deep breath before accusation',
    vocalCues: 'Subtle voice break; aching quiet exhale',
    emotionalArc: 'Confessing her failure to kill the child, and confronting Life itself for inventing mortality',
    elevenVoiceSettings: { stability: 0.32, similarity_boost: 0.88, style: 0.55, use_speaker_boost: true },
  },
  {
    characterId: 'pranah',
    characterName: 'Pranah',
    dialogueId: 's10-04',
    sceneId: 'scene-10',
    originalText: 'Hey, I only give them a lifetime, every one of them. What they do with it is between them and... you, I suppose.',
    primaryEmotion: 'Philosophical Warmth',
    secondaryEmotion: 'Gentle Teasing',
    intensity: 2,
    pace: 'measured',
    vocalEnergy: 'grounded',
    pitchAndEmphasis: 'Soft, soothing reassurance on "lifetime"; playful fond emphasis on "...you, I suppose"',
    pausesAndTiming: 'Reflective hesitation before "you, I suppose"',
    vocalCues: 'Gentle, affectionate laugh; steam rising off morning tea',
    emotionalArc: 'Affirming that Life and Death are partners in this dance, comforting her without taking away her purpose',
    elevenVoiceSettings: { stability: 0.60, similarity_boost: 0.85, style: 0.25, use_speaker_boost: true },
  },
  {
    characterId: 'laila',
    characterName: 'Laila Starr',
    dialogueId: 's10-05',
    sceneId: 'scene-10',
    originalText: "...he's not a baby anymore.",
    primaryEmotion: 'Chilling Resolve',
    secondaryEmotion: 'Awakened Purpose',
    intensity: 4,
    pace: 'slow',
    vocalEnergy: 'whispered',
    pitchAndEmphasis: 'Quiet, cool, razor-sharp whisper; deliberate emphasis on "anymore"',
    pausesAndTiming: '0.6s trailing silence before line; resolute closing cadence',
    vocalCues: 'Sharp, focused intake; cool calm settling into eyes',
    emotionalArc: 'Realizing eight years have passed: Darius is no longer an innocent infant. The hunt resumes.',
    elevenVoiceSettings: { stability: 0.45, similarity_boost: 0.88, style: 0.40, use_speaker_boost: true },
  },
];

async function main() {
  console.log(`Writing Voice Acting Bible for all ${ACTING_BIBLE.length} character dialogue lines...`);

  // 1. Write TypeScript module
  const tsContent = `/**
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

export const VOICE_ACTING_BIBLE: ReadonlyArray<ActingDirection> = ${JSON.stringify(ACTING_BIBLE, null, 2)};

export function getActingDirection(dialogueId: string): ActingDirection | undefined {
  return VOICE_ACTING_BIBLE.find((d) => d.dialogueId === dialogueId);
}
`;

  fs.writeFileSync('src/audio/voiceActingBible.ts', tsContent, 'utf-8');
  console.log('  ✓ Wrote src/audio/voiceActingBible.ts');

  // 2. Write Markdown documentation
  let mdContent = `# STORYVERSE — CANONICAL VOICE ACTING BIBLE (AUDIO EXPERIENCE 2.0)

**Document Status:** Production Reference  
**Total Dialogue Lines:** ${ACTING_BIBLE.length}  
**Coverage:** 100% of all speaking cast dialogue in Chapter 01  

---

## Acting Performance Principles

1. **Performances, Not Readings**: Characters must never sound like text-to-speech reading words aloud. Every line has psychological motivation, physical state, and subtext.
2. **Dynamic Stability & Style**: High-intensity lines (e.g. Death's outrage, Munmun's panic) use reduced stability (\`0.20 – 0.35\`) and elevated style (\`0.55 – 0.75\`) to induce realistic vocal breaks, breathlessness, and emotional extremity.
3. **Physicality & Respiration**: Sobs, gasps, groans, laughs, and whispered hesitations are explicitly directed and choreographed.
4. **Consistency Across Shifts**: Characters retain their core acoustic vocal print while freely moving through varied emotional states.

---

## Complete 34-Line Performance Direction Table

| ID | Scene | Character | Original Dialogue | Primary Emotion | Intensity (1-5) | Vocal Energy | Acting Direction Summary |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
`;

  for (const item of ACTING_BIBLE) {
    mdContent += `| \`${item.dialogueId}\` | ${item.sceneId} | **${item.characterName}** | "${item.originalText}" | ${item.primaryEmotion} (${item.secondaryEmotion}) | ${item.intensity}/5 | ${item.vocalEnergy} (${item.pace}) | ${item.emotionalArc}. *${item.vocalCues}* |\n`;
  }

  mdContent += `\n---\n\n## Detailed Scene-by-Scene Acting Profiles\n\n`;

  for (const item of ACTING_BIBLE) {
    mdContent += `### Line \`${item.dialogueId}\` — ${item.characterName} (${item.sceneId})
- **Dialogue**: *"${item.originalText}"*
- **Primary / Secondary Emotion**: ${item.primaryEmotion} / ${item.secondaryEmotion}
- **Intensity & Energy**: Intensity ${item.intensity}/5 | Energy: \`${item.vocalEnergy}\` | Pace: \`${item.pace}\`
- **Pitch & Emphasis**: ${item.pitchAndEmphasis}
- **Timing & Pauses**: ${item.pausesAndTiming}
- **Vocal Cues (Respiration/Sound)**: ${item.vocalCues}
- **Emotional Arc**: ${item.emotionalArc}
- **ElevenLabs Engine Settings**: Stability: \`${item.elevenVoiceSettings.stability}\`, Similarity: \`${item.elevenVoiceSettings.similarity_boost}\`, Style: \`${item.elevenVoiceSettings.style}\`, Speaker Boost: \`true\`

`;
  }

  fs.writeFileSync('docs/voice-acting-bible.md', mdContent, 'utf-8');
  console.log('  ✓ Wrote docs/voice-acting-bible.md');
}

main().catch(console.error);
