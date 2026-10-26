// server.js - Lightweight backend server & WFM engine for Desktop Widget & Web Portal
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');
const httpsClient = require('https');
function relayToCloud(path, payload) {
  if (process.env.RENDER) return; // Do not relay if already on cloud
  try {
    const data = JSON.stringify(payload);
    const req = httpsClient.request({
      hostname: 'aux-chatbot.onrender.com',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'X-Relayed-From': 'localhost'
      }
    });
    req.on('error', () => {});
    req.write(data);
    req.end();
  } catch (e) {}
}


function getLocalNetworkIp() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (e) {}
  return 'localhost';
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const PUBLIC_DIR = path.join(__dirname, 'src');

// Agent to Supervisor Mapping (Team Tagging)
const AGENT_SUPERVISOR_MAP = {
  'AGT-9102': { supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins' },
  'AGT-6512': { supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins' },
  'AGT-8819': { supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins' },
  'AGT-3310': { supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins' },

  'AGT-4092': { supervisorId: 'SUP-021', supervisorName: 'Michael Chang' },
  'AGT-5521': { supervisorId: 'SUP-021', supervisorName: 'Michael Chang' },
  'AGT-7703': { supervisorId: 'SUP-021', supervisorName: 'Michael Chang' },

  'AGT-8842': { supervisorId: 'SUP-035', supervisorName: 'Elena Rostova' },
  'AGT-4491': { supervisorId: 'SUP-035', supervisorName: 'Elena Rostova' },

  'AGT-7740': { supervisorId: 'SUP-042', supervisorName: 'David Sterling' },
  'AGT-6628': { supervisorId: 'SUP-042', supervisorName: 'David Sterling' },

  'AGT-2219': { supervisorId: 'SUP-059', supervisorName: 'Priya Sharma' }
};


// ==========================================
// BREAK OVERDUE CALLING & DEVICE ALERTS STATE
// ==========================================
const agentAlertPreferences = {
  'AGT-8842': {
    agentId: 'AGT-8842',
    agentName: 'Alex Morgan',
    device: 'mobile', // 'laptop' | 'mobile' | 'both'
    thresholdMins: 0, // Variance threshold over break applied duration
    soundStyle: 'phone_ring', // 'phone_ring' | 'siren' | 'voice'
    mobilePhone: '+1 (555) 019-8842',
    updatedAt: new Date().toISOString()
  },
  'AGT-9102': {
    agentId: 'AGT-9102',
    agentName: 'Samantha Vance',
    device: 'mobile',
    thresholdMins: 0,
    soundStyle: 'phone_ring',
    mobilePhone: '+1 (555) 019-9102',
    updatedAt: new Date().toISOString()
  },
  'AGT-4491': {
    agentId: 'AGT-4491',
    agentName: 'Carlos Mendez',
    device: 'mobile',
    thresholdMins: 1,
    soundStyle: 'siren',
    mobilePhone: '+1 (555) 019-4491',
    updatedAt: new Date().toISOString()
  }
};

const activeBreakAlarms = {};
const activeAgentBreaks = {};
const activeTrainingAssignments = {};
const sseAlertClients = [];

function broadcastAlertEvent(eventType, payload) {
  const eventMsg = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (let i = sseAlertClients.length - 1; i >= 0; i--) {
    try {
      sseAlertClients[i].write(eventMsg);
    } catch (e) {
      sseAlertClients.splice(i, 1);
    }
  }
}

// In-memory supervisor queue & state
const supervisorQueue = [
  {
    id: 'REQ-10029',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    agentId: 'AGT-8842',
    agentName: 'Alex Morgan',
    auxCode: 'AUX-2: Short Break / AUX',
    durationMinutes: 15,
    status: 'APPROVED',
    reason: 'Auto-approved by WFM Erlang-C engine. Staffing surplus +4.'
  }
];


// ==========================================
// BIRTHDAY CALENDAR ROSTER (ALL AGENTS & SUPERVISORS)
// ==========================================
const BIRTHDAY_ROSTER = [
  // Agents (12)
  { id: 'AGT-9102', name: 'Samantha Vance', role: 'Agent', queue: 'General Customer Service', birthMonth: 10, birthDay: 21, birthDateStr: 'Oct 21', avatar: '👩‍💼', isSupervisor: false, email: 'samantha.vance@nicecxone.internal' },
  { id: 'AGT-6512', name: 'Rachel Green', role: 'Agent', queue: 'General Customer Service', birthMonth: 11, birthDay: 10, birthDateStr: 'Nov 10', avatar: '👩', isSupervisor: false, email: 'rachel.green@nicecxone.internal' },
  { id: 'AGT-8819', name: 'Marcus Brody', role: 'Agent', queue: 'General Customer Service', birthMonth: 11, birthDay: 22, birthDateStr: 'Nov 22', avatar: '👨', isSupervisor: false, email: 'marcus.brody@nicecxone.internal' },
  { id: 'AGT-3310', name: 'Chloe Bennett', role: 'Agent', queue: 'General Customer Service', birthMonth: 1, birthDay: 8, birthDateStr: 'Jan 08', avatar: '👩‍💻', isSupervisor: false, email: 'chloe.bennett@nicecxone.internal' },
  { id: 'AGT-4092', name: 'Jordan Miller', role: 'Agent', queue: 'Customer Billing & Retention', birthMonth: 11, birthDay: 2, birthDateStr: 'Nov 02', avatar: '👨‍💼', isSupervisor: false, email: 'jordan.miller@nicecxone.internal' },
  { id: 'AGT-5521', name: 'Lucas Wright', role: 'Agent', queue: 'Customer Billing & Retention', birthMonth: 12, birthDay: 18, birthDateStr: 'Dec 18', avatar: '👨‍🦰', isSupervisor: false, email: 'lucas.wright@nicecxone.internal' },
  { id: 'AGT-7703', name: 'Maya Patel', role: 'Agent', queue: 'Customer Billing & Retention', birthMonth: 2, birthDay: 14, birthDateStr: 'Feb 14', avatar: '👩‍🦱', isSupervisor: false, email: 'maya.patel@nicecxone.internal' },
  { id: 'AGT-8842', name: 'Alex Morgan', role: 'Agent', queue: 'Tier-2 Tech Support', birthMonth: 10, birthDay: 25, birthDateStr: 'Oct 25', avatar: '👨‍🔬', isSupervisor: false, email: 'alex.morgan@nicecxone.internal' },
  { id: 'AGT-4491', name: 'Carlos Mendez', role: 'Agent', queue: 'Tier-2 Tech Support', birthMonth: 3, birthDay: 3, birthDateStr: 'Mar 03', avatar: '👨‍💻', isSupervisor: false, email: 'carlos.mendez@nicecxone.internal' },
  { id: 'AGT-7740', name: 'David Chen', role: 'Agent', queue: 'Emergency Inbound', birthMonth: 4, birthDay: 12, birthDateStr: 'Apr 12', avatar: '👨‍⚕️', isSupervisor: false, email: 'david.chen@nicecxone.internal' },
  { id: 'AGT-6628', name: 'Olivia Taylor', role: 'Agent', queue: 'Emergency Inbound', birthMonth: 5, birthDay: 27, birthDateStr: 'May 27', avatar: '👩‍⚕️', isSupervisor: false, email: 'olivia.taylor@nicecxone.internal' },
  { id: 'AGT-2219', name: "Liam O'Connor", role: 'Agent', queue: 'General Customer Service', birthMonth: 6, birthDay: 15, birthDateStr: 'Jun 15', avatar: '👨‍🎓', isSupervisor: false, email: 'liam.oconnor@nicecxone.internal' },

  // Supervisors (5)
  { id: 'SUP-014', name: 'Sarah Jenkins', role: 'Floor Operations Lead', queue: 'Floor Lead & WFM Operations', birthMonth: 10, birthDay: 28, birthDateStr: 'Oct 28', avatar: '👩‍💼', isSupervisor: true, email: 'sarah.jenkins@nicecxone.internal' },
  { id: 'SUP-021', name: 'Michael Chang', role: 'Billing Operations Manager', queue: 'Customer Billing & Retention', birthMonth: 10, birthDay: 22, birthDateStr: 'Oct 22', avatar: '👨‍💼', isSupervisor: true, email: 'michael.chang@nicecxone.internal' },
  { id: 'SUP-035', name: 'Elena Rostova', role: 'QA & Compliance Director', queue: 'Quality Assurance & Speech Tone', birthMonth: 11, birthDay: 15, birthDateStr: 'Nov 15', avatar: '👩‍🔬', isSupervisor: true, email: 'elena.rostova@nicecxone.internal' },
  { id: 'SUP-042', name: 'David Sterling', role: 'Emergency Operations Director', queue: 'Emergency Inbound & Outage Dispatch', birthMonth: 12, birthDay: 4, birthDateStr: 'Dec 04', avatar: '👨‍✈️', isSupervisor: true, email: 'david.sterling@nicecxone.internal' },
  { id: 'SUP-059', name: 'Priya Sharma', role: 'WFM Scheduling Architect', queue: 'WFM Scheduling & Erlang-C Balancing', birthMonth: 1, birthDay: 19, birthDateStr: 'Jan 19', avatar: '👩‍💻', isSupervisor: true, email: 'priya.sharma@nicecxone.internal' }
];

// ==========================================
// PREVIOUS DAYS CALL TRENDS TELEMETRY (14 DAYS)
// ==========================================
const CALL_TRENDS_HISTORY = [
  { date: '2026-10-21', day: 'Wednesday (Today)', offered: 4820, handled: 4492, deflected: 328, abandoned: 102, abandonRate: 2.1, asaSec: 24, ahtSec: 252, ahtStr: '4m 12s', sla: 88.6, peakSurge: '10:00 - 11:30 (Billing Spike +318)', status: 'OPTIMAL', queues: { billing: 1840, cs: 1210, tech: 890, emergency: 480, other: 400 } },
  { date: '2026-10-20', day: 'Tuesday (Yesterday)', offered: 4310, handled: 4115, deflected: 0, abandoned: 195, abandonRate: 4.5, asaSec: 31, ahtSec: 270, ahtStr: '4m 30s', sla: 86.2, peakSurge: '14:00 - 15:00 (Afternoon Escalations)', status: 'NORMAL', queues: { billing: 1520, cs: 1240, tech: 860, emergency: 390, other: 300 } },
  { date: '2026-10-19', day: 'Monday (High Traffic)', offered: 5140, handled: 4780, deflected: 0, abandoned: 360, abandonRate: 7.0, asaSec: 42, ahtSec: 288, ahtStr: '4m 48s', sla: 81.4, peakSurge: '09:30 - 11:30 (Monday Billing Influx)', status: 'WARNING', queues: { billing: 2010, cs: 1420, tech: 980, emergency: 410, other: 320 } },
  { date: '2026-10-18', day: 'Sunday (Weekend)', offered: 2120, handled: 2055, deflected: 0, abandoned: 65, abandonRate: 3.1, asaSec: 15, ahtSec: 232, ahtStr: '3m 52s', sla: 94.8, peakSurge: '12:00 - 13:00 (Midday Orders)', status: 'EXCELLENT', queues: { billing: 680, cs: 620, tech: 450, emergency: 210, other: 160 } },
  { date: '2026-10-17', day: 'Saturday (Weekend)', offered: 2450, handled: 2360, deflected: 0, abandoned: 90, abandonRate: 3.7, asaSec: 18, ahtSec: 238, ahtStr: '3m 58s', sla: 93.5, peakSurge: '13:00 - 14:00 (Weekend Technical Inquiries)', status: 'EXCELLENT', queues: { billing: 780, cs: 710, tech: 520, emergency: 240, other: 200 } },
  { date: '2026-10-16', day: 'Friday', offered: 4180, handled: 3990, deflected: 0, abandoned: 190, abandonRate: 4.5, asaSec: 26, ahtSec: 260, ahtStr: '4m 20s', sla: 87.5, peakSurge: '11:00 - 12:00 (Pre-Weekend Wrapup)', status: 'NORMAL', queues: { billing: 1480, cs: 1190, tech: 840, emergency: 380, other: 290 } },
  { date: '2026-10-15', day: 'Thursday (Storm Deflection)', offered: 5680, handled: 4210, deflected: 1470, abandoned: 110, abandonRate: 1.9, asaSec: 22, ahtSec: 255, ahtStr: '4m 15s', sla: 89.2, peakSurge: '13:30 - 15:30 (Regional Storm Outage)', status: 'OPTIMAL', queues: { billing: 1540, cs: 1220, tech: 880, emergency: 1650, other: 390 } },
  { date: '2026-10-14', day: 'Wednesday', offered: 4050, handled: 3890, deflected: 0, abandoned: 160, abandonRate: 4.0, asaSec: 25, ahtSec: 264, ahtStr: '4m 24s', sla: 88.1, peakSurge: '10:30 - 11:30 (Midweek Standard)', status: 'NORMAL', queues: { billing: 1420, cs: 1160, tech: 810, emergency: 370, other: 290 } },
  { date: '2026-10-13', day: 'Tuesday', offered: 4220, handled: 4040, deflected: 0, abandoned: 180, abandonRate: 4.3, asaSec: 28, ahtSec: 268, ahtStr: '4m 28s', sla: 87.0, peakSurge: '14:30 - 15:30', status: 'NORMAL', queues: { billing: 1490, cs: 1210, tech: 840, emergency: 390, other: 290 } },
  { date: '2026-10-12', day: 'Monday', offered: 4950, handled: 4620, deflected: 0, abandoned: 330, abandonRate: 6.7, asaSec: 38, ahtSec: 282, ahtStr: '4m 42s', sla: 83.2, peakSurge: '09:00 - 11:00', status: 'WARNING', queues: { billing: 1920, cs: 1380, tech: 950, emergency: 400, other: 300 } },
  { date: '2026-10-11', day: 'Sunday', offered: 2080, handled: 2015, deflected: 0, abandoned: 65, abandonRate: 3.1, asaSec: 14, ahtSec: 228, ahtStr: '3m 48s', sla: 95.2, peakSurge: '12:30 - 13:30', status: 'EXCELLENT', queues: { billing: 670, cs: 610, tech: 440, emergency: 210, other: 150 } },
  { date: '2026-10-10', day: 'Saturday', offered: 2390, handled: 2310, deflected: 0, abandoned: 80, abandonRate: 3.3, asaSec: 17, ahtSec: 235, ahtStr: '3m 55s', sla: 94.0, peakSurge: '13:00 - 14:00', status: 'EXCELLENT', queues: { billing: 760, cs: 690, tech: 510, emergency: 240, other: 190 } },
  { date: '2026-10-09', day: 'Friday', offered: 4120, handled: 3940, deflected: 0, abandoned: 180, abandonRate: 4.4, asaSec: 27, ahtSec: 262, ahtStr: '4m 22s', sla: 87.8, peakSurge: '11:30 - 12:30', status: 'NORMAL', queues: { billing: 1460, cs: 1180, tech: 830, emergency: 370, other: 280 } },
  { date: '2026-10-08', day: 'Thursday', offered: 4010, handled: 3850, deflected: 0, abandoned: 160, abandonRate: 4.0, asaSec: 26, ahtSec: 260, ahtStr: '4m 20s', sla: 88.4, peakSurge: '10:00 - 11:00', status: 'NORMAL', queues: { billing: 1410, cs: 1150, tech: 800, emergency: 370, other: 280 } }
];

const HOURLY_CALL_COMPARISON = [
  { hour: '08:00 - 09:00', prevDaysAvg: 280, todayActual: 295, peakNote: 'Shift Startup' },
  { hour: '09:00 - 10:00', prevDaysAvg: 410, todayActual: 430, peakNote: 'Morning Inbound' },
  { hour: '10:00 - 11:00', prevDaysAvg: 460, todayActual: 720, peakNote: '⚡ Billing Statement Release Spike (+260)' },
  { hour: '11:00 - 12:00', prevDaysAvg: 440, todayActual: 680, peakNote: '⚡ WFM Flex Active (Surge Cleared)' },
  { hour: '12:00 - 13:00', prevDaysAvg: 380, todayActual: 390, peakNote: 'Lunch Shift Rotation' },
  { hour: '13:00 - 14:00', prevDaysAvg: 420, todayActual: 415, peakNote: 'Midday Operations' },
  { hour: '14:00 - 15:00', prevDaysAvg: 450, todayActual: 460, peakNote: 'Afternoon Inbound' },
  { hour: '15:00 - 16:00', prevDaysAvg: 430, todayActual: 440, peakNote: 'West Coast Influx' },
  { hour: '16:00 - 17:00', prevDaysAvg: 360, todayActual: 375, peakNote: 'Pre-Close Processing' },
  { hour: '17:00 - 18:00', prevDaysAvg: 290, todayActual: 310, peakNote: 'Evening Wrap-Up' }
];

let serverActiveBroadcasts = [
  {
    id: 'BC-INIT-1',
    timestamp: new Date().toISOString(),
    severity: 'INFO',
    title: 'Daily Shift Operational Briefing',
    message: 'Welcome to day shift! Erlang-C staffing optimal. Discretionary AUX normal. Keep ACW <45s.',
    sender: 'Supervisor Sarah Jenkins (SUP-014)'
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

// ==========================================
// EMERGENCY & STORM OUTAGE STAFFING RECALL STATE
// ==========================================
const SERVER_AGENTS_ROSTER = [
  { id: 'AGT-8842', name: 'Alex Morgan', queue: 'General Customer Service', state: 'AVAILABLE', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', shift: '08:00 - 16:30' },
  { id: 'AGT-9102', name: 'Samantha Vance', queue: 'General Customer Service', state: 'WORKING (IN CALL)', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', shift: '08:00 - 16:30' },
  { id: 'AGT-6512', name: 'Rachel Green', queue: 'General Customer Service', state: 'AVAILABLE', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', shift: '08:30 - 17:00' },
  { id: 'AGT-8819', name: 'Marcus Brody', queue: 'General Customer Service', state: 'WORKING (IN CALL)', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', shift: '08:30 - 17:00' },
  { id: 'AGT-3310', name: 'Chloe Bennett', queue: 'General Customer Service', state: 'AVAILABLE', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', shift: '09:00 - 17:30' },
  { id: 'AGT-4092', name: 'Jordan Miller', queue: 'Customer Billing & Retention', state: 'AVAILABLE', supervisorId: 'SUP-021', supervisorName: 'Michael Chang', shift: '08:00 - 16:30' },
  { id: 'AGT-5521', name: 'Lucas Wright', queue: 'Customer Billing & Retention', state: 'WORKING (IN CALL)', supervisorId: 'SUP-021', supervisorName: 'Michael Chang', shift: '08:30 - 17:00' },
  { id: 'AGT-7703', name: 'Maya Patel', queue: 'Customer Billing & Retention', state: 'AVAILABLE', supervisorId: 'SUP-021', supervisorName: 'Michael Chang', shift: '09:00 - 17:30' },
  { id: 'AGT-4491', name: 'Carlos Mendez', queue: 'Tier-2 Tech Support', state: 'AVAILABLE', supervisorId: 'SUP-035', supervisorName: 'Elena Rostova', shift: '10:00 - 18:30' },
  { id: 'AGT-7740', name: 'David Chen', queue: 'Emergency Inbound', state: 'AUX: AUX BREAK', supervisorId: 'SUP-042', supervisorName: 'David Sterling', shift: '07:30 - 16:00' },
  { id: 'AGT-6628', name: 'Olivia Taylor', queue: 'Emergency Inbound', state: 'AVAILABLE', supervisorId: 'SUP-042', supervisorName: 'David Sterling', shift: '08:00 - 16:30' },
  { id: 'AGT-2219', name: "Liam O'Connor", queue: 'General Customer Service', state: 'AUX: TRAINING', supervisorId: 'SUP-059', supervisorName: 'Priya Sharma', shift: '09:30 - 18:00' }
];

let activeEmergencyRecall = {
  id: null,
  active: false,
  requiredCount: 5,
  quotaFulfilled: false,
  quotaFulfilledAt: null,
  title: 'Storm / Emergency Call Volume Surge Alert',
  message: 'There is an emergency situation. High call volume surge detected and your availability is requested to balance the queue. If you are available please join, or decline.',
  shiftTimings: '15:30 - 18:30 (Surge Window • 3h)',
  queueTarget: 'Emergency Inbound & Tier-2 Support',
  overtimeRate: '+1.5x Premium Overtime Differential',
  supervisorId: 'SUP-014',
  supervisorName: 'Sarah Jenkins',
  startedAt: null,
  agents: {}
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
const SERVICENOW_TICKETS = [
  {
    id: 'INC-88102',
    type: 'Incident',
    agentId: 'AGT-4491',
    agentName: 'Carlos Mendez',
    queue: 'Tier-2 Tech Support',
    category: 'Cisco AnyConnect VPN Error 412',
    severity: 'P2 - High',
    status: 'IN_PROGRESS',
    statusLabel: 'In Progress',
    statusBadgeColor: '#f59e0b',
    assignedTo: 'Network Engineering Tier-3',
    assignedEngineer: 'Marcus Vance',
    openedAt: 'Today 09:14 AM',
    slaTarget: '2 Hours (Remaining: 34m)',
    description: 'MTU mismatch on Wi-Fi adapter causing WebRTC voice packet drops during customer calls.',
    workNotes: 'Engineers deployed MTU 1350 patch to adapter registry. Verifying WebRTC packet trace.'
  },
  {
    id: 'INC-88103',
    type: 'Incident',
    agentId: 'AGT-9102',
    agentName: 'Samantha Vance',
    queue: 'General Customer Service',
    category: 'Citrix Workspace Display Driver Freeze',
    severity: 'P3 - Moderate',
    status: 'RESOLVED',
    statusLabel: 'Resolved',
    statusBadgeColor: '#10b981',
    assignedTo: 'VDI Desktop Support',
    assignedEngineer: 'Kevin Zhao',
    openedAt: 'Today 10:20 AM',
    slaTarget: '4 Hours (Met in 42m)',
    description: 'Virtual display driver frozen on reconnect after scheduled lunch interval.',
    workNotes: 'VDI broker session hard-reset completed. Agent successfully re-authenticated.'
  },
  {
    id: 'INC-90421',
    type: 'Incident',
    agentId: 'AGT-8842',
    agentName: 'Alex Morgan',
    queue: 'Tier-2 Tech Support',
    category: 'CXone MAX Softphone WebRTC UDP Packet Loss',
    severity: 'P1 - Critical',
    status: 'INVESTIGATING',
    statusLabel: 'Under Investigation',
    statusBadgeColor: '#ef4444',
    assignedTo: 'Core Telephony Systems Ops',
    assignedEngineer: 'DevOps Primary On-Call',
    openedAt: 'Today 11:05 AM',
    slaTarget: '1 Hour (Remaining: 18m)',
    description: 'One-way audio reported on incoming contact #90421 due to UDP 10000-20000 firewall jitter.',
    workNotes: 'Network router QoS prioritization rule applied. Telephony gateway responding normally.'
  },
  {
    id: 'INC-77401',
    type: 'Incident',
    agentId: 'AGT-7740',
    agentName: 'David Chen',
    queue: 'General Customer Service',
    category: 'Okta SSO / Duo MFA Desynchronization',
    severity: 'P2 - High',
    status: 'IN_PROGRESS',
    statusLabel: 'In Progress',
    statusBadgeColor: '#f59e0b',
    assignedTo: 'Identity & Access Management (IAM)',
    assignedEngineer: 'Sarah Lin',
    openedAt: 'Today 08:30 AM',
    slaTarget: '2 Hours (Remaining: 45m)',
    description: 'Duo MFA push notifications timing out on mobile token generator.',
    workNotes: 'Reset MFA token seed. Awaiting agent biometric confirmation.'
  },
  {
    id: 'RITM-40291',
    type: 'Service Request',
    agentId: 'AGT-4092',
    agentName: 'Jordan Miller',
    queue: 'Customer Billing & Retention',
    category: 'Hardware Logistics: Plantronics Headset Replacement',
    severity: 'P4 - Low',
    status: 'DISPATCHED',
    statusLabel: 'Dispatched / In Transit',
    statusBadgeColor: '#2563eb',
    assignedTo: 'Hardware Logistics Depot',
    assignedEngineer: 'Depot Fulfillment',
    openedAt: 'Yesterday 04:15 PM',
    slaTarget: '24 Hours (On Schedule)',
    description: 'Replacement noise-canceling USB-C headset ordered under warranty exchange.',
    workNotes: 'FedEx Tracking #748920192841 dispatched. Expected delivery by 02:00 PM.'
  }
];

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
  '.ico': 'image/x-icon',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.ppt': 'application/vnd.ms-powerpoint'
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

  // Quick aliases for presentation / PPT
  if (pathname === '/ppt' || pathname === '/presentation' || pathname === '/slides') {
    res.writeHead(302, { 'Location': '/presentation.html' });
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
        const aId = payload.agent?.id || 'AGT-UNKNOWN';
        const supInfo = AGENT_SUPERVISOR_MAP[aId] || { supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins' };
        supervisorQueue.unshift({
          id: payload.id || ('REQ-' + Math.floor(Math.random() * 900000 + 100000)),
          timestamp: new Date().toISOString(),
          agentId: aId,
          agentName: payload.agent?.name || 'Agent',
          supervisorId: supInfo.supervisorId,
          supervisorName: supInfo.supervisorName,
          auxCode: payload.auxCode,
          durationMinutes: payload.durationMinutes,
          durationSeconds: payload.durationSeconds || 0,
          durationTotalSeconds: payload.durationTotalSeconds || (payload.durationMinutes * 60),
          durationFormatted: payload.durationFormatted || (payload.durationMinutes + 'm'),
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

  
  // API ROUTE: Get Birthday Calendar Roster
  if (pathname === '/api/birthdays' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, birthdays: BIRTHDAY_ROSTER }));
    return;
  }

  // API ROUTE: Get Previous Days Call Trend Analysis
  if (pathname === '/api/reports/call-trends' && req.method === 'GET') {
    // Calculate 7-day average metrics
    const prev7 = CALL_TRENDS_HISTORY.slice(1, 8);
    const avgOffered = Math.round(prev7.reduce((a, c) => a + c.offered, 0) / prev7.length);
    const avgHandled = Math.round(prev7.reduce((a, c) => a + c.handled, 0) / prev7.length);
    const avgAht = Math.round(prev7.reduce((a, c) => a + c.ahtSec, 0) / prev7.length);
    const avgAsa = Math.round(prev7.reduce((a, c) => a + c.asaSec, 0) / prev7.length);
    const avgSla = +(prev7.reduce((a, c) => a + c.sla, 0) / prev7.length).toFixed(1);
    const today = CALL_TRENDS_HISTORY[0];
    const yesterday = CALL_TRENDS_HISTORY[1];

    const deltas = {
      volumeDoD: +(((today.offered - yesterday.offered) / yesterday.offered) * 100).toFixed(1),
      volume7d: +(((today.offered - avgOffered) / avgOffered) * 100).toFixed(1),
      ahtDiffSec: today.ahtSec - yesterday.ahtSec,
      slaDiffPct: +(today.sla - yesterday.sla).toFixed(1),
      asaDiffSec: today.asaSec - yesterday.asaSec
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      today,
      yesterday,
      averages7d: { avgOffered, avgHandled, avgAht, avgAsa, avgSla },
      deltas,
      history: CALL_TRENDS_HISTORY,
      hourlyComparison: HOURLY_CALL_COMPARISON
    }));
    return;
  }


  // ==========================================
  // API ROUTES: BREAK OVERDUE CALLING & ALERTS
  // ==========================================

  // Server Info & Mobile Pairing Link
  if (pathname === '/api/server-info' && req.method === 'GET') {
    const localIp = getLocalNetworkIp();
    let tunnelUrl = null;

    // 1. Auto-detect live tunnel from request headers (if accessed via cloudflare tunnel)
    const reqHost = req.headers['x-forwarded-host'] || req.headers.host || '';
    const isPublicHost = reqHost && !reqHost.includes('localhost') && !reqHost.includes('127.0.0.1') && !reqHost.startsWith('10.') && !reqHost.startsWith('192.168.');
    if (isPublicHost) {
      const proto = req.headers['x-forwarded-proto'] || 'https';
      tunnelUrl = `${proto}://${reqHost}`;
      try {
        fs.writeFileSync(path.join(__dirname, 'tunnel.json'), JSON.stringify({
          tunnelUrl: tunnelUrl,
          mobileUrl: `${tunnelUrl}/mobile-alert.html`,
          updatedAt: new Date().toISOString()
        }, null, 2), 'utf8');
      } catch (e) {}
    }

    // 2. Read from tunnel.json if not accessed directly via tunnel header
    if (!tunnelUrl) {
      try {
        const tunnelFile = path.join(__dirname, 'tunnel.json');
        if (fs.existsSync(tunnelFile)) {
          const tData = JSON.parse(fs.readFileSync(tunnelFile, 'utf8'));
          if (tData && tData.tunnelUrl) {
            tunnelUrl = tData.tunnelUrl.replace(/\/+$/, '');
          }
        }
      } catch (e) {}
    }

    const localUrl = `http://${localIp}:${PORT}/mobile-alert.html`;
    const primaryMobileUrl = tunnelUrl ? `${tunnelUrl}/mobile-alert.html` : localUrl;

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      success: true,
      port: PORT,
      localIp: localIp,
      localUrl: localUrl,
      tunnelUrl: tunnelUrl,
      mobileUrl: primaryMobileUrl,
      serverTime: new Date().toISOString()
    }));
    return;
  }

  // Tunnel Info Management Route
  if (pathname === '/api/tunnel-info' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        if (data.tunnelUrl) {
          fs.writeFileSync(path.join(__dirname, 'tunnel.json'), JSON.stringify(data, null, 2), 'utf8');
        }
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, tunnelUrl: data.tunnelUrl }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Get Alert Preferences for Agent
  if (pathname === '/api/alerts/preferences' && req.method === 'GET') {
    const aId = parsedUrl.query.agentId || 'AGT-8842';
    const prefs = agentAlertPreferences[aId] || {
      agentId: aId,
      agentName: 'Agent',
      device: 'mobile',
      thresholdMins: 0,
      soundStyle: 'phone_ring',
      mobilePhone: '+1 (555) 019-8842',
      updatedAt: new Date().toISOString()
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, preferences: prefs }));
    return;
  }

  // Update Alert Preferences (Laptop / Mobile / Both, Threshold, Sound)
  if (pathname === '/api/alerts/preferences' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const aId = payload.agentId || 'AGT-8842';
        const existing = agentAlertPreferences[aId] || {};
        agentAlertPreferences[aId] = {
          ...existing,
          ...payload,
          agentId: aId,
          device: payload.device || existing.device || 'mobile', // 'laptop' | 'mobile' | 'both'
          thresholdMins: typeof payload.thresholdMins === 'number' ? payload.thresholdMins : (existing.thresholdMins !== undefined ? existing.thresholdMins : 2),
          soundStyle: payload.soundStyle || existing.soundStyle || 'phone_ring',
          mobilePhone: payload.mobilePhone || existing.mobilePhone || '+1 (555) 019-8842',
          updatedAt: new Date().toISOString()
        };
        broadcastAlertEvent('PREFERENCES_UPDATED', agentAlertPreferences[aId]);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, preferences: agentAlertPreferences[aId] }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }


  // API ROUTE: Start / Sync Active Break across Laptop & Mobile
  if (pathname === '/api/breaks/start' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const breakData = JSON.parse(body || '{}');
        const aId = breakData.agentId || (breakData.agent && breakData.agent.id) || 'AGT-8842';
        activeAgentBreaks[aId] = breakData;
        broadcastAlertEvent('BREAK_APPROVED', breakData);
        if (!req.headers['x-relayed-from']) relayToCloud('/api/breaks/start', breakData);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, activeBreak: breakData }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API ROUTE: Get Active Break for Agent
  if (pathname === '/api/breaks/active' && req.method === 'GET') {
    const aId = parsedUrl.query.agentId || 'AGT-8842';
    const brk = activeAgentBreaks[aId] || null;
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: true, activeBreak: brk }));
    return;
  }

  // API ROUTE: End Active Break
  if (pathname === '/api/breaks/end' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const aId = payload.agentId || 'AGT-8842';
        delete activeAgentBreaks[aId];
        broadcastAlertEvent('BREAK_ENDED', { agentId: aId });
        if (!req.headers['x-relayed-from']) relayToCloud('/api/breaks/end', payload);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, message: 'Break ended.' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Trigger Automated Calling / Alarm (From Widget Countdown or Supervisor Wallboard)
  
  // API ROUTE: Assign Mandatory Training / Coaching (from Supervisor)
  if (pathname === '/api/training/assign' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const targetId = payload.targetAgentId || payload.agentId || 'ALL';
        activeTrainingAssignments[targetId] = payload;
        broadcastAlertEvent('MANDATORY_TRAINING_ASSIGNED', payload);
        if (!req.headers['x-relayed-from']) relayToCloud('/api/training/assign', payload);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, assignment: payload }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API ROUTE: Get Active Mandatory Training Assignment for Agent
  if (pathname === '/api/training/status' && req.method === 'GET') {
    const aId = (parsedUrl.query && parsedUrl.query.agentId) || 'AGT-8842';
    const training = activeTrainingAssignments[aId] || activeTrainingAssignments['ALL'] || null;
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: true, training: training, allTrainings: activeTrainingAssignments }));
    return;
  }

  // API ROUTE: Complete / Acknowledge Mandatory Training
  if (pathname === '/api/training/complete' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const aId = payload.targetAgentId || payload.agentId || 'AGT-8842';
        delete activeTrainingAssignments[aId];
        if (payload.clearAll) {
          delete activeTrainingAssignments['ALL'];
        }
        broadcastAlertEvent('TRAINING_COMPLETED', { agentId: aId, payload });
        if (!req.headers['x-relayed-from']) relayToCloud('/api/training/complete', payload);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, message: 'Training marked completed / cleared.' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (pathname === '/api/alerts/trigger-alarm' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const aId = payload.agentId || 'AGT-8842';
        const prefs = agentAlertPreferences[aId] || { device: 'mobile', thresholdMins: 0, soundStyle: 'phone_ring' };

        const alarmData = {
          id: 'ALM-' + Date.now(),
          agentId: aId,
          agentName: payload.agentName || prefs.agentName || 'Alex Morgan',
          auxCode: payload.auxCode || 'AUX-2: Short Break / AUX',
          durationMinutes: payload.durationMinutes || 15,
          thresholdMins: payload.thresholdMins !== undefined ? payload.thresholdMins : prefs.thresholdMins,
          overdueMins: payload.overdueMins !== undefined ? payload.overdueMins : 1,
          overdueSecs: payload.overdueSecs || 0,
          device: payload.device || prefs.device || 'mobile', // 'laptop' | 'mobile' | 'both'
          soundStyle: payload.soundStyle || prefs.soundStyle || 'phone_ring',
          mobilePhone: prefs.mobilePhone || '+1 (555) 019-8842',
          triggeredBy: payload.triggeredBy || 'WFM_AUTOMATION_THRESHOLD',
          force: payload.force || (payload.triggeredBy && payload.triggeredBy.includes('SUPERVISOR')) || false,
          silenced: false,
          message: payload.message || `Attention Agent ${payload.agentName || 'Alex Morgan'}: Your AUX break duration and variance threshold of ${prefs.thresholdMins}m have been exceeded. Please return to your workstation immediately and resume AVAILABLE status.`,
          triggeredAt: new Date().toISOString(),
          status: 'ACTIVE'
        };

        activeBreakAlarms[aId] = alarmData;
        if (!req.headers['x-relayed-from']) relayToCloud('/api/alerts/trigger-alarm', alarmData);

        // Push to supervisor audit queue
        supervisorQueue.unshift({
          id: alarmData.id,
          timestamp: alarmData.triggeredAt,
          agentId: aId,
          agentName: alarmData.agentName,
          supervisorId: (AGENT_SUPERVISOR_MAP[aId] || {}).supervisorId || 'SUP-014',
          supervisorName: (AGENT_SUPERVISOR_MAP[aId] || {}).supervisorName || 'Sarah Jenkins',
          auxCode: alarmData.auxCode,
          durationMinutes: alarmData.durationMinutes,
          status: 'THRESHOLD_ALARM',
          reason: `Adherence limit + ${alarmData.thresholdMins}m threshold exceeded. Alarm dispatched to [${alarmData.device.toUpperCase()}].`
        });

        // Broadcast to mobile devices & web clients via SSE
        broadcastAlertEvent('ALARM_TRIGGERED', alarmData);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, alarm: alarmData }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Get Active Overdue Alarms
  if (pathname === '/api/alerts/active' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: Object.keys(activeBreakAlarms).length,
      alarms: Object.values(activeBreakAlarms)
    }));
    return;
  }

  // Acknowledge & Clear Alarm (Silences laptop & mobile)
  if (pathname === '/api/alerts/acknowledge' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const aId = payload.agentId || 'AGT-8842';
        const existing = activeBreakAlarms[aId];
        delete activeBreakAlarms[aId];
        if (!req.headers['x-relayed-from']) relayToCloud('/api/alerts/acknowledge', payload);

        broadcastAlertEvent('ALARM_ACKNOWLEDGED', {
          agentId: aId,
          acknowledgedBy: payload.acknowledgedBy || 'AGENT',
          deviceSource: payload.deviceSource || 'MOBILE',
          timestamp: new Date().toISOString()
        });

        if (existing) {
          supervisorQueue.unshift({
            id: 'ACK-' + Date.now(),
            timestamp: new Date().toISOString(),
            agentId: aId,
            agentName: existing.agentName,
            supervisorId: (AGENT_SUPERVISOR_MAP[aId] || {}).supervisorId || 'SUP-014',
            supervisorName: (AGENT_SUPERVISOR_MAP[aId] || {}).supervisorName || 'Sarah Jenkins',
            auxCode: existing.auxCode,
            durationMinutes: existing.durationMinutes,
            status: 'ALARM_CLEARED',
            reason: `Agent acknowledged alarm via ${payload.deviceSource || 'Device'}. Resumed AVAILABLE state.`
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Alarm acknowledged and silenced.' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Silence Alarm (Silences audio and closes modal across laptop & mobile)
  if (pathname === '/api/alerts/silence' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const aId = payload.agentId || 'AGT-8842';
        if (activeBreakAlarms[aId]) {
          activeBreakAlarms[aId].silenced = true;
        if (!req.headers['x-relayed-from']) relayToCloud('/api/alerts/silence', payload);
        }

        broadcastAlertEvent('ALARM_SILENCED', {
          agentId: aId,
          silencedBy: payload.silencedBy || 'AGENT_MOBILE',
          timestamp: new Date().toISOString()
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Alarm silenced on all devices.' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Server-Sent Events (SSE) Stream for Mobile & Desktop Real-Time Calling/Alerts
  if (pathname === '/api/alerts/stream' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('retry: 3000\n');
    res.write(`event: INIT\ndata: ${JSON.stringify({ time: new Date().toISOString(), activeAlarms: Object.values(activeBreakAlarms) })}\n\n`);

    sseAlertClients.push(res);
    req.on('close', () => {
      const idx = sseAlertClients.indexOf(res);
      if (idx !== -1) sseAlertClients.splice(idx, 1);
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

  // ==========================================
  // API ROUTES: EMERGENCY SURGE MOBILE RECALL & RESPONSE TRACKING
  // ==========================================

  // Get Emergency Status & Current Agent Response
  if (pathname === '/api/emergency/status' && req.method === 'GET') {
    const aId = parsedUrl.query.agentId;
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({
      success: true,
      active: activeEmergencyRecall.active,
      recall: activeEmergencyRecall,
      agentSpecific: aId && activeEmergencyRecall.agents[aId] ? activeEmergencyRecall.agents[aId] : null
    }));
    return;
  }

  // Supervisor Dispatches Emergency Alert to Unavailable Agents (Mobile Only)
  if (pathname === '/api/emergency/notify-all' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const campaignId = 'EMERG-' + Date.now();
        const targetIds = Array.isArray(payload.targetAgentIds) && payload.targetAgentIds.length > 0
          ? payload.targetAgentIds
          : SERVER_AGENTS_ROSTER.filter(a => a.state !== 'AVAILABLE').map(a => a.id);

        const shiftWindow = payload.shiftTimings || '15:30 - 18:30 (Surge Shift • 3 hrs)';
        const targetQueue = payload.queueTarget || 'Emergency Inbound & Tier-2 Support';
        const msg = payload.message || 'There is an emergency situation. High call volume surge detected and your availability is requested to balance the queue. If you are available please join, or decline.';

        const agentsMap = {};
        targetIds.forEach(id => {
          const info = SERVER_AGENTS_ROSTER.find(a => a.id === id) || { id, name: id, queue: 'General', state: 'AUX Break' };
          agentsMap[id] = {
            agentId: id,
            agentName: info.name,
            queue: info.queue,
            currentState: info.state,
            status: 'PENDING',
            response: null,
            responseTime: null,
            shiftTimings: shiftWindow,
            queueTarget: targetQueue,
            alertDelivered: true,
            deliveredAt: new Date().toISOString()
          };
        });

        const reqCount = typeof payload.requiredCount === 'number' && payload.requiredCount > 0 
          ? payload.requiredCount 
          : (targetIds.length >= 5 ? 5 : targetIds.length);

        activeEmergencyRecall = {
          id: campaignId,
          active: true,
          requiredCount: reqCount,
          quotaFulfilled: false,
          quotaFulfilledAt: null,
          title: payload.title || '🚨 Emergency Call Volume Surge Alert',
          message: msg,
          shiftTimings: shiftWindow,
          queueTarget: targetQueue,
          overtimeRate: payload.overtimeRate || '+1.5x Premium Overtime Differential',
          supervisorId: payload.supervisorId || 'SUP-014',
          supervisorName: payload.supervisorName || 'Sarah Jenkins',
          startedAt: new Date().toISOString(),
          agents: agentsMap
        };

        // Broadcast to mobile companions via SSE
        broadcastAlertEvent('EMERGENCY_RECALL_DISPATCH', activeEmergencyRecall);
        if (!req.headers['x-relayed-from']) relayToCloud('/api/emergency/notify-all', payload);

        // Audit in supervisor queue
        supervisorQueue.unshift({
          id: campaignId,
          timestamp: activeEmergencyRecall.startedAt,
          agentId: 'ALL_UNAVAILABLE',
          agentName: `Fleet Alert (${targetIds.length} Agents)`,
          supervisorId: activeEmergencyRecall.supervisorId,
          supervisorName: activeEmergencyRecall.supervisorName,
          auxCode: 'EMERGENCY_RECALL',
          durationMinutes: 180,
          status: 'EMERGENCY_DISPATCHED',
          reason: `Storm / Surge Emergency: Alert dispatched to ${targetIds.length} unavailable agents on Mobile only. Target Shift: ${shiftWindow}.`
        });

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, recall: activeEmergencyRecall }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Agent Responds from Mobile Companion (YES or NO)
  if (pathname === '/api/emergency/respond' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const aId = payload.agentId || 'AGT-8842';
        const userResp = (payload.response || '').toUpperCase(); // 'YES' or 'NO'

        // If quota is already fulfilled, close survey for all non-accepted agents!
        if (activeEmergencyRecall.active && activeEmergencyRecall.quotaFulfilled) {
          const existing = activeEmergencyRecall.agents[aId];
          if (existing && existing.response === 'YES') {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({
              success: true,
              agentId: aId,
              response: 'YES',
              status: 'ACCEPTED',
              shiftTimings: existing.shiftTimings,
              queueTarget: existing.queueTarget,
              quotaFulfilled: true,
              message: `Availability confirmed! Your shift timings are ${existing.shiftTimings}.`
            }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            success: false,
            quotaFulfilled: true,
            closed: true,
            message: 'Staffing quota has already been secured. The survey is closed.'
          }));
          return;
        }

        if (!activeEmergencyRecall.active) {
          activeEmergencyRecall.active = true;
          activeEmergencyRecall.id = 'EMERG-' + Date.now();
          activeEmergencyRecall.shiftTimings = '15:30 - 18:30 (Surge Shift • 3 hrs)';
          activeEmergencyRecall.queueTarget = 'Emergency Inbound & Tier-2 Support';
          activeEmergencyRecall.startedAt = new Date().toISOString();
        }

        if (!activeEmergencyRecall.agents[aId]) {
          const info = SERVER_AGENTS_ROSTER.find(a => a.id === aId) || { id: aId, name: 'Alex Morgan', queue: 'General', state: 'AUX Break' };
          activeEmergencyRecall.agents[aId] = {
            agentId: aId,
            agentName: info.name,
            queue: info.queue,
            currentState: info.state,
            shiftTimings: activeEmergencyRecall.shiftTimings,
            queueTarget: activeEmergencyRecall.queueTarget
          };
        }

        const agentEntry = activeEmergencyRecall.agents[aId];
        agentEntry.response = userResp;
        agentEntry.status = userResp === 'YES' ? 'ACCEPTED' : 'DECLINED';
        agentEntry.responseTime = new Date().toISOString();

        // Check quota fulfillment
        const allAccepted = Object.values(activeEmergencyRecall.agents).filter(a => a.status === 'ACCEPTED');
        const quotaTarget = activeEmergencyRecall.requiredCount || 5;
        const isQuotaMet = allAccepted.length >= quotaTarget;
        const justFulfilled = isQuotaMet && !activeEmergencyRecall.quotaFulfilled;

        if (isQuotaMet) {
          activeEmergencyRecall.quotaFulfilled = true;
          activeEmergencyRecall.quotaFulfilledAt = activeEmergencyRecall.quotaFulfilledAt || new Date().toISOString();
          Object.keys(activeEmergencyRecall.agents).forEach(id => {
            if (activeEmergencyRecall.agents[id].status === 'PENDING') {
              activeEmergencyRecall.agents[id].status = 'QUOTA_CLOSED';
            }
          });
        }

        // Broadcast updated response to supervisor portal
        if (!req.headers['x-relayed-from']) relayToCloud('/api/emergency/respond', payload);
        broadcastAlertEvent('EMERGENCY_RESPONSE_UPDATE', {
          campaignId: activeEmergencyRecall.id,
          agentId: aId,
          agentName: agentEntry.agentName,
          response: userResp,
          status: agentEntry.status,
          responseTime: agentEntry.responseTime,
          shiftTimings: agentEntry.shiftTimings,
          agents: activeEmergencyRecall.agents,
          acceptedCount: allAccepted.length,
          requiredCount: quotaTarget,
          quotaFulfilled: activeEmergencyRecall.quotaFulfilled,
          justFulfilled: justFulfilled
        });

        if (justFulfilled) {
          broadcastAlertEvent('EMERGENCY_QUOTA_FULFILLED', {
            campaignId: activeEmergencyRecall.id,
            acceptedCount: allAccepted.length,
            requiredCount: quotaTarget,
            shiftTimings: activeEmergencyRecall.shiftTimings,
            message: `We have obtained sufficient number of agents (${allAccepted.length}/${quotaTarget}) for the outage! Staffing quota achieved.`,
            acceptedAgents: allAccepted,
            fulfilledAt: activeEmergencyRecall.quotaFulfilledAt
          });

          supervisorQueue.unshift({
            id: 'QUOTA-' + Date.now(),
            timestamp: new Date().toISOString(),
            agentId: 'QUOTA_FULFILLED',
            agentName: `Staffing Quota Met (${allAccepted.length}/${quotaTarget})`,
            supervisorId: activeEmergencyRecall.supervisorId || 'SUP-014',
            supervisorName: activeEmergencyRecall.supervisorName || 'Sarah Jenkins',
            auxCode: 'OUTAGE_BALANCED',
            status: 'SUFFICIENT_AVAILABILITY',
            reason: `Sufficient number of agents (${allAccepted.length}/${quotaTarget}) confirmed availability for outage. Shift assigned: ${activeEmergencyRecall.shiftTimings}.`
          });
        }

        // Audit in supervisor queue
        supervisorQueue.unshift({
          id: 'RESP-' + Date.now(),
          timestamp: agentEntry.responseTime,
          agentId: aId,
          agentName: agentEntry.agentName,
          supervisorId: activeEmergencyRecall.supervisorId || 'SUP-014',
          supervisorName: activeEmergencyRecall.supervisorName || 'Sarah Jenkins',
          auxCode: userResp === 'YES' ? 'SURGE_ACCEPTED' : 'SURGE_DECLINED',
          status: userResp === 'YES' ? 'ACCEPTED' : 'DECLINED',
          reason: userResp === 'YES' 
            ? `Agent ACCEPTED Emergency Mobile Surge Shift (${agentEntry.shiftTimings}). Ready to log in.`
            : `Agent DECLINED Emergency Surge Shift (Currently unavailable).`
        });

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          agentId: aId,
          response: userResp,
          status: agentEntry.status,
          shiftTimings: agentEntry.shiftTimings,
          queueTarget: agentEntry.queueTarget || 'Emergency Inbound & Tier-2 Support',
          overtimeRate: activeEmergencyRecall.overtimeRate,
          message: userResp === 'YES' 
            ? `Availability confirmed! Your shift timings are ${agentEntry.shiftTimings}. Please log in to your workstation softphone now.`
            : `Response recorded: Unavailable. Thank you for notifying supervisor.`
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Simulate Quota Fulfilled (For Instant 5/5 Demo & System Alert Verification)
  if (pathname === '/api/emergency/simulate-quota' && req.method === 'POST') {
    if (!activeEmergencyRecall.active) {
      activeEmergencyRecall.active = true;
      activeEmergencyRecall.id = 'EMERG-' + Date.now();
      activeEmergencyRecall.shiftTimings = '15:30 - 18:30 (Surge Shift • 3 hrs)';
      activeEmergencyRecall.queueTarget = 'Emergency Inbound & Tier-2 Support';
      activeEmergencyRecall.startedAt = new Date().toISOString();
    }
    activeEmergencyRecall.requiredCount = 5;

    const demoFive = ['AGT-8842', 'AGT-7740', 'AGT-2219', 'AGT-4491', 'AGT-9102'];
    demoFive.forEach(id => {
      const info = SERVER_AGENTS_ROSTER.find(a => a.id === id) || { id, name: id, queue: 'General' };
      activeEmergencyRecall.agents[id] = {
        agentId: id,
        agentName: info.name,
        queue: info.queue || 'General Support',
        currentState: info.state || 'AVAILABLE',
        status: 'ACCEPTED',
        response: 'YES',
        responseTime: new Date().toISOString(),
        shiftTimings: activeEmergencyRecall.shiftTimings,
        queueTarget: 'Emergency Inbound & Tier-2 Support',
        alertDelivered: true,
        deliveredAt: new Date().toISOString()
      };
    });

    activeEmergencyRecall.quotaFulfilled = true;
    activeEmergencyRecall.quotaFulfilledAt = new Date().toISOString();
    const acceptedList = Object.values(activeEmergencyRecall.agents).filter(a => a.status === 'ACCEPTED');

    broadcastAlertEvent('EMERGENCY_QUOTA_FULFILLED', {
      campaignId: activeEmergencyRecall.id,
      acceptedCount: acceptedList.length,
      requiredCount: 5,
      shiftTimings: activeEmergencyRecall.shiftTimings,
      message: `We have obtained sufficient number of agents (${acceptedList.length}/5) for the outage! Staffing quota achieved.`,
      acceptedAgents: acceptedList,
      fulfilledAt: activeEmergencyRecall.quotaFulfilledAt
    });

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: true, acceptedCount: acceptedList.length, requiredCount: 5, recall: activeEmergencyRecall }));
    return;
  }

  // Reset / Clear Emergency Recall Campaign
  if (pathname === '/api/emergency/reset' && req.method === 'POST') {
    activeEmergencyRecall = {
      id: null,
      active: false,
      title: 'Storm / Emergency Call Volume Surge Alert',
      message: 'There is an emergency situation. High call volume surge detected and your availability is requested to balance the queue. If you are available please join, or decline.',
      shiftTimings: '15:30 - 18:30 (Surge Window • 3h)',
      queueTarget: 'Emergency Inbound & Tier-2 Support',
      overtimeRate: '+1.5x Premium Overtime Differential',
      supervisorId: 'SUP-014',
      supervisorName: 'Sarah Jenkins',
      startedAt: null,
      agents: {}
    };
    broadcastAlertEvent('EMERGENCY_RECALL_RESET', { reset: true });
    if (!req.headers['x-relayed-from']) relayToCloud('/api/emergency/reset', {});
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ success: true, message: 'Emergency recall campaign reset.' }));
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
          wfmQueueBalanceState.isSurgeActive = false;
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
          wfmQueueBalanceState.queues.billing.callsWaiting = 48;
          wfmQueueBalanceState.queues.billing.avgWaitSeconds = 42;
          wfmQueueBalanceState.queues.billing.currentSla = 88.5;
          wfmQueueBalanceState.queues.billing.occupancyPct = 85;
          wfmQueueBalanceState.queues.billing.status = 'REBALANCED';

          wfmQueueBalanceState.queues.customerService.assignedAgents = 2;
          wfmQueueBalanceState.queues.customerService.occupancyPct = 76;
          wfmQueueBalanceState.queues.customerService.status = 'FLEXED_DONOR';

          wfmQueueBalanceState.historyLog.unshift({
            timestamp: new Date().toISOString(),
            event: 'REBALANCE_DISPATCHED',
            details: 'WFM Dynamic Cross-Skill Rebalance executed: 3 Customer Service agents flexed to Billing. Staffing: Billing 4 -> 7 agents, CS 5 -> 2 agents. Billing calls waiting reduced to 48.'
          });
        }

        if (payload.action === 'SURGE_BILLING') {
          wfmQueueBalanceState.isSurgeActive = true;
          wfmQueueBalanceState.isRebalanced = false;
          wfmQueueBalanceState.reallocatedAgents = [];
          wfmQueueBalanceState.autoFlexEnabled = false;

          wfmQueueBalanceState.queues.billing.callsWaiting = 318;
          wfmQueueBalanceState.queues.billing.avgWaitSeconds = 540;
          wfmQueueBalanceState.queues.billing.currentSla = 34.5;
          wfmQueueBalanceState.queues.billing.requiredAgents = 8;
          wfmQueueBalanceState.queues.billing.assignedAgents = 4;
          wfmQueueBalanceState.queues.billing.occupancyPct = 100;
          wfmQueueBalanceState.queues.billing.status = 'SURGE_CRITICAL';

          wfmQueueBalanceState.queues.customerService.callsWaiting = 6;
          wfmQueueBalanceState.queues.customerService.avgWaitSeconds = 11;
          wfmQueueBalanceState.queues.customerService.assignedAgents = 5;
          wfmQueueBalanceState.queues.customerService.occupancyPct = 28;
          wfmQueueBalanceState.queues.customerService.status = 'IDLE_SURPLUS';

          wfmQueueBalanceState.historyLog.unshift({
            timestamp: new Date().toISOString(),
            event: 'SURGE_DETECTED',
            details: 'Sudden Billing Call Volume Surge (+318 calls waiting, ASA 9m). Queue load imbalance ratio: 53:1.'
          });
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
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
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
      title: 'Auto-Rejected: AUX Break Frequency Pattern Exceeded',
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
  // Triggered deterministically for Carlos Mendez (High Volume Surge scenario)
  const isSurgeForced = Boolean(agent.forceHighVolumeSurge);
  if (isSurgeForced && payload.urgency !== 'Urgent-Medical') {
    return {
      status: 'REJECTED',
      code: 'WFM_ACD_STAFFING_LIMITED',
      checkBackLater: true,
      nextOpenInterval: '11:45 AM (After Morning Rush)',
      title: 'Auto-Rejected: High Call Volume Surge Active',
      description: 'ACD arrival surge detected (+48 calls in queue). Queue depth exceeds SLA safety threshold; discretionary AUX break requests are temporarily held to protect floor service levels.',
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
const AGENT_QA_DATA = {
  'AGT-8842': { name: 'Alex Morgan', queue: 'Tier-2 Tech Support', tone: 'Good / Empathetic', ivrStars: 5.0, qaScore: 96, queryResolved: true, verif: true, flagReason: 'None (Top Performer)' },
  'AGT-4092': { name: 'Jordan Miller', queue: 'Customer Billing & Retention', tone: 'Rudely / Impatient', ivrStars: 1.0, qaScore: 48, queryResolved: false, verif: true, flagReason: 'Rude speech tone to customer + Unresolved dispute' },
  'AGT-9102': { name: 'Samantha Vance', queue: 'General Customer Service', tone: 'Bad / Confused', ivrStars: 2.0, qaScore: 32, queryResolved: false, verif: false, flagReason: 'Missed customer security PIN verification + Unresolved inquiry' },
  'AGT-7740': { name: 'David Chen', queue: 'General Customer Service', tone: 'Neutral / Direct', ivrStars: 3.5, qaScore: 85, queryResolved: true, verif: true, flagReason: 'None (Acceptable SLA)' },
  'AGT-6512': { name: 'Rachel Green', queue: 'Emergency Inbound', tone: 'Good / Empathetic', ivrStars: 5.0, qaScore: 98, queryResolved: true, verif: true, flagReason: 'None (Exemplary Retention)' },
  'AGT-8819': { name: 'Marcus Brody', queue: 'General Customer Service', tone: 'Neutral / Trainee', ivrStars: 4.0, qaScore: 81, queryResolved: true, verif: true, flagReason: 'Incomplete account details lookup' },
  'AGT-3310': { name: 'Chloe Bennett', queue: 'General Customer Service', tone: 'Good / Empathetic', ivrStars: 4.8, qaScore: 95, queryResolved: true, verif: true, flagReason: 'None (Senior Lead)' },
  'AGT-5521': { name: 'Lucas Wright', queue: 'Customer Billing & Retention', tone: 'Good / Professional', ivrStars: 4.6, qaScore: 92, queryResolved: true, verif: true, flagReason: 'None (Fast Wrap-up)' },
  'AGT-7703': { name: 'Maya Patel', queue: 'General Customer Service', tone: 'Good / Empathetic', ivrStars: 5.0, qaScore: 99, queryResolved: true, verif: true, flagReason: 'None (VIP Care)' },
  'AGT-4491': { name: 'Carlos Mendez', queue: 'Tier-2 Tech Support', tone: 'Neutral / Direct', ivrStars: 3.8, qaScore: 84, queryResolved: true, verif: true, flagReason: 'None (Hardware Specialist)' },
  'AGT-6628': { name: 'Olivia Taylor', queue: 'Emergency Inbound', tone: 'Good / Calm', ivrStars: 5.0, qaScore: 100, queryResolved: true, verif: true, flagReason: 'None (Disaster Dispatch Lead)' },
  'AGT-2219': { name: "Liam O'Connor", queue: 'General Customer Service', tone: 'Bad / Hesitant', ivrStars: 2.5, qaScore: 36, queryResolved: false, verif: false, flagReason: 'Failed resolution + Missing account history' }
};

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

function extractServiceNowTicketId(query) {
  if (!query) return null;
  const q = query.trim();

  // Pattern 1: Explicit prefixes INC, RITM, REQ, TASK, CHG
  const prefixMatch = q.match(/\b(INC|RITM|REQ|TASK|CHG)[-_\s]?(\d{3,8})\b/i);
  if (prefixMatch) {
    return `${prefixMatch[1].toUpperCase()}-${prefixMatch[2]}`;
  }

  // Pattern 2: Contextual keywords like "ticket 12345" or "incident #88102"
  const wordMatch = q.match(/\b(?:ticket|incident|case|issue|req|request)\s*#?\s*(\d{3,8})\b/i);
  if (wordMatch) {
    return `INC-${wordMatch[1]}`;
  }

  // Pattern 3: Hashtag like "#90421"
  const hashMatch = q.match(/#(\d{4,8})\b/);
  if (hashMatch) {
    return `INC-${hashMatch[1]}`;
  }

  // Pattern 4: Bare number like "88102" or "55421"
  const bareMatch = q.match(/^\s*(\d{4,8})\s*$/);
  if (bareMatch) {
    return `INC-${bareMatch[1]}`;
  }

  return null;
}

function getOrGenerateServiceNowTicket(ticketId, agentId = 'AGT-8842') {
  if (!ticketId) return null;
  const cleanId = ticketId.toUpperCase();

  // 1. Check seeded tickets first
  const existing = SERVICENOW_TICKETS.find(t => t.id === cleanId || t.id.replace('-', '') === cleanId.replace('-', ''));
  if (existing) return existing;

  // 2. Generate deterministic ticket data based on number
  const numStr = cleanId.replace(/\D/g, '') || '88421';
  const num = parseInt(numStr, 10);

  const categories = [
    { cat: 'CXone WebRTC Softphone: UDP Jitter & Voice Stream Latency', grp: 'Core Telephony Systems Ops', eng: 'David Kim (On-Call)', sev: 'P1 - Critical', prioBadge: '#ef4444' },
    { cat: 'Cisco AnyConnect VPN: IPsec MTU Tunnel Fragmentation (Error 412)', grp: 'Network Infrastructure Tier-3', eng: 'Marcus Vance', sev: 'P2 - High', prioBadge: '#f59e0b' },
    { cat: 'Okta SSO / Duo MFA: Security Token Clock Skew Desync', grp: 'Identity & Access Management (IAM)', eng: 'Sarah Lin', sev: 'P2 - High', prioBadge: '#f59e0b' },
    { cat: 'Citrix Workspace VDI: Virtual GPU Display Driver Crash', grp: 'VDI & Desktop Virtualization Support', eng: 'Kevin Zhao', sev: 'P3 - Moderate', prioBadge: '#2563eb' },
    { cat: 'Salesforce CRM CTI Connector: Screen-Pop Socket Disconnect', grp: 'Enterprise CRM Integrations', eng: 'Priya Sharma', sev: 'P2 - High', prioBadge: '#f59e0b' },
    { cat: 'Hardware Logistics: Noise-Canceling USB-C Headset Replacement', grp: 'Hardware Depot & Field Dispatch', eng: 'Logistics Depot', sev: 'P4 - Low', prioBadge: '#10b981' },
    { cat: 'Fiber Gateway Modem: Residential Bandwidth Provisioning Error', grp: 'Broadband NOC Engineering', eng: 'Tyler Brooks', sev: 'P3 - Moderate', prioBadge: '#2563eb' },
    { cat: 'NICE WFM Adherence: Real-Time Telemetry Feed Synchronization', grp: 'Workforce Technology Services', eng: 'Elena Rostova', sev: 'P2 - High', prioBadge: '#f59e0b' }
  ];

  const statuses = [
    { status: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b' },
    { status: 'INVESTIGATING', label: 'Under Investigation', color: '#ef4444' },
    { status: 'ASSIGNED', label: 'Assigned / Under Review', color: '#2563eb' },
    { status: 'RESOLVED', label: 'Resolved / Fix Applied', color: '#10b981' },
    { status: 'PENDING_VENDOR', label: 'Pending Hardware Dispatch', color: '#f59e0b' }
  ];

  const catObj = categories[num % categories.length];
  const statObj = statuses[(num >> 2) % statuses.length];
  const type = cleanId.startsWith('RITM') || cleanId.startsWith('REQ') ? 'Service Request' : 'Incident';

  const minsRemaining = 15 + (num % 85);
  const slaTarget = statObj.status === 'RESOLVED' ? 'Resolved within SLA (Met in 38m)' : `${minsRemaining}m remaining against 2h SLA`;

  const workNotesList = [
    `Diagnostics captured. Telephony QoS gateway prioritized. Network trace indicates 0% packet loss on regional node.`,
    `Agent configuration updated. Registry MTU patch verified. System diagnostics operating normally.`,
    `Session state purged and recreated on primary cluster. Awaiting agent confirmation.`,
    `Telemetry logs reviewed. Carrier dispatch verified local fiber node online. Monitoring contact stability.`
  ];
  const workNotes = workNotesList[num % workNotesList.length];

  const profile = (typeof AGENT_ROSTER_TELEMETRY !== 'undefined' && AGENT_ROSTER_TELEMETRY[agentId]) || 
                  { name: 'Alex Morgan', queue: 'Tier-2 Tech Support' };

  return {
    id: cleanId,
    type,
    agentId,
    agentName: profile.name,
    queue: profile.queue,
    category: catObj.cat,
    severity: catObj.sev,
    status: statObj.status,
    statusLabel: statObj.label,
    statusBadgeColor: statObj.color,
    assignedTo: catObj.grp,
    assignedEngineer: catObj.eng,
    openedAt: 'Today 09:30 AM',
    slaTarget,
    description: `Reported issue: ${catObj.cat}. Automatically ingested from agent workstation telemetry.`,
    workNotes
  };
}

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

  // ==========================================
  // 1. SINGLE AGENT 360° PROFILE DOSSIERS
  // ==========================================
  const agentKeys = Object.keys(AGENT_ROSTER_TELEMETRY);
  let matchedAgentKey = null;

  for (const k of agentKeys) {
    const ag = AGENT_ROSTER_TELEMETRY[k];
    const first = ag.name.split(' ')[0].toLowerCase();
    const last = ag.name.split(' ')[1] ? ag.name.split(' ')[1].toLowerCase() : '';
    const idLower = k.toLowerCase();
    if (qLower.includes(first) || (last && qLower.includes(last)) || qLower.includes(idLower)) {
      matchedAgentKey = k;
      break;
    }
  }

  if (matchedAgentKey) {
    const ag = AGENT_ROSTER_TELEMETRY[matchedAgentKey];
    const qa = AGENT_QA_DATA[matchedAgentKey] || { tone: 'Neutral', ivrStars: 4.0, qaScore: 80, flagReason: 'Standard performance' };
    const itTicket = itIncidents.find(t => t.agentId === matchedAgentKey);

    let adherenceColor = parseFloat(ag.adherence) >= activeShiftPolicy.targetAdherence ? '#10b981' : '#ef4444';
    let qaColor = qa.qaScore >= 80 ? '#10b981' : (qa.qaScore >= 60 ? '#f59e0b' : '#ef4444');
    let toneColor = (qa.tone.includes('Rudely') || qa.tone.includes('Bad')) ? '#ef4444' : '#10b981';

    let actionRecommendation = '';
    if (qa.tone.includes('Rudely') || qa.tone.includes('Bad') || qa.qaScore < 60) {
      actionRecommendation = `<div style="background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:8px 10px; margin-top:8px; color:#991b1b; font-size:11px;">
        <strong>🚨 Supervisor Action Recommended:</strong> Immediate coaching required on tone &amp; customer verification. Discretionary break requests should be throttled until shift adherence recovers &ge;85%.
      </div>`;
    } else if (ag.adherence.includes('7') || ag.lunchVariance.includes('+25')) {
      actionRecommendation = `<div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:8px 10px; margin-top:8px; color:#92400e; font-size:11px;">
        <strong>⚠️ Supervisor Action Recommended:</strong> Shift schedule variance flag. Supervisor review needed before approving additional AUX intervals.
      </div>`;
    } else {
      actionRecommendation = `<div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:6px; padding:8px 10px; margin-top:8px; color:#065f46; font-size:11px;">
        <strong>✓ Status Optimal:</strong> Agent is operating within schedule adherence targets and eligible for dynamic cross-skill flex if needed.
      </div>`;
    }

    const assignedSup = AGENT_SUPERVISOR_MAP[matchedAgentKey] || { supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins' };
    let text = `👤 <strong>Agent 360° Profile: ${ag.name} (${matchedAgentKey})</strong><br/>` +
      `• <strong>Assigned Supervisor</strong>: <span style="background:#eff6ff; color:#1d4ed8; padding:1px 6px; border-radius:4px; font-weight:700;">${assignedSup.supervisorName} (${assignedSup.supervisorId})</span><br/>` +
      `• <strong>Assigned Skill</strong>: ${ag.queue} | Status: <strong>${ag.status}</strong><br/>` +
      `• <strong>Schedule Adherence</strong>: <strong style="color:${adherenceColor};">${ag.adherence}</strong> (Target: &ge;${activeShiftPolicy.targetAdherence}%)<br/>` +
      `• <strong>Breaks Logged Today</strong>: <strong>${ag.teaBreaks} AUX Breaks</strong> | Lunch Variance: <strong>${ag.lunchVariance}</strong><br/>` +
      `• <strong>Interaction Speech Tone</strong>: <strong style="color:${toneColor};">${qa.tone}</strong><br/>` +
      `• <strong>Customer CSAT &amp; QA Score</strong>: <strong>★ ${qa.ivrStars.toFixed(1)} / 5.0</strong> | QA: <strong style="color:${qaColor};">${qa.qaScore}%</strong><br/>` +
      `• <strong>Open IT Incidents</strong>: ${itTicket ? `<span style="color:#ef4444; font-weight:700;">${itTicket.id} (${itTicket.category} - ${itTicket.status})</span>` : 'None (Hardware Normal)'}<br/>` +
      actionRecommendation;

    return { success: true, answer: text, category: 'single_agent_dossier' };
  }

  // ==========================================
  // 2. SUPERVISOR DEEP INSIGHT REPORTS
  // ==========================================

  // Report A: Tone vs CSAT Correlation Report
  if (qLower.includes('correlation') || qLower.includes('tone vs') || qLower.includes('csat report') || qLower.includes('sentiment vs') || qLower.includes('tone_csat_report')) {
    let text = `📈 <strong>Executive Insight: Speech Tone vs Customer CSAT Correlation Report</strong><br/>` +
      `<p style="font-size:11px; color:#1e3a8a; margin:4px 0 8px 0;">Cross-correlation analysis across 140 post-call IVR survey responses and automated speech emotion detection.</p>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin-bottom:8px; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `• <strong>Empathetic / Professional Tone (66.7% of agents)</strong>: Average CSAT <strong>★ 4.90 / 5.0</strong> | First Call Resolution: <strong>100%</strong> | Repeat Transfer Rate: <strong>2.1%</strong><br/>` +
      `• <strong>Neutral / Direct Tone (16.7% of agents)</strong>: Average CSAT <strong>★ 3.70 / 5.0</strong> | First Call Resolution: <strong>80%</strong> | Repeat Transfer Rate: <strong>8.4%</strong><br/>` +
      `• <strong>Rudely / Impatient / Confused Tone (16.6% of agents)</strong>: Average CSAT <strong>★ 1.83 / 5.0</strong> | First Call Resolution: <strong>0%</strong> | Repeat Transfer Rate: <strong>41.2%</strong>` +
      `</div>` +
      `<strong>Key Operational Takeaway:</strong> Impatient speech tone creates an immediate <strong>-3.07 star CSAT penalty</strong> and increases repeat callback probability by 5x. Recommending mandatory de-escalation coaching for flagged agents.`;
    return { success: true, answer: text, category: 'tone_csat_correlation' };
  }

  // Report B: Burnout & Fatigue Risk Analysis
  if (qLower.includes('burnout') || qLower.includes('fatigue') || qLower.includes('stress') || qLower.includes('overworked') || qLower.includes('burnout_report')) {
    let text = `⚠️ <strong>Floor-Wide Agent Burnout &amp; Fatigue Risk Report</strong><br/>` +
      `<p style="font-size:11px; color:#1e3a8a; margin:4px 0 8px 0;">Algorithm evaluates consecutive call handling minutes, handle time variance, and missed discretionary break intervals.</p>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin-bottom:8px; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `• <strong>High Fatigue Risk (Tier-1 Alert)</strong>: <strong>Samantha Vance (AGT-9102)</strong> — 4.2 consecutive hours on high-load billing queue, missed 15:00 aux break, ACW handle time expanding (+28s).<br/>` +
      `• <strong>Moderate Fatigue Risk</strong>: <strong>Carlos Mendez (AGT-4491)</strong> — Continuous VPN troubleshooting calls with zero AUX downtime today.<br/>` +
      `• <strong>Optimal Energy Level</strong>: 10 of 12 agents operating with healthy break distribution and nominal occupancy (&lt;82%).` +
      `</div>` +
      `<strong>Recommendation:</strong> Schedule an immediate 15-minute bio/aux break for Samantha Vance to prevent ACW degradation and customer escalation.`;
    return { success: true, answer: text, category: 'burnout_risk' };
  }

  // Report C: Intraday Erlang-C Staffing Deficit Projection
  if (qLower.includes('erlang') || qLower.includes('deficit') || qLower.includes('projection') || qLower.includes('understaff') || qLower.includes('forecast') || qLower.includes('erlang_report')) {
    let text = `🎯 <strong>Intraday Erlang-C Staffing Deficit &amp; Capacity Projection</strong><br/>` +
      `<p style="font-size:11px; color:#1e3a8a; margin:4px 0 8px 0;">Calculates projected call arrivals against required human FTEs in 15-minute intervals across all active skills.</p>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin-bottom:8px; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `• <strong>Customer Billing Peak (10:00 - 11:30)</strong>: Projected Volume: <strong>320 calls/hr</strong> | Required FTEs: <strong>7.2</strong> | Assigned: <strong>4</strong> &rarr; <span style="color:#ef4444; font-weight:700;">Deficit: -3.2 FTEs (SLA risk: &lt;40%)</span><br/>` +
      `• <strong>General Customer Service (10:00 - 11:30)</strong>: Projected Volume: <strong>45 calls/hr</strong> | Required FTEs: <strong>2.0</strong> | Assigned: <strong>5</strong> &rarr; <span style="color:#10b981; font-weight:700;">Surplus: +3.0 FTEs (Occupancy: 28%)</span><br/>` +
      `• <strong>Tech Support &amp; Emergency Queues</strong>: Staffing matched to Erlang-C target (80% SLA in 20s).` +
      `</div>` +
      `<strong>Resolution:</strong> Execute Intraday Skill Flex (3 CS agents to Billing) to completely neutralize the -3.2 FTE deficit without costly overtime.`;
    return { success: true, answer: text, category: 'erlang_deficit_projection' };
  }

  // Report D: Chronic Adherence Outliers & Repeat Violators
  if (qLower.includes('outlier') || qLower.includes('violator') || qLower.includes('chronic') || qLower.includes('repeat overage') || qLower.includes('adherence_outliers')) {
    let text = `🚨 <strong>Chronic Schedule Adherence Outliers Audit (Past 14 Days)</strong><br/>` +
      `<p style="font-size:11px; color:#1e3a8a; margin:4px 0 8px 0;">Identifies repeat behavioral anomalies across aux break quotas, lunch overages, and CTI login punctuality.</p>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin-bottom:8px; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `1. <strong>Jordan Miller (AGT-4092)</strong>: <strong>78.5% Adherence</strong> | 4 AUX Breaks today (Limit: 2) | Pattern: 3rd occurrence this week.<br/>` +
      `2. <strong>Samantha Vance (AGT-9102)</strong>: <strong>71.2% Adherence</strong> | +25 mins Lunch Variance | Barred from self-service lunch grants.<br/>` +
      `3. <strong>David Chen (AGT-7740)</strong>: <strong>68.0% Adherence</strong> | Frequent mid-shift CTI disconnects (Throttle active).` +
      `</div>` +
      `<strong>Recommended Action:</strong> Issue formal automated WFM adherence counseling notices to Jordan Miller and Samantha Vance.`;
    return { success: true, answer: text, category: 'chronic_outliers' };
  }

  // Report E: Cross-Queue Multi-Skill Flex Readiness Matrix
  if (qLower.includes('matrix') || qLower.includes('multi-skill') || qLower.includes('readiness') || qLower.includes('cross-trained') || qLower.includes('multiskill_matrix')) {
    let text = `⚡ <strong>Multi-Skill Cross-Training &amp; Dynamic Flex Readiness Matrix</strong><br/>` +
      `<p style="font-size:11px; color:#1e3a8a; margin:4px 0 8px 0;">Real-time inventory of agents cross-certified to handle secondary surge queues.</p>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin-bottom:8px; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `• <strong>Samantha Vance (AGT-9102)</strong>: Base: Customer Service &bull; Certified Secondary: <strong>Billing &amp; Payments (Level 2)</strong> &bull; Flex Ready: <strong style="color:#10b981;">YES</strong><br/>` +
      `• <strong>Rachel Green (AGT-6512)</strong>: Base: Customer Service &bull; Certified Secondary: <strong>Billing &amp; Payments (Level 3)</strong> &bull; Flex Ready: <strong style="color:#10b981;">YES</strong><br/>` +
      `• <strong>Marcus Brody (AGT-8819)</strong>: Base: Customer Service &bull; Certified Secondary: <strong>Billing &amp; Payments (Level 1)</strong> &bull; Flex Ready: <strong style="color:#10b981;">YES</strong><br/>` +
      `• <strong>Carlos Mendez (AGT-4491)</strong>: Base: Tech Support &bull; Certified Secondary: <strong>Hardware Diagnostics</strong> &bull; Flex Ready: Standby` +
      `</div>` +
      `All 3 certified Billing agents can be flexed simultaneously in under 5 seconds with zero system restart required.`;
    return { success: true, answer: text, category: 'multiskill_matrix' };
  }

  // ==========================================
  // 3. ENTERPRISE BILLING & ADJUSTMENT INTELLIGENCE
  // ==========================================
  if (qLower.includes('billing') || qLower.includes('credit') || qLower.includes('refund') || qLower.includes('waiver') || qLower.includes('waive') || qLower.includes('surcharge') || qLower.includes('fee') || qLower.includes('dispute') || qLower.includes('autopay') || qLower.includes('auto-pay') || qLower.includes('promo code') || qLower.includes('charge')) {
    let text = `💳 <strong>Billing Governance &amp; Credit Adjustment Authority:</strong><br/>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin:6px 0; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `• <strong>Frontline Agent Discretionary Limit</strong>: Authorized up to <strong>$50.00</strong> courtesy adjustment per rolling 12 months with disposition <code>RESOLVED_BILLING_CREDIT</code>.<br/>` +
      `• <strong>Tier-2 Lead Sign-off</strong>: Required for credits between <strong>$50.01 &ndash; $150.00</strong>.<br/>` +
      `• <strong>Supervisor Override (SUP-014)</strong>: Mandatory for credits &gt; <strong>$150.00</strong> or multi-month fee reversions.<br/>` +
      `• <strong>Promotional Rate Continuity</strong>: If promotional rate expired, enter code <code>RET-PROMO-2026</code> to extend 12-month discount.<br/>` +
      `• <strong>Paperless Auto-Pay Discount</strong>: $5/month recurring reduction upon valid checking account or debit enrollment.` +
      `</div>` +
      `<strong>Recommended Customer Script:</strong><br/>` +
      `<div style="background:#eff6ff; border-left:3px solid #2563eb; padding:8px 10px; border-radius:4px; font-size:11px; color:#0f172a; font-style:italic; margin-top:4px;">` +
      `"I apologize for the confusion regarding the surcharge on your statement. I have reviewed your billing history and applied a one-time courtesy adjustment credit of $25 to your balance today."` +
      `</div>`;
    return { success: true, answer: text, category: 'billing_governance' };
  }

    // ==========================================
  // 4. SECURITY, PIN AUTH & FRAUD PREVENTION
  // ==========================================
  const isAuthSecurityQuery =
    qLower.includes('athun') ||
    qLower.includes('auth') ||
    qLower.includes('authen') ||
    qLower.includes('autent') ||
    qLower.includes('pin') ||
    qLower.includes('otp') ||
    qLower.includes('verify') ||
    qLower.includes('verif') ||
    qLower.includes('password') ||
    qLower.includes('security') ||
    qLower.includes('identity') ||
    qLower.includes('bypass') ||
    qLower.includes('fraud') ||
    qLower.includes('sim swap') ||
    qLower.includes('login') ||
    qLower.includes('sso') ||
    qLower.includes('credential');

  if (isAuthSecurityQuery) {
    const isTroubleshooting =
      qLower.includes('not working') ||
      qLower.includes('fail') ||
      qLower.includes('cant') ||
      qLower.includes("can't") ||
      qLower.includes('unable') ||
      qLower.includes('error') ||
      qLower.includes('stuck') ||
      qLower.includes('trouble') ||
      qLower.includes('issue') ||
      qLower.includes('reset') ||
      qLower.includes('bypass') ||
      qLower.includes('forgot');

    let text = '';
    if (isTroubleshooting) {
      text = `🛡️ <strong>Authentication Troubleshooting &amp; Bypass Protocols:</strong><br/>` +
        `<p style="font-size:11px; color:#1e3a8a; margin:4px 0 6px 0;">Troubleshooting steps for customer caller authentication failures and agent portal SSO sessions:</p>` +
        `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin:6px 0; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
        `• <strong>Case 1: Customer Did Not Receive SMS OTP</strong><br/>` +
        `&nbsp;&nbsp;1. Verify mobile phone number (ANI) matches record on file.<br/>` +
        `&nbsp;&nbsp;2. Wait 30 seconds for carrier gateway buffer, then click <em>"Re-send OTP"</em>.<br/>` +
        `&nbsp;&nbsp;3. If SMS fails twice, pivot immediately to Secondary PIN Bypass below.<br/>` +
        `• <strong>Case 2: Forgotten Customer PIN &bull; Secondary Auth Protocol</strong><br/>` +
        `&nbsp;&nbsp;Validate at least <strong>3 of 4</strong> secondary identity credentials:<br/>` +
        `&nbsp;&nbsp;&nbsp;&nbsp;✓ 1. Billing ZIP code on account profile<br/>` +
        `&nbsp;&nbsp;&nbsp;&nbsp;✓ 2. Last 4 digits of active payment card on file<br/>` +
        `&nbsp;&nbsp;&nbsp;&nbsp;✓ 3. Exact service installation / billing street address<br/>` +
        `&nbsp;&nbsp;&nbsp;&nbsp;✓ 4. Date and dollar amount of the last settled invoice<br/>` +
        `• <strong>Case 3: Agent Portal SSO / LDAP Authentication</strong><br/>` +
        `&nbsp;&nbsp;In the <a href="/portal.html" target="_blank" style="color:#2563eb; font-weight:700;">Break Portal</a>, your session is auto-authenticated via Enterprise SSO. Select your agent persona from the dropdown and click <em>"Authenticate &amp; Continue"</em> to refresh credentials.<br/>` +
        `• <strong>High-Risk Security Warning</strong>: <span style="color:#ef4444; font-weight:700;">NEVER bypass authentication</span> for SIM swaps, password resets, or account ownership transfers. Warm transfer line directly to Fraud Ops (Ext. #4409).<br/>` +
        `</div>` +
        `<strong>Recommended Customer Script:</strong><br/>` +
        `<div style="background:#eff6ff; border-left:3px solid #2563eb; padding:8px 10px; border-radius:4px; font-size:11px; color:#0f172a; font-style:italic; margin-top:4px;">` +
        `"No worries if you haven't received the verification code or have forgotten your security PIN. To protect your account, I can quickly verify your identity using a few alternate security details, such as your billing zip code and recent invoice amount."` +
        `</div>`;
    } else {
      text = `🛡️ <strong>Security Verification &amp; Authentication Protocols:</strong><br/>` +
        `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin:6px 0; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
        `• <strong>Standard Authentication</strong>: Send 6-digit SMS OTP to verified ANI or validate 4-digit Account Security PIN.<br/>` +
        `• <strong>Forgotten PIN Bypass Protocol</strong>: Validate at least <strong>3 of 4</strong> secondary credentials:<br/>` +
        `&nbsp;&nbsp;1. Billing ZIP code on file<br/>` +
        `&nbsp;&nbsp;2. Last 4 digits of payment card on file<br/>` +
        `&nbsp;&nbsp;3. Exact physical service installation address<br/>` +
        `&nbsp;&nbsp;4. Date and amount of the last settled invoice<br/>` +
        `• <strong>Agent SSO / Portal Auth</strong>: Enterprise SSO auto-authenticates agent sessions. Manual re-verification available in Step 1 of Break Portal.<br/>` +
        `• <strong>High-Risk Restriction</strong>: <span style="color:#ef4444; font-weight:700;">NEVER bypass PIN</span> for SIM swaps, password resets, or authorized contact modifications. Warm transfer to Fraud Ops (Ext. #4409).<br/>` +
        `</div>` +
        `<strong>Recommended Customer Script:</strong><br/>` +
        `<div style="background:#eff6ff; border-left:3px solid #2563eb; padding:8px 10px; border-radius:4px; font-size:11px; color:#0f172a; font-style:italic; margin-top:4px;">` +
        `"To protect your privacy and account security, I have dispatched a one-time 6-digit verification code to the phone number on file. Please read that back to me whenever you are ready."` +
        `</div>`;
    }
    return { success: true, answer: text, category: 'security_protocol' };
  }

  // ==========================================
  // 5. DE-ESCALATION, RETENTION & EMPATHY
  // ==========================================
  if (qLower.includes('empathy') || qLower.includes('angry') || qLower.includes('de-escalat') || qLower.includes('frustrat') || qLower.includes('upset') || qLower.includes('yell') || qLower.includes('cancel') || qLower.includes('retention') || qLower.includes('churn') || qLower.includes('hear framework') || qLower.includes('rude')) {
    let text = `🤝 <strong>Customer De-escalation &amp; Retention Playbook:</strong><br/>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin:6px 0; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `• <strong>The H.E.A.R. Framework</strong>:<br/>` +
      `&nbsp;&nbsp;<strong>H - Hear</strong>: Allow customer to vent without interruption (minimum 30 seconds).<br/>` +
      `&nbsp;&nbsp;<strong>E - Empathize</strong>: Validate emotions ("I completely understand how disruptive this has been...").<br/>` +
      `&nbsp;&nbsp;<strong>A - Acknowledge</strong>: Restate their exact issue with concrete terms.<br/>` +
      `&nbsp;&nbsp;<strong>R - Resolve</strong>: State immediate corrective action with definite timeline.<br/>` +
      `• <strong>Retention Loyalty Offer</strong>: Customers threatening disconnect are eligible for Tier-2 Retention Loyalty credit (<strong>$15/month discount for 12 months</strong>) before order cancellation.` +
      `</div>` +
      `<strong>Recommended Turnaround Script:</strong><br/>` +
      `<div style="background:#eff6ff; border-left:3px solid #2563eb; padding:8px 10px; border-radius:4px; font-size:11px; color:#0f172a; font-style:italic; margin-top:4px;">` +
      `"I completely understand your frustration with this service delay, and I sincerely appreciate your patience. You have reached the right specialist, and I am taking direct personal ownership of this inquiry until it is 100% resolved."` +
      `</div>`;
    return { success: true, answer: text, category: 'deescalation_playbook' };
  }

  // ==========================================
  // 6. SUPERVISOR ESCALATION & WARM TRANSFER
  // ==========================================
  if (qLower.includes('supervisor') || qLower.includes('manager') || qLower.includes('escalat') || qLower.includes('transfer') || qLower.includes('sarah') || qLower.includes('floor leadership') || qLower.includes('on duty') || qLower.includes('lead')) {
    let text = `🛡️ <strong>Floor Leadership &amp; Supervisor Escalation Workflow:</strong><br/>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin:6px 0; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `• <strong>Active Floor Supervisor</strong>: <strong>Sarah Jenkins (SUP-014)</strong> &bull; Desk: Lead Pod B &bull; Status: Available<br/>` +
      `• <strong>Warm Transfer Protocol</strong>:<br/>` +
      `&nbsp;&nbsp;1. Inform the customer: <em>"I will be glad to connect you with my floor supervisor, Sarah Jenkins."</em><br/>` +
      `&nbsp;&nbsp;2. Put customer on brief soft-hold (&lt;60s).<br/>` +
      `&nbsp;&nbsp;3. Brief supervisor via CXone internal consult: provide Contact ID (#90421), customer name, reason for escalation, and your resolution attempt.<br/>` +
      `&nbsp;&nbsp;4. Complete conference transfer; do not blind-drop.` +
      `</div>` +
      `<strong>Recommended Customer Bridging Script:</strong><br/>` +
      `<div style="background:#eff6ff; border-left:3px solid #2563eb; padding:8px 10px; border-radius:4px; font-size:11px; color:#0f172a; font-style:italic; margin-top:4px;">` +
      `"I will be glad to connect you with my supervisor, Sarah Jenkins. Before I transfer your line, may I take 60 seconds to review the case details so I can brief her directly on the exact resolution you are requesting?"` +
      `</div>`;
    return { success: true, answer: text, category: 'supervisor_escalation' };
  }

  // ==========================================
  // SERVICENOW TICKET STATUS & CMDB LOOKUP
  // ==========================================
  const detectedTicketId = extractServiceNowTicketId(query);

  if (detectedTicketId) {
    const ticket = getOrGenerateServiceNowTicket(detectedTicketId, agentId);
    let text = `🎫 <strong>ServiceNow Incident Record: ${ticket.id}</strong><br/>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:8px; padding:12px; margin:6px 0; box-shadow:0 1px 4px rgba(37,99,235,0.05);">` +
      `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:4px;">` +
      `<span style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; padding:2px 8px; border-radius:4px; font-weight:800; font-size:10px;">SERVICENOW CMDB &bull; ${ticket.severity}</span>` +
      `<span style="background:#eff6ff; color:${ticket.statusBadgeColor}; border:1px solid #bfdbfe; padding:2px 8px; border-radius:12px; font-weight:800; font-size:10px;">● ${ticket.statusLabel.toUpperCase()}</span>` +
      `</div>` +
      `• <strong>Category / Issue</strong>: ${ticket.category}<br/>` +
      `• <strong>Caller / Agent</strong>: <strong>${ticket.agentName} (${ticket.agentId})</strong> &bull; ${ticket.queue}<br/>` +
      `• <strong>Assignment Group</strong>: <strong>${ticket.assignedTo}</strong> (${ticket.assignedEngineer})<br/>` +
      `• <strong>SLA Performance</strong>: ${ticket.slaTarget}<br/>` +
      `• <strong>Latest Work Note</strong>: <em style="color:#0f172a;">"${ticket.workNotes}"</em>` +
      `</div>` +
      `<small style="color:#1e3a8a; font-weight:600;">To append notes or request priority escalation, submit details via the Break Portal under AUX-5.</small>`;
    return { success: true, answer: text, category: 'servicenow_ticket_detail' };
  }

  if (qLower.includes('servicenow') || qLower.includes('service now') || qLower.includes('ticket') || qLower.includes('snow') || qLower.includes('incident status') || qLower.includes('helpdesk')) {
    let relevantTickets = SERVICENOW_TICKETS;
    if (qLower.includes('my ticket') || qLower.includes('my incident')) {
      const myTickets = SERVICENOW_TICKETS.filter(t => t.agentId === agentId);
      if (myTickets.length > 0) relevantTickets = myTickets;
    }

    let ticketRows = relevantTickets.map(t => {
      return `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:8px 10px; margin-bottom:6px; box-shadow:0 1px 3px rgba(37,99,235,0.04);">` +
        `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">` +
        `<strong><span style="color:#2563eb;">${t.id}</span> (${t.type})</strong>` +
        `<span style="background:#eff6ff; color:${t.statusBadgeColor}; border:1px solid #bfdbfe; padding:1px 6px; border-radius:10px; font-size:9.5px; font-weight:800;">● ${t.statusLabel}</span>` +
        `</div>` +
        `<div style="font-size:11px; color:#0f172a; margin-bottom:2px;">• <strong>${t.category}</strong> [${t.severity}]</div>` +
        `<div style="font-size:10.5px; color:#1e3a8a;">Caller: ${t.agentName} &bull; Assigned: ${t.assignedEngineer} &bull; SLA: ${t.slaTarget}</div>` +
        `</div>`;
    }).join('');

    let text = `🎫 <strong>ServiceNow Enterprise IT Service Desk (Live Telemetry):</strong><br/>` +
      `<p style="font-size:11px; color:#1e3a8a; margin:4px 0 6px 0;">Connected to ServiceNow Instance <strong>nice-cxone-wfm.service-now.com</strong> &bull; ${relevantTickets.length} active records:</p>` +
      `<div style="margin:6px 0;">${ticketRows}</div>` +
      `<small style="color:#1e3a8a; font-weight:600;">Type any ticket number (e.g. <em>"INC-88102"</em>, <em>"INC-55421"</em>, or <em>"ticket 99412"</em>) for instant live details.</small>`;
    return { success: true, answer: text, category: 'servicenow_ticket_roster' };
  }

  // ==========================================
  // 7. WEBRTC, SOFTPHONE & TECHNICAL KBA
  // ==========================================
  if (qLower.includes('webrtc') || qLower.includes('audio') || qLower.includes('mic') || qLower.includes('headset') || qLower.includes('one-way') || qLower.includes('one way') || qLower.includes('code 99') || qLower.includes('vpn') || qLower.includes('citrix') || qLower.includes('vdi') || qLower.includes('kba') || qLower.includes('troubleshoot') || qLower.includes('diagnostic')) {
    let ticketList = itIncidents.slice(0, 3).map(t => `• <strong>${t.id} [${t.status}]</strong>: ${t.agentName} &ndash; ${t.category} (${t.severity})`).join('<br/>');
    let text = `🎧 <strong>NICE CXone &amp; Workstation Technical Diagnostics:</strong><br/>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin:6px 0; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `• <strong>WebRTC One-Way Audio</strong>: Occurs when UDP port range 10000-20000 is blocked or media stream drops. Toggle MAX softphone audio endpoint (USB headset &harr; Default), then refresh browser WebRTC ICE session.<br/>` +
      `• <strong>Agent State Code 99 (Heartbeat Outage)</strong>: Session socket timed out. Perform browser hard refresh (Ctrl+F5) or re-authenticate via Okta SSO.<br/>` +
      `• <strong>VPN Packet Loss (MTU 1350)</strong>: Cisco AnyConnect packet fragmentation on residential ISPs. Run <code>netsh interface ipv4 set subinterface "Cisco AnyConnect" mtu=1350 store=persistent</code>.<br/>` +
      `• <strong>Active IT Incidents</strong>:<br/>${ticketList}` +
      `</div>` +
      `<small style="color:#1e3a8a; font-weight:600;">Need immediate hardware swap? Request AUX-5 System Issue in the Break Portal.</small>`;
    return { success: true, answer: text, category: 'technical_troubleshooting' };
  }

  // ==========================================
  // 8. ACD QUEUE TELEMETRY & TRAFFIC
  // ==========================================
  if (qLower.includes('volume') || qLower.includes('queue') || qLower.includes('calls waiting') || qLower.includes('billing calls') || qLower.includes('traffic') || qLower.includes('wait time') || qLower.includes('how many calls') || qLower.includes('surge') || qLower.includes('sla')) {
    let text = `📊 <strong>Real-Time ACD Queue Telemetry:</strong><br/>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin:6px 0; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `• <strong>Billing &amp; Payments</strong>: <strong>${billingQ.callsWaiting} calls waiting</strong> | Avg Wait: <strong>${billingQ.avgWaitSeconds}s</strong> | SLA: <strong>${billingQ.currentSla}%</strong> (${billingQ.status})<br/>` +
      `• <strong>General Customer Service</strong>: <strong>${csQ.callsWaiting} calls waiting</strong> | Avg Wait: <strong>${csQ.avgWaitSeconds}s</strong> | SLA: <strong>${csQ.currentSla}%</strong> (${csQ.status})<br/>` +
      `• <strong>Tier-2 Tech Support</strong>: <strong>${techQ.callsWaiting} calls waiting</strong> | Avg Wait: <strong>${techQ.avgWaitSeconds}s</strong> | SLA: <strong>${techQ.currentSla}%</strong><br/>` +
      `• <strong>Emergency Inbound</strong>: <strong>${emergQ.callsWaiting} calls waiting</strong> | Avg Wait: <strong>${emergQ.avgWaitSeconds}s</strong>` +
      `</div>` +
      `<small style="color:#1e3a8a; display:block; margin-top:4px;">Total Inbound Traffic: <strong>${ivrDeflectionState.callVolumeRatePerMin} calls/min</strong>. ${isRebalanced ? '🔄 Dynamic WFM Skill Rebalance Active (3 CS agents flexed to Billing).' : (isSurge ? '⚠️ High Call Volume Surge Active.' : '✓ Queues within nominal operating parameters.')}</small>`;
    return { success: true, answer: text, category: 'queue_volume' };
  }

  // ==========================================
  // 9. SCHEDULE ADHERENCE & BREAK POLICY
  // ==========================================
  if (qLower.includes('adherence') || qLower.includes('aux break') || qLower.includes('my break') || qLower.includes('lunch') || qLower.includes('can i take') || qLower.includes('breaks left') || qLower.includes('quota') || qLower.includes('policy') || qLower.includes('variance') || qLower.includes('frequency')) {
    let advice = '✓ Your adherence and break history are in good standing.';
    if (parseInt(agent.teaBreaks.split('/')[0]) > activeShiftPolicy.maxTeaBreaks) {
      advice = `⚠️ Behavioral Flag: You have logged ${agent.teaBreaks.split('/')[0]} aux breaks today (Shift limit set by supervisor: ${activeShiftPolicy.maxTeaBreaks}). Next requests require supervisor override.`;
    } else if (agent.lunchVariance.includes('+') && parseInt(agent.lunchVariance.replace(/[^0-9]/g, '')) > activeShiftPolicy.lunchVarianceThreshold) {
      advice = `⚠️ Chronic Lunch Overage: Previous shift logged ${agent.lunchVariance} variance (Supervisor threshold: <${activeShiftPolicy.lunchVarianceThreshold}m). Break grants require supervisor review.`;
    }

    const windowLabel = activeShiftPolicy.frequencyWindow === '2_WEEKS' ? '2 Weeks (Bi-Weekly)' : '1 Week (Rolling)';

    let text = `⏱️ <strong>Live Adherence &amp; Schedule Parameters (${agent.name}):</strong><br/>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin:6px 0; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `• <strong>CXone Adherence</strong>: <strong style="color:${parseFloat(agent.adherence) >= activeShiftPolicy.targetAdherence ? '#10b981' : '#ef4444'};">${agent.adherence}</strong> (Supervisor Target: &ge; ${activeShiftPolicy.targetAdherence}%)<br/>` +
      `• <strong>AUX Breaks Taken</strong>: <strong>${agent.teaBreaks.split('/')[0]} / ${activeShiftPolicy.maxTeaBreaks}</strong> (Policy Limit: Max ${activeShiftPolicy.maxTeaBreaks}/shift)<br/>` +
      `• <strong>Lunch Variance</strong>: <strong>${agent.lunchVariance}</strong> (Allowed Tolerance: &lt;${activeShiftPolicy.lunchVarianceThreshold}m)<br/>` +
      `• <strong>Request Frequency Limit</strong>: <strong>${agent.freq.split('/')[0]} / ${activeShiftPolicy.maxFrequencyRequests}</strong> requests per ${windowLabel}` +
      `</div>` +
      `<p style="margin:4px 0; font-size:11px; color:#1e3a8a; font-weight:600;">${advice}</p>` +
      `<small style="color:#1e3a8a; display:block; margin-top:2px;">*Shift policy rules managed by Floor Supervisor (${activeShiftPolicy.lastUpdatedBy}).</small>`;
    return { success: true, answer: text, category: 'adherence_telemetry' };
  }

  // ==========================================
  // 10. STORM & IVR DEFLECTION
  // ==========================================
  if (qLower.includes('storm') || qLower.includes('weather') || qLower.includes('tornado') || qLower.includes('hurricane') || qLower.includes('outage') || qLower.includes('deflection') || qLower.includes('1000') || qLower.includes('announcement') || qLower.includes('field workers')) {
    const isAct = ivrDeflectionState.isDeflectionActive;
    let text = `🌪️ <strong>Real-Time Storm &amp; Outage Deflection Telemetry:</strong><br/>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin:6px 0; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `• <strong>Live Inbound Rate</strong>: <strong>${ivrDeflectionState.callVolumeRatePerMin} calls/min</strong> (Safety Ceiling: ${ivrDeflectionState.thresholdLimitPerMin}/min)<br/>` +
      `• <strong>Deflection Status</strong>: <strong style="color:${isAct ? '#ef4444' : '#10b981'};">${isAct ? '🚨 ACTIVE (Automated Deflection Running)' : '● STANDBY (Volume below 1,000/min)'}</strong><br/>` +
      `• <strong>Deflected Inquiries</strong>: <strong>${ivrDeflectionState.deflectedCallsCount} calls</strong> routed to field outage message.<br/>` +
      `• <strong>Caller IVR Message</strong>: <em>"${ivrDeflectionState.announcementText}"</em>` +
      `</div>` +
      `<strong>Recommended Customer Script:</strong><br/>` +
      `<div style="background:#eff6ff; border-left:3px solid #2563eb; padding:8px 10px; border-radius:4px; font-size:11px; color:#0f172a; font-style:italic; margin-top:4px;">` +
      `"Our dispatch operations center confirms that utility field crews are actively on-site restoring service in your sector. Real-time updates are sent via automated SMS every 30 minutes."` +
      `</div>`;
    return { success: true, answer: text, category: 'storm_deflection' };
  }

  // ==========================================
  // 11. WFM DYNAMIC SKILL REBALANCE
  // ==========================================
  if (qLower.includes('rebalance') || qLower.includes('flex') || qLower.includes('cross-skill') || qLower.includes('cross skill') || qLower.includes('why was i') || qLower.includes('schedule flex') || qLower.includes('flexed')) {
    let text = `🔄 <strong>Dynamic WFM Intraday Skill Rebalance:</strong><br/>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin:6px 0; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `• <strong>Billing Queue Surge</strong>: ${billingQ.callsWaiting} calls waiting (${billingQ.occupancyPct}% occupancy)<br/>` +
      `• <strong>Customer Service Surplus</strong>: ${csQ.callsWaiting} calls waiting (${csQ.occupancyPct}% occupancy)<br/>` +
      `• <strong>WFM Flex Status</strong>: <strong style="color:${isRebalanced ? '#2563eb' : '#f59e0b'};">${isRebalanced ? '✓ Active: 3 CS Agents Flexed to Billing' : 'Standby / Surge Monitoring'}</strong>` +
      `</div>` +
      `<small style="color:#1e3a8a; display:block; margin-top:4px;">When Billing call arrivals surge while General CS agents are idle, WFM automatically cross-skills CS agents to Billing to maintain SLA above 80% without overtime.</small>`;
    return { success: true, answer: text, category: 'wfm_rebalance' };
  }

  // ==========================================
  // 12. CALL CLOSING & FIRST-CALL RESOLUTION
  // ==========================================
  if (qLower.includes('closing') || qLower.includes('wrap-up') || qLower.includes('wrap up') || qLower.includes('end call') || qLower.includes('fcr') || qLower.includes('first call resolution') || qLower.includes('goodbye') || qLower.includes('survey')) {
    let text = `📋 <strong>Call Closing &amp; First-Call Resolution Protocol:</strong><br/>` +
      `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin:6px 0; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
      `• <strong>Step 1 - Verbal Summary</strong>: Reiterate all actions executed (credit amounts, ticket numbers, service restoration times).<br/>` +
      `• <strong>Step 2 - Satisfaction Check</strong>: Explicitly ask: <em>"Have I completely resolved the reason for your call today?"</em><br/>` +
      `• <strong>Step 3 - Confirmation Dispatch</strong>: Confirm whether SMS or email receipt was queued.<br/>` +
      `• <strong>Step 4 - Survey Introduction</strong>: Mention the 1-question IVR survey to maximize positive CSAT.` +
      `</div>` +
      `<strong>Recommended Standard Closing Script:</strong><br/>` +
      `<div style="background:#eff6ff; border-left:3px solid #2563eb; padding:8px 10px; border-radius:4px; font-size:11px; color:#0f172a; font-style:italic; margin-top:4px;">` +
      `"To recap: I have adjusted the $25 fee, restored your promotional rate for 12 months, and dispatched an email confirmation with reference #90421. Is there anything else I can assist you with today? Thank you for choosing ZEL!"` +
      `</div>`;
    return { success: true, answer: text, category: 'closing_protocol' };
  }

  // ==========================================
  // 13. COMPREHENSIVE LOCAL LLM BRIEFING (DEFAULT / NLP REASONING)
  // ==========================================
  let text = `🤖 <strong>Ask Shankar AI &bull; Live Telemetry &amp; Intelligence Briefing:</strong><br/>` +
    `<p style="font-size:11px; color:#1e3a8a; margin:4px 0 6px 0;">I have analyzed your inquiry: <em>"${query}"</em> against real-time ACD telemetry and enterprise guidelines.</p>` +
    `<div style="background:#ffffff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; font-size:11px; margin:6px 0; box-shadow:0 1px 3px rgba(37,99,235,0.05);">` +
    `• <strong>Active Telephony State</strong>: Switching cluster normal &bull; Inbound: <strong>${ivrDeflectionState.callVolumeRatePerMin} calls/min</strong><br/>` +
    `• <strong>Your Status (${agent.name})</strong>: Adherence <strong>${agent.adherence}</strong> &bull; Breaks: <strong>${agent.teaBreaks}</strong><br/>` +
    `• <strong>Queues Load</strong>: Billing (${billingQ.callsWaiting} calls, ${billingQ.avgWaitSeconds}s wait) &bull; CS (${csQ.callsWaiting} calls)<br/>` +
    `• <strong>Quick Topics Available</strong>: Ask about <strong>credit limits</strong>, <strong>PIN bypass</strong>, <strong>storm deflection</strong>, <strong>de-escalation scripts</strong>, or <strong>supervisor escalation</strong>.` +
    `</div>` +
    `<small style="color:#1e3a8a; font-weight:600;">Click any quick prompt chip below or type a specific customer question to receive step-by-step guidance.</small>`;
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

