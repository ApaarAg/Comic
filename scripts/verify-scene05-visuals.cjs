const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const WebSocket = require(path.join(process.cwd(), 'node_modules', 'ws'));

const ROOT = path.resolve(__dirname, '..');
const PORT = 4210;
const CDP_PORT = PORT + 1;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'storyverse-s05-'));
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
    viewports: {},
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

    const testViewports = [
      { name: 'desktop_1440', width: 1440, height: 900 },
      { name: 'desktop_1920', width: 1920, height: 1080 },
      { name: 'desktop_1280', width: 1280, height: 720 },
    ];

    const beats = [
      { beatId: 'beatA', name: 's05_beatA_fall', progress: 0.16 },
      { beatId: 'beatB', name: 's05_beatB_birth', progress: 0.46 },
      { beatId: 'beatC', name: 's05_beatC_shockwave', progress: 0.68 },
      { beatId: 'beatD', name: 's05_beatD_breath', progress: 0.88 },
    ];

    for (const vp of testViewports) {
      console.log(`Testing viewport ${vp.name} (${vp.width}x${vp.height})...`);
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await delay(500);

      results.viewports[vp.name] = {};

      for (const beat of beats) {
        // Scroll to Scene 05 at target beat progress using ScrollTrigger pinned track math
        await cdp.evaluate(`(() => {
          const sec = document.getElementById('scene-05');
          if (sec) {
            const top = sec.offsetTop;
            const scrollDistance = Math.max(1, sec.offsetHeight - window.innerHeight);
            window.scrollTo(0, top + scrollDistance * ${beat.progress});
          }
        })()`);
        await delay(600);

        // Measure rendered panel dimensions in DOM
        const metrics = await cdp.evaluate(`(() => {
          const sec = document.getElementById('scene-05');
          if (!sec) return null;
          const images = [...sec.querySelectorAll('img')].filter(img => img.src && !img.src.includes('backdrop') && !img.src.includes('video'));
          return images.map(img => {
            const r = img.getBoundingClientRect();
            return {
              src: img.src.split('/').pop(),
              width: Math.round(r.width),
              height: Math.round(r.height),
              top: Math.round(r.top),
              left: Math.round(r.left),
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
            };
          });
        })()`);

        results.viewports[vp.name][beat.beatId] = metrics;
        console.log(`[${vp.name}] ${beat.beatId} images:`, JSON.stringify(metrics));

        await cdp.captureScreenshot(`audit425_${vp.name}_${beat.name}.png`);
      }
    }

    console.log('Testing reverse scrolling and pause in Scene 05...');
    // Reverse test: scroll to 0.85 then back to 0.45 then back to 0.15
    await cdp.evaluate(`(() => {
      const sec = document.getElementById('scene-05');
      if (sec) {
        const top = sec.offsetTop;
        const scrollDistance = Math.max(1, sec.offsetHeight - window.innerHeight);
        window.scrollTo(0, top + scrollDistance * 0.85);
      }
    })()`);
    await delay(400);
    await cdp.evaluate(`(() => {
      const sec = document.getElementById('scene-05');
      if (sec) {
        const top = sec.offsetTop;
        const scrollDistance = Math.max(1, sec.offsetHeight - window.innerHeight);
        window.scrollTo(0, top + scrollDistance * 0.45);
      }
    })()`);
    await delay(400);
    const reverseMetrics = await cdp.evaluate(`(() => {
      const sec = document.getElementById('scene-05');
      if (!sec) return null;
      const images = [...sec.querySelectorAll('img')].filter(img => img.src && !img.src.includes('backdrop'));
      return images.map(img => ({
        src: img.src.split('/').pop(),
        width: Math.round(img.getBoundingClientRect().width),
        height: Math.round(img.getBoundingClientRect().height),
      }));
    })()`);
    console.log('Reverse scroll landed cleanly on Beat B:', JSON.stringify(reverseMetrics));

    fs.writeFileSync('scratch/scene05_audit_results.json', JSON.stringify(results, null, 2));
    console.log('Scene 05 audit results written to scratch/scene05_audit_results.json');
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
