import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RotateCcw } from 'lucide-react';
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
  onReplayChapter: () => void;
  onReplayPrologue?: () => void;
  onInspectPanel: (panel: InspectedPanelData) => void;
}

export const Scene10EightYearsLater: React.FC<SceneProps> = ({
  reducedMotion,
  activeSceneIndex,
  onReplayChapter,
  onReplayPrologue,
  onInspectPanel,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const pranahStageRef = useRef<HTMLDivElement>(null);
  const balconyRef = useRef<HTMLDivElement>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<CharacterId | null>('pranah');

  const narrative = useOptionalNarrative();
  const isSceneActive = narrative?.activeBeat?.sceneId === 'scene-10';
  const choreography = isSceneActive ? narrative?.activeVisualChoreography : null;

  useEffect(() => {
    if (!sectionRef.current) return;
    const pacing = getScenePacingProfile('dawn');
    const ctx = gsap.context(() => {
      if (!reducedMotion && balconyRef.current) {
        gsap.fromTo(
          balconyRef.current,
          { scale: 1.04, opacity: 0.85 },
          {
            scale: 1,
            opacity: 1,
            ease: pacing.ease,
            scrollTrigger: {
              trigger: balconyRef.current,
              start: 'top 80%',
              end: 'top 25%',
              scrub: pacing.duration,
            },
          },
        );
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 45%',
        once: true,
        onEnter: () => soundscape.triggerCue('discover'),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="scene-10"
      ref={sectionRef}
      aria-label="Scene 10: Eight Years Later"
      className="relative overflow-x-clip bg-gradient-to-b from-[#171c26] via-[#21242d] to-[#131722] pt-24 pb-32 md:pt-32 md:pb-40"
    >
      <SceneVideoBackdrop
        sceneId="scene-10"
        sceneIndex={9}
        activeSceneIndex={activeSceneIndex}
        reducedMotion={reducedMotion}
        scrubTriggerRef={sectionRef}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        {/* Reflective Morning Mist Header */}
        <div className="mb-14 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#f2a866]">
            Scene 10 · Epilogue
          </p>
          <h2 className="font-display mt-3 text-4xl font-semibold text-[#faf4ea] sm:text-6xl">
            Eight Years Later
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#ddd4c7]/80 sm:text-base">
            It was all over the newspapers for a while. The girl who died and lived and died again.
            Soon, no one thought about Laila Starr.
          </p>
        </div>

        {/* Quiet Morning Mumbai & Pranah's Vigil */}
        <div className="space-y-8 mb-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ComicPanel
              src="/assets/chapter1/p25_panel01.webp"
              alt="The Gateway of India in pale pastel dawn mist"
              onInspect={onInspectPanel}
            />
            <ComicPanel
              src="/assets/chapter1/p25_panel02.webp"
              alt="Quiet Mumbai street at morning with a lone cyclist and milk truck"
              onInspect={onInspectPanel}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <CharacterAnimator
                src="/assets/chapter1/p25_panel04.webp"
                alt="Pranah, God of Life, watching Laila sleep through the curling steam of his morning tea"
                character="pranah"
                activeSpeaker={activeSpeaker}
                reducedMotion={reducedMotion}
                subtleMotion="breathe"
                onInspect={onInspectPanel}
              />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="story-caption p-6">
                <p className="font-display text-xl italic leading-snug">
                  &ldquo;No one but me, that is... as I watched through the curling steam of my morning tea. The girl with raven hair, who was also Death and meant the world to me.&rdquo;
                </p>
              </div>
              <InteractiveHotspot
                id="pranah-tea"
                label="Morning Ritual"
                title="Pranah's Steaming Cup of Chai"
                body="Just as Death sits opposite mortal endings, Pranah—God of Life—opens the morning beside Laila Starr's sunlit bed. Eight years pass in a single breath, yet Darius Shah is no longer an infant."
                accentColor="#f2a866"
                onActivate={() => soundscape.triggerCue('discover')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ComicPanel
              src="/assets/chapter1/p25_panel05.webp"
              alt="Laila Starr sleeping peacefully bathed in warm amber morning light"
              onInspect={onInspectPanel}
            />
            <CharacterAnimator
              src="/assets/chapter1/p25_panel06.webp"
              alt="Laila opening her eyes drowsily: Have you been standing there watching me sleep this whole time?"
              character="laila"
              activeSpeaker={activeSpeaker}
              reducedMotion={reducedMotion}
              onInspect={onInspectPanel}
            />
          </div>
        </div>

        {/* Morning Awakening & Scroll-Driven Conversation with Pranah */}
        <div
          ref={pranahStageRef}
          className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start mb-20"
          style={{
            transform: choreography?.cameraZoom ? `scale(${choreography.cameraZoom})` : undefined,
            transition: 'transform 900ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="lg:col-span-7 space-y-8">
            <ComicPanel
              src="/assets/chapter1/p26_panel01.webp"
              alt="Laila sitting up on the bed looking toward Pranah standing on the sunlit terrace"
              onInspect={onInspectPanel}
            />

            <ComicPanel
              src="/assets/chapter1/p26_panel02.webp"
              alt="Laila rubbing her temples: Ugggh... what happened? How did I get here?"
              onInspect={onInspectPanel}
            />

            {/* Filipe Andrade's Deliberate Grounding Sequence: Hands, Feet & Morning Tea */}
            <div className="grid grid-cols-2 gap-4">
              <CharacterAnimator
                src="/assets/chapter1/p26_panel03.webp"
                alt="Pranah looking back calmly: You died."
                character="pranah"
                activeSpeaker={activeSpeaker}
                reducedMotion={reducedMotion}
                onInspect={onInspectPanel}
              />
              <ComicPanel
                src="/assets/chapter1/p26_panel04.webp"
                alt="Laila's bare feet touching the woven morning rug: Run over by a twelve-wheeler."
                onInspect={onInspectPanel}
              />
              <CharacterAnimator
                src="/assets/chapter1/p26_panel05.webp"
                alt="Pranah sipping from his teacup: But I brought you back."
                character="pranah"
                activeSpeaker={activeSpeaker}
                reducedMotion={reducedMotion}
                onInspect={onInspectPanel}
              />
              <ComicPanel
                src="/assets/chapter1/p26_panel06.webp"
                alt="Laila's feet stepping onto the sunlit floor: I couldn't do it, Pran."
                onInspect={onInspectPanel}
              />
            </div>

            <CharacterAnimator
              src="/assets/chapter1/p26_panel07.webp"
              alt="Pranah holding his blue teacup as Laila steps out onto the veranda"
              character="pranah"
              activeSpeaker={activeSpeaker}
              reducedMotion={reducedMotion}
              subtleMotion="breathe"
              onInspect={onInspectPanel}
            />

            {/* Final Serene Harbour Composition */}
            <div ref={balconyRef} className="space-y-8">
              <ComicPanel
                src="/assets/chapter1/p27_panel01.webp"
                alt="Pranah and Laila standing on a sunlit Mumbai balcony overlooking the sea and skyline"
                onInspect={onInspectPanel}
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-center">
                <div className="sm:col-span-7">
                  <CharacterAnimator
                    src="/assets/chapter1/p27_panel02.webp"
                    alt="Laila sipping warm tea with wide reflective eyes: ...he's not a baby anymore."
                    character="laila"
                    activeSpeaker={activeSpeaker}
                    reducedMotion={reducedMotion}
                    subtleMotion="breathe"
                    onInspect={onInspectPanel}
                  />
                </div>
                <div className="sm:col-span-5">
                  <div className="border border-[#f2a866]/30 bg-[#121622]/90 p-6 text-center">
                    <p className="font-display text-lg italic text-[#e5dccf]/85">
                      Eight years from the day
                    </p>
                    <p className="font-display mt-1 text-3xl font-bold tracking-wide text-[#faf4ea]">
                      LAILA STARR
                    </p>
                    <p className="font-display mt-1 text-lg italic text-[#f2a866]">
                      died (twice).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <DialogueController
              sequenceId="seq-10-pranah"
              reducedMotion={reducedMotion}
              scrollStageRef={pranahStageRef}
              onActiveSpeakerChange={(speaker) => setActiveSpeaker(speaker)}
            />
          </div>
        </div>

        {/* Quiet Closing Reflection & Replay */}
        <footer className="mt-24 border-t border-white/10 pt-14 text-center">
          <img
            src="/assets/chapter1/ch1_tea_sketch.webp"
            alt="Ink line illustration of Laila Starr sipping tea"
            loading="lazy"
            referrerPolicy="no-referrer"
            className="mx-auto mb-8 h-44 w-auto object-contain opacity-85 invert mix-blend-screen select-none"
          />
          <p className="font-mono text-xs uppercase tracking-[0.26em] text-[#f2a866]">
            End of Chapter One
          </p>
          <h3 className="font-display mt-3 text-3xl font-semibold text-[#faf4ea] sm:text-4xl">
            Once Upon a Falling Starr
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-[#cfc5b9]/70">
            The Many Deaths of Laila Starr · Created by Ram V &amp; Filipe Andrade · Colors by Inês Amaro · Letters by AndWorld Design
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onReplayChapter}
              className="inline-flex items-center gap-2.5 border border-white/20 bg-white/5 px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#faf4ea] transition-colors hover:border-[#f2a866] hover:text-[#f2a866] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2a866] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Return to Mumbai Sunset</span>
            </button>
            {onReplayPrologue && (
              <button
                type="button"
                onClick={onReplayPrologue}
                className="inline-flex items-center gap-2.5 border border-[#f2a866]/40 bg-[#f2a866]/10 px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#f2a866] transition-colors hover:bg-[#f2a866] hover:text-[#0b0d17] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2a866] cursor-pointer"
              >
                <span>Replay Prologue</span>
              </button>
            )}
          </div>
        </footer>
      </div>
    </section>
  );
};
