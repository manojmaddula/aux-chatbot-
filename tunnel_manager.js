const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const tunnelPaths = [
  path.join('C:\\Users\\maddu\\Downloads\\aux-chatbot--main', 'tunnel.json'),
  path.join('C:\\Users\\maddu\\.gemini\\antigravity\\scratch\\aux-chatbot-', 'tunnel.json')
];

let activeProc = null;
let currentTunnelUrl = null;
let healthCheckTimer = null;
let restartTimeout = null;

function saveTunnelInfo(url) {
  currentTunnelUrl = url;
  const payload = JSON.stringify({
    tunnelUrl: url,
    mobileUrl: `${url}/mobile-alert.html`,
    updatedAt: new Date().toISOString()
  }, null, 2);

  tunnelPaths.forEach(fp => {
    try {
      fs.writeFileSync(fp, payload, 'utf8');
      console.log(`[TUNNEL] Saved tunnel URL to ${fp}`);
    } catch (e) {
      console.error(`[TUNNEL] Failed to write to ${fp}:`, e.message);
    }
  });
}

function startHealthCheck() {
  if (healthCheckTimer) clearInterval(healthCheckTimer);
  let consecutiveFailures = 0;

  // Give Cloudflare Edge 45 seconds to fully propagate DNS/routing
  setTimeout(() => {
    healthCheckTimer = setInterval(() => {
      if (!currentTunnelUrl) return;
      try {
        const checkUrl = `${currentTunnelUrl}/api/server-info`;
        const req = https.get(checkUrl, { timeout: 10000 }, (res) => {
          if (res.statusCode === 200) {
            consecutiveFailures = 0;
          } else {
            consecutiveFailures++;
            console.warn(`[HEALTH] Tunnel returned HTTP ${res.statusCode} (fail count: ${consecutiveFailures}/4)`);
            if (consecutiveFailures >= 4) {
              console.error('[HEALTH] Tunnel unhealthy across 4 checks, recycling cloudflared...');
              consecutiveFailures = 0;
              restartTunnel();
            }
          }
        });
        req.on('error', (err) => {
          consecutiveFailures++;
          console.warn(`[HEALTH] Tunnel request error: ${err.message} (fail count: ${consecutiveFailures}/4)`);
          if (consecutiveFailures >= 4) {
            console.error('[HEALTH] Tunnel unreachable across 4 checks, recycling cloudflared...');
            consecutiveFailures = 0;
            restartTunnel();
          }
        });
        req.on('timeout', () => {
          req.destroy();
          consecutiveFailures++;
        });
      } catch (e) {
        console.warn('[HEALTH] Exception during check:', e.message);
      }
    }, 30000);
  }, 45000);
}

function restartTunnel() {
  if (restartTimeout) clearTimeout(restartTimeout);
  if (activeProc) {
    try {
      activeProc.kill('SIGKILL');
    } catch (_) {}
    activeProc = null;
  }
  restartTimeout = setTimeout(startTunnel, 3000);
}

function startTunnel() {
  const exePath = path.join(__dirname, 'cloudflared.exe');
  if (!fs.existsSync(exePath)) {
    console.error('[TUNNEL] cloudflared.exe not found at', exePath);
    return;
  }

  console.log('[TUNNEL] Starting cloudflared tunnel to http://localhost:4000...');
  currentTunnelUrl = null;

  activeProc = spawn(exePath, ['tunnel', '--url', 'http://localhost:4000'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const onData = (data) => {
    const text = data.toString();

    // Check for tunnel URL
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
      const url = match[0];
      if (url !== currentTunnelUrl) {
        console.log('[TUNNEL] ✓ Live Cloudflare Tunnel URL established:', url);
        saveTunnelInfo(url);
        startHealthCheck();
      }
    }

    // Check for unauthorized / expired tunnel error
    if (text.includes('Unauthorized: Tunnel not found') || text.includes('ERR Register tunnel error from server side')) {
      console.error('[TUNNEL] Detected expired or unauthorized tunnel session! Recycling process immediately...');
      restartTunnel();
    }
  };

  activeProc.stdout.on('data', onData);
  activeProc.stderr.on('data', onData);

  activeProc.on('close', (code) => {
    console.log('[TUNNEL] cloudflared exited with code', code);
    activeProc = null;
    if (restartTimeout) clearTimeout(restartTimeout);
    restartTimeout = setTimeout(startTunnel, 4000);
  });
}

startTunnel();
