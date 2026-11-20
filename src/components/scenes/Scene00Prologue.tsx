/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene00Prologue.tsx
 *
 * Storyverse 3.0: Continuous Cinematic Opening Experience
 *
 * Replaces the binary unmounting and window.scrollTo(0,0) jump of EntryVeil
 * with a continuous, camera-directed dive from darkness, through the audio unlock,
 * and into Mumbai at sunset.
 *
 * Visual & Narrative Progression:
 * 1. Darkness & Atmosphere (0.00 – 0.15): Deep twilight void, floating motes, audio unlock prompt.
 * 2. Skyline Emergence (0.15 – 0.40): Coral sunset emerges behind Mumbai silhouettes.
 * 3. Opening Narration (0.25): George's narration beat s01-01 begins.
 * 4. Title Manifestation (0.45 – 0.70): Gold foil title reveals with motif_storyverse.
 * 5. Camera Dive (0.75 – 1.00): Camera pushes through sunset clouds directly into Scene 01.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { CinematicViewportStage } from '../CinematicViewportStage';
import type { ResolvedVisualState } from '../../story/storyTimeline';
import mumbaiSkylineUrl from '../../assets/images/mumbai_skyline_backdrop_1795078714752.jpg';
import mumbaiCloudsUrl from '../../assets/images/mumbai_clouds_haze_1795078713772.jpg';
import mumbaiSilhouettesUrl from '../../assets/images/mumbai_foreground_silhouettes_1795078713773.jpg';
import { sceneAudioManager } from '../../audio/SceneAudioManager';
import { soundscape } from '../../audio/soundscape';
import { Volume2, VolumeX, Sparkles, ChevronDown } from 'lucide-react';

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

export const Scene00Prologue: React.FC<Scene00PrologueProps> = ({
  reducedMotion,
  isMuted,
  onToggleMute,
  onUnlockAudio,
}) => {
  const [stageProgress, setStageProgress] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Check if Web Audio is currently playing/unlocked
  useEffect(() => {
    const checkState = () => {
      const muted = sceneAudioManager.getMuted();
      setAudioUnlocked(!muted);
    };
    checkState();
    return sceneAudioManager.subscribe(checkState);
  }, []);

  const handleUnlock = useCallback(() => {
    sceneAudioManager.ensureAutoplayUnlocked();
    soundscape.unmute();
    onToggleMute();
    onUnlockAudio?.();
    setAudioUnlocked(true);
  }, [onToggleMute, onUnlockAudio]);

  // Compute keyframe-driven visual envelopes
  const darknessOpacity = Math.max(0, 1 - stageProgress * 3.2); // Fades from 1 -> 0 between 0.0 and 0.31
  const skylineOpacity = Math.min(1, Math.max(0, (stageProgress - 0.12) / 0.28)); // Rises from 0.12 to 0.40
  const titleOpacity =
    stageProgress < 0.40
      ? 0
      : stageProgress < 0.65
        ? (stageProgress - 0.40) / 0.25
        : stageProgress < 0.82
          ? 1
          : Math.max(0, 1 - (stageProgress - 0.82) / 0.12);

  const portalZoom = stageProgress > 0.75 ? 1 + (stageProgress - 0.75) * 1.4 : 1.0;
  const exitFade = stageProgress > 0.88 ? Math.max(0, 1 - (stageProgress - 0.88) / 0.12) : 1.0;

  return (
    <section id="scene-00" aria-label="Scene 0: Cinematic Prologue" className="relative w-full">
      <CinematicViewportStage
        sceneId="scene-00"
        reducedMotion={reducedMotion}
        trackHeightVh={250}
        onProgressChange={(p) => setStageProgress(p)}
        backgroundLayer={
          <div
            className="absolute inset-0 transition-opacity duration-300"
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
        cameraRigLayer={(visual: ResolvedVisualState) => (
          <div
            className="relative flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto will-change-transform"
            style={{
              transform: `scale(${portalZoom})`,
              opacity: exitFade,
              transition: reducedMotion ? 'none' : 'transform 100ms ease-out',
            }}
          >
            {/* Opening Title Manifestation */}
            <div
              className="transition-all duration-500 flex flex-col items-center"
              style={{
                opacity: titleOpacity,
                transform: `translateY(${(1 - titleOpacity) * 24}px)`,
              }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#e8a84a]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#e8a84a]">
                  An Interactive Graphic Novel
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#fbf4ea] drop-shadow-[0_8px_32px_rgba(0,0,0,0.85)] max-w-3xl leading-[1.08]">
                THE MANY DEATHS OF{' '}
                <span className="bg-gradient-to-r from-[#f28b50] via-[#f7c27d] to-[#e66c8b] bg-clip-text text-transparent">
                  LAILA STARR
                </span>
              </h1>

              <p className="mt-4 font-mono text-xs sm:text-sm uppercase tracking-[0.32em] text-[#dfd5c7]/75">
                Chapter 01 · The City of Mumbai
              </p>
            </div>
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
        {/* Unobtrusive Audio Unlock & Scroll Guidance Prompt */}
        {stageProgress < 0.35 && (
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex flex-col items-center gap-3 transition-opacity duration-300"
            style={{ opacity: Math.max(0, 1 - stageProgress * 3.5) }}
          >
            {!audioUnlocked ? (
              <button
                type="button"
                onClick={handleUnlock}
                className="group flex items-center gap-2.5 rounded-full bg-[#181f38]/90 px-5 py-2.5 text-xs font-mono tracking-widest uppercase text-[#fbf4ea] border border-[#f28b50]/40 shadow-xl backdrop-blur-md hover:bg-[#20294d] hover:border-[#f28b50] transition-all cursor-pointer"
              >
                <VolumeX className="w-4 h-4 text-[#f28b50] group-hover:scale-110 transition-transform" />
                <span>Click to Unlock Cinematic Audio</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-1.5 text-[11px] font-mono tracking-widest uppercase text-white/60 border border-white/10 backdrop-blur-md">
                <Volume2 className="w-3.5 h-3.5 text-[#f28b50]" />
                <span>Audio Active</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.24em] text-white/40 animate-bounce">
              <span>Scroll to Begin</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </CinematicViewportStage>
    </section>
  );
};
