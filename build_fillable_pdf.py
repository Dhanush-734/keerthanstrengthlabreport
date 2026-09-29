import os
import pymupdf
from pdf_service import generate_screening_pdf, create_rounded_logo

def build_all_pdfs():
    create_rounded_logo()
    
    # 1. Blank fillable PDF
    blank_pdf_path = "Keerthan_Strength_Lab_Client_Screening_Form_Fillable.pdf"
    generate_screening_pdf(data=None, output_path=blank_pdf_path)
    print(f"Generated {blank_pdf_path}")

    # 2. Sample filled PDF
    sample_data = {
        'learner_name': 'Keerthan (Master Trainer)',
        'screening_date': '27/09/2026',
        'client_name': 'Alex Morgan',
        'gender': 'Female',
        'height': '168 cm',
        'weight': '64 kg',
        'age': '28',
        'health_risk_factors': 'No major cardiovascular risks. Occasional lower back tightness after prolonged desk sitting.',
        'medical_history': 'Sprained right ankle during college track in 2021 (fully rehabilitated). No surgical history.',
        'medications': 'Daily multivitamin, Omega-3 fish oil, Vitamin D3.',
        'occupation': 'Senior UX Designer (Desk-bound, 8 hrs/day)',
        'time_availability': '3 to 4 days/week, weekday mornings (6:30 AM - 7:45 AM)',
        'lifestyle_summary': 'Balanced Mediterranean whole food diet, 7-8 hours sleep per night. Tracks 2.5L water intake daily. Non-smoker.',
        'activity_level': 'MEDIUM',
        'training_history': '2 years recreational Pilates and dumbbell workouts at home. Wants structured barbell & hypertrophy programming.',
        'exercise_contraindications': 'Avoid heavy unguided spinal loading initially; focus on core engagement and glute activation.',
        'exercise_likes': 'Squats, deadlifts, kettlebell swings, rowing machine, mobility flows.',
        'exercise_dislikes': 'Long steady-state treadmill running, burpees, heavy overhead military presses.',
        'parq_q1': 'no',
        'parq_q2': 'no',
        'parq_q3': 'no',
        'parq_q4': 'no',
        'parq_q5': 'no',
        'parq_q6': 'no',
        'parq_q7': 'no',
        'parq_q8': 'no',
        'parq_q9': 'no',
        'parq_q10': 'no',
        'client_signature': 'Alex Morgan',
        'client_signature_date': '27/09/2026',
        'parq_signature_date': '27/09/2026',
        'exercise_barriers': 'High workload deadlines during sprint weeks. Afternoon fatigue and lack of accountability when training alone.',
        'overcome_strategies': 'Schedule fixed morning training slots before work. Pre-pack gym bag evening prior. Shared weekly check-ins with trainer.',
        'attitude_motivation_summary': 'Highly driven and goal-oriented. Motivated by physical strength gains, better posture, and energy levels for demanding tech career.',
        'instructor_name': 'Keerthan',
        'assessment_date': '27/09/2026',
        'chosen_tests': ['digital', 'bmi', 'bio-electrical impedance', 'press up', 'rockport walking test', 'hamstrings', 'shoulders'],
        'bp_results': '116/74 mmHg (Resting HR: 62 bpm)',
        'bp_reasons': 'Routine baseline assessment before high-intensity resistance.',
        'anthro_results': 'BMI: 22.7 (Normal weight) | Waist: 70 cm | WHR: 0.74',
        'anthro_reasons': 'Standard body composition metrics to gauge progress over 12 weeks.',
        'body_comp_results': 'Body Fat: 21.4% (via bio-electrical impedance scan)',
        'body_comp_reasons': 'Selected bio-electrical impedance for non-invasive speed and comfort.',
        'muscular_results': 'Push-ups: 22 reps | Plank: 1 min 45 sec | Goblet Squat: 20kg x 12 reps',
        'muscular_reasons': 'Baseline muscular endurance and core stability screen.',
        'cardio_results': 'Rockport Walking Test: Estimated VO2max 41.2 ml/kg/min (Good)',
        'cardio_reasons': 'Low impact walking test chosen due to previous ankle history.',
        'rom_results': 'Hamstrings: Normal (85 deg) | Shoulder Flexion: Full ROM (180 deg) | Ankle Dorsiflexion: Symmetrical 35 deg',
        'rom_reasons': 'Screening mobility for safe squat and deadlift mechanics.',
        'posture_results': 'Slight anterior pelvic tilt and forward head posture from computer work. Knees tracking neutral.',
        'posture_reasons': 'Crucial for tailoring corrective warm-up and posterior chain volume.'
    }

    filled_pdf_path = "Keerthan_Strength_Lab_Client_Screening_Form_TEST_FILLED.pdf"
    generate_screening_pdf(data=sample_data, output_path=filled_pdf_path)
    print(f"Generated {filled_pdf_path}")

    # Render verification images
    doc_blank = pymupdf.open(blank_pdf_path)
    for i, p in enumerate(doc_blank):
        p.get_pixmap(dpi=150).save(f"verify_blank_page{i+1}.png")
    doc_blank.close()

    doc_filled = pymupdf.open(filled_pdf_path)
    for i, p in enumerate(doc_filled):
        p.get_pixmap(dpi=150).save(f"verify_filled_page{i+1}.png")
    doc_filled.close()
    print("Verification images rendered for all 4 pages!")

if __name__ == '__main__':
    build_all_pdfs()
