const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const WebSocket = require(path.join(process.cwd(), 'node_modules', 'ws'));

const ROOT = path.resolve(__dirname, '..');
const PORT = 4220;
const CDP_PORT = PORT + 1;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'storyverse-s01-integ-'));
const ARTIFACTS_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\screenshots';

fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function waitFor(fn, label, timeoutMs = 25000, intervalMs = 100) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = await fn();
    if (value) return value;
    await delay(intervalMs);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

class CdpClient {
  constructor(webSocketUrl) {
    this.socket = new WebSocket(webSocketUrl);
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.socket.once('open', resolve);
      this.socket.once('error', reject);
    });
    this.socket.on('message', (raw) => {
      const message = JSON.parse(raw.toString());
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
      }
    });
    return this;
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res?.result?.value;
  }

  async captureScreenshot(filename) {
    const result = await this.send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(result.data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  }

  close() {
    try { this.socket.close(); } catch {}
  }
}

async function main() {
  let server;
  let chrome;
  let cdp;

  const results = {
    scene01Stages: {},
    integrationResults: {},
    consoleErrors: [],
    failedRequests: [],
  };

  try {
    console.log('Starting production server on port', PORT);
    server = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
      cwd: ROOT,
      env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
      stdio: 'pipe',
    });

    await waitFor(async () => {
      try {
        const res = await fetch(`${BASE_URL}/`);
        return res.ok;
      } catch {
        return false;
      }
    }, 'production server', 25000);

    console.log('Launching headless Chrome on port', CDP_PORT);
    chrome = spawn(
      CHROME_PATH,
      [
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${PROFILE_DIR}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--autoplay-policy=no-user-gesture-required',
        '--window-size=1440,900',
        'about:blank',
      ],
      { stdio: 'ignore' }
    );

    await waitFor(() => getJson(`http://127.0.0.1:${CDP_PORT}/json/version`).catch(() => null), 'CDP endpoint');
    const targets = await getJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const page = targets.find((t) => t.type === 'page');
    if (!page) throw new Error('No page target found');

    cdp = await new CdpClient(page.webSocketDebuggerUrl).connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Network.enable');

    cdp.socket.on('message', (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        const text = msg.params.args?.map(a => a.value || a.description).join(' ') || 'unknown error';
        results.consoleErrors.push(text);
      }
      if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) {
        results.failedRequests.push({
          url: msg.params.response.url,
          status: msg.params.response.status,
        });
      }
    });

    console.log('Navigating to', BASE_URL);
    await cdp.send('Page.navigate', { url: BASE_URL });
    await delay(2500);

    // Enter & unlock
    await cdp.evaluate(`(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Enter') || b.title?.includes('Enter'));
      if (btn) btn.click();
    })()`);
    await delay(1500);

    // ────────────────────────────────────────────────────────────────────────
    // 1. SCENE 01 AUDIT ACROSS 3 VIEWPORTS & 5 STAGES
    // ────────────────────────────────────────────────────────────────────────
    const testViewports = [
      { name: 'desktop_1440', width: 1440, height: 900 },
      { name: 'desktop_1920', width: 1920, height: 1080 },
      { name: 'desktop_1280', width: 1280, height: 720 },
    ];

    const scene01Stages = [
      { stageId: 'stageA', name: 's01_stageA_reveal', progress: 0.08 },
      { stageId: 'stageB', name: 's01_stageB_sun', progress: 0.28 },
      { stageId: 'stageC', name: 's01_stageC_towers', progress: 0.52 },
      { stageId: 'stageD', name: 's01_stageD_highway', progress: 0.78 },
      { stageId: 'stageE', name: 's01_stageE_transition', progress: 0.95 },
    ];

    for (const vp of testViewports) {
      console.log(`\nAuditing Scene 01 on ${vp.name} (${vp.width}x${vp.height})...`);
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await delay(500);

      results.scene01Stages[vp.name] = {};

      for (const stg of scene01Stages) {
        await cdp.evaluate(`(() => {
          const sec = document.getElementById('scene-01');
          if (sec) {
            const track = sec.querySelector('[class*="min-h-[260vh]"]') || sec;
            const r = track.getBoundingClientRect();
            const absTop = r.top + window.scrollY;
            const scrollDistance = Math.max(1, track.offsetHeight - window.innerHeight);
            window.scrollTo(0, absTop + scrollDistance * ${stg.progress});
          }
        })()`);
        await delay(600);

        const stageMetrics = await cdp.evaluate(`(() => {
          const sec = document.getElementById('scene-01');
          if (!sec) return null;
          const img = sec.querySelector('img[src*="p06_panel01"]');
          if (!img) return null;
          const r = img.getBoundingClientRect();
          const hud = sec.querySelector('.bg-black\\\\/60');
          const narration = sec.querySelector('.font-display.italic');
          return {
            src: img.src.split('/').pop(),
            width: Math.round(r.width),
            height: Math.round(r.height),
            top: Math.round(r.top),
            left: Math.round(r.left),
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            hudText: hud ? hud.textContent?.trim() : null,
            narrationVisible: narration ? narration.offsetParent !== null : false,
          };
        })()`);

        results.scene01Stages[vp.name][stg.stageId] = stageMetrics;
        console.log(`[${vp.name}] ${stg.stageId}:`, JSON.stringify(stageMetrics));

        await cdp.captureScreenshot(`audit425_${vp.name}_${stg.name}.png`);
      }
    }

    // Reverse test in Scene 01
    console.log('\nTesting Scene 01 reverse scroll and pause...');
    await cdp.evaluate(`(() => {
      const sec = document.getElementById('scene-01');
      if (sec) {
        const track = sec.querySelector('[class*="min-h-[260vh]"]') || sec;
        const r = track.getBoundingClientRect();
        const absTop = r.top + window.scrollY;
        const scrollDistance = Math.max(1, track.offsetHeight - window.innerHeight);
        window.scrollTo(0, absTop + scrollDistance * 0.85);
      }
    })()`);
    await delay(400);
    await cdp.evaluate(`(() => {
      const sec = document.getElementById('scene-01');
      if (sec) {
        const track = sec.querySelector('[class*="min-h-[260vh]"]') || sec;
        const r = track.getBoundingClientRect();
        const absTop = r.top + window.scrollY;
        const scrollDistance = Math.max(1, track.offsetHeight - window.innerHeight);
        window.scrollTo(0, absTop + scrollDistance * 0.28);
      }
    })()`);
    await delay(400);

    const reverseS01 = await cdp.evaluate(`(() => {
      const sec = document.getElementById('scene-01');
      const hud = sec?.querySelector('.bg-black\\\\/60');
      return hud ? hud.textContent?.trim() : null;
    })()`);
    console.log('Scene 01 reversed cleanly to:', reverseS01);

    // ────────────────────────────────────────────────────────────────────────
    // 2. CROSS-SCENE INTEGRATION: Scene 01 -> Scene 02 -> Scene 03 -> Scene 04 -> Scene 05 -> Scene 06
    // ────────────────────────────────────────────────────────────────────────
    console.log('\nExecuting Cross-Scene Integration Flow (Scene 01 -> 06)...');

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await delay(400);

    const journeyScenes = [
      { id: 'scene-01', label: 'Scene 01 (Mumbai)', progress: 0.50 },
      { id: 'scene-02', label: 'Scene 02 (Traffic)', progress: 0.45 },
      { id: 'scene-03', label: 'Scene 03 (Party)', progress: 0.35 },
      { id: 'scene-04', label: 'Scene 04 (Deaths World)', progress: 0.50 },
      { id: 'scene-05', label: 'Scene 05 (Two Events)', progress: 0.65 },
      { id: 'scene-06', label: 'Scene 06 (Laila Mortal)', progress: 0.40 },
    ];

    for (const scene of journeyScenes) {
      console.log(`Scrolling to ${scene.label}...`);
      await cdp.evaluate(`(() => {
        const sec = document.getElementById('${scene.id}');
        if (sec) {
          const top = sec.offsetTop;
          const scrollDistance = Math.max(1, sec.offsetHeight - window.innerHeight);
          window.scrollTo(0, top + scrollDistance * ${scene.progress});
        }
      })()`);
      await delay(700);

      const sceneState = await cdp.evaluate(`(() => {
        const sec = document.getElementById('${scene.id}');
        if (!sec) return { active: false };
        const r = sec.getBoundingClientRect();
        const activeOwner = window.__STORYVERSE_ACTIVE_SCENE_ID__ || null;
        return {
          id: '${scene.id}',
          inViewport: r.top < window.innerHeight && r.bottom > 0,
          top: Math.round(r.top),
          height: Math.round(r.height),
          visibleImages: [...sec.querySelectorAll('img')].filter(img => {
            const ir = img.getBoundingClientRect();
            return ir.width > 0 && ir.height > 0 && ir.top < window.innerHeight && ir.bottom > 0;
          }).map(img => img.src.split('/').pop()),
        };
      })()`);

      results.integrationResults[scene.id] = sceneState;
      console.log(`${scene.label} state:`, JSON.stringify(sceneState));

      await cdp.captureScreenshot(`audit425_integration_${scene.id}.png`);
    }

    fs.writeFileSync('scratch/scene01_and_integration_results.json', JSON.stringify(results, null, 2));
    console.log('\nAudit complete! Results saved to scratch/scene01_and_integration_results.json');
  } catch (err) {
    console.error('Audit failed:', err);
  } finally {
    if (cdp) cdp.close();
    if (chrome) {
      try { chrome.kill('SIGKILL'); } catch {}
    }
    if (server) {
      try { server.kill('SIGKILL'); } catch {}
    }
    try {
      fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
    } catch {}
  }
}

main();
