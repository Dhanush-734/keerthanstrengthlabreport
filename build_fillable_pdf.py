import pymupdf
from PIL import Image, ImageDraw

def create_rounded_logo():
    im = Image.open('logo.jpg').convert('RGBA')
    w, h = im.size
    radius = int(w * 0.12)
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
    im.putalpha(mask)
    im.save('logo_rounded_soft.png')
    print('Created logo_rounded_soft.png')

def add_text_field(page, name, rect, label="", fontsize=8.5, multiline=False, value=""):
    w = pymupdf.Widget()
    w.rect = pymupdf.Rect(rect)
    w.field_type = pymupdf.PDF_WIDGET_TYPE_TEXT
    w.field_name = name
    w.field_label = label or name
    w.text_font = "Helv"
    w.text_fontsize = fontsize
    w.text_color = (0, 0, 0)
    w.fill_color = None
    w.border_color = None
    w.border_width = 0
    if multiline:
        w.field_flags = pymupdf.PDF_TX_FIELD_IS_MULTILINE
    if value:
        w.field_value = value
    page.add_widget(w)
    return w

def add_checkbox(page, name, rect, label="", checked=False):
    w = pymupdf.Widget()
    w.rect = pymupdf.Rect(rect)
    w.field_type = pymupdf.PDF_WIDGET_TYPE_CHECKBOX
    w.field_name = name
    w.field_label = label or name
    w.fill_color = (1, 1, 1)
    w.border_color = (0.25, 0.25, 0.25)
    w.border_width = 0.8
    w.field_value = "Yes" if checked else "Off"
    page.add_widget(w)
    return w

def build_pdf(output_path, fill_sample_data=False):
    create_rounded_logo()
    doc = pymupdf.open('Keerthan_Strength_Lab_Client_Screening_Form.pdf')

    # =========================================================================
    # 1. PAGE 1 SETUP
    # =========================================================================
    p1 = doc[0]

    # Logo Top-Right on Page 1
    # Right margin: 546.78, Top margin: 32, Size: 60x60
    logo_rect = pymupdf.Rect(546.78 - 60, 32, 546.78, 32 + 60)
    p1.insert_image(logo_rect, filename='logo_rounded_soft.png')

    # White out stray line 2 typewriter underscores in Section 1
    p1.draw_rect(pymupdf.Rect(95, 158.5, 185, 170), color=None, fill=(1, 1, 1))  # Full Name stray line 2
    p1.draw_rect(pymupdf.Rect(95, 194.5, 185, 206), color=None, fill=(1, 1, 1))  # Phone stray line 2
    p1.draw_rect(pymupdf.Rect(232, 194.5, 285, 206), color=None, fill=(1, 1, 1)) # Email stray line 2

    # Section 1: Client Information Fields
    add_text_field(p1, 'full_name', (142, 143, 228, 158), 'Full Name', fontsize=8.5, value='Johnathan Miller' if fill_sample_data else '')
    add_text_field(p1, 'age', (254, 144, 310, 159), 'Age', fontsize=8.5, value='29' if fill_sample_data else '')
    add_text_field(p1, 'gender', (404, 143, 465, 158), 'Gender', fontsize=8.5, value='Male' if fill_sample_data else '')
    add_text_field(p1, 'phone', (128, 179, 228, 194), 'Phone', fontsize=8.5, value='+1 (555) 234-5678' if fill_sample_data else '')
    add_text_field(p1, 'email', (260, 179, 365, 194), 'Email', fontsize=8.0, value='johnathan.m@example.com' if fill_sample_data else '')
    add_text_field(p1, 'occupation', (370, 191, 500, 206), 'Occupation', fontsize=8.5, value='Software Architect' if fill_sample_data else '')
    add_text_field(p1, 'date_of_assessment', (98, 227, 228, 242), 'Date of Assessment', fontsize=8.5, value='26/09/2026' if fill_sample_data else '')
    add_text_field(p1, 'training_experience', (234, 227, 365, 242), 'Training Experience', fontsize=8.5, value='3 years strength training' if fill_sample_data else '')
    add_text_field(p1, 'preferred_training_time', (370, 227, 500, 242), 'Preferred Training Time', fontsize=8.5, value='6:30 AM - 7:30 AM' if fill_sample_data else '')

    # Section 2: Health & PAR-Q Screening
    # Q1: White out stray line 1 bullet and stray line 2 'No'
    p1.draw_rect(pymupdf.Rect(503, 278, 550, 292), color=None, fill=(1, 1, 1))
    p1.draw_rect(pymupdf.Rect(47, 288, 65, 303), color=None, fill=(1, 1, 1))
    add_checkbox(p1, 'parq_q1_yes', (58, 293, 67.5, 302.5), 'Q1: Heart condition - Yes', checked=False)
    p1.insert_text(pymupdf.Point(71, 301.5), 'Yes', fontsize=8.5, fontname='helv')
    add_checkbox(p1, 'parq_q1_no', (95, 293, 104.5, 302.5), 'Q1: Heart condition - No', checked=True if fill_sample_data else False)
    p1.insert_text(pymupdf.Point(108, 301.5), 'No', fontsize=8.5, fontname='helv')

    # Q2 to Q7: Clean whiting out of cramped bullets and redrawing with natural, professional spacing
    parq_questions = [
        (2, 298.0, 316.0, 'parq_q2', 'Q2: Chest pain', False, True if fill_sample_data else False),
        (3, 362.2, 336.0, 'parq_q3', 'Q3: Dizziness/fainting', False, True if fill_sample_data else False),
        (4, 422.7, 356.0, 'parq_q4', 'Q4: Bone/joint problem', True if fill_sample_data else False, False),
        (5, 352.3, 376.0, 'parq_q5', 'Q5: Medication', False, True if fill_sample_data else False),
        (6, 295.1, 396.0, 'parq_q6', 'Q6: Surgery/illness', False, True if fill_sample_data else False),
        (7, 378.8, 416.0, 'parq_q7', 'Q7: Other health info', False, True if fill_sample_data else False),
    ]

    for qnum, q_end, y_center, prefix, desc, val_yes, val_no in parq_questions:
        # White out old cramped ■ Yes ■ No
        p1.draw_rect(pymupdf.Rect(q_end + 1, y_center - 8, 502, y_center + 7), color=None, fill=(1, 1, 1))
        # Checkbox Yes
        cb1_x0 = q_end + 6
        cb1_x1 = cb1_x0 + 9.5
        add_checkbox(p1, f'{prefix}_yes', (cb1_x0, y_center - 4.75, cb1_x1, y_center + 4.75), f'{desc} - Yes', checked=val_yes)
        # Text Yes
        p1.insert_text(pymupdf.Point(cb1_x1 + 3.5, y_center + 2.5), 'Yes', fontsize=8.5, fontname='helv')
        # Checkbox No
        cb2_x0 = cb1_x1 + 3.5 + 16 + 8
        cb2_x1 = cb2_x0 + 9.5
        add_checkbox(p1, f'{prefix}_no', (cb2_x0, y_center - 4.75, cb2_x1, y_center + 4.75), f'{desc} - No', checked=val_no)
        # Text No
        p1.insert_text(pymupdf.Point(cb2_x1 + 3.5, y_center + 2.5), 'No', fontsize=8.5, fontname='helv')

    # PAR-Q Details
    add_text_field(p1, 'parq_details_1', (252, 428, 502, 442), 'PAR-Q Details Line 1', fontsize=8.5, value='Mild left rotator cuff impingement in 2024.' if fill_sample_data else '')
    add_text_field(p1, 'parq_details_2', (48.5, 439, 502, 453), 'PAR-Q Details Line 2', fontsize=8.5, value='Cleared by physiotherapist; needs proper warm-up.' if fill_sample_data else '')

    # Section 3: Medical & Injury History
    add_text_field(p1, 'current_medical_conditions', (98, 499, 228, 513), 'Current medical conditions', fontsize=8.5, value='None' if fill_sample_data else '')
    add_text_field(p1, 'previous_injuries', (234, 499, 365, 513), 'Previous injuries', fontsize=8.5, value='Left shoulder strain (2024)' if fill_sample_data else '')
    add_text_field(p1, 'surgeries', (370, 499, 500, 513), 'Surgeries', fontsize=8.5, value='None' if fill_sample_data else '')
    add_text_field(p1, 'current_medications', (98, 535, 228, 549), 'Current medications', fontsize=8.5, value='Multivitamin, Omega-3' if fill_sample_data else '')
    add_text_field(p1, 'pain_discomfort', (234, 535, 365, 549), 'Pain/discomfort', fontsize=8.5, value='Occasional shoulder stiffness' if fill_sample_data else '')
    add_text_field(p1, 'other_health_concerns', (370, 535, 500, 549), 'Other health concerns', fontsize=8.5, value='None reported' if fill_sample_data else '')
    add_text_field(p1, 'medical_additional_details_1', (120, 558, 502, 572), 'Medical Details Line 1', fontsize=8.5, value='Underwent 6 weeks of rehabilitation with full range of motion regained.' if fill_sample_data else '')
    add_text_field(p1, 'medical_additional_details_2', (48.5, 570, 502, 584), 'Medical Details Line 2', fontsize=8.5, value='Advised to emphasize rotator cuff warm-up before heavy pressing.' if fill_sample_data else '')

    # Section 4: Lifestyle & Activity
    # White out stray line 2 typewriter underscore under Current exercise
    p1.draw_rect(pymupdf.Rect(95, 658.5, 185, 670), color=None, fill=(1, 1, 1))

    add_text_field(p1, 'average_sleep', (158, 619, 206, 633), 'Average sleep (hrs)', fontsize=8.5, value='7.5' if fill_sample_data else '')
    add_text_field(p1, 'daily_water', (281, 619, 332, 633), 'Daily water (L)', fontsize=8.5, value='3.0' if fill_sample_data else '')
    add_text_field(p1, 'daily_steps_activity', (443, 619, 501, 633), 'Daily steps/activity', fontsize=8.0, value='9,000 steps' if fill_sample_data else '')
    add_text_field(p1, 'current_exercise', (164, 644, 229, 658), 'Current exercise', fontsize=7.2, value='Resistance training' if fill_sample_data else '')
    add_text_field(p1, 'exercise_frequency', (234, 655, 278, 669), 'Exercise frequency (/week)', fontsize=8.5, value='4 days' if fill_sample_data else '')
    add_text_field(p1, 'typical_work_activity', (370, 655, 500, 669), 'Typical work activity', fontsize=8.5, value='Desk job / Sedentary' if fill_sample_data else '')

    # Clean, beautiful Checkboxes for Smoking, Alcohol & Stress Level
    p1.draw_rect(pymupdf.Rect(135, 680, 228, 696), color=None, fill=(1, 1, 1))
    add_checkbox(p1, 'smoking_yes', (138, 683.5, 147.5, 693), 'Smoking - Yes', checked=False)
    p1.insert_text(pymupdf.Point(151, 692), 'Yes', fontsize=8.5, fontname='helv')
    add_checkbox(p1, 'smoking_no', (175, 683.5, 184.5, 693), 'Smoking - No', checked=True if fill_sample_data else False)
    p1.insert_text(pymupdf.Point(188, 692), 'No', fontsize=8.5, fontname='helv')

    p1.draw_rect(pymupdf.Rect(266, 680, 365, 696), color=None, fill=(1, 1, 1))
    add_checkbox(p1, 'alcohol_yes', (270, 683.5, 279.5, 693), 'Alcohol - Yes', checked=True if fill_sample_data else False)
    p1.insert_text(pymupdf.Point(283, 692), 'Yes', fontsize=8.5, fontname='helv')
    add_checkbox(p1, 'alcohol_no', (307, 683.5, 316.5, 693), 'Alcohol - No', checked=False)
    p1.insert_text(pymupdf.Point(320, 692), 'No', fontsize=8.5, fontname='helv')

    p1.draw_rect(pymupdf.Rect(418, 680, 502, 696), color=None, fill=(1, 1, 1))
    p1.draw_rect(pymupdf.Rect(369, 694, 400, 706), color=None, fill=(1, 1, 1))
    add_checkbox(p1, 'stress_low', (422, 683.5, 431.5, 693), 'Stress - Low', checked=False)
    p1.insert_text(pymupdf.Point(435, 692), 'Low', fontsize=8.5, fontname='helv')
    add_checkbox(p1, 'stress_moderate', (457, 683.5, 466.5, 693), 'Stress - Moderate', checked=True if fill_sample_data else False)
    p1.insert_text(pymupdf.Point(470, 692), 'Moderate', fontsize=8.5, fontname='helv')
    add_checkbox(p1, 'stress_high', (371, 695.5, 380.5, 705), 'Stress - High', checked=False)
    p1.insert_text(pymupdf.Point(384, 704), 'High', fontsize=8.5, fontname='helv')

    add_text_field(p1, 'dietary_preferences_1', (216, 714, 502, 728), 'Dietary Preferences Line 1', fontsize=8.5, value='High-protein whole foods diet; moderate carbohydrates.' if fill_sample_data else '')
    add_text_field(p1, 'dietary_preferences_2', (48.5, 726, 502, 740), 'Dietary Preferences Line 2', fontsize=8.5, value='No food allergies; tracking macros with 160g protein target.' if fill_sample_data else '')

    # =========================================================================
    # 2. PAGE 2 SETUP
    # =========================================================================
    p2 = doc[1]
    # Shift Page 2 stream down by 45 pt to give breathing room for logo
    c_xrefs = p2.get_contents()
    contents = p2.read_contents()
    doc.update_stream(c_xrefs[0], b'q 1 0 0 1 0 -45 cm\n' + contents + b'\nQ\n')

    # Logo Top-Right on Page 2
    p2.insert_image(logo_rect, filename='logo_rounded_soft.png')

    # White out stray line 2 typewriter underscores on Page 2
    # Exact coordinates below the descenders of labels:
    p2.draw_rect(pymupdf.Rect(95, 271.5, 175, 283), color=None, fill=(1, 1, 1))  # Cardio line 2
    p2.draw_rect(pymupdf.Rect(95, 307.5, 175, 319), color=None, fill=(1, 1, 1))  # Push-ups line 2 (safely below 'p')
    p2.draw_rect(pymupdf.Rect(95, 379.5, 175, 391), color=None, fill=(1, 1, 1))  # Plank line 2
    p2.draw_rect(pymupdf.Rect(95, 510.5, 175, 522), color=None, fill=(1, 1, 1))  # Primary goal line 2 (safely below 'y' & 'g')
    p2.draw_rect(pymupdf.Rect(95, 546.5, 175, 558), color=None, fill=(1, 1, 1))  # Secondary goal line 2 (safely below 'y' & 'g')

    # Section 5: Body & Basic Physical Assessment (Y + 45)
    # Row 1 (y: 110.85 to 135.85)
    add_text_field(p2, 'height', (128, 114, 180, 128), 'Height (cm)', fontsize=8.5, value='182' if fill_sample_data else '')
    add_text_field(p2, 'weight', (266, 114, 318, 128), 'Weight (kg)', fontsize=8.5, value='84.5' if fill_sample_data else '')
    add_text_field(p2, 'bmi', (391, 114, 450, 128), 'BMI', fontsize=8.5, value='25.5' if fill_sample_data else '')

    # Row 2 (y: 135.85 to 171.85)
    add_text_field(p2, 'resting_heart_rate', (175, 139, 226, 153), 'Resting Heart Rate (bpm)', fontsize=8.5, value='62' if fill_sample_data else '')
    add_text_field(p2, 'bp_systolic', (297, 139, 345, 153), 'Blood Pressure Systolic', fontsize=8.5, value='118' if fill_sample_data else '')
    add_text_field(p2, 'bp_diastolic', (235, 150, 282, 164), 'Blood Pressure Diastolic', fontsize=8.5, value='76' if fill_sample_data else '')
    add_text_field(p2, 'body_assessment_date', (393, 139, 480, 153), 'Assessment Date', fontsize=8.5, value='26/09/2026' if fill_sample_data else '')

    # Row 3 (y: 171.85 to 196.85)
    add_text_field(p2, 'waist', (124, 175, 175, 189), 'Waist (cm)', fontsize=8.5, value='86' if fill_sample_data else '')
    add_text_field(p2, 'hip', (252, 175, 303, 189), 'Hip (cm)', fontsize=8.5, value='101' if fill_sample_data else '')
    add_text_field(p2, 'chest', (397, 175, 448, 189), 'Chest (cm)', fontsize=8.5, value='104' if fill_sample_data else '')

    # Row 4 (y: 196.85 to 221.85)
    add_text_field(p2, 'arm', (118, 200, 169, 214), 'Arm (cm)', fontsize=8.5, value='37.5' if fill_sample_data else '')
    add_text_field(p2, 'thigh', (260, 200, 311, 214), 'Thigh (cm)', fontsize=8.5, value='59' if fill_sample_data else '')
    add_text_field(p2, 'other_measurement', (396, 200, 448, 214), 'Other (cm)', fontsize=8.5, value='Calf: 38' if fill_sample_data else '')

    # Section 6: Basic Fitness Assessment (y: 252.85 to 432.85)
    # Row 1: Cardio
    add_text_field(p2, 'cardio_test', (144, 256, 228, 270), 'Cardio test', fontsize=8.5, value='1.5-mile run' if fill_sample_data else '')
    add_text_field(p2, 'cardio_result', (263, 256, 365, 270), 'Cardio Result', fontsize=8.5, value='10 min 45 sec' if fill_sample_data else '')
    add_text_field(p2, 'cardio_date', (393, 256, 501, 270), 'Cardio Date', fontsize=8.5, value='26/09/2026' if fill_sample_data else '')

    # Row 2: Push-ups
    add_text_field(p2, 'pushups_test', (138, 292, 229, 306), 'Push-ups test', fontsize=8.0, value='Standard floor push-ups' if fill_sample_data else '')
    add_text_field(p2, 'pushups_result', (263, 292, 365, 306), 'Push-ups Result', fontsize=8.5, value='38 reps' if fill_sample_data else '')
    add_text_field(p2, 'pushups_notes', (397, 292, 501, 306), 'Push-ups Notes', fontsize=8.0, value='Solid form, good lockout' if fill_sample_data else '')

    # Row 3: Squat / movement screen
    add_text_field(p2, 'squat_test', (98, 339, 229, 353), 'Squat test', fontsize=8.5, value='Overhead squat assessment' if fill_sample_data else '')
    add_text_field(p2, 'squat_result', (263, 328, 365, 342), 'Squat Result', fontsize=8.5, value='Score: 3/3' if fill_sample_data else '')
    add_text_field(p2, 'squat_notes', (397, 328, 501, 342), 'Squat Notes', fontsize=7.5, value='Great depth and ankle mobility' if fill_sample_data else '')

    # Row 4: Plank
    add_text_field(p2, 'plank_test', (124, 364, 229, 378), 'Plank test', fontsize=8.5, value='Prone forearm plank' if fill_sample_data else '')
    add_text_field(p2, 'plank_result', (263, 364, 365, 378), 'Plank Result', fontsize=8.5, value='2 min 15 sec' if fill_sample_data else '')
    add_text_field(p2, 'plank_notes', (397, 364, 501, 378), 'Plank Notes', fontsize=8.0, value='Strong core stability' if fill_sample_data else '')

    # Row 5: Flexibility / mobility
    add_text_field(p2, 'flexibility_test', (98, 411, 229, 425), 'Flexibility test', fontsize=8.5, value='Sit and reach / shoulder pass' if fill_sample_data else '')
    add_text_field(p2, 'flexibility_result', (263, 400, 365, 414), 'Flexibility Result', fontsize=8.5, value='+4 cm / Full pass' if fill_sample_data else '')
    add_text_field(p2, 'flexibility_notes', (397, 400, 501, 414), 'Flexibility Notes', fontsize=7.5, value='Good thoracic spine mobility' if fill_sample_data else '')

    # Other observations
    add_text_field(p2, 'fitness_observations_1', (125, 435, 502, 449), 'Other Observations Line 1', fontsize=8.5, value='Excellent base conditioning, eager to progress to heavy barbell cycles.' if fill_sample_data else '')
    add_text_field(p2, 'fitness_observations_2', (48.5, 446, 502, 460), 'Other Observations Line 2', fontsize=8.5, value='Slight left shoulder asymmetry to monitor during overhead pressing.' if fill_sample_data else '')

    # Section 7: Client Goals (y: 491.85 to 563.85)
    # Row 1
    add_text_field(p2, 'primary_goal', (150, 495, 229, 509), 'Primary Goal', fontsize=7.5, value='Hypertrophy & Strength' if fill_sample_data else '')
    add_text_field(p2, 'target_weight', (290, 495, 338, 509), 'Target Weight (kg)', fontsize=8.5, value='82' if fill_sample_data else '')
    add_text_field(p2, 'target_date', (418, 495, 500, 509), 'Target Date', fontsize=8.5, value='26/03/2027' if fill_sample_data else '')

    # Row 2
    add_text_field(p2, 'secondary_goal', (161, 531, 229, 545), 'Secondary Goal', fontsize=6.8, value='Lower body fat to 12%' if fill_sample_data else '')
    add_text_field(p2, 'training_days_per_week', (312, 531, 345, 545), 'Training days/week', fontsize=8.5, value='4' if fill_sample_data else '')
    add_text_field(p2, 'preferred_activities', (444, 531, 501, 545), 'Preferred Activities', fontsize=7.0, value='Barbell lifts, HIIT' if fill_sample_data else '')

    # Specific goals
    add_text_field(p2, 'specific_goals_1', (162, 566, 502, 580), 'Specific Goals Line 1', fontsize=8.5, value='Achieve 140kg squat, 100kg bench press, and 180kg deadlift.' if fill_sample_data else '')
    add_text_field(p2, 'specific_goals_2', (48.5, 577, 502, 591), 'Specific Goals Line 2', fontsize=8.5, value='Improve overall cardiovascular stamina and athletic power output.' if fill_sample_data else '')

    # Section 8: Informed Consent
    add_text_field(p2, 'client_signature', (115, 689, 283, 703), 'Client Signature', fontsize=8.5, value='Johnathan Miller' if fill_sample_data else '')
    add_text_field(p2, 'client_signature_date', (310, 689, 410, 703), 'Client Signature Date', fontsize=8.5, value='26/09/2026' if fill_sample_data else '')
    add_text_field(p2, 'trainer_signature', (120, 711, 288, 725), 'Trainer Signature', fontsize=8.5, value='Keerthan' if fill_sample_data else '')
    add_text_field(p2, 'trainer_signature_date', (315, 711, 415, 725), 'Trainer Signature Date', fontsize=8.5, value='26/09/2026' if fill_sample_data else '')

    doc.save(output_path)
    print(f'Successfully built {output_path}!')

if __name__ == '__main__':
    # 1. Build blank fillable PDF
    build_pdf('Keerthan_Strength_Lab_Client_Screening_Form_Fillable.pdf', fill_sample_data=False)
    # 2. Build sample filled PDF to verify visual rendering
    build_pdf('Keerthan_Strength_Lab_Client_Screening_Form_TEST_FILLED.pdf', fill_sample_data=True)

    # Render pages to PNG for verification
    doc_blank = pymupdf.open('Keerthan_Strength_Lab_Client_Screening_Form_Fillable.pdf')
    doc_blank[0].get_pixmap(dpi=150).save('verify_blank_page1.png')
    doc_blank[1].get_pixmap(dpi=150).save('verify_blank_page2.png')

    doc_filled = pymupdf.open('Keerthan_Strength_Lab_Client_Screening_Form_TEST_FILLED.pdf')
    doc_filled[0].get_pixmap(dpi=150).save('verify_filled_page1.png')
    doc_filled[1].get_pixmap(dpi=150).save('verify_filled_page2.png')
    print('All verification images saved!')
