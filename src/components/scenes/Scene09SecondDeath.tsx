<<<<<<< HEAD
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene09SecondDeath.tsx
 *
 * Storyverse 3.0: Pinned Cinematic Viewport Stage for Scene 09 (Second Death)
 *
 * Choreographs Laila's sudden, devastating collision with the twelve-wheeler truck
 * on the rain-slicked highway moments before midnight.
 */

import React from 'react';
import { CinematicViewportStage } from '../CinematicViewportStage';
import { SceneVideoBackdrop } from '../SceneVideoBackdrop';
import { ComicPanel } from '../ComicPanel';
import { InteractiveHotspot } from '../InteractiveHotspot';
import type { InspectedPanelData } from '../PanelInspectorModal';
import type { ResolvedVisualState } from '../../story/storyTimeline';
=======
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ComicPanel } from '../ComicPanel';
import { InteractiveHotspot } from '../InteractiveHotspot';
import { SceneVideoBackdrop } from '../SceneVideoBackdrop';
import { DialogueController } from '../DialogueController';
import { computeImpactZoom } from '../../story/scrollMath';
import { soundscape } from '../../audio/soundscape';
import type { InspectedPanelData } from '../PanelInspectorModal';

gsap.registerPlugin(ScrollTrigger);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74

interface SceneProps {
  reducedMotion: boolean;
  activeSceneIndex: number;
  onInspectPanel: (panel: InspectedPanelData) => void;
  onSkipNextScene?: () => void;
}

export const Scene09SecondDeath: React.FC<SceneProps> = ({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
<<<<<<< HEAD
  return (
    <CinematicViewportStage
      sceneId="scene-09"
      reducedMotion={reducedMotion}
      trackHeightVh={320}
      className="relative z-20"
      midgroundLayer={
        <SceneVideoBackdrop
          sceneId="scene-09"
          sceneIndex={8}
          activeSceneIndex={activeSceneIndex}
          reducedMotion={reducedMotion}
        />
      }
      cameraRigLayer={(visualState: ResolvedVisualState) => {
        const { stageProgress } = visualState;

        return (
          <div className="relative flex flex-col items-center justify-center w-full max-w-5xl px-4 md:px-8">
            {/* Scene Header Watermark */}
            <div className="absolute -top-16 left-6 md:left-10 pointer-events-none opacity-40">
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#f5b041]">
                Scene 09 · Midnight Highway · 11:58 PM
              </span>
              <h2 className="font-display text-2xl font-bold text-[#faf3eb] sm:text-3xl">
                The Second Death
              </h2>
            </div>

            {/* Stage Content */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px]">
              {/* Beat 1: Rain-Slicked Highway & Twelve-Wheeler Headlights (stageProgress < 0.40) */}
              {stageProgress < 0.40 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p25_panel01.webp"
                    alt="Massive twin halogen headlights of an oncoming twelve-wheeler truck blinding the screen"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="Great thundering wheels of commerce rolled on unfettered."
                  />
                </div>
              )}

              {/* Beat 2: The Collision Impact Freeze-Frame (stageProgress 0.40 to 0.70) */}
              {stageProgress >= 0.40 && stageProgress < 0.70 && (
                <div className="w-full max-w-3xl transition-all duration-300 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p25_panel02.webp"
                    alt="Shocking collision impact freeze-frame with shattered glass and crushing metal"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="The violent shockwave of impact — sudden, merciless, absolute."
                  />
                </div>
              )}

              {/* Beat 3: The Aftermath — Laila Starr Met Her Death Once Again (stageProgress >= 0.70) */}
              {stageProgress >= 0.70 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p25_panel05.webp"
                    alt="Laila's body lying motionless on the wet asphalt under distant streetlights"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="And so, only a few minutes away from midnight, Laila Starr met her death once again."
                  />
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
          id="collision-truck"
          label="The Irony of Mortality"
          title="Wheels of Commerce"
          body="Having survived the fall from the sixth floor and walked out of clinical death in the morgue, Laila's borrowed life lasted less than two hours before Mumbai's unyielding night traffic claimed her again."
          accentColor="#f5b041"
        />
      </div>
    </CinematicViewportStage>
=======
  const sectionRef = useRef<HTMLElement>(null);
  const zoomStageRef = useRef<HTMLDivElement>(null);
  const [localProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (!reducedMotion && zoomStageRef.current) {
        ScrollTrigger.create({
          trigger: zoomStageRef.current,
          start: 'top 85%',
          end: 'bottom 25%',
          scrub: 0.3,
          onUpdate: (self) => {
            setLocalProgress(self.progress);
          },
        });
      }

      ScrollTrigger.create({
        trigger: zoomStageRef.current ?? sectionRef.current,
        start: 'top 55%',
        once: true,
        onEnter: () => soundscape.triggerCue('truck'),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const { scale, headlightIntensity, isImpactWindow } = computeImpactZoom(
    reducedMotion ? 0.5 : localProgress,
  );
  const clampedScale = Math.min(1.08, scale);

  return (
    <section
      id="scene-09"
      ref={sectionRef}
      aria-label="Scene 9: The Second Death"
      className="relative overflow-x-clip bg-gradient-to-b from-[#0a0b15] via-[#0e0f1d] to-[#171c26] py-24 md:py-32"
    >
      <SceneVideoBackdrop
        sceneId="scene-09"
        sceneIndex={8}
        activeSceneIndex={activeSceneIndex}
        reducedMotion={reducedMotion}
        scrubTriggerRef={sectionRef}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[#f5b041]">
              Scene 09 · Minutes Away from Midnight
            </p>
            <h2 className="font-display mt-2 text-4xl font-semibold text-[#f7f2ec] sm:text-5xl">
              The Second Death
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#dcd4cb]/80">
            But the lesser used, ancillary exit was only a short bolt away from the busy street nearby.
          </p>
        </div>

        {/* Wet Steps Out Into the Street */}
        <div className="mb-10">
          <ComicPanel
            src="/assets/chapter1/p24_panel01.webp"
            alt="Bare footsteps splashing across wet concrete steps: Ploc, Ploc, Ploc"
            onInspect={onInspectPanel}
          />
        </div>

        {/* Scroll-Scrubbed Impact Zoom */}
        <div
          ref={zoomStageRef}
          data-testid="second-death-stage"
          className="relative overflow-hidden border border-white/12 bg-[#0b0c16] p-4 sm:p-6"
        >
          {/* Headlight glow intensification */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
            style={{
              opacity: headlightIntensity * 0.42,
              background:
                'radial-gradient(circle at 50% 58%, rgba(255, 224, 130, 0.55), rgba(242, 139, 80, 0.14) 55%, transparent 78%)',
            }}
          />

          <div
            className="relative mx-auto max-w-4xl overflow-hidden will-change-transform"
            style={{
              transform: reducedMotion ? undefined : `scale(${clampedScale})`,
              transformOrigin: 'center 55%',
            }}
          >
            <ComicPanel
              src="/assets/chapter1/p24_panel02.webp"
              alt="Laila leaping barefoot in front of an oncoming twelve-wheeler truck blasting BLAAAARRRR!"
              onInspect={onInspectPanel}
            />
          </div>

          <div className="relative z-20 mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[260px] max-w-xl">
              <DialogueController
                sequenceId="seq-09-narrator"
                reducedMotion={reducedMotion}
                scrollStageRef={zoomStageRef}
                onSkipNextScene={onSkipNextScene}
              />
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#f5b041]">
              {isImpactWindow ? '11:54 PM · Impact' : '11:53 PM'}
            </span>
          </div>
        </div>

        {/* Final Quiet Cut + Interactive Beat */}
        <div className="mt-12 space-y-6">
          <ComicPanel
            src="/assets/chapter1/p24_panel03.webp"
            alt="Blurred neon taillights streaking across dark midnight asphalt"
            onInspect={onInspectPanel}
          />
          <InteractiveHotspot
            id="midnight-impact"
            label="Narrative Turning Point"
            title="Why Death Cannot Simply Stay Dead"
            body="Running straight out of Amravati's ancillary gate, Laila never hears the highway freight lane behind the rain. Yet the universe is not finished with her story—not while Pranah, the God of Life himself, watches from the shore."
            detailNote="Audio Cue: Re-trigger midnight twelve-wheeler horn resonance."
            accentColor="#f5b041"
            onActivate={() => soundscape.triggerCue('truck')}
          />
        </div>
      </div>
    </section>
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
  );
};
