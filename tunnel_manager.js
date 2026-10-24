const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tunnelFile = path.join(__dirname, 'tunnel.json');

function startTunnel() {
  const exePath = path.join(__dirname, 'cloudflared.exe');
  if (!fs.existsSync(exePath)) {
    console.log('cloudflared.exe not found');
    return;
  }

  console.log('Starting cloudflared tunnel to http://localhost:4000...');
  const proc = spawn(exePath, ['tunnel', '--url', 'http://localhost:4000'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const onData = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
      const tunnelUrl = match[0];
      console.log('✓ Found Cloudflare Tunnel URL:', tunnelUrl);
      fs.writeFileSync(tunnelFile, JSON.stringify({
        tunnelUrl: tunnelUrl,
        mobileUrl: `${tunnelUrl}/mobile-alert.html`,
        updatedAt: new Date().toISOString()
      }, null, 2), 'utf8');
    }
  };

  proc.stdout.on('data', onData);
  proc.stderr.on('data', onData);

  proc.on('close', (code) => {
    console.log('cloudflared exited with code', code);
    setTimeout(startTunnel, 5000);
  });
}

startTunnel();
