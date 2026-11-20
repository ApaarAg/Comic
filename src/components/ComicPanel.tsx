import React, { useState } from 'react';
import { Maximize2, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import type { InspectedPanelData } from './PanelInspectorModal';

interface ComicPanelProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  caption?: string;
  subtitle?: string;
  dialogueText?: string;
  speakerLabel?: string;
  isActive?: boolean;
  onInspect?: (panel: InspectedPanelData) => void;
  inspectNote?: string;
}

export const ComicPanel: React.FC<ComicPanelProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  priority = false,
  caption,
  subtitle,
  dialogueText,
  speakerLabel,
  isActive = false,
  onInspect,
  inspectNote,
}) => {
  const [failed, setFailed] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const displayText = dialogueText || subtitle || caption;

  return (
    <figure
      data-comic-panel
      data-active={isActive ? 'true' : 'false'}
      data-zoomed={isZoomed ? 'true' : 'false'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`comic-panel-frame group relative transition-all duration-500 ease-out ${
        isZoomed
          ? 'z-40 scale-[1.04] shadow-[0_28px_80px_rgba(0,0,0,0.95),0_0_0_1px_rgba(242,139,80,0.65)]'
          : isActive
            ? 'z-20 scale-[1.02] shadow-[0_16px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(242,139,80,0.45)]'
            : 'shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)]'
      } ${className}`}
    >
      <div className="relative overflow-hidden bg-[#0d0f1a]">
        {!failed ? (
          <div className="relative flex items-center justify-center">
            <img
              src={src}
              alt={alt}
              loading="eager"
              decoding="sync"
              fetchPriority={priority ? 'high' : 'auto'}
              referrerPolicy="no-referrer"
              onError={() => setFailed(true)}
              onClick={() => setIsZoomed((prev) => !prev)}
              className={`w-full max-h-[82vh] object-contain select-none transition-transform duration-500 cursor-zoom-in ${
                isZoomed ? 'scale-105 cursor-zoom-out' : ''
              } ${imgClassName}`}
              style={{
                imageRendering: 'auto',
              }}
            />

            {/* Subtle atmospheric vignette gradient overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 opacity-60 transition-opacity duration-300 group-hover:opacity-20"
            />
          </div>
        ) : (
          <div
            role="img"
            aria-label={alt}
            className="flex min-h-[260px] w-full items-center justify-center bg-[#15192d] p-6 text-center text-xs text-[#d6cec2]/70"
          >
            <span>{alt}</span>
          </div>
        )}

        {/* Quick-action toolbar in top-right */}
        {!failed && (
          <div className="absolute right-3 top-3 z-30 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed((prev) => !prev);
              }}
              title={isZoomed ? 'Reset zoom' : 'Quick zoom panel'}
              aria-label={isZoomed ? 'Reset zoom' : 'Quick zoom panel'}
              className="inline-flex h-8 w-8 items-center justify-center border border-white/25 bg-[#0b0d17]/85 text-[#f6efe5] backdrop-blur-md transition-colors hover:border-[#f28b50] hover:text-[#f28b50] cursor-pointer"
            >
              {isZoomed ? <ZoomOut className="h-3.5 w-3.5" /> : <ZoomIn className="h-3.5 w-3.5" />}
            </button>

            {onInspect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInspect({ src, alt, note: inspectNote });
                }}
                title="Open panel inspector modal"
                aria-label={`Inspect panel in detail: ${alt}`}
                className="inline-flex h-8 w-8 items-center justify-center border border-white/25 bg-[#0b0d17]/85 text-[#f6efe5] backdrop-blur-md transition-colors hover:border-[#f28b50] hover:text-[#f28b50] cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* High-Readability Companion Subtitle Bar for small screens or handwritten balloons */}
        {displayText && (
          <div className="border-t border-white/10 bg-[#0c0e18]/95 px-4 py-3 sm:px-5 sm:py-3.5 backdrop-blur-md">
            {speakerLabel && (
              <div className="mb-1 flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#f28b50]">
                  {speakerLabel}
                </span>
              </div>
            )}
            <p className="font-display text-xs sm:text-sm italic leading-relaxed text-[#f4eee5]/95 tracking-wide">
              &ldquo;{displayText}&rdquo;
            </p>
          </div>
        )}
      </div>

      {caption && !displayText && <figcaption className="sr-only">{caption}</figcaption>}
    </figure>
  );
};
