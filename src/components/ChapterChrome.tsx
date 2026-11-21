import React, { useEffect, useMemo, useState } from 'react';
import { Volume2, VolumeX, List, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import {
  computeSceneJourneySegments,
  type SceneBound,
  type SceneRange,
} from '../story/scrollMath';
import {
  sceneAudioManager,
  type AudioMixerSnapshot,
} from '../audio/SceneAudioManager';
import { characterVoicePlayer } from '../audio/CharacterVoicePlayer';

interface ChapterChromeProps {
  scenes: ReadonlyArray<SceneRange>;
  activeSceneIndex: number;
  progress: number;
  sceneBounds?: ReadonlyArray<SceneBound>;
  isMuted: boolean;
  onToggleMute: () => void;
  onJumpToScene: (sceneId: string) => void;
  onReplayPrologue: () => void;
  hasEntered: boolean;
}

export const ChapterChrome: React.FC<ChapterChromeProps> = React.memo(({
  scenes,
  activeSceneIndex,
  progress,
  sceneBounds,
  isMuted,
  onToggleMute,
  onJumpToScene,
  onReplayPrologue,
  hasEntered,
}) => {
  const [indexOpen, setIndexOpen] = useState(false);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [hoveredSceneId, setHoveredSceneId] = useState<string | null>(null);
  const [mixerSnapshot, setMixerSnapshot] = useState<AudioMixerSnapshot>(() =>
    sceneAudioManager.getSnapshot(),
  );
  const [hasRecordedVoices, setHasRecordedVoices] = useState(false);

  const activeScene = scenes[activeSceneIndex] ?? scenes[0];

  useEffect(() => {
    const unsub = sceneAudioManager.subscribe(() => {
      setMixerSnapshot(sceneAudioManager.getSnapshot());
    });
    void characterVoicePlayer.checkAvailableVoiceManifest().then((set) => {
      setHasRecordedVoices(set.size > 0);
    });
    return unsub;
  }, []);

  const segments = useMemo(
    () => computeSceneJourneySegments(progress, scenes, activeSceneIndex, sceneBounds),
    [progress, scenes, activeSceneIndex, sceneBounds],
  );

  const percentTotal = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const hoveredSegment = hoveredSceneId
    ? segments.find((seg) => seg.id === hoveredSceneId) ?? null
    : null;

  if (!hasEntered) return null;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 transition-colors duration-500 pt-[max(0.625rem,env(safe-area-inset-top,0px))]"
        style={{
          background:
            'linear-gradient(180deg, rgba(10, 12, 22, 0.92) 0%, rgba(10, 12, 22, 0.56) 72%, rgba(10, 12, 22, 0) 100%)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2.5 md:px-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#scene-00"
            onClick={(e) => {
              e.preventDefault();
              onJumpToScene('scene-00');
            }}
            className="font-display text-lg md:text-xl font-semibold tracking-wide text-[#f6efe5] whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f28b50]"
          >
            Laila Starr
          </a>

          {/* Zone 2: Current Scene & Journey Readout */}
          <div className="hidden sm:flex items-center gap-3 text-xs tracking-[0.14em] uppercase text-[#e6ddd0]/85 min-w-0">
            <span
              className="font-mono tabular-nums shrink-0"
              style={{ color: activeScene.theme.accent }}
            >
              {activeScene.index === 0
                ? 'Prologue'
                : `${String(activeScene.index).padStart(2, '0')} / 10`}
            </span>
            <span aria-hidden="true" className="text-[#e6ddd0]/35">/</span>
            <span className="truncate font-medium">{activeScene.title}</span>
            <span aria-hidden="true" className="hidden md:inline text-[#e6ddd0]/25">·</span>
            <span
              data-testid="reading-progress-percent"
              className="hidden md:inline font-mono tabular-nums text-[11px] text-[#e6ddd0]/65 shrink-0"
            >
              {percentTotal}%
            </span>
          </div>

          {/* Mobile Scene & Progress Readout (<sm) */}
          <div className="flex sm:hidden items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase text-[#e6ddd0]/80">
            <span style={{ color: activeScene.theme.accent }}>
              {activeScene.index === 0 ? 'Prologue' : `${String(activeScene.index).padStart(2, '0')}/10`}
            </span>
            <span className="text-[#e6ddd0]/30">·</span>
            <span data-testid="reading-progress-percent-mobile">{percentTotal}%</span>
          </div>

          {/* Zone 3: Primary Controls */}
          <div className="relative flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setMixerOpen((prev) => !prev)}
              aria-label="Toggle audio mixer"
              aria-expanded={mixerOpen}
              data-testid="audio-mixer-toggle"
              className={`inline-flex h-10 w-10 items-center justify-center border transition-colors cursor-pointer shrink-0 ${
                mixerOpen
                  ? 'border-[#f28b50] bg-[#181f38] text-[#f28b50]'
                  : 'border-white/15 bg-[#121628]/85 text-[#e6ddd0]/80 hover:border-[#f28b50]/60 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIndexOpen((prev) => !prev)}
              aria-label={indexOpen ? 'Close scene index' : 'Open scene index'}
              aria-expanded={indexOpen}
              className="inline-flex h-10 items-center gap-2 border border-white/15 bg-[#121628]/85 px-3.5 text-xs font-medium tracking-wider uppercase text-[#f6efe5] transition-colors hover:border-[#f28b50]/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f28b50] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {indexOpen ? <X className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
              <span>Scenes</span>
            </button>

            {/* Compact Multi-Bus Audio Mixer Popover */}
            {mixerOpen && (
              <div
                role="dialog"
                aria-label="Audio Bus Mixer"
                data-testid="audio-mixer-popover"
                className="absolute right-0 top-12 z-50 w-72 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border border-white/15 bg-[#0d101d] p-4 shadow-2xl text-left"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#f28b50]">
                    Audio Mixer
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid="chrome-mute-toggle"
                      onClick={onToggleMute}
                      aria-label={isMuted ? 'Unmute master audio' : 'Mute master audio'}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/20 text-[10px] uppercase font-mono tracking-wider text-[#e6ddd0] hover:border-[#f28b50] hover:text-[#f28b50] cursor-pointer"
                    >
                      {isMuted ? (
                        <>
                          <VolumeX className="h-3 w-3 text-[#cfc5b9]/75" />
                          <span>Muted</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3 text-[#f28b50]" />
                          <span>Active</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMixerOpen(false)}
                      aria-label="Close audio mixer"
                      className="text-[#cfc5b9]/75 hover:text-white cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Bus 1: Ambience */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#e6ddd0]">Ambience &amp; Drones</span>
                      <button
                        type="button"
                        onClick={() => sceneAudioManager.toggleAmbienceMute()}
                        className="font-mono text-[10px] uppercase tracking-wider text-[#cfc5b9]/70 hover:text-white cursor-pointer"
                      >
                        {mixerSnapshot.ambienceMuted
                          ? 'Muted'
                          : `${Math.round(mixerSnapshot.ambienceVolume * 100)}%`}
                      </button>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(mixerSnapshot.ambienceVolume * 100)}
                      onChange={(e) =>
                        sceneAudioManager.setAmbienceVolume(Number(e.target.value) / 100)
                      }
                      aria-label="Ambience volume"
                      className="w-full accent-[#f28b50] cursor-pointer"
                    />
                  </div>

                  {/* Bus 2: Cinematic Score */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#e6ddd0]">Cinematic Score</span>
                      <button
                        type="button"
                        onClick={() => sceneAudioManager.toggleScoreMute()}
                        className="font-mono text-[10px] uppercase tracking-wider text-[#cfc5b9]/70 hover:text-white cursor-pointer"
                      >
                        {mixerSnapshot.scoreMuted
                          ? 'Muted'
                          : `${Math.round(mixerSnapshot.scoreVolume * 100)}%`}
                      </button>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(mixerSnapshot.scoreVolume * 100)}
                      onChange={(e) =>
                        sceneAudioManager.setScoreVolume(Number(e.target.value) / 100)
                      }
                      aria-label="Cinematic score volume"
                      className="w-full accent-[#f28b50] cursor-pointer"
                    />
                    {['sunset', 'celestial', 'split', 'descent', 'dawn'].includes(mixerSnapshot.currentMood) && (
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#c8bfb4]/70">
                        <span>Arrangement:</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              sceneAudioManager.setScoreVariant(
                                mixerSnapshot.currentMood as 'sunset' | 'celestial' | 'split' | 'descent' | 'dawn',
                                'a',
                              )
                            }
                            className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider transition-colors cursor-pointer ${
                              mixerSnapshot.activeScoreTrack.endsWith('_a')
                                ? 'bg-[#f28b50]/20 text-[#f28b50] border border-[#f28b50]/50 font-bold'
                                : 'text-[#cfc5b9]/60 hover:text-white border border-transparent'
                            }`}
                          >
                            Approach A
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              sceneAudioManager.setScoreVariant(
                                mixerSnapshot.currentMood as 'sunset' | 'celestial' | 'split' | 'descent' | 'dawn',
                                'b',
                              )
                            }
                            className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider transition-colors cursor-pointer ${
                              mixerSnapshot.activeScoreTrack.endsWith('_b')
                                ? 'bg-[#f28b50]/20 text-[#f28b50] border border-[#f28b50]/50 font-bold'
                                : 'text-[#cfc5b9]/60 hover:text-white border border-transparent'
                            }`}
                          >
                            Approach B
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bus 3: SFX */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#e6ddd0]">Environmental SFX</span>
                      <button
                        type="button"
                        onClick={() => sceneAudioManager.toggleSfxMute()}
                        className="font-mono text-[10px] uppercase tracking-wider text-[#cfc5b9]/70 hover:text-white cursor-pointer"
                      >
                        {mixerSnapshot.sfxMuted
                          ? 'Muted'
                          : `${Math.round(mixerSnapshot.sfxVolume * 100)}%`}
                      </button>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(mixerSnapshot.sfxVolume * 100)}
                      onChange={(e) =>
                        sceneAudioManager.setSfxVolume(Number(e.target.value) / 100)
                      }
                      aria-label="Environmental SFX volume"
                      className="w-full accent-[#f28b50] cursor-pointer"
                    />
                  </div>

                  {/* Bus 4: Voices */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#e6ddd0]">Character Voices</span>
                      <button
                        type="button"
                        onClick={() => sceneAudioManager.toggleVoiceMute()}
                        className="font-mono text-[10px] uppercase tracking-wider text-[#cfc5b9]/70 hover:text-white cursor-pointer"
                      >
                        {mixerSnapshot.voiceMuted
                          ? 'Muted'
                          : `${Math.round(mixerSnapshot.voiceVolume * 100)}%`}
                      </button>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(mixerSnapshot.voiceVolume * 100)}
                      onChange={(e) =>
                        sceneAudioManager.setVoiceVolume(Number(e.target.value) / 100)
                      }
                      aria-label="Character voices volume"
                      className="w-full accent-[#f28b50] cursor-pointer"
                    />
                    <p className="mt-1.5 text-[11px] leading-snug text-[#c8bfb4]/65">
                      {hasRecordedVoices
                        ? 'Studio voice recordings active.'
                        : 'Timed text cadence active (no voice files loaded).'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Multi-Scene Visual Journey Progress Bar */}
        <div className="relative mx-auto max-w-7xl px-5 pb-1 md:px-8">
          <div
            role="progressbar"
            aria-label="Total chapter reading progress across all ten scenes"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentTotal}
            aria-valuetext={`Scene ${activeScene.index} of ${scenes.length}: ${activeScene.title}, ${percentTotal}% complete`}
            data-testid="scroll-progress-bar"
            className="group/journey relative flex w-full items-center gap-[3px] py-1"
            onMouseLeave={() => setHoveredSceneId(null)}
          >
            {segments.map((seg) => {
              const isHovered = hoveredSceneId === seg.id;
              return (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => {
                    setHoveredSceneId(null);
                    onJumpToScene(seg.id);
                  }}
                  onMouseEnter={() => setHoveredSceneId(seg.id)}
                  onFocus={() => setHoveredSceneId(seg.id)}
                  onBlur={() => setHoveredSceneId(null)}
                  aria-label={`Jump to Scene ${seg.index}: ${seg.title}`}
                  data-scene-segment={seg.id}
                  data-scene-state={
                    seg.isActive ? 'active' : seg.isCompleted ? 'completed' : 'upcoming'
                  }
                  style={{ flexGrow: Math.max(1, Math.round(seg.widthPct * 10)) }}
                  className="relative flex h-2.5 basis-0 items-center cursor-pointer focus-visible:outline-none"
                >
                  <span
                    className={`relative block w-full overflow-hidden bg-white/12 transition-all duration-200 motion-reduce:transition-none ${
                      seg.isActive || isHovered
                        ? 'h-[4px] group-hover/journey:h-[5px]'
                        : 'h-[2px] group-hover/journey:h-[4px]'
                    }`}
                  >
                    <span
                      className="block h-full transition-[width] duration-150 ease-out motion-reduce:transition-none"
                      style={{
                        width: `${Math.round(seg.fillRatio * 1000) / 10}%`,
                        backgroundColor: seg.accent,
                        boxShadow:
                          seg.isActive && seg.fillRatio > 0
                            ? `0 0 10px ${seg.accent}`
                            : undefined,
                      }}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subtle Editorial Scene Preview Readout on Hover / Focus */}
          {hoveredSegment && (
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-none hidden sm:flex absolute right-5 top-full mt-1 items-center gap-3 border border-white/12 bg-[#0d101d]/96 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#f6efe5] shadow-xl md:right-8"
            >
              <span
                className="font-mono tabular-nums"
                style={{ color: hoveredSegment.accent }}
              >
                {String(hoveredSegment.index).padStart(2, '0')}
              </span>
              <span className="font-medium">{hoveredSegment.title}</span>
              <span aria-hidden="true" className="text-[#e6ddd0]/30">·</span>
              <span className="font-mono tabular-nums text-[#cfc5b9]/75">
                {hoveredSegment.timecode}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Editorial Scene Index Drawer */}
      {indexOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chapter One Scene Index"
          className="fixed inset-0 z-50 flex justify-end bg-black/78"
          onClick={() => setIndexOpen(false)}
        >
          <nav
            aria-label="Chapter scenes"
            className="relative h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0d101d] px-7 pt-[max(2rem,calc(env(safe-area-inset-top,0px)+1.5rem))] pb-[max(2rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] pl-[max(1.75rem,env(safe-area-inset-left,0px))] pr-[max(1.75rem,env(safe-area-inset-right,0px))] text-[#f6efe5] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#f28b50]">
                  Chapter 01 · {percentTotal}% Read
                </p>
                <h2 className="font-display mt-1 text-2xl font-semibold tracking-wide">
                  Once Upon a Falling Starr
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIndexOpen(false)}
                aria-label="Close scene index"
                className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-[#f6efe5] hover:border-[#f28b50] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Replay Prologue Entry */}
            <div className="mt-4 flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#cfc5b9]/70">
                Opening Sequence
              </span>
              <button
                type="button"
                data-testid="replay-prologue-btn"
                onClick={() => {
                  setIndexOpen(false);
                  onReplayPrologue();
                }}
                className="inline-flex items-center gap-2 border border-[#f28b50]/50 bg-[#f28b50]/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#f28b50] transition-colors hover:bg-[#f28b50] hover:text-[#0b0d17] cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Replay Prologue</span>
              </button>
            </div>

            {/* Journey Progress Strip inside Drawer */}
            <div className="mt-4 flex items-center gap-[3px]">
              {segments.map((seg) => (
                <div
                  key={seg.id}
                  style={{ flexGrow: Math.max(1, Math.round(seg.widthPct * 10)) }}
                  className="h-[3px] basis-0 overflow-hidden bg-white/10"
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.round(seg.fillRatio * 1000) / 10}%`,
                      backgroundColor: seg.accent,
                    }}
                  />
                </div>
              ))}
            </div>

            <ol className="mt-5 divide-y divide-white/8">
              {scenes.map((scene, idx) => {
                const seg = segments[idx];
                const isActive = idx === activeSceneIndex;
                return (
                  <li key={scene.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setIndexOpen(false);
                        onJumpToScene(scene.id);
                      }}
                      className={`group flex w-full items-baseline justify-between gap-4 py-3.5 text-left transition-colors cursor-pointer ${
                        isActive ? 'text-[#f6efe5]' : 'text-[#e8e0d5]/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-baseline gap-4 min-w-0">
                        <span
                          className="font-mono text-xs tabular-nums shrink-0"
                          style={{
                            color: isActive || seg?.isCompleted ? scene.theme.accent : undefined,
                            opacity: isActive || seg?.isCompleted ? 1 : 0.55,
                          }}
                        >
                          {String(scene.index).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <div
                            className="font-display text-xl font-medium leading-tight"
                            style={isActive ? { color: scene.theme.accent } : undefined}
                          >
                            {scene.title}
                          </div>
                          <div className="mt-0.5 text-xs text-[#c8bfb4]/65 truncate">
                            {scene.subtitle}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-[#c8bfb4]/55 shrink-0">
                        {scene.timecode}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      )}
    </>
  );
});

ChapterChrome.displayName = 'ChapterChrome';
