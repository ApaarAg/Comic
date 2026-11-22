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

export const Scene04DeathsWorld: React.FC<SceneProps> = React.memo(({
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
          <div className="relative flex flex-col items-center justify-center w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl px-2 sm:px-6">
            {/* Standardized Glassmorphic Header Badge */}
            <div className="hidden sm:block absolute top-[max(5.25rem,calc(env(safe-area-inset-top,0px)+4.75rem))] left-6 md:left-10 z-30 pointer-events-none">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#8ad3eb]/30 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8ad3eb] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8ad3eb]" />
                <span>Scene 04 · Beyond Mortal Clouds</span>
              </span>
              <h2 className="font-display mt-2 text-2xl font-bold text-[#f5f8fc] sm:text-3xl">
                The Silvered Tower
              </h2>
            </div>

            {/* Active Panel Display */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[780px] pt-12">
              {/* Beat 1: The Silvered Tower Exterior (Panel 01) */}
              {stageProgress < 0.12 && (
                <div className="w-full max-w-4xl xl:max-w-5xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p09_panel01.webp"
                    alt="A slender golden-lit Silvered Tower rising through pastel pink and blue clouds"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="Far above mortal clouds, the Silvered Tower pierced an endless twilight."
                  />
                </div>
              )}

              {/* Beat 2a: Hold the Door! (Panel 09_02) */}
              {stageProgress >= 0.12 && stageProgress < 0.18 && (
                <div className="w-full max-w-4xl xl:max-w-5xl transition-all duration-500 ease-out flex items-center justify-center">
                  <CharacterAnimator
                    src="/assets/chapter1/p09_panel02.webp"
                    alt="Blue ringed hand reaching between closing crimson elevator doors: Hold the door!"
                    character="death"
                    activeSpeaker="death"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Beat 2b: Crowded Elevator (Panel 09_03) */}
              {stageProgress >= 0.18 && stageProgress < 0.24 && (
                <div className="w-full max-w-3xl lg:max-w-4xl transition-all duration-500 ease-out flex items-center justify-center">
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
                <div className="w-full max-w-xl max-h-[76vh] transition-all duration-500 ease-out flex items-center justify-center">
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
                <div className="w-full max-w-xl max-h-[76vh] transition-all duration-500 ease-out flex items-center justify-center">
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

              {/* Beat 5: God Inquiring Hobbies (Panel 10_05 - Ultra-wide Panoramic Strip) */}
              {stageProgress >= 0.44 && stageProgress < 0.52 && (
                <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl transition-all duration-500 ease-out">
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
                <div className="w-full max-w-2xl lg:max-w-3xl transition-all duration-500 ease-out flex items-center justify-center">
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

              {/* Beat 7a: Eternity Exchange - God (Panel 11_01) */}
              {stageProgress >= 0.60 && stageProgress < 0.67 && (
                <div className="w-full max-w-3xl lg:max-w-4xl transition-all duration-500 ease-out flex items-center justify-center">
                  <CharacterAnimator
                    src="/assets/chapter1/p11_panel01.webp"
                    alt="God smiling gently: Feels like an eternity, doesn't it?"
                    character="god"
                    activeSpeaker="god"
                    reducedMotion={reducedMotion}
                    onInspect={onInspectPanel}
                  />
                </div>
              )}

              {/* Beat 7b: Eternity Exchange - Death (Panel 11_03) */}
              {stageProgress >= 0.67 && stageProgress < 0.74 && (
                <div className="w-full max-w-3xl lg:max-w-4xl transition-all duration-500 ease-out flex items-center justify-center">
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
                <div className="w-full max-w-3xl lg:max-w-4xl transition-all duration-500 ease-out flex items-center justify-center">
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
                <div className="w-full flex items-center justify-center transition-all duration-500 ease-out">
                  {stageProgress < 0.90 ? (
                    <div className="w-full max-w-xl max-h-[76vh]">
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
                    </div>
                  ) : stageProgress < 0.95 ? (
                    <div className="w-full max-w-4xl xl:max-w-5xl">
                      <CharacterAnimator
                        src="/assets/chapter1/p12_panel04.webp"
                        alt="God shrugging defensively: You know how corporate feels about that kind of stuff."
                        character="god"
                        activeSpeaker="god"
                        reducedMotion={reducedMotion}
                        onInspect={onInspectPanel}
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-xl max-h-[76vh]">
                      <CharacterAnimator
                        src="/assets/chapter1/p12_panel06.webp"
                        alt="Death devastated: This is all I've ever done. What am I supposed to do?"
                        character="death"
                        activeSpeaker="death"
                        reducedMotion={reducedMotion}
                        subtleMotion="breathe"
                        onInspect={onInspectPanel}
                      />
                    </div>
                  )}
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
          id="celestial-elevator"
          label="Corporate Cosmos"
          title="The Silvered Tower Bureaucracy"
          body="In the high realms, mortality is not an tragedy—it is an administrative division. When human ingenuity creates a cure for death, the entire department is declared redundant."
          accentColor="#8ad3eb"
        />
      </div>
    </CinematicViewportStage>
  );
});

Scene04DeathsWorld.displayName = 'Scene04DeathsWorld';

