# Contact Center AI Auxiliary Mode & Operations Ask Shankar Widget

An enterprise-grade desktop chatbot widget for contact center agents that streamlines auxiliary (AUX) mode management, schedule adherence, real-time customer Ask Shankar assistance, and automated workforce management (WFM) workflows.

---

## Architecture & Flow

```
+-----------------------------------------------------------+
|             Desktop Chatbot Widget (Desktop Companion)     |
|  - Live Status (READY / AUX / OVERDUE / IN CALL)           |
|  - 2-Minute Pre-Expiration Notice & Sound Chimes          |
|  - Automated Voice Bot Call on Break Overage               |
|  - Real-Time Suggested Customer Replies & Ask Shankar Chat |
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

### 8. Live Customer Interaction Ask Shankar & ACW Call Summary
- Live active call timer and customer info bar.
- Real-time suggested context-aware responses with one-click **"Copy to Chat"**.
- One-click **"Generate Instant Call Summary (ACW)"** to produce CRM-ready notes (Intent, Action, Disposition Code, Sentiment).

### 9. Storm & Tornado IVR Deflection Engine (1,000 calls/min Auto-Trigger)
- Real-time inbound traffic velocity monitor.
- When call volume reaches or exceeds **1,000 calls per minute**, from call 1,001+ callers automatically receive the field outage voice announcement:
  > *"Thank you for the call, we are having so many outages out field workers are on the route, thank you for your patience"*
- When call volume falls below **1,000 calls per minute**, the deflection system **automatically disables** and normal queue routing resumes.
- Includes speech synthesis audio preview and interactive slider simulation controls.

### 10. Agent QA Scorecard, Tone Detection & Mandatory Training Workflow
- **Speech Tone Classification**: Detects Good/Empathetic, Neutral, Bad/Confused, and Rudely/Impatient tones in real-time.
- **Pre-defined Evaluation Formulas**:
  $$\text{Overall QA Score} = (25\% \times \text{Security PIN}) + (20\% \times \text{Details Captured}) + (25\% \times \text{Tone Index}) + (30\% \times \text{Query Resolution})$$
- **Post-Call Customer IVR Ratings**: Integrated 1 to 5-star customer survey feedback.
- **Supervisor 1-Click Mandatory Coaching**: Immediate training module assignment for non-compliant or rude agents, automatically switching their status to `AUX: TRAINING`.
- **CSV Audit Export**: Instant export of adherence, QA, and IVR satisfaction reports.

### 11. Dynamic WFM Intraday Schedule & Queue Cross-Skill Balancing
- **Sudden Volume Surge Detection**: When Billing calls spike (e.g. 318 calls waiting, ASA > 9m) while General Customer Service agents are idling (5 agents, 28% occupancy), the engine detects the 53:1 queue load imbalance.
- **Dynamic Cross-Skilling Rebalance**:
  - Automatically or with 1-click reallocates eligible cross-trained Customer Service agents (Samantha Vance, Rachel Green, Marcus Brody) to `Customer Billing & Retention (Flex Support)`.
  - Injects a temporary `10:00 - 11:30 Intraday Skill Flex` interval into their WFM schedule.
  - Updates NICE CXone ACD routing with Priority 1 (Billing) and Priority 2 (Customer Service).
  - Temporarily pauses discretionary AUX breaks (Tea/Bio) during the surge window to protect queue SLAs.
- **Agent Desktop Widget Synchronization**: Pushes immediate banner alert (`🔄 Dynamic WFM Skill Flex: Customer Billing Support`) and elevates Billing Ask Shankar replies.
- **Autonomous Restoration**: When call volume normalizes back below threshold, agents are automatically returned to their base Customer Service shift and normal AUX permissions resume.

### 12. Supervisor AI Operations Assistant (Ask Shankar) & Multi-Account Administration
- **REMI Supervisor Assistant (Ask Shankar)**: A floating interactive AI assistant embedded directly inside the Supervisor Command Center.
  - **Natural Language Floor Audit**: Supervisors can query floor health, check queue surges, review non-compliant QA agents, or dispatch emergency broadcasts.
  - **1-Click Execution within Chat**: Rebalances queues, assigns coaching modules, and places automated voice recalls directly from AI chat response bubbles.
  - **Speech Synthesis Voice Briefing**: Reads real-time shift status briefings aloud via the Web Speech API.
- **Multiple Supervisor Profiles**: Seamlessly switch between 5 distinct management accounts with dedicated supervisory scopes.

---

## 👔 Available Supervisor Accounts

| Supervisor ID | Name | Role & Supervisory Scope | Campaign Queues Overseen |
| :--- | :--- | :--- | :--- |
| **`SUP-014`** | **Sarah Jenkins** | Floor Lead & WFM Operations | All Queues (Tier-2 Tech, Billing, Care, Emergency) |
| **`SUP-021`** | **Michael Chang** | Billing & Retention Operations Manager | Customer Billing & Retention (ACD-02) |
| **`SUP-035`** | **Elena Rostova** | Quality Assurance & Compliance Lead | Speech Tone, Verification & Coaching Matrix |
| **`SUP-042`** | **David Sterling** | Emergency Inbound & Disaster Dispatch Lead | Emergency Inbound (ACD-01) & Regional Weather IVR |
| **`SUP-059`** | **Priya Sharma** | Intraday WFM Scheduling Architect | Erlang-C Capacity & Dynamic Cross-Skilling Flex |

---

## 👥 Available Agent User Personas

You can switch between any of these 12 agents using the dropdown in the **Desktop Chatbot Widget**, **Break Web Portal**, or **Supervisor Floor Wallboard**:

| Agent ID | Name & Queue | Behavioral Trait & Adherence | Scenario Tested |
| :--- | :--- | :--- | :--- |
| **`AGT-8842`** | **Alex Morgan** (Tier-2 Tech) | Adherence 96.4%, 1 Tea, 0m Lunch | **Auto-Approved**: Clean adherence buffer |
| **`AGT-4092`** | **Jordan Miller** (Billing) | 4 Tea Breaks Taken Today | **Auto-Rejected**: Excessive tea break pattern |
| **`AGT-9102`** | **Samantha Vance** (Customer Care) | +25m Lunch Overage on Prior Shift | **Auto-Rejected**: Chronic lunch overage / Flex |
| **`AGT-7740`** | **David Chen** (Emergency Inbound) | 3 Break Requests in 10 Minutes | **Auto-Rejected**: Frequency rate limit |
| **`AGT-6512`** | **Rachel Green** (Customer Care) | Medical Exemption On File | **Priority Override**: Approved / Cross-skilled flex |
| **`AGT-8819`** | **Marcus Brody** (Customer Care) | In Coaching Interval (AUX-4) | **Training Workflow**: Supervisor 1-on-1 / Flex |
| **`AGT-3310`** | **Chloe Bennett** (Customer Care) | Senior Lead • 94.2% Adherence | **Exemplary Care**: High FCR & clean record |
| **`AGT-5521`** | **Lucas Wright** (Billing Specialist) | 88.5% Adherence • Fast 24s ACW | **Billing Speed**: Rapid wrap-up & credit adjustments |
| **`AGT-7703`** | **Maya Patel** (Customer Care) | 97.0% Adherence • VIP Onboarding | **5.0★ CSAT**: Flawless empathy & greeting |
| **`AGT-4491`** | **Carlos Mendez** (Tier-2 Tech) | 85.0% Adherence • VPN & Hardware | **Technical KB**: Network adapter diagnostics |
| **`AGT-6628`** | **Olivia Taylor** (Emergency Inbound) | 99.5% Adherence • Disaster Routing | **Top Performer**: Emergency storm handling |
| **`AGT-2219`** | **Liam O'Connor** (Customer Care) | 76.5% Adherence • Trainee | **Coaching Needed**: Missed PIN & hesitant tone |

