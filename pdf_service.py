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
        w.field_value = str(value)
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

def generate_screening_pdf(data=None, output_path=None):
    if data is None:
        data = {}
    
    logo_path = create_rounded_logo() or os.path.join(BASE_DIR, 'logo_rounded_soft.png')
    template_path = os.path.join(BASE_DIR, 'Keerthan_Strength_Lab_Client_Screening_Form.pdf')
    doc = pymupdf.open(template_path)

    # =========================================================================
    # 1. PAGE 1 SETUP
    # =========================================================================
    p1 = doc[0]

    # Logo Top-Right on Page 1
    logo_rect = pymupdf.Rect(546.78 - 60, 32, 546.78, 32 + 60)
    try:
        if os.path.exists(logo_path):
            p1.insert_image(logo_rect, filename=logo_path)
    except Exception:
        pass

    # White out stray line 2 typewriter underscores in Section 1
    p1.draw_rect(pymupdf.Rect(95, 158.5, 185, 170), color=None, fill=(1, 1, 1))
    p1.draw_rect(pymupdf.Rect(95, 194.5, 185, 206), color=None, fill=(1, 1, 1))
    p1.draw_rect(pymupdf.Rect(232, 194.5, 285, 206), color=None, fill=(1, 1, 1))

    # Section 1: Client Information Fields
    add_text_field(p1, 'full_name', (142, 143, 228, 158), 'Full Name', fontsize=8.5, value=data.get('full_name', ''))
    add_text_field(p1, 'age', (254, 144, 310, 159), 'Age', fontsize=8.5, value=data.get('age', ''))
    add_text_field(p1, 'gender', (404, 143, 465, 158), 'Gender', fontsize=8.5, value=data.get('gender', ''))
    add_text_field(p1, 'phone', (128, 179, 228, 194), 'Phone', fontsize=8.5, value=data.get('phone', ''))
    add_text_field(p1, 'email', (260, 179, 365, 194), 'Email', fontsize=8.0, value=data.get('email', ''))
    add_text_field(p1, 'occupation', (370, 191, 500, 206), 'Occupation', fontsize=8.5, value=data.get('occupation', ''))
    add_text_field(p1, 'date_of_assessment', (98, 227, 228, 242), 'Date of Assessment', fontsize=8.5, value=data.get('date_of_assessment', ''))
    add_text_field(p1, 'training_experience', (234, 227, 365, 242), 'Training Experience', fontsize=8.5, value=data.get('training_experience', ''))
    add_text_field(p1, 'preferred_training_time', (370, 227, 500, 242), 'Preferred Training Time', fontsize=8.5, value=data.get('preferred_training_time', ''))

    # Section 2: Health & PAR-Q Screening
    p1.draw_rect(pymupdf.Rect(503, 278, 550, 292), color=None, fill=(1, 1, 1))
    p1.draw_rect(pymupdf.Rect(47, 288, 65, 303), color=None, fill=(1, 1, 1))
    
    q1_val = str(data.get('parq_q1', '')).lower()
    add_checkbox(p1, 'parq_q1_yes', (58, 293, 67.5, 302.5), 'Q1: Heart condition - Yes', checked=(q1_val == 'yes'))
    p1.insert_text(pymupdf.Point(71, 301.5), 'Yes', fontsize=8.5, fontname='helv')
    add_checkbox(p1, 'parq_q1_no', (95, 293, 104.5, 302.5), 'Q1: Heart condition - No', checked=(q1_val == 'no'))
    p1.insert_text(pymupdf.Point(108, 301.5), 'No', fontsize=8.5, fontname='helv')

    parq_questions = [
        (2, 298.0, 316.0, 'parq_q2', 'Q2: Chest pain'),
        (3, 362.2, 336.0, 'parq_q3', 'Q3: Dizziness/fainting'),
        (4, 422.7, 356.0, 'parq_q4', 'Q4: Bone/joint problem'),
        (5, 352.3, 376.0, 'parq_q5', 'Q5: Medication'),
        (6, 295.1, 396.0, 'parq_q6', 'Q6: Surgery/illness'),
        (7, 378.8, 416.0, 'parq_q7', 'Q7: Other health info'),
    ]

    for qnum, q_end, y_center, prefix, desc in parq_questions:
        p1.draw_rect(pymupdf.Rect(q_end + 1, y_center - 8, 502, y_center + 7), color=None, fill=(1, 1, 1))
        q_val = str(data.get(prefix, '')).lower()
        cb1_x0 = q_end + 6
        cb1_x1 = cb1_x0 + 9.5
        add_checkbox(p1, f'{prefix}_yes', (cb1_x0, y_center - 4.75, cb1_x1, y_center + 4.75), f'{desc} - Yes', checked=(q_val == 'yes'))
        p1.insert_text(pymupdf.Point(cb1_x1 + 3.5, y_center + 2.5), 'Yes', fontsize=8.5, fontname='helv')
        cb2_x0 = cb1_x1 + 3.5 + 16 + 8
        cb2_x1 = cb2_x0 + 9.5
        add_checkbox(p1, f'{prefix}_no', (cb2_x0, y_center - 4.75, cb2_x1, y_center + 4.75), f'{desc} - No', checked=(q_val == 'no'))
        p1.insert_text(pymupdf.Point(cb2_x1 + 3.5, y_center + 2.5), 'No', fontsize=8.5, fontname='helv')

    # PAR-Q Details
    add_text_field(p1, 'parq_details_1', (252, 428, 502, 442), 'PAR-Q Details Line 1', fontsize=8.5, value=data.get('parq_details_1', ''))
    add_text_field(p1, 'parq_details_2', (48.5, 439, 502, 453), 'PAR-Q Details Line 2', fontsize=8.5, value=data.get('parq_details_2', ''))

    # Section 3: Medical & Injury History
    add_text_field(p1, 'current_medical_conditions', (98, 499, 228, 513), 'Current medical conditions', fontsize=8.5, value=data.get('current_medical_conditions', ''))
    add_text_field(p1, 'previous_injuries', (234, 499, 365, 513), 'Previous injuries', fontsize=8.5, value=data.get('previous_injuries', ''))
    add_text_field(p1, 'surgeries', (370, 499, 500, 513), 'Surgeries', fontsize=8.5, value=data.get('surgeries', ''))
    add_text_field(p1, 'current_medications', (98, 535, 228, 549), 'Current medications', fontsize=8.5, value=data.get('current_medications', ''))
    add_text_field(p1, 'pain_discomfort', (234, 535, 365, 549), 'Pain/discomfort', fontsize=8.5, value=data.get('pain_discomfort', ''))
    add_text_field(p1, 'other_health_concerns', (370, 535, 500, 549), 'Other health concerns', fontsize=8.5, value=data.get('other_health_concerns', ''))
    add_text_field(p1, 'medical_additional_details_1', (120, 558, 502, 572), 'Medical Details Line 1', fontsize=8.5, value=data.get('medical_additional_details_1', ''))
    add_text_field(p1, 'medical_additional_details_2', (48.5, 570, 502, 584), 'Medical Details Line 2', fontsize=8.5, value=data.get('medical_additional_details_2', ''))

    # Section 4: Lifestyle & Activity
    p1.draw_rect(pymupdf.Rect(95, 658.5, 185, 670), color=None, fill=(1, 1, 1))

    add_text_field(p1, 'average_sleep', (158, 619, 206, 633), 'Average sleep (hrs)', fontsize=8.5, value=data.get('average_sleep', ''))
    add_text_field(p1, 'daily_water', (281, 619, 332, 633), 'Daily water (L)', fontsize=8.5, value=data.get('daily_water', ''))
    add_text_field(p1, 'daily_steps_activity', (443, 619, 501, 633), 'Daily steps/activity', fontsize=8.0, value=data.get('daily_steps_activity', ''))
    add_text_field(p1, 'current_exercise', (164, 644, 229, 658), 'Current exercise', fontsize=7.2, value=data.get('current_exercise', ''))
    add_text_field(p1, 'exercise_frequency', (234, 655, 278, 669), 'Exercise frequency (/week)', fontsize=8.5, value=data.get('exercise_frequency', ''))
    add_text_field(p1, 'typical_work_activity', (370, 655, 500, 669), 'Typical work activity', fontsize=8.5, value=data.get('typical_work_activity', ''))

    # Smoking
    smoking_val = str(data.get('smoking', '')).lower()
    p1.draw_rect(pymupdf.Rect(135, 680, 228, 696), color=None, fill=(1, 1, 1))
    add_checkbox(p1, 'smoking_yes', (138, 683.5, 147.5, 693), 'Smoking - Yes', checked=(smoking_val == 'yes'))
    p1.insert_text(pymupdf.Point(151, 692), 'Yes', fontsize=8.5, fontname='helv')
    add_checkbox(p1, 'smoking_no', (175, 683.5, 184.5, 693), 'Smoking - No', checked=(smoking_val == 'no'))
    p1.insert_text(pymupdf.Point(188, 692), 'No', fontsize=8.5, fontname='helv')

    # Alcohol
    alcohol_val = str(data.get('alcohol', '')).lower()
    p1.draw_rect(pymupdf.Rect(266, 680, 365, 696), color=None, fill=(1, 1, 1))
    add_checkbox(p1, 'alcohol_yes', (270, 683.5, 279.5, 693), 'Alcohol - Yes', checked=(alcohol_val == 'yes'))
    p1.insert_text(pymupdf.Point(283, 692), 'Yes', fontsize=8.5, fontname='helv')
    add_checkbox(p1, 'alcohol_no', (307, 683.5, 316.5, 693), 'Alcohol - No', checked=(alcohol_val == 'no'))
    p1.insert_text(pymupdf.Point(320, 692), 'No', fontsize=8.5, fontname='helv')

    # Stress
    stress_val = str(data.get('stress', '')).lower()
    p1.draw_rect(pymupdf.Rect(418, 680, 502, 696), color=None, fill=(1, 1, 1))
    p1.draw_rect(pymupdf.Rect(369, 694, 400, 706), color=None, fill=(1, 1, 1))
    add_checkbox(p1, 'stress_low', (422, 683.5, 431.5, 693), 'Stress - Low', checked=(stress_val == 'low'))
    p1.insert_text(pymupdf.Point(435, 692), 'Low', fontsize=8.5, fontname='helv')
    add_checkbox(p1, 'stress_moderate', (457, 683.5, 466.5, 693), 'Stress - Moderate', checked=(stress_val == 'moderate'))
    p1.insert_text(pymupdf.Point(470, 692), 'Moderate', fontsize=8.5, fontname='helv')
    add_checkbox(p1, 'stress_high', (371, 695.5, 380.5, 705), 'Stress - High', checked=(stress_val == 'high'))
    p1.insert_text(pymupdf.Point(384, 704), 'High', fontsize=8.5, fontname='helv')

    add_text_field(p1, 'dietary_preferences_1', (216, 714, 502, 728), 'Dietary Preferences Line 1', fontsize=8.5, value=data.get('dietary_preferences_1', ''))
    add_text_field(p1, 'dietary_preferences_2', (48.5, 726, 502, 740), 'Dietary Preferences Line 2', fontsize=8.5, value=data.get('dietary_preferences_2', ''))

    # =========================================================================
    # 2. PAGE 2 SETUP
    # =========================================================================
    p2 = doc[1]
    c_xrefs = p2.get_contents()
    contents = p2.read_contents()
    doc.update_stream(c_xrefs[0], b'q 1 0 0 1 0 -45 cm\n' + contents + b'\nQ\n')

    # Logo Top-Right on Page 2
    try:
        p2.insert_image(logo_rect, filename='logo_rounded_soft.png')
    except Exception:
        pass

    # White out stray line 2 typewriter underscores on Page 2
    p2.draw_rect(pymupdf.Rect(95, 271.5, 175, 283), color=None, fill=(1, 1, 1))  # Cardio
    p2.draw_rect(pymupdf.Rect(95, 307.5, 175, 319), color=None, fill=(1, 1, 1))  # Push-ups
    p2.draw_rect(pymupdf.Rect(95, 379.5, 175, 391), color=None, fill=(1, 1, 1))  # Plank
    p2.draw_rect(pymupdf.Rect(95, 510.5, 175, 522), color=None, fill=(1, 1, 1))  # Primary goal
    p2.draw_rect(pymupdf.Rect(95, 546.5, 175, 558), color=None, fill=(1, 1, 1))  # Secondary goal

    # Section 5: Body & Basic Physical Assessment
    add_text_field(p2, 'height', (128, 114, 180, 128), 'Height (cm)', fontsize=8.5, value=data.get('height', ''))
    add_text_field(p2, 'weight', (266, 114, 318, 128), 'Weight (kg)', fontsize=8.5, value=data.get('weight', ''))
    add_text_field(p2, 'bmi', (391, 114, 450, 128), 'BMI', fontsize=8.5, value=data.get('bmi', ''))

    add_text_field(p2, 'resting_heart_rate', (175, 139, 226, 153), 'Resting Heart Rate (bpm)', fontsize=8.5, value=data.get('resting_heart_rate', ''))
    add_text_field(p2, 'bp_systolic', (297, 139, 345, 153), 'Blood Pressure Systolic', fontsize=8.5, value=data.get('bp_systolic', ''))
    add_text_field(p2, 'bp_diastolic', (235, 150, 282, 164), 'Blood Pressure Diastolic', fontsize=8.5, value=data.get('bp_diastolic', ''))
    add_text_field(p2, 'body_assessment_date', (393, 139, 480, 153), 'Assessment Date', fontsize=8.5, value=data.get('body_assessment_date', ''))

    add_text_field(p2, 'waist', (124, 175, 175, 189), 'Waist (cm)', fontsize=8.5, value=data.get('waist', ''))
    add_text_field(p2, 'hip', (252, 175, 303, 189), 'Hip (cm)', fontsize=8.5, value=data.get('hip', ''))
    add_text_field(p2, 'chest', (397, 175, 448, 189), 'Chest (cm)', fontsize=8.5, value=data.get('chest', ''))

    add_text_field(p2, 'arm', (118, 200, 169, 214), 'Arm (cm)', fontsize=8.5, value=data.get('arm', ''))
    add_text_field(p2, 'thigh', (260, 200, 311, 214), 'Thigh (cm)', fontsize=8.5, value=data.get('thigh', ''))
    add_text_field(p2, 'other_measurement', (396, 200, 448, 214), 'Other (cm)', fontsize=8.5, value=data.get('other_measurement', ''))

    # Section 6: Basic Fitness Assessment
    add_text_field(p2, 'cardio_test', (144, 256, 228, 270), 'Cardio test', fontsize=8.5, value=data.get('cardio_test', ''))
    add_text_field(p2, 'cardio_result', (263, 256, 365, 270), 'Cardio Result', fontsize=8.5, value=data.get('cardio_result', ''))
    add_text_field(p2, 'cardio_date', (393, 256, 501, 270), 'Cardio Date', fontsize=8.5, value=data.get('cardio_date', ''))

    add_text_field(p2, 'pushups_test', (138, 292, 229, 306), 'Push-ups test', fontsize=8.0, value=data.get('pushups_test', ''))
    add_text_field(p2, 'pushups_result', (263, 292, 365, 306), 'Push-ups Result', fontsize=8.5, value=data.get('pushups_result', ''))
    add_text_field(p2, 'pushups_notes', (397, 292, 501, 306), 'Push-ups Notes', fontsize=8.0, value=data.get('pushups_notes', ''))

    add_text_field(p2, 'squat_test', (98, 339, 229, 353), 'Squat test', fontsize=8.5, value=data.get('squat_test', ''))
    add_text_field(p2, 'squat_result', (263, 328, 365, 342), 'Squat Result', fontsize=8.5, value=data.get('squat_result', ''))
    add_text_field(p2, 'squat_notes', (397, 328, 501, 342), 'Squat Notes', fontsize=7.5, value=data.get('squat_notes', ''))

    add_text_field(p2, 'plank_test', (124, 364, 229, 378), 'Plank test', fontsize=8.5, value=data.get('plank_test', ''))
    add_text_field(p2, 'plank_result', (263, 364, 365, 378), 'Plank Result', fontsize=8.5, value=data.get('plank_result', ''))
    add_text_field(p2, 'plank_notes', (397, 364, 501, 378), 'Plank Notes', fontsize=8.0, value=data.get('plank_notes', ''))

    add_text_field(p2, 'flexibility_test', (98, 411, 229, 425), 'Flexibility test', fontsize=8.5, value=data.get('flexibility_test', ''))
    add_text_field(p2, 'flexibility_result', (263, 400, 365, 414), 'Flexibility Result', fontsize=8.5, value=data.get('flexibility_result', ''))
    add_text_field(p2, 'flexibility_notes', (397, 400, 501, 414), 'Flexibility Notes', fontsize=7.5, value=data.get('flexibility_notes', ''))

    add_text_field(p2, 'fitness_observations_1', (125, 435, 502, 449), 'Other Observations Line 1', fontsize=8.5, value=data.get('fitness_observations_1', ''))
    add_text_field(p2, 'fitness_observations_2', (48.5, 446, 502, 460), 'Other Observations Line 2', fontsize=8.5, value=data.get('fitness_observations_2', ''))

    # Section 7: Client Goals
    add_text_field(p2, 'primary_goal', (150, 495, 229, 509), 'Primary Goal', fontsize=7.5, value=data.get('primary_goal', ''))
    add_text_field(p2, 'target_weight', (290, 495, 338, 509), 'Target Weight (kg)', fontsize=8.5, value=data.get('target_weight', ''))
    add_text_field(p2, 'target_date', (418, 495, 500, 509), 'Target Date', fontsize=8.5, value=data.get('target_date', ''))

    add_text_field(p2, 'secondary_goal', (161, 531, 229, 545), 'Secondary Goal', fontsize=6.8, value=data.get('secondary_goal', ''))
    add_text_field(p2, 'training_days_per_week', (312, 531, 345, 545), 'Training days/week', fontsize=8.5, value=data.get('training_days_per_week', ''))
    add_text_field(p2, 'preferred_activities', (444, 531, 501, 545), 'Preferred Activities', fontsize=7.0, value=data.get('preferred_activities', ''))

    add_text_field(p2, 'specific_goals_1', (162, 566, 502, 580), 'Specific Goals Line 1', fontsize=8.5, value=data.get('specific_goals_1', ''))
    add_text_field(p2, 'specific_goals_2', (48.5, 577, 502, 591), 'Specific Goals Line 2', fontsize=8.5, value=data.get('specific_goals_2', ''))

    # Section 8: Informed Consent & Signatures
    # If client signature is an image (canvas drawing base64), insert it:
    client_sig_img = data.get('client_signature_image', '')
    if client_sig_img and client_sig_img.startswith('data:image'):
        try:
            b64_data = client_sig_img.split(',', 1)[1]
            img_bytes = base64.b64decode(b64_data)
            # Insert client signature image over the line
            p2.insert_image(pymupdf.Rect(115, 680, 250, 703), stream=img_bytes)
        except Exception as e:
            print(f"Error inserting signature image: {e}")
            add_text_field(p2, 'client_signature', (115, 689, 283, 703), 'Client Signature', fontsize=8.5, value=data.get('client_signature', ''))
    else:
        add_text_field(p2, 'client_signature', (115, 689, 283, 703), 'Client Signature', fontsize=8.5, value=data.get('client_signature', ''))

    add_text_field(p2, 'client_signature_date', (310, 689, 410, 703), 'Client Signature Date', fontsize=8.5, value=data.get('client_signature_date', ''))
    
    trainer_sig_img = data.get('trainer_signature_image', '')
    if trainer_sig_img and trainer_sig_img.startswith('data:image'):
        try:
            b64_data = trainer_sig_img.split(',', 1)[1]
            img_bytes = base64.b64decode(b64_data)
            p2.insert_image(pymupdf.Rect(120, 702, 255, 725), stream=img_bytes)
        except Exception:
            add_text_field(p2, 'trainer_signature', (120, 711, 288, 725), 'Trainer Signature', fontsize=8.5, value=data.get('trainer_signature', ''))
    else:
        add_text_field(p2, 'trainer_signature', (120, 711, 288, 725), 'Trainer Signature', fontsize=8.5, value=data.get('trainer_signature', ''))
        
    add_text_field(p2, 'trainer_signature_date', (315, 711, 415, 725), 'Trainer Signature Date', fontsize=8.5, value=data.get('trainer_signature_date', ''))

    if output_path:
        doc.save(output_path)
        doc.close()
        return output_path
    else:
        pdf_bytes = doc.tobytes()
        doc.close()
        return pdf_bytes
