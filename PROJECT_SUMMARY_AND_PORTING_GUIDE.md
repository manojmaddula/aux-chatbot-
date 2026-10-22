# Contact Center AI Auxiliary Mode & Operations Ask Shankar System
## Complete Project Summary & Multi-Device Deployment Guide

---

## 1. Executive Summary & Architecture Overview

Contact centers require dynamic, automated workforce management (WFM) to manage Auxiliary (AUX) modes, schedule adherence, and agent support. This solution replaces slow, manual supervisor communications with a centralized ecosystem combining:

1. **A Floating Desktop Chatbot Widget (Agent Ask Shankar)**: Stays accessible during customer interactions to provide live adherence tracking, real-time suggested customer replies, instant CRM call summaries, system/VPN troubleshooting, and emergency broadcast alerts.
2. **A Dedicated Web Portal (Authentication & AUX Application)**: When an agent requests a break, they are redirected to a secure web portal (`/portal.html`) where they authenticate via SSO, pick their AUX code, duration, backup agent, and submit to the automated WFM engine.
3. **A Supervisor Operations Command Center (`/supervisor.html`)**: Real-time queue audit of all break requests, live agent adherence telemetry wallboard, and an emergency broadcasting control station.
4. **An Autonomous WFM Decision Engine (`server.js`)**: Evaluates real-time Erlang-C staffing capacity, projected ACD arrival surges, agent adherence history, and submission frequency.

```
+-----------------------------------------------------------------------------------+
|                           SYSTEM ARCHITECTURE DIAGRAM                             |
+-----------------------------------------------------------------------------------+

     +-----------------------------------------------------------------------+
     |                    DESKTOP CHATBOT WIDGET (Agent)                     |
     |  - Phone State: READY / IN_CALL / AUX / OVERDUE                       |
     |  - 2-Minute Pre-Expiration Notice (Audio Chime + Visual Notice)      |
     |  - Automated Voice Bot Call on Overdue Break (Web Speech API)         |
     |  - Suggested Customer Replies & Instant ACW Call Summary              |
     |  - Troubleshooting KB & Self-Healing Console (VPN, VDI, VoIP)        |
     |  - Agent Persona Switcher (6 distinct agent scenarios)                |
     +-----------------------------------------------------------------------+
                        |                                   ^
            [ Clicks "Apply Break" ]                        | [ Real-time Sync via
                        v                                   |   BroadcastChannel & API ]
     +-----------------------------------------+            |
     |       BREAK REQUEST WEB PORTAL          |            |
     |  1. SSO / LDAP Authentication           |            |
     |  2. AUX Category Selection (Lunch, Tea) |------------+
     |  3. Duration & Custom Minutes           |
     |  4. Backup Agent & Reason Handover      |
     +-----------------------------------------+
                        |
            [ Evaluates Break Request ]
                        v
     +-----------------------------------------------------------------------+
     |                 AUTONOMOUS WFM DECISION ENGINE (server.js)            |
     |  - ACD & WFM Erlang-C Staffing Forecast (SLA >= 80% Buffer)           |
     |  - Behavioral Pattern Detection (Excessive Tea / Chronic Lunch Over)  |
     |  - Request Frequency Throttling (Max 3 requests / 30 mins)            |
     |  - Urgency & Medical Exemption Overrides                              |
     +-----------------------------------------------------------------------+
                        |
            [ Dispatches Request Log ]
                        v
     +-----------------------------------------------------------------------+
     |                SUPERVISOR OPERATIONS PORTAL (/supervisor.html)        |
     |  - Live Request Tracking Queue & Audit Log                            |
     |  - Agent Shift Adherence & Telemetry Wallboard                        |
     |  - Emergency Broadcast Dispatcher (Storm, SEV-1 Outage, Monday Peak)  |
     |  - Manual Override & "📞 Send Recall Bot Call" Controls              |
     +-----------------------------------------------------------------------+
```

---

## 2. Feature Implementation Matrix

| Requirement / Feature | Implementation Details | Verification / How to Test |
| :--- | :--- | :--- |
| **Web Redirection for Break Apply** | Clicking **"☕ Apply Break"** in the chatbot opens `/portal.html` in a separate browser window. Agents must authenticate with credentials/token, select AUX code, duration, and options. | Click **"☕ Apply Break"** in the widget header. Verify popup opens at `/portal.html`. |
| **1. ACD & WFM Forecasting Approval** | Evaluates active agents against forecast ACD queue. Approves if projected SLA $\ge 80\%$ with staffing buffer; auto-rejects if queue depth causes staffing deficit. Sends record to Supervisor. | Select `Alex Morgan (AGT-8842)`, submit 15m break. Result: **Auto-Approved** with +4 staffing buffer. |
| **2. Behavioral Auto-Approval/Rejection** | • **Tea Breaks**: Rejects if agent logged $\ge 3$ short breaks today.<br>• **Lunch Overages**: Rejects if prior shift lunch variance exceeded scheduled time by $\ge 15$ mins. | • Select `Jordan Miller (AGT-4092)` (4 teas) $\rightarrow$ **Auto-Rejected (Tea Pattern)**.<br>• Select `Samantha Vance (AGT-9102)` (+25m lunch) $\rightarrow$ **Auto-Rejected (Lunch Pattern)**. |
| **3. Troubleshooting Articles (System & VPN)** | Searchable KB with category filters: Cisco AnyConnect Error 412, GlobalProtect 502, Citrix VDI Black Screen, VoIP Audio/SIP Error 408, Softphone AUX Lockout. Interactive Self-Healing console. | Open **🔧 Articles** tab in widget. Type "VPN". Click "Flush DNS", "Ping VPN Gateway", or "Reset Audio Driver". |
| **4. Proactive Alerts & Monday High-Traffic Mode** | Proactive warning banners for storms/tornadoes. Monday High-Traffic Mode restricts non-critical AUX codes, activates high concurrency, and notifies agents. | Open **🚨 Alerts & Sim** tab. Click `🌪️ Trigger Tornado Alert` or `📈 Toggle Monday High-Traffic Mode`. |
| **5. Request Frequency Limiter** | Rate-limits submissions (max 3 requests within 30 minutes). Rejects excess attempts with a 15-minute cooldown. | Select `David Chen (AGT-7740)` (3 requests in history) and submit break $\rightarrow$ **Auto-Rejected (Frequency Limit)**. |
| **6. Emergency Broadcasting System** | Supervisor can broadcast emergency tickers (Severe Storm, SEV-1 Outage, Monday Peak) with warning sound chimes and desktop notification banners. | In Supervisor Portal (`/supervisor.html`), click `🌪️ Tornado / Storm Warning` $\rightarrow$ Instantly appears on agent widget! |
| **7. Countdown, 2-Min Warning & Overdue Bot Voice Call** | • Real-time countdown timer with progress bar.<br>• **2-Minute Warning**: Plays an alert chime & displays warning notice at 02:00 remaining.<br>• **Overdue Bot Voice Call**: If break exceeds scheduled time, plays ringing audio and speaks aloud via Web Speech API (`SpeechSynthesisUtterance`). | Open **🚨 Alerts & Sim** tab. Click `⏱️ Trigger 2-Min Break End Alert` or `📞 Trigger Overdue Bot Call Alert`. |
| **Customer Ask Shankar & Instant Summary** | Live customer call timer, suggested replies with 1-click "Copy to Chat", and "Generate Instant Call Summary (ACW)" for CRM. | Open **💬 Ask Shankar** tab in widget. Click "Copy to Chat" or click "Generate Instant Call Summary (ACW)". |

---

## 3. Pre-Configured Agent User Personas

Six distinct personas are built into the system and selectable from both the **Desktop Widget header** and the **Break Web Portal**:

| Agent ID | Name | Campaign / Queue | Profile & Behavioral History | Expected WFM Engine Decision |
| :--- | :--- | :--- | :--- | :--- |
| **`AGT-8842`** | **Alex Morgan** | Tier-2 Tech Support | Adherence 96.4%, 1 Tea Break, 0m Lunch Over | **Auto-Approved** (Standard healthy buffer) |
| **`AGT-4092`** | **Jordan Miller** | Customer Billing & Retention | Adherence 78.5%, 4 Tea Breaks taken today | **Auto-Rejected** (Excessive tea break pattern) |
| **`AGT-9102`** | **Samantha Vance** | Customer Billing & Retention | Adherence 71.2%, +25m lunch overage on last shift | **Auto-Rejected** (Chronic lunch overage pattern) |
| **`AGT-7740`** | **David Chen** | Emergency Inbound | Adherence 82.0%, 3 break requests in 10 minutes | **Auto-Rejected** (Request frequency limit exceeded) |
| **`AGT-6512`** | **Rachel Green** | Customer Billing & Retention | Adherence 98.2%, Medical Exemption on file | **Priority Approved** (Medical override granted) |
| **`AGT-8819`** | **Marcus Brody** | Emergency Inbound | Adherence 91.0%, New hire trainee | **Approved / Tracked** (Training AUX scheduled) |

---

## 4. Codebase Inventory & File Roles

```
aux-chatbot/
├── server.js               # Pure Node.js HTTP server & autonomous WFM Erlang-C decision engine
├── run-widget.bat          # 1-click Windows launcher (starts server & launches frameless Edge App Mode)
├── README.md               # User manual, port list, and testing instructions
├── PROJECT_SUMMARY_AND_PORTING_GUIDE.md # This complete runbook & porting guide
└── src/
    ├── widget.html         # Desktop Chatbot Widget user interface
    ├── widget.css          # Glassmorphic contact center styling & incoming call dialogs
    ├── widget.js           # Widget controller (Copilot, timer, 2-min alert, Web Speech bot call)
    ├── portal.html         # Break application & authentication web portal
    ├── portal.css          # Styling for the web portal
    ├── portal.js           # Portal client logic (SSO auth, persona picker, decision modal sync)
    ├── supervisor.html     # Supervisor Command Center dashboard
    ├── supervisor.css      # Operations command center styling & telemetry table
    └── supervisor.js       # Supervisor logic (real-time queue poll, wallboard, broadcast dispatcher)
```

> [!NOTE]
> **Zero External Dependency Design**: The backend uses pure Node.js standard libraries (`http`, `fs`, `path`, `url`). It requires no `node_modules` downloads and starts in under 1 second on any device with Node.js installed.

---

## 5. Porting & Running on Any Other Device

### Prerequisites
The only prerequisite on the target machine is **Node.js** (version 16 or newer).
Verify by running:
```bash
node -v
```

---

### Method A: Running on Another Windows PC

1. **Copy the Folder**:
   Copy the entire `aux-chatbot` directory to the target PC (e.g., to Desktop or `C:\aux-chatbot`).
2. **Launch via 1-Click Script**:
   Double-click `run-widget.bat`.
   *This automatically starts the server in the background and opens the Desktop Chatbot Widget in dedicated Microsoft Edge App Mode (`--app=http://localhost:4000/widget.html`).*
3. **Open the Supervisor Portal**:
   Open Edge or Chrome and navigate to:
   ```
   http://localhost:4000/supervisor.html
   ```

---

### Method B: Running on macOS (MacBook / iMac)

1. **Copy the Folder**:
   Transfer the `aux-chatbot` folder to the Mac (e.g., `~/Desktop/aux-chatbot`).
2. **Start the Server**:
   Open Terminal and run:
   ```bash
   cd ~/Desktop/aux-chatbot
   node server.js
   ```
3. **Launch the Widget in Native App Mode**:
   In another Terminal tab, run Chrome or Edge in standalone application mode:
   ```bash
   # Using Google Chrome in dedicated App Mode:
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --app="http://localhost:4000/widget.html" --window-size=440,780

   # Or using Microsoft Edge for Mac:
   /Applications/Microsoft\ Edge.app/Contents/MacOS/Microsoft\ Edge --app="http://localhost:4000/widget.html" --window-size=440,780
   ```
4. **Open Supervisor Portal**:
   Open any browser at `http://localhost:4000/supervisor.html`.

---

### Method C: Running on Linux (Ubuntu / Debian / Fedora)

1. Open Terminal:
   ```bash
   cd /path/to/aux-chatbot
   node server.js
   ```
2. Launch Chromium or Google Chrome in app mode:
   ```bash
   chromium-browser --app="http://localhost:4000/widget.html" --window-size=440,780 &
   ```

---

### Method D: Running Across Multiple Devices on the Same Local Network (LAN / Wi-Fi)

You can run `server.js` on **one host computer** (e.g., the Supervisor's PC), and have multiple agent workstations on the floor connect to it over the local network:

1. **Find Host IP Address**:
   - On Windows: Run `ipconfig` (find your IPv4 address, e.g., `192.168.1.50`).
   - On Mac/Linux: Run `ifconfig` or `ip a`.
2. **Start the Server on the Host PC**:
   ```bash
   node server.js
   ```
   *(Node's `http.createServer` automatically listens on all local interfaces `0.0.0.0`)*.
3. **Connect from Agent Laptops/PCs**:
   - Agent Workstation 1 opens: `http://192.168.1.50:4000/widget.html`
   - Agent Workstation 2 opens: `http://192.168.1.50:4000/widget.html`
   - Supervisor opens: `http://192.168.1.50:4000/supervisor.html`
4. Requests submitted by agents on their respective laptops instantly populate the Supervisor Command Center over the network!

---

## 6. REST API Reference

The backend exposes lightweight JSON endpoints:

### `POST /api/evaluate-break`
Evaluates a break request against ACD forecasting and behavioral history.
- **Request Body**:
  ```json
  {
    "id": "REQ-10029",
    "agent": {
      "id": "AGT-8842",
      "name": "Alex Morgan",
      "recentBreaksToday": 1,
      "lunchOverageHistoryMinutes": 0
    },
    "auxCode": "AUX-2: Short Break / Tea",
    "durationMinutes": 15,
    "urgency": "Normal",
    "notes": "Handover to Sara"
  }
  ```
- **Response**:
  ```json
  {
    "status": "APPROVED",
    "code": "AUTO_APPROVED_WFM",
    "title": "AUX Break Request Auto-Approved!",
    "description": "WFM Erlang-C forecast confirms adequate staffing buffer...",
    "metrics": {
      "AUX Code": "AUX-2: Short Break / Tea",
      "Approved Duration": "15 minutes",
      "Staffing Buffer": "+4 agents surplus (Projected SLA 86.8%)"
    }
  }
  ```

### `GET /api/supervisor-queue`
Returns the recent audit list of all dispatched requests and outcomes.

---

## 7. Step-by-Step Stakeholder Demo Script

When demonstrating the system to leadership or stakeholders, follow this flow:

1. **Show the Desktop Chatbot Widget**:
   - Point out the clean contact center floating widget design.
   - Show the live call status, customer inquiry suggested replies, and click **"Generate Instant Call Summary (ACW)"**.
   - Show the **🔧 Articles** tab with one-click DNS flush and VPN ping self-healing tools.
2. **Demonstrate Web Redirection for Breaks**:
   - Click **"☕ Apply Break"** $\rightarrow$ Show the dedicated **Web Portal** popup.
   - Demonstrate the agent SSO authentication step, AUX code categories, and time duration selection.
   - Click **Submit** $\rightarrow$ Show the Erlang-C ACD forecasting evaluation modal and auto-approval.
3. **Demonstrate Behavioral Pattern Auto-Rejections**:
   - In the widget header, switch to **`Jordan Miller (AGT-4092)`** $\rightarrow$ Click **"Apply Break"** $\rightarrow$ Submit $\rightarrow$ Show instant rejection: *"Auto-Rejected: Tea Break Frequency Pattern Exceeded (4 breaks taken today)"*.
   - Switch to **`Samantha Vance (AGT-9102)`** $\rightarrow$ Submit $\rightarrow$ Show instant rejection: *"Auto-Rejected: Chronic Extra Lunch Pattern Detected (+25m prior variance)"*.
   - Switch to **`David Chen (AGT-7740)`** $\rightarrow$ Submit $\rightarrow$ Show instant rejection: *"Auto-Rejected: Request Frequency Limit Exceeded (3 requests / 10m)"*.
4. **Demonstrate 2-Minute Pre-Expiration Notice**:
   - In widget tab **🚨 Alerts & Sim**, click `⏱️ Trigger 2-Min Break End Alert`.
   - Listen to the audio alert chime and observe the orange 2-minute countdown banner.
5. **Demonstrate Overdue Automated Bot Voice Call**:
   - Click `📞 Trigger Overdue Bot Call Alert`.
   - Listen to the synthesized telephone ringtone followed by the text-to-speech voice bot demanding the agent return to their workstation.
   - Click **"Acknowledge & Return to Workstation"** to resume ready state.
6. **Demonstrate Supervisor Command Center**:
   - Open `http://localhost:4000/supervisor.html`.
   - Show the live audit queue populated with all the previous approvals and rejections.
   - Click `🌪️ Tornado / Storm Warning` in the Emergency Dispatcher and watch the critical broadcast ticker instantly appear across all agent widgets!
