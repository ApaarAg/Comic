# Storyverse 4.0 — The Many Deaths of Laila Starr
### An Animated Graphic Novel & Cinematic Storytelling Experience

Storyverse 4.0 is a cinematic web reader that adapts Ram V & Filipe Andrade’s award-winning graphic novel *The Many Deaths of Laila Starr* (BOOM! Studios) into an interactive, audio-visual graphic novel experience.

---

## Architectural Highlights

- **Pinned 100vh Virtual Camera Stage (`CinematicViewportStage`)**: Smooth, uninterrupted scroll directing through the comic world with 2.5D parallax depth, dynamic camera scaling, and continuous scene choreography.
- **Unified Storyboard Timeline (`storyTimeline.ts` / `StoryDirectorTimeline`)**: Immutable timeline coordinating camera pans, panel reveals, synchronized speech bubbles, background scores, and ambient soundscapes.
- **Narrative Audio Bus (`NarrativeEngine` & `CharacterVoicePlayer`)**:
  - Preferred narrator candidate **Brian** at **1.05x** (warm, expressive Indian English storytelling cadence).
  - Explicit event-state latching and hysteresis preventing duplicate audio on forward/backward scrubbing.
  - Automatic ambience ducking during dialogue and smooth crossfades between musical movements.
- **Three.js WebGL & Kinetic Ink Shaders (`CinematicTransition`)**: Six distinct transition effects (ink-wash bleed, comic panel fractures, celestial portals, temporal splits, storm lightning, dawn mist) with lazy-loaded WebGL contexts.
- **Single Coordinated Scroll Architecture**: Lenis smooth scroll seamlessly bound to GSAP ScrollTrigger for deterministic forward and reverse timeline scrubbing.

---

## Quick Start & Local Development

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- **npm**: `v10.x` or higher

### 2. Installation
```bash
git clone <repo-url>
cd Comic-main
npm install
```

### 3. Environment Setup
Copy the provided `.env.example` file to create `.env`:
```bash
cp .env.example .env
```
Configure your environment variables:
- `PORT`: Server port (default: `3000`)
- `APP_URL`: Base deployment URL (default: `http://localhost:3000`)
- `GEMINI_API_KEY`: *(Optional)* AI Studio API key for server features
- `ELEVENLABS_API_KEY`: *(Optional)* Offline voice production pipeline key (never exposed to client bundles)

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build & Verification

### Run Type Checking & Build
```bash
npm run lint    # Runs tsc --noEmit
npm run build   # Builds client bundle via Vite
npm start       # Starts production server
```

### Automated Acceptance QA Test
Run the end-to-end headless Chrome browser acceptance suite:
```bash
node scripts/test-storyverse-4-0-suite.cjs
```

---

## Deployment Guide

### Cloud Run / Docker Container Deployment
1. Ensure `PORT=3000` and `NODE_ENV=production` are set in container environment.
2. Build client assets: `npm run build`.
3. Start the Node/Express server with `npm start`.

### Static Hosting with Node API
- Client static files are built into `dist/`.
- Ensure web server supports HTTP 206 Range Requests (`Accept-Ranges: bytes`) for audio and video assets in `/assets/videos/`.

---

## License & Credits
- **Source Material**: *The Many Deaths of Laila Starr* by Ram V & Filipe Andrade (BOOM! Studios).
- **Audio Production**: Custom Indian English narrator model (Brian · 1.05x) and character dialogue manifest.
- **Code**: Apache-2.0 License.
