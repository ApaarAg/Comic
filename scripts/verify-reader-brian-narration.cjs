const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_profile_reader_verify';
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
  const port = 9337;
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
          audioRequests.push(url);
          console.log('[Network Audio Request]:', url);
        }
      }
    });

    console.log('Navigating to http://localhost:3000/...');
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await delay(2500);

    // Click Unlock Audio / Begin
    console.log('Unlocking audio and starting journey...');
    const unlockRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('button');
        if (btn) { btn.click(); return 'button clicked'; }
        return 'no button found';
      })()`,
      returnByValue: true
    });
    console.log('Unlock result:', unlockRes.result.value);
    await delay(1500);

    // Scroll into Scene 01 opening narration trigger
    console.log('Scrolling to trigger Scene 01 narration (s01-01)...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: totalHeight * 0.05, behavior: 'instant' });
      })()`
    });
    await delay(2000);

    // Check narration state
    const narState1 = await send('Runtime.evaluate', {
      expression: `(() => {
        const activeCaption = document.querySelector('.cinematic-caption, [data-caption], .caption-text, .narration-box');
        const allText = document.body.innerText;
        const hasItBegan = allText.includes('It began on a Wednesday');
        return {
          hasCaptionElement: !!activeCaption,
          captionText: activeCaption ? activeCaption.innerText : null,
          hasItBeganInDOM: hasItBegan
        };
      })()`,
      returnByValue: true
    });
    console.log('Narration State 1 (Scene 01):', narState1.result.value);

    // Take screenshot of Scene 01
    const ss1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'sv31_09_reader_brian_scene01.png'), Buffer.from(ss1.data, 'base64'));
    console.log('Saved sv31_09_reader_brian_scene01.png');

    // Scroll to Scene 02
    console.log('Scrolling to Scene 02 connector (s02-conn-01)...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: totalHeight * 0.12, behavior: 'instant' });
      })()`
    });
    await delay(2000);

    const narState2 = await send('Runtime.evaluate', {
      expression: `(() => {
        const allText = document.body.innerText;
        const hasOverpass = allText.includes('B.K.C. overpass') || allText.includes('one city became many cities');
        return {
          hasOverpassInDOM: hasOverpass
        };
      })()`,
      returnByValue: true
    });
    console.log('Narration State 2 (Scene 02):', narState2.result.value);

    const ss2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'sv31_10_reader_brian_scene02.png'), Buffer.from(ss2.data, 'base64'));
    console.log('Saved sv31_10_reader_brian_scene02.png');

    console.log('Audio requests captured during reader session:', audioRequests);

    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
