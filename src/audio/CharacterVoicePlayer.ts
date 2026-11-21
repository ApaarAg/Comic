import { Howl } from 'howler';
import { sceneAudioManager } from './SceneAudioManager';

export type VoiceAssetState =
  | 'idle'
  | 'playing-recording'
  | 'paused-recording'
  | 'cadence-sync-only'
  | 'paused-cadence';

export interface VoicePlaybackCallbacks {
  onStart?: (state: VoiceAssetState, timingSource: 'audio-seek' | 'estimated-duration') => void;
  onProgress?: (
    elapsedSec: number,
    durationSec: number,
    state: VoiceAssetState,
    timingSource: 'audio-seek' | 'estimated-duration',
  ) => void;
  onPauseChange?: (paused: boolean, state: VoiceAssetState) => void;
  onComplete?: () => void;
}

export interface VoicePlaybackSnapshot {
  lineId: string | null;
  audioSrc: string | null;
  elapsedSec: number;
  durationSec: number;
  state: VoiceAssetState;
  timingSource: 'audio-seek' | 'estimated-duration';
  isPaused: boolean;
<<<<<<< HEAD
  /** Whether the voice is currently actively playing (not paused, not idle) */
  isPlaying: boolean;
=======
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
}

/**
 * CharacterVoicePlayer manages optional studio/actor vocal recordings through Howler.js.
 * Deliberately never invokes synthetic robotic TTS (`window.speechSynthesis`) and never
 * fabricates recorded audio when voice assets are absent.
 */
class CharacterVoicePlayer {
  private activeHowl: Howl | null = null;
  private activeLineId: string | null = null;
  private activeAudioSrc: string | null = null;
  private activeCallbacks: VoicePlaybackCallbacks | undefined;
  private activeTimingSource: 'audio-seek' | 'estimated-duration' = 'estimated-duration';
  private activeState: VoiceAssetState = 'idle';

  private durationSec = 3.0;
  private elapsedSec = 0;
  private lastTickPerf = 0;
  private rafId: number | null = null;
  private fadeTimer: number | null = null;

  private availableVoicePaths: Set<string> | null = null;
  private manifestFetched = false;
  private preloadedHowls = new Map<string, Howl>();
  private mixerUnsub: (() => void) | null = null;
  private listeners = new Set<(snapshot: VoicePlaybackSnapshot) => void>();

  public getSnapshot(): VoicePlaybackSnapshot {
    return {
      lineId: this.activeLineId,
      audioSrc: this.activeAudioSrc,
      elapsedSec: this.elapsedSec,
      durationSec: this.durationSec,
      state: this.activeState,
      timingSource: this.activeTimingSource,
      isPaused: this.isPaused(),
<<<<<<< HEAD
      isPlaying: this.activeState === 'playing-recording' && !this.isPaused(),
=======
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
    };
  }

  public subscribe(listener: (snapshot: VoicePlaybackSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitSnapshot(): void {
    if (this.listeners.size === 0) return;
    const snap = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snap));
  }

  private ensureMixerSync(): void {
    if (this.mixerUnsub) return;
    this.mixerUnsub = sceneAudioManager.subscribe(() => {
      if (this.activeHowl) {
        const snap = sceneAudioManager.getSnapshot();
        if (snap.masterMuted || snap.voiceMuted) {
          this.activeHowl.volume(0);
        } else {
          this.activeHowl.volume(sceneAudioManager.getEffectiveVoiceGain());
        }
      }
    });
  }

  public async checkAvailableVoiceManifest(): Promise<Set<string>> {
    if (this.availableVoicePaths) return this.availableVoicePaths;
    if (this.manifestFetched || typeof window === 'undefined') {
      return this.availableVoicePaths ?? new Set();
    }
    this.manifestFetched = true;
    try {
      const res = await fetch('/api/voice-assets', { method: 'GET' });
      if (res.ok) {
        const json = (await res.json()) as { available?: string[] };
        this.availableVoicePaths = new Set(json.available ?? []);
        return this.availableVoicePaths;
      }
    } catch {
      // Static build / offline fallback
    }
    this.availableVoicePaths = new Set();
    return this.availableVoicePaths;
  }

  public hasRecordedAssets(): boolean {
    return (this.availableVoicePaths?.size ?? 0) > 0;
  }

  public getActiveLineId(): string | null {
    return this.activeLineId;
  }

  public getState(): VoiceAssetState {
    return this.activeState;
  }

  public isPaused(): boolean {
    return this.activeState === 'paused-recording' || this.activeState === 'paused-cadence';
  }

  public preloadAsset(audioSrc: string | undefined): void {
<<<<<<< HEAD
    if (!audioSrc || typeof window === 'undefined' || this.preloadedHowls.has(audioSrc)) {
      return;
    }
    // Keep cache small to avoid retaining excess audio buffers
    if (this.preloadedHowls.size >= 6) {
=======
    if (
      !audioSrc ||
      typeof window === 'undefined' ||
      !this.availableVoicePaths?.has(audioSrc) ||
      this.preloadedHowls.has(audioSrc)
    ) {
      return;
    }
    // Keep cache small to avoid retaining excess audio buffers
    if (this.preloadedHowls.size >= 4) {
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
      const oldestKey = this.preloadedHowls.keys().next().value;
      if (oldestKey) {
        this.preloadedHowls.get(oldestKey)?.unload();
        this.preloadedHowls.delete(oldestKey);
      }
    }
    const howl = new Howl({
      src: [audioSrc],
      preload: true,
      volume: 0,
      onloaderror: () => {
        this.preloadedHowls.delete(audioSrc);
      },
    });
    this.preloadedHowls.set(audioSrc, howl);
  }

  private clearLoop(): void {
    if (this.rafId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public stop(fadeMs = 0): void {
    this.clearLoop();
    if (this.fadeTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }

    const oldHowl = this.activeHowl;
    this.activeHowl = null;
    this.activeLineId = null;
    this.activeAudioSrc = null;
    this.activeCallbacks = undefined;
    this.activeState = 'idle';
    this.elapsedSec = 0;
    sceneAudioManager.setVoiceActive(false);

    if (oldHowl) {
      if (fadeMs > 0 && oldHowl.playing() && typeof window !== 'undefined') {
        oldHowl.fade(oldHowl.volume(), 0, fadeMs);
        this.fadeTimer = window.setTimeout(() => {
          this.fadeTimer = null;
          oldHowl.stop();
          oldHowl.unload();
        }, fadeMs + 25);
      } else {
        oldHowl.stop();
        oldHowl.unload();
      }
    }
    this.emitSnapshot();
  }

  public pause(): void {
    if (!this.activeLineId || this.isPaused() || this.activeState === 'idle') return;
    this.clearLoop();
    if (this.activeHowl && this.activeState === 'playing-recording') {
      const seek = this.activeHowl.seek();
      if (typeof seek === 'number' && Number.isFinite(seek)) {
        this.elapsedSec = seek;
      }
      this.activeHowl.pause();
      this.activeState = 'paused-recording';
    } else if (this.activeState === 'cadence-sync-only') {
      this.activeState = 'paused-cadence';
    }
    sceneAudioManager.setVoiceActive(false);
    this.activeCallbacks?.onPauseChange?.(true, this.activeState);
    this.emitSnapshot();
  }

  public resume(): void {
    if (!this.activeLineId || !this.isPaused()) return;
    const targetId = this.activeLineId;
    if (this.activeHowl && this.activeState === 'paused-recording') {
      const mixer = sceneAudioManager.getSnapshot();
      sceneAudioManager.setVoiceActive(!mixer.masterMuted && !mixer.voiceMuted);
      this.activeHowl.play();
      this.activeState = 'playing-recording';
      this.startProgressLoop(targetId);
    } else if (this.activeState === 'paused-cadence') {
      this.activeState = 'cadence-sync-only';
      this.lastTickPerf = performance.now();
      this.startProgressLoop(targetId);
    }
    this.activeCallbacks?.onPauseChange?.(false, this.activeState);
    this.emitSnapshot();
  }

  public seekTo(seconds: number): void {
    if (!this.activeLineId || !Number.isFinite(seconds)) return;
    const clamped = Math.max(0, Math.min(this.durationSec, seconds));
    this.elapsedSec = clamped;
    this.lastTickPerf = typeof performance !== 'undefined' ? performance.now() : 0;

    if (this.activeHowl && (this.activeState === 'playing-recording' || this.activeState === 'paused-recording')) {
      this.activeHowl.seek(clamped);
    } else if (this.activeState === 'idle' && this.activeTimingSource === 'estimated-duration') {
      this.activeState = 'cadence-sync-only';
      this.startProgressLoop(this.activeLineId);
    }

    this.activeCallbacks?.onProgress?.(
      this.elapsedSec,
      this.durationSec,
      this.activeState,
      this.activeTimingSource,
    );
    this.emitSnapshot();
  }

  public replay(): void {
    if (!this.activeLineId) return;
    const lineId = this.activeLineId;
    const audioSrc = this.activeAudioSrc ?? undefined;
    const durationMs = this.durationSec * 1000;
    const callbacks = this.activeCallbacks;
    void this.playLine(lineId, audioSrc, durationMs, callbacks);
  }

  public async playLine(
    lineId: string,
    voiceAssetPath: string | undefined,
    fallbackDurationMs: number,
    callbacks?: VoicePlaybackCallbacks,
  ): Promise<VoiceAssetState> {
    this.ensureMixerSync();
    this.stop(120);

    this.activeLineId = lineId;
    this.activeAudioSrc = voiceAssetPath ?? null;
    this.activeCallbacks = callbacks;
    this.durationSec = Math.max(0.8, fallbackDurationMs / 1000);
    this.elapsedSec = 0;

    const mixer = sceneAudioManager.getSnapshot();
    const available = await this.checkAvailableVoiceManifest();

    // Guard against async cancellation before play begins
    if (this.activeLineId !== lineId) {
      return this.activeState;
    }

<<<<<<< HEAD
    const isRecordedAsset =
      Boolean(voiceAssetPath) &&
      (available.has(voiceAssetPath!) || voiceAssetPath!.startsWith('/assets/audio/voices/'));
    const canPlayRecorded =
      isRecordedAsset &&
=======
    const canPlayRecorded =
      Boolean(voiceAssetPath) &&
      available.has(voiceAssetPath!) &&
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
      !mixer.masterMuted &&
      !mixer.voiceMuted;

    if (canPlayRecorded && voiceAssetPath) {
      const voiceGain = sceneAudioManager.getEffectiveVoiceGain();
      sceneAudioManager.setVoiceActive(true);
      this.activeTimingSource = 'audio-seek';
      this.activeState = 'playing-recording';

      const howl = new Howl({
        src: [voiceAssetPath],
        volume: voiceGain,
        onload: () => {
          const loadedDur = howl.duration();
          if (this.activeLineId === lineId && Number.isFinite(loadedDur) && loadedDur > 0.2) {
            this.durationSec = loadedDur;
          }
        },
        onend: () => {
          if (this.activeLineId === lineId) {
            this.elapsedSec = this.durationSec;
            this.activeCallbacks?.onProgress?.(
              this.durationSec,
              this.durationSec,
              'idle',
              this.activeTimingSource,
            );
            this.stop(0);
            callbacks?.onComplete?.();
          }
        },
        onloaderror: () => {
          if (this.activeLineId === lineId) {
            this.startCadenceFallback(lineId, callbacks);
          }
        },
      });

      this.activeHowl = howl;
      howl.play();
      callbacks?.onStart?.('playing-recording', 'audio-seek');
      callbacks?.onProgress?.(0, this.durationSec, 'playing-recording', 'audio-seek');
      this.emitSnapshot();
      this.startProgressLoop(lineId);
      return 'playing-recording';
    }

    this.startCadenceFallback(lineId, callbacks);
    return 'cadence-sync-only';
  }

  private startCadenceFallback(lineId: string, callbacks?: VoicePlaybackCallbacks): void {
    sceneAudioManager.setVoiceActive(false);
    this.activeTimingSource = 'estimated-duration';
    this.activeState = 'cadence-sync-only';
    this.lastTickPerf = typeof performance !== 'undefined' ? performance.now() : 0;

    callbacks?.onStart?.('cadence-sync-only', 'estimated-duration');
    callbacks?.onProgress?.(0, this.durationSec, 'cadence-sync-only', 'estimated-duration');
    this.emitSnapshot();
    this.startProgressLoop(lineId);
  }

  private startProgressLoop(lineId: string): void {
    if (typeof window === 'undefined') return;
    this.clearLoop();
    this.lastTickPerf = performance.now();

    const step = (now: number) => {
      if (this.activeLineId !== lineId || this.isPaused() || this.activeState === 'idle') {
        return;
      }

      if (this.activeState === 'playing-recording' && this.activeHowl) {
        const seek = this.activeHowl.seek();
        if (typeof seek === 'number' && Number.isFinite(seek)) {
          this.elapsedSec = seek;
        }
        const loadedDur = this.activeHowl.duration();
        if (Number.isFinite(loadedDur) && loadedDur > 0.2) {
          this.durationSec = loadedDur;
        }
        this.activeCallbacks?.onProgress?.(
          this.elapsedSec,
          this.durationSec,
          this.activeState,
          'audio-seek',
        );
        this.emitSnapshot();
        this.rafId = window.requestAnimationFrame(step);
        return;
      }

      // Honest calibrated cadence timing when no audio recording is active
      const dt = Math.max(0, (now - this.lastTickPerf) / 1000);
      this.lastTickPerf = now;
      this.elapsedSec = Math.min(this.durationSec, this.elapsedSec + dt);

      this.activeCallbacks?.onProgress?.(
        this.elapsedSec,
        this.durationSec,
        this.activeState,
        'estimated-duration',
      );
      this.emitSnapshot();

      if (this.elapsedSec >= this.durationSec) {
        const cb = this.activeCallbacks;
        this.clearLoop();
        this.activeState = 'idle';
        this.emitSnapshot();
        cb?.onComplete?.();
        return;
      }

      this.rafId = window.requestAnimationFrame(step);
    };

    this.rafId = window.requestAnimationFrame(step);
  }
}

export const characterVoicePlayer = new CharacterVoicePlayer();
