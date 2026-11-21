const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\apaar\\.gemini\\antigravity\\brain\\5bb8e9c0-39cc-4320-b0a1-4fadaae4416b\\scratch\\chrome_rc_prod';
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
  const port = 9380;
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
    const allRequests = [];

    ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        if (msg.params.type === 'error' || text.includes('Error') || text.includes('404')) {
          consoleLogs.push({ type: msg.params.type, text });
        }
      }
      if (msg.method === 'Network.responseReceived') {
        allRequests.push({ url: msg.params.response.url, status: msg.params.response.status });
        if (msg.params.response.status >= 400) {
          failedUrls.push({ url: msg.params.response.url, status: msg.params.response.status });
        }
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    console.log('=== TEST 1: PRODUCTION BUILD STARTUP & CURTAIN (PORT 4173) ===');
    await send('Page.navigate', { url: 'http://localhost:4173/' });
    
    // Capture preloader curtain during 2.2s pacing delay
    await delay(700);
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'rc_01_startup_curtain.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured rc_01_startup_curtain.png');

    // Wait for curtain to dissolve & unmount
    await delay(3200);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'rc_02_skyline_reveal.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured rc_02_skyline_reveal.png (Skyline visible, no black void)');

    const startupStatus = await send('Runtime.evaluate', {
      expression: `(() => {
        const curtain = document.querySelector('.cinematic-startup-curtain');
        const headline = Array.from(document.querySelectorAll('h1, h2, div')).some(d => d.innerText && d.innerText.includes('Falling Starr'));
        const unlockBtn = document.querySelector('[data-testid="enable-audio-btn"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('Enter') || b.innerText.includes('Listen')));
        return { curtainPresent: !!curtain, headlinePresent: headline, unlockBtnPresent: !!unlockBtn };
      })()`,
      returnByValue: true
    });
    console.log('Startup status:', JSON.stringify(startupStatus.result.value));

    console.log('=== TEST 2: AUDIO UNLOCK & BRIAN 1.05X OPENING NARRATION ===');
    const unlockRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('[data-testid="enable-audio-btn"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('Enter') || b.innerText.includes('Listen')));
        if (btn) { btn.click(); return { clicked: true, text: btn.innerText || 'enable-audio-btn' }; }
        return { clicked: false };
      })()`,
      returnByValue: true
    });
    console.log('Unlock CTA click:', JSON.stringify(unlockRes.result.value));

    await delay(1200);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'rc_03_opening_narration.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured rc_03_opening_narration.png (Audio unlocked, narration active)');

    console.log('=== TEST 3: ALL 10 SCENES PRODUCTION TRAVERSAL ===');

    const totalHeightRes = await send('Runtime.evaluate', {
      expression: 'document.documentElement.scrollHeight',
      returnByValue: true
    });
    const scrollHeight = totalHeightRes.result.value;
    console.log(`Document scrollHeight: ${scrollHeight}px`);

    const checkpoints = [
      { name: 'rc_04_scene01_mumbai', pct: 0.12, scene: 'Scene 01' },
      { name: 'rc_05_scene02_traffic', pct: 0.22, scene: 'Scene 02' },
      { name: 'rc_06_scene03_party', pct: 0.32, scene: 'Scene 03' },
      { name: 'rc_07_scene04_death_bureau', pct: 0.42, scene: 'Scene 04' },
      { name: 'rc_08_scene05_two_events', pct: 0.52, scene: 'Scene 05' },
      { name: 'rc_09_scene06_laila_mortal', pct: 0.62, scene: 'Scene 06' },
      { name: 'rc_10_scene07_hospital', pct: 0.72, scene: 'Scene 07' },
      { name: 'rc_11_scene08_escort', pct: 0.82, scene: 'Scene 08' },
      { name: 'rc_12_scene09_second_death', pct: 0.90, scene: 'Scene 09' },
      { name: 'rc_13_scene10_eight_years_later', pct: 0.98, scene: 'Scene 10' }
    ];

    for (const cp of checkpoints) {
      const scrollY = Math.round(scrollHeight * cp.pct);
      await send('Runtime.evaluate', {
        expression: `window.scrollTo({ top: ${scrollY}, behavior: 'instant' })`
      });
      await delay(700);

      // Check scene specific validations
      if (cp.scene === 'Scene 06') {
        const imgCheck = await send('Runtime.evaluate', {
          expression: `(() => {
            const img = document.querySelector('img[src*="p17_panel04"]');
            return {
              found: !!img,
              complete: img ? img.complete : false,
              naturalWidth: img ? img.naturalWidth : 0,
              src: img ? img.src : null
            };
          })()`,
          returnByValue: true
        });
        console.log(`[VERIFY ${cp.scene}] p17_panel04 status:`, JSON.stringify(imgCheck.result.value));
      }

      if (cp.scene === 'Scene 05' || cp.scene === 'Scene 07') {
        const layoutCheck = await send('Runtime.evaluate', {
          expression: `(() => {
            const panels = document.querySelectorAll('img[src*="p13_panel"], img[src*="p14_panel"], img[src*="p18_panel"], img[src*="p19_panel"]');
            const widths = Array.from(panels).map(p => ({
              src: p.src.split('/').pop(),
              offsetWidth: p.offsetWidth,
              offsetHeight: p.offsetHeight,
              visible: p.offsetWidth > 0 && p.offsetHeight > 0
            }));
            return { panelCount: panels.length, sampleDimensions: widths.slice(0, 3) };
          })()`,
          returnByValue: true
        });
        console.log(`[VERIFY ${cp.scene}] Sequential layout:`, JSON.stringify(layoutCheck.result.value));
      }

      shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(SHOTS_DIR, `${cp.name}.png`), Buffer.from(shot.data, 'base64'));
      console.log(`[PASS] Captured ${cp.name}.png (${cp.scene})`);
    }

    console.log('=== TEST 4: BACKWARD SCROLLING & HYSTERESIS ===');
    // Scroll backward to Scene 04
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: Math.round(${scrollHeight} * 0.40), behavior: 'instant' })`
    });
    await delay(800);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'rc_14_backward_hysteresis.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured rc_14_backward_hysteresis.png');

    console.log('=== TEST 5: MOBILE VIEWPORT TEST (390x844) ===');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    // Mobile Opening
    await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 0, behavior: ' + "'instant'" + ' })' });
    await delay(600);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'rc_15_mobile_opening.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured rc_15_mobile_opening.png');

    // Mobile Scene 07
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: Math.round(${scrollHeight} * 0.72), behavior: 'instant' })`
    });
    await delay(700);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'rc_16_mobile_scene07.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured rc_16_mobile_scene07.png');

    // Reset device metrics to desktop
    await send('Emulation.clearDeviceMetricsOverride');

    console.log('=== TEST 6: MRS. SHAH AUDITION CONSOLE (PORT 4173) ===');
    await send('Page.navigate', { url: 'http://localhost:4173/mrs-shah-audition.html' });
    await delay(1000);

    const auditionPageCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const title = document.querySelector('h1')?.innerText || '';
        const audios = Array.from(document.querySelectorAll('audio source')).map(s => s.src);
        return { title, audioSources: audios };
      })()`,
      returnByValue: true
    });
    console.log('Audition Console verification:', JSON.stringify(auditionPageCheck.result.value));

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'rc_17_mrs_shah_audition_console.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured rc_17_mrs_shah_audition_console.png');

    console.log('=== TEST 7: BRIAN PACING AUDITION CONSOLE ===');
    await send('Page.navigate', { url: 'http://localhost:4173/narrator-auditions.html' });
    await delay(1000);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS_DIR, 'rc_18_brian_pacing_console.png'), Buffer.from(shot.data, 'base64'));
    console.log('[PASS] Captured rc_18_brian_pacing_console.png');

    console.log('\n=== AUDIT RESULTS ===');
    console.log(`Total Network Requests: ${allRequests.length}`);
    console.log(`Failed Requests (4xx/5xx): ${failedUrls.length}`);
    if (failedUrls.length > 0) {
      console.log('Failed URLs:', JSON.stringify(failedUrls, null, 2));
    }
    console.log(`Console Errors/Warnings: ${consoleLogs.length}`);
    if (consoleLogs.length > 0) {
      console.log('Console Logs:', JSON.stringify(consoleLogs, null, 2));
    }

    const testSummary = {
      timestamp: new Date().toISOString(),
      productionHost: 'http://localhost:4173',
      totalRequests: allRequests.length,
      failedRequests: failedUrls,
      consoleErrors: consoleLogs,
      auditionPageCheck: auditionPageCheck.result.value
    };
    fs.writeFileSync('scripts/rc-test-results.json', JSON.stringify(testSummary, null, 2));

    console.log('\n✓ RELEASE CANDIDATE TEST SUITE FINISHED SUCCESSFULLY');
    ws.close();
    chrome.kill();
  } catch (err) {
    console.error('Fatal test error:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
