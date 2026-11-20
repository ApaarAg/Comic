import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface InspectedPanelData {
  src: string;
  alt: string;
  note?: string;
}

interface PanelInspectorModalProps {
  panel: InspectedPanelData | null;
  onClose: () => void;
}

export const PanelInspectorModal: React.FC<PanelInspectorModalProps> = ({ panel, onClose }) => {
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel, onClose]);

  if (!panel) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Comic Panel Inspection"
      data-testid="panel-inspector-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060810]/92 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-5xl overflow-auto border border-white/15 bg-[#0e1222] p-4 sm:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/10 pb-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#f28b50]">
              Artwork Inspection · Chapter 01
            </p>
            <p className="mt-1 text-sm text-[#f4efe6]">{panel.alt}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel inspection"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-white/15 text-[#f6efe5] hover:border-[#f28b50] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-hidden border border-white/10 bg-[#080a13]">
          <img
            src={panel.src}
            alt={panel.alt}
            className="mx-auto max-h-[68vh] w-auto max-w-full object-contain select-none"
          />
        </div>

        {panel.note && (
          <p className="mt-4 text-sm italic leading-relaxed text-[#ddd4c7]/90">
            {panel.note}
          </p>
        )}
      </div>
    </div>
  );
};
