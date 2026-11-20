import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import type { InspectedPanelData } from './PanelInspectorModal';

interface ComicPanelProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  caption?: string;
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
  onInspect,
  inspectNote,
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <figure className={`comic-panel-frame group ${className}`}>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading="eager"
          decoding="sync"
          fetchPriority={priority ? 'high' : 'auto'}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={`w-full h-auto object-cover select-none ${imgClassName}`}
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="flex min-h-[220px] w-full items-center justify-center bg-[#15192d] p-6 text-center text-xs text-[#d6cec2]/70"
        >
          <span>{alt}</span>
        </div>
      )}

      {!failed && onInspect && (
        <button
          type="button"
          onClick={() => onInspect({ src, alt, note: inspectNote })}
          aria-label={`Inspect panel: ${alt}`}
          className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center border border-white/25 bg-[#0b0d17]/75 text-[#f6efe5] opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 hover:border-[#f28b50] hover:text-[#f28b50] cursor-pointer"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      )}

      {caption && (
        <figcaption className="sr-only">{caption}</figcaption>
      )}
    </figure>
  );
};
