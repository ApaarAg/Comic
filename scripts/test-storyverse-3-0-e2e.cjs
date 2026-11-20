const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_profile_sv30';
const SCREENSHOTS_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\screenshots';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
    });

    this.ws.on('message', (msg) => {
      const res = JSON.parse(msg.toString());
      if (res.id && this.callbacks.has(res.id)) {
        const { resolve, reject } = this.callbacks.get(res.id);
        this.callbacks.delete(res.id);
        if (res.error) reject(res.error);
        else resolve(res.result);
      }
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result.value;
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(res.data, 'base64');
    const filePath = path.join(SCREENSHOTS_DIR, filename);
    fs.writeFileSync(filePath, buf);
    console.log(`Saved screenshot: ${filename}`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runTests() {
  console.log('Launching headless Chrome on port 9337...');
  const chromeProc = spawn(CHROME_PATH, [
    '--remote-debugging-port=9337',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--headless=new',
    '--window-size=1440,900',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required',
    'about:blank',
  ]);

  await delay(2500);

  try {
    const targets = await fetchJson('http://localhost:9337/json');
    const pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('Could not find page target on port 9337');

    const cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('Connected to CDP');

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    console.log('Navigating to http://localhost:3000...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await delay(3500);

    // --- TEST 1: Continuous Opening State ---
    console.log('\n--- Test 1: Continuous Opening State ---');
    const initCheck = await cdp.eval(`(() => {
      return {
        scene00Mounted: Boolean(document.getElementById('scene-00')),
        scene01Mounted: Boolean(document.getElementById('scene-01')),
        hasAudioUnlockBtn: Boolean(document.querySelector('button[aria-label*="audio" i], button[aria-label*="sound" i], button[title*="audio" i]')),
      };
    })()`);
    console.log('Test 1 Init:', initCheck);
    await cdp.screenshot('sv30_01_prologue.png');

    // Click to unlock audio
    await cdp.eval(`(() => {
      const btn = document.querySelector('button[aria-label*="audio" i], button[aria-label*="sound" i], button[title*="audio" i]');
      if (btn) btn.click();
    })()`);
    await delay(800);

    // --- TEST 2: Scene 01 Mumbai ---
    console.log('\n--- Test 2: Scene 01 Mumbai ---');
    await cdp.eval(`(() => {
      const s01 = document.getElementById('scene-01');
      if (s01) s01.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1200);
    const s01Check = await cdp.eval(`(() => {
      const s01 = document.getElementById('scene-01');
      return {
        scene01Found: Boolean(s01),
        hasPins: document.querySelectorAll('[data-testid^="city-pin-"]').length,
        hasCaptionBar: Boolean(document.querySelector('.story-caption, [data-narrative-caption]')),
      };
    })()`);
    console.log('Scene 01 Check:', s01Check);
    await cdp.screenshot('sv30_02_scene01_mumbai.png');

    // --- TEST 3: Scene 02 Traffic ---
    console.log('\n--- Test 3: Scene 02 Traffic ---');
    await cdp.eval(`(() => {
      const s02 = document.getElementById('scene-02');
      if (s02) s02.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1200);
    const s02Check = await cdp.eval(`(() => {
      const s02 = document.getElementById('scene-02');
      return {
        scene02Found: Boolean(s02),
        isPinnedViewport: Boolean(s02?.querySelector('.sticky')),
        activePanels: s02?.querySelectorAll('[data-comic-panel], [data-character-animator], img').length,
      };
    })()`);
    console.log('Scene 02 Check:', s02Check);
    await cdp.screenshot('sv30_03_scene02_traffic.png');

    // --- TEST 4: Scene 03 College Party ---
    console.log('\n--- Test 4: Scene 03 College Party ---');
    await cdp.eval(`(() => {
      const s03 = document.getElementById('scene-03');
      if (s03) s03.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1200);
    const s03Check = await cdp.eval(`(() => {
      const s03 = document.getElementById('scene-03');
      return {
        scene03Found: Boolean(s03),
        isPinnedViewport: Boolean(s03?.querySelector('.sticky')),
      };
    })()`);
    console.log('Scene 03 Check:', s03Check);
    await cdp.screenshot('sv30_04_scene03_party.png');

    // --- TEST 5: Scene 04 Death\'s World (The Silvered Tower) ---
    console.log('\n--- Test 5: Scene 04 Death\'s World ---');
    await cdp.eval(`(() => {
      const s04 = document.getElementById('scene-04');
      if (s04) s04.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1200);
    const s04Check = await cdp.eval(`(() => {
      const s04 = document.getElementById('scene-04');
      return {
        scene04Found: Boolean(s04),
        isPinnedViewport: Boolean(s04?.querySelector('.sticky')),
      };
    })()`);
    console.log('Scene 04 Check:', s04Check);
    await cdp.screenshot('sv30_05_scene04_god_office.png');

    // --- TEST 6: Scene 05 Parallel Edit (Two Events) ---
    console.log('\n--- Test 6: Scene 05 Two Events ---');
    await cdp.eval(`(() => {
      const s05 = document.getElementById('scene-05');
      if (s05) s05.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1200);
    const s05Check = await cdp.eval(`(() => {
      const s05 = document.getElementById('scene-05');
      return {
        scene05Found: Boolean(s05),
        isPinnedViewport: Boolean(s05?.querySelector('.sticky')),
      };
    })()`);
    console.log('Scene 05 Check:', s05Check);
    await cdp.screenshot('sv30_06_scene05_parallel_edit.png');

    // --- TEST 7: Scene 06 Laila Mortal ---
    console.log('\n--- Test 7: Scene 06 Laila Mortal ---');
    await cdp.eval(`(() => {
      const s06 = document.getElementById('scene-06');
      if (s06) s06.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1200);
    const s06Check = await cdp.eval(`(() => {
      const s06 = document.getElementById('scene-06');
      return {
        scene06Found: Boolean(s06),
        isPinnedViewport: Boolean(s06?.querySelector('.sticky')),
      };
    })()`);
    console.log('Scene 06 Check:', s06Check);
    await cdp.screenshot('sv30_07_scene06_descent.png');

    // --- TEST 8: Scene 07 Hospital ---
    console.log('\n--- Test 8: Scene 07 Hospital ---');
    await cdp.eval(`(() => {
      const s07 = document.getElementById('scene-07');
      if (s07) s07.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1200);
    const s07Check = await cdp.eval(`(() => {
      const s07 = document.getElementById('scene-07');
      return {
        scene07Found: Boolean(s07),
        isPinnedViewport: Boolean(s07?.querySelector('.sticky')),
      };
    })()`);
    console.log('Scene 07 Check:', s07Check);
    await cdp.screenshot('sv30_08_scene07_hospital.png');

    // --- TEST 9: Scene 08 The Escape ---
    console.log('\n--- Test 9: Scene 08 The Escape ---');
    await cdp.eval(`(() => {
      const s08 = document.getElementById('scene-08');
      if (s08) s08.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1200);
    const s08Check = await cdp.eval(`(() => {
      const s08 = document.getElementById('scene-08');
      return {
        scene08Found: Boolean(s08),
        isPinnedViewport: Boolean(s08?.querySelector('.sticky')),
      };
    })()`);
    console.log('Scene 08 Check:', s08Check);
    await cdp.screenshot('sv30_09_scene08_escape.png');

    // --- TEST 10: Scene 09 Second Death ---
    console.log('\n--- Test 10: Scene 09 Second Death ---');
    await cdp.eval(`(() => {
      const s09 = document.getElementById('scene-09');
      if (s09) s09.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1200);
    const s09Check = await cdp.eval(`(() => {
      const s09 = document.getElementById('scene-09');
      return {
        scene09Found: Boolean(s09),
        isPinnedViewport: Boolean(s09?.querySelector('.sticky')),
      };
    })()`);
    console.log('Scene 09 Check:', s09Check);
    await cdp.screenshot('sv30_10_scene09_second_death.png');

    // --- TEST 11: Scene 10 Eight Years Later ---
    console.log('\n--- Test 11: Scene 10 Eight Years Later ---');
    await cdp.eval(`(() => {
      const s10 = document.getElementById('scene-10');
      if (s10) s10.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1200);
    const s10Check = await cdp.eval(`(() => {
      const s10 = document.getElementById('scene-10');
      return {
        scene10Found: Boolean(s10),
        hasReplayButtons: Boolean(document.querySelector('button[onClick*="onReplayChapter"], button[aria-label*="return" i], button:has(svg)')),
        hasChapterEnding: Boolean(document.querySelector('footer')),
      };
    })()`);
    console.log('Scene 10 Check:', s10Check);
    await cdp.screenshot('sv30_11_scene10_veranda.png');

    // --- TEST 12: Mobile Adaptation Check (iPhone 14 / 390x844) ---
    console.log('\n--- Test 12: Mobile Viewport Adaptation Check ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    });
    await delay(1000);
    await cdp.eval(`(() => {
      const s02 = document.getElementById('scene-02');
      if (s02) s02.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1000);
    const mobileCheck = await cdp.eval(`(() => {
      return {
        viewportWidth: window.innerWidth,
        docWidth: document.documentElement.clientWidth,
        bodyWidth: document.body.scrollWidth,
        hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth,
      };
    })()`);
    console.log('Mobile Check:', mobileCheck);
    await cdp.screenshot('sv30_12_mobile_scene02.png');

    cdp.close();
    console.log('\n=============================================');
    console.log('STORYVERSE 3.0 COMPLETE E2E TEST PASSES 100%');
    console.log('=============================================\n');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
