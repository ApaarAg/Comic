/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene05TwoEvents.tsx
 *
 * Storyverse 3.0: Pinned Cinematic Viewport Stage for Scene 05 (Two Events, One Moment)
 *
 * Orchestrates the parallel cross-cut between two divergent lives at 10:02 PM:
 * the girl falling from the 6th-floor party window and Darius taking his first breath.
 */

import React from 'react';
import { CinematicViewportStage } from '../CinematicViewportStage';
import { SceneVideoBackdrop } from '../SceneVideoBackdrop';
import { ComicPanel } from '../ComicPanel';
import { InteractiveHotspot } from '../InteractiveHotspot';
import { computeParallelEditState } from '../../story/scrollMath';
import type { InspectedPanelData } from '../PanelInspectorModal';
import type { ResolvedVisualState } from '../../story/storyTimeline';

interface SceneProps {
  reducedMotion: boolean;
  activeSceneIndex: number;
  onInspectPanel: (panel: InspectedPanelData) => void;
  onSkipNextScene?: () => void;
}

export const Scene05TwoEvents: React.FC<SceneProps> = ({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
  return (
    <CinematicViewportStage
      sceneId="scene-05"
      reducedMotion={reducedMotion}
      trackHeightVh={350}
      className="relative z-20"
      midgroundLayer={
        <SceneVideoBackdrop
          sceneId="scene-05"
          sceneIndex={4}
          activeSceneIndex={activeSceneIndex}
          reducedMotion={reducedMotion}
        />
      }
      cameraRigLayer={(visualState: ResolvedVisualState) => {
        const { stageProgress } = visualState;
        const { fallProgress, birthProgress, convergence } = computeParallelEditState(stageProgress);

        return (
          <div className="relative flex flex-col items-center justify-center w-full max-w-5xl px-4 md:px-8">
            {/* Scene Header Watermark */}
            <div className="absolute -top-16 left-6 md:left-10 pointer-events-none opacity-40">
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#f06a7e]">
                Scene 05 · Parallel Realities
              </span>
              <h2 className="font-display text-2xl font-bold text-[#f9f2ec] sm:text-3xl">
                Two Events, One Moment
              </h2>
            </div>

            {/* Stage Content */}
            <div className="relative w-full flex flex-col items-center justify-center min-h-[400px] sm:min-h-[480px] max-h-[760px]">
              {/* Convergence Indicator Bar - Always visible across Scene 05 */}
              <div className="w-full max-w-3xl mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 text-[10px] sm:text-xs font-mono uppercase tracking-widest">
                <span className={stageProgress >= 0.40 && stageProgress < 0.65 ? 'text-[#f06a7e] font-bold' : 'text-[#f06a7e]/60'}>
                  Parel · The Fall
                </span>
                <span className="text-[#f7e7da]/90 font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10">
                  {stageProgress < 0.40
                    ? '10:02 PM · The Divine Office'
                    : convergence > 0.72
                    ? '10:02 PM · Convergence'
                    : '10:02 PM · Simultaneous Crossing'}
                </span>
                <span className={stageProgress >= 0.65 ? 'text-[#7bc8e2] font-bold' : 'text-[#7bc8e2]/60'}>
                  Amravati · The Birth
                </span>
              </div>

              {/* Sequential Full-Viewport Panel Presentations */}
              {/* Beat 1: Agni's Desk (stageProgress < 0.20) */}
              {stageProgress < 0.20 && (
                <div className="w-full max-w-3xl flex flex-col items-center justify-center transition-all duration-500 ease-out space-y-3">
                  <div className="w-full max-h-[68vh] flex items-center justify-center">
                    <ComicPanel
                      src="/assets/chapter1/p13_panel01.webp"
                      alt="Death slumping into melancholy before Agni's desk"
                      isActive={true}
                      onInspect={onInspectPanel}
                      inspectNote="Agni's Celestial Office · Death slumping into melancholy upon hearing of her dismissal."
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-display italic text-[#dfd3dd]/85 text-center">
                    &ldquo;Agni's Celestial Office · The severance conversation.&rdquo;
                  </p>
                </div>
              )}

              {/* Beat 2: The Severance Pamphlet (0.20 <= stageProgress < 0.40) */}
              {stageProgress >= 0.20 && stageProgress < 0.40 && (
                <div className="w-full max-w-3xl flex flex-col items-center justify-center transition-all duration-500 ease-out space-y-3">
                  <div className="w-full max-h-[68vh] flex items-center justify-center">
                    <ComicPanel
                      src="/assets/chapter1/p13_panel02.webp"
                      alt="Pamphlet reading: A Mortal World of Possibilities — A helpful guide for an extraordinary life after godhood"
                      isActive={true}
                      onInspect={onInspectPanel}
                      inspectNote="Pamphlet: A Mortal World of Possibilities — A helpful guide for an extraordinary life after godhood."
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-display italic text-[#f06a7e] text-center">
                    &ldquo;A Mortal World of Possibilities · A helpful guide for an extraordinary life after godhood.&rdquo;
                  </p>
                </div>
              )}

              {/* Beat 3: Track A — The Fall (0.40 <= stageProgress < 0.65) */}
              {stageProgress >= 0.40 && stageProgress < 0.65 && (
                <div className="w-full max-w-3xl flex flex-col items-center justify-center transition-all duration-500 ease-out space-y-3">
                  <div
                    className="w-full max-h-[68vh] flex items-center justify-center transition-transform duration-300"
                    style={{
                      transform: reducedMotion
                        ? undefined
                        : `translateY(${Math.round((fallProgress - 0.5) * 20)}px)`,
                    }}
                  >
                    <ComicPanel
                      src="/assets/chapter1/p13_panel03.webp"
                      alt="The girl falling through the twilight air two floors down toward the ground"
                      isActive={true}
                      onInspect={onInspectPanel}
                      inspectNote="Parel · 10:02 PM: The girl falling through the twilight air two floors down."
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-display italic text-[#f06a7e] text-center">
                    &ldquo;It was around that time that the girl from the window at the party was falling through the air — two floors down and fast approaching the ground.&rdquo;
                  </p>
                </div>
              )}

              {/* Beat 4: Track B — The Birth: Labor (0.65 <= stageProgress < 0.82) */}
              {stageProgress >= 0.65 && stageProgress < 0.82 && (
                <div className="w-full max-w-3xl flex flex-col items-center justify-center transition-all duration-500 ease-out space-y-3">
                  <div
                    className="w-full max-h-[68vh] flex items-center justify-center transition-transform duration-300"
                    style={{
                      transform: reducedMotion
                        ? undefined
                        : `scale(${0.97 + convergence * 0.03})`,
                    }}
                  >
                    <ComicPanel
                      src="/assets/chapter1/p13_panel05.webp"
                      alt="Mrs. Shah in Amravati Hospital squeezing her husband's hand"
                      isActive={true}
                      onInspect={onInspectPanel}
                      inspectNote="Amravati Hospital · 10:02 PM: Mrs. Shah squeezing her husband's hand in labor."
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-display italic text-[#7bc8e2] text-center">
                    &ldquo;Just as she hit the ground, Mrs. Shah was in the Amravati Hospital squeezing her husband's hand with such strength that he was screaming louder than her.&rdquo;
                  </p>
                </div>
              )}

              {/* Beat 5: Track B — The First Breath (stageProgress >= 0.82) */}
              {stageProgress >= 0.82 && (
                <div className="w-full max-w-3xl flex flex-col items-center justify-center transition-all duration-500 ease-out space-y-3">
                  <div
                    className="w-full max-h-[68vh] flex items-center justify-center transition-transform duration-300"
                    style={{
                      transform: reducedMotion
                        ? undefined
                        : `scale(${1.0 + convergence * 0.02})`,
                    }}
                  >
                    <ComicPanel
                      src="/assets/chapter1/p13_panel06.webp"
                      alt="Newborn Darius crying loudly in the midwife hands"
                      isActive={true}
                      onInspect={onInspectPanel}
                      inspectNote="Amravati Hospital · 10:02 PM: Darius takes his first breath."
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-display italic text-[#7bc8e2] text-center">
                    &ldquo;...a new life came into being. And the world had its answer to death.&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }}
    >
      {/* Layer 5: Interactive Hotspot */}
      <div className="absolute bottom-6 right-6 z-30 pointer-events-auto">
        <InteractiveHotspot
          id="parallel-pamphlet"
          label="Cosmic Bureaucracy"
          title="Inspect 'A Mortal World of Possibilities'"
          body="Agni's parting pamphlet offers laid-off deities helpful retirement hobbies—gardening, pottery, mortality. Death never meant to accept the severance peacefully; she simply saw the loop-hole inside her own descent."
          accentColor="#f06a7e"
        />
      </div>
    </CinematicViewportStage>
  );
};
