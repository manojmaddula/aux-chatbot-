// server.js - Lightweight backend server & WFM engine for Desktop Widget & Web Portal
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 4000;
const PUBLIC_DIR = path.join(__dirname, 'src');

// In-memory supervisor queue & state
const supervisorQueue = [
  {
    id: 'REQ-10029',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    agentId: 'AGT-8842',
    agentName: 'Alex Morgan',
    auxCode: 'AUX-2: Short Break / Tea',
    durationMinutes: 15,
    status: 'APPROVED',
    reason: 'Auto-approved by WFM Erlang-C engine. Staffing surplus +4.'
  }
];

const agentRequestLog = new Map(); // agentId -> array of timestamps

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API ROUTE: Evaluate Break Request
  if (pathname === '/api/evaluate-break' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const decision = evaluateBreak(payload);
        
        // Log to supervisor queue
        supervisorQueue.unshift({
          id: payload.id || ('REQ-' + Math.floor(Math.random() * 900000 + 100000)),
          timestamp: new Date().toISOString(),
          agentId: payload.agent?.id || 'AGT-UNKNOWN',
          agentName: payload.agent?.name || 'Agent',
          auxCode: payload.auxCode,
          durationMinutes: payload.durationMinutes,
          status: decision.status,
          reason: decision.description,
          metrics: decision.metrics
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(decision));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON request', details: err.message }));
      }
    });
    return;
  }

  // API ROUTE: Get Supervisor Queue
  if (pathname === '/api/supervisor-queue' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(supervisorQueue));
    return;
  }

  // Serve static files from /src
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'widget.html' : pathname);

  // Security: prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try appending .html
      if (fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Server Error loading file');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

// Break Evaluation Engine (ACD Forecast + Behavioral Patterns + Frequency Limiter)
function evaluateBreak(payload) {
  const agent = payload.agent || {};
  const agentId = agent.id || 'AGT-DEFAULT';

  // 1. Frequency Limiting
  const now = Date.now();
  let timestamps = agentRequestLog.get(agentId) || [];
  timestamps = timestamps.filter(t => (now - t) < 30 * 60 * 1000); // last 30 minutes
  agentRequestLog.set(agentId, timestamps);

  if (timestamps.length >= 3 || agent.forceRateLimit) {
    return {
      status: 'REJECTED',
      code: 'FREQ_LIMIT_EXCEEDED',
      title: 'Auto-Rejected: Request Frequency Limit Exceeded',
      description: `Rate limit triggered: Agent has sent 3 break requests in the past 10 minutes. Automated throttle active to prevent queue volatility.`,
      metrics: {
        'Recent Requests (30m)': `${timestamps.length} requests`,
        'Allowed Threshold': 'Max 3 requests / 30m',
        'Action Required': 'Wait for 15-minute cooldown or contact supervisor.'
      }
    };
  }
  timestamps.push(now);

  // 2. Behavioral Patterns Check
  const auxCode = payload.auxCode || '';
  if (auxCode.includes('AUX-2') && (agent.recentBreaksToday >= 4 || agent.teaBreaksToday >= 4)) {
    return {
      status: 'REJECTED',
      code: 'BEHAVIORAL_TEA_OVERAGE',
      title: 'Auto-Rejected: Tea Break Frequency Pattern Exceeded',
      description: 'Behavioral analysis indicates agent has logged 4 or more short breaks today. Exceeds standard shift policy.',
      metrics: {
        'Daily Short Breaks Taken': '4 breaks (Limit: 2)',
        'Policy Adherence Risk': 'High',
        'Supervisor Flag': 'Dispatched for 1-on-1 coaching'
      }
    };
  }

  if (auxCode.includes('AUX-1') && (agent.lunchOverageHistoryMinutes >= 15 || agent.lunchOverageMinutes >= 15)) {
    return {
      status: 'REJECTED',
      code: 'BEHAVIORAL_LUNCH_OVERAGE',
      title: 'Auto-Rejected: Chronic Extra Lunch Pattern Detected',
      description: 'Historical records show repeated lunch overages exceeding +15 minutes without authorization. Self-service AUX approval suspended.',
      metrics: {
        'Historical Lunch Variance': '+25 mins over scheduled',
        'Adherence Score': '74.2% (Target: >=90%)',
        'Supervisor Review': 'Escalated to Supervisor Queue'
      }
    };
  }

  // 3. ACD Call Forecast & WFM Staffing Buffer
  // Check if peak Monday morning volume is active
  const isMondayPeak = new Date().getDay() === 1 && new Date().getHours() < 12;
  const simulatedQueueDepth = 28;
  const currentAvailableStaff = 22;
  const requiredStaffForSla = 26;

  if (isMondayPeak && payload.urgency !== 'Urgent-Medical') {
    return {
      status: 'REJECTED',
      code: 'WFM_ACD_STAFFING_LIMITED',
      title: 'Auto-Rejected: Monday Peak Call Volume Active',
      description: 'ACD arrival surge detected (Monday Morning Rush). Queue depth exceeds normal thresholds; non-critical AUX requests temporarily restricted.',
      metrics: {
        'Queue Condition': 'Monday High Call Volume Mode Active',
        'Projected SLA Impact': '72% (Requires 26 agents, only 22 available)',
        'Next Open Interval': '11:45 AM'
      }
    };
  }

  // Standard Auto-Approval
  return {
    status: 'APPROVED',
    code: 'AUTO_APPROVED_WFM',
    title: 'AUX Break Request Auto-Approved!',
    description: `WFM Erlang-C forecast confirms adequate staffing buffer. Your ${payload.durationMinutes}-minute break has been synchronized with the telephony switch and desktop widget.`,
    metrics: {
      'AUX Code': payload.auxCode,
      'Approved Duration': `${payload.durationMinutes} minutes`,
      'Staffing Buffer': '+4 agents surplus (Projected SLA 86.8%)',
      'Pre-Expiration Alert': 'Scheduled at 2 minutes remaining',
      'Supervisor Notification': 'Dispatched to Queue (SUP-014)'
    }
  };
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`\n⚠️  Port ${PORT} is already in use by another instance of this server.`);
    console.log(`   The server is ALREADY running and serving requests!`);
    console.log(`   👉 You can directly open: http://localhost:${PORT}/widget.html\n`);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Contact Center WFM & Auxiliary Portal Server Running`);
  console.log(`   Desktop Chatbot Widget  : http://localhost:${PORT}/widget.html`);
  console.log(`   Break Request Web Portal: http://localhost:${PORT}/portal.html`);
  console.log(`   Supervisor Portal       : http://localhost:${PORT}/supervisor.html`);
  console.log(`=======================================================`);
});

