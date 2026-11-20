import React, { useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { sceneAudioManager } from '../audio/SceneAudioManager';

interface InteractiveHotspotProps {
  id: string;
  label: string;
  title: string;
  body: string;
  detailNote?: string;
  accentColor?: string;
  onActivate?: () => void;
  className?: string;
}

export const InteractiveHotspot: React.FC<InteractiveHotspotProps> = ({
  id,
  label,
  title,
  body,
  detailNote,
  accentColor = '#f28b50',
  onActivate,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [discovered, setDiscovered] = useState(false);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      setDiscovered(true);
      sceneAudioManager.triggerCue('discover');
      onActivate?.();
    }
  };

  return (
    <div
      data-testid={`hotspot-${id}`}
      data-discovered={discovered ? 'true' : 'false'}
      className={`relative ${className}`}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={`${title} — story note`}
        className="group inline-flex items-center gap-3 border-b pb-2 pt-1 text-left transition-colors duration-200 cursor-pointer"
        style={{
          borderColor: isOpen || discovered ? accentColor : 'rgba(255, 255, 255, 0.2)',
        }}
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center transition-colors"
          style={{ color: accentColor }}
        >
          <BookOpen className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0">
          <span
            className="block font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: accentColor }}
          >
            {discovered ? `${label} · Examined` : label}
          </span>
          <span className="block text-xs sm:text-sm font-medium text-[#f5efe6]/90 group-hover:text-white">
            {title}
          </span>
        </span>
      </button>

      {isOpen && (
        <div
          role="region"
          aria-label={title}
          data-testid={`hotspot-drawer-${id}`}
          className="mt-3 border border-white/12 bg-[#0e1222]/96 p-5 shadow-2xl"
          style={{ borderColor: `${accentColor}66` }}
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
            <div>
              <p
                className="font-mono text-[11px] uppercase tracking-[0.2em]"
                style={{ color: accentColor }}
              >
                {label}
              </p>
              <h4 className="font-display mt-1 text-xl font-semibold text-[#fbf4ea]">
                {title}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close note"
              className="inline-flex h-8 w-8 items-center justify-center border border-white/15 text-[#f6efe5] hover:border-white/40 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#e7dfd4]/90">{body}</p>
          {detailNote && (
            <p className="mt-3 border-t border-white/10 pt-3 font-mono text-xs leading-relaxed text-[#c9c0b5]/80">
              {detailNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
