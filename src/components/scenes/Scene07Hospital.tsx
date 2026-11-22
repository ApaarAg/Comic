/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene07Hospital.tsx
 *
 * Storyverse 4.2: Pinned Cinematic Viewport Stage for Scene 07 (Hospital)
 *
 * Choreographs Laila's awakening in mortal flesh 24 minutes after clinical death,
 * her conversation with the ghost girl Munmun, and discovering her name on the vinyl wristband.
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

export const Scene07Hospital: React.FC<SceneProps> = React.memo(({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
}) => {
  return (
    <CinematicViewportStage
      sceneId="scene-07"
      reducedMotion={reducedMotion}
      trackHeightVh={380}
      className="relative z-20"
      midgroundLayer={
        <SceneVideoBackdrop
          sceneId="scene-07"
          sceneIndex={6}
          activeSceneIndex={activeSceneIndex}
          reducedMotion={reducedMotion}
        />
      }
      cameraRigLayer={(visualState: ResolvedVisualState) => {
        const { stageProgress } = visualState;

        return (
          <div className="relative flex flex-col items-center justify-center w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl px-2 sm:px-6">
            {/* Standardized Editorial Scene Header Badge */}
            <div className="hidden sm:block absolute top-[max(5.25rem,calc(env(safe-area-inset-top,0px)+4.75rem))] left-6 md:left-10 pointer-events-none z-30">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8ec5b6] bg-black/40 px-2.5 py-0.5 rounded-full border border-[#8ec5b6]/35 backdrop-blur-md">
                Scene 07 · Amravati Hospital · 10:32 PM
              </span>
              <h2 className="font-display text-xl font-bold text-[#eef6fc] sm:text-2xl mt-1 drop-shadow-md">
                The Awakening
              </h2>
            </div>

            {/* Stage Content */}
            <div className="relative w-full flex flex-col items-center justify-center min-h-[400px] sm:min-h-[480px] max-h-[780px] pt-2 sm:pt-12">
              {/* Beat 1: Hospital Ward Awakening & Antiseptic (stageProgress < 0.16) */}
              {stageProgress < 0.16 && (
                <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-[1440px] flex flex-col items-center justify-center transition-opacity duration-500 ease-out">
                  <div className="w-full max-h-[70vh] flex items-center justify-center rounded-2xl bg-black/30 p-1 sm:p-3.5 backdrop-blur-sm border border-[#8ec5b6]/25 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
                    <ComicPanel
                      src="/assets/chapter1/p18_panel01.webp"
                      alt="Ceiling lights of Amravati Hospital recovery ward humming in dark"
                      isActive={true}
                      onInspect={onInspectPanel}
                      inspectNote="Amravati Hospital · Ward 03: Awaking in mortal flesh smelling of antiseptic."
                    />
                  </div>
                </div>
              )}

              {/* Beat 2: Laila Groaning in Mortal Body (0.16 <= stageProgress < 0.32) */}
              {stageProgress >= 0.16 && stageProgress < 0.32 && (
                <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-[1440px] flex flex-col items-center justify-center transition-opacity duration-500 ease-out">
                  <div className="w-full max-h-[70vh] flex items-center justify-center rounded-2xl bg-black/30 p-1 sm:p-3.5 backdrop-blur-sm border border-[#8ec5b6]/25 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
                    <CharacterAnimator
                      src="/assets/chapter1/p18_panel02.webp"
                      alt="Laila clutching aching mortal ribs: Ohhhhh, that feels awful."
                      character="laila"
                      activeSpeaker="laila"
                      reducedMotion={reducedMotion}
                      subtleMotion="breathe"
                      onInspect={onInspectPanel}
                      inspectNote="Ohhhhh, that feels awful."
                    />
                  </div>
                </div>
              )}

              {/* Beat 3: Munmun on Hospital Gurney (0.32 <= stageProgress < 0.46) */}
              {stageProgress >= 0.32 && stageProgress < 0.46 && (
                <div className="w-full max-w-xl max-h-[76vh] flex flex-col items-center justify-center transition-opacity duration-500 ease-out">
                  <div className="w-full flex items-center justify-center rounded-2xl bg-black/30 p-1 sm:p-3.5 backdrop-blur-sm border border-[#8ec5b6]/25 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
                    <CharacterAnimator
                      src="/assets/chapter1/p18_panel04.webp"
                      alt="Munmun perched on hospital gurney rail: Yeah, well... you were dead for a good twenty minutes or so."
                      character="munmun"
                      activeSpeaker="munmun"
                      reducedMotion={reducedMotion}
                      subtleMotion="spectral"
                      onInspect={onInspectPanel}
                      inspectNote="Yeah, well... you were dead for a good twenty minutes or so."
                    />
                  </div>
                </div>
              )}

              {/* Beat 4: Laila Startled at Munmun (0.46 <= stageProgress < 0.60) */}
              {stageProgress >= 0.46 && stageProgress < 0.60 && (
                <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-[1440px] flex flex-col items-center justify-center transition-opacity duration-500 ease-out">
                  <div className="w-full max-h-[70vh] flex items-center justify-center rounded-2xl bg-black/30 p-1 sm:p-3.5 backdrop-blur-sm border border-[#8ec5b6]/25 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
                    <CharacterAnimator
                      src="/assets/chapter1/p19_panel01.webp"
                      alt="Laila glaring in shock at the spectral girl: Who're you?"
                      character="laila"
                      activeSpeaker="laila"
                      reducedMotion={reducedMotion}
                      onInspect={onInspectPanel}
                      inspectNote="Who're you?"
                    />
                  </div>
                </div>
              )}

              {/* Beat 5: Munmun Pointing to Wristband (0.60 <= stageProgress < 0.74) */}
              {stageProgress >= 0.60 && stageProgress < 0.74 && (
                <div className="w-full max-w-xl max-h-[76vh] flex flex-col items-center justify-center transition-opacity duration-500 ease-out">
                  <div className="w-full flex items-center justify-center rounded-2xl bg-black/30 p-1 sm:p-3.5 backdrop-blur-sm border border-[#8ec5b6]/25 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
                    <CharacterAnimator
                      src="/assets/chapter1/p19_panel03.webp"
                      alt="Munmun explaining: I-I'm a ghost! And your name... it's on your wrist."
                      character="munmun"
                      activeSpeaker="munmun"
                      reducedMotion={reducedMotion}
                      subtleMotion="spectral"
                      onInspect={onInspectPanel}
                      inspectNote="I-I'm a ghost! And your name... it's on your wrist."
                    />
                  </div>
                </div>
              )}

              {/* Beat 6: Patient Wristband — Laila Starr (0.74 <= stageProgress < 0.86) */}
              {stageProgress >= 0.74 && stageProgress < 0.86 && (
                <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-[1440px] flex flex-col items-center justify-center transition-opacity duration-500 ease-out">
                  <div className="w-full max-h-[70vh] flex items-center justify-center rounded-2xl bg-black/30 p-1 sm:p-3.5 backdrop-blur-sm border border-[#8ec5b6]/25 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
                    <ComicPanel
                      src="/assets/chapter1/p19_panel06.webp"
                      alt="Close-up of plastic wristband: NAME: LAILA STARR · AGE: 21"
                      isActive={true}
                      onInspect={onInspectPanel}
                      inspectNote="NAME: LAILA STARR · AGE: 21"
                    />
                  </div>
                </div>
              )}

              {/* Beat 7: What Next, Laila Starr? (stageProgress >= 0.86) */}
              {stageProgress >= 0.86 && (
                <div className="w-full max-w-3xl lg:max-w-4xl flex flex-col items-center justify-center transition-opacity duration-500 ease-out">
                  <div className="w-full max-h-[70vh] flex items-center justify-center rounded-2xl bg-black/30 p-1 sm:p-3.5 backdrop-blur-sm border border-[#8ec5b6]/25 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
                    <CharacterAnimator
                      src="/assets/chapter1/p20_panel03.webp"
                      alt="Munmun smiling from hospital doorway: So... what next, Laila Starr?"
                      character="munmun"
                      activeSpeaker="munmun"
                      reducedMotion={reducedMotion}
                      subtleMotion="spectral"
                      onInspect={onInspectPanel}
                      inspectNote="So... what next, Laila Starr?"
                    />
                  </div>
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
          id="hospital-wristband"
          label="Patient Record · Ward 03"
          title="Inspect Hospital Admission Wristband"
          body="NAME: LAILA STARR · AGE: 21 · ORPHAN (NO NEXT OF KIN) · PRONOUNCED DECEASED: 22:08 HRS. For an eternal god who never owned a name, four crisp ink letters on vinyl tape become her first human identity."
          accentColor="#8ec5b6"
        />
      </div>
    </CinematicViewportStage>
  );
});

Scene07Hospital.displayName = 'Scene07Hospital';
