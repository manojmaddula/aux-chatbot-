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
let ringLoopInterval = null;
let ringSirenInterval = null;

// Break Overdue Calling & Device Alert Preferences
let agentAlertPrefs = {
  device: 'both', // 'laptop' | 'mobile' | 'both'
  thresholdMins: 2, // Variance threshold over break applied duration
  soundStyle: 'phone_ring', // 'phone_ring' | 'siren' | 'voice'
  mobilePhone: '+1 (555) 019-8842'
};

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

const btnAgentHome = document.getElementById('btn-agent-home');
if (btnAgentHome) {
  btnAgentHome.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.self !== window.top) {
      // Inside floating widget iframe
      try {
        if (window.parent && window.parent.location.pathname.includes('agent-home.html')) {
          // Already on agent-home! Simply close the floating widget panel
          window.parent.postMessage({ type: 'CLOSE_WIDGET' }, '*');
          return;
        } else if (window.parent) {
          window.parent.location.href = '/agent-home.html';
          return;
        }
      } catch (err) {}
    }
    // Standalone widget page navigation
    window.location.href = '/agent-home.html';
  });
}

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
    } else if (data.type === 'ALARM_ACKNOWLEDGED' || data.type === 'BREAK_ENDED') {
      // Alarm acknowledged / break ended on mobile companion or supervisor desk
      if (!data.payload || !data.payload.agentId || data.payload.agentId === agentState.id) {
        endBreakEarly(true);
        addSupervisorLog('ALARM_ACKNOWLEDGED', `Break ended & acknowledged via ${data.payload.from || 'Mobile'}. Resumed AVAILABLE state.`);
        showNotification('Break Resumed', 'Resumed AVAILABLE state in NICE CXone.');
      }
    } else if (data.type === 'ALARM_SILENCED') {
      if (!data.payload || !data.payload.agentId || data.payload.agentId === agentState.id) {
        silenceLaptopAlarm();
      }
    } else if (data.type === 'TRIGGER_ALARM') {
      const isSup = data.payload && (
        data.payload.triggeredBy === 'SUPERVISOR_WALLBOARD' ||
        data.payload.triggeredBy === 'SUPERVISOR_RECALL' ||
        data.payload.force === true
      );
      if (!data.payload || !data.payload.agentId || data.payload.agentId === agentState.id || isSup) {
        // STRICT DEVICE ROUTING CHECK
        const targetDev = (data.payload && data.payload.device) || agentAlertPrefs.device || 'both';
        if (targetDev === 'laptop' || targetDev === 'both') {
          triggerBotCallModal(data.payload.overdueMins || 1, data.payload.overdueSecs || 0, data.payload.message, isSup);
        } else {
          // Mobile Only: record log and keep laptop calm
          addSupervisorLog('OVERDUE_ALARM', `Threshold exceeded! Calling alarm routed to Mobile Phone.`);
        }
      }
    } else if (data.type === 'PREFERENCES_UPDATED') {
      if (!data.payload || !data.payload.agentId || data.payload.agentId === agentState.id) {
        agentAlertPrefs = { ...agentAlertPrefs, ...data.payload };
        try { localStorage.setItem('wfm_alert_prefs', JSON.stringify(agentAlertPrefs)); } catch (e) {}
        if (typeof window.updateAlertUiLabels === 'function') {
          window.updateAlertUiLabels();
        }
      }
    } else if (data.type === 'SUPERVISOR_RECALL') {
      const isSup = true;
      if (!data.payload || !data.payload.agentId || data.payload.agentId === agentState.id || isSup) {
        triggerBotCallModal(1, 0, data.payload ? data.payload.message : '', true);
        addSupervisorLog('RECALL', `Supervisor issued an automated bot voice recall to workstation.`);
      }
    } else if (data.type === 'BROADCAST_ALERT') {
      // Received broadcast from supervisor
      broadcastTicker.classList.remove('hidden');
      if (data.payload.severity === 'CELEBRATION' || (data.payload.title && data.payload.title.includes('Birthday'))) {
        broadcastTicker.classList.add('celebration');
      } else {
        broadcastTicker.classList.remove('celebration');
      }
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
      // Supervisor changed policies - sync immediately to agent bot
      applyPolicyUpdate(data.payload);
      showNotification('Shift Policy Updated', `Supervisor updated shift policies: Max AUX Breaks: ${data.payload.maxTeaBreaks}, Target Adherence: ${data.payload.targetAdherence}%.`);
      addChatMessage('ai', `🛡️ **Operations Shift Policy Updated by Floor Supervisor:**<br/>• Max AUX Breaks: <strong>${data.payload.maxTeaBreaks} / shift</strong><br/>• Lunch Variance Allowed: <strong>Max +${data.payload.lunchVarianceThreshold}m</strong><br/>• Request Frequency: <strong>Max ${data.payload.maxFrequencyRequests} requests / ${data.payload.frequencyWindow === '2_WEEKS' ? '2-Wks' : '1-Wk'}</strong><br/>• Target Adherence: <strong>≥ ${data.payload.targetAdherence}%</strong>`);
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


// ==========================================
// 30-DAY BREAK HISTORY ENGINE FOR AUX BREAKS TAB
// ==========================================

const AGENT_30DAY_CACHE = {};
let currentBreakFilter = 'all';

function getAuxIcon(auxCode) {
  if (!auxCode) return '☕';
  if (auxCode.includes('AUX-1') || auxCode.toLowerCase().includes('lunch')) return '🍱';
  if (auxCode.includes('AUX-2') || auxCode.toLowerCase().includes('tea') || auxCode.toLowerCase().includes('short')) return '☕';
  if (auxCode.includes('AUX-3') || auxCode.toLowerCase().includes('meeting')) return '👥';
  if (auxCode.includes('AUX-4') || auxCode.toLowerCase().includes('training') || auxCode.toLowerCase().includes('coaching')) return '🎓';
  if (auxCode.includes('AUX-5') || auxCode.toLowerCase().includes('tech') || auxCode.toLowerCase().includes('vpn')) return '💻';
  if (auxCode.includes('AUX-6') || auxCode.toLowerCase().includes('bio') || auxCode.toLowerCase().includes('emergency')) return '🚹';
  return '☕';
}

function getAuxCategory(auxCode) {
  if (!auxCode) return 'tea';
  if (auxCode.includes('AUX-1') || auxCode.toLowerCase().includes('lunch')) return 'lunch';
  if (auxCode.includes('AUX-2') || auxCode.toLowerCase().includes('tea') || auxCode.toLowerCase().includes('short')) return 'tea';
  return 'other';
}

function generate30DayBreakHistory(agentId) {
  if (AGENT_30DAY_CACHE[agentId]) {
    return AGENT_30DAY_CACHE[agentId];
  }

  const baseDate = new Date(2026, 9, 21); // Oct 21, 2026
  const profile = AGENT_PROFILES[agentId] || AGENT_PROFILES['AGT-8842'];
  const items = [];

  // Today (Day 0) per agent:
  if (agentId === 'AGT-4092') { // Jordan Miller (4 aux breaks today)
    items.push(
      { date: 'Today, Oct 21', auxCode: 'AUX-2: Short Break / AUX', icon: '☕', time: '01:30 PM - 01:45 PM', duration: '15 mins', status: 'Completed', statusClass: 'completed', category: 'tea' },
      { date: 'Today, Oct 21', auxCode: 'AUX-2: Short Break / AUX', icon: '☕', time: '11:45 AM - 12:00 PM', duration: '15 mins', status: 'Completed', statusClass: 'completed', category: 'tea' },
      { date: 'Today, Oct 21', auxCode: 'AUX-2: Short Break / AUX', icon: '☕', time: '10:15 AM - 10:30 AM', duration: '15 mins', status: 'Completed', statusClass: 'completed', category: 'tea' },
      { date: 'Today, Oct 21', auxCode: 'AUX-2: Short Break / AUX', icon: '☕', time: '08:45 AM - 09:00 AM', duration: '15 mins', status: 'Completed', statusClass: 'completed', category: 'tea' }
    );
  } else if (agentId === 'AGT-9102') { // Samantha Vance (1 lunch overdue, 1 aux break)
    items.push(
      { date: 'Today, Oct 21', auxCode: 'AUX-1: Scheduled Lunch', icon: '🍱', time: '12:00 PM - 12:55 PM', duration: '55 mins', status: 'Overdue (+25m)', statusClass: 'overdue', category: 'lunch' },
      { date: 'Today, Oct 21', auxCode: 'AUX-2: Short Break / AUX', icon: '☕', time: '09:15 AM - 09:30 AM', duration: '15 mins', status: 'Completed', statusClass: 'completed', category: 'tea' }
    );
  } else if (agentId === 'AGT-6628') {
    // Olivia Taylor: 0 breaks taken today
  } else if (agentId === 'AGT-7740') {
    items.push(
      { date: 'Today, Oct 21', auxCode: 'AUX-2: Short Break / AUX', icon: '☕', time: '01:45 PM - 02:00 PM', duration: '15 mins', status: 'Completed', statusClass: 'completed', category: 'tea' },
      { date: 'Today, Oct 21', auxCode: 'AUX-2: Short Break / AUX', icon: '☕', time: '09:30 AM - 09:45 AM', duration: '15 mins', status: 'Completed', statusClass: 'completed', category: 'tea' }
    );
  } else if (agentId === 'AGT-4491') {
    items.push(
      { date: 'Today, Oct 21', auxCode: 'AUX-2: Short Break / AUX', icon: '☕', time: '02:30 PM - 02:45 PM', duration: '15 mins', status: 'Completed', statusClass: 'completed', category: 'tea' },
      { date: 'Today, Oct 21', auxCode: 'AUX-2: Short Break / AUX', icon: '☕', time: '11:00 AM - 11:15 AM', duration: '15 mins', status: 'Completed', statusClass: 'completed', category: 'tea' },
      { date: 'Today, Oct 21', auxCode: 'AUX-5: Technical / VPN Issue', icon: '💻', time: '08:30 AM - 09:10 AM', duration: '40 mins', status: 'Resolved', statusClass: 'completed', category: 'other' }
    );
  } else if (agentId === 'AGT-2219') {
    items.push(
      { date: 'Today, Oct 21', auxCode: 'AUX-2: Short Break / AUX', icon: '☕', time: '02:00 PM - 02:15 PM', duration: '15 mins', status: 'Completed', statusClass: 'completed', category: 'tea' },
      { date: 'Today, Oct 21', auxCode: 'AUX-2: Short Break / AUX', icon: '☕', time: '11:15 AM - 11:30 AM', duration: '15 mins', status: 'Completed', statusClass: 'completed', category: 'tea' },
      { date: 'Today, Oct 21', auxCode: 'AUX-4: Training / Coaching', icon: '🎓', time: '09:00 AM - 09:45 AM', duration: '45 mins', status: 'Completed', statusClass: 'completed', category: 'other' }
    );
  } else {
    items.push(
      { date: 'Today, Oct 21', auxCode: 'AUX-2: Short Break / AUX', icon: '☕', time: '10:30 AM - 10:45 AM', duration: '15 mins', status: 'Completed', statusClass: 'completed', category: 'tea' }
    );
  }

  // Days 1 through 29 (Past 30 days)
  for (let d = 1; d < 30; d++) {
    const curDate = new Date(baseDate);
    curDate.setDate(curDate.getDate() - d);
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    const monthStr = curDate.toLocaleString('default', { month: 'short' });
    const dayNum = curDate.getDate();
    const dateLabel = d === 1 ? ('Yesterday, ' + monthStr + ' ' + dayNum) : (monthStr + ' ' + dayNum + ', 2026');

    // Scheduled Lunch
    let lunchDur = '30 mins';
    let lunchStatus = 'Completed';
    let lunchClass = 'completed';
    if (agentId === 'AGT-9102' && (d === 3 || d === 8 || d === 15)) {
      lunchDur = '50 mins';
      lunchStatus = 'Overdue (+20m)';
      lunchClass = 'overdue';
    }
    items.push({
      date: dateLabel,
      auxCode: 'AUX-1: Scheduled Lunch',
      icon: '🍱',
      time: '12:30 PM - 01:00 PM',
      duration: lunchDur,
      status: lunchStatus,
      statusClass: lunchClass,
      category: 'lunch'
    });

    // AUX Break 1
    items.push({
      date: dateLabel,
      auxCode: 'AUX-2: Short Break / AUX',
      icon: '☕',
      time: '10:30 AM - 10:45 AM',
      duration: '15 mins',
      status: 'Completed',
      statusClass: 'completed',
      category: 'tea'
    });

    // AUX Break 2 (or more for Jordan)
    if (agentId === 'AGT-4092') {
      items.push({
        date: dateLabel,
        auxCode: 'AUX-2: Short Break / AUX',
        icon: '☕',
        time: '02:15 PM - 02:30 PM',
        duration: '15 mins',
        status: 'Completed',
        statusClass: 'completed',
        category: 'tea'
      });
      items.push({
        date: dateLabel,
        auxCode: 'AUX-2: Short Break / AUX',
        icon: '☕',
        time: '04:00 PM - 04:15 PM',
        duration: '15 mins',
        status: 'Completed',
        statusClass: 'completed',
        category: 'tea'
      });
    } else if (d % 2 === 0) {
      items.push({
        date: dateLabel,
        auxCode: 'AUX-2: Short Break / AUX',
        icon: '☕',
        time: '03:30 PM - 03:45 PM',
        duration: '15 mins',
        status: 'Completed',
        statusClass: 'completed',
        category: 'tea'
      });
    }

    // Occasional training / tech issue
    if (d === 4 || d === 12 || d === 20) {
      if (agentId === 'AGT-4491') {
        items.push({
          date: dateLabel,
          auxCode: 'AUX-5: Technical / VPN Issue',
          icon: '💻',
          time: '09:00 AM - 09:35 AM',
          duration: '35 mins',
          status: 'Resolved',
          statusClass: 'completed',
          category: 'other'
        });
      } else if (agentId === 'AGT-2219') {
        items.push({
          date: dateLabel,
          auxCode: 'AUX-4: Training / Coaching',
          icon: '🎓',
          time: '09:00 AM - 09:45 AM',
          duration: '45 mins',
          status: 'Completed',
          statusClass: 'completed',
          category: 'other'
        });
      } else if (d === 12) {
        items.push({
          date: dateLabel,
          auxCode: 'AUX-3: Shift Meeting',
          icon: '👥',
          time: '09:00 AM - 09:30 AM',
          duration: '30 mins',
          status: 'Completed',
          statusClass: 'completed',
          category: 'other'
        });
      }
    }
  }

  AGENT_30DAY_CACHE[agentId] = items;
  return items;
}

function renderBreakHistory(agentId, filter) {
  const container = document.getElementById('break-history-list');
  const countBadge = document.getElementById('break-count-badge');
  const totalBreaksEl = document.getElementById('sum-total-breaks');
  const avgDurationEl = document.getElementById('sum-avg-duration');
  const complianceEl = document.getElementById('sum-compliance');
  if (!container) return;

  const currentAgent = agentId || (widgetAgentSelect ? widgetAgentSelect.value : (agentState?.id || 'AGT-8842'));
  const profile = AGENT_PROFILES[currentAgent] || AGENT_PROFILES['AGT-8842'];
  const allHistory = generate30DayBreakHistory(currentAgent);

  const activeFilter = filter || currentBreakFilter || 'all';
  currentBreakFilter = activeFilter;

  // Filter items
  const filtered = activeFilter === 'all' 
    ? allHistory 
    : allHistory.filter(item => item.category === activeFilter);

  // Update header summary numbers
  if (countBadge) {
    countBadge.textContent = allHistory.length + ' in 30 Days';
  }
  if (totalBreaksEl) {
    totalBreaksEl.textContent = allHistory.length + ' breaks';
  }
  if (complianceEl) {
    complianceEl.textContent = profile.adherence || '95.0%';
    complianceEl.style.color = parseFloat(profile.adherence) >= 90 ? '#10b981' : '#ef4444';
  }
  if (avgDurationEl) {
    avgDurationEl.textContent = '19m';
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:24px 10px; color:#94a3b8; font-size:11px;"><span style="font-size:24px; display:block; margin-bottom:6px;">☕</span>No breaks match the selected filter in the past 30 days.</div>';
    return;
  }

  container.innerHTML = filtered.map(item => {
    return '<div class="break-history-item">' +
      '<div class="break-history-left">' +
        '<div class="break-history-icon">' + (item.icon || '☕') + '</div>' +
        '<div class="break-history-meta">' +
          '<strong>' + item.auxCode + '</strong>' +
          '<span><span class="break-date-label">' + item.date + '</span>• ' + item.time + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="break-history-right">' +
        '<span class="break-duration-tag">' + item.duration + '</span>' +
        '<span class="break-status-badge ' + item.statusClass + '">' + item.status + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

// Bind filter buttons
function bindBreakFilters() {
  document.querySelectorAll('.break-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.break-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.getAttribute('data-filter');
      const currentAgent = widgetAgentSelect ? widgetAgentSelect.value : (agentState?.id || 'AGT-8842');
      renderBreakHistory(currentAgent, f);
    });
  });
}

function switchWidgetAgent(agentKey) {
  renderBreakHistory(agentKey);
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

  // Sync active agent to localStorage and parent window
  try {
    localStorage.setItem('activeAgentId', agentKey);
    if (window.self !== window.top && window.parent) {
      window.parent.postMessage({ type: 'AGENT_CHANGED', agentId: agentKey }, '*');
    }
  } catch (err) {}
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

// Initialize active agent from URL params or localStorage
try {
  const urlParams = new URLSearchParams(window.location.search);
  const requestedAgent = urlParams.get('agent') || localStorage.getItem('activeAgentId');
  if (requestedAgent && AGENT_PROFILES[requestedAgent] && widgetAgentSelect) {
    if (widgetAgentSelect.value !== requestedAgent) {
      widgetAgentSelect.value = requestedAgent;
      switchWidgetAgent(requestedAgent);
    }
  }
} catch (err) {}

// Listen for sync messages from parent window
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SYNC_AGENT' && e.data.agentId) {
    if (widgetAgentSelect && widgetAgentSelect.value !== e.data.agentId && AGENT_PROFILES[e.data.agentId]) {
      widgetAgentSelect.value = e.data.agentId;
      switchWidgetAgent(e.data.agentId);
    }
  }
});

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

if (btnQuickBreak) {
  btnQuickBreak.addEventListener('click', () => openBreakPortal());
}
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

function startPhoneRingtone(soundType = (agentAlertPrefs.soundStyle || 'phone_ring'), force = false) {
  stopPhoneRingtone();
  // STRICT DEVICE GUARD: If target device is Mobile Only, never ring laptop speakers unless forced
  if (!force && agentAlertPrefs.device === 'mobile') {
    return;
  }
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ringAudioContext = new AudioCtx();

    if (soundType === 'siren') {
      // Sweeping emergency floor siren (600Hz -> 1200Hz)
      ringOscillator = ringAudioContext.createOscillator();
      const gain = ringAudioContext.createGain();
      ringOscillator.type = 'sawtooth';
      gain.gain.setValueAtTime(0.2, ringAudioContext.currentTime);
      ringOscillator.connect(gain);
      gain.connect(ringAudioContext.destination);

      let freq = 600;
      let dir = 1;
      ringSirenInterval = setInterval(() => {
        freq += dir * 45;
        if (freq >= 1200) dir = -1;
        if (freq <= 550) dir = 1;
        if (ringOscillator && ringAudioContext) {
          ringOscillator.frequency.setValueAtTime(freq, ringAudioContext.currentTime);
        }
      }, 40);
      ringOscillator.start();
    } else {
      // Dual-tone realistic contact center phone ring (440Hz + 480Hz) with 1.4s ring, 1.6s pause
      const playPhoneCadence = () => {
        if (!ringAudioContext) return;
        try {
          const now = ringAudioContext.currentTime;
          const osc1 = ringAudioContext.createOscillator();
          const osc2 = ringAudioContext.createOscillator();
          const gain = ringAudioContext.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(440, now);
          osc2.frequency.setValueAtTime(480, now);

          gain.gain.setValueAtTime(0.22, now);
          gain.gain.setValueAtTime(0.22, now + 1.35);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.45);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ringAudioContext.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.45);
          osc2.stop(now + 1.45);
        } catch (e) {}
      };

      playPhoneCadence();
      ringLoopInterval = setInterval(playPhoneCadence, 3000);
    }
  } catch (e) {
    console.warn('Audio ringtone error:', e);
  }
}

function stopPhoneRingtone() {
  if (ringLoopInterval) {
    clearInterval(ringLoopInterval);
    ringLoopInterval = null;
  }
  if (ringSirenInterval) {
    clearInterval(ringSirenInterval);
    ringSirenInterval = null;
  }
  if (ringOscillator) {
    try {
      ringOscillator.stop();
      ringOscillator.disconnect();
    } catch (e) {}
    ringOscillator = null;
  }
  if (ringAudioContext) {
    try {
      ringAudioContext.close();
    } catch (e) {}
    ringAudioContext = null;
  }
}

// System Notification Helper
function showNotification(title, body) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  } catch (err) {}
}

// ==========================================
// 1. ACW & CALL WRAP-UP WORKFLOW (NICE CXONE)
// ==========================================

btnEndCallAcw.addEventListener('click', () => {
  enterAcwMode();
});

function enterAcwMode() {
  const acwTabBtn = document.querySelector('.tab-btn[data-tab="tab-acw"]');
  if (acwTabBtn) acwTabBtn.click();
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

// Generate Instant AI Call Summary for ACW (With Full Agent Edit Capability)
btnGenSummary.addEventListener('click', () => {
  const selectedDisp = cxoneDispositionSelect.value;
  summaryResult.classList.remove('hidden');

  const contentBlock = document.getElementById('summary-content-block');
  if (contentBlock) {
    contentBlock.innerHTML = `
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
  }

  const editNotes = document.getElementById('acw-edit-summary');
  if (editNotes && !editNotes.value.trim()) {
    editNotes.value = `Verified security PIN with customer Jordan Miller. Approved one-time promotional discount credit of $25 on Fiber Account. Customer satisfied, no further escalation needed.`;
  }

  playTone(659.25, 'sine', 0.15); // E5
});

// Quick note appending for agent
const btnAddQuickNote = document.getElementById('btn-add-quick-note');
if (btnAddQuickNote) {
  btnAddQuickNote.addEventListener('click', () => {
    const editNotes = document.getElementById('acw-edit-summary');
    if (editNotes) {
      editNotes.value += `\n[Agent Note ${new Date().toLocaleTimeString()}]: Customer requested SMS confirmation sent to +1-555-019-4821.`;
    }
  });
}

// Complete ACW & Return to Available
btnCompleteAcw.addEventListener('click', async () => {
  if (acwInterval) clearInterval(acwInterval);
  acwInterval = null;

  const editNotes = document.getElementById('acw-edit-summary');
  const agentCustomNotes = editNotes ? editNotes.value.trim() : '';

  const payload = {
    contactId: '90421',
    agentId: agentState.id,
    disposition: cxoneDispositionSelect.value,
    summaryNotes: agentCustomNotes || 'Standard billing adjustment applied and validated.',
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

  addSupervisorLog('ACW_COMPLETE', `ACW finalized with disposition "${payload.disposition}" & agent wrap notes saved.`);
  showNotification('ACW Complete', `Summary and wrap notes saved to CRM record #90421.`);
  playTone(523.25, 'sine', 0.2); // C5
});

// ==========================================
// 2. BREAK LIFECYCLE & COUNTDOWN
// ==========================================

function startBreak(breakData) {
  // Sync alert destination device and variance threshold from break submission
  const targetDev = breakData.alertDevice || breakData.device;
  if (targetDev) {
    agentAlertPrefs.device = targetDev;
  }
  if (typeof breakData.thresholdMins === 'number') {
    agentAlertPrefs.thresholdMins = breakData.thresholdMins;
  }
  try {
    localStorage.setItem('wfm_alert_prefs', JSON.stringify(agentAlertPrefs));
  } catch (e) {}
  if (typeof window.updateAlertUiLabels === 'function') {
    window.updateAlertUiLabels();
  }

  const durMins = parseInt(breakData.durationMinutes, 10) || 15;
  const now = Date.now();
  const totalMs = durMins * 60 * 1000;
  const expiresAt = breakData.expiresAt || (now + totalMs);
  const startedAt = breakData.approvedAt || (expiresAt - totalMs);

  agentState.status = 'AUX';
  agentState.activeBreak = {
    auxCode: breakData.auxCode || 'AUX-2: Short Break / AUX',
    durationMinutes: durMins,
    totalMs: totalMs,
    startedAt: startedAt,
    expiresAt: expiresAt
  };

  // Record in 30-day break history
  const agentKey = agentState.id || 'AGT-8842';
  const history = generate30DayBreakHistory(agentKey);
  if (history) {
    if (history[0] && history[0].status === 'In Progress') {
      const endTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const startTimeStr = history[0].time.split(' - ')[0];
      history[0].time = startTimeStr + ' - ' + endTime;
      history[0].status = 'Completed';
      history[0].statusClass = 'completed';
    }
    const startTime = new Date(startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    history.unshift({
      date: 'Today, Just Now',
      auxCode: agentState.activeBreak.auxCode,
      icon: getAuxIcon(agentState.activeBreak.auxCode),
      time: startTime + ' - (in progress)',
      duration: durMins + ' mins',
      status: 'In Progress',
      statusClass: 'in-progress',
      category: getAuxCategory(agentState.activeBreak.auxCode)
    });
    renderBreakHistory(agentKey);
  }
  twoMinuteWarningTriggered = false;
  botCallTriggered = false;

  agentStatusDot.className = 'status-indicator aux';
  agentStateLabel.className = 'state-label aux-mode';
  agentStateLabel.textContent = 'NICE CXone: ' + agentState.activeBreak.auxCode;

  activeAuxLabel.textContent = agentState.activeBreak.auxCode;
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

  const thresholdMins = agentAlertPrefs.thresholdMins !== undefined ? agentAlertPrefs.thresholdMins : 2;
  const thresholdMs = thresholdMins * 60 * 1000;
  const overdueMs = now - agentState.activeBreak.expiresAt;

  if (!isOverdue) {
    breakTimeLeft.textContent = formatted;
    breakTimeLeft.classList.remove('overdue');
    breakTimeLeft.classList.remove('grace');
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
    // BREAK EXCEEDED
    twoMinAlert.classList.add('hidden');
    breakProgressBar.style.width = '100%';

    if (overdueMs < thresholdMs) {
      // IN GRACE BUFFER PERIOD (OVERDUE BUT WITHIN VARIANCE THRESHOLD)
      agentState.status = 'OVERDUE_GRACE';
      agentStatusDot.className = 'status-indicator warning';
      agentStateLabel.className = 'state-label warning-mode';
      agentStateLabel.textContent = `GRACE BUFFER (+${formatted} / +0${thresholdMins}:00)`;

      breakTimeLeft.textContent = `+${formatted}`;
      breakTimeLeft.className = 'countdown-digits grace';
      breakProgressBar.style.background = '#f59e0b';
    } else {
      // THRESHOLD IS EXCEEDED!
      agentState.status = 'OVERDUE';
      agentStatusDot.className = 'status-indicator overdue';
      agentStateLabel.className = 'state-label overdue-mode';
      const targetDevice = agentAlertPrefs.device || 'both';
      if (targetDevice === 'mobile') {
        agentStateLabel.textContent = `🚨 OVERDUE (+${formatted}) • Alert Routed to Mobile`;
      } else {
        agentStateLabel.textContent = `🚨 THRESHOLD EXCEEDED (+${formatted})`;
      }

      breakTimeLeft.textContent = `+${formatted}`;
      breakTimeLeft.className = 'countdown-digits overdue';
      breakProgressBar.style.background = '#ef4444';

      if (!botCallTriggered) {
        botCallTriggered = true;

        const targetDevice = agentAlertPrefs.device || 'both';

        // 1. Alert on Laptop if laptop or both
        if (targetDevice === 'laptop' || targetDevice === 'both') {
          triggerBotCallModal(minutes, seconds);
        }

        // 2. Alert on Mobile if mobile or both
        if (targetDevice === 'mobile' || targetDevice === 'both') {
          dispatchMobileThresholdAlarm(minutes, seconds);
        }

        addSupervisorLog('THRESHOLD_ALARM', `Threshold (+${thresholdMins}m) exceeded! Dispatched calling alarm to [${targetDevice.toUpperCase()}].`);
      }
    }
  }
}

async function dispatchMobileThresholdAlarm(overMins = 1, overSecs = 0) {
  const alarmPayload = {
    agentId: agentState.id || 'AGT-8842',
    agentName: agentState.name || 'Alex Morgan',
    auxCode: agentState.activeBreak ? agentState.activeBreak.auxCode : 'AUX-2: Short Break / AUX',
    durationMinutes: agentState.activeBreak ? agentState.activeBreak.durationMinutes : 15,
    thresholdMins: agentAlertPrefs.thresholdMins !== undefined ? agentAlertPrefs.thresholdMins : 2,
    overdueMins: overMins,
    overdueSecs: overSecs,
    device: agentAlertPrefs.device || 'both',
    soundStyle: agentAlertPrefs.soundStyle || 'phone_ring',
    mobilePhone: agentAlertPrefs.mobilePhone || '+1 (555) 019-8842'
  };

  try {
    await fetch('/api/alerts/trigger-alarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alarmPayload)
    });
  } catch (err) {
    console.warn('Failed to dispatch mobile alarm:', err);
  }

  // Cross-tab broadcast
  try {
    const bc = new BroadcastChannel('wfm_aux_channel');
    bc.postMessage({
      type: 'TRIGGER_ALARM',
      payload: alarmPayload
    });
  } catch (e) {}
}

let lastBotCallTriggerTime = 0;
function triggerBotCallModal(overMins = 1, overSecs = 0, customMsg = '', force = false) {
  // Debounce duplicate triggers within 1.2s to prevent double modal/audio queue
  const nowTs = Date.now();
  if (nowTs - lastBotCallTriggerTime < 1200 && botCallTriggered) {
    return;
  }
  lastBotCallTriggerTime = nowTs;

  // STRICT DEVICE GUARD: If target device is Mobile Only, never show modal or ring on laptop unless forced
  if (!force && agentAlertPrefs.device === 'mobile') {
    console.log('[Widget] Alert routed to Mobile Only. Suppressing laptop modal.');
    return;
  }
  botCallTriggered = true;
  const overlay = document.getElementById('bot-call-overlay');
  const speechTextEl = document.getElementById('bot-call-speech-text');

  const speechMessage = customMsg || `Attention Agent ${agentState.name}: Your scheduled auxiliary break duration has ended and is now exceeding adherence threshold limits by ${overMins || 1} minute. You are required to immediately return to your workstation and switch to available status. Your supervisor has been notified.`;
  if (speechTextEl) speechTextEl.textContent = `"${speechMessage}"`;

  if (overlay) overlay.classList.remove('hidden');
  startPhoneRingtone(agentAlertPrefs.soundStyle || 'phone_ring', force);
  addSupervisorLog('OVERDUE_CALL', `Automated bot voice call placed to agent for adherence violation.`);

  // Cancel any pending speech synthesis timeouts cleanly
  if (window._botSpeechTimeout) {
    clearTimeout(window._botSpeechTimeout);
    window._botSpeechTimeout = null;
  }

  if ('speechSynthesis' in window && agentAlertPrefs.soundStyle !== 'siren') {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    window._botSpeechTimeout = setTimeout(() => {
      try {
        stopPhoneRingtone();
        const utterance = new SpeechSynthesisUtterance(speechMessage);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onerror = (err) => console.warn('[Widget] Speech error:', err);
        utterance.onend = () => {};
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[Widget] Speech speak failed:', err);
      }
    }, 1800);
  }
}

document.getElementById('btn-accept-bot-call')?.addEventListener('click', () => {
  endBreakEarly(false);
  addSupervisorLog('RESUMED', 'Agent acknowledged bot call and resumed AVAILABLE state in NICE CXone.');
});

document.getElementById('btn-close-bot-call')?.addEventListener('click', () => {
  stopPhoneRingtone();
  if (window._botSpeechTimeout) {
    clearTimeout(window._botSpeechTimeout);
    window._botSpeechTimeout = null;
  }
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }
  const botOverlay = document.getElementById('bot-call-overlay');
  if (botOverlay) botOverlay.classList.add('hidden');
});

btnEndBreak.addEventListener('click', () => {
  endBreakEarly(false);
});

function endBreakEarly(fromRemote = false) {
  try {
    stopPhoneRingtone();
    if (window._botSpeechTimeout) {
      clearTimeout(window._botSpeechTimeout);
      window._botSpeechTimeout = null;
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    // Hide any modal overlays completely so screen is NEVER stuck
    const botOverlay = document.getElementById('bot-call-overlay');
    if (botOverlay) botOverlay.classList.add('hidden');

    const alertModal = document.getElementById('alert-settings-modal');
    if (alertModal) alertModal.classList.add('hidden');

    // Reset countdown and violation flags
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = null;
    botCallTriggered = false;
    twoMinuteWarningTriggered = false;

    agentState.status = 'READY';
    agentState.activeBreak = null;
    try { localStorage.removeItem('wfm_active_break'); } catch (e) {}

    // Reset UI indicators
    if (agentStatusDot) agentStatusDot.className = 'status-indicator ready';
    if (agentStateLabel) {
      agentStateLabel.className = 'state-label';
      agentStateLabel.textContent = 'NICE CXone: AVAILABLE';
    }

    if (breakActiveCard) breakActiveCard.classList.add('hidden');
    if (twoMinAlert) twoMinAlert.classList.add('hidden');

    if (breakProgressBar) {
      breakProgressBar.style.width = '0%';
      breakProgressBar.style.background = '#6366f1';
    }
    if (breakTimeLeft) {
      breakTimeLeft.className = 'countdown-digits';
      breakTimeLeft.textContent = '--:--';
    }

    // Complete 30-day break history record
    const agentKey = agentState.id || 'AGT-8842';
    try {
      const history = generate30DayBreakHistory(agentKey);
      if (history && history[0] && history[0].status === 'In Progress') {
        const endTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const startTimeStr = history[0].time.split(' - ')[0];
        history[0].time = startTimeStr + ' - ' + endTime;
        history[0].status = 'Completed';
        history[0].statusClass = 'completed';
        renderBreakHistory(agentKey);
      }
    } catch (err) {}

    try { playTone(440, 'sine', 0.15); } catch (e) {}

    // If triggered from remote SSE or BroadcastChannel, DO NOT RE-BROADCAST to avoid infinite ping-pong loop!
    if (fromRemote) return;

    // Broadcast break ended to mobile companion and sync server
    try {
      fetch('/api/alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentState.id || 'AGT-8842',
          acknowledgedBy: 'AGENT_LAPTOP',
          deviceSource: 'LAPTOP_WORKSTATION'
        })
      }).catch(() => {});
    } catch (e) {}

    try {
      const bc = new BroadcastChannel('wfm_aux_channel');
      bc.postMessage({
        type: 'ALARM_ACKNOWLEDGED',
        payload: { agentId: agentState.id || 'AGT-8842', from: 'laptop' }
      });
      bc.postMessage({
        type: 'BREAK_ENDED',
        payload: { agentId: agentState.id || 'AGT-8842' }
      });
    } catch (e) {}
  } catch (err) {
    console.error('[Widget] Error in endBreakEarly:', err);
  }
}

function silenceLaptopAlarm() {
  try {
    stopPhoneRingtone();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    const botOverlay = document.getElementById('bot-call-overlay');
    if (botOverlay) botOverlay.classList.add('hidden');
    botCallTriggered = true; // prevent immediate re-trigger
    if (agentStateLabel) {
      agentStateLabel.textContent = '🚨 OVERDUE • Ringtone Silenced';
    }
    addSupervisorLog('SILENCED', 'Ringtone & alarm silenced via Mobile Companion.');
  } catch (err) {}
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

// ==========================================
// DYNAMIC AI SUGGESTED REPLIES ENGINE
// ==========================================

const AI_REPLY_TOPICS = {
  billing: [
    {
      tag: 'Empathy + Credit Approval',
      text: 'I apologize for the confusion regarding the $25 monthly surcharge. I have reviewed your billing record and applied a one-time adjustment credit to your balance today.'
    },
    {
      tag: 'Auto-Pay Enrollment Link',
      text: 'I have verified your account security PIN. Let me guide you to our self-service billing management portal to update your auto-pay method and receive the $5 paperless discount.'
    }
  ],
  security: [
    {
      tag: 'PIN Verification Required',
      text: 'To protect your account security, I have dispatched a one-time 6-digit verification code to the phone number on file. Please read that back to me when received.'
    },
    {
      tag: 'Identity Confirmed',
      text: 'Thank you for confirming your security credentials. Your account is verified and I can now assist with any service modifications.'
    }
  ],
  outage: [
    {
      tag: 'Storm / Outage Guidance',
      text: 'Our dispatch center confirms that regional utility field technicians are actively working to restore service in your sector. Real-time restoration status is available via SMS updates.'
    },
    {
      tag: 'Emergency Gas Safety',
      text: 'If you smell natural gas or suspect a line leak: please evacuate the premises immediately, avoid using electrical switches, and call emergency services from outside.'
    }
  ],
  empathy: [
    {
      tag: 'De-escalation & Ownership',
      text: 'I completely understand your frustration with this service delay, and I appreciate your patience. I am taking direct personal ownership of this inquiry until resolved.'
    },
    {
      tag: 'Closing & Confirmation',
      text: 'Thank you for your time today. All changes have been logged in your account history, and a detailed confirmation email has been dispatched.'
    }
  ]
};

function renderSuggestedReplies(topic) {
  const container = document.getElementById('ai-suggestions');
  if (!container) return;
  const items = AI_REPLY_TOPICS[topic] || AI_REPLY_TOPICS.billing;
  
  let html = '';
  items.forEach(item => {
    html += `
      <div class="suggestion-item" data-text="${item.text}">
        <span class="suggestion-tag">${item.tag}</span>
        <p>"${item.text}"</p>
        <div style="display:flex; gap:6px; margin-top:6px;">
          <button class="btn-copy">Copy</button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
  bindSuggestionButtons();
}

function bindSuggestionButtons() {
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parent = e.target.closest('.suggestion-item');
      const text = parent.getAttribute('data-text');
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1500);
      });
    });
  });
}

document.querySelectorAll('.reply-filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.reply-filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const topic = chip.getAttribute('data-topic');
    renderSuggestedReplies(topic);
  });
});

const btnRefreshReplies = document.getElementById('btn-refresh-replies');
if (btnRefreshReplies) {
  btnRefreshReplies.addEventListener('click', () => {
    const activeChip = document.querySelector('.reply-filter-chip.active');
    const topic = activeChip ? activeChip.getAttribute('data-topic') : 'billing';
    renderSuggestedReplies(topic);
    playTone(550, 'sine', 0.1);
  });
}

bindSuggestionButtons();

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

  const currentAgentId = (widgetAgentSelect && widgetAgentSelect.value) ? widgetAgentSelect.value : (agentState?.id || 'AGT-8842');

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
  } else if (qLower.includes('adherence') || qLower.includes('aux break') || qLower.includes('my break') || qLower.includes('lunch') || qLower.includes('quota')) {
    response = `⏱️ <strong>Live Schedule Adherence for ${profile.name}:</strong><br/>` +
      `• <strong>CXone Adherence</strong>: <strong>${profile.adherence}</strong> (Target: &ge; 90%)<br/>` +
      `• <strong>AUX Breaks Taken Today</strong>: <strong>${profile.teaBreaks}</strong> (Policy: Max 2)<br/>` +
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
    response = `🤖 <strong>Live NICE CXone (Ask Shankar) Telemetry Briefing:</strong><br/>` +
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
      openArticleDetail(item);
    });
    container.appendChild(card);
  });
}

function openArticleDetail(item) {
  const detailView = document.getElementById('article-detail-view');
  if (!detailView) return;
  
  const catEl = document.getElementById('article-detail-cat');
  const titleEl = document.getElementById('article-detail-title');
  const descEl = document.getElementById('article-detail-desc');
  const stepsEl = document.getElementById('article-detail-steps');

  if (catEl) catEl.textContent = item.cat.toUpperCase();
  if (titleEl) titleEl.textContent = item.title;
  if (descEl) descEl.textContent = item.desc;

  let steps = '';
  if (item.cat === 'cxone') {
    steps = '1. Open Chrome/Edge site settings for NICE CXone. 2. Verify microphone is allowed. 3. Click "Ping CXone Cluster" below to verify WebSockets latency < 45ms.';
  } else if (item.cat === 'vpn') {
    steps = '1. Open Cisco AnyConnect / VPN client. 2. Verify Wi-Fi MTU is clamped to 1350 bytes. 3. Click "Flush DNS & Reset Route" below to clear stale route tables.';
  } else if (item.cat === 'vdi') {
    steps = '1. Press Ctrl+F2 to release keyboard hook. 2. Restart Citrix Workspace from system tray. 3. Click "Ping CXone Cluster" to confirm host reachability.';
  } else {
    steps = '1. Open Windows Sound Control Panel. 2. Uncheck "Exclusive Mode" on default headset. 3. Click "Reset Headset Driver" below.';
  }
  if (stepsEl) stepsEl.textContent = steps;

  detailView.classList.remove('hidden');
  detailView.style.display = 'block';
  detailView.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

const btnCloseArticle = document.getElementById('btn-close-article');
if (btnCloseArticle) {
  btnCloseArticle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const detailView = document.getElementById('article-detail-view');
    if (detailView) {
      detailView.classList.add('hidden');
      detailView.style.display = 'none';
    }
  });
}

const btnArticleRunDiag = document.getElementById('btn-article-run-diag');
if (btnArticleRunDiag) {
  btnArticleRunDiag.addEventListener('click', () => {
    const pingBtn = document.getElementById('btn-ping-cxone');
    if (pingBtn) pingBtn.click();
    showNotification('Diagnostic Executed', 'Network and softphone socket telemetry validated.');
  });
}

const btnArticleCopy = document.getElementById('btn-article-copy');
if (btnArticleCopy) {
  btnArticleCopy.addEventListener('click', () => {
    const title = document.getElementById('article-detail-title')?.textContent || '';
    const steps = document.getElementById('article-detail-steps')?.textContent || '';
    navigator.clipboard.writeText(`Resolution Guide: ${title}\n${steps}`).then(() => {
      btnArticleCopy.textContent = '✓ Copied!';
      setTimeout(() => btnArticleCopy.textContent = '📋 Copy Steps', 1500);
    });
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

// ==========================================
// 5. SHIFT ADHERENCE POLICY REAL-TIME SYNC
// ==========================================

function applyPolicyUpdate(policy) {
  if (!policy) return;

  const teaLimit = policy.maxTeaBreaks || 2;
  const lunchLimit = policy.lunchVarianceThreshold || 10;
  const targetAdh = policy.targetAdherence || 90;
  const freqWindow = policy.frequencyWindow === '2_WEEKS' ? '2-Wks' : '1-Wk';
  const freqLimit = policy.maxFrequencyRequests || 5;

  // Update Tab 4 Policy Summary
  const teaEl = document.getElementById('agent-policy-tea');
  const lunchEl = document.getElementById('agent-policy-lunch');
  const freqEl = document.getElementById('agent-policy-freq');
  const adhEl = document.getElementById('agent-policy-adh');

  if (teaEl) teaEl.textContent = `${teaLimit} breaks / shift`;
  if (lunchEl) lunchEl.textContent = `Max +${lunchLimit} mins`;
  if (freqEl) freqEl.textContent = `Max ${freqLimit} requests / ${freqWindow}`;
  if (adhEl) adhEl.textContent = `≥ ${targetAdh}.0%`;

  // Update Tab 2 Metric Cards
  const lblTeaSub = document.getElementById('lbl-tea-sub');
  const lblLunchSub = document.getElementById('lbl-lunch-sub');
  const lblAdhSub = document.getElementById('lbl-adh-sub');
  const lblFreqSub = document.getElementById('lbl-freq-sub');
  const lblFreqTitle = document.getElementById('lbl-freq-title');

  if (lblTeaSub) lblTeaSub.textContent = `Policy Limit: Max ${teaLimit}`;
  if (lblLunchSub) lblLunchSub.textContent = `Threshold: <${lunchLimit}m`;
  if (lblAdhSub) lblAdhSub.textContent = `Target: ≥ ${targetAdh}%`;
  if (lblFreqSub) lblFreqSub.textContent = `Threshold: ${freqLimit} / ${freqWindow}`;
  if (lblFreqTitle) lblFreqTitle.textContent = `Request Frequency (${freqWindow})`;

  // Save to local storage
  localStorage.setItem('wfm_policy_limits', JSON.stringify(policy));
}

// Initial Policy Fetch on Widget Startup
fetch('/api/policy')
  .then(r => r.json())
  .then(p => applyPolicyUpdate(p))
  .catch(() => {
    const cached = localStorage.getItem('wfm_policy_limits');
    if (cached) {
      try {
        applyPolicyUpdate(JSON.parse(cached));
      } catch (e) {}
    }
  });

// Initialize Break History on Startup
renderBreakHistory("AGT-8842");

bindBreakFilters();

// Restore active break if still ongoing
try {
  const savedBreak = localStorage.getItem('wfm_active_break');
  if (savedBreak) {
    const parsed = JSON.parse(savedBreak);
    if (parsed && parsed.expiresAt && parsed.expiresAt > Date.now()) {
      startBreak(parsed);
    } else {
      localStorage.removeItem('wfm_active_break');
    }
  }
} catch (e) {
  console.warn('Error restoring active break:', e);
}


// ========================================================
// BREAK THRESHOLD CALLING & DEVICE SETTINGS CONTROLLER
// ========================================================
function initAlertSettingsModal() {
  const modal = document.getElementById('alert-settings-modal');
  const btnHeader = document.getElementById('btn-header-alert-settings');
  const btnCard = document.getElementById('btn-open-alert-settings');
  const btnPairMobile = document.getElementById('btn-pair-mobile-modal');
  const btnClose = document.getElementById('btn-close-alert-modal');
  const btnSave = document.getElementById('btn-save-alert-settings');
  const btnTest = document.getElementById('btn-test-alert-sound');

  const devLabel = document.getElementById('widget-alert-device-label');
  const threshLabel = document.getElementById('widget-alert-thresh-label');
  const pillLabel = document.getElementById('header-alert-pill');
  const compLink = document.getElementById('mobile-companion-link');

  // Load from LocalStorage if present
  try {
    const raw = localStorage.getItem('wfm_alert_prefs');
    if (raw) {
      agentAlertPrefs = { ...agentAlertPrefs, ...JSON.parse(raw) };
    }
  } catch (e) {}

  function updateUiLabels() {
    window.updateAlertUiLabels = updateUiLabels;
    const devText = agentAlertPrefs.device === 'both' ? 'Both' : (agentAlertPrefs.device === 'mobile' ? 'Mobile' : 'Laptop');
    if (devLabel) devLabel.textContent = agentAlertPrefs.device === 'both' ? '💻+📱 Both' : (agentAlertPrefs.device === 'mobile' ? '📱 Mobile' : '💻 Laptop');
    if (threshLabel) threshLabel.textContent = `+${agentAlertPrefs.thresholdMins}m`;
    if (pillLabel) pillLabel.textContent = `+${agentAlertPrefs.thresholdMins}m`;
    if (btnHeader) btnHeader.title = `Break Alert Threshold Settings (+${agentAlertPrefs.thresholdMins}m, ${devText})`;

    // Update active classes in modal
    document.querySelectorAll('.dev-choice-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.device === agentAlertPrefs.device);
    });
    document.querySelectorAll('.thresh-choice-btn').forEach(b => {
      b.classList.toggle('selected', parseInt(b.dataset.threshold, 10) === agentAlertPrefs.thresholdMins);
    });
    document.querySelectorAll('.sound-choice-btn').forEach(b => {
      b.classList.toggle('selected', b.dataset.sound === agentAlertPrefs.soundStyle);
    });

    const qrContainer = document.getElementById('qr-code-container');
    fetch('/api/server-info')
      .then(r => r.json())
      .then(sInfo => {
        const targetHost = sInfo.localIp ? `${sInfo.localIp}:${sInfo.port || 4000}` : (window.location.host || 'localhost:4000');
        const mobileUrl = `http://${targetHost}/mobile-alert.html?agentId=${agentState.id || 'AGT-8842'}`;
        if (compLink) {
          compLink.href = mobileUrl;
          compLink.textContent = `Open Mobile Companion (${mobileUrl}) ↗`;
        }
        if (qrContainer) {
          qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mobileUrl)}" alt="Scan QR" style="width:68px; height:68px; border-radius:4px; object-fit:contain;" />`;
        }
      })
      .catch(() => {
        const host = window.location.host || 'localhost:4000';
        const url = `http://${host}/mobile-alert.html?agentId=${agentState.id || 'AGT-8842'}`;
        if (compLink) {
          compLink.href = url;
          compLink.textContent = `Open Mobile Companion (${url}) ↗`;
        }
      });
  }

  // Fetch from server
  fetch(`/api/alerts/preferences?agentId=${agentState.id || 'AGT-8842'}`)
    .then(r => r.json())
    .then(data => {
      if (data.success && data.preferences) {
        agentAlertPrefs = { ...agentAlertPrefs, ...data.preferences };
        updateUiLabels();
      }
    })
    .catch(() => updateUiLabels());

  // Open / Close Modal
  const openModal = () => {
    updateUiLabels();
    if (modal) modal.classList.remove('hidden');
  };
  const closeModal = () => {
    if (modal) modal.classList.add('hidden');
  };

  btnHeader?.addEventListener('click', openModal);
  btnCard?.addEventListener('click', openModal);
  btnPairMobile?.addEventListener('click', openModal);
  btnClose?.addEventListener('click', closeModal);

  // Device selection clicks
  document.querySelectorAll('.dev-choice-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.dev-choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      agentAlertPrefs.device = card.dataset.device;
    });
  });

  // Threshold selection clicks
  document.querySelectorAll('.thresh-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.thresh-choice-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      agentAlertPrefs.thresholdMins = parseInt(btn.dataset.threshold, 10);
    });
  });

  // Sound style selection clicks
  document.querySelectorAll('.sound-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sound-choice-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      agentAlertPrefs.soundStyle = btn.dataset.sound;
    });
  });

  // Test Alarm Button
  btnTest?.addEventListener('click', () => {
    startPhoneRingtone(agentAlertPrefs.soundStyle || 'phone_ring');
    // Also dispatch test ring to mobile companion
    dispatchMobileThresholdAlarm(agentAlertPrefs.thresholdMins, 30);
    setTimeout(() => {
      stopPhoneRingtone();
    }, 5000);
  });

  // Save Settings Button
  btnSave?.addEventListener('click', () => {
    localStorage.setItem('wfm_alert_prefs', JSON.stringify(agentAlertPrefs));
    updateUiLabels();

    // Send to backend
    fetch('/api/alerts/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: agentState.id || 'AGT-8842',
        device: agentAlertPrefs.device,
        thresholdMins: agentAlertPrefs.thresholdMins,
        soundStyle: agentAlertPrefs.soundStyle
      })
    }).catch(e => console.warn('Alert save failed:', e));

    closeModal();
    showNotification('Alert Settings Saved', `Device: ${agentAlertPrefs.device.toUpperCase()}, Threshold: +${agentAlertPrefs.thresholdMins}m, Sound: ${agentAlertPrefs.soundStyle}.`);
  });

  updateUiLabels();
}

// Initialize on load
initAlertSettingsModal();


// Real-time SSE listener for Agent Widget
function initWidgetAlertSSE() {
  try {
    const es = new EventSource('/api/alerts/stream');
    es.addEventListener('PREFERENCES_UPDATED', (e) => {
      try {
        const p = JSON.parse(e.data);
        if (!p.agentId || p.agentId === agentState.id) {
          agentAlertPrefs = { ...agentAlertPrefs, ...p };
          try { localStorage.setItem('wfm_alert_prefs', JSON.stringify(agentAlertPrefs)); } catch (err) {}
          if (typeof window.updateAlertUiLabels === 'function') {
            window.updateAlertUiLabels();
          }
        }
      } catch (err) {}
    });
    es.addEventListener('ALARM_TRIGGERED', (e) => {
      try {
        const a = JSON.parse(e.data);
        const isSupervisor = a && (
          a.triggeredBy === 'SUPERVISOR_WALLBOARD' ||
          a.triggeredBy === 'SUPERVISOR_RECALL' ||
          a.force === true
        );
        if (!a.agentId || a.agentId === agentState.id || isSupervisor) {
          const dev = a.device || agentAlertPrefs.device || 'both';
          if (dev === 'laptop' || dev === 'both') {
            triggerBotCallModal(a.overdueMins || 1, a.overdueSecs || 0, a.message, isSupervisor);
          }
        }
      } catch (err) {}
    });
    es.addEventListener('ALARM_ACKNOWLEDGED', (e) => {
      try {
        const ack = JSON.parse(e.data);
        if (!ack.agentId || ack.agentId === agentState.id) {
          endBreakEarly(true);
        }
      } catch (err) {}
    });
    es.addEventListener('ALARM_SILENCED', (e) => {
      try {
        const sil = JSON.parse(e.data);
        if (!sil.agentId || sil.agentId === agentState.id) {
          silenceLaptopAlarm();
        }
      } catch (err) {}
    });
  } catch (e) {
    console.warn('SSE not supported on desktop widget:', e);
  }
}
initWidgetAlertSSE();

// Storage listener for cross-tab preference sync
window.addEventListener('storage', (e) => {
  if (e.key === 'wfm_alert_prefs' && e.newValue) {
    try {
      agentAlertPrefs = { ...agentAlertPrefs, ...JSON.parse(e.newValue) };
      if (typeof window.updateAlertUiLabels === 'function') {
        window.updateAlertUiLabels();
      }
    } catch (err) {}
  }
});
