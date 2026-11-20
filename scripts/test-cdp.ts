import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

async function main() {
  const profileDir = path.join(os.tmpdir(), `chrome-test-profile-${Date.now()}`);
  console.log('Starting Chrome with profile:', profileDir);
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9333',
    '--remote-debugging-address=127.0.0.1',
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-translate',
    '--mute-audio',
    'about:blank'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  chrome.stderr.on('data', (d) => console.log('CHROME STDERR:', d.toString().trim()));
  chrome.stdout.on('data', (d) => console.log('CHROME STDOUT:', d.toString().trim()));

  // Wait for port to be ready
  let connected = false;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await fetch('http://127.0.0.1:9333/json/version');
      if (res.ok) {
        const json = await res.json();
        console.log('SUCCESS! CDP connected to:', json.Browser);
        connected = true;
        break;
      }
    } catch {
      // retry
    }
  }

  if (!connected) {
    console.error('Failed to connect to CDP after 10s');
  }

  chrome.kill();
  console.log('Cleaned up chrome process.');
}

main().catch(console.error);
