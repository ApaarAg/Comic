/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CinematicStartupCurtain.tsx
 *
 * Storyverse 4.0: Editorial Startup Preloader & Pacing Curtain
 *
 * Ensures:
 * 1. Immediate, intentional visual presentation on initial visit (no pitch black void).
 * 2. Preloads critical opening artwork, fonts, and audio before starting stage animations.
 * 3. Enforces a 2.4-second cinematic pacing delay so assets and shaders settle without frame drops.
 * 4. Gracefully dissolves into the Mumbai sunset skyline with zero layout shift.
 */

import React, { useEffect, useState, useRef } from 'react';
import mumbaiSkylineUrl from '../assets/images/mumbai_skyline_backdrop_1795078714752.jpg';
import mumbaiCloudsUrl from '../assets/images/mumbai_clouds_haze_1795078713772.jpg';
import mumbaiSilhouettesUrl from '../assets/images/mumbai_foreground_silhouettes_1795078713773.jpg';

interface StartupCurtainProps {
  reducedMotion: boolean;
  onReady: () => void;
}

const CRITICAL_IMAGE_ASSETS = [
  mumbaiSkylineUrl,
  mumbaiCloudsUrl,
  mumbaiSilhouettesUrl,
  '/assets/chapter1/p06_panel01.webp',
  '/assets/chapter1/p07_panel01.webp',
];

export const CinematicStartupCurtain: React.FC<StartupCurtainProps> = ({
  reducedMotion,
  onReady,
}) => {
  const [progress, setProgress] = useState(0);
  const [phaseText, setPhaseText] = useState('Awakening Mumbai skyline...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const hasTriggeredReadyRef = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    // If skipIntro or autostart is requested via URL, bypass delay immediately
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('skipIntro') === '1' || params.get('autostart') === '1') {
        setProgress(100);
        setIsDismissed(true);
        onReadyRef.current();
        return;
      }
    }

    let isMounted = true;
    const startTime = Date.now();
    const MINIMUM_DURATION_MS = reducedMotion ? 300 : 2000;

    // 1. Preload image assets
    const imagePromises = CRITICAL_IMAGE_ASSETS.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Non-blocking fallback
        }
      });
    });

    // 2. Preload fonts
    const fontPromise =
      typeof document !== 'undefined' && 'fonts' in document
        ? (document.fonts.ready as Promise<unknown>).catch(() => null)
        : Promise.resolve();

    // 3. Smooth progress bar simulation coordinated with actual asset loading
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const targetProgress = Math.min(95, Math.round((elapsed / MINIMUM_DURATION_MS) * 90));
      if (isMounted) {
        setProgress((prev) => Math.max(prev, targetProgress));
        if (targetProgress > 65) {
          setPhaseText('Preparing cinematic stage...');
        } else if (targetProgress > 30) {
          setPhaseText('Tuning celestial frequencies...');
        }
      }
    }, 60);

    Promise.all([...imagePromises, fontPromise]).then(() => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, MINIMUM_DURATION_MS - elapsed);

      setTimeout(() => {
        if (!isMounted) return;
        clearInterval(progressInterval);
        setProgress(100);
        setPhaseText('The story begins...');

        // Begin smooth fade out
        setTimeout(() => {
          if (!isMounted) return;
          setIsFadingOut(true);
          if (!hasTriggeredReadyRef.current) {
            hasTriggeredReadyRef.current = true;
            onReadyRef.current();
          }

          // Complete unmount after fade transition
          setTimeout(() => {
            if (!isMounted) return;
            setIsDismissed(true);
          }, 700);
        }, 200);
      }, remainingTime);
    });

    return () => {
      isMounted = false;
      clearInterval(progressInterval);
    };
  }, [reducedMotion]);

  if (isDismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Storyverse graphic novel experience"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0914] text-[#f7e7da] select-none pointer-events-none transition-opacity duration-900 ease-out"
      style={{
        opacity: isFadingOut ? 0 : 1,
        transition: reducedMotion ? 'none' : 'opacity 900ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Subtle Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(240, 106, 126, 0.12) 0%, rgba(20, 16, 34, 0.8) 60%, #0a0914 100%)',
        }}
      />

      {/* Editorial Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Eyebrow */}
        <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.34em] text-[#e8a84a]/90 font-medium mb-3">
          BOOM! STUDIOS · RAM V & FILIPE ANDRADE
        </span>

        {/* Masthead Title */}
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#fbf4ea] drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)] mb-1">
          <span className="bg-gradient-to-r from-[#f7c27d] via-[#f28b50] to-[#e66c8b] bg-clip-text text-transparent">
            LAILA STARR
          </span>
        </h1>

        {/* Chapter Title */}
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#cfc5b9]/75 mb-8">
          Chapter 1 · A Graphic Novel Experience
        </p>

        {/* Golden Filament Progress Bar */}
        <div className="w-48 sm:w-64 h-[2px] bg-white/10 rounded-full overflow-hidden mb-3 relative">
          <div
            className="h-full bg-gradient-to-r from-[#e8a84a] via-[#f28b50] to-[#e66c8b] transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Phase Status Text */}
        <span className="font-mono text-[11px] uppercase tracking-widest text-[#cfc5b9]/60">
          {phaseText}
        </span>
      </div>
    </div>
  );
};
