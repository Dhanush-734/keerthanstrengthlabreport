"""
KEERTHAN STRENGTH LAB — OFFICIAL ASSESSMENT DOSSIER ENGINE
Exact 4-Page Format strictly matching official qualification screening dossier:
Page 1: 1. Client Screening Form (Learner to complete with client)
Page 2: 2. Physical Activity Readiness Questionnaire (PAR-Q) (Client to complete)
Page 3: 4. Initial Assessment (Learner to complete)
Page 4: Client's barriers to exercise
"""

import os
import io
import base64
import pymupdf
from PIL import Image, ImageDraw

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def create_rounded_logo():
    soft_logo = os.path.join(BASE_DIR, 'logo_rounded_soft.png')
    if os.path.exists(soft_logo):
        return soft_logo
    try:
        raw_logo = os.path.join(BASE_DIR, 'logo.jpg')
        if not os.path.exists(raw_logo):
            return None
        im = Image.open(raw_logo).convert('RGBA')
        w, h = im.size
        radius = int(w * 0.12)
        mask = Image.new('L', (w, h), 0)
        draw = ImageDraw.Draw(mask)
        draw.rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
        im.putalpha(mask)
        im.save(soft_logo)
        return soft_logo
    except Exception as e:
        print(f"Logo processing error: {e}")
        return None

# ==============================================================================
# EXACT COLORS MATCHING PHYSICAL DOSSIER PHOTOS
# ==============================================================================
C_HEADER_BLUE  = (0.122, 0.306, 0.475)   # #1F4E79 Deep professional blue
C_SUBTITLE_RED = (0.753, 0.0, 0.0)      # #C00000 Reddish burgundy for subtitle notes
C_TH_BG        = (0.722, 0.800, 0.894)   # #B8CCE4 Soft slate-blue table header
C_TH_SUB_BG    = (0.851, 0.882, 0.949)   # #D9E1F2 Lighter slate header
C_BORDER       = (0.350, 0.380, 0.420)   # #59616B Clean slate border
C_TEXT_BLACK   = (0.05, 0.05, 0.05)      # Near black text
C_WHITE        = (1.0, 1.0, 1.0)
C_RED_PEN      = (0.80, 0.12, 0.12)      # Red pen circle for chosen tests

def draw_cell(p, x0, y0, w, h, bg_color=None, border_color=C_BORDER, border_width=0.65):
    rect = pymupdf.Rect(x0, y0, x0 + w, y0 + h)
    p.draw_rect(rect, color=border_color, fill=bg_color, width=border_width)
    return rect

def cell_text_single(p, text, x0, y0, w, h, fontsize=8.0, fontname="Helvetica", color=C_TEXT_BLACK, bold=False, padding_x=4.0):
    fn = "Helvetica-Bold" if bold else fontname
    y_base = y0 + (h + fontsize * 0.72) / 2.0
    p.insert_text(pymupdf.Point(x0 + padding_x, y_base), str(text), fontsize=fontsize, fontname=fn, color=color)

def draw_wrapped_text(p, text, x0, y0, max_w, fontsize=7.5, fontname="Helvetica", color=C_TEXT_BLACK, bold=False, line_height=10.0):
    if not text:
        return 0
    fn = "Helvetica-Bold" if bold else fontname
    words = str(text).split()
    lines = []
    cur = []
    for w in words:
        test = " ".join(cur + [w])
        if pymupdf.get_text_length(test, fontname=fn, fontsize=fontsize) <= max_w:
            cur.append(w)
        else:
            if cur:
                lines.append(" ".join(cur))
            cur = [w]
    if cur:
        lines.append(" ".join(cur))

    cur_y = y0 + fontsize * 0.85
    for l in lines:
        p.insert_text(pymupdf.Point(x0, cur_y), l, fontsize=fontsize, fontname=fn, color=color)
        cur_y += line_height
    return len(lines) * line_height

def add_widget_field(p, name, x0, y0, w, h, value="", fontsize=8.0, multiline=False):
    widget = pymupdf.Widget()
    widget.rect = pymupdf.Rect(x0 + 1, y0 + 1, x0 + w - 1, y0 + h - 1)
    widget.field_name = name
    widget.field_type = pymupdf.PDF_WIDGET_TYPE_TEXT
    widget.text_fontsize = fontsize
    widget.text_font = "Helvetica"
    widget.text_color = C_TEXT_BLACK
    widget.fill_color = C_WHITE
    widget.border_color = None
    widget.border_width = 0
    if multiline:
        widget.field_flags |= pymupdf.PDF_TX_FIELD_IS_MULTILINE
    if value:
        widget.field_value = str(value)
    p.add_widget(widget)

def draw_brand_header(p, left_m, right_m, y0):
    """Subtle Keerthan Strength Lab brand header at the very top."""
    logo_path = create_rounded_logo()
    if logo_path and os.path.exists(logo_path):
        p.insert_image(pymupdf.Rect(right_m - 20, y0, right_m, y0 + 20), filename=logo_path)
    p.insert_text(pymupdf.Point(right_m - 138, y0 + 14), "KEERTHAN STRENGTH LAB", 
                  fontsize=7.2, fontname="Helvetica-Bold", color=C_HEADER_BLUE)

# ==============================================================================
# PAGE 1: 1. Client Screening Form (Learner to complete with client)
# ==============================================================================
def render_page_1(doc, data, is_fillable=False):
    p = doc.new_page(width=595.28, height=841.89)
    left_m = 36.0
    right_m = 559.28
    content_w = right_m - left_m
    
    y = 20.0
    draw_brand_header(p, left_m, right_m, y)
    y += 20.0
    
    # Title line
    p.insert_text(pymupdf.Point(left_m, y + 15), "Client Screening Form ", 
                  fontsize=12.0, fontname="Helvetica-Bold", color=C_HEADER_BLUE)
    w_t1 = pymupdf.get_text_length("Client Screening Form ", "Helvetica-Bold", 12.0)
    p.insert_text(pymupdf.Point(left_m + w_t1, y + 15), "(Learner to complete with client)", 
                  fontsize=10.0, fontname="Helvetica-BoldOblique", color=C_SUBTITLE_RED)
    
    p.draw_line(pymupdf.Point(left_m, y + 21), pymupdf.Point(right_m, y + 21), color=C_TH_BG, width=0.8)
    y += 26.0

    # Table 1: Learner's Name | Date
    w_learner = 385.0
    w_date = content_w - w_learner
    draw_cell(p, left_m, y, w_learner, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Learner's Name", left_m, y, w_learner, 15.0, fontsize=8.0, bold=True)
    draw_cell(p, left_m + w_learner, y, w_date, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Date", left_m + w_learner, y, w_date, 15.0, fontsize=8.0, bold=True)
    y += 15.0

    draw_cell(p, left_m, y, w_learner, 20.0, bg_color=C_WHITE)
    if is_fillable:
        add_widget_field(p, "learner_name", left_m, y, w_learner, 20.0, data.get('learner_name', ''))
    else:
        cell_text_single(p, data.get('learner_name', ''), left_m, y, w_learner, 20.0, fontsize=8.2)

    draw_cell(p, left_m + w_learner, y, w_date, 20.0, bg_color=C_WHITE)
    if is_fillable:
        add_widget_field(p, "screening_date", left_m + w_learner, y, w_date, 20.0, data.get('screening_date', ''))
    else:
        cell_text_single(p, data.get('screening_date', ''), left_m + w_learner, y, w_date, 20.0, fontsize=8.2)
    y += 26.0

    # Table 2: Client details
    draw_cell(p, left_m, y, content_w, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Client details", left_m, y, content_w, 15.0, fontsize=8.0, bold=True)
    y += 15.0

    w_cname = 180.0
    w_rest = (content_w - w_cname) / 4.0
    col_heads = [("Client's Name", w_cname), ("Gender", w_rest), ("Height", w_rest), ("Weight", w_rest), ("Age", w_rest)]
    cx = left_m
    for label, cw in col_heads:
        draw_cell(p, cx, y, cw, 15.0, bg_color=C_TH_BG)
        cell_text_single(p, label, cx, y, cw, 15.0, fontsize=8.0, bold=True)
        cx += cw
    y += 15.0

    cx = left_m
    client_fields = [
        ('client_name', data.get('client_name') or data.get('full_name', ''), w_cname),
        ('gender', data.get('gender', ''), w_rest),
        ('height', data.get('height', ''), w_rest),
        ('weight', data.get('weight', ''), w_rest),
        ('age', data.get('age', ''), w_rest)
    ]
    for fn, val, cw in client_fields:
        draw_cell(p, cx, y, cw, 20.0, bg_color=C_WHITE)
        if is_fillable:
            add_widget_field(p, fn, cx, y, cw, 20.0, val)
        else:
            cell_text_single(p, val, cx, y, cw, 20.0, fontsize=8.0)
        cx += cw
    y += 26.0

    # Table 3: Health risk factors
    draw_cell(p, left_m, y, content_w, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Any health risk factors? Ensure the client also completes the PAR-Q", left_m, y, content_w, 15.0, fontsize=8.0, bold=True)
    y += 15.0
    draw_cell(p, left_m, y, content_w, 48.0, bg_color=C_WHITE)
    if is_fillable:
        add_widget_field(p, "health_risk_factors", left_m, y, content_w, 48.0, data.get('health_risk_factors', ''), multiline=True)
    else:
        draw_wrapped_text(p, data.get('health_risk_factors', ''), left_m + 6, y + 4, content_w - 12, fontsize=7.5)
    y += 54.0

    # Table 4: Medical History & Medications
    draw_cell(p, left_m, y, content_w, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Client Medical history", left_m, y, content_w, 15.0, fontsize=8.0, bold=True)
    y += 15.0
    draw_cell(p, left_m, y, content_w, 42.0, bg_color=C_WHITE)
    if is_fillable:
        add_widget_field(p, "medical_history", left_m, y, content_w, 42.0, data.get('medical_history', ''), multiline=True)
    else:
        draw_wrapped_text(p, data.get('medical_history', ''), left_m + 6, y + 4, content_w - 12, fontsize=7.5)
    y += 42.0

    w_lbl = 125.0
    w_val = content_w - w_lbl
    draw_cell(p, left_m, y, w_lbl, 28.0, bg_color=C_TH_BG)
    cell_text_single(p, "Client's Medications", left_m, y, w_lbl, 28.0, fontsize=8.0, bold=True)
    draw_cell(p, left_m + w_lbl, y, w_val, 28.0, bg_color=C_WHITE)
    if is_fillable:
        add_widget_field(p, "medications", left_m + w_lbl, y, w_val, 28.0, data.get('medications', ''), multiline=True)
    else:
        draw_wrapped_text(p, data.get('medications', ''), left_m + w_lbl + 6, y + 4, w_val - 12, fontsize=7.5)
    y += 34.0

    # Table 5: Lifestyle Evaluation
    draw_cell(p, left_m, y, content_w, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Lifestyle Evaluation", left_m, y, content_w, 15.0, fontsize=8.0, bold=True)
    y += 15.0

    lifestyle_rows = [
        ("Occupation", data.get('occupation', ''), 20.0, "occupation"),
        ("Time availability on a\nweekly basis", data.get('time_availability', ''), 24.0, "time_availability"),
        ("General Lifestyle\nsummary (diet, sleep,\nhabits)", data.get('lifestyle_summary', ''), 46.0, "lifestyle_summary")
    ]
    for lbl, val, rh, fn in lifestyle_rows:
        draw_cell(p, left_m, y, w_lbl, rh, bg_color=C_TH_BG)
        if "\n" in lbl:
            draw_wrapped_text(p, lbl, left_m + 5, y + 3, w_lbl - 8, fontsize=7.5, bold=True, line_height=9.0)
        else:
            cell_text_single(p, lbl, left_m, y, w_lbl, rh, fontsize=8.0, bold=True)
        draw_cell(p, left_m + w_lbl, y, w_val, rh, bg_color=C_WHITE)
        if is_fillable:
            add_widget_field(p, fn, left_m + w_lbl, y, w_val, rh, val, multiline=(rh > 25.0))
        else:
            draw_wrapped_text(p, val, left_m + w_lbl + 6, y + 4, w_val - 12, fontsize=7.5)
        y += rh
    y += 6.0

    # Table 6: Current Fitness Profile
    draw_cell(p, left_m, y, content_w, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Current Fitness Profile", left_m, y, content_w, 15.0, fontsize=8.0, bold=True)
    y += 15.0

    w_fit = 160.0
    w_fit_val = content_w - w_fit
    fit_rows = [
        ("Physical activity levels:\nLOW/MEDIUM/HIGH", data.get('activity_level', 'MEDIUM'), 20.0, "activity_level"),
        ("Exercise and training history", data.get('training_history', ''), 28.0, "training_history"),
        ("Exercise contraindications", data.get('exercise_contraindications', ''), 28.0, "exercise_contraindications")
    ]
    for lbl, val, rh, fn in fit_rows:
        draw_cell(p, left_m, y, w_fit, rh, bg_color=C_TH_BG)
        if "\n" in lbl:
            draw_wrapped_text(p, lbl, left_m + 5, y + 2, w_fit - 8, fontsize=7.5, bold=True, line_height=9.0)
        else:
            cell_text_single(p, lbl, left_m, y, w_fit, rh, fontsize=8.0, bold=True)
        draw_cell(p, left_m + w_fit, y, w_fit_val, rh, bg_color=C_WHITE)
        if is_fillable:
            add_widget_field(p, fn, left_m + w_fit, y, w_fit_val, rh, val, multiline=(rh > 24.0))
        else:
            draw_wrapped_text(p, val, left_m + w_fit + 6, y + 4, w_fit_val - 12, fontsize=7.5)
        y += rh
    y += 6.0

    # Table 7: Client's Exercise preference
    draw_cell(p, left_m, y, content_w, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Client's Exercise preference", left_m, y, content_w, 15.0, fontsize=8.0, bold=True)
    y += 15.0

    w_half = content_w / 2.0
    draw_cell(p, left_m, y, w_half, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Likes", left_m, y, w_half, 15.0, fontsize=8.0, bold=True)
    draw_cell(p, left_m + w_half, y, w_half, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Dislikes", left_m + w_half, y, w_half, 15.0, fontsize=8.0, bold=True)
    y += 15.0

    draw_cell(p, left_m, y, w_half, 55.0, bg_color=C_WHITE)
    if is_fillable:
        add_widget_field(p, "exercise_likes", left_m, y, w_half, 55.0, data.get('exercise_likes', ''), multiline=True)
    else:
        draw_wrapped_text(p, data.get('exercise_likes', ''), left_m + 6, y + 4, w_half - 12, fontsize=7.5)

    draw_cell(p, left_m + w_half, y, w_half, 55.0, bg_color=C_WHITE)
    if is_fillable:
        add_widget_field(p, "exercise_dislikes", left_m + w_half, y, w_half, 55.0, data.get('exercise_dislikes', ''), multiline=True)
    else:
        draw_wrapped_text(p, data.get('exercise_dislikes', ''), left_m + w_half + 6, y + 4, w_half - 12, fontsize=7.5)

# ==============================================================================
# PAGE 2: 2. Physical Activity Readiness Questionnaire (PAR-Q) (Client to complete)
# ==============================================================================
def render_page_2(doc, data, is_fillable=False):
    p = doc.new_page(width=595.28, height=841.89)
    left_m = 36.0
    right_m = 559.28
    content_w = right_m - left_m
    
    y = 20.0
    draw_brand_header(p, left_m, right_m, y)
    y += 20.0
    
    # Title line
    p.insert_text(pymupdf.Point(left_m, y + 15), "Physical Activity Readiness Questionnaire (PAR-Q) ", 
                  fontsize=11.5, fontname="Helvetica-Bold", color=C_HEADER_BLUE)
    w_t2 = pymupdf.get_text_length("Physical Activity Readiness Questionnaire (PAR-Q) ", "Helvetica-Bold", 11.5)
    p.insert_text(pymupdf.Point(left_m + w_t2, y + 15), "(Client to complete)", 
                  fontsize=10.0, fontname="Helvetica-BoldOblique", color=C_SUBTITLE_RED)
    
    p.draw_line(pymupdf.Point(left_m, y + 21), pymupdf.Point(right_m, y + 21), color=C_TH_BG, width=0.8)
    y += 26.0

    # Table 1: Client's Name | Date
    w_cname = 385.0
    w_date = content_w - w_cname
    draw_cell(p, left_m, y, w_cname, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Client's Name", left_m, y, w_cname, 15.0, fontsize=8.0, bold=True)
    draw_cell(p, left_m + w_cname, y, w_date, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Date", left_m + w_cname, y, w_date, 15.0, fontsize=8.0, bold=True)
    y += 15.0

    c_name = data.get('parq_client_name') or data.get('client_name') or data.get('full_name', '')
    p_date = data.get('parq_date') or data.get('screening_date', '')

    draw_cell(p, left_m, y, w_cname, 20.0, bg_color=C_WHITE)
    if is_fillable:
        add_widget_field(p, "parq_client_name", left_m, y, w_cname, 20.0, c_name)
    else:
        cell_text_single(p, c_name, left_m, y, w_cname, 20.0, fontsize=8.2)

    draw_cell(p, left_m + w_cname, y, w_date, 20.0, bg_color=C_WHITE)
    if is_fillable:
        add_widget_field(p, "parq_date", left_m + w_cname, y, w_date, 20.0, p_date)
    else:
        cell_text_single(p, p_date, left_m + w_cname, y, w_date, 20.0, fontsize=8.2)
    y += 28.0

    # Preamble text
    preamble1 = (
        "Taking part in physical activity/exercise is very safe for most people. However, some people should check "
        "with their doctor before they start an exercise session. Before taking part in physical activity and/or exercise, "
        "please answer the questions below. If you are between the ages of 15 and 69, the PAR-Q will tell you if you "
        "should check with your doctor before you start. If you are over 69 years of age, and you are not used to being "
        "very active, check with your doctor."
    )
    y += draw_wrapped_text(p, preamble1, left_m, y, content_w, fontsize=7.2, line_height=9.2) + 4.0

    preamble2 = "Common sense is your best guide when you answer these questions. Please read the questions carefully and answer each one honestly: please select YES or NO."
    y += draw_wrapped_text(p, preamble2, left_m, y, content_w, fontsize=7.2, line_height=9.2) + 8.0

    # 10 Questions Table
    questions = [
        "1. Has your doctor ever said that you have a heart condition and that you should only do physical activity/exercise recommended by a doctor?",
        "2. Is there any history of heart disease in your family?",
        "3. Do you feel pain in your chest when you do physical activity/exercise?",
        "4. In the past month, have you had chest pain when you were not doing physical activity/exercise?",
        "5. Do you lose your balance because of dizziness or do you ever lose consciousness?",
        "6. Do you have a bone or joint problem (for example, back, knee or hip) that could be made worse by a change in your physical activity? (if so, please give details)",
        "7. Do you suffer from any of the following: asthma; diabetes; epilepsy; high blood pressure? (if so, please give details)",
        "8. Do you have any other medical or physical condition (such as diabetes, cancer, osteoporosis)?",
        "9. Do you have any current injuries or conditions, and if so, are they being treated by a doctor or other health professional such as a physiotherapist? (if so, please give details)",
        "10. Do you know of any other reason why you should not do physical activity/exercise?"
    ]

    w_q = 465.0
    w_yn = content_w - w_q

    for idx, q_text in enumerate(questions):
        rh = 26.0 if len(q_text) > 110 else 20.0
        draw_cell(p, left_m, y, w_q, rh, bg_color=C_WHITE)
        draw_wrapped_text(p, q_text, left_m + 5, y + 3, w_q - 10, fontsize=7.0, line_height=8.8)
        
        draw_cell(p, left_m + w_q, y, w_yn, rh, bg_color=C_WHITE)
        
        ans = str(data.get(f'parq_q{idx+1}', 'no')).strip().lower()
        if is_fillable:
            cell_text_single(p, "Yes/No", left_m + w_q, y, w_yn, rh, fontsize=7.0, color=(0.4, 0.4, 0.4), padding_x=12.0)
        else:
            if ans == 'yes':
                p.insert_text(pymupdf.Point(left_m + w_q + 10, y + rh/2 + 3), "YES", fontsize=7.8, fontname="Helvetica-Bold", color=C_SUBTITLE_RED)
            else:
                p.insert_text(pymupdf.Point(left_m + w_q + 10, y + rh/2 + 3), "NO", fontsize=7.8, fontname="Helvetica-Bold", color=C_HEADER_BLUE)
        y += rh

    y += 10.0

    # Follow-up advice text
    p1 = "If you answered YES to any of the questions above, please check with a member of staff before taking part in the physical activity or exercise session. It may be necessary for you to be referred to your doctor before taking part in the session."
    y += draw_wrapped_text(p, p1, left_m, y, content_w, fontsize=7.2, line_height=9.2) + 4.0

    p2 = "If you answered NO to all questions, you can be reasonably sure that you can safely take part in the physical activity or exercise sessions, but please ensure that you begin slowly, warm up appropriately and progress slowly."
    y += draw_wrapped_text(p, p2, left_m, y, content_w, fontsize=7.2, line_height=9.2) + 6.0

    # Assumption of risk
    p3 = "Assumption of Risk: I declare that I have read, understood, and answered honestly all the questions above. I am agreeing to participate in the exercise session (which may include aerobic, resistance, power and stretching exercises) and understand that there may be risks associated with physical activity."
    y += draw_wrapped_text(p, p3, left_m, y, content_w, fontsize=7.2, bold=True, line_height=9.2) + 6.0

    p4 = "I have read, understood and completed this questionnaire. Any questions I had were answered to my full satisfaction."
    y += draw_wrapped_text(p, p4, left_m, y, content_w, fontsize=7.2, fontname="Helvetica-Oblique", line_height=9.2) + 8.0

    # Table: Client's Signature | Date
    draw_cell(p, left_m, y, w_cname, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Client's Signature", left_m, y, w_cname, 15.0, fontsize=8.0, bold=True)
    draw_cell(p, left_m + w_cname, y, w_date, 15.0, bg_color=C_TH_BG)
    cell_text_single(p, "Date", left_m + w_cname, y, w_date, 15.0, fontsize=8.0, bold=True)
    y += 15.0

    draw_cell(p, left_m, y, w_cname, 30.0, bg_color=C_WHITE)
    sig_img_data = data.get('client_signature_image')
    if sig_img_data and 'data:image' in sig_img_data:
        try:
            b64_str = sig_img_data.split(',')[1]
            img_bytes = base64.b64decode(b64_str)
            sig_rect = pymupdf.Rect(left_m + 10, y + 2, left_m + w_cname - 10, y + 28)
            p.insert_image(sig_rect, stream=img_bytes)
        except Exception:
            cell_text_single(p, data.get('client_signature', ''), left_m, y, w_cname, 30.0, fontsize=10.0, fontname="Times-BoldItalic")
    elif data.get('client_signature'):
        cell_text_single(p, data.get('client_signature', ''), left_m, y, w_cname, 30.0, fontsize=10.0, fontname="Times-BoldItalic")

    draw_cell(p, left_m + w_cname, y, w_date, 30.0, bg_color=C_WHITE)
    sig_date = data.get('client_signature_date') or data.get('parq_signature_date') or data.get('screening_date', '')
    if is_fillable:
        add_widget_field(p, "client_signature_date", left_m + w_cname, y, w_date, 30.0, sig_date)
    else:
        cell_text_single(p, sig_date, left_m + w_cname, y, w_date, 30.0, fontsize=8.0)

# ==============================================================================
# PAGE 3: 4. Initial Assessment (Learner to complete)
# ==============================================================================
def render_page_3(doc, data, is_fillable=False):
    p = doc.new_page(width=595.28, height=841.89)
    left_m = 36.0
    right_m = 559.28
    content_w = right_m - left_m
    
    y = 20.0
    draw_brand_header(p, left_m, right_m, y)
    y += 20.0
    
    # Title line
    p.insert_text(pymupdf.Point(left_m, y + 15), "Initial Assessment ", 
                  fontsize=12.0, fontname="Helvetica-Bold", color=C_HEADER_BLUE)
    w_t4 = pymupdf.get_text_length("Initial Assessment ", "Helvetica-Bold", 12.0)
    p.insert_text(pymupdf.Point(left_m + w_t4, y + 15), "(Learner to complete)", 
                  fontsize=10.0, fontname="Helvetica-BoldOblique", color=C_SUBTITLE_RED)
    
    p.draw_line(pymupdf.Point(left_m, y + 21), pymupdf.Point(right_m, y + 21), color=C_TH_BG, width=0.8)
    y += 26.0

    # Table 1: Client's Name, Instructor's Name, Date
    w_lbl = 110.0
    w_val = content_w - w_lbl
    admin_rows = [
        ("Client's Name", data.get('assessment_client_name') or data.get('client_name') or data.get('full_name', ''), "assessment_client_name"),
        ("Instructor's Name", data.get('instructor_name') or data.get('learner_name', ''), "instructor_name"),
        ("Date", data.get('assessment_date') or data.get('screening_date', ''), "assessment_date")
    ]
    for lbl, val, fn in admin_rows:
        draw_cell(p, left_m, y, w_lbl, 16.0, bg_color=C_TH_BG)
        cell_text_single(p, lbl, left_m, y, w_lbl, 16.0, fontsize=8.0, bold=True)
        draw_cell(p, left_m + w_lbl, y, w_val, 16.0, bg_color=C_WHITE)
        if is_fillable:
            add_widget_field(p, fn, left_m + w_lbl, y, w_val, 16.0, val)
        else:
            cell_text_single(p, val, left_m + w_lbl, y, w_val, 16.0, fontsize=8.0)
        y += 16.0

    y += 10.0

    # Sub-heading
    p.insert_text(pymupdf.Point(left_m, y + 9), "Physical Measurements and Fitness Assessments Record", 
                  fontsize=8.5, fontname="Helvetica-Bold", color=C_TEXT_BLACK)
    y += 14.0

    # Table 2: Assessment Grid (3 Columns)
    w_col1 = 150.0
    w_col2 = 120.0
    w_col3 = content_w - w_col1 - w_col2

    # Table Header Row
    draw_cell(p, left_m, y, w_col1, 26.0, bg_color=C_TH_BG)
    cell_text_single(p, "Assessment", left_m, y + 2, w_col1, 11.0, fontsize=8.0, bold=True)
    cell_text_single(p, "(circle chosen test – minimum of three)", left_m, y + 13, w_col1, 10.0, fontsize=6.8)

    draw_cell(p, left_m + w_col1, y, w_col2, 26.0, bg_color=C_TH_BG)
    cell_text_single(p, "Results/Observations", left_m + w_col1, y, w_col2, 26.0, fontsize=8.0, bold=True)

    draw_cell(p, left_m + w_col1 + w_col2, y, w_col3, 26.0, bg_color=C_TH_BG)
    cell_text_single(p, "Give a reason for choice of test", left_m + w_col1 + w_col2, y + 2, w_col3, 11.0, fontsize=8.0, bold=True)
    cell_text_single(p, "If these tests were not carried out, please explain/justify your reason", left_m + w_col1 + w_col2, y + 13, w_col3, 10.0, fontsize=6.5)
    y += 26.0

    chosen_list = [str(x).lower().strip() for x in data.get('chosen_tests', [])]

    domains = [
        ("Blood pressure", ["manual", "digital"], 46.0, "bp_results", "bp_reasons"),
        ("Anthropometrics", ["BMI", "waist circumference", "waist to hip ratio"], 54.0, "anthro_results", "anthro_reasons"),
        ("Body composition", ["skinfolds callipers", "bio-electrical impedance"], 46.0, "body_comp_results", "body_comp_reasons"),
        ("Muscular strength and endurance", ["sit-up", "press up", "back extension", "repetition maximum tests (bench\npress, squat, deadlift)"], 68.0, "muscular_results", "muscular_reasons"),
        ("Cardiovascular fitness", ["Balke treadmill", "Astrand Bike test", "Rockport walking test", "submaximal predictive test", "multistage fitness test", "Cooper 1.5-mile run", "Queens College step", "other ergometer tests"], 102.0, "cardio_results", "cardio_reasons"),
        ("Specific range of movement (ROM)", ["soleus and gastrocnemius", "hamstrings", "quadriceps and hip flexors", "pectoralis major", "latissimus dorsi"], 75.0, "rom_results", "rom_reasons"),
        ("Posture and Alignment observation", ["head", "shoulders", "pelvis and lumbar spine", "knees", "feet and ankles"], 75.0, "posture_results", "posture_reasons")
    ]

    for title, bullets, rh, res_field, rea_field in domains:
        draw_cell(p, left_m, y, w_col1, rh, bg_color=C_WHITE)
        cell_text_single(p, title, left_m + 4, y + 3, w_col1 - 8, 12.0, fontsize=7.8, bold=True)
        
        by = y + 15.0
        for b in bullets:
            b_clean = b.replace("\n", " ")
            is_chosen = any(c in b_clean.lower() for c in chosen_list) if chosen_list else False
            
            p.insert_text(pymupdf.Point(left_m + 8, by + 6), "•", fontsize=8.0, fontname="Helvetica-Bold", color=C_TEXT_BLACK)
            
            if is_chosen and not is_fillable:
                text_len = pymupdf.get_text_length(b_clean, fontname="Helvetica", fontsize=6.8)
                c_rect = pymupdf.Rect(left_m + 15, by - 1, left_m + 19 + text_len, by + 9)
                p.draw_oval(c_rect, color=C_RED_PEN, width=0.8)
                p.insert_text(pymupdf.Point(left_m + 17, by + 6), b_clean, fontsize=6.8, fontname="Helvetica-Bold", color=C_RED_PEN)
            else:
                if "\n" in b:
                    draw_wrapped_text(p, b_clean, left_m + 17, by, w_col1 - 22, fontsize=6.8, line_height=8.5)
                else:
                    p.insert_text(pymupdf.Point(left_m + 17, by + 6), b, fontsize=6.8, fontname="Helvetica", color=C_TEXT_BLACK)
            
            by += 10.5 if len(b_clean) < 32 else 18.0

        draw_cell(p, left_m + w_col1, y, w_col2, rh, bg_color=C_WHITE)
        if is_fillable:
            add_widget_field(p, res_field, left_m + w_col1, y, w_col2, rh, data.get(res_field, ''), multiline=True)
        else:
            draw_wrapped_text(p, data.get(res_field, ''), left_m + w_col1 + 5, y + 4, w_col2 - 10, fontsize=7.0, line_height=8.8)

        draw_cell(p, left_m + w_col1 + w_col2, y, w_col3, rh, bg_color=C_WHITE)
        if is_fillable:
            add_widget_field(p, rea_field, left_m + w_col1 + w_col2, y, w_col3, rh, data.get(rea_field, ''), multiline=True)
        else:
            draw_wrapped_text(p, data.get(rea_field, ''), left_m + w_col1 + w_col2 + 5, y + 4, w_col3 - 10, fontsize=7.0, line_height=8.8)

        y += rh

# ==============================================================================
# PAGE 4: Client's barriers to exercise
# ==============================================================================
def render_page_4(doc, data, is_fillable=False):
    p = doc.new_page(width=595.28, height=841.89)
    left_m = 36.0
    right_m = 559.28
    content_w = right_m - left_m
    
    y = 20.0
    draw_brand_header(p, left_m, right_m, y)
    y += 20.0

    # Header Box (Compact)
    hdr_h = 36.0
    draw_cell(p, left_m, y, content_w, hdr_h, bg_color=C_TH_BG)
    cell_text_single(p, "Client's barriers to exercise", left_m + 8, y + 3, content_w - 16, 13.0, fontsize=9.5, bold=True)
    
    sub_desc = "Establish the physical, psychological and social reasons for clients' participation in an exercise program, help clients to identify barriers to adherence and how to overcome them."
    draw_wrapped_text(p, sub_desc, left_m + 8, y + 17, content_w - 16, fontsize=7.0, line_height=8.5)
    y += hdr_h

    # Table 1: 2-Column Matrix (Barriers vs Strategies) - Compact
    w_half = content_w / 2.0
    th_h = 22.0

    draw_cell(p, left_m, y, w_half, th_h, bg_color=C_TH_SUB_BG)
    draw_wrapped_text(p, "Barriers to exercising and achieving goals including motivational barriers", 
                      left_m + 6, y + 3, w_half - 12, fontsize=7.2, bold=True, line_height=8.5)

    draw_cell(p, left_m + w_half, y, w_half, th_h, bg_color=C_TH_SUB_BG)
    cell_text_single(p, "Strategies to overcome them", left_m + w_half + 6, y, w_half - 12, th_h, fontsize=7.8, bold=True)
    y += th_h

    # Compact Data row for barriers & strategies (~105pt instead of 240pt)
    box_h = 105.0
    draw_cell(p, left_m, y, w_half, box_h, bg_color=C_WHITE)
    if is_fillable:
        add_widget_field(p, "exercise_barriers", left_m, y, w_half, box_h, data.get('exercise_barriers', ''), multiline=True)
    else:
        draw_wrapped_text(p, data.get('exercise_barriers', ''), left_m + 6, y + 6, w_half - 12, fontsize=7.5, line_height=10.0)

    draw_cell(p, left_m + w_half, y, w_half, box_h, bg_color=C_WHITE)
    if is_fillable:
        add_widget_field(p, "overcome_strategies", left_m + w_half, y, w_half, box_h, data.get('overcome_strategies', ''), multiline=True)
    else:
        draw_wrapped_text(p, data.get('overcome_strategies', ''), left_m + w_half + 6, y + 6, w_half - 12, fontsize=7.5, line_height=10.0)
    y += box_h

    # Table 2: Summary of the client's attitude and motivation to exercise - Compact (~75pt instead of 210pt)
    th_sum_h = 18.0
    draw_cell(p, left_m, y, content_w, th_sum_h, bg_color=C_TH_SUB_BG)
    cell_text_single(p, "Summary of the client's attitude and motivation to exercise", left_m + 8, y, content_w - 16, th_sum_h, fontsize=8.0, bold=True)
    y += th_sum_h

    sum_box_h = 75.0
    draw_cell(p, left_m, y, content_w, sum_box_h, bg_color=C_WHITE)
    if is_fillable:
        add_widget_field(p, "attitude_motivation_summary", left_m, y, content_w, sum_box_h, data.get('attitude_motivation_summary', ''), multiline=True)
    else:
        draw_wrapped_text(p, data.get('attitude_motivation_summary', ''), left_m + 8, y + 6, content_w - 16, fontsize=7.8, line_height=10.5)
    y += sum_box_h + 16.0

    # Table 3: NEW SECTION - Client Notes / Additional Information
    th_notes_h = 24.0
    draw_cell(p, left_m, y, content_w, th_notes_h, bg_color=C_TH_BG)
    cell_text_single(p, "Client Notes / Additional Information", left_m + 8, y + 2, content_w - 16, 12.0, fontsize=8.8, bold=True)
    draw_wrapped_text(p, "Tell us anything else you'd like your trainer to know (goals, concerns, preferences, questions).", 
                      left_m + 8, y + 13, content_w - 16, fontsize=6.8, line_height=8.0)
    y += th_notes_h

    notes_box_h = 150.0
    draw_cell(p, left_m, y, content_w, notes_box_h, bg_color=C_WHITE)
    if is_fillable:
        add_widget_field(p, "client_notes", left_m, y, content_w, notes_box_h, data.get('client_notes', ''), multiline=True)
    else:
        draw_wrapped_text(p, data.get('client_notes', ''), left_m + 8, y + 6, content_w - 16, fontsize=7.8, line_height=10.5)

# ==============================================================================
# MAIN ENTRYPOINT: generate_screening_pdf
# ==============================================================================
def generate_screening_pdf(data=None, output_path=None):
    if data is None:
        data = {}
        is_fillable = True
    else:
        is_fillable = False

    doc = pymupdf.open()
    render_page_1(doc, data, is_fillable=is_fillable)
    render_page_2(doc, data, is_fillable=is_fillable)
    render_page_3(doc, data, is_fillable=is_fillable)
    render_page_4(doc, data, is_fillable=is_fillable)

    pdf_bytes = doc.tobytes(garbage=3, deflate=True)
    if output_path:
        with open(output_path, 'wb') as f:
            f.write(pdf_bytes)
    doc.close()
    return pdf_bytes
