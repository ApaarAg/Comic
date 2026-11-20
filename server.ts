import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const VIDEOS_DIR = path.resolve(__dirname, 'public/assets/videos');

interface VideoManifestEntry {
  id: string;
  filename: string;
  referenceImage: string;
  prompt: string;
}

const VIDEO_MANIFEST: Record<string, VideoManifestEntry> = {
  video01_mumbai: {
    id: 'video01_mumbai',
    filename: 'scene01_mumbai.mp4',
    referenceImage: 'public/assets/chapter1/p06_panel01.webp',
    prompt:
      'Cinematic painterly aerial view of Mumbai skyline during a late-December sunset, warm coral sun dipping behind hazy towers, drifting clouds, distant BKC overpass traffic headlights, pink, orange, teal, and deep indigo palette, slow gentle aerial glide, 16:9 1080p seamless ambient motion.',
  },
  video02_traffic: {
    id: 'video02_traffic',
    filename: 'scene02_traffic.mp4',
    referenceImage: 'public/assets/chapter1/p07_panel02.webp',
    prompt:
      'Cinematic view of dense chaotic Mumbai evening rush-hour traffic on an elevated overpass, slowly crawling vehicles, warm sunset exhaust haze and cool teal dusk shadows, restrained camera parallax, 16:9 1080p seamless loop.',
  },
  video03_party: {
    id: 'video03_party',
    filename: 'scene03_party.mp4',
    referenceImage: 'public/assets/chapter1/p08_panel02.webp',
    prompt:
      'Atmospheric sixth-floor Mumbai apartment party at dusk overlooking city lights, soft moving silhouettes in warm magenta interior light, curling cigarette smoke drifting past an open window, 16:9 1080p seamless loop.',
  },
  video04_office: {
    id: 'video04_office',
    filename: 'scene04_office.mp4',
    referenceImage: 'public/assets/chapter1/p10_panel04.webp',
    prompt:
      'Surreal celestial office high beyond mortal clouds inside a silvered tower, pastel pink, lavender, teal, and cerulean floating clouds, drifting dust motes and luminous light shafts, ultra-slow weightless glide, 16:9 1080p seamless loop.',
  },
  video05_hospital: {
    id: 'video05_hospital',
    filename: 'scene05_hospital.mp4',
    referenceImage: 'public/assets/chapter1/p16_panel01.webp',
    prompt:
      'Restrained cinematic night hospital corridor in cool cyan and slate fluorescent light, subtle moving shadows across glass doors, quiet rainy ambiance outside, slow measured stillness, 16:9 1080p seamless loop.',
  },
  video06_transformation: {
    id: 'video06_transformation',
    filename: 'scene06_transformation.mp4',
    referenceImage: 'public/assets/chapter1/p17_panel01.webp',
    prompt:
      'Abstract cinematic cosmic-to-mortal energy transition in deep blue, violet, magenta, and cyan light ribbons with suspended particles swirling downward, fluid optical depth, 16:9 1080p ambient motion.',
  },
  video07_final_city: {
    id: 'video07_final_city',
    filename: 'scene07_final_city.mp4',
    referenceImage: 'public/assets/chapter1/p25_panel01.webp',
    prompt:
      'Peaceful early morning in coastal Mumbai eight years later, pastel dawn mist drifting gently across harbour water and Gateway of India under warm amber sunrise, tranquil stillness, 16:9 1080p seamless loop.',
  },
};

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/voice-assets', (_req: Request, res: Response) => {
    const voicesDir = path.resolve(__dirname, 'public/assets/audio/voices');
    const available: string[] = [];

    const scanDir = (dir: string, prefix = '') => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          scanDir(path.join(dir, entry.name), `${prefix}${entry.name}/`);
        } else if (entry.isFile() && /\.(mp3|wav|ogg|m4a)$/i.test(entry.name)) {
          available.push(`/assets/audio/voices/${prefix}${entry.name}`);
        }
      }
    };

    scanDir(voicesDir);
    res.json({ available });
  });

  app.get('/api/videos/status', (_req: Request, res: Response) => {
    const geminiConfigured = Boolean(getAiClient());
    const entries = Object.values(VIDEO_MANIFEST).map((item) => {
      const targetPath = path.join(VIDEOS_DIR, item.filename);
      const exists = fs.existsSync(targetPath);
      const sizeBytes = exists ? fs.statSync(targetPath).size : 0;
      return {
        id: item.id,
        url: `/assets/videos/${item.filename}`,
        exists,
        sizeBytes,
      };
    });

    res.json({
      geminiConfigured,
      model: 'gemini-omni-1.2-flash',
      videos: entries,
    });
  });

  app.post('/api/videos/generate', async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Paid GEMINI_API_KEY is not configured on the server environment for gemini-omni-1.2-flash video generation.',
      });
      return;
    }

    const videoId = typeof req.body?.videoId === 'string' ? req.body.videoId : '';
    const entry = VIDEO_MANIFEST[videoId];
    if (!entry) {
      res.status(400).json({ error: `Unknown videoId: ${videoId}` });
      return;
    }

    try {
      const refPath = path.resolve(__dirname, entry.referenceImage);
      const hasRef = fs.existsSync(refPath);
      const inputPayload = hasRef
        ? [
            {
              type: 'image' as const,
              mime_type: 'image/webp',
              data: fs.readFileSync(refPath).toString('base64'),
            },
            {
              type: 'text' as const,
              text: entry.prompt,
            },
          ]
        : entry.prompt;

      const interaction = await ai.interactions.create(
        {
          model: 'gemini-omni-1.2-flash',
          input: inputPayload,
          background: false,
          store: false,
          stream: false,
          response_format: {
            type: 'video',
            aspect_ratio: '16:9',
            duration: '8s',
            resolution: '1080p',
          },
        },
        { timeout: 300000 },
      );

      const videoPart = interaction.output_video;
      if (!videoPart?.data) {
        res.status(502).json({ error: 'Video generation returned no video bytes.' });
        return;
      }

      fs.mkdirSync(VIDEOS_DIR, { recursive: true });
      const outPath = path.join(VIDEOS_DIR, entry.filename);
      fs.writeFileSync(outPath, Buffer.from(videoPart.data, 'base64'));

      res.json({
        ok: true,
        id: entry.id,
        url: `/assets/videos/${entry.filename}`,
        sizeBytes: fs.statSync(outPath).size,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
