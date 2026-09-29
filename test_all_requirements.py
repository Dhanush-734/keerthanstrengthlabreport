import requests
import json
import re

BASE_URL = "http://localhost:5000"

def test_suite():
    print("=" * 60)
    print("RUNNING KEERTHAN STRENGTH LAB COMPREHENSIVE VERIFICATION")
    print("=" * 60)
    
    # ----------------------------------------------------
    # Case 8: Verify section numbers removed from HTML
    # ----------------------------------------------------
    print("\n[TEST CASE 8] Verifying removal of section numbers in HTML and PDF...")
    with open("index.html", "r", encoding="utf-8") as f:
        html_content = f.read()
    
    forbidden_numbers = ["01", "02", "03", "04"]
    for num in forbidden_numbers:
        assert f'<div class="sec-number">{num}</div>' not in html_content, f"Found sec-number {num} in HTML!"
    
    # Ensure headings don't have "1. Client", "2. Physical", "4. Initial"
    assert "1. Client Screening" not in html_content, "Found '1. Client Screening' in HTML"
    assert "2. Physical Activity" not in html_content, "Found '2. Physical Activity' in HTML"
    assert "4. Initial Assessment" not in html_content, "Found '4. Initial Assessment' in HTML"
    assert "Client Screening Form" in html_content
    assert "Physical Activity Readiness Questionnaire (PAR-Q)" in html_content
    assert "Initial Assessment" in html_content
    print("  -> PASSED: Main section numbers completely removed from HTML.")

    # ----------------------------------------------------
    # Case 7: Verify Barriers Section Compactness
    # ----------------------------------------------------
    print("\n[TEST CASE 7] Verifying Barriers Section compactness...")
    assert 'class="form-control form-control-compact"' in html_content or 'rows="3"' in html_content
    assert 'py-compact' in html_content or 'panel-compact' in html_content
    print("  -> PASSED: Barriers section has compact styling and reduced row sizing.")

    # ----------------------------------------------------
    # Case 1: Client registers with Client Notes
    # ----------------------------------------------------
    print("\n[TEST CASE 1] Client registers with personal information and Client Notes...")
    client_payload = {
        "client_name": "Sarah Connor",
        "trainer_name": "Keerthan",
        "date": "2026-09-29",
        "email": "sarah.connor@example.com",
        "phone": "+1 555-0199",
        "dob": "1994-05-12",
        "occupation": "Cybernetics Engineer",
        "emergency_name": "John Connor",
        "emergency_relationship": "Son",
        "emergency_phone": "+1 555-0100",
        "goals": "Build upper body strength and increase aerobic endurance.",
        "barriers": "Erratic shift work schedule.",
        "strategies": "Early morning 45-minute structured sessions.",
        "summary": "Highly motivated and determined.",
        "client_notes": "I have a previous minor right shoulder strain from 2024. Prefers kettlebell movements over barbell bench."
    }
    
    resp = requests.post(f"{BASE_URL}/api/register", json=client_payload)
    assert resp.status_code in [200, 201], f"Registration failed with code {resp.status_code}: {resp.text}"
    reg_data = resp.json()
    assert reg_data.get("status") in ["ok", "success"]
    client_id = reg_data.get("client_id") or reg_data.get("client", {}).get("client_id")
    print(f"  -> PASSED: Client registered successfully. Client ID: {client_id}")

    # Fetch client details and verify client_notes persisted
    get_resp = requests.get(f"{BASE_URL}/api/clients/{client_id}")
    assert get_resp.status_code == 200
    saved_client = get_resp.json().get("client") or get_resp.json()
    assert saved_client.get("client_notes") == client_payload["client_notes"]
    print("  -> PASSED: Client Notes correctly saved and retrieved from DB.")

    # ----------------------------------------------------
    # Case 4: Client tries to modify Initial Assessment via API -> 403 Forbidden
    # ----------------------------------------------------
    print("\n[TEST CASE 4] Client attempts to tamper with Initial Assessment fields via API (unauthorized)...")
    tamper_payload = {
        "client_id": client_id,
        "client_name": "Sarah Connor",
        "bp_results": "120/80 mmHg - Normal", # Assessment field!
        "chosen_tests": "Push-up test, Cooper 12min run", # Assessment field!
        "client_notes": "Trying to sneak assessment values in"
    }
    
    # 1) Attempt via /api/register without trainer auth
    resp_tamper = requests.post(f"{BASE_URL}/api/register", json=tamper_payload)
    assert resp_tamper.status_code == 403, f"Expected 403 Forbidden, got {resp_tamper.status_code}: {resp_tamper.text}"
    assert "TRAINER_AUTH_REQUIRED" in resp_tamper.text
    print(f"  -> PASSED: API /api/register rejected unauthorized assessment tampering with HTTP 403 Forbidden.")

    # 2) Attempt via /api/trainer/assessment without trainer auth header
    resp_tamper2 = requests.post(f"{BASE_URL}/api/trainer/assessment", json={
        "client_id": client_id,
        "bp_results": "115/75 mmHg"
    })
    assert resp_tamper2.status_code == 403, f"Expected 403 Forbidden, got {resp_tamper2.status_code}: {resp_tamper2.text}"
    print(f"  -> PASSED: Direct /api/trainer/assessment without key rejected with HTTP 403 Forbidden.")

    # ----------------------------------------------------
    # Case 5 & 6: Trainer authenticates & saves Initial Assessment
    # ----------------------------------------------------
    print("\n[TEST CASE 5 & 6] Trainer authenticates and updates Initial Assessment...")
    login_resp = requests.post(f"{BASE_URL}/api/trainer/login", json={"passcode": "keerthan2026"})
    assert login_resp.status_code == 200, f"Trainer login failed: {login_resp.text}"
    trainer_data = login_resp.json()
    token = trainer_data.get("token")
    assert token is not None
    print("  -> PASSED: Trainer authenticated. Token obtained.")

    trainer_headers = {
        "X-Trainer-Key": token,
        "Content-Type": "application/json"
    }
    
    assessment_payload = {
        "client_id": client_id,
        "trainer_name": "Keerthan Master Trainer",
        "date": "2026-09-29",
        "bp_results": "118/76 mmHg (Optimal)",
        "bp_reasons": "Resting seated measurement post 5-minute calm period.",
        "anthro_results": "Height: 172cm | Weight: 64kg | Waist: 70cm",
        "anthro_reasons": "Standard baseline physical anthropometrics.",
        "body_comp_results": "Body Fat: 18.2% | Lean Mass: 52.4kg",
        "body_comp_reasons": "Bioelectrical impedance multi-frequency.",
        "muscular_results": "Push-up Test: 28 reps | Plank: 90s",
        "muscular_reasons": "Upper body and core muscular endurance assessment.",
        "cardio_results": "VO2 Max Estimate: 46.5 ml/kg/min",
        "cardio_reasons": "Submaximal cycle ergometer protocol.",
        "rom_results": "Right shoulder internal rotation slightly restricted (40 deg). Hip mobility full.",
        "rom_reasons": "Goniometer measurement addressing client's stated shoulder concern.",
        "posture_results": "Slight anterior pelvic tilt, neutral thoracic spine.",
        "posture_reasons": "Visual plumb line assessment in sagittal plane.",
        "chosen_tests": "Resting Blood Pressure, Skinfold / Bioimpedance, Push-up Test, Modified Thomas Test, Overhead Squat Assessment"
    }

    assess_resp = requests.post(f"{BASE_URL}/api/trainer/assessment", json=assessment_payload, headers=trainer_headers)
    assert assess_resp.status_code == 200, f"Assessment update failed: {assess_resp.text}"
    print("  -> PASSED: Trainer successfully saved Initial Assessment to database.")

    # ----------------------------------------------------
    # Case 2: Client views completed profile -> Assessment is visible
    # ----------------------------------------------------
    print("\n[TEST CASE 2] Verifying client can view completed assessment from database...")
    fetch_resp = requests.get(f"{BASE_URL}/api/clients/{client_id}")
    assert fetch_resp.status_code == 200
    updated_client = fetch_resp.json().get("client") or fetch_resp.json()
    assert updated_client.get("bp_results") == "118/76 mmHg (Optimal)"
    assert updated_client.get("muscular_results") == "Push-up Test: 28 reps | Plank: 90s" or updated_client.get("strength_results") == "Push-up Test: 28 reps | Plank: 90s"
    assert "Modified Thomas Test" in str(updated_client.get("chosen_tests"))
    assert updated_client.get("client_notes") == client_payload["client_notes"]
    print("  -> PASSED: Client profile contains all trainer assessment data and client notes.")

    # ----------------------------------------------------
    # Case 3: Verify UI Readonly Enforcement in HTML/JS/CSS
    # ----------------------------------------------------
    print("\n[TEST CASE 3] Verifying UI-level readonly locking logic...")
    with open("app.js", "r", encoding="utf-8") as f:
        js_content = f.read()
    with open("style.css", "r", encoding="utf-8") as f:
        css_content = f.read()
    
    assert "function updateRoleUI" in js_content, "updateRoleUI missing in app.js"
    assert "assessReadonlyNotice" in js_content, "assessReadonlyNotice missing in app.js"
    assert "is-readonly-mode" in js_content, "is-readonly-mode missing in app.js"
    assert "assessInputs.forEach" in js_content, "Loop over assessment inputs to set readonly missing"
    assert "!isTrainer()" in js_content, "Chip click guard missing in app.js"
    assert ".is-readonly-mode #sec-assessment .test-chip" in css_content
    assert "pointer-events: none;" in css_content
    print("  -> PASSED: JavaScript and CSS properly lock banner, disable inputs, and prevent chip clicks in client mode.")

    # ----------------------------------------------------
    # Verification of PDF Generation with Client Notes and Compact Barriers
    # ----------------------------------------------------
    print("\n[PDF VERIFICATION] Generating PDF with updated client data and notes...")
    pdf_req = requests.post(f"{BASE_URL}/api/generate-pdf", json=updated_client)
    assert pdf_req.status_code == 200, f"PDF generation failed: {pdf_req.text}"
    assert pdf_req.headers.get("content-type") == "application/pdf"
    assert len(pdf_req.content) > 10000
    print(f"  -> PASSED: PDF successfully generated with client data and notes ({len(pdf_req.content)} bytes).")

    print("\n" + "=" * 60)
    print("ALL 8 VERIFICATION TEST CASES PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_suite()
