import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  CHARACTER_STYLES,
  type DialogueLine,
} from '../story/dialogueManifest';
import {
  resolveBubblePlacement,
  resolveSyncedWordStates,
  type WordTimingEntry,
} from '../story/scrollMath';
import { MOTION_EASING } from '../story/motionSystem';
import {
  characterVoicePlayer,
  type VoiceAssetState,
  type VoicePlaybackSnapshot,
} from '../audio/CharacterVoicePlayer';

export interface SyncedSpeechBubbleProps {
  line: DialogueLine;
  isActive: boolean;
  isPast?: boolean;
  reducedMotion: boolean;
  /** Controlled elapsed time in seconds (from audio seek or calibrated cadence) */
  elapsedSec?: number;
  /** Controlled duration in seconds for clip or calibrated cadence */
  durationSec?: number;
  /** Controlled pause state */
  isPaused?: boolean;
  /** Playback mode state from CharacterVoicePlayer */
  playbackMode?: VoiceAssetState;
  /** Optional explicit word-level timestamps overriding line.wordTimings */
  wordTimings?: ReadonlyArray<WordTimingEntry>;
  /** Optional external HTMLAudioElement to sync word reveal with directly */
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  /** Subscribe directly to global CharacterVoicePlayer when elapsedSec is omitted (default true) */
  syncToVoicePlayer?: boolean;
  /** Optional seek handler invoked when clicking a word during active playback */
  onSeekTime?: (seconds: number) => void;
  /** Optional click action (e.g. jump to beat inside transcript drawer) */
  onSelect?: () => void;
}

export const SyncedSpeechBubble: React.FC<SyncedSpeechBubbleProps> = ({
  line,
  isActive,
  isPast = false,
  reducedMotion,
  elapsedSec,
  durationSec,
  isPaused,
  playbackMode,
  wordTimings,
  audioRef,
  syncToVoicePlayer = true,
  onSeekTime,
  onSelect,
}) => {
  const style = CHARACTER_STYLES[line.speaker];
  const isNarratorMode = line.mode === 'narrator' || style.shape === 'caption';
  const placement = resolveBubblePlacement(
    line.bubblePosition ?? line.side,
    isNarratorMode ? 'caption' : style.shape,
  );

  const bubbleRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<SVGSVGElement>(null);

  // Autonomous synchronization with CharacterVoicePlayer when uncontrolled
  const [voiceSnap, setVoiceSnap] = useState<VoicePlaybackSnapshot | null>(() => {
    if (elapsedSec !== undefined || !syncToVoicePlayer) return null;
    const snap = characterVoicePlayer.getSnapshot();
    return snap.lineId === line.id ? snap : null;
  });

  useEffect(() => {
    if (elapsedSec !== undefined || !syncToVoicePlayer || reducedMotion) {
      setVoiceSnap((prev) => (prev !== null ? null : prev));
      return;
    }

    const syncFromPlayer = (snap: VoicePlaybackSnapshot) => {
      if (snap.lineId === line.id) {
        setVoiceSnap(snap);
      } else {
        setVoiceSnap((prev) => (prev !== null ? null : prev));
      }
    };

    syncFromPlayer(characterVoicePlayer.getSnapshot());
    return characterVoicePlayer.subscribe(syncFromPlayer);
  }, [elapsedSec, line.id, reducedMotion, syncToVoicePlayer]);

  // Optional direct HTMLAudioElement synchronization when audioRef is supplied
  const [mediaTime, setMediaTime] = useState<{ elapsed: number; duration: number } | null>(null);

  useEffect(() => {
    const audioEl = audioRef?.current;
    if (!audioEl || elapsedSec !== undefined || reducedMotion) {
      setMediaTime((prev) => (prev !== null ? null : prev));
      return;
    }

    let rafId = 0;
    const updateFromElement = () => {
      const dur = Number.isFinite(audioEl.duration) && audioEl.duration > 0
        ? audioEl.duration
        : line.duration;
      setMediaTime({
        elapsed: Math.max(0, audioEl.currentTime || 0),
        duration: dur,
      });
      if (!audioEl.paused && !audioEl.ended) {
        rafId = window.requestAnimationFrame(updateFromElement);
      }
    };

    const onPlay = () => {
      rafId = window.requestAnimationFrame(updateFromElement);
    };
    const onTimeUpdate = () => updateFromElement();

    audioEl.addEventListener('play', onPlay);
    audioEl.addEventListener('timeupdate', onTimeUpdate);
    audioEl.addEventListener('seeked', onTimeUpdate);
    audioEl.addEventListener('loadedmetadata', onTimeUpdate);
    updateFromElement();

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      audioEl.removeEventListener('play', onPlay);
      audioEl.removeEventListener('timeupdate', onTimeUpdate);
      audioEl.removeEventListener('seeked', onTimeUpdate);
      audioEl.removeEventListener('loadedmetadata', onTimeUpdate);
    };
  }, [audioRef, elapsedSec, line.duration, reducedMotion]);

  // Smooth GSAP entrance tuned per dialogue animation entrance type
  useEffect(() => {
    if (reducedMotion || !isActive || !bubbleRef.current) return;

    const entrance = line.animation?.entrance ?? 'ink';
    const ctx = gsap.context(() => {
      if (entrance === 'caption') {
        gsap.fromTo(
          bubbleRef.current,
          { opacity: 0.25, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.48,
            ease: MOTION_EASING.editorial,
          },
        );
      } else if (entrance === 'celestial') {
        gsap.fromTo(
          bubbleRef.current,
          { opacity: 0.2, y: 8, scale: 0.985 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.44,
            ease: MOTION_EASING.cinematic,
          },
        );
      } else if (entrance === 'spectral') {
        gsap.fromTo(
          bubbleRef.current,
          { opacity: 0.22, y: 10, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.46,
            ease: MOTION_EASING.cinematic,
          },
        );
      } else {
        gsap.fromTo(
          bubbleRef.current,
          { opacity: 0.3, y: 9, scale: 0.985 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.34,
            ease: MOTION_EASING.kinetic,
          },
        );
      }

      if (tailRef.current && !isNarratorMode) {
        gsap.fromTo(
          tailRef.current,
          { opacity: 0.3, scaleY: 0.45 },
          {
            opacity: 1,
            scaleY: 1,
            transformOrigin: 'top center',
            duration: 0.28,
            delay: 0.05,
            ease: MOTION_EASING.kinetic,
          },
        );
      }
    });

    return () => ctx.revert();
  }, [line.id, line.animation?.entrance, isActive, isNarratorMode, reducedMotion]);

  const effectiveDuration =
    durationSec ??
    mediaTime?.duration ??
    voiceSnap?.durationSec ??
    line.duration ??
    line.durationMs / 1000;

  const effectiveElapsed =
    elapsedSec ?? mediaTime?.elapsed ?? voiceSnap?.elapsedSec;

  const effectivePaused = isPaused ?? voiceSnap?.isPaused ?? false;
  const effectivePlaybackMode = playbackMode ?? voiceSnap?.state ?? 'idle';
  const effectiveTimings = wordTimings ?? line.wordTimings;

  const shouldShowAllWords =
    reducedMotion || isPast || !isActive || effectiveElapsed === undefined;

  const revealState = shouldShowAllWords
    ? {
        words: line.text
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((word, index) => ({
            word,
            index,
            startSec: 0,
            endSec: 0,
            status: 'spoken' as const,
            wordProgress: 1,
          })),
        visibleCount: line.text.trim().split(/\s+/).filter(Boolean).length,
        activeWordIndex: -1,
        totalWords: line.text.trim().split(/\s+/).filter(Boolean).length,
        progress: 1,
        timingMode:
          effectiveTimings && effectiveTimings.length > 0
            ? ('word-timestamps' as const)
            : ('estimated-duration' as const),
      }
    : resolveSyncedWordStates(
        line.text,
        effectiveElapsed,
        effectiveDuration,
        effectiveTimings,
      );

  const shapeClasses = isNarratorMode
    ? 'rounded-[2px]'
    : style.shape === 'celestial'
      ? 'rounded-[4px]'
      : style.shape === 'spectral'
        ? 'rounded-[24px_20px_26px_18px]'
        : 'rounded-[22px_18px_24px_16px]';

  const isEditorialDisplay =
    isNarratorMode ||
    line.expression === 'shocked' ||
    line.speaker === 'god' ||
    line.speaker === 'pranah';

  const borderColor = isActive ? style.accent : style.border;
  const lineRatio =
    isActive && effectiveElapsed !== undefined && effectiveDuration > 0
      ? Math.min(1, Math.max(0, effectiveElapsed / effectiveDuration))
      : 1;

  const isVoiceActivelyRunning =
    isActive &&
    !effectivePaused &&
    !reducedMotion &&
    (effectivePlaybackMode === 'playing-recording' ||
      effectivePlaybackMode === 'cadence-sync-only') &&
    lineRatio < 0.995;

  return (
    <div
      data-testid={`speech-bubble-${line.id}`}
      data-synced-bubble="true"
      data-dialogue-mode={line.mode}
      data-speaker={line.speaker}
      data-timing-mode={revealState.timingMode}
      data-playback-active={isVoiceActivelyRunning ? 'true' : 'false'}
      data-reveal-progress={Math.round(revealState.progress * 100)}
      className={`flex flex-col w-full ${
        isNarratorMode ? 'max-w-[36rem]' : 'max-w-[33rem]'
      } ${placement.alignClass} transition-opacity duration-300 ${
        isActive ? 'opacity-100' : isPast ? 'opacity-72' : 'opacity-45'
      }`}
    >
      <div
        ref={bubbleRef}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSelect();
          }
        }}
        aria-label={`${line.speakerLabel}: ${line.text}`}
        className={`relative w-full ${
          isNarratorMode ? 'px-5 py-4 sm:px-6 sm:py-5' : 'px-5 py-4 sm:px-6 sm:py-4.5'
        } ${shapeClasses} ${onSelect ? 'cursor-pointer select-none' : ''}`}
        style={{
          background: style.bg,
          color: style.text,
          border: `1.5px solid ${borderColor}`,
          boxShadow: isNarratorMode
            ? '0 20px 44px -16px rgba(4, 6, 16, 0.72), 4px 5px 0 rgba(10, 12, 22, 0.78)'
            : style.shape === 'spectral'
              ? isActive
                ? '0 18px 38px -12px rgba(96, 198, 236, 0.34), inset 0 0 18px rgba(155, 228, 255, 0.08)'
                : '0 8px 20px -10px rgba(45, 130, 170, 0.25)'
              : isActive
                ? '0 18px 40px -14px rgba(4, 6, 16, 0.72), 2px 3px 0 rgba(10, 12, 22, 0.85)'
                : '0 10px 24px -12px rgba(4, 6, 16, 0.55)',
        }}
      >
        {/* Celestial or Narrator subtle architectural double hairline */}
        {(style.shape === 'celestial' || isNarratorMode) && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[4px] border"
            style={{ borderColor: `${style.accent}38` }}
          />
        )}

        {/* Speaker / Chronicle Label Header + Subtle Active Vocal Cadence Hairline */}
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: style.labelColor }}
          >
            {line.speakerLabel}
          </span>

          <div className="flex items-center gap-2">
            {isVoiceActivelyRunning && (
              <span
                aria-hidden="true"
                className="inline-flex items-end gap-[2px] h-2.5"
              >
                <span
                  className="w-[1.5px] rounded-full animate-pulse"
                  style={{ height: '55%', backgroundColor: style.accent }}
                />
                <span
                  className="w-[1.5px] rounded-full animate-pulse"
                  style={{ height: '100%', backgroundColor: style.accent, animationDelay: '120ms' }}
                />
                <span
                  className="w-[1.5px] rounded-full animate-pulse"
                  style={{ height: '70%', backgroundColor: style.accent, animationDelay: '240ms' }}
                />
              </span>
            )}
            <span
              className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-80"
              style={{ color: style.labelColor }}
            >
              {effectivePaused
                ? 'Paused'
                : isNarratorMode
                  ? line.sourceOrigin === 'connective'
                    ? 'Narrative Bridge'
                    : 'Chronicle'
                  : line.expression === 'shocked'
                    ? 'Sudden Beat'
                    : effectivePlaybackMode === 'playing-recording'
                      ? 'Voice'
                      : ''}
            </span>
          </div>
        </div>

        {/* Synchronized Word-by-Word Lettering with Spoken / Active / Upcoming States */}
        <p
          className={`[text-wrap:pretty] ${
            isNarratorMode
              ? 'font-display text-lg sm:text-[1.32rem] italic font-medium leading-snug'
              : isEditorialDisplay
                ? 'font-display text-lg sm:text-[1.35rem] font-semibold leading-snug'
                : 'text-sm sm:text-[15px] leading-relaxed font-medium'
          }`}
        >
          {revealState.words.map((token, idx) => {
            const isCurrent = !shouldShowAllWords && token.status === 'current';
            const isUpcoming = !shouldShowAllWords && token.status === 'upcoming';
            const canSeek = Boolean(onSeekTime && isActive && !reducedMotion && !onSelect);

            return (
              <span
                key={`${line.id}-w-${idx}`}
                data-word-status={token.status}
                onClick={
                  canSeek
                    ? (e) => {
                        e.stopPropagation();
                        onSeekTime?.(token.startSec);
                      }
                    : undefined
                }
                className={`inline-block transition-opacity duration-150 ${
                  canSeek ? 'cursor-pointer hover:opacity-100' : ''
                }`}
                style={{
                  opacity: isUpcoming ? 0.45 : 1,
                  textDecorationLine: isCurrent ? 'underline' : 'none',
                  textDecorationColor: isCurrent ? `${style.accent}aa` : undefined,
                  textDecorationThickness: isCurrent ? '1.5px' : undefined,
                  textUnderlineOffset: isCurrent ? '4px' : undefined,
                }}
              >
                {token.word}
                {idx < revealState.words.length - 1 ? '\u00A0' : ''}
              </span>
            );
          })}
        </p>

        {/* Subtle Hairline Progression Bar Inside Bottom Edge */}
        {isActive && !reducedMotion && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-0 h-[2px] overflow-hidden rounded-full opacity-75 ${
              isNarratorMode || style.shape === 'celestial'
                ? 'left-1.5 right-1.5'
                : 'left-5 right-5'
            }`}
          >
            <div
              className="h-full transition-[width] duration-75 ease-linear"
              style={{
                width: `${Math.round(lineRatio * 1000) / 10}%`,
                backgroundColor: style.accent,
              }}
            />
          </div>
        )}

        {/* Smooth Curved Graphic-Novel SVG Speech Tail (omitted in Narrator caption mode) */}
        {!isNarratorMode && (
          <svg
            ref={tailRef}
            aria-hidden="true"
            width="28"
            height="18"
            viewBox="0 0 28 18"
            className="pointer-events-none absolute -bottom-[17px]"
            style={{
              left: `${placement.tailXPercent}%`,
              transform:
                placement.tailSide === 'right'
                  ? 'translateX(-50%) scaleX(-1)'
                  : 'translateX(-50%)',
            }}
          >
            <path
              d="M2 0 C7 5, 8 11, 4 17 C12 13, 19 6, 25 0 Z"
              fill={style.bg}
              stroke={borderColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M2.5 0.5 L24.5 0.5" stroke={style.bg} strokeWidth="2.5" />
          </svg>
        )}
      </div>
    </div>
  );
};
