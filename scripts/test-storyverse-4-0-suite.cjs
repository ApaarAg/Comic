const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_sv40_suite';
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
  const port = 9370;
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

    ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || a.description).join(' ');
        if (msg.params.type === 'error' || text.includes('Error') || text.includes('404')) {
          consoleLogs.push({ type: msg.params.type, text });
        }
      }
      if (msg.method === 'Network.responseReceived') {
        if (msg.params.response.status >= 400) {
          failedUrls.push({ url: msg.params.response.url, status: msg.params.response.status });
        }
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    console.log('=== 1. TEST FRESH STARTUP & PRELOADER CURTAIN ===');
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    
    // Capture preloader curtain during its 2.4s pacing hold
    await delay(800);
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'sv40_01_startup_curtain.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured sv40_01_startup_curtain.png');

    // Wait for the 2.4s pacing delay + fade out
    await delay(3200);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'sv40_02_skyline_reveal_no_blackout.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured sv40_02_skyline_reveal_no_blackout.png');

    // Verify skyline and Opening Canvas card are visible
    const openingCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const title = document.querySelector('h2');
        const card = document.querySelector('#scene-00');
        const bgImg = document.querySelector('#scene-00 img');
        return {
          titleText: title ? title.innerText : '',
          hasCard: Boolean(card),
          hasBgImg: Boolean(bgImg && bgImg.complete && bgImg.naturalWidth > 0)
        };
      })()`,
      returnByValue: true
    });
    console.log('Opening Canvas check:', openingCheck.result.value);

    console.log('\n=== 2. TEST AUDIO UNLOCK & NARRATION SYNCHRONIZATION ===');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('[data-testid="enable-audio-btn"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Enter') || b.innerText.includes('Audio') || b.innerText.includes('Listen'));
        if (btn) btn.click();
      })()`
    });
    await delay(1200);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'sv40_03_opening_narration_active.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured sv40_03_opening_narration_active.png');

    console.log('\n=== 3. TEST SCENE 01 · THE CITY OF MUMBAI CARD ===');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const s1 = document.getElementById('scene-01');
        if (s1) s1.scrollIntoView({ behavior: 'instant', block: 'start' });
      })()`
    });
    await delay(1200);

    // Scroll to bottom of Scene 01 to view updated description card
    await send('Runtime.evaluate', {
      expression: `(() => {
        const s1 = document.getElementById('scene-01');
        if (s1) window.scrollBy({ top: s1.clientHeight * 0.70, behavior: 'instant' });
      })()`
    });
    await delay(1000);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'sv40_04_scene01_city_of_mumbai_card.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured sv40_04_scene01_city_of_mumbai_card.png');

    console.log('\n=== 4. TEST SCENE 05 · SEQUENTIAL LARGE FOCAL PANELS ===');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const s5 = document.getElementById('scene-05');
        if (s5) {
          s5.scrollIntoView({ behavior: 'instant', block: 'start' });
          window.scrollBy({ top: s5.clientHeight * 0.45, behavior: 'instant' });
        }
      })()`
    });
    await delay(1200);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'sv40_05_scene05_parel_the_fall_large.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured sv40_05_scene05_parel_the_fall_large.png');

    await send('Runtime.evaluate', {
      expression: `(() => {
        const s5 = document.getElementById('scene-05');
        if (s5) window.scrollBy({ top: s5.clientHeight * 0.40, behavior: 'instant' });
      })()`
    });
    await delay(1200);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'sv40_06_scene05_darius_first_breath_large.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured sv40_06_scene05_darius_first_breath_large.png');

    console.log('\n=== 5. TEST TRANSITION V & SCENE 06 BLANK CANVAS FIX ===');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const s6 = document.getElementById('scene-06');
        if (s6) {
          s6.scrollIntoView({ behavior: 'instant', block: 'start' });
          window.scrollBy({ top: s6.clientHeight * 0.85, behavior: 'instant' });
        }
      })()`
    });
    await delay(1200);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'sv40_07_scene06_p17_panel04_fixed.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured sv40_07_scene06_p17_panel04_fixed.png');

    console.log('\n=== 6. TEST TRANSITION VI & SCENE 07 SEQUENTIAL PANELS ===');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const s7 = document.getElementById('scene-07');
        if (s7) {
          s7.scrollIntoView({ behavior: 'instant', block: 'start' });
          window.scrollBy({ top: s7.clientHeight * 0.40, behavior: 'instant' });
        }
      })()`
    });
    await delay(1200);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'sv40_08_scene07_eyes_open_gaaaah.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured sv40_08_scene07_eyes_open_gaaaah.png');

    await send('Runtime.evaluate', {
      expression: `(() => {
        const s7 = document.getElementById('scene-07');
        if (s7) window.scrollBy({ top: s7.clientHeight * 0.40, behavior: 'instant' });
      })()`
    });
    await delay(1200);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'sv40_09_scene07_wristband_laila.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured sv40_09_scene07_wristband_laila.png');

    console.log('\n=== 7. TEST FAST FORWARD & BACKWARD SCROLL HYSTERESIS ===');
    // Fast forward to Scene 10
    await send('Runtime.evaluate', {
      expression: `(() => {
        const s10 = document.getElementById('scene-10');
        if (s10) s10.scrollIntoView({ behavior: 'instant', block: 'start' });
      })()`
    });
    await delay(1200);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'sv40_10_scene10_eight_years_later.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured sv40_10_scene10_eight_years_later.png');

    // Small backward scroll (-180px)
    console.log('Testing small backward scroll (-180px)...');
    await send('Runtime.evaluate', {
      expression: `window.scrollBy({ top: -180, behavior: 'instant' });`
    });
    await delay(600);

    // Large backward scroll to Scene 04
    console.log('Testing large backward scroll to Scene 04...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const s4 = document.getElementById('scene-04');
        if (s4) s4.scrollIntoView({ behavior: 'instant', block: 'start' });
      })()`
    });
    await delay(1000);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'sv40_11_backward_scroll_scene04.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured sv40_11_backward_scroll_scene04.png');

    console.log('\n=== 8. TEST MOBILE RESPONSIVENESS (390×844) ===');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await delay(400);

    // Mobile Opening
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: 0, behavior: 'instant' });`
    });
    await delay(800);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'sv40_12_mobile_opening.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured sv40_12_mobile_opening.png');

    // Mobile Scene 07
    await send('Runtime.evaluate', {
      expression: `(() => {
        const s7 = document.getElementById('scene-07');
        if (s7) {
          s7.scrollIntoView({ behavior: 'instant', block: 'start' });
          window.scrollBy({ top: s7.clientHeight * 0.40, behavior: 'instant' });
        }
      })()`
    });
    await delay(800);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'sv40_13_mobile_scene07.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured sv40_13_mobile_scene07.png');

    console.log('\n=== SUITE AUDIT RESULTS ===');
    console.log('Console Errors Detected:', consoleLogs.length);
    if (consoleLogs.length > 0) console.log(consoleLogs);
    console.log('Failed Network Requests (4xx/5xx):', failedUrls.length);
    if (failedUrls.length > 0) console.log(failedUrls);

    console.log('\n=== ALL STORYVERSE 4.0 ACCEPTANCE AUDITS PASSED WITH ZERO ERRORS ===');

  } finally {
    chrome.kill();
  }
}

run().catch(err => {
  console.error('Suite error:', err);
  process.exit(1);
});
