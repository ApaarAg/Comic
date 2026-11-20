/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CinematicCaptionBar.tsx
 *
 * Film-inspired widescreen subtitle caption bar for the Storyverse continuous narrator.
 * Renders at the bottom of the viewport with an organic bottom-feathered gradient.
 *
 * Distinct from Character Speech Bubbles
 * ───────────────────────────────────────
 * • Speech bubbles: comic-balloon shapes with animated SVG tails near character artwork.
 * • CinematicCaptionBar: edge-to-edge cinematic subtitles in classic film italic serif,
 *   floating above the lower letterbox margin with subtle progressive word-level focus.
 */

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useNarrative } from '../narrative/NarrativeEngine';

interface RevealedWordProps {
  word: string;
  isSpoken: boolean;
  isCurrent: boolean;
  trailingSpace: boolean;
}

const RevealedWord: React.FC<RevealedWordProps> = ({
  word,
  isSpoken,
  isCurrent,
  trailingSpace,
}) => {
  return (
    <span
      className="inline-block transition-all duration-200"
      style={{
        opacity: isSpoken ? 1 : 0.12,
        filter: isSpoken ? 'blur(0px)' : 'blur(2px)',
        transform: isSpoken ? 'translateY(0)' : 'translateY(2px)',
        color: isCurrent ? '#ffd29d' : isSpoken ? '#fbf6ee' : '#a39b90',
        textShadow: isCurrent
          ? '0 0 16px rgba(242, 139, 80, 0.45), 0 2px 8px rgba(0,0,0,0.9)'
          : '0 2px 10px rgba(0,0,0,0.85)',
      }}
    >
      {word}
      {trailingSpace ? '\u00A0' : ''}
    </span>
  );
};

export const CinematicCaptionBar: React.FC = () => {
  const {
    audioState,
    activeBeat,
    narratorText,
    narratorProgress,
    isNarratorActive,
    isDialogueActive,
    pauseNarrator,
    resumeNarrator,
    replayNarrator,
  } = useNarrative();

  const containerRef = useRef<HTMLDivElement>(null);
  const words = React.useMemo(() => {
    return narratorText.trim().split(/\s+/).filter(Boolean);
  }, [narratorText]);

  const visibleWordCount = Math.ceil(narratorProgress * words.length);
  const isPaused = audioState === 'Paused';

  // Visible only when narrator is active and not preempted by character dialogue
  const shouldShow = isNarratorActive && !isDialogueActive && narratorText.length > 0;

  // Smooth GSAP entrance & exit
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    if (shouldShow) {
      gsap.killTweensOf(el);
      gsap.fromTo(
        el,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
          display: 'block',
        },
      );
    } else {
      gsap.killTweensOf(el);
      gsap.to(el, {
        opacity: 0,
        y: 14,
        duration: 0.32,
        ease: 'power2.in',
        onComplete: () => {
          if (el) el.style.display = 'none';
        },
      });
    }
  }, [shouldShow]);

  return (
    <aside
      ref={containerRef}
      aria-label="Story Chronicle Subtitles"
      data-testid="cinematic-caption-bar"
      data-audio-state={audioState}
      className="fixed bottom-0 inset-x-0 z-30 pointer-events-none select-none transition-transform"
      style={{ display: 'none' }}
    >
      {/* Film Subtitle Feathered Gradient Scrim */}
      <div
        className="relative w-full pt-12 pb-7 px-6 md:px-16"
        style={{
          background:
            'linear-gradient(180deg, rgba(7, 9, 18, 0) 0%, rgba(7, 9, 18, 0.72) 36%, rgba(7, 9, 18, 0.96) 88%, #070912 100%)',
        }}
      >
        {/* Subtle Dusk-Coral Hairline Horizon Separator */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-4 inset-x-8 md:inset-x-24 h-[1px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(242, 139, 80, 0.28) 30%, rgba(242, 139, 80, 0.45) 50%, rgba(242, 139, 80, 0.28) 70%, transparent 100%)',
          }}
        />

        <div className="mx-auto max-w-4xl flex flex-col items-center text-center">
          {/* Chronicle Metadata & Interactive Replay/Pause Pips */}
          <div className="mb-2 flex items-center justify-between w-full text-[10px] font-mono uppercase tracking-[0.24em] text-[#f28b50]/85">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f28b50] animate-pulse" />
              <span>Chronicle · {activeBeat?.sceneId ?? 'Prologue'}</span>
            </span>

            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={isPaused ? resumeNarrator : pauseNarrator}
                aria-label={isPaused ? 'Resume narration' : 'Pause narration'}
                className="inline-flex h-6 items-center gap-1 border border-white/15 bg-black/40 px-2 text-[9px] tracking-wider text-[#e6ddd0] hover:border-[#f28b50] hover:text-[#f28b50] transition-colors cursor-pointer"
              >
                {isPaused ? <Play className="h-2.5 w-2.5" /> : <Pause className="h-2.5 w-2.5" />}
                <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                type="button"
                onClick={replayNarrator}
                aria-label="Replay current narration beat"
                className="inline-flex h-6 w-6 items-center justify-center border border-white/15 bg-black/40 text-[#e6ddd0] hover:border-[#f28b50] hover:text-[#f28b50] transition-colors cursor-pointer"
              >
                <RotateCcw className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>

          {/* Subtitle Lettering: Large Widescreen Editorial Serif */}
          <p
            className="font-display text-xl sm:text-2xl md:text-[1.75rem] font-medium italic leading-relaxed text-[#fbf6ee] max-w-3xl [text-wrap:pretty]"
          >
            &ldquo;
            {words.map((word, idx) => {
              const isSpoken = idx < visibleWordCount;
              const isCurrent = idx === visibleWordCount - 1;
              return (
                <RevealedWord
                  key={`${activeBeat?.id ?? 'beat'}-${idx}-${word}`}
                  word={word}
                  isSpoken={isSpoken}
                  isCurrent={isCurrent}
                  trailingSpace={idx < words.length - 1}
                />
              );
            })}
            &rdquo;
          </p>
        </div>
      </div>
    </aside>
  );
};
