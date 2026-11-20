import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ComicPanel } from '../ComicPanel';
import { InteractiveHotspot } from '../InteractiveHotspot';
import { SceneVideoBackdrop } from '../SceneVideoBackdrop';
import { DialogueController } from '../DialogueController';
import { computeImpactZoom } from '../../story/scrollMath';
import { soundscape } from '../../audio/soundscape';
import { useOptionalNarrative } from '../../narrative/NarrativeEngine';
import type { InspectedPanelData } from '../PanelInspectorModal';

gsap.registerPlugin(ScrollTrigger);

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
  const sectionRef = useRef<HTMLElement>(null);
  const zoomStageRef = useRef<HTMLDivElement>(null);
  const [localProgress, setLocalProgress] = useState(0);

  const narrative = useOptionalNarrative();
  const isSceneActive = narrative?.activeBeat?.sceneId === 'scene-09';
  const choreography = isSceneActive ? narrative?.activeVisualChoreography : null;

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
  const baseScale = choreography?.cameraZoom ? scale * (choreography.cameraZoom / 1.05) : scale;
  const clampedScale = Math.min(1.14, baseScale);

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
  );
};
