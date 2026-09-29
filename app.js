/**
 * KEERTHAN STRENGTH LAB - 4-Stage Assessment Dossier Portal
 * Logic for:
 * 1. Client Screening Intake & Demographics
 * 2. 10-Question PAR-Q Safety Screener & Physician Alerts
 * 3. Exercise Barriers & Adherence Strategies
 * 4. Initial Assessment Record with Interactive Test Selector Chips (Min 3 required)
 * 5. Digital Touch/Mouse Signature Pad & Typed Fallback
 * 6. Live BMI Calculator & Cross-Section Data Synchronization
 * 7. 4-Page Live Vector PDF Preview Modal
 * 8. Server-Side & Offline Client-Side PDF Generation
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
  const anthroResultsInput = document.getElementById('anthro_results');

  // Status Badges
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  const statusItemClient = document.getElementById('statusItemClient');
  const statusItemParq = document.getElementById('statusItemParq');
  const statusItemTests = document.getElementById('statusItemTests');
  const statusItemSig = document.getElementById('statusItemSig');
  const chosenTestsCount = document.getElementById('chosenTestsCount');

  // PAR-Q Banner Elements
  const parqStatusBanner = document.getElementById('parqStatusBanner');
  const parqIcon = document.getElementById('parqIcon');
  const parqTitle = document.getElementById('parqTitle');
  const parqSubtitle = document.getElementById('parqSubtitle');

  // Test Selection Elements
  const testChips = document.querySelectorAll('.test-chip');
  const chosenTestsInput = document.getElementById('chosen_tests');
  const testSelectionBadge = document.getElementById('testSelectionBadge');
  const badgeCountDisplay = document.getElementById('badgeCountDisplay');

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
  // 2. DATA SYNCHRONIZATION ACROSS SECTIONS
  // ----------------------------------------------------
  if (clientNameInput) {
    clientNameInput.addEventListener('input', () => {
      const name = clientNameInput.value.trim();
      if (parqClientNameInput) parqClientNameInput.value = name;
      if (assessClientNameInput) assessClientNameInput.value = name;
      updateProgress();
    });
  }

  if (learnerNameInput) {
    learnerNameInput.addEventListener('input', () => {
      if (instructorNameInput) instructorNameInput.value = learnerNameInput.value.trim();
    });
  }

  if (screeningDateInput) {
    screeningDateInput.addEventListener('input', () => {
      const d = screeningDateInput.value.trim();
      if (parqDateInput) parqDateInput.value = d;
      if (assessDateInput) assessDateInput.value = d;
      if (clientSigDateInput) clientSigDateInput.value = d;
    });
  }

  // ----------------------------------------------------
  // 3. BMI AUTO-CALCULATOR
  // ----------------------------------------------------
  function calculateBMI() {
    if (!heightInput || !weightInput) return;
    const hRaw = parseFloat(heightInput.value.replace(/[^\d.]/g, ''));
    const wRaw = parseFloat(weightInput.value.replace(/[^\d.]/g, ''));

    if (hRaw > 50 && wRaw > 20) {
      const hM = hRaw / 100.0;
      const bmi = (wRaw / (hM * hM)).toFixed(1);
      if (bmiDisplay) bmiDisplay.textContent = bmi;

      let category = 'Normal';
      let badgeClass = 'badge-bmi bmi-normal';
      if (bmi < 18.5) {
        category = 'Underweight';
        badgeClass = 'badge-bmi';
      } else if (bmi < 25.0) {
        category = 'Normal Weight';
        badgeClass = 'badge-bmi bmi-normal';
      } else if (bmi < 30.0) {
        category = 'Overweight';
        badgeClass = 'badge-bmi bmi-overweight';
      } else {
        category = 'Obese';
        badgeClass = 'badge-bmi bmi-obese';
      }

      if (bmiBadge) {
        bmiBadge.className = badgeClass;
        bmiBadge.textContent = category;
      }

      // Auto-suggest in anthropometrics if empty
      if (anthroResultsInput && (!anthroResultsInput.value || anthroResultsInput.value.startsWith('BMI:'))) {
        anthroResultsInput.value = `BMI: ${bmi} (${category})`;
      }
    } else {
      if (bmiDisplay) bmiDisplay.textContent = '--';
      if (bmiBadge) {
        bmiBadge.className = 'badge-bmi';
        bmiBadge.textContent = 'Awaiting height & weight';
      }
    }
  }

  if (heightInput) heightInput.addEventListener('input', calculateBMI);
  if (weightInput) weightInput.addEventListener('input', calculateBMI);

  // ----------------------------------------------------
  // 4. PAR-Q SAFETY CHECKER
  // ----------------------------------------------------
  function checkPARQStatus() {
    let yesCount = 0;
    for (let i = 1; i <= 10; i++) {
      const checked = document.querySelector(`input[name="parq_q${i}"]:checked`);
      const row = document.querySelector(`.parq-question-row:nth-child(${i})`);
      if (checked && checked.value === 'yes') {
        yesCount++;
        if (row) row.classList.add('flagged');
      } else {
        if (row) row.classList.remove('flagged');
      }
    }

    if (parqStatusBanner) {
      if (yesCount > 0) {
        parqStatusBanner.className = 'parq-status-card mb-4 warning';
        if (parqIcon) parqIcon.textContent = '⚠️';
        if (parqTitle) parqTitle.textContent = `MEDICAL CLEARANCE ADVISED (${yesCount} 'YES' RESPONSES)`;
        if (parqSubtitle) parqSubtitle.textContent = 'Physician consultation or certified exercise physiologist sign-off recommended before vigorous resistance/cardio training.';
        if (statusItemParq) {
          statusItemParq.className = 'status-pill status-mand';
          statusItemParq.innerHTML = `⚠️ PAR-Q: <em>${yesCount} Yes (Referral)</em>`;
        }
      } else {
        parqStatusBanner.className = 'parq-status-card mb-4 safe';
        if (parqIcon) parqIcon.textContent = '🛡️';
        if (parqTitle) parqTitle.textContent = 'CLEARANCE: READY FOR PHYSICAL ACTIVITY';
        if (parqSubtitle) parqSubtitle.textContent = 'All 10 questions answered NO. Client is clear to initiate structured exercise.';
        if (statusItemParq) {
          statusItemParq.className = 'status-pill status-done';
          statusItemParq.innerHTML = `🛡️ PAR-Q: <em>Clear (All No)</em>`;
        }
      }
    }
    updateProgress();
  }

  const parqRadios = document.querySelectorAll('input[type="radio"][name^="parq_q"]');
  parqRadios.forEach(radio => radio.addEventListener('change', checkPARQStatus));

  // ----------------------------------------------------
  // 5. TEST SELECTION CHIPS & TRAINER IN-LAB ASSESSMENT
  // ----------------------------------------------------
  function updateChosenTests() {
    const activeChips = document.querySelectorAll('.test-chip.active');
    const selected = [];
    activeChips.forEach(chip => {
      const val = chip.getAttribute('data-test');
      if (val) selected.push(val);
    });

    if (chosenTestsInput) chosenTestsInput.value = selected.join(',');
    const count = selected.length;

    if (badgeCountDisplay) badgeCountDisplay.textContent = count > 0 ? `${count} Chosen` : `0 / 3`;
    if (chosenTestsCount) chosenTestsCount.textContent = count > 0 ? `${count} Tests Conducted` : `Trainer In-Lab (Optional)`;

    if (testSelectionBadge) {
      if (count >= 3) {
        testSelectionBadge.classList.add('met');
      } else {
        testSelectionBadge.classList.remove('met');
      }
    }

    updateProgress();
  }

  testChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      updateChosenTests();
    });
  });

  // ----------------------------------------------------
  // 6. TOUCH / MOUSE SIGNATURE PAD
  // ----------------------------------------------------
  let isDrawing = false;
  let hasDrawn = false;
  const sigCtx = sigCanvas ? sigCanvas.getContext('2d') : null;

  function resizeCanvas() {
    if (!sigCanvas || !sigCtx) return;
    const rect = sigCanvas.getBoundingClientRect();
    if (rect.width > 0 && sigCanvas.width !== Math.round(rect.width)) {
      let temp = null;
      if (hasDrawn && sigCanvas.width > 0 && sigCanvas.height > 0) {
        temp = sigCtx.getImageData(0, 0, sigCanvas.width, sigCanvas.height);
      }
      sigCanvas.width = Math.round(rect.width);
      sigCanvas.height = 130;

      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      sigCtx.lineWidth = 2.8;
      sigCtx.lineCap = 'round';
      sigCtx.lineJoin = 'round';
      sigCtx.strokeStyle = theme === 'light' ? '#0F172A' : '#F2CD73';

      if (temp) sigCtx.putImageData(temp, 0, 0);
    }
  }

  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 100);

  function getCanvasCoords(e) {
    const rect = sigCanvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e);
    return {
      x: (touch.clientX - rect.left) * (sigCanvas.width / rect.width),
      y: (touch.clientY - rect.top) * (sigCanvas.height / rect.height)
    };
  }

  if (sigCanvas && sigCtx) {
    const startDrawing = (e) => {
      if (e.cancelable) e.preventDefault();
      isDrawing = true;
      hasDrawn = true;
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      sigCtx.lineWidth = 2.8;
      sigCtx.lineCap = 'round';
      sigCtx.lineJoin = 'round';
      sigCtx.strokeStyle = theme === 'light' ? '#0F172A' : '#F2CD73';

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

    const stopDrawing = (e) => {
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
      drawSigBox.classList.remove('hidden');
      typeSigBox.classList.add('hidden');
      resizeCanvas();
    });

    tabTypeSig.addEventListener('click', () => {
      tabTypeSig.classList.add('active');
      tabDrawSig.classList.remove('active');
      typeSigBox.classList.remove('hidden');
      drawSigBox.classList.add('hidden');
      const typedSig = document.getElementById('client_signature');
      if (typedSig && !typedSig.value && clientNameInput) {
        typedSig.value = clientNameInput.value.trim();
      }
      updateProgress();
    });
  }

  // ----------------------------------------------------
  // 7. PROGRESS TRACKER
  // ----------------------------------------------------
  function updateProgress() {
    const hasName = clientNameInput && clientNameInput.value.trim().length > 0;
    const isDraw = tabDrawSig && tabDrawSig.classList.contains('active');
    const typedSigEl = document.getElementById('client_signature');
    const hasSig = (isDraw && hasDrawn) || (!isDraw && typedSigEl && typedSigEl.value.trim().length > 0);

    const activeChipsCount = document.querySelectorAll('.test-chip.active').length;

    // Fast-intake weights: Client Name 35%, PAR-Q 35%, Sig 30%
    // (Initial Assessment is completed by the trainer in-lab, and is optional for intake)
    let percent = 0;
    if (hasName) percent += 35;
    percent += 35; // 10 questions defaulted to NO
    if (hasSig) percent += 30;

    if (progressPercent) progressPercent.textContent = `${percent}%`;
    if (progressFill) progressFill.style.width = `${percent}%`;

    if (statusItemClient) {
      if (hasName) {
        statusItemClient.className = 'status-pill status-done';
        statusItemClient.innerHTML = `👤 Client: <em>${clientNameInput.value.trim()}</em>`;
      } else {
        statusItemClient.className = 'status-pill status-mand';
        statusItemClient.innerHTML = '👤 Client: <em>Required</em>';
      }
    }

    if (statusItemSig) {
      if (hasSig) {
        statusItemSig.className = 'status-pill status-done';
        statusItemSig.innerHTML = '✍️ Signature: <em>Signed</em>';
      } else {
        statusItemSig.className = 'status-pill status-mand';
        statusItemSig.innerHTML = '✍️ Signature: <em>Required</em>';
      }
    }

    if (statusItemTests) {
      if (activeChipsCount > 0) {
        statusItemTests.className = 'status-pill status-done';
        statusItemTests.innerHTML = `🎯 Initial Assessment: <em>${activeChipsCount} Tests Chosen</em>`;
      } else {
        statusItemTests.className = 'status-pill status-optional';
        statusItemTests.innerHTML = `🎯 Initial Assessment: <em>Trainer In-Lab (Optional)</em>`;
      }
    }
  }

  form.addEventListener('input', updateProgress);
  form.addEventListener('change', updateProgress);

  // ----------------------------------------------------
  // 8. EXTRACT FORM DATA AS OBJECT
  // ----------------------------------------------------
  function getFormDataObject() {
    const formData = new FormData(form);
    const data = {};

    formData.forEach((val, key) => {
      data[key] = val;
    });

    // PAR-Q 10 Questions
    for (let i = 1; i <= 10; i++) {
      const qKey = `parq_q${i}`;
      const checked = form.querySelector(`input[name="${qKey}"]:checked`);
      data[qKey] = checked ? checked.value : 'no';
    }

    // Client Name fallbacks
    const clientName = (clientNameInput ? clientNameInput.value : '').trim();
    data.client_name = clientName;
    data.parq_client_name = clientName;
    data.assessment_client_name = clientName;

    // Dates
    const todayStr = screeningDateInput ? screeningDateInput.value.trim() : formattedToday;
    data.screening_date = todayStr;
    data.parq_date = todayStr;
    data.assessment_date = todayStr;
    data.client_signature_date = (clientSigDateInput ? clientSigDateInput.value.trim() : todayStr) || todayStr;
    data.parq_signature_date = data.client_signature_date;

    // Chosen Tests
    const activeChips = document.querySelectorAll('.test-chip.active');
    const selected = [];
    activeChips.forEach(chip => {
      const t = chip.getAttribute('data-test');
      if (t) selected.push(t);
    });
    data.chosen_tests = selected;

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
  // 9. SAMPLE DATA AUTO-FILL
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
          height: '168 cm',
          weight: '64 kg',
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
          instructor_name: 'Keerthan',
          assessment_date: formattedToday,
          chosen_tests: ['digital', 'bmi', 'waist circumference', 'bio-electrical impedance', 'press up', 'rockport walking test', 'hamstrings', 'shoulders'],
          bp_results: '116/74 mmHg (Resting HR: 62 bpm)',
          bp_reasons: 'Routine baseline assessment before high-intensity resistance.',
          anthro_results: 'BMI: 22.7 (Normal weight) | Waist: 70 cm | WHR: 0.74',
          anthro_reasons: 'Standard body composition metrics to gauge progress over 12 weeks.',
          body_comp_results: 'Body Fat: 21.4% (via bio-electrical impedance scan)',
          body_comp_reasons: 'Selected bio-electrical impedance for non-invasive speed and comfort.',
          muscular_results: 'Push-ups: 22 reps | Plank: 1 min 45 sec | Goblet Squat: 20kg x 12 reps',
          muscular_reasons: 'Baseline muscular endurance and core stability screen.',
          cardio_results: 'Rockport Walking Test: Estimated VO2max 41.2 ml/kg/min (Good)',
          cardio_reasons: 'Low impact walking test chosen due to previous ankle history.',
          rom_results: 'Hamstrings: Normal (85 deg) | Shoulder Flexion: Full ROM (180 deg) | Ankle Dorsiflexion: Symmetrical 35 deg',
          rom_reasons: 'Screening mobility for safe squat and deadlift mechanics.',
          posture_results: 'Slight anterior pelvic tilt and forward head posture from computer work. Knees tracking neutral.',
          posture_reasons: 'Crucial for tailoring corrective warm-up and posterior chain volume.'
        };
      }

      // Populate text fields
      Object.keys(sample).forEach(key => {
        const el = form.elements[key];
        if (el && el.type !== 'radio' && el.type !== 'checkbox') {
          el.value = sample[key];
        }
      });

      // Synchronize mirrored names & dates
      if (parqClientNameInput) parqClientNameInput.value = sample.client_name;
      if (assessClientNameInput) assessClientNameInput.value = sample.client_name;

      // PAR-Q Radios
      for (let i = 1; i <= 10; i++) {
        const val = sample[`parq_q${i}`] || 'no';
        const r = form.querySelector(`input[name="parq_q${i}"][value="${val}"]`);
        if (r) r.checked = true;
      }

      // Set Test Chips
      const testsToSelect = sample.chosen_tests || [];
      testChips.forEach(chip => {
        const tVal = chip.getAttribute('data-test');
        if (testsToSelect.includes(tVal)) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });

      // Typed signature mode
      if (tabTypeSig) tabTypeSig.click();
      const typedSig = document.getElementById('client_signature');
      if (typedSig) typedSig.value = sample.client_name;

      calculateBMI();
      checkPARQStatus();
      updateChosenTests();
      updateProgress();
      showToast('Populated authentic 4-stage assessment sample data', 'success');
    } catch (e) {
      console.error('Sample data error:', e);
      showToast('Error populating sample data', 'error');
    }
  }

  if (btnSampleData) {
    btnSampleData.addEventListener('click', fillSampleData);
  }

  // ----------------------------------------------------
  // 10. RESET FORM
  // ----------------------------------------------------
  if (btnResetForm) {
    btnResetForm.addEventListener('click', () => {
      if (confirm('Clear all fields across the 4 assessment stages?')) {
        form.reset();
        if (sigCtx && sigCanvas) {
          sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
          hasDrawn = false;
        }
        testChips.forEach(chip => chip.classList.remove('active'));
        calculateBMI();
        checkPARQStatus();
        updateChosenTests();
        updateProgress();
        showToast('Form cleared', 'info');
      }
    });
  }

  // ----------------------------------------------------
  // 11. 4-PAGE LIVE PREVIEW MODAL
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

      // Attempt server rendering via PyMuPDF (fastest & 100% exact vector)
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
        console.warn('Server preview endpoint unavailable, attempting client fallback:', srvErr);
      }

      if (pages && pages.length >= 4) {
        if (previewImg1) previewImg1.src = pages[0];
        if (previewImg2) previewImg2.src = pages[1];
        if (previewImg3) previewImg3.src = pages[2];
        if (previewImg4) previewImg4.src = pages[3];
      } else {
        // Fallback: static verification preview pages if server offline
        if (previewImg1) previewImg1.src = 'verify_blank_page1.png';
        if (previewImg2) previewImg2.src = 'verify_blank_page2.png';
        if (previewImg3) previewImg3.src = 'verify_blank_page3.png';
        if (previewImg4) previewImg4.src = 'verify_blank_page4.png';
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

  if (previewModal) {
    previewModal.addEventListener('click', (e) => {
      if (e.target === previewModal) closeLivePreview();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewModal && previewModal.classList.contains('show')) {
      closeLivePreview();
    }
  });

  // Preview Tabs (1, 2, 3, 4)
  previewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const pageNum = tab.getAttribute('data-page');
      previewTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

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
  // 12. PDF GENERATION & DOWNLOAD
  // ----------------------------------------------------
  async function downloadPDF() {
    const data = getFormDataObject();
    if (!data.client_name) {
      showToast('Please enter the Client Name before downloading', 'error');
      if (clientNameInput) clientNameInput.focus();
      return;
    }

    showToast('Compiling official 4-page assessment PDF...', 'info');

    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = data.client_name.replace(/[^a-zA-Z0-9_-]/g, '_');
      a.href = url;
      a.download = `Keerthan_Strength_Lab_Assessment_${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Official Assessment PDF downloaded successfully!', 'success');
      closeLivePreview();
    } catch (err) {
      console.warn('Backend download failed, downloading offline fillable template:', err);
      // Offline fallback: download template directly
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
  // 13. CINEMATIC LOADER LOGIC
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
  // 14. TOAST NOTIFICATIONS
  // ----------------------------------------------------
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ----------------------------------------------------
  // 15. SECTION NAVIGATION SCROLLSPY & SMOOTH SCROLL
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

  // Initial calculation check
  calculateBMI();
  checkPARQStatus();
  updateChosenTests();
  updateProgress();
});
