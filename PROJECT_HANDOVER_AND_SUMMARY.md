# ZEL: Autonomous WFM & AI Copilot Platform — Project Handover & Context Summary

## 1. Project Overview & Identity
* **Project Name**: ZEL (Autonomous WFM & AI Copilot Platform for NICE CXone)
* **Official Tagline**: *"Zero wait to leave, zero wait to return"*
* **GitHub Repository**: https://github.com/manojmaddula/aux-chatbot-.git
* **Primary Branch**: `main`
* **Local Working Directory**: `C:\Users\GenAIKOCVISUSR7\Desktop\aux-chatbot`

---

## 2. Core Architecture & Tech Stack
* **Backend**: Node.js HTTP server running on port `4000` (`server.js`).
* **Desktop App**: Electron 30 with Windows Taskbar `AppUserModelId` (`com.nicexone.auxcopilot.panda`), multi-resolution ICO (`16x16` to `256x256`), and always-on-top CTI floating overlay.
* **Frontend**: Vanilla ES6+, HTML5, CSS3 (white/clean background theme), SVG icons, and HTML5 `BroadcastChannel` (`wfm_aux_channel`) for microsecond P2P telemetry sync across tabs/windows.
* **Core Math Engine**: Erlang-C mathematical capacity gating evaluating arrival rates (λ), handle times (μ), and required staffing (N) in `<100ms`.

---

## 3. Key Personas & Feature Capabilities

### A. Front-Line Agent Workspace (AUXY / ZEL)
* **Floating Widget (`src/widget.html`)**: Always-on-top desktop companion synced to NICE CXone MAX CTI states (`AVAILABLE`, `WORKING`, `AUX: TEA`, `AUX: LUNCH`, `AUX: TRAINING`, `AUX: SYSTEM ISSUE`).
* **Dedicated Agent Home (`src/agent-home.html`)**: Independent agent workstation with zero links/redirects to supervisor portals.
* **Instant ACW Summarizer**: 1-Click AI summarization formatting intent, steps, and resolution into CRM wrap-up notes (cuts ACW from 68s to 34s).
* **Live Speech Suggestions**: Real-time customer objection handling and compliance disclosures.
* **Discretionary Break Portal (`src/portal.html`)**: "Zero wait to leave" — agents click Tea/Bio/Lunch; Erlang-C checks queue capacity; if staffing ≥80%, grants instant 15m approval. Live on-screen countdown timer prevents adherence drift.
* **AUX-5 IT Incident Reporting**: Direct logging for Citrix lag, VPN disconnects, and packet loss.

### B. Supervisor Command Center (`src/supervisor.html`)
* **Floor Wallboard & Telemetry (Tab 1)**: Real-time agent status, break timers, adherence %, tea counts, and lunch variance. Features automated **Bot Voice Desk Recall** (synthesizes audio call to agent's desk widget).
* **Supervisor-to-Agent Scoped Team Tagging**:
  * **Sarah Jenkins (`SUP-014`)**: Samantha Vance (`AGT-9102`), Rachel Green (`AGT-6512`), Marcus Brody (`AGT-8819`), Chloe Bennett (`AGT-3310`).
  * **Michael Chang (`SUP-021`)**: Jordan Miller (`AGT-4092`), Lucas Wright (`AGT-5521`), Maya Patel (`AGT-7703`).
  * **Elena Rostova (`SUP-035`)**: Alex Morgan (`AGT-8842`), Carlos Mendez (`AGT-4491`).
  * **David Sterling (`SUP-042`)**: David Chen (`AGT-7740`), Olivia Taylor (`AGT-6628`).
  * **Priya Sharma (`SUP-059`)**: Liam O'Connor (`AGT-2219`).
  * **Floor Toggle**: `[ ★ My Assigned Team (N) ]` (default) vs `[ 🌐 All Floor (12) ]`.
* **Break Requests Queue (Tab 2)**: Incoming Erlang-C requests automatically tagged and filtered by supervisor with 1-click manual overrides.
* **Alert & Broadcast Setup (Tab 3)**: Dispatches emergency advisories (Tornado, Sev-1 Outage, Monday Traffic) to all agent widgets.
* **Storm Disaster IVR Auto-Deflection Engine (Tab 3)**: Automatically monitors live arrival rates. When traffic hits 1,000 calls/min, call 1001+ receives automated voice announcements, auto-disabling when volume normalizes.
* **Agent Reports & Analytics (Tab 4)**: Scoped reports for Adherence, AUX Time Distribution, Break Violations, Request Throttling, and ACW Handle Times.
* **QA Speech Tone & Coaching Scorecard (Tab 5)**: Audits customer sentiment (Empathetic, Neutral, Rude, Bad), query resolution, and security PIN verification. Dispatches LMS coaching modules (`MOD-101` to `MOD-104`).
* **Dynamic WFM Skill Flex Engine (Tab 6 & Tab 1 Console)**:
  * 6 Live Queues: Customer Billing, General Customer Service, Tier-2 Tech Support, Emergency Inbound, Spanish Inbound, Outbound Collections.
  * `⚡ 1. Simulate Surge (+318)`: Simulates sudden billing queue spike (ASA 9m, SLA drops to 34.5%).
  * `🔄 2. Reallocate 3 Agents Now`: Flexes 3 idle CS agents to Billing; calls collapse to 48 and SLA recovers to 88.5%.
  * `🟢 3. Restore Base`: Normalizes volume and returns agents to regular shift schedules.
* **REMI Supervisor AI Copilot (Drawer)**: Provides 360° agent dossiers and deep analytical reports (Speech Tone vs CSAT Correlation, Burnout Risk, Erlang-C Deficits, Chronic Adherence Outliers).

---

## 4. Deliverables & Documentation in Repository
1. `NICE_CXone_WFM_Copilot_Architecture_and_Overview.pptx` & `Zel.ppt`:
   * 4-Slide executive presentation with ZEL branding, tagline *"Zero wait to leave, zero wait to return"*, mascot visual, 4-step interactive pipeline flow, before/after comparison, and ROI metric cards.
2. `NICE_CXone_WFM_Copilot_Architecture_and_System_Design.docx`: Full technical specification document.
3. `ARCHITECTURE_AND_SYSTEM_DESIGN.md`: Complete markdown architecture specification with Mermaid sequence and flow diagrams.
4. `architecture_diagram.svg`: Standalone 4-tier vector architecture diagram.
5. `ppt.ods`: Spreadsheet presentation notes.
6. `PROJECT_HANDOVER_AND_SUMMARY.md`: This comprehensive handover summary.

---

## 5. Quick Verification Commands
* Start background server: `node server.js` (runs on `http://localhost:4000`)
* Agent Copilot Home: `http://localhost:4000/agent-home.html`
* Agent Floating Widget: `http://localhost:4000/widget.html`
* Break Portal: `http://localhost:4000/portal.html`
* Supervisor Command Center: `http://localhost:4000/supervisor.html`
* Launch Electron Desktop Client: `npm start`
