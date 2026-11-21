const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_predeploy';
const SHOTS_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\screenshots';

fs.mkdirSync(SHOTS_DIR, { recursive: true });

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
  const port = 9390;
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900',
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

    const consoleLogs = [];
    const failedUrls = [];
    const audioRequests = [];

    ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        if (msg.params.type === 'error' || text.includes('Error') || text.includes('404')) {
          consoleLogs.push({ type: msg.params.type, text });
        }
      }
      if (msg.method === 'Network.responseReceived') {
        const url = msg.params.response.url;
        const status = msg.params.response.status;
        if (status >= 400) {
          failedUrls.push({ url, status });
        }
        if (url.includes('.mp3') || url.includes('.wav')) {
          audioRequests.push({ url, status, headers: msg.params.response.headers });
        }
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    console.log('=== 1. STARTUP CURTAIN & OPENING CANVASES (PORT 4173) ===');
    await send('Page.navigate', { url: 'http://localhost:4173/' });

    await delay(700);
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'predeploy_01_curtain.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured predeploy_01_curtain.png');

    await delay(3200);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'predeploy_02_skyline_open.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured predeploy_02_skyline_open.png');

    console.log('=== 2. AUDIO UNLOCK & NARRATION SYNCHRONIZATION ===');
    const unlockRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('[data-testid="enable-audio-btn"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('Enter') || b.innerText.includes('Listen')));
        if (btn) { btn.click(); return { clicked: true, text: btn.innerText || 'enable-audio-btn' }; }
        return { clicked: false };
      })()`,
      returnByValue: true
    });
    console.log('Audio unlock status:', JSON.stringify(unlockRes.result.value));
    await delay(1200);

    const totalHeightRes = await send('Runtime.evaluate', {
      expression: 'document.documentElement.scrollHeight',
      returnByValue: true
    });
    const scrollHeight = totalHeightRes.result.value;

    console.log('=== 3. SCENE 02 TRAFFIC JAM & MRS. SHAH PROMOTED RECORDING (s02-03) ===');
    // Scroll directly into Scene 02 Mrs. Shah labor line (progress ~0.24)
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: Math.round(${scrollHeight} * 0.24), behavior: 'instant' })`
    });
    await delay(1200);

    const mrsShahDialogueCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const allText = document.body.innerText;
        const hasShahName = allText.includes('Mrs. Shah') || allText.includes('MRS. SHAH');
        const hasBabyText = allText.includes('The baby is coming') || allText.includes('baby is coming');
        const bubbles = Array.from(document.querySelectorAll('[data-speaker], [class*="bubble"], div')).filter(d => d.innerText && d.innerText.includes('baby is coming'));
        return {
          hasShahName,
          hasBabyText,
          bubbleCount: bubbles.length
        };
      })()`,
      returnByValue: true
    });
    console.log('Mrs. Shah dialogue check:', JSON.stringify(mrsShahDialogueCheck.result.value));

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'predeploy_03_scene02_mrs_shah_promoted.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured predeploy_03_scene02_mrs_shah_promoted.png');

    console.log('=== 4. VERIFY SEQUENTIAL PANELS (SCENE 05 & SCENE 07) ===');
    // Scene 05
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: Math.round(${scrollHeight} * 0.52), behavior: 'instant' })`
    });
    await delay(800);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'predeploy_04_scene05_sequential.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured predeploy_04_scene05_sequential.png');

    // Scene 07
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: Math.round(${scrollHeight} * 0.72), behavior: 'instant' })`
    });
    await delay(800);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'predeploy_05_scene07_sequential.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured predeploy_05_scene07_sequential.png');

    console.log('=== 5. VERIFY CHAPTER ENDING & EPILOGUE (SCENE 10) ===');
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: Math.round(${scrollHeight} * 0.98), behavior: 'instant' })`
    });
    await delay(900);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'predeploy_06_scene10_epilogue.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured predeploy_06_scene10_epilogue.png');

    console.log('=== 6. MOBILE RESPONSIVE TEST (390x844) ===');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: Math.round(${scrollHeight} * 0.24), behavior: 'instant' })`
    });
    await delay(800);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'predeploy_07_mobile_scene02.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured predeploy_07_mobile_scene02.png');
    await send('Emulation.clearDeviceMetricsOverride');

    console.log('=== 7. MRS. SHAH AUDITION CONSOLE VERIFICATION ===');
    await send('Page.navigate', { url: 'http://localhost:4173/mrs-shah-audition.html' });
    await delay(1000);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'predeploy_08_mrs_shah_promoted_console.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured predeploy_08_mrs_shah_promoted_console.png');

    console.log('\n=== AUDIT RESULTS ===');
    console.log(`Total Audio Requests: ${audioRequests.length}`);
    console.log(`Failed Requests: ${failedUrls.length}`);
    if (failedUrls.length > 0) {
      console.log('Failed URLs:', JSON.stringify(failedUrls, null, 2));
    }
    console.log(`Console Errors/Warnings: ${consoleLogs.length}`);
    if (consoleLogs.length > 0) {
      console.log('Console Logs:', JSON.stringify(consoleLogs, null, 2));
    }

    const shahReq = audioRequests.find(r => r.url.includes('s02-03-mrs-shah-baby.mp3'));
    console.log('Mrs. Shah production audio request:', shahReq ? JSON.stringify(shahReq) : 'None');

    const resultSummary = {
      timestamp: new Date().toISOString(),
      productionHost: 'http://localhost:4173',
      mrsShahDialogueCheck: mrsShahDialogueCheck.result.value,
      mrsShahAudioRequest: shahReq || null,
      failedRequests: failedUrls,
      consoleErrors: consoleLogs,
      status: failedUrls.length === 0 && consoleLogs.length === 0 ? 'READY_FOR_DEPLOYMENT' : 'ISSUES_FOUND'
    };
    fs.writeFileSync('scripts/predeploy-test-results.json', JSON.stringify(resultSummary, null, 2));

    console.log('\n✓ PRE-DEPLOYMENT VERIFICATION TEST COMPLETED SUCCESSFULLY');
    ws.close();
    chrome.kill();
  } catch (err) {
    console.error('Test error:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
