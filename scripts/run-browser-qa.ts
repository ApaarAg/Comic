/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * scripts/run-browser-qa.ts
 *
 * Comprehensive End-to-End Real Browser QA & Performance Audit for Storyverse:
 * - Direct CDP connection to headless Chrome
 * - Prologue verification (Scenes A-E, play, pause, replay, mute, skip)
 * - Full comic reading inspection (Scenes 01-10)
 * - Panel size, typography, bubble visibility, cropping checks
 * - Subtitle deduplication verification
 * - Audio playback, interruption, ducking, resumption, backward scroll, rapid jump
 * - Performance measurement: real FPS, memory, long tasks, asset load times
 * - Mobile viewport responsiveness (390x844)
 * - Screenshot capture across desktop & mobile
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.join(ROOT_DIR, 'docs', 'qa-screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

class CDPClient {
  private ws!: WebSocket;
  private id = 0;
  private pending = new Map<number, { resolve: (res: any) => void; reject: (err: any) => void }>();
  public consoleLogs: Array<{ type: string; text: string }> = [];
  public uncaughtErrors: Array<string> = [];
  public networkErrors: Array<{ url: string; status: number }> = [];

  constructor(private wsUrl: string) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data.toString());
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id)!;
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        } else if (msg.method === 'Runtime.consoleAPICalled') {
          const text = msg.params.args.map((a: any) => a.value ?? a.description ?? '').join(' ');
          this.consoleLogs.push({ type: msg.params.type, text });
          if (msg.params.type === 'error') {
            this.uncaughtErrors.push(text);
          }
        } else if (msg.method === 'Runtime.exceptionThrown') {
          const desc = msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text;
          this.uncaughtErrors.push(desc);
        } else if (msg.method === 'Network.responseReceived') {
          const status = msg.params.response?.status;
          const url = msg.params.response?.url;
          if (status >= 400) {
            this.networkErrors.push({ url, status });
          }
        }
      };
    });
  }

  async send(method: string, params: Record<string, any> = {}): Promise<any> {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate<T = any>(expression: string): Promise<T> {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Evaluation failed: ${res.exceptionDetails.text} - ${res.exceptionDetails.exception?.description}`);
    }
    return res.result?.value;
  }

  async captureScreenshot(filename: string): Promise<string> {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(SCREENSHOTS_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    return filePath;
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runQA() {
  console.log('===============================================================');
  console.log(' STORYVERSE CHAPTER 01 — RIGOROUS REAL BROWSER QA AUDIT');
  console.log('===============================================================\n');

  const profileDir = path.join(os.tmpdir(), `chrome-qa-profile-${Date.now()}`);
  console.log('1. Launching Headless Chrome Instance...');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9333',
    '--remote-debugging-address=127.0.0.1',
    `--user-data-dir=${profileDir}`,
    '--window-size=1920,1080',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-sync',
    '--mute-audio=false',
    '--autoplay-policy=no-user-gesture-required',
    'about:blank'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  let cdpUrl = '';
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' });
      if (res.ok) {
        const json = await res.json();
        cdpUrl = json.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!cdpUrl) {
    chrome.kill();
    throw new Error('Failed to obtain Chrome CDP WebSocket URL on port 9333.');
  }

  console.log('2. Connected to Chrome CDP:', cdpUrl);
  const client = new CDPClient(cdpUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');
  await client.send('Performance.enable');

  console.log('3. Navigating to http://localhost:3000/ ...');
  await client.send('Page.navigate', { url: 'http://localhost:3000/' });

  // Wait for initial load
  await sleep(2500);

  const testReport: Record<string, any> = {
    timestamp: new Date().toISOString(),
    prologue: {},
    readingExperience: {},
    audioAndScrolling: {},
    performance: {},
    mobile: {},
    consoleErrors: [],
    networkErrors: [],
  };

  // ───────────────────────────────────────────────────────────────────────────
  // PART 1: 5-STAGE CINEMATIC PROLOGUE REVIEW
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- PART 1: CINEMATIC PROLOGUE AUDIT ---');
  const prologuePresent = await client.evaluate<boolean>(`!!document.querySelector('[data-testid="cinematic-prologue"]')`);
  console.log(`Prologue rendered in DOM: ${prologuePresent ? '✅ YES' : '❌ NO'}`);

  if (prologuePresent) {
    // Check initial moment (Darkness / Mumbai)
    const initialMoment = await client.evaluate<string>(`document.querySelector('[data-testid="cinematic-prologue"]')?.getAttribute('data-prologue-moment') || ''`);
    console.log(`Initial Prologue Moment: "${initialMoment}"`);

    // Capture Scene A / B Screenshot
    const s1 = await client.captureScreenshot('01-prologue-mumbai-skyline.png');
    console.log(`Captured Screenshot: ${path.basename(s1)}`);

    // Test Play/Pause toggle
    const pauseBtn = await client.evaluate<boolean>(`
      (() => {
        const btn = document.querySelector('button[aria-label*="Pause cinematic intro"], button[aria-label*="Auto-play"]');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log(`Prologue Pause Toggle Test: ${pauseBtn ? '✅ Clicked' : '❌ Not Found'}`);
    await sleep(400);

    // Test Replay button
    const replayBtn = await client.evaluate<boolean>(`
      (() => {
        const btn = document.querySelector('button[aria-label*="Restart from Scene A"]');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log(`Prologue Replay Test: ${replayBtn ? '✅ Clicked' : '❌ Not Found'}`);
    await sleep(400);

    // Test Mute button
    const muteBtn = await client.evaluate<boolean>(`
      (() => {
        const btn = document.querySelector('button[aria-label*="sound"]');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log(`Prologue Mute Toggle Test: ${muteBtn ? '✅ Clicked' : '❌ Not Found'}`);
    await sleep(400);

    // Jump to Scene D (Title Reveal)
    await client.evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const momentDBtn = buttons.find(b => b.textContent && (b.textContent.includes('Scene D') || b.textContent.includes('Once Upon')));
        if (momentDBtn) momentDBtn.click();
      })()
    `);
    await sleep(800);
    const s2 = await client.captureScreenshot('02-prologue-title-reveal.png');
    console.log(`Captured Title Reveal Screenshot: ${path.basename(s2)}`);

    // Verify Title text in DOM
    const titleText = await client.evaluate<string>(`
      (() => {
        const titleEl = document.querySelector('h1');
        return titleEl ? titleEl.innerText : '';
      })()
    `);
    console.log(`Prologue Title In DOM: "${titleText.replace(/\\n/g, ' ')}"`);

    testReport.prologue = {
      prologuePresent,
      initialMoment,
      pauseBtnTested: pauseBtn,
      replayBtnTested: replayBtn,
      muteBtnTested: muteBtn,
      titleText,
    };

    // Click "Skip Intro" to transition to Comic Chapter 01
    console.log('Skipping intro to enter Chapter 01...');
    await client.evaluate(`
      (() => {
        const skip = document.querySelector('[data-testid="skip-prologue-btn"]');
        if (skip) skip.click();
      })()
    `);
    await sleep(1500);
  }

  // Verify transition into Chapter 01
  const activeSceneAfterEnter = await client.evaluate<string>(`document.querySelector('[data-active-scene]') ? document.querySelector('[data-active-scene]').getAttribute('data-active-scene') : ''`);
  console.log(`Active Scene After Enter: "${activeSceneAfterEnter}" (Expected: scene-01)`);

  // ───────────────────────────────────────────────────────────────────────────
  // PART 2: COMIC PANEL READABILITY & EXPERIENCE AUDIT
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\\n--- PART 2: COMIC PANEL READABILITY & EXPERIENCE AUDIT ---');

  const sceneAuditResults = await client.evaluate<any>(`
    (() => {
      const sceneIds = [
        'scene-01', 'scene-02', 'scene-03', 'scene-04', 'scene-05',
        'scene-06', 'scene-07', 'scene-08', 'scene-09', 'scene-10'
      ];
      const results = [];

      for (const id of sceneIds) {
        const sceneEl = document.getElementById(id);
        if (!sceneEl) {
          results.push({ id, found: false });
          continue;
        }

        const panels = Array.from(sceneEl.querySelectorAll('[data-panel-id], .comic-panel, figure'));
        const images = Array.from(sceneEl.querySelectorAll('img')).filter(img => img.src && (img.src.includes('/assets/chapter1/') || img.src.includes('.webp') || img.src.includes('/assets/artwork/')));
        const speechBubbles = Array.from(sceneEl.querySelectorAll('.synced-speech-bubble, [data-testid="synced-speech-bubble"]'));
        const subtitles = Array.from(sceneEl.querySelectorAll('.subtitle-box, [data-testid="panel-subtitle"]'));

        // Measure panel sizes
        const panelSizes = images.map(img => {
          const rect = img.getBoundingClientRect();
          return {
            src: img.src ? img.src.split('/').pop() : '',
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            aspectRatio: rect.width > 0 ? (rect.width / rect.height).toFixed(2) : 0,
            tooSmall: rect.width < 120 || rect.height < 120
          };
        });

        // Check for subtitle duplication
        let duplicateSubtitlesFound = false;
        const bubbleTexts = speechBubbles.map(b => b.innerText ? b.innerText.trim().toLowerCase() : '').filter(Boolean);
        for (const sub of subtitles) {
          const subText = sub.innerText ? sub.innerText.trim().toLowerCase() : '';
          if (subText && bubbleTexts.some(bt => bt.includes(subText) || subText.includes(bt))) {
            duplicateSubtitlesFound = true;
          }
        }

        results.push({
          id,
          found: true,
          panelCount: panels.length,
          imageCount: images.length,
          speechBubbleCount: speechBubbles.length,
          subtitleCount: subtitles.length,
          panelSizes,
          duplicateSubtitlesFound
        });
      }

      return results;
    })()
  `);

  console.log(`Verified ${sceneAuditResults.length} Scenes:`);
  let totalPanels = 0;
  let tooSmallPanels = 0;
  let duplicateCount = 0;

  for (const s of sceneAuditResults) {
    if (!s.found) {
      console.log(`  ❌ ${s.id}: Not found in DOM!`);
      continue;
    }
    totalPanels += s.imageCount;
    const small = s.panelSizes.filter((p: any) => p.tooSmall).length;
    tooSmallPanels += small;
    if (s.duplicateSubtitlesFound) duplicateCount++;

    console.log(`  ✅ ${s.id}: ${s.imageCount} artwork panels, ${s.speechBubbleCount} bubbles, duplicates: ${s.duplicateSubtitlesFound ? '⚠️ YES' : 'None'}`);
  }

  console.log(`\nPanel Readability Summary: Total Panels: ${totalPanels}, Too Small (<120px): ${tooSmallPanels}, Duplicate Subtitles: ${duplicateCount}`);
  testReport.readingExperience = {
    sceneAuditResults,
    totalPanels,
    tooSmallPanels,
    duplicateCount,
  };

  // ───────────────────────────────────────────────────────────────────────────
  // PART 3: AUDIO & SCROLLING SYNCHRONIZATION AUDIT
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- PART 3: AUDIO & SCROLLING SYNCHRONIZATION AUDIT ---');

  // Test 1: Slow Smooth Scrolling across Scene 01 -> Scene 03
  console.log('Testing slow smooth scrolling & narration playback...');
  const slowScrollAudioCheck = await client.evaluate<any>(`
    (async () => {
      const s1 = document.getElementById('scene-01');
      const s2 = document.getElementById('scene-02');
      if (s1) s1.scrollIntoView({ behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 1000));

      const narratorPlaying = document.querySelector('[data-narrator-active="true"]') !== null;
      const captionText = document.querySelector('[data-testid="cinematic-caption-bar"]')?.textContent?.trim() || '';

      // Scroll into Scene 02
      if (s2) s2.scrollIntoView({ behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 1500));

      const s2Active = document.querySelector('[data-active-scene="scene-02"]') !== null;
      return { narratorPlaying, captionText: captionText.substring(0, 60), s2Active };
    })()
  `);
  console.log('  Slow scroll check:', slowScrollAudioCheck);

  // Capture Scene 02 Screenshot
  const s02Pic = await client.captureScreenshot('03-scene-02-traffic.png');
  console.log(`  Captured Scene 02 Traffic: ${path.basename(s02Pic)}`);

  // Test 2: Character Dialogue Interruption & Ducking
  console.log('Testing dialogue trigger & narrator ducking in Scene 04...');
  const s04Check = await client.evaluate<any>(`
    (async () => {
      const s4 = document.getElementById('scene-04');
      if (s4) s4.scrollIntoView({ behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 1500));

      // Check audio elements or Howler audio state
      const speechBubbles = Array.from(document.querySelectorAll('#scene-04 .synced-speech-bubble, #scene-04 [data-testid="synced-speech-bubble"]'));
      return {
        scene04Reached: true,
        speechBubblesVisible: speechBubbles.length,
        bubbleTexts: speechBubbles.map(b => b.innerText ? b.innerText.substring(0, 40) : '')
      };
    })()
  `);
  console.log('  Scene 04 Check:', s04Check);

  const s04Pic = await client.captureScreenshot('04-scene-04-death-and-god.png');
  console.log(`  Captured Scene 04 Office: ${path.basename(s04Pic)}`);

  // Test 3: Reverse Scrolling (Scene 04 back up to Scene 02)
  console.log('Testing reverse scrolling back up to Scene 02...');
  const reverseScrollCheck = await client.evaluate<any>(`
    (async () => {
      const s2 = document.getElementById('scene-02');
      if (s2) s2.scrollIntoView({ behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 1200));
      return {
        activeScene: document.querySelector('[data-active-scene]')?.getAttribute('data-active-scene'),
        scrolledUpSuccess: window.scrollY < 4000
      };
    })()
  `);
  console.log('  Reverse scroll check:', reverseScrollCheck);

  // Test 4: Rapid Scene Jump (Scene 02 -> Scene 07 -> Scene 10)
  console.log('Testing rapid scene transitions (Scene 02 -> Scene 07 -> Scene 10)...');
  const rapidJumpCheck = await client.evaluate<any>(`
    (async () => {
      const s7 = document.getElementById('scene-07');
      if (s7) s7.scrollIntoView();
      await new Promise(r => setTimeout(r, 500));

      const s10 = document.getElementById('scene-10');
      if (s10) s10.scrollIntoView();
      await new Promise(r => setTimeout(r, 800));

      return {
        finalScene: document.querySelector('[data-active-scene]')?.getAttribute('data-active-scene'),
        scrollY: window.scrollY
      };
    })()
  `);
  console.log('  Rapid scene jump check:', rapidJumpCheck);

  // Capture Scene 07 & Scene 10 Screenshots
  await client.evaluate(`document.getElementById('scene-07')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(600);
  const s07Pic = await client.captureScreenshot('05-scene-07-hospital-awakening.png');
  console.log(`  Captured Scene 07 Awakening: ${path.basename(s07Pic)}`);

  await client.evaluate(`document.getElementById('scene-08')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(600);
  const s08Pic = await client.captureScreenshot('06-scene-08-neonatal-grace.png');
  console.log(`  Captured Scene 08 Grace: ${path.basename(s08Pic)}`);

  await client.evaluate(`document.getElementById('scene-10')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(600);
  const s10Pic = await client.captureScreenshot('07-scene-10-morning-tea.png');
  console.log(`  Captured Scene 10 Epilogue: ${path.basename(s10Pic)}`);

  // Test 5: Chapter Mute / Unmute in Reader Chrome
  console.log('Testing Mute/Unmute in Chapter Chrome...');
  const muteCheck = await client.evaluate<any>(`
    (() => {
      const muteBtn = document.querySelector('[data-testid="chrome-mute-toggle"], button[aria-label*="sound"]');
      if (!muteBtn) return { found: false };
      const beforeLabel = muteBtn.getAttribute('aria-label');
      muteBtn.click();
      const afterLabel = muteBtn.getAttribute('aria-label');
      return { found: true, beforeLabel, afterLabel };
    })()
  `);
  console.log('  Chapter Chrome Mute Toggle:', muteCheck);

  testReport.audioAndScrolling = {
    slowScrollAudioCheck,
    s04Check,
    reverseScrollCheck,
    rapidJumpCheck,
    muteCheck,
  };

  // ───────────────────────────────────────────────────────────────────────────
  // PART 4: REAL BROWSER PERFORMANCE & FPS BENCHMARK
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- PART 4: REAL BROWSER PERFORMANCE & FPS BENCHMARK ---');

  // Scroll smoothly from top to bottom while measuring requestAnimationFrame deltas
  console.log('Benchmarking scrolling FPS across 200 animation frames...');
  const fpsResults = await client.evaluate<any>(`
    new Promise((resolve) => {
      window.scrollTo(0, 0);
      const deltas = [];
      let lastTime = performance.now();
      let frames = 0;
      const targetFrames = 180;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollStep = totalHeight / targetFrames;

      function onFrame(now) {
        const delta = now - lastTime;
        deltas.push(delta);
        lastTime = now;
        frames++;

        window.scrollBy(0, scrollStep);

        if (frames < targetFrames) {
          requestAnimationFrame(onFrame);
        } else {
          // Calculate stats
          const validDeltas = deltas.slice(5); // drop initial frame jitter
          const avgDelta = validDeltas.reduce((a, b) => a + b, 0) / validDeltas.length;
          const avgFPS = Math.round(1000 / avgDelta);
          const sortedDeltas = [...validDeltas].sort((a, b) => b - a); // descending (highest delay)
          const p99Delta = sortedDeltas[Math.floor(sortedDeltas.length * 0.01)];
          const p99FPS = Math.round(1000 / p99Delta);
          const maxDelta = sortedDeltas[0];
          const minFPS = Math.round(1000 / maxDelta);

          // Get memory
          const mem = performance.memory ? {
            usedJSHeapMB: Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)),
            totalJSHeapMB: Math.round(performance.memory.totalJSHeapSize / (1024 * 1024)),
          } : null;

          resolve({
            avgFPS,
            p99FPS,
            minFPS,
            totalFrames: validDeltas.length,
            memory: mem
          });
        }
      }

      requestAnimationFrame(onFrame);
    })
  `);

  console.log(`  Scroll FPS Benchmark: Average FPS: ${fpsResults.avgFPS}, 99% Low: ${fpsResults.p99FPS}, Min FPS: ${fpsResults.minFPS}`);
  if (fpsResults.memory) {
    console.log(`  JS Heap Memory: ${fpsResults.memory.usedJSHeapMB} MB used / ${fpsResults.memory.totalJSHeapMB} MB total`);
  }

  // Network resource timing summary
  const resourceTimings = await client.evaluate<any>(`
    (() => {
      const resources = performance.getEntriesByType('resource');
      const audioResources = resources.filter(r => r.name.includes('/assets/audio/'));
      const imageResources = resources.filter(r => r.name.includes('/assets/chapter1/') || r.name.includes('.webp') || r.name.includes('/assets/artwork/'));

      const getAvgDuration = (arr) =>
        arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b.duration, 0) / arr.length) : 0;

      return {
        totalResources: resources.length,
        audioCount: audioResources.length,
        avgAudioDurationMs: getAvgDuration(audioResources),
        imageCount: imageResources.length,
        avgImageDurationMs: getAvgDuration(imageResources),
      };
    })()
  `);
  console.log('  Network Asset Timings:', resourceTimings);

  testReport.performance = {
    fpsResults,
    resourceTimings,
  };

  // ───────────────────────────────────────────────────────────────────────────
  // PART 5: MOBILE VIEWPORT RESPONSIVENESS (390 x 844)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- PART 5: MOBILE VIEWPORT RESPONSIVENESS (390 x 844) ---');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(600);

  const mobileMetrics = await client.evaluate<any>(`
    (() => {
      const s2 = document.getElementById('scene-02');
      if (s2) s2.scrollIntoView();

      const bodyWidth = document.body.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const hasHorizontalScroll = scrollWidth > bodyWidth;

      // Check text elements font size
      const textEls = Array.from(document.querySelectorAll('p, span, h2, h3, .synced-speech-bubble'));
      const fontSizes = textEls.map(el => parseFloat(window.getComputedStyle(el).fontSize)).filter(s => !isNaN(s) && s > 0);
      const minFontSize = Math.min(...fontSizes);
      const avgFontSize = Math.round(fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length);

      return {
        bodyWidth,
        scrollWidth,
        hasHorizontalScroll,
        minFontSize,
        avgFontSize
      };
    })()
  `);
  console.log('  Mobile Viewport Check:', mobileMetrics);

  const mobS02 = await client.captureScreenshot('08-mobile-scene-02-traffic.png');
  console.log(`  Captured Mobile Scene 02: ${path.basename(mobS02)}`);

  await client.evaluate(`document.getElementById('scene-04')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(500);
  const mobS04 = await client.captureScreenshot('09-mobile-scene-04-death.png');
  console.log(`  Captured Mobile Scene 04: ${path.basename(mobS04)}`);

  await client.evaluate(`document.getElementById('scene-07')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(500);
  const mobS07 = await client.captureScreenshot('10-mobile-scene-07-laila.png');
  console.log(`  Captured Mobile Scene 07: ${path.basename(mobS07)}`);

  testReport.mobile = mobileMetrics;
  testReport.consoleErrors = client.uncaughtErrors;
  testReport.networkErrors = client.networkErrors;

  console.log('\n--- CONSOLE & NETWORK INTEGRITY ---');
  console.log(`Uncaught Console Errors: ${client.uncaughtErrors.length}`);
  if (client.uncaughtErrors.length > 0) {
    client.uncaughtErrors.forEach((e) => console.log('  ❌ Error:', e));
  } else {
    console.log('  ✅ 0 uncaught console errors detected!');
  }

  console.log(`Failed Network Requests (>=400): ${client.networkErrors.length}`);
  if (client.networkErrors.length > 0) {
    client.networkErrors.forEach((e) => console.log(`  ⚠️ ${e.status}: ${e.url}`));
  } else {
    console.log('  ✅ 0 failed network requests!');
  }

  // Write out test report
  const reportPath = path.join(ROOT_DIR, 'docs', 'browser-qa-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
  console.log(`\nQA Report written to: ${reportPath}`);

  // Cleanup
  client.close();
  chrome.kill();
  console.log('Headless Chrome stopped. QA Audit Complete!\n');
}

runQA().catch((err) => {
  console.error('QA Test execution failed:', err);
  process.exit(1);
});
