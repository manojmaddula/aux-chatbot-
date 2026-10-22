import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path):
    prs = Presentation()
    # Set 16:9 Widescreen dimensions (13.333 x 7.5 inches)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette: Corporate NICE CXone Navy, Cobalt, Emerald, Slate
    BG_DARK = RGBColor(10, 25, 47)         # #0a192f
    BG_LIGHT = RGBColor(248, 250, 252)     # #f8fafc
    CARD_BG = RGBColor(255, 255, 255)      # #ffffff
    PRIMARY = RGBColor(37, 99, 235)        # #2563eb
    PRIMARY_DARK = RGBColor(30, 58, 138)   # #1e3a8a
    ACCENT_CYAN = RGBColor(14, 165, 233)   # #0ea5e9
    SUCCESS = RGBColor(5, 150, 105)        # #059669
    DANGER = RGBColor(220, 38, 38)         # #dc2626
    WARNING = RGBColor(217, 119, 6)        # #d97706
    TEXT_MAIN = RGBColor(15, 23, 42)       # #0f172a
    TEXT_MUTED = RGBColor(100, 116, 139)   # #64748b
    BORDER_COLOR = RGBColor(226, 232, 240) # #e2e8f0

    def add_header(slide, title_text, category_text):
        # Header banner shape
        banner = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.15))
        banner.fill.solid()
        banner.fill.fore_color.rgb = BG_DARK
        banner.line.color.rgb = BG_DARK

        # Category pill text
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.16), Inches(11.5), Inches(0.3))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = ACCENT_CYAN

        # Title text
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.42), Inches(11.5), Inches(0.6))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = RGBColor(255, 255, 255)

    def add_card(slide, left, top, width, height, title, subtitle="", border_color=BORDER_COLOR, bg_color=CARD_BG):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)

        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.18), width - Inches(0.4), height - Inches(0.36))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.TOP

        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = PRIMARY_DARK

        if subtitle:
            p_s = tf.add_paragraph()
            p_s.text = subtitle
            p_s.font.size = Pt(10)
            p_s.font.italic = True
            p_s.font.color.rgb = TEXT_MUTED
            p_s.space_after = Pt(8)

        return tf

    # =========================================================================
    # SLIDE 1: Executive Overview & Product Vision
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_header(s1, "NICE CXone Autonomous WFM & Ask Shankar Platform", "Executive Overview & Product Vision")

    # Card 1: Strategic Contact Center Problem
    tf1 = add_card(s1, Inches(0.8), Inches(1.4), Inches(5.6), Inches(4.3),
                   "The Operational Challenge in Legacy Contact Centers",
                   "Manual AUX States, Opaque Floor Drift & Burnout Risk")
    bullets1 = [
        ("Discretionary AUX Blind Spots", "Agents manually toggle break codes without real-time Erlang-C staffing checks, leading to severe intraday queue starvation."),
        ("Sudden Inbound Queue Surges", "Volume spikes (+300 calls) instantly drop SLAs from 85% to 34% while donor queues remain idle and underutilized."),
        ("Post-Call Wrap-up (ACW) Latency", "Agents spend 60-90s manually entering CRM wrap-up notes, degrading handle times and inflating operational cost."),
        ("Regional Disaster Outages", "Severe storms flood queues past 1,000 calls/min with no automated front-line deflection, paralyzing live agents.")
    ]
    for b_title, b_desc in bullets1:
        p = tf1.add_paragraph()
        p.text = f"• {b_title}: "
        p.font.bold = True
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_MAIN
        run = p.add_run()
        run.text = b_desc
        run.font.bold = False
        run.font.size = Pt(10)
        run.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(6)

    # Card 2: Autonomous WFM & Ask Shankar Solution
    tf2 = add_card(s1, Inches(6.8), Inches(1.4), Inches(5.7), Inches(4.3),
                   "The Autonomous AI-Powered WFM Solution",
                   "Dual Agent & Supervisor Intelligence Ecosystem")
    bullets2 = [
        ("ZEL Ask Shankar Desktop Assistant", "Always-on-top Electron companion providing 1-click ACW call summarization, live speech tone guidance, and CTI status sync."),
        ("Autonomous Break Gatekeeper", "Real-time Erlang-C staffing capacity evaluation approving/throttling tea, bio, and lunch breaks instantly."),
        ("Dynamic Cross-Skill Rebalance", "Auto-detects queue load imbalances and reallocates certified cross-skilled agents in real-time, restoring SLAs to 88.5%."),
        ("Storm Disaster Auto-Deflection", "Automated front-end IVR speech deflection triggering at 1,000 calls/min, protecting agents during emergency outages.")
    ]
    for b_title, b_desc in bullets2:
        p = tf2.add_paragraph()
        p.text = f"• {b_title}: "
        p.font.bold = True
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_MAIN
        run = p.add_run()
        run.text = b_desc
        run.font.bold = False
        run.font.size = Pt(10)
        run.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(6)

    # Bottom Banner: Strategic Impact
    bot_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.95), Inches(11.7), Inches(1.15))
    bot_card.fill.solid()
    bot_card.fill.fore_color.rgb = RGBColor(238, 242, 255) # Indigo tint
    bot_card.line.color.rgb = PRIMARY
    bot_tf = bot_card.text_frame
    bot_tf.word_wrap = True
    p_b1 = bot_tf.paragraphs[0]
    p_b1.text = "CORE TRANSFORMATION PRINCIPLE: FROM PASSIVE LOGGING TO AUTONOMOUS QUEUE DEFENSE"
    p_b1.font.size = Pt(11)
    p_b1.font.bold = True
    p_b1.font.color.rgb = PRIMARY_DARK
    p_b2 = bot_tf.add_paragraph()
    p_b2.text = "By pairing an always-on floating Ask Shankar with an intelligent Supervisor Telemetry Command Center, the platform replaces guesswork with microsecond Erlang-C mathematical balance, safeguarding SLAs while elevating agent well-being."
    p_b2.font.size = Pt(9.5)
    p_b2.font.color.rgb = TEXT_MAIN

    # =========================================================================
    # SLIDE 2: Core Platform Capabilities & Feature Matrix
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Platform Capabilities & Feature Matrix", "Dual-Persona Agent & Supervisor Architecture")

    # 4 Quadrant Cards
    # Q1: Agent Ask Shankar (AUXY)
    tf_q1 = add_card(s2, Inches(0.8), Inches(1.4), Inches(5.6), Inches(2.7),
                     "1. Agent Desktop Assistant (Ask Shankar)", "Companion Widget for Front-Line Staff")
    items_q1 = [
        "Instant ACW Summarizer: Auto-generates structured CRM wrap-up notes.",
        "Live Speech Suggestions: Real-time objections handling and compliance prompts.",
        "Discretionary Break Portal: Autonomous 15-minute Erlang-C capacity grant.",
        "IT Hardware Issue Log (AUX-5): Direct Citrix/VPN/audio incident ticketing."
    ]
    for it in items_q1:
        p = tf_q1.add_paragraph()
        p.text = f"✔ {it}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_MAIN
        p.space_after = Pt(3)

    # Q2: Supervisor Command Center
    tf_q2 = add_card(s2, Inches(6.8), Inches(1.4), Inches(5.7), Inches(2.7),
                     "2. Supervisor Floor Command Center", "Live Telemetry & Team Governance")
    items_q2 = [
        "Floor Telemetry Wallboard: Synchronized with NICE CXone MAX CTI engine.",
        "Scoped Team Tagging: Specific agents routed to dedicated supervisors.",
        "Automated Voice Bot Recall: Dispatches immediate synthesized call to desk.",
        "Shift Adherence Governance: Policy guardrails for lunch and tea limits."
    ]
    for it in items_q2:
        p = tf_q2.add_paragraph()
        p.text = f"✔ {it}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_MAIN
        p.space_after = Pt(3)

    # Q3: Dynamic WFM Rebalance Engine
    tf_q3 = add_card(s2, Inches(0.8), Inches(4.35), Inches(5.6), Inches(2.7),
                     "3. Dynamic WFM Skill Flex Engine", "Intraday Queue Balancing & Surge Defense")
    items_q3 = [
        "6 Telephony Queues: Billing, Support, Emergency, CS, Bilingual, Collections.",
        "Surge Simulation: Simulates +318 calls spike (ASA 9m, SLA drop to 34.5%).",
        "1-Click Cross-Skilling: Flexes 3 idle CS agents to Billing in microsecond sync.",
        "Volume Normalization: 1-click restore to base schedules when traffic clears."
    ]
    for it in items_q3:
        p = tf_q3.add_paragraph()
        p.text = f"✔ {it}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_MAIN
        p.space_after = Pt(3)

    # Q4: QA Sentiment & IVR Deflection
    tf_q4 = add_card(s2, Inches(6.8), Inches(4.35), Inches(5.7), Inches(2.7),
                     "4. QA Speech Sentiment & IVR Deflection", "Quality Auditing & Disaster Resilience")
    items_q4 = [
        "Speech Sentiment Detection: Classifies Empathetic, Neutral, Rude, or Bad tone.",
        "LMS Coaching Dispatch: Assigns targeted modules (MOD-101 to 104) directly.",
        "Storm IVR Deflection: Auto-engages automated voice advisories at 1,000 calls/min.",
        "Caller Audio Testing: Synthesized text-to-speech announcement simulation."
    ]
    for it in items_q4:
        p = tf_q4.add_paragraph()
        p.text = f"✔ {it}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_MAIN
        p.space_after = Pt(3)

    # =========================================================================
    # SLIDE 3: Detailed Technical Architecture & Data Flow
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "End-to-End System Architecture & Data Flow", "Multi-Tier Event-Driven Distributed Design")

    # 3 Horizontal Architecture Tiers
    # Tier 1: Client & Presentation Tier
    tf_t1 = add_card(s3, Inches(0.8), Inches(1.4), Inches(11.7), Inches(1.6),
                     "Tier 1: Client Application & Presentation Layer (Dual-Persona UX)",
                     "Electron Desktop App + Modern Responsive Web Gateway")
    p1 = tf_t1.add_paragraph()
    p1.text = "• Electron Desktop Widget: Floating Windows client with AppUserModelId taskbar integration, always-on-top CTI overlay, and local sound alerts.\n• HTML5 Operations Gateway: Minimalist hub connecting Agent Home, Break Portal, and Supervisor Command Center.\n• Multi-DPI Panda Branding: High-contrast 256x256 ICO, crisp vector SVG, and retina PNG assets rendering cleanly across OS taskbars."
    p1.font.size = Pt(10)
    p1.font.color.rgb = TEXT_MAIN

    # Tier 2: Real-time Communication & Telemetry Bus
    tf_t2 = add_card(s3, Inches(0.8), Inches(3.2), Inches(11.7), Inches(1.6),
                     "Tier 2: Real-time Telemetry Server & Event Bus (Node.js & BroadcastChannel)",
                     "Sub-Millisecond Synchronization Across Desktop & Browser Sessions")
    p2 = tf_t2.add_paragraph()
    p2.text = "• Node.js Event Gateway (Port 4000): Non-blocking HTTP/REST APIs for break evaluation, policy limits, IT tickets, and Ask Shankar queries.\n• HTML5 BroadcastChannel ('wfm_aux_channel'): P2P client bus dispatching policy updates, recall voice alerts, and mandatory coaching.\n• Scoped Access Control: Supervisor-to-agent tagging routes telemetry and break approvals to the agent's assigned manager."
    p2.font.size = Pt(10)
    p2.font.color.rgb = TEXT_MAIN

    # Tier 3: Core Analytical Engines & Telephony Integration
    tf_t3 = add_card(s3, Inches(0.8), Inches(5.0), Inches(11.7), Inches(1.8),
                     "Tier 3: Analytical Core Engines & NICE CXone Telephony Gateway",
                     "Erlang-C Staffing Math, Speech Sentiment Processing & CTI State Engine")
    p3 = tf_t3.add_paragraph()
    p3.text = "• Autonomous Erlang-C Engine: Continuously calculates call arrival rate (λ), average handle time (μ), and required agents (N).\n• REMI Supervisor Ask Shankar: Natural language semantic query processor returning agent 360° dossiers and burnout risk scores.\n• NICE CXone CTI Connector: Simulated MAX softphone state machine maintaining Available, Working, AUX, and ACW state transitions.\n• IVR Auto-Deflection Engine: Throttles call arrival surges past 1,000 calls/min, diverting callers to emergency voice scripts."
    p3.font.size = Pt(10)
    p3.font.color.rgb = TEXT_MAIN

    # =========================================================================
    # SLIDE 4: Business Value, ROI & Operational Impact
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Business Value, Measurable ROI & Operational Outcomes", "Quantifiable Impact on Contact Center Operations")

    # 4 Top Stat Metric Cards
    metrics = [
        ("+18.4%", "Schedule Adherence", "Eliminates unscheduled AUX overages through automated policy limits.", SUCCESS),
        ("-45 Sec", "ACW Handle Time", "AI call summarization cuts CRM documentation time in half.", PRIMARY),
        ("34% ➔ 89%", "Instant SLA Recovery", "Cross-skill rebalance clears 300+ surge calls within minutes.", ACCENT_CYAN),
        ("1,000/m", "Storm Deflection", "Protects live agents from being overwhelmed during severe disaster outages.", WARNING)
    ]

    for idx, (val, title, desc, col) in enumerate(metrics):
        x = Inches(0.8 + idx * 3.0)
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.4), Inches(2.8), Inches(2.2))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = col
        card.line.width = Pt(2)

        tb = s4.shapes.add_textbox(x + Inches(0.15), Inches(1.5), Inches(2.5), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True

        p_v = tf.paragraphs[0]
        p_v.text = val
        p_v.font.size = Pt(26)
        p_v.font.bold = True
        p_v.font.color.rgb = col
        p_v.alignment = PP_ALIGN.CENTER

        p_t = tf.add_paragraph()
        p_t.text = title
        p_t.font.size = Pt(11)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_MAIN
        p_t.alignment = PP_ALIGN.CENTER
        p_t.space_after = Pt(4)

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(9)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.alignment = PP_ALIGN.CENTER

    # Strategic ROI Pillars Below
    tf_roi = add_card(s4, Inches(0.8), Inches(3.9), Inches(11.7), Inches(3.1),
                      "Three Pillars of Enterprise Operational ROI",
                      "Workforce Optimization, Agent Well-being & Executive Governance")
    pillars = [
        ("Pillar 1: Intraday Workforce Optimization (WFM)",
         "Automated Erlang-C calculations remove manual break log approvals. Intraday queue rebalancing rescues service levels without paying overtime or calling in emergency off-shift staff."),
        ("Pillar 2: Agent Retention & Fatigue Mitigation",
         "Post-call AI summarization prevents cognitive ACW fatigue. Burnout detection algorithms flag consecutive call strain, ensuring high-risk agents receive timely rest intervals before customer sentiment suffers."),
        ("Pillar 3: High-Visibility Supervisor Governance",
         "Supervisors transition from spreadsheet monitors to proactive coaches. Scoped team views ensure each manager focuses on their direct reports, with automated voice recalls and 1-click coaching assignment.")
    ]
    for p_title, p_desc in pillars:
        p = tf_roi.add_paragraph()
        p.text = f"• {p_title}: "
        p.font.bold = True
        p.font.size = Pt(10)
        p.font.color.rgb = PRIMARY_DARK
        run = p.add_run()
        run.text = p_desc
        run.font.bold = False
        run.font.size = Pt(9.5)
        run.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(6)

    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    out = os.path.join(r"C:\Users\GenAIKOCVISUSR7\Desktop\aux-chatbot", "NICE_CXone_WFM_Copilot_Architecture_and_Overview.pptx")
    create_deck(out)
