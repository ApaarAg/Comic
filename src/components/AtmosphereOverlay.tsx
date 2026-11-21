import React from 'react';
import type { SceneRange } from '../story/scrollMath';

interface AtmosphereOverlayProps {
  activeScene: SceneRange;
  reducedMotion: boolean;
}

export const AtmosphereOverlay: React.FC<AtmosphereOverlayProps> = React.memo(({
  activeScene,
  reducedMotion,
}) => {
  const isWarm =
    activeScene.theme.mood === 'sunset' ||
    activeScene.theme.mood === 'dawn' ||
    activeScene.theme.mood === 'traffic';
  const isCelestial = activeScene.theme.mood === 'celestial';
  const isImpact = activeScene.theme.mood === 'impact';
  const isDescent = activeScene.theme.mood === 'descent';
  const isSplit = activeScene.theme.mood === 'split';
  const isClinical =
    activeScene.theme.mood === 'clinical' ||
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
          background: isImpact
            ? 'radial-gradient(ellipse 85% 65% at 50% 50%, rgba(229, 57, 53, 0.20), rgba(26, 5, 8, 0.40) 70%, transparent 90%)'
            : isDescent
              ? 'radial-gradient(ellipse 90% 70% at 50% 25%, rgba(99, 184, 214, 0.16), rgba(26, 22, 56, 0.25) 60%, transparent 85%)'
              : isSplit
                ? 'linear-gradient(90deg, rgba(242, 139, 80, 0.10) 0%, rgba(242, 139, 80, 0.04) 45%, rgba(68, 168, 204, 0.04) 55%, rgba(68, 168, 204, 0.10) 100%)'
                : isWarm
                  ? 'radial-gradient(ellipse 85% 60% at 50% 18%, rgba(242, 139, 80, 0.14), transparent 72%)'
                  : isCelestial
                    ? 'radial-gradient(ellipse 90% 65% at 50% 25%, rgba(114, 198, 224, 0.18), rgba(228, 130, 154, 0.08) 55%, transparent 80%)'
                    : isClinical
                      ? 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(44, 125, 160, 0.13), transparent 75%)'
                      : 'radial-gradient(ellipse 85% 65% at 50% 25%, rgba(164, 92, 146, 0.14), transparent 75%)',
        }}
      />

      {/* Subtle cinematic vignette softened for crisp comic artwork edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 64%, rgba(6, 8, 16, 0.35) 100%)',
        }}
      />

      {/* Fine analog film grain */}
      {!reducedMotion && (
        <div className="film-grain absolute -inset-12 opacity-[0.045] mix-blend-overlay" />
      )}
    </div>
  );
});

AtmosphereOverlay.displayName = 'AtmosphereOverlay';
