/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CinematicViewportStage.tsx
 *
 * Storyverse 3.0: Pinned 100vh Virtual Camera Stage
 *
 * Replaces vertical web column layouts and disconnected sticky sidebars with
 * a pinned cinematic camera viewport that tracks scroll progression.
 *
 * Features:
 * - Pinned 100vh viewport stage inside a configurable virtual height track
 * - 100% pure, deterministic, reversible camera navigation via resolveTimelineVisualState
 * - Multi-plane 2.5D optical parallax layers (Background, Midground, Camera Rig, Foreground)
 * - Paced visual holds where camera settles for narrative absorption
 * - Embedded speech balloon rendering anchored directly to the framed character
 * - Adaptive Mobile mode (aspect-ratio bounded pan limits and focal zoom bonus)
 * - Automatic rapid-scroll audio suppression & backward scroll hysteresis
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  STORYBOARD_TIMELINE,
  resolveTimelineVisualState,
  resolveTimelineAudioAction,
  type ResolvedVisualState,
  type AudioPlaybackLatchState,
} from '../story/storyTimeline';
import { characterVoicePlayer, type VoicePlaybackSnapshot } from '../audio/CharacterVoicePlayer';
import { sceneAudioManager } from '../audio/SceneAudioManager';
import { soundscape } from '../audio/soundscape';
import { useOptionalNarrative } from '../narrative/NarrativeEngine';
import { SyncedSpeechBubble } from './SyncedSpeechBubble';
import { CHARACTER_STYLES, type DialogueLine } from '../story/dialogueManifest';
import { Volume2, VolumeX } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Global latch state across all active scenes to prevent duplicate audio playback
const globalLatchState: AudioPlaybackLatchState = {
  completedSpeechIds: new Set(),
  currentlyPlayingId: null,
  lastProgressByScene: {},
};

export interface CinematicViewportStageProps {
  sceneId: string;
  reducedMotion: boolean;
  trackHeightVh?: number;
  className?: string;
  /** Optional custom background layer (horizon, celestial sky, distant skyline) */
  backgroundLayer?: React.ReactNode;
  /** Optional custom midground layer (environmental geometry, motion video backdrop) */
  midgroundLayer?: React.ReactNode;
  /** Main camera rig layer (comic panels, framed artwork, character sprites) */
  cameraRigLayer?: React.ReactNode | ((visualState: ResolvedVisualState) => React.ReactNode);
  /** Optional foreground atmospheric layer (silhouettes, dust motes, rain, lighting glaze) */
  foregroundLayer?: React.ReactNode;
  /** Optional overlay children (interactive hotspots, inspection triggers) */
  children?: React.ReactNode;
  /** Optional callback fired on normalized progress update */
  onProgressChange?: (progress: number, visualState: ResolvedVisualState) => void;
}

export const CinematicViewportStage: React.FC<CinematicViewportStageProps> = ({
  sceneId,
  reducedMotion,
  trackHeightVh,
  className = '',
  backgroundLayer,
  midgroundLayer,
  cameraRigLayer,
  foregroundLayer,
  children,
  onProgressChange,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cameraRigRef = useRef<HTMLDivElement>(null);

  const sceneMeta = useMemo(
    () => STORYBOARD_TIMELINE.find((s) => s.id === sceneId) ?? STORYBOARD_TIMELINE[0],
    [sceneId],
  );

  const effectiveTrackHeightVh = trackHeightVh ?? sceneMeta.trackHeightVh ?? 350;

  // Responsive mobile aspect detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  const [stageProgress, setStageProgress] = useState<number>(0);
  const [activeSpeechSnapshot, setActiveSpeechSnapshot] = useState<VoicePlaybackSnapshot | null>(null);

  const prevProgressRef = useRef<number>(0);
  const isMobileRef = useRef<boolean>(isMobile);
  isMobileRef.current = isMobile;

  // Track window resize for mobile adaptation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Compute reversible visual state
  const visualState = useMemo(
    () => resolveTimelineVisualState(sceneId, stageProgress, isMobile),
    [sceneId, stageProgress, isMobile],
  );

  // Subscribe to character voice player for active speech progress / timings
  useEffect(() => {
    const unsub = characterVoicePlayer.subscribe((snapshot) => {
      if (snapshot.lineId === visualState.speechBubble?.id) {
        setActiveSpeechSnapshot(snapshot);
      } else if (!snapshot.isPlaying) {
        setActiveSpeechSnapshot(null);
      }
    });
    return unsub;
  }, [visualState.speechBubble?.id]);

  const narrative = useOptionalNarrative();

  // Audio trigger arbitration
  const handleAudioUpdate = useCallback(
    (currProgress: number, prevProgress: number) => {
      if (reducedMotion) return;

      const audioAction = resolveTimelineAudioAction(
        sceneId,
        currProgress,
        prevProgress,
        globalLatchState,
      );

      if (audioAction.action === 'play' && audioAction.speechToPlay) {
        const speech = audioAction.speechToPlay;
        globalLatchState.currentlyPlayingId = speech.id;

        if (speech.mode === 'dialogue') {
          narrative?.setDialogueActive(true);
        } else if (speech.mode === 'narration') {
          narrative?.triggerNarrationBeat(speech.id);
        }

        // Trigger accompanying audio cues (leitmotifs or SFX)
        if (audioAction.cueToPlay) {
          if (audioAction.cueToPlay.type === 'leitmotif') {
            soundscape.playMotif(audioAction.cueToPlay.cueId as any);
          } else {
            sceneAudioManager.triggerCue(audioAction.cueToPlay.cueId as any);
          }
        }

        // Duck background music and ambience
        sceneAudioManager.duckBuses(audioAction.ducking.duckFactor, 280);

        void characterVoicePlayer.playLine(speech.id, speech.audioSrc, speech.durationMs, {
          onComplete: () => {
            globalLatchState.completedSpeechIds.add(speech.id);
            if (globalLatchState.currentlyPlayingId === speech.id) {
              globalLatchState.currentlyPlayingId = null;
              if (speech.mode === 'dialogue') {
                narrative?.setDialogueActive(false);
              }
              sceneAudioManager.unduckBuses(1400);
            }
          },
        });
      } else if (audioAction.action === 'stop') {
        if (globalLatchState.currentlyPlayingId) {
          characterVoicePlayer.stop(120);
          globalLatchState.currentlyPlayingId = null;
          narrative?.setDialogueActive(false);
          sceneAudioManager.unduckBuses(600);
        }
      }
    },
    [narrative, reducedMotion, sceneId],
  );

  // GSAP ScrollTrigger to track normalized stageProgress cleanly
  useEffect(() => {
    const trackEl = trackRef.current;
    if (!trackEl) return;

    if (reducedMotion) {
      setStageProgress(0.5);
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: trackEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = Math.max(0, Math.min(1, self.progress));
          const prev = prevProgressRef.current;
          prevProgressRef.current = p;
          setStageProgress(p);
          handleAudioUpdate(p, prev);
          onProgressChange?.(p, resolveTimelineVisualState(sceneId, p, isMobileRef.current));
        },
      });
    }, trackEl);

    return () => ctx.revert();
  }, [handleAudioUpdate, onProgressChange, reducedMotion, sceneId]);

  // Convert embedded speech bubble into DialogueLine interface for SyncedSpeechBubble (dialogue mode only)
  const activeLine: DialogueLine | null = useMemo(() => {
    if (!visualState.speechBubble || visualState.speechBubble.mode !== 'dialogue') return null;
    const sb = visualState.speechBubble;
    return {
      id: sb.id,
      sceneId,
      sequenceId: `seq-${sceneId}`,
      mode: sb.mode,
      sourceOrigin: 'comic',
      speaker: sb.speaker,
      speakerLabel: sb.speakerLabel,
      text: sb.text,
      side: sb.placement,
      bubblePosition: sb.placement,
      characterFocus: sb.speaker,
      expression: sb.expression ?? 'neutral',
      panelTarget: visualState.activePanelId,
      triggerProgress: visualState.stageProgress,
      duration: sb.durationMs / 1000,
      durationMs: sb.durationMs,
      audioSrc: sb.audioSrc,
      wordTimings: sb.wordTimings,
      animation: { entrance: 'ink' },
    };
  }, [sceneId, visualState.activePanelId, visualState.speechBubble, visualState.stageProgress]);

  // Transform coordinates
  const { camera, parallax } = visualState;
  const cameraTransform = `translate3d(${camera.panXPercent}%, ${camera.panYPercent}%, 0) scale(${camera.zoom}) rotate(${camera.rotateDeg ?? 0}deg)`;

  return (
    <div
      ref={trackRef}
      id={sceneId}
      data-scene-id={sceneId}
      className={`relative w-full ${className}`}
      style={{ height: `${effectiveTrackHeightVh}vh` }}
    >
      {/* Pinned 100vh Viewport Stage */}
      <div
        ref={stageRef}
        className="sticky top-0 h-screen w-full overflow-hidden select-none"
        style={{
          background: sceneMeta.theme.bg,
          color: sceneMeta.theme.text,
        }}
      >
        {/* Layer 0: Background Horizon / Sky (Slowest Parallax) */}
        {backgroundLayer && (
          <div
            className="absolute inset-0 pointer-events-none z-0 will-change-transform"
            style={{
              transform: `translate3d(0, ${parallax.bgOffsetPx}px, 0)`,
              transition: reducedMotion ? 'none' : 'transform 120ms linear',
            }}
          >
            {backgroundLayer}
          </div>
        )}

        {/* Layer 1: Midground Environment (Standard Parallax) */}
        {midgroundLayer && (
          <div
            className="absolute inset-0 pointer-events-none z-10 will-change-transform"
            style={{
              transform: `translate3d(0, ${parallax.midOffsetPx}px, 0)`,
              transition: reducedMotion ? 'none' : 'transform 120ms linear',
            }}
          >
            {midgroundLayer}
          </div>
        )}

        {/* Layer 2: Virtual Camera Rig (Focal Comic Panels & Artwork) */}
        <div
          ref={cameraRigRef}
          className="absolute inset-0 z-20 flex items-center justify-center will-change-transform"
          style={{
            transform: reducedMotion ? 'none' : cameraTransform,
            transformOrigin: camera.focalPoint
              ? `${camera.focalPoint.xPercent}% ${camera.focalPoint.yPercent}%`
              : '50% 50%',
            transition: reducedMotion ? 'none' : 'transform 100ms ease-out',
          }}
        >
          {typeof cameraRigLayer === 'function' ? cameraRigLayer(visualState) : cameraRigLayer}
        </div>

        {/* Layer 3: Foreground Silhouettes, Particles, Atmospheric Glaze (Fastest Parallax) */}
        {foregroundLayer && (
          <div
            className="absolute inset-0 pointer-events-none z-30 will-change-transform"
            style={{
              transform: `translate3d(0, ${parallax.fgOffsetPx}px, 0)`,
              transition: reducedMotion ? 'none' : 'transform 120ms linear',
            }}
          >
            {foregroundLayer}
          </div>
        )}

        {/* Layer 4: Embedded Character Speech Balloon (Anchored to framed character) */}
        {activeLine && (
          <div
            className="absolute z-40 pointer-events-auto transition-opacity duration-300"
            style={{
              left: isMobile
                ? '5%'
                : visualState.speechBubble?.anchor
                  ? `${Math.round(visualState.speechBubble.anchor.x * 100)}%`
                  : activeLine.side === 'left'
                    ? '10%'
                    : activeLine.side === 'right'
                      ? '56%'
                      : '26%',
              right: isMobile ? '5%' : undefined,
              bottom: isMobile
                ? '16%'
                : visualState.speechBubble?.anchor
                  ? undefined
                  : activeLine.side === 'bottom'
                    ? '12%'
                    : '22%',
              top: !isMobile && visualState.speechBubble?.anchor
                ? `${Math.round(visualState.speechBubble.anchor.y * 100)}%`
                : undefined,
              transform: !isMobile && visualState.speechBubble?.anchor
                ? 'translate(-50%, -100%)'
                : undefined,
              maxWidth: isMobile ? '90%' : '440px',
            }}
          >
            <SyncedSpeechBubble
              line={activeLine}
              isActive={true}
              reducedMotion={reducedMotion}
              elapsedSec={activeSpeechSnapshot?.elapsedSec}
              durationSec={activeSpeechSnapshot?.durationSec ?? activeLine.duration}
              isPaused={false}
              playbackMode={activeSpeechSnapshot?.isPlaying ? 'playing' : 'idle'}
            />
          </div>
        )}

        {/* Layer 5: Optional Overlays / Interactive Hotspots */}
        {children && <div className="absolute inset-0 z-50 pointer-events-none">{children}</div>}

        {/* Visual Hold Indicator (Discreet narrative breathing room indicator) */}
        {visualState.isHold && (
          <div
            className="absolute top-6 left-6 z-40 pointer-events-none hidden md:flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-[11px] font-mono tracking-widest uppercase text-white/50 backdrop-blur-md"
            aria-hidden="true"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#f28b50] animate-pulse" />
            <span>Focal Hold</span>
          </div>
        )}
      </div>
    </div>
  );
};
