const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const WebSocket = require('ws');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.STORYVERSE_TEST_PORT || 4178);
const CDP_PORT = PORT + 1;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'storyverse-audio-'));
const TRACE_PATH = path.join(ROOT, 'docs', 'audio-scroll-lifecycle-trace.json');

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

async function waitFor(fn, label, timeoutMs = 10000, intervalMs = 75) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = await fn();
    if (value) return value;
    await delay(intervalMs);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function waitForServer() {
  await waitFor(async () => {
    try {
      const response = await fetch(BASE_URL);
      if (!response.ok) return false;
      const voiceManifest = await fetch(`${BASE_URL}/api/voice-assets`);
      return voiceManifest.ok;
    } catch {
      return false;
    }
  }, 'production server and voice asset manifest', 30000);
}

class CdpClient {
  constructor(webSocketUrl) {
    this.socket = new WebSocket(webSocketUrl);
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
      const message = JSON.parse(raw.toString());
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      const listeners = this.listeners.get(message.method) ?? [];
      listeners.forEach((listener) => listener(message.params));
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
    const listeners = this.listeners.get(method) ?? [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
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
  const results = {
    startedAt: new Date().toISOString(),
    productionPreview: BASE_URL,
    viewportRuns: [],
    assertions: [],
    events: [],
    consoleErrors: [],
    failedAudioRequests: [],
  };

  const server = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let serverOutput = '';
  server.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
  server.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });

  let chrome = null;
  let cdp = null;
  try {
    if (!fs.existsSync(CHROME_PATH)) throw new Error(`Chrome executable not found: ${CHROME_PATH}`);
    await waitForServer();

    chrome = spawn(CHROME_PATH, [
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
    ], { stdio: 'ignore' });

    const version = await waitFor(() => getJson(`http://127.0.0.1:${CDP_PORT}/json/version`).catch(() => null), 'Chrome DevTools endpoint');
    const targets = await getJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const page = targets.find((target) => target.type === 'page');
    assert.ok(page, 'Chrome should expose a page target');
    cdp = await new CdpClient(page.webSocketDebuggerUrl).connect();

    cdp.on('Runtime.consoleAPICalled', (event) => {
      if (event.type !== 'error') return;
      const message = event.args.map((arg) => arg.value ?? arg.description ?? '').join(' ');
      results.consoleErrors.push(message);
    });
    cdp.on('Runtime.exceptionThrown', (event) => {
      results.consoleErrors.push(event.exceptionDetails?.exception?.description ?? event.exceptionDetails?.text ?? 'Runtime exception');
    });
    cdp.on('Network.responseReceived', (event) => {
      if (event.response.status < 400) return;
      if (/\/assets\/audio\/voices\/|\/api\/voice-assets/.test(event.response.url)) {
        results.failedAudioRequests.push({ url: event.response.url, status: event.response.status });
      }
    });

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        window.__STORYVERSE_AUDIO_TRACE__ = true;
        window.__STORYVERSE_AUDIO_LOG__ = [];
        window.addEventListener('storyverse:audio-lifecycle', (event) => {
          const detail = event.detail;
          const root = document.querySelector('[data-active-scene]');
          const stage = [...document.querySelectorAll('[data-scene-id]')]
            .find((item) => item.dataset.sceneId === detail.sceneId);
          window.__STORYVERSE_AUDIO_LOG__.push({
            ...detail,
            activeSceneId: root?.dataset.activeScene ?? null,
            activePanelId: stage?.dataset.activePanelId ?? null,
            activeSpeechId: stage?.dataset.activeSpeechId ?? null,
            stageProgress: stage ? Number(stage.dataset.stageProgress) : null,
          });
        });
      `,
    });
    await cdp.send('Page.navigate', { url: BASE_URL });
    await waitFor(() => cdp.evaluate(`Boolean(document.querySelector('[data-scene-id="scene-00"]'))`), 'Storyverse scene stages');
    await waitFor(() => cdp.evaluate(`window.__STORYVERSE_AUDIO_DEBUG__?.().ownerSceneId === 'scene-00'`), 'initial scene audio ownership');

    const log = async () => cdp.evaluate('window.__STORYVERSE_AUDIO_LOG__ ?? []');
    const currentVoice = async () => cdp.evaluate('window.__STORYVERSE_AUDIO_DEBUG__?.() ?? null');
    const waitEvent = async (predicate, label, timeoutMs = 10000) => waitFor(async () => {
      const events = await log();
      return events.find(predicate) ?? false;
    }, label, timeoutMs);
    const getMarkers = async (sceneId) => cdp.evaluate(`(() => {
      const stage = document.querySelector('[data-scene-id="${sceneId}"]');
      return stage ? JSON.parse(stage.dataset.audioMarkers || '[]') : [];
    })()`);
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
      try {
        await waitFor(async () => {
          const state = await cdp.evaluate(`(() => {
            const stage = document.querySelector('[data-scene-id="${sceneId}"]') || document.getElementById('${sceneId}');
            return { stageProgress: stage?.dataset.stageProgress, owner: window.__STORYVERSE_AUDIO_DEBUG__?.().ownerSceneId };
          })()`);
          if (state.stageProgress !== undefined) return Math.abs(Number(state.stageProgress) - progress) < 0.035;
          return state.owner === sceneId;
        }, `${sceneId} progress ${progress}`, 5000, 40);
      } catch (error) {
        const state = await cdp.evaluate(`(() => {
          const stage = document.querySelector('[data-scene-id="${sceneId}"]') || document.getElementById('${sceneId}');
          return { scrollY, stageTop: stage?.getBoundingClientRect().top, height: stage?.offsetHeight,
            progress: stage?.dataset.stageProgress, helper: typeof window.__STORYVERSE_SCROLL_TO__,
            owner: window.__STORYVERSE_AUDIO_DEBUG__?.().ownerSceneId };
        })()`);
        throw new Error(`${error.message}; state=${JSON.stringify(state)}`);
      }
    };
    const startVoiceAt = async (sceneId, marker) => {
      const before = Math.max(0, marker.stageProgress - 0.015);
      await setSceneProgress(sceneId, before);
      await delay(120);
      await setSceneProgress(sceneId, Math.min(0.995, marker.stageProgress + 0.008));
      return waitEvent(
        (event) => event.type === 'lifecycle' && event.lifecycle === 'PLAYING' && event.lineId === marker.id,
        `${marker.id} real audio start`,
        12000,
      );
    };

    // Confirm prominent audio unlock button has been removed and no premature playback occurs at scroll zero
    const hasProminentButton = await cdp.evaluate(`(() => {
      const buttons = [...document.querySelectorAll('button')];
      return buttons.some(b => b.textContent.includes('Enable Full Cinematic Audio') || b.textContent.includes('Enter & Listen'));
    })()`);
    assert.equal(hasProminentButton, false, 'Prominent audio unlock button must be completely removed');

    await delay(400);
    const prematureAtZero = (await log()).filter((event) => event.lifecycle === 'PLAYING');
    assert.equal(prematureAtZero.length, 0, 'No narration must play at initial load without scrolling');

    // Confirm Scene 00 contains no spoken dialogue markers (dialogue belongs afterward in Scene 01)
    const s00Markers = await getMarkers('scene-00');
    assert.equal(s00Markers.length, 0, 'Scene 00 must not contain spoken dialogue markers; dialogue belongs afterward in Scene 01');
    const s00Speech = (await log()).filter((event) => event.lifecycle === 'PLAYING' && event.ownerSceneId === 'scene-00');
    assert.equal(s00Speech.length, 0, 'No dialogue must play in Scene 00');
    results.assertions.push('Scene 00 contains no duplicate prologue dialogue and remains purely visual');

    const scene02Narration = (await getMarkers('scene-02')).find((marker) => marker.id === 's02-conn-01');
    assert.ok(scene02Narration, 'Scene 02 connector narration marker should exist');
    await setSceneProgress('scene-01', 0.72);
    await delay(300);
    const prematureScene02 = (await log()).filter((event) =>
      event.lineId === 's02-conn-01' && event.lifecycle === 'PLAYING' && event.ownerSceneId === 'scene-01');
    assert.equal(prematureScene02.length, 0, 'Scene 02 narration must not play while Scene 01 is active');

    const scene02Start = await startVoiceAt('scene-02', scene02Narration);
    assert.equal(scene02Start.ownerSceneId, 'scene-02');
    assert.equal(scene02Start.activeSceneId, 'scene-02');
    assert.equal(scene02Start.activeSpeechId, 's02-conn-01');
    results.assertions.push('Scene 02 narration started only under Scene 02 ownership');

    const scene02Dialogue = (await getMarkers('scene-02')).find((marker) => marker.mode === 'dialogue');
    assert.ok(scene02Dialogue, 'Scene 02 should contain dialogue for the real playback test');
    const dialogueStart = await startVoiceAt('scene-02', scene02Dialogue);
    assert.equal(dialogueStart.activeSpeechId, scene02Dialogue.id, 'Speech bubble and actor voice should share the same line id');
    assert.equal(dialogueStart.activePanelId, scene02Dialogue.panelId, 'Dialogue should start on its corresponding panel');
    await waitFor(async () => cdp.evaluate(`document.querySelector('[data-testid="speech-bubble-${scene02Dialogue.id}"]')?.dataset.playbackActive === 'true'`),
      `${scene02Dialogue.id} synchronized speech bubble`, 5000);
    results.assertions.push('Scene 02 dialogue voice and synchronized speech bubble matched the active panel');

    const scene04Markers = await getMarkers('scene-04');
    assert.ok(scene04Markers.filter((marker) => marker.mode === 'dialogue').length > 3);
    const skippedIds = scene04Markers
      .filter((marker) => marker.stageProgress < 0.92 - 0.05)
      .map((marker) => marker.id);
    const oldLogLength = (await log()).length;
    await setSceneProgress('scene-04', 0.02);
    await delay(80);
    await setSceneProgress('scene-04', 0.92);
    await delay(800);
    const afterFastScroll = (await log()).slice(oldLogLength);
    assert.equal(afterFastScroll.some((event) => event.lifecycle === 'PLAYING' && skippedIds.includes(event.lineId)), false,
      'Fast scrolling across panels must not start a backlog of older dialogue');
    results.assertions.push('Fast scroll skipped passed dialogue markers without building a playback queue');

    const throttleMarker = (await getMarkers('scene-07')).find((marker) => marker.mode === 'dialogue');
    assert.ok(throttleMarker, 'A Scene 07 dialogue marker should be available for the loading-boundary race');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 500,
      downloadThroughput: 8 * 1024,
      uploadThroughput: 8 * 1024,
      connectionType: 'cellular3g',
    });
    await setSceneProgress('scene-07', throttleMarker.stageProgress - 0.015);
    await delay(100);
    await setSceneProgress('scene-07', throttleMarker.stageProgress + 0.005);
    const loadingEvent = await waitEvent(
      (event) => event.lifecycle === 'LOADING' && event.lineId === throttleMarker.id,
      `${throttleMarker.id} delayed audio load`,
      5000,
    );
    const loadBoundaryLogIndex = (await log()).length;
    await setSceneProgress('scene-08', 0.05);
    await waitEvent(
      (event) => event.lifecycle === 'CANCELLED' && event.eventId === loadingEvent.eventId &&
        ['scene_changed', 'scrolled_away'].includes(event.reason),
      `${throttleMarker.id} cancellation at the scene boundary`,
      5000,
    );
    await delay(1600);
    const boundaryEvents = (await log()).slice(loadBoundaryLogIndex);
    assert.equal(boundaryEvents.some((event) => event.lifecycle === 'PLAYING' && event.eventId === loadingEvent.eventId), false,
      'A delayed voice load must not begin after its scene becomes inactive');
    results.assertions.push('Scene boundary invalidated an in-flight voice load before playback');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
      connectionType: 'none',
    });

    const replayMarker = (await getMarkers('scene-06')).find((marker) => marker.id === 's06-01');
    assert.ok(replayMarker);
    const firstReplayStart = await startVoiceAt('scene-06', replayMarker);
    assert.equal(firstReplayStart.timingSource, 'audio-seek');
    await waitEvent(
      (event) => event.lifecycle === 'COMPLETED' && event.lineId === replayMarker.id,
      `${replayMarker.id} recording completion`,
      8000,
    );
    const completedCount = (await log()).filter((event) => event.lifecycle === 'PLAYING' && event.lineId === replayMarker.id).length;
    await setSceneProgress('scene-06', replayMarker.stageProgress - 0.02);
    await setSceneProgress('scene-06', replayMarker.stageProgress + 0.008);
    await delay(250);
    assert.equal((await log()).filter((event) => event.lifecycle === 'PLAYING' && event.lineId === replayMarker.id).length, completedCount,
      'Small reverse movement must not restart completed dialogue');
    await setSceneProgress('scene-06', replayMarker.stageProgress - 0.08);
    await setSceneProgress('scene-06', replayMarker.stageProgress + 0.008);
    await waitFor(async () => (await log()).filter((event) => event.lifecycle === 'PLAYING' && event.lineId === replayMarker.id).length === completedCount + 1,
      `${replayMarker.id} intentional replay`, 10000);
    results.assertions.push('Completed dialogue stayed latched on a small reverse movement and replayed after deliberate revisiting');

    const allScenes = Array.from({ length: 11 }, (_, index) => `scene-${String(index).padStart(2, '0')}`);
    for (const sceneId of allScenes) {
      await setSceneProgress(sceneId, 0.52);
      results.viewportRuns.push({ viewport: 'desktop', sceneId, progress: 0.52 });
    }
    results.assertions.push('Desktop browser scrolled through the prologue and all 10 scenes');

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await delay(500);
    for (const sceneId of allScenes) {
      await setSceneProgress(sceneId, 0.48);
      results.viewportRuns.push({ viewport: 'mobile', sceneId, progress: 0.48 });
    }
    const mobileStage = await cdp.evaluate(`(() => {
      const stage = document.querySelector('[data-scene-id="scene-10"]');
      return { width: window.innerWidth, height: window.innerHeight, stageWidth: stage?.getBoundingClientRect().width ?? 0 };
    })()`);
    assert.equal(mobileStage.width, 390);
    assert.equal(mobileStage.height, 844);
    assert.equal(Math.round(mobileStage.stageWidth), 390);
    results.assertions.push('Mobile browser scrolled through the prologue and all 10 scenes at 390×844');

    const finalLog = await log();
    results.events = finalLog;
    results.failedAudioRequests = results.failedAudioRequests;
    assert.equal(results.failedAudioRequests.length, 0, 'Production voice audio requests should not fail');
    const sceneMismatch = finalLog.filter(
      (event) => event.type === 'lifecycle' && event.lifecycle === 'PLAYING' && event.ownerSceneId && event.ownerSceneId !== event.sceneId,
    );
    assert.equal(sceneMismatch.length, 0, 'No voice event may play under another scene owner');
    assert.equal(results.consoleErrors.length, 0, `Browser should report no console errors: ${results.consoleErrors.join('\n')}`);
    results.finishedAt = new Date().toISOString();
    fs.writeFileSync(TRACE_PATH, JSON.stringify(results, null, 2));
    console.log(JSON.stringify({
      ok: true,
      assertions: results.assertions,
      viewportRuns: results.viewportRuns.length,
      lifecycleEvents: results.events.length,
      consoleErrors: results.consoleErrors,
      failedAudioRequests: results.failedAudioRequests,
      tracePath: TRACE_PATH,
      chromeVersion: version.Browser,
    }, null, 2));
  } catch (error) {
    results.finishedAt = new Date().toISOString();
    results.failure = error instanceof Error ? error.stack ?? error.message : String(error);
    results.serverOutput = serverOutput;
    if (cdp) {
      try { results.events = await cdp.evaluate('window.__STORYVERSE_AUDIO_LOG__ ?? []'); } catch {}
    }
    fs.writeFileSync(TRACE_PATH, JSON.stringify(results, null, 2));
    console.error(JSON.stringify({ ok: false, failure: results.failure, tracePath: TRACE_PATH }, null, 2));
    process.exitCode = 1;
  } finally {
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null) {
      chrome.kill();
      await Promise.race([
        new Promise((resolve) => chrome.once('exit', resolve)),
        delay(3000),
      ]);
    }
    if (server && !server.killed) server.kill();
    await delay(300);
    fs.rmSync(PROFILE_DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
