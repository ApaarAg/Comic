import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FileText,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  CHAPTER_DIALOGUE_SEQUENCES,
  type CharacterId,
  type DialogueLine,
} from '../story/dialogueManifest';
import { resolveScrollDialogueBeat } from '../story/scrollMath';
import { sceneAudioManager } from '../audio/SceneAudioManager';
import {
  characterVoicePlayer,
  type VoiceAssetState,
} from '../audio/CharacterVoicePlayer';
import { SyncedSpeechBubble } from './SyncedSpeechBubble';
<<<<<<< HEAD
import { useOptionalNarrative } from '../narrative/NarrativeEngine';
=======
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74

gsap.registerPlugin(ScrollTrigger);

// Tracks which DialogueController currently owns voice playback so an outgoing
// controller never cancels audio triggered by the incoming controller.
let activeSequenceOwner: string | null = null;

interface DialogueControllerProps {
  sequenceId: string;
  reducedMotion: boolean;
  /** Optional parent stage element spanning all character artwork for this sequence */
  scrollStageRef?: React.RefObject<HTMLElement | HTMLDivElement | null>;
  onActiveSpeakerChange?: (speaker: CharacterId | null, line: DialogueLine | null) => void;
  onSkipNextScene?: () => void;
  className?: string;
}

export const DialogueController: React.FC<DialogueControllerProps> = ({
  sequenceId,
  reducedMotion,
  scrollStageRef,
  onActiveSpeakerChange,
  onSkipNextScene,
  className = '',
}) => {
  const lines = CHAPTER_DIALOGUE_SEQUENCES[sequenceId] ?? [];
  const containerRef = useRef<HTMLDivElement>(null);
<<<<<<< HEAD
  const narrative = useOptionalNarrative();
=======
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74

  const [activeIndex, setActiveIndex] = useState(0);
  const [isStageActive, setIsStageActive] = useState(reducedMotion);
  const [isPastStage, setIsPastStage] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [playbackState, setPlaybackState] = useState<VoiceAssetState>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [durationSec, setDurationSec] = useState<number>(
    lines[0]?.duration ?? 3.0,
  );
  const [isMuted, setIsMuted] = useState<boolean>(() => sceneAudioManager.getMuted());

  const activeIndexRef = useRef(0);
  const isStageActiveRef = useRef(reducedMotion);
  const lastTriggeredLineIdRef = useRef<string | null>(null);
<<<<<<< HEAD
  const triggeredLineIdsRef = useRef<Set<string>>(new Set());
=======
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74

  const beatSpecs = useMemo(
    () =>
      lines.map((line) => ({
        id: line.id,
        triggerProgress: line.triggerProgress,
        durationSec: line.duration,
        wordTimings: line.wordTimings,
      })),
    [lines],
  );

  const activeLine = lines[activeIndex] ?? null;

  useEffect(() => {
    const unsub = sceneAudioManager.subscribe(() => {
      setIsMuted(sceneAudioManager.getMuted());
    });
    return unsub;
  }, []);

  // Notify scene artwork highlight target whenever active dialogue beat changes
<<<<<<< HEAD
  const onActiveSpeakerChangeRef = useRef(onActiveSpeakerChange);
  onActiveSpeakerChangeRef.current = onActiveSpeakerChange;
  const lastReportedLineIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentId = activeLine ? activeLine.id : null;
    if (currentId === lastReportedLineIdRef.current) return;
    lastReportedLineIdRef.current = currentId;

    if (!activeLine) {
      onActiveSpeakerChangeRef.current?.(null, null);
      return;
    }
    onActiveSpeakerChangeRef.current?.(activeLine.characterFocus ?? activeLine.speaker, activeLine);
  }, [activeLine]);
=======
  useEffect(() => {
    if (!activeLine) {
      onActiveSpeakerChange?.(null, null);
      return;
    }
    onActiveSpeakerChange?.(activeLine.characterFocus ?? activeLine.speaker, activeLine);
  }, [activeLine, onActiveSpeakerChange]);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74

  const startLinePlayback = useCallback(
    (lineIndex: number, forceRestart = false) => {
      const line = lines[lineIndex];
      if (!line) return;

      if (!forceRestart && lastTriggeredLineIdRef.current === line.id && activeSequenceOwner === sequenceId) {
        return;
      }

      lastTriggeredLineIdRef.current = line.id;
      activeSequenceOwner = sequenceId;
      setIsPaused(false);
      setElapsedSec(0);
      setDurationSec(line.duration);

      sceneAudioManager.triggerCue(line.sfxCue ?? 'bubble');

<<<<<<< HEAD
      if (line.mode === 'dialogue') {
        narrative?.setDialogueActive(true);
      }

=======
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
      const nextLine = lines[lineIndex + 1];
      if (nextLine?.audioSrc) {
        characterVoicePlayer.preloadAsset(nextLine.audioSrc);
      }

      void characterVoicePlayer.playLine(line.id, line.audioSrc, line.durationMs, {
        onStart: (state) => {
          if (activeSequenceOwner === sequenceId) {
            setPlaybackState(state);
          }
        },
        onProgress: (elapsed, dur, state) => {
          if (activeSequenceOwner === sequenceId) {
            setElapsedSec(elapsed);
            setDurationSec(dur);
            setPlaybackState(state);
          }
        },
        onPauseChange: (paused, state) => {
          if (activeSequenceOwner === sequenceId) {
            setIsPaused(paused);
            setPlaybackState(state);
          }
        },
        onComplete: () => {
          if (activeSequenceOwner === sequenceId) {
            setPlaybackState('idle');
            setIsPaused(false);
<<<<<<< HEAD
            narrative?.setDialogueActive(false);
=======
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          }
        },
      });
    },
<<<<<<< HEAD
    [lines, narrative, sequenceId],
=======
    [lines, sequenceId],
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
  );

  // Scroll-driven beat trigger anchored to parent scrollStageRef (or self container)
  useEffect(() => {
    if (lines.length === 0) return;

    if (reducedMotion) {
      isStageActiveRef.current = true;
      setIsStageActive(true);
      setIsPastStage(false);
      setElapsedSec(lines[0].duration);
      return;
    }

    const triggerEl = scrollStageRef?.current ?? containerRef.current;
    if (!triggerEl) return;

    const isTallStage = triggerEl.offsetHeight > 380;

    const ctx = gsap.context(() => {
<<<<<<< HEAD
      // 1. Panel-specific triggers for exact visual comic synchronization
      const panelTriggers: Array<{ lineIndex: number; line: DialogueLine; element: HTMLElement }> = [];
      lines.forEach((line, idx) => {
        if (line.panelTarget) {
          const found =
            (triggerEl.querySelector(`img[src*="${line.panelTarget}"]`) as HTMLElement | null) ??
            (document.querySelector(`img[src*="${line.panelTarget}"]`) as HTMLElement | null);
          if (found) {
            const triggerTarget =
              (found.closest('.comic-panel-frame, [data-traffic-beat], .relative') as HTMLElement | null) ??
              found;
            panelTriggers.push({ lineIndex: idx, line, element: triggerTarget });
          }
        }
      });

      if (panelTriggers.length > 0) {
        panelTriggers.forEach(({ lineIndex, line, element }) => {
          ScrollTrigger.create({
            trigger: element,
            start: 'top 65%',
            end: 'bottom 35%',
            onEnter: () => {
              isStageActiveRef.current = true;
              setIsStageActive(true);
              setIsPastStage(false);
              activeIndexRef.current = lineIndex;
              setActiveIndex(lineIndex);
              if (!triggeredLineIdsRef.current.has(line.id)) {
                triggeredLineIdsRef.current.add(line.id);
                startLinePlayback(lineIndex, false);
              }
            },
            onEnterBack: () => {
              isStageActiveRef.current = true;
              setIsStageActive(true);
              setIsPastStage(false);
              // Focus speech bubble text without restarting completed voice
              activeIndexRef.current = lineIndex;
              setActiveIndex(lineIndex);
            },
          });
        });
      }

      // 2. Stage container lifecycle trigger (for active stage bounds, clean exit, and fallback)
=======
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
      ScrollTrigger.create({
        trigger: triggerEl,
        start: isTallStage ? 'top 66%' : 'top 76%',
        end: isTallStage ? 'bottom 46%' : 'bottom 24%',
        onEnter: (self) => {
          isStageActiveRef.current = true;
          setIsStageActive(true);
          setIsPastStage(false);
<<<<<<< HEAD
          if (panelTriggers.length === 0) {
            const nextIdx = resolveScrollDialogueBeat(
              self.progress,
              beatSpecs,
              activeIndexRef.current,
              0.025,
            );
            activeIndexRef.current = nextIdx;
            setActiveIndex(nextIdx);
            const targetLine = lines[nextIdx];
            if (targetLine && !triggeredLineIdsRef.current.has(targetLine.id)) {
              triggeredLineIdsRef.current.add(targetLine.id);
              startLinePlayback(nextIdx, false);
            }
          }
=======
          const nextIdx = resolveScrollDialogueBeat(
            self.progress,
            beatSpecs,
            activeIndexRef.current,
            0.025,
          );
          activeIndexRef.current = nextIdx;
          setActiveIndex(nextIdx);
          startLinePlayback(nextIdx, false);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
        },
        onEnterBack: (self) => {
          isStageActiveRef.current = true;
          setIsStageActive(true);
          setIsPastStage(false);
<<<<<<< HEAD
          if (panelTriggers.length === 0) {
            const nextIdx = resolveScrollDialogueBeat(
              self.progress,
              beatSpecs,
              activeIndexRef.current,
              0.025,
            );
            activeIndexRef.current = nextIdx;
            setActiveIndex(nextIdx);
          }
        },
        onUpdate: (self) => {
          if (!self.isActive || panelTriggers.length > 0) return;
=======
          const nextIdx = resolveScrollDialogueBeat(
            self.progress,
            beatSpecs,
            activeIndexRef.current,
            0.025,
          );
          activeIndexRef.current = nextIdx;
          setActiveIndex(nextIdx);
          startLinePlayback(nextIdx, true);
        },
        onUpdate: (self) => {
          if (!self.isActive) return;
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          const nextIdx = resolveScrollDialogueBeat(
            self.progress,
            beatSpecs,
            activeIndexRef.current,
            0.025,
          );
          if (nextIdx !== activeIndexRef.current) {
            activeIndexRef.current = nextIdx;
            setActiveIndex(nextIdx);
<<<<<<< HEAD
            const targetLine = lines[nextIdx];
            if (targetLine && !triggeredLineIdsRef.current.has(targetLine.id)) {
              triggeredLineIdsRef.current.add(targetLine.id);
              startLinePlayback(nextIdx, false);
            }
=======
            startLinePlayback(nextIdx, true);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          }
        },
        onLeave: () => {
          isStageActiveRef.current = false;
          setIsStageActive(false);
<<<<<<< HEAD
          narrative?.setDialogueActive(false);
=======
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          const lastIdx = Math.max(0, lines.length - 1);
          if (activeIndexRef.current !== lastIdx) {
            activeIndexRef.current = lastIdx;
            setActiveIndex(lastIdx);
          }
          if (activeSequenceOwner === sequenceId) {
            characterVoicePlayer.stop(180);
            lastTriggeredLineIdRef.current = null;
          }
        },
        onLeaveBack: () => {
          isStageActiveRef.current = false;
          setIsStageActive(false);
          setIsPastStage(false);
<<<<<<< HEAD
          narrative?.setDialogueActive(false);
=======
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          if (activeIndexRef.current !== 0) {
            activeIndexRef.current = 0;
            setActiveIndex(0);
          }
          if (activeSequenceOwner === sequenceId) {
            characterVoicePlayer.stop(180);
            lastTriggeredLineIdRef.current = null;
          }
        },
      });

      // Smoothly fade sticky dialogue before stage bottom pushes it into fixed ChapterChrome navbar
      if (isTallStage) {
        ScrollTrigger.create({
          trigger: triggerEl,
          start: 'bottom 38%',
          end: 'bottom top',
          onEnter: () => setIsPastStage(true),
          onLeaveBack: () => setIsPastStage(false),
        });
      }
    }, triggerEl);

    return () => {
      ctx.revert();
      if (activeSequenceOwner === sequenceId) {
        characterVoicePlayer.stop(0);
        activeSequenceOwner = null;
      }
<<<<<<< HEAD
      narrative?.setDialogueActive(false);
    };
  }, [beatSpecs, lines, narrative, reducedMotion, scrollStageRef, sequenceId, startLinePlayback]);
=======
    };
  }, [beatSpecs, lines, reducedMotion, scrollStageRef, sequenceId, startLinePlayback]);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74

  const handleTogglePause = useCallback(() => {
    if (!activeLine) return;
    if (isPaused) {
      if (characterVoicePlayer.getActiveLineId() === activeLine.id && characterVoicePlayer.isPaused()) {
        characterVoicePlayer.resume();
        setIsPaused(false);
      } else {
        startLinePlayback(activeIndexRef.current, true);
      }
      return;
    }

    if (
      characterVoicePlayer.getActiveLineId() === activeLine.id &&
      (playbackState === 'playing-recording' || playbackState === 'cadence-sync-only')
    ) {
      characterVoicePlayer.pause();
    }
    setIsPaused(true);
  }, [activeLine, isPaused, playbackState, startLinePlayback]);

  const handleReplayCurrent = useCallback(() => {
    startLinePlayback(activeIndexRef.current, true);
  }, [startLinePlayback]);

  const handleToggleMute = useCallback(() => {
    const nextMuted = sceneAudioManager.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  const handleJumpBeat = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(lines.length - 1, idx));
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
      startLinePlayback(clamped, true);
    },
    [lines.length, startLinePlayback],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      handleTogglePause();
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      handleReplayCurrent();
    }
  };

  if (lines.length === 0) return null;

  return (
    <div
      ref={containerRef}
      data-testid={`dialogue-sequence-${sequenceId}`}
      data-active-line-id={activeLine?.id ?? ''}
      data-stage-active={isStageActive ? 'true' : 'false'}
      data-past-stage={isPastStage ? 'true' : 'false'}
      onKeyDown={handleKeyDown}
      className={`group/dialogue relative py-2 transition-opacity duration-200 ${
        isPastStage && !reducedMotion ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${className}`}
    >
      {/* Active Scroll-Synchronized Speech Bubble / Narrator Plate */}
      <div className="min-h-[120px] pb-5 flex flex-col justify-center">
        {activeLine && (
          <SyncedSpeechBubble
            key={activeLine.id}
            line={activeLine}
            isActive={true}
            reducedMotion={reducedMotion}
            elapsedSec={reducedMotion ? durationSec : elapsedSec}
            durationSec={durationSec}
            isPaused={isPaused}
            playbackMode={playbackState}
            onSeekTime={(sec) => {
              setElapsedSec(sec);
              characterVoicePlayer.seekTo(sec);
            }}
          />
        )}
      </div>

      {/* Minimalist Unobtrusive Controls Strip (no Prev / Next / All clutter) */}
      <div
        data-testid={`dialogue-controls-${sequenceId}`}
<<<<<<< HEAD
        className="mt-1 flex flex-wrap items-center justify-between gap-2.5 border-t border-white/10 pt-2.5 opacity-0 transition-opacity duration-500 group-hover/dialogue:opacity-100 focus-within:opacity-100"
      >
        {/* Hairline Beat Progress Track */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1 w-10 sm:w-16">
=======
        className="mt-1 flex flex-wrap items-center justify-between gap-2.5 border-t border-white/10 pt-2.5 opacity-80 transition-opacity duration-200 group-hover/dialogue:opacity-100 focus-within:opacity-100"
      >
        {/* Hairline Beat Progress Track */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1 w-16 sm:w-24">
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
            {lines.map((line, idx) => (
              <button
                key={line.id}
                type="button"
                aria-label={`Play dialogue beat ${idx + 1} of ${lines.length}`}
                onClick={() => handleJumpBeat(idx)}
<<<<<<< HEAD
                className="flex h-3 flex-1 items-center cursor-pointer"
=======
                className="flex h-5 flex-1 items-center cursor-pointer"
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
              >
                <span
                  className="block w-full transition-all duration-300"
                  style={{
<<<<<<< HEAD
                    height: idx === activeIndex ? '2px' : '1px',
=======
                    height: idx === activeIndex ? '2.5px' : '1.5px',
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
                    backgroundColor:
                      idx <= activeIndex
                        ? idx === activeIndex
                          ? '#f28b50'
                          : 'rgba(242, 139, 80, 0.45)'
                        : 'rgba(255, 255, 255, 0.16)',
                  }}
                />
              </button>
            ))}
          </div>

          <span
            data-testid={`dialogue-counter-${sequenceId}`}
<<<<<<< HEAD
            className="hidden sm:inline font-mono text-[10px] tabular-nums uppercase tracking-[0.18em] text-[#e6ddd0]/65"
=======
            className="font-mono text-[10px] tabular-nums uppercase tracking-[0.18em] text-[#e6ddd0]/65"
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          >
            {String(activeIndex + 1).padStart(2, '0')} / {String(lines.length).padStart(2, '0')}
          </span>
        </div>

        {/* Minimal Narration Controls: Pause/Resume, Replay, Mute, Transcript, Skip */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleTogglePause}
            data-testid={`dialogue-pause-${sequenceId}`}
            aria-label={isPaused ? 'Resume narration' : 'Pause narration'}
            aria-pressed={isPaused}
            title={isPaused ? 'Resume narration' : 'Pause narration'}
            className="inline-flex h-8 items-center gap-1.5 px-2 text-[10px] font-mono uppercase tracking-[0.14em] text-[#e6ddd0]/80 transition-colors hover:text-[#f28b50] cursor-pointer focus-visible:outline-1 focus-visible:outline-[#f28b50]"
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            type="button"
            onClick={handleReplayCurrent}
            data-testid={`dialogue-replay-${sequenceId}`}
            aria-label="Replay current dialogue"
            title="Replay current dialogue"
            className="inline-flex h-8 w-8 items-center justify-center text-[#e6ddd0]/75 transition-colors hover:text-[#f28b50] cursor-pointer focus-visible:outline-1 focus-visible:outline-[#f28b50]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            data-testid={`dialogue-mute-${sequenceId}`}
            aria-label={isMuted ? 'Unmute narration and ambience' : 'Mute narration and ambience'}
            aria-pressed={!isMuted}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="inline-flex h-8 w-8 items-center justify-center text-[#e6ddd0]/75 transition-colors hover:text-[#f28b50] cursor-pointer focus-visible:outline-1 focus-visible:outline-[#f28b50]"
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-[#e6ddd0]/55" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-[#f28b50]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowTranscript((prev) => !prev)}
            data-testid={`dialogue-transcript-${sequenceId}`}
            aria-expanded={showTranscript}
            aria-label={showTranscript ? 'Hide scene transcript' : 'Open accessible scene transcript'}
            title="Accessible transcript"
<<<<<<< HEAD
            className={`hidden sm:inline-flex h-8 w-8 items-center justify-center transition-colors cursor-pointer focus-visible:outline-1 focus-visible:outline-[#f28b50] ${
=======
            className={`inline-flex h-8 w-8 items-center justify-center transition-colors cursor-pointer focus-visible:outline-1 focus-visible:outline-[#f28b50] ${
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
              showTranscript ? 'text-[#f28b50]' : 'text-[#e6ddd0]/65 hover:text-[#f6efe5]'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
          </button>

          {onSkipNextScene && (
<<<<<<< HEAD
            <div className="opacity-0 group-hover/dialogue:opacity-100 focus-within:opacity-100 transition-opacity duration-500">
=======
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
            <button
              type="button"
              onClick={onSkipNextScene}
              data-testid={`dialogue-skip-${sequenceId}`}
              aria-label="Skip to next scene"
              title="Skip to next scene"
              className="inline-flex h-8 items-center gap-1 px-2 text-[10px] font-mono uppercase tracking-[0.14em] text-[#e6ddd0]/75 transition-colors hover:text-[#f28b50] cursor-pointer focus-visible:outline-1 focus-visible:outline-[#f28b50]"
            >
              <span>Skip</span>
              <SkipForward className="h-3.5 w-3.5" />
            </button>
<<<<<<< HEAD
            </div>
=======
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          )}
        </div>
      </div>

      {/* Accessible Collapsible Script Drawer (keeps default view clean & uncrowded) */}
      {showTranscript && (
        <div
          role="region"
          aria-label="Scene Dialogue Transcript"
          data-testid={`dialogue-transcript-drawer-${sequenceId}`}
          className="mt-3 border border-white/12 bg-[#0c0f1d]/94 p-4 text-left shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f28b50]">
              Scene Script · Scroll or Select Beat
            </span>
            <button
              type="button"
              onClick={() => setShowTranscript(false)}
              aria-label="Close transcript"
              className="text-[#cfc5b9]/75 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <ol className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {lines.map((line, idx) => {
              const current = idx === activeIndex;
              return (
                <li key={line.id}>
                  <button
                    type="button"
                    onClick={() => handleJumpBeat(idx)}
                    className={`w-full text-left px-3 py-2 border-l-2 transition-colors cursor-pointer ${
                      current
                        ? 'border-[#f28b50] bg-white/6 text-[#fbf4ea]'
                        : 'border-white/12 text-[#d9d0c4]/75 hover:border-white/40 hover:text-[#fbf4ea]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#f28b50]/90">
                      <span>{line.speakerLabel}</span>
                      <span className="text-[#c8bfb4]/55">
                        {line.mode === 'narrator' ? 'Narrator' : 'Dialogue'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed">{line.text}</p>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
};
