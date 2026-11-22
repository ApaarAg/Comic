/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene03Party.tsx
 *
 * Storyverse 3.0: Pinned Cinematic Viewport Stage for Scene 03 (The College Party)
 *
 * Choreographs the contrast between noisy collegiate debate in the apartment interior
 * and the quiet, melancholic contemplation of the girl at the window six floors above.
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

export const Scene03Party: React.FC<SceneProps> = React.memo(({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
  return (
    <CinematicViewportStage
      sceneId="scene-03"
      reducedMotion={reducedMotion}
      trackHeightVh={320}
      className="relative z-20"
      midgroundLayer={
        <SceneVideoBackdrop
          sceneId="scene-03"
          sceneIndex={2}
          activeSceneIndex={activeSceneIndex}
          reducedMotion={reducedMotion}
        />
      }
      foregroundLayer={
        !reducedMotion ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-20">
            {[...Array(6)].map((_, i) => (
              <span
                key={`smoke-mote-${i}`}
                className="absolute rounded-full bg-[#e66c8b]/40 blur-[1px] animate-pulse"
                style={{
                  left: `${15 + i * 14}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  width: `${3 + (i % 3)}px`,
                  height: `${3 + (i % 3)}px`,
                  animationDuration: `${3 + i * 1.5}s`,
                }}
              />
            ))}
          </div>
        ) : undefined
      }
      cameraRigLayer={(visualState: ResolvedVisualState) => {
        const { stageProgress } = visualState;

        return (
          <div className="relative flex flex-col items-center justify-center w-full max-w-5xl px-4 md:px-8">
            {/* Standardized Glassmorphic Header Badge */}
            <div className="hidden sm:block absolute top-[max(5.25rem,calc(env(safe-area-inset-top,0px)+4.75rem))] left-6 md:left-10 z-30 pointer-events-none">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e66c8b]/30 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#e66c8b] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e66c8b]" />
                <span>Scene 03 · Parel · 6th Floor</span>
              </span>
              <h2 className="font-display mt-2 text-2xl font-bold text-[#f4eef7] sm:text-3xl">
                The College Party
              </h2>
            </div>

            {/* Visual Panel Choreography */}
            <div className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px] max-h-[720px] pt-12">
              {/* Beat 1: Dhiraj Ranting (Panel 02) */}
              {stageProgress < 0.35 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <CharacterAnimator
                    src="/assets/chapter1/p08_panel02.webp"
                    alt="Dhiraj animatedly arguing cultural theory at party"
                    character="dhiraj"
                    activeSpeaker="dhiraj"
                    reducedMotion={reducedMotion}
                    subtleMotion="pulse"
                    onInspect={onInspectPanel}
                    inspectNote="Listen, the whole discourse still reproduces the same patriarchal power equations..."
                  />
                </div>
              )}

              {/* Beat 2: Girl Perched on Window Ledge (Panel 03) */}
              {stageProgress >= 0.35 && stageProgress < 0.60 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p08_panel03.webp"
                    alt="The girl sitting alone on the open window ledge holding a cigarette overlooking the city"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="Far removed from the debate inside, she watches the distant sea of lights."
                  />
                </div>
              )}

              {/* Beat 3: Close-up of the Girl's Eyes & Raven Hair (Panel 04) */}
              {stageProgress >= 0.60 && (
                <div className="w-full max-w-2xl transition-all duration-500 ease-out">
                  <ComicPanel
                    src="/assets/chapter1/p08_panel04.webp"
                    alt="Close-up of the girl with gentle curls of raven hair and cigarette smoke drifting past"
                    isActive={true}
                    onInspect={onInspectPanel}
                    inspectNote="Beneath gentle curls of raven hair, her eyes stayed fixed on distant city lights..."
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
          id="party-smoke"
          label="Twilight Solitude"
          title="The Girl at the Window"
          body="Surrounded by alcohol, chatter, and heated intellectual debate, she sat in complete silence six floors above the Mumbai streets—holding a cigarette and gazing into the dark."
          accentColor="#e66c8b"
        />
      </div>
    </CinematicViewportStage>
  );
});

Scene03Party.displayName = 'Scene03Party';

