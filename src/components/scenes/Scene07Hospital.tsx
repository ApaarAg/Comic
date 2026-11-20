/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene07Hospital.tsx
 *
 * Storyverse 3.0: Pinned Cinematic Viewport Stage for Scene 07 (Hospital)
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

export const Scene07Hospital: React.FC<SceneProps> = ({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
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
          <div className="relative flex flex-col items-center justify-center w-full max-w-5xl px-4 md:px-8">
            {/* Scene Header Watermark */}
            <div className="absolute -top-16 left-6 md:left-10 pointer-events-none opacity-40">
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#6dc4e0]">
                Scene 07 · Amravati Hospital · 10:32 PM
              </span>
              <h2 className="font-display text-2xl font-bold text-[#eef6fc] sm:text-3xl">
                The Awakening
              </h2>
            </div>

            {/* Stage Content */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px]">
              {/* Beat 1: Emergency Bay Resuscitation & Declared Dead (stageProgress < 0.20) */}
              {stageProgress < 0.20 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                  <ComicPanel
                    src="/assets/chapter1/p16_panel03.webp"
                    alt="Medical team charging defibrillator paddles over her chest"
                    isActive={true}
                    onInspect={onInspectPanel}
                  />
                  <ComicPanel
                    src="/assets/chapter1/p16_panel04.webp"
                    alt="Sheet pulled over the girl's pale face at 10:08 PM"
                    isActive={true}
                    onInspect={onInspectPanel}
                    caption="Then at eight minutes past ten, they declared her dead and walked out of the room."
                  />
                </div>
              )}

              {/* Beat 2: Eyes Snap Open & Collapsing on Floor (stageProgress 0.20 to 0.45) */}
              {stageProgress >= 0.20 && stageProgress < 0.45 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                  <CharacterAnimator
                    src="/assets/chapter1/p17_panel02.webp"
                    alt="Wide turquoise eyes snapping open in the dark: GAAAAAAH!!"
                    character="laila"
                    activeSpeaker="laila"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                  />
                  <CharacterAnimator
                    src="/assets/chapter1/p17_panel03.webp"
                    alt="Laila collapsing onto the hospital floor gasping for breath: Ohhhhh, that feels awful."
                    character="laila"
                    activeSpeaker="laila"
                    reducedMotion={reducedMotion}
                    subtleMotion="breathe"
                    onInspect={onInspectPanel}
                    inspectNote="Ohhhhh, that feels awful."
                  />
                </div>
              )}

              {/* Beat 3: Munmun Ghost Encounter & Who're You? (stageProgress 0.45 to 0.70) */}
              {stageProgress >= 0.45 && stageProgress < 0.70 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                  <CharacterAnimator
                    src="/assets/chapter1/p17_panel04.webp"
                    alt="Laila glaring from shadow clutching a syringe: Who're you?"
                    character="laila"
                    activeSpeaker="laila"
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                  />
                  <CharacterAnimator
                    src="/assets/chapter1/p18_panel01.webp"
                    alt="Translucent glowing blue ghost girl floating: I-I'm a ghost!"
                    character="munmun"
                    activeSpeaker="munmun"
                    reducedMotion={reducedMotion}
                    subtleMotion="spectral"
                    onInspect={onInspectPanel}
                    inspectNote="Yeah, well... you were dead for a good twenty minutes or so."
                  />
                </div>
              )}

              {/* Beat 4: Patient Wristband — Laila Starr Manifestation (stageProgress >= 0.70) */}
              {stageProgress >= 0.70 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                  <CharacterAnimator
                    src="/assets/chapter1/p18_panel05.webp"
                    alt="Munmun floating beside Laila pointing: It's on your wrist."
                    character="munmun"
                    activeSpeaker="munmun"
                    reducedMotion={reducedMotion}
                    subtleMotion="spectral"
                    onInspect={onInspectPanel}
                  />
                  <CharacterAnimator
                    src="/assets/chapter1/p18_panel06.webp"
                    alt="Laila reading the patient band on her wrist: L-Laila Starr..."
                    character="laila"
                    activeSpeaker="laila"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                    inspectNote="NAME: LAILA STARR · AGE: 21"
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
          id="hospital-wristband"
          label="Patient Record · Ward 03"
          title="Inspect Hospital Admission Wristband"
          body="NAME: LAILA STARR · AGE: 21 · ORPHAN (NO NEXT OF KIN) · PRONOUNCED DECEASED: 22:08 HRS. For an eternal god who never owned a name, four crisp ink letters on vinyl tape become her first human identity."
          accentColor="#6dc4e0"
        />
      </div>
    </CinematicViewportStage>
  );
};
