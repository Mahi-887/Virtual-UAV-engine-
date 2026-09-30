"""
========================================================================================
SMART INDIA HACKATHON 2026 (SIH 2026) — OFFICIAL PRESENTATION GENERATOR
Problem Statement ID: SIH26054 | Organization: DRDO
Project: ENGINE-TWIN (AI-Enabled Real-Time Digital Twin for MALE UAV Aero Piston Engines)
========================================================================================
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

def create_presentation():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # Blank slide

    # Official SIH 2026 Color Palette
    C_WHITE = RGBColor(255, 255, 255)
    C_BG_PAGE = RGBColor(250, 252, 255)
    C_NAVY_DARK = RGBColor(15, 41, 66)        # #0F2942
    C_NAVY_TITLE = RGBColor(30, 58, 138)      # #1E3A8A
    C_BLUE_ACCENT = RGBColor(2, 132, 199)     # #0284C7 (Cyan/Sky)
    C_BLUE_LIGHT = RGBColor(238, 246, 255)    # Card background
    C_BLUE_BORDER = RGBColor(186, 220, 255)
    C_ORANGE_SIH = RGBColor(234, 88, 12)      # #EA580C (SIH Orange)
    C_ORANGE_LIGHT = RGBColor(255, 247, 237)
    C_GREEN_OK = RGBColor(22, 163, 74)        # #16A34A
    C_GREEN_LIGHT = RGBColor(240, 253, 244)
    C_DANGER = RGBColor(220, 38, 38)
    C_TEXT_DARK = RGBColor(30, 41, 59)        # #1E293B
    C_TEXT_MUTED = RGBColor(100, 116, 139)    # #64748B
    C_PILL_NAVY = RGBColor(30, 58, 95)

    LOGO_PATH = 'assets_ppt/sih_logo.png'
    BRAIN_PATH = 'assets_ppt/sih_brain.png'
    DUAL_VIEW_PATH = 'assets_ppt/slide4_dual_view.png'
    ENGINE_CUTAWAY_PATH = 'assets_ppt/slide4_engine_cutaway.png'
    FLIGHT_SIM_PATH = 'assets_ppt/slide4_flight_sim.png'

    def add_header_and_footer(slide, title_text, subtitle_text, slide_num):
        # 1. Team Name Oval Badge (Top Left)
        oval = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.5), Inches(0.35), Inches(1.4), Inches(0.95))
        oval.fill.solid()
        oval.fill.fore_color.rgb = C_WHITE
        oval.line.color.rgb = C_NAVY_TITLE
        oval.line.width = Pt(1.5)
        tf_o = oval.text_frame
        tf_o.word_wrap = True
        p_o = tf_o.paragraphs[0]
        p_o.text = "YOUR\nTEAM\nNAME"
        p_o.font.name = "Arial"
        p_o.font.size = Pt(10)
        p_o.font.bold = True
        p_o.font.color.rgb = C_NAVY_TITLE
        p_o.alignment = PP_ALIGN.CENTER

        # 2. Slide Title & Subtitle (Center-Left)
        tx_box = slide.shapes.add_textbox(Inches(2.1), Inches(0.4), Inches(8.5), Inches(0.85))
        tf = tx_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r1 = p.add_run()
        r1.text = title_text + " "
        r1.font.name = "Arial"
        r1.font.size = Pt(21)
        r1.font.bold = True
        r1.font.color.rgb = C_NAVY_TITLE

        r2 = p.add_run()
        r2.text = f"| {subtitle_text}"
        r2.font.name = "Arial"
        r2.font.size = Pt(20)
        r2.font.bold = False
        r2.font.color.rgb = C_TEXT_DARK

        # 3. SIH Logo (Top Right)
        if os.path.exists(LOGO_PATH):
            slide.shapes.add_picture(LOGO_PATH, Inches(10.8), Inches(0.2), width=Inches(2.0))

        # 4. Footer Line & Copyright Note
        foot_box = slide.shapes.add_textbox(Inches(3.5), Inches(7.05), Inches(6.3), Inches(0.35))
        p_f = foot_box.text_frame.paragraphs[0]
        p_f.text = "@SIH Idea submission- Template"
        p_f.font.name = "Arial"
        p_f.font.size = Pt(11)
        p_f.font.color.rgb = C_BLUE_ACCENT
        p_f.alignment = PP_ALIGN.CENTER

        # Slide Number (Bottom Right)
        num_box = slide.shapes.add_textbox(Inches(12.3), Inches(7.05), Inches(0.6), Inches(0.35))
        p_n = num_box.text_frame.paragraphs[0]
        p_n.text = str(slide_num)
        p_n.font.name = "Arial"
        p_n.font.size = Pt(12)
        p_n.font.bold = True
        p_n.font.color.rgb = C_NAVY_TITLE
        p_n.alignment = PP_ALIGN.RIGHT

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)

    # SIH Logo Top Right
    if os.path.exists(LOGO_PATH):
        s1.shapes.add_picture(LOGO_PATH, Inches(10.8), Inches(0.25), width=Inches(2.1))

    # Top Heading: SMART INDIA HACKATHON 2026
    tb_s1_top = s1.shapes.add_textbox(Inches(1.0), Inches(0.4), Inches(9.5), Inches(0.7))
    p_s1_top = tb_s1_top.text_frame.paragraphs[0]
    p_s1_top.text = "SMART INDIA HACKATHON 2026"
    p_s1_top.font.name = "Arial"
    p_s1_top.font.size = Pt(28)
    p_s1_top.font.bold = True
    p_s1_top.font.color.rgb = C_NAVY_TITLE
    p_s1_top.alignment = PP_ALIGN.CENTER

    # Pill: ENGINE-TWIN
    tb_pill = s1.shapes.add_textbox(Inches(4.8), Inches(1.15), Inches(3.7), Inches(0.45))
    p_pill = tb_pill.text_frame.paragraphs[0]
    p_pill.text = "ENGINE-TWIN"
    p_pill.font.name = "Arial"
    p_pill.font.size = Pt(18)
    p_pill.font.bold = True
    p_pill.font.color.rgb = C_NAVY_DARK
    p_pill.alignment = PP_ALIGN.CENTER

    # Big Sub-heading: AI-ENABLED DIGITAL TWIN FOR MALE UAV AERO PISTON ENGINES
    tb_main_title = s1.shapes.add_textbox(Inches(1.0), Inches(1.6), Inches(11.3), Inches(0.9))
    p_mt = tb_main_title.text_frame.paragraphs[0]
    p_mt.text = "AI-ENABLED DIGITAL TWIN FOR MALE UAV AERO\nPISTON ENGINES"
    p_mt.font.name = "Arial"
    p_mt.font.size = Pt(22)
    p_mt.font.bold = True
    p_mt.font.color.rgb = C_NAVY_TITLE
    p_mt.alignment = PP_ALIGN.CENTER

    # Left Column: Problem Details
    left_meta = s1.shapes.add_textbox(Inches(0.6), Inches(2.7), Inches(6.8), Inches(3.6))
    tf_m = left_meta.text_frame
    tf_m.word_wrap = True

    items = [
        ("Problem Statement ID – ", "SIH26054"),
        ("Problem Statement Title – ", "AI-Enabled Real-Time Digital Twin System for Health Monitoring, Fault Prediction and Mission Reliability Enhancement of Aero Piston Engines used in MALE UAVs"),
        ("Theme – ", "Robotics and Drones"),
        ("PS Category – ", "Software"),
        ("Team ID – ", "[ENTER PORTAL TEAM ID]"),
        ("Team Name – ", "[ENTER REGISTERED TEAM NAME]")
    ]

    for i, (k, v) in enumerate(items):
        p_item = tf_m.paragraphs[0] if i == 0 else tf_m.add_paragraph()
        p_item.space_after = Pt(10)
        r_k = p_item.add_run()
        r_k.text = k
        r_k.font.name = "Arial"
        r_k.font.size = Pt(13)
        r_k.font.bold = True
        r_k.font.color.rgb = C_TEXT_DARK

        r_v = p_item.add_run()
        r_v.text = v
        r_v.font.name = "Arial"
        r_v.font.size = Pt(13)
        r_v.font.bold = (k.startswith("Problem Statement ID") or k.startswith("Theme"))
        r_v.font.color.rgb = C_NAVY_DARK if r_v.font.bold else C_TEXT_DARK

    # Bottom Badges on Slide 1: DRDO, SOFTWARE, ROBOTICS & DRONES
    badge_data = [
        (Inches(6.8), Inches(6.45), Inches(1.3), "DRDO", C_NAVY_DARK),
        (Inches(8.3), Inches(6.45), Inches(1.6), "SOFTWARE", C_BLUE_ACCENT),
        (Inches(10.1), Inches(6.45), Inches(2.3), "ROBOTICS & DRONES", C_GREEN_OK)
    ]
    for bx, by, bw, btxt, bcol in badge_data:
        b_shp = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, bx, by, bw, Inches(0.42))
        b_shp.fill.solid()
        b_shp.fill.fore_color.rgb = bcol
        b_shp.line.color.rgb = bcol
        p_b = b_shp.text_frame.paragraphs[0]
        p_b.text = btxt
        p_b.font.name = "Arial"
        p_b.font.size = Pt(10)
        p_b.font.bold = True
        p_b.font.color.rgb = C_WHITE
        p_b.alignment = PP_ALIGN.CENTER

    # Right: Central SIH Brain Graphic
    if os.path.exists(BRAIN_PATH):
        s1.shapes.add_picture(BRAIN_PATH, Inches(8.3), Inches(2.6), width=Inches(3.4))

    # =========================================================================
    # SLIDE 2: PROPOSED SOLUTION | Closed-Loop Digital Twin
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s2, "ENGINE-TWIN", "Reactive Alarms → Predictive Engine Intelligence", 2)

    # Top Navigation Pills
    pills = [
        ("SENSE", C_NAVY_DARK, Inches(0.6)),
        ("ANALYZE", C_BLUE_ACCENT, Inches(2.2)),
        ("PREDICT", C_ORANGE_SIH, Inches(3.8)),
        ("EXPLAIN", C_GREEN_OK, Inches(5.4)),
        ("REPLAY", C_BLUE_ACCENT, Inches(7.0))
    ]
    for ptext, pcol, px in pills:
        pshp = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, Inches(1.4), Inches(1.45), Inches(0.4))
        pshp.fill.solid()
        pshp.fill.fore_color.rgb = pcol
        pshp.line.color.rgb = pcol
        p_p = pshp.text_frame.paragraphs[0]
        p_p.text = ptext
        p_p.font.name = "Arial"
        p_p.font.size = Pt(11)
        p_p.font.bold = True
        p_p.font.color.rgb = C_WHITE
        p_p.alignment = PP_ALIGN.CENTER

    # Left Container: PROPOSED SOLUTION Card
    c_left = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.95), Inches(6.0), Inches(4.3))
    c_left.fill.solid()
    c_left.fill.fore_color.rgb = C_WHITE
    c_left.line.color.rgb = C_BLUE_BORDER
    c_left.line.width = Pt(1.5)

    tb_cl = s2.shapes.add_textbox(Inches(0.8), Inches(2.05), Inches(5.6), Inches(3.4))
    tf_cl = tb_cl.text_frame
    tf_cl.word_wrap = True

    p = tf_cl.paragraphs[0]
    p.text = "PROPOSED SOLUTION"
    p.font.name = "Arial"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE
    p.space_after = Pt(12)

    bullet_pts = [
        "Create a live software twin of a MALE-UAV piston engine using real-world flight state + physics telemetry.",
        "Fuse a physics-informed thermodynamic baseline with Isolation Forest anomaly detection & Weibull RUL estimation (β=1.8, η=1500 h).",
        "Mirror real-time telemetry into a 3D cutaway engine + UAV flight simulator (WebGL Three.js) for operator-ready spatial visualization.",
        "Inject in-flight faults (misfire, overpressure boost, oil loss) and demonstrate immediate causal chain: telemetry deviation → 3D cylinder alert → prognostic hazard → RUL degradation."
    ]
    for b in bullet_pts:
        pb = tf_cl.add_paragraph()
        pb.text = "• " + b
        pb.font.name = "Arial"
        pb.font.size = Pt(11.5)
        pb.font.color.rgb = C_TEXT_DARK
        pb.space_after = Pt(8)

    # 3 Tech Badges inside Left Card
    tbadges = [
        ("5–10 Hz TELEMETRY", Inches(0.8), Inches(5.6)),
        ("60 FPS RENDER TARGET", Inches(2.6), Inches(5.6)),
        ("LOCAL + DOCKER", Inches(4.7), Inches(5.6))
    ]
    for tb_txt, bx, by in tbadges:
        b_shp = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, bx, by, Inches(1.7), Inches(0.35))
        b_shp.fill.solid()
        b_shp.fill.fore_color.rgb = C_BLUE_LIGHT
        b_shp.line.color.rgb = C_BLUE_BORDER
        p_b = b_shp.text_frame.paragraphs[0]
        p_b.text = tb_txt
        p_b.font.name = "Arial"
        p_b.font.size = Pt(9)
        p_b.font.bold = True
        p_b.font.color.rgb = C_BLUE_ACCENT
        p_b.alignment = PP_ALIGN.CENTER

    # Right Container: CLOSED-LOOP DIGITAL TWIN Diagram Card
    c_right = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.95), Inches(5.9), Inches(4.3))
    c_right.fill.solid()
    c_right.fill.fore_color.rgb = C_WHITE
    c_right.line.color.rgb = C_BLUE_BORDER
    c_right.line.width = Pt(1.5)

    tb_cr = s2.shapes.add_textbox(Inches(7.0), Inches(2.05), Inches(5.5), Inches(0.5))
    p = tb_cr.text_frame.paragraphs[0]
    p.text = "CLOSED-LOOP DIGITAL TWIN"
    p.font.name = "Arial"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    # Diagram Nodes (4 Quadrants connected to central hub)
    nodes = [
        ("FLIGHT\nSTATE", Inches(7.1), Inches(2.7), C_BLUE_ACCENT, C_BLUE_LIGHT),
        ("ENGINE\nTELEMETRY", Inches(10.7), Inches(2.7), C_BLUE_ACCENT, C_BLUE_LIGHT),
        ("PHYSICS\nBASELINE", Inches(7.1), Inches(4.3), C_GREEN_OK, C_GREEN_LIGHT),
        ("AI / RUL\nANALYTICS", Inches(10.7), Inches(4.3), C_ORANGE_SIH, C_ORANGE_LIGHT)
    ]
    for ntext, nx, ny, ncol, nbg in nodes:
        nshp = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, nx, ny, Inches(1.7), Inches(0.9))
        nshp.fill.solid()
        nshp.fill.fore_color.rgb = nbg
        nshp.line.color.rgb = ncol
        nshp.line.width = Pt(1.5)
        p_n = nshp.text_frame.paragraphs[0]
        p_n.text = ntext
        p_n.font.name = "Arial"
        p_n.font.size = Pt(11)
        p_n.font.bold = True
        p_n.font.color.rgb = ncol
        p_n.alignment = PP_ALIGN.CENTER

    # Central Digital Twin Engine Hub
    hub = s2.shapes.add_shape(MSO_SHAPE.OVAL, Inches(9.1), Inches(3.45), Inches(1.3), Inches(1.1))
    hub.fill.solid()
    hub.fill.fore_color.rgb = C_NAVY_DARK
    hub.line.color.rgb = C_BLUE_ACCENT
    hub.line.width = Pt(2)
    p_h = hub.text_frame.paragraphs[0]
    p_h.text = "⚙\nTWIN"
    p_h.font.name = "Arial"
    p_h.font.size = Pt(13)
    p_h.font.bold = True
    p_h.font.color.rgb = C_WHITE
    p_h.alignment = PP_ALIGN.CENTER

    # Caption under diagram
    tb_diag_note = s2.shapes.add_textbox(Inches(7.0), Inches(5.45), Inches(5.5), Inches(0.6))
    p_dn = tb_diag_note.text_frame.paragraphs[0]
    p_dn.text = "One synchronized telemetry stream drives every view — no page reload, no separate demo logic."
    p_dn.font.name = "Arial"
    p_dn.font.size = Pt(10.5)
    p_dn.font.color.rgb = C_TEXT_DARK
    p_dn.alignment = PP_ALIGN.CENTER

    # Bottom Full-Width Ribbon
    ribbon = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(6.35), Inches(12.1), Inches(0.48))
    ribbon.fill.solid()
    ribbon.fill.fore_color.rgb = C_NAVY_DARK
    ribbon.line.color.rgb = C_NAVY_DARK
    p_rib = ribbon.text_frame.paragraphs[0]
    p_rib.text = "Reactive threshold alarm  →  continuous state estimation  →  early anomaly signal  →  actionable mission/maintenance insight"
    p_rib.font.name = "Arial"
    p_rib.font.size = Pt(11)
    p_rib.font.bold = True
    p_rib.font.color.rgb = C_WHITE
    p_rib.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 3: TECHNICAL APPROACH | Modular & Source-Agnostic
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s3, "TECHNICAL APPROACH", "Modular & Source-Agnostic", 3)

    # Section 1: 5-Layer Architecture
    tb_s1 = s3.shapes.add_textbox(Inches(0.6), Inches(1.3), Inches(5.0), Inches(0.4))
    p = tb_s1.text_frame.paragraphs[0]
    p.text = "5-LAYER ARCHITECTURE"
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    layers = [
        ("01", "FLIGHT\nCONTROL", "Throttle • Altitude • Weather\nUAV kinematic state", C_BLUE_ACCENT, C_BLUE_LIGHT, Inches(0.6)),
        ("02", "SYNTHETIC\nDATA", "Physics-correlated RPM / CHT / EGT\nOil • Fuel • Vib + fault injection", C_BLUE_ACCENT, C_BLUE_LIGHT, Inches(3.05)),
        ("03", "DATA\nINGESTION", "Fixed JSON contract\nWebSocket / MQTT-ready (10 Hz)", C_GREEN_OK, C_GREEN_LIGHT, Inches(5.5)),
        ("04", "DIGITAL TWIN\n+ AI", "PINN thermodynamic baseline\nAnomaly detection + Weibull RUL", C_ORANGE_SIH, C_ORANGE_LIGHT, Inches(7.95)),
        ("05", "3D +\nDASHBOARD", "WebGL Live engine + Flight sim\nCharts + Speech audio alarms", C_NAVY_TITLE, C_BLUE_LIGHT, Inches(10.4))
    ]

    for num, title, desc, col, bg, lx in layers:
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, lx, Inches(1.75), Inches(2.35), Inches(1.85))
        card.fill.solid()
        card.fill.fore_color.rgb = bg
        card.line.color.rgb = col
        card.line.width = Pt(1.5)

        # Number circle badge
        c_num = s3.shapes.add_shape(MSO_SHAPE.OVAL, lx + Inches(0.12), Inches(1.85), Inches(0.45), Inches(0.45))
        c_num.fill.solid()
        c_num.fill.fore_color.rgb = col
        c_num.line.color.rgb = col
        p_c = c_num.text_frame.paragraphs[0]
        p_c.text = num
        p_c.font.name = "Arial"
        p_c.font.size = Pt(9)
        p_c.font.bold = True
        p_c.font.color.rgb = C_WHITE
        p_c.alignment = PP_ALIGN.CENTER

        tb_ct = s3.shapes.add_textbox(lx + Inches(0.65), Inches(1.8), Inches(1.6), Inches(0.6))
        p_t = tb_ct.text_frame.paragraphs[0]
        p_t.text = title
        p_t.font.name = "Arial"
        p_t.font.size = Pt(10.5)
        p_t.font.bold = True
        p_t.font.color.rgb = col

        tb_cd = s3.shapes.add_textbox(lx + Inches(0.12), Inches(2.4), Inches(2.1), Inches(1.1))
        tb_cd.text_frame.word_wrap = True
        p_d = tb_cd.text_frame.paragraphs[0]
        p_d.text = desc
        p_d.font.name = "Arial"
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = C_TEXT_DARK

    # Bottom Left: Fixed Telemetry Contract
    c_bleft = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(3.8), Inches(5.9), Inches(2.8))
    c_bleft.fill.solid()
    c_bleft.fill.fore_color.rgb = C_WHITE
    c_bleft.line.color.rgb = C_BLUE_BORDER
    c_bleft.line.width = Pt(1.5)

    tb_blt = s3.shapes.add_textbox(Inches(0.8), Inches(3.9), Inches(5.5), Inches(0.4))
    p = tb_blt.text_frame.paragraphs[0]
    p.text = "FIXED TELEMETRY CONTRACT"
    p.font.name = "Arial"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    code_bg = s3.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(4.35), Inches(5.5), Inches(1.55))
    code_bg.fill.solid()
    code_bg.fill.fore_color.rgb = RGBColor(241, 245, 249)
    code_bg.line.color.rgb = RGBColor(203, 213, 225)
    p_code = code_bg.text_frame.paragraphs[0]
    p_code.text = "{\n  timestamp, engine_status, rpm, cht_c[4], egt_c,\n  oil_pressure_psi, oil_temp_c, fuel_flow_lph,\n  vibration_rms_g, battery_voltage_v, fault_active,\n  fault_type, flight_state{throttle, altitude, weather}\n}"
    p_code.font.name = "Consolas"
    p_code.font.size = Pt(9.5)
    p_code.font.color.rgb = RGBColor(30, 41, 59)

    # 3 Badges under Contract
    sbadges = [
        ("SOURCE SWAPPABLE", C_GREEN_OK, Inches(0.8)),
        ("JSON CONTRACT", C_BLUE_ACCENT, Inches(2.7)),
        ("WEBSOCKET 10Hz", C_NAVY_TITLE, Inches(4.4))
    ]
    for s_txt, s_col, sx in sbadges:
        b = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, Inches(6.05), Inches(1.6), Inches(0.38))
        b.fill.solid()
        b.fill.fore_color.rgb = s_col
        b.line.color.rgb = s_col
        p_b = b.text_frame.paragraphs[0]
        p_b.text = s_txt
        p_b.font.name = "Arial"
        p_b.font.size = Pt(8.5)
        p_b.font.bold = True
        p_b.font.color.rgb = C_WHITE
        p_b.alignment = PP_ALIGN.CENTER

    # Bottom Right: Physics-Informed Synthetic Telemetry
    c_bright = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(3.8), Inches(5.9), Inches(2.8))
    c_bright.fill.solid()
    c_bright.fill.fore_color.rgb = C_WHITE
    c_bright.line.color.rgb = C_BLUE_BORDER
    c_bright.line.width = Pt(1.5)

    tb_brt = s3.shapes.add_textbox(Inches(7.0), Inches(3.9), Inches(5.5), Inches(0.4))
    p = tb_brt.text_frame.paragraphs[0]
    p.text = "PHYSICS-INFORMED SYNTHETIC TELEMETRY"
    p.font.name = "Arial"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    tb_eq = s3.shapes.add_textbox(Inches(7.0), Inches(4.3), Inches(5.5), Inches(2.1))
    tf_eq = tb_eq.text_frame
    tf_eq.word_wrap = True

    eqs = [
        ("RPM", "800 + throttle × 5000 × (P_amb / 101.3)", "Rotational Inertia"),
        ("CHT", "T_amb + 38 + (Load × 52) − RamAirCooling", "Thermodynamic Heat"),
        ("EGT", "360 + (Load × 320) + MixtureResidual", "Combustion Gas"),
        ("Oil PSI", "28 + (RPM / 5800) × 42", "Hydrodynamic Lube"),
        ("Fuel Flow", "1.8 + (Power_kW × 0.32) L/h", "BSFC Consumption"),
        ("Vibration", "0.25 + (RPM / 5800) × 0.85 + FaultTerm", "Structural Health")
    ]
    for i, (k, formula, tag) in enumerate(eqs):
        p_e = tf_eq.paragraphs[0] if i == 0 else tf_eq.add_paragraph()
        r_k = p_e.add_run()
        r_k.text = f"{k:10} "
        r_k.font.bold = True
        r_k.font.color.rgb = C_NAVY_TITLE
        r_k.font.size = Pt(10)
        r_f = p_e.add_run()
        r_f.text = f"{formula:42} "
        r_f.font.color.rgb = C_TEXT_DARK
        r_f.font.size = Pt(10)
        r_t = p_e.add_run()
        r_t.text = tag
        r_t.font.bold = True
        r_t.font.color.rgb = C_TEXT_MUTED
        r_t.font.size = Pt(9.5)

    # Analytics Highlight Pill
    p_an = tf_eq.add_paragraph()
    p_an.space_before = Pt(6)
    r_an = p_an.add_run()
    r_an.text = "Analytics Layer: PINN Thermodynamic Loss + Isolation Forest + Weibull RUL (β=1.8, η=1500h)"
    r_an.font.bold = True
    r_an.font.size = Pt(9.5)
    r_an.font.color.rgb = C_ORANGE_SIH

    # =========================================================================
    # SLIDE 4: PROTOTYPE WALKTHROUGH | Live Screens from the Working Build
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s4, "PROTOTYPE WALKTHROUGH", "Live Screens from the Working Build", 4)

    tb_sub = s4.shapes.add_textbox(Inches(0.6), Inches(1.3), Inches(12.1), Inches(0.4))
    p = tb_sub.text_frame.paragraphs[0]
    p.text = "Captured directly from the running prototype — 7 live views (Overview & Flight, Dual View, Drone Flight Simulator, 3D Engine Cutaway, AI/ML & PINN Analytics, Mission Replay) driven by one shared telemetry state."
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_DARK

    # Left Big Screenshot Card: Dual View
    card_dv = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.8), Inches(6.8), Inches(4.3))
    card_dv.fill.solid()
    card_dv.fill.fore_color.rgb = C_WHITE
    card_dv.line.color.rgb = C_BLUE_BORDER
    card_dv.line.width = Pt(1.5)

    if os.path.exists(DUAL_VIEW_PATH):
        s4.shapes.add_picture(DUAL_VIEW_PATH, Inches(0.7), Inches(1.9), width=Inches(6.6), height=Inches(3.4))

    tb_dv_txt = s4.shapes.add_textbox(Inches(0.6), Inches(6.15), Inches(6.8), Inches(0.75))
    tf_dv = tb_dv_txt.text_frame
    tf_dv.word_wrap = True
    p = tf_dv.paragraphs[0]
    p.text = "Dual View — Flight Simulator + 3D Engine Cutaway side-by-side. Live RPM / CHT / EGT / Oil / Vibration telemetry, PINN health layer (Anomaly Score, RUL, Fuel, Airframe Integrity) and CAN sensor-fusion status, all fed from one state."
    p.font.name = "Arial"
    p.font.size = Pt(10)
    p.font.color.rgb = C_TEXT_DARK

    # Top Right Screenshot Card: 3D Engine Cutaway
    card_eng = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.7), Inches(1.8), Inches(5.0), Inches(2.05))
    card_eng.fill.solid()
    card_eng.fill.fore_color.rgb = C_WHITE
    card_eng.line.color.rgb = C_BLUE_BORDER
    card_eng.line.width = Pt(1.5)

    if os.path.exists(ENGINE_CUTAWAY_PATH):
        s4.shapes.add_picture(ENGINE_CUTAWAY_PATH, Inches(7.78), Inches(1.88), width=Inches(4.84), height=Inches(1.89))

    tb_eng_txt = s4.shapes.add_textbox(Inches(7.7), Inches(3.9), Inches(5.0), Inches(0.5))
    tf_eng = tb_eng_txt.text_frame
    tf_eng.word_wrap = True
    p = tf_eng.paragraphs[0]
    p.text = "3D Engine Cutaway — PINN loss formulation, crankshaft/valvetrain kinematics, combustion-chamber physics, mission-replay scenarios."
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_TEXT_DARK

    # Bottom Right Screenshot Card: Drone Flight Simulator
    card_flt = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.7), Inches(4.5), Inches(5.0), Inches(2.05))
    card_flt.fill.solid()
    card_flt.fill.fore_color.rgb = C_WHITE
    card_flt.line.color.rgb = C_BLUE_BORDER
    card_flt.line.width = Pt(1.5)

    if os.path.exists(FLIGHT_SIM_PATH):
        s4.shapes.add_picture(FLIGHT_SIM_PATH, Inches(7.78), Inches(4.58), width=Inches(4.84), height=Inches(1.89))

    tb_flt_txt = s4.shapes.add_textbox(Inches(7.7), Inches(6.6), Inches(5.0), Inches(0.45))
    tf_flt = tb_flt_txt.text_frame
    tf_flt.word_wrap = True
    p = tf_flt.paragraphs[0]
    p.text = "Drone Flight Simulator (Game Mode) — manual throttle/turn/takeoff/land controls drive the same physics engine as the twin."
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # SLIDE 5: VALIDATION NUMBERS | Sensor Fusion & Physics-Informed AI Parameters
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s5, "VALIDATION NUMBERS", "Sensor Fusion & Physics-Informed AI Parameters", 5)

    tb_sub5 = s5.shapes.add_textbox(Inches(0.6), Inches(1.3), Inches(12.1), Inches(0.35))
    p = tb_sub5.text_frame.paragraphs[0]
    p.text = "Left: 10 live telemetry channels and real-world sensor mapping. Right: exact combustion, fusion, and AI parameters running in the build."
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.color.rgb = C_TEXT_DARK

    # Left: 10 Telemetry Channels Table
    t_rows, t_cols = 11, 3
    tbl_shape = s5.shapes.add_table(t_rows, t_cols, Inches(0.6), Inches(1.75), Inches(6.4), Inches(4.9))
    tbl = tbl_shape.table
    tbl.columns[0].width = Inches(2.2)
    tbl.columns[1].width = Inches(2.6)
    tbl.columns[2].width = Inches(1.6)

    table_data = [
        ["Telemetry Channel", "Real-World Sensor Equivalent", "Source"],
        ["Rotational Speed (RPM)", "RPM Hall Sensor", "CAN-fused, live"],
        ["In-Cylinder Peak Pressure", "Piezoelectric pressure transducer", "Physics-model derived"],
        ["Cylinder Head Temp (CHT)", "CHT Thermocouple (Cyl 1–4)", "CAN-fused, live"],
        ["Exhaust Gas Temp (EGT)", "K-type thermocouple", "Physics-model derived"],
        ["Oil Pressure (Lubrication)", "Oil Transducer (PSI)", "CAN-fused, live"],
        ["Fuel Consumption Rate", "Fuel Flowmeter / Float", "CAN-fused, live"],
        ["3-Axis Vibration (RMS)", "Piezo Accelerometer / IMU", "CAN-fused, live"],
        ["28V Bus Electrical Potential", "Voltage-divider ADC channel", "Physics-model derived"],
        ["Alternator Generator Load", "Hall-effect current sensor", "Physics-model derived"],
        ["Airframe Proximity / Pitot", "Pitot tube + GPWS Radar", "CAN-fused, live"]
    ]

    for r_idx, row in enumerate(table_data):
        for c_idx, cell_txt in enumerate(row):
            cell = tbl.cell(r_idx, c_idx)
            cell.text = cell_txt
            p = cell.text_frame.paragraphs[0]
            p.font.name = "Arial"
            if r_idx == 0:
                cell.fill.solid()
                cell.fill.fore_color.rgb = C_NAVY_DARK
                p.font.bold = True
                p.font.size = Pt(10)
                p.font.color.rgb = C_WHITE
            else:
                cell.fill.solid()
                cell.fill.fore_color.rgb = C_WHITE if r_idx % 2 == 1 else RGBColor(248, 250, 252)
                p.font.size = Pt(8.5)
                p.font.color.rgb = C_TEXT_DARK
                if c_idx == 2:
                    p.font.bold = True
                    p.font.color.rgb = C_BLUE_ACCENT if "CAN" in cell_txt else C_TEXT_MUTED

    # Right: 6 Spec Cards Grid (2 cols x 3 rows)
    spec_cards = [
        ("CAN BUS INTERFACE", "500 kbps · CAN 2.0B protocol\n6 CAN-fused channels + 3 physics-derived", C_BLUE_ACCENT, C_BLUE_LIGHT, Inches(7.3), Inches(1.75)),
        ("COMBUSTION SPEC", "Firing order 1-3-4-2 · CR 9.0:1\nSpark 22° BTDC · AFR λ = 1.0 (Rotax)", C_ORANGE_SIH, C_ORANGE_LIGHT, Inches(10.2), Inches(1.75)),
        ("PINN LOSS FUNCTION", "Loss = MSE(actual, pred) +\nλ·|Q_comb − (W_shaft+Q_exh+Q_cool)|", C_BLUE_ACCENT, C_BLUE_LIGHT, Inches(7.3), Inches(3.45)),
        ("LIVE RUL READING", "Nominal flight: 73% RUL (≈ 1089 h)\nDegrades dynamically under fault injection", C_DANGER, RGBColor(254, 242, 242), Inches(10.2), Inches(3.45)),
        ("STRUCTURAL LIMITS", "88.5 bar max cylinder pressure · 138° C CHT\n25 psi minimum oil pressure threshold", C_NAVY_DARK, C_BLUE_LIGHT, Inches(7.3), Inches(5.15)),
        ("REFERENCE ENGINE", "4-cyl boxer · 1211 cc · 79.5×61 mm\nRotax-914 class · 84.5 kW rated power", C_GREEN_OK, C_GREEN_LIGHT, Inches(10.2), Inches(5.15))
    ]

    for title, desc, col, bg, cx, cy in spec_cards:
        sc = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, cy, Inches(2.65), Inches(1.5))
        sc.fill.solid()
        sc.fill.fore_color.rgb = bg
        sc.line.color.rgb = col
        sc.line.width = Pt(1.5)

        tb_sct = s5.shapes.add_textbox(cx + Inches(0.1), cy + Inches(0.08), Inches(2.45), Inches(0.4))
        p = tb_sct.text_frame.paragraphs[0]
        p.text = title
        p.font.name = "Arial"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = col

        tb_scd = s5.shapes.add_textbox(cx + Inches(0.1), cy + Inches(0.45), Inches(2.45), Inches(0.95))
        tb_scd.text_frame.word_wrap = True
        p_d = tb_scd.text_frame.paragraphs[0]
        p_d.text = desc
        p_d.font.name = "Arial"
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # SLIDE 6: FEASIBILITY & VIABILITY | Phased Path to Real Data
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s6, "FEASIBILITY & VIABILITY", "Phased Path to Real Data", 6)

    # Top Row: 4 Metric Cards
    top_metrics = [
        ("SOFTWARE-ONLY NOW", "No physical engine/sensors required for prototype evaluation.", C_BLUE_ACCENT, Inches(0.6)),
        ("REAL-TIME", "WebSocket target 5–10 Hz; render loop decoupled for smooth 60 FPS 3D.", C_GREEN_OK, Inches(3.7)),
        ("DROP-IN DATA SOURCE", "Synthetic generator → later CAN/ECU/FADEC without downstream rewrite.", C_ORANGE_SIH, Inches(6.8)),
        ("DEPLOYABLE NOW", "Docker Compose + GitHub Pages for repeatable local demo & instant validation.", C_NAVY_DARK, Inches(9.9))
    ]

    for mtitle, mdesc, mcol, mx in top_metrics:
        mcard = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, mx, Inches(1.35), Inches(2.85), Inches(1.15))
        mcard.fill.solid()
        mcard.fill.fore_color.rgb = C_WHITE
        mcard.line.color.rgb = mcol
        mcard.line.width = Pt(1.5)

        # Pill badge inside card
        mpill = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, mx + Inches(0.12), Inches(1.45), Inches(1.8), Inches(0.3))
        mpill.fill.solid()
        mpill.fill.fore_color.rgb = mcol
        mpill.line.color.rgb = mcol
        p_mp = mpill.text_frame.paragraphs[0]
        p_mp.text = mtitle
        p_mp.font.name = "Arial"
        p_mp.font.size = Pt(8.5)
        p_mp.font.bold = True
        p_mp.font.color.rgb = C_WHITE
        p_mp.alignment = PP_ALIGN.CENTER

        tb_md = s6.shapes.add_textbox(mx + Inches(0.12), Inches(1.8), Inches(2.6), Inches(0.65))
        tb_md.text_frame.word_wrap = True
        p = tb_md.text_frame.paragraphs[0]
        p.text = mdesc
        p.font.name = "Arial"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT_DARK

    # Middle Section: CHALLENGES → MITIGATION Table
    tb_ch_title = s6.shapes.add_textbox(Inches(0.6), Inches(2.7), Inches(5.0), Inches(0.4))
    p = tb_ch_title.text_frame.paragraphs[0]
    p.text = "CHALLENGES → MITIGATION"
    p.font.name = "Arial"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    c_rows, c_cols = 4, 3
    ch_shape = s6.shapes.add_table(c_rows, c_cols, Inches(0.6), Inches(3.1), Inches(12.1), Inches(2.1))
    ch_tbl = ch_shape.table
    ch_tbl.columns[0].width = Inches(2.5)
    ch_tbl.columns[1].width = Inches(2.8)
    ch_tbl.columns[2].width = Inches(6.8)

    ch_data = [
        ["Challenge", "Risk to Demo / Validation", "Mitigation Built into Design"],
        ["No aero-engine run-to-failure data", "Synthetic validation can overstate accuracy", "Label synthetic results honestly; validate physics + residual behavior first; replace source when real ECU/CAN data becomes available."],
        ["RUL needs a defined end-of-life target", "RUL can become a misleading single number", "Use degradation trend + explicit condition threshold (Weibull hazard rate); move to confidence-bounded RUL when real flight history is available."],
        ["Faults may look like sensor failures", "False maintenance alarms", "Compare multi-sensor relationships + physics residuals; separate sensor drift (EKF innovation covariance) from engine-state divergence."]
    ]

    for r_idx, row in enumerate(ch_data):
        for c_idx, cell_txt in enumerate(row):
            cell = ch_tbl.cell(r_idx, c_idx)
            cell.text = cell_txt
            p = cell.text_frame.paragraphs[0]
            p.font.name = "Arial"
            if r_idx == 0:
                cell.fill.solid()
                cell.fill.fore_color.rgb = C_NAVY_DARK
                p.font.bold = True
                p.font.size = Pt(10)
                p.font.color.rgb = C_WHITE
            else:
                cell.fill.solid()
                cell.fill.fore_color.rgb = C_WHITE if r_idx % 2 == 1 else RGBColor(248, 250, 252)
                p.font.size = Pt(9.5)
                p.font.color.rgb = C_TEXT_DARK
                if c_idx == 0:
                    p.font.bold = True
                    p.font.color.rgb = C_NAVY_TITLE

    # Bottom Section: PHASED PATH TO DEPLOYMENT (3 Stages)
    tb_pp_title = s6.shapes.add_textbox(Inches(0.6), Inches(5.35), Inches(5.0), Inches(0.35))
    p = tb_pp_title.text_frame.paragraphs[0]
    p.text = "PHASED PATH TO DEPLOYMENT"
    p.font.name = "Arial"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    phases = [
        ("P1", "Synthetic Validation", "Physics engine + synthetic CAN data generator validating AI pipelines.", C_BLUE_ACCENT, Inches(0.6)),
        ("P2", "HIL + ECU/CAN Feed", "Hardware-in-the-loop testbed feeding live serial/CAN packets into twin.", C_GREEN_OK, Inches(4.75)),
        ("P3", "Flight-Test Integration", "Onboard telemetry downlink connected to Ground Control Station twin.", C_ORANGE_SIH, Inches(8.9))
    ]

    for p_id, p_name, p_desc, p_col, px in phases:
        p_card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, Inches(5.75), Inches(3.8), Inches(1.15))
        p_card.fill.solid()
        p_card.fill.fore_color.rgb = C_WHITE
        p_card.line.color.rgb = p_col
        p_card.line.width = Pt(1.5)

        # Circle badge
        cir = s6.shapes.add_shape(MSO_SHAPE.OVAL, px + Inches(0.12), Inches(5.85), Inches(0.45), Inches(0.45))
        cir.fill.solid()
        cir.fill.fore_color.rgb = p_col
        cir.line.color.rgb = p_col
        p_c = cir.text_frame.paragraphs[0]
        p_c.text = p_id
        p_c.font.name = "Arial"
        p_c.font.size = Pt(10)
        p_c.font.bold = True
        p_c.font.color.rgb = C_WHITE
        p_c.alignment = PP_ALIGN.CENTER

        tb_pn = s6.shapes.add_textbox(px + Inches(0.65), Inches(5.8), Inches(3.0), Inches(0.35))
        p = tb_pn.text_frame.paragraphs[0]
        p.text = p_name
        p.font.name = "Arial"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = p_col

        tb_pd = s6.shapes.add_textbox(px + Inches(0.12), Inches(6.3), Inches(3.5), Inches(0.55))
        tb_pd.text_frame.word_wrap = True
        p = tb_pd.text_frame.paragraphs[0]
        p.text = p_desc
        p.font.name = "Arial"
        p.font.size = Pt(9)
        p.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # SLIDE 7: IMPACT & BENEFITS | Predictive Mission Reliability
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s7, "IMPACT & BENEFITS", "Predictive Mission Reliability", 7)

    # Top Section: FROM TELEMETRY TO DECISION Flowchart (5 Steps)
    tb_f_title = s7.shapes.add_textbox(Inches(0.6), Inches(1.3), Inches(6.0), Inches(0.4))
    p = tb_f_title.text_frame.paragraphs[0]
    p.text = "FROM TELEMETRY TO DECISION"
    p.font.name = "Arial"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    flow_steps = [
        ("1", "LIVE DATA", "Engine + flight state", C_BLUE_ACCENT, Inches(0.6)),
        ("2", "TWIN STATE", "Expected vs observed", C_BLUE_ACCENT, Inches(3.05)),
        ("3", "EARLY SIGNAL", "Anomaly / trend detection", C_ORANGE_SIH, Inches(5.5)),
        ("4", "ACTION", "Voice alert / pilot advisory", C_DANGER, Inches(7.95)),
        ("5", "REPLAY", "Post-flight learning loop", C_GREEN_OK, Inches(10.4))
    ]

    for fnum, ftitle, fdesc, fcol, fx in flow_steps:
        fcard = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, fx, Inches(1.75), Inches(2.35), Inches(1.35))
        fcard.fill.solid()
        fcard.fill.fore_color.rgb = C_WHITE
        fcard.line.color.rgb = fcol
        fcard.line.width = Pt(1.5)

        # Number circle
        cir = s7.shapes.add_shape(MSO_SHAPE.OVAL, fx + Inches(0.12), Inches(1.85), Inches(0.38), Inches(0.38))
        cir.fill.solid()
        cir.fill.fore_color.rgb = fcol
        cir.line.color.rgb = fcol
        p_c = cir.text_frame.paragraphs[0]
        p_c.text = fnum
        p_c.font.name = "Arial"
        p_c.font.size = Pt(9.5)
        p_c.font.bold = True
        p_c.font.color.rgb = C_WHITE
        p_c.alignment = PP_ALIGN.CENTER

        tb_ft = s7.shapes.add_textbox(fx + Inches(0.55), Inches(1.8), Inches(1.7), Inches(0.35))
        p = tb_ft.text_frame.paragraphs[0]
        p.text = ftitle
        p.font.name = "Arial"
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = fcol

        tb_fd = s7.shapes.add_textbox(fx + Inches(0.12), Inches(2.3), Inches(2.1), Inches(0.7))
        tb_fd.text_frame.word_wrap = True
        p = tb_fd.text_frame.paragraphs[0]
        p.text = fdesc
        p.font.name = "Arial"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT_DARK

    # Middle Section: WHO BENEFITS + HOW (4 Stakeholder Cards)
    tb_w_title = s7.shapes.add_textbox(Inches(0.6), Inches(3.25), Inches(6.0), Inches(0.4))
    p = tb_w_title.text_frame.paragraphs[0]
    p.text = "WHO BENEFITS + HOW"
    p.font.name = "Arial"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    stakeholders = [
        ("UAV OPERATOR", "Live health status, tactical fault voice alerts, mission-state spatial awareness without sensory overload.", C_BLUE_ACCENT, Inches(3.7)),
        ("PROPULSION / MAINTENANCE", "Physics-derived degradation trend, RUL tracking, black-box replay and condition-based overhaul planning.", C_ORANGE_SIH, Inches(4.35)),
        ("TEST & VALIDATION", "Repeatable fault injection (misfire, overpressure, oil loss) and simulated border weather scenarios.", C_GREEN_OK, Inches(5.0)),
        ("PROGRAM / DEFENSE FLEET", "Standardized CAN telemetry contract for multi-aircraft integration across TAPAS and Rustom-II fleets.", C_NAVY_DARK, Inches(5.65))
    ]

    for stitle, sdesc, scol, sy in stakeholders:
        # Left Pill
        spill = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), sy, Inches(2.8), Inches(0.52))
        spill.fill.solid()
        spill.fill.fore_color.rgb = scol
        spill.line.color.rgb = scol
        p_sp = spill.text_frame.paragraphs[0]
        p_sp.text = stitle
        p_sp.font.name = "Arial"
        p_sp.font.size = Pt(9.5)
        p_sp.font.bold = True
        p_sp.font.color.rgb = C_WHITE
        p_sp.alignment = PP_ALIGN.CENTER

        # Right Text Box
        stext = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.55), sy, Inches(9.15), Inches(0.52))
        stext.fill.solid()
        stext.fill.fore_color.rgb = C_WHITE
        stext.line.color.rgb = C_BLUE_BORDER
        stext.line.width = Pt(1)
        p_st = stext.text_frame.paragraphs[0]
        p_st.text = sdesc
        p_st.font.name = "Arial"
        p_st.font.size = Pt(9.5)
        p_st.font.color.rgb = C_TEXT_DARK

    # Bottom Row: 4 Value Pillars
    pillars = [
        ("Predictive: Trend before threshold", C_BLUE_ACCENT, Inches(0.6)),
        ("Transparent: Physics + AI", C_GREEN_OK, Inches(3.7)),
        ("Reusable: Synthetic → CAN/ECU", C_ORANGE_SIH, Inches(6.8)),
        ("Operational: Simulate + Replay", C_DANGER, Inches(9.9))
    ]
    for pil_txt, pil_col, px in pillars:
        p_shp = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, Inches(6.35), Inches(2.85), Inches(0.45))
        p_shp.fill.solid()
        p_shp.fill.fore_color.rgb = C_WHITE
        p_shp.line.color.rgb = pil_col
        p_shp.line.width = Pt(1.5)
        p = p_shp.text_frame.paragraphs[0]
        p.text = pil_txt
        p.font.name = "Arial"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = pil_col
        p.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 8: RESEARCH & REFERENCES | SIH Requirement + Prototype Evidence
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s8, "RESEARCH & REFERENCES", "SIH Requirement + Prototype Evidence", 8)

    # Left Section: REFERENCE BASE
    tb_rb_title = s8.shapes.add_textbox(Inches(0.6), Inches(1.3), Inches(5.5), Inches(0.4))
    p = tb_rb_title.text_frame.paragraphs[0]
    p.text = "REFERENCE BASE"
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    ref_items = [
        ("1", "[1] SIH 2026 Problem Statement SIH26054", "DRDO • Robotics & Drones • Software\nOfficial problem scope: digital twin, health monitoring, fault prediction, RUL, simulation/replay and real-time dashboard."),
        ("2", "[2] Prototype: UAV Engine Digital Twin", "Local & Live working prototype provided with submission.\nDemonstrates flight view, 3D engine cutaway, 12-sensor telemetry panel, sensor status matrix, anomaly/RUL estimation, predictive warning banner and live fault injection."),
        ("3", "[3] Technology Stack Specification", "Project build specification supplied by team.\nPython/NumPy • FastAPI • WebSocket/MQTT • Three.js WebGL • Chart.js • Docker. Working prototype includes PINN thermodynamic loss engine + scikit-learn analytics track (Isolation Forest, Weibull RUL) submitted alongside the WebGL build.")
    ]

    for rnum, rtitle, rdesc in ref_items:
        rx = Inches(0.6)
        ry = Inches(1.8) if rnum == "1" else Inches(3.2) if rnum == "2" else Inches(4.7)
        rw = Inches(5.8)
        rh = Inches(1.25) if rnum != "3" else Inches(1.6)

        rcard = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, rx, ry, rw, rh)
        rcard.fill.solid()
        rcard.fill.fore_color.rgb = C_WHITE
        rcard.line.color.rgb = C_BLUE_BORDER
        rcard.line.width = Pt(1.5)

        # Number circle
        cir = s8.shapes.add_shape(MSO_SHAPE.OVAL, rx + Inches(0.12), ry + Inches(0.12), Inches(0.4), Inches(0.4))
        cir.fill.solid()
        cir.fill.fore_color.rgb = C_NAVY_TITLE
        cir.line.color.rgb = C_NAVY_TITLE
        p_c = cir.text_frame.paragraphs[0]
        p_c.text = rnum
        p_c.font.name = "Arial"
        p_c.font.size = Pt(10)
        p_c.font.bold = True
        p_c.font.color.rgb = C_WHITE
        p_c.alignment = PP_ALIGN.CENTER

        tb_rt = s8.shapes.add_textbox(rx + Inches(0.6), ry + Inches(0.08), rw - Inches(0.7), Inches(0.35))
        p = tb_rt.text_frame.paragraphs[0]
        p.text = rtitle
        p.font.name = "Arial"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_NAVY_TITLE

        tb_rd = s8.shapes.add_textbox(rx + Inches(0.6), ry + Inches(0.4), rw - Inches(0.7), rh - Inches(0.45))
        tb_rd.text_frame.word_wrap = True
        p = tb_rd.text_frame.paragraphs[0]
        p.text = rdesc
        p.font.name = "Arial"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT_DARK

    # Right Section: PROTOTYPE → DEMO STORY
    tb_ds_title = s8.shapes.add_textbox(Inches(6.8), Inches(1.3), Inches(5.5), Inches(0.4))
    p = tb_ds_title.text_frame.paragraphs[0]
    p.text = "PROTOTYPE → DEMO STORY"
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    demo_steps = [
        ("1", "START", "Engine transitions OFF → RUNNING (Idle 2000 RPM, nominal baseline).", C_ORANGE_SIH, Inches(1.8)),
        ("2", "THROTTLE ↑", "Press W key: RPM / CHT / EGT / fuel flow / vibration rise; drone climbs into tactical flight.", C_BLUE_ACCENT, Inches(2.7)),
        ("3", "FAULT INJECTION", "Inject Misfire / Overpressure: cylinder pressure spikes or drops; vibration RMS jumps.", C_DANGER, Inches(3.6)),
        ("4", "3D VISUALIZE", "Affected cylinder highlights red in 3D cutaway; tactile speech audio warning sounds.", C_NAVY_TITLE, Inches(4.5)),
        ("5", "PREDICT & ADVISE", "Prognostic banner displays TTF countdown; Weibull RUL drops; safe pilot advisory issued.", C_GREEN_OK, Inches(5.4))
    ]

    for dnum, dtitle, ddesc, dcol, dy in demo_steps:
        dcard = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), dy, Inches(5.9), Inches(0.78))
        dcard.fill.solid()
        dcard.fill.fore_color.rgb = C_WHITE
        dcard.line.color.rgb = dcol
        dcard.line.width = Pt(1.5)

        # Number circle
        cir = s8.shapes.add_shape(MSO_SHAPE.OVAL, Inches(6.92), dy + Inches(0.14), Inches(0.48), Inches(0.48))
        cir.fill.solid()
        cir.fill.fore_color.rgb = dcol
        cir.line.color.rgb = dcol
        p_c = cir.text_frame.paragraphs[0]
        p_c.text = dnum
        p_c.font.name = "Arial"
        p_c.font.size = Pt(11)
        p_c.font.bold = True
        p_c.font.color.rgb = C_WHITE
        p_c.alignment = PP_ALIGN.CENTER

        tb_dt = s8.shapes.add_textbox(Inches(7.55), dy + Inches(0.08), Inches(5.0), Inches(0.3))
        p = tb_dt.text_frame.paragraphs[0]
        p.text = dtitle
        p.font.name = "Arial"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = dcol

        tb_dd = s8.shapes.add_textbox(Inches(7.55), dy + Inches(0.35), Inches(5.0), Inches(0.4))
        p = tb_dd.text_frame.paragraphs[0]
        p.text = ddesc
        p.font.name = "Arial"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT_DARK

    # Bottom Full-Width Takeaway Banner
    bottom_banner = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(6.32), Inches(5.9), Inches(0.5))
    bottom_banner.fill.solid()
    bottom_banner.fill.fore_color.rgb = C_NAVY_DARK
    bottom_banner.line.color.rgb = C_NAVY_DARK
    p_bb = bottom_banner.text_frame.paragraphs[0]
    p_bb.text = "JUDGE TAKEAWAY: CAUSE → EFFECT (Fully Transparent Closed-Loop Digital Twin)"
    p_bb.font.name = "Arial"
    p_bb.font.size = Pt(10.5)
    p_bb.font.bold = True
    p_bb.font.color.rgb = C_WHITE
    p_bb.alignment = PP_ALIGN.CENTER

    # Source Footnote
    tb_src = s8.shapes.add_textbox(Inches(0.6), Inches(6.45), Inches(6.0), Inches(0.4))
    p = tb_src.text_frame.paragraphs[0]
    p.text = "SIH Problem Statement: https://sih2026.vuce.in/ps/SIH26054\nLive Prototype: https://mahi-887.github.io/Virtual-UAV-engine-/"
    p.font.name = "Arial"
    p.font.size = Pt(8.5)
    p.font.color.rgb = C_BLUE_ACCENT

    # Save Presentation
    output_filename = "SIH2026_ENGINE_TWIN_OFFICIAL.pptx"
    prs.save(output_filename)
    print(f"Presentation saved successfully as '{output_filename}' ({len(prs.slides)} slides)!")

if __name__ == "__main__":
    create_presentation()
