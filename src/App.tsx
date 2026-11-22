/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
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
import { Scene01Mumbai } from './components/scenes/Scene01Mumbai';
import { Scene02Traffic } from './components/scenes/Scene02Traffic';
import type { InspectedPanelData } from './components/PanelInspectorModal';
import { NarrativeProvider } from './narrative/NarrativeEngine';
import { SCENE_NARRATION_BEATS } from './narrative/narrativeManifest';
import { CinematicCaptionBar } from './components/CinematicCaptionBar';
import { CinematicStartupCurtain } from './components/CinematicStartupCurtain';

// Deferred scenes lazy-loaded to optimize initial bundle size while preserving rock-solid layout
const Scene03Party = lazy(() => import('./components/scenes/Scene03Party').then((m) => ({ default: m.Scene03Party })));
const Scene04DeathsWorld = lazy(() => import('./components/scenes/Scene04DeathsWorld').then((m) => ({ default: m.Scene04DeathsWorld })));
const Scene05TwoEvents = lazy(() => import('./components/scenes/Scene05TwoEvents').then((m) => ({ default: m.Scene05TwoEvents })));
const Scene06LailaMortal = lazy(() => import('./components/scenes/Scene06LailaMortal').then((m) => ({ default: m.Scene06LailaMortal })));
const Scene07Hospital = lazy(() => import('./components/scenes/Scene07Hospital').then((m) => ({ default: m.Scene07Hospital })));
const Scene08Escape = lazy(() => import('./components/scenes/Scene08Escape').then((m) => ({ default: m.Scene08Escape })));
const Scene09SecondDeath = lazy(() => import('./components/scenes/Scene09SecondDeath').then((m) => ({ default: m.Scene09SecondDeath })));
const Scene10EightYearsLater = lazy(() => import('./components/scenes/Scene10EightYearsLater').then((m) => ({ default: m.Scene10EightYearsLater })));
const PanelInspectorModal = lazy(() => import('./components/PanelInspectorModal').then((m) => ({ default: m.PanelInspectorModal })));

const SceneFallback: React.FC<{ id: string; heightVh: number }> = ({ id, heightVh }) => (
  <section
    id={id}
    className="relative w-full bg-[#0b0d17] flex items-center justify-center pointer-events-none"
    style={{ height: `${heightVh}vh` }}
    aria-hidden="true"
  >
    <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#f28b50] animate-spin" />
  </section>
);

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __STORYVERSE_AUDIO_TRACE__?: boolean;
    __STORYVERSE_SCROLL_TO__?: (scrollY: number) => void;
  }
}

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
  const [isStageReady, setIsStageReady] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(getPrefersReducedMotion);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [sceneBounds, setSceneBounds] = useState<SceneBound[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [inspectedPanel, setInspectedPanel] = useState<InspectedPanelData | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const lastLayoutSigRef = useRef<string>('');
  const sectionTopsRef = useRef<number[]>([]);
  const lastPublishedProgressRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Automatic Audio Initialization: Attempt immediate playback and register user interaction unlock
  useEffect(() => {
    soundscape.ensureAutoplayUnlocked(() => {
      setIsMuted(false);
    });
    const syncMuteState = () => {
      setIsMuted(soundscape.getMuted());
    };
    return soundscape.subscribe(syncMuteState);
  }, []);

  // Initialize Single Coordinated Scroll Architecture: Lenis smooth scroll + GSAP ScrollTrigger
  useEffect(() => {
    const updateLayout = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const tops = CHAPTER_SCENES.map((scene) => {
        const el = document.getElementById(scene.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });
      sectionTopsRef.current = tops;
      const sig = `${Math.round(maxScroll)}:${Math.round(window.innerHeight)}`;
      if (sig !== lastLayoutSigRef.current) {
        lastLayoutSigRef.current = sig;
        setSceneBounds(computeNormalizedSceneBounds(tops, maxScroll, window.innerHeight));
      }
    };

    const updateProgress = () => {
      if (!hasEntered) return;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const nextProgress = clamp01(window.scrollY / maxScroll);
      if (Math.abs(nextProgress - lastPublishedProgressRef.current) >= 0.001 || nextProgress === 0 || nextProgress === 1) {
        lastPublishedProgressRef.current = nextProgress;
        setScrollProgress(nextProgress);
      }

      const tops = sectionTopsRef.current;
      const nextIdx = resolveActiveSceneByOffsets(window.scrollY, window.innerHeight, tops);
      // The voice owner follows the same real section boundaries used by each
      // stage's ScrollTrigger. The chapter chrome can switch at its focal line,
      // but that earlier visual transition must not claim narration ownership.
      let ownerIdx = 0;
      for (let i = 1; i < tops.length; i += 1) {
        if (window.scrollY >= tops[i]) ownerIdx = i;
        else break;
      }
      characterVoicePlayer.setActiveScene(CHAPTER_SCENES[ownerIdx]?.id ?? null);
      setActiveSceneIndex((prev) => (prev !== nextIdx ? nextIdx : prev));
    };

    const handleResize = () => {
      updateLayout();
      updateProgress();
    };
    const removeDebugScroll = () => {
      if (window.__STORYVERSE_AUDIO_TRACE__) delete window.__STORYVERSE_SCROLL_TO__;
    };

    // If user prefers reduced motion, disable Lenis completely and run native instant scrolling
    if (reducedMotion) {
      if (window.__STORYVERSE_AUDIO_TRACE__) {
        window.__STORYVERSE_SCROLL_TO__ = (scrollY) => {
          window.scrollTo({ top: scrollY, behavior: 'instant' });
          ScrollTrigger.update();
          updateProgress();
        };
      }
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });
      handleResize();
      ScrollTrigger.refresh();
      return () => {
        removeDebugScroll();
        window.removeEventListener('scroll', updateProgress);
        window.removeEventListener('resize', handleResize);
      };
    }

    // Single source of truth: Lenis drives ScrollTrigger updates and progress
    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.0,
    });
    lenisRef.current = lenis;
    if (window.__STORYVERSE_AUDIO_TRACE__) {
      window.__STORYVERSE_SCROLL_TO__ = (scrollY) => {
        lenis.scrollTo(scrollY, { immediate: true, force: true });
        ScrollTrigger.update();
        updateProgress();
      };
    }

    lenis.on('scroll', () => {
      ScrollTrigger.update();
      updateProgress();
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(500, 33);

    ScrollTrigger.addEventListener('refresh', updateLayout);

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
      updateProgress();
    }, 280);

    return () => {
      removeDebugScroll();
      ScrollTrigger.removeEventListener('refresh', updateLayout);
      window.clearTimeout(refreshTimer);
      window.removeEventListener('resize', updateProgress);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [hasEntered, reducedMotion]);

  const activeScene = CHAPTER_SCENES[activeSceneIndex] ?? CHAPTER_SCENES[0];

  // Sync audio mood to current scene and preload/prune audio buffers dynamically
  useEffect(() => {
    if (!hasEntered) return;
    soundscape.setMood(activeScene.theme.mood);

    // Preload immediate next scene audio to eliminate start latency
    const nextScene = CHAPTER_SCENES[activeSceneIndex + 1];
    if (nextScene) {
      soundscape.preloadNextSceneAudio(nextScene.theme.mood);
    }

    // Prune distant scene audio buffers to prevent Web Audio memory accumulation
    soundscape.pruneDistantSceneAudio(activeSceneIndex);
  }, [activeScene.theme.mood, activeSceneIndex, hasEntered]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      soundscape.dispose();
    };
  }, []);

  const handleToggleMute = useCallback(() => {
    if (isMuted) {
      soundscape.unmute();
      setIsMuted(false);
    } else {
      soundscape.mute();
      setIsMuted(true);
    }
  }, [isMuted]);

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

  const jumpToScene02 = useCallback(() => handleJumpToScene('scene-02'), [handleJumpToScene]);
  const jumpToScene03 = useCallback(() => handleJumpToScene('scene-03'), [handleJumpToScene]);
  const jumpToScene04 = useCallback(() => handleJumpToScene('scene-04'), [handleJumpToScene]);
  const jumpToScene05 = useCallback(() => handleJumpToScene('scene-05'), [handleJumpToScene]);
  const jumpToScene06 = useCallback(() => handleJumpToScene('scene-06'), [handleJumpToScene]);
  const jumpToScene07 = useCallback(() => handleJumpToScene('scene-07'), [handleJumpToScene]);
  const jumpToScene08 = useCallback(() => handleJumpToScene('scene-08'), [handleJumpToScene]);
  const jumpToScene09 = useCallback(() => handleJumpToScene('scene-09'), [handleJumpToScene]);
  const jumpToScene10 = useCallback(() => handleJumpToScene('scene-10'), [handleJumpToScene]);

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

  const handleStageReady = useCallback(() => {
    setIsStageReady(true);
  }, []);

  return (
    <NarrativeProvider narrativeBeats={SCENE_NARRATION_BEATS}>
      <div
        className="relative min-h-screen bg-[#0b0d17] text-[#f4efe6]"
        data-active-scene={hasEntered ? activeScene.id : 'prologue'}
      >
        <CinematicStartupCurtain
          reducedMotion={reducedMotion}
          onReady={handleStageReady}
        />

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

        <Suspense fallback={null}>
          <PanelInspectorModal
            panel={inspectedPanel}
            onClose={() => setInspectedPanel(null)}
          />
        </Suspense>

        <main className="relative z-20">
          <Scene00Prologue
            reducedMotion={reducedMotion}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onUnlockAudio={() => {
              soundscape.unmute();
              setIsMuted(false);
            }}
          />

          <Scene01Mumbai
            reducedMotion={reducedMotion}
            activeSceneIndex={activeSceneIndex}
            onInspectPanel={setInspectedPanel}
            onSkipNextScene={jumpToScene02}
          />

          <CinematicTransition
            kind="ink-spread"
            fromColor="#141225"
            toColor="#1c1824"
            accentColor="#f28b50"
            eyebrow="Transition I · Street Level"
            caption="As sunset sank below the skyline, engines idled bumper-to-bumper along the Bandra-Kurla overpass."
            artworkUrl="/assets/chapter1/p06_panel01.webp"
            altText="Bandra-Kurla elevated highway overpass descending into traffic at dusk"
            reducedMotion={reducedMotion}
          />

          <Scene02Traffic
            reducedMotion={reducedMotion}
            activeSceneIndex={activeSceneIndex}
            onInspectPanel={setInspectedPanel}
            onSkipNextScene={jumpToScene03}
          />

          <CinematicTransition
            kind="panel-slice"
            fromColor="#1c1824"
            toColor="#13162b"
            accentColor="#e66c8b"
            eyebrow="Transition II · Six Floors Above"
            caption="Across Parel, neon haze spilled out from an open apartment window above the rush."
            artworkUrl="/assets/chapter1/p08_panel01.webp"
            reducedMotion={reducedMotion}
          />

          <Suspense fallback={<SceneFallback id="scene-03" heightVh={320} />}>
            <Scene03Party
              reducedMotion={reducedMotion}
              activeSceneIndex={activeSceneIndex}
              onInspectPanel={setInspectedPanel}
              onSkipNextScene={jumpToScene04}
            />
          </Suspense>

          <CinematicTransition
            kind="celestial-portal"
            fromColor="#13162b"
            toColor="#16283d"
            accentColor="#8ad3eb"
            eyebrow="Transition III · Beyond Mortal Clouds"
            caption="Far above cigarette smoke and gridlock, a slender silvered tower pierced an endless twilight."
            artworkUrl="/assets/chapter1/p10_panel01.webp"
            reducedMotion={reducedMotion}
          />

          <Suspense fallback={<SceneFallback id="scene-04" heightVh={420} />}>
            <Scene04DeathsWorld
              reducedMotion={reducedMotion}
              activeSceneIndex={activeSceneIndex}
              onInspectPanel={setInspectedPanel}
              onSkipNextScene={jumpToScene05}
            />
          </Suspense>

          <CinematicTransition
            kind="temporal-split"
            fromColor="#16283d"
            toColor="#1c1429"
            accentColor="#f06a7e"
            eyebrow="Transition IV · 10:02 PM Divergence"
            caption="Two lives—one plummeting through open air, one forcing his way into his first breath."
            artworkUrl="/assets/chapter1/p13_panel01.webp"
            reducedMotion={reducedMotion}
          />

          <Suspense fallback={<SceneFallback id="scene-05" heightVh={360} />}>
            <Scene05TwoEvents
              reducedMotion={reducedMotion}
              activeSceneIndex={activeSceneIndex}
              onInspectPanel={setInspectedPanel}
              onSkipNextScene={jumpToScene06}
            />
          </Suspense>

          <CinematicTransition
            kind="celestial-portal"
            fromColor="#1c1429"
            toColor="#11162a"
            accentColor="#8ad3eb"
            eyebrow="Transition V · The Celestial Stairwell"
            caption="In the quiet expanse of the divine spire, Death stood before the cosmic accountant to surrender her mantle."
            artworkUrl="/assets/chapter1/p16_panel01.webp"
            reducedMotion={reducedMotion}
          />

          <Suspense fallback={<SceneFallback id="scene-06" heightVh={360} />}>
            <Scene06LailaMortal
              reducedMotion={reducedMotion}
              activeSceneIndex={activeSceneIndex}
              onInspectPanel={setInspectedPanel}
              onSkipNextScene={jumpToScene07}
            />
          </Suspense>

          <CinematicTransition
            kind="storm-dissolve"
            fromColor="#11162a"
            toColor="#14202b"
            accentColor="#63b8d6"
            eyebrow="Transition VI · The Descent"
            caption="Thunder tore the winter sky as an unemployed goddess stepped down into broken bones."
            artworkUrl="/assets/chapter1/p17_panel01.webp"
            reducedMotion={reducedMotion}
          />

          <Suspense fallback={<SceneFallback id="scene-07" heightVh={380} />}>
            <Scene07Hospital
              reducedMotion={reducedMotion}
              activeSceneIndex={activeSceneIndex}
              onInspectPanel={setInspectedPanel}
              onSkipNextScene={jumpToScene08}
            />
          </Suspense>

          <CinematicTransition
            kind="panel-slice"
            fromColor="#14202b"
            toColor="#181426"
            accentColor="#f06a7e"
            eyebrow="Transition VII · Into the Rain"
            caption="Holding the infant to her chest, Laila slipped through emergency doors into the Mumbai storm."
            artworkUrl="/assets/chapter1/p20_panel01.webp"
            reducedMotion={reducedMotion}
          />

          <Suspense fallback={<SceneFallback id="scene-08" heightVh={360} />}>
            <Scene08Escape
              reducedMotion={reducedMotion}
              activeSceneIndex={activeSceneIndex}
              onInspectPanel={setInspectedPanel}
              onSkipNextScene={jumpToScene09}
            />
          </Suspense>

          <CinematicTransition
            kind="kinetic-sweep"
            fromColor="#181426"
            toColor="#0a0b15"
            accentColor="#f5b041"
            eyebrow="Transition VIII · Midnight Highway"
            caption="Bare feet struck wet pavement just as twelve-wheeler beams swept down the avenue."
            artworkUrl="/assets/chapter1/p24_panel01.webp"
            reducedMotion={reducedMotion}
          />

          <Suspense fallback={<SceneFallback id="scene-09" heightVh={320} />}>
            <Scene09SecondDeath
              reducedMotion={reducedMotion}
              activeSceneIndex={activeSceneIndex}
              onInspectPanel={setInspectedPanel}
              onSkipNextScene={jumpToScene10}
            />
          </Suspense>

          <CinematicTransition
            kind="dawn-mist"
            fromColor="#0a0b15"
            toColor="#171c26"
            accentColor="#f2a866"
            eyebrow="Transition IX · Eight Years Later"
            caption="Harbour mist lifted off the Gateway of India, carrying the warmth of morning tea."
            artworkUrl="/assets/chapter1/p25_panel01.webp"
            reducedMotion={reducedMotion}
          />

          <Suspense fallback={<SceneFallback id="scene-10" heightVh={380} />}>
            <Scene10EightYearsLater
              reducedMotion={reducedMotion}
              activeSceneIndex={activeSceneIndex}
              onReplayChapter={handleReplayChapter}
              onReplayPrologue={handleReplayPrologue}
              onInspectPanel={setInspectedPanel}
            />
          </Suspense>
        </main>

            <CinematicCaptionBar />
      </div>
    </NarrativeProvider>
  );
}
