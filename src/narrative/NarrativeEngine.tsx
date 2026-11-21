/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NarrativeEngine.tsx
 *
 * Central narrative coordinator and audio-priority state machine for Storyverse.
 * Arbitrates between continuous chapter narrator chronicle and character dialogue,
 * dispatching synchronized visual choreography and cinematic caption state.
 *
 * State Machine
 * ─────────────
 * • Idle
 * • NarratorSpeaking
 * • DialogueSpeaking  (Preempts narrator audio; ducks ambience)
 * • Paused
 * • Muted
 * • Transitioning
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { characterVoicePlayer } from '../audio/CharacterVoicePlayer';
import { sceneAudioManager } from '../audio/SceneAudioManager';
import type {
  NarrationBeat,
  VisualChoreographySpec,
} from './narrativeManifest';

// ─────────────────────────────────────────────────────────────────────────────
// Public API Types
// ─────────────────────────────────────────────────────────────────────────────

export type NarrativeAudioState =
  | 'Idle'
  | 'NarratorSpeaking'
  | 'DialogueSpeaking'
  | 'Paused'
  | 'Muted'
  | 'Transitioning';

export interface NarrativeContextValue {
  /** Explicit high-level audio priority state */
  audioState: NarrativeAudioState;
  /** Active narration beat or null when idle */
  activeBeat: NarrationBeat | null;
  /** Id of active narration beat */
  activeNarrationId: string | null;
  /** Display text of active narration beat */
  narratorText: string;
  /** Normalized progressive reveal [0..1] */
  narratorProgress: number;
  /** Whether the narrator voice or cadence is currently active */
  isNarratorActive: boolean;
  /** Whether character dialogue is currently preempting */
  isDialogueActive: boolean;
  /** Current visual choreography parameters dispatched by active beat */
  activeVisualChoreography: VisualChoreographySpec | null;
  /** Manual trigger for a narration beat */
  triggerNarrationBeat: (id: string, force?: boolean) => void;
  /** Pause the active narrator playback */
  pauseNarrator: () => void;
  /** Resume paused narrator playback */
  resumeNarrator: () => void;
  /** Replay active narration beat from the beginning */
  replayNarrator: () => void;
  /** Signal character dialogue entry or exit (causes preemption/resumption) */
  setDialogueActive: (active: boolean) => void;
}

const NarrativeContext = createContext<NarrativeContextValue | null>(null);

export function useNarrative(): NarrativeContextValue {
  const ctx = useContext(NarrativeContext);
  if (!ctx) {
    throw new Error('useNarrative() must be used inside a <NarrativeProvider>.');
  }
  return ctx;
}

export function useOptionalNarrative(): NarrativeContextValue | null {
  return useContext(NarrativeContext);
}

export interface NarrativeProviderProps {
  /** Array of narrative beats (e.g. SCENE_NARRATION_BEATS) */
  narrativeBeats: ReadonlyArray<NarrationBeat>;
  /** Optional external scroll progress from smooth scroll [0..1] */
  scrollProgress?: number;
  children: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: get current scroll progress [0..1] from document
// ─────────────────────────────────────────────────────────────────────────────
function computeScrollProgress(): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;
  const doc = document.documentElement;
  const max = Math.max(1, doc.scrollHeight - window.innerHeight);
  return Math.min(1, Math.max(0, window.scrollY / max));
}

export const NarrativeProvider: React.FC<NarrativeProviderProps> = ({
  narrativeBeats,
  scrollProgress: externalProgress,
  children,
}) => {
  // Sorted beats by trigger point for binary or linear lookup
  const sortedBeats = useMemo(
    () => [...narrativeBeats].sort((a, b) => a.triggerProgress - b.triggerProgress),
    [narrativeBeats],
  );

  // High-level State
  const [audioState, setAudioState] = useState<NarrativeAudioState>('Idle');
  const [activeBeat, setActiveBeat] = useState<NarrationBeat | null>(null);
  const [narratorProgress, setNarratorProgress] = useState(0);
  const [isDialogueActive, setIsDialogueActive] = useState(false);

  // Operational Refs
  const isDialogueActiveRef = useRef(false);
  const activeBeatRef = useRef<NarrationBeat | null>(null);
  const lastTriggeredIdxRef = useRef<number>(-1);
  const triggeredBeatIdsRef = useRef<Set<string>>(new Set());
  const lastProgressRef = useRef<number>(0);
  const interruptedSeekRef = useRef<number | null>(null);
  const cadenceRafRef = useRef<number | null>(null);

  // Sync internal refs with state
  activeBeatRef.current = activeBeat;
  isDialogueActiveRef.current = isDialogueActive;

  // ─────────────────────────────────────────────────────────────────────────
  // Playback execution for a narration beat
  // ─────────────────────────────────────────────────────────────────────────
  const playBeat = useCallback(
    (beat: NarrationBeat, startSeekSec = 0) => {
      activeBeatRef.current = beat;
      setActiveBeat(beat);
      setNarratorProgress(startSeekSec > 0 && beat.durationMs > 0 ? (startSeekSec * 1000) / beat.durationMs : 0);
      setAudioState('NarratorSpeaking');

      // Preload next upcoming audio cue
      const currentIdx = sortedBeats.findIndex((b) => b.id === beat.id);
      if (currentIdx >= 0 && currentIdx + 1 < sortedBeats.length) {
        characterVoicePlayer.preloadAsset(sortedBeats[currentIdx + 1].audioSrc);
      }

      // Dispatch synchronous SFX cue if defined
      if (beat.visualChoreography?.sfxCue) {
        sceneAudioManager.triggerCue(beat.visualChoreography.sfxCue);
      }

      // If opening canvas beat, latch both s01-01 and s01-02 so transitioning into Scene 01 never duplicates
      if (beat.id === 's00-01') {
        triggeredBeatIdsRef.current.add('s00-01');
        triggeredBeatIdsRef.current.add('s01-01');
        triggeredBeatIdsRef.current.add('s01-02');
      }

      // Duck background ambience smoothly for narrator speech clarity
      sceneAudioManager.setVoiceActive(true);

      // Voice playback or honest visual cadence timing
      void characterVoicePlayer.playLine(beat.id, beat.audioSrc, beat.durationMs, {
        onStart: () => {
          if (startSeekSec > 0) {
            characterVoicePlayer.seekTo(startSeekSec);
          }
        },
        onProgress: (elapsedSec, durationSec) => {
          if (activeBeatRef.current?.id !== beat.id) return;
          const ratio = durationSec > 0 ? Math.min(1, Math.max(0, elapsedSec / durationSec)) : 1;
          setNarratorProgress(ratio);
        },
        onComplete: () => {
          if (activeBeatRef.current?.id === beat.id) {
            setNarratorProgress(1);
            setAudioState('Idle');
            interruptedSeekRef.current = null;
            sceneAudioManager.setVoiceActive(false);
          }
        },
      });
    },
    [sortedBeats],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Preemption & Resumption: setDialogueActive
  // ─────────────────────────────────────────────────────────────────────────
  const setDialogueActive = useCallback(
    (active: boolean) => {
      isDialogueActiveRef.current = active;
      setIsDialogueActive(active);

      if (active) {
        // Character dialogue takes priority: pause in-flight narrator
        if (activeBeatRef.current && (audioState === 'NarratorSpeaking' || characterVoicePlayer.getActiveLineId() === activeBeatRef.current.id)) {
          const snap = characterVoicePlayer.getSnapshot();
          interruptedSeekRef.current = snap.elapsedSec;
          characterVoicePlayer.pause();
        }
        setAudioState('DialogueSpeaking');
        // Duck background ambience for dialogue clarity
        sceneAudioManager.setVoiceActive(true);
      } else {
        // Resume interrupted narrator if still within active narrative window
        if (activeBeatRef.current && interruptedSeekRef.current !== null) {
          const seekTo = interruptedSeekRef.current;
          interruptedSeekRef.current = null;
          setAudioState('NarratorSpeaking');
          if (characterVoicePlayer.isPaused() && characterVoicePlayer.getActiveLineId() === activeBeatRef.current.id) {
            characterVoicePlayer.resume();
          } else {
            playBeat(activeBeatRef.current, seekTo);
          }
        } else {
          // Restore ambience volume smoothly when all voices complete
          sceneAudioManager.setVoiceActive(false);
          setAudioState('Idle');
        }
      }
    },
    [audioState, playBeat],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Manual Controls
  // ─────────────────────────────────────────────────────────────────────────
  const triggerNarrationBeat = useCallback(
    (id: string, force = false) => {
      const idx = sortedBeats.findIndex((b) => b.id === id);
      if (idx === -1) return;
      const beat = sortedBeats[idx];

      if (isDialogueActiveRef.current && !force) return;

      // Hysteresis & idempotency guard: do not restart audio if already playing or completed
      if (!force) {
        if (triggeredBeatIdsRef.current.has(beat.id)) return;
        if (activeBeatRef.current?.id === beat.id && characterVoicePlayer.getSnapshot().isPlaying) return;
      }

      lastTriggeredIdxRef.current = idx;
      if (force) {
        triggeredBeatIdsRef.current.delete(beat.id);
      } else {
        triggeredBeatIdsRef.current.add(beat.id);
      }
      if (beat.id === 's00-01') {
        triggeredBeatIdsRef.current.add('s01-01');
        triggeredBeatIdsRef.current.add('s01-02');
      }
      characterVoicePlayer.stop(160);
      playBeat(beat);
    },
    [playBeat, sortedBeats],
  );

  const pauseNarrator = useCallback(() => {
    if (activeBeatRef.current) {
      characterVoicePlayer.pause();
      setAudioState('Paused');
      sceneAudioManager.setVoiceActive(false);
    }
  }, []);

  const resumeNarrator = useCallback(() => {
    if (activeBeatRef.current && audioState === 'Paused') {
      characterVoicePlayer.resume();
      setAudioState('NarratorSpeaking');
      sceneAudioManager.setVoiceActive(true);
    }
  }, [audioState]);

  const replayNarrator = useCallback(() => {
    if (activeBeatRef.current) {
      characterVoicePlayer.stop(0);
      playBeat(activeBeatRef.current, 0);
    }
  }, [playBeat]);

  // ─────────────────────────────────────────────────────────────────────────
  // Scroll Synchronization Engine (with One-Shot Latch & Hysteresis Guard)
  // ─────────────────────────────────────────────────────────────────────────
  const processScrollPosition = useCallback(
    (progress: number) => {
      const delta = progress - lastProgressRef.current;
      lastProgressRef.current = progress;

      // Find highest beat whose trigger <= current progress
      let candidateIdx = -1;
      for (let i = 0; i < sortedBeats.length; i++) {
        if (sortedBeats[i].triggerProgress <= progress) {
          candidateIdx = i;
        } else {
          break;
        }
      }

      if (candidateIdx === -1) return;

      // Forward progression: user crossed into a new beat
      if (candidateIdx > lastTriggeredIdxRef.current) {
        lastTriggeredIdxRef.current = candidateIdx;
        const targetBeat = sortedBeats[candidateIdx];

        // One-shot latch: do not restart if already triggered in this forward pass
        if (triggeredBeatIdsRef.current.has(targetBeat.id)) {
          return;
        }
        triggeredBeatIdsRef.current.add(targetBeat.id);

        // Do not interrupt active dialogue
        if (isDialogueActiveRef.current) return;

        // Fade out previous audio smoothly (160ms) to avoid sudden cutoffs
        characterVoicePlayer.stop(160);
        playBeat(targetBeat);
        return;
      }

      // Backward scroll: update visual caption focus without restarting completed audio
      if (candidateIdx < lastTriggeredIdxRef.current) {
        lastTriggeredIdxRef.current = candidateIdx;
        const targetBeat = sortedBeats[candidateIdx];
        activeBeatRef.current = targetBeat;
        setActiveBeat(targetBeat);
        setNarratorProgress(1);
      }
    },
    [playBeat, sortedBeats],
  );

  // Scroll listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (externalProgress !== undefined) {
      processScrollPosition(externalProgress);
      return;
    }

    const onScroll = () => {
      const p = computeScrollProgress();
      processScrollPosition(p);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [externalProgress, processScrollPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cadenceRafRef.current) cancelAnimationFrame(cadenceRafRef.current);
      characterVoicePlayer.stop(0);
    };
  }, []);

  const value = useMemo<NarrativeContextValue>(
    () => ({
      audioState,
      activeBeat,
      activeNarrationId: activeBeat?.id ?? null,
      narratorText: activeBeat?.text ?? '',
      narratorProgress,
      isNarratorActive:
        audioState === 'NarratorSpeaking' ||
        (audioState === 'Paused' && activeBeat !== null),
      isDialogueActive,
      activeVisualChoreography: activeBeat?.visualChoreography ?? null,
      triggerNarrationBeat,
      pauseNarrator,
      resumeNarrator,
      replayNarrator,
      setDialogueActive,
    }),
    [
      audioState,
      activeBeat,
      narratorProgress,
      isDialogueActive,
      triggerNarrationBeat,
      pauseNarrator,
      resumeNarrator,
      replayNarrator,
      setDialogueActive,
    ],
  );

  return <NarrativeContext.Provider value={value}>{children}</NarrativeContext.Provider>;
};
