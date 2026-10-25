// supervisor.js - Logic for the NICE CXone Supervisor Command Center

// Active Shift Agents Roster
let activeAgents = [
  // Sarah Jenkins (SUP-014) - Floor Lead & General Customer Service
  { id: 'AGT-8842', name: 'Alex Morgan', queue: 'General Customer Service', state: 'AVAILABLE', breakLeft: '-', adherence: '96.4%', teaCount: 1, lunchVar: '0m', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', alertDevice: 'both', thresholdMins: 2 },
  { id: 'AGT-9102', name: 'Samantha Vance', queue: 'General Customer Service', state: 'WORKING (IN CALL)', breakLeft: '-', adherence: '71.2%', teaCount: 1, lunchVar: '+25m', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', alertDevice: 'both', thresholdMins: 2 },
  { id: 'AGT-6512', name: 'Rachel Green', queue: 'General Customer Service', state: 'AVAILABLE', breakLeft: '-', adherence: '98.2%', teaCount: 1, lunchVar: '0m', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', alertDevice: 'both', thresholdMins: 2 },
  { id: 'AGT-8819', name: 'Marcus Brody', queue: 'General Customer Service', state: 'WORKING (IN CALL)', breakLeft: '-', adherence: '91.0%', teaCount: 1, lunchVar: '+2m', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', alertDevice: 'both', thresholdMins: 2 },
  { id: 'AGT-3310', name: 'Chloe Bennett', queue: 'General Customer Service', state: 'AVAILABLE', breakLeft: '-', adherence: '94.2%', teaCount: 1, lunchVar: '0m', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', alertDevice: 'both', thresholdMins: 2 },

  // Michael Chang (SUP-021) - Customer Billing & Retention Manager
  { id: 'AGT-4092', name: 'Jordan Miller', queue: 'Customer Billing & Retention', state: 'AVAILABLE', breakLeft: '-', adherence: '78.5%', teaCount: 4, lunchVar: '0m', supervisorId: 'SUP-021', supervisorName: 'Michael Chang', alertDevice: 'both', thresholdMins: 2 },
  { id: 'AGT-5521', name: 'Lucas Wright', queue: 'Customer Billing & Retention', state: 'WORKING (IN CALL)', breakLeft: '-', adherence: '88.5%', teaCount: 2, lunchVar: '0m', supervisorId: 'SUP-021', supervisorName: 'Michael Chang', alertDevice: 'both', thresholdMins: 2 },
  { id: 'AGT-7703', name: 'Maya Patel', queue: 'Customer Billing & Retention', state: 'AVAILABLE', breakLeft: '-', adherence: '97.0%', teaCount: 1, lunchVar: '0m', supervisorId: 'SUP-021', supervisorName: 'Michael Chang', alertDevice: 'both', thresholdMins: 2 },

  // Elena Rostova (SUP-035) - QA & Tier-2 Tech Support Director
  { id: 'AGT-4491', name: 'Carlos Mendez', queue: 'Tier-2 Tech Support', state: 'AVAILABLE', breakLeft: '-', adherence: '85.0%', teaCount: 2, lunchVar: '+6m', supervisorId: 'SUP-035', supervisorName: 'Elena Rostova', alertDevice: 'mobile', thresholdMins: 2 },

  // David Sterling (SUP-042) - Emergency Inbound Director
  { id: 'AGT-7740', name: 'David Chen', queue: 'Emergency Inbound', state: 'AUX: AUX BREAK', breakLeft: '08:42', adherence: '82.0%', teaCount: 2, lunchVar: '0m', supervisorId: 'SUP-042', supervisorName: 'David Sterling', alertDevice: 'both', thresholdMins: 2 },
  { id: 'AGT-6628', name: 'Olivia Taylor', queue: 'Emergency Inbound', state: 'AVAILABLE', breakLeft: '-', adherence: '99.5%', teaCount: 1, lunchVar: '0m', supervisorId: 'SUP-042', supervisorName: 'David Sterling', alertDevice: 'both', thresholdMins: 2 },

  // Priya Sharma (SUP-059) - WFM Scheduling & Trainee Development Lead
  { id: 'AGT-2219', name: "Liam O'Connor", queue: 'General Customer Service', state: 'AUX: TRAINING', breakLeft: '22:15', adherence: '76.5%', teaCount: 3, lunchVar: '+14m', supervisorId: 'SUP-059', supervisorName: 'Priya Sharma', alertDevice: 'laptop', thresholdMins: 2 }
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
      const aId = data.payload.agent?.id || 'AGT-8842';
      const ag = activeAgents.find(a => a.id === aId);
      if (ag) {
        ag.state = `AUX: ${data.payload.auxCode}`;
        ag.breakLeft = `${data.payload.durationMinutes}:00`;
        if (data.payload.alertDevice || data.payload.device) {
          ag.alertDevice = data.payload.alertDevice || data.payload.device;
        }
        if (data.payload.thresholdMins !== undefined) {
          ag.thresholdMins = data.payload.thresholdMins;
        }
      }
      renderWallboard();
      fetchQueue();
    } else if (data.type === 'ALARM_ACKNOWLEDGED' || data.type === 'BREAK_ENDED') {
      const aId = data.payload?.agentId || 'AGT-8842';
      const ag = activeAgents.find(a => a.id === aId);
      if (ag) {
        ag.state = 'AVAILABLE';
        ag.breakLeft = '-';
      }
      renderWallboard();
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
    const targetPane = document.getElementById(target);
    if (targetPane) targetPane.classList.add('active');

    // Update topbar breadcrumb active title
    const labelEl = btn.querySelector('.nav-label');
    const topTitleEl = document.getElementById('topbar-active-title');
    if (topTitleEl && labelEl) {
      topTitleEl.textContent = labelEl.textContent.trim();
    }

    if (target === 'stab-alerts') {
      renderBirthdayCalendar();
    }
    if (target === 'stab-reports') {
      renderCallTrendDashboard();
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
// ==========================================
// SUPERVISOR SPECIFIC AGENT TEAM FILTERING
// ==========================================
let teamViewMode = 'my_team';   // 'my_team' | 'all_floor'
let queueViewMode = 'my_team';  // 'my_team' | 'all'
let qaTeamViewMode = 'my_team'; // 'my_team' | 'all'
let currentQueueItems = [];

window.setTeamFilter = function(mode) {
  teamViewMode = mode;
  const btnMy = document.getElementById('btn-team-filter-my');
  const btnAll = document.getElementById('btn-team-filter-all');
  if (btnMy && btnAll) {
    if (mode === 'my_team') {
      btnMy.className = 'btn btn-xs btn-primary';
      btnMy.style.color = '#fff';
      btnMy.style.background = '#2563eb';
      btnAll.className = 'btn btn-xs btn-outline';
      btnAll.style.color = '#1e3a8a';
      btnAll.style.background = '#ffffff'; btnAll.style.borderColor = '#bfdbfe'; btnAll.style.color = '#2563eb';
    } else {
      btnAll.className = 'btn btn-xs btn-primary';
      btnAll.style.color = '#fff';
      btnAll.style.background = '#2563eb';
      btnMy.className = 'btn btn-xs btn-outline';
      btnMy.style.color = '#1e3a8a';
      btnMy.style.background = '#ffffff';
    }
  }
  renderWallboard();
  const selRep = document.getElementById('report-type-select');
  if (selRep) loadReport(selRep.value || currentReportKey);
};

window.setQueueFilter = function(mode) {
  queueViewMode = mode;
  const btnMy = document.getElementById('btn-queue-team-my');
  const btnAll = document.getElementById('btn-queue-team-all');
  if (btnMy && btnAll) {
    if (mode === 'my_team') {
      btnMy.className = 'btn btn-xs btn-primary';
      btnMy.style.color = '#fff';
      btnMy.style.background = '#2563eb';
      btnAll.className = 'btn btn-xs btn-outline';
      btnAll.style.color = '#1e3a8a';
      btnAll.style.background = '#ffffff'; btnAll.style.borderColor = '#bfdbfe'; btnAll.style.color = '#2563eb';
    } else {
      btnAll.className = 'btn btn-xs btn-primary';
      btnAll.style.color = '#fff';
      btnAll.style.background = '#2563eb';
      btnMy.className = 'btn btn-xs btn-outline';
      btnMy.style.color = '#1e3a8a';
      btnMy.style.background = '#ffffff';
    }
  }
  renderQueue(currentQueueItems);
};

window.setQATeamFilter = function(mode) {
  qaTeamViewMode = mode;
  const btnMy = document.getElementById('btn-qa-team-my');
  const btnAll = document.getElementById('btn-qa-team-all');
  if (btnMy && btnAll) {
    if (mode === 'my_team') {
      btnMy.className = 'btn btn-xs btn-primary';
      btnMy.style.color = '#fff';
      btnMy.style.background = '#2563eb';
      btnAll.className = 'btn btn-xs btn-outline';
      btnAll.style.color = '#1e3a8a';
      btnAll.style.background = '#ffffff'; btnAll.style.borderColor = '#bfdbfe'; btnAll.style.color = '#2563eb';
    } else {
      btnAll.className = 'btn btn-xs btn-primary';
      btnAll.style.color = '#fff';
      btnAll.style.background = '#2563eb';
      btnMy.className = 'btn btn-xs btn-outline';
      btnMy.style.color = '#1e3a8a';
      btnMy.style.background = '#ffffff';
    }
  }
  renderQAScorecard();
};

// TAB 1: WALLBOARD LOGIC
// ==========================================

let agentSearchQuery = '';

function renderWallboard() {
  const tbody = document.getElementById('agent-wallboard-body');
  if (!tbody) return;

  // 1. Calculate supervisor's assigned team count
  const myTeamAgents = activeAgents.filter(ag => ag.supervisorId === currentSupervisor.id);
  const myTeamCountEl = document.getElementById('my-team-count');
  if (myTeamCountEl) myTeamCountEl.textContent = myTeamAgents.length;

  const unavailCount = activeAgents.filter(ag => ag.state !== 'AVAILABLE').length;
  const p1 = document.getElementById('unavailable-count-pill');
  if (p1) p1.textContent = unavailCount;
  const p2 = document.getElementById('header-unavailable-pill');
  if (p2) p2.textContent = unavailCount;

  // 2. Select base list according to active view mode (Default: My Assigned Team)
  const baseList = teamViewMode === 'my_team' ? myTeamAgents : activeAgents;

  let overdueCount = 0;

  const filteredAgents = baseList.filter(ag => {
    if (!agentSearchQuery) return true;
    const q = agentSearchQuery.toLowerCase();
    return ag.name.toLowerCase().includes(q) ||
           ag.id.toLowerCase().includes(q) ||
           ag.queue.toLowerCase().includes(q) ||
           ag.state.toLowerCase().includes(q) ||
           (ag.supervisorName && ag.supervisorName.toLowerCase().includes(q));
  });

  // 3. Update Live Metrics KPI Row dynamically for this supervisor's active team
  const staffKpi = document.getElementById('kpi-staff');
  if (staffKpi) {
    if (teamViewMode === 'my_team') {
      staffKpi.textContent = `${myTeamAgents.length} / ${myTeamAgents.length}`;
      const sub = staffKpi.nextElementSibling;
      if (sub) sub.textContent = `✓ ${currentSupervisor.name}'s Assigned Team`;
    } else {
      staffKpi.textContent = `${activeAgents.length} / ${activeAgents.length}`;
      const sub = staffKpi.nextElementSibling;
      if (sub) sub.textContent = '✓ All Floor Contact Center Fleet';
    }
  }

  const auxKpi = document.getElementById('kpi-aux');
  if (auxKpi) {
    const inAux = baseList.filter(a => a.state.includes('AUX')).length;
    auxKpi.textContent = `${inAux} Agents`;
    const auxSub = auxKpi.nextElementSibling;
    if (auxSub) auxSub.textContent = teamViewMode === 'my_team' ? `In ${currentSupervisor.name}'s team` : 'Across all floor queues';
  }

  if (filteredAgents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:24px; color:#1e3a8a;">
      No agents found in ${teamViewMode === 'my_team' ? currentSupervisor.name + "'s assigned team" : 'the contact center floor'} matching "${agentSearchQuery}".
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filteredAgents.map(ag => {
    let stateTag = 'ready';
    if (ag.state.includes('AUX')) stateTag = 'aux';
    if (ag.state.includes('WORKING')) stateTag = 'ready';
    if (ag.state === 'OVERDUE') {
      stateTag = 'overdue';
      overdueCount++;
    }

    const isMine = ag.supervisorId === currentSupervisor.id;

    return `
      <tr style="${isMine ? 'background: rgba(37, 99, 235, 0.02);' : ''}">
        <td style="font-family:monospace; color:#1e3a8a;">${ag.id}</td>
        <td><strong style="color:#0f172a;">${ag.name}</strong></td>
        <td style="color:#0f172a;">${ag.queue}</td>
        <td>
          <span class="status-tag" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-size:10px; font-weight:700;">
            ${ag.supervisorName}
          </span>
        </td>
        <td><span class="status-tag ${stateTag}">${ag.state}</span></td>
        <td style="font-family:monospace; color:#2563eb; font-weight:700;">${ag.breakLeft}</td>
        <td style="font-weight:700; color:${parseFloat(ag.adherence) >= policyLimits.targetAdherence ? '#10b981' : '#ef4444'};">${ag.adherence}</td>
        <td>${ag.teaCount} / ${policyLimits.maxTeaBreaks}</td>
        <td>${ag.lunchVar}</td>
        <td>
          <span style="display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; color:#1e293b; background:#ffffff; padding:3px 8px; border-radius:6px; border:1px solid #bfdbfe;">
            ${(ag.alertDevice || (ag.id === 'AGT-4491' ? 'mobile' : 'both')) === 'both' ? '💻+📱 Both' : ((ag.alertDevice || (ag.id === 'AGT-4491' ? 'mobile' : 'both')) === 'mobile' ? '📱 Mobile' : '💻 Laptop')}
            <span style="color:#d97706;">(+${ag.thresholdMins || 2}m)</span>
          </span>
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-sm btn-outline" onclick="recallAgent('${ag.id}', '${ag.name}')" title="Place Automated Bot Voice Call">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> Bot Recall
            </button>
            <button class="btn btn-sm btn-outline" style="border-color:#ef4444; color:#ef4444;" onclick="ringAgentAlarm('${ag.id}', '${ag.name}')" title="Trigger Calling Alarm &amp; Vibration to Mobile Phone Only">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg> Ring Mobile
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const overdueEl = document.getElementById('kpi-overdue');
  const overdueSub = document.getElementById('kpi-overdue-sub');
  if (overdueCount > 0) {
    if (overdueEl) overdueEl.textContent = overdueCount;
    if (overdueSub) overdueSub.textContent = 'Action Required: Bot call placed';
  } else {
    if (overdueEl) overdueEl.textContent = '0';
    if (overdueSub) overdueSub.textContent = 'No active overages';
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


function showSupervisorToast(msg, isSuccess = true) {
  let toast = document.getElementById('supervisor-dynamic-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'supervisor-dynamic-toast';
    toast.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 999999;
      background: #0f172a;
      color: #ffffff;
      padding: 16px 22px;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.35);
      border-left: 5px solid #ef4444;
      font-size: 14px;
      line-height: 1.5;
      max-width: 440px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 12px;
      pointer-events: none; /* NEVER BLOCK CLICKS */
    `;
    document.body.appendChild(toast);
  }
  toast.style.display = 'flex';
  toast.style.borderLeftColor = isSuccess ? '#10b981' : '#ef4444';
  const icon = (msg.includes('Voice') || msg.includes('Recall') || msg.includes('Bot')) ? '📞' : '🚨';
  toast.innerHTML = `<div style="font-size:26px;">${icon}</div><div><strong style="display:block; font-size:12px; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.5px;">Floor Adherence Action</strong><div style="font-weight:600;">${msg}</div></div>`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  
  if (window._toastTimer) clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => { if (toast) toast.style.display = 'none'; }, 350);
  }, 4000);
}

window.ringAgentAlarm = async function(agentId, agentName) {
  const ag = activeAgents.find(a => a.id === agentId) || {};
  const threshold = ag.thresholdMins !== undefined ? ag.thresholdMins : 2;
  const customMessage = `Supervisor ${currentSupervisor.name} issued an urgent floor adherence alert. Your break threshold has been exceeded. Please return to your workstation immediately.`;

  // Explicitly route to Mobile Only (leaving laptop silent) as requested
  const targetDevice = 'mobile';

  let alarmData = null;
  try {
    const res = await fetch('/api/alerts/trigger-alarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: agentId,
        agentName: agentName,
        device: targetDevice, // Mobile Only
        thresholdMins: threshold,
        triggeredBy: 'SUPERVISOR_WALLBOARD',
        soundStyle: 'phone_ring',
        force: true,
        message: customMessage
      })
    });
    alarmData = await res.json();
  } catch (err) {
    console.warn('Backend trigger failed:', err);
  }

  if (bc) {
    try {
      bc.postMessage({
        type: 'TRIGGER_ALARM',
        payload: {
          agentId: agentId,
          agentName: agentName,
          device: targetDevice, // Mobile Only
          triggeredBy: 'SUPERVISOR_WALLBOARD',
          force: true,
          message: customMessage
        }
      });
    } catch (e) {}
  }

  showSupervisorToast(`Remote Ring dispatched to ${agentName} (${agentId})! Target: [MOBILE ONLY]. Laptop remains silent.`);
};

window.recallAgent = async function(agentId, agentName) {
  const ag = activeAgents.find(a => a.id === agentId) || {};
  const targetDevice = ag.alertDevice || 'both';
  const customMessage = `Attention Agent ${agentName}: Supervisor ${currentSupervisor.name} has issued an urgent automated bot voice recall. Please return to your desk and switch to AVAILABLE status immediately.`;

  let alarmData = null;
  try {
    const res = await fetch('/api/alerts/trigger-alarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: agentId,
        agentName: agentName,
        device: targetDevice,
        triggeredBy: 'SUPERVISOR_RECALL',
        soundStyle: 'voice',
        force: true,
        message: customMessage
      })
    });
    alarmData = await res.json();
  } catch (err) {
    console.warn('Backend trigger failed:', err);
  }

  const effectiveDev = (alarmData && alarmData.alarm && alarmData.alarm.device) ? alarmData.alarm.device : targetDevice;

  if (bc) {
    try {
      bc.postMessage({
        type: 'SUPERVISOR_RECALL',
        payload: {
          agentId: agentId,
          agentName: agentName,
          device: effectiveDev,
          force: true,
          message: customMessage
        }
      });
    } catch (e) {}
  }

  showSupervisorToast(`Automated Bot Recall dispatched to ${agentName} (${agentId})! Target: [${effectiveDev.toUpperCase()}]. Workstation & phone ringing now.`);
};

window.forceAvailable = function(agentId) {
  updateAgentState(agentId, 'AVAILABLE', '-');
  alert(`Agent ${agentId} remotely switched to AVAILABLE state in NICE CXone.`);
};

document.getElementById('btn-refresh-wallboard')?.addEventListener('click', renderWallboard);

document.getElementById('btn-search-agents')?.addEventListener('click', () => {
  const input = document.getElementById('agent-search-input');
  agentSearchQuery = input ? input.value.trim() : '';
  renderWallboard();
});

document.getElementById('agent-search-input')?.addEventListener('keyup', (e) => {
  agentSearchQuery = e.target.value.trim();
  renderWallboard();
});

document.getElementById('btn-clear-agent-search')?.addEventListener('click', () => {
  const input = document.getElementById('agent-search-input');
  if (input) input.value = '';
  agentSearchQuery = '';
  renderWallboard();
});

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
  currentQueueItems = queue || [];
  const tbody = document.getElementById('queue-table-body');
  const badgeEl = document.getElementById('sup-queue-badge');

  // Tag items with supervisor mapping
  const taggedQueue = (queue || []).map(item => {
    const ag = activeAgents.find(a => a.id === item.agentId);
    return {
      ...item,
      supervisorId: item.supervisorId || (ag ? ag.supervisorId : 'SUP-014'),
      supervisorName: item.supervisorName || (ag ? ag.supervisorName : 'Sarah Jenkins')
    };
  });

  const myTeamQueue = taggedQueue.filter(item => item.supervisorId === currentSupervisor.id);
  const queueCountEl = document.getElementById('queue-team-count');
  if (queueCountEl) queueCountEl.textContent = myTeamQueue.length;

  const displayQueue = queueViewMode === 'my_team' ? myTeamQueue : taggedQueue;
  if (badgeEl) badgeEl.textContent = displayQueue.length;

  if (!displayQueue || displayQueue.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#1e3a8a; padding:20px;">
      No break requests in ${queueViewMode === 'my_team' ? currentSupervisor.name + "'s queue" : 'all floor queues'}.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = displayQueue.map(item => {
    const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Now';
    const isApproved = item.status === 'APPROVED';
    const tagClass = isApproved ? 'approved' : 'rejected';
    
    return `
      <tr>
        <td style="color:#1e3a8a; font-family:monospace;">${timeStr}</td>
        <td><strong>${item.id || 'REQ-AUTO'}</strong></td>
        <td>
          <div style="font-weight:600; color:#0f172a;">${item.agentName || 'Agent'}</div>
          <small style="color:#1e3a8a;">${item.agentId || 'AGT'}</small>
          <div style="margin-top:2px;">
            <span class="status-tag" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-size:9px;">
              ${item.supervisorName}
            </span>
          </div>
        </td>
        <td>${item.auxCode || 'Break'}</td>
        <td>${item.durationMinutes ? item.durationMinutes + ' mins' : '-'}</td>
        <td><span class="status-tag ${tagClass}">${item.status}</span></td>
        <td style="max-width: 320px; line-height: 1.4; color: #0f172a;">
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

document.getElementById('btn-refresh-queue')?.addEventListener('click', fetchQueue);
document.getElementById('btn-clear-queue')?.addEventListener('click', () => {
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
  statusMsg.style.color = '#047857';
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
        <strong style="color:#0f172a; font-size:12px; margin:4px 0; display:block;">${b.title}</strong>
        <p style="font-size:11px; color:#0f172a; line-height:1.4;">${b.message}</p>
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

document.getElementById('btn-bc-storm')?.addEventListener('click', () => {
  dispatchSupervisorBroadcast('CRITICAL', 'TORNADO & SEVERE STORM WARNING', 'Severe storm/tornado advisory active for regional facility. Inbound call diverts enabled. Prepare for high call volumes.');
});

document.getElementById('btn-bc-outage')?.addEventListener('click', () => {
  dispatchSupervisorBroadcast('CRITICAL', 'SEV-1 CRM DATABASE LATENCY OUTAGE', 'Cloud CRM replication latency high. Switch to offline wrap-up notes. Telephony queue remains active.');
});

document.getElementById('btn-bc-monday')?.addEventListener('click', () => {
  dispatchSupervisorBroadcast('WARNING', 'MONDAY MORNING HIGH CALL VOLUME MODE', 'Queue depth threshold exceeded. Discretionary AUX breaks restricted. Maintain Available state in NICE CXone.');
});

document.getElementById('btn-bc-cxone')?.addEventListener('click', () => {
  dispatchSupervisorBroadcast('INFO', 'NICE CXONE PLATFORM UPDATE', 'Cluster maintenance window complete. All WebRTC endpoints report optimal latency (<20ms).');
});

document.getElementById('btn-send-custom-bc')?.addEventListener('click', () => {
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
// BIRTHDAY CALENDAR & CELEBRATIONS HUB
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

let currentBirthdayFilter = 'upcoming';
let currentBirthdaySearch = '';
const publishedBirthdaysSet = new Set();

function calculateDaysUntil(month, day) {
  const today = new Date(2026, 9, 21); // Month 9 is October (0-indexed)
  const currentYear = today.getFullYear();
  let nextBday = new Date(currentYear, month - 1, day);
  if (nextBday < today) {
    nextBday = new Date(currentYear + 1, month - 1, day);
  }
  const diffTime = nextBday - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

window.setBirthdayFilter = function(filter) {
  currentBirthdayFilter = filter;
  const btns = document.querySelectorAll('.bday-tab-btn');
  btns.forEach(btn => {
    if (btn.getAttribute('data-filter') === filter) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  renderBirthdayCalendar();
};

window.handleBirthdaySearch = function(query) {
  currentBirthdaySearch = (query || '').toLowerCase().trim();
  renderBirthdayCalendar();
};

function renderBirthdayCalendar() {
  const container = document.getElementById('birthday-grid');
  if (!container) return;

  const currentMonth = 10; // October
  const currentDay = 21;

  let list = BIRTHDAY_ROSTER.map(item => {
    const daysUntil = calculateDaysUntil(item.birthMonth, item.birthDay);
    const isToday = (item.birthMonth === currentMonth && item.birthDay === currentDay);
    const isTomorrow = daysUntil === 1;
    return { ...item, daysUntil, isToday, isTomorrow };
  });

  // Filter
  if (currentBirthdayFilter === 'today') {
    list = list.filter(item => item.isToday);
  } else if (currentBirthdayFilter === 'upcoming') {
    // Next 35 days
    list = list.filter(item => item.daysUntil <= 35).sort((a, b) => a.daysUntil - b.daysUntil);
  } else if (currentBirthdayFilter === 'agents') {
    list = list.filter(item => !item.isSupervisor).sort((a, b) => a.daysUntil - b.daysUntil);
  } else if (currentBirthdayFilter === 'supervisors') {
    list = list.filter(item => item.isSupervisor).sort((a, b) => a.daysUntil - b.daysUntil);
  } else {
    // All 12 months sorted by calendar month/day
    list = list.sort((a, b) => {
      if (a.birthMonth !== b.birthMonth) return a.birthMonth - b.birthMonth;
      return a.birthDay - b.birthDay;
    });
  }

  // Search
  if (currentBirthdaySearch) {
    list = list.filter(item => {
      return item.name.toLowerCase().includes(currentBirthdaySearch) ||
             item.id.toLowerCase().includes(currentBirthdaySearch) ||
             item.queue.toLowerCase().includes(currentBirthdaySearch) ||
             item.role.toLowerCase().includes(currentBirthdaySearch);
    });
  }

  if (list.length === 0) {
    container.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding:30px; color:#1e3a8a;">No birthdays match your selected filter or search criteria.</div>';
    return;
  }

  container.innerHTML = list.map(item => {
    let cardClass = 'birthday-card-item';
    let badgeHtml = '';
    let countdownText = '';

    if (item.isToday) {
      cardClass += ' is-today';
      badgeHtml = '<span class="bday-badge-today">🎉 TODAY!</span>';
      countdownText = '<strong style="color:#ec4899;">🎂 Celebrating Today!</strong>';
    } else if (item.isTomorrow) {
      cardClass += ' is-tomorrow';
      badgeHtml = '<span class="bday-badge-tomorrow">🎂 TOMORROW</span>';
      countdownText = '<span style="color:#d97706; font-weight:700;">In 1 day</span>';
    } else {
      badgeHtml = '<span class="bday-badge-upcoming">🎈 ' + item.birthDateStr + '</span>';
      countdownText = '<span style="color:#1e3a8a;">In ' + item.daysUntil + ' days</span>';
    }

    const isPublished = publishedBirthdaysSet.has(item.id);
    const pubBtnText = isPublished ? '✅ Published Just Now' : '📢 Publish Birthday Broadcast';
    const pubBtnClass = isPublished ? 'btn-publish-bday published' : 'btn-publish-bday';

    return '<div class="' + cardClass + '">' +
      '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">' +
        '<div style="display:flex; align-items:center; gap:10px;">' +
          '<div class="bday-avatar-circle ' + (item.isSupervisor ? 'supervisor' : '') + ' ' + (item.isToday ? 'today' : '') + '">' + item.avatar + '</div>' +
          '<div>' +
            '<div style="display:flex; align-items:center; gap:6px;">' +
              '<strong style="color:#0f172a; font-size:13px;">' + item.name + '</strong>' +
              '<span class="status-tag ' + (item.isSupervisor ? 'approved' : 'aux') + '" style="font-size:9px; padding:2px 6px;">' + (item.isSupervisor ? 'Supervisor' : 'Agent') + '</span>' +
            '</div>' +
            '<div style="font-family:monospace; font-size:11px; color:#1e3a8a;">' + item.id + ' • ' + item.queue + '</div>' +
          '</div>' +
        '</div>' +
        badgeHtml +
      '</div>' +

      '<div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; padding:6px 10px; background:#ffffff; border-radius:6px; margin-bottom:12px; border:1px solid #dbeafe;">' +
        '<div><span style="color:#1e3a8a;">Birthday:</span> <strong style="color:#0f172a;">' + item.birthDateStr + '</strong></div>' +
        '<div>' + countdownText + '</div>' +
      '</div>' +

      '<button id="btn-pub-bday-' + item.id + '" class="' + pubBtnClass + '" onclick="publishBirthdayBroadcast(\'' + item.id + '\')"' + (isPublished ? ' disabled' : '') + '>' +
        pubBtnText +
      '</button>' +
    '</div>';
  }).join('');
}

window.publishBirthdayBroadcast = function(personId, customGreeting = null) {
  const person = BIRTHDAY_ROSTER.find(p => p.id === personId);
  if (!person) return;

  const defaultMsg = customGreeting || ('🎈 The entire floor leadership and operations team wish ' + person.name + ' (' + person.role + ' - ' + person.queue + ') a wonderful Happy Birthday! Thank you for your continued dedication, empathy, and stellar service!');
  const title = '🎂 Happy Birthday ' + person.name + '! 🎉';

  // 1. Dispatch via supervisor broadcast logic
  dispatchSupervisorBroadcast('CELEBRATION', title, defaultMsg);

  // 2. Mark as published
  publishedBirthdaysSet.add(personId);
  renderBirthdayCalendar();

  // 3. Post to API for audit persistence
  fetch('/api/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'BC-BDAY-' + Date.now(),
      severity: 'CELEBRATION',
      title,
      message: defaultMsg,
      sender: 'Supervisor ' + currentSupervisor.name + ' (' + currentSupervisor.id + ')'
    })
  }).catch(() => {});

  alert('🎉 Birthday Broadcast published successfully! Dispatched to all agent desktop widgets across the floor.');
};

window.autoPublishTodayBirthdays = function() {
  const todaysBirthdays = BIRTHDAY_ROSTER.filter(p => p.birthMonth === 10 && p.birthDay === 21);
  if (todaysBirthdays.length === 0) {
    alert('No birthdays scheduled for today.');
    return;
  }
  todaysBirthdays.forEach(person => {
    publishBirthdayBroadcast(person.id);
  });
};

window.openBirthdayBroadcastModal = function() {
  const person = BIRTHDAY_ROSTER.find(p => p.birthMonth === 10 && p.birthDay === 21) || BIRTHDAY_ROSTER[0];
  const customGreeting = prompt('Enter celebration broadcast message for ' + person.name + ':', '🎈 Happy Birthday ' + person.name + '! Wishing you an incredible year ahead from everyone on the contact center floor!');
  if (customGreeting && customGreeting.trim()) {
    publishBirthdayBroadcast(person.id, customGreeting.trim());
  }
};


// ==========================================
// PREVIOUS DAYS CALL TRENDS TELEMETRY & DASHBOARD
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

let currentTrendRange = '7d';
let currentTrendSkill = 'all';

window.setTrendRange = function(range) {
  currentTrendRange = range;
  const btns = document.querySelectorAll('.trend-range-btn');
  btns.forEach(b => {
    if (b.getAttribute('data-range') === range) b.classList.add('active');
    else b.classList.remove('active');
  });
  renderCallTrendDashboard();
};

window.handleTrendSkillChange = function(skill) {
  currentTrendSkill = skill;
  renderCallTrendDashboard();
};

function renderCallTrendDashboard() {
  const daysCount = currentTrendRange === '14d' ? 14 : 7;
  const dataSlice = CALL_TRENDS_HISTORY.slice(0, daysCount);
  const today = dataSlice[0];
  const yesterday = dataSlice[1];

  // Multiplier for skill filtering
  let skillMultiplier = 1.0;
  if (currentTrendSkill === 'billing') skillMultiplier = 0.38;
  if (currentTrendSkill === 'cs') skillMultiplier = 0.25;
  if (currentTrendSkill === 'tech') skillMultiplier = 0.18;
  if (currentTrendSkill === 'emergency') skillMultiplier = 0.10;

  const todayOffered = Math.round(today.offered * skillMultiplier);
  const yestOffered = Math.round(yesterday.offered * skillMultiplier);
  const todayHandled = Math.round(today.handled * skillMultiplier);
  const todayDeflected = Math.round(today.deflected * (currentTrendSkill === 'all' || currentTrendSkill === 'emergency' ? 1.0 : 0.2));

  const dodDelta = +(((todayOffered - yestOffered) / yestOffered) * 100).toFixed(1);
  const slaDelta = +(today.sla - yesterday.sla).toFixed(1);

  // Update KPI Cards
  const kOffered = document.getElementById('trend-kpi-offered');
  const kOfferedDelta = document.getElementById('trend-kpi-offered-delta');
  const kOfferedSub = document.getElementById('trend-kpi-offered-sub');
  const kHandled = document.getElementById('trend-kpi-handled');
  const kDeflectedBadge = document.getElementById('trend-kpi-deflected-badge');
  const kAht = document.getElementById('trend-kpi-aht');
  const kAhtDelta = document.getElementById('trend-kpi-aht-delta');
  const kAsa = document.getElementById('trend-kpi-asa');
  const kSla = document.getElementById('trend-kpi-sla');
  const kSlaDelta = document.getElementById('trend-kpi-sla-delta');
  const kAbandon = document.getElementById('trend-kpi-abandon');

  if (kOffered) kOffered.textContent = todayOffered.toLocaleString();
  if (kOfferedDelta) {
    kOfferedDelta.textContent = (dodDelta >= 0 ? '▲ +' : '▼ ') + dodDelta + '% DoD';
    kOfferedDelta.style.color = dodDelta >= 0 ? '#2563eb' : '#10b981';
    kOfferedDelta.style.background = dodDelta >= 0 ? '#eff6ff' : '#ecfdf5';
  }
  if (kOfferedSub) kOfferedSub.textContent = 'vs Yesterday (' + yestOffered.toLocaleString() + ') | Skill: ' + (currentTrendSkill.toUpperCase());
  if (kHandled) kHandled.textContent = todayHandled.toLocaleString();
  if (kDeflectedBadge) kDeflectedBadge.textContent = '+' + todayDeflected + ' Deflected';
  if (kAht) kAht.textContent = today.ahtStr;
  if (kAhtDelta) kAhtDelta.textContent = '▼ -18s DoD (4m 12s vs 4m 30s)';
  if (kAsa) kAsa.textContent = today.asaSec + ' sec';
  if (kSla) kSla.textContent = today.sla + '%';
  if (kSlaDelta) kSlaDelta.textContent = (slaDelta >= 0 ? '▲ +' : '▼ ') + slaDelta + '% DoD';
  if (kAbandon) kAbandon.textContent = today.abandonRate + '%';

  // Render SVG Trend Chart
  renderTrendSvgChart(dataSlice, skillMultiplier);

  // Render Peak Hourly Bars
  renderTrendHourlyBars();
}

function renderTrendSvgChart(dataSlice, multiplier) {
  const container = document.getElementById('trend-svg-container');
  if (!container) return;

  const w = 540;
  const h = 200;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 30;

  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  // Max volume for scaling
  const maxVol = Math.max(...dataSlice.map(d => d.offered * multiplier)) * 1.15;
  const colW = Math.min(32, (chartW / dataSlice.length) - 8);

  // Reverse to show chronological left to right
  const chronological = [...dataSlice].reverse();

  let barsSvg = '';
  let linePoints = [];

  chronological.forEach((d, idx) => {
    const x = padL + (idx * (chartW / chronological.length)) + ((chartW / chronological.length - colW) / 2);
    const scaledOffered = d.offered * multiplier;
    const scaledHandled = d.handled * multiplier;
    const barH = (scaledOffered / maxVol) * chartH;
    const handledH = (scaledHandled / maxVol) * chartH;

    const yOffered = padT + chartH - barH;
    const yHandled = padT + chartH - handledH;

    // SLA point (scale 70% to 100%)
    const slaY = padT + chartH - (((d.sla - 70) / 30) * chartH);
    linePoints.push((x + colW / 2) + ',' + slaY);

    const isTodayCol = (idx === chronological.length - 1);
    const barColor = isTodayCol ? '#2563eb' : '#bfdbfe';
    const handledColor = isTodayCol ? '#10b981' : '#a7f3d0';

    const shortDate = d.date.split('-').slice(1).join('/');

    barsSvg += '<g class="chart-col" style="cursor:pointer;" onmouseenter="hoverTrendDay(' + (dataSlice.length - 1 - idx) + ')">' +
      // Background hover area
      '<rect x="' + (x - 4) + '" y="' + padT + '" width="' + (colW + 8) + '" height="' + chartH + '" fill="transparent" />' +
      // Offered bar
      '<rect x="' + x + '" y="' + yOffered + '" width="' + colW + '" height="' + barH + '" rx="3" fill="' + barColor + '" opacity="0.85" />' +
      // Handled bar (nested or overlay)
      '<rect x="' + (x + 2) + '" y="' + yHandled + '" width="' + (colW - 4) + '" height="' + handledH + '" rx="2" fill="' + handledColor + '" opacity="0.9" />' +
      // Date label
      '<text x="' + (x + colW / 2) + '" y="' + (h - 8) + '" font-size="10" fill="#1e3a8a" text-anchor="middle" font-weight="' + (isTodayCol ? '700' : '400') + '">' + shortDate + '</text>' +
    '</g>';
  });

  // Benchmark line for SLA (80%)
  const benchmarkY = padT + chartH - (((80 - 70) / 30) * chartH);
  const benchmarkLine = '<line x1="' + padL + '" y1="' + benchmarkY + '" x2="' + (w - padR) + '" y2="' + benchmarkY + '" stroke="#ef4444" stroke-dasharray="3,3" stroke-width="1.5" />' +
    '<text x="' + (w - padR - 60) + '" y="' + (benchmarkY - 4) + '" font-size="9" fill="#ef4444" font-weight="700">80% Target SLA</text>';

  // SLA Line
  const slaPath = '<polyline points="' + linePoints.join(' ') + '" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />' +
    linePoints.map(pt => '<circle cx="' + pt.split(',')[0] + '" cy="' + pt.split(',')[1] + '" r="3.5" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" />').join('');

  container.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%; height:100%; overflow:visible;">' +
    // Grid lines
    '<line x1="' + padL + '" y1="' + padT + '" x2="' + (w - padR) + '" y2="' + padT + '" stroke="#dbeafe" />' +
    '<line x1="' + padL + '" y1="' + (padT + chartH / 2) + '" x2="' + (w - padR) + '" y2="' + (padT + chartH / 2) + '" stroke="#dbeafe" />' +
    '<line x1="' + padL + '" y1="' + (padT + chartH) + '" x2="' + (w - padR) + '" y2="' + (padT + chartH) + '" stroke="#dbeafe" />' +
    benchmarkLine +
    barsSvg +
    slaPath +
  '</svg>';
}

window.hoverTrendDay = function(idx) {
  const d = CALL_TRENDS_HISTORY[idx];
  const pill = document.getElementById('trend-day-details-pill');
  if (!d || !pill) return;

  pill.innerHTML = '<strong>📅 ' + d.day + ' (' + d.date + '):</strong> Inbound: <strong>' + d.offered.toLocaleString() + '</strong> | Handled: <strong>' + d.handled.toLocaleString() + '</strong> (' + ((d.handled / d.offered) * 100).toFixed(1) + '%) | Deflected: <strong>' + d.deflected + '</strong> | Abandon: <strong>' + d.abandonRate + '%</strong> | AHT: <strong>' + d.ahtStr + '</strong> | SLA: <strong style="color:' + (d.sla >= 80 ? '#10b981' : '#ef4444') + ';">' + d.sla + '%</strong> | Peak: <em>' + d.peakSurge + '</em>';
};

function renderTrendHourlyBars() {
  const container = document.getElementById('trend-hourly-bars');
  if (!container) return;

  container.innerHTML = HOURLY_CALL_COMPARISON.map(h => {
    const isSurgeHour = h.todayActual > 500;
    const maxVal = 750;
    const basePct = Math.round((h.prevDaysAvg / maxVal) * 100);
    const todayPct = Math.round((h.todayActual / maxVal) * 100);

    return '<div class="trend-hourly-row">' +
      '<div style="display:flex; justify-content:space-between; font-size:11px;">' +
        '<span><strong style="color:#0f172a;">' + h.hour + '</strong> <small style="color:#1e3a8a;">(' + h.peakNote + ')</small></span>' +
        '<span><span style="color:#1e3a8a;">Base: ' + h.prevDaysAvg + '</span> vs <strong style="color:' + (isSurgeHour ? '#ef4444' : '#2563eb') + ';">' + h.todayActual + ' Today</strong></span>' +
      '</div>' +
      '<div class="trend-bar-track">' +
        '<div class="trend-bar-baseline" style="width:' + basePct + '%;" title="Prev Days Baseline: ' + h.prevDaysAvg + '"></div>' +
        '<div class="trend-bar-today ' + (isSurgeHour ? 'surge' : '') + '" style="width:' + Math.abs(todayPct - basePct) + '%; margin-left:2px;" title="Today: ' + h.todayActual + '"></div>' +
      '</div>' +
    '</div>';
  }).join('');
}

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
      ['VIO-881', 'AGT-4092', 'Jordan Miller', 'Excessive AUX Breaks', '4 breaks taken (Limit: 2)', 'HIGH', '<span class="status-tag rejected">Supervisor Coaching</span>'],
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
  call_trends: {
    title: 'Previous Days Call Volumes, AHT, SLA & Abandonment Trend Analysis',
    summary: '<strong>14-Day Historical Trend:</strong> 53,880 Total Inbound Calls | <strong>Average SLA:</strong> 88.3% | <strong>Fleet AHT:</strong> 4m 24s | <strong>Total Deflected:</strong> 1,798',
    headers: ['Date', 'Day of Week', 'Inbound Offered', 'Calls Handled', 'Deflected (IVR)', 'Abandonment %', 'Avg ASA', 'Avg AHT', 'SLA %', 'SLA Status'],
    rows: CALL_TRENDS_HISTORY.map(d => [
      d.date,
      d.day,
      d.offered.toLocaleString() + ' calls',
      d.handled.toLocaleString() + ' calls',
      d.deflected > 0 ? (d.deflected.toLocaleString() + ' deflected') : '0',
      d.abandonRate + '% (' + d.abandoned + ')',
      d.asaSec + 's',
      d.ahtStr,
      d.sla + '%',
      d.sla >= 80 ? '<span class="status-tag approved">' + d.status + '</span>' : '<span class="status-tag rejected">' + d.status + '</span>'
    ])
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

  let displayRows = rep.rows;
  if (teamViewMode === 'my_team' && key !== 'call_trends') {
    displayRows = rep.rows.filter(row => {
      const agId = row[0];
      const ag = activeAgents.find(a => a.id === agId);
      return ag && ag.supervisorId === currentSupervisor.id;
    });
  }

  const sumBar = document.getElementById('report-summary-bar');
  if (sumBar) {
    sumBar.innerHTML = teamViewMode === 'my_team'
      ? `<strong>Viewing:</strong> ${currentSupervisor.name}'s Assigned Team (${displayRows.length} Agents) | ${rep.summary}`
      : `<strong>Viewing:</strong> All Floor Fleet (${rep.rows.length} Agents) | ${rep.summary}`;
  }

  const thead = document.getElementById('report-table-head');
  if (thead) thead.innerHTML = `<tr>${rep.headers.map(h => `<th>${h}</th>`).join('')}</tr>`;

  const tbody = document.getElementById('report-table-body');
  if (tbody) {
    if (displayRows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${rep.headers.length}" style="text-align:center; padding:24px; color:#1e3a8a;">
        No entries in this audit report for ${currentSupervisor.name}'s assigned agents. Toggle 'All Floor' to inspect organization-wide metrics.
      </td></tr>`;
    } else {
      tbody.innerHTML = displayRows.map(row => {
        return `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
      }).join('');
    }
  }
}

document.getElementById('report-type-select')?.addEventListener('change', (e) => {
  loadReport(e.target.value);
});

// CSV Export Engine
document.getElementById('btn-export-csv')?.addEventListener('click', () => {
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
  // Sarah Jenkins (SUP-014)
  { agentId: 'AGT-9102', name: 'Samantha Vance', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', contactId: '#90429', tone: 'Bad / Confused', securityVerified: false, detailsRetrieved: false, queryResolved: false, ivrStars: 2.0, qaScore: 32, recommendedModule: 'MOD-102', flagReason: 'Missed customer security PIN verification + Unresolved inquiry', trainingAssigned: false },
  { agentId: 'AGT-6512', name: 'Rachel Green', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', contactId: '#90438', tone: 'Good / Empathetic', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 5.0, qaScore: 98, recommendedModule: 'MOD-104', flagReason: 'None (Exemplary Retention)', trainingAssigned: false },
  { agentId: 'AGT-8819', name: 'Marcus Brody', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', contactId: '#90441', tone: 'Neutral / Trainee', securityVerified: true, detailsRetrieved: false, queryResolved: true, ivrStars: 4.0, qaScore: 81, recommendedModule: 'MOD-103', flagReason: 'Incomplete account details lookup', trainingAssigned: false },
  { agentId: 'AGT-3310', name: 'Chloe Bennett', supervisorId: 'SUP-014', supervisorName: 'Sarah Jenkins', contactId: '#90445', tone: 'Good / Empathetic', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 4.8, qaScore: 95, recommendedModule: 'MOD-104', flagReason: 'None (Senior Lead)', trainingAssigned: false },

  // Michael Chang (SUP-021)
  { agentId: 'AGT-4092', name: 'Jordan Miller', supervisorId: 'SUP-021', supervisorName: 'Michael Chang', contactId: '#90425', tone: 'Rudely / Impatient', securityVerified: true, detailsRetrieved: true, queryResolved: false, ivrStars: 1.0, qaScore: 48, recommendedModule: 'MOD-101', flagReason: 'Rude speech tone to customer + Unresolved dispute', trainingAssigned: false },
  { agentId: 'AGT-5521', name: 'Lucas Wright', supervisorId: 'SUP-021', supervisorName: 'Michael Chang', contactId: '#90449', tone: 'Good / Professional', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 4.6, qaScore: 92, recommendedModule: 'MOD-104', flagReason: 'None (Fast Wrap-up)', trainingAssigned: false },
  { agentId: 'AGT-7703', name: 'Maya Patel', supervisorId: 'SUP-021', supervisorName: 'Michael Chang', contactId: '#90453', tone: 'Good / Empathetic', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 5.0, qaScore: 99, recommendedModule: 'MOD-104', flagReason: 'None (VIP Care)', trainingAssigned: false },

  // Elena Rostova (SUP-035)
  { agentId: 'AGT-8842', name: 'Alex Morgan', supervisorId: 'SUP-035', supervisorName: 'Elena Rostova', contactId: '#90421', tone: 'Good / Empathetic', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 5.0, qaScore: 96, recommendedModule: 'MOD-104', flagReason: 'None (Top Performer)', trainingAssigned: false },
  { agentId: 'AGT-4491', name: 'Carlos Mendez', supervisorId: 'SUP-035', supervisorName: 'Elena Rostova', contactId: '#90458', tone: 'Neutral / Direct', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 3.8, qaScore: 84, recommendedModule: 'MOD-104', flagReason: 'None (Hardware Specialist)', trainingAssigned: false },

  // David Sterling (SUP-042)
  { agentId: 'AGT-7740', name: 'David Chen', supervisorId: 'SUP-042', supervisorName: 'David Sterling', contactId: '#90432', tone: 'Neutral / Direct', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 3.5, qaScore: 85, recommendedModule: 'MOD-104', flagReason: 'None (Acceptable SLA)', trainingAssigned: false },
  { agentId: 'AGT-6628', name: 'Olivia Taylor', supervisorId: 'SUP-042', supervisorName: 'David Sterling', contactId: '#90462', tone: 'Good / Calm', securityVerified: true, detailsRetrieved: true, queryResolved: true, ivrStars: 5.0, qaScore: 100, recommendedModule: 'MOD-104', flagReason: 'None (Disaster Dispatch Lead)', trainingAssigned: false },

  // Priya Sharma (SUP-059)
  { agentId: 'AGT-2219', name: "Liam O'Connor", supervisorId: 'SUP-059', supervisorName: 'Priya Sharma', contactId: '#90468', tone: 'Bad / Hesitant', securityVerified: false, detailsRetrieved: false, queryResolved: false, ivrStars: 2.5, qaScore: 36, recommendedModule: 'MOD-103', flagReason: 'Failed resolution + Missing account history', trainingAssigned: false }
];

let qaFilterState = 'all';
let qaSearchQuery = '';

function renderQAScorecard() {
  const tbody = document.getElementById('qa-scorecard-body');
  if (!tbody) return;

  const filteredData = qaScorecardData.filter(item => {
    if (qaTeamViewMode === 'my_team' && item.supervisorId !== currentSupervisor.id) return false;
    const isRudeOrBad = item.tone.includes('Rudely') || item.tone.includes('Bad');
    if (qaFilterState === 'flagged' && !isRudeOrBad) return false;
    if (qaFilterState === 'low_score' && item.qaScore >= 70) return false;
    if (qaFilterState === 'unresolved' && item.queryResolved) return false;
    if (qaFilterState === 'passing' && item.qaScore < 80) return false;

    if (qaSearchQuery) {
      const q = qaSearchQuery.toLowerCase();
      const match = item.name.toLowerCase().includes(q) ||
                    item.agentId.toLowerCase().includes(q) ||
                    item.contactId.toLowerCase().includes(q) ||
                    item.tone.toLowerCase().includes(q) ||
                    (item.flagReason && item.flagReason.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  if (filteredData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:24px; color:#1e3a8a;">No interaction records found matching current filter/search.</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredData.map(item => {
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
      <tr style="${isRudeOrBad ? 'background: rgba(239, 68, 68, 0.05);' : ''}">
        <td>
          <div style="font-weight:600; color:#0f172a;">${item.name}</div>
          <small style="color:#1e3a8a; font-family:monospace;">${item.agentId}</small>
        </td>
        <td style="font-family:monospace; color:#2563eb;">${item.contactId}</td>
        <td><span class="status-tag ${toneBadgeClass}">${item.tone}</span></td>
        <td>${verifBadge}</td>
        <td>${detailsBadge}</td>
        <td>${resBadge}</td>
        <td><strong style="color:#d97706;">★ ${item.ivrStars.toFixed(1)}</strong> / 5.0</td>
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

// QA Filter Buttons
document.querySelectorAll('.qa-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.qa-filter-btn').forEach(b => {
      b.classList.remove('active', 'btn-primary');
      b.classList.add('btn-outline');
    });
    btn.classList.add('active', 'btn-primary');
    btn.classList.remove('btn-outline');
    qaFilterState = btn.getAttribute('data-filter') || 'all';
    renderQAScorecard();
  });
});

document.getElementById('btn-qa-search')?.addEventListener('click', () => {
  const input = document.getElementById('qa-search-input');
  qaSearchQuery = input ? input.value.trim() : '';
  renderQAScorecard();
});

document.getElementById('qa-search-input')?.addEventListener('keyup', (e) => {
  qaSearchQuery = e.target.value.trim();
  renderQAScorecard();
});

document.getElementById('btn-qa-clear')?.addEventListener('click', () => {
  const input = document.getElementById('qa-search-input');
  if (input) input.value = '';
  qaSearchQuery = '';
  renderQAScorecard();
});

// ==========================================
// TAB 6: AGENT LIMITS & POLICY SETUP
// ==========================================


function switchSupTab(targetId) {
  const btn = document.querySelector(`.sup-tab-btn[data-tab="${targetId}"]`);
  if (btn) btn.click();
}
window.switchSupTab = switchSupTab;

function updateSupervisorHomePolicies(p) {
  const policy = p || policyLimits;
  const teaEl = document.getElementById('sup-home-policy-tea');
  const lunchEl = document.getElementById('sup-home-policy-lunch');
  const freqEl = document.getElementById('sup-home-policy-freq');
  const adhEl = document.getElementById('sup-home-policy-adh');

  const teaLimit = policy.maxTeaBreaks || 2;
  const lunchLimit = policy.lunchVarianceThreshold || 10;
  const freqLimit = policy.maxFrequencyRequests || 5;
  const freqWindow = policy.frequencyWindow === '2_WEEKS' ? '2-Wks' : '1-Wk';
  const targetAdh = policy.targetAdherence || 90;

  if (teaEl) teaEl.textContent = `${teaLimit} breaks / shift`;
  if (lunchEl) lunchEl.textContent = `Max +${lunchLimit} mins`;
  if (freqEl) freqEl.textContent = `Max ${freqLimit} requests / ${freqWindow}`;
  if (adhEl) adhEl.textContent = `≥ ${targetAdh}.0%`;
}

document.getElementById('btn-save-policies')?.addEventListener('click', async () => {
  policyLimits.maxTeaBreaks = parseInt(document.getElementById('limit-max-tea').value, 10) || 2;
  policyLimits.lunchVarianceThreshold = parseInt(document.getElementById('limit-lunch-variance').value, 10) || 10;
  policyLimits.frequencyWindow = document.getElementById('limit-freq-window') ? document.getElementById('limit-freq-window').value : '1_WEEK';
  policyLimits.maxFrequencyRequests = parseInt(document.getElementById('limit-req-freq').value, 10) || 5;
  policyLimits.targetAdherence = parseInt(document.getElementById('limit-target-adh').value, 10) || 90;
  policyLimits.targetAcwSeconds = parseInt(document.getElementById('limit-acw-sec').value, 10) || 45;
  policyLimits.botGraceSeconds = parseInt(document.getElementById('limit-bot-grace').value, 10) || 10;
  policyLimits.supervisorId = currentSupervisor ? currentSupervisor.name : 'Supervisor Lead';

  // Persist locally
  localStorage.setItem('wfm_policy_limits', JSON.stringify(policyLimits));

  // Sync to central backend policy store
  try {
    await fetch('/api/policy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policyLimits)
    });
  } catch (err) {
    console.warn('Backend policy endpoint offline, using local broadcast:', err);
  }

  // Broadcast policy update to all agent widgets & bots in real time
  if (bc) {
    bc.postMessage({
      type: 'POLICY_UPDATE',
      payload: policyLimits
    });
  }

  // Update wallboard
  renderWallboard();

  const msg = document.getElementById('policy-save-msg');
  msg.style.color = '#047857';
  msg.textContent = '✓ Operational shift adherence policy limits deployed and synchronized across all agent widgets and bots!';
  updateSupervisorHomePolicies(policyLimits);
  setTimeout(() => { msg.textContent = ''; }, 4500);
});

// Load saved policy limits on supervisor startup
fetch('/api/policy')
  .then(r => r.json())
  .then(p => {
    if (p) {
      if (document.getElementById('limit-max-tea')) document.getElementById('limit-max-tea').value = p.maxTeaBreaks;
      if (document.getElementById('limit-lunch-variance')) document.getElementById('limit-lunch-variance').value = p.lunchVarianceThreshold;
      if (document.getElementById('limit-freq-window') && p.frequencyWindow) document.getElementById('limit-freq-window').value = p.frequencyWindow;
      if (document.getElementById('limit-req-freq')) document.getElementById('limit-req-freq').value = p.maxFrequencyRequests;
      if (document.getElementById('limit-target-adh')) document.getElementById('limit-target-adh').value = p.targetAdherence;
      updateSupervisorHomePolicies(p);
    }
  })
  .catch(() => {});

// ==========================================
// TAB 7: NICE CXONE DIAGNOSTICS
// ==========================================

document.getElementById('btn-test-cxone')?.addEventListener('click', () => {
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
  
  const threshInput = document.getElementById('input-deflection-threshold');
  if (threshInput && !threshInput.dataset.userEdited) {
    threshInput.value = ivrState.thresholdLimitPerMin || 1000;
  }
  const threshLabel = document.getElementById('threshold-current-label');
  if (threshLabel) {
    threshLabel.textContent = `Triggers on call ${((ivrState.thresholdLimitPerMin || 1000) + 1).toLocaleString()}+`;
  }

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
    billing: { id: 'SKILL-101', name: 'Customer Billing & Retention', callsWaiting: 42, avgWaitSeconds: 35, currentSla: 86.4, assignedAgents: 4, requiredAgents: 4, status: 'NORMAL' },
    customerService: { id: 'SKILL-102', name: 'General Customer Service', callsWaiting: 8, avgWaitSeconds: 14, currentSla: 97.2, assignedAgents: 5, requiredAgents: 2, status: 'IDLE_SURPLUS' },
    techSupport: { id: 'SKILL-103', name: 'Tier-2 Tech Support', callsWaiting: 15, avgWaitSeconds: 32, currentSla: 88.0, assignedAgents: 3, requiredAgents: 3, status: 'NORMAL' },
    emergency: { id: 'SKILL-104', name: 'Emergency Inbound', callsWaiting: 3, avgWaitSeconds: 9, currentSla: 98.0, assignedAgents: 2, requiredAgents: 2, status: 'NORMAL' },
    spanishSupport: { id: 'SKILL-105', name: 'Bilingual / Spanish Inbound', callsWaiting: 6, avgWaitSeconds: 19, currentSla: 94.5, assignedAgents: 2, requiredAgents: 2, status: 'NORMAL' },
    collections: { id: 'SKILL-106', name: 'Outbound & Collections', callsWaiting: 12, avgWaitSeconds: 28, currentSla: 89.2, assignedAgents: 3, requiredAgents: 3, status: 'NORMAL' }
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
  const btnToggleAutoflex = document.getElementById('btn-toggle-autoflex');

  // Wallboard Banner Elements
  const wbSurgeAlert = document.getElementById('wallboard-surge-alert');
  const wbSurgeIcon = document.getElementById('wb-surge-icon');
  const wbSurgeBadge = document.getElementById('wb-surge-status-badge');
  const wbSurgeHeadline = document.getElementById('wb-surge-headline');
  const wbSurgeSubtext = document.getElementById('wb-surge-subtext');

  if (!wfmRebalanceData || !wfmRebalanceData.queues) return;

  // Update All 6 Queue Cards Statically & Accurately
  const qMap = wfmRebalanceData.queues;
  for (const [key, q] of Object.entries(qMap)) {
    const prefix = key === 'customerService' ? 'cs' : key;
    const waitEl = document.getElementById('q-' + prefix + '-waiting') || document.getElementById('q-' + key + '-waiting');
    const asaEl = document.getElementById('q-' + prefix + '-asa') || document.getElementById('q-' + key + '-asa');
    const slaEl = document.getElementById('q-' + prefix + '-sla') || document.getElementById('q-' + key + '-sla');
    const agEl = document.getElementById('q-' + prefix + '-agents') || document.getElementById('q-' + key + '-agents');
    const reqEl = document.getElementById('q-' + prefix + '-req') || document.getElementById('q-' + key + '-req');
    const tagEl = document.getElementById('qtag-' + prefix) || document.getElementById('qtag-' + key);
    const cardEl = document.getElementById('qcard-' + prefix) || document.getElementById('qcard-' + key);

    const mins = Math.floor((q.avgWaitSeconds || 0) / 60);
    const secs = (q.avgWaitSeconds || 0) % 60;
    const asaStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

    if (waitEl) {
      waitEl.textContent = q.callsWaiting;
      waitEl.style.color = q.callsWaiting > 50 ? '#ef4444' : '#0f172a';
    }
    if (asaEl) asaEl.textContent = asaStr;
    if (slaEl) {
      slaEl.textContent = q.currentSla + '%';
      slaEl.style.color = q.currentSla >= 80 ? '#10b981' : '#ef4444';
    }
    if (agEl) agEl.textContent = q.assignedAgents + ' Logged-in';

    if (reqEl) {
      if (key === 'billing') {
        if (q.status === 'SURGE_CRITICAL') {
          reqEl.textContent = 'Required: 8 (Deficit -4)';
          reqEl.style.color = '#ef4444';
        } else if (q.status === 'REBALANCED') {
          reqEl.textContent = 'Required: 7 (Staffing Met)';
          reqEl.style.color = '#10b981';
        } else {
          reqEl.textContent = 'Required: 4';
          reqEl.style.color = '#1e3a8a';
        }
      } else if (key === 'customerService') {
        if (q.status === 'FLEXED_DONOR') {
          reqEl.textContent = '3 Flexed to Billing';
          reqEl.style.color = '#f59e0b';
        } else {
          reqEl.textContent = '3 Idle / Underutilized';
          reqEl.style.color = '#1e3a8a';
        }
      }
    }

    if (tagEl) {
      if (q.status === 'SURGE_CRITICAL') {
        tagEl.className = 'status-tag rejected';
        tagEl.textContent = 'SURGE CRITICAL';
        if (cardEl) { cardEl.style.borderColor = '#ef4444'; cardEl.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.2)'; }
      } else if (q.status === 'REBALANCED') {
        tagEl.className = 'status-tag approved';
        tagEl.textContent = 'REBALANCED (FLEX ACTIVE)';
        if (cardEl) { cardEl.style.borderColor = '#2563eb'; cardEl.style.boxShadow = '0 0 15px rgba(37, 99, 235, 0.15)'; }
      } else if (q.status === 'FLEXED_DONOR') {
        tagEl.className = 'status-tag aux';
        tagEl.textContent = 'DONOR (3 FLEXED)';
        if (cardEl) { cardEl.style.borderColor = '#f59e0b'; cardEl.style.boxShadow = 'none'; }
      } else if (q.status === 'IDLE_SURPLUS') {
        tagEl.className = 'status-tag approved';
        tagEl.textContent = 'IDLE SURPLUS';
        if (cardEl) { cardEl.style.borderColor = '#dbeafe'; cardEl.style.boxShadow = 'none'; }
      } else {
        tagEl.className = 'status-tag approved';
        tagEl.textContent = 'NORMAL (SLA OK)';
        if (cardEl) { cardEl.style.borderColor = '#dbeafe'; cardEl.style.boxShadow = 'none'; }
      }
    }
  }

  const b = wfmRebalanceData.queues.billing || {};
  const cs = wfmRebalanceData.queues.customerService || {};

  // Update Floor Telemetry Surge & Skill Flex Console
  if (wbSurgeAlert) {
    if (wfmRebalanceData.isRebalanced) {
      wbSurgeAlert.style.borderLeftColor = '#2563eb';
      if (wbSurgeIcon) wbSurgeIcon.textContent = '🔄';
      if (wbSurgeBadge) {
        wbSurgeBadge.className = 'status-tag approved';
        wbSurgeBadge.textContent = 'FLEX ACTIVE (3 REALLOCATED)';
      }
      if (wbSurgeHeadline) {
        wbSurgeHeadline.style.color = '#2563eb';
        wbSurgeHeadline.textContent = 'WFM Rebalance Active: 3 CS Agents Flexed to Billing (Calls Cleared: ' + (b.callsWaiting || 48) + ')';
      }
      if (wbSurgeSubtext) {
        wbSurgeSubtext.textContent = 'Samantha Vance, Rachel Green, and Marcus Brody reassigned to Billing queue. Customer Service SLA stable at ' + (cs.currentSla || 97.2) + '%.';
      }
    } else if (wfmRebalanceData.isSurgeActive) {
      wbSurgeAlert.style.borderLeftColor = '#ef4444';
      if (wbSurgeIcon) wbSurgeIcon.textContent = '⚠️';
      if (wbSurgeBadge) {
        wbSurgeBadge.className = 'status-tag rejected';
        wbSurgeBadge.textContent = 'CRITICAL SURGE DETECTED';
      }
      if (wbSurgeHeadline) {
        wbSurgeHeadline.style.color = '#ef4444';
        wbSurgeHeadline.textContent = 'Sudden Queue Surge: Billing Queue Overloaded (' + (b.callsWaiting || 318) + ' Calls Waiting)!';
      }
      if (wbSurgeSubtext) {
        wbSurgeSubtext.textContent = 'Customer Service agents underutilized. WFM recommends dynamic cross-skilling rebalance.';
      }
    } else {
      wbSurgeAlert.style.borderLeftColor = '#10b981';
      if (wbSurgeIcon) wbSurgeIcon.textContent = '🟢';
      if (wbSurgeBadge) {
        wbSurgeBadge.className = 'status-tag approved';
        wbSurgeBadge.textContent = 'NORMAL (SLA OK)';
      }
      if (wbSurgeHeadline) {
        wbSurgeHeadline.style.color = '#0f172a';
        wbSurgeHeadline.textContent = 'ACD Queues Balanced: Billing (' + (b.callsWaiting || 42) + ' Calls) vs Customer Service (' + (cs.callsWaiting || 8) + ' Calls)';
      }
      if (wbSurgeSubtext) {
        wbSurgeSubtext.textContent = 'Simulate unexpected queue spikes or reallocate idle Customer Service agents to Billing immediately.';
      }
    }
  }

  // Update Rebalance Tab Status Tag & Alert Banner
  if (statusTag) {
    if (wfmRebalanceData.isRebalanced) {
      statusTag.textContent = 'Flex Active (3 Reallocated)';
      statusTag.style.color = '#2563eb';
    } else if (wfmRebalanceData.isSurgeActive) {
      statusTag.textContent = 'Surge Detected!';
      statusTag.style.color = '#ef4444';
    } else {
      statusTag.textContent = 'Normal';
      statusTag.style.color = '#10b981';
    }
  }

  if (alertBanner) {
    if (wfmRebalanceData.isRebalanced) {
      alertBanner.className = 'rebalance-banner-box rebalanced';
      if (bannerIcon) bannerIcon.textContent = '🔄';
      if (bannerTitle) {
        bannerTitle.style.color = '#2563eb';
        bannerTitle.textContent = 'Intraday WFM Skill Flex Active: 3 Agents Reallocated to Billing';
      }
      if (bannerDesc) {
        bannerDesc.textContent = 'Billing Queue calls cleared down from 318 -> ' + (b.callsWaiting || 48) + '. ASA recovered to ' + (b.avgWaitSeconds || 42) + 's. Customer Service queue remains healthy (' + (cs.currentSla || 97.2) + '% SLA).';
      }
    } else if (wfmRebalanceData.isSurgeActive) {
      alertBanner.className = 'rebalance-banner-box surge';
      if (bannerIcon) bannerIcon.textContent = '⚠️';
      if (bannerTitle) {
        bannerTitle.style.color = '#ef4444';
        bannerTitle.textContent = 'Critical Queue Imbalance: Billing Overloaded (' + (b.callsWaiting || 318) + ' Waiting) vs Customer Service Idle';
      }
      if (bannerDesc) {
        bannerDesc.textContent = 'Billing SLA plunged to ' + (b.currentSla || 34.5) + '%. Customer Service agents underutilized. WFM recommends dynamic cross-skilling.';
      }
    } else {
      alertBanner.className = 'rebalance-banner-box normal';
      if (bannerIcon) bannerIcon.textContent = '🟢';
      if (bannerTitle) {
        bannerTitle.style.color = '#10b981';
        bannerTitle.textContent = 'ACD Queue Volumes Balanced across All Skills';
      }
      if (bannerDesc) {
        bannerDesc.textContent = 'Customer Billing, Customer Service, Tech Support, Emergency, Spanish, and Collections queues operating normally.';
      }
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
    countBadge.textContent = ((wfmRebalanceData.reallocatedAgents || []).length) + ' Agents Flexed';
  }

  if (rosterBody) {
    if (!wfmRebalanceData.reallocatedAgents || wfmRebalanceData.reallocatedAgents.length === 0) {
      rosterBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#1e3a8a; padding:20px;">No agents currently flexed. All personnel operating on base WFM shift schedules.</td></tr>';
    } else {
      rosterBody.innerHTML = wfmRebalanceData.reallocatedAgents.map(ag => {
        return '<tr>' +
          '<td><strong style="color:#0f172a;">' + ag.name + '</strong><div style="font-family:monospace; color:#1e3a8a; font-size:11px;">' + ag.id + '</div></td>' +
          '<td><span class="status-tag approved">' + ag.baseSkill + '</span></td>' +
          '<td><strong style="color:#2563eb;">' + (ag.flexSchedule || '10:00 - 11:30 (Intraday Skill Flex)') + '</strong></td>' +
          '<td><span class="status-tag aux">' + ag.flexSkill + '</span></td>' +
          '<td><small style="color:#0f172a; font-family:monospace;">' + ag.priorityRouting + '</small></td>' +
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

window.executeClientRebalance = executeClientRebalance;
function executeClientRebalance() {
  wfmRebalanceData.isRebalanced = true;
  wfmRebalanceData.isSurgeActive = false;
  wfmRebalanceData.reallocatedAgents = [
    {
      id: 'AGT-9102',
      name: 'Samantha Vance',
      baseSkill: 'General Customer Service',
      flexSkill: 'Customer Billing & Retention (Flex Support)',
      flexSchedule: '10:00 - 11:30 (Intraday Skill Flex)',
      priorityRouting: 'P1: Billing (Surge) / P2: Cust Service',
      status: 'ACTIVE_FLEX'
    },
    {
      id: 'AGT-6512',
      name: 'Rachel Green',
      baseSkill: 'General Customer Service',
      flexSkill: 'Customer Billing & Retention (Flex Support)',
      flexSchedule: '10:00 - 11:30 (Intraday Skill Flex)',
      priorityRouting: 'P1: Billing (Surge) / P2: Cust Service',
      status: 'ACTIVE_FLEX'
    },
    {
      id: 'AGT-8819',
      name: 'Marcus Brody',
      baseSkill: 'General Customer Service',
      flexSkill: 'Customer Billing & Retention (Flex Support)',
      flexSchedule: '10:00 - 11:30 (Intraday Skill Flex)',
      priorityRouting: 'P1: Billing (Surge) / P2: Cust Service',
      status: 'ACTIVE_FLEX'
    }
  ];

  if (wfmRebalanceData.queues.billing) {
    wfmRebalanceData.queues.billing.assignedAgents = 7;
    wfmRebalanceData.queues.billing.callsWaiting = 48;
    wfmRebalanceData.queues.billing.avgWaitSeconds = 42;
    wfmRebalanceData.queues.billing.currentSla = 88.5;
    wfmRebalanceData.queues.billing.status = 'REBALANCED';
  }
  if (wfmRebalanceData.queues.customerService) {
    wfmRebalanceData.queues.customerService.assignedAgents = 2;
    wfmRebalanceData.queues.customerService.status = 'FLEXED_DONOR';
  }

  // Update wallboard agents
  activeAgents.forEach(a => {
    if (['AGT-9102', 'AGT-6512', 'AGT-8819'].includes(a.id)) {
      a.queue = 'Customer Billing & Retention (Flex)';
    }
  });

  wfmRebalanceData.historyLog.unshift({
    timestamp: new Date().toISOString(),
    event: 'REBALANCE_DISPATCHED',
    details: 'WFM Dynamic Cross-Skill Rebalance executed: 3 Customer Service agents flexed to Billing. Staffing: Billing 4 -> 7 agents, CS 5 -> 2 agents. Billing calls waiting reduced to 48.'
  });

  renderQueueBalanceUI();
  renderWallboard();
  postQueueBalance('TRIGGER_REBALANCE');
}

window.executeRestoreBase = executeRestoreBase;
function executeRestoreBase() {
  wfmRebalanceData.isSurgeActive = false;
  wfmRebalanceData.isRebalanced = false;
  wfmRebalanceData.reallocatedAgents = [];

  if (wfmRebalanceData.queues.billing) {
    wfmRebalanceData.queues.billing.callsWaiting = 42;
    wfmRebalanceData.queues.billing.avgWaitSeconds = 35;
    wfmRebalanceData.queues.billing.currentSla = 86.4;
    wfmRebalanceData.queues.billing.assignedAgents = 4;
    wfmRebalanceData.queues.billing.status = 'NORMAL';
  }
  if (wfmRebalanceData.queues.customerService) {
    wfmRebalanceData.queues.customerService.callsWaiting = 8;
    wfmRebalanceData.queues.customerService.avgWaitSeconds = 14;
    wfmRebalanceData.queues.customerService.currentSla = 97.2;
    wfmRebalanceData.queues.customerService.assignedAgents = 5;
    wfmRebalanceData.queues.customerService.status = 'IDLE_SURPLUS';
  }

  activeAgents.forEach(a => {
    if (['AGT-9102', 'AGT-6512', 'AGT-8819'].includes(a.id)) {
      a.queue = 'General Customer Service';
    }
  });

  wfmRebalanceData.historyLog.unshift({
    timestamp: new Date().toISOString(),
    event: 'RESTORED_BASE',
    details: 'Volume normalized. Rebalanced agents successfully returned to base General Customer Service WFM schedule.'
  });

  renderQueueBalanceUI();
  renderWallboard();
  postQueueBalance('RESTORE_BASE');
}

window.executeSurgeBilling = executeSurgeBilling;
function executeSurgeBilling() {
  wfmRebalanceData.isSurgeActive = true;
  wfmRebalanceData.isRebalanced = false;
  wfmRebalanceData.reallocatedAgents = [];
  if (wfmRebalanceData.queues.billing) {
    wfmRebalanceData.queues.billing.callsWaiting = 318;
    wfmRebalanceData.queues.billing.avgWaitSeconds = 540;
    wfmRebalanceData.queues.billing.currentSla = 34.5;
    wfmRebalanceData.queues.billing.requiredAgents = 8;
    wfmRebalanceData.queues.billing.assignedAgents = 4;
    wfmRebalanceData.queues.billing.status = 'SURGE_CRITICAL';
  }
  if (wfmRebalanceData.queues.customerService) {
    wfmRebalanceData.queues.customerService.callsWaiting = 6;
    wfmRebalanceData.queues.customerService.avgWaitSeconds = 11;
    wfmRebalanceData.queues.customerService.assignedAgents = 5;
    wfmRebalanceData.queues.customerService.status = 'IDLE_SURPLUS';
  }

  activeAgents.forEach(a => {
    if (['AGT-9102', 'AGT-6512', 'AGT-8819'].includes(a.id)) {
      a.queue = 'General Customer Service';
    }
  });

  wfmRebalanceData.historyLog.unshift({
    timestamp: new Date().toISOString(),
    event: 'SURGE_DETECTED',
    details: 'Sudden Billing Call Volume Surge (+318 calls waiting, ASA 9m). Queue load imbalance ratio: 53:1.'
  });
  renderQueueBalanceUI();
  renderWallboard();
  postQueueBalance('SURGE_BILLING');
}


// Floor Telemetry Sudden Surge Controls Wire-up
document.getElementById('btn-wb-sim-surge')?.addEventListener('click', () => {
  executeSurgeBilling();
});

document.getElementById('btn-wb-restore-base')?.addEventListener('click', () => {
  executeRestoreBase();
});

document.getElementById('btn-sim-billing-surge')?.addEventListener('click', executeSurgeBilling);
document.getElementById('btn-trigger-wfm-rebalance')?.addEventListener('click', executeClientRebalance);
document.getElementById('btn-quick-rebalance-wallboard')?.addEventListener('click', executeClientRebalance);
document.getElementById('btn-restore-base-schedules')?.addEventListener('click', executeRestoreBase);

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
    renderWallboard();
    fetchQueue();
    renderQAScorecard();
    const selRep = document.getElementById('report-type-select');
    if (selRep) loadReport(selRep.value);
  });
}

// Supervisor Bot Drawer Toggle
const supBotDrawer = document.getElementById('sup-bot-drawer');
const btnToggleSupBot = document.getElementById('btn-toggle-sup-bot');
const btnOpenSupBotHeader = document.getElementById('btn-open-sup-bot-header');
const btnCloseSupBot = document.getElementById('btn-close-sup-bot');

function openSupBot() {
  const drawer = document.getElementById('sup-bot-drawer');
  if (drawer) drawer.classList.remove('hidden');
}

function closeSupBot() {
  const drawer = document.getElementById('sup-bot-drawer');
  if (drawer) drawer.classList.add('hidden');
}

function toggleSupBot() {
  const drawer = document.getElementById('sup-bot-drawer');
  if (drawer) {
    if (drawer.classList.contains('hidden')) openSupBot();
    else closeSupBot();
  }
}

window.openSupBot = openSupBot;
window.closeSupBot = closeSupBot;
window.toggleSupBot = toggleSupBot;

const btnToggleSupBotEl = document.getElementById('btn-toggle-sup-bot');
if (btnToggleSupBotEl) btnToggleSupBotEl.addEventListener('click', toggleSupBot);

const btnOpenSupBotHeaderEl = document.getElementById('btn-open-sup-bot-header');
if (btnOpenSupBotHeaderEl) btnOpenSupBotHeaderEl.addEventListener('click', openSupBot);

const btnCloseSupBotEl = document.getElementById('btn-close-sup-bot');
if (btnCloseSupBotEl) btnCloseSupBotEl.addEventListener('click', closeSupBot);

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
  addSupBotMessage('bot', '👋 Welcome ' + currentSupervisor.name + '! I am Ask Shankar, your Autonomous Supervisor Assistant. I can run floor audits, detect queue surges, trigger cross-skilling rebalances, and recall overdue agents. How can I assist you?');
}

// Quick Chip Handlers
document.querySelectorAll('.sup-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const cmd = chip.getAttribute('data-cmd');
    executeSupBotCommand(cmd);
  });
});

function executeSupBotCommand(cmd) {
  if (cmd === 'agent_jordan') {
    addSupBotMessage('user', 'Show single agent dossier for Jordan Miller (AGT-4092)');
    setTimeout(() => {
      fetch('/api/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Jordan Miller', role: 'supervisor' })
      }).then(r => r.json()).then(data => addSupBotMessage('bot', '', data.answer));
    }, 300);
    return;
  }
  else if (cmd === 'agent_samantha') {
    addSupBotMessage('user', 'Show single agent dossier for Samantha Vance (AGT-9102)');
    setTimeout(() => {
      fetch('/api/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Samantha Vance', role: 'supervisor' })
      }).then(r => r.json()).then(data => addSupBotMessage('bot', '', data.answer));
    }, 300);
    return;
  }
  else if (cmd === 'tone_csat_report') {
    addSupBotMessage('user', 'Generate Speech Tone vs Customer CSAT Correlation Report');
    setTimeout(() => {
      fetch('/api/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'tone vs csat correlation report', role: 'supervisor' })
      }).then(r => r.json()).then(data => addSupBotMessage('bot', '', data.answer));
    }, 300);
    return;
  }
  else if (cmd === 'burnout_report') {
    addSupBotMessage('user', 'Run Agent Burnout & Fatigue Risk Analysis');
    setTimeout(() => {
      fetch('/api/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'burnout and fatigue risk analysis', role: 'supervisor' })
      }).then(r => r.json()).then(data => addSupBotMessage('bot', '', data.answer));
    }, 300);
    return;
  }
  else if (cmd === 'erlang_report') {
    addSupBotMessage('user', 'Forecast Intraday Erlang-C Staffing Deficit');
    setTimeout(() => {
      fetch('/api/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'intraday erlang staffing deficit projection', role: 'supervisor' })
      }).then(r => r.json()).then(data => addSupBotMessage('bot', '', data.answer));
    }, 300);
    return;
  }
  else if (cmd === 'adherence_outliers') {
    addSupBotMessage('user', 'Audit Chronic Schedule Adherence Outliers');
    setTimeout(() => {
      fetch('/api/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'chronic adherence outliers report', role: 'supervisor' })
      }).then(r => r.json()).then(data => addSupBotMessage('bot', '', data.answer));
    }, 300);
    return;
  }
  else if (cmd === 'multiskill_matrix') {
    addSupBotMessage('user', 'Show Cross-Queue Multi-Skill Flex Readiness Matrix');
    setTimeout(() => {
      fetch('/api/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'multi-skill flex readiness matrix', role: 'supervisor' })
      }).then(r => r.json()).then(data => addSupBotMessage('bot', '', data.answer));
    }, 300);
    return;
  }
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
      html += '<span style="color:#b91c1c; font-weight:700;">⚠️ Surge Detected! WFM recommends cross-skilling 3 CS agents to Billing.</span><br/>' +
        '<button class="btn btn-xs btn-primary" onclick="postQueueBalance(\'TRIGGER_REBALANCE\'); addSupBotMessage(\'bot\', \'Executed WFM Rebalance: 3 CS agents flexed to Billing!\');" style="margin-top:6px;">🔄 Execute Rebalance Now</button>';
    } else if (wfmRebalanceData.isRebalanced) {
      html += '<span style="color:#0284c7; font-weight:700;">✓ Dynamic Flex Active: 3 CS Agents flexed to Billing.</span>';
    } else {
      html += '<span style="color:#047857; font-weight:700;">✓ Queues Balanced: Normal operating levels.</span>';
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
  
  // First try direct commands
  if (q.includes('rebalance') || q.includes('surge') || q.includes('billing')) {
    executeSupBotCommand('check_rebalance');
    return;
  } else if (q.includes('flag') || q.includes('training') || q.includes('coaching') || q.includes('rude') || q.includes('qa')) {
    executeSupBotCommand('flagged_qa');
    return;
  } else if (q.includes('recall') || q.includes('overdue') || q.includes('bot call')) {
    executeSupBotCommand('bot_recall');
    return;
  } else if (q.includes('broadcast') || q.includes('alert') || q.includes('tornado')) {
    executeSupBotCommand('outage_alert');
    return;
  }

  // Query real-time copilot intelligence API
  fetch('/api/copilot/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: text,
      agentId: 'AGT-8842',
      role: 'supervisor'
    })
  })
  .then(r => r.json())
  .then(data => {
    addSupBotMessage('bot', '', data.answer);
  })
  .catch(() => {
    // Local fallback
    if (q.includes('who') || q.includes('aux') || q.includes('tea') || q.includes('lunch') || q.includes('status') || q.includes('adherence')) {
      executeSupBotCommand('floor_summary');
    } else {
      addSupBotMessage('bot', 'Understood, ' + currentSupervisor.name + '. Live telemetry confirms 12 active agents, Billing queue SLA at 86.4%, and IVR deflection on standby. Ask me about queue surges, QA scorecards, or floor adherence.');
    }
  });
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

// ==========================================
// IT SYSTEM ISSUE INCIDENTS LOGIC
// ==========================================

async function fetchItIncidents() {
  try {
    const res = await fetch('/api/it/incidents');
    if (res.ok) {
      const tickets = await res.json();
      renderItIncidents(tickets);
    }
  } catch (e) {
    console.warn('Could not fetch IT incidents:', e);
  }
}

function renderItIncidents(tickets) {
  const tbody = document.getElementById('it-incidents-body');
  if (!tbody) return;

  if (!tickets || tickets.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#1e3a8a; padding:16px;">No active IT system incidents reported. All systems operational.</td></tr>';
    return;
  }

  tbody.innerHTML = tickets.map(t => {
    const timeStr = new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let tagClass = 'aux';
    if (t.status === 'NEW') tagClass = 'rejected';
    if (t.status === 'RESOLVED') tagClass = 'approved';

    return '<tr>' +
      '<td style="font-family:monospace; color:#2563eb; font-weight:700;">' + t.id + '</td>' +
      '<td style="font-family:monospace; color:#1e3a8a;">' + timeStr + '</td>' +
      '<td><strong style="color:#0f172a;">' + t.agentName + '</strong><div style="font-family:monospace; font-size:11px; color:#1e3a8a;">' + t.agentId + ' (' + t.queue + ')</div></td>' +
      '<td><span class="status-tag ' + tagClass + '">' + t.category + '</span></td>' +
      '<td style="color:#0f172a; max-width:320px; line-height:1.4;">' + t.description + '</td>' +
      '<td><small style="color:#6d28d9; font-weight:700;">' + t.assignedTo + '</small></td>' +
      '<td><span class="status-tag ' + tagClass + '">' + t.status + '</span></td>' +
    '</tr>';
  }).join('');
}

document.getElementById('btn-refresh-it-tickets')?.addEventListener('click', fetchItIncidents);

// Fetch IT tickets on init and periodic
fetchItIncidents();
setInterval(fetchItIncidents, 6000);

document.getElementById('btn-save-deflection-threshold')?.addEventListener('click', () => {
  const input = document.getElementById('input-deflection-threshold');
  if (input) {
    const val = parseInt(input.value, 10);
    if (!isNaN(val) && val > 0) {
      ivrState.thresholdLimitPerMin = val;
      updateIvrDeflection({ thresholdLimitPerMin: val });
      const currentLbl = document.getElementById('threshold-current-label');
      if (currentLbl) currentLbl.textContent = `Triggers on call ${(val + 1).toLocaleString()}+`;
      alert(`Deflection threshold successfully updated to ${val.toLocaleString()} calls/min.`);
    }
  }
});

updateSupervisorHomePolicies();


// ========================================================
// EMERGENCY SURGE STAFFING & MOBILE RECALL ENGINE
// ========================================================

let currentEmergencyCampaign = null;

function updateUnavailablePill() {
  const unavail = activeAgents.filter(ag => ag.state !== 'AVAILABLE').length;
  const p1 = document.getElementById('unavailable-count-pill');
  if (p1) p1.textContent = unavail;
  const p2 = document.getElementById('header-unavailable-pill');
  if (p2) p2.textContent = unavail;
}

window.triggerEmergencyBroadcast = async function(targetType = 'unavailable') {
  quotaAlertDismissed = false;
  updateUnavailablePill();
  let targetAgents = [];
  if (targetType === 'all') {
    targetAgents = activeAgents;
  } else {
    targetAgents = activeAgents.filter(ag => ag.state !== 'AVAILABLE');
    if (targetAgents.length === 0) {
      targetAgents = activeAgents; // Fallback to all if none in AUX
    }
  }

  const targetIds = targetAgents.map(a => a.id);
  const quotaInput = document.getElementById('input-emergency-quota');
  const reqQuota = quotaInput ? (parseInt(quotaInput.value, 10) || 5) : 5;
  const defaultMsg = 'There is an emergency situation. High call volume surge detected and your availability is requested to balance the queue. If you are available please join, or decline.';
  const shiftWindow = '15:30 - 18:30 (Surge Shift • 3 hrs)';

  const btn = document.getElementById('btn-notify-all-emergency');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Dispatching Mobile Alerts...';
  }

  try {
    const res = await fetch('/api/emergency/notify-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supervisorId: currentSupervisor.id,
        supervisorName: currentSupervisor.name,
        emergencyType: 'STORM_SURGE',
        message: defaultMsg,
        shiftTimings: shiftWindow,
        queueTarget: 'Emergency Inbound & Tier-2 Support',
        requiredCount: reqQuota,
        targetAgentIds: targetIds
      })
    });

    const data = await res.json();
    if (data.success && data.recall) {
      currentEmergencyCampaign = data.recall;
      renderEmergencyCampaign(currentEmergencyCampaign);

      // Play vocal announcement confirmation
      if ('speechSynthesis' in window) {
        const text = `Emergency mobile alert sent to ${targetIds.length} unavailable agents. Standing by for mobile responses.`;
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = 1.0;
        window.speechSynthesis.speak(utt);
      }

      // Switch to Alerts tab so supervisor sees the live responses
      const tabBtn = document.querySelector('.sup-tab-btn[data-tab="stab-alerts"]');
      if (tabBtn) tabBtn.click();

      // Scroll to emergency recall card
      setTimeout(() => {
        const hub = document.getElementById('card-emergency-recall-hub');
        if (hub) {
          hub.scrollIntoView({ behavior: 'smooth', block: 'start' });
          hub.style.transition = 'box-shadow 0.5s ease';
          hub.style.boxShadow = '0 0 35px rgba(239, 68, 68, 0.45)';
          setTimeout(() => {
            hub.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.12)';
          }, 3000);
        }
      }, 250);
    }
  } catch (err) {
    console.error('Emergency dispatch error:', err);
    alert('Failed to dispatch emergency alerts: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      const count = activeAgents.filter(ag => ag.state !== 'AVAILABLE').length;
      btn.innerHTML = `<span>📢</span> Notify All Unavailable (<span id="unavailable-count-pill">${count}</span> Agents)`;
    }
  }
};

window.resetEmergencyCampaign = async function() {
  if (!confirm('Are you sure you want to reset and clear the active emergency recall campaign?')) return;
  try {
    const res = await fetch('/api/emergency/reset', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      currentEmergencyCampaign = null;
      renderEmptyEmergencyTable();
    }
  } catch (err) {
    console.error(err);
  }
};

window.rePingAgentMobile = async function(agentId, agentName) {
  try {
    await fetch('/api/alerts/trigger-alarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: agentId,
        agentName: agentName,
        device: 'mobile',
        triggeredBy: 'SUPERVISOR_WALLBOARD',
        force: true,
        message: 'URGENT: Emergency Floor Call Volume Surge. Please check your mobile alert companion and confirm shift availability.'
      })
    });
    alert(`Mobile ping re-sent to ${agentName} (${agentId})!`);
  } catch (err) {
    alert('Failed to ping agent: ' + err.message);
  }
};

function renderEmptyEmergencyTable() {
  const statTotal = document.getElementById('em-stat-total');
  const statAcc = document.getElementById('em-stat-accepted');
  const statDec = document.getElementById('em-stat-declined');
  const statPend = document.getElementById('em-stat-pending');
  const tbody = document.getElementById('emergency-response-table-body');
  const bar = document.getElementById('em-campaign-active-bar');

  if (statTotal) statTotal.textContent = '0';
  if (statAcc) statAcc.textContent = '0';
  if (statDec) statDec.textContent = '0';
  if (statPend) statPend.textContent = '0';
  if (bar) bar.style.display = 'none';

  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:24px; color:#1e3a8a;">
      No active emergency mobile recall campaign running. Click <strong>"Notify All Unavailable"</strong> to alert agents on mobile.
    </td></tr>`;
  }
}

function renderEmergencyCampaign(campaign) {
  if (!campaign || !campaign.active || !campaign.agents) {
    renderEmptyEmergencyTable();
    return;
  }

  const statTotal = document.getElementById('em-stat-total');
  const statAcc = document.getElementById('em-stat-accepted');
  const statDec = document.getElementById('em-stat-declined');
  const statPend = document.getElementById('em-stat-pending');
  const tbody = document.getElementById('emergency-response-table-body');
  const bar = document.getElementById('em-campaign-active-bar');
  const msgEl = document.getElementById('em-campaign-msg-text');
  const shiftEl = document.getElementById('em-campaign-shift-label');

  if (bar) bar.style.display = 'flex';
  if (msgEl) msgEl.textContent = `"${campaign.message}"`;
  if (shiftEl) shiftEl.textContent = campaign.shiftTimings || '15:30 - 18:30 (Surge Shift • 3 hrs)';

  const agentsList = Object.values(campaign.agents);
  const total = agentsList.length;
  const accepted = agentsList.filter(a => a.status === 'ACCEPTED').length;
  const declined = agentsList.filter(a => a.status === 'DECLINED').length;
  const pending = agentsList.filter(a => a.status === 'PENDING').length;

  if (statTotal) statTotal.textContent = total;
  if (statAcc) statAcc.textContent = accepted;
  if (statDec) statDec.textContent = declined;
  if (statPend) statPend.textContent = pending;

  // Update Staffing Quota Progress
  const reqQuota = campaign.requiredCount || parseInt(document.getElementById('input-emergency-quota')?.value, 10) || 5;
  const qLabel = document.getElementById('em-quota-label');
  const qPill = document.getElementById('em-quota-pill');
  const qFill = document.getElementById('em-quota-fill');

  const percent = Math.min(100, Math.round((accepted / reqQuota) * 100));
  if (qLabel) qLabel.textContent = `${accepted} / ${reqQuota} Agents Confirmed (Wanting ${reqQuota} Extra Agents)`;
  if (qFill) qFill.style.width = `${percent}%`;

  if (accepted >= reqQuota) {
    if (qPill) {
      qPill.textContent = `✓ SUFFICIENT STAFFING SECURED (${accepted}/${reqQuota})`;
      qPill.style.background = 'rgba(16,185,129,0.2)'; qPill.style.border = '1px solid rgba(16,185,129,0.4)';
      qPill.style.color = '#047857'; qPill.style.background = '#ecfdf5'; qPill.style.border = '1px solid #a7f3d0';
    }
    if (qFill) qFill.style.background = '#10b981';
  } else {
    if (qPill) {
      qPill.textContent = `● AWAITING AVAILABILITY (${accepted}/${reqQuota})`;
      qPill.style.background = 'rgba(245,158,11,0.2)'; qPill.style.border = '1px solid rgba(245,158,11,0.4)';
      qPill.style.color = '#b45309'; qPill.style.background = '#fffbeb'; qPill.style.border = '1px solid #fde68a';
    }
    if (qFill) qFill.style.background = 'linear-gradient(90deg, #3b82f6, #10b981)';
  }

  if (!tbody) return;

  tbody.innerHTML = agentsList.map(ag => {
    let responseBadge = '';
    let shiftDisplay = '';
    let rowBg = '';

    if (ag.status === 'ACCEPTED') {
      responseBadge = '<span class="status-tag approved" style="background:rgba(16,185,129,0.18); color:#047857; border:1px solid rgba(16,185,129,0.35); font-weight:800; font-size:11px; padding:4px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> YES (Will Join)</span>';
      shiftDisplay = `<strong style="color:#0284c7; font-size:12px; font-family:monospace;">${ag.shiftTimings}</strong>`;
      rowBg = 'background: rgba(16, 185, 129, 0.04);';
    } else if (ag.status === 'DECLINED') {
      responseBadge = '<span class="status-tag overdue" style="background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; font-weight:800; font-size:11px; padding:4px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> NO (Declined)</span>';
      shiftDisplay = '<span style="color:#1e3a8a; font-size:11px;">-</span>';
      rowBg = 'background: rgba(239, 68, 68, 0.03);';
    } else if (ag.status === 'QUOTA_CLOSED' || accepted >= reqQuota || campaign.quotaFulfilled) {
      responseBadge = '<span class="status-tag" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-weight:700; font-size:11px; padding:4px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Closed (Quota Met)</span>';
      shiftDisplay = `<span style="color:#047857; font-size:11px; font-weight:700;">Survey Closed</span>`;
      rowBg = 'background: rgba(37, 99, 235, 0.02);';
    } else {
      responseBadge = '<span class="status-tag" style="background:#fffbeb; color:#b45309; border:1px solid #fde68a; font-weight:700; font-size:11px; padding:4px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Awaiting Mobile Tap...</span>';
      shiftDisplay = `<span style="color:#1e3a8a; font-size:11px;">${ag.shiftTimings} (Pending)</span>`;
    }

    const timeFormatted = ag.responseTime ? new Date(ag.responseTime).toLocaleTimeString() : '<span style="color:#1e3a8a;">-</span>';

    return `
      <tr style="${rowBg}">
        <td style="font-family:monospace; color:#1e3a8a; font-weight:700;">${ag.agentId}</td>
        <td><strong style="color:#0f172a;">${ag.agentName}</strong></td>
        <td style="color:#0f172a; font-size:12px;">${ag.queue || 'General Support'}</td>
        <td><span class="status-tag aux" style="font-size:10px;">${ag.currentState || 'AUX Break'}</span></td>
        <td>
          <span style="display:inline-flex; align-items:center; gap:5px; font-size:11px; color:#0284c7; font-weight:700; background:#f0f9ff; padding:3px 8px; border-radius:6px; border:1px solid #bae6fd;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg> Mobile Alert Delivered
          </span>
        </td>
        <td>${responseBadge}</td>
        <td style="font-family:monospace; font-size:11px; color:#0f172a;">${timeFormatted}</td>
        <td>${shiftDisplay}</td>
        <td>
          ${(ag.status === 'PENDING' && !(accepted >= reqQuota || campaign.quotaFulfilled)) ? `
            <button class="btn btn-xs btn-outline" style="border-color:#38bdf8; color:#0284c7; font-weight:700; padding:4px 8px;" onclick="rePingAgentMobile('${ag.agentId}', '${ag.agentName}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg> Re-Ping
            </button>
          ` : (ag.status === 'ACCEPTED' ? `
            <span style="font-size:11px; color:#15803d; font-weight:700;">✓ Confirmed</span>
          ` : (ag.status === 'QUOTA_CLOSED' || accepted >= reqQuota || campaign.quotaFulfilled) ? `
            <span style="font-size:11px; color:#1d4ed8; font-weight:700;">Closed</span>
          ` : `
            <span style="font-size:11px; color:#1e3a8a;">Unavailable</span>
          `)}
        </td>
      </tr>
    `;
  }).join('');
}

async function fetchEmergencyCampaign() {
  try {
    const res = await fetch('/api/emergency/status');
    if (res.ok) {
      const data = await res.json();
      if (data.active && data.recall) {
        currentEmergencyCampaign = data.recall;
        renderEmergencyCampaign(currentEmergencyCampaign);
      } else {
        renderEmptyEmergencyTable();
      }
    }
  } catch (e) {
    console.warn('Emergency status fetch error:', e);
  }
}

// Supervisor Real-Time SSE Listener
function initSupervisorEmergencySSE() {
  try {
    const es = new EventSource('/api/alerts/stream');
    es.addEventListener('EMERGENCY_RECALL_DISPATCH', (e) => {
      try {
        const campaign = JSON.parse(e.data);
        currentEmergencyCampaign = campaign;
        renderEmergencyCampaign(campaign);
      } catch (err) {}
    });

    es.addEventListener('EMERGENCY_RESPONSE_UPDATE', (e) => {
      try {
        const update = JSON.parse(e.data);
        fetchEmergencyCampaign();
        if (update.response === 'YES' && 'speechSynthesis' in window) {
          const utt = new SpeechSynthesisUtterance(`Agent ${update.agentName} has accepted the surge shift.`);
          utt.rate = 1.0;
          window.speechSynthesis.speak(utt);
        }
      } catch (err) {}
    });

    es.addEventListener('EMERGENCY_QUOTA_FULFILLED', (e) => {
      try {
        const data = JSON.parse(e.data);
        showQuotaFulfilledAlert(data);
      } catch (err) {}
    });

    es.addEventListener('EMERGENCY_RECALL_RESET', () => {
      currentEmergencyCampaign = null;
      renderEmptyEmergencyTable();
    });
  } catch (e) {
    console.warn('Supervisor SSE not supported, relying on polling.');
  }
}

// Initial fetch & polling
fetchEmergencyCampaign();
initSupervisorEmergencySSE();
setInterval(fetchEmergencyCampaign, 3000);
updateUnavailablePill();


let quotaAlertDismissed = false;

window.closeQuotaModal = function() {
  quotaAlertDismissed = true;
  const m = document.getElementById('modal-quota-achieved');
  if (m) {
    m.classList.add('hidden');
    m.style.removeProperty('display');
    m.style.setProperty('display', 'none', 'important');
  }
  const bd = document.getElementById('quota-modal-backdrop');
  if (bd) {
    bd.style.setProperty('display', 'none', 'important');
  }
};

window.showQuotaFulfilledAlert = function(data) {
  if (quotaAlertDismissed) {
    return;
  }
  const modal = document.getElementById('modal-quota-achieved');
  const numEl = document.getElementById('modal-quota-number');
  const shiftEl = document.getElementById('modal-quota-shift');
  const listEl = document.getElementById('modal-quota-agents-list');

  const count = data.acceptedCount || 5;
  const target = data.requiredCount || 5;

  if (numEl) numEl.textContent = `${count} / ${target}`;
  if (shiftEl) shiftEl.textContent = data.shiftTimings || '15:30 - 18:30';

  if (listEl && data.acceptedAgents) {
    listEl.innerHTML = data.acceptedAgents.map(a => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #dbeafe; border-radius:10px; padding:9px 12px; font-size:12px;">
        <div style="display:flex; align-items:center; gap:9px;">
          <span style="width:26px; height:26px; border-radius:50%; background:#ecfdf5; border:1px solid #a7f3d0; color:#047857; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; flex-shrink:0;">✓</span>
          <div>
            <strong style="color:#0f172a; font-size:12px; display:block;">${a.agentName}</strong>
            <span style="color:#1e3a8a; font-size:11px; font-family:ui-monospace,monospace;">${a.agentId} · ${a.queue || 'Support'}</span>
          </div>
        </div>
        <span style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-weight:800; font-size:10px; padding:3px 8px; border-radius:6px; text-transform:uppercase; flex-shrink:0;">Confirmed</span>
      </div>
    `).join('');
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.style.removeProperty('display');
    modal.style.setProperty('display', 'flex', 'important');
  }
  const bd = document.getElementById('quota-modal-backdrop');
  if (bd) {
    bd.style.removeProperty('display');
    bd.style.setProperty('display', 'block', 'important');
  }

  // Trigger vocal announcement
  if ('speechSynthesis' in window) {
    try {
      const text = `System alert: We have obtained a sufficient number of agents for the outage. Staffing quota achieved.`;
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 1.0;
      window.speechSynthesis.speak(utt);
    } catch (e) {}
  }

  showSupervisorToast(`🎉 SYSTEM ALERT: We have obtained a sufficient number of agents (${count}/${target}) for the outage! Staffing quota achieved.`, true);

  // Update card UI
  const qBadge = document.getElementById('em-quota-pill');
  if (qBadge) {
    qBadge.textContent = `✓ SUFFICIENT STAFFING SECURED (${count}/${target})`;
    qBadge.style.background = '#dcfce7';
    qBadge.style.color = '#15803d';
  }
  const qFill = document.getElementById('em-quota-fill');
  if (qFill) {
    qFill.style.width = '100%';
    qFill.style.background = '#10b981';
  }
};

// Wire up direct event listeners for modal buttons
function attachQuotaModalListeners() {
  const btnClose = document.getElementById('btn-close-quota-modal');
  const btnAck = document.getElementById('btn-ack-quota-modal');
  const backdrop = document.getElementById('quota-modal-backdrop');

  if (btnClose) {
    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      window.closeQuotaModal();
    });
  }
  if (btnAck) {
    btnAck.addEventListener('click', (e) => {
      e.stopPropagation();
      window.closeQuotaModal();
    });
  }
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      e.stopPropagation();
      window.closeQuotaModal();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachQuotaModalListeners);
} else {
  attachQuotaModalListeners();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeQuotaModal();
  }
});

window.simulateFiveAccepted = async function() {
  quotaAlertDismissed = false;
  try {
    const res = await fetch('/api/emergency/simulate-quota', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      fetchEmergencyCampaign();
    }
  } catch (err) {
    console.error(err);
  }
};
