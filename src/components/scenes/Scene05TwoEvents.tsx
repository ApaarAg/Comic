<<<<<<< HEAD
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
=======
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ComicPanel } from '../ComicPanel';
import { SceneVideoBackdrop } from '../SceneVideoBackdrop';
import { InteractiveHotspot } from '../InteractiveHotspot';
import { DialogueController } from '../DialogueController';
import { computeParallelEditState } from '../../story/scrollMath';
import type { InspectedPanelData } from '../PanelInspectorModal';

gsap.registerPlugin(ScrollTrigger);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74

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
<<<<<<< HEAD
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
=======
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [localProgress, setLocalProgress] = useState(0);
  const [manualScrub, setManualScrub] = useState<number | null>(null);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !stageRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: stageRef.current,
        start: 'top 82%',
        end: 'bottom 30%',
        scrub: 0.35,
        onUpdate: (self) => {
          setLocalProgress(self.progress);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const effectiveProgress = manualScrub ?? (reducedMotion ? 0.78 : localProgress);
  const { fallProgress, birthProgress, convergence } =
    computeParallelEditState(effectiveProgress);

  return (
    <section
      id="scene-05"
      ref={sectionRef}
      aria-label="Scene 5: Two Events, One Moment"
      className="relative overflow-x-clip bg-gradient-to-b from-[#233554] via-[#1c1429] to-[#11162a] py-20 md:py-28"
    >
      <SceneVideoBackdrop
        sceneId="scene-05"
        sceneIndex={4}
        activeSceneIndex={activeSceneIndex}
        reducedMotion={reducedMotion}
        scrubTriggerRef={sectionRef}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        {/* Prelude: Death's Brochure */}
        <div className="mb-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.26em] text-[#f06a7e]">
                Scene 05 · Parallel Realities
              </p>
              <h2 className="font-display mt-2 text-4xl font-semibold text-[#f9f2ec] sm:text-5xl">
                Two Events, One Moment
              </h2>
            </div>
            <p className="max-w-md text-sm text-[#e0d4dc]/80">
              A human body was to be given, to experience the pleasures of a mortal life to call her own.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ComicPanel
              src="/assets/chapter1/p13_panel01.webp"
              alt="Death slumping into melancholy before Agni's desk"
              onInspect={onInspectPanel}
            />
            <ComicPanel
              src="/assets/chapter1/p13_panel02.webp"
              alt="Pamphlet reading: A Mortal World of Possibilities — A helpful guide for an extraordinary life after godhood"
              onInspect={onInspectPanel}
            />
          </div>
        </div>

        {/* Split-Screen Parallel Editing Sequence with Interactive Timeline Scrubber */}
        <div
          ref={stageRef}
          data-testid="parallel-edit-stage"
          className="relative border border-white/12 bg-[#141022]/90 p-4 sm:p-6 md:p-8"
        >
          {/* Synchronization Convergence Bar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#f06a7e]">
              Parel · 6th Floor Window
            </span>
            <span className="font-mono text-[11px] tabular-nums uppercase tracking-[0.2em] text-[#f7e7da]/75">
              {convergence > 0.72 ? 'Exact Convergence · 10:02 PM' : 'Simultaneous Descent & Birth'}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7bc8e2]">
              Amravati Hospital
            </span>
          </div>

          {/* Interactive Timeline Scrub Handle */}
          <div className="mb-6 flex flex-wrap items-center gap-4 border border-white/10 bg-black/25 px-4 py-2.5">
            <label
              htmlFor="parallel-scrub-slider"
              className="font-mono text-[11px] uppercase tracking-wider text-[#e0d4dc]/80 shrink-0"
            >
              Scrub Simultaneous Moment
            </label>
            <input
              id="parallel-scrub-slider"
              type="range"
              min={0}
              max={100}
              value={Math.round(effectiveProgress * 100)}
              onChange={(e) => setManualScrub(Number(e.target.value) / 100)}
              className="flex-1 min-w-[140px] accent-[#f06a7e] cursor-pointer"
            />
            {manualScrub !== null && (
              <button
                type="button"
                onClick={() => setManualScrub(null)}
                className="font-mono text-[10px] uppercase tracking-wider text-[#f06a7e] hover:text-white cursor-pointer"
              >
                Sync to Scroll
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 items-start">
            {/* Track A: The Fall */}
            <div className="space-y-5">
              <div
                className="transition-transform duration-200"
                style={{
                  transform: reducedMotion
                    ? undefined
                    : `translateY(${Math.round((fallProgress - 0.3) * 10)}px)`,
                }}
              >
                <ComicPanel
                  src="/assets/chapter1/p11_panel06.webp"
                  alt="The girl perched precariously on the sixth-floor party window ledge"
                  onInspect={onInspectPanel}
                />
              </div>

              <div
                className="transition-all duration-300"
                style={{
                  opacity: reducedMotion ? 1 : Math.min(1, 0.72 + fallProgress * 0.28),
                  transform: reducedMotion
                    ? undefined
                    : `translateY(${Math.round((1 - fallProgress) * 12)}px)`,
                }}
              >
                <ComicPanel
                  src="/assets/chapter1/p13_panel03.webp"
                  alt="The girl falling through the twilight air two floors down toward the ground"
                  onInspect={onInspectPanel}
                />
                <div className="story-caption mt-3 p-4">
                  <p className="text-sm leading-relaxed">
                    &ldquo;It was around that time that the girl from the window at the party was falling through the air—two floors down and fast approaching the ground.&rdquo;
                  </p>
                </div>
              </div>

              <div
                className="transition-opacity duration-300"
                style={{
                  opacity: reducedMotion ? 1 : Math.min(1, 0.68 + fallProgress * 0.32),
                }}
              >
                <ComicPanel
                  src="/assets/chapter1/p13_panel04.webp"
                  alt="Shocked party-goers peering down from the window"
                  onInspect={onInspectPanel}
                />
                <p className="mt-2 text-xs italic text-[#dfd3dd]/75">
                  Later, the party-goers would say she slipped from her perch and fell. Yet others would swear that they saw her jump.
                </p>
              </div>
            </div>

            {/* Track B: The Birth */}
            <div className="space-y-5">
              <div
                className="transition-all duration-300"
                style={{
                  opacity: reducedMotion ? 1 : Math.min(1, 0.72 + birthProgress * 0.28),
                  transform: reducedMotion
                    ? undefined
                    : `translateY(${Math.round((1 - birthProgress) * 14)}px)`,
                }}
              >
                <ComicPanel
                  src="/assets/chapter1/p13_panel05.webp"
                  alt="Mrs. Shah in Amravati Hospital squeezing her husband's hand during delivery"
                  onInspect={onInspectPanel}
                />
                <div className="story-caption mt-3 p-4">
                  <p className="text-sm leading-relaxed">
                    &ldquo;Just as she hit the ground, Mrs. Shah was in the Amravati Hospital squeezing her husband&apos;s hand with such strength that he was screaming louder than her.&rdquo;
                  </p>
                </div>
              </div>

              <div
                className="transition-all duration-300"
                style={{
                  opacity: reducedMotion ? 1 : Math.min(1, 0.68 + birthProgress * 0.32),
                  transform: reducedMotion
                    ? undefined
                    : `scale(${0.98 + convergence * 0.02})`,
                }}
              >
                <ComicPanel
                  src="/assets/chapter1/p13_panel06.webp"
                  alt="Newborn Darius crying loudly in the midwife's hands as a new life enters the world"
                  onInspect={onInspectPanel}
                />
                <div className="story-caption-dark mt-3 p-4">
                  <p className="font-display text-lg italic leading-snug text-[#f9f1e9]">
                    &ldquo;As the midwife urged her into one last push, a new life came into being. A beautiful thing that would go on to be the cause of much consternation in his many years to come.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <DialogueController
              sequenceId="seq-05-narrator"
              reducedMotion={reducedMotion}
              scrollStageRef={stageRef}
              onSkipNextScene={onSkipNextScene}
            />
          </div>

          <div className="mt-6">
            <InteractiveHotspot
              id="parallel-pamphlet"
              label="Cosmic Bureaucracy"
              title="Inspect 'A Mortal World of Possibilities'"
              body="Agni's parting pamphlet offers laid-off deities helpful retirement hobbies—gardening, pottery, mortality. Death never meant to accept the severance peacefully; she simply saw the loop-hole inside her own descent."
              accentColor="#f06a7e"
            />
          </div>
        </div>
      </div>
    </section>
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
  );
};
