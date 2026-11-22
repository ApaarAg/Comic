const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const WebSocket = require(path.join(process.cwd(), 'node_modules', 'ws'));

const ROOT = path.resolve(__dirname, '..');
const PORT = 4202;
const CDP_PORT = PORT + 1;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'storyverse-screens-'));
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
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
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

    console.log('Navigating to', BASE_URL);
    await cdp.send('Page.navigate', { url: BASE_URL });
    await delay(2500);

    // Enter & unlock
    await cdp.evaluate(`(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Enter') || b.title?.includes('Enter'));
      if (btn) btn.click();
    })()`);
    await delay(1500);

    const shots = [
      { name: 'sv423_desktop_s02_mrs_shah', sceneId: 'scene-02', stageProgress: 0.10 },
      { name: 'sv423_desktop_s02_taxi_lanes', sceneId: 'scene-02', stageProgress: 0.44 },
      { name: 'sv423_desktop_s02_driver_speech', sceneId: 'scene-02', stageProgress: 0.54 },
      { name: 'sv423_desktop_s03_dhiraj_speech', sceneId: 'scene-03', stageProgress: 0.20 },
      { name: 'sv423_desktop_s04_hold_door', sceneId: 'scene-04', stageProgress: 0.15 },
      { name: 'sv423_desktop_s04_hobbies_panoramic', sceneId: 'scene-04', stageProgress: 0.48 },
      { name: 'sv423_desktop_s06_agni_bargain', sceneId: 'scene-06', stageProgress: 0.25 },
      { name: 'sv423_desktop_s07_hospital_lights', sceneId: 'scene-07', stageProgress: 0.08 },
      { name: 'sv423_desktop_s07_wristband_laila', sceneId: 'scene-07', stageProgress: 0.78 },
      { name: 'sv423_desktop_s08_darius_name', sceneId: 'scene-08', stageProgress: 0.30 },
      { name: 'sv423_desktop_s10_morning_tea', sceneId: 'scene-10', stageProgress: 0.30 },
      { name: 'sv423_desktop_s10_pranah_teapot', sceneId: 'scene-10', stageProgress: 0.44 },
      { name: 'sv423_desktop_s10_balcony_ocean', sceneId: 'scene-10', stageProgress: 0.80 },
    ];

    // Capture Desktop
    console.log('Capturing Desktop screenshots (1440x900)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await delay(500);

    for (const shot of shots) {
      await cdp.evaluate(`(() => {
        const sec = document.getElementById('${shot.sceneId}');
        if (sec) {
          const top = sec.offsetTop;
          const h = sec.offsetHeight;
          window.scrollTo(0, top + h * ${shot.stageProgress});
        }
      })()`);
      await delay(600);
      await cdp.captureScreenshot(`${shot.name}.png`);
    }

    // Capture Mobile (390x844)
    console.log('Capturing Mobile screenshots (390x844)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await delay(800);

    const mobileShots = [
      { name: 'sv423_mobile_s02_mrs_shah', sceneId: 'scene-02', stageProgress: 0.10 },
      { name: 'sv423_mobile_s02_driver_speech', sceneId: 'scene-02', stageProgress: 0.54 },
      { name: 'sv423_mobile_s03_dhiraj_speech', sceneId: 'scene-03', stageProgress: 0.20 },
      { name: 'sv423_mobile_s04_hobbies_panoramic', sceneId: 'scene-04', stageProgress: 0.48 },
      { name: 'sv423_mobile_s06_agni_bargain', sceneId: 'scene-06', stageProgress: 0.25 },
      { name: 'sv423_mobile_s07_wristband_laila', sceneId: 'scene-07', stageProgress: 0.78 },
      { name: 'sv423_mobile_s08_darius_name', sceneId: 'scene-08', stageProgress: 0.30 },
      { name: 'sv423_mobile_s10_pranah_teapot', sceneId: 'scene-10', stageProgress: 0.44 },
      { name: 'sv423_mobile_s10_balcony_ocean', sceneId: 'scene-10', stageProgress: 0.80 },
    ];

    for (const shot of mobileShots) {
      await cdp.evaluate(`(() => {
        const sec = document.getElementById('${shot.sceneId}');
        if (sec) {
          const top = sec.offsetTop;
          const h = sec.offsetHeight;
          window.scrollTo(0, top + h * ${shot.stageProgress});
        }
      })()`);
      await delay(600);
      await cdp.captureScreenshot(`${shot.name}.png`);
    }

    console.log('All verification screenshots captured successfully!');
  } catch (err) {
    console.error('Screenshot script failed:', err);
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
