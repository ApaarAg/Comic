const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const WebSocket = require(path.join(process.cwd(), 'node_modules', 'ws'));

const ROOT = path.resolve(__dirname, '..');
const PORT = 4194;
const CDP_PORT = PORT + 1;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'storyverse-polish-'));
const ARTIFACT_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\screenshots';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

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

async function waitFor(fn, label, timeoutMs = 20000, intervalMs = 100) {
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
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
    }
    return response.result?.value;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
    return outPath;
  }

  close() {
    this.socket.close();
  }
}

async function main() {
  console.log('Starting production server on port', PORT);
  const server = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT) },
    stdio: 'pipe',
  });

  let chrome = null;
  let cdp = null;

  try {
    await waitFor(async () => {
      try {
        const res = await fetch(BASE_URL);
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
        '--disable-background-timer-throttling',
        '--window-size=1440,900',
        'about:blank',
      ],
      { stdio: 'ignore' }
    );

    await waitFor(() => getJson(`http://127.0.0.1:${CDP_PORT}/json/version`).catch(() => null), 'CDP endpoint');
    const targets = await getJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const page = targets.find((t) => t.type === 'page');
    if (!page) throw new Error('No page target found in Chrome');

    cdp = await new CdpClient(page.webSocketDebuggerUrl).connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    console.log('Navigating to', BASE_URL);
    await cdp.send('Page.navigate', { url: BASE_URL });
    await delay(2500);

    // Enter & unlock
    await cdp.evaluate(`(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Enter') || b.title?.includes('Enter'));
      if (btn) btn.click();
    })()`);
    await delay(1500);

    const scrollToScene = async (sceneId, stageProgress) => {
      await cdp.evaluate(`(() => {
        if (window.__STORYVERSE_SCROLL_TO__) {
          window.__STORYVERSE_SCROLL_TO__('${sceneId}', ${stageProgress});
        }
      })()`);
      await delay(900);
    };

    // --- DESKTOP VIEWPORT: 1440 x 900 ---
    console.log('Capturing Desktop screenshots (1440x900)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await delay(400);

    // 1. Scene 02 Desktop
    await scrollToScene('scene-02', 0.85);
    await delay(1200);
    await cdp.captureScreenshot('polish_desktop_02_traffic.png');

    // 2. Scene 04 Desktop
    await scrollToScene('scene-04', 0.22);
    await delay(1200);
    await cdp.captureScreenshot('polish_desktop_04_death_speech.png');

    // 3. Transition IV Desktop
    await cdp.evaluate(`(() => {
      const trans = document.querySelector('[data-transition-id="trans-04-05"]') || document.querySelector('[data-transition-index="3"]');
      if (trans) trans.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`);
    await delay(1200);
    await cdp.captureScreenshot('polish_desktop_trans_04_05.png');

    // 4. Scene 07 Desktop
    await scrollToScene('scene-07', 0.20);
    await delay(1200);
    await cdp.captureScreenshot('polish_desktop_07_hospital.png');

    // --- MOBILE VIEWPORT: 390 x 844 ---
    console.log('Capturing Mobile screenshots (390x844)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await delay(600);

    // 5. Scene 02 Mobile
    await scrollToScene('scene-02', 0.85);
    await delay(1200);
    await cdp.captureScreenshot('polish_mobile_02_traffic.png');

    // 6. Scene 04 Mobile
    await scrollToScene('scene-04', 0.22);
    await delay(1200);
    await cdp.captureScreenshot('polish_mobile_04_death_speech.png');

    // 7. Scene 07 Mobile
    await scrollToScene('scene-07', 0.20);
    await delay(1200);
    await cdp.captureScreenshot('polish_mobile_07_hospital.png');

    // 8. Scene 08 Mobile
    await scrollToScene('scene-08', 0.20);
    await delay(1200);
    await cdp.captureScreenshot('polish_mobile_08_escape.png');

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Screenshot script failed:', err);
  } finally {
    if (cdp) cdp.close();
    if (chrome) {
      try { chrome.kill('SIGKILL'); } catch {}
    }
    server.kill('SIGKILL');
    try {
      fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
    } catch {}
  }
}

main();
