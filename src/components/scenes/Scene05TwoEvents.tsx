/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene05TwoEvents.tsx
 *
 * Storyverse 4.2.6: Cinematic Viewport Stage for Scene 05 (Two Events, One Moment)
 *
 * Reconstructs the 10:02 PM parallel convergence between two divergent lives into
 * a unified, persistent camera stage with continuous cross-fade transitions and
 * authentic comic narrative progression (Option A):
 * - BEAT A: Parel · The Fall (p13_panel03: The girl falling through twilight air)
 * - BEAT B: Amravati · Childbirth (p13_panel05: Mrs. Shah in labor squeezing husband's hand)
 * - BEAT C: The Convergence (p13_panel04: Sixth-floor balcony witnesses horrified +
 *            p13_panel05: Climactic delivery push with metaphysical shockwave seam)
 * - BEAT D: The First Breath (p13_panel06: Newborn Darius taking his first breath)
 */

import React, { useMemo } from 'react';
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

function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
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
        const { convergence } = computeParallelEditState(stageProgress);

        // Continuous Normalized Sub-Beat Progress
        const beatAProgress = Math.min(1, Math.max(0, stageProgress / 0.32));
        const beatBProgress = Math.min(1, Math.max(0, (stageProgress - 0.30) / 0.28));
        const beatCProgress = Math.min(1, Math.max(0, (stageProgress - 0.58) / 0.20));
        const beatDProgress = Math.min(1, Math.max(0, (stageProgress - 0.76) / 0.24));

        // Continuous Progress-Driven Opacities (Zero Discrete Unmounting Pops)
        // Beat A: 0.00 -> 0.26 solid, 0.26 -> 0.34 dissolves to 0
        const opacityA = stageProgress <= 0.26
          ? 1
          : stageProgress >= 0.34
          ? 0
          : 1 - smoothStep(0.26, 0.34, stageProgress);

        // Beat B: 0.26 -> 0.33 dissolves in, 0.33 -> 0.54 solid, 0.54 -> 0.61 dissolves to 0
        const opacityB = stageProgress < 0.26
          ? 0
          : stageProgress <= 0.33
          ? smoothStep(0.26, 0.33, stageProgress)
          : stageProgress <= 0.54
          ? 1
          : stageProgress >= 0.61
          ? 0
          : 1 - smoothStep(0.54, 0.61, stageProgress);

        // Beat C: 0.54 -> 0.61 dissolves in, 0.61 -> 0.74 solid, 0.74 -> 0.80 dissolves to 0
        const opacityC = stageProgress < 0.54
          ? 0
          : stageProgress <= 0.61
          ? smoothStep(0.54, 0.61, stageProgress)
          : stageProgress <= 0.74
          ? 1
          : stageProgress >= 0.80
          ? 0
          : 1 - smoothStep(0.74, 0.80, stageProgress);

        // Beat D: 0.74 -> 0.80 dissolves in, 0.80 -> 1.00 solid
        const opacityD = stageProgress < 0.74
          ? 0
          : stageProgress <= 0.80
          ? smoothStep(0.74, 0.80, stageProgress)
          : 1;

        // Controlled Metaphysical Shockwave Visual Dynamics
        // Bell-curve intensity focused around peak convergence (p = 0.66..0.72)
        const shockwavePeakT = Math.max(0, 1 - Math.abs(stageProgress - 0.69) / 0.06);
        const shockwaveBloom = Math.pow(shockwavePeakT, 2);
        const shockwaveJitter = reducedMotion ? 0 : Math.sin(stageProgress * 140) * shockwaveBloom * 2.5;
        const shockwaveScalePulse = shockwaveBloom * 0.022;

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
                    stageProgress < 0.58
                      ? 'text-[#f06a7e] font-bold drop-shadow-[0_0_8px_rgba(240,106,126,0.5)]'
                      : stageProgress < 0.76
                      ? 'text-[#f06a7e] font-semibold'
                      : 'text-[#f06a7e]/50'
                  }
                >
                  Parel · The Fall
                </span>
                <span
                  className={`px-3 py-0.5 rounded font-semibold transition-all duration-300 border ${
                    stageProgress >= 0.58 && stageProgress < 0.76
                      ? 'text-[#f5c76c] bg-[#f5c76c]/15 border-[#f5c76c]/40 shadow-[0_0_12px_rgba(245,199,108,0.35)]'
                      : 'text-[#f7e7da]/95 bg-white/5 border-white/10 shadow-sm'
                  }`}
                >
                  {stageProgress < 0.30
                    ? '10:02 PM · Parel Freefall'
                    : stageProgress < 0.58
                    ? '10:02 PM · Amravati Labor'
                    : stageProgress < 0.76
                    ? '10:02:00 PM · Exact Convergence'
                    : '10:02 PM · The First Breath'}
                </span>
                <span
                  className={
                    stageProgress >= 0.76
                      ? 'text-[#f5c76c] font-bold drop-shadow-[0_0_8px_rgba(245,199,108,0.5)]'
                      : stageProgress >= 0.30
                      ? 'text-[#7bc8e2] font-bold drop-shadow-[0_0_8px_rgba(123,200,226,0.5)]'
                      : 'text-[#7bc8e2]/50'
                  }
                >
                  {stageProgress >= 0.76 ? 'Darius · First Breath' : 'Amravati · The Birth'}
                </span>
              </div>

              {/* Persistent Multi-Layer Virtual Camera Stage (Continuous Cross-Fade Composition) */}
              <div className="relative w-full grid grid-cols-1 grid-rows-1 items-center justify-items-center">
                {/* BEAT A: PAREL — THE FALL (p13_panel03.webp) */}
                <div
                  className="col-start-1 row-start-1 w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl flex flex-col items-center justify-center transition-all duration-300 ease-out"
                  style={{
                    opacity: opacityA,
                    pointerEvents: opacityA > 0.5 ? 'auto' : 'none',
                    visibility: opacityA > 0.01 ? 'visible' : 'hidden',
                    transform: reducedMotion
                      ? undefined
                      : `translateY(${Math.round((beatAProgress - 0.5) * 18)}px) scale(1.01)`,
                  }}
                >
                  <div className="w-full flex items-center justify-between px-2 mb-2">
                    <span className="text-[11px] font-mono tracking-widest text-[#f06a7e] uppercase font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f06a7e] animate-pulse" />
                      Parel · Sixth Floor Freefall
                    </span>
                    <span className="text-[10px] font-mono tracking-wider text-white/50 uppercase">
                      Two Floors Down
                    </span>
                  </div>
                  <div className="w-full max-h-[68vh] flex items-center justify-center">
                    <ComicPanel
                      src="/assets/chapter1/p13_panel03.webp"
                      alt="The girl falling through the twilight air two floors down toward the ground"
                      isActive={opacityA > 0.5}
                      onInspect={onInspectPanel}
                      inspectNote="Parel · 10:02 PM: The girl falling through the twilight air two floors down."
                    />
                  </div>
                </div>

                {/* BEAT B: AMRAVATI — CHILDBIRTH (p13_panel05.webp) */}
                <div
                  className="col-start-1 row-start-1 w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl flex flex-col items-center justify-center transition-all duration-300 ease-out"
                  style={{
                    opacity: opacityB,
                    pointerEvents: opacityB > 0.5 ? 'auto' : 'none',
                    visibility: opacityB > 0.01 ? 'visible' : 'hidden',
                    transform: reducedMotion
                      ? undefined
                      : `scale(${1.0 + Math.sin(beatBProgress * Math.PI * 3) * 0.015})`,
                  }}
                >
                  <div className="w-full flex items-center justify-between px-2 mb-2">
                    <span className="text-[11px] font-mono tracking-widest text-[#7bc8e2] uppercase font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7bc8e2] animate-pulse" />
                      Amravati Hospital · Labor Ward
                    </span>
                    <span className="text-[10px] font-mono tracking-wider text-white/50 uppercase">
                      Contraction Climax
                    </span>
                  </div>
                  <div className="w-full max-h-[68vh] flex items-center justify-center">
                    <ComicPanel
                      src="/assets/chapter1/p13_panel05.webp"
                      alt="Mrs. Shah in Amravati Hospital squeezing her husband's hand"
                      isActive={opacityB > 0.5}
                      onInspect={onInspectPanel}
                      inspectNote="Amravati Hospital · 10:02 PM: Mrs. Shah squeezing her husband's hand in labor."
                    />
                  </div>
                </div>

                {/* BEAT C: THE CONVERGENCE & SHOCKWAVE (Option A: p13_panel04 + p13_panel05) */}
                <div
                  className="col-start-1 row-start-1 w-full max-w-3xl xl:max-w-4xl flex flex-col items-center justify-center transition-all duration-200 ease-out gap-2 sm:gap-2.5"
                  style={{
                    opacity: opacityC,
                    pointerEvents: opacityC > 0.5 ? 'auto' : 'none',
                    visibility: opacityC > 0.01 ? 'visible' : 'hidden',
                    transform: reducedMotion
                      ? undefined
                      : `translate3d(0, ${Math.round(shockwaveJitter)}px, 0) scale(${1.0 + shockwaveScalePulse})`,
                  }}
                >
                  {/* Upper: Parel Party Onlookers Horrified (p13_panel04.webp) */}
                  <div className="w-full flex flex-col items-center">
                    <div className="w-full flex items-center justify-between px-2 mb-1">
                      <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#f06a7e] uppercase font-semibold flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#f06a7e] animate-pulse" />
                        Parel · Sixth Floor Balcony
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-[#f06a7e]/80 uppercase">
                        Witnessing The Plunge
                      </span>
                    </div>
                    <div
                      className="w-full max-h-[30vh] flex items-center justify-center overflow-hidden rounded-lg border border-[#f06a7e]/40 shadow-lg shadow-[#f06a7e]/10 transition-transform duration-200"
                      style={{
                        transform: reducedMotion
                          ? undefined
                          : `scale(${1.02 + convergence * 0.025}) translateY(${Math.round(convergence * 2)}px)`,
                      }}
                    >
                      <ComicPanel
                        src="/assets/chapter1/p13_panel04.webp"
                        alt="Partygoers leaning over the sixth-floor balcony in horror as the girl falls toward the ground"
                        isActive={opacityC > 0.5}
                        onInspect={onInspectPanel}
                        inspectNote="Parel · 10:02 PM: Shock on the sixth-floor balcony as partygoers watch the girl slip into freefall."
                      />
                    </div>
                  </div>

                  {/* Center: High-Tension Metaphysical Convergence Shockwave Seam */}
                  <div className="relative w-full flex items-center justify-center gap-3 py-1 px-4 my-0.5">
                    {/* Left Energetic Horizon Beam (Coral -> Gold) */}
                    <div
                      className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#f06a7e] to-[#f5c76c] transition-all duration-300"
                      style={{
                        boxShadow: `0 0 ${8 + convergence * 14}px rgba(240,106,126,${0.35 + convergence * 0.5})`,
                      }}
                    />

                    {/* Convergence Pill Badge with Radiant Bloom */}
                    <div className="relative flex items-center gap-2 bg-black/85 px-3.5 py-1 rounded-full border border-white/25 shadow-lg backdrop-blur-md">
                      <span className="h-2 w-2 rounded-full bg-[#f06a7e] shadow-[0_0_6px_#f06a7e]" />
                      <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.20em] uppercase font-bold text-[#fbf4ea] drop-shadow-sm">
                        10:02:00 PM · Parallel Convergence
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#7bc8e2] shadow-[0_0_6px_#7bc8e2]" />

                      {/* Optical Shockwave Radial Bloom Flare */}
                      {shockwaveBloom > 0 && !reducedMotion && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -inset-x-8 -inset-y-3 rounded-full mix-blend-screen transition-opacity duration-150"
                          style={{
                            background:
                              'radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(245,199,108,0.45) 45%, transparent 75%)',
                            opacity: shockwaveBloom,
                            filter: 'blur(4px)',
                          }}
                        />
                      )}
                    </div>

                    {/* Right Energetic Horizon Beam (Cyan -> Gold) */}
                    <div
                      className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-[#7bc8e2] to-[#f5c76c] transition-all duration-300"
                      style={{
                        boxShadow: `0 0 ${8 + convergence * 14}px rgba(123,200,226,${0.35 + convergence * 0.5})`,
                      }}
                    />
                  </div>

                  {/* Lower: Amravati Climactic Contraction (p13_panel05.webp with Dynamic Convergence Zoom) */}
                  <div className="w-full flex flex-col items-center">
                    <div className="w-full flex items-center justify-between px-2 mb-1">
                      <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#7bc8e2] uppercase font-semibold flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#7bc8e2] animate-pulse" />
                        Amravati Hospital · Delivery Room
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-[#7bc8e2]/80 uppercase">
                        The Climactic Push
                      </span>
                    </div>
                    <div
                      className="w-full max-h-[30vh] flex items-center justify-center overflow-hidden rounded-lg border border-[#7bc8e2]/40 shadow-lg shadow-[#7bc8e2]/10 transition-transform duration-200"
                      style={{
                        transform: reducedMotion
                          ? undefined
                          : `scale(${1.02 + convergence * 0.025}) translateY(${Math.round(-convergence * 2)}px)`,
                      }}
                    >
                      <ComicPanel
                        src="/assets/chapter1/p13_panel05.webp"
                        alt="Mrs. Shah in the delivery room bed gripping her husband's knuckles with intense force as the midwife urges the final push"
                        isActive={opacityC > 0.5}
                        onInspect={onInspectPanel}
                        inspectNote="Amravati Hospital · 10:02 PM: Mrs. Shah makes the final agonizing push as two divergent fates collide."
                      />
                    </div>
                  </div>
                </div>

                {/* BEAT D: THE FIRST BREATH (p13_panel06.webp) */}
                <div
                  className="col-start-1 row-start-1 w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl flex flex-col items-center justify-center transition-all duration-300 ease-out"
                  style={{
                    opacity: opacityD,
                    pointerEvents: opacityD > 0.5 ? 'auto' : 'none',
                    visibility: opacityD > 0.01 ? 'visible' : 'hidden',
                    transform: reducedMotion
                      ? undefined
                      : `scale(${1.0 + Math.sin(beatDProgress * Math.PI) * 0.02})`,
                  }}
                >
                  <div className="w-full flex items-center justify-between px-2 mb-2">
                    <span className="text-[11px] font-mono tracking-widest text-[#f5c76c] uppercase font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f5c76c] animate-pulse" />
                      Amravati Hospital · The First Breath
                    </span>
                    <span className="text-[10px] font-mono tracking-wider text-[#f5c76c]/80 uppercase">
                      New Life Emerges
                    </span>
                  </div>
                  <div className="w-full max-h-[68vh] flex items-center justify-center">
                    <ComicPanel
                      src="/assets/chapter1/p13_panel06.webp"
                      alt="Newborn Darius crying loudly in the midwife hands"
                      isActive={opacityD > 0.5}
                      onInspect={onInspectPanel}
                      inspectNote="Amravati Hospital · 10:02 PM: Darius takes his first breath."
                    />
                  </div>
                </div>
              </div>
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
