/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene09SecondDeath.tsx
 *
 * Storyverse 3.0: Pinned Cinematic Viewport Stage for Scene 09 (Second Death)
 *
 * Choreographs Laila's sudden, devastating collision with the twelve-wheeler truck
 * on the rain-slicked highway moments before midnight.
 */

import React from 'react';
import { CinematicViewportStage } from '../CinematicViewportStage';
import { SceneVideoBackdrop } from '../SceneVideoBackdrop';
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

export const Scene09SecondDeath: React.FC<SceneProps> = ({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
  return (
    <CinematicViewportStage
      sceneId="scene-09"
      reducedMotion={reducedMotion}
      trackHeightVh={320}
      className="relative z-20"
      midgroundLayer={
        <SceneVideoBackdrop
          sceneId="scene-09"
          sceneIndex={8}
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
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#f5b041]">
                Scene 09 · Midnight Highway · 11:58 PM
              </span>
              <h2 className="font-display text-2xl font-bold text-[#faf3eb] sm:text-3xl">
                The Second Death
              </h2>
            </div>

            {/* Stage Content */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px]">
              {/* Beat 1: Rain-Slicked Highway & Twelve-Wheeler Headlights (stageProgress < 0.40) */}
              {stageProgress < 0.40 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p25_panel01.webp"
                    alt="Massive twin halogen headlights of an oncoming twelve-wheeler truck blinding the screen"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="Great thundering wheels of commerce rolled on unfettered."
                  />
                </div>
              )}

              {/* Beat 2: The Collision Impact Freeze-Frame (stageProgress 0.40 to 0.70) */}
              {stageProgress >= 0.40 && stageProgress < 0.70 && (
                <div className="w-full max-w-3xl transition-all duration-300 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p25_panel02.webp"
                    alt="Shocking collision impact freeze-frame with shattered glass and crushing metal"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="The violent shockwave of impact — sudden, merciless, absolute."
                  />
                </div>
              )}

              {/* Beat 3: The Aftermath — Laila Starr Met Her Death Once Again (stageProgress >= 0.70) */}
              {stageProgress >= 0.70 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p25_panel05.webp"
                    alt="Laila's body lying motionless on the wet asphalt under distant streetlights"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="And so, only a few minutes away from midnight, Laila Starr met her death once again."
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
          id="collision-truck"
          label="The Irony of Mortality"
          title="Wheels of Commerce"
          body="Having survived the fall from the sixth floor and walked out of clinical death in the morgue, Laila's borrowed life lasted less than two hours before Mumbai's unyielding night traffic claimed her again."
          accentColor="#f5b041"
        />
      </div>
    </CinematicViewportStage>
  );
};
