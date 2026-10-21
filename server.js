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
    },
    spanishSupport: {
      id: 'SKILL-105',
      name: 'Bilingual / Spanish Inbound',
      callsWaiting: 6,
      avgWaitSeconds: 19,
      targetSla: 80,
      currentSla: 94.5,
      requiredAgents: 2,
      assignedAgents: 2,
      occupancyPct: 70,
      status: 'NORMAL'
    },
    collections: {
      id: 'SKILL-106',
      name: 'Outbound & Collections',
      callsWaiting: 12,
      avgWaitSeconds: 28,
      targetSla: 80,
      currentSla: 89.2,
      requiredAgents: 3,
      assignedAgents: 3,
      occupancyPct: 75,
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

// Centralized Shift Adherence Policy & Limits (Configured by Floor Supervisors)
const activeShiftPolicy = {
  maxTeaBreaks: 2,
  lunchVarianceThreshold: 10,
  frequencyWindow: '1_WEEK', // '1_WEEK' (7 days) or '2_WEEKS' (14 days)
  maxFrequencyRequests: 5,
  targetAdherence: 90,
  targetAcwSeconds: 45,
  botGraceSeconds: 10,
  lastUpdatedBy: 'SUP-014 (Sarah Jenkins)',
  updatedAt: new Date().toISOString()
};
 // agentId -> array of timestamps

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
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

  // API ROUTE: Get Shift Adherence Policy Limits
  if (pathname === '/api/policy' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(activeShiftPolicy));
    return;
  }

  // API ROUTE: Update Shift Adherence Policy Limits (Supervisor Deployed)
  if (pathname === '/api/policy' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        if (typeof payload.maxTeaBreaks === 'number') activeShiftPolicy.maxTeaBreaks = payload.maxTeaBreaks;
        if (typeof payload.lunchVarianceThreshold === 'number') activeShiftPolicy.lunchVarianceThreshold = payload.lunchVarianceThreshold;
        if (payload.frequencyWindow) activeShiftPolicy.frequencyWindow = payload.frequencyWindow;
        if (typeof payload.maxFrequencyRequests === 'number') activeShiftPolicy.maxFrequencyRequests = payload.maxFrequencyRequests;
        if (typeof payload.targetAdherence === 'number') activeShiftPolicy.targetAdherence = payload.targetAdherence;
        if (typeof payload.targetAcwSeconds === 'number') activeShiftPolicy.targetAcwSeconds = payload.targetAcwSeconds;
        if (typeof payload.botGraceSeconds === 'number') activeShiftPolicy.botGraceSeconds = payload.botGraceSeconds;
        if (payload.supervisorId) activeShiftPolicy.lastUpdatedBy = payload.supervisorId;
        activeShiftPolicy.updatedAt = new Date().toISOString();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, policy: activeShiftPolicy }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API ROUTE: Real-Time AI Copilot Query Engine (Live ACD, WFM, IT & Telephony Telemetry)
  if (pathname === '/api/copilot/query' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const responseData = evaluateCopilotQuery(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responseData));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
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
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  if (pathname === '/favicon.ico') {
    filePath = path.join(PUBLIC_DIR, 'favicon.ico');
  } else if (pathname === '/favicon.svg') {
    filePath = path.join(PUBLIC_DIR, 'favicon.svg');
  }

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

  // 1. Frequency Limiting (1-Week or 2-Week Policy Window)
  const now = Date.now();
  const windowDays = activeShiftPolicy.frequencyWindow === '2_WEEKS' ? 14 : 7;
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const maxReqAllowed = activeShiftPolicy.maxFrequencyRequests || (windowDays === 14 ? 10 : 5);

  let timestamps = agentRequestLog.get(agentId) || [];
  timestamps = timestamps.filter(t => (now - t) < windowMs);
  agentRequestLog.set(agentId, timestamps);

  if (timestamps.length >= maxReqAllowed || agent.forceRateLimit) {
    return {
      status: 'REJECTED',
      code: 'FREQ_LIMIT_EXCEEDED',
      checkBackLater: true,
      nextOpenInterval: 'Next Scheduling Interval (Weekly Window)',
      title: 'Auto-Rejected: Request Frequency Limit Exceeded',
      description: `WFM Policy Restriction: Agent has reached the threshold of ${timestamps.length} discretionary requests for the active ${windowDays}-day scheduling window (Policy limit: ${maxReqAllowed} requests / ${windowDays === 14 ? '2 weeks' : '1 week'}). Discretionary requests are throttled to ensure shift coverage stability.`,
      metrics: {
        'Policy Window': `${windowDays === 14 ? '2 Weeks (Bi-Weekly)' : '1 Week (Rolling)'}`,
        'Logged Requests': `${timestamps.length} / ${maxReqAllowed} allowed`,
        'Action Required': 'Wait for window reset or contact supervisor for exception code.'
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

// Real-Time Copilot Evaluation & Telemetry Synthesis
const AGENT_ROSTER_TELEMETRY = {
  'AGT-8842': { name: 'Alex Morgan', queue: 'Tier-2 Tech Support', adherence: '96.4%', teaBreaks: '1 / 2', lunchVariance: '0 mins', freq: '1 / 3', status: 'Healthy Adherence' },
  'AGT-4092': { name: 'Jordan Miller', queue: 'Customer Billing & Retention', adherence: '78.5%', teaBreaks: '4 / 2', lunchVariance: '0 mins', freq: '2 / 3', status: 'Tea Overage Policy Flag' },
  'AGT-9102': { name: 'Samantha Vance', queue: 'Customer Billing & Retention', adherence: '71.2%', teaBreaks: '1 / 2', lunchVariance: '+25 mins', freq: '1 / 3', status: 'Lunch Variance Escalation' },
  'AGT-7740': { name: 'David Chen', queue: 'General Customer Service', adherence: '68.0%', teaBreaks: '3 / 2', lunchVariance: '+18 mins', freq: '3 / 3', status: 'Throttled / Rate Limit Flag' },
  'AGT-6512': { name: 'Rachel Green', queue: 'Emergency Inbound', adherence: '98.1%', teaBreaks: '1 / 2', lunchVariance: '0 mins', freq: '1 / 3', status: 'Medical Exemption Active' },
  'AGT-8819': { name: 'Marcus Brody', queue: 'General Customer Service', adherence: '82.0%', teaBreaks: '2 / 2', lunchVariance: '+5 mins', freq: '1 / 3', status: 'Trainee Coaching Active' },
  'AGT-3310': { name: 'Chloe Bennett', queue: 'General Customer Service', adherence: '94.2%', teaBreaks: '1 / 2', lunchVariance: '0 mins', freq: '1 / 3', status: 'Senior Lead / Normal' },
  'AGT-5521': { name: 'Lucas Wright', queue: 'Customer Billing & Retention', adherence: '88.5%', teaBreaks: '2 / 2', lunchVariance: '+8 mins', freq: '2 / 3', status: 'Billing Specialist' },
  'AGT-7703': { name: 'Maya Patel', queue: 'General Customer Service', adherence: '97.0%', teaBreaks: '1 / 2', lunchVariance: '0 mins', freq: '1 / 3', status: 'VIP Lead 5.0★' },
  'AGT-4491': { name: 'Carlos Mendez', queue: 'Tier-2 Tech Support', adherence: '85.0%', teaBreaks: '2 / 2', lunchVariance: '+10 mins', freq: '1 / 3', status: 'Hardware Specialist' },
  'AGT-6628': { name: 'Olivia Taylor', queue: 'Emergency Inbound', adherence: '99.5%', teaBreaks: '0 / 2', lunchVariance: '0 mins', freq: '1 / 3', status: 'Disaster Lead 99%' },
  'AGT-2219': { name: 'Liam O\'Connor', queue: 'General Customer Service', adherence: '76.5%', teaBreaks: '2 / 2', lunchVariance: '+12 mins', freq: '1 / 3', status: 'Care Trainee / Coaching' }
};

function evaluateCopilotQuery(payload) {
  const query = (payload.query || '').trim();
  const qLower = query.toLowerCase();
  const agentId = payload.agentId || 'AGT-8842';
  const role = payload.role || 'agent';
  const agent = AGENT_ROSTER_TELEMETRY[agentId] || AGENT_ROSTER_TELEMETRY['AGT-8842'];

  const billingQ = wfmQueueBalanceState.queues.billing;
  const csQ = wfmQueueBalanceState.queues.customerService;
  const techQ = wfmQueueBalanceState.queues.techSupport;
  const emergQ = wfmQueueBalanceState.queues.emergency;
  const isSurge = wfmQueueBalanceState.isSurgeActive;
  const isRebalanced = wfmQueueBalanceState.isRebalanced;

  // 1. ACD Queue Volume, Wait Times & Traffic Queries
  if (qLower.includes('volume') || qLower.includes('queue') || qLower.includes('calls waiting') || qLower.includes('billing calls') || qLower.includes('traffic') || qLower.includes('wait time') || qLower.includes('how many calls') || qLower.includes('surge')) {
    let text = `📊 <strong>Real-Time ACD Queue Telemetry:</strong><br/>` +
      `• <strong>Billing & Payments</strong>: <strong>${billingQ.callsWaiting} calls waiting</strong> | Avg Wait: <strong>${billingQ.avgWaitSeconds}s</strong> | SLA: <strong>${billingQ.currentSla}%</strong> (${billingQ.status})<br/>` +
      `• <strong>General Customer Service</strong>: <strong>${csQ.callsWaiting} calls waiting</strong> | Avg Wait: <strong>${csQ.avgWaitSeconds}s</strong> | SLA: <strong>${csQ.currentSla}%</strong> (${csQ.status})<br/>` +
      `• <strong>Tier-2 Tech Support</strong>: <strong>${techQ.callsWaiting} calls waiting</strong> | Avg Wait: <strong>${techQ.avgWaitSeconds}s</strong> | SLA: <strong>${techQ.currentSla}%</strong><br/>` +
      `• <strong>Emergency Inbound</strong>: <strong>${emergQ.callsWaiting} calls waiting</strong> | Avg Wait: <strong>${emergQ.avgWaitSeconds}s</strong><br/>` +
      `<small style="color:#94a3b8; display:block; margin-top:6px;">Current Total Traffic Rate: <strong>${ivrDeflectionState.callVolumeRatePerMin} calls/min</strong>. ${isRebalanced ? '🔄 Dynamic WFM Skill Rebalance Active (3 CS agents flexed to Billing).' : (isSurge ? '⚠️ High Call Volume Surge Active.' : '✓ Queues within nominal limits.')}</small>`;
    return { success: true, answer: text, category: 'queue_volume' };
  }

  // 2. Schedule Adherence & Breaks
  if (qLower.includes('adherence') || qLower.includes('tea break') || qLower.includes('my break') || qLower.includes('lunch') || qLower.includes('can i take') || qLower.includes('breaks left') || qLower.includes('quota') || qLower.includes('policy')) {
    let advice = '✓ Your adherence and break history are in good standing.';
    if (parseInt(agent.teaBreaks.split('/')[0]) > activeShiftPolicy.maxTeaBreaks) {
      advice = `⚠️ Behavioral Flag: You have logged ${agent.teaBreaks.split('/')[0]} tea breaks today (Shift limit set by supervisor: ${activeShiftPolicy.maxTeaBreaks}). Next requests require supervisor override.`;
    } else if (agent.lunchVariance.includes('+') && parseInt(agent.lunchVariance.replace(/[^0-9]/g, '')) > activeShiftPolicy.lunchVarianceThreshold) {
      advice = `⚠️ Chronic Lunch Overage: Previous shift logged ${agent.lunchVariance} variance (Supervisor threshold: <${activeShiftPolicy.lunchVarianceThreshold}m). Break grants require supervisor review.`;
    }

    const windowLabel = activeShiftPolicy.frequencyWindow === '2_WEEKS' ? '2 Weeks (Bi-Weekly)' : '1 Week (Rolling)';

    let text = `⏱️ <strong>Live Adherence & Schedule Parameters (${agent.name}):</strong><br/>` +
      `• <strong>CXone Adherence</strong>: <strong style="color:${parseFloat(agent.adherence) >= activeShiftPolicy.targetAdherence ? '#34d399' : '#f87171'};">${agent.adherence}</strong> (Supervisor Target: &ge; ${activeShiftPolicy.targetAdherence}%)<br/>` +
      `• <strong>Tea Breaks Taken</strong>: <strong>${agent.teaBreaks.split('/')[0]} / ${activeShiftPolicy.maxTeaBreaks}</strong> (Policy Limit: Max ${activeShiftPolicy.maxTeaBreaks}/shift)<br/>` +
      `• <strong>Lunch Variance</strong>: <strong>${agent.lunchVariance}</strong> (Allowed Tolerance: &lt;${activeShiftPolicy.lunchVarianceThreshold}m)<br/>` +
      `• <strong>Request Frequency Limit</strong>: <strong>${agent.freq.split('/')[0]} / ${activeShiftPolicy.maxFrequencyRequests}</strong> requests per ${windowLabel}<br/>` +
      `<small style="color:#94a3b8; display:block; margin-top:4px;">*Shift policy limits administered in real-time by Floor Supervisor (${activeShiftPolicy.lastUpdatedBy}).</small>` +
      `<p style="margin-top:6px; font-size:11px; color:#cbd5e1;">${advice}</p>`;
    return { success: true, answer: text, category: 'adherence_telemetry' };
  }

  // 3. Storm & IVR Deflection Rate
  if (qLower.includes('storm') || qLower.includes('weather') || qLower.includes('tornado') || qLower.includes('outage') || qLower.includes('deflection') || qLower.includes('1000') || qLower.includes('announcement') || qLower.includes('field workers')) {
    const isAct = ivrDeflectionState.isDeflectionActive;
    let text = `🌪️ <strong>Real-Time Storm & Outage Deflection Telemetry:</strong><br/>` +
      `• <strong>Live Inbound Rate</strong>: <strong>${ivrDeflectionState.callVolumeRatePerMin} calls/min</strong> (Safety Ceiling: ${ivrDeflectionState.thresholdLimitPerMin}/min)<br/>` +
      `• <strong>Deflection Status</strong>: <strong style="color:${isAct ? '#f87171' : '#34d399'};">${isAct ? '🚨 ACTIVE (Automated Deflection Running)' : '● STANDBY (Volume below 1,000/min)'}</strong><br/>` +
      `• <strong>Deflected Inquiries</strong>: <strong>${ivrDeflectionState.deflectedCallsCount} calls</strong> routed to field outage message.<br/>` +
      `• <strong>Caller IVR Message</strong>: <em>"${ivrDeflectionState.announcementText}"</em>`;
    return { success: true, answer: text, category: 'storm_deflection' };
  }

  // 4. WFM Dynamic Skill Rebalance & Flex
  if (qLower.includes('rebalance') || qLower.includes('flex') || qLower.includes('cross-skill') || qLower.includes('cross skill') || qLower.includes('why was i') || qLower.includes('schedule flex') || qLower.includes('flexed')) {
    let text = `🔄 <strong>Dynamic WFM Intraday Skill Rebalance:</strong><br/>` +
      `• <strong>Billing Queue Surge</strong>: ${billingQ.callsWaiting} calls waiting (${billingQ.occupancyPct}% occupancy)<br/>` +
      `• <strong>Customer Service Surplus</strong>: ${csQ.callsWaiting} calls waiting (${csQ.occupancyPct}% occupancy)<br/>` +
      `• <strong>WFM Flex Status</strong>: <strong style="color:${isRebalanced ? '#38bdf8' : '#f59e0b'};">${isRebalanced ? '✓ Active: 3 CS Agents Flexed to Billing' : 'Standby / Surge Monitoring'}</strong><br/>` +
      `<small style="color:#94a3b8; display:block; margin-top:4px;">When Billing call arrival surges while General CS agents are idle, WFM automatically cross-skills CS agents to Billing to maintain SLA above 80% without overtime.</small>`;
    return { success: true, answer: text, category: 'wfm_rebalance' };
  }

  // 5. IT System Incidents (AUX-5)
  if (qLower.includes('it') || qLower.includes('ticket') || qLower.includes('vpn') || qLower.includes('citrix') || qLower.includes('vdi') || qLower.includes('system issue') || qLower.includes('incident') || qLower.includes('technical issue') || qLower.includes('aux-5')) {
    let ticketList = itIncidents.slice(0, 3).map(t => `• <strong>${t.id} [${t.status}]</strong>: ${t.agentName} - ${t.category} (${t.severity})`).join('<br/>');
    let text = `💻 <strong>Active IT System Issue Incidents (${itIncidents.length} logged):</strong><br/>` +
      ticketList + `<br/>` +
      `<small style="color:#94a3b8; display:block; margin-top:6px;">If experiencing VPN/Citrix drops, switch to AUX-5 System Issue in the Break Portal to auto-dispatch an IT ticket.</small>`;
    return { success: true, answer: text, category: 'it_incidents' };
  }

  // 6. Supervisors On Duty & Floor Leadership
  if (qLower.includes('supervisor') || qLower.includes('floor') || qLower.includes('leadership') || qLower.includes('on duty') || qLower.includes('sarah') || qLower.includes('who is')) {
    let text = `🛡️ <strong>Floor Leadership & Shift Roster:</strong><br/>` +
      `• <strong>Lead WFM Supervisor on Duty</strong>: SUP-014 Sarah Jenkins (Floor Ops Lead)<br/>` +
      `• <strong>Floor Roster</strong>: 24 active agents logged in (12 personas active)<br/>` +
      `• <strong>Current Distribution</strong>: ~14 In-Call, ~6 Available, ~4 AUX Break<br/>` +
      `• <strong>Support Channels</strong>: Private 1-on-1 Supervisor Coach or floor broadcast.`;
    return { success: true, answer: text, category: 'supervisor_info' };
  }

  // 7. Active Call, ACW & Disposition
  if (qLower.includes('acw') || qLower.includes('summary') || qLower.includes('disposition') || qLower.includes('call') || qLower.includes('wrap') || qLower.includes('survey') || qLower.includes('rating') || qLower.includes('ivr')) {
    let text = `✨ <strong>Live Interaction & ACW Intelligence:</strong><br/>` +
      `• <strong>Active Call</strong>: Contact #90421 (Skill: Customer Billing & Retention)<br/>` +
      `• <strong>Security PIN</strong>: Verified ✓<br/>` +
      `• <strong>Customer Speech Sentiment</strong>: Empathetic / Constructive<br/>` +
      `• <strong>Post-Call IVR Rating</strong>: ★★★★★ 5.0 / 5.0<br/>` +
      `• <strong>Recommended Disposition</strong>: <code>RESOLVED_BILLING_CREDIT</code><br/>` +
      `When the call concludes, click 'Generate AI Call Summary' to insert enriched notes into CRM.`;
    return { success: true, answer: text, category: 'call_acw' };
  }

  // 8. General Telemetry Briefing (Default)
  let text = `🤖 <strong>NICE CXone Telemetry Briefing:</strong><br/>` +
    `Telephony switch is healthy. ACD inbound rate is <strong>${ivrDeflectionState.callVolumeRatePerMin} calls/min</strong>. ` +
    `Your adherence is <strong>${agent.adherence}</strong>. Billing queue has <strong>${billingQ.callsWaiting} calls waiting</strong> (SLA ${billingQ.currentSla}%). ` +
    `Ask me about <em>queue volume</em>, <em>my adherence</em>, <em>storm deflection rate</em>, <em>WFM skill flex</em>, or <em>open IT tickets</em>!`;
  return { success: true, answer: text, category: 'general_brief' };
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

