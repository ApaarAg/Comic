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
  );
};
