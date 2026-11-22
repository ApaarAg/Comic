const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const WebSocket = require(path.join(process.cwd(), 'node_modules', 'ws'));

const ROOT = path.resolve(__dirname, '..');
const PORT = 4196;
const CDP_PORT = PORT + 1;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'storyverse-audit-'));

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
    await delay(1200);

    const viewports = [
      { name: 'desktop_1440', width: 1440, height: 900, dsf: 1, mobile: false },
      { name: 'desktop_1920', width: 1920, height: 1080, dsf: 1, mobile: false },
      { name: 'mobile_390', width: 390, height: 844, dsf: 2, mobile: true },
      { name: 'mobile_430', width: 430, height: 932, dsf: 3, mobile: true },
    ];

    const allSceneBeats = [
      { sceneId: 'scene-01', beats: [0.1, 0.5, 0.85] },
      { sceneId: 'scene-02', beats: [0.15, 0.30, 0.50, 0.72, 0.88] },
      { sceneId: 'scene-03', beats: [0.20, 0.45, 0.75] },
      { sceneId: 'scene-04', beats: [0.08, 0.18, 0.35, 0.50, 0.68, 0.82, 0.94] },
      { sceneId: 'scene-05', beats: [0.15, 0.35, 0.55, 0.75, 0.90] },
      { sceneId: 'scene-06', beats: [0.15, 0.35, 0.55, 0.75, 0.90] },
      { sceneId: 'scene-07', beats: [0.10, 0.25, 0.40, 0.52, 0.66, 0.80, 0.92] },
      { sceneId: 'scene-08', beats: [0.20, 0.50, 0.80] },
      { sceneId: 'scene-09', beats: [0.20, 0.55, 0.85] },
      { sceneId: 'scene-10', beats: [0.15, 0.35, 0.55, 0.75, 0.90] },
    ];

    const auditResults = {};

    for (const vp of viewports) {
      console.log(`Auditing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.dsf,
        mobile: vp.mobile,
      });
      await delay(400);

      const vpData = [];

      for (const scene of allSceneBeats) {
        for (const beatProgress of scene.beats) {
          await cdp.evaluate(`(() => {
            if (window.__STORYVERSE_SCROLL_TO__) {
              window.__STORYVERSE_SCROLL_TO__('${scene.sceneId}', ${beatProgress});
            }
          })()`);
          await delay(250);

          const panelMetrics = await cdp.evaluate(`(() => {
            const imgs = [...document.querySelectorAll('img')].filter(img => img.src.includes('/assets/chapter1/'));
            return imgs.map(img => {
              const rect = img.getBoundingClientRect();
              const filename = img.src.split('/').pop().split('?')[0];
              const parent = img.closest('.comic-panel-frame') || img.parentElement;
              const parentRect = parent ? parent.getBoundingClientRect() : null;
              const container = img.closest('[class*="max-w-"]') || img.parentElement?.parentElement;
              return {
                filename,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                renderedWidth: Math.round(rect.width),
                renderedHeight: Math.round(rect.height),
                parentWidth: parentRect ? Math.round(parentRect.width) : null,
                parentHeight: parentRect ? Math.round(parentRect.height) : null,
                containerClass: container?.className ?? '',
                vwPercent: Math.round((rect.width / window.innerWidth) * 100),
                vhPercent: Math.round((rect.height / window.innerHeight) * 100),
                areaPercent: ((rect.width * rect.height) / (window.innerWidth * window.innerHeight) * 100).toFixed(1),
              };
            });
          })()`);

          if (panelMetrics && panelMetrics.length > 0) {
            for (const m of panelMetrics) {
              const existing = vpData.find(x => x.filename === m.filename && x.sceneId === scene.sceneId);
              if (!existing) {
                vpData.push({
                  sceneId: scene.sceneId,
                  beatProgress,
                  ...m,
                });
              }
            }
          }
        }
      }

      auditResults[vp.name] = vpData;
    }

    const outPath = path.join(ROOT, 'scratch', 'panel-audit-metrics.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(auditResults, null, 2));
    console.log(`Saved audit metrics to ${outPath} (${Object.keys(auditResults).length} viewports)`);

  } catch (err) {
    console.error('Audit script failed:', err);
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
