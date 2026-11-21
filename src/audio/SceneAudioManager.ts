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

export type AmbienceTrackId =
  | 'scene_01_mumbai'
  | 'scene_02_traffic'
  | 'scene_03_party'
  | 'scene_04_death_world'
  | 'scene_05_convergence'
  | 'scene_06_transformation'
  | 'scene_07_hospital'
  | 'scene_08_escape'
  | 'scene_09_truck'
  | 'scene_10_eight_years_later'
  | 'amb_mumbai'
  | 'amb_traffic'
  | 'amb_party'
  | 'amb_celestial'
  | 'amb_hospital'
  | 'amb_dawn';

export type ScoreTrackId =
  | 'scene_01_music_a'
  | 'scene_01_music_b'
  | 'scene_02_music'
  | 'scene_03_music'
  | 'scene_04_music_a'
  | 'scene_04_music_b'
  | 'scene_05_music_a'
  | 'scene_05_music_b'
  | 'scene_06_music_a'
  | 'scene_06_music_b'
  | 'scene_07_music'
  | 'scene_08_music'
  | 'scene_09_music'
  | 'scene_10_music_a'
  | 'scene_10_music_b';

export type MotifId =
  | 'motif_storyverse'
  | 'motif_death'
  | 'motif_laila'
  | 'motif_transformation';

const MOOD_TO_AMBIENCE: Record<SoundMood, AmbienceTrackId> = {
  prologue: 'scene_01_mumbai',
  sunset: 'scene_01_mumbai',
  traffic: 'scene_02_traffic',
  twilight: 'scene_03_party',
  celestial: 'scene_04_death_world',
  split: 'scene_05_convergence',
  descent: 'scene_06_transformation',
  clinical: 'scene_07_hospital',
  chase: 'scene_08_escape',
  impact: 'scene_09_truck',
  dawn: 'scene_10_eight_years_later',
};

const AMBIENCE_SOURCES: Record<AmbienceTrackId, string> = {
  scene_01_mumbai: '/assets/audio/soundscapes/scene_01_mumbai.wav',
  scene_02_traffic: '/assets/audio/soundscapes/scene_02_traffic.wav',
  scene_03_party: '/assets/audio/soundscapes/scene_03_party.wav',
  scene_04_death_world: '/assets/audio/soundscapes/scene_04_death_world.wav',
  scene_05_convergence: '/assets/audio/soundscapes/scene_05_convergence.wav',
  scene_06_transformation: '/assets/audio/soundscapes/scene_06_transformation.wav',
  scene_07_hospital: '/assets/audio/soundscapes/scene_07_hospital.wav',
  scene_08_escape: '/assets/audio/soundscapes/scene_08_escape.wav',
  scene_09_truck: '/assets/audio/soundscapes/scene_09_truck.wav',
  scene_10_eight_years_later: '/assets/audio/soundscapes/scene_10_eight_years_later.wav',
  amb_mumbai: '/assets/audio/amb_mumbai.wav',
  amb_traffic: '/assets/audio/amb_traffic.wav',
  amb_party: '/assets/audio/amb_party.wav',
  amb_celestial: '/assets/audio/amb_celestial.wav',
  amb_hospital: '/assets/audio/amb_hospital.wav',
  amb_dawn: '/assets/audio/amb_dawn.wav',
};

const SCORE_SOURCES: Record<ScoreTrackId, string> = {
  scene_01_music_a: '/assets/audio/music/scene_01_music_a.wav',
  scene_01_music_b: '/assets/audio/music/scene_01_music_b.wav',
  scene_02_music: '/assets/audio/music/scene_02_music.wav',
  scene_03_music: '/assets/audio/music/scene_03_music.wav',
  scene_04_music_a: '/assets/audio/music/scene_04_music_a.wav',
  scene_04_music_b: '/assets/audio/music/scene_04_music_b.wav',
  scene_05_music_a: '/assets/audio/music/scene_05_music_a.wav',
  scene_05_music_b: '/assets/audio/music/scene_05_music_b.wav',
  scene_06_music_a: '/assets/audio/music/scene_06_music_a.wav',
  scene_06_music_b: '/assets/audio/music/scene_06_music_b.wav',
  scene_07_music: '/assets/audio/music/scene_07_music.wav',
  scene_08_music: '/assets/audio/music/scene_08_music.wav',
  scene_09_music: '/assets/audio/music/scene_09_music.wav',
  scene_10_music_a: '/assets/audio/music/scene_10_music_a.wav',
  scene_10_music_b: '/assets/audio/music/scene_10_music_b.wav',
};

const MOTIF_SOURCES: Record<MotifId, string> = {
  motif_storyverse: '/assets/audio/music/motif_storyverse.wav',
  motif_death: '/assets/audio/music/motif_death.wav',
  motif_laila: '/assets/audio/music/motif_laila.wav',
  motif_transformation: '/assets/audio/music/motif_transformation.wav',
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
  scoreVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  ambienceMuted: boolean;
  scoreMuted: boolean;
  sfxMuted: boolean;
  voiceMuted: boolean;
  isVoiceActive: boolean;
  currentMood: SoundMood;
  activeAmbienceTrack: AmbienceTrackId;
  activeScoreTrack: ScoreTrackId;
}

class SceneAudioManager {
  private ambienceHowls = new Map<AmbienceTrackId, Howl>();
  private scoreHowls = new Map<ScoreTrackId, Howl>();
  private motifHowls = new Map<MotifId, Howl>();
  private sfxHowls = new Map<SfxCue, Howl>();
  private crossfadeTimers = new Map<AmbienceTrackId, number>();
  private scoreCrossfadeTimers = new Map<ScoreTrackId, number>();
  private listeners = new Set<() => void>();

  private masterMuted = true; // Start muted; browser autoplay policy requires explicit user unlock
  private ambienceVolume = 0.10;
  private scoreVolume = 0.30;
  private sfxVolume = 0.45;
  private voiceVolume = 0.95;
  private ambienceMuted = false;
  private scoreMuted = false;
  private sfxMuted = false;
  private voiceMuted = false;
  private isVoiceActive = false;

  private currentMood: SoundMood = 'prologue';
  private activeAmbienceTrack: AmbienceTrackId = 'scene_01_mumbai';
  private activeScoreTrack: ScoreTrackId = 'scene_01_music_a';
  private initialized = false;

  // Provisional Approach A defaults for the 5 dual scenes
  private scoreVariants: Record<string, 'a' | 'b'> = {
    sunset: 'a',
    celestial: 'a',
    split: 'a',
    descent: 'a',
    dawn: 'a',
  };

  private getBusSettings() {
    return {
      masterMuted: this.masterMuted,
      ambienceVolume: this.ambienceVolume,
      scoreVolume: this.scoreVolume,
      sfxVolume: this.sfxVolume,
      voiceVolume: this.voiceVolume,
      ambienceMuted: this.ambienceMuted,
      scoreMuted: this.scoreMuted,
      sfxMuted: this.sfxMuted,
      voiceMuted: this.voiceMuted,
      isVoiceActive: this.isVoiceActive,
    };
  }

  public getSnapshot(): AudioMixerSnapshot {
    return {
      masterMuted: this.masterMuted,
      ambienceVolume: this.ambienceVolume,
      scoreVolume: this.scoreVolume,
      sfxVolume: this.sfxVolume,
      voiceVolume: this.voiceVolume,
      ambienceMuted: this.ambienceMuted,
      scoreMuted: this.scoreMuted,
      sfxMuted: this.sfxMuted,
      voiceMuted: this.voiceMuted,
      isVoiceActive: this.isVoiceActive,
      currentMood: this.currentMood,
      activeAmbienceTrack: this.activeAmbienceTrack,
      activeScoreTrack: this.activeScoreTrack,
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
    const activeAmb = this.ambienceHowls.get(this.activeAmbienceTrack);
    if (activeAmb && activeAmb.playing()) {
      activeAmb.fade(activeAmb.volume(), 0, 240);
    }
    const activeScore = this.scoreHowls.get(this.activeScoreTrack);
    if (activeScore && activeScore.playing()) {
      activeScore.fade(activeScore.volume(), 0, 240);
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
    this.playScoreTrack(this.activeScoreTrack);
    this.applyMixLevels();
    this.syncSunsetCityPulse();
    this.emit();
  }

  public setAmbienceVolume(vol: number): void {
    this.ambienceVolume = clamp01(vol);
    this.applyMixLevels();
    this.emit();
  }

  public setScoreVolume(vol: number): void {
    this.scoreVolume = clamp01(vol);
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

  public toggleScoreMute(): void {
    this.scoreMuted = !this.scoreMuted;
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

  public setScoreVariant(
    sceneMood: 'sunset' | 'celestial' | 'split' | 'descent' | 'dawn',
    variant: 'a' | 'b',
  ): void {
    this.scoreVariants[sceneMood] = variant;
    if (this.currentMood === sceneMood || (sceneMood === 'sunset' && this.currentMood === 'prologue')) {
      const nextScore = this.resolveScoreTrackForMood(this.currentMood);
      if (nextScore !== this.activeScoreTrack) {
        const prevScore = this.activeScoreTrack;
        this.activeScoreTrack = nextScore;
        if (!this.masterMuted && !this.scoreMuted) {
          this.crossfadeScore(prevScore, nextScore);
        }
      }
    }
    this.emit();
  }

  public setVoiceActive(active: boolean): void {
    if (this.isVoiceActive === active) return;
    this.isVoiceActive = active;
    this.applyMixLevels();
    this.emit();
  }

  /**
   * Duck background score and ambience by a factor (0.0 = silent, 1.0 = full).
   * Used when dialogue or narration begins.
   */
  public duckBuses(duckFactor: number, fadeMs: number): void {
    if (this.masterMuted) return;
    const targetAmb = this.ambienceVolume * Math.max(0, Math.min(1, duckFactor));
    const targetScore = this.scoreVolume * Math.max(0, Math.min(1, duckFactor));
    const activeAmb = this.ambienceHowls.get(this.activeAmbienceTrack);
    const activeScore = this.scoreHowls.get(this.activeScoreTrack);
    if (activeAmb && activeAmb.playing()) activeAmb.fade(activeAmb.volume(), targetAmb, fadeMs);
    if (activeScore && activeScore.playing()) activeScore.fade(activeScore.volume(), targetScore, fadeMs);
  }

  /**
   * Restore background score and ambience to their configured levels.
   * Used when dialogue or narration completes.
   */
  public unduckBuses(fadeMs: number): void {
    if (this.masterMuted) return;
    const mix = computeAudioMixLevels(this.getBusSettings());
    const activeAmb = this.ambienceHowls.get(this.activeAmbienceTrack);
    const activeScore = this.scoreHowls.get(this.activeScoreTrack);
    if (activeAmb && activeAmb.playing()) activeAmb.fade(activeAmb.volume(), mix.ambienceGain, fadeMs);
    if (activeScore && activeScore.playing()) activeScore.fade(activeScore.volume(), mix.scoreGain, fadeMs);
  }

  public getEffectiveVoiceGain(): number {
    return computeAudioMixLevels(this.getBusSettings()).voiceGain;
  }

  private ambientCityTimer: number | null = null;

  private resolveScoreTrackForMood(mood: SoundMood): ScoreTrackId {
    switch (mood) {
      case 'prologue':
      case 'sunset':
        return this.scoreVariants.sunset === 'b' ? 'scene_01_music_b' : 'scene_01_music_a';
      case 'traffic':
        return 'scene_02_music';
      case 'twilight':
        return 'scene_03_music';
      case 'celestial':
        return this.scoreVariants.celestial === 'b' ? 'scene_04_music_b' : 'scene_04_music_a';
      case 'split':
        return this.scoreVariants.split === 'b' ? 'scene_05_music_b' : 'scene_05_music_a';
      case 'descent':
        return this.scoreVariants.descent === 'b' ? 'scene_06_music_b' : 'scene_06_music_a';
      case 'clinical':
        return 'scene_07_music';
      case 'chase':
        return 'scene_08_music';
      case 'impact':
        return 'scene_09_music';
      case 'dawn':
        return this.scoreVariants.dawn === 'b' ? 'scene_10_music_b' : 'scene_10_music_a';
      default:
        return 'scene_01_music_a';
    }
  }

  public setMood(mood: SoundMood): void {
    if (this.currentMood === mood) return;
    this.currentMood = mood;
    const nextAmbience = MOOD_TO_AMBIENCE[mood];
    const prevAmbience = this.activeAmbienceTrack;
    this.activeAmbienceTrack = nextAmbience;

    const nextScore = this.resolveScoreTrackForMood(mood);
    const prevScore = this.activeScoreTrack;
    this.activeScoreTrack = nextScore;

    if (!this.masterMuted) {
      if (prevAmbience !== nextAmbience) {
        this.crossfadeAmbience(prevAmbience, nextAmbience);
      }
      if (prevScore !== nextScore) {
        this.crossfadeScore(prevScore, nextScore);
      }
    }
    this.syncSunsetCityPulse();
    this.emit();
  }

  public triggerCue(cue: SfxCue): void {
    if (this.masterMuted || this.sfxMuted || typeof window === 'undefined') return;
    this.ensureInitialized();
    const howl = this.getOrCreateSfxHowl(cue);
    if (!howl) return;

    const { sfxGain } = computeAudioMixLevels(this.getBusSettings());
    if (sfxGain <= 0) return;
    howl.volume(sfxGain * 0.65);
    howl.play();
  }

  public playMotif(motif: MotifId): void {
    if (this.masterMuted || this.scoreMuted || typeof window === 'undefined') return;
    this.ensureInitialized();
    const howl = this.getOrCreateMotifHowl(motif);
    if (!howl) return;

    const { scoreGain } = computeAudioMixLevels(this.getBusSettings());
    if (scoreGain <= 0) return;

    // Smoothly fade out any other active motif to prevent audio clutter
    this.motifHowls.forEach((h, id) => {
      if (id !== motif && h.playing()) {
        h.fade(h.volume(), 0, 300);
      }
    });

    howl.volume(scoreGain * 0.95);
    howl.play();
  }

  public dispose(): void {
    this.clearSunsetCityPulse();
    this.crossfadeTimers.forEach((timerId) => window.clearTimeout(timerId));
    this.crossfadeTimers.clear();
    this.scoreCrossfadeTimers.forEach((timerId) => window.clearTimeout(timerId));
    this.scoreCrossfadeTimers.clear();
    this.ambienceHowls.forEach((h) => h.unload());
    this.scoreHowls.forEach((h) => h.unload());
    this.motifHowls.forEach((h) => h.unload());
    this.sfxHowls.forEach((h) => h.unload());
    this.ambienceHowls.clear();
    this.scoreHowls.clear();
    this.motifHowls.clear();
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
      const { sfxGain } = computeAudioMixLevels(this.getBusSettings());
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
        onloaderror: () => {},
      });
      this.ambienceHowls.set(track, howl);
    }
    return howl;
  }

  private getOrCreateScoreHowl(track: ScoreTrackId): Howl | null {
    if (typeof window === 'undefined') return null;
    let howl = this.scoreHowls.get(track);
    if (!howl) {
      howl = new Howl({
        src: [SCORE_SOURCES[track]],
        loop: true,
        volume: 0,
        preload: true,
        onloaderror: () => {},
      });
      this.scoreHowls.set(track, howl);
    }
    return howl;
  }

  private getOrCreateMotifHowl(motif: MotifId): Howl | null {
    if (typeof window === 'undefined') return null;
    let howl = this.motifHowls.get(motif);
    if (!howl) {
      howl = new Howl({
        src: [MOTIF_SOURCES[motif]],
        loop: false,
        volume: 0,
        preload: true,
        onloaderror: () => {},
      });
      this.motifHowls.set(motif, howl);
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
        onloaderror: () => {},
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
    const { ambienceGain } = computeAudioMixLevels(this.getBusSettings());
    if (!howl.playing()) {
      howl.volume(0);
      howl.play();
    }
    howl.fade(howl.volume(), ambienceGain, 900);
  }

  private playScoreTrack(track: ScoreTrackId): void {
    const pendingTimer = this.scoreCrossfadeTimers.get(track);
    if (pendingTimer !== undefined) {
      window.clearTimeout(pendingTimer);
      this.scoreCrossfadeTimers.delete(track);
    }

    const howl = this.getOrCreateScoreHowl(track);
    if (!howl) return;
    const { scoreGain } = computeAudioMixLevels(this.getBusSettings());
    if (!howl.playing()) {
      howl.volume(0);
      howl.play();
    }
    howl.fade(howl.volume(), scoreGain, 1400);
  }

  private crossfadeAmbience(fromTrack: AmbienceTrackId, toTrack: AmbienceTrackId): void {
    // Rapid scrolling anti-stacking: immediately fade out any older tracks
    this.ambienceHowls.forEach((howl, track) => {
      if (track !== toTrack && track !== fromTrack && howl.playing()) {
        howl.fade(howl.volume(), 0, 400);
        const timer = window.setTimeout(() => {
          if (this.activeAmbienceTrack !== track && howl.volume() < 0.02) {
            howl.pause();
          }
        }, 450);
        this.crossfadeTimers.set(track, timer);
      }
    });

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

  private crossfadeScore(fromTrack: ScoreTrackId, toTrack: ScoreTrackId): void {
    // Rapid scrolling anti-stacking: immediately fade out any older score tracks
    this.scoreHowls.forEach((howl, track) => {
      if (track !== toTrack && track !== fromTrack && howl.playing()) {
        howl.fade(howl.volume(), 0, 400);
        const timer = window.setTimeout(() => {
          if (this.activeScoreTrack !== track && howl.volume() < 0.02) {
            howl.pause();
          }
        }, 450);
        this.scoreCrossfadeTimers.set(track, timer);
      }
    });

    const oldHowl = this.scoreHowls.get(fromTrack);
    if (oldHowl && oldHowl.playing()) {
      const existing = this.scoreCrossfadeTimers.get(fromTrack);
      if (existing !== undefined) {
        window.clearTimeout(existing);
      }
      oldHowl.fade(oldHowl.volume(), 0, 1400);
      const timerId = window.setTimeout(() => {
        this.scoreCrossfadeTimers.delete(fromTrack);
        if (this.activeScoreTrack !== fromTrack && oldHowl.volume() < 0.02) {
          oldHowl.pause();
        }
      }, 1450);
      this.scoreCrossfadeTimers.set(fromTrack, timerId);
    }
    this.playScoreTrack(toTrack);
  }

  private autoplayListenersBound = false;

  public ensureAutoplayUnlocked(onUnlocked?: () => void): void {
    if (typeof window === 'undefined') return;
    this.ensureInitialized();

    const tryResumeAndPlay = () => {
      this.masterMuted = false;
      Howler.mute(false);
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        void Howler.ctx.resume().then(() => {
          this.playAmbienceTrack(this.activeAmbienceTrack);
          this.playScoreTrack(this.activeScoreTrack);
          this.applyMixLevels();
          onUnlocked?.();
          this.emit();
        });
      } else {
        this.playAmbienceTrack(this.activeAmbienceTrack);
        this.playScoreTrack(this.activeScoreTrack);
        this.applyMixLevels();
        onUnlocked?.();
        this.emit();
      }
    };

    if (Howler.ctx && Howler.ctx.state === 'running') {
      tryResumeAndPlay();
      return;
    }

    if (this.autoplayListenersBound) return;
    this.autoplayListenersBound = true;

    const events = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'];
    const unlockHandler = () => {
      events.forEach((evt) => window.removeEventListener(evt, unlockHandler));
      this.autoplayListenersBound = false;
      tryResumeAndPlay();
    };

    events.forEach((evt) =>
      window.addEventListener(evt, unlockHandler, { once: true, passive: true }),
    );
  }

  private applyMixLevels(): void {
    const mix = computeAudioMixLevels(this.getBusSettings());
    // Speech entry: 280ms ducking attack; Speech exit: 1400ms gradual release swell
    const fadeDuration = this.isVoiceActive ? 280 : 1400;

    const activeAmb = this.ambienceHowls.get(this.activeAmbienceTrack);
    if (activeAmb) {
      if (!this.masterMuted && !this.ambienceMuted && !activeAmb.playing()) {
        activeAmb.play();
      }
      activeAmb.fade(activeAmb.volume(), mix.ambienceGain, fadeDuration);
    }

    const activeScore = this.scoreHowls.get(this.activeScoreTrack);
    if (activeScore) {
      if (!this.masterMuted && !this.scoreMuted && !activeScore.playing()) {
        activeScore.play();
      }
      activeScore.fade(activeScore.volume(), mix.scoreGain, fadeDuration);
    }
  }
}

export const sceneAudioManager = new SceneAudioManager();
