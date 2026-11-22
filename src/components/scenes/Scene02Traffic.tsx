/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene02Traffic.tsx
 *
 * Storyverse 4.2: Pinned Cinematic Viewport Stage for Scene 02 (Traffic Gridlock)
 *
 * 100vh Pinned Viewport tracking the chaotic B.K.C. overpass traffic jam,
 * swerving taxi driver, and Mrs. Shah shouting that the baby is coming.
 */

import React from 'react';
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

export const Scene02Traffic: React.FC<SceneProps> = React.memo(({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
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
        const { stageProgress } = visualState;

        return (
          <div className="relative flex flex-col items-center justify-center w-full max-w-5xl px-4 md:px-8">
            {/* Standardized Editorial Scene Header Badge */}
            <div className="hidden sm:block absolute top-[max(5.25rem,calc(env(safe-area-inset-top,0px)+4.75rem))] left-6 md:left-10 pointer-events-none z-30">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#e8a84a] bg-black/40 px-2.5 py-0.5 rounded-full border border-[#e8a84a]/30 backdrop-blur-md">
                Scene 02 · B.K.C. Overpass
              </span>
              <h2 className="font-display text-xl font-bold text-[#f8f1e7] sm:text-2xl mt-1 drop-shadow-md">
                The Chaotic Journey
              </h2>
            </div>

            {/* Active Panel Display depending on narrative beat */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px] pt-2 sm:pt-12">
              {/* Beat 1: Mrs. Shah Screaming on Phone (Panel 01) */}
              {stageProgress < 0.22 && (
                <div className="w-full max-w-2xl transition-opacity duration-500 ease-out">
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

              {/* Beat 2: Gridlock Artwork (Panel 02) */}
              {stageProgress >= 0.22 && stageProgress < 0.40 && (
                <div className="relative w-full max-w-3xl transition-opacity duration-500 ease-out">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl transition-opacity duration-500 ease-out items-center">
                  <div className="max-h-[38vh] sm:max-h-none flex items-center justify-center">
                    <ComicPanel
                      src="/assets/chapter1/p07_panel03.webp"
                      alt="Cars squeezed side-by-side through narrow lanes on the overpass"
                      caption="Each time they yelled at him for his dangerous driving..."
                      onInspect={onInspectPanel}
                    />
                  </div>
                  <div className="max-h-[38vh] sm:max-h-none flex items-center justify-center">
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
                </div>
              )}

              {/* Beat 4: Traffic Officer (Panel 05) */}
              {stageProgress >= 0.65 && stageProgress < 0.80 && (
                <div className="w-full max-w-2xl transition-opacity duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p07_panel05.webp"
                    alt="Mumbai traffic constable waving the cab through the gridlock barricades"
                    caption="...And with a wave of his hand, waved them straight through."
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Beat 5: Baby Is Coming Close-up (Panel 06) */}
              {stageProgress >= 0.80 && (
                <div className="w-full max-w-2xl transition-opacity duration-500 ease-out rounded-2xl bg-black/30 p-2 sm:p-3.5 backdrop-blur-sm border border-[#e8a84a]/20 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
                  <CharacterAnimator
                    src="/assets/chapter1/p07_panel06.webp"
                    alt="Close-up of Mrs. Shah in intense pain shouting: The baby is coming!"
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
      {/* Layer 5: Interactive Hotspot with safe positioning */}
      <div className="absolute top-20 right-6 z-30 pointer-events-auto">
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
});

Scene02Traffic.displayName = 'Scene02Traffic';
