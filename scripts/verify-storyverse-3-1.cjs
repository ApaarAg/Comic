const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_profile_sv31';
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
    console.log(`  📸 Screenshot saved: ${filePath} (${Math.round(res.data.length / 1024)} KB)`);
    return filePath;
  }
}

async function runQa() {
  console.log('=== STORYVERSE 3.1 BROWSER ACCEPTANCE QA ===\n');

  const chromeProc = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9444',
      '--remote-debugging-address=127.0.0.1',
      `--user-data-dir=${USER_DATA_DIR}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-translate',
      '--autoplay-policy=no-user-gesture-required',
      'about:blank',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  let connected = false;
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await delay(500);
    try {
      const tabs = await fetchJson('http://127.0.0.1:9444/json');
      if (tabs && tabs.length > 0 && tabs[0].webSocketDebuggerUrl) {
        wsUrl = tabs[0].webSocketDebuggerUrl;
        connected = true;
        break;
      }
    } catch {
      // retry
    }
  }

  if (!connected) {
    console.error('Failed to connect to headless Chrome CDP');
    chromeProc.kill();
    return;
  }

  const cdp = new CdpClient(wsUrl);
  await cdp.connect();
  console.log('Connected to Chrome CDP session.');

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const consoleErrors = [];
  cdp.ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
        const text = data.params.args.map((a) => a.value || a.description).join(' ');
        const stack = data.params.stackTrace ? JSON.stringify(data.params.stackTrace.callFrames.slice(0, 5)) : '';
        consoleErrors.push(text + ' ' + stack);
      }
    } catch {}
  });

  // Test 1: Homepage Redesign Initial State (Scene 00)
  console.log('\n--- 1. Testing Homepage Redesign Initial State ---');
  await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
  await delay(2500);

  const initialTitle = await cdp.evaluate('document.title');
  console.log('Page Title:', initialTitle);
  await cdp.captureScreenshot('sv31_01_homepage_initial.png');

  // Test 2: Unlock Audio & Scroll to Title Reveal
  console.log('\n--- 2. Unlocking Audio & Scrolling to Title Reveal ---');
  // Click unlock button
  await cdp.evaluate(`
    const btn = document.querySelector('button');
    if (btn) btn.click();
  `);
  await delay(600);

  // Scroll to title reveal in Prologue (~0.5 stage progress)
  await cdp.evaluate('window.scrollTo(0, window.innerHeight * 1.2)');
  await delay(1200);
  await cdp.captureScreenshot('sv31_02_homepage_title.png');

  // Test 3: Opening Narration Trigger
  console.log('\n--- 3. Testing Opening Narration Beat Trigger ---');
  await cdp.evaluate('window.scrollTo(0, window.innerHeight * 2.2)');
  await delay(1500);

  const activeNarration = await cdp.evaluate(`
    (() => {
      const caption = document.querySelector('[data-testid="cinematic-caption"]');
      const text = caption ? caption.innerText : '';
      return { hasCaption: !!caption, text };
    })()
  `);
  console.log('Active Narration Beat:', activeNarration);
  await cdp.captureScreenshot('sv31_03_opening_narration.png');

  // Test 4: Scene 02 Character Dialogue & Speech Bubble
  console.log('\n--- 4. Testing Character Dialogue in Scene 02 ---');
  await cdp.evaluate(`
    const el = document.getElementById('scene-02');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  `);
  await delay(1000);
  await cdp.evaluate('window.scrollBy(0, window.innerHeight * 0.4)');
  await delay(1200);

  const speechBubble = await cdp.evaluate(`
    (() => {
      const bubble = document.querySelector('[data-speaker]') || document.querySelector('.group.relative');
      const bubbles = Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('Mrs. Shah'));
      return { found: bubbles.length > 0, count: bubbles.length };
    })()
  `);
  console.log('Scene 02 Speech Bubble State:', speechBubble);
  await cdp.captureScreenshot('sv31_04_scene02_dialogue.png');

  // Test 5: Transition V Screen (Descent between Scene 05 and 06)
  console.log('\n--- 5. Testing Transition V Screen (Real Artwork Layer) ---');
  await cdp.evaluate(`
    const trans = document.querySelector('[data-testid="cinematic-transition-storm-dissolve"]');
    if (trans) trans.scrollIntoView({ behavior: 'instant', block: 'center' });
  `);
  await delay(1500);

  const transitionArtwork = await cdp.evaluate(`
    (() => {
      const trans = document.querySelector('[data-testid="cinematic-transition-storm-dissolve"]');
      const img = trans ? trans.querySelector('img') : null;
      return {
        found: !!trans,
        hasArtworkImg: !!img,
        imgSrc: img ? img.src : null,
        caption: trans ? trans.innerText.trim() : ''
      };
    })()
  `);
  console.log('Transition V Artwork State:', transitionArtwork);
  await cdp.captureScreenshot('sv31_05_transition_descent.png');

  // Test 6: Indian Narrator Audition Console
  console.log('\n--- 6. Testing Indian Narrator Audition Console ---');
  await cdp.send('Page.navigate', { url: 'http://localhost:3000/narrator-auditions.html' });
  await delay(2000);

  const auditionPage = await cdp.evaluate(`
    (() => {
      const cards = document.querySelectorAll('.candidate-card');
      const title = document.querySelector('h1') ? document.querySelector('h1').innerText : '';
      return { cardCount: cards.length, title };
    })()
  `);
  console.log('Audition Console State:', auditionPage);
  await cdp.captureScreenshot('sv31_06_narrator_auditions.png');

  console.log('\n--- QA RESULTS SUMMARY ---');
  console.log('Console Errors Reported:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach((e) => console.log('  ⚠ Error:', e));
  } else {
    console.log('  ✓ Zero fatal console errors detected!');
  }

  chromeProc.kill();
  console.log('\nQA session completed successfully.');
}

runQa().catch(console.error);
