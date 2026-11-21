import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const NARRATOR_DIR = path.resolve('public/assets/audio/voices/narrator');
const AUDITION_DIR = path.resolve('public/assets/audio/auditions/narrator');
const BRIAN_VOICE_ID = 'nPczCjzI2devNBz1zQrb';

interface NarrationSpec {
  id: string;
  sceneId: string;
  filename: string;
  aliasFilename?: string;
  text: string;
  stability: number;
  style: number;
  preGeneratedFile?: string;
  directorNote: string;
}

const NARRATION_SPECS: NarrationSpec[] = [
  // Scene 01
  {
    id: 's01-01',
    sceneId: 'scene-01',
    filename: 'scene-01-opening.mp3',
    text: 'It began on a Wednesday afternoon as a late December sun was just dipping below the Mumbai skyline.',
    stability: 0.54,
    style: 0.22,
    preGeneratedFile: 'cand-brian-105-opening.mp3',
    directorNote: 'Atmospheric dusk reveal: warm, evocative, engaging introduction.',
  },
  {
    id: 's01-02',
    sceneId: 'scene-01',
    filename: 'scene-01-highway.mp3',
    aliasFilename: 's01-02-highway.mp3',
    text: 'Down where the elevated highway curves between glass towers, the city exhaled in horns and heat.',
    stability: 0.52,
    style: 0.24,
    directorNote: 'Grounded urban observation: world-weary warmth, clear sensory weight on horns and heat.',
  },
  // Scene 02
  {
    id: 's02-conn-01',
    sceneId: 'scene-02',
    filename: 'scene-02-connector.mp3',
    text: 'On the B.K.C. overpass, one city became many cities — each trapped inside its own small metal shell.',
    stability: 0.52,
    style: 0.22,
    directorNote: 'Philosophical observation: intimate close-mic delivery with brief pause at em-dash.',
  },
  // Scene 03
  {
    id: 's03-02',
    sceneId: 'scene-03',
    filename: 's03-02-window.mp3',
    text: '...Beneath gentle curls of raven hair, her eyes stayed fixed on distant city lights while her thoughts drifted like cigarette smoke.',
    stability: 0.54,
    style: 0.25,
    directorNote: 'Poetic melancholy: tender, velvety resonance with gentle trailing breath.',
  },
  // Scene 04
  {
    id: 's04-conn-01',
    sceneId: 'scene-04',
    filename: 'scene-04-connector.mp3',
    text: 'Beyond the mortal clouds, in a place where endings are drafted like memos, something unprecedented was happening.',
    stability: 0.52,
    style: 0.26,
    directorNote: 'Cosmic irony: mythic scale undercut by dry wit on memos, arching delivery.',
  },
  // Scene 05
  {
    id: 's05-01',
    sceneId: 'scene-05',
    filename: 's05-01-fall.mp3',
    text: 'It was around that time that the girl from the window at the party was falling through the air — two floors down and fast approaching the ground.',
    stability: 0.50,
    style: 0.28,
    directorNote: 'Dramatic suspense: tense, urgent yet controlled cadence, breathless momentum.',
  },
  {
    id: 's05-02',
    sceneId: 'scene-05',
    filename: 's05-02-birth.mp3',
    text: "Just as she hit the ground, Mrs. Shah was in the Amravati Hospital squeezing her husband's hand with such strength that he was screaming louder than her.",
    stability: 0.52,
    style: 0.26,
    directorNote: 'Tragicomic convergence: dual emotional texture, solemn impact meeting affectionate warmth.',
  },
  {
    id: 's05-03',
    sceneId: 'scene-05',
    filename: 's05-03-darius.mp3',
    text: 'As the midwife urged her into one last push, a new life came into being. A beautiful thing that would go on to be the cause of much consternation in his many years to come.',
    stability: 0.52,
    style: 0.25,
    directorNote: 'Prophetic portent: rich chest resonance on A beautiful thing, fateful drop at end.',
  },
  // Scene 06
  {
    id: 's06-conn-01',
    sceneId: 'scene-06',
    filename: 'scene-06-connector.mp3',
    text: 'A deal was being struck — the kind that bends the fabric of everything.',
    stability: 0.52,
    style: 0.28,
    directorNote: 'Cosmic weight: deliberate pause at em-dash, heavy gravity on everything.',
  },
  // Scene 07
  {
    id: 's07-conn-01',
    sceneId: 'scene-07',
    filename: 'scene-07-connector.mp3',
    text: 'She woke up in a body that felt borrowed, in a room that smelled of antiseptic and second chances.',
    stability: 0.56,
    style: 0.18,
    preGeneratedFile: 'cand-brian-105-reflective.mp3',
    directorNote: 'Mortal awakening: intimate, compassionate, warm acoustic landing.',
  },
  // Scene 08
  {
    id: 's08-conn-01',
    sceneId: 'scene-08',
    filename: 'scene-08-connector.mp3',
    text: 'The neo-natal ward held its breath. Death held a baby.',
    stability: 0.55,
    style: 0.22,
    directorNote: 'Hushed stillness: quiet, tender awe, delicate spacing between short sentences.',
  },
  // Scene 09
  {
    id: 's09-01',
    sceneId: 'scene-09',
    filename: 's09-01-commerce.mp3',
    text: 'And in Mumbai, even at that late hour, great thundering wheels of commerce rolled on unfettered.',
    stability: 0.50,
    style: 0.28,
    directorNote: 'Inexorable momentum: heavy acoustic driving cadence, cutting clarity.',
  },
  {
    id: 's09-02',
    sceneId: 'scene-09',
    filename: 's09-02-midnight.mp3',
    text: 'And so, only a few minutes away from midnight, Laila Starr met her death once again.',
    stability: 0.50,
    style: 0.30,
    preGeneratedFile: 'cand-brian-105-dramatic.mp3',
    directorNote: 'Poetic fatalism: controlled urgency, quiet grief overlaid with destiny.',
  },
  // Scene 10
  {
    id: 's10-conn-01',
    sceneId: 'scene-10',
    filename: 'scene-10-connector.mp3',
    text: 'Eight years later, the sun rose anyway — as it always has, as it always will.',
    stability: 0.54,
    style: 0.22,
    directorNote: 'Philosophical peace: warm morning sun resonance, lingering serene fade.',
  },
];

async function generateTrack(spec: NarrationSpec, apiKey: string) {
  const targetPath = path.join(NARRATOR_DIR, spec.filename);

  // If already pre-generated in auditions and approved, copy directly
  if (spec.preGeneratedFile) {
    const auditionPath = path.join(AUDITION_DIR, spec.preGeneratedFile);
    if (fs.existsSync(auditionPath)) {
      console.log(`[Reusing Approved Audition] ${spec.id} -> ${spec.filename}`);
      fs.copyFileSync(auditionPath, targetPath);
      if (spec.aliasFilename) {
        fs.copyFileSync(auditionPath, path.join(NARRATOR_DIR, spec.aliasFilename));
      }
      return {
        id: spec.id,
        filename: spec.filename,
        text: spec.text,
        reused: true,
        bytes: fs.statSync(targetPath).size,
      };
    }
  }

  console.log(`[ElevenLabs Generating 1.05x] ${spec.id} (${spec.filename})...`);
  console.log(`   Text: "${spec.text.slice(0, 60)}..."`);

  const payload = {
    text: spec.text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: spec.stability,
      similarity_boost: 0.82,
      style: spec.style,
      use_speaker_boost: true,
      speed: 1.05,
    },
  };

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${BRIAN_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs error for ${spec.id} (${res.status}): ${err}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(targetPath, buf);
  if (spec.aliasFilename) {
    fs.copyFileSync(targetPath, path.join(NARRATOR_DIR, spec.aliasFilename));
  }
  console.log(`   ✓ Saved ${spec.filename} (${buf.length} bytes)`);

  return {
    id: spec.id,
    filename: spec.filename,
    text: spec.text,
    reused: false,
    bytes: buf.length,
  };
}

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not set in environment or .env');
  }

  console.log('================================================================');
  console.log('STORYVERSE 3.1: BRIAN 1.05x CHAPTER NARRATION SUITE PRODUCTION');
  console.log('Voice: Brian (nPczCjzI2devNBz1zQrb)');
  console.log('Speed: 1.05x (Native Duration Modeling)');
  console.log('Target Tracks: 14 total (3 reused from approved auditions + 11 new)');
  console.log('================================================================\n');

  const generated = [];

  for (const spec of NARRATION_SPECS) {
    try {
      const res = await generateTrack(spec, apiKey);
      generated.push(res);
      // Brief pause between API calls
      if (!res.reused) {
        await new Promise((r) => setTimeout(r, 800));
      }
    } catch (err) {
      console.error(`FAILED to generate ${spec.id}:`, err);
      process.exit(1);
    }
  }

  console.log('\n================================================================');
  console.log(`✓ All 14 Narration Tracks Processed Successfully!`);
  console.log('================================================================\n');

  const manifestPath = path.join(NARRATOR_DIR, 'brian-chapter-narration-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(generated, null, 2));
  console.log(`Saved manifest to: ${manifestPath}`);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
