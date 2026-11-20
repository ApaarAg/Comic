# Veo 3.1 / Gemini Omni Flash — Ready-to-Use Scene Video Prompts

Because paid API key provisioning for `gemini-omni-1.2-flash` was declined during build, the site currently ships with **1080p seamless motion-composited MP4 loops** in `public/assets/videos/` generated locally from the comic plates via `ffmpeg`.

Every `<video>` layer is wired to drop-in paths below. To upgrade any or all scenes to live AI-generated Veo footage, generate clips with these exact specs and replace the matching `.mp4` file in `public/assets/videos/` (or configure a paid `GEMINI_API_KEY` server secret and call `POST /api/videos/generate`).

---

## Global Export Specifications
- **Desktop Resolution**: `1920x1080` (`16:9` landscape, H.264 `yuv420p`, `faststart`)
- **Preferred Master**: 4K downsampled cleanly to 1080p web delivery
- **Duration**: `8s–10s` seamless loop (`muted` playback)
- **Visual Identity**: Preserve Ram V & Filipe Andrade / Inês Amaro's hand-drawn ink & painterly color grading (deep blues, teal, coral sunset orange, magenta/pink, muted violet)

---

### VIDEO 01 — MUMBAI CITY (`public/assets/videos/scene01_mumbai.mp4`)
- **Used in**: EntryVeil Prologue & Scene 01 (`The City of Mumbai`, scroll-scrubbed + looping)
- **Current Master**: Crisp 1080p `ffmpeg` multi-layer forward aerial composite built from `src/assets/images/mumbai_skyline_backdrop_1795078714752.jpg` and `src/assets/images/mumbai_clouds_haze_1795078713772.jpg`
- **Reference Image**: `public/assets/chapter1/p06_panel01.webp` / `src/assets/images/mumbai_skyline_backdrop_1795078714752.jpg`
- **Desktop Prompt (`16:9`)**:
  > Cinematic painterly aerial view of Mumbai skyline during a late-December sunset, inspired by Filipe Andrade hand-drawn ink and watercolor illustration. Warm coral-orange sun dipping behind hazy glass skyscrapers, slow drifting clouds, distant winding BKC overpass traffic with tiny glowing headlights, rich pink, sunset orange, deep teal, and indigo color palette. Gentle forward aerial camera tracking, subtle atmospheric haze, 16:9 1080p seamless ambient motion, no text, no flicker.
- **Mobile Framing (`9:16`)**: Vertical crop centered on the setting coral sun and curving overpass traffic below towers.

### VIDEO 02 — MUMBAI TRAFFIC (`public/assets/videos/scene02_traffic.mp4`)
- **Used in**: Scene 02 (`The Chaotic Journey`, ambient loop)
- **Reference Image**: `public/assets/chapter1/p07_panel02.webp`
- **Desktop Prompt (`16:9`)**:
  > Cinematic view of dense chaotic Mumbai evening rush-hour traffic on an elevated overpass, painterly ink-and-wash texture matching editorial comic art. Slowly crawling cars, motorcycles, glowing amber and ruby tail lights streaking softly through warm sunset exhaust haze and cool teal dusk shadows. Restrained handheld parallax camera drift, crisp detail, 16:9 1080p seamless loop, no text.
- **Mobile Framing (`9:16`)**: Stacked tail-light canyon depth down the crowded overpass.

### VIDEO 03 — COLLEGE PARTY (`public/assets/videos/scene03_party.mp4`)
- **Used in**: Scene 03 (`The College Party`, ambient loop)
- **Reference Image**: `public/assets/chapter1/p08_panel02.webp`
- **Desktop Prompt (`16:9`)**:
  > Atmospheric sixth-floor Mumbai apartment university party at dusk overlooking shimmering twilight city lights. Soft out-of-focus human silhouettes swaying gently in warm magenta and amber interior lighting while delicate wisps of cigarette smoke curl slowly past an open window against deep indigo dusk sky. Smooth subtle camera breathing, painterly comic color grading, 16:9 1080p seamless loop.
- **Mobile Framing (`9:16`)**: Open sixth-floor window silhouette and curling smoke against distant city lights.

### VIDEO 04 — DEATH'S OFFICE (`public/assets/videos/scene04_office.mp4`)
- **Used in**: Scene 04 (`The Silvered Tower`, ambient loop)
- **Reference Image**: `public/assets/chapter1/p10_panel04.webp`
- **Desktop Prompt (`16:9`)**:
  > Surreal celestial corporate office high beyond mortal clouds inside a slender ivory-silver tower. Expansive floor-to-ceiling glass walls floating amid slow-drifting pastel pink, lavender, soft teal, and cerulean clouds. Ethereal floating dust motes, gentle luminous sunlight shafts, dreamy architectural depth, ultra-slow weightless camera glide, painterly graphic novel aesthetic, 16:9 1080p seamless loop.
- **Mobile Framing (`9:16`)**: Tall glass mullions suspended above pastel clouds.

### VIDEO 05 — HOSPITAL (`public/assets/videos/scene05_hospital.mp4`)
- **Used in**: Scene 07 (`The Hospital`) & Scene 08 (`The Escape`, ambient loop)
- **Reference Image**: `public/assets/chapter1/p16_panel01.webp`
- **Desktop Prompt (`16:9`)**:
  > Restrained cinematic night hospital corridor in Amravati. Cool sterile cyan and slate blue fluorescent light reflecting off quiet tiled floors, subtle distant light flicker and gentle shadow movement across glass ward doors, quiet rain ambiance outside windows. Slow measured dolly stillness, moody painterly realism, 16:9 1080p seamless loop.
- **Mobile Framing (`9:16`)**: Centered cool glowing ward doorway and corridor reflections.

### VIDEO 06 — TRANSFORMATION (`public/assets/videos/scene06_transformation.mp4`)
- **Used in**: Scene 05 (loop), Scene 06 (`Laila Becomes Mortal`, scroll-scrubbed) & Scene 09 (`The Second Death`, scroll-scrubbed)
- **Reference Image**: `public/assets/chapter1/p17_panel01.webp`
- **Desktop Prompt (`16:9`)**:
  > Abstract cinematic cosmic-to-mortal energy transition inspired by painterly comic art. Deep midnight blue, violet purple, magenta pink, and electric cyan light ribbons and suspended luminous particles swirling downward in slow fluid currents like a soul descending through storm clouds. Soft optical distortion, velvety depth, 16:9 1080p seamless ambient motion.
- **Mobile Framing (`9:16`)**: Vertical cosmic descent channel with violet-cyan currents.

### VIDEO 07 — FINAL CITY ENVIRONMENT (`public/assets/videos/scene07_final_city.mp4`)
- **Used in**: Scene 10 (`Eight Years Later`, ambient loop)
- **Reference Image**: `public/assets/chapter1/p25_panel01.webp`
- **Desktop Prompt (`16:9`)**:
  > Peaceful serene early morning in coastal Mumbai eight years later. Pale pastel dawn mist curling gently across harbour waters and the Gateway of India shoreline bathed in soft warm amber sunrise and muted slate blue shadows. Subtle rising morning light mist, tranquil stillness, painterly comic book warmth, 16:9 1080p seamless loop.
- **Mobile Framing (`9:16`)**: Warm dawn sky mist above calm coastal harbour water.
