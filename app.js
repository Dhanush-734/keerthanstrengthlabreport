/**
 * KEERTHAN STRENGTH LAB - Client Assessment Dossier Portal
 * Clean client-facing form logic:
 * 1. Client Screening Intake & Demographics
 * 2. 10-Question PAR-Q Safety Screener & Physician Alerts
 * 3. Compact Exercise Barriers & Adherence Strategies
 * 4. Client Notes & Personal Considerations (Free-form multiline)
 * 5. Initial Assessment (Read-Only display for client)
 * 6. Digital Touch/Mouse Signature Pad & Typed Mode
 * 7. Live BMI Calculator & Cross-Section Name Synchronization
 * 8. 4-Page Live Vector PDF Preview Modal
 * 9. Official Signed Dossier PDF Generation & Download
 */

document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------------------
  // DOM Elements
  // ----------------------------------------------------
  const form = document.getElementById('screeningForm');
  const clientNameInput = document.getElementById('client_name');
  const parqClientNameInput = document.getElementById('parq_client_name');
  const assessClientNameInput = document.getElementById('assessment_client_name');

  const learnerNameInput = document.getElementById('learner_name');
  const instructorNameInput = document.getElementById('instructor_name');

  const screeningDateInput = document.getElementById('screening_date');
  const parqDateInput = document.getElementById('parq_date');
  const assessDateInput = document.getElementById('assessment_date');
  const clientSigDateInput = document.getElementById('client_signature_date');

  const heightInput = document.getElementById('height');
  const weightInput = document.getElementById('weight');
  const bmiDisplay = document.getElementById('bmiDisplay');
  const bmiBadge = document.getElementById('bmiBadge');
  const clientNotesInput = document.getElementById('client_notes');

  // Progress Bar
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');

  // Initial Assessment Section (Read-Only)
  const secAssessment = document.getElementById('sec-assessment');
  const chosenTestsInput = document.getElementById('chosen_tests');

  // Action Buttons
  const btnSampleData = document.getElementById('btnSampleData');
  const btnResetForm = document.getElementById('btnResetForm');
  const btnOpenPreview = document.getElementById('btnOpenPreview');
  const btnPreviewBottom = document.getElementById('btnPreviewBottom');
  const btnDownloadHeader = document.getElementById('btnDownloadHeader');
  const btnDownloadBottom = document.getElementById('btnDownloadBottom');
  const fabPreview = document.getElementById('fabPreview');
  const fabDownload = document.getElementById('fabDownload');

  // Theme Elements
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  const fabThemeToggle = document.getElementById('fabThemeToggle');
  const fabThemeIcon = document.getElementById('fabThemeIcon');

  // 4-Page Preview Modal Elements
  const previewModal = document.getElementById('previewModal');
  const btnClosePreview = document.getElementById('btnClosePreview');
  const btnClosePreviewBottom = document.getElementById('btnClosePreviewBottom');
  const btnDownloadFromModal = document.getElementById('btnDownloadFromModal');
  const previewLoading = document.getElementById('previewLoading');
  const previewStage = document.getElementById('previewStage');
  const previewImg1 = document.getElementById('previewImg1');
  const previewImg2 = document.getElementById('previewImg2');
  const previewImg3 = document.getElementById('previewImg3');
  const previewImg4 = document.getElementById('previewImg4');
  const previewTabs = document.querySelectorAll('.preview-tabs .btn-tab');

  // Signature Elements
  const sigCanvas = document.getElementById('sigCanvas');
  const btnClearSig = document.getElementById('btnClearSig');
  const tabDrawSig = document.getElementById('tabDrawSig');
  const tabTypeSig = document.getElementById('tabTypeSig');
  const drawSigBox = document.getElementById('drawSigBox');
  const typeSigBox = document.getElementById('typeSigBox');
  const sigImageInput = document.getElementById('client_signature_image');

  // Initialize Today's Date
  const today = new Date();
  const formattedToday = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  [screeningDateInput, parqDateInput, assessDateInput, clientSigDateInput].forEach(el => {
    if (el && !el.value) el.value = formattedToday;
  });

  // ----------------------------------------------------
  // 1. THEME MANAGEMENT
  // ----------------------------------------------------
  function getPreferredTheme() {
    return localStorage.getItem('ksl_theme') || 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ksl_theme', theme);

    if (themeLabel) themeLabel.textContent = theme === 'light' ? 'Light' : 'Dark';
    if (fabThemeIcon) fabThemeIcon.textContent = theme === 'light' ? '🌙' : '☀️';

    if (sigCanvas) {
      const ctx = sigCanvas.getContext('2d');
      ctx.strokeStyle = theme === 'light' ? '#0F172A' : '#F2CD73';
    }
  }

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme') || 'dark';
      const target = active === 'dark' ? 'light' : 'dark';
      applyTheme(target);
      showToast(`Switched to ${target === 'light' ? 'Light' : 'Dark'} Mode`, 'info');
    });
  }

  if (fabThemeToggle) {
    fabThemeToggle.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme') || 'dark';
      const target = active === 'dark' ? 'light' : 'dark';
      applyTheme(target);
      showToast(`Switched to ${target === 'light' ? 'Light' : 'Dark'} Mode`, 'info');
    });
  }

  // ----------------------------------------------------
  // 2. READ-ONLY LOCKING FOR INITIAL ASSESSMENT
  // ----------------------------------------------------
  function lockInitialAssessmentReadOnly() {
    if (!secAssessment) return;
    const inputs = secAssessment.querySelectorAll('input, textarea');
    inputs.forEach(inp => {
      inp.readOnly = true;
      inp.tabIndex = -1;
    });

    const chips = secAssessment.querySelectorAll('.test-chip');
    chips.forEach(chip => {
      chip.tabIndex = -1;
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }

  lockInitialAssessmentReadOnly();

  // ----------------------------------------------------
  // 3. NAME SYNCHRONIZATION ACROSS SECTIONS
  // ----------------------------------------------------
  if (clientNameInput) {
    clientNameInput.addEventListener('input', () => {
      const val = clientNameInput.value.trim();
      if (parqClientNameInput) parqClientNameInput.value = val;
      if (assessClientNameInput) assessClientNameInput.value = val;
      updateProgress();
    });
  }

  // ----------------------------------------------------
  // 4. BMI LIVE CALCULATION
  // ----------------------------------------------------
  function calculateBMI() {
    if (!heightInput || !weightInput || !bmiDisplay || !bmiBadge) return;

    const rawHeight = heightInput.value.trim().replace(/[^0-9.]/g, '');
    const rawWeight = weightInput.value.trim().replace(/[^0-9.]/g, '');

    const h = parseFloat(rawHeight);
    const w = parseFloat(rawWeight);

    if (h > 50 && w > 20) {
      const hM = h / 100;
      const bmi = (w / (hM * hM)).toFixed(1);
      bmiDisplay.textContent = bmi;

      let category = '';
      let badgeClass = '';

      if (bmi < 18.5) {
        category = 'UNDERWEIGHT';
        badgeClass = 'badge-underweight';
      } else if (bmi <= 24.9) {
        category = 'NORMAL WEIGHT';
        badgeClass = 'badge-normal';
      } else if (bmi <= 29.9) {
        category = 'OVERWEIGHT';
        badgeClass = 'badge-overweight';
      } else {
        category = 'OBESE';
        badgeClass = 'badge-obese';
      }

      bmiBadge.textContent = category;
      bmiBadge.className = `badge-bmi ${badgeClass}`;
    } else {
      bmiDisplay.textContent = '--';
      bmiBadge.textContent = 'AWAITING METRICS';
      bmiBadge.className = 'badge-bmi';
    }
  }

  if (heightInput) heightInput.addEventListener('input', calculateBMI);
  if (weightInput) weightInput.addEventListener('input', calculateBMI);

  // ----------------------------------------------------
  // 5. PAR-Q QUESTION CHECKER
  // ----------------------------------------------------
  function checkPARQStatus() {
    // Status banner & badge strip removed per user request
  }

  const parqRadios = document.querySelectorAll('.parq-radio');
  parqRadios.forEach(r => {
    r.addEventListener('change', () => {
      checkPARQStatus();
      updateProgress();
    });
  });

  // ----------------------------------------------------
  // 6. SIGNATURE CANVAS & TYPED MODE
  // ----------------------------------------------------
  let isDrawing = false;
  let hasDrawn = false;
  let sigCtx = null;

  if (sigCanvas) {
    sigCtx = sigCanvas.getContext('2d');
    const resizeCanvas = () => {
      const rect = sigCanvas.getBoundingClientRect();
      if (rect.width > 0) {
        sigCanvas.width = 600;
        sigCanvas.height = 130;
        sigCtx.lineWidth = 2.5;
        sigCtx.lineCap = 'round';
        sigCtx.lineJoin = 'round';
        const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        sigCtx.strokeStyle = activeTheme === 'light' ? '#0F172A' : '#F2CD73';
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const getCanvasCoords = (e) => {
      const rect = sigCanvas.getBoundingClientRect();
      const scaleX = sigCanvas.width / rect.width;
      const scaleY = sigCanvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const startDrawing = (e) => {
      isDrawing = true;
      hasDrawn = true;
      const { x, y } = getCanvasCoords(e);
      sigCtx.beginPath();
      sigCtx.moveTo(x, y);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      if (e.cancelable) e.preventDefault();
      const { x, y } = getCanvasCoords(e);
      sigCtx.lineTo(x, y);
      sigCtx.stroke();
    };

    const stopDrawing = () => {
      if (!isDrawing) return;
      isDrawing = false;
      sigCtx.closePath();
      if (sigImageInput) sigImageInput.value = sigCanvas.toDataURL('image/png');
      updateProgress();
    };

    sigCanvas.addEventListener('mousedown', startDrawing);
    sigCanvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);

    sigCanvas.addEventListener('touchstart', startDrawing, { passive: false });
    sigCanvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDrawing);
  }

  if (btnClearSig) {
    btnClearSig.addEventListener('click', () => {
      if (sigCtx && sigCanvas) {
        sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
        hasDrawn = false;
        if (sigImageInput) sigImageInput.value = '';
        updateProgress();
      }
    });
  }

  if (tabDrawSig && tabTypeSig) {
    tabDrawSig.addEventListener('click', () => {
      tabDrawSig.classList.add('active');
      tabTypeSig.classList.remove('active');
      if (drawSigBox) drawSigBox.classList.remove('hidden');
      if (typeSigBox) typeSigBox.classList.add('hidden');
    });

    tabTypeSig.addEventListener('click', () => {
      tabTypeSig.classList.add('active');
      tabDrawSig.classList.remove('active');
      if (typeSigBox) typeSigBox.classList.remove('hidden');
      if (drawSigBox) drawSigBox.classList.add('hidden');
    });
  }

  // ----------------------------------------------------
  // 7. DOSSIER COMPLETION PROGRESS
  // ----------------------------------------------------
  function updateProgress() {
    let totalScore = 0;

    // Client profile
    const nameVal = clientNameInput ? clientNameInput.value.trim() : '';
    if (nameVal) totalScore += 25;

    // Demographics
    const hVal = heightInput ? heightInput.value.trim() : '';
    const wVal = weightInput ? weightInput.value.trim() : '';
    if (hVal && wVal) totalScore += 15;

    // PAR-Q 10 questions answered
    let answeredParq = 0;
    for (let i = 1; i <= 10; i++) {
      const radios = document.getElementsByName(`parq_q${i}`);
      for (const r of radios) {
        if (r.checked) answeredParq++;
      }
    }
    if (answeredParq === 10) totalScore += 30;

    // Signature
    const isTyped = tabTypeSig && tabTypeSig.classList.contains('active');
    const typedSigVal = document.getElementById('client_signature') ? document.getElementById('client_signature').value.trim() : '';
    const hasSig = (isTyped && typedSigVal.length > 2) || (!isTyped && hasDrawn);
    if (hasSig) totalScore += 30;

    if (totalScore > 100) totalScore = 100;

    if (progressFill) progressFill.style.width = `${totalScore}%`;
    if (progressPercent) progressPercent.textContent = `${totalScore}%`;
  }

  // ----------------------------------------------------
  // 8. DATA EXTRACTION FOR PDF PREVIEW & EXPORT
  // ----------------------------------------------------
  function getFormDataObject() {
    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    const clientName = clientNameInput ? clientNameInput.value.trim() : '';
    data.client_name = clientName;
    data.full_name = clientName;
    data.parq_client_name = clientName;
    data.assessment_client_name = clientName;

    // Ensure dates are populated
    const todayStr = screeningDateInput ? screeningDateInput.value.trim() : formattedToday;
    data.screening_date = todayStr;
    data.parq_date = todayStr;
    data.assessment_date = todayStr;
    data.client_signature_date = (clientSigDateInput ? clientSigDateInput.value.trim() : todayStr) || todayStr;
    data.parq_signature_date = data.client_signature_date;

    // Client Notes
    data.client_notes = clientNotesInput ? clientNotesInput.value.trim() : '';

    // Chosen Tests (from active chips in assessment section)
    const activeChips = document.querySelectorAll('.test-chip.active');
    const selected = [];
    activeChips.forEach(chip => {
      const t = chip.getAttribute('data-test');
      if (t) selected.push(t);
    });
    data.chosen_tests = selected;

    // Assessment record values (read-only defaults)
    const assessFields = [
      'instructor_name', 'bp_results', 'bp_reasons',
      'anthro_results', 'anthro_reasons',
      'body_comp_results', 'body_comp_reasons',
      'muscular_results', 'muscular_reasons',
      'cardio_results', 'cardio_reasons',
      'rom_results', 'rom_reasons',
      'posture_results', 'posture_reasons'
    ];
    assessFields.forEach(f => {
      const el = document.getElementById(f);
      if (el) data[f] = el.value.trim();
    });

    // Signature data
    const isDraw = tabDrawSig && tabDrawSig.classList.contains('active');
    if (isDraw && hasDrawn) {
      data.client_signature_image = sigImageInput ? sigImageInput.value : (sigCanvas ? sigCanvas.toDataURL('image/png') : '');
      data.client_signature = '';
    } else {
      const typedSig = document.getElementById('client_signature') ? document.getElementById('client_signature').value.trim() : '';
      data.client_signature = typedSig || clientName;
      data.client_signature_image = '';
    }

    return data;
  }

  // ----------------------------------------------------
  // 9. POPULATE FORM HELPERS
  // ----------------------------------------------------
  function populateFormFromClientData(data) {
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('parq_q') && typeof value === 'string') {
        const radios = document.getElementsByName(key);
        radios.forEach(r => {
          r.checked = (r.value.toLowerCase() === value.toLowerCase());
        });
        continue;
      }

      if (key === 'chosen_tests' && Array.isArray(value)) {
        const allChips = document.querySelectorAll('.test-chip');
        allChips.forEach(c => {
          const t = c.getAttribute('data-test');
          if (value.includes(t)) {
            c.classList.add('active');
          } else {
            c.classList.remove('active');
          }
        });
        if (chosenTestsInput) chosenTestsInput.value = value.join(',');
        continue;
      }

      const input = document.getElementById(key);
      if (input && value !== null && value !== undefined) {
        input.value = value;
      }
    }

    const cName = data.client_name || data.full_name || '';
    if (clientNameInput) clientNameInput.value = cName;
    if (parqClientNameInput) parqClientNameInput.value = cName;
    if (assessClientNameInput) assessClientNameInput.value = cName;

    calculateBMI();
    checkPARQStatus();
    updateProgress();
    lockInitialAssessmentReadOnly();
  }

  // ----------------------------------------------------
  // 10. SAMPLE DATA AUTO-FILL
  // ----------------------------------------------------
  async function fillSampleData() {
    try {
      let sample = null;
      try {
        const res = await fetch('/api/sample-data');
        if (res.ok) sample = await res.json();
      } catch (err) { }

      if (!sample) {
        sample = {
          learner_name: 'Keerthan (Master Trainer)',
          screening_date: formattedToday,
          client_name: 'Alex Morgan',
          gender: 'Female',
          height: '168',
          weight: '64',
          age: '28',
          health_risk_factors: 'No major cardiovascular risks. Occasional lower back tightness after prolonged desk sitting.',
          medical_history: 'Sprained right ankle during college track in 2021 (fully rehabilitated). No surgical history.',
          medications: 'Daily multivitamin, Omega-3 fish oil, Vitamin D3.',
          occupation: 'Senior UX Designer (Desk-bound, 8 hrs/day)',
          time_availability: '3 to 4 days/week, weekday mornings (6:30 AM - 7:45 AM)',
          lifestyle_summary: 'Balanced Mediterranean whole food diet, 7-8 hours sleep per night. Tracks 2.5L water intake daily. Non-smoker.',
          activity_level: 'MEDIUM',
          training_history: '2 years recreational Pilates and dumbbell workouts at home. Wants structured barbell & hypertrophy programming.',
          exercise_contraindications: 'Avoid heavy unguided spinal loading initially; focus on core engagement and glute activation.',
          exercise_likes: 'Squats, deadlifts, kettlebell swings, rowing machine, mobility flows.',
          exercise_dislikes: 'Long steady-state treadmill running, burpees, heavy overhead military presses.',
          parq_q1: 'no', parq_q2: 'no', parq_q3: 'no', parq_q4: 'no', parq_q5: 'no',
          parq_q6: 'no', parq_q7: 'no', parq_q8: 'no', parq_q9: 'no', parq_q10: 'no',
          client_signature: 'Alex Morgan',
          exercise_barriers: 'High workload deadlines during sprint weeks. Afternoon fatigue and lack of accountability when training alone.',
          overcome_strategies: 'Schedule fixed morning training slots before work. Pre-pack gym bag evening prior. Shared weekly check-ins with trainer.',
          attitude_motivation_summary: 'Highly driven and goal-oriented. Motivated by physical strength gains, better posture, and energy levels for demanding tech career.',
          client_notes: 'Primary goal is preparing for an autumn half-marathon while improving thoracic mobility and lower back stability. Prefer 7 AM sessions.'
        };
      }

      populateFormFromClientData(sample);
      showToast('Populated authentic sample assessment intake data', 'success');
    } catch (e) {
      console.error('Sample data error:', e);
      showToast('Error populating sample data', 'error');
    }
  }

  if (btnSampleData) {
    btnSampleData.addEventListener('click', fillSampleData);
  }

  // ----------------------------------------------------
  // 11. RESET FORM
  // ----------------------------------------------------
  if (btnResetForm) {
    btnResetForm.addEventListener('click', () => {
      if (confirm('Clear client fields across the form?')) {
        form.reset();
        if (sigCtx && sigCanvas) {
          sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
          hasDrawn = false;
        }
        calculateBMI();
        checkPARQStatus();
        updateProgress();
        lockInitialAssessmentReadOnly();
        showToast('Form cleared', 'info');
      }
    });
  }

  // ----------------------------------------------------
  // 12. LIVE PREVIEW MODAL
  // ----------------------------------------------------
  async function openLivePreview() {
    if (!previewModal) return;
    previewModal.classList.add('show');
    previewModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (previewLoading) previewLoading.style.display = 'flex';
    if (previewStage) previewStage.style.opacity = '0.3';

    try {
      const data = getFormDataObject();

      let pages = null;
      try {
        const res = await fetch('/api/preview-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const json = await res.json();
          pages = json.pages;
        }
      } catch (srvErr) {
        console.warn('Server preview endpoint unavailable, attempting fallback:', srvErr);
      }

      if (pages && pages.length >= 4) {
        if (previewImg1) previewImg1.src = pages[0];
        if (previewImg2) previewImg2.src = pages[1];
        if (previewImg3) previewImg3.src = pages[2];
        if (previewImg4) previewImg4.src = pages[3];
      } else {
        if (previewImg1) previewImg1.src = 'verify_filled_page1.png';
        if (previewImg2) previewImg2.src = 'verify_filled_page2.png';
        if (previewImg3) previewImg3.src = 'verify_filled_page3.png';
        if (previewImg4) previewImg4.src = 'verify_filled_page4.png';
      }

      if (previewLoading) previewLoading.style.display = 'none';
      if (previewStage) previewStage.style.opacity = '1';
    } catch (err) {
      console.error('Preview error:', err);
      if (previewLoading) previewLoading.style.display = 'none';
      showToast('Could not generate preview: ' + err.message, 'error');
    }
  }

  function closeLivePreview() {
    if (!previewModal) return;
    previewModal.classList.remove('show');
    previewModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnOpenPreview) btnOpenPreview.addEventListener('click', openLivePreview);
  if (btnPreviewBottom) btnPreviewBottom.addEventListener('click', openLivePreview);
  if (fabPreview) fabPreview.addEventListener('click', openLivePreview);

  if (btnClosePreview) btnClosePreview.addEventListener('click', closeLivePreview);
  if (btnClosePreviewBottom) btnClosePreviewBottom.addEventListener('click', closeLivePreview);

  previewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      previewTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const pageNum = tab.getAttribute('data-page');

      const allImgs = [previewImg1, previewImg2, previewImg3, previewImg4];
      allImgs.forEach((img, idx) => {
        if (img) {
          if (idx + 1 === parseInt(pageNum, 10)) {
            img.classList.add('active');
          } else {
            img.classList.remove('active');
          }
        }
      });
    });
  });

  // ----------------------------------------------------
  // 13. DOWNLOAD OFFICIAL PDF
  // ----------------------------------------------------
  async function downloadPDF() {
    const data = getFormDataObject();
    if (!data.client_name) {
      showToast('Please enter the Client Name before exporting', 'error');
      if (clientNameInput) clientNameInput.focus();
      return;
    }

    showToast('Compiling official Keerthan Strength Lab Dossier PDF...', 'info');

    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = data.client_name.replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `Keerthan_Strength_Lab_Assessment_${cleanName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Downloaded official PDF successfully!', 'success');
    } catch (err) {
      console.warn('Backend download failed, downloading offline fillable template:', err);
      const a = document.createElement('a');
      a.href = 'Keerthan_Strength_Lab_Client_Screening_Form_Fillable.pdf';
      a.download = 'Keerthan_Strength_Lab_Client_Screening_Form_Fillable.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Downloaded official fillable PDF template', 'info');
    }
  }

  if (btnDownloadHeader) btnDownloadHeader.addEventListener('click', downloadPDF);
  if (btnDownloadBottom) {
    btnDownloadBottom.addEventListener('click', (e) => {
      e.preventDefault();
      downloadPDF();
    });
  }
  if (btnDownloadFromModal) btnDownloadFromModal.addEventListener('click', downloadPDF);
  if (fabDownload) fabDownload.addEventListener('click', downloadPDF);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    downloadPDF();
  });

  // ----------------------------------------------------
  // 14. CINEMATIC LOADER
  // ----------------------------------------------------
  const loader = document.getElementById('cinematicLoader');
  const loaderProgressBar = document.getElementById('loaderProgressBar');
  const loaderPercent = document.getElementById('loaderPercent');
  const loaderSkipBtn = document.getElementById('loaderSkipBtn');

  if (loader) {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 20) + 10;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          loader.classList.add('loader-exit');
          setTimeout(() => {
            loader.style.display = 'none';
          }, 600);
        }, 200);
      }
      if (loaderProgressBar) loaderProgressBar.style.width = `${p}%`;
      if (loaderPercent) loaderPercent.textContent = `${p}%`;
    }, 70);

    if (loaderSkipBtn) {
      loaderSkipBtn.addEventListener('click', () => {
        clearInterval(interval);
        loader.classList.add('loader-exit');
        setTimeout(() => {
          loader.style.display = 'none';
        }, 300);
      });
    }
  }

  // ----------------------------------------------------
  // 15. TOAST NOTIFICATIONS
  // ----------------------------------------------------
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : (type === 'warning' ? '⚠️' : 'ℹ️'));
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ----------------------------------------------------
  // 16. SECTION NAVIGATION SCROLLSPY & SMOOTH SCROLL
  // ----------------------------------------------------
  const navItems = document.querySelectorAll('.section-nav .nav-item');
  const cardSections = document.querySelectorAll('.card-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = item.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          navItems.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 180;
    cardSections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navItems.forEach(item => {
        if (item.getAttribute('href') === `#${currentId}`) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  }, { passive: true });

  // Initial UI state setup
  calculateBMI();
  checkPARQStatus();
  updateProgress();
  lockInitialAssessmentReadOnly();
});
