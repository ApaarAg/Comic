import { Howl, Howler } from 'howler';
import { sceneAudioManager } from './SceneAudioManager';

export type VoiceAssetState =
  | 'idle'
  | 'playing-recording'
  | 'paused-recording'
  | 'cadence-sync-only'
  | 'paused-cadence';

export type VoiceEventLifecycle =
  | 'IDLE'
  | 'QUEUED'
  | 'LOADING'
  | 'PLAYING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export type VoiceCancellationReason =
  | 'replaced'
  | 'scene_changed'
  | 'scrolled_away'
  | 'stopped'
  | 'unmounted';

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
  onCancel?: (reason: VoiceCancellationReason) => void;
  onError?: (error: unknown) => void;
}

export interface VoicePlaybackSnapshot {
  lineId: string | null;
  eventId: string | null;
  generation: number;
  sceneId: string | null;
  audioSrc: string | null;
  elapsedSec: number;
  durationSec: number;
  state: VoiceAssetState;
  lifecycle: VoiceEventLifecycle;
  cancelReason: VoiceCancellationReason | null;
  timingSource: 'audio-seek' | 'estimated-duration';
  isPaused: boolean;
  /** Whether the voice is currently actively playing (not paused, not idle) */
  isPlaying: boolean;
}

interface VoiceTraceEvent {
  type: 'ownership' | 'lifecycle';
  sceneId: string | null;
  lineId: string | null;
  eventId: string | null;
  generation: number;
  lifecycle?: VoiceEventLifecycle;
  reason?: VoiceCancellationReason;
  error?: string;
  audioSrc: string | null;
  playbackState: VoiceAssetState;
  timingSource: 'audio-seek' | 'estimated-duration';
  elapsedSec: number;
  durationSec: number;
  ownerSceneId: string | null;
  audioContextState: string;
  voiceChannelActive: boolean;
  activeScoreTrack: string;
  activeAmbienceTrack: string;
  scrollY: number;
  time: number;
}

declare global {
  interface Window {
    __STORYVERSE_AUDIO_TRACE__?: boolean;
    __STORYVERSE_AUDIO_DEBUG__?: () => {
      voice: VoicePlaybackSnapshot;
      ownerSceneId: string | null;
      mixer: ReturnType<typeof sceneAudioManager.getSnapshot>;
    };
  }
}

/**
 * Owns the single voice channel. Each play request receives a generation token;
 * asynchronous manifest, load, unlock, and Howler callbacks must still match
 * that token and the active scene before they can change playback.
 */
class CharacterVoicePlayer {
  private activeHowl: Howl | null = null;
  private activeSoundId: number | null = null;
  private activeHowlCleanup: (() => void) | null = null;
  private activeLineId: string | null = null;
  private activeEventId: string | null = null;
  private activeEventSceneId: string | null = null;
  private activeAudioSrc: string | null = null;
  private activeCallbacks: VoicePlaybackCallbacks | undefined;
  private activeTimingSource: 'audio-seek' | 'estimated-duration' = 'estimated-duration';
  private activeState: VoiceAssetState = 'idle';
  private lifecycle: VoiceEventLifecycle = 'IDLE';
  private cancelReason: VoiceCancellationReason | null = null;
  private activeSceneId: string | null = null;
  private generation = 0;

  private durationSec = 3.0;
  private elapsedSec = 0;
  private lastTickPerf = 0;
  private rafId: number | null = null;
  private fadeTimers = new Set<number>();

  private availableVoicePaths: Set<string> | null = null;
  private manifestPromise: Promise<Set<string>> | null = null;
  private preloadedHowls = new Map<string, Howl>();
  private mixerUnsub: (() => void) | null = null;
  private listeners = new Set<(snapshot: VoicePlaybackSnapshot) => void>();

  public getSnapshot(): VoicePlaybackSnapshot {
    return {
      lineId: this.activeLineId,
      eventId: this.activeEventId,
      generation: this.generation,
      sceneId: this.activeEventSceneId,
      audioSrc: this.activeAudioSrc,
      elapsedSec: this.elapsedSec,
      durationSec: this.durationSec,
      state: this.activeState,
      lifecycle: this.lifecycle,
      cancelReason: this.cancelReason,
      timingSource: this.activeTimingSource,
      isPaused: this.isPaused(),
      isPlaying: this.activeState === 'playing-recording' && !this.isPaused(),
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

  private trace(event: Omit<
    VoiceTraceEvent,
    'scrollY' | 'time' | 'ownerSceneId' | 'audioContextState' |
    'voiceChannelActive' | 'activeScoreTrack' | 'activeAmbienceTrack' |
    'audioSrc' | 'playbackState' | 'timingSource' | 'elapsedSec' | 'durationSec'
  >): void {
    if (typeof window === 'undefined' || !window.__STORYVERSE_AUDIO_TRACE__) return;
    window.__STORYVERSE_AUDIO_DEBUG__ = () => ({
      voice: this.getSnapshot(),
      ownerSceneId: this.activeSceneId,
      mixer: sceneAudioManager.getSnapshot(),
    });
    const mixer = sceneAudioManager.getSnapshot();
    window.dispatchEvent(
      new CustomEvent<VoiceTraceEvent>('storyverse:audio-lifecycle', {
        detail: {
          ...event,
          audioSrc: this.activeAudioSrc,
          playbackState: this.activeState,
          timingSource: this.activeTimingSource,
          elapsedSec: this.elapsedSec,
          durationSec: this.durationSec,
          ownerSceneId: this.activeSceneId,
          audioContextState: Howler.ctx?.state ?? 'uninitialized',
          voiceChannelActive: mixer.isVoiceActive,
          activeScoreTrack: mixer.activeScoreTrack,
          activeAmbienceTrack: mixer.activeAmbienceTrack,
          scrollY: window.scrollY,
          time: performance.now(),
        },
      }),
    );
  }

  private transitionLifecycle(
    lifecycle: VoiceEventLifecycle,
    options: { reason?: VoiceCancellationReason; error?: unknown } = {},
  ): void {
    this.lifecycle = lifecycle;
    this.cancelReason = options.reason ?? null;
    this.trace({
      type: 'lifecycle',
      sceneId: this.activeEventSceneId,
      lineId: this.activeLineId,
      eventId: this.activeEventId,
      generation: this.generation,
      lifecycle,
      reason: options.reason,
      error: options.error instanceof Error ? options.error.message : undefined,
    });
    this.emitSnapshot();
  }

  private ensureMixerSync(): void {
    if (this.mixerUnsub) return;
    this.mixerUnsub = sceneAudioManager.subscribe(() => {
      if (this.activeHowl && this.activeSoundId !== null) {
        const snap = sceneAudioManager.getSnapshot();
        const gain = snap.masterMuted || snap.voiceMuted
          ? 0
          : sceneAudioManager.getEffectiveVoiceGain();
        this.activeHowl.volume(gain, this.activeSoundId);
      }
    });
  }

  public setActiveScene(sceneId: string | null): void {
    if (this.activeSceneId === sceneId) return;
    this.generation += 1;
    const previousSceneId = this.activeSceneId;
    this.activeSceneId = sceneId;
    this.trace({
      type: 'ownership',
      sceneId,
      lineId: this.activeLineId,
      eventId: this.activeEventId,
      generation: this.generation,
    });

    if (this.activeLineId && (sceneId === null || this.activeEventSceneId !== sceneId)) {
      this.cancelCurrent('scene_changed', 0);
    } else if (previousSceneId !== null && sceneId === null && this.activeHowl) {
      this.cancelCurrent('scene_changed', 0);
    }
  }

  public getActiveSceneId(): string | null {
    return this.activeSceneId;
  }

  public async checkAvailableVoiceManifest(): Promise<Set<string>> {
    if (this.availableVoicePaths) return this.availableVoicePaths;
    if (typeof window === 'undefined') return new Set();
    if (!this.manifestPromise) {
      this.manifestPromise = fetch('/api/voice-assets', { method: 'GET' })
        .then(async (res) => {
          if (!res.ok) throw new Error(`Voice manifest request failed (${res.status})`);
          const json = (await res.json()) as { available?: string[] };
          this.availableVoicePaths = new Set(json.available ?? []);
          return this.availableVoicePaths;
        })
        .catch(() => {
          // Static builds and offline previews can still resolve known public assets.
          this.availableVoicePaths = new Set();
          return this.availableVoicePaths;
        });
    }
    return this.manifestPromise;
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
    if (!audioSrc || typeof window === 'undefined') return;
    this.getOrCreateHowl(audioSrc);
  }

  private getOrCreateHowl(audioSrc: string): Howl {
    const existing = this.preloadedHowls.get(audioSrc);
    if (existing) {
      this.preloadedHowls.delete(audioSrc);
      this.preloadedHowls.set(audioSrc, existing);
      return existing;
    }

    while (this.preloadedHowls.size >= 16) {
      const evictable = [...this.preloadedHowls.entries()].find(([, howl]) => howl !== this.activeHowl);
      if (!evictable) break;
      const [oldSrc, oldHowl] = evictable;
      oldHowl.unload();
      this.preloadedHowls.delete(oldSrc);
    }

    const howl = new Howl({
      src: [audioSrc],
      preload: true,
      volume: 0,
    });
    this.preloadedHowls.set(audioSrc, howl);
    return howl;
  }

  private clearLoop(): void {
    if (this.rafId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public stop(
    fadeMs = 0,
    reason: VoiceCancellationReason = 'stopped',
  ): void {
    this.generation += 1;
    this.cancelCurrent(reason, fadeMs);
  }

  private cancelCurrent(reason: VoiceCancellationReason, fadeMs = 0): void {
    this.clearLoop();

    const oldHowl = this.activeHowl;
    const oldSoundId = this.activeSoundId;
    const callbacks = this.activeCallbacks;
    const wasActive = Boolean(this.activeLineId) &&
      (this.lifecycle === 'QUEUED' || this.lifecycle === 'LOADING' || this.lifecycle === 'PLAYING');

    this.activeHowlCleanup?.();
    this.activeHowlCleanup = null;
    if (oldHowl && oldSoundId !== null) {
      if (fadeMs > 0 && oldHowl.playing(oldSoundId) && typeof window !== 'undefined') {
        oldHowl.fade(oldHowl.volume(oldSoundId) as number, 0, fadeMs, oldSoundId);
        const fadeTimer = window.setTimeout(() => {
          this.fadeTimers.delete(fadeTimer);
          oldHowl.stop(oldSoundId);
        }, fadeMs + 25);
        this.fadeTimers.add(fadeTimer);
      } else {
        oldHowl.stop(oldSoundId);
      }
    }

    if (wasActive) {
      this.activeState = 'idle';
      sceneAudioManager.setVoiceActive(false);
      this.transitionLifecycle('CANCELLED', { reason });
      this.activeHowl = null;
      this.activeSoundId = null;
      this.activeLineId = null;
      this.activeEventSceneId = null;
      this.activeAudioSrc = null;
      this.activeCallbacks = undefined;
      this.elapsedSec = 0;
      callbacks?.onCancel?.(reason);
      this.emitSnapshot();
      return;
    }

    this.activeState = 'idle';
    this.activeHowl = null;
    this.activeSoundId = null;
    this.activeLineId = null;
    this.activeEventSceneId = null;
    this.activeAudioSrc = null;
    this.activeCallbacks = undefined;
    this.elapsedSec = 0;
    sceneAudioManager.setVoiceActive(false);
    this.emitSnapshot();
  }

  public pause(): void {
    if (!this.activeLineId || this.isPaused() || this.activeState === 'idle') return;
    this.clearLoop();
    if (this.activeHowl && this.activeSoundId !== null && this.activeState === 'playing-recording') {
      const seek = this.activeHowl.seek(this.activeSoundId);
      if (typeof seek === 'number' && Number.isFinite(seek)) {
        this.elapsedSec = seek;
      }
      this.activeHowl.pause(this.activeSoundId);
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
    const targetGeneration = this.generation;
    if (this.activeHowl && this.activeSoundId !== null && this.activeState === 'paused-recording') {
      const mixer = sceneAudioManager.getSnapshot();
      sceneAudioManager.setVoiceActive(!mixer.masterMuted && !mixer.voiceMuted);
      this.activeHowl.play(this.activeSoundId);
      this.activeState = 'playing-recording';
      this.startProgressLoop(targetGeneration);
    } else if (this.activeState === 'paused-cadence') {
      this.activeState = 'cadence-sync-only';
      this.lastTickPerf = performance.now();
      this.startProgressLoop(targetGeneration);
    }
    this.activeCallbacks?.onPauseChange?.(false, this.activeState);
    this.emitSnapshot();
  }

  public seekTo(seconds: number): void {
    if (!this.activeLineId || !Number.isFinite(seconds)) return;
    const clamped = Math.max(0, Math.min(this.durationSec, seconds));
    this.elapsedSec = clamped;
    this.lastTickPerf = typeof performance !== 'undefined' ? performance.now() : 0;

    if (this.activeHowl && this.activeSoundId !== null && (this.activeState === 'playing-recording' || this.activeState === 'paused-recording')) {
      this.activeHowl.seek(clamped, this.activeSoundId);
    } else if (this.activeState === 'idle' && this.activeTimingSource === 'estimated-duration') {
      this.activeState = 'cadence-sync-only';
      this.startProgressLoop(this.generation);
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
    const sceneId = this.activeEventSceneId ?? undefined;
    void this.playLine(lineId, audioSrc, durationMs, callbacks, sceneId);
  }

  public async playLine(
    lineId: string,
    voiceAssetPath: string | undefined,
    fallbackDurationMs: number,
    callbacks?: VoicePlaybackCallbacks,
    sceneId?: string,
  ): Promise<VoiceAssetState> {
    this.ensureMixerSync();
    this.cancelCurrent('replaced', 0);

    const generation = ++this.generation;
    const eventId = `${lineId}@${generation}`;
    const expectedSceneId = sceneId ?? this.activeSceneId;

    if (!expectedSceneId || this.activeSceneId === null || expectedSceneId !== this.activeSceneId) {
      this.activeEventId = eventId;
      this.activeLineId = lineId;
      this.activeEventSceneId = expectedSceneId ?? null;
      this.transitionLifecycle('CANCELLED', { reason: 'scene_changed' });
      this.activeLineId = null;
      this.activeEventSceneId = null;
      return 'idle';
    }
    this.activeEventId = eventId;
    this.activeLineId = lineId;
    this.activeEventSceneId = expectedSceneId ?? null;
    this.activeAudioSrc = voiceAssetPath ?? null;
    this.activeCallbacks = callbacks;
    this.activeState = 'idle';
    this.activeTimingSource = 'estimated-duration';
    this.durationSec = Math.max(0.8, fallbackDurationMs / 1000);
    this.elapsedSec = 0;
    this.transitionLifecycle('QUEUED');
    this.transitionLifecycle('LOADING');
    if (voiceAssetPath?.startsWith('/assets/audio/voices/')) {
      sceneAudioManager.setVoiceActive(true);
    }

    try {
      if (!this.isCurrent(generation, lineId, expectedSceneId)) return 'idle';

      const isRecordedAsset = Boolean(voiceAssetPath) &&
        (voiceAssetPath!.startsWith('/assets/audio/') || (this.availableVoicePaths && this.availableVoicePaths.has(voiceAssetPath!)));
      if (!isRecordedAsset || !voiceAssetPath) {
        this.startCadenceFallback(generation, lineId, expectedSceneId ?? undefined, callbacks);
        return 'cadence-sync-only';
      }

      const howl = this.getOrCreateHowl(voiceAssetPath);
      this.activeHowl = howl;
      this.activeTimingSource = 'audio-seek';

      const onLoad = () => {
        if (!this.isCurrent(generation, lineId, expectedSceneId) || this.activeHowl !== howl) return;
        const loadedDur = howl.duration();
        if (Number.isFinite(loadedDur) && loadedDur > 0.2) this.durationSec = loadedDur;
        this.emitSnapshot();
      };
      if (howl.state() === 'loaded') onLoad();
      const listeners: Array<() => void> = [];
      const listenOnce = (event: string, listener: (...args: any[]) => void) => {
        const wrapped = (...args: any[]) => {
          howl.off(event, wrapped);
          listener(...args);
        };
        howl.on(event, wrapped);
        listeners.push(() => howl.off(event, wrapped));
      };
      this.activeHowlCleanup = () => {
        listeners.splice(0).forEach((removeListener) => removeListener());
      };
      if (howl.state() !== 'loaded') listenOnce('load', onLoad);

      listenOnce('loaderror', (_soundId, error) => {
        if (!this.isCurrent(generation, lineId, expectedSceneId) || this.activeHowl !== howl) return;
        this.failCurrent(error, generation);
      });

      let waitingForUnlock = false;
      let retriedAfterUnlock = false;
      const startHowl = () => {
        if (!this.isCurrent(generation, lineId, expectedSceneId) || this.activeHowl !== howl) return;
        const soundId = howl.play();
        this.activeSoundId = soundId;
        const gain = sceneAudioManager.getSnapshot().masterMuted || sceneAudioManager.getSnapshot().voiceMuted
          ? 0
          : sceneAudioManager.getEffectiveVoiceGain();
        howl.volume(gain, soundId);
      };

      listenOnce('play', (soundId) => {
        if (!this.isCurrent(generation, lineId, expectedSceneId) || this.activeHowl !== howl) {
          howl.stop(soundId);
          return;
        }
        this.activeSoundId = soundId;
        this.activeState = 'playing-recording';
        sceneAudioManager.setVoiceActive(true);
        this.transitionLifecycle('PLAYING');
        callbacks?.onStart?.('playing-recording', 'audio-seek');
        callbacks?.onProgress?.(this.elapsedSec, this.durationSec, 'playing-recording', 'audio-seek');
        this.startProgressLoop(generation);
      });

      const handlePlayError = (_soundId: number, error: unknown) => {
        if (!this.isCurrent(generation, lineId, expectedSceneId) || this.activeHowl !== howl) return;
        if (!waitingForUnlock && !retriedAfterUnlock) {
          waitingForUnlock = true;
          // Howler recommends waiting for its unlock event after a browser blocks playback.
          listenOnce('unlock', () => {
            waitingForUnlock = false;
            retriedAfterUnlock = true;
            listenOnce('playerror', handlePlayError);
            startHowl();
          });
          return;
        }
        this.failCurrent(error, generation);
      };
      listenOnce('playerror', handlePlayError);

      listenOnce('end', (soundId) => {
        if (soundId !== this.activeSoundId || !this.isCurrent(generation, lineId, expectedSceneId)) return;
        this.completeCurrent(generation);
      });

      startHowl();
      return 'playing-recording';
    } catch (error) {
      if (this.isCurrent(generation, lineId, expectedSceneId)) this.failCurrent(error, generation);
      return 'idle';
    }
  }

  private isCurrent(generation: number, lineId: string, sceneId?: string | null): boolean {
    return (
      this.generation === generation &&
      this.activeLineId === lineId &&
      this.activeSceneId !== null &&
      this.activeEventSceneId !== null &&
      this.activeSceneId === this.activeEventSceneId &&
      (!sceneId || this.activeSceneId === sceneId)
    );
  }

  private startCadenceFallback(
    generation: number,
    lineId: string,
    sceneId: string | undefined,
    callbacks?: VoicePlaybackCallbacks,
  ): void {
    if (!this.isCurrent(generation, lineId, sceneId)) return;
    sceneAudioManager.setVoiceActive(false);
    this.activeTimingSource = 'estimated-duration';
    this.activeState = 'cadence-sync-only';
    this.lastTickPerf = typeof performance !== 'undefined' ? performance.now() : 0;
    this.transitionLifecycle('PLAYING');
    callbacks?.onStart?.('cadence-sync-only', 'estimated-duration');
    callbacks?.onProgress?.(0, this.durationSec, 'cadence-sync-only', 'estimated-duration');
    this.startProgressLoop(generation);
  }

  private failCurrent(error: unknown, generation: number): void {
    if (this.generation !== generation || !this.activeLineId) return;
    this.clearLoop();
    const callbacks = this.activeCallbacks;
    const howl = this.activeHowl;
    const soundId = this.activeSoundId;
    if (howl && soundId !== null) howl.stop(soundId);
    this.activeHowlCleanup?.();
    this.activeHowlCleanup = null;
    this.activeHowl = null;
    this.activeSoundId = null;
    this.activeState = 'idle';
    sceneAudioManager.setVoiceActive(false);
    this.transitionLifecycle('FAILED', { error });
    this.activeLineId = null;
    this.activeEventSceneId = null;
    this.activeAudioSrc = null;
    this.activeCallbacks = undefined;
    callbacks?.onError?.(error);
    this.emitSnapshot();
  }

  private completeCurrent(generation: number): void {
    if (this.generation !== generation || !this.activeLineId) return;
    this.clearLoop();
    const callbacks = this.activeCallbacks;
    this.elapsedSec = this.durationSec;
    callbacks?.onProgress?.(this.durationSec, this.durationSec, 'idle', this.activeTimingSource);
    this.activeState = 'idle';
    sceneAudioManager.setVoiceActive(false);
    this.transitionLifecycle('COMPLETED');
    this.activeHowlCleanup?.();
    this.activeHowlCleanup = null;
    this.activeHowl = null;
    this.activeSoundId = null;
    this.activeLineId = null;
    this.activeEventSceneId = null;
    this.activeAudioSrc = null;
    this.activeCallbacks = undefined;
    callbacks?.onComplete?.();
    this.emitSnapshot();
  }

  private startProgressLoop(generation: number): void {
    if (typeof window === 'undefined') return;
    this.clearLoop();
    this.lastTickPerf = performance.now();

    const step = (now: number) => {
      if (this.generation !== generation || this.isPaused() || this.activeState === 'idle') return;

      if (this.activeState === 'playing-recording' && this.activeHowl && this.activeSoundId !== null) {
        const seek = this.activeHowl.seek(this.activeSoundId);
        if (typeof seek === 'number' && Number.isFinite(seek)) this.elapsedSec = seek;
        const loadedDur = this.activeHowl.duration(this.activeSoundId);
        if (Number.isFinite(loadedDur) && loadedDur > 0.2) this.durationSec = loadedDur;
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
        this.completeCurrent(generation);
        return;
      }
      this.rafId = window.requestAnimationFrame(step);
    };

    this.rafId = window.requestAnimationFrame(step);
  }
}

export const characterVoicePlayer = new CharacterVoicePlayer();
