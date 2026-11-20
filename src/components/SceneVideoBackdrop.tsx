import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SCENE_BACKDROP_MAP, SCENE_VIDEOS } from '../story/videoManifest';
import {
  computeVideoScrubTime,
  selectBackdropMode,
  shouldPreloadSceneVideo,
} from '../story/scrollMath';

gsap.registerPlugin(ScrollTrigger);

interface SceneVideoBackdropProps {
  sceneId: string;
  sceneIndex: number;
  activeSceneIndex: number;
  reducedMotion: boolean;
  /** Element whose scroll bounds drive video scrubbing when playbackMode === 'scrub' */
  scrubTriggerRef: React.RefObject<HTMLElement | null>;
}

export const SceneVideoBackdrop: React.FC<SceneVideoBackdropProps> = ({
  sceneId,
  sceneIndex,
  activeSceneIndex,
  reducedMotion,
  scrubTriggerRef,
}) => {
  const binding = SCENE_BACKDROP_MAP[sceneId];
  const spec = binding ? SCENE_VIDEOS[binding.videoId] : undefined;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );
  const [saveDataEnabled, setSaveDataEnabled] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    return Boolean(conn?.saveData);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobileViewport(window.innerWidth < 768);
    window.addEventListener('resize', onResize, { passive: true });
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn) setSaveDataEnabled(Boolean(conn.saveData));
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const backdropMode = selectBackdropMode({
    reducedMotion,
    isMobileViewport,
    preferMobilePoster: saveDataEnabled,
    hasVideoError,
  });

  const preloadStrategy = shouldPreloadSceneVideo(sceneIndex, activeSceneIndex, 1);

  useEffect(() => {
    if (backdropMode !== 'video' || !videoRef.current || videoRef.current.readyState < 2) {
      setIsVideoReady(false);
    }
  }, [backdropMode, spec?.src]);

  // Trigger buffering explicitly if preload transitions from 'none' -> 'metadata'|'auto'
  useEffect(() => {
    if (backdropMode !== 'video' || preloadStrategy === 'none' || !videoRef.current) return;
    if (videoRef.current.readyState === 0 && videoRef.current.networkState === HTMLMediaElement.NETWORK_EMPTY) {
      videoRef.current.load();
    }
  }, [backdropMode, preloadStrategy]);

  // Ambient loop playback controlled strictly by IntersectionObserver visibility
  useEffect(() => {
    if (
      backdropMode !== 'video' ||
      !binding ||
      binding.playbackMode !== 'loop' ||
      !videoRef.current ||
      !containerRef.current
    ) {
      return;
    }

    const video = videoRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
              // Ignore autoplay rejections gracefully; poster remains visible underneath
            });
          }
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.08 },
    );

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (!video.paused) video.pause();
    };
  }, [backdropMode, binding]);

  // Scroll-scrubbed playback synced via GSAP ScrollTrigger for narrative turns
  useEffect(() => {
    const triggerEl = scrubTriggerRef?.current ?? containerRef.current;
    if (
      backdropMode !== 'video' ||
      !binding ||
      binding.playbackMode !== 'scrub' ||
      !videoRef.current ||
      !triggerEl
    ) {
      return;
    }

    const video = videoRef.current;
    video.pause();

    let latestProgress = 0;

    const applyScrub = (progress: number) => {
      latestProgress = progress;
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const targetTime = computeVideoScrubTime(progress, video.duration);
      if (Math.abs(video.currentTime - targetTime) > 0.03) {
        video.currentTime = targetTime;
      }
    };

    const onLoadedMeta = () => applyScrub(latestProgress);
    video.addEventListener('loadedmetadata', onLoadedMeta);

    const st = ScrollTrigger.create({
      trigger: triggerEl,
      start: 'top 85%',
      end: 'bottom 20%',
      scrub: true,
      onUpdate: (self) => applyScrub(self.progress),
    });

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMeta);
      st.kill();
    };
  }, [backdropMode, binding, scrubTriggerRef]);

  if (!binding || !spec) return null;

  const targetOpacity = binding.opacity;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid={`scene-video-backdrop-${sceneId}`}
      data-video-id={spec.id}
      data-playback-mode={backdropMode === 'poster' ? 'poster' : binding.playbackMode}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Always-present crisp artwork poster base to guarantee zero black-frame flash */}
      <img
        src={spec.poster}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover opacity-20 blur-[2px] scale-105 select-none"
      />

      {/* High-resolution background video layer */}
      {backdropMode === 'video' && (
        <video
          ref={videoRef}
          src={spec.src}
          poster={spec.poster}
          muted
          playsInline
          loop={binding.playbackMode === 'loop'}
          preload={preloadStrategy}
          disablePictureInPicture
          onLoadedData={() => setIsVideoReady(true)}
          onError={() => setHasVideoError(true)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: isVideoReady ? targetOpacity : 0 }}
        />
      )}

      {/* Scene color-grade atmosphere wash & seamless top/bottom vertical feathering */}
      <div
        className="absolute inset-0"
        style={{ background: spec.overlayGradient }}
      />
      <div
        className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0b0d17]/65 to-transparent"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0b0d17]/65 to-transparent"
      />
    </div>
  );
};
