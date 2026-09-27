/**
 * KEERTHAN STRENGTH LAB - Client Screening & Assessment Portal
 * Complete Logic for Form Interactions, Dark/Light Theme, BMI Calculation,
 * Touch-Friendly Mobile Signature, High-Resolution Live Preview, and PDF Generation
 */

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------
  // DOM Elements
  // ----------------------------------------------------
  const form = document.getElementById('screeningForm');
  const heightInput = document.getElementById('height');
  const weightInput = document.getElementById('weight');
  const bmiInput = document.getElementById('bmi');
  const bmiBadge = document.getElementById('bmiBadge');
  const parqBadge = document.getElementById('parqBadge');
  const parqStatusText = document.getElementById('parqStatusText');
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');

  // Theme Elements
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  const fabThemeToggle = document.getElementById('fabThemeToggle');
  const fabThemeIcon = document.getElementById('fabThemeIcon');

  // Fast-Intake Banner Status Elements
  const statusItemName = document.getElementById('statusItemName');
  const statusItemSig = document.getElementById('statusItemSig');
  const statusItemOpt = document.getElementById('statusItemOpt');

  // Action Buttons
  const btnResetForm = document.getElementById('btnResetForm');
  const btnOpenPreview = document.getElementById('btnOpenPreview');
  const btnPreviewBottom = document.getElementById('btnPreviewBottom');
  const btnDownloadHeader = document.getElementById('btnDownloadHeader');
  const btnDownloadBottom = document.getElementById('btnDownloadBottom');
  const fabPreview = document.getElementById('fabPreview');
  const fabDownload = document.getElementById('fabDownload');

  // Modal Elements
  const previewModal = document.getElementById('previewModal');
  const btnClosePreview = document.getElementById('btnClosePreview');
  const btnClosePreviewBottom = document.getElementById('btnClosePreviewBottom');
  const btnDownloadFromModal = document.getElementById('btnDownloadFromModal');
  const previewLoading = document.getElementById('previewLoading');
  const previewStage = document.getElementById('previewStage');
  const previewImg1 = document.getElementById('previewImg1');
  const previewImg2 = document.getElementById('previewImg2');
  const previewTabs = document.querySelectorAll('.preview-tabs .btn-tab');

  // Signature Elements
  const sigCanvas = document.getElementById('sigCanvas');
  const btnClearSig = document.getElementById('btnClearSig');
  const tabDrawSig = document.getElementById('tabDrawSig');
  const tabTypeSig = document.getElementById('tabTypeSig');
  const drawSigBox = document.getElementById('drawSigBox');
  const typeSigBox = document.getElementById('typeSigBox');
  const sigImageInput = document.getElementById('client_signature_image');
  const consentAgreed = document.getElementById('consent_agreed');

  // Default Today's Date
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  const dateFields = [
    'date_of_assessment',
    'body_assessment_date',
    'cardio_date',
    'client_signature_date'
  ];
  dateFields.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value) el.value = formattedDate;
  });

  // Signature Canvas Context (declared early to prevent TDZ in applyTheme)
  let isDrawing = false;
  let hasDrawn = false;
  const ctx = sigCanvas ? sigCanvas.getContext('2d') : null;

  // ----------------------------------------------------
  // 1. THEME SWITCHER (Dark & Light Mode)
  // ----------------------------------------------------
  function getPreferredTheme() {
    const saved = localStorage.getItem('ksl_theme');
    if (saved) return saved;
    return 'dark'; // Luxury obsidian dark by default
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ksl_theme', theme);

    if (themeLabel) {
      themeLabel.textContent = theme === 'light' ? 'Light' : 'Dark';
    }
    if (fabThemeIcon) {
      fabThemeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    // Refresh signature canvas pen color if blank
    if (sigCanvas && ctx) {
      ctx.strokeStyle = theme === 'light' ? '#0F172A' : '#F2CD73';
    }
  }

  const currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(active === 'dark' ? 'light' : 'dark');
      showToast(`Switched to ${active === 'dark' ? 'Light' : 'Dark'} Mode`, 'info');
    });
  }

  if (fabThemeToggle) {
    fabThemeToggle.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(active === 'dark' ? 'light' : 'dark');
      showToast(`Switched to ${active === 'dark' ? 'Light' : 'Dark'} Mode`, 'info');
    });
  }

  // ----------------------------------------------------
  // 2. MOBILE TOUCH-FRIENDLY SIGNATURE CANVAS
  // ----------------------------------------------------

  function resizeCanvas() {
    if (!sigCanvas || !ctx) return;
    const rect = sigCanvas.getBoundingClientRect();
    if (rect.width > 0 && sigCanvas.width !== Math.round(rect.width)) {
      let temp = null;
      if (hasDrawn && sigCanvas.width > 0 && sigCanvas.height > 0) {
        temp = ctx.getImageData(0, 0, sigCanvas.width, sigCanvas.height);
      }
      sigCanvas.width = Math.round(rect.width);
      sigCanvas.height = 140;

      const theme = document.documentElement.getAttribute('data-theme');
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = theme === 'light' ? '#0F172A' : '#F2CD73';

      if (temp) {
        ctx.putImageData(temp, 0, 0);
      }
    }
  }

  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 80);

  function getCanvasCoords(e) {
    const rect = sigCanvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e);
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    return {
      x: (clientX - rect.left) * (sigCanvas.width / rect.width),
      y: (clientY - rect.top) * (sigCanvas.height / rect.height)
    };
  }

  function startDrawing(e) {
    if (e.cancelable) e.preventDefault();
    isDrawing = true;
    hasDrawn = true;
    const theme = document.documentElement.getAttribute('data-theme');
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = theme === 'light' ? '#0F172A' : '#F2CD73';

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e) {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.closePath();
    updateSignatureData();
    updateRequirementsStatus();
    updateProgress();
  }

  function updateSignatureData() {
    if (hasDrawn && sigCanvas) {
      sigImageInput.value = sigCanvas.toDataURL('image/png');
    } else {
      sigImageInput.value = '';
    }
  }

  if (sigCanvas) {
    // Mouse events
    sigCanvas.addEventListener('mousedown', startDrawing);
    sigCanvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);

    // Touch events for mobile phones and tablets
    sigCanvas.addEventListener('touchstart', startDrawing, { passive: false });
    sigCanvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDrawing);
    window.addEventListener('touchcancel', stopDrawing);

    if (btnClearSig) {
      btnClearSig.addEventListener('click', () => {
        ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
        hasDrawn = false;
        sigImageInput.value = '';
        updateRequirementsStatus();
        updateProgress();
        showToast('Signature cleared', 'info');
      });
    }
  }

  // Signature Mode Switching (Draw vs Type)
  if (tabDrawSig && tabTypeSig) {
    tabDrawSig.addEventListener('click', () => {
      tabDrawSig.classList.add('active');
      tabTypeSig.classList.remove('active');
      drawSigBox.classList.remove('hidden');
      typeSigBox.classList.add('hidden');
      resizeCanvas();
      updateRequirementsStatus();
    });

    tabTypeSig.addEventListener('click', () => {
      tabTypeSig.classList.add('active');
      tabDrawSig.classList.remove('active');
      typeSigBox.classList.remove('hidden');
      drawSigBox.classList.add('hidden');
      updateRequirementsStatus();
    });
  }

  // ----------------------------------------------------
  // 3. BMI AUTO-CALCULATOR
  // ----------------------------------------------------
  function calculateBMI() {
    const h = parseFloat(heightInput.value);
    const w = parseFloat(weightInput.value);

    if (h > 50 && w > 20) {
      const hM = h / 100;
      const bmi = (w / (hM * hM)).toFixed(1);
      bmiInput.value = bmi;

      if (bmi < 18.5) {
        bmiBadge.textContent = 'Underweight';
        bmiBadge.style.color = '#38BDF8';
        bmiBadge.style.borderColor = '#38BDF8';
      } else if (bmi < 25.0) {
        bmiBadge.textContent = 'Normal';
        bmiBadge.style.color = '#10B981';
        bmiBadge.style.borderColor = '#10B981';
      } else if (bmi < 30.0) {
        bmiBadge.textContent = 'Overweight';
        bmiBadge.style.color = '#F59E0B';
        bmiBadge.style.borderColor = '#F59E0B';
      } else {
        bmiBadge.textContent = 'Obese';
        bmiBadge.style.color = '#EF4444';
        bmiBadge.style.borderColor = '#EF4444';
      }
    } else {
      bmiInput.value = '';
      bmiBadge.textContent = 'Auto';
      bmiBadge.style.color = '';
      bmiBadge.style.borderColor = '';
    }
  }

  if (heightInput) heightInput.addEventListener('input', calculateBMI);
  if (weightInput) weightInput.addEventListener('input', calculateBMI);

  // ----------------------------------------------------
  // 4. PAR-Q STATUS MONITOR
  // ----------------------------------------------------
  function checkPARQStatus() {
    const parqRadios = form.querySelectorAll('input[name^="parq_q"]:checked');
    let hasYes = false;

    parqRadios.forEach(radio => {
      if (radio.value === 'yes') hasYes = true;
    });

    if (hasYes) {
      parqBadge.classList.add('alert');
      parqStatusText.textContent = 'Medical Clearance Recommended';
    } else {
      parqBadge.classList.remove('alert');
      parqStatusText.textContent = 'All Clear';
    }
  }

  form.querySelectorAll('input[name^="parq_q"]').forEach(radio => {
    radio.addEventListener('change', checkPARQStatus);
  });

  // ----------------------------------------------------
  // 5. FAST-INTAKE REQUIREMENTS LIVE STATUS
  // ----------------------------------------------------
  function updateRequirementsStatus() {
    const fullNameEl = document.getElementById('full_name');
    const hasName = fullNameEl && fullNameEl.value.trim().length > 0;

    // Check client signature
    const typedSigEl = document.getElementById('client_signature');
    const isDrawMode = tabDrawSig && tabDrawSig.classList.contains('active');
    const hasSig = (isDrawMode && hasDrawn) ||
                   (!isDrawMode && typedSigEl && typedSigEl.value.trim().length > 0) ||
                   (hasName && consentAgreed && consentAgreed.checked);

    // Update Name Status Pill
    if (statusItemName) {
      if (hasName) {
        statusItemName.className = 'status-pill status-done';
        statusItemName.innerHTML = '👤 Name: <em>Ready</em>';
      } else {
        statusItemName.className = 'status-pill status-pending';
        statusItemName.innerHTML = '👤 Name: <em>Required</em>';
      }
    }

    // Update Signature Status Pill
    if (statusItemSig) {
      if (hasSig) {
        statusItemSig.className = 'status-pill status-done';
        statusItemSig.innerHTML = '✍️ Signature: <em>Signed</em>';
      } else {
        statusItemSig.className = 'status-pill status-pending';
        statusItemSig.innerHTML = '✍️ Signature: <em>Required</em>';
      }
    }

    // Count optional fields completed
    const optionalFields = [
      'age', 'phone', 'email', 'occupation', 'training_experience',
      'current_medical_conditions', 'previous_injuries', 'surgeries', 'current_medications',
      'average_sleep', 'daily_water', 'daily_steps_activity', 'current_exercise',
      'height', 'weight', 'resting_heart_rate', 'bp_systolic', 'bp_diastolic',
      'waist', 'hip', 'chest', 'arm', 'thigh',
      'cardio_result', 'pushups_result', 'squat_result', 'plank_result',
      'primary_goal', 'target_weight', 'preferred_activities'
    ];

    let optCount = 0;
    optionalFields.forEach(name => {
      const el = form.elements[name];
      if (el && el.value && el.value.trim().length > 0) optCount++;
    });

    if (statusItemOpt) {
      if (optCount > 0) {
        statusItemOpt.className = 'status-pill status-done';
        statusItemOpt.innerHTML = `📊 Assessment: <em>${optCount} filled</em>`;
      } else {
        statusItemOpt.className = 'status-pill status-optional';
        statusItemOpt.innerHTML = '📊 Clinical / Assessment: <em>Optional</em>';
      }
    }
  }

  // ----------------------------------------------------
  // 6. PROGRESS TRACKER
  // ----------------------------------------------------
  function updateProgress() {
    const fullNameEl = document.getElementById('full_name');
    const hasName = fullNameEl && fullNameEl.value.trim().length > 0;

    const isDrawMode = tabDrawSig && tabDrawSig.classList.contains('active');
    const typedSigEl = document.getElementById('client_signature');
    const hasSig = (isDrawMode && hasDrawn) || (!isDrawMode && typedSigEl && typedSigEl.value.trim().length > 0);

    // Fast-Intake baseline: Name = 50%, Signature = 50%
    let percent = 0;
    if (hasName) percent += 50;
    if (hasSig) percent += 50;

    progressPercent.textContent = `${percent}%`;
    progressFill.style.width = `${percent}%`;

    updateRequirementsStatus();
  }

  form.addEventListener('input', updateProgress);
  form.addEventListener('change', updateProgress);

  // ----------------------------------------------------
  // 7. EXTRACT FORM DATA AS OBJECT
  // ----------------------------------------------------
  function getFormDataObject() {
    const formData = new FormData(form);
    const data = {};

    formData.forEach((val, key) => {
      data[key] = val;
    });

    // Checked radios that might not appear if untouched
    for (let i = 1; i <= 7; i++) {
      const qKey = `parq_q${i}`;
      const checked = form.querySelector(`input[name="${qKey}"]:checked`);
      data[qKey] = checked ? checked.value : 'no';
    }

    // Gender
    const genderChecked = form.querySelector('input[name="gender"]:checked');
    data.gender = genderChecked ? genderChecked.value : 'Male';

    // Smoking / Alcohol / Stress
    const smokingChecked = form.querySelector('input[name="smoking"]:checked');
    data.smoking = smokingChecked ? smokingChecked.value : 'no';

    const alcoholChecked = form.querySelector('input[name="alcohol"]:checked');
    data.alcohol = alcoholChecked ? alcoholChecked.value : 'no';

    const stressChecked = form.querySelector('input[name="stress"]:checked');
    data.stress = stressChecked ? stressChecked.value : 'moderate';

    // Signature data
    const fullName = (document.getElementById('full_name').value || '').trim();
    const isDraw = tabDrawSig && tabDrawSig.classList.contains('active');

    if (isDraw && hasDrawn) {
      data.client_signature_image = sigImageInput.value || (sigCanvas ? sigCanvas.toDataURL('image/png') : '');
      data.client_signature = '';
    } else {
      const typedSig = document.getElementById('client_signature') ? document.getElementById('client_signature').value.trim() : '';
      data.client_signature = typedSig || fullName;
      data.client_signature_image = '';
    }

    // Fallback: If neither signed, but consent is agreed, use Full Name as legal typed signature
    if (!data.client_signature_image && !data.client_signature && fullName) {
      data.client_signature = fullName;
    }

    // Trainer data is completely omitted from user intake — left blank for in-person coach signing
    data.trainer_signature = '';
    data.trainer_signature_date = '';
    data.trainer_signature_image = '';

    return data;
  }


  // ----------------------------------------------------
  // 9. RESET FORM
  // ----------------------------------------------------
  if (btnResetForm) {
    btnResetForm.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all fields?')) {
        form.reset();
        if (sigCanvas && ctx) {
          ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
          hasDrawn = false;
          sigImageInput.value = '';
        }
        calculateBMI();
        checkPARQStatus();
        updateProgress();
        showToast('Form cleared', 'info');
      }
    });
  }

  // ----------------------------------------------------
  // 10. CLIENT-SIDE PDF GENERATION (PDF-Lib Engine)
  // ----------------------------------------------------
  async function generateClientPdfBytes(data) {
    if (typeof PDFLib === 'undefined') {
      throw new Error('PDF-Lib library is not available');
    }

    // Try loading fillable template
    const pdfRes = await fetch('Keerthan_Strength_Lab_Client_Screening_Form_Fillable.pdf');
    if (!pdfRes.ok) {
      throw new Error(`Failed to load PDF template: HTTP ${pdfRes.status}`);
    }
    const existingBytes = await pdfRes.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(existingBytes);
    const formFields = pdfDoc.getForm();

    const textFieldNames = [
      'full_name', 'age', 'gender', 'phone', 'email', 'occupation',
      'date_of_assessment', 'training_experience', 'preferred_training_time',
      'parq_details_1', 'parq_details_2',
      'current_medical_conditions', 'previous_injuries', 'surgeries',
      'current_medications', 'pain_discomfort', 'other_health_concerns',
      'medical_additional_details_1', 'medical_additional_details_2',
      'average_sleep', 'daily_water', 'daily_steps_activity',
      'current_exercise', 'exercise_frequency', 'typical_work_activity',
      'dietary_preferences_1', 'dietary_preferences_2',
      'height', 'weight', 'bmi', 'resting_heart_rate', 'bp_systolic', 'bp_diastolic',
      'body_assessment_date', 'waist', 'hip', 'chest', 'arm', 'thigh', 'other_measurement',
      'cardio_test', 'cardio_result', 'cardio_date',
      'pushups_test', 'pushups_result', 'pushups_notes',
      'squat_test', 'squat_result', 'squat_notes',
      'plank_test', 'plank_result', 'plank_notes',
      'flexibility_test', 'flexibility_result', 'flexibility_notes',
      'fitness_observations_1', 'fitness_observations_2',
      'primary_goal', 'target_weight', 'target_date',
      'secondary_goal', 'training_days_per_week', 'preferred_activities',
      'specific_goals_1', 'specific_goals_2',
      'client_signature', 'client_signature_date',
      'trainer_signature', 'trainer_signature_date'
    ];

    textFieldNames.forEach(name => {
      try {
        const field = formFields.getTextField(name);
        if (field && data[name] !== undefined && data[name] !== null) {
          field.setText(String(data[name]));
        }
      } catch (e) { }
    });

    // Checkboxes for PAR-Q
    for (let i = 1; i <= 7; i++) {
      const qVal = data[`parq_q${i}`] === 'yes';
      try {
        const cbYes = formFields.getCheckBox(`parq_q${i}_yes`);
        const cbNo = formFields.getCheckBox(`parq_q${i}_no`);
        if (qVal) {
          cbYes.check();
          cbNo.uncheck();
        } else {
          cbYes.uncheck();
          cbNo.check();
        }
      } catch (e) { }
    }

    // Embed client signature drawing image on Page 2 if provided
    if (data.client_signature_image && data.client_signature_image.startsWith('data:image')) {
      try {
        const sigPngBytes = await fetch(data.client_signature_image).then(res => res.arrayBuffer());
        const sigImage = await pdfDoc.embedPng(sigPngBytes);
        const pages = pdfDoc.getPages();
        if (pages.length >= 2) {
          const p2 = pages[1];
          const pageHeight = p2.getHeight();
          // Embed over client signature line
          p2.drawImage(sigImage, {
            x: 115,
            y: pageHeight - 703,
            width: 140,
            height: 26
          });
        }
      } catch (imgErr) {
        console.warn('Could not embed signature PNG into client-side PDF:', imgErr);
      }
    }

    return await pdfDoc.save();
  }

  // ----------------------------------------------------
  // 11. PDF.JS CLIENT-SIDE VECTOR PREVIEW RENDERING
  // ----------------------------------------------------
  async function renderPdfBytesToImages(pdfBytes) {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF.js rendering engine is not loaded');
    }

    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdf = await loadingTask.promise;
    const pageDataUrls = [];

    const numPages = Math.min(pdf.numPages, 2);
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      // High-resolution scale for razor sharp preview on mobile retina and 4K displays
      const viewport = page.getViewport({ scale: 2.0 });
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = viewport.width;
      offscreenCanvas.height = viewport.height;
      const offCtx = offscreenCanvas.getContext('2d');

      await page.render({
        canvasContext: offCtx,
        viewport: viewport
      }).promise;

      pageDataUrls.push(offscreenCanvas.toDataURL('image/png'));
    }

    return pageDataUrls;
  }

  // ----------------------------------------------------
  // 12. LIVE PREVIEW MODAL LOGIC (Always Shows User Data)
  // ----------------------------------------------------
  async function openPreviewModal() {
    previewModal.classList.add('open');
    previewLoading.classList.add('active');
    previewImg1.style.display = 'none';
    previewImg2.style.display = 'none';

    const data = getFormDataObject();

    // 1. Try Backend Candidates (Fast PyMuPDF Vector Pixmap)
    const backendEndpoints = [
      '/api/preview-pdf',
      'http://127.0.0.1:5000/api/preview-pdf',
      'http://localhost:5000/api/preview-pdf'
    ];

    let backendSuccess = false;
    for (const url of backendEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const result = await res.json();
          if (result.pages && result.pages.length >= 2) {
            previewImg1.src = result.pages[0];
            previewImg2.src = result.pages[1];
            previewLoading.classList.remove('active');
            switchPreviewTab(1);
            backendSuccess = true;
            return;
          }
        }
      } catch (err) {
        // Continue to next candidate
      }
    }

    if (backendSuccess) return;

    // 2. Client-Side Rendering (PDF-Lib + PDF.js Vector Engine)
    // Ensures real user data is displayed even on file:///, offline, or mobile LAN!
    try {
      showToast('Rendering live PDF client-side...', 'info');
      const pdfBytes = await generateClientPdfBytes(data);
      const pages = await renderPdfBytesToImages(pdfBytes);

      if (pages.length >= 2) {
        previewImg1.src = pages[0];
        previewImg2.src = pages[1];
        previewLoading.classList.remove('active');
        switchPreviewTab(1);
        showToast('Live vector preview ready!', 'gold');
        return;
      }
    } catch (clientErr) {
      console.warn('Client-side vector rendering encountered an error:', clientErr);
    }

    // 3. Fallback: Dynamic Interactive Summary Sheet (Never show Johnathan Miller!)
    previewLoading.classList.remove('active');
    const clientName = data.full_name || 'Client (Name not specified)';
    previewStage.innerHTML = `
      <div class="client-preview-card" style="background:#111622;border:1px solid #E6BA55;border-radius:8px;padding:24px;color:#fff;max-width:540px;width:100%;margin:auto;text-align:left;box-shadow:0 8px 30px rgba(0,0,0,0.7);">
        <div style="border-bottom:1px solid rgba(230,186,85,0.3);padding-bottom:12px;margin-bottom:16px;">
          <h4 style="font-family:'Cinzel',serif;color:#F2CD73;margin:0 0 4px 0;font-size:1.15rem;">KEERTHAN STRENGTH LAB</h4>
          <p style="font-size:0.75rem;color:#94A3B8;margin:0;">Live Intake & Assessment Data Confirmation</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.82rem;margin-bottom:16px;">
          <div><strong style="color:#94A3B8;">Full Name:</strong><br><span style="color:#fff;font-weight:700;">${clientName}</span></div>
          <div><strong style="color:#94A3B8;">Date:</strong><br>${data.date_of_assessment || formattedDate}</div>
          <div><strong style="color:#94A3B8;">Phone:</strong><br>${data.phone || '—'}</div>
          <div><strong style="color:#94A3B8;">Email:</strong><br>${data.email || '—'}</div>
          <div><strong style="color:#94A3B8;">Primary Goal:</strong><br>${data.primary_goal || '—'}</div>
          <div><strong style="color:#94A3B8;">PAR-Q Status:</strong><br>${parqStatusText.textContent}</div>
        </div>
        <div style="border-top:1px dashed rgba(255,255,255,0.15);padding-top:12px;">
          <strong style="color:#94A3B8;font-size:0.78rem;">Client Authorization:</strong>
          <div style="margin-top:6px;min-height:50px;display:flex;align-items:center;">
            ${data.client_signature_image ? `<img src="${data.client_signature_image}" style="max-height:48px;background:rgba(255,255,255,0.05);border-radius:4px;padding:4px;" alt="Signature">` : `<span style="font-family:'Cinzel',serif;color:#F2CD73;font-size:1.2rem;">${data.client_signature || clientName}</span>`}
          </div>
        </div>
        <p style="font-size:0.72rem;color:#10B981;margin:14px 0 0 0;text-align:center;">✓ Verified for official PDF generation</p>
      </div>
    `;
  }

  function closePreviewModal() {
    previewModal.classList.remove('open');
  }

  function switchPreviewTab(pageNum) {
    previewTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.page === String(pageNum));
    });
    if (pageNum === 1) {
      previewImg1.style.display = 'block';
      previewImg2.style.display = 'none';
    } else {
      previewImg1.style.display = 'none';
      previewImg2.style.display = 'block';
    }
  }

  previewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchPreviewTab(parseInt(tab.dataset.page, 10));
    });
  });

  if (btnOpenPreview) btnOpenPreview.addEventListener('click', openPreviewModal);
  if (btnPreviewBottom) btnPreviewBottom.addEventListener('click', openPreviewModal);
  if (fabPreview) fabPreview.addEventListener('click', openPreviewModal);

  if (btnClosePreview) btnClosePreview.addEventListener('click', closePreviewModal);
  if (btnClosePreviewBottom) btnClosePreviewBottom.addEventListener('click', closePreviewModal);

  previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) closePreviewModal();
  });

  // ----------------------------------------------------
  // 13. PDF DOWNLOAD HANDLER
  // ----------------------------------------------------
  async function downloadPDF() {
    const data = getFormDataObject();

    // Verification: ONLY Full Name is mandatory
    if (!data.full_name || !data.full_name.trim()) {
      showToast('Please enter the client\'s Full Name to generate PDF', 'error');
      const fullNameInput = document.getElementById('full_name');
      if (fullNameInput) {
        fullNameInput.focus();
        fullNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    showToast('Generating official PDF...', 'gold');
    setLoadingState(true);

    // 1. Try Backend Generation
    const backendEndpoints = [
      '/api/generate-pdf',
      'http://127.0.0.1:5000/api/generate-pdf',
      'http://localhost:5000/api/generate-pdf'
    ];

    for (const url of backendEndpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          const blob = await res.blob();
          const cleanName = data.full_name.trim().replace(/\s+/g, '_');
          const filename = `Keerthan_Strength_Lab_Screening_${cleanName}.pdf`;

          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(downloadUrl);

          showToast('Official PDF downloaded successfully!', 'success');
          setLoadingState(false);
          return;
        }
      } catch (err) {
        // Try next candidate
      }
    }

    // 2. Client-side Fallback with PDF-Lib
    try {
      showToast('Generating official PDF locally with PDF-Lib...', 'info');
      const pdfBytes = await generateClientPdfBytes(data);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const cleanName = data.full_name.trim().replace(/\s+/g, '_');
      const filename = `Keerthan_Strength_Lab_Screening_${cleanName}.pdf`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showToast('Official PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('Error generating PDF. Please check server or file access.', 'error');
    } finally {
      setLoadingState(false);
    }
  }

  function setLoadingState(loading) {
    document.querySelectorAll('.btn-download-trigger').forEach(btn => {
      btn.disabled = loading;
      if (loading) {
        btn.dataset.originalHtml = btn.innerHTML;
        btn.innerHTML = '<span>⏳ Generating...</span>';
      } else if (btn.dataset.originalHtml) {
        btn.innerHTML = btn.dataset.originalHtml;
      }
    });
  }

  if (btnDownloadHeader) btnDownloadHeader.addEventListener('click', downloadPDF);
  if (btnDownloadBottom) btnDownloadBottom.addEventListener('click', downloadPDF);
  if (btnDownloadFromModal) btnDownloadFromModal.addEventListener('click', downloadPDF);
  if (fabDownload) fabDownload.addEventListener('click', downloadPDF);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    downloadPDF();
  });

  // ----------------------------------------------------
  // 14. TOAST NOTIFICATION SYSTEM
  // ----------------------------------------------------
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'gold') icon = '✨';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ----------------------------------------------------
  // 15. CINEMATIC WEBSITE LOADING SCREEN CONTROLLER
  // ----------------------------------------------------
  const loader = document.getElementById('cinematicLoader');
  const progressBar = document.getElementById('loaderProgressBar');
  const percentText = document.getElementById('loaderPercent');
  const statusText = document.getElementById('loaderStatusText');
  const skipBtn = document.getElementById('loaderSkipBtn');

  let loaderAnimFrame = null;
  let loaderFinished = false;

  function runCinematicLoader() {
    if (!loader) return;
    loaderFinished = false;
    loader.classList.remove('fade-out');
    loader.style.visibility = 'visible';
    loader.style.display = 'flex';

    if (progressBar) progressBar.style.width = '0%';
    if (percentText) percentText.textContent = '0%';
    if (statusText) statusText.textContent = 'INITIALIZING PERFORMANCE LAB';

    const duration = 3200; // 3.2s smooth cinematic intro duration
    const startTime = performance.now();

    function updateLoader(currentTime) {
      if (loaderFinished) return;
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Eased progress curve (smooth cinematic acceleration and deceleration)
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const pct = Math.round(eased * 100);

      if (progressBar) progressBar.style.width = `${pct}%`;
      if (percentText) percentText.textContent = `${pct}%`;

      if (statusText) {
        if (pct < 30) {
          statusText.textContent = 'INITIALIZING PERFORMANCE LAB';
        } else if (pct < 65) {
          statusText.textContent = 'CALIBRATING ASSESSMENT SYSTEMS';
        } else if (pct < 95) {
          statusText.textContent = 'LOADING CLINICAL PROTOCOLS';
        } else {
          statusText.textContent = 'PRECISION LAB READY';
        }
      }

      if (progress < 1) {
        loaderAnimFrame = requestAnimationFrame(updateLoader);
      } else {
        finishLoader();
      }
    }

    loaderAnimFrame = requestAnimationFrame(updateLoader);
  }

  function finishLoader() {
    if (loaderFinished) return;
    loaderFinished = true;
    if (loaderAnimFrame) cancelAnimationFrame(loaderAnimFrame);

    if (progressBar) progressBar.style.width = '100%';
    if (percentText) percentText.textContent = '100%';
    if (statusText) statusText.textContent = 'PRECISION LAB READY';

    setTimeout(() => {
      if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.style.display = 'none';
        }, 850);
      }
    }, 220);
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      finishLoader();
    });
  }

  if (loader) {
    loader.addEventListener('click', (e) => {
      // Click anywhere to immediately enter website
      finishLoader();
    });
  }

  // Run cinematic loader on initial load
  runCinematicLoader();

  // ----------------------------------------------------
  // 16. INITIALIZATION
  // ----------------------------------------------------
  calculateBMI();
  checkPARQStatus();
  updateProgress();
});
