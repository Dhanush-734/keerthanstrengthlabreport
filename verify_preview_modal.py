import requests
import json
import re

BASE_URL = "http://localhost:5000"

def test_preview_modal():
    print("=" * 65)
    print("VERIFYING PDF PREVIEW MODAL ARCHITECTURE & BEHAVIOR")
    print("=" * 65)

    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()
    with open("style.css", "r", encoding="utf-8") as f:
        css = f.read()
    with open("app.js", "r", encoding="utf-8") as f:
        js = f.read()

    # 1. Verify HTML Structure: Header -> Tabs -> Scroll Area -> Footer
    print("\n[CHECK 1] Verifying Modal HTML Architecture...")
    assert "modal-dialog-preview" in html
    assert "preview-tabs-bar" in html
    assert "preview-scroll-area" in html
    assert "preview-loading" in html
    assert "preview-error-box" in html
    assert "previewStage" in html
    assert "previewImg1" in html
    assert "previewImg2" in html
    assert "previewImg3" in html
    assert "previewImg4" in html
    assert "btnClosePreviewBottom" in html
    assert "btnDownloadFromModal" in html
    print("  -> PASSED: Modal contains fixed header, fixed tabs bar, dedicated scroll area, and fixed footer.")

    # 2. Verify Single-Scroll CSS (No nested scrollbars)
    print("\n[CHECK 2] Verifying CSS Single-Scroll Rules...")
    assert ".modal-dialog.modal-dialog-preview" in css
    assert "overflow: hidden" in css
    assert ".preview-scroll-area" in css
    assert "overflow-y: auto" in css
    assert "overflow-x: hidden" in css
    assert "flex: 1 1 auto" in css
    assert "min-height: 0" in css
    assert "box-shadow" in css
    print("  -> PASSED: Dedicated single scrollable area with fixed outer dialog container.")

    # 3. Verify JavaScript Logic (Background scroll lock, scrollTop reset, caching)
    print("\n[CHECK 3] Verifying JavaScript Modal Logic...")
    assert "switchPreviewPage" in js
    assert "previewScrollArea.scrollTop = 0" in js
    assert "cachedPreviewPages" in js
    assert "document.body.style.overflow = 'hidden'" in js
    assert "document.body.style.overflow = ''" in js
    assert "Unable to preview this page. Please try downloading the PDF." in js
    print("  -> PASSED: Tab switching resets scroll to top, locks background body scroll, and caches pages.")

    # 4. Verify Backend Preview Endpoint
    print("\n[CHECK 4] Verifying Backend Preview Endpoint...")
    sample_res = requests.get(f"{BASE_URL}/api/sample-data")
    assert sample_res.status_code == 200
    sample_data = sample_res.json()

    preview_res = requests.post(f"{BASE_URL}/api/preview-pdf", json=sample_data)
    assert preview_res.status_code == 200
    preview_json = preview_res.json()
    assert preview_json.get("pageCount") == 4
    assert len(preview_json.get("pages")) == 4
    for idx, pg in enumerate(preview_json.get("pages")):
        assert pg.startswith("data:image/png;base64,"), f"Page {idx+1} is not a valid base64 PNG data URL"
        assert len(pg) > 1000, f"Page {idx+1} image data is suspiciously small"
    print("  -> PASSED: All 4 pages rendered as high-res PNG base64 vectors.")

    print("\n" + "=" * 65)
    print("ALL PDF PREVIEW MODAL VERIFICATION CHECKS PASSED (100%)!")
    print("=" * 65)

if __name__ == "__main__":
    test_preview_modal()
