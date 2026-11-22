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

interface SceneProps {
  reducedMotion: boolean;
  activeSceneIndex: number;
  onInspectPanel: (panel: InspectedPanelData) => void;
  onSkipNextScene?: () => void;
}

export const Scene06LailaMortal: React.FC<SceneProps> = React.memo(({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
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
          <div className="relative flex flex-col items-center justify-center w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl px-2 sm:px-6">
            {/* Standardized Glassmorphic Header Badge */}
            <div className="hidden sm:block absolute top-[max(5.25rem,calc(env(safe-area-inset-top,0px)+4.75rem))] left-6 md:left-10 z-30 pointer-events-none">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#63b8d6]/30 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#63b8d6] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#63b8d6]" />
                <span>Scene 06 · The Forbidden Bargain</span>
              </span>
              <h2 className="font-display mt-2 text-2xl font-bold text-[#fbf5ee] sm:text-3xl">
                The Descent
              </h2>
            </div>

            {/* Stage Content */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[780px] pt-12">
              {/* Beat 1a: Storm Clouds Establishing Shot (Panel 16_01) */}
              {stageProgress < 0.10 && (
                <div className="w-full max-w-4xl xl:max-w-5xl transition-all duration-500 ease-out flex items-center justify-center">
                  <ComicPanel
                    src="/assets/chapter1/p16_panel01.webp"
                    alt="Lightning tearing through dark winter clouds"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="Lightning tearing across twilight clouds as cosmic laws are questioned."
                  />
                </div>
              )}

              {/* Beat 1b: Death Turning to Agni (Panel 16_02) */}
              {stageProgress >= 0.10 && stageProgress < 0.20 && (
                <div className="w-full max-w-4xl xl:max-w-5xl transition-all duration-500 ease-out flex items-center justify-center">
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

              {/* Beat 2: Agni Refusal (Panel 16_03) */}
              {stageProgress >= 0.20 && stageProgress < 0.32 && (
                <div className="w-full max-w-4xl xl:max-w-5xl transition-all duration-500 ease-out flex items-center justify-center">
                  <CharacterAnimator
                    src="/assets/chapter1/p16_panel03.webp"
                    alt="Agni frowning: I know what you're thinking and the answer is no."
                    character="agni"
                    activeSpeaker="agni"
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Beat 3: Agni Relenting (Panel 16_05) */}
              {stageProgress >= 0.32 && stageProgress < 0.46 && (
                <div className="w-full max-w-4xl xl:max-w-5xl transition-all duration-500 ease-out flex items-center justify-center">
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

              {/* Beat 4: The Deal - Put Me Close (Panel 17_01) */}
              {stageProgress >= 0.46 && stageProgress < 0.62 && (
                <div className="w-full max-w-3xl lg:max-w-4xl transition-all duration-500 ease-out flex items-center justify-center">
                  <CharacterAnimator
                    src="/assets/chapter1/p17_panel01.webp"
                    alt="Death: When you send me down and give me a mortal body, can you put me close to the child?"
                    character="death"
                    activeSpeaker="death"
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Beat 5: Mortal Consequences (Panel 17_03) */}
              {stageProgress >= 0.62 && stageProgress < 0.78 && (
                <div className="w-full max-w-4xl xl:max-w-5xl transition-all duration-500 ease-out flex items-center justify-center">
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

              {/* Beat 6: Plunge into Mortal Flesh (Panel 17_04) */}
              {stageProgress >= 0.78 && (
                <div className="w-full max-w-4xl xl:max-w-5xl transition-all duration-500 ease-out flex items-center justify-center">
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
      {/* Layer 5: Interactive Hotspot (Positioned at top-20 right-6 to clear caption bar) */}
      <div className="absolute top-20 right-6 z-30 pointer-events-auto">
        <InteractiveHotspot
          id="descent-lightning"
          label="The Loophole"
          title="Agni's Complicity"
          body="As the god of fire and herald of crossings, Agni holds the keys to mortal passage. When Death asks to be placed beside the newborn child, he doesn't question her reasons—only warns of the mortal fragility she is accepting."
          accentColor="#63b8d6"
        />
      </div>
    </CinematicViewportStage>
  );
});

Scene06LailaMortal.displayName = 'Scene06LailaMortal';

