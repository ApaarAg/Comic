<<<<<<< HEAD
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene03Party.tsx
 *
 * Storyverse 3.0: Pinned Cinematic Viewport Stage for Scene 03 (The College Party)
 *
 * Choreographs the contrast between noisy collegiate debate in the apartment interior
 * and the quiet, melancholic contemplation of the girl at the window six floors above.
 */

import React from 'react';
import { CinematicViewportStage } from '../CinematicViewportStage';
import { SceneVideoBackdrop } from '../SceneVideoBackdrop';
import { CharacterAnimator } from '../CharacterAnimator';
import { ComicPanel } from '../ComicPanel';
import { InteractiveHotspot } from '../InteractiveHotspot';
import type { InspectedPanelData } from '../PanelInspectorModal';
import type { ResolvedVisualState } from '../../story/storyTimeline';
=======
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ComicPanel } from '../ComicPanel';
import { CharacterAnimator } from '../CharacterAnimator';
import { DialogueController } from '../DialogueController';
import { InteractiveHotspot } from '../InteractiveHotspot';
import { SceneVideoBackdrop } from '../SceneVideoBackdrop';
import type { CharacterId } from '../../story/dialogueManifest';
import type { InspectedPanelData } from '../PanelInspectorModal';
import { getScenePacingProfile } from '../../story/motionSystem';

gsap.registerPlugin(ScrollTrigger);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74

interface SceneProps {
  reducedMotion: boolean;
  activeSceneIndex: number;
  onInspectPanel: (panel: InspectedPanelData) => void;
  onSkipNextScene?: () => void;
}

export const Scene03Party: React.FC<SceneProps> = ({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
<<<<<<< HEAD
  return (
    <CinematicViewportStage
      sceneId="scene-03"
      reducedMotion={reducedMotion}
      trackHeightVh={320}
      className="relative z-20"
      midgroundLayer={
        <SceneVideoBackdrop
          sceneId="scene-03"
          sceneIndex={2}
          activeSceneIndex={activeSceneIndex}
          reducedMotion={reducedMotion}
        />
      }
      foregroundLayer={
        !reducedMotion ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-20">
            {[...Array(6)].map((_, i) => (
              <span
                key={`smoke-mote-${i}`}
                className="absolute rounded-full bg-[#e66c8b]/40 blur-[1px] animate-pulse"
                style={{
                  left: `${15 + i * 14}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  width: `${3 + (i % 3)}px`,
                  height: `${3 + (i % 3)}px`,
                  animationDuration: `${3 + i * 1.5}s`,
                }}
              />
            ))}
          </div>
        ) : undefined
      }
      cameraRigLayer={(visualState: ResolvedVisualState) => {
        const { stageProgress } = visualState;

        return (
          <div className="relative flex flex-col items-center justify-center w-full max-w-5xl px-4 md:px-8">
            {/* Scene Header Watermark */}
            <div className="absolute -top-16 left-6 md:left-10 pointer-events-none opacity-40">
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#e66c8b]">
                Scene 03 · Parel · 6th Floor
              </span>
              <h2 className="font-display text-2xl font-bold text-[#f4eef7] sm:text-3xl">
                The College Party
              </h2>
            </div>

            {/* Visual Panel Choreography */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px]">
              {/* Beat 1: Dhiraj Ranting (Panel 02) */}
              {stageProgress < 0.35 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p08_panel02.webp"
                    alt="Dhiraj animatedly arguing cultural theory at party"
                    character="dhiraj"
                    activeSpeaker="dhiraj"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                    inspectNote="Listen, the whole discourse still reproduces the same patriarchal power equations..."
                  />
                </div>
              )}

              {/* Beat 2: Girl Perched on Window Ledge (Panel 03) */}
              {stageProgress >= 0.35 && stageProgress < 0.60 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p08_panel03.webp"
                    alt="The girl sitting alone on the open window ledge holding a cigarette overlooking the city"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="Far removed from the debate inside, she watches the distant sea of lights."
                  />
                </div>
              )}

              {/* Beat 3: Close-up of the Girl's Eyes & Raven Hair (Panel 04) */}
              {stageProgress >= 0.60 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p08_panel04.webp"
                    alt="Close-up of the girl with gentle curls of raven hair and cigarette smoke drifting past"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="Beneath gentle curls of raven hair, her eyes stayed fixed on distant city lights..."
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
          id="party-smoke"
          label="Twilight Solitude"
          title="The Girl at the Window"
          body="Surrounded by alcohol, chatter, and heated intellectual debate, she sat in complete silence six floors above the Mumbai streets—holding a cigarette and gazing into the dark."
          accentColor="#e66c8b"
        />
      </div>
    </CinematicViewportStage>
=======
  const sectionRef = useRef<HTMLElement>(null);
  const partyStageRef = useRef<HTMLDivElement>(null);
  const smokeRef = useRef<HTMLDivElement>(null);
  const closeupRef = useRef<HTMLDivElement>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<CharacterId | null>('dhiraj');

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;
    const pacing = getScenePacingProfile('twilight');
    const ctx = gsap.context(() => {
      if (smokeRef.current) {
        gsap.fromTo(
          smokeRef.current,
          { y: 20, opacity: 0.3 },
          {
            y: -26,
            opacity: 0.65,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              end: 'bottom 30%',
              scrub: true,
            },
          },
        );
      }

      if (closeupRef.current) {
        gsap.fromTo(
          closeupRef.current,
          { scale: 0.96, y: 24 },
          {
            scale: 1,
            y: 0,
            ease: pacing.ease,
            scrollTrigger: {
              trigger: closeupRef.current,
              start: 'top 85%',
              end: 'top 35%',
              scrub: pacing.duration,
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="scene-03"
      ref={sectionRef}
      aria-label="Scene 3: The College Party"
      className="relative overflow-x-clip bg-gradient-to-b from-[#13162b] via-[#191b36] to-[#16283d] py-24 md:py-32"
    >
      <SceneVideoBackdrop
        sceneId="scene-03"
        sceneIndex={2}
        activeSceneIndex={activeSceneIndex}
        reducedMotion={reducedMotion}
        scrubTriggerRef={sectionRef}
      />

      {/* Subtle drifting coral smoke atmosphere */}
      <div
        ref={smokeRef}
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/3 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(230, 108, 139, 0.16) 0%, rgba(92, 130, 198, 0.08) 55%, transparent 75%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[#e66c8b]">
              Scene 03 · Aria Towers, Parel
            </p>
            <h2 className="font-display mt-2 text-4xl font-semibold text-[#f4eef7] sm:text-5xl">
              The College Party
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#ddd4e4]/80">
            Sixth floor, Aria Towers. The T.I. Media Studies class of 2019 gathered for one last hurrah
            before they each went their own ways.
          </p>
        </div>

        {/* Establishing Shot: Exterior Building -> Party Room */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <ComicPanel
                src="/assets/chapter1/p08_panel01.webp"
                alt="Glow of pink twilight windows across the sixth floor of Aria Towers in Parel"
                onInspect={onInspectPanel}
              />
            </div>
            <div className="lg:col-span-4">
              <div className="story-caption-dark p-6">
                <p className="font-display text-xl leading-snug text-[#f7eff8]">
                  &ldquo;Meanwhile on the sixth floor of the Aria Towers in Parel, the T.I. Media Studies class of 2019 was having a final year party.&rdquo;
                </p>
              </div>
            </div>
          </div>

          <ComicPanel
            src="/assets/chapter1/p08_panel02.webp"
            alt="Students crowded in warm dusk light at their final year apartment party"
            onInspect={onInspectPanel}
          />

          {/* Scroll-Driven Party Conversation: Dhiraj -> Girl at the Window */}
          <div
            ref={partyStageRef}
            data-testid="scene-03-dialogue-stage"
            className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start pt-2"
          >
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <DialogueController
                sequenceId="seq-03-party"
                reducedMotion={reducedMotion}
                scrollStageRef={partyStageRef}
                onActiveSpeakerChange={(speaker) => setActiveSpeaker(speaker)}
                onSkipNextScene={onSkipNextScene}
              />
            </div>

            <div className="lg:col-span-7 space-y-8">
              <CharacterAnimator
                src="/assets/chapter1/p08_panel03.webp"
                alt="Dhiraj talking earnestly beside the open sixth-floor window where the girl sits perched"
                character="dhiraj"
                activeSpeaker={activeSpeaker}
                reducedMotion={reducedMotion}
                subtleMotion="breathe"
                onInspect={onInspectPanel}
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <CharacterAnimator
                  src="/assets/chapter1/p08_panel04.webp"
                  alt="Close-up of the girl with raven hair smoking by the party window"
                  character="girl"
                  activeSpeaker={activeSpeaker}
                  reducedMotion={reducedMotion}
                  subtleMotion="float"
                  onInspect={onInspectPanel}
                />
                <CharacterAnimator
                  src="/assets/chapter1/p08_panel05.webp"
                  alt="Dhiraj speaking about patriarchal power equations while she gazes past him"
                  character="dhiraj"
                  activeSpeaker={activeSpeaker}
                  reducedMotion={reducedMotion}
                  subtleMotion="breathe"
                  onInspect={onInspectPanel}
                />
              </div>

              <div ref={closeupRef} className="relative pt-2 space-y-6">
                <CharacterAnimator
                  src="/assets/chapter1/p08_panel06.webp"
                  alt="Close-up of the girl's eyes reflecting distant Mumbai city lights through curling cigarette smoke"
                  character="girl"
                  activeSpeaker={activeSpeaker}
                  reducedMotion={reducedMotion}
                  subtleMotion="breathe"
                  onInspect={onInspectPanel}
                  inspectNote="Notice how Andrade reflects the neon horizon directly across her iris while cigarette smoke separates her from the room."
                />
                <InteractiveHotspot
                  id="party-window-sill"
                  label="Character Detail"
                  title="The Sixth-Floor Window Sill"
                  body="Everyone else in the apartment remembers the music, the plastic cups, and Dhiraj's film thesis. Only the girl sat on the narrow outer stone ledge—balanced between laughter behind her and a two-story drop into dusk."
                  detailNote="Visual Motif: Magenta twilight glow framing a precarious threshold."
                  accentColor="#e66c8b"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
  );
};
