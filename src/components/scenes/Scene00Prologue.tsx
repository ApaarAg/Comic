/**
 * Storyverse — Prologue Scene Component
 *
 * Scene00Prologue.tsx
 *
 * Storyverse 4.4: Refined Cinematic Opening Experience & Scroll-Synchronized Prologue
 *
 * Coordinates:
 * 1. Darkness & Atmospheric Opening (0.00 – 0.08): Deep twilight void, floating motes, discreet scroll prompt.
 * 2. "THE STORY" Introduction (0.08 – 0.30):
 *    - Spoiler-free narrative synopsis introducing Laila Starr and Mumbai.
 *    - Elegant serif typography, warm gold accents, generous negative space.
 * 3. The Opening Canvas: Once Upon a Falling Starr (0.30 – 0.58):
 *    - Coral sunset emerges behind Mumbai skyline silhouettes.
 *    - Brian's 1.05x Indian English narration triggers via authoritative scroll timeline (beat stageProgress: 0.36).
 *    - Synchronized progressive word reveal with discreet replay/pause controls.
 *    - Camera glides from sunset sky down toward the curving elevated highway.
 * 4. Title Manifestation (0.58 – 0.86): Gold foil title reveals with motif_storyverse.
 * 5. Camera Dive (0.86 – 1.00): Camera pushes through sunset clouds directly into Scene 01.
 */

import React, { useEffect, useState } from 'react';
import { CinematicViewportStage } from '../CinematicViewportStage';
import mumbaiSkylineUrl from '../../assets/images/mumbai_skyline_backdrop_1795078714752.jpg';
import mumbaiCloudsUrl from '../../assets/images/mumbai_clouds_haze_1795078713772.jpg';
import mumbaiSilhouettesUrl from '../../assets/images/mumbai_foreground_silhouettes_1795078713773.jpg';
import { sceneAudioManager } from '../../audio/SceneAudioManager';
import { ChevronDown } from 'lucide-react';

interface Scene00PrologueProps {
  reducedMotion: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onUnlockAudio?: () => void;
}

const PROLOGUE_MOTES = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 19 + 7) % 94}%`,
  top: `${(i * 23 + 11) % 88}%`,
  size: 2 + (i % 3),
  delay: `${(i * 0.4).toFixed(1)}s`,
  duration: `${3.5 + (i % 3) * 0.8}s`,
}));

export const Scene00Prologue: React.FC<Scene00PrologueProps> = React.memo(({
  reducedMotion,
}) => {
  const [stageProgress, setStageProgress] = useState(0);
  const [, setAudioUnlocked] = useState(!sceneAudioManager.getMuted());

  // Sync with audio manager state for UI indicators
  useEffect(() => {
    const checkState = () => {
      const muted = sceneAudioManager.getMuted();
      setAudioUnlocked(!muted);
    };
    checkState();
    return sceneAudioManager.subscribe(checkState);
  }, []);

  // Compute keyframe-driven visual envelopes
  const darknessOpacity = Math.max(0, 0.12 - stageProgress * 1.5);

  // 1. "THE STORY" Card envelope:
  // Enters around 0.08, fully legible through 0.14 - 0.24, smoothly fades out before 0.30
  const storySummaryOpacity =
    stageProgress < 0.08
      ? 0
      : stageProgress <= 0.14
        ? (stageProgress - 0.08) / 0.06
        : stageProgress <= 0.24
          ? 1
          : stageProgress < 0.30
            ? Math.max(0, 1 - (stageProgress - 0.24) / 0.06)
            : 0;

  // 2. "The Opening Canvas" Card envelope:
  // Fades in at 0.30, fully visible 0.34 - 0.52, fades out before 0.58
  const canvasOpacity =
    stageProgress < 0.30
      ? 0
      : stageProgress <= 0.34
        ? (stageProgress - 0.30) / 0.04
        : stageProgress <= 0.52
          ? 1
          : stageProgress < 0.58
            ? Math.max(0, 1 - (stageProgress - 0.52) / 0.06)
            : 0;

  // 3. Sunset skyline backdrop envelope
  const skylineOpacity = Math.min(1, Math.max(0, (stageProgress - 0.08) / 0.22));

  // 4. Monumental Title reveal envelope: 0.58 - 0.86
  const titleOpacity =
    stageProgress < 0.58
      ? 0
      : stageProgress < 0.72
        ? (stageProgress - 0.58) / 0.14
        : stageProgress < 0.86
          ? 1
          : Math.max(0, 1 - (stageProgress - 0.86) / 0.14);

  // 5. Exit portal zoom and cross-dissolve into Scene 01
  const portalZoom = 1 + Math.max(0, (stageProgress - 0.82) * 2.2);
  const exitFade = Math.max(0, 1 - Math.max(0, (stageProgress - 0.90) * 10));

  return (
    <section
      className="relative w-full"
      aria-label="Prologue: The Threshold"
      onClick={() => {
        if (sceneAudioManager.getMuted()) {
          sceneAudioManager.unmute();
        }
      }}
    >
      <CinematicViewportStage
        sceneId="scene-00"
        reducedMotion={reducedMotion}
        onProgressChange={setStageProgress}
        backgroundLayer={
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: skylineOpacity * exitFade }}
          >
            <img
              src={mumbaiSkylineUrl}
              alt="Mumbai sunset skyline backdrop"
              className="h-full w-full object-cover object-center filter brightness-[0.88] contrast-[1.08]"
            />
            {/* Coral sunset glow gradient */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 90% 70% at 50% 30%, rgba(242, 139, 80, 0.42), rgba(20, 18, 37, 0.85) 75%, #05060b 100%)',
              }}
            />
          </div>
        }
        midgroundLayer={
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: skylineOpacity * 0.85 * exitFade }}
          >
            <img
              src={mumbaiCloudsUrl}
              alt="Mumbai evening clouds and atmospheric haze"
              className="h-full w-full object-cover object-top mix-blend-screen opacity-70"
            />
          </div>
        }
        foregroundLayer={
          <>
            {/* Silhouetted Mumbai rooftops */}
            <div
              className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
              style={{ opacity: skylineOpacity * 0.95 * exitFade }}
            >
              <img
                src={mumbaiSilhouettesUrl}
                alt="Mumbai foreground architectural silhouettes"
                className="h-full w-full object-cover object-bottom"
              />
            </div>

            {/* Drifting atmospheric motes */}
            {!reducedMotion && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: exitFade }}
              >
                {PROLOGUE_MOTES.map((mote, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-[#f28b50]/60 blur-[0.5px] animate-pulse"
                    style={{
                      left: mote.left,
                      top: mote.top,
                      width: `${mote.size}px`,
                      height: `${mote.size}px`,
                      animationDelay: mote.delay,
                      animationDuration: mote.duration,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Opening darkness veil fading out smoothly */}
            <div
              className="absolute inset-0 bg-[#05060b] pointer-events-none transition-opacity duration-200"
              style={{ opacity: darknessOpacity }}
            />
          </>
        }
      >
        {/* ── 1. THE STORY · SHORT INTRODUCTION (0.08 – 0.30) ─────────── */}
        {storySummaryOpacity > 0.02 && (
          <div
            data-testid="story-summary-card"
            className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 z-50 pointer-events-none"
            style={{
              opacity: storySummaryOpacity * exitFade,
              transform: `translateY(${(1 - storySummaryOpacity) * 20}px)`,
              transition: reducedMotion ? 'none' : 'opacity 200ms ease-out, transform 200ms ease-out',
            }}
          >
            <div className="w-full max-w-2xl border border-[#e8a84a]/35 bg-[#0a0d18]/92 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.92)] rounded-2xl text-left pointer-events-auto select-none">
              {/* Metadata Header */}
              <div className="flex items-center gap-2 mb-4 flex-wrap border-b border-white/10 pb-3">
                <span className="h-2 w-2 rounded-full bg-[#e8a84a] animate-pulse" />
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#e8a84a] font-semibold">
                  Graphic Novel
                </span>
                <span className="text-[#f28b50]">•</span>
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#cfc5b9]/80 font-semibold">
                  Chapter One
                </span>
                <span className="text-[#f28b50]">•</span>
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#cfc5b9]/80 font-semibold">
                  Mumbai, India
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-[#fbf4ea] mb-4">
                THE STORY
              </h2>

              {/* Body Paragraphs */}
              <div className="space-y-3 font-serif text-sm sm:text-base leading-relaxed text-[#dfd5c7]">
                <p>
                  Death has always had a job to do. But when humanity discovers a way to escape mortality, Death suddenly finds herself out of work.
                </p>
                <p>
                  Cast down into the world she once watched from afar, she must experience life as a mortal in Mumbai.
                </p>
                <p className="italic text-[#f7c27d]/95 pt-1">
                  The Many Deaths of Laila Starr is a story about life, death, destiny and the unexpected connections that make our existence meaningful.
                </p>
              </div>

              {/* Footer Metadata */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.24em] text-[#cfc5b9]/70 flex-wrap gap-2">
                <span className="text-[#e8a84a]/90">A story of life, death and destiny</span>
                <span className="flex items-center gap-1.5 text-white/50">
                  <span>Scroll to continue</span>
                  <ChevronDown className="w-3 h-3 text-[#e8a84a]" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. THE OPENING CANVAS · ONCE UPON A FALLING STARR (0.30 – 0.58) ── */}
        {canvasOpacity > 0.02 && (
          <div
            data-testid="opening-canvas-card"
            className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 z-50 pointer-events-none"
            style={{
              opacity: canvasOpacity * exitFade,
              transform: `translateY(${(1 - canvasOpacity) * 20}px)`,
              transition: reducedMotion ? 'none' : 'opacity 200ms ease-out, transform 200ms ease-out',
            }}
          >
            <div className="w-full max-w-3xl border border-[#f28b50]/45 bg-[#0a0d18]/92 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.92)] rounded-2xl text-left pointer-events-auto select-none">
              {/* Card Header */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-[#f28b50] animate-pulse" />
                  <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#f28b50] font-semibold">
                    The Opening Canvas · Ram V & Filipe Andrade
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#ffd29d]/85 bg-[#f28b50]/15 px-2.5 py-0.5 rounded border border-[#f28b50]/30">
                    Prologue
                  </span>
                </div>
              </div>

              {/* Section Title */}
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#f8f1e7] mb-3 [text-wrap:balance]">
                Once Upon a Falling Starr
              </h2>

              {/* Poetic Narrative Text */}
              <p className="font-display text-base sm:text-lg md:text-xl italic leading-relaxed text-[#dfd5c7]">
                &ldquo;It began as it always had, in the quiet between two breaths. Before the rain. Before Mumbai woke to find itself immortal.&rdquo;
              </p>

              {/* Metadata Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#cfc5b9]/70 flex-wrap gap-2">
                <span className="text-[#f28b50]">Mumbai · Sunset Prelude</span>
                <span>Bandra-Kurla Complex · 16:40 IST</span>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. MONUMENTAL TITLE REVEAL (0.58 – 0.86) ───────────────────── */}
        {titleOpacity > 0.02 && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 z-40 pointer-events-none select-none text-center"
            style={{
              opacity: titleOpacity * exitFade,
              transform: `scale(${portalZoom}) translateY(${(1 - titleOpacity) * 24}px)`,
              transition: reducedMotion ? 'none' : 'opacity 200ms ease-out',
            }}
          >
            {/* Prestigious Editorial Eyebrow */}
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#e8a84a]/60" />
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.38em] text-[#e8a84a]/90 font-medium">
                BOOM! STUDIOS · RAM V & FILIPE ANDRADE
              </span>
              <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#e8a84a]/60" />
            </div>

            {/* Title Part 1: Wide Spaced Serif Eyebrow */}
            <p className="font-mono text-xs sm:text-sm md:text-base uppercase tracking-[0.32em] text-[#dfd5c7]/85 mb-1 sm:mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              THE MANY DEATHS OF
            </p>

            {/* Title Part 2: Colossal Graphic Novel Masthead */}
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.92] text-[#fbf4ea] drop-shadow-[0_16px_48px_rgba(0,0,0,0.95)] max-w-4xl">
              <span className="bg-gradient-to-r from-[#f7c27d] via-[#f28b50] to-[#e66c8b] bg-clip-text text-transparent">
                LAILA STARR
              </span>
            </h1>

            {/* Poetic Narrative Hook Line */}
            <p className="mt-5 sm:mt-6 font-serif italic text-sm sm:text-lg md:text-xl text-[#fbf4ea]/80 max-w-xl mx-auto leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] [text-wrap:balance]">
              "When the goddess of death is cast down into a dying city, mortality is not an end. It is an education."
            </p>

            {/* Setting / Act Metadata */}
            <div className="mt-5 sm:mt-6 flex items-center justify-center gap-3 sm:gap-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.30em] text-white/50">
              <span>MUMBAI</span>
              <span className="text-[#f28b50]">•</span>
              <span>16:40 IST</span>
              <span className="text-[#f28b50]">•</span>
              <span>CHAPTER 01</span>
            </div>
          </div>
        )}

        {/* Discreet Scroll Guidance Indicator (Fades smoothly as viewer scrolls past 0.10) */}
        {stageProgress < 0.10 && (
          <div
            className="absolute bottom-[max(2rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex flex-col items-center gap-2 transition-opacity duration-300"
            style={{ opacity: Math.max(0, 1 - stageProgress * 12) }}
          >
            <button
              type="button"
              onClick={() => sceneAudioManager.unmute()}
              className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-white/50 hover:text-[#f28b50] transition-colors cursor-pointer animate-bounce"
              aria-label="Scroll or click to begin journey with audio"
            >
              <span>Scroll or Click to Begin</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#f28b50]" />
            </button>
          </div>
        )}
      </CinematicViewportStage>
    </section>
  );
});

Scene00Prologue.displayName = 'Scene00Prologue';
