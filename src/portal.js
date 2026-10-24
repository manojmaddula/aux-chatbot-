// portal.js - Logic for the WFM Web Portal
const AGENT_PERSONAS = {
  'AGT-8842': {
    id: 'AGT-8842',
    name: 'Alex Morgan',
    queue: 'Tier-2 Tech Support',
    adherenceScore: 96.4,
    recentBreaksToday: 1,
    lunchOverageHistoryMinutes: 0,
    auxDefault: 'AUX-1: Scheduled Lunch',
    urgency: 'Normal',
    note: 'Clean record agent, high schedule adherence (96.4%). Auto-approved.'
  },
  'AGT-4092': {
    id: 'AGT-4092',
    name: 'Jordan Miller',
    queue: 'Customer Billing & Retention',
    adherenceScore: 78.5,
    recentBreaksToday: 4, // Flagged for aux pattern
    lunchOverageHistoryMinutes: 0,
    auxDefault: 'AUX-2: Short Break / AUX',
    urgency: 'Normal',
    note: '4 aux breaks already logged today. Triggers behavioral aux pattern rejection.'
  },
  'AGT-9102': {
    id: 'AGT-9102',
    name: 'Samantha Vance',
    queue: 'Customer Billing & Retention',
    adherenceScore: 71.2,
    recentBreaksToday: 1,
    lunchOverageHistoryMinutes: 25, // Flagged for chronic lunch overage
    auxDefault: 'AUX-1: Scheduled Lunch',
    urgency: 'Normal',
    note: 'Exceeded previous lunch by +25 mins. Triggers chronic lunch overage rejection.'
  },
  'AGT-7740': {
    id: 'AGT-7740',
    name: 'David Chen',
    queue: 'Emergency Inbound',
    adherenceScore: 82.0,
    recentBreaksToday: 2,
    lunchOverageHistoryMinutes: 0,
    forceRateLimit: true,
    auxDefault: 'AUX-2: Short Break / AUX',
    urgency: 'Normal',
    note: 'Rate limit spammer (3 requests in last 10m). Triggers frequency limiter rejection.'
  },
  'AGT-6512': {
    id: 'AGT-6512',
    name: 'Rachel Green',
    queue: 'Customer Billing & Retention',
    adherenceScore: 98.2,
    recentBreaksToday: 1,
    lunchOverageHistoryMinutes: 0,
    auxDefault: 'AUX-6: Bio / Emergency',
    urgency: 'Urgent-Medical',
    note: 'Medical exemption on file. Triggers priority approval even under queue pressure.'
  },
  'AGT-8819': {
    id: 'AGT-8819',
    name: 'Marcus Brody',
    queue: 'Emergency Inbound',
    adherenceScore: 91.0,
    recentBreaksToday: 1,
    lunchOverageHistoryMinutes: 0,
    auxDefault: 'AUX-4: Training / Coaching',
    urgency: 'Adherence-Scheduled',
    note: 'New hire trainee in coaching interval.'
  },
  'AGT-3310': {
    id: 'AGT-3310',
    name: 'Chloe Bennett',
    queue: 'General Customer Service',
    adherenceScore: 94.2,
    recentBreaksToday: 1,
    lunchOverageHistoryMinutes: 0,
    auxDefault: 'AUX-1: Scheduled Lunch',
    urgency: 'Normal',
    note: 'Senior Customer Service Lead. High adherence and fast wrap-up.'
  },
  'AGT-5521': {
    id: 'AGT-5521',
    name: 'Lucas Wright',
    queue: 'Customer Billing & Retention',
    adherenceScore: 88.5,
    recentBreaksToday: 2,
    lunchOverageHistoryMinutes: 0,
    auxDefault: 'AUX-2: Short Break / AUX',
    urgency: 'Normal',
    note: 'Billing specialist with 24s average handle time.'
  },
  'AGT-7703': {
    id: 'AGT-7703',
    name: 'Maya Patel',
    queue: 'General Customer Service',
    adherenceScore: 97.0,
    recentBreaksToday: 1,
    lunchOverageHistoryMinutes: 0,
    auxDefault: 'AUX-3: Shift Meeting',
    urgency: 'Normal',
    note: 'VIP customer onboarding care specialist. Exemplary 5.0 CSAT.'
  },
  'AGT-4491': {
    id: 'AGT-4491',
    name: 'Carlos Mendez',
    queue: 'Tier-2 Tech Support',
    adherenceScore: 85.0,
    recentBreaksToday: 2,
    lunchOverageHistoryMinutes: 6,
    auxDefault: 'AUX-5: Technical / VPN Issue',
    urgency: 'High-Queue',
    note: 'Hardware & VPN infrastructure diagnostic specialist.'
  },
  'AGT-6628': {
    id: 'AGT-6628',
    name: 'Olivia Taylor',
    queue: 'Emergency Inbound',
    adherenceScore: 99.5,
    recentBreaksToday: 1,
    lunchOverageHistoryMinutes: 0,
    auxDefault: 'AUX-1: Scheduled Lunch',
    urgency: 'Normal',
    note: 'Disaster recovery and emergency telephony routing specialist.'
  },
  'AGT-2219': {
    id: 'AGT-2219',
    name: "Liam O'Connor",
    queue: 'General Customer Service',
    adherenceScore: 76.5,
    recentBreaksToday: 3,
    lunchOverageHistoryMinutes: 14,
    auxDefault: 'AUX-4: Training / Coaching',
    urgency: 'Adherence-Scheduled',
    note: 'Customer Care trainee flagged for de-escalation coaching.'
  }
};

let isAuthenticated = false;
let agentData = { ...AGENT_PERSONAS['AGT-8842'] };
let selectedMinutes = 15;

// DOM Elements
const authSection = document.getElementById('auth-section');
const breakSection = document.getElementById('break-section');
const authBadge = document.getElementById('auth-badge');
const authStatusText = document.getElementById('auth-status-text');
const btnAuthenticate = document.getElementById('btn-authenticate');
const authMsg = document.getElementById('auth-msg');
const presetSelect = document.getElementById('preset-agent-select');

const durationPills = document.querySelectorAll('.duration-pills .pill');
const customMinutesInput = document.getElementById('custom-minutes');
const btnSubmitBreak = document.getElementById('btn-submit-break');

const decisionOverlay = document.getElementById('decision-overlay');
const decisionIcon = document.getElementById('decision-icon');
const decisionTitle = document.getElementById('decision-title');
const decisionDesc = document.getElementById('decision-desc');
const decisionMetrics = document.getElementById('decision-metrics');
const btnSyncChatbot = document.getElementById('btn-sync-chatbot');

const AUX_DEFAULT_DURATIONS = {
  'AUX-1: Scheduled Lunch': 45,
  'AUX-2: Short Break / AUX': 15,
  'AUX-3: Meeting / 1-on-1': 30,
  'AUX-4: Training / Coaching': 45,
  'AUX-5: Technical / VPN Issue': 30,
  'AUX-6: Bio / Emergency': 10
};

function setDurationMinutes(minutes) {
  selectedMinutes = parseInt(minutes, 10) || 15;
  let matchedPill = false;
  durationPills.forEach(pill => {
    if (parseInt(pill.getAttribute('data-minutes'), 10) === selectedMinutes) {
      pill.classList.add('active');
      matchedPill = true;
    } else {
      pill.classList.remove('active');
    }
  });

  if (!matchedPill) {
    if (customMinutesInput) customMinutesInput.value = selectedMinutes;
  } else {
    if (customMinutesInput) customMinutesInput.value = '';
  }
}

function selectDurationForAux(auxCode) {
  const defaultMinutes = AUX_DEFAULT_DURATIONS[auxCode] || 15;
  setDurationMinutes(defaultMinutes);
}

// Apply agent persona selection
function applyAgentPersona(agentKey) {
  const profile = AGENT_PERSONAS[agentKey] || AGENT_PERSONAS['AGT-8842'];
  agentData = { ...profile };

  document.getElementById('agent-id').value = profile.id;
  document.getElementById('agent-name').value = profile.name;
  document.getElementById('agent-queue').value = profile.queue;
  document.getElementById('urgency-level').value = profile.urgency;

  // Auto select default AUX radio if present
  const radio = document.querySelector(`input[name="aux-code"][value="${profile.auxDefault}"]`);
  if (radio) {
    radio.checked = true;
    selectDurationForAux(profile.auxDefault);
  }
  syncItIssueBoxVisibility();

  if (profile.forceRateLimit) {
    const history = [Date.now(), Date.now() - 30000, Date.now() - 60000];
    localStorage.setItem('wfm_request_history', JSON.stringify(history));
  } else {
    // normal history
    localStorage.removeItem('wfm_request_history');
  }

  authMsg.style.color = '#38bdf8';
  authMsg.textContent = `Selected: ${profile.name} - ${profile.note}`;
}

if (presetSelect) {
  presetSelect.addEventListener('change', (e) => {
    applyAgentPersona(e.target.value);
  });
}

// Check URL query parameters for pre-selected agent
const urlParams = new URLSearchParams(window.location.search);
const queryAgent = urlParams.get('agent');
if (queryAgent && AGENT_PERSONAS[queryAgent]) {
  if (presetSelect) presetSelect.value = queryAgent;
  applyAgentPersona(queryAgent);
} else {
  applyAgentPersona('AGT-8842');
}

// Live gauges update simulation
function updateGauges() {
  const callsWaiting = Math.floor(Math.random() * 8) + 14;
  const staffAvail = Math.floor(Math.random() * 4) + 22;
  const sla = (80 + Math.random() * 12).toFixed(1);

  const callsEl = document.getElementById('portal-live-calls');
  const staffEl = document.getElementById('portal-live-staff');
  const slaEl = document.getElementById('portal-live-sla');

  if (callsEl) callsEl.textContent = `${callsWaiting} Waiting`;
  if (staffEl) staffEl.textContent = `${staffAvail} / 30 Agents`;
  if (slaEl) slaEl.textContent = `${sla}% (Target: 80%)`;
}
setInterval(updateGauges, 8000);
updateGauges();

// Authenticate Agent
btnAuthenticate.addEventListener('click', () => {
  const id = document.getElementById('agent-id').value.trim();
  const name = document.getElementById('agent-name').value.trim();
  const queue = document.getElementById('agent-queue').value;

  if (!id || !name) {
    authMsg.style.color = '#ef4444';
    authMsg.textContent = 'Please enter valid Agent ID & Name.';
    return;
  }

  btnAuthenticate.textContent = 'Verifying with SSO Identity Gateway...';
  btnAuthenticate.disabled = true;

  setTimeout(() => {
    isAuthenticated = true;
    agentData.id = id;
    agentData.name = name;
    agentData.queue = queue;

    authBadge.classList.remove('guest');
    authBadge.classList.add('authenticated');
    authStatusText.textContent = `Authenticated: ${agentData.name} (${agentData.id})`;

    authMsg.style.color = '#10b981';
    authMsg.textContent = `✓ SSO Verified: ${agentData.name} (${agentData.queue})`;

    breakSection.classList.remove('disabled');
    btnAuthenticate.textContent = 'Re-authenticate';
    btnAuthenticate.disabled = false;
  }, 600);
});

// Duration selection
durationPills.forEach(pill => {
  pill.addEventListener('click', () => {
    durationPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    selectedMinutes = parseInt(pill.getAttribute('data-minutes'), 10);
    customMinutesInput.value = '';
  });
});

customMinutesInput.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  if (val && val > 0) {
    durationPills.forEach(p => p.classList.remove('active'));
    selectedMinutes = val;
  }
});

// Evaluate Break Request (ACD forecast + Behavioral Patterns + Frequency Limiter)
async function evaluateBreakRequest(requestPayload) {
  // Call backend API or simulate if offline
  try {
    const res = await fetch('/api/evaluate-break', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend offline, running local client evaluation engine:', err);
  }

  // Fallback Local AI & WFM Decision Engine:
  return runClientSideDecisionEngine(requestPayload);
}

function runClientSideDecisionEngine(payload) {
  // 1. Request Frequency Check (1-Week Scheduling Window)
  const reqHistory = JSON.parse(localStorage.getItem('wfm_request_history') || '[]');
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const recentWithin1Wk = reqHistory.filter(t => (now - t) < oneWeekMs);
  if (recentWithin1Wk.length >= 5) {
    return {
      status: 'REJECTED',
      code: 'FREQ_LIMIT_EXCEEDED',
      checkBackLater: true,
      nextOpenInterval: 'Next Scheduling Week (Window Reset)',
      title: 'Auto-Rejected: Weekly Request Frequency Limit Exceeded',
      description: `You have submitted ${recentWithin1Wk.length} requests in the active 1-week scheduling window. To ensure queue coverage, subsequent requests are held until the weekly quota resets or supervisor provides an exception.`,
      metrics: {
        'Weekly Frequency': `${recentWithin1Wk.length} requests / 1-Week (Limit: 5)`,
        'Policy Window': '1 Week (Rolling 7 Days)',
        'Supervisor Notification': 'Dispatched (Audit flag)'
      }
    };
  }

  // 2. Behavioral Patterns Check
  const auxCode = payload.auxCode;
  if (auxCode.includes('AUX-2') && payload.agent.recentBreaksToday >= 4) {
    return {
      status: 'REJECTED',
      code: 'BEHAVIORAL_TEA_OVERAGE',
      checkBackLater: true,
      nextOpenInterval: 'Check Back Later with Supervisor Approval',
      title: 'Auto-Rejected: AUX Break Frequency Pattern Exceeded',
      description: `AI Behavioral Pattern Alert: Agent has already logged ${payload.agent.recentBreaksToday} short aux breaks today. Company policy allocates a maximum of 2 discretionary aux breaks per 8-hour shift.`,
      metrics: {
        'Agent Daily Breaks Taken': `${payload.agent.recentBreaksToday} breaks`,
        'Policy Limit': 'Max 2 AUX Breaks / shift',
        'Recommended Action': 'Please request supervisor exception code'
      }
    };
  }

  if (auxCode.includes('AUX-1') && payload.agent.lunchOverageHistoryMinutes >= 15) {
    return {
      status: 'REJECTED',
      code: 'BEHAVIORAL_LUNCH_OVERAGE',
      checkBackLater: true,
      nextOpenInterval: 'Check Back Later after WFM Review',
      title: 'Auto-Rejected: Chronic Lunch Overage Pattern Flagged',
      description: `Adherence pattern detection flagged an unauthorized lunch overage of +${payload.agent.lunchOverageHistoryMinutes} mins on previous shift. Autonomous break grants are restricted until supervisor 1-on-1 coaching is completed.`,
      metrics: {
        'Historical Lunch Adherence': '71% (Below 85% Threshold)',
        'Recent Excess Duration': `+${payload.agent.lunchOverageHistoryMinutes} mins`,
        'Escalation': 'Sent to Supervisor for manual review'
      }
    };
  }

  // 3. ACD & WFM Forecasting Engine
  const liveStaffing = 23; // available agents
  const projectedCallSurge = (payload.urgency === 'Urgent-Medical') ? false : (Math.random() < 0.25); // 25% chance of simulated peak queue
  const isMondayRush = new Date().getDay() === 1 && new Date().getHours() < 12;

  if (projectedCallSurge || isMondayRush) {
    return {
      status: 'REJECTED',
      code: 'WFM_ACD_STAFFING_LIMITED',
      checkBackLater: true,
      nextOpenInterval: '11:45 AM (Queue Recovery)',
      title: 'Auto-Rejected: ACD Call Volume Peak / Insufficient Staffing',
      description: 'WFM Forecast predicts an ACD call arrival spike of 45 calls in the next 15-minute interval. Current active agent staffing is below the SLA safety threshold (projected SLA: 71.4% vs 80.0% target).',
      metrics: {
        'ACD Forecast Arrival': '45 calls / 15m (High Traffic Mode)',
        'Current Available Agents': `${liveStaffing} Agents`,
        'Minimum Required Agents': '27 Agents',
        'Projected SLA Impact': 'Drops to 71.4% (Violates SLA)',
        'Next Suggested Window': 'Available at 11:45 AM (Staffing recovery)'
      }
    };
  }

  // Auto-Approve
  return {
    status: 'APPROVED',
    code: 'AUTO_APPROVED_WFM',
    title: 'AUX Break Request Auto-Approved!',
    description: `WFM Forecast confirms healthy staffing buffer. Your ${payload.durationMinutes}-minute break has been scheduled and synchronized with telephony switch and desktop chatbot.`,
    metrics: {
      'AUX Code': payload.auxCode,
      'Approved Duration': `${payload.durationMinutes} minutes`,
      'WFM Staffing Buffer': '+4 agents surplus (SLA projected 86.8%)',
      'Supervisor Tracking': `Dispatched to Queue (Supervisor ID: SUP-014)`,
      'Pre-Expiration Alert': 'Scheduled 2 min before end'
    }
  };
}

// Submit Break Request
btnSubmitBreak.addEventListener('click', async () => {
  if (!isAuthenticated) {
    alert('Please authenticate first in Step 1.');
    return;
  }

  const selectedRadio = document.querySelector('input[name="aux-code"]:checked');
  const auxCode = selectedRadio ? selectedRadio.value : 'AUX-1: Scheduled Lunch';
  const backupAgent = document.getElementById('backup-agent').value.trim();
  const urgency = document.getElementById('urgency-level').value;
  const notes = document.getElementById('break-notes').value.trim();

  const payload = {
    id: 'REQ-' + Math.floor(100000 + Math.random() * 900000),
    timestamp: new Date().toISOString(),
    agent: agentData,
    auxCode,
    durationMinutes: selectedMinutes,
    backupAgent,
    urgency,
    notes
  };

  // Record submission in history for frequency limiter
  const history = JSON.parse(localStorage.getItem('wfm_request_history') || '[]');
  history.push(Date.now());
  localStorage.setItem('wfm_request_history', JSON.stringify(history));

  // Show evaluating modal
  decisionOverlay.classList.remove('hidden');
  const checkBackCard = document.getElementById('check-back-later-card');
  if (checkBackCard) checkBackCard.classList.add('hidden');

  decisionIcon.textContent = '⏳';
  decisionTitle.style.color = '#f8fafc';
  decisionTitle.textContent = 'Evaluating ACD & Behavioral Forecast...';
  decisionDesc.textContent = 'Communicating with WFM Telephony Switch & analyzing agent adherence records...';
  decisionMetrics.innerHTML = '<div style="text-align:center; padding:10px; color:#94a3b8;">Processing Erlang-C staffing matrix...</div>';

  const decision = await evaluateBreakRequest(payload);

  setTimeout(() => {
    if (decision.status === 'APPROVED') {
      // Hide check-back-later card on approval
      if (checkBackCard) checkBackCard.classList.add('hidden');

      decisionIcon.textContent = '✅';
      decisionTitle.style.color = '#10b981';
      decisionTitle.textContent = decision.title;
      decisionDesc.textContent = decision.description;

      // Read selected device and threshold preferences
      const selectedDevice = document.getElementById('portal-alert-device')?.value || 'both';
      const selectedThresh = parseInt(document.getElementById('portal-alert-threshold')?.value || '2', 10);
      const alertPrefs = {
        agentId: agentData.id,
        agentName: agentData.name,
        device: selectedDevice,
        thresholdMins: selectedThresh,
        soundStyle: 'phone_ring'
      };
      localStorage.setItem('wfm_alert_prefs', JSON.stringify(alertPrefs));
      fetch('/api/alerts/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertPrefs)
      }).catch(() => {});

      // Broadcast approved break to Desktop Chatbot Widget via BroadcastChannel & LocalStorage
      const breakEvent = {
        type: 'BREAK_APPROVED',
        payload: {
          requestId: payload.id,
          agent: agentData,
          auxCode: payload.auxCode,
          durationMinutes: payload.durationMinutes,
          thresholdMins: selectedThresh,
          alertDevice: selectedDevice,
          approvedAt: Date.now(),
          expiresAt: Date.now() + (payload.durationMinutes * 60 * 1000)
        }
      };
      localStorage.setItem('wfm_active_break', JSON.stringify(breakEvent.payload));
      
      // Dispatch via BroadcastChannel for real-time cross-tab/window sync
      try {
        const bc = new BroadcastChannel('wfm_aux_channel');
        bc.postMessage(breakEvent);
      } catch (e) {
        console.warn(e);
      }

      btnSyncChatbot.textContent = '✓ Start Break in Desktop Widget & Close Window';
    } else {
      // Show check-back-later card ONLY on rejection
      if (checkBackCard) {
        checkBackCard.classList.remove('hidden');
        const nextWinEl = document.getElementById('checkback-next-window');
        const countEl = document.getElementById('checkback-countdown');
        if (nextWinEl) nextWinEl.textContent = decision.nextOpenInterval || '11:45 AM';
        if (countEl) countEl.textContent = decision.code === 'FREQ_LIMIT_EXCEEDED' ? 'Throttled (Cooldown)' : 'Queue Busy - Hold';
      }

      decisionIcon.textContent = '❌';
      decisionTitle.style.color = '#ef4444';
      decisionTitle.textContent = decision.title;
      decisionDesc.textContent = decision.description;

      // Broadcast rejection to widget for supervisor audit log
      const rejectEvent = {
        type: 'BREAK_REJECTED',
        payload: {
          requestId: payload.id,
          agent: agentData,
          auxCode: payload.auxCode,
          durationMinutes: payload.durationMinutes,
          reason: decision.description,
          code: decision.code
        }
      };
      try {
        const bc = new BroadcastChannel('wfm_aux_channel');
        bc.postMessage(rejectEvent);
      } catch (e) {}

      btnSyncChatbot.textContent = 'Acknowledge & Return';
    }

    // Render metrics
    let metricsHtml = '';
    for (const [key, val] of Object.entries(decision.metrics || {})) {
      metricsHtml += `
        <div class="metric-row">
          <span style="color:#475569; font-weight:600;">${key}</span>
          <strong style="color:#0f172a;">${val}</strong>
        </div>
      `;
    }
    decisionMetrics.innerHTML = metricsHtml;

  }, 1000);
});

// Close / sync button
btnSyncChatbot.addEventListener('click', () => {
  decisionOverlay.classList.add('hidden');
  try {
    window.close();
  } catch (e) {
    // In case browser prevents window.close
    window.location.href = '/widget.html';
  }
});

// Strictly toggle IT issue documentation ONLY when AUX-5 is selected
function syncItIssueBoxVisibility() {
  const selectedAux = document.querySelector('input[name="aux-code"]:checked');
  const itBox = document.getElementById('it-system-issue-box');
  if (itBox) {
    if (selectedAux && selectedAux.value.includes('AUX-5')) {
      itBox.classList.remove('hidden');
    } else {
      itBox.classList.add('hidden');
    }
  }
}

// Initial sync on load
syncItIssueBoxVisibility();
const initialCheckedAux = document.querySelector('input[name="aux-code"]:checked');
if (initialCheckedAux) {
  selectDurationForAux(initialCheckedAux.value);
}

document.querySelectorAll('input[name="aux-code"]').forEach(radio => {
  radio.addEventListener('change', () => {
    syncItIssueBoxVisibility();
    selectDurationForAux(radio.value);
  });
});
document.querySelectorAll('.aux-option').forEach(opt => {
  opt.addEventListener('click', () => {
    setTimeout(() => {
      syncItIssueBoxVisibility();
      const checkedRadio = document.querySelector('input[name="aux-code"]:checked');
      if (checkedRadio) selectDurationForAux(checkedRadio.value);
    }, 50);
  });
});
