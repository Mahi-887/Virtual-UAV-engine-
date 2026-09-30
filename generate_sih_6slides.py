"""
========================================================================================
SMART INDIA HACKATHON 2026 (SIH 2026) — OFFICIAL 6-SLIDE PRESENTATION GENERATOR
Problem Statement ID: SIH26054 | Organization: DRDO
Project: ENGINE-TWIN (AI-Enabled Real-Time Digital Twin for MALE UAV Aero Piston Engines)
STRICT REQUIREMENT: EXACTLY 6 SLIDES (SIH Official Idea Submission Format)
========================================================================================
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

def create_6slide_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Official SIH 2026 Palette
    C_WHITE = RGBColor(255, 255, 255)
    C_NAVY_DARK = RGBColor(15, 41, 66)        # #0F2942
    C_NAVY_TITLE = RGBColor(30, 58, 138)      # #1E3A8A
    C_BLUE_ACCENT = RGBColor(2, 132, 199)     # #0284C7
    C_BLUE_LIGHT = RGBColor(238, 246, 255)
    C_BLUE_BORDER = RGBColor(186, 220, 255)
    C_ORANGE_SIH = RGBColor(234, 88, 12)      # #EA580C
    C_ORANGE_LIGHT = RGBColor(255, 247, 237)
    C_GREEN_OK = RGBColor(22, 163, 74)        # #16A34A
    C_GREEN_LIGHT = RGBColor(240, 253, 244)
    C_DANGER = RGBColor(220, 38, 38)
    C_TEXT_DARK = RGBColor(30, 41, 59)        # #1E293B
    C_TEXT_MUTED = RGBColor(100, 116, 139)    # #64748B

    LOGO_PATH = 'assets_ppt/sih_logo.png'
    BRAIN_PATH = 'assets_ppt/sih_brain.png'
    DUAL_VIEW_PATH = 'assets_ppt/slide4_dual_view.png'
    ENGINE_CUTAWAY_PATH = 'assets_ppt/slide4_engine_cutaway.png'
    FLIGHT_SIM_PATH = 'assets_ppt/slide4_flight_sim.png'

    def add_header_and_footer(slide, title_text, subtitle_text, slide_num):
        # 1. Team Name Oval Badge (Top Left)
        oval = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.5), Inches(0.32), Inches(1.35), Inches(0.92))
        oval.fill.solid()
        oval.fill.fore_color.rgb = C_WHITE
        oval.line.color.rgb = C_NAVY_TITLE
        oval.line.width = Pt(1.5)
        tf_o = oval.text_frame
        tf_o.word_wrap = True
        p_o = tf_o.paragraphs[0]
        p_o.text = "YOUR\nTEAM\nNAME"
        p_o.font.name = "Arial"
        p_o.font.size = Pt(9.5)
        p_o.font.bold = True
        p_o.font.color.rgb = C_NAVY_TITLE
        p_o.alignment = PP_ALIGN.CENTER

        # 2. Slide Title & Subtitle (Center-Left)
        tx_box = slide.shapes.add_textbox(Inches(2.05), Inches(0.38), Inches(8.6), Inches(0.85))
        tf = tx_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r1 = p.add_run()
        r1.text = title_text + " "
        r1.font.name = "Arial"
        r1.font.size = Pt(20)
        r1.font.bold = True
        r1.font.color.rgb = C_NAVY_TITLE

        r2 = p.add_run()
        r2.text = f"| {subtitle_text}"
        r2.font.name = "Arial"
        r2.font.size = Pt(19)
        r2.font.bold = False
        r2.font.color.rgb = C_TEXT_DARK

        # 3. SIH Logo (Top Right)
        if os.path.exists(LOGO_PATH):
            slide.shapes.add_picture(LOGO_PATH, Inches(10.85), Inches(0.2), width=Inches(1.95))

        # 4. Footer Line & Copyright Note
        foot_box = slide.shapes.add_textbox(Inches(3.5), Inches(7.08), Inches(6.3), Inches(0.32))
        p_f = foot_box.text_frame.paragraphs[0]
        p_f.text = "@SIH Idea submission- Template"
        p_f.font.name = "Arial"
        p_f.font.size = Pt(10.5)
        p_f.font.color.rgb = C_BLUE_ACCENT
        p_f.alignment = PP_ALIGN.CENTER

        # Slide Number (Bottom Right)
        num_box = slide.shapes.add_textbox(Inches(12.35), Inches(7.08), Inches(0.55), Inches(0.32))
        p_n = num_box.text_frame.paragraphs[0]
        p_n.text = str(slide_num)
        p_n.font.name = "Arial"
        p_n.font.size = Pt(12)
        p_n.font.bold = True
        p_n.font.color.rgb = C_NAVY_TITLE
        p_n.alignment = PP_ALIGN.RIGHT

    # =========================================================================
    # SLIDE 1 OF 6: TITLE SLIDE
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

    # Big Sub-heading
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
    # SLIDE 2 OF 6: PROPOSED SOLUTION | Closed-Loop Digital Twin
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s2, "PROPOSED SOLUTION", "Reactive Alarms → Predictive Engine Intelligence", 2)

    # Top Navigation Pills
    pills = [
        ("SENSE", C_NAVY_DARK, Inches(0.6)),
        ("ANALYZE", C_BLUE_ACCENT, Inches(2.2)),
        ("PREDICT", C_ORANGE_SIH, Inches(3.8)),
        ("EXPLAIN", C_GREEN_OK, Inches(5.4)),
        ("REPLAY", C_BLUE_ACCENT, Inches(7.0))
    ]
    for ptext, pcol, px in pills:
        pshp = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, Inches(1.38), Inches(1.45), Inches(0.38))
        pshp.fill.solid()
        pshp.fill.fore_color.rgb = pcol
        pshp.line.color.rgb = pcol
        p_p = pshp.text_frame.paragraphs[0]
        p_p.text = ptext
        p_p.font.name = "Arial"
        p_p.font.size = Pt(10.5)
        p_p.font.bold = True
        p_p.font.color.rgb = C_WHITE
        p_p.alignment = PP_ALIGN.CENTER

    # Left Container: PROPOSED SOLUTION Card
    c_left = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.92), Inches(6.0), Inches(4.35))
    c_left.fill.solid()
    c_left.fill.fore_color.rgb = C_WHITE
    c_left.line.color.rgb = C_BLUE_BORDER
    c_left.line.width = Pt(1.5)

    tb_cl = s2.shapes.add_textbox(Inches(0.8), Inches(2.02), Inches(5.6), Inches(3.5))
    tf_cl = tb_cl.text_frame
    tf_cl.word_wrap = True

    p = tf_cl.paragraphs[0]
    p.text = "PROPOSED SOLUTION ARCHITECTURE"
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE
    p.space_after = Pt(10)

    bullet_pts_s2 = [
        "Live Software Twin of MALE-UAV piston engine using real aerodynamic flight state + thermodynamic CAN telemetry.",
        "Physics-Informed Neural Network (PINN) Baseline fused with Isolation Forest anomaly detection and Weibull RUL estimation (β=1.8, η=1500h).",
        "Dual WebGL 3D Visualization: 60 FPS Engine Cutaway (crankshaft/valvetrain kinematics) + Full 3D UAV Flight Dynamics Viewport.",
        "Interactive Causal Fault Injection: Live cylinder misfire, turbo overpressure boost, or oil loss triggers instant causal chain: Telemetry deviation → 3D Cylinder highlight → Speech alert → RUL degradation."
    ]
    for b in bullet_pts_s2:
        pb = tf_cl.add_paragraph()
        pb.text = "• " + b
        pb.font.name = "Arial"
        pb.font.size = Pt(11)
        pb.font.color.rgb = C_TEXT_DARK
        pb.space_after = Pt(7)

    # 3 Badges inside Left Card
    tbadges = [
        ("5–10 Hz TELEMETRY", Inches(0.8), Inches(5.7)),
        ("60 FPS RENDER TARGET", Inches(2.6), Inches(5.7)),
        ("LOCAL + DOCKER", Inches(4.7), Inches(5.7))
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
    c_right = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.92), Inches(5.9), Inches(4.35))
    c_right.fill.solid()
    c_right.fill.fore_color.rgb = C_WHITE
    c_right.line.color.rgb = C_BLUE_BORDER
    c_right.line.width = Pt(1.5)

    tb_cr = s2.shapes.add_textbox(Inches(7.0), Inches(2.02), Inches(5.5), Inches(0.45))
    p = tb_cr.text_frame.paragraphs[0]
    p.text = "CLOSED-LOOP DIGITAL TWIN"
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    # 4 Quadrants
    nodes = [
        ("FLIGHT\nSTATE", Inches(7.1), Inches(2.65), C_BLUE_ACCENT, C_BLUE_LIGHT),
        ("ENGINE\nTELEMETRY", Inches(10.7), Inches(2.65), C_BLUE_ACCENT, C_BLUE_LIGHT),
        ("PHYSICS\nBASELINE", Inches(7.1), Inches(4.35), C_GREEN_OK, C_GREEN_LIGHT),
        ("AI / RUL\nANALYTICS", Inches(10.7), Inches(4.35), C_ORANGE_SIH, C_ORANGE_LIGHT)
    ]
    for ntext, nx, ny, ncol, nbg in nodes:
        nshp = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, nx, ny, Inches(1.7), Inches(0.92))
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

    # Central Hub
    hub = s2.shapes.add_shape(MSO_SHAPE.OVAL, Inches(9.1), Inches(3.45), Inches(1.3), Inches(1.15))
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

    # Diagram Caption
    tb_diag_note = s2.shapes.add_textbox(Inches(7.0), Inches(5.5), Inches(5.5), Inches(0.6))
    p_dn = tb_diag_note.text_frame.paragraphs[0]
    p_dn.text = "One synchronized telemetry stream drives every view — no page reload, no separate demo logic."
    p_dn.font.name = "Arial"
    p_dn.font.size = Pt(10.5)
    p_dn.font.color.rgb = C_TEXT_DARK
    p_dn.alignment = PP_ALIGN.CENTER

    # Bottom Full-Width Ribbon
    ribbon = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(6.38), Inches(12.1), Inches(0.48))
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
    # SLIDE 3 OF 6: TECHNICAL APPROACH & SENSOR FUSION
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s3, "TECHNICAL APPROACH", "5-Layer Modular Architecture & Sensor Fusion", 3)

    # Top Section: 5-Layer Process Cards
    layers = [
        ("01", "FLIGHT\nCONTROL", "Throttle • Altitude • Weather\nUAV kinematic state", C_BLUE_ACCENT, C_BLUE_LIGHT, Inches(0.6)),
        ("02", "SYNTHETIC\nDATA", "Physics-correlated RPM / CHT / EGT\nOil • Fuel • Vib + fault injection", C_BLUE_ACCENT, C_BLUE_LIGHT, Inches(3.05)),
        ("03", "DATA\nINGESTION", "Fixed JSON contract\nWebSocket / MQTT-ready (10 Hz)", C_GREEN_OK, C_GREEN_LIGHT, Inches(5.5)),
        ("04", "DIGITAL TWIN\n+ AI", "PINN thermodynamic baseline\nAnomaly detection + Weibull RUL", C_ORANGE_SIH, C_ORANGE_LIGHT, Inches(7.95)),
        ("05", "3D +\nDASHBOARD", "WebGL Live engine + Flight sim\nCharts + Speech audio alarms", C_NAVY_TITLE, C_BLUE_LIGHT, Inches(10.4))
    ]

    for num, title, desc, col, bg, lx in layers:
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, lx, Inches(1.35), Inches(2.35), Inches(1.75))
        card.fill.solid()
        card.fill.fore_color.rgb = bg
        card.line.color.rgb = col
        card.line.width = Pt(1.5)

        c_num = s3.shapes.add_shape(MSO_SHAPE.OVAL, lx + Inches(0.12), Inches(1.45), Inches(0.42), Inches(0.42))
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

        tb_ct = s3.shapes.add_textbox(lx + Inches(0.62), Inches(1.4), Inches(1.6), Inches(0.55))
        p_t = tb_ct.text_frame.paragraphs[0]
        p_t.text = title
        p_t.font.name = "Arial"
        p_t.font.size = Pt(10)
        p_t.font.bold = True
        p_t.font.color.rgb = col

        tb_cd = s3.shapes.add_textbox(lx + Inches(0.12), Inches(2.0), Inches(2.1), Inches(1.0))
        tb_cd.text_frame.word_wrap = True
        p_d = tb_cd.text_frame.paragraphs[0]
        p_d.text = desc
        p_d.font.name = "Arial"
        p_d.font.size = Pt(9)
        p_d.font.color.rgb = C_TEXT_DARK

    # Bottom Left: 10 Telemetry Channels vs Real-World Sensor Table
    tbl_shape = s3.shapes.add_table(8, 3, Inches(0.6), Inches(3.25), Inches(6.0), Inches(3.6))
    tbl = tbl_shape.table
    tbl.columns[0].width = Inches(2.2)
    tbl.columns[1].width = Inches(2.4)
    tbl.columns[2].width = Inches(1.4)

    t_data = [
        ["Telemetry Channel", "Sensor Hardware", "Source"],
        ["Rotational Speed (RPM)", "RPM Hall Sensor", "CAN-fused, live"],
        ["In-Cylinder Pressure", "Piezoelectric transducer", "Physics-derived"],
        ["Cylinder Head Temp (CHT)", "K-type thermocouple (Cyl 1–4)", "CAN-fused, live"],
        ["Exhaust Gas Temp (EGT)", "Exhaust thermocouple", "Physics-derived"],
        ["Oil Pressure / Temp", "Oil Transducer (PSI/°C)", "CAN-fused, live"],
        ["3-Axis Vibration (RMS)", "Piezo Accelerometer / IMU", "CAN-fused, live"],
        ["28V Bus Electrical", "Voltage-divider ADC channel", "Physics-derived"]
    ]
    for r_idx, row in enumerate(t_data):
        for c_idx, cell_txt in enumerate(row):
            cell = tbl.cell(r_idx, c_idx)
            cell.text = cell_txt
            p = cell.text_frame.paragraphs[0]
            p.font.name = "Arial"
            if r_idx == 0:
                cell.fill.solid()
                cell.fill.fore_color.rgb = C_NAVY_DARK
                p.font.bold = True
                p.font.size = Pt(9.5)
                p.font.color.rgb = C_WHITE
            else:
                cell.fill.solid()
                cell.fill.fore_color.rgb = C_WHITE if r_idx % 2 == 1 else RGBColor(248, 250, 252)
                p.font.size = Pt(8.5)
                p.font.color.rgb = C_TEXT_DARK
                if c_idx == 2:
                    p.font.bold = True
                    p.font.color.rgb = C_BLUE_ACCENT if "CAN" in cell_txt else C_TEXT_MUTED

    # Bottom Right: Mathematical Equations & AI Formulation Card
    c_eq = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(3.25), Inches(5.9), Inches(3.6))
    c_eq.fill.solid()
    c_eq.fill.fore_color.rgb = C_WHITE
    c_eq.line.color.rgb = C_BLUE_BORDER
    c_eq.line.width = Pt(1.5)

    tb_eq_t = s3.shapes.add_textbox(Inches(7.0), Inches(3.35), Inches(5.5), Inches(0.35))
    p = tb_eq_t.text_frame.paragraphs[0]
    p.text = "PHYSICS GOVERNING LAWS & AI FORMULATION"
    p.font.name = "Arial"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    tb_eq_body = s3.shapes.add_textbox(Inches(7.0), Inches(3.75), Inches(5.5), Inches(3.0))
    tf_eq = tb_eq_body.text_frame
    tf_eq.word_wrap = True

    eq_lines = [
        ("Thermodynamic CHT:", "T_cyl = T_amb + 38 + (Load × 52) − (V_kts / 75) × 22"),
        ("In-Cylinder Pressure:", "P_max = (MAP / 100) × (r_c)^1.35 × (2.4 + 1.2 × Throttle)"),
        ("PINN Loss Function:", "Loss = MSE(actual, pred) + λ·|Q_comb − (W_shaft + Q_exh + Q_cool)|"),
        ("Weibull RUL Model:", "R_t = exp( − (t / 1500)^1.8 ) → TTF countdown in seconds"),
        ("Structural Thresholds:", "P_cyl > 88.5 bar, CHT > 138°C, Oil < 25 psi trigger predictive alert")
    ]
    for i, (k, formula) in enumerate(eq_lines):
        p_e = tf_eq.paragraphs[0] if i == 0 else tf_eq.add_paragraph()
        p_e.space_after = Pt(6)
        r_k = p_e.add_run()
        r_k.text = k + " "
        r_k.font.bold = True
        r_k.font.color.rgb = C_NAVY_TITLE
        r_k.font.size = Pt(10)
        r_f = p_e.add_run()
        r_f.text = formula
        r_f.font.color.rgb = C_TEXT_DARK
        r_f.font.size = Pt(9.5)

    # =========================================================================
    # SLIDE 4 OF 6: PROTOTYPE WALKTHROUGH & VALIDATION
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s4, "PROTOTYPE WALKTHROUGH", "Live System Screens & Parameter Validation", 4)

    # Left: Big Dual Viewport Screenshot
    card_dv = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.35), Inches(6.8), Inches(4.7))
    card_dv.fill.solid()
    card_dv.fill.fore_color.rgb = C_WHITE
    card_dv.line.color.rgb = C_BLUE_BORDER
    card_dv.line.width = Pt(1.5)

    if os.path.exists(DUAL_VIEW_PATH):
        s4.shapes.add_picture(DUAL_VIEW_PATH, Inches(0.7), Inches(1.45), width=Inches(6.6), height=Inches(3.7))

    tb_dv_c = s4.shapes.add_textbox(Inches(0.7), Inches(5.25), Inches(6.6), Inches(0.75))
    tf_dv = tb_dv_c.text_frame
    tf_dv.word_wrap = True
    p = tf_dv.paragraphs[0]
    p.text = "Dual Viewport Live Build — 3D Flight Dynamics (Left) + 3D Engine Cutaway (Right) driven synchronously at 60 FPS by real-time physics telemetry. Features live RPM / CHT / EGT / Oil gauges and speech alert engine."
    p.font.name = "Arial"
    p.font.size = Pt(10)
    p.font.color.rgb = C_TEXT_DARK

    # Top Right: 3D Engine Cutaway
    card_e = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.7), Inches(1.35), Inches(5.0), Inches(2.3))
    card_e.fill.solid()
    card_e.fill.fore_color.rgb = C_WHITE
    card_e.line.color.rgb = C_BLUE_BORDER
    card_e.line.width = Pt(1.5)

    if os.path.exists(ENGINE_CUTAWAY_PATH):
        s4.shapes.add_picture(ENGINE_CUTAWAY_PATH, Inches(7.78), Inches(1.42), width=Inches(4.84), height=Inches(2.15))

    # Bottom Right: 4 Validation Spec Cards
    v_cards = [
        ("CAN BUS INTERFACE", "500 kbps · CAN 2.0B protocol\n6 CAN-fused + 3 physics-derived channels", C_BLUE_ACCENT, C_BLUE_LIGHT, Inches(7.7), Inches(3.85)),
        ("COMBUSTION SPEC", "Rotax 914 Turbo · 1211 cc · 84.5 kW\nFiring order 1-3-4-2 · AFR λ = 1.0", C_ORANGE_SIH, C_ORANGE_LIGHT, Inches(10.3), Inches(3.85)),
        ("LIVE RUL ESTIMATION", "Nominal: 73% RUL (≈ 1089 h)\nDrops dynamically under fault injection", C_DANGER, RGBColor(254, 242, 242), Inches(7.7), Inches(4.95)),
        ("SAFETY MARGINS", "88.5 bar max cyl pressure · 138°C CHT\n25 psi minimum oil pressure threshold", C_GREEN_OK, C_GREEN_LIGHT, Inches(10.3), Inches(4.95))
    ]
    for vt, vd, vc, vb, vx, vy in v_cards:
        vshp = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, vx, vy, Inches(2.4), Inches(1.05))
        vshp.fill.solid()
        vshp.fill.fore_color.rgb = vb
        vshp.line.color.rgb = vc
        vshp.line.width = Pt(1.5)

        tb_vt = s4.shapes.add_textbox(vx + Inches(0.08), vy + Inches(0.05), Inches(2.24), Inches(0.35))
        p = tb_vt.text_frame.paragraphs[0]
        p.text = vt
        p.font.name = "Arial"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = vc

        tb_vd = s4.shapes.add_textbox(vx + Inches(0.08), vy + Inches(0.38), Inches(2.24), Inches(0.65))
        tb_vd.text_frame.word_wrap = True
        p = tb_vd.text_frame.paragraphs[0]
        p.text = vd
        p.font.name = "Arial"
        p.font.size = Pt(9)
        p.font.color.rgb = C_TEXT_DARK

    # Bottom Full-Width Ribbon
    ribbon4 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(6.32), Inches(12.1), Inches(0.48))
    ribbon4.fill.solid()
    ribbon4.fill.fore_color.rgb = C_NAVY_DARK
    ribbon4.line.color.rgb = C_NAVY_DARK
    p_r4 = ribbon4.text_frame.paragraphs[0]
    p_r4.text = "Live Working Demonstration: https://mahi-887.github.io/Virtual-UAV-engine-/  |  Zero Installation, 100% WebGL Accessible"
    p_r4.font.name = "Arial"
    p_r4.font.size = Pt(11)
    p_r4.font.bold = True
    p_r4.font.color.rgb = C_WHITE
    p_r4.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 5 OF 6: FEASIBILITY, CHALLENGES & ROADMAP
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s5, "FEASIBILITY & VIABILITY", "Challenges, Mitigations & Phased Deployment Path", 5)

    # Top Row: 4 Metric Cards
    top_metrics = [
        ("SOFTWARE-ONLY NOW", "No physical engine/sensors required for prototype evaluation.", C_BLUE_ACCENT, Inches(0.6)),
        ("REAL-TIME", "WebSocket target 5–10 Hz; render loop decoupled for smooth 60 FPS 3D.", C_GREEN_OK, Inches(3.7)),
        ("DROP-IN DATA SOURCE", "Synthetic generator → later CAN/ECU/FADEC without downstream rewrite.", C_ORANGE_SIH, Inches(6.8)),
        ("DEPLOYABLE NOW", "Docker Compose + GitHub Pages for repeatable local demo & instant validation.", C_NAVY_DARK, Inches(9.9))
    ]

    for mtitle, mdesc, mcol, mx in top_metrics:
        mcard = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, mx, Inches(1.35), Inches(2.85), Inches(1.15))
        mcard.fill.solid()
        mcard.fill.fore_color.rgb = C_WHITE
        mcard.line.color.rgb = mcol
        mcard.line.width = Pt(1.5)

        mpill = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, mx + Inches(0.12), Inches(1.45), Inches(1.8), Inches(0.3))
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

        tb_md = s5.shapes.add_textbox(mx + Inches(0.12), Inches(1.8), Inches(2.6), Inches(0.65))
        tb_md.text_frame.word_wrap = True
        p = tb_md.text_frame.paragraphs[0]
        p.text = mdesc
        p.font.name = "Arial"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT_DARK

    # Middle Section: Challenges Table
    tb_ch_title = s5.shapes.add_textbox(Inches(0.6), Inches(2.65), Inches(5.0), Inches(0.35))
    p = tb_ch_title.text_frame.paragraphs[0]
    p.text = "CHALLENGES → MITIGATION"
    p.font.name = "Arial"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    ch_shape = s5.shapes.add_table(4, 3, Inches(0.6), Inches(3.05), Inches(12.1), Inches(2.15))
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

    # Bottom: 3-Phase Deployment Roadmap
    tb_pp_title = s5.shapes.add_textbox(Inches(0.6), Inches(5.35), Inches(5.0), Inches(0.35))
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
        p_card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, Inches(5.75), Inches(3.8), Inches(1.15))
        p_card.fill.solid()
        p_card.fill.fore_color.rgb = C_WHITE
        p_card.line.color.rgb = p_col
        p_card.line.width = Pt(1.5)

        cir = s5.shapes.add_shape(MSO_SHAPE.OVAL, px + Inches(0.12), Inches(5.85), Inches(0.45), Inches(0.45))
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

        tb_pn = s5.shapes.add_textbox(px + Inches(0.65), Inches(5.8), Inches(3.0), Inches(0.35))
        p = tb_pn.text_frame.paragraphs[0]
        p.text = p_name
        p.font.name = "Arial"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = p_col

        tb_pd = s5.shapes.add_textbox(px + Inches(0.12), Inches(6.3), Inches(3.5), Inches(0.55))
        tb_pd.text_frame.word_wrap = True
        p = tb_pd.text_frame.paragraphs[0]
        p.text = p_desc
        p.font.name = "Arial"
        p.font.size = Pt(9)
        p.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # SLIDE 6 OF 6: IMPACT, DEFENSE BENEFITS & DEMO STORY
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s6, "IMPACT & BENEFITS", "Predictive Mission Reliability & Demo Walkthrough", 6)

    # Top: FROM TELEMETRY TO DECISION (5 Steps)
    flow_steps = [
        ("1", "LIVE DATA", "Engine + flight state", C_BLUE_ACCENT, Inches(0.6)),
        ("2", "TWIN STATE", "Expected vs observed", C_BLUE_ACCENT, Inches(3.05)),
        ("3", "EARLY SIGNAL", "Anomaly / trend detection", C_ORANGE_SIH, Inches(5.5)),
        ("4", "ACTION", "Voice alert / pilot advisory", C_DANGER, Inches(7.95)),
        ("5", "REPLAY", "Post-flight learning loop", C_GREEN_OK, Inches(10.4))
    ]
    for fnum, ftitle, fdesc, fcol, fx in flow_steps:
        fcard = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, fx, Inches(1.35), Inches(2.35), Inches(1.2))
        fcard.fill.solid()
        fcard.fill.fore_color.rgb = C_WHITE
        fcard.line.color.rgb = fcol
        fcard.line.width = Pt(1.5)

        cir = s6.shapes.add_shape(MSO_SHAPE.OVAL, fx + Inches(0.1), Inches(1.42), Inches(0.35), Inches(0.35))
        cir.fill.solid()
        cir.fill.fore_color.rgb = fcol
        cir.line.color.rgb = fcol
        p_c = cir.text_frame.paragraphs[0]
        p_c.text = fnum
        p_c.font.name = "Arial"
        p_c.font.size = Pt(9)
        p_c.font.bold = True
        p_c.font.color.rgb = C_WHITE
        p_c.alignment = PP_ALIGN.CENTER

        tb_ft = s6.shapes.add_textbox(fx + Inches(0.5), Inches(1.4), Inches(1.75), Inches(0.3))
        p = tb_ft.text_frame.paragraphs[0]
        p.text = ftitle
        p.font.name = "Arial"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = fcol

        tb_fd = s6.shapes.add_textbox(fx + Inches(0.1), Inches(1.8), Inches(2.15), Inches(0.7))
        tb_fd.text_frame.word_wrap = True
        p = tb_fd.text_frame.paragraphs[0]
        p.text = fdesc
        p.font.name = "Arial"
        p.font.size = Pt(9)
        p.font.color.rgb = C_TEXT_DARK

    # Middle Left: Who Benefits & How (4 Stakeholders)
    tb_w_title = s6.shapes.add_textbox(Inches(0.6), Inches(2.7), Inches(5.0), Inches(0.35))
    p = tb_w_title.text_frame.paragraphs[0]
    p.text = "DEFENSE STAKEHOLDER IMPACT"
    p.font.name = "Arial"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    stakeholders = [
        ("UAV OPERATOR", "Live health status, tactical fault voice alerts, zero sensory overload.", C_BLUE_ACCENT, Inches(3.1)),
        ("PROPULSION CREW", "Condition-based overhaul, RUL tracking, black-box incident replay.", C_ORANGE_SIH, Inches(3.75)),
        ("TEST & VALIDATION", "Repeatable fault injection (misfire, overpressure, oil loss) & border weather.", C_GREEN_OK, Inches(4.4)),
        ("DEFENSE FLEET", "Common CAN digital twin standard for TAPAS & Rustom-II UAV squadrons.", C_NAVY_DARK, Inches(5.05))
    ]
    for stitle, sdesc, scol, sy in stakeholders:
        spill = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), sy, Inches(2.1), Inches(0.52))
        spill.fill.solid()
        spill.fill.fore_color.rgb = scol
        spill.line.color.rgb = scol
        p_sp = spill.text_frame.paragraphs[0]
        p_sp.text = stitle
        p_sp.font.name = "Arial"
        p_sp.font.size = Pt(8.5)
        p_sp.font.bold = True
        p_sp.font.color.rgb = C_WHITE
        p_sp.alignment = PP_ALIGN.CENTER

        stext = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.8), sy, Inches(3.5), Inches(0.52))
        stext.fill.solid()
        stext.fill.fore_color.rgb = C_WHITE
        stext.line.color.rgb = C_BLUE_BORDER
        stext.line.width = Pt(1)
        p_st = stext.text_frame.paragraphs[0]
        p_st.text = sdesc
        p_st.font.name = "Arial"
        p_st.font.size = Pt(9)
        p_st.font.color.rgb = C_TEXT_DARK

    # Middle Right: PROTOTYPE → DEMO STORY (5-Step Demo)
    tb_ds_title = s6.shapes.add_textbox(Inches(6.8), Inches(2.7), Inches(5.5), Inches(0.35))
    p = tb_ds_title.text_frame.paragraphs[0]
    p.text = "PROTOTYPE → 5-STEP DEMO STORY"
    p.font.name = "Arial"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_TITLE

    demo_steps = [
        ("1", "START", "Engine transitions OFF → RUNNING (Idle 2000 RPM, nominal baseline).", C_ORANGE_SIH, Inches(3.1)),
        ("2", "THROTTLE ↑", "Press W key: RPM / CHT / EGT / fuel rise; drone climbs into tactical flight.", C_BLUE_ACCENT, Inches(3.62)),
        ("3", "FAULT INJECT", "Inject Misfire / Overboost: cylinder pressure spikes/drops; vibration jumps.", C_DANGER, Inches(4.14)),
        ("4", "3D VISUALIZE", "Affected cylinder highlights red in 3D cutaway; voice audio warning sounds.", C_NAVY_TITLE, Inches(4.66)),
        ("5", "PREDICT & ACT", "Prognostic banner shows TTF countdown; Weibull RUL drops; advisory issued.", C_GREEN_OK, Inches(5.18))
    ]
    for dnum, dtitle, ddesc, dcol, dy in demo_steps:
        dcard = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), dy, Inches(5.9), Inches(0.46))
        dcard.fill.solid()
        dcard.fill.fore_color.rgb = C_WHITE
        dcard.line.color.rgb = dcol
        dcard.line.width = Pt(1)

        cir = s6.shapes.add_shape(MSO_SHAPE.OVAL, Inches(6.9), dy + Inches(0.08), Inches(0.3), Inches(0.3))
        cir.fill.solid()
        cir.fill.fore_color.rgb = dcol
        cir.line.color.rgb = dcol
        p_c = cir.text_frame.paragraphs[0]
        p_c.text = dnum
        p_c.font.name = "Arial"
        p_c.font.size = Pt(8.5)
        p_c.font.bold = True
        p_c.font.color.rgb = C_WHITE
        p_c.alignment = PP_ALIGN.CENTER

        tb_dt = s6.shapes.add_textbox(Inches(7.3), dy + Inches(0.04), Inches(1.3), Inches(0.35))
        p = tb_dt.text_frame.paragraphs[0]
        p.text = dtitle
        p.font.name = "Arial"
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = dcol

        tb_dd = s6.shapes.add_textbox(Inches(8.65), dy + Inches(0.04), Inches(4.0), Inches(0.35))
        tb_dd.text_frame.word_wrap = True
        p = tb_dd.text_frame.paragraphs[0]
        p.text = ddesc
        p.font.name = "Arial"
        p.font.size = Pt(8.5)
        p.font.color.rgb = C_TEXT_DARK

    # Bottom Row: 4 Value Pillars
    pillars = [
        ("Predictive: Trend before threshold", C_BLUE_ACCENT, Inches(0.6)),
        ("Transparent: Physics + AI", C_GREEN_OK, Inches(3.7)),
        ("Reusable: Synthetic → CAN/ECU", C_ORANGE_SIH, Inches(6.8)),
        ("Operational: Simulate + Replay", C_DANGER, Inches(9.9))
    ]
    for pil_txt, pil_col, px in pillars:
        p_shp = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, Inches(5.8), Inches(2.85), Inches(0.42))
        p_shp.fill.solid()
        p_shp.fill.fore_color.rgb = C_WHITE
        p_shp.line.color.rgb = pil_col
        p_shp.line.width = Pt(1.5)
        p = p_shp.text_frame.paragraphs[0]
        p.text = pil_txt
        p.font.name = "Arial"
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = pil_col
        p.alignment = PP_ALIGN.CENTER

    # Bottom Full-Width Takeaway Banner
    bottom_banner = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(6.38), Inches(12.1), Inches(0.48))
    bottom_banner.fill.solid()
    bottom_banner.fill.fore_color.rgb = C_NAVY_DARK
    bottom_banner.line.color.rgb = C_NAVY_DARK
    p_bb = bottom_banner.text_frame.paragraphs[0]
    p_bb.text = "JUDGE TAKEAWAY: CAUSE → EFFECT (Fully Transparent Closed-Loop Digital Twin)  |  PS SIH26054 DRDO"
    p_bb.font.name = "Arial"
    p_bb.font.size = Pt(11)
    p_bb.font.bold = True
    p_bb.font.color.rgb = C_WHITE
    p_bb.alignment = PP_ALIGN.CENTER

    # Save Output
    output_filename = "SIH2026_ENGINE_TWIN_6SLIDES.pptx"
    prs.save(output_filename)
    print(f"Presentation saved successfully as '{output_filename}' (EXACTLY {len(prs.slides)} slides)!")

if __name__ == "__main__":
    create_6slide_presentation()
