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
import { useOptionalNarrative } from '../../narrative/NarrativeEngine';

gsap.registerPlugin(ScrollTrigger);

interface SceneProps {
  reducedMotion: boolean;
  activeSceneIndex: number;
  onInspectPanel: (panel: InspectedPanelData) => void;
  onSkipNextScene?: () => void;
}

export const Scene07Hospital: React.FC<SceneProps> = ({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const wakeRef = useRef<HTMLDivElement>(null);
  const awakeningStageRef = useRef<HTMLDivElement>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<CharacterId | null>('laila');

  const narrative = useOptionalNarrative();
  const isSceneActive = narrative?.activeBeat?.sceneId === 'scene-07';
  const choreography = isSceneActive ? narrative?.activeVisualChoreography : null;

  useEffect(() => {
    if (!sectionRef.current) return;
    const pacing = getScenePacingProfile('clinical');
    const ctx = gsap.context(() => {
      if (!reducedMotion && wakeRef.current) {
        gsap.fromTo(
          wakeRef.current,
          { opacity: 0.65, scale: 0.97 },
          {
            opacity: 1,
            scale: 1,
            ease: pacing.ease,
            scrollTrigger: {
              trigger: wakeRef.current,
              start: 'top 82%',
              end: 'top 35%',
              scrub: pacing.duration,
            },
          },
        );
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 35%',
        once: true,
        onEnter: () => soundscape.triggerCue('flatline'),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="scene-07"
      ref={sectionRef}
      aria-label="Scene 7: The Hospital"
      className="relative overflow-x-clip bg-gradient-to-b from-[#0c1522] via-[#101c2d] to-[#181426] py-24 md:py-32"
    >
      <SceneVideoBackdrop
        sceneId="scene-07"
        sceneIndex={6}
        activeSceneIndex={activeSceneIndex}
        reducedMotion={reducedMotion}
        scrubTriggerRef={sectionRef}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[#6dc4e0]">
              Scene 07 · Amravati Hospital · 10:08 PM — 10:32 PM
            </p>
            <h2 className="font-display mt-2 text-4xl font-semibold text-[#ebf3f9] sm:text-5xl">
              The Hospital
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#c6dae9]/80">
            Clinging yet to the edge of her life, the girl who fell from the party was rushed through sirens and flashing lights.
          </p>
        </div>

        {/* Restrained Clinical Sequence */}
        <div className="space-y-8">
          <ComicPanel
            src="/assets/chapter1/p16_panel01.webp"
            alt="Ambulance arriving at the glowing hospital entrance at night"
            onInspect={onInspectPanel}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <ComicPanel
                src="/assets/chapter1/p16_panel02.webp"
                alt="Doctors intubating and sedating the girl in the emergency bay"
                onInspect={onInspectPanel}
              />
              <p className="text-sm text-[#cfe0ee]/80">
                They gave her fentanyl and etomidate and rocuronium. They sedated her, intubated her, and defibrillated her.
              </p>
            </div>
            <div className="space-y-3">
              <ComicPanel
                src="/assets/chapter1/p16_panel03.webp"
                alt="Medical team charging defibrillator paddles over her chest"
                onInspect={onInspectPanel}
              />
              <p className="text-sm text-[#cfe0ee]/80">
                They charged the paddles all the way up and jolted her full of electricity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <ComicPanel
                src="/assets/chapter1/p16_panel04.webp"
                alt="Sheet pulled gently over the girl's pale face at eight minutes past ten"
                onInspect={onInspectPanel}
              />
            </div>
            <div className="lg:col-span-5">
              <div className="story-caption-dark p-6">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#6dc4e0]">
                  10:08 PM
                </p>
                <p className="font-display mt-2 text-2xl leading-snug text-[#eef6fc]">
                  &ldquo;Then at eight minutes past ten, they declared her dead and walked out of the room.&rdquo;
                </p>
              </div>
            </div>
          </div>

          <ComicPanel
            src="/assets/chapter1/p16_panel05.webp"
            alt="Party friends standing in the hospital corridor learning the girl was an orphan"
            onInspect={onInspectPanel}
          />

          {/* The Awakening — 24 Minutes Later + Sequential Conversation with Munmun */}
          <div ref={wakeRef} className="pt-8 space-y-6 border-t border-white/10">
            <CharacterAnimator
              src="/assets/chapter1/p17_panel02.webp"
              alt="Wide turquoise eyes snapping open in the dark: GAAAAAAH!!"
              character="laila"
              activeSpeaker={activeSpeaker}
              reducedMotion={reducedMotion}
              subtleMotion="pulse"
              onInspect={onInspectPanel}
            />

            <div
              ref={awakeningStageRef}
              className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start"
              style={{
                transform: choreography?.cameraZoom ? `scale(${choreography.cameraZoom})` : undefined,
                transition: 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div className="lg:col-span-5 lg:sticky lg:top-32">
                <DialogueController
                  sequenceId="seq-07-awakening"
                  reducedMotion={reducedMotion}
                  scrollStageRef={awakeningStageRef}
                  onActiveSpeakerChange={(speaker) => setActiveSpeaker(speaker)}
                  onSkipNextScene={onSkipNextScene}
                />
              </div>

              <div className="lg:col-span-7 space-y-6">
                <CharacterAnimator
                  src="/assets/chapter1/p17_panel03.webp"
                  alt="Laila collapsing onto the hospital floor gasping for breath"
                  character="laila"
                  activeSpeaker={activeSpeaker}
                  reducedMotion={reducedMotion}
                  subtleMotion="breathe"
                  onInspect={onInspectPanel}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <CharacterAnimator
                    src="/assets/chapter1/p17_panel04.webp"
                    alt="Laila glaring out from shadow clutching a syringe: Who're you?"
                    character="laila"
                    activeSpeaker={activeSpeaker}
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                  />
                  <CharacterAnimator
                    src="/assets/chapter1/p18_panel01.webp"
                    alt="Translucent glowing blue ghost girl floating: I-I'm a ghost!"
                    character="munmun"
                    activeSpeaker={activeSpeaker}
                    reducedMotion={reducedMotion}
                    subtleMotion="spectral"
                    onInspect={onInspectPanel}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:items-start">
                  <CharacterAnimator
                    src="/assets/chapter1/p18_panel05.webp"
                    alt="Laila reflected in the hospital window beside Munmun: It's on your wrist."
                    character="munmun"
                    activeSpeaker={activeSpeaker}
                    reducedMotion={reducedMotion}
                    subtleMotion="spectral"
                    onInspect={onInspectPanel}
                  />
                  <CharacterAnimator
                    src="/assets/chapter1/p18_panel06.webp"
                    alt="Laila reading the patient band on her wrist: L-Laila Starr..."
                    character="laila"
                    activeSpeaker={activeSpeaker}
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                  />
                </div>

                <InteractiveHotspot
                  id="hospital-wristband"
                  label="Patient Record · Ward 03"
                  title="Inspect Hospital Admission Wristband"
                  body="NAME: LAILA STARR · AGE: 21 · ORPHAN (NO NEXT OF KIN) · PRONOUNCED DECEASED: 22:08 HRS. For an eternal god who never owned a name, four crisp ink letters on vinyl tape become her first human identity."
                  accentColor="#6dc4e0"
                />

                <ComicPanel
                  src="/assets/chapter1/p18_panel07.webp"
                  alt="Hospital staff approaching outside the glass as Munmun warns: So... what next, Laila Starr?"
                  onInspect={onInspectPanel}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
