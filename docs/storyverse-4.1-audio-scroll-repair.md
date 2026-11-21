# Storyverse 4.1 Audio and Scroll Synchronization Repair

**Date:** 2026-11-21
**Branch:** `main`

## Summary

Repaired scene ownership, recorded voice playback, scroll-triggered dialogue, replay behavior, and the per-frame scroll work that caused narration to drift between scenes. Scene stages now own their local audio triggers, and asynchronous audio callbacks are checked against both a unique playback generation and its scene owner.

## Root causes

- The narrative provider advanced narration from whole-document scroll progress using global beat ranges. The cinematic stages also advanced scene-local audio, so two independent timelines could select audio at once. The global ranges did not match the chapter’s actual section heights.
- The audio player treated a voice line ID as its only identity. A previous asynchronous load or Howler callback could still act on a newer playback of the same line. Manifest fetches also returned an empty availability set to concurrent requests before the first fetch finished.
- Stage exits, large scroll jumps, and panel exits did not consistently cancel audio work. Completed audio could not reliably replay after a deliberate revisit because the stage kept restoring the completed latch from the player snapshot.
- The app measured every scene’s DOM position on every scroll tick, although those offsets only change on layout updates.

## Changes

- Made `CinematicViewportStage` the source of scene-local narration and dialogue triggers. The chapter provider no longer runs a second document-wide scroll listener.
- Added explicit voice lifecycle states, per-playback generation IDs, scene ownership, cancellation reasons, error callbacks, Howl instance reuse, and a shared in-flight manifest promise to `CharacterVoicePlayer`.
- Added scene ownership updates at actual section boundaries, including initial page load. A stale load is canceled if its owner is no longer active.
- Suppressed backlog playback after large scroll jumps, kept completed lines latched during small reverse movement, and allowed replay after a deliberate retreat. Completion state now syncs once per playback event so it cannot undo that re-arming.
- Scoped dialogue panel triggers to their owning scene and stopped playback on panel exit. Kept narrative context updates from rebuilding the controller’s ScrollTriggers.
- Cached scene offsets on layout changes and limited root progress state updates to meaningful deltas.
- Added a lifecycle trace and browser integration runner. The trace-only scroll hook is enabled only when audio tracing is explicitly enabled.
- Regenerated the voice manifest to include the opening canvas recording. It now lists 49 available recordings.

## Verification

| Check | Result |
|---|---|
| `npm ci` | Passed; 212 packages installed, 0 vulnerabilities reported |
| `npm run lint` | Passed (`tsc --noEmit`) |
| `npm test` | Passed; 44 tests |
| `npm run build` | Passed |
| Real-audio browser integration | Passed; 8 scenario assertions, 127 lifecycle events, 0 console errors, 0 failed voice requests |
| Desktop traversal | Passed; prologue and all 10 scenes |
| Mobile traversal | Passed at 390×844; prologue and all 10 scenes |

The browser scenarios confirmed that opening narration starts once from its recording and advances with the AudioContext; Scene 02 narration starts only under Scene 02 ownership; the Scene 02 voice and bubble match the active panel; fast scrolling does not queue older lines; a throttled in-flight recording is canceled at a scene boundary; tiny back-scroll does not replay; and a deliberate revisit does.

The build still reports the existing Vite `__dirname` config-loader notice and a large JavaScript chunk warning. Neither prevented the build or browser run.

Full browser evidence is in [audio-scroll-lifecycle-trace.json](./audio-scroll-lifecycle-trace.json).
