// widget.js - Desktop Chatbot Widget Logic

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
    avatar: '🧑‍💻'
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
    avatar: '👨‍💼'
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
    avatar: '👩‍💼'
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
    avatar: '👨‍💻'
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
    avatar: '👩‍🔬'
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
    avatar: '🧑‍🎓'
  }
};

// State
let agentState = {
  id: 'AGT-8842',
  name: 'Alex Morgan',
  status: 'READY', // 'READY', 'IN_CALL', 'AUX', 'OVERDUE'
  teaBreaksToday: 1,
  lunchOverageMinutes: 0,
  adherenceScore: 96.4,
  requestsCount30m: 1,
  activeBreak: null, // { auxCode, durationMinutes, startTime, expiresAt }
  isHighVolumeMode: false,
};

let countdownInterval = null;
let twoMinuteWarningTriggered = false;
let botCallTriggered = false;
let ringAudioContext = null;
let ringOscillator = null;

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

// Broadcast Channel to sync with Web Portal
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
      triggerBotCallModal(1, 0);
      addSupervisorLog('RECALL', `Supervisor Sarah Jenkins dispatched a bot voice recall to workstation.`);
    } else if (data.type === 'BROADCAST_ALERT') {
      broadcastTicker.classList.remove('hidden');
      broadcastMessage.textContent = `${data.payload.title}: ${data.payload.message}`;
      playWarningChime();
      showNotification(data.payload.title, data.payload.message);
      addSupervisorLog('BROADCAST', `Supervisor broadcast received: ${data.payload.title}`);
      if (data.payload.alertType === 'MONDAY_TRAFFIC') {
        highTrafficBanner.classList.remove('hidden');
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

function switchWidgetAgent(agentKey) {
  const profile = AGENT_PROFILES[agentKey] || AGENT_PROFILES['AGT-8842'];
  agentState.id = profile.id;
  agentState.name = profile.name;
  
  if (agentAvatarIcon) agentAvatarIcon.textContent = profile.avatar;
  
  // Update Tab 2 behavioral metrics
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

  addSupervisorLog('AGENT_SWITCH', `Active persona switched to ${profile.name} (${profile.id}).`);
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

// Sound Synthesizer (Chimes & Phone Ringtone using Web Audio API)
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
  } catch (err) {
    console.warn(err);
  }
}

function playWarningChime() {
  playTone(587.33, 'triangle', 0.2); // D5
  setTimeout(() => playTone(880, 'triangle', 0.4), 220); // A5
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

// Break Lifecycle & Countdown
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
  agentStateLabel.textContent = `AUX: ${breakData.auxCode}`;

  activeAuxLabel.textContent = breakData.auxCode;
  breakActiveCard.classList.remove('hidden');
  twoMinAlert.classList.add('hidden');
  breakTimeLeft.classList.remove('overdue');

  playTone(523.25, 'sine', 0.3); // High C

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
      showNotification('2-Minute Break Warning', 'Your AUX break ends in 2 minutes. Please wrap up and prepare to resume ready state.');
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

    // BOT CALL TRIGGER ON EXCEEDING
    if (!botCallTriggered && minutes >= 0 && seconds >= 3) {
      triggerBotCallModal(minutes, seconds);
    }
  }
}

// Trigger Interactive Incoming Bot Call
function triggerBotCallModal(overMins = 1, overSecs = 0) {
  botCallTriggered = true;
  const overlay = document.getElementById('bot-call-overlay');
  const speechTextEl = document.getElementById('bot-call-speech-text');

  const speechMessage = `Attention Agent Alex Morgan: Your scheduled auxiliary break duration has ended and is now exceeding adherence limits by ${overMins || 1} minute. You are required to immediately return to your workstation and switch to ready status. Your supervisor has been notified.`;
  speechTextEl.textContent = `"${speechMessage}"`;

  overlay.classList.remove('hidden');
  startPhoneRingtone();
  addSupervisorLog('OVERDUE_CALL', `Automated bot voice call placed to agent for adherence violation (+${overMins}m).`);

  // Spoken Text-to-Speech using Web Speech API
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

// Accept Bot Call & Return to Workstation
document.getElementById('btn-accept-bot-call').addEventListener('click', () => {
  stopPhoneRingtone();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  document.getElementById('bot-call-overlay').classList.add('hidden');
  endBreakEarly();
  addSupervisorLog('RESUMED', 'Agent acknowledged bot call and resumed workstation READY state.');
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
  agentStateLabel.textContent = 'READY (Inbound Queue)';

  breakActiveCard.classList.add('hidden');
  twoMinAlert.classList.add('hidden');
  playTone(440, 'sine', 0.2);
}

// Supervisor Audit Log Updater
function addSupervisorLog(tag, message) {
  const list = document.getElementById('supervisor-log-list');
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

// Suggested Replies & Copy to clipboard
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

function handleUserChat() {
  const query = chatInput.value.trim();
  if (!query) return;
  addChatMessage('user', query);
  chatInput.value = '';

  // AI Response generator
  setTimeout(() => {
    let response = "I've analyzed your question against current WFM telemetry and operations guidelines. All systems are operating normally.";
    const qLower = query.toLowerCase();

    if (qLower.includes('break') || qLower.includes('aux')) {
      response = "To apply for an auxiliary break (Lunch, Tea, Meeting, etc.), click the 'Apply Break' button above or switch to the AUX Breaks tab. Your request will be evaluated against real-time ACD queue depth and your adherence history.";
    } else if (qLower.includes('vpn') || qLower.includes('network') || qLower.includes('disconnect')) {
      response = "VPN trouble detected. I recommend running the 'Flush DNS & Reset Route' tool under the Articles tab. If Cisco AnyConnect error 412 persists, disconnect Wi-Fi for 5 seconds and reconnect to corporate gateway gw-east.contactcenter.com.";
    } else if (qLower.includes('traffic') || qLower.includes('volume') || qLower.includes('queue')) {
      response = "Current ACD queue has 18 calls waiting with 24 active agents. Service level is at 85.2%. Peak load mode is standing by.";
    } else if (qLower.includes('summary')) {
      response = "You can click 'Generate Instant Call Summary (ACW)' below to automatically produce structured CRM notes for your current call.";
    }
    addChatMessage('ai', response);
  }, 600);
}

// Generate Instant Call Summary (ACW)
document.getElementById('btn-gen-summary').addEventListener('click', () => {
  const summaryBox = document.getElementById('summary-result');
  summaryBox.classList.remove('hidden');
  summaryBox.innerHTML = `
    <strong>Generated AI Call Summary (CRM Ready):</strong><br>
    • <strong>Customer:</strong> Jordan Miller (#4092 - Business Tier)<br>
    • <strong>Inquiry:</strong> Discrepancy on August recurring fiber invoice ($25 surcharge).<br>
    • <strong>Action Taken:</strong> Verified billing ledger; confirmed accidental promotional discount drop; processed one-time credit adjustment of $25.<br>
    • <strong>Disposition Code:</strong> BILLING_CREDIT_APPLIED (Resolution: First Contact Complete)<br>
    • <strong>Customer Sentiment:</strong> Positive / De-escalated<br>
    • <strong>Follow-up:</strong> None required (Ticket #TKT-9921 closed).
  `;
});

// Articles & Knowledge Base Data
const articlesData = [
  {
    id: 1,
    cat: 'vpn',
    title: 'VPN Error 412 / Cisco AnyConnect Disconnected',
    desc: 'Occurs when local gateway MTU mismatch drops TLS heartbeat. Run route flush or toggle corporate split-tunnel adapter.',
    tags: ['vpn', 'network', 'cisco']
  },
  {
    id: 2,
    cat: 'vpn',
    title: 'GlobalProtect / Pulse Secure Gateway 502 Bad Gateway',
    desc: 'Failover procedure to secondary authentication node (gw-backup.contactcenter.com) during regional ISP disruptions.',
    tags: ['vpn', 'gateway', 'pulse']
  },
  {
    id: 3,
    cat: 'vdi',
    title: 'Citrix Workspace Black Screen on Session Reconnect',
    desc: 'Display driver handshake freeze. Press Ctrl+F2 to release keyboard hook, or kill receiver.exe and restart session.',
    tags: ['vdi', 'citrix', 'screen']
  },
  {
    id: 4,
    cat: 'voip',
    title: 'Softphone Audio Distortion & SIP Error 408 / 403',
    desc: 'Audio buffer jitter on Windows 11. Reset Default Multimedia Endpoint and disable exclusive audio mode in sound settings.',
    tags: ['voip', 'audio', 'sip', 'softphone']
  },
  {
    id: 5,
    cat: 'system',
    title: 'ACD Softphone Stuck in Not Ready / Aux Lockout',
    desc: 'Telephony CTI link desynchronization. Clear local CTI cache and verify Genesys/Avaya WebSocket connection state.',
    tags: ['system', 'acd', 'aux', 'cti']
  }
];

function renderArticles(list) {
  const container = document.getElementById('articles-container');
  container.innerHTML = '';
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.innerHTML = `
      <div class="article-title">📄 ${item.title}</div>
      <div class="article-desc">${item.desc}</div>
    `;
    card.addEventListener('click', () => {
      addChatMessage('ai', `Opened Knowledge Base Guide: **${item.title}**\n\n${item.desc}\n\n*Would you like me to execute automated diagnostics for this issue?*`);
      // switch to copilot tab
      tabBtns[0].click();
    });
    container.appendChild(card);
  });
}
renderArticles(articlesData);

// Article Category Filters
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

// Article Search
document.getElementById('article-search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = articlesData.filter(a => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)));
  renderArticles(filtered);
});

// Self Healing Diagnostics
const diagConsole = document.getElementById('diag-console');

document.getElementById('btn-flush-dns').addEventListener('click', () => {
  diagConsole.textContent = '> ipconfig /flushdns\nWindows IP Configuration\nSuccessfully flushed the DNS Resolver Cache.\n> route reset interface "Ethernet 1" [OK]\nRouting tables restored.';
  playTone(600, 'sine', 0.1);
});

document.getElementById('btn-ping-vpn').addEventListener('click', () => {
  diagConsole.textContent = '> ping gw-east.contactcenter.com -n 3\nPinging gw-east (10.45.12.1) with 32 bytes of data:\nReply from 10.45.12.1: bytes=32 time=14ms TTL=58\nReply from 10.45.12.1: bytes=32 time=13ms TTL=58\nPacket loss: 0% | Latency Jitter: 1.2ms [OPTIMAL]';
  playTone(700, 'sine', 0.1);
});

document.getElementById('btn-reset-audio').addEventListener('click', () => {
  diagConsole.textContent = '> Restarting Windows Audio Service (AudioSrv)...\nStopping service... [OK]\nStarting service... [OK]\nDefault Audio Device re-enumerated: Realtek Headset (48000Hz 24-bit).';
  playTone(800, 'sine', 0.1);
});

// Broadcasting & Alerts
btnDismissBroadcast.addEventListener('click', () => {
  broadcastTicker.classList.add('hidden');
});

// Simulation buttons
document.getElementById('sim-storm').addEventListener('click', () => {
  broadcastTicker.classList.remove('hidden');
  broadcastMessage.textContent = 'EMERGENCY WEATHER BROADCAST: Tornado / severe storm warning issued for Eastern facility. Telephony failover routing enabled.';
  playWarningChime();
  showNotification('Weather Broadcast Alert', 'Tornado / severe storm warning issued. Prepare for call diverts.');
  addSupervisorLog('BROADCAST', 'Severe weather emergency banner broadcasted to all active agents.');
});

document.getElementById('sim-outage').addEventListener('click', () => {
  broadcastTicker.classList.remove('hidden');
  broadcastMessage.textContent = 'SEV-1 OUTAGE: Cloud CRM database replication latency high. Use offline notes mode.';
  playWarningChime();
  showNotification('Severity-1 Outage Alert', 'Cloud CRM database latency high.');
  addSupervisorLog('SEV-1', 'Severity-1 system outage alert broadcasted.');
});

document.getElementById('sim-monday').addEventListener('click', () => {
  agentState.isHighVolumeMode = !agentState.isHighVolumeMode;
  if (agentState.isHighVolumeMode) {
    highTrafficBanner.classList.remove('hidden');
    playTone(500, 'triangle', 0.3);
    addSupervisorLog('TRAFFIC_MODE', 'Monday Morning High Call Volume Mode activated. Non-critical AUX breaks restricted.');
    showNotification('High Call Volume Mode', 'Monday Morning high traffic volume surge active.');
  } else {
    highTrafficBanner.classList.add('hidden');
    addSupervisorLog('TRAFFIC_MODE', 'High Call Volume Mode deactivated. Normal queue flow.');
  }
});

document.getElementById('sim-2min').addEventListener('click', () => {
  // Start a break with 2 mins remaining to trigger immediately
  startBreak({
    auxCode: 'AUX-2: Short Break / Tea',
    durationMinutes: 2,
    expiresAt: Date.now() + (120 * 1000)
  });
});

document.getElementById('sim-bot-call').addEventListener('click', () => {
  triggerBotCallModal(2, 14);
});

// Behavioral pattern simulation buttons
document.getElementById('sim-bad-tea').addEventListener('click', () => {
  agentState.teaBreaksToday = 5;
  document.getElementById('b-tea-count').textContent = '5 / 2 (Excessive)';
  document.getElementById('b-tea-count').classList.add('text-danger');
  alert('Agent state updated: 5 Tea breaks taken today. Opening web portal now to test automated behavioral rejection...');
  openBreakPortal('bad_tea');
});

document.getElementById('sim-bad-lunch').addEventListener('click', () => {
  agentState.lunchOverageMinutes = 25;
  document.getElementById('b-lunch-overage').textContent = '+25 mins';
  document.getElementById('b-lunch-overage').classList.add('text-danger');
  alert('Agent state updated: Chronic lunch overage (+25m) recorded. Opening web portal now to test automated behavioral rejection...');
  openBreakPortal('bad_lunch');
});

document.getElementById('sim-spam-freq').addEventListener('click', () => {
  const history = [Date.now(), Date.now() - 60000, Date.now() - 120000];
  localStorage.setItem('wfm_request_history', JSON.stringify(history));
  document.getElementById('b-freq-count').textContent = '3 / 3 (Rate-Limited)';
  document.getElementById('b-freq-count').classList.add('text-danger');
  alert('Agent request history set to 3 requests within 2 minutes. Opening web portal to test auto-rejection due to frequency limit...');
  openBreakPortal();
});

document.getElementById('sim-reset-behavior').addEventListener('click', () => {
  agentState.teaBreaksToday = 1;
  agentState.lunchOverageMinutes = 0;
  localStorage.removeItem('wfm_request_history');
  document.getElementById('b-tea-count').textContent = '1 / 2';
  document.getElementById('b-tea-count').className = 'm-val';
  document.getElementById('b-lunch-overage').textContent = '0 mins';
  document.getElementById('b-lunch-overage').className = 'm-val';
  document.getElementById('b-freq-count').textContent = '0 / 3';
  document.getElementById('b-freq-count').className = 'm-val';
  alert('Agent adherence history reset to pristine. Break requests will now be eligible for normal auto-approval!');
});

// Live call timer ticker
let callSeconds = 165;
setInterval(() => {
  callSeconds++;
  const m = Math.floor(callSeconds / 60);
  const s = callSeconds % 60;
  const el = document.getElementById('call-timer');
  if (el) el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}, 1000);
