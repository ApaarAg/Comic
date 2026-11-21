const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_profile_test_scroll';

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
  const port = 9352;
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--headless=new',
    '--disable-gpu',
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

    const audioRequests = [];
    const consoleLogs = [];
    ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      if (msg.method === 'Network.requestWillBeSent') {
        const url = msg.params.request.url;
        if (url.includes('.mp3') || url.includes('/audio/')) {
          audioRequests.push({ time: Date.now(), url: url.split('/').pop() });
        }
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push({ type: msg.params.type, text: msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ') });
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await delay(2000);

    // Click enable audio
    const unlockRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('[data-testid="enable-audio-btn"]');
        if (btn) { btn.click(); return 'clicked'; }
        return 'no-btn';
      })()`,
      returnByValue: true
    });
    console.log('Unlock button result:', unlockRes.value);
    await delay(500);

    console.log('Initial audio requests:', audioRequests.map(r => r.url));

    // Scroll slightly repeatedly
    console.log('Scrolling slightly in Scene 00 10 times...');
    for (let i = 1; i <= 10; i++) {
      await send('Runtime.evaluate', {
        expression: `window.scrollTo(0, ${i * 40})`
      });
      await delay(100);
    }

    console.log('Audio requests after small scrolls:', audioRequests.map(r => r.url));

    // Scroll down into Scene 01 and Scene 02
    console.log('Scrolling down into Scene 01 and 02...');
    const maxScroll = await send('Runtime.evaluate', {
      expression: 'document.documentElement.scrollHeight - window.innerHeight',
      returnByValue: true
    });
    const maxH = maxScroll.value;

    for (let p = 0.05; p <= 0.35; p += 0.02) {
      await send('Runtime.evaluate', {
        expression: `window.scrollTo(0, ${Math.round(maxH * p)})`
      });
      await delay(200);
    }

    console.log('All audio requests during scroll:', audioRequests.map(r => r.url));
    console.log('Console logs count:', consoleLogs.length);

  } finally {
    chrome.kill();
  }
}
run().catch(console.error);
