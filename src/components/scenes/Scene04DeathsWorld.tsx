/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene04DeathsWorld.tsx
 *
 * Storyverse 3.0: Pinned Cinematic Viewport Stage for Scene 04 (Death's World)
 *
 * Choreographs the surreal corporate celestial hierarchy of the Silvered Tower:
 * elevator descent, Agni's greeting, and God's polite, devastating dismissal of Death.
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

export const Scene04DeathsWorld: React.FC<SceneProps> = ({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
  return (
    <CinematicViewportStage
      sceneId="scene-04"
      reducedMotion={reducedMotion}
      trackHeightVh={420}
      className="relative z-20"
      midgroundLayer={
        <SceneVideoBackdrop
          sceneId="scene-04"
          sceneIndex={3}
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
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#8ad3eb]">
                Scene 04 · Beyond Mortal Clouds
              </span>
              <h2 className="font-display text-2xl font-bold text-[#f5f8fc] sm:text-3xl">
                The Silvered Tower
              </h2>
            </div>

            {/* Active Panel Display */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px]">
              {/* Beat 1: The Silvered Tower Exterior (Panel 01) */}
              {stageProgress < 0.12 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p09_panel01.webp"
                    alt="A slender golden-lit Silvered Tower rising through pastel pink and blue clouds"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="Far above mortal clouds, the Silvered Tower pierced an endless twilight."
                  />
                </div>
              )}

              {/* Beat 2: Elevator Arrival & Hold the Door! (Panels 02 & 03) */}
              {stageProgress >= 0.12 && stageProgress < 0.24 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                  <CharacterAnimator
                    src="/assets/chapter1/p09_panel02.webp"
                    alt="Blue ringed hand reaching between closing crimson elevator doors: Hold the door!"
                    character="death"
                    activeSpeaker="death"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                  />
                  <ComicPanel
                    src="/assets/chapter1/p09_panel03.webp"
                    alt="Crowded surreal elevator of strange spirits and Death clutching her pink file"
                    isActive={true}
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Beat 3: Agni Greets Death (Panel 10_01) */}
              {stageProgress >= 0.24 && stageProgress < 0.35 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p10_panel01.webp"
                    alt="Agni guiding Death along the glass corridor toward the corner office"
                    character="agni"
                    activeSpeaker="agni"
                    reducedMotion={reducedMotion}
                    subtleMotion="breathe"
                    onInspect={onInspectPanel}
                    inspectNote="This way, please. He is expecting you."
                  />
                </div>
              )}

              {/* Beat 4: God Offers a Seat (Panel 10_03) */}
              {stageProgress >= 0.35 && stageProgress < 0.44 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p10_panel03.webp"
                    alt="God sitting behind a massive teak desk welcoming Death"
                    character="god"
                    activeSpeaker="god"
                    reducedMotion={reducedMotion}
                    subtleMotion="breathe"
                    onInspect={onInspectPanel}
                    inspectNote="Come, come. Have a seat."
                  />
                </div>
              )}

              {/* Beat 5: God Inquiring Hobbies (Panel 10_05) */}
              {stageProgress >= 0.44 && stageProgress < 0.52 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p10_panel05.webp"
                    alt="God casually leaning back asking about work, life, friendships, hobbies"
                    character="god"
                    activeSpeaker="god"
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                    inspectNote="So, Death... tell me, how're things?"
                  />
                </div>
              )}

              {/* Beat 6: Death Puzzled (Panel 10_07) */}
              {stageProgress >= 0.52 && stageProgress < 0.60 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p10_panel07.webp"
                    alt="Death looking perplexed clutching her folder: W-what am I doing here, Sir?"
                    character="death"
                    activeSpeaker="death"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Beat 7: Eternity Exchange (Panels 11_01 & 11_03) */}
              {stageProgress >= 0.60 && stageProgress < 0.74 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl transition-all duration-500 ease-out items-center">
                  <CharacterAnimator
                    src="/assets/chapter1/p11_panel01.webp"
                    alt="God smiling gently: Feels like an eternity, doesn't it?"
                    character="god"
                    activeSpeaker="god"
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                  />
                  <CharacterAnimator
                    src="/assets/chapter1/p11_panel03.webp"
                    alt="Death answering earnestly: I have actually been here for an eternity."
                    character="death"
                    activeSpeaker="death"
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Beat 8: The Bombshell — Fired! (Panel 11_05) */}
              {stageProgress >= 0.74 && stageProgress < 0.83 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p11_panel05.webp"
                    alt="God delivering the news: Yes, Death. I'm afraid we're letting you go."
                    character="god"
                    activeSpeaker="god"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                    inspectNote="Yes, Death. I'm afraid we're letting you go."
                  />
                </div>
              )}

              {/* Beat 9: Death's Outrage & Corporate Defense (Panels 12_01, 12_04, 12_06) */}
              {stageProgress >= 0.83 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  {stageProgress < 0.90 ? (
                    <CharacterAnimator
                      src="/assets/chapter1/p12_panel01.webp"
                      alt="Death shouting in furious disbelief: WHAT?! Send down a plague!"
                      character="death"
                      activeSpeaker="death"
                      reducedMotion={reducedMotion}
                      subtleMotion="pulse"
                      onInspect={onInspectPanel}
                      inspectNote="I'm an absolute consequence. It's in the job description!"
                    />
                  ) : stageProgress < 0.95 ? (
                    <CharacterAnimator
                      src="/assets/chapter1/p12_panel04.webp"
                      alt="God shrugging defensively: You know how corporate feels about that kind of stuff."
                      character="god"
                      activeSpeaker="god"
                      reducedMotion={reducedMotion}
                      onInspect={onInspectPanel}
                    />
                  ) : (
                    <CharacterAnimator
                      src="/assets/chapter1/p12_panel06.webp"
                      alt="Death devastated: This is all I've ever done. What am I supposed to do?"
                      character="death"
                      activeSpeaker="death"
                      reducedMotion={reducedMotion}
                      subtleMotion="breathe"
                      onInspect={onInspectPanel}
                    />
                  )}
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
          id="celestial-elevator"
          label="Corporate Cosmos"
          title="The Silvered Tower Bureaucracy"
          body="In the high realms, mortality is not an tragedy—it is an administrative division. When human ingenuity creates a cure for death, the entire department is declared redundant."
          accentColor="#8ad3eb"
        />
      </div>
    </CinematicViewportStage>
  );
};
