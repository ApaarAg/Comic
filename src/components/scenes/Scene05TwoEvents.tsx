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
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px]">
              {/* Prelude: Agni's Desk & Pamphlet (stageProgress < 0.25) */}
              {stageProgress < 0.25 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                  <ComicPanel
                    src="/assets/chapter1/p13_panel01.webp"
                    alt="Death slumping into melancholy before Agni's desk"
                    isActive={true}
                    onInspect={onInspectPanel}
                  />
                  <ComicPanel
                    src="/assets/chapter1/p13_panel02.webp"
                    alt="Pamphlet reading: A Mortal World of Possibilities — A helpful guide for an extraordinary life after godhood"
                    isActive={true}
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Parallel Split Sequence (stageProgress >= 0.25) */}
              {stageProgress >= 0.25 && (
                <div className="w-full max-w-4xl border border-white/12 bg-[#141022]/90 p-4 sm:p-6 transition-all duration-500 ease-out">
                  {/* Convergence Indicator Bar */}
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#f06a7e]">
                    <span>Parel · The Fall</span>
                    <span className="text-[#f7e7da]/80">
                      {convergence > 0.72 ? '10:02 PM · Convergence' : 'Simultaneous Crossing'}
                    </span>
                    <span className="text-[#7bc8e2]">Amravati · The Birth</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
                    {/* Track A: The Fall */}
                    <div className="space-y-3">
                      <div
                        className="transition-transform duration-300"
                        style={{
                          transform: reducedMotion
                            ? undefined
                            : `translateY(${Math.round((fallProgress - 0.5) * 16)}px)`,
                        }}
                      >
                        <ComicPanel
                          src="/assets/chapter1/p13_panel03.webp"
                          alt="The girl falling through the twilight air two floors down toward the ground"
                          isActive={stageProgress < 0.65}
                          onInspect={onInspectPanel}
                        />
                      </div>
                      <p className="text-xs italic text-[#dfd3dd]/75">
                        &ldquo;...two floors down and fast approaching the ground.&rdquo;
                      </p>
                    </div>

                    {/* Track B: The Birth */}
                    <div className="space-y-3">
                      <div
                        className="transition-transform duration-300"
                        style={{
                          transform: reducedMotion
                            ? undefined
                            : `scale(${0.96 + convergence * 0.04})`,
                        }}
                      >
                        <ComicPanel
                          src={
                            stageProgress >= 0.75
                              ? '/assets/chapter1/p13_panel06.webp'
                              : '/assets/chapter1/p13_panel05.webp'
                          }
                          alt={
                            stageProgress >= 0.75
                              ? 'Newborn Darius crying loudly in the midwife hands'
                              : "Mrs. Shah in Amravati Hospital squeezing her husband's hand"
                          }
                          isActive={stageProgress >= 0.65}
                          onInspect={onInspectPanel}
                        />
                      </div>
                      <p className="text-xs italic text-[#7bc8e2]/85">
                        {stageProgress >= 0.75
                          ? '&ldquo;...a new life came into being.&rdquo;'
                          : "&ldquo;...Mrs. Shah squeezing her husband's hand...&rdquo;"}
                      </p>
                    </div>
                  </div>
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
