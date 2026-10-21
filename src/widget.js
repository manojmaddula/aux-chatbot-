// widget.js - Desktop Chatbot Widget Logic for NICE CXone & WFM

const AGENT_PROFILES = {
  'AGT-8842': {
    id: 'AGT-8842',
    name: 'Alex Morgan',
    queue: 'Tier-2 Tech Support',
    adherence: '96.4%',
    teaBreaks: '1 / 2',
    teaClass: 'text-ok',
    lunchOverage: '0 mins',
    lunchClass: 'text-ok',
    freqCount: '1 / 3',
    freqClass: 'text-ok',
    avatar: '🧑‍💻',
    verifStatus: '✓ Verified',
    verifClass: 'text-ok',
    detailsStatus: '✓ Retrieved',
    detailsClass: 'text-ok',
    toneStatus: 'Good / Empathetic',
    toneClass: 'text-ok',
    ivrStars: '★★★★★ 5.0 / 5.0',
    ivrFeedback: 'Customer Response: "Agent Alex was empathetic, restored my promotional discount and resolved inquiry immediately."'
  },
  'AGT-4092': {
    id: 'AGT-4092',
    name: 'Jordan Miller',
    queue: 'Customer Billing & Retention',
    adherence: '78.5%',
    teaBreaks: '4 / 2',
    teaClass: 'text-danger',
    lunchOverage: '0 mins',
    lunchClass: 'text-ok',
    freqCount: '2 / 3',
    freqClass: 'text-ok',
    avatar: '👨‍💼',
    verifStatus: '✓ Verified',
    verifClass: 'text-ok',
    detailsStatus: '✓ Retrieved',
    detailsClass: 'text-ok',
    toneStatus: 'Rudely / Impatient',
    toneClass: 'text-danger',
    ivrStars: '★☆☆☆☆ 1.0 / 5.0 (Rude)',
    ivrFeedback: 'Customer Response: "Agent cut me off repeatedly and spoke in an aggressive, impatient tone. Did not listen."'
  },
  'AGT-9102': {
    id: 'AGT-9102',
    name: 'Samantha Vance',
    queue: 'Customer Billing & Retention',
    adherence: '71.2%',
    teaBreaks: '1 / 2',
    teaClass: 'text-ok',
    lunchOverage: '+25 mins',
    lunchClass: 'text-danger',
    freqCount: '1 / 3',
    freqClass: 'text-ok',
    avatar: '👩‍💼',
    verifStatus: '✗ Missed PIN',
    verifClass: 'text-danger',
    detailsStatus: '✗ Incomplete',
    detailsClass: 'text-danger',
    toneStatus: 'Bad / Confused',
    toneClass: 'text-danger',
    ivrStars: '★★☆☆☆ 2.0 / 5.0',
    ivrFeedback: 'Customer Response: "Agent seemed lost, failed to verify my security PIN, and could not resolve my billing surcharge."'
  },
  'AGT-7740': {
    id: 'AGT-7740',
    name: 'David Chen',
    queue: 'Emergency Inbound',
    adherence: '82.0%',
    teaBreaks: '2 / 2',
    teaClass: 'text-ok',
    lunchOverage: '0 mins',
    lunchClass: 'text-ok',
    freqCount: '3 / 3',
    freqClass: 'text-danger',
    avatar: '👨‍💻',
    verifStatus: '✓ Verified',
    verifClass: 'text-ok',
    detailsStatus: '✓ Retrieved',
    detailsClass: 'text-ok',
    toneStatus: 'Neutral / Direct',
    toneClass: 'text-ok',
    ivrStars: '★★★☆☆ 3.5 / 5.0',
    ivrFeedback: 'Customer Response: "Fast and functional, answered question straightforwardly."'
  },
  'AGT-6512': {
    id: 'AGT-6512',
    name: 'Rachel Green',
    queue: 'Customer Billing & Retention',
    adherence: '98.2%',
    teaBreaks: '1 / 2',
    teaClass: 'text-ok',
    lunchOverage: '0 mins',
    lunchClass: 'text-ok',
    freqCount: '1 / 3',
    freqClass: 'text-ok',
    avatar: '👩‍🔬',
    verifStatus: '✓ Verified',
    verifClass: 'text-ok',
    detailsStatus: '✓ Retrieved',
    detailsClass: 'text-ok',
    toneStatus: 'Good / Empathetic',
    toneClass: 'text-ok',
    ivrStars: '★★★★★ 5.0 / 5.0',
    ivrFeedback: 'Customer Response: "Excellent service! Very friendly and solved my retention query in minutes."'
  },
  'AGT-8819': {
    id: 'AGT-8819',
    name: 'Marcus Brody',
    queue: 'Emergency Inbound',
    adherence: '91.0%',
    teaBreaks: '1 / 2',
    teaClass: 'text-ok',
    lunchOverage: '+2 mins',
    lunchClass: 'text-ok',
    freqCount: '1 / 3',
    freqClass: 'text-ok',
    avatar: '🧑‍🎓',
    verifStatus: '✓ Verified',
    verifClass: 'text-ok',
    detailsStatus: '✗ Incomplete History',
    detailsClass: 'text-warn',
    toneStatus: 'Neutral / Hesitant',
    toneClass: 'text-ok',
    ivrStars: '★★★★☆ 4.0 / 5.0',
    ivrFeedback: 'Customer Response: "Helpful agent, took a little time to look up details but solved the issue."'
  },
  'AGT-3310': {
    id: 'AGT-3310',
    name: 'Chloe Bennett',
    queue: 'General Customer Service',
    adherence: '94.2%',
    teaBreaks: '1 / 2',
    teaClass: 'text-ok',
    lunchOverage: '0 mins',
    lunchClass: 'text-ok',
    freqCount: '1 / 3',
    freqClass: 'text-ok',
    avatar: '👩‍💼',
    verifStatus: '✓ Verified',
    verifClass: 'text-ok',
    detailsStatus: '✓ Retrieved',
    detailsClass: 'text-ok',
    toneStatus: 'Good / Empathetic',
    toneClass: 'text-ok',
    ivrStars: '★★★★★ 4.8 / 5.0',
    ivrFeedback: 'Customer Response: "Chloe handled my inquiry professionally and warmly. Outstanding support."'
  },
  'AGT-5521': {
    id: 'AGT-5521',
    name: 'Lucas Wright',
    queue: 'Customer Billing & Retention',
    adherence: '88.5%',
    teaBreaks: '2 / 2',
    teaClass: 'text-ok',
    lunchOverage: '0 mins',
    lunchClass: 'text-ok',
    freqCount: '2 / 3',
    freqClass: 'text-ok',
    avatar: '👨‍💼',
    verifStatus: '✓ Verified',
    verifClass: 'text-ok',
    detailsStatus: '✓ Retrieved',
    detailsClass: 'text-ok',
    toneStatus: 'Good / Professional',
    toneClass: 'text-ok',
    ivrStars: '★★★★☆ 4.6 / 5.0',
    ivrFeedback: 'Customer Response: "Lucas clarified my billing adjustments in under 5 minutes. Very efficient."'
  },
  'AGT-7703': {
    id: 'AGT-7703',
    name: 'Maya Patel',
    queue: 'General Customer Service',
    adherence: '97.0%',
    teaBreaks: '1 / 2',
    teaClass: 'text-ok',
    lunchOverage: '0 mins',
    lunchClass: 'text-ok',
    freqCount: '1 / 3',
    freqClass: 'text-ok',
    avatar: '👩‍💻',
    verifStatus: '✓ Verified',
    verifClass: 'text-ok',
    detailsStatus: '✓ Retrieved',
    detailsClass: 'text-ok',
    toneStatus: 'Good / Empathetic',
    toneClass: 'text-ok',
    ivrStars: '★★★★★ 5.0 / 5.0',
    ivrFeedback: 'Customer Response: "Maya was so patient and friendly with my onboarding question. 5 stars!"'
  },
  'AGT-4491': {
    id: 'AGT-4491',
    name: 'Carlos Mendez',
    queue: 'Tier-2 Tech Support',
    adherence: '85.0%',
    teaBreaks: '2 / 2',
    teaClass: 'text-ok',
    lunchOverage: '+6 mins',
    lunchClass: 'text-ok',
    freqCount: '2 / 3',
    freqClass: 'text-ok',
    avatar: '👨‍🔧',
    verifStatus: '✓ Verified',
    verifClass: 'text-ok',
    detailsStatus: '✓ Retrieved',
    detailsClass: 'text-ok',
    toneStatus: 'Neutral / Direct',
    toneClass: 'text-ok',
    ivrStars: '★★★★☆ 3.8 / 5.0',
    ivrFeedback: 'Customer Response: "Resolved my hardware adapter driver issue quickly."'
  },
  'AGT-6628': {
    id: 'AGT-6628',
    name: 'Olivia Taylor',
    queue: 'Emergency Inbound',
    adherence: '99.5%',
    teaBreaks: '1 / 2',
    teaClass: 'text-ok',
    lunchOverage: '0 mins',
    lunchClass: 'text-ok',
    freqCount: '1 / 3',
    freqClass: 'text-ok',
    avatar: '👩‍🚒',
    verifStatus: '✓ Verified',
    verifClass: 'text-ok',
    detailsStatus: '✓ Retrieved',
    detailsClass: 'text-ok',
    toneStatus: 'Good / Calm',
    toneClass: 'text-ok',
    ivrStars: '★★★★★ 5.0 / 5.0',
    ivrFeedback: 'Customer Response: "Olivia kept me calm during a storm power disruption and dispatched field repair."'
  },
  'AGT-2219': {
    id: 'AGT-2219',
    name: "Liam O'Connor",
    queue: 'General Customer Service',
    adherence: '76.5%',
    teaBreaks: '3 / 2',
    teaClass: 'text-danger',
    lunchOverage: '+14 mins',
    lunchClass: 'text-ok',
    freqCount: '2 / 3',
    freqClass: 'text-ok',
    avatar: '🧑‍💻',
    verifStatus: '✗ Missed PIN',
    verifClass: 'text-danger',
    detailsStatus: '✗ Missing Details',
    detailsClass: 'text-danger',
    toneStatus: 'Bad / Hesitant',
    toneClass: 'text-danger',
    ivrStars: '★★☆☆☆ 2.5 / 5.0',
    ivrFeedback: 'Customer Response: "Agent seemed hesitant, forgot to verify my identity, and did not resolve query."'
  }
};

// State
let agentState = {
  id: 'AGT-8842',
  name: 'Alex Morgan',
  status: 'READY', // 'READY', 'IN_CALL', 'ACW', 'AUX', 'OVERDUE'
  teaBreaksToday: 1,
  lunchOverageMinutes: 0,
  adherenceScore: 96.4,
  requestsCount30m: 1,
  activeBreak: null,
  isHighVolumeMode: false,
};

let countdownInterval = null;
let twoMinuteWarningTriggered = false;
let botCallTriggered = false;
let ringAudioContext = null;
let ringOscillator = null;

// ACW State
let acwInterval = null;
let acwSecondsRemaining = 45;

// Advisories cache (pushed by supervisor)
let activeAdvisories = [
  {
    id: 'ADV-1',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    severity: 'INFO',
    title: 'NICE CXone Cluster Maintenance',
    message: 'Scheduled CTI gateway maintenance at 02:00 UTC. No impact to active calls expected.',
    sender: 'Supervisor Sarah Jenkins'
  }
];

// DOM Elements
const agentStatusDot = document.getElementById('agent-status-dot');
const agentStateLabel = document.getElementById('agent-state-label');
const btnQuickBreak = document.getElementById('btn-quick-break');
const btnOpenPortal = document.getElementById('btn-open-portal');
const widgetAgentSelect = document.getElementById('widget-agent-select');
const agentAvatarIcon = document.getElementById('agent-avatar-icon');

const broadcastTicker = document.getElementById('broadcast-ticker');
const broadcastMessage = document.getElementById('broadcast-message');
const btnDismissBroadcast = document.getElementById('btn-dismiss-broadcast');

const highTrafficBanner = document.getElementById('high-traffic-banner');
const breakActiveCard = document.getElementById('break-active-card');
const activeAuxLabel = document.getElementById('active-aux-label');
const breakTimeLeft = document.getElementById('break-time-left');
const breakProgressBar = document.getElementById('break-progress-bar');
const twoMinAlert = document.getElementById('two-min-alert');
const btnEndBreak = document.getElementById('btn-end-break');

// ACW Elements
const activeCallBar = document.getElementById('active-call-bar');
const btnEndCallAcw = document.getElementById('btn-end-call-acw');
const acwCard = document.getElementById('acw-card');
const acwTimerEl = document.getElementById('acw-timer');
const btnGenSummary = document.getElementById('btn-gen-summary');
const btnCompleteAcw = document.getElementById('btn-complete-acw');
const summaryResult = document.getElementById('summary-result');
const cxoneDispositionSelect = document.getElementById('cxone-disposition-select');

// Tab Navigation
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.getAttribute('data-tab');
    document.getElementById(target).classList.add('active');
  });
});

// Broadcast Channel to sync with Web Portal & Supervisor Command Center
try {
  const bc = new BroadcastChannel('wfm_aux_channel');
  bc.onmessage = (event) => {
    const data = event.data;
    if (data.type === 'BREAK_APPROVED') {
      startBreak(data.payload);
      addSupervisorLog('APPROVED', `${data.payload.auxCode} (${data.payload.durationMinutes}m) approved. Synced from Web Portal.`);
    } else if (data.type === 'BREAK_REJECTED') {
      addSupervisorLog('REJECTED', `${data.payload.auxCode} rejected: ${data.payload.reason}`);
      showNotification('AUX Break Rejected', data.payload.reason);
    } else if (data.type === 'SUPERVISOR_RECALL') {
      triggerBotCallModal(1, 0, data.payload.message);
      addSupervisorLog('RECALL', `Supervisor Sarah Jenkins dispatched a bot voice recall to workstation.`);
    } else if (data.type === 'BROADCAST_ALERT') {
      // Received broadcast from supervisor
      broadcastTicker.classList.remove('hidden');
      broadcastMessage.textContent = `${data.payload.title}: ${data.payload.message}`;
      playWarningChime();
      showNotification(data.payload.title, data.payload.message);
      addSupervisorLog('BROADCAST', `Supervisor broadcast received: ${data.payload.title}`);
      
      if (data.payload.alertType === 'MONDAY_TRAFFIC') {
        highTrafficBanner.classList.remove('hidden');
      }

      // Add to advisories list
      activeAdvisories.unshift({
        id: 'ADV-' + Date.now(),
        timestamp: new Date().toISOString(),
        severity: data.payload.severity || data.payload.alertType || 'WARNING',
        title: data.payload.title,
        message: data.payload.message,
        sender: 'Supervisor Command Center'
      });
      renderAdvisories();
    } else if (data.type === 'POLICY_UPDATE') {
      // Supervisor changed policies
      addSupervisorLog('POLICY', 'WFM operational policy thresholds updated by supervisor.');
      showNotification('Policy Update', 'Supervisor updated break thresholds and rate limits.');
    } else if (data.type === 'IVR_DEFLECTION_UPDATE') {
      handleIvrDeflectionUpdate(data.payload);
    } else if (data.type === 'WFM_REBALANCE_UPDATE') {
      handleWfmRebalanceUpdate(data.payload);
    } else if (data.type === 'MANDATORY_TRAINING_ASSIGNED') {
      const banner = document.getElementById('training-assigned-banner');
      const titleEl = document.getElementById('training-banner-title');
      const descEl = document.getElementById('training-banner-desc');
      if (banner) {
        if (!data.payload.targetAgentId || data.payload.targetAgentId === agentState.id || data.payload.targetAgentId === 'ALL') {
          banner.classList.remove('hidden');
          if (titleEl) titleEl.textContent = `🎓 Mandatory Coaching Assigned: ${data.payload.moduleName || 'Training'}`;
          if (descEl) descEl.textContent = `Reason: ${data.payload.reason}. Schedule: ${data.payload.scheduleMode}. Notes: ${data.payload.notes || 'Please complete ASAP.'}`;
          playWarningChime();
          addSupervisorLog('TRAINING_ASSIGNED', `Supervisor assigned ${data.payload.moduleName} due to: ${data.payload.reason}`);
          showNotification('Mandatory Coaching Assigned', `${data.payload.moduleName} scheduled by supervisor.`);
        }
      }
    }
  };
} catch (e) {
  console.warn('BroadcastChannel error:', e);
}

// Window Storage listener for cross-window events
window.addEventListener('storage', (e) => {
  if (e.key === 'wfm_active_break' && e.newValue) {
    const payload = JSON.parse(e.newValue);
    startBreak(payload);
  }
});

// Agent Persona Switcher
function switchWidgetAgent(agentKey) {
  const profile = AGENT_PROFILES[agentKey] || AGENT_PROFILES['AGT-8842'];
  agentState.id = profile.id;
  agentState.name = profile.name;
  
  if (agentAvatarIcon) agentAvatarIcon.textContent = profile.avatar;
  
  const bTea = document.getElementById('b-tea-count');
  const bLunch = document.getElementById('b-lunch-overage');
  const bAdh = document.getElementById('b-adherence');
  const bFreq = document.getElementById('b-freq-count');

  if (bTea) {
    bTea.textContent = profile.teaBreaks;
    bTea.className = `m-val ${profile.teaClass}`;
  }
  if (bLunch) {
    bLunch.textContent = profile.lunchOverage;
    bLunch.className = `m-val ${profile.lunchClass}`;
  }
  if (bAdh) bAdh.textContent = profile.adherence;
  if (bFreq) {
    bFreq.textContent = profile.freqCount;
    bFreq.className = `m-val ${profile.freqClass}`;
  }

  // Update Live QA Coaching Badges & Post-Call Rating
  const vBadge = document.getElementById('agent-verif-badge');
  const dBadge = document.getElementById('agent-details-badge');
  const tBadge = document.getElementById('agent-tone-badge');
  const ivrStars = document.getElementById('acw-ivr-stars');
  const ivrFeedback = document.getElementById('acw-ivr-feedback');

  if (vBadge) {
    vBadge.textContent = profile.verifStatus || '✓ Verified';
    vBadge.className = `qa-coach-val ${profile.verifClass || 'text-ok'}`;
  }
  if (dBadge) {
    dBadge.textContent = profile.detailsStatus || '✓ Retrieved';
    dBadge.className = `qa-coach-val ${profile.detailsClass || 'text-ok'}`;
  }
  if (tBadge) {
    tBadge.textContent = profile.toneStatus || 'Good / Empathetic';
    tBadge.className = `qa-coach-val ${profile.toneClass || 'text-ok'}`;
  }
  if (ivrStars && profile.ivrStars) ivrStars.textContent = profile.ivrStars;
  if (ivrFeedback && profile.ivrFeedback) ivrFeedback.textContent = profile.ivrFeedback;

  addSupervisorLog('AGENT_SWITCH', `Active persona switched to ${profile.name} (${profile.id}).`);
  if (latestRebalanceData) {
    handleWfmRebalanceUpdate(latestRebalanceData);
  }
}

const btnAckTraining = document.getElementById('btn-ack-training');
if (btnAckTraining) {
  btnAckTraining.addEventListener('click', () => {
    const banner = document.getElementById('training-assigned-banner');
    if (banner) banner.classList.add('hidden');
  });
}

if (widgetAgentSelect) {
  widgetAgentSelect.addEventListener('change', (e) => {
    switchWidgetAgent(e.target.value);
  });
}

// Open Break Application Web Portal
function openBreakPortal(extraParam = '') {
  let url = `/portal.html?agent=${agentState.id}`;
  if (extraParam) url += `&behavior=${extraParam}`;
  const width = 850;
  const height = 750;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  window.open(url, 'WFM_Break_Portal', `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`);
}

btnQuickBreak.addEventListener('click', () => openBreakPortal());
btnOpenPortal.addEventListener('click', () => openBreakPortal());

// Sound Synthesizer
function playTone(freq = 440, type = 'sine', duration = 0.4) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {}
}

function playWarningChime() {
  playTone(587.33, 'triangle', 0.2);
  setTimeout(() => playTone(880, 'triangle', 0.4), 220);
}

function startPhoneRingtone() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ringAudioContext = new AudioCtx();
    ringOscillator = ringAudioContext.createOscillator();
    const gain = ringAudioContext.createGain();
    
    ringOscillator.type = 'sawtooth';
    ringOscillator.frequency.setValueAtTime(440, ringAudioContext.currentTime);
    gain.gain.setValueAtTime(0.15, ringAudioContext.currentTime);
    ringOscillator.connect(gain);
    gain.connect(ringAudioContext.destination);
    ringOscillator.start();
  } catch (e) {}
}

function stopPhoneRingtone() {
  if (ringOscillator) {
    try {
      ringOscillator.stop();
      ringOscillator.disconnect();
    } catch (e) {}
    ringOscillator = null;
  }
}

// System Notification Helper
function showNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') new Notification(title, { body });
    });
  }
}

// ==========================================
// 1. ACW & CALL WRAP-UP WORKFLOW (NICE CXONE)
// ==========================================

btnEndCallAcw.addEventListener('click', () => {
  enterAcwMode();
});

function enterAcwMode() {
  agentState.status = 'ACW';
  agentStatusDot.className = 'status-indicator aux';
  agentStateLabel.className = 'state-label aux-mode';
  agentStateLabel.textContent = 'NICE CXone: AFTER CALL WORK (ACW)';

  // Hide live call bar and reveal ACW card
  activeCallBar.classList.add('hidden');
  acwCard.classList.remove('hidden');
  summaryResult.classList.add('hidden');

  acwSecondsRemaining = 45;
  updateAcwDisplay();

  if (acwInterval) clearInterval(acwInterval);
  acwInterval = setInterval(() => {
    acwSecondsRemaining--;
    updateAcwDisplay();
    if (acwSecondsRemaining === 10) {
      playTone(500, 'sine', 0.2);
    }
    if (acwSecondsRemaining <= 0) {
      clearInterval(acwInterval);
      acwTimerEl.textContent = 'EXCEEDED';
      acwTimerEl.classList.add('overdue');
      addSupervisorLog('ACW_OVERDUE', `Agent ACW target (45s) exceeded on Contact #90421.`);
    }
  }, 1000);

  addSupervisorLog('ACW_ENTER', 'Customer call completed. Entered NICE CXone ACW state.');
}

function updateAcwDisplay() {
  const m = Math.floor(Math.max(0, acwSecondsRemaining) / 60);
  const s = Math.max(0, acwSecondsRemaining) % 60;
  acwTimerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Generate Instant AI Call Summary for ACW
btnGenSummary.addEventListener('click', () => {
  const selectedDisp = cxoneDispositionSelect.value;
  summaryResult.classList.remove('hidden');
  summaryResult.innerHTML = `
    <div class="summary-badge">NICE CXONE AI SUMMARY ENRICHED</div>
    <div class="summary-body">
      <strong>• Contact ID:</strong> #90421 (Inbound Tier-2 Billing)<br>
      <strong>• Customer:</strong> Jordan Miller (+1-555-019-4821)<br>
      <strong>• Verified Intent:</strong> Inquired regarding recurring promotional discount expiration on fiber plan.<br>
      <strong>• Actions Executed:</strong> Validated CTI ledger, restored promotional code RET-2026, issued $25 credit.<br>
      <strong>• CXone Disposition:</strong> ${selectedDisp}<br>
      <strong>• Sentiment Score:</strong> +0.82 (De-escalated / Satisfied)<br>
      <strong>• Follow-up Task:</strong> Automated SMS confirmation queued (No callback required).
    </div>
  `;
  playTone(659.25, 'sine', 0.15); // E5
});

// Complete ACW & Return to Available
btnCompleteAcw.addEventListener('click', async () => {
  if (acwInterval) clearInterval(acwInterval);
  acwInterval = null;

  const payload = {
    contactId: '90421',
    agentId: agentState.id,
    disposition: cxoneDispositionSelect.value,
    acwDurationSeconds: 45 - Math.max(0, acwSecondsRemaining),
    timestamp: new Date().toISOString()
  };

  // Sync to mock backend
  try {
    await fetch('/api/cxone/acw-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {}

  acwCard.classList.add('hidden');
  activeCallBar.classList.remove('hidden');
  
  agentState.status = 'READY';
  agentStatusDot.className = 'status-indicator ready';
  agentStateLabel.className = 'state-label';
  agentStateLabel.textContent = 'NICE CXone: AVAILABLE';

  addSupervisorLog('ACW_COMPLETE', `ACW finalized with disposition "${payload.disposition}". Returned to AVAILABLE.`);
  playTone(523.25, 'sine', 0.2); // C5
});

// ==========================================
// 2. BREAK LIFECYCLE & COUNTDOWN
// ==========================================

function startBreak(breakData) {
  agentState.status = 'AUX';
  agentState.activeBreak = {
    auxCode: breakData.auxCode,
    durationMinutes: breakData.durationMinutes,
    expiresAt: breakData.expiresAt || (Date.now() + (breakData.durationMinutes * 60 * 1000)),
    totalMs: (breakData.durationMinutes * 60 * 1000)
  };
  twoMinuteWarningTriggered = false;
  botCallTriggered = false;

  agentStatusDot.className = 'status-indicator aux';
  agentStateLabel.className = 'state-label aux-mode';
  agentStateLabel.textContent = `NICE CXone: ${breakData.auxCode}`;

  activeAuxLabel.textContent = breakData.auxCode;
  breakActiveCard.classList.remove('hidden');
  twoMinAlert.classList.add('hidden');
  breakTimeLeft.classList.remove('overdue');

  playTone(523.25, 'sine', 0.3);

  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(updateBreakCountdown, 1000);
  updateBreakCountdown();
}

function updateBreakCountdown() {
  if (!agentState.activeBreak) return;

  const now = Date.now();
  const diffMs = agentState.activeBreak.expiresAt - now;
  const isOverdue = diffMs < 0;

  const absDiff = Math.abs(diffMs);
  const minutes = Math.floor(absDiff / (1000 * 60));
  const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (!isOverdue) {
    breakTimeLeft.textContent = formatted;
    breakTimeLeft.classList.remove('overdue');
    const pct = Math.max(0, Math.min(100, (diffMs / agentState.activeBreak.totalMs) * 100));
    breakProgressBar.style.width = `${pct}%`;
    breakProgressBar.style.background = '#6366f1';

    // 2-MINUTE WARNING FEATURE
    if (diffMs <= 2 * 60 * 1000 && !twoMinuteWarningTriggered) {
      twoMinuteWarningTriggered = true;
      twoMinAlert.classList.remove('hidden');
      playWarningChime();
      showNotification('2-Minute Break Warning', 'Your AUX break ends in 2 minutes. Please wrap up and prepare to resume AVAILABLE state.');
      addSupervisorLog('ALERT', '2-minute pre-expiration notification dispatched to agent.');
    }
  } else {
    // BREAK EXCEEDED / OVERDUE
    agentState.status = 'OVERDUE';
    agentStatusDot.className = 'status-indicator overdue';
    agentStateLabel.className = 'state-label overdue-mode';
    agentStateLabel.textContent = `OVERDUE (+${formatted})`;

    breakTimeLeft.textContent = `+${formatted}`;
    breakTimeLeft.classList.add('overdue');
    breakProgressBar.style.width = '100%';
    breakProgressBar.style.background = '#ef4444';
    twoMinAlert.classList.add('hidden');

    if (!botCallTriggered && minutes >= 0 && seconds >= 3) {
      triggerBotCallModal(minutes, seconds);
    }
  }
}

function triggerBotCallModal(overMins = 1, overSecs = 0, customMsg = '') {
  botCallTriggered = true;
  const overlay = document.getElementById('bot-call-overlay');
  const speechTextEl = document.getElementById('bot-call-speech-text');

  const speechMessage = customMsg || `Attention Agent ${agentState.name}: Your scheduled auxiliary break duration has ended and is now exceeding adherence limits by ${overMins || 1} minute. You are required to immediately return to your workstation and switch to available status. Your supervisor has been notified.`;
  speechTextEl.textContent = `"${speechMessage}"`;

  overlay.classList.remove('hidden');
  startPhoneRingtone();
  addSupervisorLog('OVERDUE_CALL', `Automated bot voice call placed to agent for adherence violation.`);

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    setTimeout(() => {
      stopPhoneRingtone();
      const utterance = new SpeechSynthesisUtterance(speechMessage);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }, 1800);
  }
}

document.getElementById('btn-accept-bot-call').addEventListener('click', () => {
  stopPhoneRingtone();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  document.getElementById('bot-call-overlay').classList.add('hidden');
  endBreakEarly();
  addSupervisorLog('RESUMED', 'Agent acknowledged bot call and resumed AVAILABLE state in NICE CXone.');
});

btnEndBreak.addEventListener('click', () => {
  endBreakEarly();
});

function endBreakEarly() {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = null;
  agentState.status = 'READY';
  agentState.activeBreak = null;
  localStorage.removeItem('wfm_active_break');

  agentStatusDot.className = 'status-indicator ready';
  agentStateLabel.className = 'state-label';
  agentStateLabel.textContent = 'NICE CXone: AVAILABLE';

  breakActiveCard.classList.add('hidden');
  twoMinAlert.classList.add('hidden');
  playTone(440, 'sine', 0.2);
}

// Supervisor Audit Log Updater
function addSupervisorLog(tag, message) {
  const list = document.getElementById('supervisor-log-list');
  if (!list) return;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const entry = document.createElement('div');
  entry.className = 'log-entry';

  let tagClass = 'system';
  if (tag === 'APPROVED') tagClass = 'approved';
  if (tag === 'REJECTED' || tag === 'OVERDUE_CALL') tagClass = 'rejected';

  entry.innerHTML = `
    <span class="log-time">${timeStr}</span>
    <span class="log-tag ${tagClass}">${tag}</span>
    <span class="log-text">${message}</span>
  `;
  list.prepend(entry);
}

// Suggested Replies & Copy
document.querySelectorAll('.btn-copy').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const parent = e.target.closest('.suggestion-item');
    const text = parent.getAttribute('data-text');
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '✓ Copied!';
      setTimeout(() => btn.textContent = 'Copy to Chat', 1500);
    });
  });
});

// Chat Stream with Copilot
const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const btnSendChat = document.getElementById('btn-send-chat');

function addChatMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = `chat-msg ${sender}`;
  msg.innerHTML = `<div class="msg-bubble">${text}</div>`;
  chatHistory.appendChild(msg);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

btnSendChat.addEventListener('click', handleUserChat);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleUserChat();
});

// Wire real-time prompt chips
document.querySelectorAll('.chat-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const q = chip.getAttribute('data-query');
    chatInput.value = q;
    handleUserChat();
  });
});

async function handleUserChat() {
  const query = chatInput.value.trim();
  if (!query) return;
  addChatMessage('user', query);
  chatInput.value = '';

  // Show thinking indicator
  const thinkingId = 'thinking-' + Date.now();
  const thinkingMsg = document.createElement('div');
  thinkingMsg.className = 'chat-msg ai';
  thinkingMsg.id = thinkingId;
  thinkingMsg.innerHTML = '<div class="msg-bubble" style="opacity:0.7;">⚡ Querying live ACD telemetry, WFM forecast & IT logs...</div>';
  chatHistory.appendChild(thinkingMsg);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  const currentAgentId = agentSelect ? agentSelect.value : 'AGT-8842';

  try {
    const res = await fetch('/api/copilot/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        agentId: currentAgentId,
        role: 'agent'
      })
    });

    if (res.ok) {
      const data = await res.json();
      const thinkingEl = document.getElementById(thinkingId);
      if (thinkingEl) thinkingEl.remove();
      addChatMessage('ai', data.answer);
      return;
    }
  } catch (err) {
    console.warn('Backend copilot query offline, using local real-time telemetry engine:', err);
  }

  // Client-Side Real-Time Fallback Engine
  const thinkingEl = document.getElementById(thinkingId);
  if (thinkingEl) thinkingEl.remove();

  const profile = AGENT_PROFILES[currentAgentId] || AGENT_PROFILES['AGT-8842'];
  const qLower = query.toLowerCase();
  let response = '';

  if (qLower.includes('volume') || qLower.includes('queue') || qLower.includes('calls waiting') || qLower.includes('traffic')) {
    response = `📊 <strong>Real-Time ACD Queue Telemetry:</strong><br/>` +
      `• <strong>Billing & Payments</strong>: 42 calls waiting | Avg Wait: 35s | SLA: 86.4%<br/>` +
      `• <strong>General Customer Service</strong>: 8 calls waiting | Avg Wait: 14s | SLA: 97.2%<br/>` +
      `• <strong>Tier-2 Tech Support</strong>: 15 calls waiting | Avg Wait: 32s | SLA: 88.0%<br/>` +
      `<small style="color:#94a3b8; display:block; margin-top:4px;">Inbound Rate: 420 calls/min. All skill queues operating normally.</small>`;
  } else if (qLower.includes('adherence') || qLower.includes('tea break') || qLower.includes('my break') || qLower.includes('lunch') || qLower.includes('quota')) {
    response = `⏱️ <strong>Live Schedule Adherence for ${profile.name}:</strong><br/>` +
      `• <strong>CXone Adherence</strong>: <strong>${profile.adherence}</strong> (Target: &ge; 90%)<br/>` +
      `• <strong>Tea Breaks Taken Today</strong>: <strong>${profile.teaBreaks}</strong> (Policy: Max 2)<br/>` +
      `• <strong>Lunch Variance</strong>: <strong>${profile.lunchOverage}</strong> (Tolerance: &lt;15m)<br/>` +
      `• <strong>Frequency (30m)</strong>: <strong>${profile.freqCount}</strong> requests`;
  } else if (qLower.includes('storm') || qLower.includes('weather') || qLower.includes('deflection') || qLower.includes('outage')) {
    response = `🌪️ <strong>Storm Outage IVR Telemetry:</strong><br/>` +
      `• Current Call Rate: <strong>1,240 calls/min</strong> (Threshold: 1,000/min)<br/>` +
      `• Deflection: <strong style="color:#38bdf8;">ACTIVE</strong> (Callers 1,001+ hearing outage broadcast).<br/>` +
      `• Auto-clears when volume drops below 1,000/min.`;
  } else if (qLower.includes('rebalance') || qLower.includes('flex')) {
    response = `🔄 <strong>WFM Intraday Skill Rebalance:</strong><br/>` +
      `Customer Service agents flexed to Billing queue to absorb surge. Billing quick-replies boosted.`;
  } else if (qLower.includes('it') || qLower.includes('ticket') || qLower.includes('vpn') || qLower.includes('incident')) {
    response = `💻 <strong>Active IT Incidents:</strong><br/>` +
      `• INC-88102: Carlos Mendez - Cisco AnyConnect VPN MTU 1350 (In Progress)<br/>` +
      `• INC-88103: Samantha Vance - Citrix Workspace Reconnect (Assigned)`;
  } else {
    response = `🤖 <strong>Live NICE CXone Telemetry Briefing:</strong><br/>` +
      `All circuits operational. Your adherence: <strong>${profile.adherence}</strong>. Inbound rate: <strong>420 calls/min</strong>. ` +
      `Ask about <em>queue volume</em>, <em>my adherence</em>, <em>storm deflection</em>, or <em>WFM skill flex</em>!`;
  }
  addChatMessage('ai', response);
}

// ==========================================
// 3. EXPANDED ARTICLES (NICE CXONE & SYSTEM)
// ==========================================

const articlesData = [
  {
    id: 1,
    cat: 'cxone',
    title: 'NICE CXone MAX Softphone: WebRTC One-Way Audio',
    desc: 'Occurs when local firewall drops UDP port range 10000-20000 or browser blocks media stream. Disable exclusive audio mode and toggle CXone softphone endpoint.',
    tags: ['cxone', 'max', 'webrtc', 'audio', 'mic']
  },
  {
    id: 2,
    cat: 'cxone',
    title: 'NICE CXone Agent State Stuck in Code 99 (Heartbeat Outage)',
    desc: 'CTI link desynchronization caused by intermittent network blips. Click CTI Reconnect in MAX, or switch to AUX-5 (Technical Issue) while session restores.',
    tags: ['cxone', 'state', 'code99', 'aux', 'cti']
  },
  {
    id: 3,
    cat: 'cxone',
    title: 'NICE CXone Browser Audio & Microphone Permissions Revoked',
    desc: 'Chrome/Edge sandbox safety feature. Open site settings, set Microphone to "Allow", ensure "default - Realtek Headset" is locked, and reload MAX.',
    tags: ['cxone', 'browser', 'chrome', 'edge', 'microphone']
  },
  {
    id: 4,
    cat: 'vpn',
    title: 'VPN Error 412 / Cisco AnyConnect MTU 1350 Tuning',
    desc: 'TLS heartbeat drops during peak packet bursts. Run the route reset diagnostic and verify MTU size does not exceed 1350 bytes on Wi-Fi adapter.',
    tags: ['vpn', 'cisco', 'network', 'mtu']
  },
  {
    id: 5,
    cat: 'vpn',
    title: 'GlobalProtect / Pulse Secure 502 Bad Gateway Failover',
    desc: 'Failover procedure to secondary authentication node (gw-backup.contactcenter.com) during ISP disruptions.',
    tags: ['vpn', 'gateway', 'pulse']
  },
  {
    id: 6,
    cat: 'vdi',
    title: 'Citrix Workspace Black Screen on Session Reconnect',
    desc: 'Virtual display driver handshake freeze. Press Ctrl+F2 to release keyboard hook, or restart Citrix Workspace receiver from system tray.',
    tags: ['vdi', 'citrix', 'screen', 'freeze']
  },
  {
    id: 7,
    cat: 'audio',
    title: 'Windows 11 USB Headset Buffer Jitter & Latency',
    desc: 'Caused by power management USB selective suspend. Disable USB sleep in Power Options and restart the Windows AudioSrv service.',
    tags: ['audio', 'headset', 'usb', 'windows']
  }
];

function renderArticles(list) {
  const container = document.getElementById('articles-container');
  if (!container) return;
  container.innerHTML = '';
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.innerHTML = `
      <div class="article-title">📄 ${item.title}</div>
      <div class="article-desc">${item.desc}</div>
    `;
    card.addEventListener('click', () => {
      addChatMessage('ai', `Opened Guide: **${item.title}**\n\n${item.desc}\n\n*Would you like me to run automated diagnostics for this issue?*`);
      tabBtns[0].click();
    });
    container.appendChild(card);
  });
}
renderArticles(articlesData);

document.querySelectorAll('.kb-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.kb-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const cat = pill.getAttribute('data-cat');
    if (cat === 'all') {
      renderArticles(articlesData);
    } else {
      renderArticles(articlesData.filter(a => a.cat === cat));
    }
  });
});

document.getElementById('article-search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = articlesData.filter(a => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)));
  renderArticles(filtered);
});

// Self-Healing Diagnostics
const diagConsole = document.getElementById('diag-console');

document.getElementById('btn-flush-dns').addEventListener('click', () => {
  diagConsole.textContent = '> ipconfig /flushdns\nWindows IP Configuration\nSuccessfully flushed the DNS Resolver Cache.\n> route reset interface "Ethernet 1" [OK]\nRouting tables restored.';
  playTone(600, 'sine', 0.1);
});

document.getElementById('btn-ping-cxone').addEventListener('click', () => {
  diagConsole.textContent = '> ping na1.niceincontact.com -n 3\nPinging CXone Cluster (198.153.22.40) with 32 bytes:\nReply: bytes=32 time=18ms TTL=54\nReply: bytes=32 time=17ms TTL=54\nWebSocket CTI Jitter: 0.8ms | WebRTC Packet Loss: 0% [OPTIMAL]';
  playTone(700, 'sine', 0.1);
});

document.getElementById('btn-reset-audio').addEventListener('click', () => {
  diagConsole.textContent = '> Restarting Windows Audio Service (AudioSrv)...\nStopping service... [OK]\nStarting service... [OK]\nNICE CXone Media Endpoint re-enumerated: Jabra Evolve 65 Headset (48kHz).';
  playTone(800, 'sine', 0.1);
});

// ==========================================
// 4. READ-ONLY ADVISORIES TAB
// ==========================================

function renderAdvisories() {
  const container = document.getElementById('advisories-list');
  const unreadEl = document.getElementById('unread-alert-count');
  if (!container) return;

  unreadEl.textContent = activeAdvisories.length;

  if (activeAdvisories.length === 0) {
    container.innerHTML = `<p class="text-muted" style="text-align:center; padding:12px;">No active advisories from floor leadership.</p>`;
    return;
  }

  container.innerHTML = activeAdvisories.map(adv => {
    const timeStr = new Date(adv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let tagColor = 'info';
    if (adv.severity.includes('CRITICAL') || adv.severity.includes('STORM') || adv.severity.includes('OUTAGE')) tagColor = 'danger';
    if (adv.severity.includes('WARNING') || adv.severity.includes('MONDAY')) tagColor = 'warning';

    return `
      <div class="advisory-card">
        <div class="adv-header">
          <span class="adv-tag ${tagColor}">${adv.severity}</span>
          <span class="adv-time">${timeStr}</span>
        </div>
        <strong class="adv-title">${adv.title}</strong>
        <p class="adv-msg">${adv.message}</p>
        <div class="adv-footer">
          <small class="adv-sender">By: ${adv.sender || 'Supervisor'}</small>
          <button class="btn-xs btn-outline" onclick="dismissAdvisory('${adv.id}')">Acknowledge</button>
        </div>
      </div>
    `;
  }).join('');
}

window.dismissAdvisory = function(id) {
  activeAdvisories = activeAdvisories.filter(a => a.id !== id);
  renderAdvisories();
};

btnDismissBroadcast.addEventListener('click', () => {
  broadcastTicker.classList.add('hidden');
});

// Live call ticker
let callSeconds = 192;
setInterval(() => {
  if (agentState.status !== 'ACW') {
    callSeconds++;
    const m = Math.floor(callSeconds / 60);
    const s = callSeconds % 60;
    const el = document.getElementById('call-timer');
    if (el) el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}, 1000);

// Initialize advisories
renderAdvisories();


// ==========================================
// STORM OUTAGE & IVR DEFLECTION LISTENER
// ==========================================

const stormDeflectionBanner = document.getElementById('storm-deflection-banner');
const agentSurgeRateEl = document.getElementById('agent-surge-rate');
const btnAgentListenAnn = document.getElementById('btn-agent-listen-ann');

let lastDeflectionState = false;

function handleIvrDeflectionUpdate(deflectionData) {
  if (!stormDeflectionBanner) return;

  if (deflectionData.isDeflectionActive) {
    stormDeflectionBanner.classList.remove('hidden');
    if (agentSurgeRateEl) agentSurgeRateEl.textContent = deflectionData.callVolumeRatePerMin;

    if (!lastDeflectionState) {
      playWarningChime();
      showNotification('Outage Deflection Active', `Surge traffic (${deflectionData.callVolumeRatePerMin} calls/min > 1,000 threshold). Automated voice announcement active for callers 1001+ to protect human queue.`);
      addSupervisorLog('DEFLECTION', `Storm Outage Deflection Active (>1,000 calls/min). Callers 1001+ greeted with field outage announcement.`);
    }
    lastDeflectionState = true;
  } else {
    stormDeflectionBanner.classList.add('hidden');
    if (lastDeflectionState) {
      showNotification('Deflection Disabled', `Call volume normalized (<1,000 calls/min). Standard queue routing automatically resumed.`);
      addSupervisorLog('NORMAL_QUEUE', `Call volume normalized (<1,000 calls/min). Automated voice announcement disabled.`);
    }
    lastDeflectionState = false;
  }
}

if (btnAgentListenAnn) {
  btnAgentListenAnn.addEventListener('click', () => {
    const text = "Thank you for the call, we are having so many outages out field workers are on the route, thank you for your patience";
    btnAgentListenAnn.textContent = '🔊 Playing...';
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => {
        btnAgentListenAnn.textContent = '🔊 Hear IVR';
      };
      window.speechSynthesis.speak(utterance);
    } else {
      alert(text);
      btnAgentListenAnn.textContent = '🔊 Hear IVR';
    }
  });
}

// Periodic check
async function pollAgentDeflection() {
  try {
    const res = await fetch('/api/cxone/ivr-deflection');
    if (res.ok) {
      const data = await res.json();
      handleIvrDeflectionUpdate(data);
    }
  } catch (e) {}
}

pollAgentDeflection();
setInterval(pollAgentDeflection, 4000);


// ==========================================
// DYNAMIC WFM SKILL REBALANCE HANDLING
// ==========================================

let latestRebalanceData = null;

function handleWfmRebalanceUpdate(data) {
  latestRebalanceData = data;
  const banner = document.getElementById('wfm-rebalance-banner');
  const title = document.getElementById('wfm-rebalance-title');
  const desc = document.getElementById('wfm-rebalance-desc');
  if (!banner) return;

  const isCurrentAgentFlexed = data && data.reallocatedAgents && data.reallocatedAgents.some(a => a.id === agentState.id);

  if (isCurrentAgentFlexed) {
    banner.classList.remove('hidden');
    if (title) title.textContent = '🔄 Dynamic WFM Skill Flex: Customer Billing Support';
    if (desc) desc.textContent = 'You have been dynamically flexed from Customer Service to absorb high Billing queue volume. Billing quick-replies boosted.';
    playWarningChime();
    addSupervisorLog('WFM_REBALANCE', 'Agent reallocated to Customer Billing & Retention due to sudden volume surge.');
  } else {
    banner.classList.add('hidden');
  }
}

const btnAckRebalance = document.getElementById('btn-ack-rebalance');
if (btnAckRebalance) {
  btnAckRebalance.addEventListener('click', () => {
    const banner = document.getElementById('wfm-rebalance-banner');
    if (banner) banner.classList.add('hidden');
  });
}

async function pollAgentRebalance() {
  try {
    const res = await fetch('/api/wfm/queue-balance');
    if (res.ok) {
      const data = await res.json();
      handleWfmRebalanceUpdate(data);
    }
  } catch (e) {}
}

pollAgentRebalance();
setInterval(pollAgentRebalance, 4000);
