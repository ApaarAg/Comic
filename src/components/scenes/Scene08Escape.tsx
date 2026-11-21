<<<<<<< HEAD
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene08Escape.tsx
 *
 * Storyverse 3.0: Pinned Cinematic Viewport Stage for Scene 08 (The Escape)
 *
 * Choreographs Laila holding baby Darius in the neo-natal ward, Munmun's desperate plea,
 * and the chaotic pursuit by hospital security guards through the rain.
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

export const Scene08Escape: React.FC<SceneProps> = ({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
<<<<<<< HEAD
  return (
    <CinematicViewportStage
      sceneId="scene-08"
      reducedMotion={reducedMotion}
      trackHeightVh={360}
      className="relative z-20"
      midgroundLayer={
        <SceneVideoBackdrop
          sceneId="scene-08"
          sceneIndex={7}
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
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#e89138]">
                Scene 08 · Neo-Natal Ward · 11:40 PM
              </span>
              <h2 className="font-display text-2xl font-bold text-[#fbf6ef] sm:text-3xl">
                The Escape
              </h2>
            </div>

            {/* Stage Content */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px]">
              {/* Beat 1: Munmun Pleading — He's Got a Name! (Panels 21_01 & 21_03) */}
              {stageProgress < 0.35 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p21_panel03.webp"
                    alt="Munmun pleading frantically with tears: His name is Darius! You can't kill someone with a name!"
                    character="munmun"
                    activeSpeaker="munmun"
                    reducedMotion={reducedMotion}
                    subtleMotion="spectral"
                    onInspect={onInspectPanel}
                    inspectNote="His name is Darius. He's got a name! You can't kill someone with a name!"
                  />
                </div>
              )}

              {/* Beat 2: Laila Holding Darius — I Can't! (Panel 22_02) */}
              {stageProgress >= 0.35 && stageProgress < 0.65 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p22_panel02.webp"
                    alt="Laila trembling holding baby Darius: What? W-why did you tell me that? I... I can't!"
                    character="laila"
                    activeSpeaker="laila"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                    inspectNote="I... I can't!"
                  />
                </div>
              )}

              {/* Beat 3: Security Guards Shouting & Corridor Sprint (Panels 23_03 & 24_01) */}
              {stageProgress >= 0.65 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                  <ComicPanel
                    src="/assets/chapter1/p23_panel03.webp"
                    alt="Security guards bursting through double doors shouting: There she is! Put that baby down!"
                    isActive={true}
                    onInspect={onInspectPanel}
                  />
                  <ComicPanel
                    src="/assets/chapter1/p24_panel01.webp"
                    alt="Laila running barefoot down the slick hospital stairs out into the rain"
                    isActive={true}
                    onInspect={onInspectPanel}
                    caption="Bare feet struck wet pavement just as midnight neared."
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
          id="escape-darius"
          label="The Moral Paradox"
          title="The Name of the Child"
          body="Death had killed trillions without flinching. But an abstraction with a name is no longer a demographic statistic—it is a person. The moment Munmun speaks the name 'Darius', Death's certainty shatters."
          accentColor="#e89138"
        />
      </div>
    </CinematicViewportStage>
=======
  const sectionRef = useRef<HTMLElement>(null);
  const graceStageRef = useRef<HTMLDivElement>(null);
  const chaseRef = useRef<HTMLDivElement>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<CharacterId | null>('munmun');

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !chaseRef.current) return;
    const pacing = getScenePacingProfile('chase');
    const ctx = gsap.context(() => {
      const panels = chaseRef.current!.querySelectorAll('[data-chase-panel]');
      panels.forEach((panel, i) => {
        gsap.fromTo(
          panel,
          { x: i % 2 === 0 ? -24 : 24, opacity: 0.72 },
          {
            x: 0,
            opacity: 1,
            ease: pacing.ease,
            scrollTrigger: {
              trigger: panel,
              start: 'top 88%',
              end: 'top 42%',
              scrub: pacing.duration,
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="scene-08"
      ref={sectionRef}
      aria-label="Scene 8: The Escape"
      className="relative overflow-x-clip bg-gradient-to-b from-[#181426] via-[#221a35] to-[#0a0b15] py-24 md:py-32"
    >
      <SceneVideoBackdrop
        sceneId="scene-08"
        sceneIndex={7}
        activeSceneIndex={activeSceneIndex}
        reducedMotion={reducedMotion}
        scrubTriggerRef={sectionRef}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[#e26f8d]">
              Scene 08 · Neo-Natal Room 7
            </p>
            <h2 className="font-display mt-2 text-4xl font-semibold text-[#f6f0f4] sm:text-5xl">
              The Escape
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#ded4e2]/80">
            &ldquo;I need to find a baby...&rdquo;
          </p>
        </div>

        {/* Neo-Natal Room 7 — The Moment of Grace */}
        <div className="space-y-8 mb-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ComicPanel
              src="/assets/chapter1/p19_panel06.webp"
              alt="Laila and Munmun standing before Neo-Natal Room 7"
              onInspect={onInspectPanel}
            />
            <ComicPanel
              src="/assets/chapter1/p20_panel02.webp"
              alt="Newborn Darius asleep inside his neonatal crib"
              onInspect={onInspectPanel}
            />
          </div>

          <div
            ref={graceStageRef}
            className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start"
          >
            <div className="lg:col-span-7 space-y-6">
              <CharacterAnimator
                src="/assets/chapter1/p20_panel03.webp"
                alt="Laila lifting baby Darius in her arms as Munmun whispers: His name is Darius."
                character="laila"
                activeSpeaker={activeSpeaker}
                reducedMotion={reducedMotion}
                subtleMotion="breathe"
                onInspect={onInspectPanel}
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <CharacterAnimator
                  src="/assets/chapter1/p21_panel01.webp"
                  alt="Laila holding Darius close while Munmun speaks of mortal grace"
                  character="munmun"
                  activeSpeaker={activeSpeaker}
                  reducedMotion={reducedMotion}
                  subtleMotion="spectral"
                  onInspect={onInspectPanel}
                />
                <CharacterAnimator
                  src="/assets/chapter1/p21_panel02.webp"
                  alt="Laila's eyes softening in grief and conflict: I... I can't!"
                  character="laila"
                  activeSpeaker={activeSpeaker}
                  reducedMotion={reducedMotion}
                  onInspect={onInspectPanel}
                />
              </div>

              <div className="mx-auto max-w-2xl text-center py-2">
                <p className="font-display text-2xl italic leading-snug text-[#f5eaf2] sm:text-3xl">
                  &ldquo;Amid the pain and despair and all the indignities of a dying body, there is a moment of grace.&rdquo;
                </p>
              </div>

              <InteractiveHotspot
                id="room7-grace"
                label="Unwritten Law"
                title="Why a Name Changes Everything"
                body="In the hospital corridor, Munmun reveals a quiet human truth to Death: as soon as you hold a newborn and learn his name is Darius, he stops being an entry in a prophecy file. For the first time in eternity, Death hesitates."
                accentColor="#e26f8d"
              />

              <ComicPanel
                src="/assets/chapter1/p21_panel03.webp"
                alt="Baby Darius letting out a piercing cry: WAAAAAAAH!"
                onInspect={onInspectPanel}
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <CharacterAnimator
                  src="/assets/chapter1/p21_panel04.webp"
                  alt="Hospital guards and doctors rushing in: There she is! Oh my God! She's alive!"
                  character="security"
                  activeSpeaker={activeSpeaker}
                  reducedMotion={reducedMotion}
                  onInspect={onInspectPanel}
                />
                <ComicPanel
                  src="/assets/chapter1/p21_panel05.webp"
                  alt="Laila turning in alarm as security shouts: Hey you! Put that baby down!"
                  onInspect={onInspectPanel}
                />
              </div>
            </div>

            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <DialogueController
                sequenceId="seq-08-grace"
                reducedMotion={reducedMotion}
                scrollStageRef={graceStageRef}
                onActiveSpeakerChange={(speaker) => setActiveSpeaker(speaker)}
                onSkipNextScene={onSkipNextScene}
              />
            </div>
          </div>
        </div>

        {/* Escalating Chase Through Hospital Wards */}
        <div ref={chaseRef} className="space-y-6 border-t border-white/10 pt-12">
          <div data-chase-panel>
            <ComicPanel
              src="/assets/chapter1/p22_panel01.webp"
              alt="Laila and Munmun dashing through hospital ward double doors"
              onInspect={onInspectPanel}
            />
          </div>
          <div data-chase-panel>
            <ComicPanel
              src="/assets/chapter1/p22_panel02.webp"
              alt="Laila sprinting down flights of hospital stairs ahead of the pursuing crowd"
              onInspect={onInspectPanel}
            />
          </div>
          <div data-chase-panel className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ComicPanel
              src="/assets/chapter1/p22_panel03.webp"
              alt="Shoving hospital carts, papers, and trays to slow down the mob"
              onInspect={onInspectPanel}
            />
            <ComicPanel
              src="/assets/chapter1/p22_panel04.webp"
              alt="Out of breath, Laila faces a security guard blocking the corridor"
              onInspect={onInspectPanel}
            />
          </div>
          <div data-chase-panel className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ComicPanel
              src="/assets/chapter1/p23_panel01.webp"
              alt="CLUNG! A metal tray slammed into the guard"
              onInspect={onInspectPanel}
            />
            <CharacterAnimator
              src="/assets/chapter1/p23_panel02.webp"
              alt="Nurse with glowing blue eyes momentarily possessed by Munmun"
              character="munmun"
              subtleMotion="spectral"
              reducedMotion={reducedMotion}
              onInspect={onInspectPanel}
            />
          </div>
          <div data-chase-panel className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <ComicPanel
                src="/assets/chapter1/p23_panel04.webp"
                alt="Laila racing down the dim hospital hallway toward the glowing red EXIT sign"
                onInspect={onInspectPanel}
              />
            </div>
            <div className="md:col-span-5 space-y-4">
              <ComicPanel
                src="/assets/chapter1/p23_panel05.webp"
                alt="Laila's hands bursting open the hospital exit doors into the night street"
                onInspect={onInspectPanel}
              />
              <div className="story-caption p-5">
                <p className="text-sm font-medium leading-relaxed">
                  &ldquo;And so it was that Laila Starr found herself running toward freedom.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
  );
};
