const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_profile_canvas_test';
const SCREENSHOTS_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\screenshots';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

async function main() {
  const port = 9339;
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--headless=new',
    '--disable-gpu',
    '--autoplay-policy=no-user-gesture-required',
    '--window-size=1400,900',
    'about:blank'
  ]);

  try {
    let v;
    for (let i = 0; i < 30; i++) {
      try { v = await fetchJson(`http://127.0.0.1:${port}/json/version`); if (v) break; } catch (e) { await delay(200); }
    }
    if (!v) throw new Error('Chrome failed to start');

    const targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
    const page = targets.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = id++;
        const handler = data => {
          const msg = JSON.parse(data.toString());
          if (msg.id === curId) {
            ws.off('message', handler);
            if (msg.error) reject(new Error(msg.error.message));
            else resolve(msg.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    const audioRequests = [];
    ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      if (msg.method === 'Network.requestWillBeSent') {
        const url = msg.params.request.url;
        if (url.includes('/assets/audio/voices/narrator/')) {
          audioRequests.push({ url, time: Date.now() });
          console.log('[Network Audio Request]:', url);
        }
      }
    });

    console.log('1. Navigating to http://localhost:3000/...');
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await delay(2500);

    // Click Unlock Audio / Begin
    console.log('2. Clicking "Enable Full Cinematic Audio"...');
    const unlockRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('[data-testid="enable-audio-btn"]');
        if (btn) { btn.click(); return 'enable-audio-btn clicked'; }
        const fallback = document.querySelector('button');
        if (fallback) { fallback.click(); return 'fallback button clicked'; }
        return 'no button found';
      })()`,
      returnByValue: true
    });
    console.log('Unlock result:', unlockRes.result.value);
    await delay(1200);

    // Scroll slightly into the opening canvas range (e.g. stageProgress ~ 0.25)
    console.log('3. Scrolling to Opening Canvas range (stageProgress ~ 0.25)...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: totalHeight * 0.02, behavior: 'instant' });
      })()`
    });
    await delay(1500);

    // Check opening canvas state
    const canvasEval = await send('Runtime.evaluate', {
      expression: `(() => {
        const card = document.querySelector('h2');
        const hasCard = card && card.innerText.includes('Once Upon a Falling');
        const spokenSpans = document.querySelectorAll('span[style*="rgb(251, 244, 234)"], span[style*="rgb(247, 194, 125)"]');
        return {
          hasOpeningCanvasTitle: hasCard,
          cardTitle: card ? card.innerText : null,
          highlightedWordCount: spokenSpans.length,
          bodyHasPassage: document.body.innerText.includes('It began on a Wednesday afternoon')
        };
      })()`,
      returnByValue: true
    });
    console.log('Opening Canvas DOM Evaluation:', canvasEval.result.value);

    // Take screenshot of Opening Canvas active narration
    const ss1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'sv31_11_opening_canvas_narration_active.png'), Buffer.from(ss1.data, 'base64'));
    console.log('Saved sv31_11_opening_canvas_narration_active.png');

    // Scroll into Scene 01 and check that s01-01 / s01-02 do not re-request duplicate audio
    console.log('4. Scrolling through into Scene 01...');
    const reqCountBefore = audioRequests.length;
    await send('Runtime.evaluate', {
      expression: `(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: totalHeight * 0.08, behavior: 'instant' });
      })()`
    });
    await delay(2000);

    const s01Reqs = audioRequests.slice(reqCountBefore);
    console.log('New audio requests triggered in Scene 01:', s01Reqs.map(r => r.url));

    const ss2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'sv31_12_scene01_no_duplicate.png'), Buffer.from(ss2.data, 'base64'));
    console.log('Saved sv31_12_scene01_no_duplicate.png');

    console.log('\nAll captured audio requests:', audioRequests.map(r => r.url));

    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
