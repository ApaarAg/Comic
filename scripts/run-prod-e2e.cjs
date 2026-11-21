const { spawn } = require('child_process');

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForPort(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`http://localhost:${port}/`);
      if (res.ok || res.status === 200 || res.status === 304) {
        return true;
      }
    } catch (e) {
      await delay(250);
    }
  }
  return false;
}

async function main() {
  console.log('[PROD E2E] Starting vite preview on port 4173...');
  const preview = spawn('npx.cmd', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    shell: true,
    stdio: 'inherit'
  });

  try {
    const ready = await waitForPort(4173);
    if (!ready) {
      throw new Error('Vite preview failed to start on port 4173 within timeout');
    }
    console.log('[PROD E2E] Vite preview is ready on port 4173. Running test-release-candidate-prod.cjs...');
    
    await new Promise((resolve, reject) => {
      const tester = spawn('node', ['scripts/test-release-candidate-prod.cjs'], {
        stdio: 'inherit'
      });
      tester.on('exit', code => {
        if (code === 0) resolve();
        else reject(new Error(`Test exited with code ${code}`));
      });
    });
    
    console.log('[PROD E2E] Release candidate tests completed successfully!');
  } finally {
    console.log('[PROD E2E] Tearing down preview server...');
    // Kill on windows using taskkill
    spawn('taskkill', ['/pid', preview.pid, '/f', '/t'], { stdio: 'ignore' });
  }
}

main().catch(err => {
  console.error('[PROD E2E] Error:', err);
  process.exit(1);
});
