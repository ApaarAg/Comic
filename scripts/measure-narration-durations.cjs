const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_profile_durations';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

const FILES = [
  { id: 's00-01', filename: 'scene-00-opening-canvas.mp3' },
  { id: 's01-01', filename: 'scene-01-opening.mp3' },
  { id: 's01-02', filename: 'scene-01-highway.mp3' },
  { id: 's02-conn-01', filename: 'scene-02-connector.mp3' },
  { id: 's03-02', filename: 's03-02-window.mp3' },
  { id: 's04-conn-01', filename: 'scene-04-connector.mp3' },
  { id: 's05-01', filename: 's05-01-fall.mp3' },
  { id: 's05-02', filename: 's05-02-birth.mp3' },
  { id: 's05-03', filename: 's05-03-darius.mp3' },
  { id: 's06-conn-01', filename: 'scene-06-connector.mp3' },
  { id: 's07-conn-01', filename: 'scene-07-connector.mp3' },
  { id: 's08-conn-01', filename: 'scene-08-connector.mp3' },
  { id: 's09-01', filename: 's09-01-commerce.mp3' },
  { id: 's09-02', filename: 's09-02-midnight.mp3' },
  { id: 's10-conn-01', filename: 'scene-10-connector.mp3' },
];

async function main() {
  const port = 9336;
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
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await delay(1000);

    const results = [];
    for (const item of FILES) {
      const url = `http://localhost:3000/assets/audio/voices/narrator/${item.filename}`;
      const evalRes = await send('Runtime.evaluate', {
        expression: `new Promise((resolve, reject) => {
          const a = new Audio('${url}');
          a.addEventListener('loadedmetadata', () => {
            resolve({ durationSec: a.duration, durationMs: Math.round(a.duration * 1000) });
          });
          a.addEventListener('error', (e) => reject(new Error('Audio load failed: ' + '${item.filename}')));
        })`,
        awaitPromise: true,
        returnByValue: true
      });
      if (evalRes.exceptionDetails) {
        console.error('Error for', item.filename, evalRes.exceptionDetails);
      } else {
        results.push({
          id: item.id,
          filename: item.filename,
          ...evalRes.result.value
        });
      }
    }

    console.log(JSON.stringify(results, null, 2));
    fs.writeFileSync(
      'public/assets/audio/voices/narrator/measured-durations.json',
      JSON.stringify(results, null, 2)
    );
    console.log('Saved measured durations to public/assets/audio/voices/narrator/measured-durations.json');

    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
