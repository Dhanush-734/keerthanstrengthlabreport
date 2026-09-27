import os
import io
import json
import base64
from flask import Flask, request, jsonify, send_file, send_from_directory
import pymupdf
from pdf_service import generate_screening_pdf

app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'service': 'Keerthan Strength Lab Screening API'})

@app.route('/api/sample-data')
def get_sample_data():
    sample = {
        'full_name': 'Johnathan Miller',
        'age': '29',
        'gender': 'Male',
        'phone': '+1 (555) 234-5678',
        'email': 'johnathan.m@example.com',
        'occupation': 'Software Architect',
        'date_of_assessment': '26/09/2026',
        'training_experience': '3 years strength training',
        'preferred_training_time': '6:30 AM - 7:30 AM',
        'parq_q1': 'no',
        'parq_q2': 'no',
        'parq_q3': 'no',
        'parq_q4': 'yes',
        'parq_q5': 'no',
        'parq_q6': 'no',
        'parq_q7': 'no',
        'parq_details_1': 'Mild left rotator cuff impingement in 2024.',
        'parq_details_2': 'Cleared by physiotherapist; needs proper warm-up.',
        'current_medical_conditions': 'None',
        'previous_injuries': 'Left shoulder strain (2024)',
        'surgeries': 'None',
        'current_medications': 'Multivitamin, Omega-3',
        'pain_discomfort': 'Occasional shoulder stiffness',
        'other_health_concerns': 'None reported',
        'medical_additional_details_1': 'Underwent 6 weeks of rehabilitation with full range of motion regained.',
        'medical_additional_details_2': 'Advised to emphasize rotator cuff warm-up before heavy pressing.',
        'average_sleep': '7.5',
        'daily_water': '3.0',
        'daily_steps_activity': '9,000 steps',
        'current_exercise': 'Resistance training',
        'exercise_frequency': '4 days',
        'typical_work_activity': 'Desk job / Sedentary',
        'smoking': 'no',
        'alcohol': 'yes',
        'stress': 'moderate',
        'dietary_preferences_1': 'High-protein whole foods diet; moderate carbohydrates.',
        'dietary_preferences_2': 'No food allergies; tracking macros with 160g protein target.',
        'height': '182',
        'weight': '84.5',
        'bmi': '25.5',
        'resting_heart_rate': '62',
        'bp_systolic': '118',
        'bp_diastolic': '76',
        'body_assessment_date': '26/09/2026',
        'waist': '86',
        'hip': '101',
        'chest': '104',
        'arm': '37.5',
        'thigh': '59',
        'other_measurement': 'Calf: 38',
        'cardio_test': '1.5-mile run',
        'cardio_result': '10 min 45 sec',
        'cardio_date': '26/09/2026',
        'pushups_test': 'Standard floor push-ups',
        'pushups_result': '38 reps',
        'pushups_notes': 'Solid form, good lockout',
        'squat_test': 'Overhead squat assessment',
        'squat_result': 'Score: 3/3',
        'squat_notes': 'Great depth and ankle mobility',
        'plank_test': 'Prone forearm plank',
        'plank_result': '2 min 15 sec',
        'plank_notes': 'Strong core stability',
        'flexibility_test': 'Sit and reach / shoulder pass',
        'flexibility_result': '+4 cm / Full pass',
        'flexibility_notes': 'Good thoracic spine mobility',
        'fitness_observations_1': 'Excellent base conditioning, eager to progress to heavy barbell cycles.',
        'fitness_observations_2': 'Slight left shoulder asymmetry to monitor during overhead pressing.',
        'primary_goal': 'Hypertrophy & Strength',
        'target_weight': '82',
        'target_date': '26/03/2027',
        'secondary_goal': 'Lower body fat to 12%',
        'training_days_per_week': '4',
        'preferred_activities': 'Barbell lifts, HIIT',
        'specific_goals_1': 'Achieve 140kg squat, 100kg bench press, and 180kg deadlift.',
        'specific_goals_2': 'Improve overall cardiovascular stamina and athletic power output.',
        'client_signature': 'Johnathan Miller',
        'client_signature_date': '26/09/2026',
        'trainer_signature': '',
        'trainer_signature_date': ''
    }
    return jsonify(sample)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/api/generate-pdf', methods=['POST', 'OPTIONS'])
def generate_pdf_endpoint():
    if request.method == 'OPTIONS':
        return ('', 204)
    try:
        data = request.get_json(force=True) or {}
        pdf_bytes = generate_screening_pdf(data)
        
        client_name = data.get('full_name', 'Client').strip().replace(' ', '_')
        filename = f"Keerthan_Strength_Lab_Screening_{client_name}.pdf"
        
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/preview-pdf', methods=['POST', 'OPTIONS'])
def preview_pdf_endpoint():
    if request.method == 'OPTIONS':
        return ('', 204)
    try:
        data = request.get_json(force=True) or {}
        pdf_bytes = generate_screening_pdf(data)
        
        doc = pymupdf.open("pdf", pdf_bytes)
        pages_b64 = []
        for page in doc:
            pix = page.get_pixmap(dpi=150)
            img_bytes = pix.tobytes("png")
            b64_str = "data:image/png;base64," + base64.b64encode(img_bytes).decode('utf-8')
            pages_b64.append(b64_str)
        doc.close()
        
        return jsonify({'pages': pages_b64, 'pageCount': len(pages_b64)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Keerthan Strength Lab Server on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
