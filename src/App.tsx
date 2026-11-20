/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CHAPTER_SCENES } from './story/chapter1Data';
import {
  clamp01,
  computeNormalizedSceneBounds,
  resolveActiveSceneByOffsets,
  type SceneBound,
} from './story/scrollMath';
import { soundscape } from './audio/soundscape';
import { characterVoicePlayer } from './audio/CharacterVoicePlayer';
import { Scene00Prologue } from './components/scenes/Scene00Prologue';
import { AtmosphereOverlay } from './components/AtmosphereOverlay';
import { ChapterChrome } from './components/ChapterChrome';
import { CinematicTransition } from './components/CinematicTransition';
import { PanelInspectorModal, type InspectedPanelData } from './components/PanelInspectorModal';
import { Scene01Mumbai } from './components/scenes/Scene01Mumbai';
import { Scene02Traffic } from './components/scenes/Scene02Traffic';
import { Scene03Party } from './components/scenes/Scene03Party';
import { Scene04DeathsWorld } from './components/scenes/Scene04DeathsWorld';
import { Scene05TwoEvents } from './components/scenes/Scene05TwoEvents';
import { Scene06LailaMortal } from './components/scenes/Scene06LailaMortal';
import { Scene07Hospital } from './components/scenes/Scene07Hospital';
import { Scene08Escape } from './components/scenes/Scene08Escape';
import { Scene09SecondDeath } from './components/scenes/Scene09SecondDeath';
import { Scene10EightYearsLater } from './components/scenes/Scene10EightYearsLater';
import { NarrativeProvider } from './narrative/NarrativeEngine';
import { SCENE_NARRATION_BEATS } from './narrative/narrativeManifest';
import { CinematicCaptionBar } from './components/CinematicCaptionBar';

gsap.registerPlugin(ScrollTrigger);

function getInitialAutostart(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('autostart') === '1';
}

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function App() {
  const [hasEntered, setHasEntered] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(getPrefersReducedMotion);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [sceneBounds, setSceneBounds] = useState<SceneBound[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [inspectedPanel, setInspectedPanel] = useState<InspectedPanelData | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const lastLayoutSigRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Initialize Single Coordinated Scroll Architecture: Lenis smooth scroll + GSAP ScrollTrigger
  useEffect(() => {
    const updateProgress = () => {
      if (!hasEntered) return;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const nextProgress = clamp01(window.scrollY / maxScroll);
      setScrollProgress(nextProgress);

      const tops = CHAPTER_SCENES.map((scene) => {
        const el = document.getElementById(scene.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });
      setActiveSceneIndex(resolveActiveSceneByOffsets(window.scrollY, window.innerHeight, tops));

      const sig = `${Math.round(maxScroll)}:${Math.round(window.innerHeight)}:${tops.map((t) => Math.round(t)).join(',')}`;
      if (sig !== lastLayoutSigRef.current) {
        lastLayoutSigRef.current = sig;
        setSceneBounds(computeNormalizedSceneBounds(tops, maxScroll, window.innerHeight));
      }
    };

    // If user prefers reduced motion, disable Lenis completely and run native instant scrolling
    if (reducedMotion) {
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress, { passive: true });
      updateProgress();
      ScrollTrigger.refresh();
      return () => {
        window.removeEventListener('scroll', updateProgress);
        window.removeEventListener('resize', updateProgress);
      };
    }

    // Single source of truth: Lenis drives ScrollTrigger updates and progress
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', () => {
      ScrollTrigger.update();
      updateProgress();
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
      updateProgress();
    }, 280);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener('resize', updateProgress);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [hasEntered, reducedMotion]);

  const activeScene = CHAPTER_SCENES[activeSceneIndex] ?? CHAPTER_SCENES[0];

  // Sync Howler ambience mood to the current scene once entered
  useEffect(() => {
    if (!hasEntered) return;
    soundscape.setMood(activeScene.theme.mood);
  }, [activeScene.theme.mood, hasEntered]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      soundscape.dispose();
    };
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = soundscape.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  const handleJumpToScene = useCallback(
    (sceneId: string) => {
      const target = document.getElementById(sceneId);
      if (!target) return;
      characterVoicePlayer.stop(160);
      soundscape.triggerCue('transition');
      if (lenisRef.current && !reducedMotion) {
        lenisRef.current.scrollTo(target, { offset: 0, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    },
    [reducedMotion],
  );

  const handleEnterChapter = useCallback((options?: { withAudio?: boolean }) => {
    handleJumpToScene('scene-01');
    if (options?.withAudio) {
      soundscape.unmute();
      setIsMuted(false);
      soundscape.playMotif('motif_storyverse');
    }
  }, [handleJumpToScene]);

  const handleReplayPrologue = useCallback(() => {
    characterVoicePlayer.stop(160);
    handleJumpToScene('scene-00');
    soundscape.setMood('prologue');
  }, [handleJumpToScene]);

  const handleReplayChapter = useCallback(() => {
    handleJumpToScene('scene-01');
  }, [handleJumpToScene]);

  return (
    <NarrativeProvider narrativeBeats={SCENE_NARRATION_BEATS} scrollProgress={scrollProgress}>
      <div
        className="relative min-h-screen bg-[#0b0d17] text-[#f4efe6]"
        data-active-scene={hasEntered ? activeScene.id : 'prologue'}
      >
        <AtmosphereOverlay
          activeScene={activeScene}
          reducedMotion={reducedMotion}
        />

        <ChapterChrome
          scenes={CHAPTER_SCENES}
          activeSceneIndex={activeSceneIndex}
          progress={scrollProgress}
          sceneBounds={sceneBounds}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onJumpToScene={handleJumpToScene}
          onReplayPrologue={handleReplayPrologue}
          hasEntered={hasEntered}
        />

        <PanelInspectorModal
          panel={inspectedPanel}
          onClose={() => setInspectedPanel(null)}
        />

        <main className="relative z-20">
          <Scene00Prologue
            reducedMotion={reducedMotion}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onUnlockAudio={() => setIsMuted(false)}
          />

          <Scene01Mumbai
            reducedMotion={reducedMotion}
            activeSceneIndex={activeSceneIndex}
            onInspectPanel={setInspectedPanel}
            onSkipNextScene={() => handleJumpToScene('scene-02')}
          />

              <CinematicTransition
                kind="ink-spread"
                fromColor="#141225"
                toColor="#1c1824"
                accentColor="#f28b50"
                eyebrow="Transition I · Street Level"
                caption="As sunset sank below the skyline, engines idled bumper-to-bumper along the Bandra-Kurla overpass."
                reducedMotion={reducedMotion}
              />

              <Scene02Traffic
                reducedMotion={reducedMotion}
                activeSceneIndex={activeSceneIndex}
                onInspectPanel={setInspectedPanel}
                onSkipNextScene={() => handleJumpToScene('scene-03')}
              />

              <CinematicTransition
                kind="panel-slice"
                fromColor="#1c1824"
                toColor="#13162b"
                accentColor="#e66c8b"
                eyebrow="Transition II · Six Floors Above"
                caption="Across Parel, neon haze spilled out from an open apartment window above the rush."
                reducedMotion={reducedMotion}
              />

              <Scene03Party
                reducedMotion={reducedMotion}
                activeSceneIndex={activeSceneIndex}
                onInspectPanel={setInspectedPanel}
                onSkipNextScene={() => handleJumpToScene('scene-04')}
              />

              <CinematicTransition
                kind="celestial-portal"
                fromColor="#13162b"
                toColor="#16283d"
                accentColor="#8ad3eb"
                eyebrow="Transition III · Beyond Mortal Clouds"
                caption="Far above cigarette smoke and gridlock, a slender silvered tower pierced an endless twilight."
                reducedMotion={reducedMotion}
              />

              <Scene04DeathsWorld
                reducedMotion={reducedMotion}
                activeSceneIndex={activeSceneIndex}
                onInspectPanel={setInspectedPanel}
                onSkipNextScene={() => handleJumpToScene('scene-05')}
              />

              <CinematicTransition
                kind="temporal-split"
                fromColor="#16283d"
                toColor="#1c1429"
                accentColor="#f06a7e"
                eyebrow="Transition IV · 10:02 PM Divergence"
                caption="Two lives—one plummeting through open air, one forcing his way into his first breath."
                reducedMotion={reducedMotion}
              />

              <Scene05TwoEvents
                reducedMotion={reducedMotion}
                activeSceneIndex={activeSceneIndex}
                onInspectPanel={setInspectedPanel}
                onSkipNextScene={() => handleJumpToScene('scene-06')}
              />

              <CinematicTransition
                kind="storm-dissolve"
                fromColor="#1c1429"
                toColor="#11162a"
                accentColor="#63b8d6"
                eyebrow="Transition V · The Descent"
                caption="Thunder tore the winter sky as an unemployed goddess stepped down into broken bones."
                reducedMotion={reducedMotion}
              />

              <Scene06LailaMortal
                reducedMotion={reducedMotion}
                activeSceneIndex={activeSceneIndex}
                onInspectPanel={setInspectedPanel}
                onSkipNextScene={() => handleJumpToScene('scene-07')}
              />

              <Scene07Hospital
                reducedMotion={reducedMotion}
                activeSceneIndex={activeSceneIndex}
                onInspectPanel={setInspectedPanel}
                onSkipNextScene={() => handleJumpToScene('scene-08')}
              />

              <Scene08Escape
                reducedMotion={reducedMotion}
                activeSceneIndex={activeSceneIndex}
                onInspectPanel={setInspectedPanel}
                onSkipNextScene={() => handleJumpToScene('scene-09')}
              />

              <CinematicTransition
                kind="kinetic-sweep"
                fromColor="#181426"
                toColor="#0a0b15"
                accentColor="#f5b041"
                eyebrow="Transition VI · Midnight Highway"
                caption="Bare feet struck wet pavement just as twelve-wheeler beams swept down the avenue."
                reducedMotion={reducedMotion}
              />

              <Scene09SecondDeath
                reducedMotion={reducedMotion}
                activeSceneIndex={activeSceneIndex}
                onInspectPanel={setInspectedPanel}
                onSkipNextScene={() => handleJumpToScene('scene-10')}
              />

              <CinematicTransition
                kind="dawn-mist"
                fromColor="#0a0b15"
                toColor="#171c26"
                accentColor="#f2a866"
                eyebrow="Transition VII · Eight Years Later"
                caption="Harbour mist lifted off the Gateway of India, carrying the warmth of morning tea."
                reducedMotion={reducedMotion}
              />

              <Scene10EightYearsLater
                reducedMotion={reducedMotion}
                activeSceneIndex={activeSceneIndex}
                onReplayChapter={handleReplayChapter}
                onReplayPrologue={handleReplayPrologue}
                onInspectPanel={setInspectedPanel}
              />
            </main>

            <CinematicCaptionBar />
      </div>
    </NarrativeProvider>
  );
}
