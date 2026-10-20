// supervisor.js - Logic for the NICE CXone Supervisor Command Center

// Active Shift Agents Roster
let activeAgents = [
  { id: 'AGT-8842', name: 'Alex Morgan', queue: 'Tier-2 Tech Support', state: 'AVAILABLE', breakLeft: '-', adherence: '96.4%', teaCount: 1, lunchVar: '0m' },
  { id: 'AGT-4092', name: 'Jordan Miller', queue: 'Customer Billing & Retention', state: 'AVAILABLE', breakLeft: '-', adherence: '78.5%', teaCount: 4, lunchVar: '0m' },
  { id: 'AGT-9102', name: 'Samantha Vance', queue: 'Customer Billing & Retention', state: 'WORKING (IN CALL)', breakLeft: '-', adherence: '71.2%', teaCount: 1, lunchVar: '+25m' },
  { id: 'AGT-7740', name: 'David Chen', queue: 'Emergency Inbound', state: 'AUX: TEA BREAK', breakLeft: '08:42', adherence: '82.0%', teaCount: 2, lunchVar: '0m' },
  { id: 'AGT-6512', name: 'Rachel Green', queue: 'Customer Billing & Retention', state: 'AVAILABLE', breakLeft: '-', adherence: '98.2%', teaCount: 1, lunchVar: '0m' },
  { id: 'AGT-8819', name: 'Marcus Brody', queue: 'Emergency Inbound', state: 'WORKING (IN CALL)', breakLeft: '-', adherence: '91.0%', teaCount: 1, lunchVar: '+2m' }
];

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
// TAB 5: AGENT LIMITS & POLICY SETUP
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
// TAB 6: NICE CXONE DIAGNOSTICS
// ==========================================

document.getElementById('btn-test-cxone').addEventListener('click', () => {
  const consoleEl = document.getElementById('cxone-test-console');
  consoleEl.textContent = '> Initiating NICE CXone CTI WebSocket Handshake...\nConnecting wss://na1.niceincontact.com/cti/v2...\n[OK] TLS 1.3 Handshake completed.\n[OK] Authenticated Tenant ENT-NICE-CXONE-9941.\n[OK] WebRTC Media Gateway heartbeats active (18ms latency).\nAll 3 CXone ACD Skills online.';
});

// Initialize
fetchQueue();
renderWallboard();
renderActiveBroadcasts();
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
