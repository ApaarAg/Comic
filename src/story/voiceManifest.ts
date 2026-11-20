import {
  CHAPTER_DIALOGUE_SEQUENCES,
  type CharacterId,
  type DialoguePresentationMode,
  type DialogueSourceOrigin,
} from './dialogueManifest';

export interface VoiceAssetRequirement {
  lineId: string;
  sceneId: string;
  character: CharacterId;
  speakerLabel: string;
  mode: DialoguePresentationMode;
  sourceOrigin: DialogueSourceOrigin;
  targetPath: string;
  directionNote: string;
  transcript: string;
}

const CHARACTER_DIRECTION: Record<CharacterId, string> = {
  narrator: 'APPROVED NARRATOR: George (ElevenLabs JBFqnCBsd6RMkjVDRZzb) — Deep, warm, gravelly, cinematic storytelling baritone with textured rasp, measured cadence, and atmospheric weight.',
  mrs_shah: 'Urgent, breathless Mumbai upper-middle-class cadence rising into panic.',
  driver: 'Flustered, harried street urgency over traffic noise.',
  dhiraj: 'Animated, slightly pretentious Indian college film-student cadence.',
  girl: 'Hushed internal narration; detached yet wistful.',
  death: 'Regal, elegant female authority with dark velvety composure—dry cynical poise cracking into outrage and disbelief when fired.',
  agni: 'Polite, warm, slightly harried celestial bureaucrat trying to keep peace.',
  god: 'Calm, velvety, impossibly relaxed corporate-divine authority.',
  munmun: 'Light, quirky, expressive young hospital ghost in a moonlit ward.',
  laila: 'Death inside an unfamiliar human throat—disoriented, vulnerable, dry humor and reluctant mercy.',
  security: 'Urgent raised voice echoing down a hospital stairwell.',
  pranah: 'Serene, affectionate, softly amused warmth over morning tea.',
};

export const REQUIRED_VOICE_ASSETS: VoiceAssetRequirement[] = Object.values(
  CHAPTER_DIALOGUE_SEQUENCES,
)
  .flat()
  .filter((line) => Boolean(line.audioSrc))
  .map((line) => ({
    lineId: line.id,
    sceneId: line.sceneId,
    character: line.speaker,
    speakerLabel: line.speakerLabel,
    mode: line.mode,
    sourceOrigin: line.sourceOrigin,
    targetPath: `public${line.audioSrc}`,
    directionNote: CHARACTER_DIRECTION[line.speaker],
    transcript: line.text,
  }));
