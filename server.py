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

@app.route('/help')
@app.route('/help.html')
def help_page():
    return send_from_directory('.', 'help.html')

@app.route('/api/health')
@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'service': 'Keerthan Strength Lab Screening & Assessment Portal'
    })

@app.route('/api/sample-data')
@app.route('/sample-data')
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
        'client_notes': 'Primary goal is preparing for an autumn half-marathon while improving thoracic mobility and lower back stability. Prefer 7 AM sessions.'
    }
    return jsonify(sample)

@app.route('/api/generate-pdf', methods=['POST', 'OPTIONS'])
@app.route('/generate-pdf', methods=['POST', 'OPTIONS'])
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
@app.route('/preview-pdf', methods=['POST', 'OPTIONS'])
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
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Keerthan Strength Lab Server on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
