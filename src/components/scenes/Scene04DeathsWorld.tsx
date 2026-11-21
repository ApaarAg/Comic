<<<<<<< HEAD
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene04DeathsWorld.tsx
 *
 * Storyverse 3.0: Pinned Cinematic Viewport Stage for Scene 04 (Death's World)
 *
 * Choreographs the surreal corporate celestial hierarchy of the Silvered Tower:
 * elevator descent, Agni's greeting, and God's polite, devastating dismissal of Death.
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

gsap.registerPlugin(ScrollTrigger);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74

interface SceneProps {
  reducedMotion: boolean;
  activeSceneIndex: number;
  onInspectPanel: (panel: InspectedPanelData) => void;
  onSkipNextScene?: () => void;
}

export const Scene04DeathsWorld: React.FC<SceneProps> = ({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
<<<<<<< HEAD
  return (
    <CinematicViewportStage
      sceneId="scene-04"
      reducedMotion={reducedMotion}
      trackHeightVh={420}
      className="relative z-20"
      midgroundLayer={
        <SceneVideoBackdrop
          sceneId="scene-04"
          sceneIndex={3}
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
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#8ad3eb]">
                Scene 04 · Beyond Mortal Clouds
              </span>
              <h2 className="font-display text-2xl font-bold text-[#f5f8fc] sm:text-3xl">
                The Silvered Tower
              </h2>
            </div>

            {/* Active Panel Display */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px]">
              {/* Beat 1: The Silvered Tower Exterior (Panel 01) */}
              {stageProgress < 0.12 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p09_panel01.webp"
                    alt="A slender golden-lit Silvered Tower rising through pastel pink and blue clouds"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="Far above mortal clouds, the Silvered Tower pierced an endless twilight."
                  />
                </div>
              )}

              {/* Beat 2: Elevator Arrival & Hold the Door! (Panels 02 & 03) */}
              {stageProgress >= 0.12 && stageProgress < 0.24 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                  <CharacterAnimator
                    src="/assets/chapter1/p09_panel02.webp"
                    alt="Blue ringed hand reaching between closing crimson elevator doors: Hold the door!"
                    character="death"
                    activeSpeaker="death"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                  />
                  <ComicPanel
                    src="/assets/chapter1/p09_panel03.webp"
                    alt="Crowded surreal elevator of strange spirits and Death clutching her pink file"
                    isActive={true}
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Beat 3: Agni Greets Death (Panel 10_01) */}
              {stageProgress >= 0.24 && stageProgress < 0.35 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p10_panel01.webp"
                    alt="Agni guiding Death along the glass corridor toward the corner office"
                    character="agni"
                    activeSpeaker="agni"
                    reducedMotion={reducedMotion}
                    subtleMotion="breathe"
                    onInspect={onInspectPanel}
                    inspectNote="This way, please. He is expecting you."
                  />
                </div>
              )}

              {/* Beat 4: God Offers a Seat (Panel 10_03) */}
              {stageProgress >= 0.35 && stageProgress < 0.44 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p10_panel03.webp"
                    alt="God sitting behind a massive teak desk welcoming Death"
                    character="god"
                    activeSpeaker="god"
                    reducedMotion={reducedMotion}
                    subtleMotion="breathe"
                    onInspect={onInspectPanel}
                    inspectNote="Come, come. Have a seat."
                  />
                </div>
              )}

              {/* Beat 5: God Inquiring Hobbies (Panel 10_05) */}
              {stageProgress >= 0.44 && stageProgress < 0.52 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p10_panel05.webp"
                    alt="God casually leaning back asking about work, life, friendships, hobbies"
                    character="god"
                    activeSpeaker="god"
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                    inspectNote="So, Death... tell me, how're things?"
                  />
                </div>
              )}

              {/* Beat 6: Death Puzzled (Panel 10_07) */}
              {stageProgress >= 0.52 && stageProgress < 0.60 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p10_panel07.webp"
                    alt="Death looking perplexed clutching her folder: W-what am I doing here, Sir?"
                    character="death"
                    activeSpeaker="death"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Beat 7: Eternity Exchange (Panels 11_01 & 11_03) */}
              {stageProgress >= 0.60 && stageProgress < 0.74 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                  <CharacterAnimator
                    src="/assets/chapter1/p11_panel01.webp"
                    alt="God smiling gently: Feels like an eternity, doesn't it?"
                    character="god"
                    activeSpeaker="god"
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                  />
                  <CharacterAnimator
                    src="/assets/chapter1/p11_panel03.webp"
                    alt="Death answering earnestly: I have actually been here for an eternity."
                    character="death"
                    activeSpeaker="death"
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Beat 8: The Bombshell — Fired! (Panel 11_05) */}
              {stageProgress >= 0.74 && stageProgress < 0.83 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p11_panel05.webp"
                    alt="God delivering the news: Yes, Death. I'm afraid we're letting you go."
                    character="god"
                    activeSpeaker="god"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                    inspectNote="Yes, Death. I'm afraid we're letting you go."
                  />
                </div>
              )}

              {/* Beat 9: Death's Outrage & Corporate Defense (Panels 12_01, 12_04, 12_06) */}
              {stageProgress >= 0.83 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  {stageProgress < 0.90 ? (
                    <CharacterAnimator
                      src="/assets/chapter1/p12_panel01.webp"
                      alt="Death shouting in furious disbelief: WHAT?! Send down a plague!"
                      character="death"
                      activeSpeaker="death"
                      reducedMotion={reducedMotion}
                      subtleMotion="pulse"
                      onInspect={onInspectPanel}
                      inspectNote="I'm an absolute consequence. It's in the job description!"
                    />
                  ) : stageProgress < 0.95 ? (
                    <CharacterAnimator
                      src="/assets/chapter1/p12_panel04.webp"
                      alt="God shrugging defensively: You know how corporate feels about that kind of stuff."
                      character="god"
                      activeSpeaker="god"
                      reducedMotion={reducedMotion}
                      onInspect={onInspectPanel}
                    />
                  ) : (
                    <CharacterAnimator
                      src="/assets/chapter1/p12_panel06.webp"
                      alt="Death devastated: This is all I've ever done. What am I supposed to do?"
                      character="death"
                      activeSpeaker="death"
                      reducedMotion={reducedMotion}
                      subtleMotion="breathe"
                      onInspect={onInspectPanel}
                    />
                  )}
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
          id="celestial-elevator"
          label="Corporate Cosmos"
          title="The Silvered Tower Bureaucracy"
          body="In the high realms, mortality is not an tragedy—it is an administrative division. When human ingenuity creates a cure for death, the entire department is declared redundant."
          accentColor="#8ad3eb"
        />
      </div>
    </CinematicViewportStage>
=======
  const sectionRef = useRef<HTMLElement>(null);
  const towerRef = useRef<HTMLDivElement>(null);
  const elevatorStageRef = useRef<HTMLDivElement>(null);
  const officeStageRef = useRef<HTMLDivElement>(null);
  const [elevatorSpeaker, setElevatorSpeaker] = useState<CharacterId | null>('death');
  const [officeSpeaker, setOfficeSpeaker] = useState<CharacterId | null>('god');

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (!reducedMotion && towerRef.current) {
        gsap.fromTo(
          towerRef.current,
          { y: 18 },
          {
            y: -12,
            ease: 'none',
            scrollTrigger: {
              trigger: towerRef.current,
              start: 'top 90%',
              end: 'bottom 20%',
              scrub: true,
            },
          },
        );
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 42%',
        once: true,
        onEnter: () => soundscape.triggerCue('ding'),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="scene-04"
      ref={sectionRef}
      aria-label="Scene 4: Death's World"
      className="relative overflow-x-clip bg-gradient-to-b from-[#16283d] via-[#1c3853] to-[#233554] py-24 md:py-36"
    >
      <SceneVideoBackdrop
        sceneId="scene-04"
        sceneIndex={3}
        activeSceneIndex={activeSceneIndex}
        reducedMotion={reducedMotion}
        scrubTriggerRef={sectionRef}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        {/* Dramatic Surreal Palette Shift Header */}
        <div className="mb-14 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#8ad3eb]">
            Scene 04 · Beyond Mortal Clouds
          </p>
          <h2 className="font-display mt-3 text-4xl font-semibold text-[#f5f8fc] sm:text-6xl">
            The Silvered Tower
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#d7e6f5]/85 sm:text-base">
            And that very evening in a high place, far beyond mortal clouds...
            Death was taking an elevator to the top floor.
          </p>
        </div>

        {/* Celestial Horizon & Tower */}
        <div ref={towerRef} className="mb-12">
          <ComicPanel
            src="/assets/chapter1/p09_panel01.webp"
            alt="A slender golden-lit Silvered Tower rising through pastel pink and blue clouds"
            onInspect={onInspectPanel}
          />
        </div>

        {/* Elevator Doors -> Agni -> Purveyor Arrival Stage */}
        <div ref={elevatorStageRef} className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start mb-16">
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <DialogueController
              sequenceId="seq-04-elevator"
              reducedMotion={reducedMotion}
              scrollStageRef={elevatorStageRef}
              onActiveSpeakerChange={(speaker) => setElevatorSpeaker(speaker)}
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <CharacterAnimator
                src="/assets/chapter1/p09_panel02.webp"
                alt="Blue ringed hand reaching between closing crimson elevator doors: Hold the door!"
                character="death"
                activeSpeaker={elevatorSpeaker}
                reducedMotion={reducedMotion}
                subtleMotion="pulse"
                onInspect={onInspectPanel}
              />
              <CharacterAnimator
                src="/assets/chapter1/p09_panel04.webp"
                alt="Six-armed blue Goddess of Death checking her lipstick in a compact mirror"
                character="death"
                activeSpeaker={elevatorSpeaker}
                reducedMotion={reducedMotion}
                subtleMotion="breathe"
                onInspect={onInspectPanel}
              />
            </div>

            <ComicPanel
              src="/assets/chapter1/p09_panel03.webp"
              alt="Crowded surreal elevator of strange spirits and Death clutching her pink file"
              onInspect={onInspectPanel}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <ComicPanel
                src="/assets/chapter1/p10_panel01.webp"
                alt="Elevator doors opening with a sharp DING!"
                onInspect={onInspectPanel}
              />
              <ComicPanel
                src="/assets/chapter1/p10_panel02.webp"
                alt="Death striding across the luminous sky-blue corridor"
                onInspect={onInspectPanel}
              />
              <CharacterAnimator
                src="/assets/chapter1/p10_panel03.webp"
                alt="Agni with flame hair waiting in a bowtie: This way please"
                character="agni"
                activeSpeaker={elevatorSpeaker}
                reducedMotion={reducedMotion}
                subtleMotion="float"
                onInspect={onInspectPanel}
              />
            </div>

            <ComicPanel
              src="/assets/chapter1/p10_panel04.webp"
              alt="Expansive minimalist office floating in blue sky with the Three-Headed God standing by the glass"
              onInspect={onInspectPanel}
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <CharacterAnimator
                src="/assets/chapter1/p10_panel06.webp"
                alt="Agni introducing Death for the morning meeting"
                character="agni"
                activeSpeaker={elevatorSpeaker}
                reducedMotion={reducedMotion}
                onInspect={onInspectPanel}
              />
              <CharacterAnimator
                src="/assets/chapter1/p10_panel07.webp"
                alt="The Three-Headed God welcoming Death: Come, come. Have a seat."
                character="god"
                activeSpeaker={elevatorSpeaker}
                reducedMotion={reducedMotion}
                onInspect={onInspectPanel}
              />
              <ComicPanel
                src="/assets/chapter1/p10_panel08.webp"
                alt="Agni bowing quietly: Very good, Sir."
                onInspect={onInspectPanel}
              />
            </div>
          </div>
        </div>

        {/* Scroll-Driven Multi-Speaker Termination Stage (Purveyor & Death) */}
        <div
          ref={officeStageRef}
          data-testid="scene-04-termination-stage"
          className="grid grid-cols-1 gap-8 border-t border-white/12 pt-12 lg:grid-cols-12 lg:items-start"
        >
          <div className="lg:col-span-7 space-y-8">
            <CharacterAnimator
              src="/assets/chapter1/p11_panel01.webp"
              alt="Death seated across the desk from the Three-Headed God"
              character="god"
              activeSpeaker={officeSpeaker}
              reducedMotion={reducedMotion}
              subtleMotion="breathe"
              onInspect={onInspectPanel}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <CharacterAnimator
                src="/assets/chapter1/p11_panel02.webp"
                alt="Close-up of Death staring suspiciously across the desk"
                character="death"
                activeSpeaker={officeSpeaker}
                reducedMotion={reducedMotion}
                subtleMotion="breathe"
                onInspect={onInspectPanel}
              />
              <CharacterAnimator
                src="/assets/chapter1/p11_panel03.webp"
                alt="The Three-Headed God tapping his fingers lightly: TAP TAP TAP"
                character="god"
                activeSpeaker={officeSpeaker}
                reducedMotion={reducedMotion}
                subtleMotion="pulse"
                onInspect={onInspectPanel}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5">
                <InteractiveHotspot
                  id="prophecy-file"
                  label="Interactive Artifact · Page 64"
                  title="Open Death's Termination File"
                  body="“On the twelfth day of the twelfth month, shall he be born unto man, the child who shall bring eternal life.” Because Darius Shah will invent immortality within one mortal lifetime, cosmic management deems Death's department redundant—effective tonight."
                  detailNote="Classification: Department of Inevitable Ends · Status: Severance Pending."
                  accentColor="#e57b98"
                />
              </div>
              <div className="md:col-span-7">
                <CharacterAnimator
                  src="/assets/chapter1/p11_panel05.webp"
                  alt="The Three-Headed God delivering the news: What a pity, then..."
                  character="god"
                  activeSpeaker={officeSpeaker}
                  reducedMotion={reducedMotion}
                  onInspect={onInspectPanel}
                />
              </div>
            </div>

            {/* Her Outrage & The Prophecy File */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 pt-2">
              <CharacterAnimator
                src="/assets/chapter1/p12_panel01.webp"
                alt="Death slamming her hands onto the desk shouting WHAT?!"
                character="death"
                activeSpeaker={officeSpeaker}
                reducedMotion={reducedMotion}
                subtleMotion="pulse"
                onInspect={onInspectPanel}
              />
              <ComicPanel
                src="/assets/chapter1/p12_panel02.webp"
                alt="The God opening a dark blue prophecy file"
                onInspect={onInspectPanel}
              />
              <CharacterAnimator
                src="/assets/chapter1/p12_panel03.webp"
                alt="Death furious: I'm an absolute consequence. It's in the job description."
                character="death"
                activeSpeaker={officeSpeaker}
                reducedMotion={reducedMotion}
                onInspect={onInspectPanel}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-center">
              <div className="sm:col-span-7">
                <ComicPanel
                  src="/assets/chapter1/p12_panel04.webp"
                  alt="Mrs. Shah entering the hospital in a wheelchair as the prophecy reads over the scene"
                  onInspect={onInspectPanel}
                />
              </div>
              <div className="sm:col-span-5">
                <div className="story-caption p-5">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-[#7a3f54]">
                    Page 64 of the File
                  </p>
                  <p className="font-display mt-2 text-lg italic leading-snug">
                    &ldquo;On the twelfth day of the twelfth month, shall he be born unto man, the child who shall bring eternal life.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <ComicPanel
                src="/assets/chapter1/p12_panel05.webp"
                alt="Death throwing up all six arms: Send down a plague! Strike the child with lightning!"
                onInspect={onInspectPanel}
              />
              <ComicPanel
                src="/assets/chapter1/p12_panel06.webp"
                alt="The Three-Headed God calmly declining: You know how corporate feels about that kind of stuff."
                onInspect={onInspectPanel}
              />
              <CharacterAnimator
                src="/assets/chapter1/p12_panel07.webp"
                alt="Death quiet and devastated: This is all I've ever done. What am I supposed to do?"
                character="death"
                activeSpeaker={officeSpeaker}
                reducedMotion={reducedMotion}
                subtleMotion="breathe"
                onInspect={onInspectPanel}
              />
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <DialogueController
              sequenceId="seq-04-termination"
              reducedMotion={reducedMotion}
              scrollStageRef={officeStageRef}
              onActiveSpeakerChange={(speaker) => setOfficeSpeaker(speaker)}
              onSkipNextScene={onSkipNextScene}
            />
          </div>
        </div>
      </div>
    </section>
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
  );
};
