import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette
    COLOR_BG = RGBColor(248, 250, 252)         # #F8FAFC
    COLOR_NAVY = RGBColor(15, 23, 42)          # #0F172A
    COLOR_PRIMARY = RGBColor(37, 99, 235)      # #2563EB
    COLOR_ACCENT = RGBColor(16, 185, 129)      # #10B981
    COLOR_CARD_BG = RGBColor(255, 255, 255)    # #FFFFFF
    COLOR_BORDER = RGBColor(226, 232, 240)     # #E2E8F0
    COLOR_MUTED = RGBColor(100, 116, 139)      # #64748B
    COLOR_RED = RGBColor(239, 68, 68)          # #EF4444
    COLOR_LIGHT_BLUE = RGBColor(239, 246, 255) # #EFF6FF

    # -------------------------------------------------------------
    # SLIDE 1: App Name, Tagline, Problem Statement, Effected Persons
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)

    # Background fill
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = COLOR_BG
    bg1.line.color.rgb = COLOR_BG

    # Top Header Banner
    header_box = s1.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.4))
    tf1 = header_box.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

    p_badge = tf1.paragraphs[0]
    p_badge.text = "EXECUTIVE PITCH DECK  •  TARGET DURATION: 1:30 - 2:00 MIN"
    p_badge.font.size = Pt(11)
    p_badge.font.bold = True
    p_badge.font.color.rgb = COLOR_PRIMARY

    p_title = tf1.add_paragraph()
    p_title.text = "ZEL Copilot & Autonomous AUX Assistant"
    p_title.font.size = Pt(28)
    p_title.font.bold = True
    p_title.font.color.rgb = COLOR_NAVY

    p_tagline = tf1.add_paragraph()
    p_tagline.text = "Intelligent Workforce Operations, Autonomous ACW Generation & Dynamic Intraday Floor Rebalancing"
    p_tagline.font.size = Pt(13)
    p_tagline.font.color.rgb = COLOR_MUTED

    # Left Column: Problem Statement Card
    p_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.1), Inches(6.0), Inches(4.7))
    p_card.fill.solid()
    p_card.fill.fore_color.rgb = COLOR_CARD_BG
    p_card.line.color.rgb = COLOR_BORDER
    p_card.line.width = Pt(1.5)

    p_text = s1.shapes.add_textbox(Inches(1.1), Inches(2.3), Inches(5.4), Inches(4.3))
    ptf = p_text.text_frame
    ptf.word_wrap = True
    
    pt0 = ptf.paragraphs[0]
    pt0.text = "🚨  The Problem Statement"
    pt0.font.size = Pt(18)
    pt0.font.bold = True
    pt0.font.color.rgb = COLOR_NAVY

    pt1 = ptf.add_paragraph()
    pt1.text = "Contact centers face a high-friction operational bottleneck:"
    pt1.font.size = Pt(12)
    pt1.font.color.rgb = COLOR_MUTED
    pt1.space_before = Pt(8)

    problems = [
      ("Administrative ACW Drag", "Agents spend 20-30% of shift time typing manual wrap-up notes, stalling queue throughput."),
      ("Manual AUX Code Bottlenecks", "Supervisors are inundated with break requests, creating queue blind spots and adherence violations."),
      ("Rigid Queue Allocation", "Sudden billing/outage call spikes overwhelm queues while other agent pools sit underutilized."),
      ("Delayed QA & Tone Remediation", "Coaching is retrospective (days later), allowing negative customer sentiment to compound.")
    ]
    for title, desc in problems:
        p_item = ptf.add_paragraph()
        p_item.text = f"• {title}: "
        p_item.font.bold = True
        p_item.font.size = Pt(11)
        p_item.font.color.rgb = COLOR_NAVY
        p_item.space_before = Pt(6)
        
        # Add non-bold description
        run = p_item.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = COLOR_MUTED

    # Right Column: Affected Personas Card
    aff_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.1), Inches(2.1), Inches(5.4), Inches(4.7))
    aff_card.fill.solid()
    aff_card.fill.fore_color.rgb = COLOR_CARD_BG
    aff_card.line.color.rgb = COLOR_BORDER
    aff_card.line.width = Pt(1.5)

    aff_text = s1.shapes.add_textbox(Inches(7.4), Inches(2.3), Inches(4.8), Inches(4.3))
    atf = aff_text.text_frame
    atf.word_wrap = True

    at0 = atf.paragraphs[0]
    at0.text = "👥  Effected Personas"
    at0.font.size = Pt(18)
    at0.font.bold = True
    at0.font.color.rgb = COLOR_NAVY

    personas = [
      ("🎧 Frontline Agents", "Exhausted by manual CRM logging, break approval delays, and high post-call cognitive burden."),
      ("👩‍💼 Team Leads & Supervisors", "Trapped in repetitive break approvals and manual queue oversight instead of strategic coaching."),
      ("📊 WFM Planners & Operations", "Struggle with intraday Erlang-C staffing variance, missed SLA targets, and unplanned overtime costs."),
      ("🤝 End Customers", "Subjected to extended wait times, rushed agents, and fragmented resolution notes.")
    ]
    for role, impact in personas:
        p_role = atf.add_paragraph()
        p_role.text = role
        p_role.font.bold = True
        p_role.font.size = Pt(12)
        p_role.font.color.rgb = COLOR_PRIMARY
        p_role.space_before = Pt(10)

        p_desc = atf.add_paragraph()
        p_desc.text = impact
        p_desc.font.size = Pt(10.5)
        p_desc.font.color.rgb = COLOR_MUTED

    # Slide 1 Speaker Notes
    s1.notes_slide.notes_text_frame.text = (
        "SLIDE 1 TALK TRACK (0:00 - 0:35 | Duration: ~35 seconds)\n\n"
        "\"Good morning team. Today, I'm presenting ZEL Copilot & Autonomous AUX Assistant — "
        "an intelligent contact center operations platform built to solve one of the biggest friction points on the contact center floor.\n\n"
        "Today, frontline agents waste up to 25% of their shift manually documenting ACW wrap-up notes, "
        "while Team Leads are drowning in manual break approvals and intraday schedule exceptions. "
        "This friction hurts everyone: agents suffer burnout, supervisors lose coaching time, "
        "WFM leaders miss critical SLA targets, and customers experience extended queue waits. "
        "ZEL Copilot eliminates this operational gridlock through real-time automation.\""
    )

    # -------------------------------------------------------------
    # SLIDE 2: Current Issues vs How This App Resolves (Agent & TL Focus)
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)

    bg2 = s2.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg2.fill.solid()
    bg2.fill.fore_color.rgb = COLOR_BG
    bg2.line.color.rgb = COLOR_BG

    # Header Box
    h2 = s2.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.1))
    tf2 = h2.text_frame
    tf2.word_wrap = True
    p2_badge = tf2.paragraphs[0]
    p2_badge.text = "DUAL-PERSPECTIVE SOLUTION  •  FRONTLINE & LEADERSHIP"
    p2_badge.font.size = Pt(11)
    p2_badge.font.bold = True
    p2_badge.font.color.rgb = COLOR_PRIMARY

    p2_title = tf2.add_paragraph()
    p2_title.text = "Current Operational Pain Points vs. ZEL Copilot Resolution"
    p2_title.font.size = Pt(24)
    p2_title.font.bold = True
    p2_title.font.color.rgb = COLOR_NAVY

    # Column 1: Agent App Features (Left Card)
    c1 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.1))
    c1.fill.solid()
    c1.fill.fore_color.rgb = COLOR_CARD_BG
    c1.line.color.rgb = COLOR_BORDER
    c1.line.width = Pt(1.5)

    c1_txt = s2.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.7))
    c1_tf = c1_txt.text_frame
    c1_tf.word_wrap = True

    c1_h = c1_tf.paragraphs[0]
    c1_h.text = "🎧  Agent Experience & App Features"
    c1_h.font.size = Pt(16)
    c1_h.font.bold = True
    c1_h.font.color.rgb = COLOR_NAVY

    agent_points = [
      ("Manual ACW & Wrap-up Fatigue", "⚡ Auto ACW Generation & CRM Sync", "AI listens to interaction, generates structured summary, key issues, and one-click logs disposition directly to NICE CXone / CRM."),
      ("Break Uncertainty & Overages", "☕ Automated AUX Break & Countdown", "Real-time discretionary break eligibility, automated countdown timer with 2-minute wrap-up notice to preserve adherence."),
      ("Delayed Emergency Advisories", "📢 Live Broadcast & Outage Advisories", "Instant floor broadcasts, severe weather IVR auto-deflection alerts (>1,000 calls/min), and supervisor bulletins directly in-widget.")
    ]
    for pain, feature, benefit in agent_points:
        p_pain = c1_tf.add_paragraph()
        p_pain.text = f"Pain: {pain}"
        p_pain.font.size = Pt(10.5)
        p_pain.font.bold = True
        p_pain.font.color.rgb = COLOR_RED
        p_pain.space_before = Pt(8)

        p_feat = c1_tf.add_paragraph()
        p_feat.text = feature
        p_feat.font.size = Pt(11.5)
        p_feat.font.bold = True
        p_feat.font.color.rgb = COLOR_PRIMARY

        p_ben = c1_tf.add_paragraph()
        p_ben.text = benefit
        p_ben.font.size = Pt(10)
        p_ben.font.color.rgb = COLOR_MUTED

    # Column 2: Supervisor / TL Features (Right Card)
    c2 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.8), Inches(5.6), Inches(5.1))
    c2.fill.solid()
    c2.fill.fore_color.rgb = COLOR_CARD_BG
    c2.line.color.rgb = COLOR_BORDER
    c2.line.width = Pt(1.5)

    c2_txt = s2.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.2), Inches(4.7))
    c2_tf = c2_txt.text_frame
    c2_tf.word_wrap = True

    c2_h = c2_tf.paragraphs[0]
    c2_h.text = "👩‍💼  Supervisor / TL Command Features"
    c2_h.font.size = Pt(16)
    c2_h.font.bold = True
    c2_h.font.color.rgb = COLOR_NAVY

    tl_points = [
      ("Constant Break Approval Distractions", "📋 Autonomous Erlang-C Break Approvals", "Evaluates live queue volume and Erlang-C staffing surplus (+4) to auto-approve breaks in <1s without manual supervisor interruption."),
      ("Subjective / Delayed QA Coaching", "🎓 Speech Audit-Based Training Engine", "Real-time acoustic & customer tone analysis flags sentiment outliers (e.g. rude/confused) and auto-assigns targeted training modules."),
      ("Unmanaged Queue Spikes & SLA Drops", "🔄 Intraday Skill Rebalance Engine", "Instantly detects billing queue surges (+318 calls) and flexes cross-skilled Customer Service agents to billing with 1-click.")
    ]
    for pain, feature, benefit in tl_points:
        p_pain = c2_tf.add_paragraph()
        p_pain.text = f"Pain: {pain}"
        p_pain.font.size = Pt(10.5)
        p_pain.font.bold = True
        p_pain.font.color.rgb = COLOR_RED
        p_pain.space_before = Pt(8)

        p_feat = c2_tf.add_paragraph()
        p_feat.text = feature
        p_feat.font.size = Pt(11.5)
        p_feat.font.bold = True
        p_feat.font.color.rgb = COLOR_ACCENT

        p_ben = c2_tf.add_paragraph()
        p_ben.text = benefit
        p_ben.font.size = Pt(10)
        p_ben.font.color.rgb = COLOR_MUTED

    # Slide 2 Speaker Notes
    s2.notes_slide.notes_text_frame.text = (
        "SLIDE 2 TALK TRACK (0:35 - 1:20 | Duration: ~45 seconds)\n\n"
        "\"Here is how the application resolves these daily operational pains for both Agents and Team Leads.\n\n"
        "For Agents, ZEL Copilot lives directly on screen as a floating companion. "
        "It eliminates manual wrap-up by automatically generating structured ACW notes and syncing them directly to CRM. "
        "It manages AUX breaks with automated eligibility checks and a 2-minute wrap-up countdown, while delivering instant operational advisories.\n\n"
        "For Team Leads, our Supervisor Web Command Center automates the heavy lifting: "
        "it automatically approves break requests against Erlang-C staffing surplus; "
        "it performs continuous speech tone audits to proactively suggest coaching modules before CSAT drops; "
        "and when sudden volume spikes hit, the TL can execute a 1-click intraday rebalance to flex idle agents across queues.\""
    )

    # -------------------------------------------------------------
    # SLIDE 3: Business Benefits & Measurable ROI
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)

    bg3 = s3.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg3.fill.solid()
    bg3.fill.fore_color.rgb = COLOR_BG
    bg3.line.color.rgb = COLOR_BG

    # Header Box
    h3 = s3.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.1))
    tf3 = h3.text_frame
    tf3.word_wrap = True
    p3_badge = tf3.paragraphs[0]
    p3_badge.text = "BUSINESS VALUE & ROI  •  EXECUTIVE IMPACT"
    p3_badge.font.size = Pt(11)
    p3_badge.font.bold = True
    p3_badge.font.color.rgb = COLOR_PRIMARY

    p3_title = tf3.add_paragraph()
    p3_title.text = "Measurable Business Benefits & Strategic ROI"
    p3_title.font.size = Pt(24)
    p3_title.font.bold = True
    p3_title.font.color.rgb = COLOR_NAVY

    # 4 Key Value Metric Cards
    metrics = [
      ("⏱️ 18-25% AHT Reduction", "Faster Wrap-Up & CRM Logging", "Autonomous ACW summarizer saves 45-60 seconds per interaction, boosting capacity without hiring."),
      ("📈 94%+ Schedule Adherence", "Fair & Controlled AUX Discipline", "Self-service Erlang-C validation prevents illegal break stacking and adherence leakage."),
      ("🛡️ SLA Target Protection", "Dynamic Cross-Skill Flexing", "Rebalances billing surges in real-time, preventing queue abandonment and penalty fees."),
      ("⭐ CSAT & Retention Boost", "Proactive Speech Tone Coaching", "100% speech sentiment audits replace 2% random sampling, reducing customer friction and agent burnout.")
    ]

    card_w = Inches(2.7)
    card_h = Inches(3.2)
    start_x = Inches(0.8)
    spacing = Inches(0.3)

    for i, (metric_title, metric_sub, metric_desc) in enumerate(metrics):
        x = start_x + i * (card_w + spacing)
        m_shape = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.8), card_w, card_h)
        m_shape.fill.solid()
        m_shape.fill.fore_color.rgb = COLOR_CARD_BG
        m_shape.line.color.rgb = COLOR_PRIMARY if i % 2 == 0 else COLOR_ACCENT
        m_shape.line.width = Pt(2)

        m_box = s3.shapes.add_textbox(x + Inches(0.15), Inches(1.95), card_w - Inches(0.3), card_h - Inches(0.3))
        mtf = m_box.text_frame
        mtf.word_wrap = True

        mp0 = mtf.paragraphs[0]
        mp0.text = metric_title
        mp0.font.size = Pt(14)
        mp0.font.bold = True
        mp0.font.color.rgb = COLOR_NAVY

        mp1 = mtf.add_paragraph()
        mp1.text = metric_sub
        mp1.font.size = Pt(11)
        mp1.font.bold = True
        mp1.font.color.rgb = COLOR_PRIMARY if i % 2 == 0 else COLOR_ACCENT
        mp1.space_before = Pt(4)

        mp2 = mtf.add_paragraph()
        mp2.text = metric_desc
        mp2.font.size = Pt(10)
        mp2.font.color.rgb = COLOR_MUTED
        mp2.space_before = Pt(8)

    # Bottom Summary Banner
    banner = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.3), Inches(11.7), Inches(1.6))
    banner.fill.solid()
    banner.fill.fore_color.rgb = COLOR_NAVY
    banner.line.color.rgb = COLOR_NAVY

    b_box = s3.shapes.add_textbox(Inches(1.1), Inches(5.45), Inches(11.1), Inches(1.3))
    btf = b_box.text_frame
    btf.word_wrap = True

    bp0 = btf.paragraphs[0]
    bp0.text = "🎯  Bottom-Line Impact: Operational Efficiency + Employee Retention"
    bp0.font.size = Pt(14)
    bp0.font.bold = True
    bp0.font.color.rgb = RGBColor(255, 255, 255)

    bp1 = btf.add_paragraph()
    bp1.text = (
        "By automating AUX governance, CRM documentation, and queue flex, contact centers recover "
        "hundreds of productive hours monthly while improving first-contact resolution. "
        "Agents stay engaged, Team Leads focus on high-value coaching, and the enterprise protects SLA compliance under peak volatility."
    )
    bp1.font.size = Pt(11)
    bp1.font.color.rgb = RGBColor(203, 213, 225)
    bp1.space_before = Pt(6)

    # Slide 3 Speaker Notes
    s3.notes_slide.notes_text_frame.text = (
        "SLIDE 3 TALK TRACK (1:20 - 1:55 | Duration: ~35 seconds)\n\n"
        "\"Finally, what does this mean for the business?\n\n"
        "First, we reduce Average Handle Time by 18 to 25% by taking the cognitive and typing burden of ACW off the agent.\n"
        "Second, we achieve over 94% schedule adherence with automated, fair AUX approvals that prevent break leakage.\n"
        "Third, our dynamic intraday skill rebalancing protects SLA commitments without paying expensive overtime or suffering call abandonment.\n"
        "And fourth, real-time tone audits ensure 100% QA coverage, raising CSAT while curbing agent attrition.\n\n"
        "In short, ZEL Copilot turns chaotic contact center friction into autonomous, measurable operational excellence. "
        "Thank you, and I look forward to your questions.\""
    )

    out_path = os.path.join(os.path.dirname(__file__), "NICE_CXone_ZEL_Copilot_Pitch.pptx")
    prs.save(out_path)
    print("Presentation saved successfully at:", out_path)

if __name__ == "__main__":
    create_deck()
