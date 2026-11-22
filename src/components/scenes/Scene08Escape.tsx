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

interface SceneProps {
  reducedMotion: boolean;
  activeSceneIndex: number;
  onInspectPanel: (panel: InspectedPanelData) => void;
  onSkipNextScene?: () => void;
}

export const Scene08Escape: React.FC<SceneProps> = React.memo(({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
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
            {/* Standardized Glassmorphic Header Badge */}
            <div className="hidden sm:block absolute top-[max(5.25rem,calc(env(safe-area-inset-top,0px)+4.75rem))] left-6 md:left-10 z-30 pointer-events-none">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e89138]/30 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#e89138] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e89138]" />
                <span>Scene 08 · Neo-Natal Ward · 11:40 PM</span>
              </span>
              <h2 className="font-display mt-2 text-2xl font-bold text-[#fbf6ef] sm:text-3xl">
                The Escape
              </h2>
            </div>

            {/* Stage Content */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px] pt-2 sm:pt-12">
              {/* Beat 1: Munmun Pleading — He's Got a Name! (Panels 21_01 & 21_03) */}
              {stageProgress < 0.35 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out rounded-2xl bg-black/30 p-2 sm:p-3.5 backdrop-blur-sm border border-[#e89138]/20 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
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
                <div className="w-full max-w-2xl transition-all duration-500 ease-out rounded-2xl bg-black/30 p-2 sm:p-3.5 backdrop-blur-sm border border-[#e89138]/20 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
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
      {/* Layer 5: Interactive Hotspot (Positioned at top-20 right-6 to clear caption bar) */}
      <div className="absolute top-20 right-6 z-30 pointer-events-auto">
        <InteractiveHotspot
          id="escape-darius"
          label="The Moral Paradox"
          title="The Name of the Child"
          body="Death had killed trillions without flinching. But an abstraction with a name is no longer a demographic statistic—it is a person. The moment Munmun speaks the name 'Darius', Death's certainty shatters."
          accentColor="#e89138"
        />
      </div>
    </CinematicViewportStage>
  );
});

Scene08Escape.displayName = 'Scene08Escape';

