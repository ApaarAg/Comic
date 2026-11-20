/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene02Traffic.tsx
 *
 * Storyverse 3.0: Pinned Cinematic Viewport Stage for Scene 02 (The Chaotic Journey)
 *
 * Navigates through Mrs. Shah's frantic taxi ride across the Bandra-Kurla overpass
 * using virtual camera tracking, embedded character speech balloons, and dynamic audio ducking.
 */

import React, { useMemo } from 'react';
import { CinematicViewportStage } from '../CinematicViewportStage';
import { SceneVideoBackdrop } from '../SceneVideoBackdrop';
import { CharacterAnimator } from '../CharacterAnimator';
import { ComicPanel } from '../ComicPanel';
import { InteractiveHotspot } from '../InteractiveHotspot';
import { soundscape } from '../../audio/soundscape';
import type { InspectedPanelData } from '../PanelInspectorModal';
import type { ResolvedVisualState } from '../../story/storyTimeline';

interface SceneProps {
  reducedMotion: boolean;
  activeSceneIndex: number;
  onInspectPanel: (panel: InspectedPanelData) => void;
  onSkipNextScene?: () => void;
}

export const Scene02Traffic: React.FC<SceneProps> = ({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
  return (
    <CinematicViewportStage
      sceneId="scene-02"
      reducedMotion={reducedMotion}
      trackHeightVh={380}
      className="relative z-20"
      midgroundLayer={
        <SceneVideoBackdrop
          sceneId="scene-02"
          sceneIndex={1}
          activeSceneIndex={activeSceneIndex}
          reducedMotion={reducedMotion}
        />
      }
      cameraRigLayer={(visualState: ResolvedVisualState) => {
        const { activePanelId, stageProgress } = visualState;

        return (
          <div className="relative flex flex-col items-center justify-center w-full max-w-5xl px-4 md:px-8">
            {/* Scene Header Watermark */}
            <div className="absolute -top-16 left-6 md:left-10 pointer-events-none opacity-40">
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#e8a84a]">
                Scene 02 · B.K.C. Overpass
              </span>
              <h2 className="font-display text-2xl font-bold text-[#f8f1e7] sm:text-3xl">
                The Chaotic Journey
              </h2>
            </div>

            {/* Active Panel Display depending on narrative beat */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px]">
              {/* Beat 1: Mrs. Shah Screaming on Phone (Panel 01) */}
              {stageProgress < 0.22 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p07_panel01.webp"
                    alt="Mrs. Shah screaming into her phone in the backseat of a car stuck in Mumbai traffic"
                    character="mrs_shah"
                    activeSpeaker="mrs_shah"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                    inspectNote="Mrs. Shah shouting at Mr. Shah over the deafening Bandra-Kurla gridlock."
                  />
                </div>
              )}

              {/* Beat 2: Gridlock & Floating Comic SFX (Panel 02) */}
              {stageProgress >= 0.22 && stageProgress < 0.40 && (
                <div className="relative w-full max-w-3xl transition-all duration-500 ease-out">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none mb-3 flex flex-wrap items-center justify-between gap-4 font-display text-2xl font-bold italic tracking-wider text-[#e8a84a]/90 sm:text-4xl"
                  >
                    <span className="animate-pulse">PIP PIP PIP</span>
                    <span className="text-[#f28b50]">HONK HONK</span>
                    <span className="text-[#7bc8e2]">BEEP</span>
                    <span className="text-[#f28b50]">BLAARP</span>
                  </div>
                  <ComicPanel
                    src="/assets/chapter1/p07_panel02.webp"
                    alt="Overpass bumper-to-bumper gridlock filled with honking cars"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="Bumper-to-bumper overpass gridlock beneath dusk haze."
                  />
                </div>
              )}

              {/* Beat 3: Swerving Taxi & Panicked Driver (Panels 03 & 04) */}
              {stageProgress >= 0.40 && stageProgress < 0.65 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl transition-all duration-500 ease-out items-center">
                  <ComicPanel
                    src="/assets/chapter1/p07_panel03.webp"
                    alt="Cars squeezed side-by-side through narrow lanes on the overpass"
                    caption="Each time they yelled at him for his dangerous driving..."
                    onInspect={onInspectPanel}
                  />
                  <CharacterAnimator
                    src="/assets/chapter1/p07_panel04.webp"
                    alt="Panicked driver gesturing over his shoulder toward Mrs. Shah in the backseat"
                    character="driver"
                    activeSpeaker="driver"
                    reducedMotion={reducedMotion}
                    subtleMotion="breathe"
                    onInspect={onInspectPanel}
                    inspectNote="...he pointed to a volatile Mrs. Shah in the back, and said..."
                  />
                </div>
              )}

              {/* Beat 4: Traffic Officer (Panel 05) */}
              {stageProgress >= 0.65 && stageProgress < 0.80 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p07_panel05.webp"
                    alt="Mumbai traffic officer blowing a shrill whistle: FWEEEEET"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="At the sight of Mrs. Shah gripping her abdomen, the traffic officer waved them straight through."
                  />
                </div>
              )}

              {/* Beat 5: Reveal — Labor Climax (Panel 06) */}
              {stageProgress >= 0.80 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p07_panel06.webp"
                    alt="Pregnant Mrs. Shah gripping her stomach in the backseat as labor begins"
                    character="mrs_shah"
                    activeSpeaker="mrs_shah"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                    inspectNote="...The baby is coming."
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
          id="traffic-whistle"
          label="Street Soundscape"
          title="Why Nobody Stopped the Cab"
          body="At the sight of Mrs. Shah gripping her swelling abdomen in the rear window, even the fiercest Mumbai traffic constable waved them straight through the barricades toward Amravati Hospital."
          detailNote="Audio Cue: Triggered horn blast across the B.K.C. lanes."
          accentColor="#e8a84a"
          onActivate={() => soundscape.triggerCue('horn')}
        />
      </div>
    </CinematicViewportStage>
  );
};
