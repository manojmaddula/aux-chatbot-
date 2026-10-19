// supervisor.js - Logic for the Supervisor Operations Portal

// Live simulated agent roster on shift
let activeAgents = [
  { id: 'AGT-8842', name: 'Alex Morgan', queue: 'Tier-2 Tech Support', state: 'READY', breakLeft: '-', adherence: '96.4%', teaCount: 1, lunchVar: '0m' },
  { id: 'AGT-4092', name: 'Jordan Miller', queue: 'Customer Billing & Retention', state: 'READY', breakLeft: '-', adherence: '78.5%', teaCount: 4, lunchVar: '0m' },
  { id: 'AGT-9102', name: 'Samantha Vance', queue: 'Customer Billing & Retention', state: 'IN_CALL', breakLeft: '-', adherence: '71.2%', teaCount: 1, lunchVar: '+25m' },
  { id: 'AGT-7740', name: 'David Chen', queue: 'Emergency Inbound', state: 'AUX: TEA', breakLeft: '08:42', adherence: '82.0%', teaCount: 2, lunchVar: '0m' },
  { id: 'AGT-6512', name: 'Rachel Green', queue: 'Customer Billing & Retention', state: 'READY', breakLeft: '-', adherence: '98.2%', teaCount: 1, lunchVar: '0m' },
  { id: 'AGT-8819', name: 'Marcus Brody', queue: 'Emergency Inbound', state: 'IN_CALL', breakLeft: '-', adherence: '91.0%', teaCount: 1, lunchVar: '+2m' }
];

// Broadcast Channel listener
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

// Fetch and render supervisor tracking queue
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
  if (!queue || queue.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#9ca3af; padding:20px;">No break requests in queue yet.</td></tr>`;
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
            ? `<button class="btn btn-sm btn-outline" onclick="recallAgent('${item.agentId}')">Recall Agent</button>` 
            : `<button class="btn btn-sm btn-primary" onclick="overrideApprove('${item.id}', '${item.agentId}')">Override</button>`
          }
        </td>
      </tr>
    `;
  }).join('');
}

// Render Agent Wallboard
function renderWallboard() {
  const tbody = document.getElementById('agent-wallboard-body');
  let overdueCount = 0;

  tbody.innerHTML = activeAgents.map(ag => {
    let stateTag = 'ready';
    if (ag.state.startsWith('AUX')) stateTag = 'aux';
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
        <td style="font-weight:700; color:${parseFloat(ag.adherence) > 90 ? '#34d399' : '#f87171'};">${ag.adherence}</td>
        <td>${ag.teaCount} / 2</td>
        <td>${ag.lunchVar}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="recallAgent('${ag.id}')">
            📞 Bot Recall
          </button>
        </td>
      </tr>
    `;
  }).join('');

  const overdueEl = document.getElementById('kpi-overdue');
  const overdueSub = document.getElementById('kpi-overdue-sub');
  if (overdueCount > 0) {
    overdueEl.textContent = overdueCount;
    overdueSub.textContent = 'Action Required: recall sent';
  } else {
    overdueEl.textContent = '0';
    overdueSub.textContent = 'No adherence overage';
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

// Recall agent / trigger bot call
window.recallAgent = function(agentId) {
  if (bc) {
    bc.postMessage({
      type: 'SUPERVISOR_RECALL',
      payload: { agentId, message: 'Supervisor Sarah Jenkins requested your immediate return to workstation.' }
    });
  }
  alert(`Automated Bot Recall dispatched to Agent ${agentId}! Their desktop widget will ring and speak the recall instruction.`);
};

// Override approval
window.overrideApprove = function(reqId, agentId) {
  alert(`Supervisor Override Granted for request ${reqId} (Agent ${agentId}). Status set to APPROVED.`);
  fetchQueue();
};

// Emergency Broadcasting actions
function broadcastMessage(type, title, message) {
  if (bc) {
    bc.postMessage({
      type: 'BROADCAST_ALERT',
      payload: { alertType: type, title, message, timestamp: Date.now() }
    });
  }

  const statusMsg = document.getElementById('bc-status-msg');
  statusMsg.style.color = '#34d399';
  statusMsg.textContent = `✓ Dispatched "${title}" to all agent widgets!`;
  setTimeout(() => { statusMsg.textContent = ''; }, 3500);
}

document.getElementById('btn-bc-storm').addEventListener('click', () => {
  broadcastMessage('STORM', 'TORNADO & SEVERE STORM WARNING', 'Severe weather warning issued for facility. Telephony failover routing enabled. Prepare for inbound surge.');
});

document.getElementById('btn-bc-outage').addEventListener('click', () => {
  broadcastMessage('OUTAGE', 'SEV-1 SYSTEM OUTAGE', 'Cloud CRM replication latency high. Use offline wrap-up notes until database synchronization recovers.');
});

document.getElementById('btn-bc-monday').addEventListener('click', () => {
  broadcastMessage('MONDAY_TRAFFIC', 'HIGH CALL VOLUME MODE ACTIVATED', 'Monday peak inbound queue surge detected. Discretionary AUX breaks restricted. Please maintain READY status.');
});

document.getElementById('btn-send-custom-bc').addEventListener('click', () => {
  const text = document.getElementById('custom-bc-text').value.trim();
  const severity = document.getElementById('custom-bc-severity').value;
  if (!text) {
    alert('Please enter a message to broadcast.');
    return;
  }
  broadcastMessage(severity, `SUPERVISOR BROADCAST (${severity})`, text);
  document.getElementById('custom-bc-text').value = '';
});

document.getElementById('btn-refresh-queue').addEventListener('click', fetchQueue);
document.getElementById('btn-clear-queue').addEventListener('click', () => {
  if (confirm('Clear audit queue history?')) {
    renderQueue([]);
  }
});

// Periodic poll for updates
fetchQueue();
renderWallboard();
setInterval(fetchQueue, 3000);
