import { Howl, Howler } from 'howler';
import { computeAudioMixLevels, clamp01 } from '../story/scrollMath';

export type SoundMood =
  | 'prologue'
  | 'sunset'
  | 'traffic'
  | 'twilight'
  | 'celestial'
  | 'split'
  | 'descent'
  | 'clinical'
  | 'chase'
  | 'impact'
  | 'dawn';

export type SfxCue =
  | 'bubble'
  | 'discover'
  | 'ding'
  | 'horn'
  | 'thunder'
  | 'flatline'
  | 'truck'
  | 'transition';

type AmbienceTrackId =
  | 'amb_mumbai'
  | 'amb_traffic'
  | 'amb_party'
  | 'amb_celestial'
  | 'amb_hospital'
  | 'amb_dawn';

const MOOD_TO_AMBIENCE: Record<SoundMood, AmbienceTrackId> = {
  prologue: 'amb_celestial',
  sunset: 'amb_mumbai',
  traffic: 'amb_traffic',
  twilight: 'amb_party',
  celestial: 'amb_celestial',
  split: 'amb_party',
  descent: 'amb_celestial',
  clinical: 'amb_hospital',
  chase: 'amb_hospital',
  impact: 'amb_hospital',
  dawn: 'amb_dawn',
};

const AMBIENCE_SOURCES: Record<AmbienceTrackId, string> = {
  amb_mumbai: '/assets/audio/amb_mumbai.wav',
  amb_traffic: '/assets/audio/amb_traffic.wav',
  amb_party: '/assets/audio/amb_party.wav',
  amb_celestial: '/assets/audio/amb_celestial.wav',
  amb_hospital: '/assets/audio/amb_hospital.wav',
  amb_dawn: '/assets/audio/amb_dawn.wav',
};

const SFX_SOURCES: Record<SfxCue, string> = {
  bubble: '/assets/audio/sfx_bubble.wav',
  discover: '/assets/audio/sfx_discover.wav',
  ding: '/assets/audio/sfx_ding.wav',
  horn: '/assets/audio/sfx_horn.wav',
  thunder: '/assets/audio/sfx_thunder.wav',
  flatline: '/assets/audio/sfx_flatline.wav',
  truck: '/assets/audio/sfx_truck.wav',
  transition: '/assets/audio/sfx_transition.wav',
};

export interface AudioMixerSnapshot {
  masterMuted: boolean;
  ambienceVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  ambienceMuted: boolean;
  sfxMuted: boolean;
  voiceMuted: boolean;
  isVoiceActive: boolean;
  currentMood: SoundMood;
  activeAmbienceTrack: AmbienceTrackId;
}

class SceneAudioManager {
  private ambienceHowls = new Map<AmbienceTrackId, Howl>();
  private sfxHowls = new Map<SfxCue, Howl>();
  private crossfadeTimers = new Map<AmbienceTrackId, number>();
  private listeners = new Set<() => void>();

  private masterMuted = true;
  private ambienceVolume = 0.42;
  private sfxVolume = 0.65;
  private voiceVolume = 0.9;
  private ambienceMuted = false;
  private sfxMuted = false;
  private voiceMuted = false;
  private isVoiceActive = false;

  private currentMood: SoundMood = 'prologue';
  private activeAmbienceTrack: AmbienceTrackId = 'amb_celestial';
  private initialized = false;

  public getSnapshot(): AudioMixerSnapshot {
    return {
      masterMuted: this.masterMuted,
      ambienceVolume: this.ambienceVolume,
      sfxVolume: this.sfxVolume,
      voiceVolume: this.voiceVolume,
      ambienceMuted: this.ambienceMuted,
      sfxMuted: this.sfxMuted,
      voiceMuted: this.voiceMuted,
      isVoiceActive: this.isVoiceActive,
      currentMood: this.currentMood,
      activeAmbienceTrack: this.activeAmbienceTrack,
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    this.listeners.forEach((fn) => fn());
  }

  public getMuted(): boolean {
    return this.masterMuted;
  }

  public toggleMute(): boolean {
    if (this.masterMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.masterMuted;
  }

  public mute(): void {
    this.masterMuted = true;
    this.clearSunsetCityPulse();
    Howler.mute(true);
    const active = this.ambienceHowls.get(this.activeAmbienceTrack);
    if (active && active.playing()) {
      active.fade(active.volume(), 0, 240);
    }
    this.emit();
  }

  public unmute(): void {
    this.masterMuted = false;
    this.ensureInitialized();
    Howler.mute(false);
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      void Howler.ctx.resume();
    }
    this.playAmbienceTrack(this.activeAmbienceTrack);
    this.applyMixLevels();
    this.syncSunsetCityPulse();
    this.emit();
  }

  public setAmbienceVolume(vol: number): void {
    this.ambienceVolume = clamp01(vol);
    this.applyMixLevels();
    this.emit();
  }

  public setSfxVolume(vol: number): void {
    this.sfxVolume = clamp01(vol);
    this.applyMixLevels();
    this.emit();
  }

  public setVoiceVolume(vol: number): void {
    this.voiceVolume = clamp01(vol);
    this.applyMixLevels();
    this.emit();
  }

  public toggleAmbienceMute(): void {
    this.ambienceMuted = !this.ambienceMuted;
    this.applyMixLevels();
    this.emit();
  }

  public toggleSfxMute(): void {
    this.sfxMuted = !this.sfxMuted;
    this.applyMixLevels();
    this.emit();
  }

  public toggleVoiceMute(): void {
    this.voiceMuted = !this.voiceMuted;
    this.applyMixLevels();
    this.emit();
  }

  public setVoiceActive(active: boolean): void {
    if (this.isVoiceActive === active) return;
    this.isVoiceActive = active;
    this.applyMixLevels();
    this.emit();
  }

  public getEffectiveVoiceGain(): number {
    return computeAudioMixLevels({
      masterMuted: this.masterMuted,
      ambienceVolume: this.ambienceVolume,
      sfxVolume: this.sfxVolume,
      voiceVolume: this.voiceVolume,
      ambienceMuted: this.ambienceMuted,
      sfxMuted: this.sfxMuted,
      voiceMuted: this.voiceMuted,
      isVoiceActive: this.isVoiceActive,
    }).voiceGain;
  }

  private ambientCityTimer: number | null = null;

  public setMood(mood: SoundMood): void {
    if (this.currentMood === mood) return;
    this.currentMood = mood;
    const nextTrack = MOOD_TO_AMBIENCE[mood];
    const prevTrack = this.activeAmbienceTrack;
    this.activeAmbienceTrack = nextTrack;

    if (!this.masterMuted && prevTrack !== nextTrack) {
      this.crossfadeAmbience(prevTrack, nextTrack);
    }
    this.syncSunsetCityPulse();
    this.emit();
  }

  public triggerCue(cue: SfxCue): void {
    if (this.masterMuted || this.sfxMuted || typeof window === 'undefined') return;
    this.ensureInitialized();
    const howl = this.getOrCreateSfxHowl(cue);
    if (!howl) return;

    const { sfxGain } = computeAudioMixLevels({
      masterMuted: this.masterMuted,
      ambienceVolume: this.ambienceVolume,
      sfxVolume: this.sfxVolume,
      voiceVolume: this.voiceVolume,
      ambienceMuted: this.ambienceMuted,
      sfxMuted: this.sfxMuted,
      voiceMuted: this.voiceMuted,
      isVoiceActive: this.isVoiceActive,
    });

    if (sfxGain <= 0) return;
    howl.volume(sfxGain * 0.65);
    howl.play();
  }

  public dispose(): void {
    this.clearSunsetCityPulse();
    this.crossfadeTimers.forEach((timerId) => window.clearTimeout(timerId));
    this.crossfadeTimers.clear();
    this.ambienceHowls.forEach((h) => h.unload());
    this.sfxHowls.forEach((h) => h.unload());
    this.ambienceHowls.clear();
    this.sfxHowls.clear();
    this.initialized = false;
  }

  private clearSunsetCityPulse(): void {
    if (this.ambientCityTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.ambientCityTimer);
      this.ambientCityTimer = null;
    }
  }

  private syncSunsetCityPulse(): void {
    this.clearSunsetCityPulse();
    if (typeof window === 'undefined') return;
    if (this.masterMuted || this.sfxMuted || this.currentMood !== 'sunset') return;

    this.ambientCityTimer = window.setInterval(() => {
      if (this.masterMuted || this.sfxMuted || this.currentMood !== 'sunset') {
        this.clearSunsetCityPulse();
        return;
      }
      const howl = this.getOrCreateSfxHowl('horn');
      if (!howl) return;
      const { sfxGain } = computeAudioMixLevels({
        masterMuted: this.masterMuted,
        ambienceVolume: this.ambienceVolume,
        sfxVolume: this.sfxVolume,
        voiceVolume: this.voiceVolume,
        ambienceMuted: this.ambienceMuted,
        sfxMuted: this.sfxMuted,
        voiceMuted: this.voiceMuted,
        isVoiceActive: this.isVoiceActive,
      });
      if (sfxGain > 0) {
        howl.volume(sfxGain * 0.22);
        howl.play();
      }
    }, 14500);
  }

  private ensureInitialized(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;
    Howler.autoUnlock = true;
  }

  private getOrCreateAmbienceHowl(track: AmbienceTrackId): Howl | null {
    if (typeof window === 'undefined') return null;
    let howl = this.ambienceHowls.get(track);
    if (!howl) {
      howl = new Howl({
        src: [AMBIENCE_SOURCES[track]],
        loop: true,
        volume: 0,
        preload: true,
        onloaderror: () => {
          // Handled silently so optional media never spams errors
        },
      });
      this.ambienceHowls.set(track, howl);
    }
    return howl;
  }

  private getOrCreateSfxHowl(cue: SfxCue): Howl | null {
    if (typeof window === 'undefined') return null;
    let howl = this.sfxHowls.get(cue);
    if (!howl) {
      howl = new Howl({
        src: [SFX_SOURCES[cue]],
        loop: false,
        volume: this.sfxVolume * 0.65,
        preload: true,
        onloaderror: () => {
          // Graceful no-op
        },
      });
      this.sfxHowls.set(cue, howl);
    }
    return howl;
  }

  private playAmbienceTrack(track: AmbienceTrackId): void {
    const pendingTimer = this.crossfadeTimers.get(track);
    if (pendingTimer !== undefined) {
      window.clearTimeout(pendingTimer);
      this.crossfadeTimers.delete(track);
    }

    const howl = this.getOrCreateAmbienceHowl(track);
    if (!howl) return;
    const { ambienceGain } = computeAudioMixLevels({
      masterMuted: this.masterMuted,
      ambienceVolume: this.ambienceVolume,
      sfxVolume: this.sfxVolume,
      voiceVolume: this.voiceVolume,
      ambienceMuted: this.ambienceMuted,
      sfxMuted: this.sfxMuted,
      voiceMuted: this.voiceMuted,
      isVoiceActive: this.isVoiceActive,
    });
    if (!howl.playing()) {
      howl.volume(0);
      howl.play();
    }
    howl.fade(howl.volume(), ambienceGain, 900);
  }

  private crossfadeAmbience(fromTrack: AmbienceTrackId, toTrack: AmbienceTrackId): void {
    const oldHowl = this.ambienceHowls.get(fromTrack);
    if (oldHowl && oldHowl.playing()) {
      const existing = this.crossfadeTimers.get(fromTrack);
      if (existing !== undefined) {
        window.clearTimeout(existing);
      }
      oldHowl.fade(oldHowl.volume(), 0, 900);
      const timerId = window.setTimeout(() => {
        this.crossfadeTimers.delete(fromTrack);
        if (this.activeAmbienceTrack !== fromTrack && oldHowl.volume() < 0.02) {
          oldHowl.pause();
        }
      }, 940);
      this.crossfadeTimers.set(fromTrack, timerId);
    }
    this.playAmbienceTrack(toTrack);
  }

  private applyMixLevels(): void {
    const mix = computeAudioMixLevels({
      masterMuted: this.masterMuted,
      ambienceVolume: this.ambienceVolume,
      sfxVolume: this.sfxVolume,
      voiceVolume: this.voiceVolume,
      ambienceMuted: this.ambienceMuted,
      sfxMuted: this.sfxMuted,
      voiceMuted: this.voiceMuted,
      isVoiceActive: this.isVoiceActive,
    });

    const active = this.ambienceHowls.get(this.activeAmbienceTrack);
    if (active) {
      if (!this.masterMuted && !this.ambienceMuted && !active.playing()) {
        active.play();
      }
      active.fade(active.volume(), mix.ambienceGain, 260);
    }
  }
}

export const sceneAudioManager = new SceneAudioManager();
