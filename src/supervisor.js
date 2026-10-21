// supervisor.js - Logic for the NICE CXone Supervisor Command Center

// Active Shift Agents Roster
let activeAgents = [
  { id: 'AGT-8842', name: 'Alex Morgan', queue: 'Tier-2 Tech Support', state: 'AVAILABLE', breakLeft: '-', adherence: '96.4%', teaCount: 1, lunchVar: '0m' },
  { id: 'AGT-4092', name: 'Jordan Miller', queue: 'Customer Billing & Retention', state: 'AVAILABLE', breakLeft: '-', adherence: '78.5%', teaCount: 4, lunchVar: '0m' },
  { id: 'AGT-9102', name: 'Samantha Vance', queue: 'General Customer Service', state: 'WORKING (IN CALL)', breakLeft: '-', adherence: '71.2%', teaCount: 1, lunchVar: '+25m' },
  { id: 'AGT-7740', name: 'David Chen', queue: 'Emergency Inbound', state: 'AUX: TEA BREAK', breakLeft: '08:42', adherence: '82.0%', teaCount: 2, lunchVar: '0m' },
  { id: 'AGT-6512', name: 'Rachel Green', queue: 'General Customer Service', state: 'AVAILABLE', breakLeft: '-', adherence: '98.2%', teaCount: 1, lunchVar: '0m' },
  { id: 'AGT-8819', name: 'Marcus Brody', queue: 'General Customer Service', state: 'WORKING (IN CALL)', breakLeft: '-', adherence: '91.0%', teaCount: 1, lunchVar: '+2m' },
  { id: 'AGT-3310', name: 'Chloe Bennett', queue: 'General Customer Service', state: 'AVAILABLE', breakLeft: '-', adherence: '94.2%', teaCount: 1, lunchVar: '0m' },
  { id: 'AGT-5521', name: 'Lucas Wright', queue: 'Customer Billing & Retention', state: 'WORKING (IN CALL)', breakLeft: '-', adherence: '88.5%', teaCount: 2, lunchVar: '0m' },
  { id: 'AGT-7703', name: 'Maya Patel', queue: 'General Customer Service', state: 'AVAILABLE', breakLeft: '-', adherence: '97.0%', teaCount: 1, lunchVar: '0m' },
  { id: 'AGT-4491', name: 'Carlos Mendez', queue: 'Tier-2 Tech Support', state: 'AVAILABLE', breakLeft: '-', adherence: '85.0%', teaCount: 2, lunchVar: '+6m' },
  { id: 'AGT-6628', name: 'Olivia Taylor', queue: 'Emergency Inbound', state: 'AVAILABLE', breakLeft: '-', adherence: '99.5%', teaCount: 1, lunchVar: '0m' },
  { id: 'AGT-2219', name: "Liam O'Connor", queue: 'General Customer Service', state: 'AUX: TRAINING', breakLeft: '22:15', adherence: '76.5%', teaCount: 3, lunchVar: '+14m' }
];

// Supervisor Accounts
const SUPERVISOR_PROFILES = {
  'SUP-014': {
    id: 'SUP-014',
    name: 'Sarah Jenkins',
    role: 'Floor Lead & WFM Operations',
    subtext: 'Floor Operations Supervisor • All Queues',
    avatar: '👩‍💼',
    greeting: 'Hello Sarah Jenkins! 12 shift agents are online. Floor adherence is at 89.2%. How can I assist floor management today?'
  },
  'SUP-021': {
    id: 'SUP-021',
    name: 'Michael Chang',
    role: 'Billing & Retention Manager',
    subtext: 'Operations Manager • Billing & Retention',
    avatar: '👨‍💼',
    greeting: 'Welcome Michael Chang! Currently tracking Customer Billing & Retention queues and monitoring dispute resolution.'
  },
  'SUP-035': {
    id: 'SUP-035',
    name: 'Elena Rostova',
    role: 'QA & Compliance Director',
    subtext: 'Quality Assurance & Speech Tone Lead',
    avatar: '👩‍🔬',
    greeting: 'Hello Elena Rostova! 3 calls currently flagged for non-compliant tone or missed PIN verification. Coaching curriculum is ready.'
  },
  'SUP-042': {
    id: 'SUP-042',
    name: 'David Sterling',
    role: 'Emergency Inbound Director',
    subtext: 'Emergency Dispatch & Regional Outage Lead',
    avatar: '👨‍✈️',
    greeting: 'Greetings David Sterling! Emergency queue SLA is at 98.0%. IVR Outage Auto-Deflection stands ready at 1,000 calls/min.'
  },
  'SUP-059': {
    id: 'SUP-059',
    name: 'Priya Sharma',
    role: 'Intraday WFM Scheduling Architect',
    subtext: 'WFM Scheduling & Erlang-C Balancing Lead',
    avatar: '👩‍💻',
    greeting: 'Welcome Priya Sharma! Erlang-C staffing surplus (+4). Dynamic Cross-Skilling rebalancing is ready for intraday surges.'
  }
};
let currentSupervisor = SUPERVISOR_PROFILES['SUP-014'];

// Supervisor Configured Policy Limits
let policyLimits = {
  maxTeaBreaks: 2,
  lunchVarianceThreshold: 15,
  frequencyLimit30m: 3,
  targetAdherence: 90,
  targetAcwSeconds: 45,
  botGraceSeconds: 10
};

// Supervisor Dispatched Broadcasts
let activeSupervisorBroadcasts = [
  {
    id: 'BC-101',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    severity: 'INFO',
    title: 'Floor Briefing: Shift Huddle Complete',
    message: 'All agents requested to maintain >=90% adherence target for CXone queue SLAs today.'
  }
];

// Broadcast Channel
let bc = null;
try {
  bc = new BroadcastChannel('wfm_aux_channel');
  bc.onmessage = (event) => {
    const data = event.data;
    if (data.type === 'BREAK_APPROVED') {
      updateAgentState(data.payload.agent?.id || 'AGT-8842', `AUX: ${data.payload.auxCode}`, `${data.payload.durationMinutes}:00`);
      fetchQueue();
    } else if (data.type === 'BREAK_REJECTED') {
      fetchQueue();
    }
  };
} catch (e) {
  console.warn('BroadcastChannel error in supervisor:', e);
}

// Supervisor Tab Navigation
const supTabBtns = document.querySelectorAll('.sup-tab-btn');
const supTabPanes = document.querySelectorAll('.sup-tab-pane');

supTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    supTabBtns.forEach(b => b.classList.remove('active'));
    supTabPanes.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.getAttribute('data-tab');
    document.getElementById(target).classList.add('active');

    if (target === 'stab-reports') {
      loadReport(document.getElementById('report-type-select').value);
    }
    if (target === 'stab-qa') {
      renderQAScorecard();
    }
    if (target === 'stab-rebalance') {
      fetchQueueBalance();
    }
  });
});

// ==========================================
// TAB 1: WALLBOARD LOGIC
// ==========================================

function renderWallboard() {
  const tbody = document.getElementById('agent-wallboard-body');
  let overdueCount = 0;

  tbody.innerHTML = activeAgents.map(ag => {
    let stateTag = 'ready';
    if (ag.state.includes('AUX')) stateTag = 'aux';
    if (ag.state.includes('WORKING')) stateTag = 'ready';
    if (ag.state === 'OVERDUE') {
      stateTag = 'overdue';
      overdueCount++;
    }

    return `
      <tr>
        <td style="font-family:monospace; color:#9ca3af;">${ag.id}</td>
        <td><strong style="color:#fff;">${ag.name}</strong></td>
        <td>${ag.queue}</td>
        <td><span class="status-tag ${stateTag}">${ag.state}</span></td>
        <td style="font-family:monospace; color:#38bdf8;">${ag.breakLeft}</td>
        <td style="font-weight:700; color:${parseFloat(ag.adherence) >= policyLimits.targetAdherence ? '#34d399' : '#f87171'};">${ag.adherence}</td>
        <td>${ag.teaCount} / ${policyLimits.maxTeaBreaks}</td>
        <td>${ag.lunchVar}</td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-sm btn-outline" onclick="recallAgent('${ag.id}', '${ag.name}')" title="Place Automated Bot Voice Call">
              📞 Bot Recall
            </button>
            <button class="btn btn-sm btn-secondary" onclick="forceAvailable('${ag.id}')" title="Set Agent to Available">
              🔄 Available
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const overdueEl = document.getElementById('kpi-overdue');
  const overdueSub = document.getElementById('kpi-overdue-sub');
  if (overdueCount > 0) {
    overdueEl.textContent = overdueCount;
    overdueSub.textContent = 'Action Required: Bot call placed';
  } else {
    overdueEl.textContent = '0';
    overdueSub.textContent = 'No active overages';
  }
}

function updateAgentState(agentId, newState, breakLeft = '-') {
  const ag = activeAgents.find(a => a.id === agentId);
  if (ag) {
    ag.state = newState;
    ag.breakLeft = breakLeft;
    renderWallboard();
  }
}

window.recallAgent = function(agentId, agentName) {
  const customMessage = `Attention Agent ${agentName}: Supervisor Sarah Jenkins has issued an immediate workstation recall. Please return to your desk and switch to Available status.`;
  if (bc) {
    bc.postMessage({
      type: 'SUPERVISOR_RECALL',
      payload: { agentId, message: customMessage }
    });
  }
  alert(`Automated Bot Recall dispatched to ${agentName} (${agentId})! Their desktop widget will ring and speak the voice instructions.`);
};

window.forceAvailable = function(agentId) {
  updateAgentState(agentId, 'AVAILABLE', '-');
  alert(`Agent ${agentId} remotely switched to AVAILABLE state in NICE CXone.`);
};

document.getElementById('btn-refresh-wallboard').addEventListener('click', renderWallboard);

// ==========================================
// TAB 2: BREAK QUEUE LOGIC
// ==========================================

async function fetchQueue() {
  try {
    const res = await fetch('/api/supervisor-queue');
    if (res.ok) {
      const queue = await res.json();
      renderQueue(queue);
    }
  } catch (err) {
    console.warn('Could not fetch queue from server:', err);
  }
}

function renderQueue(queue) {
  const tbody = document.getElementById('queue-table-body');
  const badgeEl = document.getElementById('sup-queue-badge');
  badgeEl.textContent = queue.length || 0;

  if (!queue || queue.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#9ca3af; padding:20px;">No break requests in queue.</td></tr>`;
    return;
  }

  tbody.innerHTML = queue.map(item => {
    const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Now';
    const isApproved = item.status === 'APPROVED';
    const tagClass = isApproved ? 'approved' : 'rejected';
    
    return `
      <tr>
        <td style="color:#9ca3af; font-family:monospace;">${timeStr}</td>
        <td><strong>${item.id || 'REQ-AUTO'}</strong></td>
        <td>
          <div style="font-weight:600; color:#fff;">${item.agentName || 'Agent'}</div>
          <small style="color:#9ca3af;">${item.agentId || 'AGT'}</small>
        </td>
        <td>${item.auxCode || 'Break'}</td>
        <td>${item.durationMinutes ? item.durationMinutes + ' mins' : '-'}</td>
        <td><span class="status-tag ${tagClass}">${item.status}</span></td>
        <td style="max-width: 320px; line-height: 1.4; color: #d1d5db;">
          ${item.reason || 'Normal schedule interval.'}
        </td>
        <td>
          ${isApproved 
            ? `<button class="btn btn-sm btn-outline" onclick="recallAgent('${item.agentId}', '${item.agentName || 'Agent'}')">Recall</button>` 
            : `<button class="btn btn-sm btn-primary" onclick="overrideApprove('${item.id}', '${item.agentId}')">Override</button>`
          }
        </td>
      </tr>
    `;
  }).join('');
}

window.overrideApprove = function(reqId, agentId) {
  alert(`Supervisor Override Granted for request ${reqId} (Agent ${agentId}). Break marked as APPROVED.`);
  fetchQueue();
};

document.getElementById('btn-refresh-queue').addEventListener('click', fetchQueue);
document.getElementById('btn-clear-queue').addEventListener('click', () => {
  if (confirm('Clear audit queue history?')) {
    renderQueue([]);
  }
});

// ==========================================
// TAB 3: ALERT & BROADCAST SETUP (SUPERVISOR)
// ==========================================

function dispatchSupervisorBroadcast(severity, title, message) {
  const broadcastItem = {
    id: 'BC-' + Date.now(),
    timestamp: new Date().toISOString(),
    severity,
    title,
    message,
    sender: 'Supervisor Sarah Jenkins (SUP-014)'
  };

  activeSupervisorBroadcasts.unshift(broadcastItem);
  renderActiveBroadcasts();

  if (bc) {
    bc.postMessage({
      type: 'BROADCAST_ALERT',
      payload: broadcastItem
    });
  }

  const statusMsg = document.getElementById('bc-status-msg');
  statusMsg.style.color = '#34d399';
  statusMsg.textContent = `✓ Dispatched "${title}" to all agent widgets!`;
  setTimeout(() => { statusMsg.textContent = ''; }, 4000);
}

function renderActiveBroadcasts() {
  const container = document.getElementById('sup-active-broadcasts-list');
  if (!container) return;

  if (activeSupervisorBroadcasts.length === 0) {
    container.innerHTML = `<p class="text-muted" style="text-align:center; padding:12px;">No active broadcasts dispatched.</p>`;
    return;
  }

  container.innerHTML = activeSupervisorBroadcasts.map(b => {
    const timeStr = new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let tagColor = 'info';
    if (b.severity === 'CRITICAL' || b.severity === 'STORM' || b.severity === 'OUTAGE') tagColor = 'danger';
    if (b.severity === 'WARNING' || b.severity === 'MONDAY_TRAFFIC') tagColor = 'warning';

    return `
      <div class="advisory-card" style="margin-bottom:10px;">
        <div class="adv-header">
          <span class="status-tag ${tagColor}">${b.severity}</span>
          <span class="adv-time">${timeStr}</span>
        </div>
        <strong style="color:#fff; font-size:12px; margin:4px 0; display:block;">${b.title}</strong>
        <p style="font-size:11px; color:#cbd5e1; line-height:1.4;">${b.message}</p>
        <div style="display:flex; justify-content:flex-end; margin-top:6px;">
          <button class="btn btn-sm btn-outline" onclick="retractBroadcast('${b.id}')">Retract Broadcast</button>
        </div>
      </div>
    `;
  }).join('');
}

window.retractBroadcast = function(id) {
  activeSupervisorBroadcasts = activeSupervisorBroadcasts.filter(b => b.id !== id);
  renderActiveBroadcasts();
  alert('Broadcast retracted from agent dashboard.');
};

document.getElementById('btn-bc-storm').addEventListener('click', () => {
  dispatchSupervisorBroadcast('CRITICAL', 'TORNADO & SEVERE STORM WARNING', 'Severe storm/tornado advisory active for regional facility. Inbound call diverts enabled. Prepare for high call volumes.');
});

document.getElementById('btn-bc-outage').addEventListener('click', () => {
  dispatchSupervisorBroadcast('CRITICAL', 'SEV-1 CRM DATABASE LATENCY OUTAGE', 'Cloud CRM replication latency high. Switch to offline wrap-up notes. Telephony queue remains active.');
});

document.getElementById('btn-bc-monday').addEventListener('click', () => {
  dispatchSupervisorBroadcast('WARNING', 'MONDAY MORNING HIGH CALL VOLUME MODE', 'Queue depth threshold exceeded. Discretionary AUX breaks restricted. Maintain Available state in NICE CXone.');
});

document.getElementById('btn-bc-cxone').addEventListener('click', () => {
  dispatchSupervisorBroadcast('INFO', 'NICE CXONE PLATFORM UPDATE', 'Cluster maintenance window complete. All WebRTC endpoints report optimal latency (<20ms).');
});

document.getElementById('btn-send-custom-bc').addEventListener('click', () => {
  const title = document.getElementById('custom-bc-title').value.trim() || 'SUPERVISOR OPERATIONAL ADVISORY';
  const text = document.getElementById('custom-bc-text').value.trim();
  const severity = document.getElementById('custom-bc-severity').value;

  if (!text) {
    alert('Please enter a message to broadcast.');
    return;
  }
  dispatchSupervisorBroadcast(severity, title, text);
  document.getElementById('custom-bc-title').value = '';
  document.getElementById('custom-bc-text').value = '';
});

// ==========================================
// TAB 4: AGENT REPORTS & ANALYTICS
// ==========================================

const reportsData = {
  adherence: {
    title: 'Schedule Adherence Audit Report',
    summary: '<strong>Fleet Average Adherence:</strong> 86.2% | <strong>Compliant Agents:</strong> 4 / 6 | <strong>Target SLA:</strong> &ge; 90%',
    headers: ['Agent ID', 'Name', 'Skill Queue', 'Scheduled Shift', 'Actual Logged', 'Adherence %', 'Variance Mins', 'Adherence Status'],
    rows: [
      ['AGT-8842', 'Alex Morgan', 'Tier-2 Tech Support', '08:00 - 16:30', '08:02 - 16:30', '96.4%', '+2 mins', '<span class="status-tag approved">COMPLIANT</span>'],
      ['AGT-4092', 'Jordan Miller', 'Customer Billing', '08:30 - 17:00', '08:44 - 17:00', '78.5%', '-28 mins', '<span class="status-tag rejected">NON-COMPLIANT</span>'],
      ['AGT-9102', 'Samantha Vance', 'Customer Billing', '09:00 - 17:30', '09:01 - 17:30', '71.2%', '-42 mins', '<span class="status-tag rejected">NON-COMPLIANT</span>'],
      ['AGT-7740', 'David Chen', 'Emergency Inbound', '07:00 - 15:30', '07:00 - 15:30', '82.0%', '-18 mins', '<span class="status-tag aux">COACHING</span>'],
      ['AGT-6512', 'Rachel Green', 'Customer Retention', '08:00 - 16:30', '08:00 - 16:30', '98.2%', '+1 min', '<span class="status-tag approved">COMPLIANT</span>'],
      ['AGT-8819', 'Marcus Brody', 'Emergency Inbound', '10:00 - 18:30', '10:05 - 18:30', '91.0%', '+4 mins', '<span class="status-tag approved">COMPLIANT</span>']
    ]
  },
  aux_dist: {
    title: 'AUX Code Time Distribution Report',
    summary: '<strong>Total AUX Utilization:</strong> 18.4% of total logged shift hours (Company Target: &le; 20%)',
    headers: ['Agent ID', 'Name', 'Lunch (AUX 101)', 'Tea (AUX 102)', 'Meeting (AUX 103)', 'Training (AUX 104)', 'Tech Issue (AUX 105)', 'Total AUX Time'],
    rows: [
      ['AGT-8842', 'Alex Morgan', '45 mins', '14 mins', '0 mins', '0 mins', '0 mins', '59 mins'],
      ['AGT-4092', 'Jordan Miller', '45 mins', '52 mins', '15 mins', '0 mins', '0 mins', '112 mins (High)'],
      ['AGT-9102', 'Samantha Vance', '70 mins', '15 mins', '0 mins', '0 mins', '10 mins', '95 mins'],
      ['AGT-7740', 'David Chen', '40 mins', '30 mins', '20 mins', '0 mins', '0 mins', '90 mins'],
      ['AGT-6512', 'Rachel Green', '45 mins', '15 mins', '0 mins', '0 mins', '0 mins', '60 mins'],
      ['AGT-8819', 'Marcus Brody', '45 mins', '15 mins', '30 mins', '60 mins', '0 mins', '150 mins (Trainee)']
    ]
  },
  violations: {
    title: 'Break Violations & Overage Audit Report',
    summary: '<strong>Total Logged Infractions Today:</strong> 3 incidents | <strong>Escalations Dispatched:</strong> 2',
    headers: ['Incident ID', 'Agent ID', 'Name', 'Violation Category', 'Recorded Overage', 'Severity', 'WFM Escalation'],
    rows: [
      ['VIO-881', 'AGT-4092', 'Jordan Miller', 'Excessive Tea Breaks', '4 breaks taken (Limit: 2)', 'HIGH', '<span class="status-tag rejected">Supervisor Coaching</span>'],
      ['VIO-882', 'AGT-9102', 'Samantha Vance', 'Chronic Lunch Overage', '+25 mins excess', 'CRITICAL', '<span class="status-tag rejected">Disciplinary Review</span>'],
      ['VIO-883', 'AGT-7740', 'David Chen', 'Request Throttling', '3 requests in 10 mins', 'MEDIUM', '<span class="status-tag aux">15m Cooldown</span>']
    ]
  },
  frequency: {
    title: 'Request Frequency & Throttling Report',
    summary: '<strong>Throttled Agents:</strong> 1 | <strong>Threshold:</strong> Max 3 requests per 30 minutes',
    headers: ['Agent ID', 'Name', '30m Request Count', 'Status', 'Last Request Time', 'Cooldown Remaining'],
    rows: [
      ['AGT-8842', 'Alex Morgan', '1 / 3', '<span class="status-tag approved">NORMAL</span>', '10:15 AM', '0 mins'],
      ['AGT-4092', 'Jordan Miller', '2 / 3', '<span class="status-tag approved">NORMAL</span>', '11:00 AM', '0 mins'],
      ['AGT-9102', 'Samantha Vance', '1 / 3', '<span class="status-tag approved">NORMAL</span>', '12:30 PM', '0 mins'],
      ['AGT-7740', 'David Chen', '3 / 3', '<span class="status-tag rejected">RATE-LIMITED</span>', '13:10 PM', '12 mins'],
      ['AGT-6512', 'Rachel Green', '1 / 3', '<span class="status-tag approved">NORMAL</span>', '10:45 AM', '0 mins'],
      ['AGT-8819', 'Marcus Brody', '1 / 3', '<span class="status-tag approved">NORMAL</span>', '11:15 AM', '0 mins']
    ]
  },
  acw: {
    title: 'NICE CXone ACW Handle Time Report',
    summary: '<strong>Average Handle Time (ACW):</strong> 34 seconds | <strong>SLA Target:</strong> &le; 45 seconds | <strong>Compliance:</strong> 93.4%',
    headers: ['Agent ID', 'Name', 'Calls Completed', 'Avg ACW Duration', 'Max ACW Recorded', 'Exceeded (>45s)', 'ACW SLA Status'],
    rows: [
      ['AGT-8842', 'Alex Morgan', '24 calls', '28 seconds', '39 seconds', '0 calls', '<span class="status-tag approved">EXCELLENT</span>'],
      ['AGT-4092', 'Jordan Miller', '18 calls', '42 seconds', '58 seconds', '3 calls', '<span class="status-tag aux">ACCEPTABLE</span>'],
      ['AGT-9102', 'Samantha Vance', '21 calls', '36 seconds', '44 seconds', '0 calls', '<span class="status-tag approved">EXCELLENT</span>'],
      ['AGT-7740', 'David Chen', '19 calls', '44 seconds', '61 seconds', '4 calls', '<span class="status-tag aux">ACCEPTABLE</span>'],
      ['AGT-6512', 'Rachel Green', '26 calls', '22 seconds', '31 seconds', '0 calls', '<span class="status-tag approved">EXCELLENT</span>'],
      ['AGT-8819', 'Marcus Brody', '12 calls', '49 seconds', '72 seconds', '5 calls', '<span class="status-tag rejected">TRAINING NEEDED</span>']
    ]
  },
  qa_scorecard: {
    title: 'Customer Interaction Tone, Empathy & QA Scorecard',
    summary: '<strong>Empathetic Tone:</strong> 66.7% | <strong>Rude / Hostile Alerts:</strong> 2 Calls (Immediate Training Required) | <strong>Average QA Score:</strong> 73.3%',
    headers: ['Agent ID', 'Name', 'Contact ID', 'Speech Tone', 'Verification (25%)', 'Account Details (20%)', 'Query Resolved (30%)', 'Weighted QA %', 'QA Status'],
    rows: [
      ['AGT-8842', 'Alex Morgan', '#90421', '<span class="status-tag approved">Good / Empathetic</span>', 'Passed (25%)', 'Captured (20%)', 'Resolved (30%)', '96.0%', '<span class="status-tag approved">PASSED</span>'],
      ['AGT-4092', 'Jordan Miller', '#90425', '<span class="status-tag rejected">Rudely / Hostile</span>', 'Passed (25%)', 'Captured (20%)', 'Unresolved (0%)', '48.0%', '<span class="status-tag rejected">EXTRA TRAINING</span>'],
      ['AGT-9102', 'Samantha Vance', '#90429', '<span class="status-tag rejected">Bad / Confused</span>', 'Failed (0%)', 'Missing (0%)', 'Unresolved (0%)', '32.0%', '<span class="status-tag rejected">EXTRA TRAINING</span>'],
      ['AGT-7740', 'David Chen', '#90432', '<span class="status-tag approved">Neutral / Direct</span>', 'Passed (25%)', 'Captured (20%)', 'Resolved (30%)', '85.0%', '<span class="status-tag approved">PASSED</span>'],
      ['AGT-6512', 'Rachel Green', '#90438', '<span class="status-tag approved">Good / Empathetic</span>', 'Passed (25%)', 'Captured (20%)', 'Resolved (30%)', '98.0%', '<span class="status-tag approved">PASSED</span>'],
      ['AGT-8819', 'Marcus Brody', '#90441', '<span class="status-tag aux">Neutral / Trainee</span>', 'Passed (25%)', 'Missing (0%)', 'Resolved (30%)', '81.0%', '<span class="status-tag aux">COACHING</span>']
    ]
  },
  ivr_csat: {
    title: 'Post-Call IVR Customer Rating & Query Resolution Audit',
    summary: '<strong>Average IVR Rating:</strong> 4.1 / 5.0 Stars | <strong>First Contact Resolution:</strong> 83.3% | <strong>Low CSAT Alerts (&le;2★):</strong> 2 Calls',
    headers: ['Agent ID', 'Name', 'Contact ID', 'IVR Star Rating', 'Customer Feedback Extract', 'First Contact Resolved', 'Action Triggered'],
    rows: [
      ['AGT-8842', 'Alex Morgan', '#90421', '★★★★★ 5.0', 'Empathetic, restored promotional discount immediately.', '<span class="status-tag approved">YES</span>', '<span class="status-tag approved">None</span>'],
      ['AGT-4092', 'Jordan Miller', '#90425', '★☆☆☆☆ 1.0', 'Cut me off repeatedly, aggressive tone, unresolved billing.', '<span class="status-tag rejected">NO</span>', '<span class="status-tag rejected">Mandatory De-escalation</span>'],
      ['AGT-9102', 'Samantha Vance', '#90429', '★★☆☆☆ 2.0', 'Seemed confused, failed security PIN check, fee unhandled.', '<span class="status-tag rejected">NO</span>', '<span class="status-tag rejected">Security & Query Training</span>'],
      ['AGT-7740', 'David Chen', '#90432', '★★★☆☆ 3.5', 'Fast and direct response to inquiry.', '<span class="status-tag approved">YES</span>', '<span class="status-tag approved">None</span>'],
      ['AGT-6512', 'Rachel Green', '#90438', '★★★★★ 5.0', 'Solved retention discount in minutes with great kindness.', '<span class="status-tag approved">YES</span>', '<span class="status-tag approved">None</span>'],
      ['AGT-8819', 'Marcus Brody', '#90441', '★★★★☆ 4.0', 'Helpful trainee, slightly slow looking up details.', '<span class="status-tag approved">YES</span>', '<span class="status-tag aux">Skill Refinement</span>']
    ]
  }
};

let currentReportKey = 'adherence';

function loadReport(key) {
  currentReportKey = key;
  const rep = reportsData[key] || reportsData.adherence;

  document.getElementById('report-summary-bar').innerHTML = rep.summary;

  const thead = document.getElementById('report-table-head');
  thead.innerHTML = `<tr>${rep.headers.map(h => `<th>${h}</th>`).join('')}</tr>`;

  const tbody = document.getElementById('report-table-body');
  tbody.innerHTML = rep.rows.map(row => {
    return `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
  }).join('');
}

document.getElementById('report-type-select').addEventListener('change', (e) => {
  loadReport(e.target.value);
});

// CSV Export Engine
document.getElementById('btn-export-csv').addEventListener('click', () => {
  const rep = reportsData[currentReportKey];
  if (!rep) return;

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += rep.headers.join(',') + '\r\n';

  rep.rows.forEach(row => {
    // strip HTML tags for CSV
    const cleanRow = row.map(cell => {
      const text = cell.replace(/<[^>]*>?/gm, '').trim();
      return `"${text}"`;
    });
    csvContent += cleanRow.join(',') + '\r\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `WFM_${currentReportKey.toUpperCase()}_REPORT_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// ==========================================
// TAB 5: AGENT QA, CUSTOMER TONE & COACHING
// ==========================================

const qaScorecardData = [
  { agentId: 'AGT-8842', name: 'Alex Morgan', contactId: '#90421', tone: 'Good / Empathetic', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 5.0, qaScore: 96, recommendedModule: 'MOD-104', flagReason: 'None (Top Performer)', trainingAssigned: false },
  { agentId: 'AGT-4092', name: 'Jordan Miller', contactId: '#90425', tone: 'Rudely / Impatient', securityVerified: true, detailsRetrieved: true, queryResolved: false, ivrStars: 1.0, qaScore: 48, recommendedModule: 'MOD-101', flagReason: 'Rude speech tone to customer + Unresolved dispute', trainingAssigned: false },
  { agentId: 'AGT-9102', name: 'Samantha Vance', contactId: '#90429', tone: 'Bad / Confused', securityVerified: false, detailsRetrieved: false, queryResolved: false, ivrStars: 2.0, qaScore: 32, recommendedModule: 'MOD-102', flagReason: 'Missed customer security PIN verification + Unresolved inquiry', trainingAssigned: false },
  { agentId: 'AGT-7740', name: 'David Chen', contactId: '#90432', tone: 'Neutral / Direct', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 3.5, qaScore: 85, recommendedModule: 'MOD-104', flagReason: 'None (Acceptable SLA)', trainingAssigned: false },
  { agentId: 'AGT-6512', name: 'Rachel Green', contactId: '#90438', tone: 'Good / Empathetic', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 5.0, qaScore: 98, recommendedModule: 'MOD-104', flagReason: 'None (Exemplary Retention)', trainingAssigned: false },
  { agentId: 'AGT-8819', name: 'Marcus Brody', contactId: '#90441', tone: 'Neutral / Trainee', securityVerified: true, detailsRetrieved: false, queryResolved: true, ivrStars: 4.0, qaScore: 81, recommendedModule: 'MOD-103', flagReason: 'Incomplete account details lookup', trainingAssigned: false },
  { agentId: 'AGT-3310', name: 'Chloe Bennett', contactId: '#90445', tone: 'Good / Empathetic', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 4.8, qaScore: 95, recommendedModule: 'MOD-104', flagReason: 'None (Senior Lead)', trainingAssigned: false },
  { agentId: 'AGT-5521', name: 'Lucas Wright', contactId: '#90449', tone: 'Good / Professional', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 4.6, qaScore: 92, recommendedModule: 'MOD-104', flagReason: 'None (Fast Wrap-up)', trainingAssigned: false },
  { agentId: 'AGT-7703', name: 'Maya Patel', contactId: '#90453', tone: 'Good / Empathetic', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 5.0, qaScore: 99, recommendedModule: 'MOD-104', flagReason: 'None (VIP Care)', trainingAssigned: false },
  { agentId: 'AGT-4491', name: 'Carlos Mendez', contactId: '#90458', tone: 'Neutral / Direct', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 3.8, qaScore: 84, recommendedModule: 'MOD-104', flagReason: 'None (Hardware Specialist)', trainingAssigned: false },
  { agentId: 'AGT-6628', name: 'Olivia Taylor', contactId: '#90462', tone: 'Good / Calm', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 5.0, qaScore: 100, recommendedModule: 'MOD-104', flagReason: 'None (Disaster Dispatch Lead)', trainingAssigned: false },
  { agentId: 'AGT-2219', name: "Liam O'Connor", contactId: '#90468', tone: 'Bad / Hesitant', securityVerified: false, detailsRetrieved: false, queryResolved: false, ivrStars: 2.5, qaScore: 36, recommendedModule: 'MOD-103', flagReason: 'Failed resolution + Missing account history', trainingAssigned: false }
];

function renderQAScorecard() {
  const tbody = document.getElementById('qa-scorecard-body');
  if (!tbody) return;

  tbody.innerHTML = qaScorecardData.map(item => {
    const isRudeOrBad = item.tone.includes('Rudely') || item.tone.includes('Bad');
    const isFailed = item.qaScore < 70 || isRudeOrBad || !item.queryResolved;
    
    let toneBadgeClass = 'approved';
    if (item.tone.includes('Rudely') || item.tone.includes('Bad')) toneBadgeClass = 'rejected';
    else if (item.tone.includes('Neutral')) toneBadgeClass = 'aux';

    const verifBadge = item.securityVerified 
      ? `<span class="status-tag approved">✓ Passed (25%)</span>`
      : `<span class="status-tag rejected">✗ Failed (0%)</span>`;

    const detailsBadge = item.detailsRetrieved
      ? `<span class="status-tag approved">✓ Captured (20%)</span>`
      : `<span class="status-tag rejected">✗ Missing (0%)</span>`;

    const resBadge = item.queryResolved
      ? `<span class="status-tag approved">✓ Resolved (30%)</span>`
      : `<span class="status-tag rejected">✗ Unresolved (0%)</span>`;

    let scoreBadgeClass = 'approved';
    if (item.qaScore < 60) scoreBadgeClass = 'rejected';
    else if (item.qaScore < 85) scoreBadgeClass = 'aux';

    let actionBtn = '';
    if (item.trainingAssigned) {
      actionBtn = `<span class="status-tag aux" style="padding:4px 8px;">🎓 Training Dispatched</span>`;
    } else if (isFailed) {
      actionBtn = `<button class="btn btn-sm btn-danger" onclick="openAssignTrainingModal('${item.agentId}', '${item.name}', '${item.flagReason}', '${item.recommendedModule}')">🎓 Assign Extra Training</button>`;
    } else {
      actionBtn = `<button class="btn btn-sm btn-outline" onclick="openAssignTrainingModal('${item.agentId}', '${item.name}', 'Routine Skill Refinement', 'MOD-104')">Optional Coaching</button>`;
    }

    return `
      <tr>
        <td>
          <div style="font-weight:600; color:#fff;">${item.name}</div>
          <small style="color:#9ca3af; font-family:monospace;">${item.agentId}</small>
        </td>
        <td style="font-family:monospace; color:#38bdf8;">${item.contactId}</td>
        <td><span class="status-tag ${toneBadgeClass}">${item.tone}</span></td>
        <td>${verifBadge}</td>
        <td>${detailsBadge}</td>
        <td>${resBadge}</td>
        <td><strong style="color:#fbbf24;">★ ${item.ivrStars.toFixed(1)}</strong> / 5.0</td>
        <td><span class="status-tag ${scoreBadgeClass}">${item.qaScore}%</span></td>
        <td>${actionBtn}</td>
      </tr>
    `;
  }).join('');

  // Update summary KPIs
  const avgCsatEl = document.getElementById('qa-avg-csat');
  const posToneEl = document.getElementById('qa-pos-tone');
  const rudeFlagsEl = document.getElementById('qa-rude-flags');
  const fcrRateEl = document.getElementById('qa-fcr-rate');
  const verifRateEl = document.getElementById('qa-verif-rate');

  if (avgCsatEl) {
    const avg = qaScorecardData.reduce((acc, curr) => acc + curr.ivrStars, 0) / qaScorecardData.length;
    avgCsatEl.textContent = `★ ${avg.toFixed(1)} / 5.0`;
  }
  if (posToneEl) {
    const posCount = qaScorecardData.filter(i => i.tone.includes('Good') || i.tone.includes('Empathetic')).length;
    const pct = ((posCount / qaScorecardData.length) * 100).toFixed(1);
    posToneEl.textContent = `${pct}%`;
  }
  if (rudeFlagsEl) {
    const rudeCount = qaScorecardData.filter(i => i.tone.includes('Rudely') || i.tone.includes('Bad')).length;
    rudeFlagsEl.textContent = `${rudeCount} Calls`;
  }
  if (fcrRateEl) {
    const resCount = qaScorecardData.filter(i => i.queryResolved).length;
    const pct = ((resCount / qaScorecardData.length) * 100).toFixed(1);
    fcrRateEl.textContent = `${pct}%`;
  }
  if (verifRateEl) {
    const verifCount = qaScorecardData.filter(i => i.securityVerified).length;
    const pct = ((verifCount / qaScorecardData.length) * 100).toFixed(1);
    verifRateEl.textContent = `${pct}%`;
  }
}

let currentTrainingAgent = null;

window.openAssignTrainingModal = function(agentId, name, reason, defaultModule = 'MOD-101') {
  currentTrainingAgent = { agentId, name, reason };
  const overlay = document.getElementById('training-modal-overlay');
  const agentInput = document.getElementById('train-agent-name');
  const reasonInput = document.getElementById('train-flag-reason');
  const moduleSelect = document.getElementById('train-module-select');
  const notesArea = document.getElementById('train-notes');

  if (agentInput) agentInput.value = `${name} (${agentId})`;
  if (reasonInput) reasonInput.value = reason;
  if (moduleSelect) moduleSelect.value = defaultModule;
  if (notesArea) notesArea.value = `Supervisor assignment: Immediate coaching required regarding ${reason}.`;
  if (overlay) overlay.classList.remove('hidden');
};

window.closeAssignTrainingModal = function() {
  const overlay = document.getElementById('training-modal-overlay');
  if (overlay) overlay.classList.add('hidden');
  currentTrainingAgent = null;
};

const btnCloseModal = document.getElementById('btn-close-training-modal');
if (btnCloseModal) btnCloseModal.addEventListener('click', window.closeAssignTrainingModal);

const btnCancelTraining = document.getElementById('btn-cancel-training');
if (btnCancelTraining) btnCancelTraining.addEventListener('click', window.closeAssignTrainingModal);

const btnConfirmTraining = document.getElementById('btn-confirm-training');
if (btnConfirmTraining) {
  btnConfirmTraining.addEventListener('click', () => {
    if (!currentTrainingAgent) return;
    const modSelect = document.getElementById('train-module-select');
    const schedSelect = document.getElementById('train-schedule-mode');
    const notesArea = document.getElementById('train-notes');

    const payload = {
      targetAgentId: currentTrainingAgent.agentId,
      agentName: currentTrainingAgent.name,
      moduleId: modSelect ? modSelect.value : 'MOD-101',
      moduleName: modSelect ? modSelect.options[modSelect.selectedIndex].text : 'Module 101: Professional De-Escalation',
      scheduleMode: schedSelect ? schedSelect.value : 'IMMEDIATE',
      reason: currentTrainingAgent.reason,
      notes: notesArea ? notesArea.value : '',
      timestamp: new Date().toISOString()
    };

    // Broadcast to agent widgets via wfm_aux_channel
    if (bc) {
      bc.postMessage({
        type: 'MANDATORY_TRAINING_ASSIGNED',
        payload: payload
      });
    }

    // Update wallboard status for this agent
    updateAgentState(currentTrainingAgent.agentId, 'AUX: TRAINING', '45:00');

    // Mark in QA scorecard
    const qaAgent = qaScorecardData.find(a => a.agentId === currentTrainingAgent.agentId);
    if (qaAgent) {
      qaAgent.trainingAssigned = true;
      renderQAScorecard();
    }

    alert(`✓ Mandatory Coaching Module Assigned!\n\nAgent: ${currentTrainingAgent.name} (${currentTrainingAgent.agentId})\nModule: ${payload.moduleName}\nMode: ${payload.scheduleMode}\n\nAgent status switched to AUX: TRAINING in NICE CXone.`);
    window.closeAssignTrainingModal();
  });
}

// QA CSV Export
const btnExportQaCsv = document.getElementById('btn-export-qa-csv');
if (btnExportQaCsv) {
  btnExportQaCsv.addEventListener('click', () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    const headers = ['Agent ID', 'Agent Name', 'Contact ID', 'Speech Tone', 'Security Verification (25%)', 'Details Retrieved (20%)', 'Query Resolved (30%)', 'Post-Call IVR Rating', 'Weighted QA Score %', 'Coaching Status'];
    csvContent += headers.join(',') + '\r\n';

    qaScorecardData.forEach(item => {
      const row = [
        `"${item.agentId}"`,
        `"${item.name}"`,
        `"${item.contactId}"`,
        `"${item.tone}"`,
        `"${item.securityVerified ? 'Passed (25%)' : 'Failed (0%)'}"`,
        `"${item.detailsRetrieved ? 'Captured (20%)' : 'Incomplete (0%)'}"`,
        `"${item.queryResolved ? 'Resolved (30%)' : 'Unresolved (0%)'}"`,
        `"${item.ivrStars} / 5.0"`,
        `"${item.qaScore}%"`,
        `"${item.trainingAssigned ? 'MANDATORY TRAINING ASSIGNED' : item.flagReason}"`
      ];
      csvContent += row.join(',') + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AGENT_QA_AND_TONE_REPORT_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

const btnRefreshQa = document.getElementById('btn-refresh-qa');
if (btnRefreshQa) btnRefreshQa.addEventListener('click', renderQAScorecard);

// ==========================================
// TAB 6: AGENT LIMITS & POLICY SETUP
// ==========================================

document.getElementById('btn-save-policies').addEventListener('click', () => {
  policyLimits.maxTeaBreaks = parseInt(document.getElementById('limit-max-tea').value, 10) || 2;
  policyLimits.lunchVarianceThreshold = parseInt(document.getElementById('limit-lunch-variance').value, 10) || 15;
  policyLimits.frequencyLimit30m = parseInt(document.getElementById('limit-req-freq').value, 10) || 3;
  policyLimits.targetAdherence = parseInt(document.getElementById('limit-target-adh').value, 10) || 90;
  policyLimits.targetAcwSeconds = parseInt(document.getElementById('limit-acw-sec').value, 10) || 45;
  policyLimits.botGraceSeconds = parseInt(document.getElementById('limit-bot-grace').value, 10) || 10;

  // Broadcast policy update to all agent widgets
  if (bc) {
    bc.postMessage({
      type: 'POLICY_UPDATE',
      payload: policyLimits
    });
  }

  // Update wallboard
  renderWallboard();

  const msg = document.getElementById('policy-save-msg');
  msg.style.color = '#34d399';
  msg.textContent = '✓ Operational policy limits successfully saved and synchronized across all agent widgets!';
  setTimeout(() => { msg.textContent = ''; }, 4500);
});

// ==========================================
// TAB 7: NICE CXONE DIAGNOSTICS
// ==========================================

document.getElementById('btn-test-cxone').addEventListener('click', () => {
  const consoleEl = document.getElementById('cxone-test-console');
  consoleEl.textContent = '> Initiating NICE CXone CTI WebSocket Handshake...\nConnecting wss://na1.niceincontact.com/cti/v2...\n[OK] TLS 1.3 Handshake completed.\n[OK] Authenticated Tenant ENT-NICE-CXONE-9941.\n[OK] WebRTC Media Gateway heartbeats active (18ms latency).\nAll 3 CXone ACD Skills online.';
});

// Initialize
fetchQueue();
renderWallboard();
renderActiveBroadcasts();
renderQAScorecard();
loadReport('adherence');
setInterval(fetchQueue, 3000);


// ==========================================
// STORM OUTAGE & IVR DEFLECTION CONTROLLER
// ==========================================

let ivrState = {
  stormOutageMode: false,
  callVolumeRatePerMin: 420,
  thresholdLimitPerMin: 1000,
  isDeflectionActive: false,
  deflectedCallsCount: 0,
  announcementText: "Thank you for the call, we are having so many outages out field workers are on the route, thank you for your patience",
  historyLog: []
};

async function fetchIvrDeflection() {
  try {
    const res = await fetch('/api/cxone/ivr-deflection');
    if (res.ok) {
      ivrState = await res.json();
      renderIvrDeflectionUI();
    }
  } catch (e) {
    console.warn('IVR deflection fetch error:', e);
  }
}

function renderIvrDeflectionUI() {
  const badge = document.getElementById('deflection-status-badge');
  const rateDisplay = document.getElementById('deflection-rate-display');
  const rateSub = document.getElementById('deflection-rate-sub');
  const modeDisplay = document.getElementById('deflection-mode-display');
  const countDisplay = document.getElementById('deflection-count-display');
  const logList = document.getElementById('deflection-log-list');
  const slider = document.getElementById('surge-slider');
  const sliderLabel = document.getElementById('slider-val-label');

  if (!badge) return;

  if (slider) slider.value = ivrState.callVolumeRatePerMin;
  if (sliderLabel) sliderLabel.textContent = `${ivrState.callVolumeRatePerMin} calls / min`;

  rateDisplay.textContent = `${ivrState.callVolumeRatePerMin} calls / min`;
  countDisplay.textContent = `${ivrState.deflectedCallsCount.toLocaleString()} calls`;

  if (ivrState.stormOutageMode) {
    modeDisplay.textContent = 'ACTIVE (STORM)';
    modeDisplay.className = 'd-val text-danger';
  } else {
    modeDisplay.textContent = 'STANDBY';
    modeDisplay.className = 'd-val text-warning';
  }

  if (ivrState.isDeflectionActive) {
    badge.className = 'badge-deflection active';
    badge.textContent = `🔴 AUTO-DEFLECTION ACTIVE (>1,000 calls/min)`;
    rateSub.textContent = `Call 1,001+ receiving field outage voice announcement!`;
    rateSub.className = 'd-sub text-danger';
  } else {
    badge.className = 'badge-deflection inactive';
    badge.textContent = `🟢 STANDBY (<1,000 calls/min)`;
    rateSub.textContent = `Under 1,000 threshold (Standard ACD routing)`;
    rateSub.className = 'd-sub text-ok';
  }

  // Render logs
  if (logList && ivrState.historyLog) {
    logList.innerHTML = ivrState.historyLog.slice(0, 8).map(log => {
      const timeStr = new Date(log.timestamp).toLocaleTimeString();
      let logClass = '';
      if (log.event === 'DEFLECTION_ACTIVATED') logClass = 'active';
      if (log.event === 'DEFLECTION_AUTO_DISABLED') logClass = 'disabled';
      return `<div class="d-log-item ${logClass}">[${timeStr}] <strong>${log.event}:</strong> ${log.details}</div>`;
    }).join('');
  }
}

async function updateIvrDeflection(payload) {
  try {
    const res = await fetch('/api/cxone/ivr-deflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      ivrState = await res.json();
      renderIvrDeflectionUI();

      // Broadcast to agent widgets
      if (bc) {
        bc.postMessage({
          type: 'IVR_DEFLECTION_UPDATE',
          payload: ivrState
        });
      }
    }
  } catch (e) {
    console.warn(e);
  }
}

window.simulateTraffic = function(rate, stormMode) {
  updateIvrDeflection({
    callVolumeRatePerMin: rate,
    stormOutageMode: stormMode
  });
};

const surgeSlider = document.getElementById('surge-slider');
if (surgeSlider) {
  surgeSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    document.getElementById('slider-val-label').textContent = `${val} calls / min`;
  });
  surgeSlider.addEventListener('change', (e) => {
    const val = parseInt(e.target.value, 10);
    updateIvrDeflection({
      callVolumeRatePerMin: val,
      stormOutageMode: val > 800 ? true : ivrState.stormOutageMode
    });
  });
}

const btnToggleStorm = document.getElementById('btn-toggle-storm-mode');
if (btnToggleStorm) {
  btnToggleStorm.addEventListener('click', () => {
    updateIvrDeflection({
      stormOutageMode: !ivrState.stormOutageMode
    });
  });
}

// Caller Audio Test
const btnTestAnnouncementAudio = document.getElementById('btn-test-announcement-audio');
if (btnTestAnnouncementAudio) {
  btnTestAnnouncementAudio.addEventListener('click', () => {
    const text = ivrState.announcementText || "Thank you for the call, we are having so many outages out field workers are on the route, thank you for your patience";
    btnTestAnnouncementAudio.textContent = '🔊 Playing Announcement...';
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        btnTestAnnouncementAudio.textContent = '🔊 Listen to Voice Announcement (Audio Test)';
      };
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`IVR Announcement: "${text}"`);
      btnTestAnnouncementAudio.textContent = '🔊 Listen to Voice Announcement (Audio Test)';
    }
  });
}

// Poll IVR deflection
fetchIvrDeflection();
setInterval(fetchIvrDeflection, 4000);


// ==========================================
// TAB 8: DYNAMIC WFM QUEUE REBALANCING
// ==========================================

let wfmRebalanceData = {
  isSurgeActive: false,
  isRebalanced: false,
  autoFlexEnabled: false,
  queues: {
    billing: { callsWaiting: 42, avgWaitSeconds: 35, currentSla: 86.4, assignedAgents: 4, requiredAgents: 4, status: 'NORMAL' },
    customerService: { callsWaiting: 8, avgWaitSeconds: 14, currentSla: 97.2, assignedAgents: 5, requiredAgents: 2, status: 'IDLE_SURPLUS' }
  },
  reallocatedAgents: [],
  historyLog: []
};

async function fetchQueueBalance() {
  try {
    const res = await fetch('/api/wfm/queue-balance');
    if (res.ok) {
      wfmRebalanceData = await res.json();
      renderQueueBalanceUI();
    }
  } catch (err) {
    console.warn('Queue balance fetch error:', err);
  }
}

function renderQueueBalanceUI() {
  const statusTag = document.getElementById('rebalance-status-tag');
  const alertBanner = document.getElementById('rebalance-alert-banner');
  const bannerIcon = document.getElementById('rebalance-banner-icon');
  const bannerTitle = document.getElementById('rebalance-banner-title');
  const bannerDesc = document.getElementById('rebalance-banner-desc');
  const wbSurgeAlert = document.getElementById('wallboard-surge-alert');
  const btnToggleAutoflex = document.getElementById('btn-toggle-autoflex');

  if (!wfmRebalanceData || !wfmRebalanceData.queues) return;

  const b = wfmRebalanceData.queues.billing;
  const cs = wfmRebalanceData.queues.customerService;

  if (document.getElementById('q-billing-waiting')) {
    document.getElementById('q-billing-waiting').textContent = b.callsWaiting;
    const mins = Math.floor(b.avgWaitSeconds / 60);
    const secs = b.avgWaitSeconds % 60;
    document.getElementById('q-billing-asa').textContent = String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');
    document.getElementById('q-billing-sla').textContent = b.currentSla + '%';
    document.getElementById('q-billing-agents').textContent = b.assignedAgents + ' Logged-in';
    document.getElementById('q-billing-req').textContent = 'Required: ' + b.requiredAgents;

    const bCard = document.getElementById('qcard-billing');
    const bTag = document.getElementById('qtag-billing');
    if (b.status === 'SURGE_CRITICAL') {
      bTag.className = 'status-tag rejected';
      bTag.textContent = 'SURGE CRITICAL';
      if (bCard) bCard.className = 'card queue-card surge-highlight';
    } else if (b.status === 'REBALANCED') {
      bTag.className = 'status-tag approved';
      bTag.textContent = 'REBALANCED (FLEX ACTIVE)';
      if (bCard) bCard.className = 'card queue-card flex-highlight';
    } else {
      bTag.className = 'status-tag approved';
      bTag.textContent = 'NORMAL (SLA OK)';
      if (bCard) bCard.className = 'card queue-card';
    }
  }

  if (document.getElementById('q-cs-waiting')) {
    document.getElementById('q-cs-waiting').textContent = cs.callsWaiting;
    const mins = Math.floor(cs.avgWaitSeconds / 60);
    const secs = cs.avgWaitSeconds % 60;
    document.getElementById('q-cs-asa').textContent = String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');
    document.getElementById('q-cs-sla').textContent = cs.currentSla + '%';
    document.getElementById('q-cs-agents').textContent = cs.assignedAgents + ' Logged-in';
    
    const csTag = document.getElementById('qtag-cs');
    if (csTag) {
      if (cs.status === 'FLEXED_DONOR') {
        csTag.className = 'status-tag aux';
        csTag.textContent = 'DONOR (3 AGENTS FLEXED)';
      } else {
        csTag.className = 'status-tag approved';
        csTag.textContent = 'IDLE SURPLUS';
      }
    }
  }

  // Banner & Wallboard alert
  if (statusTag) {
    if (wfmRebalanceData.isRebalanced) {
      statusTag.textContent = 'Flex Active (3 Reallocated)';
      statusTag.style.color = '#38bdf8';
    } else if (wfmRebalanceData.isSurgeActive) {
      statusTag.textContent = 'Surge Detected!';
      statusTag.style.color = '#ef4444';
    } else {
      statusTag.textContent = 'Normal';
      statusTag.style.color = '#34d399';
    }
  }

  if (alertBanner) {
    if (wfmRebalanceData.isRebalanced) {
      alertBanner.className = 'rebalance-banner-box rebalanced';
      if (bannerIcon) bannerIcon.textContent = '🔄';
      if (bannerTitle) {
        bannerTitle.style.color = '#38bdf8';
        bannerTitle.textContent = 'Intraday WFM Skill Flex Active: 3 Agents Reallocated to Billing';
      }
      if (bannerDesc) {
        bannerDesc.textContent = 'Billing Queue calls cleared down from 318 -> ' + b.callsWaiting + '. ASA recovered to ' + b.avgWaitSeconds + 's. Customer Service queue remains healthy (' + cs.currentSla + '% SLA).';
      }
      if (wbSurgeAlert) wbSurgeAlert.classList.add('hidden');
    } else if (wfmRebalanceData.isSurgeActive) {
      alertBanner.className = 'rebalance-banner-box surge';
      if (bannerIcon) bannerIcon.textContent = '⚠️';
      if (bannerTitle) {
        bannerTitle.style.color = '#ef4444';
        bannerTitle.textContent = 'Critical Queue Imbalance: Billing Overloaded (' + b.callsWaiting + ' Waiting) vs Customer Service Idle';
      }
      if (bannerDesc) {
        bannerDesc.textContent = 'Billing SLA plunged to ' + b.currentSla + '%. 5 Customer Service agents are underutilized (28% occupancy). WFM recommends dynamic cross-skilling.';
      }
      if (wbSurgeAlert) wbSurgeAlert.classList.remove('hidden');
    } else {
      alertBanner.className = 'rebalance-banner-box normal';
      if (bannerIcon) bannerIcon.textContent = '🟢';
      if (bannerTitle) {
        bannerTitle.style.color = '#34d399';
        bannerTitle.textContent = 'ACD Queue Volumes Balanced across All Skills';
      }
      if (bannerDesc) {
        bannerDesc.textContent = 'Customer Billing and General Customer Service queues are operating within standard SLA targets (>=80%).';
      }
      if (wbSurgeAlert) wbSurgeAlert.classList.add('hidden');
    }
  }

  if (btnToggleAutoflex) {
    btnToggleAutoflex.textContent = '⚙️ Auto-Flex: ' + (wfmRebalanceData.autoFlexEnabled ? 'ON (ACTIVE)' : 'OFF');
    btnToggleAutoflex.className = wfmRebalanceData.autoFlexEnabled ? 'btn btn-sm btn-success' : 'btn btn-sm btn-outline';
  }

  // Roster table
  const rosterBody = document.getElementById('rebalance-roster-body');
  const countBadge = document.getElementById('reallocated-count-badge');
  if (countBadge) {
    countBadge.textContent = wfmRebalanceData.reallocatedAgents.length + ' Agents Flexed';
  }

  if (rosterBody) {
    if (!wfmRebalanceData.reallocatedAgents || wfmRebalanceData.reallocatedAgents.length === 0) {
      rosterBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#9ca3af; padding:20px;">No agents currently flexed. All personnel operating on base WFM shift schedules.</td></tr>';
    } else {
      rosterBody.innerHTML = wfmRebalanceData.reallocatedAgents.map(ag => {
        return '<tr>' +
          '<td><strong style="color:#fff;">' + ag.name + '</strong><div style="font-family:monospace; color:#9ca3af; font-size:11px;">' + ag.id + '</div></td>' +
          '<td><span class="status-tag approved">' + ag.baseSkill + '</span></td>' +
          '<td><strong style="color:#38bdf8;">' + ag.flexSchedule + '</strong></td>' +
          '<td><span class="status-tag aux">' + ag.flexSkill + '</span></td>' +
          '<td><small style="color:#cbd5e1; font-family:monospace;">' + ag.priorityRouting + '</small></td>' +
          '<td><span class="status-tag approved">ACTIVE FLEX</span></td>' +
          '<td><button class="btn btn-xs btn-outline" onclick="restoreSingleAgent(\'' + ag.id + '\')">Restore Base</button></td>' +
        '</tr>';
      }).join('');
    }
  }

  // Audit log
  const auditLog = document.getElementById('rebalance-audit-log');
  if (auditLog && wfmRebalanceData.historyLog) {
    auditLog.innerHTML = wfmRebalanceData.historyLog.slice(0, 8).map(log => {
      const timeStr = new Date(log.timestamp).toLocaleTimeString();
      let cls = '';
      if (log.event === 'SURGE_DETECTED') cls = 'active';
      if (log.event === 'REBALANCE_DISPATCHED' || log.event === 'RESTORED_BASE') cls = 'disabled';
      return '<div class="d-log-item ' + cls + '">[' + timeStr + '] <strong>' + log.event + ':</strong> ' + log.details + '</div>';
    }).join('');
  }
}

async function postQueueBalance(action, extraPayload = {}) {
  try {
    const res = await fetch('/api/wfm/queue-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extraPayload })
    });
    if (res.ok) {
      wfmRebalanceData = await res.json();
      renderQueueBalanceUI();

      // Broadcast to agent widgets via wfm_aux_channel
      if (bc) {
        bc.postMessage({
          type: 'WFM_REBALANCE_UPDATE',
          payload: wfmRebalanceData
        });
      }
    }
  } catch (err) {
    console.warn(err);
  }
}

// Global action handlers
window.restoreSingleAgent = function(agentId) {
  postQueueBalance('RESTORE_SINGLE_AGENT', { agentId });
};

document.getElementById('btn-sim-billing-surge')?.addEventListener('click', () => {
  postQueueBalance('SURGE_BILLING');
});

document.getElementById('btn-trigger-wfm-rebalance')?.addEventListener('click', () => {
  postQueueBalance('TRIGGER_REBALANCE');
});

document.getElementById('btn-quick-rebalance-wallboard')?.addEventListener('click', () => {
  postQueueBalance('TRIGGER_REBALANCE');
});

document.getElementById('btn-restore-base-schedules')?.addEventListener('click', () => {
  postQueueBalance('RESTORE_BASE');
});

document.getElementById('btn-toggle-autoflex')?.addEventListener('click', () => {
  postQueueBalance('TOGGLE_AUTOFLEX');
});

// Initialize WFM Queue Balance polling
fetchQueueBalance();
setInterval(fetchQueueBalance, 4000);


// ==========================================
// SUPERVISOR PROFILES & AI COPILOT BOT
// ==========================================

const supSelect = document.getElementById('supervisor-select');
if (supSelect) {
  supSelect.addEventListener('change', (e) => {
    const prof = SUPERVISOR_PROFILES[e.target.value] || SUPERVISOR_PROFILES['SUP-014'];
    currentSupervisor = prof;
    const avatarEl = document.getElementById('sup-avatar-icon');
    const roleEl = document.getElementById('sup-role-subtext');
    if (avatarEl) avatarEl.textContent = prof.avatar;
    if (roleEl) roleEl.textContent = prof.subtext;

    addSupBotMessage('bot', prof.greeting);
  });
}

// Supervisor Bot Drawer Toggle
const supBotDrawer = document.getElementById('sup-bot-drawer');
const btnToggleSupBot = document.getElementById('btn-toggle-sup-bot');
const btnOpenSupBotHeader = document.getElementById('btn-open-sup-bot-header');
const btnCloseSupBot = document.getElementById('btn-close-sup-bot');

function openSupBot() {
  if (supBotDrawer) supBotDrawer.classList.remove('hidden');
}

function closeSupBot() {
  if (supBotDrawer) supBotDrawer.classList.add('hidden');
}

if (btnToggleSupBot) btnToggleSupBot.addEventListener('click', () => {
  if (supBotDrawer.classList.contains('hidden')) openSupBot();
  else closeSupBot();
});
if (btnOpenSupBotHeader) btnOpenSupBotHeader.addEventListener('click', openSupBot);
if (btnCloseSupBot) btnCloseSupBot.addEventListener('click', closeSupBot);

// Bot Messages Stream
const supBotMessages = document.getElementById('sup-bot-messages');
const supBotInput = document.getElementById('sup-bot-input');
const btnSendSupBot = document.getElementById('btn-send-sup-bot');

function addSupBotMessage(sender, text, htmlContent = '') {
  if (!supBotMessages) return;
  const msgDiv = document.createElement('div');
  msgDiv.className = 'sup-bot-msg ' + sender;
  if (htmlContent) {
    msgDiv.innerHTML = htmlContent;
  } else {
    msgDiv.textContent = text;
  }
  supBotMessages.appendChild(msgDiv);
  supBotMessages.scrollTop = supBotMessages.scrollHeight;
}

// Initial Greeting
if (supBotMessages) {
  addSupBotMessage('bot', '👋 Welcome ' + currentSupervisor.name + '! I am REMI, your Autonomous Supervisor Copilot. I can run floor audits, detect queue surges, trigger cross-skilling rebalances, and recall overdue agents. How can I assist you?');
}

// Quick Chip Handlers
document.querySelectorAll('.sup-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const cmd = chip.getAttribute('data-cmd');
    executeSupBotCommand(cmd);
  });
});

function executeSupBotCommand(cmd) {
  if (cmd === 'floor_summary') {
    addSupBotMessage('user', 'Run Floor Health Check');
    const total = activeAgents.length;
    const inCalls = activeAgents.filter(a => a.state.includes('WORKING')).length;
    const inAux = activeAgents.filter(a => a.state.includes('AUX')).length;
    const avail = activeAgents.filter(a => a.state === 'AVAILABLE').length;
    const adhAvg = (activeAgents.reduce((acc, a) => acc + parseFloat(a.adherence), 0) / total).toFixed(1);

    const html = '<strong>📊 Shift Floor Telemetry Audit:</strong><br/>' +
      '• <strong>Active Staffing:</strong> ' + total + ' Logged-In Agents<br/>' +
      '• <strong>States:</strong> ' + avail + ' Available | ' + inCalls + ' In Call | ' + inAux + ' in AUX<br/>' +
      '• <strong>Fleet Adherence:</strong> ' + adhAvg + '% (Target: >=90%)<br/>' +
      '• <strong>Erlang-C Buffer:</strong> +4 Surplus Staffing<br/>' +
      '• <strong>SLA Status:</strong> Optimal across 3 of 4 ACD queues.';
    setTimeout(() => addSupBotMessage('bot', '', html), 400);
  }
  else if (cmd === 'check_rebalance') {
    addSupBotMessage('user', 'Check Intraday Queue Imbalance');
    const b = wfmRebalanceData.queues.billing;
    const cs = wfmRebalanceData.queues.customerService;
    let html = '<strong>⚡ Intraday Queue Imbalance Telemetry:</strong><br/>' +
      '• <strong>Customer Billing:</strong> ' + b.callsWaiting + ' Waiting | ASA ' + b.avgWaitSeconds + 's | SLA ' + b.currentSla + '%<br/>' +
      '• <strong>General Customer Service:</strong> ' + cs.callsWaiting + ' Waiting | ' + cs.assignedAgents + ' Agents Logged-in (' + cs.occupancyPct + '% Occ)<br/><br/>';
    
    if (wfmRebalanceData.isSurgeActive && !wfmRebalanceData.isRebalanced) {
      html += '<span style="color:#f87171; font-weight:700;">⚠️ Surge Detected! WFM recommends cross-skilling 3 CS agents to Billing.</span><br/>' +
        '<button class="btn btn-xs btn-primary" onclick="postQueueBalance(\'TRIGGER_REBALANCE\'); addSupBotMessage(\'bot\', \'Executed WFM Rebalance: 3 CS agents flexed to Billing!\');" style="margin-top:6px;">🔄 Execute Rebalance Now</button>';
    } else if (wfmRebalanceData.isRebalanced) {
      html += '<span style="color:#38bdf8; font-weight:700;">✓ Dynamic Flex Active: 3 CS Agents flexed to Billing.</span>';
    } else {
      html += '<span style="color:#34d399; font-weight:700;">✓ Queues Balanced: Normal operating levels.</span>';
    }
    setTimeout(() => addSupBotMessage('bot', '', html), 400);
  }
  else if (cmd === 'flagged_qa') {
    addSupBotMessage('user', 'Show Flagged QA Agents');
    const flagged = qaScorecardData.filter(a => a.qaScore < 70 || a.tone.includes('Rudely') || a.tone.includes('Bad'));
    let html = '<strong>🎓 Flagged Agents Requiring Extra Coaching (' + flagged.length + '):</strong><br/>';
    flagged.forEach(f => {
      html += '• <strong>' + f.name + ' (' + f.agentId + '):</strong> ' + f.tone + ' | QA ' + f.qaScore + '%<br/>' +
        '&nbsp;&nbsp;&nbsp;Reason: ' + f.flagReason + '<br/>';
    });
    html += '<button class="btn btn-xs btn-danger" onclick="openAssignTrainingModal(\'AGT-4092\', \'Jordan Miller\', \'Rude speech tone to customer\', \'MOD-101\')" style="margin-top:6px;">🎓 Coach Jordan Miller</button> ' +
      '<button class="btn btn-xs btn-danger" onclick="openAssignTrainingModal(\'AGT-9102\', \'Samantha Vance\', \'Missed security PIN verification\', \'MOD-102\')" style="margin-top:6px;">🎓 Coach Samantha Vance</button>';
    setTimeout(() => addSupBotMessage('bot', '', html), 400);
  }
  else if (cmd === 'bot_recall') {
    addSupBotMessage('user', 'Automated Bot Recall');
    const targetAgent = activeAgents.find(a => a.state.includes('AUX')) || activeAgents[0];
    recallAgent(targetAgent.id, targetAgent.name);
    setTimeout(() => addSupBotMessage('bot', '📞 Dispatched automated voice bot recall to ' + targetAgent.name + ' (' + targetAgent.id + '). Their workstation will chime and read instructions.'), 400);
  }
  else if (cmd === 'outage_alert') {
    addSupBotMessage('user', 'Broadcast Tornado / Outage Alert');
    dispatchSupervisorBroadcast('CRITICAL', 'TORNADO & SEVERE STORM WARNING', 'Severe weather warning in effect. Protect queue SLAs and prepare for high call arrivals.');
    setTimeout(() => addSupBotMessage('bot', '🌪️ Emergency floor broadcast dispatched immediately to all 12 agent desktop widgets!'), 400);
  }
}

// User Text Input in Bot
function sendUserBotMessage() {
  const text = supBotInput ? supBotInput.value.trim() : '';
  if (!text) return;
  addSupBotMessage('user', text);
  if (supBotInput) supBotInput.value = '';

  const q = text.toLowerCase();
  setTimeout(() => {
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      addSupBotMessage('bot', 'Hello ' + currentSupervisor.name + '! How can I assist you with floor operations, schedule rebalancing, or agent QA?');
    } else if (q.includes('rebalance') || q.includes('surge') || q.includes('billing')) {
      executeSupBotCommand('check_rebalance');
    } else if (q.includes('flag') || q.includes('training') || q.includes('coaching') || q.includes('rude') || q.includes('qa')) {
      executeSupBotCommand('flagged_qa');
    } else if (q.includes('recall') || q.includes('overdue') || q.includes('bot call')) {
      executeSupBotCommand('bot_recall');
    } else if (q.includes('broadcast') || q.includes('alert') || q.includes('storm') || q.includes('tornado')) {
      executeSupBotCommand('outage_alert');
    } else if (q.includes('who') || q.includes('aux') || q.includes('tea') || q.includes('lunch') || q.includes('status') || q.includes('adherence')) {
      executeSupBotCommand('floor_summary');
    } else {
      addSupBotMessage('bot', 'Understood, ' + currentSupervisor.name + '. I am monitoring all 12 agents across 4 skill campaigns. You can ask me to "check rebalance", "show flagged agents", "run floor summary", or "dispatch broadcast".');
    }
  }, 450);
}

if (btnSendSupBot) btnSendSupBot.addEventListener('click', sendUserBotMessage);
if (supBotInput) supBotInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendUserBotMessage();
});

// Voice Briefing
const btnSupVoiceBriefing = document.getElementById('btn-sup-voice-briefing');
if (btnSupVoiceBriefing) {
  btnSupVoiceBriefing.addEventListener('click', () => {
    const text = 'Attention ' + currentSupervisor.name + ': Floor operations briefing. 12 agents logged in. Overall shift adherence is 89.2 percent. Customer Billing queue is operating under observation. 3 agents are eligible for dynamic skill flex. All systems online.';
    btnSupVoiceBriefing.textContent = '🔊 Speaking...';
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.onend = () => { btnSupVoiceBriefing.textContent = '🔊 Voice Briefing'; };
      window.speechSynthesis.speak(u);
    } else {
      alert(text);
      btnSupVoiceBriefing.textContent = '🔊 Voice Briefing';
    }
  });
}
