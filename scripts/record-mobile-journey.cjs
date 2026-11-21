const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const ARTIFACTS_DIR = 'C:/Users/apaar/.gemini/antigravity/brain/5bb8e9c0-39cc-4320-b0a1-4fadaae4416b';
const SCREENSHOTS_DIR = path.join(ARTIFACTS_DIR, 'screenshots');
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const USER_DATA_DIR = path.join(__dirname, '../.chrome-mobile-audit');

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CdpConnection {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
    });

    this.ws.on('message', (msg) => {
      const res = JSON.parse(msg.toString());
      if (res.id && this.callbacks.has(res.id)) {
        const { resolve, reject } = this.callbacks.get(res.id);
        this.callbacks.delete(res.id);
        if (res.error) reject(res.error);
        else resolve(res.result);
      } else if (res.method && this.eventListeners.has(res.method)) {
        for (const cb of this.eventListeners.get(res.method)) {
          cb(res.params);
        }
      }
    });
  }

  on(event, cb) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(cb);
  }

  removeAllListeners(event) {
    if (event) {
      this.eventListeners.delete(event);
    } else {
      this.eventListeners.clear();
    }
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result.value;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(res.data, 'base64');
    const filePath = path.join(SCREENSHOTS_DIR, filename);
    fs.writeFileSync(filePath, buf);
    console.log(`[Screenshot] ${filename} (${Math.round(buf.length / 1024)} KB)`);
    return filePath;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function encodeFramesToWebm(cdp, framesBase64, outputFilename, fps = 12, width = 390, height = 844) {
  console.log(`\nEncoding ${framesBase64.length} frames into ${outputFilename} at ${fps} fps (${width}x${height})...`);
  
  await cdp.eval(`(() => {
    window._recordedChunks = [];
    window._encoderCanvas = document.createElement('canvas');
    window._encoderCanvas.width = ${width};
    window._encoderCanvas.height = ${height};
    window._encoderCtx = window._encoderCanvas.getContext('2d');
    const stream = window._encoderCanvas.captureStream(${fps});
    const mimeType = (window.MediaRecorder && MediaRecorder.isTypeSupported('video/webm;codecs=vp9'))
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    window._mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 2000000,
    });
    window._mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) window._recordedChunks.push(e.data);
    };
    window._mediaRecorder.start();
  })()`);

  const frameIntervalMs = Math.round(1000 / fps);
  for (let i = 0; i < framesBase64.length; i++) {
    const frame = framesBase64[i];
    await cdp.eval(`(async () => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          window._encoderCtx.clearRect(0, 0, ${width}, ${height});
          window._encoderCtx.drawImage(img, 0, 0, ${width}, ${height});
          resolve();
        };
        img.src = 'data:image/jpeg;base64,${frame}';
      });
    })()`);
    await delay(frameIntervalMs);
    if (i > 0 && i % 30 === 0) {
      console.log(`  Encoded frame ${i}/${framesBase64.length}...`);
    }
  }

  const base64Webm = await cdp.eval(`(async () => {
    await new Promise((resolve) => {
      window._mediaRecorder.onstop = resolve;
      try {
        if (window._mediaRecorder.state !== 'inactive') {
          window._mediaRecorder.requestData();
          window._mediaRecorder.stop();
        } else {
          resolve();
        }
      } catch (e) {
        resolve();
      }
    });
    const blob = new Blob(window._recordedChunks, { type: 'video/webm' });
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
  })()`);

  const videoBuffer = Buffer.from(base64Webm, 'base64');
  const targetPath = path.join(ARTIFACTS_DIR, outputFilename);
  fs.writeFileSync(targetPath, videoBuffer);
  console.log(`[Video Generated] ${outputFilename}: ${Math.round(videoBuffer.length / 1024)} KB written successfully.\n`);
  return targetPath;
}

async function runMobileAudit() {
  console.log('===============================================================');
  console.log('MOBILE VIEWPORT AUDIT & RECORDING (iPhone 14 / 390x844)');
  console.log('===============================================================\n');

  const chromeProc = spawn(CHROME_PATH, [
    '--remote-debugging-port=9340',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--headless=new',
    '--window-size=390,844',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required',
    'about:blank',
  ]);

  await delay(2500);

  try {
    const targets = await fetchJson('http://localhost:9340/json');
    const pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found on port 9340');

    const cdp = new CdpConnection(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    console.log('Setting iPhone 14 emulation (390x844 @ DPR 3)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
      hasTouch: true,
    });

    console.log('Navigating to http://localhost:3000...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await delay(3500);

    // Audio unlock gesture
    await cdp.eval(`(() => {
      const btn = document.querySelector('button[aria-label*="audio" i], button[aria-label*="sound" i]');
      if (btn) btn.click();
    })()`);
    await delay(800);

    // Capture explicit mobile screenshots with accurate element framing
    console.log('Capturing mobile scene screenshots...');
    await cdp.eval(`(() => {
      const s02 = document.getElementById('scene-02');
      if (s02) s02.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1000);
    await cdp.captureScreenshot('audit_mobile_scene02_balloon.png');

    await cdp.eval(`(() => {
      const s04 = document.getElementById('scene-04');
      if (s04) s04.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1000);
    await cdp.captureScreenshot('audit_mobile_scene04_god.png');

    await cdp.eval(`(() => {
      const s10 = document.getElementById('scene-10');
      if (s10) s10.scrollIntoView({ behavior: 'instant' });
    })()`);
    await delay(1000);
    await cdp.captureScreenshot('audit_mobile_scene10_veranda.png');

    // Screencast recording through continuous scroll
    console.log('Resetting to top for continuous mobile recording...');
    await cdp.eval(`window.scrollTo(0, 0)`);
    await delay(1000);

    const mobileFrames = [];
    cdp.on('Page.screencastFrame', async (params) => {
      mobileFrames.push(params.data);
      await cdp.send('Page.screencastFrameAck', { sessionId: params.sessionId });
    });

    console.log('Starting mobile screencast capture (390x844)...');
    await cdp.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 75,
      maxWidth: 1170,
      maxHeight: 2532,
      everyNthFrame: 1,
    });

    console.log('Executing continuous mobile scroll sequence...');
    // Continuous multi-speed mobile scrolling across all 10 scenes
    for (let y = 0; y <= 26000; y += 180) {
      await cdp.eval(`window.scrollTo(0, ${y})`);
      await delay(75);
    }
    await delay(800);

    console.log(`Stopping mobile screencast. Collected ${mobileFrames.length} frames.`);
    await cdp.send('Page.stopScreencast');
    cdp.removeAllListeners('Page.screencastFrame');
    await delay(1000);

    if (mobileFrames.length > 10) {
      await encodeFramesToWebm(
        cdp,
        mobileFrames.slice(0, 200), // ~16s smooth sequence
        'mobile_continuous_journey.webm',
        12,
        390,
        844,
      );
    } else {
      console.warn(`Only ${mobileFrames.length} frames collected.`);
    }

    // Check responsiveness and overflow
    const overflowReport = await cdp.eval(`(() => {
      return {
        viewportWidth: window.innerWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth,
        scenesInspected: Array.from(document.querySelectorAll('[id^="scene-"]')).map(el => ({
          id: el.id,
          offsetWidth: el.offsetWidth,
          clientWidth: el.clientWidth,
          overflowing: el.scrollWidth > window.innerWidth
        }))
      };
    })()`);
    console.log('Mobile Responsiveness Check:', overflowReport);

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'storyverse-mobile-audit.json'),
      JSON.stringify(overflowReport, null, 2),
    );

    cdp.close();
    console.log('Mobile audit complete.');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

runMobileAudit().catch((err) => {
  console.error('Error in mobile audit:', err);
  process.exit(1);
});
