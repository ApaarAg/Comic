const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const WebSocket = require('ws');

const ROOT = path.resolve(__dirname, '..');
const PORT = 4180;
const CDP_PORT = PORT + 1;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'storyverse-diag-'));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function waitFor(fn, label, timeoutMs = 15000, intervalMs = 60) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const val = await fn();
    if (val) return val;
    await delay(intervalMs);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

class CdpClient {
  constructor(wsUrl) {
    this.socket = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }
  async connect() {
    await new Promise((resolve, reject) => {
      this.socket.once('open', resolve);
      this.socket.once('error', reject);
    });
    this.socket.on('message', (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id) {
        const p = this.pending.get(msg.id);
        if (!p) return;
        this.pending.delete(msg.id);
        if (msg.error) p.reject(new Error(msg.error.message));
        else p.resolve(msg.result);
        return;
      }
      const ls = this.listeners.get(msg.method) ?? [];
      ls.forEach((l) => l(msg.params));
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
  on(method, listener) {
    const ls = this.listeners.get(method) ?? [];
    ls.push(listener);
    this.listeners.set(method, ls);
  }
  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description ?? res.exceptionDetails.text);
    }
    return res.result?.value;
  }
  close() {
    this.socket.close();
  }
}

async function runDiagnostics() {
  console.log('--- Starting Storyverse 4.1 Audio Sync Diagnostics ---');
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
      } catch {
        return false;
      }
    }, 'server startup', 20000);

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
    const page = targets.find((t) => t.type === 'page');
    assert.ok(page, 'Page target found');
    cdp = await new CdpClient(page.webSocketDebuggerUrl).connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        window.__STORYVERSE_AUDIO_TRACE__ = true;
        window.__STORYVERSE_TRACE_LOG__ = [];
        window.addEventListener('storyverse:audio-lifecycle', (e) => {
          window.__STORYVERSE_TRACE_LOG__.push({
            timestamp: performance.now(),
            scrollY: window.scrollY,
            ...e.detail
          });
        });
      `,
    });

    await cdp.send('Page.navigate', { url: BASE_URL });
    await waitFor(() => cdp.evaluate(`Boolean(document.querySelector('[data-scene-id="scene-00"]'))`), 'app loaded');

    // Unlock audio
    await cdp.evaluate(`(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.title === 'Enter Experience & Enable Audio' || b.textContent.includes('Enter & Listen'));
      if (btn) btn.click();
    })()`);
    await delay(500);

    const getLog = async () => cdp.evaluate('window.__STORYVERSE_TRACE_LOG__ ?? []');
    const getDebug = async () => cdp.evaluate('window.__STORYVERSE_AUDIO_DEBUG__?.()');
    const scrollToY = async (y) => {
      await cdp.evaluate(`window.__STORYVERSE_SCROLL_TO__ ? window.__STORYVERSE_SCROLL_TO__(${y}) : window.scrollTo(0, ${y})`);
      await delay(80);
    };

    console.log('[Test 1] Opening Canvas Narration');
    const log1 = await getLog();
    const s00 = log1.find(e => e.lineId === 's00-01' && e.lifecycle === 'PLAYING');
    console.log('  s00-01 playing:', Boolean(s00), 'timing:', s00?.timingSource);

    // Get section tops
    const tops = await cdp.evaluate(`(() => {
      const scenes = ['scene-00', 'scene-01', 'scene-02', 'scene-03', 'scene-04', 'scene-05', 'scene-06', 'scene-07', 'scene-08', 'scene-09', 'scene-10'];
      return scenes.map(id => {
        const el = document.getElementById(id);
        return { id, top: el ? el.getBoundingClientRect().top + window.scrollY : 0, height: el ? el.offsetHeight : 0 };
      });
    })()`);
    console.log('Section Tops:', tops);

    const s01 = tops.find(t => t.id === 'scene-01');
    const s02 = tops.find(t => t.id === 'scene-02');

    console.log('\n[Test 2 & 3] Moving down Scene 01, stopping immediately before Scene 02');
    // Scroll to bottom of Scene 01 (right before transition / Scene 02)
    const beforeS02 = s02.top - 150;
    await scrollToY(beforeS02);
    await delay(300);
    const dbgBefore = await getDebug();
    console.log('  At Y =', beforeS02, '| ownerSceneId:', dbgBefore?.ownerSceneId, '| voice:', dbgBefore?.voice?.lineId, dbgBefore?.voice?.state);

    const logBefore = await getLog();
    const prematureS02 = logBefore.filter(e => e.sceneId === 'scene-02' && e.lifecycle === 'PLAYING');
    console.log('  Premature Scene 02 events while before Scene 02:', prematureS02.length);

    console.log('\n[Test 4] Scroll across Scene 02 boundary slowly');
    for (let y = beforeS02; y <= s02.top + 400; y += 40) {
      await scrollToY(y);
      await delay(40);
    }
    await delay(400);
    const dbgInS02 = await getDebug();
    console.log('  At Y =', s02.top + 400, '| ownerSceneId:', dbgInS02?.ownerSceneId, '| voice:', dbgInS02?.voice?.lineId, dbgInS02?.voice?.state);

    console.log('\n[Test 6] Enter a dialogue panel and immediately scroll past it (Scene 02 Beat 1 -> Beat 2)');
    // Beat 1 of scene 02 is Mrs. Shah (stageProgress ~ 0.08, panel ends at 0.22)
    // Beat 2 is panel 2 (0.22 .. 0.40)
    const s02Scrollable = s02.height - 900;
    const yBeat1 = Math.round(s02.top + s02Scrollable * 0.10);
    const yPastBeat1 = Math.round(s02.top + s02Scrollable * 0.28);

    await scrollToY(yBeat1);
    await delay(100);
    const dbgBeat1 = await getDebug();
    console.log('  Entered Beat 1 (p=0.10): voice:', dbgBeat1?.voice?.lineId, dbgBeat1?.voice?.state, dbgBeat1?.voice?.lifecycle);

    // Immediately scroll past it
    console.log('  Quickly scrolling past Beat 1 to p=0.28...');
    await scrollToY(yPastBeat1);
    await delay(300);
    const dbgPastBeat1 = await getDebug();
    console.log('  At p=0.28: voice:', dbgPastBeat1?.voice?.lineId, dbgPastBeat1?.voice?.state, dbgPastBeat1?.voice?.lifecycle);

    console.log('\n[Test 7] Backward scroll and deliberate revisit');
    // Scroll back to p=0.08
    await scrollToY(yBeat1);
    await delay(300);
    const dbgRevisit = await getDebug();
    console.log('  Scrolled back to p=0.10: voice:', dbgRevisit?.voice?.lineId, dbgRevisit?.voice?.state);

    console.log('\n--- Diagnostic Results Summary ---');
    const finalLog = await getLog();
    console.log('Total lifecycle events recorded:', finalLog.length);
    console.log('Events by scene:');
    const counts = {};
    finalLog.forEach(e => {
      const s = e.sceneId || 'none';
      counts[s] = (counts[s] || 0) + 1;
    });
    console.log(counts);

  } finally {
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null) chrome.kill();
    if (server && !server.killed) server.kill();
  }
}

runDiagnostics().catch(console.error);
