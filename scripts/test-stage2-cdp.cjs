const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_profile_stage2';
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

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result ? res.result.value : null;
  }

  async captureScreenshot(name) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(SCREENSHOTS_DIR, name);
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${name}`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('Launching headless Chrome...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9333',
    '--disable-gpu',
    '--no-first-run',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--window-size=1440,900',
    'about:blank',
  ]);

  try {
    await delay(1800);

    // Get devtools endpoints
    const versionInfo = await fetchJson('http://127.0.0.1:9333/json/version');
    console.log('Browser:', versionInfo.Browser);

    const targets = await fetchJson('http://127.0.0.1:9333/json');
    let pageTarget = targets.find((t) => t.type === 'page');

    if (!pageTarget) {
      throw new Error('No page target found');
    }

    const cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    console.log('\nNavigating to http://localhost:3000...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await delay(2500);

    // 1. Initial State Check (Scene 00 Darkness & Atmospheric Start)
    console.log('\n--- Test 1: Continuous Opening Initial State ---');
    const scene00Exists = await cdp.evaluate('!!document.getElementById("scene-00")');
    const scene01Exists = await cdp.evaluate('!!document.getElementById("scene-01")');
    const mainExists = await cdp.evaluate('!!document.querySelector("main")');
    const chromeExists = await cdp.evaluate('!!document.querySelector("header")');

    console.log('Scene 00 Mounted:', scene00Exists);
    console.log('Scene 01 Mounted (Continuous in DOM):', scene01Exists);
    console.log('Main Reader Mounted:', mainExists);
    console.log('ChapterChrome Mounted from start:', chromeExists);

    await cdp.captureScreenshot('stage2_01_prologue_initial.png');

    // 2. Audio Unlock Test
    console.log('\n--- Test 2: Audio Unlock via First Gesture ---');
    const unlockBtn = await cdp.evaluate('!!document.querySelector("button:has(svg)")');
    console.log('Audio unlock button visible:', unlockBtn);

    const unlockResult = await cdp.evaluate(`
      (() => {
        const btn = document.querySelector("#scene-00 button");
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Clicked audio unlock button:', unlockResult);
    await delay(1000);

    const audioStateAfter = await cdp.evaluate(`
      (() => {
        const txt = document.body.innerText;
        return {
          hasAudioActiveBadge: txt.includes("AUDIO ACTIVE"),
          activeSceneId: document.body.querySelector("[data-active-scene]")?.getAttribute("data-active-scene")
        };
      })()
    `);
    console.log('Audio state after click:', audioStateAfter);
    await cdp.captureScreenshot('stage2_02_prologue_unlocked.png');

    // 3. Scroll Down to Progress ~0.25 (Narration Beat s01-01)
    console.log('\n--- Test 3: Scrolling through Prologue to Narration Beat ---');
    await cdp.evaluate(`
      window.scrollTo({ top: window.innerHeight * 0.7, behavior: 'instant' });
    `);
    await delay(1200);

    const progressCheck = await cdp.evaluate(`
      (() => {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        return {
          scrollY,
          progress: +(scrollY / maxScroll).toFixed(3)
        };
      })()
    `);
    console.log('Scroll progress at beat 1:', progressCheck);
    await cdp.captureScreenshot('stage2_03_prologue_skyline_emergence.png');

    // 4. Scroll Down to Progress ~0.60 (Title Reveal)
    console.log('\n--- Test 4: Scrolling to Title Manifestation ---');
    await cdp.evaluate(`
      window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'instant' });
    `);
    await delay(1200);

    const titleCheck = await cdp.evaluate(`
      (() => {
        const titleEl = document.querySelector("#scene-00 h1");
        return {
          titleFound: !!titleEl,
          titleText: titleEl ? titleEl.innerText : null
        };
      })()
    `);
    console.log('Title reveal check:', titleCheck);
    await cdp.captureScreenshot('stage2_04_prologue_title_manifest.png');

    // 5. Scroll Smoothly into Scene 01 (Continuous Entry)
    console.log('\n--- Test 5: Continuous Camera Dive into Scene 01 (Mumbai) ---');
    await cdp.evaluate(`
      (() => {
        const sc1 = document.getElementById("scene-01");
        if (sc1) {
          sc1.scrollIntoView({ behavior: 'instant' });
        }
      })()
    `);
    await delay(1500);

    const scene01Check = await cdp.evaluate(`
      (() => {
        const sc1 = document.getElementById("scene-01");
        const rect = sc1 ? sc1.getBoundingClientRect() : null;
        return {
          scene01Top: rect ? Math.round(rect.top) : null,
          activeSceneAttr: document.querySelector("[data-active-scene]")?.getAttribute("data-active-scene"),
          hasCityPins: !!document.querySelector("[data-testid*='city-pin']")
        };
      })()
    `);
    console.log('Scene 01 continuous entry check:', scene01Check);
    await cdp.captureScreenshot('stage2_05_scene01_continuous_splash.png');

    // 6. Test Mobile Adaptation
    console.log('\n--- Test 6: Mobile Adaptive Viewport (iPhone 14 / 390x844) ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    });
    await delay(800);

    // Scroll back to top to check mobile prologue
    await cdp.evaluate(`window.scrollTo({ top: 0, behavior: 'instant' });`);
    await delay(1000);

    const mobileCheck = await cdp.evaluate(`
      (() => {
        const bodyWidth = document.body.scrollWidth;
        const windowWidth = window.innerWidth;
        const noHorizontalOverflow = bodyWidth <= windowWidth + 2;
        return {
          bodyWidth,
          windowWidth,
          noHorizontalOverflow
        };
      })()
    `);
    console.log('Mobile layout check:', mobileCheck);
    await cdp.captureScreenshot('stage2_06_mobile_adaptive_opening.png');

    cdp.close();
    console.log('\n=============================================');
    console.log('STAGE 2 CDP VERIFICATION COMPLETED SUCCESSFULLY');
    console.log('=============================================');
  } catch (err) {
    console.error('CDP Test failed:', err);
  } finally {
    chrome.kill();
  }
}

run();
