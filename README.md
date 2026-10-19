# Contact Center AI Auxiliary Mode & Operations Copilot Widget

An enterprise-grade desktop chatbot widget for contact center agents that streamlines auxiliary (AUX) mode management, schedule adherence, real-time customer co-pilot assistance, and automated workforce management (WFM) workflows.

---

## Architecture & Flow

```
+-----------------------------------------------------------+
|             Desktop Chatbot Widget (Desktop Companion)     |
|  - Live Status (READY / AUX / OVERDUE / IN CALL)           |
|  - 2-Minute Pre-Expiration Notice & Sound Chimes          |
|  - Automated Voice Bot Call on Break Overage               |
|  - Real-Time Suggested Customer Replies & AI Copilot Chat |
|  - Post-Call CRM Summary Generator                        |
|  - Interactive Troubleshooting KB (VPN, VDI, VoIP)        |
|  - Emergency Broadcast Ticker & Proactive Outage Alerts   |
+-----------------------------------------------------------+
                             |
                   [ Apply Break Click ]
                             v
+-----------------------------------------------------------+
|         Auxiliary Code & Break Request Web Portal         |
|  1. Agent SSO Authentication Gateway (Identity & Queue)   |
|  2. AUX Code Category (Lunch, Tea, Meeting, System, Bio)  |
|  3. Time Duration Selection (10m, 15m, 30m, 45m, Custom)   |
|  4. Advanced Options (Backup Agent, Urgency, Notes)       |
|  5. Submission -> Erlang-C ACD & Behavioral AI Engine     |
+-----------------------------------------------------------+
                             |
       Auto-Evaluation & Real-Time Synchronization
                             v
+-----------------------------------------------------------+
|               Backend WFM Decision Engine                 |
|  - ACD & WFM Forecasting (approves if SLA buffer ok)      |
|  - Behavioral Pattern Rejection (excess tea/extra lunch)  |
|  - Request Frequency Throttling (rate limiter)            |
|  - Supervisor Tracking Queue & Real-Time Audit Log        |
+-----------------------------------------------------------+
```

---

## Key Features Implemented

### 1. Web Portal Break Application & WFM Forecasting
- Clicking **"☕ Apply Break"** in the chatbot opens the dedicated Web Portal (`/portal.html`).
- **Step 1: Agent Authentication**: Agents authenticate via corporate SSO credentials with assigned queue.
- **Step 2: AUX Code & Duration**: Choose from AUX-1 (Lunch), AUX-2 (Tea/Coffee), AUX-3 (Meeting), AUX-4 (Training), AUX-5 (Technical/VPN Issue), AUX-6 (Bio/Personal) and select duration with custom inputs.
- **Step 3: Advanced Options**: Designate backup agents, urgency flags, and handover notes.
- **WFM Erlang-C Decision**: Evaluates active agents against projected ACD call arrivals. Auto-approves if SLA threshold ($\ge 80\%$) is maintained; auto-rejects with explanation and next available time slot if staffing is limited.
- **Supervisor Tracking**: Auto-dispatches request details to the supervisor tracking queue.

### 2. Behavioral Pattern Auto-Approval / Rejection
- Analyzes daily agent adherence patterns:
  - **Frequent Tea Breaks**: If an agent takes $>2$ tea breaks in a shift or rapid repetitions, the engine flags policy violation and auto-rejects.
  - **Chronic Lunch Overages**: If historical records show unapproved lunch extensions ($>15$ mins), self-service AUX approvals are restricted until supervisor review.

### 3. Troubleshooting Articles for System & VPN Issues
- Searchable knowledge base with category pills:
  - **Cisco AnyConnect / VPN Error 412**: MTU mismatch and route flush procedures.
  - **GlobalProtect / Pulse Secure 502**: Failover gateway procedures.
  - **Citrix VDI Black Screen**: Keyboard hook release and driver resets.
  - **VoIP Audio Distortion & SIP Error 408/403**: Buffer jitter and multimedia endpoint resets.
  - **ACD Softphone AUX Lockout**: CTI link reconnect steps.
- **Interactive Self-Healing Diagnostic Console**: One-click actions to run `ipconfig /flushdns`, ping VPN gateways, and restart audio services.

### 4. Proactive Alerts & Monday High-Traffic Volume Mode
- **Proactive Disaster Mode**: Pushes urgent notifications for severe weather (tornadoes/storms) and facility evacuations/diverts.
- **Monday Morning High Call Volume Mode**: Activates peak traffic mode, restricts discretionary AUX codes (Tea/Coffee), boosts agent concurrency, and surfaces quick canned replies.

### 5. Request Frequency Limiter
- Monitors break request submission rate per agent (maximum 3 requests within 30 minutes).
- Automatically rejects excess submissions with a 15-minute cooldown timer to prevent queue volatility.

### 6. Emergency Broadcast Notifications
- Ticker banner for SEV-1 outages and weather disasters with sound chimes and desktop notification integration.

### 7. Break Countdown, 2-Minute Pre-Expiration Notice & Automated Bot Call
- **Real-Time Countdown**: Displays remaining minutes/seconds with visual progress bar.
- **2-Minute Warning**: Plays an alert chime, displays an orange warning banner, and issues a desktop notification 2 minutes before break expiry.
- **Automated Bot Voice Call on Overage**:
  - If the break exceeds its scheduled duration ($00:00 \rightarrow +01:24$), the widget status switches to red pulsing `OVERDUE`.
  - Pops up an **Interactive WFM Bot Call Screen** with simulated telephone ringing audio.
  - Uses the **Web Speech API (`SpeechSynthesis`)** to speak aloud:
    > *"Attention Agent Alex Morgan: Your scheduled auxiliary break duration has ended and is now exceeding adherence limits. You are required to immediately return to your workstation and resume ready state. Supervisor has been alerted."*
  - Agent clicks **"Acknowledge & Return to Workstation"** to silence the call and reset status to `READY`.

### 8. Live Customer Interaction Copilot & ACW Call Summary
- Live active call timer and customer info bar.
- Real-time suggested context-aware responses with one-click **"Copy to Chat"**.
- One-click **"Generate Instant Call Summary (ACW)"** to produce CRM-ready notes (Intent, Action, Disposition Code, Sentiment).

---

## Quick Start & Running

### Option 1: One-Click Desktop Launcher
Double-click `run-widget.bat` in the project directory, or run in terminal:
```powershell
.\run-widget.bat
```
This starts the backend server on port 4000 and launches the desktop widget in dedicated Windows App Mode.

### Option 2: Running via Node.js
```bash
node server.js
```
Then open:
- **Supervisor Command Portal**: [http://localhost:4000/supervisor.html](http://localhost:4000/supervisor.html)
- **Desktop Chatbot Widget**: [http://localhost:4000/widget.html](http://localhost:4000/widget.html)
- **Break Request Web Portal**: [http://localhost:4000/portal.html](http://localhost:4000/portal.html)

---

## Testing Each Scenario (Built-in Test Lab)

Navigate to the **🚨 Alerts & Sim** tab in the widget to test scenarios instantly:
1. **Test Tornado/Storm Broadcast**: Click `🌪️ Trigger Tornado / Storm Alert`.
2. **Test Monday Peak Traffic**: Click `📈 Toggle Monday High-Traffic Mode`.
3. **Test 2-Minute Pre-Expiry Alert**: Click `⏱️ Trigger 2-Min Break End Alert`.
4. **Test Overdue Bot Voice Call**: Click `📞 Trigger Overdue Bot Call Alert`.
5. **Test Excessive Tea Breaks Rejection**: Click `☕ Simulate Excessive Tea Break Pattern` (opens Web Portal with flagged history).
6. **Test Extra Lunch Overage Rejection**: Click `🥪 Simulate Chronic Extra Lunch Overage`.
7. **Test Frequency Rate Limit**: Click `🔁 Simulate Frequency Limit Spam`.
8. **Reset to Clean Profile**: Click `🔄 Reset Agent History to Good`.

---

## 👥 Available Agent User Personas

You can switch between any of these agents using the dropdown in the **Desktop Chatbot Widget** or the **Break Web Portal**:

| Agent ID | Name & Queue | Behavioral Trait | Scenario Tested |
| :--- | :--- | :--- | :--- |
| **`AGT-8842`** | **Alex Morgan** (Tier-2 Tech) | Adherence 96.4%, 1 Tea Break, 0m Lunch Over | **Auto-Approved**: Clean adherence buffer |
| **`AGT-4092`** | **Jordan Miller** (Billing) | 4 Tea Breaks Taken Today | **Auto-Rejected**: Excessive tea break pattern |
| **`AGT-9102`** | **Samantha Vance** (Customer Care) | +25m Lunch Overage on Prior Shift | **Auto-Rejected**: Chronic lunch overage |
| **`AGT-7740`** | **David Chen** (Inbound) | 3 Break Requests in 10 Minutes | **Auto-Rejected**: Frequency rate limit |
| **`AGT-6512`** | **Rachel Green** (Retention) | Medical Exemption On File | **Priority Override**: Approved during high queue |
| **`AGT-8819`** | **Marcus Brody** (Trainee) | In Coaching Interval (AUX-4) | **Training Workflow**: Supervisor 1-on-1 |

