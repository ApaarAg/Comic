<<<<<<< HEAD
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene06LailaMortal.tsx
 *
 * Storyverse 3.0: Pinned Cinematic Viewport Stage for Scene 06 (Laila Mortal)
 *
 * Choreographs the forbidden bargain struck between Death and Agni,
 * followed by Death's lightning-streaked plunge from the celestial clouds into mortality.
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
import { soundscape } from '../../audio/soundscape';
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

export const Scene06LailaMortal: React.FC<SceneProps> = ({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
<<<<<<< HEAD
  return (
    <CinematicViewportStage
      sceneId="scene-06"
      reducedMotion={reducedMotion}
      trackHeightVh={360}
      className="relative z-20"
      midgroundLayer={
        <SceneVideoBackdrop
          sceneId="scene-06"
          sceneIndex={5}
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
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#63b8d6]">
                Scene 06 · The Forbidden Bargain
              </span>
              <h2 className="font-display text-2xl font-bold text-[#fbf5ee] sm:text-3xl">
                The Descent
              </h2>
            </div>

            {/* Stage Content */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px]">
              {/* Beat 1: Storm Clouds & Death Calling Agni (Panels 16_01 & 16_02) */}
              {stageProgress < 0.28 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                  <ComicPanel
                    src="/assets/chapter1/p16_panel01.webp"
                    alt="Lightning tearing through dark winter clouds"
                    isActive={true}
                    onInspect={onInspectPanel}
                  />
                  <CharacterAnimator
                    src="/assets/chapter1/p16_panel02.webp"
                    alt="Death turning back toward Agni: Agni?"
                    character="death"
                    activeSpeaker="death"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Beat 2: Agni Refusal & Reluctance (Panels 16_03 & 16_05) */}
              {stageProgress >= 0.28 && stageProgress < 0.55 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                  <CharacterAnimator
                    src="/assets/chapter1/p16_panel03.webp"
                    alt="Agni frowning: I know what you're thinking and the answer is no."
                    character="agni"
                    activeSpeaker="agni"
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                  />
                  <CharacterAnimator
                    src="/assets/chapter1/p16_panel05.webp"
                    alt="Agni sighing and relenting: Oh, fiiiine... fine, what do you want?"
                    character="agni"
                    activeSpeaker="agni"
                    reducedMotion={reducedMotion}
                    subtleMotion="breathe"
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Beat 3: The Deal & Mortal Consequences (Panels 17_01 & 17_03) */}
              {stageProgress >= 0.55 && stageProgress < 0.80 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                  <CharacterAnimator
                    src="/assets/chapter1/p17_panel01.webp"
                    alt="Death: When you send me down and give me a mortal body, can you put me close to the child?"
                    character="death"
                    activeSpeaker="death"
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                  />
                  <CharacterAnimator
                    src="/assets/chapter1/p17_panel03.webp"
                    alt="Death smiling with cold resolve: I'll be a mortal then. My actions. My consequences."
                    character="death"
                    activeSpeaker="death"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                    inspectNote="I'll be a mortal then. My actions. My consequences."
                  />
                </div>
              )}

              {/* Beat 4: Plunge into Mortal Flesh (Panel 17_04) */}
              {stageProgress >= 0.80 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p17_panel04.webp"
                    alt="Death plummeting through thunder and lightning down toward the hospital"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="A deal was being struck — the kind that bends the fabric of everything."
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
          id="descent-lightning"
          label="The Loophole"
          title="Agni's Complicity"
          body="As the god of fire and herald of crossings, Agni holds the keys to mortal passage. When Death asks to be placed beside the newborn child, he doesn't question her reasons—only warns of the mortal fragility she is accepting."
          accentColor="#63b8d6"
        />
      </div>
    </CinematicViewportStage>
=======
  const sectionRef = useRef<HTMLElement>(null);
  const bargainStageRef = useRef<HTMLDivElement>(null);
  const stormRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<HTMLDivElement>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<CharacterId | null>('death');

  useEffect(() => {
    if (!sectionRef.current) return;
    const pacing = getScenePacingProfile('descent');
    const ctx = gsap.context(() => {
      if (!reducedMotion && stormRef.current) {
        gsap.fromTo(
          stormRef.current,
          { opacity: 0.84, y: 14 },
          {
            opacity: 1,
            y: 0,
            ease: pacing.ease,
            scrollTrigger: {
              trigger: stormRef.current,
              start: 'top 80%',
              end: 'top 30%',
              scrub: pacing.duration * 0.65,
            },
          },
        );
      }

      if (!reducedMotion && transformRef.current) {
        gsap.fromTo(
          transformRef.current,
          { y: 28, opacity: 0.65, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            ease: pacing.ease,
            scrollTrigger: {
              trigger: transformRef.current,
              start: 'top 85%',
              end: 'top 30%',
              scrub: pacing.duration,
            },
          },
        );
      }

      ScrollTrigger.create({
        trigger: stormRef.current ?? sectionRef.current,
        start: 'top 55%',
        once: true,
        onEnter: () => soundscape.triggerCue('thunder'),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="scene-06"
      ref={sectionRef}
      aria-label="Scene 6: Laila Becomes Mortal"
      className="relative overflow-x-clip bg-gradient-to-b from-[#11162a] via-[#19203b] to-[#0c1522] py-24 md:py-32"
    >
      <SceneVideoBackdrop
        sceneId="scene-06"
        sceneIndex={5}
        activeSceneIndex={activeSceneIndex}
        reducedMotion={reducedMotion}
        scrubTriggerRef={sectionRef}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[#63b8d6]">
              Scene 06 · The Descent
            </p>
            <h2 className="font-display mt-2 text-4xl font-semibold text-[#f4f1f8] sm:text-5xl">
              Laila Becomes Mortal
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#d7dceb]/80">
            At the elevator back down, Death struck one final bargain with Agni.
          </p>
        </div>

        {/* Elevator Down + Scroll-Driven Bargain Dialogue */}
        <div
          ref={bargainStageRef}
          className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start mb-14"
        >
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ComicPanel
                src="/assets/chapter1/p14_panel01.webp"
                alt="Elevator panel glowing DOWN"
                onInspect={onInspectPanel}
              />
              <CharacterAnimator
                src="/assets/chapter1/p14_panel02.webp"
                alt="Death sniffling in the descending elevator"
                character="death"
                activeSpeaker={activeSpeaker}
                reducedMotion={reducedMotion}
                onInspect={onInspectPanel}
              />
              <CharacterAnimator
                src="/assets/chapter1/p14_panel03.webp"
                alt="Death calling out: Agni?"
                character="death"
                activeSpeaker={activeSpeaker}
                reducedMotion={reducedMotion}
                onInspect={onInspectPanel}
              />
              <CharacterAnimator
                src="/assets/chapter1/p14_panel04.webp"
                alt="Agni answering: I know what you're thinking and the answer is no."
                character="agni"
                activeSpeaker={activeSpeaker}
                reducedMotion={reducedMotion}
                onInspect={onInspectPanel}
              />
            </div>

            <CharacterAnimator
              src="/assets/chapter1/p14_panel05.webp"
              alt="Death lamenting the indignities of mortality in the elevator"
              character="death"
              activeSpeaker={activeSpeaker}
              reducedMotion={reducedMotion}
              subtleMotion="breathe"
              onInspect={onInspectPanel}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <CharacterAnimator
                src="/assets/chapter1/p15_panel01.webp"
                alt="Death leaning close to Agni to ask for the child's location"
                character="death"
                activeSpeaker={activeSpeaker}
                reducedMotion={reducedMotion}
                onInspect={onInspectPanel}
              />
              <CharacterAnimator
                src="/assets/chapter1/p15_panel02.webp"
                alt="Death replying: I'll be a mortal then. My actions. My consequences."
                character="death"
                activeSpeaker={activeSpeaker}
                reducedMotion={reducedMotion}
                onInspect={onInspectPanel}
              />
              <CharacterAnimator
                src="/assets/chapter1/p15_panel03.webp"
                alt="Close-up of Death's dark resolute eyes"
                character="death"
                activeSpeaker={activeSpeaker}
                reducedMotion={reducedMotion}
                subtleMotion="pulse"
                onInspect={onInspectPanel}
              />
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <DialogueController
              sequenceId="seq-06-bargain"
              reducedMotion={reducedMotion}
              scrollStageRef={bargainStageRef}
              onActiveSpeakerChange={(speaker) => setActiveSpeaker(speaker)}
              onSkipNextScene={onSkipNextScene}
            />
          </div>
        </div>

        {/* KRA-KOOM Storm Over Amravati Hospital */}
        <div ref={stormRef} className="mb-14 space-y-5">
          <ComicPanel
            src="/assets/chapter1/p15_panel05.webp"
            alt="Lightning tearing the night sky with KRA-KOOM over Amravati Hospital"
            onInspect={onInspectPanel}
          />
          <div className="mt-4 mx-auto max-w-xl text-center">
            <p className="font-display text-2xl italic text-[#dff0f9]">
              &ldquo;And so, as Death made her final bargain on her way out of the Ivory Tower...&rdquo;
            </p>
          </div>
        </div>

        {/* Ethereal Transformation Artwork + Interactive Soul Pact */}
        <div ref={transformRef} className="relative space-y-6">
          <CharacterAnimator
            src="/assets/chapter1/p17_panel01.webp"
            alt="Death's spirit descending into the broken mortal body of Laila Starr amidst glowing cosmic hues"
            subtleMotion="float"
            reducedMotion={reducedMotion}
            onInspect={onInspectPanel}
            inspectNote="Filipe Andrade dissolves Death's silhouette into luminous ribbons of cyan, violet, and magenta as her consciousness enters Laila Starr's still-warm body."
          />
          <InteractiveHotspot
            id="mortal-bargain"
            label="Cosmic Pact"
            title="The First Taste of Being Mortal"
            body="High gods cannot directly undo creation's balance sheet. By stepping out of the Silvered Tower into a corpse in Amravati Hospital, Death inherits human weakness—snot, heartbreak, bleeding knees—just for a chance to reach Darius in time."
            detailNote="Audio Cue: Triggered storm thunderclap over Amravati Hospital."
            accentColor="#63b8d6"
            onActivate={() => soundscape.triggerCue('thunder')}
          />
        </div>
      </div>
    </section>
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
  );
};
