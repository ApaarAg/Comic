/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene05TwoEvents.tsx
 *
 * Storyverse 4.2.5: Cinematic Viewport Stage for Scene 05 (Two Events, One Moment)
 *
 * Reconstructs the 10:02 PM parallel convergence between two divergent lives into
 * four distinct, beautifully paced cinematic beats:
 * - BEAT A: Parel · The Fall (The girl falling through twilight air)
 * - BEAT B: Amravati · Childbirth (Mrs. Shah in labor squeezing husband's hand)
 * - BEAT C: The Shockwave (Simultaneous vertical stacked convergence at 10:02 PM)
 * - BEAT D: The First Breath (Newborn Darius taking his first breath)
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

export const Scene05TwoEvents: React.FC<SceneProps> = React.memo(({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
}) => {
  return (
    <CinematicViewportStage
      sceneId="scene-05"
      reducedMotion={reducedMotion}
      trackHeightVh={360}
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
        const { fallProgress, convergence } = computeParallelEditState(stageProgress);

        // Normalized sub-beat progress calculations
        const beatAProgress = Math.min(1, Math.max(0, stageProgress / 0.32));
        const beatBProgress = Math.min(1, Math.max(0, (stageProgress - 0.32) / 0.28));
        const beatCProgress = Math.min(1, Math.max(0, (stageProgress - 0.60) / 0.18));
        const beatDProgress = Math.min(1, Math.max(0, (stageProgress - 0.78) / 0.22));

        return (
          <div className="relative flex flex-col items-center justify-center w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl px-2 sm:px-6">
            {/* Standardized Editorial Scene Header Badge */}
            <div className="hidden sm:block absolute top-[max(5.25rem,calc(env(safe-area-inset-top,0px)+4.75rem))] left-6 md:left-10 pointer-events-none z-30">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#f06a7e] bg-black/40 px-2.5 py-0.5 rounded-full border border-[#f06a7e]/30 backdrop-blur-md">
                Scene 05 · Parallel Realities
              </span>
              <h2 className="font-display text-xl font-bold text-[#f9f2ec] sm:text-2xl mt-1 drop-shadow-md">
                Two Events, One Moment
              </h2>
            </div>

            {/* Stage Content */}
            <div className="relative w-full flex flex-col items-center justify-center min-h-[420px] sm:min-h-[500px] max-h-[820px] pt-12 sm:pt-14">
              {/* Convergence Indicator Bar */}
              <div className="w-full max-w-4xl xl:max-w-5xl mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 text-[10px] sm:text-xs font-mono uppercase tracking-widest transition-colors duration-300">
                <span
                  className={
                    stageProgress < 0.60
                      ? 'text-[#f06a7e] font-bold drop-shadow-[0_0_8px_rgba(240,106,126,0.5)]'
                      : 'text-[#f06a7e]/60'
                  }
                >
                  Parel · The Fall
                </span>
                <span className="text-[#f7e7da]/95 font-semibold px-2.5 py-0.5 rounded bg-white/5 border border-white/10 shadow-sm">
                  {stageProgress < 0.32
                    ? '10:02 PM · Parel Freefall'
                    : stageProgress < 0.60
                    ? '10:02 PM · Amravati Labor'
                    : stageProgress < 0.78
                    ? '10:02 PM · Convergence Shockwave'
                    : '10:02 PM · The First Breath'}
                </span>
                <span
                  className={
                    stageProgress >= 0.32
                      ? 'text-[#7bc8e2] font-bold drop-shadow-[0_0_8px_rgba(123,200,226,0.5)]'
                      : 'text-[#7bc8e2]/60'
                  }
                >
                  Amravati · The Birth
                </span>
              </div>

              {/* BEAT A: PAREL — THE FALL (stageProgress < 0.32) */}
              {stageProgress < 0.32 && (
                <div className="w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl flex flex-col items-center justify-center transition-opacity duration-400 ease-out">
                  <div className="w-full flex items-center justify-between px-2 mb-2">
                    <span className="text-[11px] font-mono tracking-widest text-[#f06a7e] uppercase font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f06a7e] animate-pulse" />
                      Parel · Sixth Floor Freefall
                    </span>
                    <span className="text-[10px] font-mono tracking-wider text-white/50 uppercase">
                      Two Floors Down
                    </span>
                  </div>
                  <div
                    className="w-full max-h-[68vh] flex items-center justify-center transition-transform duration-300"
                    style={{
                      transform: reducedMotion
                        ? undefined
                        : `translateY(${Math.round((beatAProgress - 0.5) * 18)}px) scale(1.01)`,
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
                </div>
              )}

              {/* BEAT B: AMRAVATI — CHILDBIRTH (0.32 <= stageProgress < 0.60) */}
              {stageProgress >= 0.32 && stageProgress < 0.60 && (
                <div className="w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl flex flex-col items-center justify-center transition-opacity duration-400 ease-out">
                  <div className="w-full flex items-center justify-between px-2 mb-2">
                    <span className="text-[11px] font-mono tracking-widest text-[#7bc8e2] uppercase font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7bc8e2] animate-pulse" />
                      Amravati Hospital · Labor Ward
                    </span>
                    <span className="text-[10px] font-mono tracking-wider text-white/50 uppercase">
                      Contraction Climax
                    </span>
                  </div>
                  <div
                    className="w-full max-h-[68vh] flex items-center justify-center transition-transform duration-300"
                    style={{
                      transform: reducedMotion
                        ? undefined
                        : `scale(${1.0 + Math.sin(beatBProgress * Math.PI * 3) * 0.015})`,
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
                </div>
              )}

              {/* BEAT C: THE SHOCKWAVE / CONVERGENCE (0.60 <= stageProgress < 0.78) */}
              {stageProgress >= 0.60 && stageProgress < 0.78 && (
                <div className="w-full max-w-3xl xl:max-w-4xl flex flex-col items-center justify-center transition-opacity duration-400 ease-out gap-3">
                  {/* Top: Parel Impact Approach */}
                  <div className="w-full flex flex-col items-center">
                    <div className="w-full flex items-center justify-between px-2 mb-1">
                      <span className="text-[10px] font-mono tracking-widest text-[#f06a7e] uppercase font-medium">
                        Parel · Final Approach
                      </span>
                      <span className="text-[9px] font-mono tracking-wider text-[#f06a7e]/70 uppercase">
                        Impact Imminent
                      </span>
                    </div>
                    <div
                      className="w-full max-h-[30vh] flex items-center justify-center overflow-hidden rounded border border-[#f06a7e]/30 shadow-md transition-transform duration-200"
                      style={{
                        transform: reducedMotion
                          ? undefined
                          : `translateY(${Math.round(beatCProgress * 8)}px)`,
                      }}
                    >
                      <ComicPanel
                        src="/assets/chapter1/p13_panel03.webp"
                        alt="The girl falling through twilight air at the instant of impact"
                        isActive={true}
                        onInspect={onInspectPanel}
                        inspectNote="Parel · 10:02 PM: The girl falling toward the asphalt at the moment of convergence."
                      />
                    </div>
                  </div>

                  {/* Center: High-Tension Convergence Shockwave Horizon */}
                  <div className="w-full flex items-center justify-center gap-3 py-1 px-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#f06a7e] to-[#f7e7da]" />
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-[#f7e7da] bg-black/60 px-3 py-1 rounded-full border border-white/20 shadow-[0_0_12px_rgba(240,106,126,0.35)] backdrop-blur-md">
                      10:02:00 PM · Exact Convergence
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#7bc8e2] to-[#f7e7da]" />
                  </div>

                  {/* Bottom: Amravati Final Push */}
                  <div className="w-full flex flex-col items-center">
                    <div className="w-full flex items-center justify-between px-2 mb-1">
                      <span className="text-[10px] font-mono tracking-widest text-[#7bc8e2] uppercase font-medium">
                        Amravati · The Final Push
                      </span>
                      <span className="text-[9px] font-mono tracking-wider text-[#7bc8e2]/70 uppercase">
                        Midwife Urging
                      </span>
                    </div>
                    <div
                      className="w-full max-h-[30vh] flex items-center justify-center overflow-hidden rounded border border-[#7bc8e2]/30 shadow-md transition-transform duration-200"
                      style={{
                        transform: reducedMotion
                          ? undefined
                          : `scale(${0.99 + convergence * 0.02})`,
                      }}
                    >
                      <ComicPanel
                        src="/assets/chapter1/p13_panel05.webp"
                        alt="Mrs. Shah in the delivery room at the moment of birth"
                        isActive={true}
                        onInspect={onInspectPanel}
                        inspectNote="Amravati Hospital · 10:02 PM: Mrs. Shah making the final push as two fates collide."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BEAT D: THE FIRST BREATH (stageProgress >= 0.78) */}
              {stageProgress >= 0.78 && (
                <div className="w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl flex flex-col items-center justify-center transition-opacity duration-400 ease-out">
                  <div className="w-full flex items-center justify-between px-2 mb-2">
                    <span className="text-[11px] font-mono tracking-widest text-[#f5c76c] uppercase font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f5c76c] animate-pulse" />
                      Amravati Hospital · The First Breath
                    </span>
                    <span className="text-[10px] font-mono tracking-wider text-[#f5c76c]/80 uppercase">
                      New Life Emerges
                    </span>
                  </div>
                  <div
                    className="w-full max-h-[68vh] flex items-center justify-center transition-transform duration-300"
                    style={{
                      transform: reducedMotion
                        ? undefined
                        : `scale(${1.0 + Math.sin(beatDProgress * Math.PI) * 0.02})`,
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
                </div>
              )}
            </div>
          </div>
        );
      }}
    >
      {/* Layer 5: Interactive Hotspot with safe positioning */}
      <div className="absolute top-20 right-6 z-30 pointer-events-auto">
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
});

Scene05TwoEvents.displayName = 'Scene05TwoEvents';
