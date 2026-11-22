/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scene01Mumbai.tsx
 *
 * Storyverse 4.2.5: Cinematic Opening Reconstruction for Scene 01 (The City of Mumbai)
 *
 * Transforms the opening full-page splash artwork (Filipe Andrade, 1920x2913)
 * into a guided, scroll-driven cinematic camera journey exploring the source
 * comic page across five progressive stages:
 * - STAGE A: Mumbai Twilight Skyline (Establishing the wide twilight splash)
 * - STAGE B: Sunset Horizon Focus (Close-in on late-December solar corona)
 * - STAGE C: Glass Monoliths & Narration (Descending past BKC towers with synchronized narration)
 * - STAGE D: Elevated Highway Overpass (Framing the knotted concrete curve and traffic gridlock)
 * - STAGE E: Composition Revisit & Continuity Corridor (Pushing into Scene 02)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import mumbaiSkylineUrl from '../../assets/images/mumbai_skyline_backdrop_1795078714752.jpg';
import mumbaiCloudsUrl from '../../assets/images/mumbai_clouds_haze_1795078713772.jpg';
import mumbaiSilhouettesUrl from '../../assets/images/mumbai_foreground_silhouettes_1795078713773.jpg';
import { SceneVideoBackdrop } from '../SceneVideoBackdrop';
import { InteractiveHotspot } from '../InteractiveHotspot';
import type { InspectedPanelData } from '../PanelInspectorModal';
import { MOTION_EASING } from '../../story/motionSystem';
import { sceneAudioManager } from '../../audio/SceneAudioManager';
import { characterVoicePlayer } from '../../audio/CharacterVoicePlayer';
import { useOptionalNarrative } from '../../narrative/NarrativeEngine';
import { RotateCcw, ZoomIn } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface SceneProps {
  reducedMotion: boolean;
  activeSceneIndex: number;
  onInspectPanel: (panel: InspectedPanelData) => void;
  onSkipNextScene?: () => void;
}

const CITY_MOTES = [
  { left: '12%', top: '24%', size: 3, delay: '0s' },
  { left: '26%', top: '52%', size: 4, delay: '1.3s' },
  { left: '41%', top: '34%', size: 2.5, delay: '2.1s' },
  { left: '58%', top: '22%', size: 3.5, delay: '0.7s' },
  { left: '72%', top: '48%', size: 3, delay: '1.8s' },
  { left: '84%', top: '30%', size: 4, delay: '2.9s' },
  { left: '19%', top: '76%', size: 2.5, delay: '3.4s' },
  { left: '66%', top: '72%', size: 3.5, delay: '0.4s' },
];

interface CityPinNote {
  id: string;
  label: string;
  title: string;
  x: string;
  y: string;
  sfx: 'discover' | 'horn';
  body: string;
  detail: string;
}

const MUMBAI_CITY_PINS: ReadonlyArray<CityPinNote> = [
  {
    id: 'bkc-horizon',
    label: 'Sunset Horizon',
    title: 'Late-December Heat',
    x: '20%',
    y: '43%',
    sfx: 'discover',
    body: 'Even winter arrives in Mumbai at 28 degrees Celsius—coral twilight hangs over glass towers moments before five fates intersect.',
    detail: '19.0607° N, 72.8634° E · Bandra-Kurla Complex',
  },
  {
    id: 'bkc-overpass',
    label: 'Elevated Overpass',
    title: 'Commuter Gridlock',
    x: '68%',
    y: '63%',
    sfx: 'horn',
    body: 'Auto-rickshaws, cabs, and buses snake up the concrete curve beneath dusk haze—carrying Mrs. Shah toward the night of Darius’s birth.',
    detail: 'Scene 01 → Scene 02 Continuity Corridor',
  },
];

interface CameraKeyframe {
  progress: number;
  zoom: number;
  yRatio: number; // Fraction of maxPanY [0..1]
  originX: number;
  originY: number;
  stageName: string;
}

const SCENE01_CAMERA_KEYFRAMES: ReadonlyArray<CameraKeyframe> = [
  {
    progress: 0.00,
    zoom: 1.02,
    yRatio: 0.00,
    originX: 50,
    originY: 18,
    stageName: 'Stage A · Mumbai Twilight Skyline',
  },
  {
    progress: 0.26,
    zoom: 1.34,
    yRatio: 0.10,
    originX: 48,
    originY: 15,
    stageName: 'Stage B · Sunset Horizon · 4:45 PM',
  },
  {
    progress: 0.52,
    zoom: 1.26,
    yRatio: 0.46,
    originX: 50,
    originY: 48,
    stageName: 'Stage C · Bandra-Kurla Glass Monoliths',
  },
  {
    progress: 0.78,
    zoom: 1.35,
    yRatio: 0.85,
    originX: 52,
    originY: 82,
    stageName: 'Stage D · Elevated Highway Overpass',
  },
  {
    progress: 1.00,
    zoom: 1.15,
    yRatio: 1.00,
    originX: 50,
    originY: 88,
    stageName: 'Stage E · Continuity Corridor → Scene 02',
  },
];

function lerpVal(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function resolveCameraAtProgress(p: number, maxPanY: number): {
  zoom: number;
  y: number;
  originX: number;
  originY: number;
  stageName: string;
} {
  const clamped = Math.max(0, Math.min(1, p));
  const frames = SCENE01_CAMERA_KEYFRAMES;

  let prev = frames[0];
  let next = frames[frames.length - 1];

  for (let i = 0; i < frames.length; i++) {
    if (frames[i].progress <= clamped) {
      prev = frames[i];
    }
    if (frames[i].progress >= clamped) {
      next = frames[i];
      break;
    }
  }

  const span = next.progress - prev.progress;
  const rawT = span > 0 ? (clamped - prev.progress) / span : 0;
  // Hermite smoothstep cubic easing
  const smoothT = rawT * rawT * (3 - 2 * rawT);

  const zoom = lerpVal(prev.zoom, next.zoom, smoothT);
  const yRatio = lerpVal(prev.yRatio, next.yRatio, smoothT);
  const originX = lerpVal(prev.originX, next.originX, smoothT);
  const originY = lerpVal(prev.originY, next.originY, smoothT);
  const stageName = rawT < 0.65 ? prev.stageName : next.stageName;

  return {
    zoom: Math.round(zoom * 1000) / 1000,
    y: Math.round(-maxPanY * yRatio),
    originX: Math.round(originX * 10) / 10,
    originY: Math.round(originY * 10) / 10,
    stageName,
  };
}

export const Scene01Mumbai: React.FC<SceneProps> = React.memo(({
  reducedMotion,
  activeSceneIndex,
  onInspectPanel,
  onSkipNextScene,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const panTrackRef = useRef<HTMLDivElement>(null);
  const skylineLayerRef = useRef<HTMLDivElement>(null);
  const sunGlowRef = useRef<HTMLDivElement>(null);
  const cloudLayerRef = useRef<HTMLDivElement>(null);
  const motesLayerRef = useRef<HTMLDivElement>(null);
  const panoramaLayerRef = useRef<HTMLDivElement>(null);
  const foregroundLayerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cameraRigRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const hazeRef = useRef<HTMLDivElement>(null);
  const captionHighwayRef = useRef<HTMLDivElement>(null);

  const narrative = useOptionalNarrative();
  const choreography = narrative?.activeVisualChoreography;

  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [discoveredPins, setDiscoveredPins] = useState<Record<string, boolean>>({});
  const [activeStageName, setActiveStageName] = useState<string>('Stage A · Mumbai Twilight Skyline');
  const [showOpeningNarration, setShowOpeningNarration] = useState<boolean>(false);
  const [showHighwayNarration, setShowHighwayNarration] = useState<boolean>(false);

  const prevProgressRef = useRef<number>(0);
  const hasTriggeredOpeningRef = useRef<boolean>(false);
  const hasTriggeredHighwayRef = useRef<boolean>(false);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;
    const el = sectionRef.current;
    let rafId = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 16;
        const ny = (e.clientY / window.innerHeight - 0.5) * 10;
        el.style.setProperty('--ptr-x', `${nx}px`);
        el.style.setProperty('--ptr-y', `${ny}px`);
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !panTrackRef.current) return;

    const ctx = gsap.context(() => {
      // Multi-depth horizon reveal on Scene 01 entrance
      if (viewportRef.current) {
        gsap.fromTo(
          viewportRef.current,
          { opacity: 0.25, scale: 1.045 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.05,
            ease: MOTION_EASING.cinematic,
          },
        );
      }

      const cityParallaxTrigger = {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      };

      // BACKGROUND TIER (slowest apparent motion)
      if (skylineLayerRef.current) {
        gsap.fromTo(
          skylineLayerRef.current,
          { y: -16 },
          {
            y: 72,
            ease: 'none',
            scrollTrigger: { ...cityParallaxTrigger, scrub: 0.65 },
          },
        );
      }

      if (sunGlowRef.current) {
        gsap.fromTo(
          sunGlowRef.current,
          { y: -12 },
          {
            y: 54,
            ease: 'none',
            scrollTrigger: { ...cityParallaxTrigger, scrub: 0.75 },
          },
        );
      }

      // MID-GROUND TIER
      if (cloudLayerRef.current) {
        gsap.fromTo(
          cloudLayerRef.current,
          { y: 18, xPercent: -3 },
          {
            y: -68,
            xPercent: 4,
            ease: 'none',
            scrollTrigger: { ...cityParallaxTrigger, scrub: 0.45 },
          },
        );
      }

      if (panoramaLayerRef.current) {
        gsap.fromTo(
          panoramaLayerRef.current,
          { y: 20 },
          {
            y: -44,
            ease: 'none',
            scrollTrigger: { ...cityParallaxTrigger, scrub: 0.4 },
          },
        );
      }

      if (motesLayerRef.current) {
        gsap.fromTo(
          motesLayerRef.current,
          { y: 28 },
          {
            y: -108,
            ease: 'none',
            scrollTrigger: { ...cityParallaxTrigger, scrub: 0.35 },
          },
        );
      }

      // FOREGROUND TIER
      if (foregroundLayerRef.current) {
        gsap.fromTo(
          foregroundLayerRef.current,
          { y: 48, scale: 1.05, opacity: 0.74 },
          {
            y: -185,
            scale: 1.14,
            opacity: 0.46,
            ease: 'none',
            scrollTrigger: { ...cityParallaxTrigger, scrub: 0.25 },
          },
        );
      }

      // Guided Cinematic Camera Journey on Filipe Andrade's full-page splash
      ScrollTrigger.create({
        trigger: panTrackRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = Math.max(0, Math.min(1, self.progress));
          const prev = prevProgressRef.current;
          prevProgressRef.current = p;

          const imgEl = imgRef.current;
          const viewEl = viewportRef.current;
          const rigEl = cameraRigRef.current;

          if (imgEl && viewEl && rigEl) {
            const imgH = imgEl.offsetHeight;
            const viewH = viewEl.clientHeight;
            const maxPanY = Math.max(0, imgH - viewH);

            const cam = resolveCameraAtProgress(p, maxPanY);

            rigEl.style.transformOrigin = `${cam.originX}% ${cam.originY}%`;
            rigEl.style.transform = `translate3d(0, ${cam.y}px, 0) scale(${cam.zoom})`;
            setActiveStageName(cam.stageName);
          }

          // Card visibility thresholds: Stage B (first comic panel) vs Stage D (highway overpass)
          setShowOpeningNarration(p >= 0.14 && p < 0.44);
          setShowHighwayNarration(p >= 0.46);

          const isFastScroll = Math.abs(p - prev) > 0.25;
          if (isFastScroll && characterVoicePlayer.getActiveSceneId() === 'scene-01') {
            characterVoicePlayer.stop(0, 'rapid_scroll_skip');
          }

          // Audio synchronization: trigger first comic narration (s01-01) at Stage B
          if (
            prev < 0.20 &&
            p >= 0.20 &&
            p <= 0.28 &&
            !isFastScroll &&
            !hasTriggeredOpeningRef.current &&
            characterVoicePlayer.getActiveSceneId() === 'scene-01'
          ) {
            hasTriggeredOpeningRef.current = true;
            narrative?.triggerNarrationBeat('s01-01', true);
          } else if (p > 0.35) {
            hasTriggeredOpeningRef.current = true;
          }

          // Audio synchronization: trigger highway narration (s01-02) at Stage D
          if (
            prev < 0.52 &&
            p >= 0.52 &&
            p <= 0.60 &&
            !isFastScroll &&
            !hasTriggeredHighwayRef.current &&
            characterVoicePlayer.getActiveSceneId() === 'scene-01'
          ) {
            hasTriggeredHighwayRef.current = true;
            narrative?.triggerNarrationBeat('s01-02', true);
          } else if (p > 0.68) {
            hasTriggeredHighwayRef.current = true;
          }

          // Backward scroll hysteresis: reset triggers only after deliberate retreat
          if (p < 0.10) {
            hasTriggeredOpeningRef.current = false;
            if (
              characterVoicePlayer.getActiveLineId() === 's01-01' &&
              characterVoicePlayer.getActiveSceneId() === 'scene-01'
            ) {
              characterVoicePlayer.stop(160, 'reverse_scroll');
            }
          }
          if (p < 0.38) {
            hasTriggeredHighwayRef.current = false;
            if (
              characterVoicePlayer.getActiveLineId() === 's01-02' &&
              characterVoicePlayer.getActiveSceneId() === 'scene-01'
            ) {
              characterVoicePlayer.stop(160, 'reverse_scroll');
            }
          }
        },
      });

      // Atmospheric sunset glaze shift
      if (hazeRef.current) {
        gsap.fromTo(
          hazeRef.current,
          { xPercent: -4, opacity: 0.38 },
          {
            xPercent: 5,
            opacity: 0.72,
            ease: 'none',
            scrollTrigger: {
              trigger: panTrackRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion, narrative]);

  const handlePinSelect = (pin: CityPinNote) => {
    const nextId = selectedPinId === pin.id ? null : pin.id;
    setSelectedPinId(nextId);
    if (nextId) {
      setDiscoveredPins((prev) => ({ ...prev, [pin.id]: true }));
      sceneAudioManager.triggerCue(pin.sfx);
    }
  };

  const activePin = MUMBAI_CITY_PINS.find((p) => p.id === selectedPinId) ?? null;

  return (
    <section
      id="scene-01"
      data-scene-id="scene-01"
      ref={sectionRef}
      aria-label="Scene 1: The City of Mumbai"
      className="relative overflow-x-clip bg-[#141225] pt-20 pb-16"
    >
      {/* BACKGROUND TIER: Distant Illustrated Mumbai Skyline Backdrop */}
      <div
        ref={skylineLayerRef}
        data-parallax-tier="background"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[96vh] overflow-hidden opacity-45 will-change-transform"
        style={{
          opacity: choreography?.skylineOpacity !== undefined ? choreography.skylineOpacity : undefined,
          transition: 'opacity 1000ms ease',
        }}
      >
        <div
          className="h-full w-full"
          style={
            reducedMotion
              ? undefined
              : {
                  transform: 'translate3d(calc(var(--ptr-x, 0px) * -0.22), calc(var(--ptr-y, 0px) * -0.15), 0) scale(1.08)',
                  transition: `transform 220ms ${MOTION_EASING.cssSettle}`,
                }
          }
        >
          <img
            src={mumbaiSkylineUrl}
            alt=""
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#141225]/55 via-[#141225]/30 to-[#141225]" />
        </div>
      </div>

      {/* Motion Backdrop Video Layer */}
      <SceneVideoBackdrop
        sceneId="scene-01"
        sceneIndex={0}
        activeSceneIndex={activeSceneIndex}
        reducedMotion={reducedMotion}
        scrubTriggerRef={panTrackRef}
      />

      {/* MID-GROUND TIER: Counter-Drifting Horizontal Watercolor Sunset Cloud Haze */}
      <div
        ref={cloudLayerRef}
        data-parallax-tier="midground"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-12 h-[76vh] overflow-hidden opacity-35 will-change-transform"
      >
        <img
          src={mumbaiCloudsUrl}
          alt=""
          className="mumbai-cloud-a absolute inset-0 h-full w-full object-cover mix-blend-screen opacity-55"
        />
        <img
          src={mumbaiCloudsUrl}
          alt=""
          className="mumbai-cloud-b absolute inset-0 h-full w-full object-cover mix-blend-screen opacity-35 scale-x-[-1]"
        />
      </div>

      {/* BACKGROUND TIER: Warm Late-December Solar Corona Glow */}
      <div
        ref={sunGlowRef}
        data-parallax-tier="background-glow"
        aria-hidden="true"
        className="pointer-events-none absolute left-[12%] top-12 h-[440px] w-[440px] sm:h-[600px] sm:w-[600px] will-change-transform"
      >
        <div
          className="mumbai-sun-glow h-full w-full rounded-full opacity-80"
          style={{
            background:
              'radial-gradient(circle, rgba(242, 139, 80, 0.28) 0%, rgba(217, 91, 102, 0.11) 42%, transparent 68%)',
          }}
        />
      </div>

      {/* FOREGROUND TIER: Architectural Mumbai Rooftops Framing Outer Viewport Edges */}
      <div
        ref={foregroundLayerRef}
        data-parallax-tier="foreground"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-10 h-[92vh] overflow-hidden opacity-60 will-change-transform"
      >
        <div
          className="h-full w-full"
          style={
            reducedMotion
              ? undefined
              : {
                  transform: 'translate3d(calc(var(--ptr-x, 0px) * -0.55), calc(var(--ptr-y, 0px) * -0.35), 0)',
                  transition: `transform 180ms ${MOTION_EASING.cssSettle}`,
                  WebkitMaskImage:
                    'radial-gradient(ellipse 68% 64% at 50% 48%, transparent 32%, rgba(0,0,0,0.85) 85%, #000 100%)',
                  maskImage:
                    'radial-gradient(ellipse 68% 64% at 50% 48%, transparent 32%, rgba(0,0,0,0.85) 85%, #000 100%)',
                }
          }
        >
          <img
            src={mumbaiSilhouettesUrl}
            alt=""
            className="h-full w-full object-cover mix-blend-multiply opacity-90"
          />
        </div>
      </div>

      {/* MID-GROUND TIER: Ambient Dusk Light Motes */}
      {!reducedMotion && (
        <div
          ref={motesLayerRef}
          data-parallax-tier="midground-motes"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden z-[5] will-change-transform"
        >
          {CITY_MOTES.map((m, idx) => (
            <span
              key={`mote-${idx}`}
              className="mumbai-mote absolute rounded-full bg-[#f7b17e]"
              style={{
                left: m.left,
                top: m.top,
                width: `${m.size}px`,
                height: `${m.size}px`,
                animationDelay: m.delay,
                boxShadow: '0 0 8px rgba(242, 139, 80, 0.65)',
              }}
            />
          ))}
        </div>
      )}

      {/* Chapter Opening Heading */}
      <div className="relative z-20 mx-auto max-w-6xl px-6 pt-6 pb-6 md:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/14 pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[#f28b50]">
              Scene 01 · Mumbai, India
            </p>
            <h2 className="font-display mt-2 text-4xl font-semibold tracking-tight text-[#fbf4ea] sm:text-5xl md:text-6xl">
              The City of Mumbai
            </h2>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#dfd5c7]/80">
            Wednesday · Late December · 4:45 PM
          </p>
        </div>

        {/* Establishing Atmospheric Panorama Strip with Interactive City Pins */}
        <div
          ref={panoramaLayerRef}
          data-parallax-tier="midground-panorama"
          className="mt-6 relative overflow-hidden border border-white/15 bg-[#0e1020]/75 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.75)] will-change-transform"
        >
          <div className="relative aspect-[21/9] min-h-[210px] sm:min-h-[270px] w-full overflow-hidden">
            <img
              src={mumbaiSkylineUrl}
              alt="Panoramic dusk view across Bandra-Kurla Complex skyline and curving highway overpass"
              className="h-full w-full object-cover object-center select-none"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141225]/90 via-transparent to-[#141225]/35"
            />
            <div aria-hidden="true" className="scene-vignette" />

            {/* Moving B.K.C. Elevated Highway Traffic Light Trails */}
            {!reducedMotion && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-[9%] h-8 overflow-hidden"
              >
                <div className="mumbai-traffic-east absolute top-1 h-[2px] w-28 bg-gradient-to-r from-transparent via-[#ffba6b] to-[#fff1c9] opacity-85" />
                <div
                  className="mumbai-traffic-east absolute top-3.5 h-[2px] w-20 bg-gradient-to-r from-transparent via-[#f28b50] to-[#ffd29d] opacity-75"
                  style={{ animationDelay: '-4.2s', animationDuration: '9.5s' }}
                />
                <div className="mumbai-traffic-west absolute bottom-1 h-[2px] w-24 bg-gradient-to-l from-transparent via-[#e85568] to-[#ff98a4] opacity-85" />
                <div
                  className="mumbai-traffic-west absolute bottom-3 h-[2px] w-16 bg-gradient-to-l from-transparent via-[#d95b66] to-[#ffb3bc] opacity-75"
                  style={{ animationDelay: '-6.4s', animationDuration: '12.5s' }}
                />
              </div>
            )}

            {/* Subtle Interactive City Exploration Nodes */}
            {MUMBAI_CITY_PINS.map((pin) => {
              const isSelected = selectedPinId === pin.id;
              const isSeen = Boolean(discoveredPins[pin.id]);
              return (
                <button
                  key={pin.id}
                  type="button"
                  data-testid={`city-pin-${pin.id}`}
                  aria-expanded={isSelected}
                  aria-label={`Inspect Mumbai landmark: ${pin.title}`}
                  onClick={() => handlePinSelect(pin)}
                  style={{ left: pin.x, top: pin.y }}
                  className="group/pin absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-2 focus-visible:outline-1 focus-visible:outline-[#f28b50] cursor-pointer"
                >
                  <span
                    className={`relative flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${
                      isSelected
                        ? 'scale-110 border-[#f28b50] bg-[#f28b50] text-[#090d1a]'
                        : isSeen
                          ? 'border-[#f28b50]/85 bg-[#0b0e1b]/85 text-[#f28b50]'
                          : 'border-white/75 bg-[#0b0e1b]/80 text-[#fbf4ea] group-hover/pin:scale-110 group-hover/pin:border-[#f28b50]'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  </span>
                  <span className="hidden sm:inline-block bg-[#0b0e1b]/88 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[#fbf4ea] border border-white/15 group-hover/pin:border-[#f28b50]/70 transition-colors">
                    {pin.title}
                  </span>
                </button>
              );
            })}

            <div className="pointer-events-none absolute bottom-2.5 left-4 right-4 flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.18em] text-[#dfd5c7]/85">
              <span className="truncate">Bandra-Kurla Complex · Dusk Establishing Shot</span>
              <span className="hidden sm:inline shrink-0 text-[#f28b50]">Select skyline markers to explore</span>
            </div>
          </div>

          {activePin && (
            <div
              data-testid={`city-pin-panel-${activePin.id}`}
              className="border-t border-[#f28b50]/35 bg-[#0d1020]/95 px-5 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f28b50]">
                  {activePin.label} · {activePin.detail}
                </p>
                <p className="mt-1 text-sm text-[#ece3d7]/92 leading-relaxed max-w-3xl">
                  {activePin.body}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPinId(null)}
                className="self-start sm:self-center shrink-0 border border-white/20 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-[#f5efe6] hover:border-[#f28b50] hover:text-[#f28b50] cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Guided Cinematic Opening Experience */}
      {reducedMotion ? (
        <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-10 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="comic-panel-frame relative">
                <img
                  src="/assets/chapter1/p06_panel01.webp"
                  alt="Late December sunset dipping below the Mumbai skyline and curving B.K.C. overpass traffic"
                  loading="eager"
                  decoding="sync"
                  referrerPolicy="no-referrer"
                  onClick={() =>
                    onInspectPanel({
                      src: '/assets/chapter1/p06_panel01.webp',
                      alt: 'Late December sunset dipping below the Mumbai skyline and curving B.K.C. overpass traffic',
                      note: "Filipe Andrade's vertical opening pan descends from the late-December sun straight into the knotted asphalt of the B.K.C. overpass.",
                    })
                  }
                  className="w-full h-auto block select-none cursor-zoom-in"
                />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="border border-white/10 bg-[#121324]/85 p-6 backdrop-blur-md shadow-2xl">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f28b50] font-semibold">
                  Scene 01 · The City of Mumbai
                </span>
                <h3 className="font-display mt-2 text-2xl font-semibold text-[#f8f1e7]">
                  Wednesday · 4:45 PM
                </h3>
                <p className="mt-3 font-display text-sm italic leading-relaxed text-[#dfd5c7]/90">
                  &ldquo;It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.&rdquo;
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#cfc5b9]/75 flex-wrap gap-2">
                  <span className="font-mono text-[11px] text-[#f28b50]">Voice: The Chronicle (Brian · 1.05x)</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => narrative?.triggerNarrationBeat('s01-01', true)}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/15 bg-black/40 hover:border-[#f28b50] hover:text-[#f28b50] text-[#e6ddd0] text-[10px] font-mono transition-all cursor-pointer"
                      title="Replay Opening Narration"
                    >
                      <RotateCcw className="w-3 h-3 text-[#f28b50]" />
                      <span>Replay</span>
                    </button>
                    <span className="font-mono text-[11px]">Mumbai Sunset</span>
                  </div>
                </div>
              </div>

              <div className="border border-white/10 bg-[#121324]/85 p-6 backdrop-blur-md shadow-2xl">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f28b50] font-semibold">
                  Scene 01 · Concrete Overpass
                </span>
                <h3 className="font-display mt-2 text-2xl font-semibold text-[#f8f1e7]">
                  Late December · Rush Hour
                </h3>
                <p className="mt-3 font-display text-sm italic leading-relaxed text-[#dfd5c7]/90">
                  &ldquo;Down where the elevated highway curves between glass towers, the city exhaled in horns and heat.&rdquo;
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#cfc5b9]/75 flex-wrap gap-2">
                  <span className="font-mono text-[11px] text-[#f28b50]">Voice: The Chronicle (Brian · 1.05x)</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => narrative?.triggerNarrationBeat('s01-02', true)}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/15 bg-black/40 hover:border-[#f28b50] hover:text-[#f28b50] text-[#e6ddd0] text-[10px] font-mono transition-all cursor-pointer"
                      title="Replay Highway Narration"
                    >
                      <RotateCcw className="w-3 h-3 text-[#f28b50]" />
                      <span>Replay</span>
                    </button>
                    <span className="font-mono text-[11px]">Bandra-Kurla Complex</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={panTrackRef}
          className="relative z-10 mx-auto max-w-6xl xl:max-w-7xl px-4 md:px-8 min-h-[260vh]"
        >
          {/* Sticky Camera Viewport Frame */}
          <div className="sticky top-[5.25rem] w-full">
            <div
              ref={viewportRef}
              className="relative w-full h-[calc(100vh-7.5rem)] min-h-[480px] sm:min-h-[540px] max-h-[820px] overflow-hidden rounded-xl border border-white/15 bg-[#090b16]/95 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-sm"
              style={{
                transform: choreography?.cameraZoom ? `scale(${choreography.cameraZoom})` : undefined,
                transition: 'transform 800ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Dynamic Camera Rig Layer */}
              <div
                ref={cameraRigRef}
                className="relative w-full flex items-start justify-center will-change-transform"
                style={{
                  transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <img
                  ref={imgRef}
                  src="/assets/chapter1/p06_panel01.webp"
                  alt="Late December sunset dipping below the Mumbai skyline and curving B.K.C. overpass traffic"
                  loading="eager"
                  decoding="sync"
                  referrerPolicy="no-referrer"
                  onLoad={() => ScrollTrigger.refresh()}
                  onClick={() =>
                    onInspectPanel({
                      src: '/assets/chapter1/p06_panel01.webp',
                      alt: 'Late December sunset dipping below the Mumbai skyline and curving B.K.C. overpass traffic',
                      note: "Filipe Andrade's full-page splash descends vertically from crimson sunset clouds straight down into Mumbai's Bandra-Kurla Complex overpass.",
                    })
                  }
                  className="w-full max-w-4xl xl:max-w-5xl h-auto block select-none cursor-zoom-in"
                />

                {/* Warm sunset atmospheric light glaze */}
                <div
                  ref={hazeRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(125deg, rgba(242, 139, 80, 0.16) 0%, rgba(217, 91, 102, 0.06) 45%, rgba(20, 18, 37, 0.22) 100%)',
                  }}
                />
              </div>

              {/* Viewport Top HUD Overlay */}
              <div className="absolute top-3 inset-x-4 z-30 pointer-events-none flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#f28b50] bg-black/60 px-3 py-1 rounded-full border border-[#f28b50]/30 backdrop-blur-md shadow-md">
                  {activeStageName}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onInspectPanel({
                      src: '/assets/chapter1/p06_panel01.webp',
                      alt: 'Late December sunset dipping below the Mumbai skyline and curving B.K.C. overpass traffic',
                      note: "Filipe Andrade's full-page splash descends vertically from crimson sunset clouds straight down into Mumbai's Bandra-Kurla Complex overpass.",
                    })
                  }
                  className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/20 bg-black/50 hover:border-[#f28b50] hover:text-[#f28b50] text-[#e6ddd0] text-[10px] font-mono transition-all backdrop-blur-md cursor-pointer shadow-md"
                  title="Inspect Full Artwork Splash"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-[#f28b50]" />
                  <span className="hidden sm:inline">Inspect Plate</span>
                </button>
              </div>

              {/* Bottom Vignette Scrim */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0a0d1a]/95 via-[#0a0d1a]/45 to-transparent z-20"
              />

              {/* Stage B First Comic Narration Overlay Card */}
              <div
                data-testid="caption-s01-01"
                className={`absolute bottom-4 inset-x-4 sm:inset-x-8 z-30 pointer-events-auto transition-all duration-500 ease-out ${
                  showOpeningNarration
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-3 pointer-events-none'
                }`}
              >
                <div className="mx-auto max-w-2xl border border-white/15 bg-[#0a0d1a]/90 p-4 sm:p-5 backdrop-blur-md shadow-2xl rounded-lg">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#f28b50] font-semibold">
                      Scene 01 · The City of Mumbai
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#cfc5b9]/70">
                      Wednesday · 4:45 PM
                    </span>
                  </div>
                  <p className="font-display text-sm sm:text-base italic leading-relaxed text-[#fbf4ea]/95">
                    &ldquo;It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.&rdquo;
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-[#cfc5b9]/80 flex-wrap gap-2">
                    <span className="font-mono text-[10px] sm:text-[11px] text-[#f28b50]">
                      Voice: The Chronicle (Brian · 1.05x)
                    </span>
                    <button
                      type="button"
                      onClick={() => narrative?.triggerNarrationBeat('s01-01', true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/20 bg-black/50 hover:border-[#f28b50] hover:text-[#f28b50] text-[#e6ddd0] text-[10px] font-mono transition-all cursor-pointer shadow-sm"
                      title="Replay Opening Narration"
                    >
                      <RotateCcw className="w-3 h-3 text-[#f28b50]" />
                      <span>Replay Voice</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Editorial Narration Overlay Card */}
              <div
                ref={captionHighwayRef}
                data-testid="caption-s01-02"
                className={`absolute bottom-4 inset-x-4 sm:inset-x-8 z-30 pointer-events-auto transition-all duration-500 ease-out ${
                  showHighwayNarration
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-3 pointer-events-none'
                }`}
              >
                <div className="mx-auto max-w-2xl border border-white/15 bg-[#0a0d1a]/90 p-4 sm:p-5 backdrop-blur-md shadow-2xl rounded-lg">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#f28b50] font-semibold">
                      Scene 01 · The City of Mumbai
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#cfc5b9]/70">
                      Bandra-Kurla Complex
                    </span>
                  </div>
                  <p className="font-display text-sm sm:text-base italic leading-relaxed text-[#fbf4ea]/95">
                    &ldquo;Down where the elevated highway curves between glass towers, the city exhaled in horns and heat.&rdquo;
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-[#cfc5b9]/80 flex-wrap gap-2">
                    <span className="font-mono text-[10px] sm:text-[11px] text-[#f28b50]">
                      Voice: The Chronicle (Brian · 1.05x)
                    </span>
                    <button
                      type="button"
                      onClick={() => narrative?.triggerNarrationBeat('s01-02', true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/20 bg-black/50 hover:border-[#f28b50] hover:text-[#f28b50] text-[#e6ddd0] text-[10px] font-mono transition-all cursor-pointer shadow-sm"
                      title="Replay Highway Narration"
                    >
                      <RotateCcw className="w-3 h-3 text-[#f28b50]" />
                      <span>Replay Voice</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Geographic Context Node (Preserved + Seamlessly Anchored Before Scene 02 Descent) */}
      <div className="relative z-20 mx-auto mt-12 max-w-5xl px-6 md:px-10">
        <InteractiveHotspot
          id="mumbai-sunset"
          label="City Observation"
          title="December Sunset over Bandra-Kurla Complex"
          body="In Mumbai, even winter arrives at 28 degrees Celsius. Beneath the glass towers and elevated concrete curves, nine lives—and one immortal firing—are minutes away from colliding on the exact same Wednesday evening."
          detailNote="Location Pin: 19.0607° N, 72.8634° E · Tip: Click the graphic-novel splash plate above to inspect Filipe Andrade's ink & wash brushwork."
          accentColor="#f28b50"
        />
      </div>

      {!reducedMotion && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <span
              key={`scene01-particle-${i}`}
              className="mumbai-mote absolute rounded-full bg-[#f28b50]/60"
              style={{
                left: `${20 + i * 16}%`,
                top: `${30 + (i % 3) * 20}%`,
                width: `${2 + (i % 2)}px`,
                height: `${2 + (i % 2)}px`,
                animationDelay: `${i * 1.4}s`,
                animationDuration: `${8 + i * 2}s`,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
});

Scene01Mumbai.displayName = 'Scene01Mumbai';
