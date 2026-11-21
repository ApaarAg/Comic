const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_profile_pacing';
const SCREENSHOTS_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\screenshots';

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

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

class CdpConnection {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', () => resolve());
      this.ws.on('error', reject);
      this.ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  const port = 9333;
  console.log('Launching headless Chrome on port', port);
  const chromeProcess = spawn(CHROME_PATH, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1400,1000',
    'about:blank'
  ]);

  try {
    let version = null;
    for (let i = 0; i < 30; i++) {
      try {
        version = await fetchJson(`http://127.0.0.1:${port}/json/version`);
        if (version) break;
      } catch (e) {
        await delay(200);
      }
    }

    if (!version) throw new Error('Chrome failed to start');

    const targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
    const pageTarget = targets.find((t) => t.type === 'page');
    const cdp = new CdpConnection(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    console.log('Navigating to http://localhost:3000/narrator-auditions.html');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/narrator-auditions.html' });
    await delay(2500);

    // Evaluate page title and cards count
    const evalRes = await cdp.send('Runtime.evaluate', {
      expression: `({
        title: document.title,
        cardsCount: document.querySelectorAll('.pacing-card').length,
        audioElements: document.querySelectorAll('audio').length,
        hasAudioSources: Array.from(document.querySelectorAll('audio')).map(a => a.src)
      })`,
      returnByValue: true
    });
    console.log('Page Evaluation Result:', evalRes.result.value);

    // Take screenshot of top section
    const ss1 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const targetFile = path.join(SCREENSHOTS_DIR, 'sv31_07_brian_pacing_auditions.png');
    fs.writeFileSync(targetFile, Buffer.from(ss1.data, 'base64'));
    console.log('Screenshot saved to:', targetFile);

    cdp.close();
  } finally {
    chromeProcess.kill();
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
