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

## Audition & Review Consoles

For editorial review, dedicated audition consoles are provided:
- **Mrs. Shah Labour Contraction Auditions**: [`/mrs-shah-audition.html`](http://localhost:4173/mrs-shah-audition.html)
  - Features side-by-side comparison between the original baseline and Candidate Take 1 (Urgent Contraction) / Take 2 (Strained Labor Surge).
- **Brian Narrator Pacing Console**: [`/narrator-auditions.html`](http://localhost:4173/narrator-auditions.html)
  - Features the approved 1.05x Indian English narrator delivery across atmospheric, reflective, and dramatic passages.

---

## Deployment Guide

### Option A: Containerized Deployment (Google Cloud Run / AWS ECS / DigitalOcean / Fly.io)
1. Build the production Docker container:
   ```bash
   docker build -t storyverse-app .
   ```
2. Run locally or deploy:
   ```bash
   docker run -p 3000:3000 --env-file .env storyverse-app
   ```
3. Cloud Run one-liner:
   ```bash
   gcloud run deploy storyverse --source . --platform managed --region us-central1 --allow-unauthenticated
   ```

### Option B: Static Edge CDN (Vercel / Netlify / Cloudflare Pages)
1. Build the static distribution:
   ```bash
   npm run build
   ```
2. Deploy the `dist/` directory.
   - **Vercel**: Configuration pre-configured in `vercel.json` with SPA routing and audition console passthrough.
   - **Netlify / Cloudflare Pages**: SPA redirects pre-configured in `public/_redirects` (`/* /index.html 200`).
   - **Nginx**:
     ```nginx
     location / {
       try_files $uri $uri/ /index.html;
     }
     ```
3. **Asset Range Requests**: Ensure CDN caching allows HTTP 206 `Partial Content` range requests for audio (`.mp3`) and video (`.mp4`) playback.

---

## License & Credits
- **Source Material**: *The Many Deaths of Laila Starr* by Ram V & Filipe Andrade (BOOM! Studios).
- **Audio Production**: Custom Indian English narrator model (Brian · 1.05x) and character dialogue manifest.
- **Code**: Apache-2.0 License.
