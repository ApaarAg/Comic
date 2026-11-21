/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene00Prologue.tsx
 *
 * Storyverse 3.1: Continuous Cinematic Opening Experience & Opening Canvas Narration
 *
 * Coordinates:
 * 1. Darkness & Atmosphere (0.00 – 0.12): Deep twilight void, floating motes, audio unlock prompt.
 * 2. The Opening Canvas: Once Upon a Falling Starr (0.12 – 0.54):
 *    - Coral sunset emerges behind Mumbai skyline silhouettes.
 *    - Brian's 1.05x Indian English narration begins immediately upon audio unlock.
 *    - Synchronized progressive text reveal with discreet replay button.
 *    - Camera glides from sunset sky down toward the curving elevated highway.
 * 3. Title Manifestation (0.54 – 0.82): Gold foil title reveals with motif_storyverse.
 * 4. Camera Dive (0.82 – 1.00): Camera pushes through sunset clouds directly into Scene 01.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CinematicViewportStage } from '../CinematicViewportStage';
import type { ResolvedVisualState } from '../../story/storyTimeline';
import mumbaiSkylineUrl from '../../assets/images/mumbai_skyline_backdrop_1795078714752.jpg';
import mumbaiCloudsUrl from '../../assets/images/mumbai_clouds_haze_1795078713772.jpg';
import mumbaiSilhouettesUrl from '../../assets/images/mumbai_foreground_silhouettes_1795078713773.jpg';
import { sceneAudioManager } from '../../audio/SceneAudioManager';
import { soundscape } from '../../audio/soundscape';
import { Volume2, VolumeX, ChevronDown, RotateCcw, Play, Pause } from 'lucide-react';
import { useOptionalNarrative } from '../../narrative/NarrativeEngine';

interface Scene00PrologueProps {
  reducedMotion: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onUnlockAudio?: () => void;
}

const PROLOGUE_MOTES = [
  { left: '15%', top: '22%', size: 3, delay: '0s', duration: '4.2s' },
  { left: '28%', top: '56%', size: 4, delay: '1.2s', duration: '5.1s' },
  { left: '42%', top: '38%', size: 2.5, delay: '2.4s', duration: '3.8s' },
  { left: '62%', top: '25%', size: 3.5, delay: '0.6s', duration: '4.7s' },
  { left: '74%', top: '62%', size: 3, delay: '1.8s', duration: '5.5s' },
  { left: '86%', top: '34%', size: 4, delay: '2.9s', duration: '4.1s' },
  { left: '20%', top: '78%', size: 2.5, delay: '3.2s', duration: '4.9s' },
  { left: '68%', top: '82%', size: 3.5, delay: '0.8s', duration: '5.2s' },
];

const OPENING_PASSAGE_TEXT =
  'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline. Down where the elevated highway curves between glass towers, the city exhaled in horns and heat.';
const OPENING_PASSAGE_WORDS = OPENING_PASSAGE_TEXT.split(' ');

export const Scene00Prologue: React.FC<Scene00PrologueProps> = ({
  reducedMotion,
  isMuted,
  onToggleMute,
  onUnlockAudio,
}) => {
  const [stageProgress, setStageProgress] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(!sceneAudioManager.getMuted());
  const narrative = useOptionalNarrative();
  const hasTriggeredRef = useRef(false);

  // Check if Web Audio is currently playing/unlocked
  useEffect(() => {
    const checkState = () => {
      const muted = sceneAudioManager.getMuted();
      setAudioUnlocked(!muted);
    };
    checkState();
    return sceneAudioManager.subscribe(checkState);
  }, []);

  // Trigger opening narration immediately upon audio unlock
  const handleUnlock = useCallback(() => {
    sceneAudioManager.ensureAutoplayUnlocked();
    sceneAudioManager.unmute();
    soundscape.unmute();
    onUnlockAudio?.();
    setAudioUnlocked(true);
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      narrative?.triggerNarrationBeat('s00-01');
    }
  }, [narrative, onUnlockAudio]);

  // If audio is already unlocked and user begins scrolling into the opening range, trigger narration once
  useEffect(() => {
    if (audioUnlocked && !hasTriggeredRef.current && stageProgress >= 0.04) {
      hasTriggeredRef.current = true;
      narrative?.triggerNarrationBeat('s00-01');
    }
  }, [audioUnlocked, stageProgress, narrative]);

  // Compute keyframe-driven visual envelopes
  const darknessOpacity = audioUnlocked
    ? Math.max(0, 1 - stageProgress * 6) * 0.12
    : Math.max(0, 1 - stageProgress * 4.5);
  const skylineOpacity = audioUnlocked
    ? Math.min(1, Math.max(0.78, stageProgress * 2))
    : Math.min(1, Math.max(0, (stageProgress - 0.08) / 0.22));

  // Opening Canvas: Once Upon a Falling Starr envelope
  const canvasOpacity = audioUnlocked
    ? stageProgress < 0.45
      ? 1
      : Math.max(0, 1 - (stageProgress - 0.45) / 0.09)
    : stageProgress < 0.12
      ? 0
      : stageProgress < 0.20
        ? (stageProgress - 0.12) / 0.08
        : stageProgress < 0.48
          ? 1
          : Math.max(0, 1 - (stageProgress - 0.48) / 0.07);

  // Title Manifestation envelope (0.54 – 0.82)
  const titleOpacity =
    stageProgress < 0.54
      ? 0
      : stageProgress < 0.66
        ? (stageProgress - 0.54) / 0.12
        : stageProgress < 0.82
          ? 1
          : Math.max(0, 1 - (stageProgress - 0.82) / 0.10);

  const portalZoom = stageProgress > 0.80 ? 1 + (stageProgress - 0.80) * 1.5 : 1.0;
  const exitFade = stageProgress > 0.88 ? Math.max(0, 1 - (stageProgress - 0.88) / 0.12) : 1.0;

  // Camera choreography developing alongside narration
  const cameraPanY = stageProgress < 0.54 ? stageProgress * 30 : 16.2;
  const cameraScale = 1 + stageProgress * 0.05;

  // Synchronized word lighting calculation
  const isNarrating = narrative?.activeNarrationId === 's00-01' && narrative.isNarratorActive;
  const wordProgress =
    narrative?.activeNarrationId === 's00-01'
      ? narrative.narratorProgress
      : stageProgress > 0.45
        ? 1
        : 0;
  const currentWordIndex = Math.min(
    OPENING_PASSAGE_WORDS.length,
    Math.floor(wordProgress * OPENING_PASSAGE_WORDS.length),
  );

  return (
    <section id="scene-00" aria-label="Scene 0: Cinematic Prologue" className="relative w-full">
      <CinematicViewportStage
        sceneId="scene-00"
        reducedMotion={reducedMotion}
        trackHeightVh={320}
        onProgressChange={(p) => setStageProgress(p)}
        backgroundLayer={
          <div
            className="absolute inset-0 transition-opacity duration-300 will-change-transform"
            style={{
              opacity: skylineOpacity * exitFade,
              transform: reducedMotion
                ? 'none'
                : `translateY(${cameraPanY}px) scale(${cameraScale})`,
              transition: 'transform 180ms ease-out',
            }}
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
        cameraRigLayer={(visual: ResolvedVisualState) => (
          <div
            className="relative flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-5xl mx-auto will-change-transform"
            style={{
              transform: `scale(${portalZoom})`,
              opacity: exitFade,
              transition: reducedMotion ? 'none' : 'transform 100ms ease-out',
            }}
          >
            {/* ── 1. THE OPENING CANVAS · ONCE UPON A FALLING STARR (0.12 – 0.54) ── */}
            {canvasOpacity > 0.02 && (
              <div
                className="absolute inset-x-0 flex flex-col items-center justify-center max-w-3xl mx-auto px-4 z-20 pointer-events-auto"
                style={{
                  opacity: canvasOpacity,
                  transform: `translateY(${(1 - canvasOpacity) * 20}px)`,
                }}
              >
                <div className="w-full border border-[#f28b50]/45 bg-[#0d101d]/90 p-6 sm:p-8 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.85)] rounded-xl text-left">
                  {/* Card Header & Replay Controls */}
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[#f28b50] animate-pulse" />
                      <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#f28b50] font-semibold">
                        The Opening Canvas · Ram V & Filipe Andrade
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#ffd29d]/85 bg-[#f28b50]/15 px-2.5 py-0.5 rounded border border-[#f28b50]/30">
                        Brian · 1.05x
                      </span>
                      {narrative?.activeNarrationId === 's00-01' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (narrative.audioState === 'Paused') {
                              narrative.resumeNarrator();
                            } else {
                              narrative.pauseNarrator();
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-white/20 bg-black/40 hover:border-[#f28b50] hover:text-[#f28b50] text-[#e6ddd0] text-xs font-mono transition-all cursor-pointer shadow-md"
                          title={narrative.audioState === 'Paused' ? 'Resume Opening Narration' : 'Pause Opening Narration'}
                        >
                          {narrative.audioState === 'Paused' ? (
                            <>
                              <Play className="w-3 h-3 text-[#f28b50]" />
                              <span className="text-[10px] uppercase tracking-wider">Resume</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3 text-[#f28b50]" />
                              <span className="text-[10px] uppercase tracking-wider">Pause</span>
                            </>
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => narrative?.triggerNarrationBeat('s00-01', true)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/20 bg-black/40 hover:border-[#f28b50] hover:text-[#f28b50] text-[#e6ddd0] text-xs font-mono transition-all cursor-pointer shadow-md"
                        title="Replay Opening Narration"
                      >
                        <RotateCcw className="w-3 h-3 text-[#f28b50]" />
                        <span className="text-[10px] uppercase tracking-wider">Replay</span>
                      </button>
                    </div>
                  </div>

                  {/* Section Title */}
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#f8f1e7] mb-3 [text-wrap:balance]">
                    Once Upon a Falling Starr
                  </h2>

                  {/* Synchronized Word Highlighting */}
                  <p className="font-display text-base sm:text-lg md:text-xl italic leading-relaxed text-[#dfd5c7]">
                    &ldquo;
                    {OPENING_PASSAGE_WORDS.map((word, idx) => {
                      const isSpoken = idx < currentWordIndex;
                      const isCurrent = idx === currentWordIndex - 1 && isNarrating;
                      return (
                        <span
                          key={`canvas-w-${idx}`}
                          className="inline-block transition-all duration-150"
                          style={{
                            opacity: isSpoken ? 1 : 0.35,
                            color: isCurrent ? '#f7c27d' : isSpoken ? '#fbf4ea' : '#9d97b0',
                            textShadow: isCurrent ? '0 0 14px rgba(247,194,125,0.7)' : 'none',
                          }}
                        >
                          {word}
                          {idx < OPENING_PASSAGE_WORDS.length - 1 ? '\u00A0' : ''}
                        </span>
                      );
                    })}
                    &rdquo;
                  </p>

                  {/* Metadata Footer */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#cfc5b9]/70 flex-wrap gap-2">
                    <span className="text-[#f28b50]">Voice: The Chronicle (Brian · Indian English)</span>
                    <span>Bandra-Kurla Complex · 16:40 IST</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. MONUMENTAL TITLE REVEAL (0.54 – 0.82) ───────────────────── */}
            {titleOpacity > 0.02 && (
              <div
                className="transition-all duration-700 flex flex-col items-center select-none"
                style={{
                  opacity: titleOpacity,
                  transform: `translateY(${(1 - titleOpacity) * 32}px)`,
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
          </div>
        )}
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
        {/* Cinematic Audio Unlock & Scroll Guidance Prompt */}
        {stageProgress < 0.38 && (
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex flex-col items-center gap-3 transition-opacity duration-300"
            style={{ opacity: Math.max(0, 1 - stageProgress * 3.2) }}
          >
            {!audioUnlocked ? (
              <button
                type="button"
                data-testid="enable-audio-btn"
                onClick={handleUnlock}
                className="group relative flex items-center gap-3 rounded-full bg-[#120d22]/90 px-6 py-3 text-xs font-mono tracking-[0.22em] uppercase text-[#fbf4ea] border border-[#f28b50]/50 shadow-[0_4px_24px_rgba(242,139,80,0.25)] backdrop-blur-xl hover:bg-[#1a1432] hover:border-[#f28b50] hover:shadow-[0_4px_32px_rgba(242,139,80,0.4)] transition-all cursor-pointer"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f28b50] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f28b50]" />
                </span>
                <VolumeX className="w-4 h-4 text-[#f28b50] group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Enable Full Cinematic Audio</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5 rounded-full bg-black/60 px-5 py-2 text-[11px] font-mono tracking-[0.24em] uppercase text-[#f7c27d] border border-[#f28b50]/30 backdrop-blur-xl shadow-lg">
                <Volume2 className="w-3.5 h-3.5 text-[#f28b50] animate-pulse" />
                <span>Cinematic Score & Voices Active</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-white/50 animate-bounce">
              <span>Scroll to Begin Journey</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#f28b50]" />
            </div>
          </div>
        )}
      </CinematicViewportStage>
    </section>
  );
};
