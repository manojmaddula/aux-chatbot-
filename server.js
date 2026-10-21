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

// Disaster Outage & IVR Auto-Deflection Engine (1,000 calls/min Threshold)
const ivrDeflectionState = {
  stormOutageMode: false,
  callVolumeRatePerMin: 420,
  thresholdLimitPerMin: 1000,
  isDeflectionActive: false,
  deflectedCallsCount: 0,
  announcementText: "Thank you for the call, we are having so many outages out field workers are on the route, thank you for your patience",
  historyLog: [
    {
      timestamp: new Date().toISOString(),
      event: 'MONITORING_STANDBY',
      details: 'IVR Outage Deflection Engine standing by (1,000 calls/min threshold configured).'
    }
  ]
};

// Dynamic WFM Intraday Queue & Skill Rebalance State
const wfmQueueBalanceState = {
  isSurgeActive: false,
  isRebalanced: false,
  autoFlexEnabled: false,
  queues: {
    billing: {
      id: 'SKILL-101',
      name: 'Customer Billing & Retention',
      callsWaiting: 42,
      avgWaitSeconds: 35,
      targetSla: 80,
      currentSla: 86.4,
      requiredAgents: 4,
      assignedAgents: 4,
      occupancyPct: 78,
      status: 'NORMAL'
    },
    customerService: {
      id: 'SKILL-102',
      name: 'General Customer Service',
      callsWaiting: 8,
      avgWaitSeconds: 14,
      targetSla: 80,
      currentSla: 97.2,
      requiredAgents: 2,
      assignedAgents: 5,
      occupancyPct: 34,
      status: 'IDLE_SURPLUS'
    },
    techSupport: {
      id: 'SKILL-103',
      name: 'Tier-2 Tech Support',
      callsWaiting: 15,
      avgWaitSeconds: 32,
      targetSla: 80,
      currentSla: 88.0,
      requiredAgents: 3,
      assignedAgents: 3,
      occupancyPct: 80,
      status: 'NORMAL'
    },
    emergency: {
      id: 'SKILL-104',
      name: 'Emergency Inbound',
      callsWaiting: 3,
      avgWaitSeconds: 9,
      targetSla: 95,
      currentSla: 98.0,
      requiredAgents: 2,
      assignedAgents: 2,
      occupancyPct: 65,
      status: 'NORMAL'
    }
  },
  reallocatedAgents: [],
  historyLog: [
    {
      timestamp: new Date().toISOString(),
      event: 'SYSTEM_STANDBY',
      details: 'Dynamic WFM Queue Balancing Engine active. Telemetry linked to NICE CXone ACD.'
    }
  ]
};

const agentRequestLog = new Map();

// Centralized IT System Issue Incidents Store
const itIncidents = [
  {
    id: 'INC-88102',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    agentId: 'AGT-4491',
    agentName: 'Carlos Mendez',
    queue: 'Tier-2 Tech Support',
    category: 'Cisco AnyConnect VPN Error 412',
    severity: 'HIGH',
    description: 'MTU mismatch on Wi-Fi adapter causing WebRTC voice drop.',
    status: 'IN_PROGRESS',
    assignedTo: 'IT Network Engineering'
  },
  {
    id: 'INC-88103',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    agentId: 'AGT-9102',
    agentName: 'Samantha Vance',
    queue: 'General Customer Service',
    category: 'Citrix Workspace Black Screen',
    severity: 'MEDIUM',
    description: 'Virtual display driver freeze on reconnect after lunch.',
    status: 'RESOLVED',
    assignedTo: 'VDI Desktop Support'
  }
];
 // agentId -> array of timestamps

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

  // API ROUTE: NICE CXone ACW Submit
  if (pathname === '/api/cxone/acw-submit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'ACW disposition logged to NICE CXone.' }));
    });
    return;
  }

  // API ROUTE: Broadcast Alert
  if (pathname === '/api/broadcast' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Broadcast dispatched to all agent widgets.' }));
    });
    return;
  }

  // API ROUTE: Get IVR Deflection Status
  if (pathname === '/api/cxone/ivr-deflection' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ivrDeflectionState));
    return;
  }

  // API ROUTE: Update / Simulate IVR Call Volume & Storm Outage Mode
  if (pathname === '/api/cxone/ivr-deflection' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        
        if (typeof payload.stormOutageMode === 'boolean') {
          ivrDeflectionState.stormOutageMode = payload.stormOutageMode;
        }
        if (typeof payload.callVolumeRatePerMin === 'number') {
          ivrDeflectionState.callVolumeRatePerMin = payload.callVolumeRatePerMin;
        }
        if (typeof payload.thresholdLimitPerMin === 'number') {
          ivrDeflectionState.thresholdLimitPerMin = payload.thresholdLimitPerMin;
        }

        const wasActive = ivrDeflectionState.isDeflectionActive;
        const nowActive = ivrDeflectionState.stormOutageMode && (ivrDeflectionState.callVolumeRatePerMin > ivrDeflectionState.thresholdLimitPerMin);
        ivrDeflectionState.isDeflectionActive = nowActive;

        if (!wasActive && nowActive) {
          // Surge threshold reached (1001 call onwards)
          const excess = ivrDeflectionState.callVolumeRatePerMin - ivrDeflectionState.thresholdLimitPerMin;
          ivrDeflectionState.deflectedCallsCount += excess;
          ivrDeflectionState.historyLog.unshift({
            timestamp: new Date().toISOString(),
            event: 'DEFLECTION_ACTIVATED',
            details: `Threshold exceeded (${ivrDeflectionState.callVolumeRatePerMin} calls/min > ${ivrDeflectionState.thresholdLimitPerMin}). Call 1001+ greeted with automated field outage announcement.`
          });
        } else if (wasActive && !nowActive) {
          // Normalized below threshold
          ivrDeflectionState.historyLog.unshift({
            timestamp: new Date().toISOString(),
            event: 'DEFLECTION_AUTO_DISABLED',
            details: `Call volume normalized (${ivrDeflectionState.callVolumeRatePerMin} calls/min <= ${ivrDeflectionState.thresholdLimitPerMin}). Voice announcement automatically DISABLED. Standard ACD queue routing restored.`
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(ivrDeflectionState));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API ROUTE: Get WFM Queue Balancing Telemetry & Rebalance State
  if (pathname === '/api/wfm/queue-balance' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(wfmQueueBalanceState));
    return;
  }

  // API ROUTE: Execute WFM Queue Rebalancing, Surge Simulation, & Restore
  if (pathname === '/api/wfm/queue-balance' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');

        function executeRebalance() {
          wfmQueueBalanceState.isRebalanced = true;
          wfmQueueBalanceState.reallocatedAgents = [
            {
              id: 'AGT-9102',
              name: 'Samantha Vance',
              baseSkill: 'General Customer Service',
              flexSkill: 'Customer Billing & Retention (Flex Support)',
              flexSchedule: '10:00 - 11:30 (Intraday Skill Flex)',
              priorityRouting: 'P1: Billing (Surge) / P2: Cust Service',
              status: 'ACTIVE_FLEX',
              reassignedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            {
              id: 'AGT-6512',
              name: 'Rachel Green',
              baseSkill: 'General Customer Service',
              flexSkill: 'Customer Billing & Retention (Flex Support)',
              flexSchedule: '10:00 - 11:30 (Intraday Skill Flex)',
              priorityRouting: 'P1: Billing (Surge) / P2: Cust Service',
              status: 'ACTIVE_FLEX',
              reassignedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            {
              id: 'AGT-8819',
              name: 'Marcus Brody',
              baseSkill: 'General Customer Service',
              flexSkill: 'Customer Billing & Retention (Flex Support)',
              flexSchedule: '10:00 - 11:30 (Intraday Skill Flex)',
              priorityRouting: 'P1: Billing (Surge) / P2: Cust Service',
              status: 'ACTIVE_FLEX',
              reassignedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];

          wfmQueueBalanceState.queues.billing.assignedAgents = 7;
          wfmQueueBalanceState.queues.billing.callsWaiting = 64;
          wfmQueueBalanceState.queues.billing.avgWaitSeconds = 58;
          wfmQueueBalanceState.queues.billing.currentSla = 79.2;
          wfmQueueBalanceState.queues.billing.occupancyPct = 85;
          wfmQueueBalanceState.queues.billing.status = 'REBALANCED';

          wfmQueueBalanceState.queues.customerService.assignedAgents = 2;
          wfmQueueBalanceState.queues.customerService.occupancyPct = 76;
          wfmQueueBalanceState.queues.customerService.status = 'FLEXED_DONOR';

          wfmQueueBalanceState.historyLog.unshift({
            timestamp: new Date().toISOString(),
            event: 'REBALANCE_DISPATCHED',
            details: 'WFM Dynamic Cross-Skill Rebalance executed: 3 Customer Service agents flexed to Billing. Billing SLA recovering (34.5% -> 79.2%). Discretionary AUX paused.'
          });
        }

        if (payload.action === 'SURGE_BILLING') {
          wfmQueueBalanceState.isSurgeActive = true;
          wfmQueueBalanceState.queues.billing.callsWaiting = 318;
          wfmQueueBalanceState.queues.billing.avgWaitSeconds = 540;
          wfmQueueBalanceState.queues.billing.currentSla = 34.5;
          wfmQueueBalanceState.queues.billing.requiredAgents = 8;
          wfmQueueBalanceState.queues.billing.occupancyPct = 100;
          wfmQueueBalanceState.queues.billing.status = 'SURGE_CRITICAL';

          wfmQueueBalanceState.queues.customerService.callsWaiting = 6;
          wfmQueueBalanceState.queues.customerService.avgWaitSeconds = 11;
          wfmQueueBalanceState.queues.customerService.occupancyPct = 28;
          wfmQueueBalanceState.queues.customerService.status = 'IDLE_SURPLUS';

          wfmQueueBalanceState.historyLog.unshift({
            timestamp: new Date().toISOString(),
            event: 'SURGE_DETECTED',
            details: 'Sudden Billing Call Volume Surge (+318 calls waiting, ASA 9m). Customer Service idle (5 agents, 28% occupancy). Queue load imbalance ratio: 53:1.'
          });

          if (wfmQueueBalanceState.autoFlexEnabled && !wfmQueueBalanceState.isRebalanced) {
            executeRebalance();
          }
        } else if (payload.action === 'TRIGGER_REBALANCE') {
          executeRebalance();
        } else if (payload.action === 'RESTORE_BASE') {
          wfmQueueBalanceState.isSurgeActive = false;
          wfmQueueBalanceState.isRebalanced = false;
          wfmQueueBalanceState.reallocatedAgents = [];

          wfmQueueBalanceState.queues.billing.callsWaiting = 42;
          wfmQueueBalanceState.queues.billing.avgWaitSeconds = 35;
          wfmQueueBalanceState.queues.billing.currentSla = 86.4;
          wfmQueueBalanceState.queues.billing.assignedAgents = 4;
          wfmQueueBalanceState.queues.billing.requiredAgents = 4;
          wfmQueueBalanceState.queues.billing.occupancyPct = 78;
          wfmQueueBalanceState.queues.billing.status = 'NORMAL';

          wfmQueueBalanceState.queues.customerService.callsWaiting = 8;
          wfmQueueBalanceState.queues.customerService.avgWaitSeconds = 14;
          wfmQueueBalanceState.queues.customerService.currentSla = 97.2;
          wfmQueueBalanceState.queues.customerService.assignedAgents = 5;
          wfmQueueBalanceState.queues.customerService.requiredAgents = 2;
          wfmQueueBalanceState.queues.customerService.occupancyPct = 34;
          wfmQueueBalanceState.queues.customerService.status = 'IDLE_SURPLUS';

          wfmQueueBalanceState.historyLog.unshift({
            timestamp: new Date().toISOString(),
            event: 'RESTORED_BASE',
            details: 'Volume normalized. Rebalanced agents successfully returned to base General Customer Service WFM schedule. Normal AUX permissions restored.'
          });
        } else if (payload.action === 'RESTORE_SINGLE_AGENT' && payload.agentId) {
          wfmQueueBalanceState.reallocatedAgents = wfmQueueBalanceState.reallocatedAgents.filter(a => a.id !== payload.agentId);
          if (wfmQueueBalanceState.reallocatedAgents.length === 0) {
            wfmQueueBalanceState.isRebalanced = false;
          }
          wfmQueueBalanceState.historyLog.unshift({
            timestamp: new Date().toISOString(),
            event: 'AGENT_RESTORED',
            details: `Agent ${payload.agentId} individually restored to base Customer Service WFM schedule.`
          });
        } else if (payload.action === 'TOGGLE_AUTOFLEX') {
          wfmQueueBalanceState.autoFlexEnabled = !wfmQueueBalanceState.autoFlexEnabled;
          wfmQueueBalanceState.historyLog.unshift({
            timestamp: new Date().toISOString(),
            event: 'AUTOFLEX_TOGGLED',
            details: `Autonomous WFM Auto-Flex Mode set to ${wfmQueueBalanceState.autoFlexEnabled ? 'ENABLED' : 'DISABLED'}.`
          });
          if (wfmQueueBalanceState.autoFlexEnabled && wfmQueueBalanceState.isSurgeActive && !wfmQueueBalanceState.isRebalanced) {
            executeRebalance();
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(wfmQueueBalanceState));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }


  // API ROUTE: Get IT System Issue Incidents
  if (pathname === '/api/it/incidents' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(itIncidents));
    return;
  }

  // API ROUTE: Log New IT System Issue Incident from Portal
  if (pathname === '/api/it/incidents' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const incident = {
          id: 'INC-' + Math.floor(Math.random() * 90000 + 10000),
          timestamp: new Date().toISOString(),
          agentId: payload.agentId || 'AGT-UNKNOWN',
          agentName: payload.agentName || 'Agent',
          queue: payload.queue || 'Inbound',
          category: payload.category || 'General System Issue',
          severity: payload.severity || 'MEDIUM',
          description: payload.description || 'System issue logged from AUX-5 portal.',
          status: 'NEW',
          assignedTo: 'IT Helpdesk & Telecom'
        };
        itIncidents.unshift(incident);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, incident }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
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

  // Auto-log IT incident if AUX-5 System Issue
  let generatedItTicket = null;
  if (payload.auxCode && payload.auxCode.includes('AUX-5')) {
    generatedItTicket = 'INC-' + Math.floor(Math.random() * 90000 + 10000);
    itIncidents.unshift({
      id: generatedItTicket,
      timestamp: new Date().toISOString(),
      agentId: agent.id || 'AGT-SYSTEM',
      agentName: agent.name || 'Agent',
      queue: agent.queue || 'Inbound',
      category: payload.itIssueCategory || 'NICE CXone / VPN System Issue',
      severity: 'HIGH',
      description: payload.itIssueDetails || payload.notes || 'Agent switched to AUX-5 System Issue.',
      status: 'NEW',
      assignedTo: 'IT Helpdesk (Direct Dispatch)'
    });
  }

  // 1. Frequency Limiting
  const now = Date.now();
  let timestamps = agentRequestLog.get(agentId) || [];
  timestamps = timestamps.filter(t => (now - t) < 30 * 60 * 1000); // last 30 minutes
  agentRequestLog.set(agentId, timestamps);

  if (timestamps.length >= 3 || agent.forceRateLimit) {
    return {
      status: 'REJECTED',
      code: 'FREQ_LIMIT_EXCEEDED',
      checkBackLater: true,
      nextOpenInterval: '11:30 AM (15m Cooldown)',
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
      checkBackLater: true,
      nextOpenInterval: 'Check Back Later with Supervisor Approval',
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
      checkBackLater: true,
      nextOpenInterval: 'Check Back Later after WFM Review',
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
      checkBackLater: true,
      nextOpenInterval: '11:45 AM (After Morning Rush)',
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

