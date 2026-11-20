import React from 'react';
import type { SceneRange } from '../story/scrollMath';

interface AtmosphereOverlayProps {
  activeScene: SceneRange;
  reducedMotion: boolean;
}

export const AtmosphereOverlay: React.FC<AtmosphereOverlayProps> = ({
  activeScene,
  reducedMotion,
}) => {
  const isWarm =
    activeScene.theme.mood === 'sunset' ||
    activeScene.theme.mood === 'dawn' ||
    activeScene.theme.mood === 'traffic';
  const isCelestial = activeScene.theme.mood === 'celestial';
  const isClinical =
    activeScene.theme.mood === 'clinical' ||
    activeScene.theme.mood === 'impact' ||
    activeScene.theme.mood === 'chase';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden transition-colors duration-1000"
    >
      {/* Continuous atmospheric ambient light wash driven by active scene */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: isWarm
            ? 'radial-gradient(ellipse 85% 60% at 50% 18%, rgba(242, 139, 80, 0.14), transparent 72%)'
            : isCelestial
              ? 'radial-gradient(ellipse 90% 65% at 50% 25%, rgba(114, 198, 224, 0.18), rgba(228, 130, 154, 0.08) 55%, transparent 80%)'
              : isClinical
                ? 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(44, 125, 160, 0.13), transparent 75%)'
                : 'radial-gradient(ellipse 85% 65% at 50% 25%, rgba(164, 92, 146, 0.14), transparent 75%)',
        }}
      />

      {/* Subtle cinematic vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 56%, rgba(6, 8, 16, 0.52) 100%)',
        }}
      />

      {/* Fine analog film grain */}
      {!reducedMotion && (
        <div className="film-grain absolute -inset-12 opacity-[0.045] mix-blend-overlay" />
      )}
    </div>
  );
};
