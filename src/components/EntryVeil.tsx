import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
<<<<<<< HEAD
import { ArrowDown, ArrowRight, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
=======
import { ArrowDown, ArrowRight, RotateCcw, Volume2, VolumeX } from 'lucide-react';
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
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
<<<<<<< HEAD
=======
  const introTitleRef = useRef<HTMLDivElement>(null);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
  const particleHostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const exitedRef = useRef(false);
<<<<<<< HEAD
  const lastNarrationIdRef = useRef<string | null>(null);
  const hasTriggeredOpeningRef = useRef(false);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [isPlayingAutoplay, setIsPlayingAutoplay] = useState(false);
=======
  const lastCueMomentRef = useRef<number>(-1);
  const lastNarrationIdRef = useRef<string | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
  const [narrationProgress, setNarrationProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'idle' | 'recorded' | 'cadence'>('idle');
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  const visual = computePrologueVisualState(scrollProgress, PROLOGUE_MOMENTS);
  const currentMoment = PROLOGUE_MOMENTS[visual.momentIndex] ?? PROLOGUE_MOMENTS[0];
<<<<<<< HEAD
  const activeBeat = PROLOGUE_NARRATION_BEATS[0];

  // Choreographed multi-plane camera portal transition into Scene 01 original comic artwork
=======
  const activeBeat =
    PROLOGUE_NARRATION_BEATS[visual.activeNarrationIndex] ?? PROLOGUE_NARRATION_BEATS[0];

  // Choreographed multi-plane camera portal transition into Scene 01
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
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
<<<<<<< HEAD
          { xPercent: -35, opacity: 0, duration: 0.72, ease: MOTION_EASING.cinematic },
=======
          { xPercent: -28, opacity: 0, duration: 0.68, ease: MOTION_EASING.cinematic },
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          0,
        );
      }
      if (rightSilhouetteRef.current) {
        tl.to(
          rightSilhouetteRef.current,
<<<<<<< HEAD
          { xPercent: 35, opacity: 0, duration: 0.72, ease: MOTION_EASING.cinematic },
=======
          { xPercent: 28, opacity: 0, duration: 0.68, ease: MOTION_EASING.cinematic },
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          0,
        );
      }
      if (cameraStageRef.current) {
        tl.to(
          cameraStageRef.current,
<<<<<<< HEAD
          { scale: 1.35, duration: 0.76, ease: MOTION_EASING.cinematic },
=======
          { scale: 1.24, duration: 0.72, ease: MOTION_EASING.cinematic },
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          0,
        );
      }
      if (portalBloomRef.current) {
        tl.fromTo(
          portalBloomRef.current,
<<<<<<< HEAD
          { opacity: 0, scale: 0.75 },
          { opacity: 1, scale: 1.4, duration: 0.6, ease: MOTION_EASING.editorial },
=======
          { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1.35, duration: 0.56, ease: MOTION_EASING.editorial },
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          0.08,
        );
      }
      tl.to(
        stageRef.current,
<<<<<<< HEAD
        { opacity: 0, duration: 0.32, ease: 'power2.in' },
        0.52,
=======
        { opacity: 0, duration: 0.28, ease: 'power2.in' },
        0.48,
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
      );
    },
    [isMuted, onEnter, reducedMotion],
  );

<<<<<<< HEAD
=======
  // Subtle opening GSAP choreography in Moment I so initial dark screen feels alive immediately
  useEffect(() => {
    if (reducedMotion || !introTitleRef.current) return;
    const ctx = gsap.context(() => {
      const items = introTitleRef.current?.querySelectorAll('[data-intro-reveal]');
      if (!items || items.length === 0) return;
      gsap.fromTo(
        items,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 1.15,
          stagger: 0.18,
          ease: MOTION_EASING.editorial,
          delay: 0.22,
        },
      );
    }, introTitleRef);
    return () => ctx.revert();
  }, [reducedMotion]);

>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
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

<<<<<<< HEAD
  // Three.js falling starlight & ember field
=======
  // Three.js falling starlight & ember field with Software-WebGL guard + afterDraw pacing
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
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

<<<<<<< HEAD
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
=======
    const gl = renderer.getContext() as WebGL2RenderingContext;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const glRenderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(glRenderer);

    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 0.5 : Math.min(window.devicePixelRatio || 1, 1.5));
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(54, w / h, 0.1, 50);
    camera.position.z = 7;

<<<<<<< HEAD
    const count = 120;
=======
    const count = isSoftwareGl ? 48 : 140;
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
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
<<<<<<< HEAD
      opacity: 0.75,
=======
      opacity: 0.78,
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let frameId = 0;
    let disposed = false;
    const start = performance.now();

<<<<<<< HEAD
    const tick = () => {
      if (disposed || !renderer) return;
=======
    const afterDraw = (cb: () => void) => {
      if (typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 12);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 180);
          }
        };
        frameId = window.setTimeout(poll, 12);
      } else {
        frameId = window.setTimeout(cb, 180);
      }
    };

    const tick = () => {
      if (disposed || !renderer) return;
      if (document.hidden) {
        frameId = window.setTimeout(tick, 300);
        return;
      }
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
      const t = (performance.now() - start) * 0.001;
      points.rotation.y = t * 0.025;
      points.position.y = Math.sin(t * 0.35) * 0.14;
      renderer.render(scene, camera);
<<<<<<< HEAD
      frameId = window.requestAnimationFrame(tick);
=======
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
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
<<<<<<< HEAD
=======
      window.clearTimeout(frameId);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
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

<<<<<<< HEAD
  // Scroll sync across the 5 prologue moments
  useEffect(() => {
    if (reducedMotion || !trackRef.current) return;
    const triggerEl = trackRef.current;

=======
  // GSAP ScrollTrigger scrub across the 6 prologue moments
  useEffect(() => {
    if (reducedMotion || !trackRef.current) return;

    window.scrollTo(0, 0);
    const triggerEl = trackRef.current;

    const st = ScrollTrigger.create({
      trigger: triggerEl,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.35,
      onUpdate: (self) => {
        const p = clamp01(self.progress);
        setScrollProgress(p);
        if (p >= 0.985 && !exitedRef.current) {
          triggerEnter(!isMuted);
        }
      },
    });

>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
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
<<<<<<< HEAD
    };
  }, [isMuted, reducedMotion, triggerEnter]);

  // Audio ambience state synchronization & opening unlock
  useEffect(() => {
    if (visual.momentIndex >= 1) {
=======
      st.kill();
    };
  }, [isMuted, reducedMotion, triggerEnter]);

  // Synchronize audio mood & subtle cues across prologue moments
  useEffect(() => {
    if (visual.momentIndex >= 2) {
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
      sceneAudioManager.setMood('sunset');
    } else {
      sceneAudioManager.setMood('prologue');
    }
<<<<<<< HEAD
  }, [visual.momentIndex]);

  // Narration playback (The Chronicle · George / ElevenLabs)
  const playNarrationBeat = useCallback(
    (beat: (typeof PROLOGUE_NARRATION_BEATS)[number]) => {
      setNarrationProgress(0.12);
=======

    if (visual.momentIndex !== lastCueMomentRef.current) {
      const prev = lastCueMomentRef.current;
      lastCueMomentRef.current = visual.momentIndex;
      if (
        prev >= 0 &&
        (visual.momentIndex === 1 || visual.momentIndex === 3 || visual.momentIndex === 5)
      ) {
        sceneAudioManager.triggerCue('discover');
      }
    }
  }, [visual.momentIndex]);

  // Start looping Mumbai video cleanly once Mumbai horizon begins emerging (Moment 02+)
  useEffect(() => {
    if (reducedMotion || videoError || !videoRef.current) return;
    const video = videoRef.current;
    if (visual.mumbaiReveal > 0.04 || scrollProgress > 0.18) {
      if (video.paused) {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    } else if (!video.paused) {
      video.pause();
    }
  }, [reducedMotion, scrollProgress, videoError, visual.mumbaiReveal]);

  const playNarrationBeat = useCallback(
    (beat: (typeof PROLOGUE_NARRATION_BEATS)[number]) => {
      setNarrationProgress(0.14);
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
      void characterVoicePlayer.playLine(beat.id, beat.voiceAsset, beat.durationMs, {
        onStart: (state) => {
          setVoiceMode(state === 'playing-recording' ? 'recorded' : 'cadence');
        },
<<<<<<< HEAD
        onProgress: (elapsed, total) => {
          setNarrationProgress(total > 0 ? Math.min(1, Math.max(0, elapsed / total)) : 1);
        },
        onComplete: () => {
          setVoiceMode('idle');
          setNarrationProgress(1);
=======
        onComplete: () => {
          setVoiceMode('idle');
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
        },
      });
    },
    [],
  );

<<<<<<< HEAD
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
=======
  useEffect(() => {
    if (visual.narrationOpacity < 0.25) {
      lastNarrationIdRef.current = null;
      return;
    }
    if (lastNarrationIdRef.current !== activeBeat.id) {
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
      lastNarrationIdRef.current = activeBeat.id;
      playNarrationBeat(activeBeat);
    }
  }, [activeBeat, playNarrationBeat, visual.narrationOpacity]);

<<<<<<< HEAD
  // Cleanup audio on unmount
=======
  useEffect(() => {
    if (reducedMotion || visual.narrationOpacity < 0.2) {
      setNarrationProgress(1);
      return;
    }
    setNarrationProgress(0.22);
    const totalMs = Math.min(1800, Math.max(950, activeBeat.text.length * 14));
    const start = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const next = Math.min(1, 0.22 + ((now - start) / totalMs) * 0.78);
      setNarrationProgress(next);
      if (next < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };
    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [activeBeat.id, activeBeat.text.length, reducedMotion, visual.narrationOpacity]);

>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
  useEffect(() => {
    return () => {
      characterVoicePlayer.stop();
    };
  }, []);

  const jumpToMoment = (momentStart: number) => {
    if (!trackRef.current) return;
    const maxScroll = Math.max(1, trackRef.current.scrollHeight - window.innerHeight);
    window.scrollTo({
<<<<<<< HEAD
      top: Math.round(maxScroll * Math.min(0.96, momentStart + 0.02)),
=======
      top: Math.round(maxScroll * Math.min(0.96, momentStart + 0.03)),
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

<<<<<<< HEAD
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
=======
  // Reduced-motion calm editorial alternative
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
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
<<<<<<< HEAD
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
=======
            {PROLOGUE_NARRATION_BEATS.map((beat) => (
              <p
                key={beat.id}
                className="font-display text-xl italic leading-relaxed text-[#ece3d7]/90"
              >
                &ldquo;{beat.text}&rdquo;
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              data-testid="enter-chapter-btn"
              onClick={() => triggerEnter(!isMuted)}
              className="inline-flex items-center gap-3 border border-[#f28b50] bg-[#f28b50] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#090d1a] cursor-pointer"
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
            >
              <span>Enter Chapter One</span>
              <ArrowRight className="h-4 w-4" />
            </button>
<<<<<<< HEAD
=======
            <button
              type="button"
              onClick={onToggleMute}
              aria-pressed={!isMuted}
              className="inline-flex items-center gap-2 border border-white/20 bg-[#12172a]/85 px-4 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-[#f5efe6] cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-[#f28b50]" />
              )}
              <span>{isMuted ? 'Sound Off' : 'Sound On'}</span>
            </button>
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          </div>
        </div>
      </section>
    );
  }

  const narrationWords = activeBeat.text.trim().split(/\s+/).filter(Boolean);
  const visibleNarrationCount = computeVisibleWordCount(activeBeat.text, narrationProgress);

  const leftSilhouetteShift = Math.round(
<<<<<<< HEAD
    -10 - visual.mumbaiReveal * 8 - visual.portalProgress * 36 - pointerOffset.x * 0.25,
  );
  const rightSilhouetteShift = Math.round(
    10 + visual.mumbaiReveal * 8 + visual.portalProgress * 36 - pointerOffset.x * 0.25,
  );

=======
    -8 - visual.mumbaiReveal * 8 - visual.portalProgress * 32 - pointerOffset.x * 0.25,
  );
  const rightSilhouetteShift = Math.round(
    8 + visual.mumbaiReveal * 8 + visual.portalProgress * 32 - pointerOffset.x * 0.25,
  );

  // Opening title gently yields to the Moment 02 editorial mask title, then parts for Mumbai
  const momentOneTitleFade = Math.max(0, 1 - clamp01((visual.progress - 0.08) / 0.09));
  const combinedTitleOpacity = Math.max(momentOneTitleFade, visual.titleReveal);

>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
  return (
    <section
      ref={trackRef}
      aria-label="Chapter One Cinematic Prologue"
      data-testid="cinematic-prologue"
      data-prologue-moment={currentMoment.id}
      data-prologue-progress={Math.round(visual.progress * 100)}
<<<<<<< HEAD
      className="relative h-[550vh] bg-[#070912] text-[#fbf6ee]"
=======
      className="relative h-[520vh] bg-[#070912] text-[#fbf6ee]"
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
    >
      {/* Sticky Full-Viewport Film Stage */}
      <div
        ref={stageRef}
<<<<<<< HEAD
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
=======
        className={`sticky top-0 h-screen w-full overflow-hidden bg-[#070912] ${
          exiting ? 'pointer-events-none' : ''
        }`}
      >
        {/* Top Unobtrusive Prologue Bar */}
        <header className="absolute top-0 inset-x-0 z-40 flex items-center justify-between gap-3 px-4 py-3.5 md:px-10">
          <div className="flex items-center gap-2.5 text-[11px] sm:text-xs tracking-[0.2em] uppercase text-[#e7ddd0]/80 min-w-0">
            <span className="h-[1.5px] w-4 shrink-0 bg-[#f28b50]" aria-hidden="true" />
            <span className="font-mono text-[#f28b50] tabular-nums shrink-0">
              {currentMoment.code} / VI
            </span>
            <span aria-hidden="true" className="hidden sm:inline text-white/25">
              ·
            </span>
            <span className="hidden sm:inline truncate font-medium text-[#f5efe6]/90">
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
              {currentMoment.title}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
<<<<<<< HEAD
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
=======
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Enable prologue sound' : 'Mute prologue sound'}
              aria-pressed={!isMuted}
              className="inline-flex h-9 sm:h-10 items-center gap-2 border border-white/18 bg-[#0b0e1b]/82 px-3 sm:px-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#f5efe6] transition-colors hover:border-[#f28b50]/75 cursor-pointer whitespace-nowrap"
            >
              {isMuted ? (
                <VolumeX className="h-3.5 w-3.5 text-[#cfc5b9]/80" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-[#f28b50]" />
              )}
              <span className="hidden sm:inline">{isMuted ? 'Sound Off' : 'Sound On'}</span>
            </button>

            <button
              type="button"
              data-testid="skip-prologue-btn"
              onClick={() => triggerEnter(!isMuted)}
              className="inline-flex h-9 sm:h-10 items-center gap-2 border border-white/20 bg-[#0b0e1b]/82 px-3.5 sm:px-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[#fbf6ee] transition-colors hover:border-[#f28b50] hover:text-[#f28b50] cursor-pointer whitespace-nowrap"
            >
              <span>Skip</span>
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

<<<<<<< HEAD
        {/* Camera Stage Container */}
=======
        {/* Camera Stage Container with 32px bleed margin (-inset-8) to eliminate edge slivers */}
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
        <div
          ref={cameraStageRef}
          aria-hidden="true"
          className="absolute -inset-8 will-change-transform"
          style={{
            transform: `translate3d(${-pointerOffset.x * 0.4}px, ${
              visual.cameraPanY - pointerOffset.y * 0.35
<<<<<<< HEAD
            }px, 0) scale(${visual.cameraZoom + visual.portalProgress * 0.18})`,
            transition: `transform 160ms ${MOTION_EASING.cssSettle}`,
          }}
        >
          {/* Layer 1: Mumbai Dusk Horizon Skyline + Video */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: Math.max(0.04, visual.mumbaiReveal) }}
=======
            }px, 0) scale(${visual.cameraZoom + visual.portalProgress * 0.14})`,
            transition: `transform 160ms ${MOTION_EASING.cssSettle}`,
          }}
        >
          {/* Layer 1: Mumbai Dusk Horizon Skyline + Sharp 1080p Video */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: Math.max(0.14, visual.mumbaiReveal) }}
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
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

<<<<<<< HEAD
          {/* Layer 2: Watercolor Dusk Cloud Haze */}
          <div
            className="mumbai-cloud-a pointer-events-none absolute inset-0"
            style={{ opacity: 0.15 + visual.mumbaiReveal * 0.35 }}
=======
          {/* Layer 2: Soft Watercolor Dusk Cloud Haze (Counter-Drifting) */}
          <div
            className="mumbai-cloud-a pointer-events-none absolute inset-0"
            style={{ opacity: 0.24 + visual.mumbaiReveal * 0.26 }}
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          >
            <img
              src={mumbaiCloudsUrl}
              alt=""
              className="h-full w-full object-cover mix-blend-screen opacity-70"
            />
          </div>

<<<<<<< HEAD
          {/* Layer 3: Foreground Mumbai Silhouettes */}
=======
          {/* Layer 3: Parting Foreground Mumbai Rooftop Silhouettes Framing the City Portal */}
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          <div
            ref={leftSilhouetteRef}
            className="pointer-events-none absolute inset-y-0 -left-16 w-[48%] overflow-hidden will-change-transform"
            style={{
<<<<<<< HEAD
              opacity: Math.max(0.12, 0.85 - visual.portalProgress * 0.68),
=======
              opacity: Math.max(0.18, 0.85 - visual.portalProgress * 0.68),
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
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
<<<<<<< HEAD
              opacity: Math.max(0.12, 0.85 - visual.portalProgress * 0.68),
=======
              opacity: Math.max(0.18, 0.85 - visual.portalProgress * 0.68),
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
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

<<<<<<< HEAD
          {/* Layer 4: Late December Coral Glow Lighting */}
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.25 + visual.mumbaiReveal * 0.75,
              background:
                'radial-gradient(ellipse 76% 58% at 50% 46%, rgba(242, 139, 80, 0.26), rgba(217, 91, 102, 0.12) 48%, rgba(7, 9, 18, 0.82) 100%)',
=======
          {/* Layer 4: Scroll-Linked Lighting Wash (Nocturnal Indigo -> Late December Coral Glow) */}
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.35 + visual.mumbaiReveal * 0.65,
              background:
                'radial-gradient(ellipse 76% 58% at 50% 46%, rgba(242, 139, 80, 0.22), rgba(217, 91, 102, 0.1) 48%, rgba(7, 9, 18, 0.78) 100%)',
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
            }}
          />
        </div>

<<<<<<< HEAD
        {/* Scene A Darkness Veil */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#070912] transition-opacity duration-500"
          style={{
            opacity: visual.darknessVeilOpacity,
          }}
        />

        {/* Portal Light Aperture Overlay */}
=======
        {/* External Full-Bleed Moment 01 Darkness Veil (sits outside camera transform for zero edge bleed) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#070912]"
          style={{
            opacity: visual.darknessVeilOpacity * (1 - visual.portalProgress * 0.85) * 0.88,
          }}
        />

        {/* Portal Light Aperture Overlay (animates on activation into Scene 01) */}
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
        <div
          ref={portalBloomRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 opacity-0"
          style={{
            background:
<<<<<<< HEAD
              'radial-gradient(circle at 50% 48%, rgba(242, 139, 80, 0.6) 0%, rgba(217, 91, 102, 0.35) 40%, rgba(20, 18, 37, 0.98) 78%)',
          }}
        />

        {/* Three.js Celestial Particle Field */}
=======
              'radial-gradient(circle at 50% 48%, rgba(242, 139, 80, 0.55) 0%, rgba(217, 91, 102, 0.28) 38%, rgba(20, 18, 37, 0.96) 78%)',
          }}
        />

        {/* Three.js Celestial Falling Starr Particle Field */}
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
        <div
          ref={particleHostRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
        />

<<<<<<< HEAD
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
=======
        {/* Editorial Title Sequence (Moments I & II): Crisp atmospheric reveal with immediate Begin action */}
        {combinedTitleOpacity > 0.02 && (
          <div
            ref={introTitleRef}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 pt-14 pb-24 text-center pointer-events-none"
            style={{
              opacity: combinedTitleOpacity,
              transform: `translate3d(0, ${Math.round(visual.progress * -48)}px, 0) scale(${
                0.985 + visual.titleReveal * 0.025
              })`,
            }}
          >
            <p
              data-intro-reveal
              className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.34em] text-[#f28b50]"
            >
              The Many Deaths of Laila Starr · Chapter 01
            </p>

            <h1
              data-intro-reveal
              className="font-display mt-4 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight text-[#fbf6ee] sm:text-7xl md:text-[5.25rem] [text-wrap:balance] drop-shadow-[0_6px_28px_rgba(0,0,0,0.7)]"
            >
              Once Upon a Falling Starr
            </h1>

            <p
              data-intro-reveal
              className="font-display mt-4 max-w-lg text-lg sm:text-2xl italic leading-relaxed text-[#ece3d7]/85"
            >
              Before the sun set over Mumbai on a Wednesday afternoon, something immortal began to fall.
            </p>

            <div
              data-intro-reveal
              className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] sm:text-xs tracking-[0.08em] text-[#dfd6ca]/70"
            >
              <span>Written by Ram V</span>
              <span aria-hidden="true">·</span>
              <span>Illustrated by Filipe Andrade</span>
              <span aria-hidden="true">·</span>
              <span>Colors by Inês Amaro</span>
            </div>

            {visual.progress < 0.25 && (
              <div
                data-intro-reveal
                className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-3"
              >
                <button
                  type="button"
                  data-testid="enter-chapter-btn"
                  onClick={() => triggerEnter(!isMuted)}
                  className="inline-flex h-11 items-center gap-3 border border-[#f28b50] bg-[#f28b50] px-7 text-xs font-semibold uppercase tracking-[0.2em] text-[#090d1a] shadow-[0_14px_34px_-10px_rgba(242,139,80,0.65)] transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
                >
                  <span>Enter Chapter One</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => jumpToMoment(PROLOGUE_MOMENTS[2].start)}
                  className="inline-flex h-11 items-center gap-2 border border-white/22 bg-[#0b0e1b]/75 px-5 text-xs font-medium uppercase tracking-[0.18em] text-[#f5efe6] transition-colors hover:border-[#f28b50]/75 hover:text-[#f28b50] cursor-pointer"
                >
                  <span>Watch Prologue</span>
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Moment 04 & 05 — Synchronized Cinematic Narration Caption Cards */}
        {visual.narrationOpacity > 0.02 && (
          <div
            className="absolute inset-x-0 bottom-20 sm:bottom-24 z-30 mx-auto max-w-2xl px-5"
            style={{
              opacity: visual.narrationOpacity,
              transform: `translate3d(0, ${Math.round((1 - visual.narrationOpacity) * 18)}px, 0)`,
            }}
          >
            <div className="border border-[#f28b50]/35 bg-[#0b0e1b]/90 px-6 py-5 sm:px-8 sm:py-6 shadow-[0_24px_60px_-14px_rgba(0,0,0,0.85)]">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#f28b50]">
                  {activeBeat.label}
                </span>
                <div className="flex items-center gap-2">
                  {voiceMode === 'recorded' && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#f28b50]">
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
                      Voice Playing
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => playNarrationBeat(activeBeat)}
<<<<<<< HEAD
                    aria-label="Replay narrator voice"
                    className="inline-flex h-7 w-7 items-center justify-center border border-white/20 text-[#e6ddd0]/85 hover:border-[#f28b50] hover:text-[#f28b50] cursor-pointer"
=======
                    aria-label="Replay narration caption"
                    className="inline-flex h-7 w-7 items-center justify-center border border-white/15 text-[#e6ddd0]/75 hover:border-[#f28b50] hover:text-[#f28b50] cursor-pointer"
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <p className="font-display text-xl sm:text-2xl italic leading-snug text-[#fbf6ee]">
                {narrationWords.map((word, idx) => (
                  <span
                    key={`${activeBeat.id}-w-${idx}`}
<<<<<<< HEAD
                    className="inline-block transition-[opacity,filter] duration-200"
                    style={{
                      opacity: idx < visibleNarrationCount ? 1 : 0.08,
                      filter: `blur(${idx < visibleNarrationCount ? 0 : 2}px)`,
                      color: idx === visibleNarrationCount - 1 ? '#ffd29d' : undefined,
                    }}
=======
                    className="inline-block transition-opacity duration-200"
                    style={{ opacity: idx < visibleNarrationCount ? 1 : 0.38 }}
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
                  >
                    {word}
                    {idx < narrationWords.length - 1 ? '\u00A0' : ''}
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}

<<<<<<< HEAD
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
=======
        {/* Moment 06 — Enter the Comic Aperture CTA & Seamless Visual Portal */}
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
        {visual.portalProgress > 0.05 && (
          <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
            style={{
<<<<<<< HEAD
              opacity: clamp01(visual.portalProgress * 1.5),
              transform: `scale(${0.96 + visual.portalProgress * 0.05})`,
            }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#f28b50]">
              Scene E · The Descent Begins
            </p>
            <h2 className="font-display mt-3 text-4xl font-semibold text-[#fbf6ee] sm:text-6xl">
              Enter The City of Mumbai
=======
              opacity: clamp01(visual.portalProgress * 1.4),
              transform: `scale(${0.96 + visual.portalProgress * 0.04})`,
            }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#f28b50]">
              Chapter 01 · Scene 01
            </p>
            <h2 className="font-display mt-3 text-4xl font-semibold text-[#fbf6ee] sm:text-6xl">
              The City of Mumbai
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
            </h2>
            <button
              type="button"
              data-testid="enter-chapter-portal-btn"
              onClick={() => triggerEnter(!isMuted)}
<<<<<<< HEAD
              className="mt-8 inline-flex items-center gap-3 border border-[#f28b50] bg-[#f28b50] px-8 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#090d1a] shadow-2xl transition-transform duration-200 hover:scale-[1.03] cursor-pointer"
            >
              <span>Dive into Comic Artwork</span>
=======
              className="mt-8 inline-flex items-center gap-3 border border-[#f28b50] bg-[#f28b50] px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#090d1a] shadow-2xl transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <span>Enter Chapter One</span>
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        )}

<<<<<<< HEAD
        {/* Bottom Stage Progress Indicator & Direct Navigation */}
        <div className="absolute bottom-5 inset-x-0 z-40 mx-auto flex max-w-2xl flex-col items-center gap-2.5 px-6">
          <div className="flex w-full items-center gap-1.5 sm:gap-2">
=======
        {/* Bottom Moment Scrubber & Quiet Scroll Guidance */}
        <div className="absolute bottom-5 inset-x-0 z-40 mx-auto flex max-w-2xl flex-col items-center gap-2.5 px-6">
          <div className="flex w-full items-center gap-2">
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
            {PROLOGUE_MOMENTS.map((m, idx) => {
              const active = idx === visual.momentIndex;
              const passed = idx < visual.momentIndex;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => jumpToMoment(m.start)}
<<<<<<< HEAD
                  aria-label={`Jump to Scene ${m.code}: ${m.title}`}
                  className="group relative flex h-6 flex-1 items-center justify-center cursor-pointer"
=======
                  aria-label={`Jump to Prologue Moment ${m.code}: ${m.title}`}
                  className="group relative flex h-5 flex-1 items-center cursor-pointer"
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
                >
                  <span
                    className="block w-full transition-all duration-300"
                    style={{
<<<<<<< HEAD
                      height: active ? '3.5px' : '1.5px',
                      backgroundColor: active
                        ? '#f28b50'
                        : passed
                          ? 'rgba(242, 139, 80, 0.55)'
                          : 'rgba(255, 255, 255, 0.18)',
                    }}
                  />
                  <span className="sr-only">Scene {m.code}: {m.title}</span>
=======
                      height: active ? '3px' : '1.5px',
                      backgroundColor: active
                        ? '#f28b50'
                        : passed
                          ? 'rgba(242, 139, 80, 0.5)'
                          : 'rgba(255, 255, 255, 0.18)',
                    }}
                  />
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
                </button>
              );
            })}
          </div>

<<<<<<< HEAD
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#cfc5b9]/75">
            Scene {currentMoment.code} of E · {currentMoment.title}
=======
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#cfc5b9]/75">
            {visual.progress < 0.88
              ? 'Scroll gently to travel through the prologue'
              : 'Continue scrolling to enter Mumbai'}
>>>>>>> c35419f43bb5aee048a8e5328df5fe9aa12dbc74
          </p>
        </div>
      </div>
    </section>
  );
};
