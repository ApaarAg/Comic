const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_profile_word_test';

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
  const port = 9341;
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

    // Scroll slightly into canvas range
    await send('Runtime.evaluate', {
      expression: `(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: totalHeight * 0.02, behavior: 'instant' });
      })()`
    });
    await delay(1000);

    // Unlock
    console.log('Unlocking audio via enable-audio-btn...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('[data-testid="enable-audio-btn"]') || document.querySelector('button');
        if (btn) btn.click();
      })()`
    });

    console.log('Waiting 2.5s for audio playback and synchronized word illumination...');
    await delay(2500);

    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const words = Array.from(document.querySelectorAll('span[style*="rgb(251, 244, 234)"], span[style*="rgb(247, 194, 125)"]'));
        return {
          illuminatedWordCount: words.length,
          sampleWords: words.slice(0, 10).map(w => w.innerText.trim()).filter(Boolean)
        };
      })()`,
      returnByValue: true
    });
    console.log('Playback Word Sync Result:', evalRes.result.value);

    // Test clicking the discreet Replay button
    console.log('Testing discreet replay button click...');
    const replayRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('button[title="Replay Opening Narration"]');
        if (btn) { btn.click(); return 'replay clicked'; }
        return 'replay button not found';
      })()`,
      returnByValue: true
    });
    console.log('Replay Button Result:', replayRes.result.value);

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
