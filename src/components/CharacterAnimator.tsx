import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Maximize2 } from 'lucide-react';
import { CHARACTER_STYLES, type CharacterId } from '../story/dialogueManifest';
import { MOTION_EASING } from '../story/motionSystem';

interface CharacterAnimatorProps {
  src: string;
  alt: string;
  character?: CharacterId;
  activeSpeaker?: CharacterId | null;
  reducedMotion: boolean;
  subtleMotion?: 'breathe' | 'float' | 'spectral' | 'pulse' | 'none';
  className?: string;
  caption?: string;
  subtitle?: string;
  dialogueText?: string;
  showSubtitle?: boolean;
  onInspect?: (payload: { src: string; alt: string; note?: string }) => void;
  inspectNote?: string;
}

export const CharacterAnimator: React.FC<CharacterAnimatorProps> = ({
  src,
  alt,
  character,
  activeSpeaker,
  reducedMotion,
  subtleMotion = 'breathe',
  className = '',
  caption,
  subtitle,
  dialogueText,
  showSubtitle = false,
  onInspect,
  inspectNote,
}) => {
  const hoverTargetRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  const hasDialogueContext =
    activeSpeaker !== undefined && activeSpeaker !== null && character !== undefined;
  const isSpeaking = hasDialogueContext && activeSpeaker === character;
  const isOtherSpeaking = hasDialogueContext && activeSpeaker !== character;
  const speakerAccent = character ? CHARACTER_STYLES[character].accent : '#f28b50';
  const speakerMeta = character ? CHARACTER_STYLES[character] : null;

  // Render subtitle box only if explicitly requested, preventing duplicate text with SyncedSpeechBubble
  const displayText = showSubtitle ? (dialogueText || subtitle) : undefined;

  const motionClass =
    reducedMotion || subtleMotion === 'none'
      ? ''
      : subtleMotion === 'float'
        ? 'char-float'
        : subtleMotion === 'spectral'
          ? 'char-spectral'
          : subtleMotion === 'pulse'
            ? 'char-pulse'
            : 'char-breathe';

  useEffect(() => {
    const target = hoverTargetRef.current;
    if (!target) return;
    ctxRef.current = gsap.context(() => {}, target);
    return () => {
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  const handleHoverIn = () => {
    if (reducedMotion || !hoverTargetRef.current) return;
    const target = hoverTargetRef.current;
    const run = () => {
      gsap.to(target, {
        scale: 1.028,
        filter: 'brightness(1.12) contrast(1.03)',
        duration: 0.36,
        ease: MOTION_EASING.cinematic,
        overwrite: 'auto',
      });
    };
    if (ctxRef.current) {
      ctxRef.current.add(run);
    } else {
      run();
    }
  };

  const handleHoverOut = () => {
    if (!hoverTargetRef.current) return;
    const target = hoverTargetRef.current;
    const run = () => {
      gsap.to(target, {
        scale: 1,
        filter: 'brightness(1) contrast(1)',
        duration: 0.44,
        ease: MOTION_EASING.cinematic,
        overwrite: 'auto',
      });
    };
    if (ctxRef.current) {
      ctxRef.current.add(run);
    } else {
      run();
    }
  };

  return (
    <figure
      data-speaking={isSpeaking ? 'true' : 'false'}
      data-character-id={character ?? 'panel'}
      aria-current={isSpeaking ? 'true' : undefined}
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
      onFocus={handleHoverIn}
      onBlur={handleHoverOut}
      className={`comic-panel-frame group relative transition-all duration-500 ease-out ${
        isSpeaking
          ? 'scale-[1.025] z-20 brightness-[1.04]'
          : isOtherSpeaking
            ? 'brightness-[0.78] saturate-[0.85]'
            : 'hover:scale-[1.012]'
      } ${className}`}
      style={{
        boxShadow: isSpeaking
          ? `0 24px 60px -14px ${speakerAccent}45, 0 0 0 1.5px ${speakerAccent}85`
          : undefined,
      }}
    >
      <div ref={hoverTargetRef} className="relative overflow-hidden will-change-transform bg-[#0c0e18]">
        <div className={`relative flex items-center justify-center ${motionClass}`}>
          <img
            src={src}
            alt={alt}
            loading="eager"
            decoding="sync"
            referrerPolicy="no-referrer"
            className="w-full max-h-[58vh] sm:max-h-[82vh] object-contain select-none"
          />

          {/* Character-calibrated atmospheric rim light while speaking */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{
              opacity: isSpeaking ? 1 : 0,
              background: `radial-gradient(circle at 50% 42%, ${speakerAccent}24, transparent 74%)`,
            }}
          />
        </div>
      </div>

      {onInspect && (
        <button
          type="button"
          onClick={() => onInspect({ src, alt, note: inspectNote })}
          aria-label={`Inspect panel artwork: ${alt}`}
          className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center border border-white/25 bg-[#0b0d17]/75 text-[#f6efe5] opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 hover:border-[#f28b50] hover:text-[#f28b50] cursor-pointer"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      )}

      {/* High-Readability Companion Subtitle Bar */}
      {displayText && (
        <div className="border-t border-white/10 bg-[#0c0e18]/95 px-4 py-3 sm:px-5 sm:py-3.5 backdrop-blur-md">
          {speakerMeta && (
            <div className="mb-1 flex items-center gap-2">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.24em]"
                style={{ color: speakerAccent }}
              >
                {speakerMeta.name} · {speakerMeta.role}
              </span>
            </div>
          )}
          <p className="font-display text-xs sm:text-sm italic leading-relaxed text-[#f4eee5]/95 tracking-wide">
            &ldquo;{displayText}&rdquo;
          </p>
        </div>
      )}

      {caption && !displayText && <figcaption className="sr-only">{caption}</figcaption>}
    </figure>
  );
};
