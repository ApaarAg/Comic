const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_profile_pacing_test';

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
  const port = 9335;
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
    await send('Page.navigate', { url: 'http://localhost:3000/narrator-auditions.html' });
    await delay(2000);

    // Test playback of brian-105
    const play105 = await send('Runtime.evaluate', {
      expression: `(async () => {
        togglePlay('brian-105');
        await new Promise(r => setTimeout(r, 1200));
        return {
          playing: !currentAudio.paused,
          currentTime: currentAudio.currentTime,
          duration: currentAudio.duration,
          src: currentAudio.src
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Brian 1.05x Playback Test:', play105.result.value);

    // Test switching tabs to dramatic and playing brian-110
    const testDramatic = await send('Runtime.evaluate', {
      expression: `(async () => {
        switchPassage('dramatic');
        togglePlay('brian-110');
        await new Promise(r => setTimeout(r, 1000));
        return {
          currentPassage,
          playing: !currentAudio.paused,
          currentTime: currentAudio.currentTime,
          duration: currentAudio.duration,
          src: currentAudio.src
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Dramatic 1.10x Playback Test:', testDramatic.result.value);

    // Capture screenshot of the active dramatic tab
    const ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\screenshots\\sv31_08_brian_pacing_active.png', Buffer.from(ss.data, 'base64'));
    console.log('Active screenshot saved.');

    ws.close();
  } finally {
    chrome.kill();
  }
}
run().catch(console.error);
