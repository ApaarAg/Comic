const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const WebSocket = require('ws');

const ROOT = path.resolve(__dirname, '..');
const PORT = 4192;
const CDP_PORT = PORT + 1;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'storyverse-prologue-vis-'));
const ARTIFACT_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\screenshots';

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
      });
    }).on('error', reject);
  });
}

async function waitFor(fn, label, timeoutMs = 25000, intervalMs = 100) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const val = await fn();
    if (val) return val;
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
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
    }
    return res.result?.value;
  }

  close() {
    try { this.socket.close(); } catch {}
  }
}

async function capture(cdp, filename) {
  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', quality: 90 });
  const filepath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(filepath, Buffer.from(screenshot.data, 'base64'));
  console.log(`Saved screenshot: ${filepath}`);
}

async function main() {
  console.log('Starting server on port', PORT);
  const server = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let chrome = null;
  let cdp = null;

  try {
    await waitFor(async () => {
      try {
        const res = await fetch(BASE_URL);
        return res.ok;
      } catch { return false; }
    }, 'server readiness');

    chrome = spawn(CHROME_PATH, [
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${PROFILE_DIR}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--autoplay-policy=no-user-gesture-required',
      '--window-size=1440,900',
      'about:blank',
    ], { stdio: 'ignore' });

    await waitFor(() => getJson(`http://127.0.0.1:${CDP_PORT}/json/version`).catch(() => null), 'CDP endpoint');
    const targets = await getJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pageTarget = targets.find((t) => t.type === 'page');
    cdp = await new CdpClient(pageTarget.webSocketDebuggerUrl).connect();

    await cdp.send('Page.enable');
    await cdp.send('Page.navigate', { url: BASE_URL });
    await delay(3500);

    const setSceneProgress = async (sceneId, progress) => {
      await cdp.evaluate(`(() => {
        const stage = document.querySelector('[data-scene-id="${sceneId}"]') || document.getElementById('${sceneId}');
        if (!stage) return false;
        const top = stage.getBoundingClientRect().top + window.scrollY;
        const scrollable = Math.max(1, stage.offsetHeight - window.innerHeight);
        const target = Math.round(top + scrollable * ${Number(progress)});
        if (window.__STORYVERSE_SCROLL_TO__) window.__STORYVERSE_SCROLL_TO__(target);
        else window.scrollTo({ top: target, behavior: 'instant' });
        return true;
      })()`);
      await delay(600);
    };

    const viewports = [
      { name: 'desktop_1440x900', width: 1440, height: 900, mobile: false, scale: 1 },
      { name: 'desktop_1920x1080', width: 1920, height: 1080, mobile: false, scale: 1 },
      { name: 'desktop_1280x720', width: 1280, height: 720, mobile: false, scale: 1 },
      { name: 'mobile_390x844', width: 390, height: 844, mobile: true, scale: 2 },
      { name: 'mobile_430x932', width: 430, height: 932, mobile: true, scale: 2 },
    ];

    for (const vp of viewports) {
      console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})`);
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.scale,
        mobile: vp.mobile,
      });
      await delay(300);

      // 1. Scroll Position 0 - Prologue Opening (No button, serene opening)
      await setSceneProgress('scene-00', 0.0);
      await capture(cdp, `prologue_${vp.name}_01_zero_scroll.png`);

      // 2. Scroll Position 0.18 - "THE STORY" introduction card
      await setSceneProgress('scene-00', 0.18);
      await capture(cdp, `prologue_${vp.name}_02_the_story_card.png`);

      // 3. Scroll Position 0.38 - "The Opening Canvas" card & Narration Beat
      await setSceneProgress('scene-00', 0.38);
      await capture(cdp, `prologue_${vp.name}_03_opening_canvas.png`);

      // 4. Scroll Position 0.62 - Title Reveal
      await setSceneProgress('scene-00', 0.62);
      await capture(cdp, `prologue_${vp.name}_04_title_reveal.png`);
    }

    console.log('\nAll prologue visual checkpoints captured successfully!');
  } finally {
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null) {
      chrome.kill();
    }
    if (server && !server.killed) {
      server.kill();
    }
    try {
      fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
