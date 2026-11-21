const fs = require('fs');
const path = require('path');
const http = require('http');

const MANIFEST_PATH = path.resolve('public/assets/audio/voices/narrator/measured-durations.json');
const DIR = path.resolve('public/assets/audio/voices/narrator');

const data = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

console.log('Auditing all 14 Brian 1.05x Narration Files:');
let allPass = true;

function checkHttp(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      resolve({ status: res.statusCode, length: res.headers['content-length'] });
    }).on('error', reject);
  });
}

async function run() {
  for (const item of data) {
    const filePath = path.join(DIR, item.filename);
    const exists = fs.existsSync(filePath);
    if (!exists) {
      console.error(`FAIL: ${item.filename} missing on disk`);
      allPass = false;
      continue;
    }
    const stat = fs.statSync(filePath);
    const httpRes = await checkHttp(`http://localhost:3000/assets/audio/voices/narrator/${item.filename}`);

    const pass = exists && stat.size > 20000 && httpRes.status === 200 && item.durationMs > 2500;
    if (!pass) allPass = false;

    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${item.id.padEnd(12)} -> ${item.filename.padEnd(25)} | Size: ${(stat.size/1024).toFixed(1)} KB | Duration: ${(item.durationMs/1000).toFixed(2)}s | HTTP ${httpRes.status}`);
  }

  if (allPass) {
    console.log('\n✓ ALL 14 BRIAN NARRATION TRACKS PASS COMPLETE INTEGRATION AUDIT!');
  } else {
    console.error('\n✗ SOME TRACKS FAILED AUDIT!');
    process.exit(1);
  }
}

run();
