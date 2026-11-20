import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, RotateCcw, Volume2, VolumeX } from 'lucide-react';
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
  const introTitleRef = useRef<HTMLDivElement>(null);
  const particleHostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const exitedRef = useRef(false);
  const lastCueMomentRef = useRef<number>(-1);
  const lastNarrationIdRef = useRef<string | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [narrationProgress, setNarrationProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'idle' | 'recorded' | 'cadence'>('idle');
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  const visual = computePrologueVisualState(scrollProgress, PROLOGUE_MOMENTS);
  const currentMoment = PROLOGUE_MOMENTS[visual.momentIndex] ?? PROLOGUE_MOMENTS[0];
  const activeBeat =
    PROLOGUE_NARRATION_BEATS[visual.activeNarrationIndex] ?? PROLOGUE_NARRATION_BEATS[0];

  // Choreographed multi-plane camera portal transition into Scene 01
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
          { xPercent: -28, opacity: 0, duration: 0.68, ease: MOTION_EASING.cinematic },
          0,
        );
      }
      if (rightSilhouetteRef.current) {
        tl.to(
          rightSilhouetteRef.current,
          { xPercent: 28, opacity: 0, duration: 0.68, ease: MOTION_EASING.cinematic },
          0,
        );
      }
      if (cameraStageRef.current) {
        tl.to(
          cameraStageRef.current,
          { scale: 1.24, duration: 0.72, ease: MOTION_EASING.cinematic },
          0,
        );
      }
      if (portalBloomRef.current) {
        tl.fromTo(
          portalBloomRef.current,
          { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1.35, duration: 0.56, ease: MOTION_EASING.editorial },
          0.08,
        );
      }
      tl.to(
        stageRef.current,
        { opacity: 0, duration: 0.28, ease: 'power2.in' },
        0.48,
      );
    },
    [isMuted, onEnter, reducedMotion],
  );

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

  // Three.js falling starlight & ember field with Software-WebGL guard + afterDraw pacing
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

    const gl = renderer.getContext() as WebGL2RenderingContext;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const glRenderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(glRenderer);

    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 0.5 : Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(54, w / h, 0.1, 50);
    camera.position.z = 7;

    const count = isSoftwareGl ? 48 : 140;
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
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let frameId = 0;
    let disposed = false;
    const start = performance.now();

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
      const t = (performance.now() - start) * 0.001;
      points.rotation.y = t * 0.025;
      points.position.y = Math.sin(t * 0.35) * 0.14;
      renderer.render(scene, camera);
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
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
      window.clearTimeout(frameId);
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
      st.kill();
    };
  }, [isMuted, reducedMotion, triggerEnter]);

  // Synchronize audio mood & subtle cues across prologue moments
  useEffect(() => {
    if (visual.momentIndex >= 2) {
      sceneAudioManager.setMood('sunset');
    } else {
      sceneAudioManager.setMood('prologue');
    }

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
      void characterVoicePlayer.playLine(beat.id, beat.voiceAsset, beat.durationMs, {
        onStart: (state) => {
          setVoiceMode(state === 'playing-recording' ? 'recorded' : 'cadence');
        },
        onComplete: () => {
          setVoiceMode('idle');
        },
      });
    },
    [],
  );

  useEffect(() => {
    if (visual.narrationOpacity < 0.25) {
      lastNarrationIdRef.current = null;
      return;
    }
    if (lastNarrationIdRef.current !== activeBeat.id) {
      lastNarrationIdRef.current = activeBeat.id;
      playNarrationBeat(activeBeat);
    }
  }, [activeBeat, playNarrationBeat, visual.narrationOpacity]);

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

  useEffect(() => {
    return () => {
      characterVoicePlayer.stop();
    };
  }, []);

  const jumpToMoment = (momentStart: number) => {
    if (!trackRef.current) return;
    const maxScroll = Math.max(1, trackRef.current.scrollHeight - window.innerHeight);
    window.scrollTo({
      top: Math.round(maxScroll * Math.min(0.96, momentStart + 0.03)),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  // Reduced-motion calm editorial alternative
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
            >
              <span>Enter Chapter One</span>
              <ArrowRight className="h-4 w-4" />
            </button>
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
          </div>
        </div>
      </section>
    );
  }

  const narrationWords = activeBeat.text.trim().split(/\s+/).filter(Boolean);
  const visibleNarrationCount = computeVisibleWordCount(activeBeat.text, narrationProgress);

  const leftSilhouetteShift = Math.round(
    -8 - visual.mumbaiReveal * 8 - visual.portalProgress * 32 - pointerOffset.x * 0.25,
  );
  const rightSilhouetteShift = Math.round(
    8 + visual.mumbaiReveal * 8 + visual.portalProgress * 32 - pointerOffset.x * 0.25,
  );

  // Opening title gently yields to the Moment 02 editorial mask title, then parts for Mumbai
  const momentOneTitleFade = Math.max(0, 1 - clamp01((visual.progress - 0.08) / 0.09));
  const combinedTitleOpacity = Math.max(momentOneTitleFade, visual.titleReveal);

  return (
    <section
      ref={trackRef}
      aria-label="Chapter One Cinematic Prologue"
      data-testid="cinematic-prologue"
      data-prologue-moment={currentMoment.id}
      data-prologue-progress={Math.round(visual.progress * 100)}
      className="relative h-[580vh] bg-[#070912] text-[#fbf6ee]"
    >
      {/* Sticky Full-Viewport Film Stage */}
      <div
        ref={stageRef}
        className={`sticky top-0 h-screen w-full overflow-hidden bg-[#070912] film-letterbox ${
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
              {currentMoment.title}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Camera Stage Container with 32px bleed margin (-inset-8) to eliminate edge slivers */}
        <div
          ref={cameraStageRef}
          aria-hidden="true"
          className="absolute -inset-8 will-change-transform"
          style={{
            transform: `translate3d(${-pointerOffset.x * 0.4}px, ${
              visual.cameraPanY - pointerOffset.y * 0.35
            }px, 0) scale(${visual.cameraZoom + visual.portalProgress * 0.14})`,
            transition: `transform 160ms ${MOTION_EASING.cssSettle}`,
          }}
        >
          {/* Layer 1: Mumbai Dusk Horizon Skyline + Sharp 1080p Video */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: Math.max(0.14, visual.mumbaiReveal) }}
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

          {/* Layer 2: Soft Watercolor Dusk Cloud Haze (Counter-Drifting) */}
          <div
            className="mumbai-cloud-a pointer-events-none absolute inset-0"
            style={{ opacity: 0.24 + visual.mumbaiReveal * 0.26 }}
          >
            <img
              src={mumbaiCloudsUrl}
              alt=""
              className="h-full w-full object-cover mix-blend-screen opacity-70"
            />
          </div>

          {/* Layer 3: Parting Foreground Mumbai Rooftop Silhouettes Framing the City Portal */}
          <div
            ref={leftSilhouetteRef}
            className="pointer-events-none absolute inset-y-0 -left-16 w-[48%] overflow-hidden will-change-transform"
            style={{
              opacity: Math.max(0.18, 0.85 - visual.portalProgress * 0.68),
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
              opacity: Math.max(0.18, 0.85 - visual.portalProgress * 0.68),
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

          {/* Layer 4: Scroll-Linked Lighting Wash (Nocturnal Indigo -> Late December Coral Glow) */}
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.35 + visual.mumbaiReveal * 0.65,
              background:
                'radial-gradient(ellipse 76% 58% at 50% 46%, rgba(242, 139, 80, 0.22), rgba(217, 91, 102, 0.1) 48%, rgba(7, 9, 18, 0.78) 100%)',
            }}
          />
        </div>

        {/* External Full-Bleed Moment 01 Darkness Veil (sits outside camera transform for zero edge bleed) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#070912]"
          style={{
            opacity: visual.darknessVeilOpacity * (1 - visual.portalProgress * 0.85) * 0.88,
          }}
        />

        {/* Portal Light Aperture Overlay (animates on activation into Scene 01) */}
        <div
          ref={portalBloomRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 opacity-0"
          style={{
            background:
              'radial-gradient(circle at 50% 48%, rgba(242, 139, 80, 0.55) 0%, rgba(217, 91, 102, 0.28) 38%, rgba(20, 18, 37, 0.96) 78%)',
          }}
        />

        {/* Three.js Celestial Falling Starr Particle Field */}
        <div
          ref={particleHostRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
        />

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
                  <ArrowRight className={`h-4 w-4${visual.progress < 0.08 ? ' animate-pulse' : ''}`} />
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
            className="absolute inset-x-0 bottom-24 sm:bottom-28 z-30 mx-auto max-w-3xl px-5"
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
                      Voice Playing
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => playNarrationBeat(activeBeat)}
                    aria-label="Replay narration caption"
                    className="inline-flex h-7 w-7 items-center justify-center border border-white/15 text-[#e6ddd0]/75 hover:border-[#f28b50] hover:text-[#f28b50] cursor-pointer"
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
                      opacity: idx < visibleNarrationCount ? 1 : 0.06,
                      filter: `blur(${idx < visibleNarrationCount ? 0 : 2}px)`,
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

        {/* Moment 06 — Enter the Comic Aperture CTA & Seamless Visual Portal */}
        {visual.portalProgress > 0.05 && (
          <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
            style={{
              opacity: clamp01(visual.portalProgress * 1.4),
              transform: `scale(${0.96 + visual.portalProgress * 0.04})`,
            }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#f28b50]">
              Chapter 01 · Scene 01
            </p>
            <h2 className="font-display mt-3 text-4xl font-semibold text-[#fbf6ee] sm:text-6xl">
              The City of Mumbai
            </h2>
            <button
              type="button"
              data-testid="enter-chapter-portal-btn"
              onClick={() => triggerEnter(!isMuted)}
              className="mt-8 inline-flex items-center gap-3 border border-[#f28b50] bg-[#f28b50] px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#090d1a] shadow-2xl transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <span>Enter Chapter One</span>
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Bottom Moment Scrubber & Quiet Scroll Guidance */}
        <div className="absolute bottom-5 inset-x-0 z-40 mx-auto flex max-w-2xl flex-col items-center gap-2.5 px-6">
          <div className="flex w-full items-center gap-2">
            {PROLOGUE_MOMENTS.map((m, idx) => {
              const active = idx === visual.momentIndex;
              const passed = idx < visual.momentIndex;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => jumpToMoment(m.start)}
                  aria-label={`Jump to Prologue Moment ${m.code}: ${m.title}`}
                  className="group relative flex h-5 flex-1 items-center cursor-pointer"
                >
                  <span
                    className="block w-full transition-all duration-300"
                    style={{
                      height: active ? '3px' : '1.5px',
                      backgroundColor: active
                        ? '#f28b50'
                        : passed
                          ? 'rgba(242, 139, 80, 0.5)'
                          : 'rgba(255, 255, 255, 0.18)',
                    }}
                  />
                </button>
              );
            })}
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#cfc5b9]/75">
            {visual.progress < 0.88
              ? 'Scroll gently to travel through the prologue'
              : 'Continue scrolling to enter Mumbai'}
          </p>
        </div>
      </div>
    </section>
  );
};
