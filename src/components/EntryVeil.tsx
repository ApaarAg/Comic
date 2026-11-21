import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import mumbaiSkylineUrl from '../assets/images/mumbai_skyline_backdrop_1795078714752.jpg';
import mumbaiCloudsUrl from '../assets/images/mumbai_clouds_haze_1795078713772.jpg';
import mumbaiSilhouettesUrl from '../assets/images/mumbai_foreground_silhouettes_1795078713773.jpg';
import {
  PROLOGUE_MOMENTS,
  PROLOGUE_NARRATION_BEATS,
} from '../story/prologueScript';
import {
  clamp01,
  computePrologueVisualState,
  computeVisibleWordCount,
} from '../story/scrollMath';
import { sceneAudioManager } from '../audio/SceneAudioManager';
import { characterVoicePlayer } from '../audio/CharacterVoicePlayer';
import { MOTION_EASING } from '../story/motionSystem';

gsap.registerPlugin(ScrollTrigger);

interface EntryVeilProps {
  onEnter: (options?: { withAudio?: boolean }) => void;
  reducedMotion: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const EntryVeil: React.FC<EntryVeilProps> = ({
  onEnter,
  reducedMotion,
  isMuted,
  onToggleMute,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cameraStageRef = useRef<HTMLDivElement>(null);
  const leftSilhouetteRef = useRef<HTMLDivElement>(null);
  const rightSilhouetteRef = useRef<HTMLDivElement>(null);
  const portalBloomRef = useRef<HTMLDivElement>(null);
  const particleHostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const exitedRef = useRef(false);
  const lastNarrationIdRef = useRef<string | null>(null);
  const hasTriggeredOpeningRef = useRef(false);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [isPlayingAutoplay, setIsPlayingAutoplay] = useState(false);
  const [narrationProgress, setNarrationProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'idle' | 'recorded' | 'cadence'>('idle');
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  const visual = computePrologueVisualState(scrollProgress, PROLOGUE_MOMENTS);
  const currentMoment = PROLOGUE_MOMENTS[visual.momentIndex] ?? PROLOGUE_MOMENTS[0];
  const activeBeat = PROLOGUE_NARRATION_BEATS[0];

  // Choreographed multi-plane camera portal transition into Scene 01 original comic artwork
  const triggerEnter = useCallback(
    (withAudio = !isMuted) => {
      if (exitedRef.current) return;
      exitedRef.current = true;
      setExiting(true);
      characterVoicePlayer.stop();
      sceneAudioManager.triggerCue('transition');

      if (reducedMotion || !stageRef.current) {
        window.setTimeout(() => {
          window.scrollTo(0, 0);
          onEnter({ withAudio });
        }, 90);
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          window.scrollTo(0, 0);
          onEnter({ withAudio });
        },
      });

      if (leftSilhouetteRef.current) {
        tl.to(
          leftSilhouetteRef.current,
          { xPercent: -35, opacity: 0, duration: 0.72, ease: MOTION_EASING.cinematic },
          0,
        );
      }
      if (rightSilhouetteRef.current) {
        tl.to(
          rightSilhouetteRef.current,
          { xPercent: 35, opacity: 0, duration: 0.72, ease: MOTION_EASING.cinematic },
          0,
        );
      }
      if (cameraStageRef.current) {
        tl.to(
          cameraStageRef.current,
          { scale: 1.35, duration: 0.76, ease: MOTION_EASING.cinematic },
          0,
        );
      }
      if (portalBloomRef.current) {
        tl.fromTo(
          portalBloomRef.current,
          { opacity: 0, scale: 0.75 },
          { opacity: 1, scale: 1.4, duration: 0.6, ease: MOTION_EASING.editorial },
          0.08,
        );
      }
      tl.to(
        stageRef.current,
        { opacity: 0, duration: 0.32, ease: 'power2.in' },
        0.52,
      );
    },
    [isMuted, onEnter, reducedMotion],
  );

  // Subtle pointer parallax on desktop when motion is allowed
  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 14;
      const ny = (e.clientY / window.innerHeight - 0.5) * 10;
      setPointerOffset({ x: nx, y: ny });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [reducedMotion]);

  // Three.js falling starlight & ember field
  useEffect(() => {
    if (reducedMotion || exiting || !particleHostRef.current) return;
    const host = particleHostRef.current;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'default',
      });
    } catch {
      return;
    }

    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(54, w / h, 0.1, 50);
    camera.position.z = 7;

    const count = 120;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cWarm = new THREE.Color('#f7a06d');
    const cTeal = new THREE.Color('#7bc8e2');
    const cRose = new THREE.Color('#e66c8b');

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      const pick = i % 3 === 0 ? cWarm : i % 3 === 1 ? cTeal : cRose;
      colors[i * 3] = pick.r;
      colors[i * 3 + 1] = pick.g;
      colors[i * 3 + 2] = pick.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.085,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let frameId = 0;
    let disposed = false;
    const start = performance.now();

    const tick = () => {
      if (disposed || !renderer) return;
      const t = (performance.now() - start) * 0.001;
      points.rotation.y = t * 0.025;
      points.position.y = Math.sin(t * 0.35) * 0.14;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(tick);
    };

    const onResize = () => {
      if (disposed || !renderer) return;
      const nw = Math.max(1, host.clientWidth);
      const nh = Math.max(1, host.clientHeight);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh, false);
    };
    window.addEventListener('resize', onResize, { passive: true });
    tick();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      renderer?.dispose();
      if (renderer && renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [exiting, reducedMotion]);

  // Scroll sync across the 5 prologue moments
  useEffect(() => {
    if (reducedMotion || !trackRef.current) return;
    const triggerEl = trackRef.current;

    const onScroll = () => {
      const maxScroll = Math.max(1, triggerEl.scrollHeight - window.innerHeight);
      const p = clamp01(window.scrollY / maxScroll);
      setScrollProgress(p);
      if (p >= 0.985 && !exitedRef.current) {
        triggerEnter(!isMuted);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [isMuted, reducedMotion, triggerEnter]);

  // Audio ambience state synchronization & opening unlock
  useEffect(() => {
    if (visual.momentIndex >= 1) {
      sceneAudioManager.setMood('sunset');
    } else {
      sceneAudioManager.setMood('prologue');
    }
  }, [visual.momentIndex]);

  // Narration playback (The Chronicle · George / ElevenLabs)
  const playNarrationBeat = useCallback(
    (beat: (typeof PROLOGUE_NARRATION_BEATS)[number]) => {
      setNarrationProgress(0.12);
      void characterVoicePlayer.playLine(beat.id, beat.voiceAsset, beat.durationMs, {
        onStart: (state) => {
          setVoiceMode(state === 'playing-recording' ? 'recorded' : 'cadence');
        },
        onProgress: (elapsed, total) => {
          setNarrationProgress(total > 0 ? Math.min(1, Math.max(0, elapsed / total)) : 1);
        },
        onComplete: () => {
          setVoiceMode('idle');
          setNarrationProgress(1);
        },
      }, 'scene-00');
    },
    [],
  );

  // Autoplay unlock listener to start opening ambience, score and narration from frame 0
  useEffect(() => {
    sceneAudioManager.ensureAutoplayUnlocked(() => {
      if (!hasTriggeredOpeningRef.current && !exitedRef.current) {
        hasTriggeredOpeningRef.current = true;
        lastNarrationIdRef.current = activeBeat.id;
        playNarrationBeat(activeBeat);
      }
    });

    // Start immediately if audio is already unlocked or supported
    if (!hasTriggeredOpeningRef.current && !exitedRef.current) {
      hasTriggeredOpeningRef.current = true;
      lastNarrationIdRef.current = activeBeat.id;
      playNarrationBeat(activeBeat);
    }
  }, [activeBeat, playNarrationBeat]);

  useEffect(() => {
    // When user enters Scene C directly (e.g. via jump or autoplay)
    if (visual.narrationOpacity > 0.35 && !hasTriggeredOpeningRef.current) {
      hasTriggeredOpeningRef.current = true;
      lastNarrationIdRef.current = activeBeat.id;
      playNarrationBeat(activeBeat);
    }
  }, [activeBeat, playNarrationBeat, visual.narrationOpacity]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      characterVoicePlayer.stop();
    };
  }, []);

  const jumpToMoment = (momentStart: number) => {
    if (!trackRef.current) return;
    const maxScroll = Math.max(1, trackRef.current.scrollHeight - window.innerHeight);
    window.scrollTo({
      top: Math.round(maxScroll * Math.min(0.96, momentStart + 0.02)),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  // Optional Cinematic Auto-play: gently increments scroll position through the 5 scenes
  useEffect(() => {
    if (!isPlayingAutoplay || !trackRef.current || reducedMotion) return;
    let animId = 0;
    const maxScroll = Math.max(1, trackRef.current.scrollHeight - window.innerHeight);
    const scrollPerSec = maxScroll / 22; // ~22 seconds total cinematic presentation

    let lastTime = performance.now();
    const step = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const currentY = window.scrollY;
      const nextY = currentY + scrollPerSec * dt;
      window.scrollTo(0, nextY);

      if (nextY >= maxScroll * 0.98) {
        setIsPlayingAutoplay(false);
        triggerEnter(!isMuted);
      } else {
        animId = window.requestAnimationFrame(step);
      }
    };
    animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [isPlayingAutoplay, isMuted, reducedMotion, triggerEnter]);

  // Reduced motion accessible fallback
  if (reducedMotion) {
    return (
      <section
        aria-label="Chapter One Prologue"
        data-testid="cinematic-prologue"
        data-prologue-moment="reduced-motion"
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070912] px-6 py-16 text-[#fbf6ee]"
      >
        <img
          src={mumbaiSkylineUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#070912]/80 via-[#090d1a]/75 to-[#070912]/95"
        />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#f28b50]">
            The Many Deaths of Laila Starr · Chapter 01
          </p>
          <h1 className="font-display mt-4 text-5xl font-semibold leading-tight tracking-tight sm:text-7xl [text-wrap:balance]">
            Once Upon a Falling Starr
          </h1>
          <div className="mt-8 space-y-4 text-left border-y border-white/12 py-6">
            <p className="font-display text-xl italic leading-relaxed text-[#ece3d7]/90">
              &ldquo;{activeBeat.text}&rdquo;
            </p>
          </div>
          <div className="mt-8 flex items-center justify-center">
            <button
              type="button"
              data-testid="enter-chapter-btn"
              onClick={() => triggerEnter(true)}
              className="inline-flex items-center gap-3 border border-[#f28b50] bg-[#f28b50] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#090d1a] hover:scale-105 transition-transform cursor-pointer"
            >
              <span>Enter Chapter One</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  const narrationWords = activeBeat.text.trim().split(/\s+/).filter(Boolean);
  const visibleNarrationCount = computeVisibleWordCount(activeBeat.text, narrationProgress);

  const leftSilhouetteShift = Math.round(
    -10 - visual.mumbaiReveal * 8 - visual.portalProgress * 36 - pointerOffset.x * 0.25,
  );
  const rightSilhouetteShift = Math.round(
    10 + visual.mumbaiReveal * 8 + visual.portalProgress * 36 - pointerOffset.x * 0.25,
  );

  return (
    <section
      ref={trackRef}
      aria-label="Chapter One Cinematic Prologue"
      data-testid="cinematic-prologue"
      data-prologue-moment={currentMoment.id}
      data-prologue-progress={Math.round(visual.progress * 100)}
      className="relative h-[550vh] bg-[#070912] text-[#fbf6ee]"
    >
      {/* Sticky Full-Viewport Film Stage */}
      <div
        ref={stageRef}
        className={`sticky top-0 h-screen w-full overflow-hidden bg-[#070912] film-letterbox ${
          exiting ? 'pointer-events-none' : ''
        }`}
      >
        {/* Top Cinematic Navigation & Unobtrusive Controls */}
        <header className="absolute top-0 inset-x-0 z-40 flex items-center justify-between gap-3 px-4 py-3.5 md:px-10">
          <div className="flex items-center gap-2.5 text-[11px] sm:text-xs tracking-[0.2em] uppercase text-[#e7ddd0]/85 min-w-0">
            <span className="h-[2px] w-4 shrink-0 bg-[#f28b50]" aria-hidden="true" />
            <span className="font-mono text-[#f28b50] font-semibold tabular-nums shrink-0">
              SCENE {currentMoment.code}
            </span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span className="truncate font-medium text-[#f5efe6]/90">
              {currentMoment.title}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Auto Play / Pause Toggle */}
            <button
              type="button"
              onClick={() => setIsPlayingAutoplay((prev) => !prev)}
              aria-label={isPlayingAutoplay ? 'Pause cinematic intro' : 'Auto-play cinematic intro'}
              className="inline-flex h-9 sm:h-10 items-center gap-2 border border-white/20 bg-[#0b0e1b]/85 px-3 sm:px-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#f5efe6] backdrop-blur-md transition-colors hover:border-[#f28b50] cursor-pointer"
            >
              {isPlayingAutoplay ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-[#f28b50]" />
                  <span className="hidden md:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-[#f28b50]" />
                  <span className="hidden md:inline">Auto Play</span>
                </>
              )}
            </button>

            {/* Replay Intro */}
            <button
              type="button"
              onClick={() => jumpToMoment(0)}
              title="Restart from Scene A"
              aria-label="Restart from Scene A"
              className="inline-flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center border border-white/20 bg-[#0b0e1b]/85 text-[#f5efe6] backdrop-blur-md transition-colors hover:border-[#f28b50] hover:text-[#f28b50] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Skip Intro */}
            <button
              type="button"
              data-testid="skip-prologue-btn"
              onClick={() => triggerEnter(true)}
              className="inline-flex h-9 sm:h-10 items-center gap-2 border border-[#f28b50]/60 bg-[#f28b50]/20 px-3.5 sm:px-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[#fbf6ee] backdrop-blur-md transition-all hover:bg-[#f28b50] hover:text-[#090d1a] cursor-pointer whitespace-nowrap"
            >
              <span>Skip Intro</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Camera Stage Container */}
        <div
          ref={cameraStageRef}
          aria-hidden="true"
          className="absolute -inset-8 will-change-transform"
          style={{
            transform: `translate3d(${-pointerOffset.x * 0.4}px, ${
              visual.cameraPanY - pointerOffset.y * 0.35
            }px, 0) scale(${visual.cameraZoom + visual.portalProgress * 0.18})`,
            transition: `transform 160ms ${MOTION_EASING.cssSettle}`,
          }}
        >
          {/* Layer 1: Mumbai Dusk Horizon Skyline + Video */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: Math.max(0.04, visual.mumbaiReveal) }}
          >
            <img
              src={mumbaiSkylineUrl}
              alt=""
              className="h-full w-full object-cover object-center"
            />
            {!videoError && (
              <video
                ref={videoRef}
                src="/assets/videos/scene01_mumbai.mp4"
                poster={mumbaiSkylineUrl}
                muted
                loop
                playsInline
                preload="auto"
                onLoadedData={() => setVideoReady(true)}
                onError={() => setVideoError(true)}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                style={{ opacity: videoReady ? 0.85 : 0 }}
              />
            )}
          </div>

          {/* Layer 2: Watercolor Dusk Cloud Haze */}
          <div
            className="mumbai-cloud-a pointer-events-none absolute inset-0"
            style={{ opacity: 0.15 + visual.mumbaiReveal * 0.35 }}
          >
            <img
              src={mumbaiCloudsUrl}
              alt=""
              className="h-full w-full object-cover mix-blend-screen opacity-70"
            />
          </div>

          {/* Layer 3: Foreground Mumbai Silhouettes */}
          <div
            ref={leftSilhouetteRef}
            className="pointer-events-none absolute inset-y-0 -left-16 w-[48%] overflow-hidden will-change-transform"
            style={{
              opacity: Math.max(0.12, 0.85 - visual.portalProgress * 0.68),
              transform: `translate3d(${leftSilhouetteShift}%, 2%, 0) scale(1.06)`,
              WebkitMaskImage:
                'linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.68) 40%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0) 88%)',
              maskImage:
                'linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.68) 40%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0) 88%)',
            }}
          >
            <img
              src={mumbaiSilhouettesUrl}
              alt=""
              className="h-full w-full object-cover object-left mix-blend-multiply opacity-90"
            />
          </div>

          <div
            ref={rightSilhouetteRef}
            className="pointer-events-none absolute inset-y-0 -right-16 w-[48%] overflow-hidden will-change-transform"
            style={{
              opacity: Math.max(0.12, 0.85 - visual.portalProgress * 0.68),
              transform: `translate3d(${rightSilhouetteShift}%, 2%, 0) scale(1.06) scaleX(-1)`,
              WebkitMaskImage:
                'linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.68) 40%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0) 88%)',
              maskImage:
                'linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.68) 40%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0) 88%)',
            }}
          >
            <img
              src={mumbaiSilhouettesUrl}
              alt=""
              className="h-full w-full object-cover object-left mix-blend-multiply opacity-90"
            />
          </div>

          {/* Layer 4: Late December Coral Glow Lighting */}
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.25 + visual.mumbaiReveal * 0.75,
              background:
                'radial-gradient(ellipse 76% 58% at 50% 46%, rgba(242, 139, 80, 0.26), rgba(217, 91, 102, 0.12) 48%, rgba(7, 9, 18, 0.82) 100%)',
            }}
          />
        </div>

        {/* Scene A Darkness Veil */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#070912] transition-opacity duration-500"
          style={{
            opacity: visual.darknessVeilOpacity,
          }}
        />

        {/* Portal Light Aperture Overlay */}
        <div
          ref={portalBloomRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 opacity-0"
          style={{
            background:
              'radial-gradient(circle at 50% 48%, rgba(242, 139, 80, 0.6) 0%, rgba(217, 91, 102, 0.35) 40%, rgba(20, 18, 37, 0.98) 78%)',
          }}
        />

        {/* Three.js Celestial Particle Field */}
        <div
          ref={particleHostRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
        />

        {/* ── SCENE A: THE DARKNESS (0.00 – 0.20) ────────────────────────── */}
        {visual.momentIndex === 0 && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
            <p className="font-mono text-xs uppercase tracking-[0.38em] text-[#f28b50]/90">
              Scene A · The Void
            </p>
            <p className="font-display mt-5 max-w-md text-2xl sm:text-3xl italic leading-relaxed text-[#f4efe6]/85 [text-wrap:balance]">
              &ldquo;Before the heat and horns of Mumbai, there was only silence.&rdquo;
            </p>
            <div className="mt-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#f28b50]/70 animate-pulse">
              <span>Scroll to Begin the Journey</span>
              <ArrowDown className="h-3.5 w-3.5" />
            </div>
          </div>
        )}

        {/* Opening Narration Subtitle in Scene A / B */}
        {visual.momentIndex <= 1 && (
          <div className="absolute inset-x-0 bottom-24 sm:bottom-28 z-30 mx-auto max-w-2xl px-5 transition-opacity duration-500">
            <div className="border border-[#f28b50]/40 bg-[#0b0e1b]/90 px-6 py-4 shadow-2xl backdrop-blur-md text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#f28b50] font-semibold">
                The Chronicle · George
              </span>
              <p className="font-display mt-1 text-base sm:text-lg italic text-[#fbf6ee]">
                &ldquo;{activeBeat.text}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* ── SCENE B: MUMBAI SKYLINE REVEALED (0.20 – 0.40) ─────────────── */}
        {visual.momentIndex === 1 && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end px-6 pb-28 text-center pointer-events-none">
            <div className="max-w-lg border border-white/12 bg-[#090d1a]/80 px-6 py-4 backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#e8a84a]">
                Scene B · Mumbai Emerges
              </p>
              <p className="font-display mt-2 text-lg italic text-[#f4efe6]/90">
                Late December sun dipping beneath the Bandra-Kurla haze.
              </p>
            </div>
          </div>
        )}

        {/* ── SCENE C: NARRATION WITH THE CHRONICLE (0.40 – 0.65) ───────── */}
        {visual.narrationOpacity > 0.05 && (
          <div
            className="absolute inset-x-0 bottom-24 sm:bottom-28 z-30 mx-auto max-w-3xl px-5 transition-transform"
            style={{
              opacity: visual.narrationOpacity,
              transform: `translate3d(0, ${Math.round((1 - visual.narrationOpacity) * 16)}px, 0)`,
            }}
          >
            <div className="border border-[#f28b50]/45 bg-[#0b0e1b]/95 px-6 py-5 sm:px-8 sm:py-6 shadow-[0_24px_60px_-14px_rgba(0,0,0,0.9)] backdrop-blur-md">
              <div className="mb-2.5 flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#f28b50] font-semibold">
                    Scene C · The Chronicle
                  </span>
                  <span className="font-mono text-[10px] text-[#cfc5b9]/70">
                    (George · ElevenLabs)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {voiceMode === 'recorded' && (
                    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#f28b50]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f28b50] animate-ping" />
                      Voice Playing
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => playNarrationBeat(activeBeat)}
                    aria-label="Replay narrator voice"
                    className="inline-flex h-7 w-7 items-center justify-center border border-white/20 text-[#e6ddd0]/85 hover:border-[#f28b50] hover:text-[#f28b50] cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <p className="font-display text-xl sm:text-2xl italic leading-snug text-[#fbf6ee]">
                {narrationWords.map((word, idx) => (
                  <span
                    key={`${activeBeat.id}-w-${idx}`}
                    className="inline-block transition-[opacity,filter] duration-200"
                    style={{
                      opacity: idx < visibleNarrationCount ? 1 : 0.08,
                      filter: `blur(${idx < visibleNarrationCount ? 0 : 2}px)`,
                      color: idx === visibleNarrationCount - 1 ? '#ffd29d' : undefined,
                    }}
                  >
                    {word}
                    {idx < narrationWords.length - 1 ? '\u00A0' : ''}
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}

        {/* ── SCENE D: GRAND CINEMATIC TITLE REVEAL (0.65 – 0.85) ────────── */}
        {visual.titleReveal > 0.04 && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 pt-12 pb-24 text-center pointer-events-none"
            style={{
              opacity: visual.titleReveal,
              transform: `translate3d(0, ${Math.round((1 - visual.titleReveal) * 20)}px, 0) scale(${
                0.985 + visual.titleReveal * 0.025
              })`,
            }}
          >
            <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.38em] text-[#f28b50]">
              A Cinematic Graphic Novel
            </p>

            <h1 className="font-display mt-4 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight text-[#fbf6ee] sm:text-7xl md:text-[5.25rem] [text-wrap:balance] drop-shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
              The Many Deaths of Laila Starr
            </h1>

            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="h-[1px] w-8 bg-[#f28b50]/60" />
              <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.28em] text-[#ffd29d]">
                Chapter 01 · Once Upon a Falling Starr
              </p>
              <span className="h-[1px] w-8 bg-[#f28b50]/60" />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs tracking-[0.1em] text-[#dfd6ca]/80">
              <span>Written by Ram V</span>
              <span aria-hidden="true">·</span>
              <span>Illustrated by Filipe Andrade</span>
              <span aria-hidden="true">·</span>
              <span>Colors by Inês Amaro</span>
            </div>
          </div>
        )}

        {/* ── SCENE E: ENTER THE COMIC PORTAL (0.85 – 1.00) ──────────────── */}
        {visual.portalProgress > 0.05 && (
          <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
            style={{
              opacity: clamp01(visual.portalProgress * 1.5),
              transform: `scale(${0.96 + visual.portalProgress * 0.05})`,
            }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#f28b50]">
              Scene E · The Descent Begins
            </p>
            <h2 className="font-display mt-3 text-4xl font-semibold text-[#fbf6ee] sm:text-6xl">
              Enter The City of Mumbai
            </h2>
            <button
              type="button"
              data-testid="enter-chapter-portal-btn"
              onClick={() => triggerEnter(!isMuted)}
              className="mt-8 inline-flex items-center gap-3 border border-[#f28b50] bg-[#f28b50] px-8 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#090d1a] shadow-2xl transition-transform duration-200 hover:scale-[1.03] cursor-pointer"
            >
              <span>Dive into Comic Artwork</span>
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Bottom Stage Progress Indicator & Direct Navigation */}
        <div className="absolute bottom-5 inset-x-0 z-40 mx-auto flex max-w-2xl flex-col items-center gap-2.5 px-6">
          <div className="flex w-full items-center gap-1.5 sm:gap-2">
            {PROLOGUE_MOMENTS.map((m, idx) => {
              const active = idx === visual.momentIndex;
              const passed = idx < visual.momentIndex;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => jumpToMoment(m.start)}
                  aria-label={`Jump to Scene ${m.code}: ${m.title}`}
                  className="group relative flex h-6 flex-1 items-center justify-center cursor-pointer"
                >
                  <span
                    className="block w-full transition-all duration-300"
                    style={{
                      height: active ? '3.5px' : '1.5px',
                      backgroundColor: active
                        ? '#f28b50'
                        : passed
                          ? 'rgba(242, 139, 80, 0.55)'
                          : 'rgba(255, 255, 255, 0.18)',
                    }}
                  />
                  <span className="sr-only">Scene {m.code}: {m.title}</span>
                </button>
              );
            })}
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#cfc5b9]/75">
            Scene {currentMoment.code} of E · {currentMoment.title}
          </p>
        </div>
      </div>
    </section>
  );
};
