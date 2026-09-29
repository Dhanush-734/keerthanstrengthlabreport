import os
import io
import json
import base64
from flask import Flask, request, jsonify, send_file, send_from_directory
import pymupdf
from pdf_service import generate_screening_pdf
import database

app = Flask(__name__, static_folder='.', static_url_path='')

# Initialize SQLite database on startup
database.init_db()

TRAINER_PASSCODE = os.environ.get('TRAINER_PASSCODE', 'keerthan2026').strip().lower()
TRAINER_AUTH_TOKEN = 'ksl_trainer_token_auth_2026'

def is_trainer_authorized(req):
    """Verify whether the incoming request has valid trainer credentials."""
    # Check X-Trainer-Key header
    trainer_key = req.headers.get('X-Trainer-Key', '').strip()
    if trainer_key and (trainer_key.lower() == TRAINER_PASSCODE or trainer_key == TRAINER_AUTH_TOKEN):
        return True

    # Check Authorization header (Bearer token)
    auth_header = req.headers.get('Authorization', '').strip()
    if auth_header.startswith('Bearer '):
        token = auth_header[7:].strip()
        if token.lower() == TRAINER_PASSCODE or token == TRAINER_AUTH_TOKEN:
            return True

    # Check query param (for quick debugging/API testing)
    q_key = req.args.get('trainer_key', '').strip()
    if q_key and (q_key.lower() == TRAINER_PASSCODE or q_key == TRAINER_AUTH_TOKEN):
        return True

    return False

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'ok',
        'service': 'Keerthan Strength Lab Screening & Assessment API',
        'database': 'sqlite3'
    })

@app.route('/api/sample-data')
def get_sample_data():
    sample = {
        'learner_name': 'Keerthan (Master Trainer)',
        'screening_date': '29/09/2026',
        'client_name': 'Alex Morgan',
        'full_name': 'Alex Morgan',
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

        # PAR-Q
        'parq_client_name': 'Alex Morgan',
        'parq_date': '29/09/2026',
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
        'client_signature_date': '29/09/2026',
        'parq_signature_date': '29/09/2026',

        # Barriers & Strategies
        'exercise_barriers': 'High workload deadlines during sprint weeks. Afternoon fatigue and lack of accountability when training alone.',
        'overcome_strategies': 'Schedule fixed morning training slots before work. Pre-pack gym bag evening prior. Shared weekly check-ins with trainer.',
        'attitude_motivation_summary': 'Highly driven and goal-oriented. Motivated by physical strength gains, better posture, and energy levels for demanding tech career.',

        # Client Notes / Additional Information
        'client_notes': 'Primary goal is preparing for an autumn half-marathon while improving thoracic mobility and lower back stability. Prefer 7 AM sessions.',

        # Initial Assessment (Trainer-Only)
        'assessment_client_name': 'Alex Morgan',
        'instructor_name': 'Keerthan',
        'assessment_date': '29/09/2026',
        'chosen_tests': ['digital', 'bmi', 'waist circumference', 'bio-electrical impedance', 'press up', 'rockport walking test', 'hamstrings', 'shoulders'],
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
    return jsonify(sample)

@app.route('/api/trainer/login', methods=['POST', 'OPTIONS'])
def trainer_login():
    """Authenticate trainer using secure passcode."""
    if request.method == 'OPTIONS':
        return ('', 204)
    data = request.get_json(force=True) or {}
    passcode = str(data.get('passcode', '')).strip().lower()

    if passcode == TRAINER_PASSCODE:
        return jsonify({
            'success': True,
            'token': TRAINER_AUTH_TOKEN,
            'trainer_name': 'Keerthan (Master Trainer)',
            'role': 'trainer'
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Invalid trainer passcode. Access restricted to authorized coaches.'
        }), 401

@app.route('/api/register', methods=['POST', 'OPTIONS'])
@app.route('/api/clients', methods=['POST', 'OPTIONS'])
def register_client():
    """Client registration endpoint. Rejects attempts to modify Initial Assessment without trainer role."""
    if request.method == 'OPTIONS':
        return ('', 204)
    data = request.get_json(force=True) or {}

    # Strict Role-Based Permission Check:
    # A client is strictly forbidden from supplying or modifying Initial Assessment fields!
    trainer_authorized = is_trainer_authorized(request)

    assessment_attempts = []
    for f in database.ASSESSMENT_FIELDS:
        val = data.get(f)
        if val is not None and val != '' and val != [] and val != {}:
            assessment_attempts.append(f)

    if assessment_attempts and not trainer_authorized:
        return jsonify({
            'error': 'Permission Denied: Initial Assessment can only be completed and modified by authorized trainers.',
            'code': 'TRAINER_AUTH_REQUIRED',
            'unauthorized_fields': assessment_attempts
        }), 403

    # Client can freely register and provide demographics, PAR-Q, barriers, and client_notes
    client_record = database.save_client_registration(data)
    return jsonify({
        'status': 'ok',
        'message': 'Client profile successfully registered.',
        'client': client_record
    }), 201

@app.route('/api/clients', methods=['GET'])
def get_clients_list():
    """List registered clients (summary for trainer roster)."""
    clients = database.list_clients()
    return jsonify({
        'status': 'ok',
        'clients': clients,
        'count': len(clients)
    })

@app.route('/api/clients/<client_id>', methods=['GET'])
def get_client_profile(client_id):
    """Retrieve full client profile."""
    client = database.get_client_by_id(client_id)
    if not client:
        return jsonify({'error': f'Client {client_id} not found'}), 404
    return jsonify({
        'status': 'ok',
        'client': client
    })

@app.route('/api/trainer/assessment', methods=['POST', 'PUT', 'OPTIONS'])
@app.route('/api/clients/<client_id>/assessment', methods=['POST', 'PUT', 'OPTIONS'])
def save_trainer_assessment(client_id=None):
    """Trainer-only endpoint to record or update Initial Assessment data."""
    if request.method == 'OPTIONS':
        return ('', 204)

    # Verify trainer authorization
    if not is_trainer_authorized(request):
        return jsonify({
            'error': 'Forbidden: Authorized trainer credentials required to record or update Initial Assessment.',
            'code': 'INVALID_TRAINER_KEY'
        }), 403

    data = request.get_json(force=True) or {}
    target_id = client_id or data.get('client_id')

    if not target_id:
        return jsonify({'error': 'Missing client_id for assessment update'}), 400

    updated_client = database.update_initial_assessment(target_id, data)
    if not updated_client:
        return jsonify({'error': f'Client {target_id} not found'}), 404

    return jsonify({
        'status': 'ok',
        'message': f'Initial Assessment saved successfully for {updated_client.get("client_name")}.',
        'client': updated_client
    })

@app.route('/api/generate-pdf', methods=['POST', 'OPTIONS'])
def generate_pdf_endpoint():
    if request.method == 'OPTIONS':
        return ('', 204)
    try:
        data = request.get_json(force=True) or {}
        pdf_bytes = generate_screening_pdf(data)

        client_name = data.get('client_name', data.get('full_name', 'Client')).strip().replace(' ', '_')
        filename = f"Keerthan_Strength_Lab_Assessment_{client_name}.pdf"

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

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Trainer-Key')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Keerthan Strength Lab Server on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
