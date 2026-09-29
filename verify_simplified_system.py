import requests
import json
import re

BASE_URL = "http://localhost:5000"

def verify():
    print("=" * 65)
    print("VERIFYING SIMPLIFIED KEERTHAN STRENGTH LAB CLIENT FORM")
    print("=" * 65)

    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()
    with open("style.css", "r", encoding="utf-8") as f:
        css = f.read()
    with open("app.js", "r", encoding="utf-8") as f:
        js = f.read()
    with open("server.py", "r", encoding="utf-8") as f:
        server_py = f.read()

    # ----------------------------------------------------
    # 1. NO SECTION NUMBERS
    # ----------------------------------------------------
    print("\n[CHECK 1] Verifying no section numbers anywhere...")
    forbidden_prefixes = ["1. Client Screening", "2. Physical Activity", "4. Initial Assessment", "3. Initial Assessment"]
    for fp in forbidden_prefixes:
        assert fp not in html, f"Found forbidden section numbering: '{fp}'"

    forbidden_badges = ['class="sec-number"', 'domain-num']
    for fb in forbidden_badges:
        assert fb not in html, f"Found forbidden numbering class: '{fb}'"

    assert "Client Screening Form" in html
    assert "Physical Activity Readiness Questionnaire (PAR-Q)" in html
    assert "Initial Assessment" in html
    print("  -> PASSED: Section titles are clean with zero numeric prefixes or badges.")

    # ----------------------------------------------------
    # 2. COMPACT BARRIERS TO EXERCISE
    # ----------------------------------------------------
    print("\n[CHECK 2] Verifying Client's Barriers to Exercise is compact...")
    assert "Client's Barriers to Exercise" in html
    assert "Barriers to exercising and achieving goals including motivational barriers" in html
    assert "Strategies to overcome them" in html
    assert "Summary of the client's attitude and motivation to exercise" in html
    assert "panel-compact" in html
    assert "form-control-compact" in html
    print("  -> PASSED: Barriers section has all required fields in a compact layout.")

    # ----------------------------------------------------
    # 3. CLIENT NOTES / ADDITIONAL INFORMATION
    # ----------------------------------------------------
    print("\n[CHECK 3] Verifying Client Notes / Additional Information section...")
    assert "Client Notes / Additional Information" in html
    assert "Tell us anything else you'd like us to know." in html
    assert 'name="client_notes"' in html
    print("  -> PASSED: Client Notes section is present with exact helper text and multiline textarea.")

    # ----------------------------------------------------
    # 4. INITIAL ASSESSMENT IS READ-ONLY FOR THE CLIENT
    # ----------------------------------------------------
    print("\n[CHECK 4] Verifying Initial Assessment is strictly read-only for the client...")
    assert "Trainer Assessment — Read Only" in html or "Initial Assessment — Read Only" in html
    assert "assessment-readonly-banner" in html
    assert "lockInitialAssessmentReadOnly" in js
    assert "pointer-events: none" in css
    # Verify required clinical fields exist
    clinical_fields = [
        "bp_results", "bp_reasons", "anthro_results", "anthro_reasons",
        "body_comp_results", "body_comp_reasons", "muscular_results", "muscular_reasons",
        "cardio_results", "cardio_reasons", "rom_results", "rom_reasons",
        "posture_results", "posture_reasons"
    ]
    for cf in clinical_fields:
        assert f'id="{cf}"' in html, f"Missing clinical field {cf}"
        assert f'name="{cf}"' in html, f"Missing clinical field {cf}"
    print("  -> PASSED: Initial Assessment is display-only, read-only locked, with all clinical metrics intact.")

    # ----------------------------------------------------
    # 5. NO TRAINER SYSTEM / NO PASSCODE / NO DATABASE
    # ----------------------------------------------------
    print("\n[CHECK 5] Verifying complete removal of trainer login, passcodes, and database...")
    forbidden_trainer_strings = [
        "Trainer Authentication",
        "Keerthan Strength Lab Coaching Portal",
        "Master Trainer Passcode",
        "Default Coach Passcode",
        "Unlock Trainer Access",
        "trainerAuthModal",
        "clientRosterModal",
        "btnTrainerPortal"
    ]
    for s in forbidden_trainer_strings:
        assert s not in html, f"Found forbidden trainer string in index.html: '{s}'"

    assert "import database" not in server_py, "Found database import in server.py"
    assert "/api/trainer/login" not in server_py, "Found trainer login route in server.py"
    assert "TRAINER_PASSCODE" not in server_py, "Found trainer passcode in server.py"
    print("  -> PASSED: Trainer authentication popup, passcodes, and database are completely removed.")

    # ----------------------------------------------------
    # 6. BACKEND API VERIFICATION (PDF ENGINE & SAMPLE DATA)
    # ----------------------------------------------------
    print("\n[CHECK 6] Verifying backend endpoints (HTML, Sample Data, PDF generation & preview)...")
    # Health check
    res_health = requests.get(f"{BASE_URL}/api/health")
    assert res_health.status_code == 200

    # Sample Data
    res_sample = requests.get(f"{BASE_URL}/api/sample-data")
    assert res_sample.status_code == 200
    sample_data = res_sample.json()
    assert "client_notes" in sample_data
    assert "bp_results" in sample_data
    assert "muscular_results" in sample_data

    # Generate PDF
    res_pdf = requests.post(f"{BASE_URL}/api/generate-pdf", json=sample_data)
    assert res_pdf.status_code == 200
    assert res_pdf.headers.get("content-type") == "application/pdf"
    assert len(res_pdf.content) > 10000
    print(f"  -> PASSED: PDF compiled successfully ({len(res_pdf.content)} bytes).")

    # Preview PDF
    res_preview = requests.post(f"{BASE_URL}/api/preview-pdf", json=sample_data)
    assert res_preview.status_code == 200
    preview_data = res_preview.json()
    assert preview_data.get("pageCount") == 4
    assert len(preview_data.get("pages")) == 4
    print("  -> PASSED: Vector PDF 4-page preview rendered successfully.")

    print("\n" + "=" * 65)
    print("ALL SIMPLIFICATION CHECKS PASSED WITH 100% SUCCESS!")
    print("=" * 65)

if __name__ == "__main__":
    verify()
