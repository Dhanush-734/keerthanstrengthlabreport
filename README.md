# Keerthan Strength Lab - Client Screening & Fitness Assessment Web Portal

A luxury dark obsidian & brushed gold web portal to fill out the official **Keerthan Strength Lab Client Screening & Fitness Assessment Form**, preview the rendered document in real-time, and download the official fillable PDF with 100% precision.

---

## Key Features

- 🎬 **Cinematic Brand Loading Screen**: Luxury matte-black (`#050505`) experience featuring the authentic Keerthan Strength Lab emblem, subtle rotating precision ring, ambient bloom, slow gold reveal, and interactive skip/replay controls.
- 🌓 **Dynamic Theme Switching**: Seamless toggle between Dark Obsidian (`#0B0E14`) luxury mode and Clean Atelier Light mode.
- ⚡ **Streamlined Client Intake**: Fast intake banner with live mandatory field validation badges. Only Client Full Name and Signature are mandatory; all trainer data is kept blank for in-lab coaching staff.
- ⚖️ **Interactive BMI Calculator**: Automatically computes BMI from height (cm) and weight (kg) with live category tags (*Underweight*, *Normal*, *Overweight*, *Obese*).
- 🛡️ **PAR-Q Health Clearance**: Interactive Yes/No toggles with automatic medical clearance alerts.
- ✍️ **Touch-Optimized Signature Pad**: Smooth digital signature drawing with mouse, stylus, or touch, with immediate live preview reflection.
- 👁️ **Live PDF Preview Modal**: Dual-engine vector live preview for Page 1 and Page 2 with zoom controls before downloading.
- 📥 **Instant Official PDF Generation**: Server-side PyMuPDF rendering producing print-ready, unclipped vector PDFs matching lab standards.
- 📱 **Fully Mobile Responsive**: Precision layout optimized for desktops, tablets, and smartphones.

---

## How to Run

### Method 1: Python Web Server (Recommended)

1. Open PowerShell or terminal in the project directory:
   ```powershell
   cd c:\Users\snowpiercer\Desktop\pdf
   ```

2. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

3. Launch the server:
   ```powershell
   python server.py
   ```

4. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

### Method 2: Standalone Browser Usage (Offline)

Simply open `index.html` directly in Chrome, Edge, Safari, or Firefox. Client-side PDF generation is fully supported via embedded `pdf-lib`.

---

## File Structure

- `index.html` — Responsive form interface with cinematic intro and live preview modal.
- `style.css` — Luxury design system with dark & light themes, mobile breakpoints, and keyframe animations.
- `app.js` — Client-side interaction, BMI computation, signature canvas, and preview rendering.
- `server.py` — Flask backend providing `/api/generate-pdf`, `/api/preview-pdf`, and `/api/sample-data`.
- `pdf_service.py` — PyMuPDF vector PDF generation engine.
- `build_fillable_pdf.py` — PDF template build & widget placement script.
- `requirements.txt` — Python dependencies (`Flask`, `Flask-CORS`, `PyMuPDF`, `Pillow`).
- `Keerthan_Strength_Lab_Client_Screening_Form_Fillable.pdf` — Official template PDF.
- `logo.jpg` & `logo_rounded_soft.png` — Official branding assets.
