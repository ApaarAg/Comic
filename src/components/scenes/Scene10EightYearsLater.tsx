/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene10EightYearsLater.tsx
 *
 * Storyverse 3.0: Pinned Cinematic Viewport Stage for Scene 10 (Eight Years Later)
 *
 * Choreographs the peaceful morning conversation between Pranah and Laila Starr
 * on the sunlit Mumbai veranda, and concludes Chapter One with chapter replay controls.
 */

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { CinematicViewportStage } from '../CinematicViewportStage';
import { SceneVideoBackdrop } from '../SceneVideoBackdrop';
import { CharacterAnimator } from '../CharacterAnimator';
import { ComicPanel } from '../ComicPanel';
import { InteractiveHotspot } from '../InteractiveHotspot';
import type { InspectedPanelData } from '../PanelInspectorModal';
import type { ResolvedVisualState } from '../../story/storyTimeline';

interface SceneProps {
  reducedMotion: boolean;
  activeSceneIndex: number;
  onReplayChapter?: () => void;
  onReplayPrologue?: () => void;
  onInspectPanel: (panel: InspectedPanelData) => void;
}

export const Scene10EightYearsLater: React.FC<SceneProps> = React.memo(({
  reducedMotion,
  activeSceneIndex,
  onReplayChapter,
  onReplayPrologue,
  onInspectPanel,
}) => {
  return (
    <div className="relative z-20">
      <CinematicViewportStage
        sceneId="scene-10"
        reducedMotion={reducedMotion}
        trackHeightVh={380}
        className="relative z-20"
        midgroundLayer={
          <SceneVideoBackdrop
            sceneId="scene-10"
            sceneIndex={9}
            activeSceneIndex={activeSceneIndex}
            reducedMotion={reducedMotion}
          />
        }
        cameraRigLayer={(visualState: ResolvedVisualState) => {
          const { stageProgress } = visualState;

          return (
            <div className="relative flex flex-col items-center justify-center w-full max-w-5xl px-4 md:px-8">
              {/* Standardized Glassmorphic Header Badge */}
              <div className="absolute top-4 left-6 md:left-10 z-30 pointer-events-none">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#e69a48]/30 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#e69a48] backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e69a48]" />
                  <span>Scene 10 · Eight Years Later · 7:30 AM</span>
                </span>
                <h2 className="font-display mt-2 text-2xl font-bold text-[#faf5ee] sm:text-3xl">
                  Morning Tea on the Veranda
                </h2>
              </div>

              {/* Stage Content */}
              <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px] pt-12">
                {/* Beat 1: Dawn Sunlight & Laila Stirring (stageProgress < 0.25) */}
                {stageProgress < 0.25 && (
                  <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                    <CharacterAnimator
                      src="/assets/chapter1/p25_panel06.webp"
                      alt="Laila stirring on wicker chair waking up in golden morning light"
                      character="laila"
                      activeSpeaker="laila"
                      reducedMotion={reducedMotion}
                      subtleMotion="breathe"
                      onInspect={onInspectPanel}
                      inspectNote="Eight years later, the sun rose anyway — as it always has, as it always will."
                    />
                  </div>
                )}

                {/* Beat 2: Laila Waking Up & Pranah Offering Tea (stageProgress 0.25 to 0.50) */}
                {stageProgress >= 0.25 && stageProgress < 0.50 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                    <CharacterAnimator
                      src="/assets/chapter1/p26_panel02.webp"
                      alt="Laila rubbing temples: Have you been standing there watching me sleep this whole time?"
                      character="laila"
                      activeSpeaker="laila"
                      reducedMotion={reducedMotion}
                      subtleMotion="pulse"
                      onInspect={onInspectPanel}
                    />
                    <CharacterAnimator
                      src="/assets/chapter1/p26_panel03.webp"
                      alt="Pranah holding teapot: You died. Run over by a twelve-wheeler. But I brought you back."
                      character="pranah"
                      activeSpeaker="pranah"
                      reducedMotion={reducedMotion}
                      subtleMotion="breathe"
                      onInspect={onInspectPanel}
                      inspectNote="You died. Run over by a twelve-wheeler. But I brought you back."
                    />
                  </div>
                )}

                {/* Beat 3: He Was Just a Baby & Pranah's Gift of Life (stageProgress 0.50 to 0.75) */}
                {stageProgress >= 0.50 && stageProgress < 0.75 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                    <CharacterAnimator
                      src="/assets/chapter1/p26_panel06.webp"
                      alt="Laila: I couldn't do it, Pran. He was just a baby..."
                      character="laila"
                      activeSpeaker="laila"
                      reducedMotion={reducedMotion}
                      onInspect={onInspectPanel}
                    />
                    <CharacterAnimator
                      src="/assets/chapter1/p26_panel07.webp"
                      alt="Pranah holding his blue teacup: Hey, I only give them a lifetime..."
                      character="pranah"
                      activeSpeaker="pranah"
                      reducedMotion={reducedMotion}
                      subtleMotion="breathe"
                      onInspect={onInspectPanel}
                      inspectNote="What they do with it is between them and... you, I suppose."
                    />
                  </div>
                )}

                {/* Beat 4: Balcony Overlooking the Sea & Laila's Realization (stageProgress >= 0.75) */}
                {stageProgress >= 0.75 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                    <ComicPanel
                      src="/assets/chapter1/p27_panel01.webp"
                      alt="Pranah and Laila standing on a sunlit Mumbai balcony overlooking the sea and skyline"
                      isActive={true}
                      onInspect={onInspectPanel}
                    />
                    <CharacterAnimator
                      src="/assets/chapter1/p27_panel02.webp"
                      alt="Laila sipping warm tea with wide reflective eyes: ...he's not a baby anymore."
                      character="laila"
                      activeSpeaker="laila"
                      reducedMotion={reducedMotion}
                      subtleMotion="breathe"
                      onInspect={onInspectPanel}
                      inspectNote="...he's not a baby anymore."
                    />
                  </div>
                )}
              </div>
            </div>
          );
        }}
      >
        {/* Layer 5: Interactive Hotspot (Positioned at top-20 right-6 to clear caption bar) */}
        <div className="absolute top-20 right-6 z-30 pointer-events-auto">
          <InteractiveHotspot
            id="veranda-dawn"
            label="The Mortal Life"
            title="Pranah's Sanctuary"
            body="As the god of life, Pranah does not decide what mortals do with their existence—he only gives them the gift of beginning. For eight peaceful years on this Mumbai veranda, Death learned what it felt like to simply drink morning tea."
            accentColor="#e69a48"
          />
        </div>
      </CinematicViewportStage>

      {/* Dawn-mist atmospheric transition buffer */}
      <div className="h-24 bg-gradient-to-b from-[#0e101a] to-[#0d101b] pointer-events-none" />

      {/* Chapter One Ending Reflection & Replay Console */}
      <footer className="relative z-30 bg-[#0d101b] border-t border-white/10 py-16 px-6 text-center">
        <div className="mx-auto max-w-4xl">
          <img
            src="/assets/chapter1/ch1_tea_sketch.webp"
            alt="Ink line illustration of Laila Starr sipping tea"
            loading="lazy"
            referrerPolicy="no-referrer"
            className="mx-auto mb-8 h-40 w-auto object-contain opacity-85 invert mix-blend-screen select-none"
          />

          {/* Monumental Chapter End Title Card */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f2a866]/30 bg-[#f2a866]/10 px-4 py-1.5 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f2a866] animate-pulse" />
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#f2a866]">
              CHAPTER 01 — THE END
            </p>
          </div>

          <h3 className="font-display mt-2 text-3xl font-semibold text-[#faf4ea] sm:text-5xl tracking-wide">
            Once Upon a Falling Starr
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-[#cfc5b9]/75">
            The Many Deaths of Laila Starr · Created by Ram V &amp; Filipe Andrade · Colors by Inês Amaro · Letters by AndWorld Design
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {onReplayChapter && (
              <button
                type="button"
                onClick={onReplayChapter}
                className="inline-flex items-center gap-2.5 border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-[#faf4ea] transition-all hover:border-[#f2a866] hover:bg-white/10 hover:text-[#f2a866] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2a866] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Return to Mumbai Sunset</span>
              </button>
            )}
            {onReplayPrologue && (
              <button
                type="button"
                onClick={onReplayPrologue}
                className="inline-flex items-center gap-2.5 border border-[#f2a866]/40 bg-[#f2a866]/10 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-[#f2a866] transition-all hover:bg-[#f2a866] hover:text-[#0b0d17] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2a866] cursor-pointer"
              >
                <span>Replay Prologue</span>
              </button>
            )}
            <div
              aria-disabled="true"
              className="inline-flex items-center gap-3 border border-white/10 bg-white/[0.03] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-[#faf4ea]/40 cursor-not-allowed select-none"
            >
              <span>Chapter 02 · The Second Death</span>
              <span className="rounded bg-[#f2a866]/20 px-2 py-0.5 text-[9px] font-mono tracking-wider text-[#f2a866] border border-[#f2a866]/30">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
});

Scene10EightYearsLater.displayName = 'Scene10EightYearsLater';
