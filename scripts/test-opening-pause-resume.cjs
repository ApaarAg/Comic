const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_profile_pause_test';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

async function run() {
  const port = 9355;
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--headless=new',
    '--disable-gpu',
    '--autoplay-policy=no-user-gesture-required',
    'about:blank'
  ]);

  try {
    let v;
    for (let i = 0; i < 30; i++) {
      try { v = await fetchJson(`http://127.0.0.1:${port}/json/version`); if (v) break; } catch (e) { await delay(200); }
    }
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
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await delay(2000);

    // Unlock
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('[data-testid="enable-audio-btn"]') || document.querySelector('button');
        if (btn) btn.click();
      })()`
    });

    await delay(1000);

    // Check if playing
    const state1 = await send('Runtime.evaluate', {
      expression: `(() => {
        const canvasCard = document.querySelector('h2');
        return {
          h2: canvasCard ? canvasCard.innerText : null,
          hasPauseBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Pause')),
          hasReplayBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Replay'))
        };
      })()`,
      returnByValue: true
    });
    console.log('Playback state after unlock:', state1.result?.value);

    // Click Pause
    console.log('Testing Pause click...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const pauseBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Pause'));
        if (pauseBtn) pauseBtn.click();
      })()`
    });
    await delay(400);

    const state2 = await send('Runtime.evaluate', {
      expression: `(() => {
        return {
          hasResumeBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Resume'))
        };
      })()`,
      returnByValue: true
    });
    console.log('State after pause:', state2.result?.value);

    // Click Resume
    console.log('Testing Resume click...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const resumeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Resume'));
        if (resumeBtn) resumeBtn.click();
      })()`
    });
    await delay(400);

    const state3 = await send('Runtime.evaluate', {
      expression: `(() => {
        return {
          hasPauseBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Pause'))
        };
      })()`,
      returnByValue: true
    });
    console.log('State after resume:', state3.result?.value);

  } finally {
    chrome.kill();
  }
}
run().catch(console.error);
