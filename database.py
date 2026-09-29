import os
import sqlite3
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'ksl_records.db')

CLIENT_FIELDS = [
    'client_name', 'screening_date', 'gender', 'height', 'weight', 'age',
    'health_risk_factors', 'medical_history', 'medications', 'occupation',
    'time_availability', 'lifestyle_summary', 'activity_level', 'training_history',
    'exercise_contraindications', 'exercise_likes', 'exercise_dislikes',
    'parq_q1', 'parq_q2', 'parq_q3', 'parq_q4', 'parq_q5',
    'parq_q6', 'parq_q7', 'parq_q8', 'parq_q9', 'parq_q10',
    'client_signature', 'client_signature_image', 'client_signature_date',
    'exercise_barriers', 'overcome_strategies', 'attitude_motivation_summary',
    'client_notes'
]

ASSESSMENT_FIELDS = [
    'instructor_name', 'assessment_date', 'chosen_tests',
    'bp_results', 'bp_reasons',
    'anthro_results', 'anthro_reasons',
    'body_comp_results', 'body_comp_reasons',
    'muscular_results', 'muscular_reasons',
    'cardio_results', 'cardio_reasons',
    'rom_results', 'rom_reasons',
    'posture_results', 'posture_reasons'
]

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT UNIQUE NOT NULL,
            client_name TEXT NOT NULL,
            screening_date TEXT,
            gender TEXT,
            height TEXT,
            weight TEXT,
            age TEXT,
            health_risk_factors TEXT,
            medical_history TEXT,
            medications TEXT,
            occupation TEXT,
            time_availability TEXT,
            lifestyle_summary TEXT,
            activity_level TEXT,
            training_history TEXT,
            exercise_contraindications TEXT,
            exercise_likes TEXT,
            exercise_dislikes TEXT,
            parq_q1 TEXT,
            parq_q2 TEXT,
            parq_q3 TEXT,
            parq_q4 TEXT,
            parq_q5 TEXT,
            parq_q6 TEXT,
            parq_q7 TEXT,
            parq_q8 TEXT,
            parq_q9 TEXT,
            parq_q10 TEXT,
            client_signature TEXT,
            client_signature_image TEXT,
            client_signature_date TEXT,
            exercise_barriers TEXT,
            overcome_strategies TEXT,
            attitude_motivation_summary TEXT,
            client_notes TEXT,
            instructor_name TEXT,
            assessment_date TEXT,
            chosen_tests TEXT,
            bp_results TEXT,
            bp_reasons TEXT,
            anthro_results TEXT,
            anthro_reasons TEXT,
            body_comp_results TEXT,
            body_comp_reasons TEXT,
            muscular_results TEXT,
            muscular_reasons TEXT,
            cardio_results TEXT,
            cardio_reasons TEXT,
            rom_results TEXT,
            rom_reasons TEXT,
            posture_results TEXT,
            posture_reasons TEXT,
            assessment_completed INTEGER DEFAULT 0,
            created_at TEXT,
            updated_at TEXT
        )
    ''')
    conn.commit()

    # Seed default sample client (Alex Morgan) if database is empty
    c.execute('SELECT COUNT(*) FROM clients')
    count = c.fetchone()[0]
    if count == 0:
        seed_sample_client(conn)

    conn.close()

def seed_sample_client(conn):
    c = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    sample_tests = json.dumps(['digital', 'bmi', 'waist circumference', 'bio-electrical impedance', 'press up', 'rockport walking test', 'hamstrings', 'shoulders'])
    c.execute('''
        INSERT INTO clients (
            client_id, client_name, screening_date, gender, height, weight, age,
            health_risk_factors, medical_history, medications, occupation, time_availability,
            lifestyle_summary, activity_level, training_history, exercise_contraindications,
            exercise_likes, exercise_dislikes,
            parq_q1, parq_q2, parq_q3, parq_q4, parq_q5,
            parq_q6, parq_q7, parq_q8, parq_q9, parq_q10,
            client_signature, client_signature_image, client_signature_date,
            exercise_barriers, overcome_strategies, attitude_motivation_summary,
            client_notes,
            instructor_name, assessment_date, chosen_tests,
            bp_results, bp_reasons,
            anthro_results, anthro_reasons,
            body_comp_results, body_comp_reasons,
            muscular_results, muscular_reasons,
            cardio_results, cardio_reasons,
            rom_results, rom_reasons,
            posture_results, posture_reasons,
            assessment_completed, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?,
            ?, ?, ?,
            ?, ?,
            ?, ?,
            ?, ?,
            ?, ?,
            ?, ?,
            ?, ?,
            ?, ?,
            1, ?, ?
        )
    ''', (
        'client_alex_morgan', 'Alex Morgan', '29/09/2026', 'Female', '168 cm', '64 kg', '28',
        'No major cardiovascular risks. Occasional lower back tightness after prolonged desk sitting.',
        'Sprained right ankle during college track in 2021 (fully rehabilitated). No surgical history.',
        'Daily multivitamin, Omega-3 fish oil, Vitamin D3.',
        'Senior UX Designer (Desk-bound, 8 hrs/day)',
        '3 to 4 days/week, weekday mornings (6:30 AM - 7:45 AM)',
        'Balanced Mediterranean whole food diet, 7-8 hours sleep per night. Tracks 2.5L water intake daily. Non-smoker.',
        'MEDIUM',
        '2 years recreational Pilates and dumbbell workouts at home. Wants structured barbell & hypertrophy programming.',
        'Avoid heavy unguided spinal loading initially; focus on core engagement and glute activation.',
        'Squats, deadlifts, kettlebell swings, rowing machine, mobility flows.',
        'Long steady-state treadmill running, burpees, heavy overhead military presses.',
        'no', 'no', 'no', 'no', 'no',
        'no', 'no', 'no', 'no', 'no',
        'Alex Morgan', '', '29/09/2026',
        'High workload deadlines during sprint weeks. Afternoon fatigue and lack of accountability when training alone.',
        'Schedule fixed morning training slots before work. Pre-pack gym bag evening prior. Shared weekly check-ins with trainer.',
        'Highly driven and goal-oriented. Motivated by physical strength gains, better posture, and energy levels for demanding tech career.',
        'I am preparing for a trail 10K run next season while wanting to build lean leg and posterior chain strength. Prefer morning workouts before 8 AM.',
        'Keerthan', '29/09/2026', sample_tests,
        '116/74 mmHg (Resting HR: 62 bpm)', 'Routine baseline assessment before high-intensity resistance.',
        'BMI: 22.7 (Normal weight) | Waist: 70 cm | WHR: 0.74', 'Standard body composition metrics to gauge progress over 12 weeks.',
        'Body Fat: 21.4% (via bio-electrical impedance scan)', 'Selected bio-electrical impedance for non-invasive speed and comfort.',
        'Push-ups: 22 reps | Plank: 1 min 45 sec | Goblet Squat: 20kg x 12 reps', 'Baseline muscular endurance and core stability screen.',
        'Rockport Walking Test: Estimated VO2max 41.2 ml/kg/min (Good)', 'Low impact walking test chosen due to previous ankle history.',
        'Hamstrings: Normal (85 deg) | Shoulder Flexion: Full ROM (180 deg) | Ankle Dorsiflexion: Symmetrical 35 deg', 'Screening mobility for safe squat and deadlift mechanics.',
        'Slight anterior pelvic tilt and forward head posture from computer work. Knees tracking neutral.', 'Crucial for tailoring corrective warm-up and posterior chain volume.',
        now_str, now_str
    ))
    conn.commit()

def save_client_registration(data):
    """Save or update client registration information (Client role only writes client fields)."""
    conn = get_connection()
    c = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    client_id = data.get('client_id')
    client_name = data.get('client_name') or data.get('full_name') or 'Unnamed Client'
    
    if not client_id:
        slug = "".join(ch if ch.isalnum() else "_" for ch in client_name.lower().strip())
        import random
        rand_suffix = f"{random.randint(1000, 9999)}"
        client_id = f"client_{slug}_{rand_suffix}"

    # Check if client exists
    c.execute('SELECT id, assessment_completed FROM clients WHERE client_id = ?', (client_id,))
    row = c.fetchone()

    if row:
        # Update client fields only, preserving existing initial assessment fields
        fields_to_update = []
        vals = []
        for f in CLIENT_FIELDS:
            if f in data:
                fields_to_update.append(f"{f} = ?")
                vals.append(data.get(f, ''))
        fields_to_update.append("updated_at = ?")
        vals.append(now_str)
        vals.append(client_id)

        sql = f"UPDATE clients SET {', '.join(fields_to_update)} WHERE client_id = ?"
        c.execute(sql, vals)
    else:
        # Insert new record
        cols = ['client_id'] + CLIENT_FIELDS + ['created_at', 'updated_at']
        placeholders = ['?'] * len(cols)
        vals = [client_id]
        for f in CLIENT_FIELDS:
            vals.append(data.get(f, ''))
        vals.extend([now_str, now_str])

        sql = f"INSERT INTO clients ({', '.join(cols)}) VALUES ({', '.join(placeholders)})"
        c.execute(sql, vals)

    conn.commit()
    conn.close()
    return get_client_by_id(client_id)

def update_initial_assessment(client_id, assessment_data):
    """Update Initial Assessment fields (Trainer role only)."""
    conn = get_connection()
    c = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Verify client exists
    c.execute('SELECT id FROM clients WHERE client_id = ?', (client_id,))
    if not c.fetchone():
        conn.close()
        return None

    fields_to_update = []
    vals = []
    for f in ASSESSMENT_FIELDS:
        if f in assessment_data:
            val = assessment_data.get(f)
            if f == 'chosen_tests' and isinstance(val, (list, tuple)):
                val = json.dumps(val)
            fields_to_update.append(f"{f} = ?")
            vals.append(val if val is not None else '')

    fields_to_update.append("assessment_completed = 1")
    fields_to_update.append("updated_at = ?")
    vals.append(now_str)
    vals.append(client_id)

    sql = f"UPDATE clients SET {', '.join(fields_to_update)} WHERE client_id = ?"
    c.execute(sql, vals)
    conn.commit()
    conn.close()

    return get_client_by_id(client_id)

def get_client_by_id(client_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM clients WHERE client_id = ?', (client_id,))
    row = c.fetchone()
    conn.close()
    if not row:
        return None

    d = dict(row)
    # Parse chosen_tests JSON if present
    if d.get('chosen_tests'):
        try:
            d['chosen_tests'] = json.loads(d['chosen_tests'])
        except Exception:
            if isinstance(d['chosen_tests'], str):
                d['chosen_tests'] = [x.strip() for x in d['chosen_tests'].split(',') if x.strip()]
    else:
        d['chosen_tests'] = []

    return d

def list_clients():
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        SELECT client_id, client_name, screening_date, activity_level,
               assessment_completed, client_notes, created_at, updated_at
        FROM clients
        ORDER BY id DESC
    ''')
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]
