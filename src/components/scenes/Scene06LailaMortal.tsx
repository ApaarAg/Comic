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

export const Scene06LailaMortal: React.FC<SceneProps> = ({
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

              {/* Beat 4: Plunge into Mortal Flesh (Panel 17_05) */}
              {stageProgress >= 0.80 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p17_panel05.webp"
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
  );
};
