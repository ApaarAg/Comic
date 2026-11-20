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
  );
};
