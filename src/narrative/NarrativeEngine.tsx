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

      // Dispatch synchronous SFX cue if defined
      if (beat.visualChoreography?.sfxCue) {
        sceneAudioManager.triggerCue(beat.visualChoreography.sfxCue);
      }

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
          }
        },
      });
    },
    [],
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
        // Character dialogue ended: restore ambience
        sceneAudioManager.setVoiceActive(false);

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

      lastTriggeredIdxRef.current = idx;
      characterVoicePlayer.stop(60);
      playBeat(beat);
    },
    [playBeat, sortedBeats],
  );

  const pauseNarrator = useCallback(() => {
    if (activeBeatRef.current) {
      characterVoicePlayer.pause();
      setAudioState('Paused');
    }
  }, []);

  const resumeNarrator = useCallback(() => {
    if (activeBeatRef.current && audioState === 'Paused') {
      characterVoicePlayer.resume();
      setAudioState('NarratorSpeaking');
    }
  }, [audioState]);

  const replayNarrator = useCallback(() => {
    if (activeBeatRef.current) {
      characterVoicePlayer.stop(0);
      playBeat(activeBeatRef.current, 0);
    }
  }, [playBeat]);

  // ─────────────────────────────────────────────────────────────────────────
  // Scroll Synchronization Engine (with Skip-Forward and Hysteresis Guard)
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

      // Skip forward logic: user moved forward past one or more beats
      if (candidateIdx > lastTriggeredIdxRef.current) {
        lastTriggeredIdxRef.current = candidateIdx;
        const targetBeat = sortedBeats[candidateIdx];

        // Do not interrupt active dialogue
        if (isDialogueActiveRef.current) return;

        // Abort previous outdated narrator audio cleanly
        characterVoicePlayer.stop(80);
        playBeat(targetBeat);
        return;
      }

      // Backward scroll hysteresis: only allow re-trigger if user scrolled
      // backwards by a significant threshold (at least 8% of total scroll)
      if (delta < -0.08 && candidateIdx < lastTriggeredIdxRef.current) {
        lastTriggeredIdxRef.current = candidateIdx;
        const targetBeat = sortedBeats[candidateIdx];
        if (!isDialogueActiveRef.current) {
          characterVoicePlayer.stop(80);
          playBeat(targetBeat);
        }
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
