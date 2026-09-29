/**
 * KEERTHAN STRENGTH LAB - Official Assessment Dossier Portal
 * Logic for:
 * 1. Client Screening Intake & Demographics
 * 2. 10-Question PAR-Q Safety Screener & Physician Alerts
 * 3. Compact Exercise Barriers & Adherence Strategies
 * 4. Client Notes & Personal Considerations (Free-form multiline)
 * 5. Trainer-Only Initial Assessment & Role-Based Permissions (Read-only for clients)
 * 6. Digital Touch/Mouse Signature Pad & Typed Fallback
 * 7. Live BMI Calculator & Cross-Section Data Synchronization
 * 8. 4-Page Live Vector PDF Preview Modal
 * 9. Server-Side & Offline Client-Side PDF Generation
 * 10. SQLite Database Integration for Client Profiles & Trainer Assessments
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
  const clientNotesInput = document.getElementById('client_notes');

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

  // Initial Assessment & Role Elements
  const secAssessment = document.getElementById('sec-assessment');
  const assessRoleBadge = document.getElementById('assessRoleBadge');
  const assessReadonlyNotice = document.getElementById('assessReadonlyNotice');
  const assessTrainerToolbar = document.getElementById('assessTrainerToolbar');
  const btnSaveAssessment = document.getElementById('btnSaveAssessment');
  const testInstructionText = document.getElementById('testInstructionText');
  const testChips = document.querySelectorAll('.test-chip');
  const chosenTestsInput = document.getElementById('chosen_tests');
  const testSelectionBadge = document.getElementById('testSelectionBadge');
  const badgeCountDisplay = document.getElementById('badgeCountDisplay');

  // Trainer Portal Elements
  const btnTrainerPortal = document.getElementById('btnTrainerPortal');
  const trainerPortalBtnText = document.getElementById('trainerPortalBtnText');
  const btnClientRoster = document.getElementById('btnClientRoster');
  const rosterCount = document.getElementById('rosterCount');
  const btnLogoutTrainer = document.getElementById('btnLogoutTrainer');

  // Trainer Auth Modal Elements
  const trainerAuthModal = document.getElementById('trainerAuthModal');
  const btnCloseTrainerAuth = document.getElementById('btnCloseTrainerAuth');
  const btnCancelTrainerAuth = document.getElementById('btnCancelTrainerAuth');
  const trainerAuthForm = document.getElementById('trainerAuthForm');
  const trainerPasscodeInput = document.getElementById('trainerPasscode');

  // Client Roster Modal Elements
  const clientRosterModal = document.getElementById('clientRosterModal');
  const btnCloseClientRoster = document.getElementById('btnCloseClientRoster');
  const btnCloseClientRosterBottom = document.getElementById('btnCloseClientRosterBottom');
  const rosterListContainer = document.getElementById('rosterListContainer');
  const rosterSearchInput = document.getElementById('rosterSearchInput');

  // Action Buttons
  const btnRegisterClient = document.getElementById('btnRegisterClient');
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

  // Active Client Tracking (for updates)
  let activeClientId = null;
  let cachedRoster = [];

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
  // 2. ROLE-BASED ACCESS CONTROL (CLIENT VS TRAINER)
  // ----------------------------------------------------
  function isTrainer() {
    return Boolean(sessionStorage.getItem('ksl_trainer_token'));
  }

  function getTrainerAuthHeaders() {
    const token = sessionStorage.getItem('ksl_trainer_token') || '';
    return {
      'Content-Type': 'application/json',
      'X-Trainer-Key': token,
      'Authorization': `Bearer ${token}`
    };
  }

  function updateRoleUI() {
    const trainerActive = isTrainer();

    if (trainerActive) {
      document.body.classList.add('is-trainer-mode');
      document.body.classList.remove('is-readonly-mode');

      if (btnTrainerPortal) btnTrainerPortal.classList.add('active');
      if (trainerPortalBtnText) trainerPortalBtnText.textContent = 'Coach Mode';
      if (btnClientRoster) btnClientRoster.classList.remove('hidden');
      if (btnLogoutTrainer) btnLogoutTrainer.classList.remove('hidden');

      if (assessRoleBadge) {
        assessRoleBadge.className = 'sec-badge badge-trainer';
        assessRoleBadge.textContent = '⚡ Trainer Mode — Full Edit Access';
      }
      if (assessReadonlyNotice) assessReadonlyNotice.classList.add('hidden');
      if (assessTrainerToolbar) assessTrainerToolbar.classList.remove('hidden');

      // Enable Initial Assessment fields for trainer editing
      const assessInputs = secAssessment ? secAssessment.querySelectorAll('input:not(#assessment_client_name), textarea') : [];
      assessInputs.forEach(inp => {
        inp.readOnly = false;
        inp.disabled = false;
      });

      if (testInstructionText) {
        testInstructionText.textContent = 'Select conducted clinical tests in the lab (minimum of three recommended).';
      }
    } else {
      document.body.classList.remove('is-trainer-mode');
      document.body.classList.add('is-readonly-mode');

      if (btnTrainerPortal) btnTrainerPortal.classList.remove('active');
      if (trainerPortalBtnText) trainerPortalBtnText.textContent = 'Trainer Portal';
      if (btnClientRoster) btnClientRoster.classList.add('hidden');
      if (btnLogoutTrainer) btnLogoutTrainer.classList.add('hidden');

      if (assessRoleBadge) {
        assessRoleBadge.className = 'sec-badge badge-readonly';
        assessRoleBadge.textContent = '🔒 Trainer Assessment — Read Only';
      }
      if (assessReadonlyNotice) assessReadonlyNotice.classList.remove('hidden');
      if (assessTrainerToolbar) assessTrainerToolbar.classList.add('hidden');

      // Lock Initial Assessment fields for client viewing
      const assessInputs = secAssessment ? secAssessment.querySelectorAll('input, textarea') : [];
      assessInputs.forEach(inp => {
        inp.readOnly = true;
        inp.disabled = true;
      });

      if (testInstructionText) {
        testInstructionText.textContent = 'Trainer Assessment — Read Only: Tests and clinical observations recorded by your coach appear below.';
      }
    }

    // Refresh roster counter if trainer
    if (trainerActive) {
      fetchClientRosterCount();
    }
  }

  // ----------------------------------------------------
  // 3. TRAINER AUTHENTICATION MODAL LOGIC
  // ----------------------------------------------------
  function openTrainerAuthModal() {
    if (!trainerAuthModal) return;
    trainerAuthModal.classList.add('show');
    trainerAuthModal.setAttribute('aria-hidden', 'false');
    if (trainerPasscodeInput) {
      trainerPasscodeInput.value = '';
      setTimeout(() => trainerPasscodeInput.focus(), 150);
    }
  }

  function closeTrainerAuthModal() {
    if (!trainerAuthModal) return;
    trainerAuthModal.classList.remove('show');
    trainerAuthModal.setAttribute('aria-hidden', 'true');
  }

  if (btnTrainerPortal) {
    btnTrainerPortal.addEventListener('click', () => {
      if (isTrainer()) {
        openClientRosterModal();
      } else {
        openTrainerAuthModal();
      }
    });
  }

  if (btnCloseTrainerAuth) btnCloseTrainerAuth.addEventListener('click', closeTrainerAuthModal);
  if (btnCancelTrainerAuth) btnCancelTrainerAuth.addEventListener('click', closeTrainerAuthModal);

  if (trainerAuthForm) {
    trainerAuthForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = trainerPasscodeInput ? trainerPasscodeInput.value.trim() : '';
      if (!code) return;

      try {
        const res = await fetch('/api/trainer/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: code })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          sessionStorage.setItem('ksl_trainer_token', data.token || 'ksl_trainer_token_auth_2026');
          closeTrainerAuthModal();
          updateRoleUI();
          showToast(`Trainer access unlocked! Welcome, ${data.trainer_name || 'Coach'}.`, 'success');
        } else {
          showToast(data.error || 'Invalid trainer passcode.', 'error');
          if (trainerPasscodeInput) trainerPasscodeInput.select();
        }
      } catch (err) {
        console.error('Trainer auth error:', err);
        showToast('Authentication network error: ' + err.message, 'error');
      }
    });
  }

  if (btnLogoutTrainer) {
    btnLogoutTrainer.addEventListener('click', () => {
      sessionStorage.removeItem('ksl_trainer_token');
      updateRoleUI();
      showToast('Exited Trainer Mode. Switched to Client View (Initial Assessment is Read-Only).', 'info');
    });
  }

  // ----------------------------------------------------
  // 4. CLIENT ROSTER MODAL LOGIC (TRAINER ONLY)
  // ----------------------------------------------------
  async function fetchClientRosterCount() {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        const count = data.count || (data.clients ? data.clients.length : 0);
        if (rosterCount) rosterCount.textContent = count;
        cachedRoster = data.clients || [];
      }
    } catch (e) {
      console.warn('Could not fetch client count:', e);
    }
  }

  async function openClientRosterModal() {
    if (!clientRosterModal) return;
    clientRosterModal.classList.add('show');
    clientRosterModal.setAttribute('aria-hidden', 'false');
    renderRosterList();

    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        cachedRoster = data.clients || [];
        renderRosterList(cachedRoster);
      }
    } catch (e) {
      console.error('Roster error:', e);
    }
  }

  function closeClientRosterModal() {
    if (!clientRosterModal) return;
    clientRosterModal.classList.remove('show');
    clientRosterModal.setAttribute('aria-hidden', 'true');
  }

  function renderRosterList(clients = cachedRoster) {
    if (!rosterListContainer) return;
    const filter = rosterSearchInput ? rosterSearchInput.value.toLowerCase().trim() : '';

    const filtered = clients.filter(c => {
      const name = (c.client_name || '').toLowerCase();
      const notes = (c.client_notes || '').toLowerCase();
      return name.includes(filter) || notes.includes(filter);
    });

    if (filtered.length === 0) {
      rosterListContainer.innerHTML = `
        <div class="panel-box text-center p-4">
          <p style="color: var(--text-muted); font-size: 0.85rem;">No client records match your query.</p>
        </div>
      `;
      return;
    }

    rosterListContainer.innerHTML = filtered.map(c => {
      const isDone = Boolean(c.assessment_completed);
      const statusBadge = isDone 
        ? `<span class="badge-assess-status badge-assess-done">✓ Assessment Completed</span>`
        : `<span class="badge-assess-status badge-assess-pending">⏳ Awaiting In-Lab Assessment</span>`;

      const notesSnippet = c.client_notes 
        ? `<span class="roster-notes-snippet">📝 Notes: "${escapeHtml(c.client_notes.substring(0, 90))}${c.client_notes.length > 90 ? '...' : ''}"</span>`
        : `<span class="roster-notes-snippet" style="opacity: 0.5;">No client notes recorded</span>`;

      return `
        <div class="roster-item-card" data-client-id="${c.client_id}">
          <div class="roster-client-info">
            <h4>${escapeHtml(c.client_name)} ${statusBadge}</h4>
            <div class="roster-client-meta">
              <span>📅 Registered: ${escapeHtml(c.screening_date || c.created_at || 'Recently')}</span>
              <span>⚡ Activity: ${escapeHtml(c.activity_level || 'MEDIUM')}</span>
            </div>
            ${notesSnippet}
          </div>
          <button type="button" class="btn btn-secondary btn-sm btn-load-client" data-client-id="${c.client_id}">
            <span>Open & Assess &rarr;</span>
          </button>
        </div>
      `;
    }).join('');

    // Attach load handlers
    rosterListContainer.querySelectorAll('.btn-load-client').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-client-id');
        loadClientProfile(id);
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  if (rosterSearchInput) {
    rosterSearchInput.addEventListener('input', () => renderRosterList());
  }

  if (btnClientRoster) btnClientRoster.addEventListener('click', openClientRosterModal);
  if (btnCloseClientRoster) btnCloseClientRoster.addEventListener('click', closeClientRosterModal);
  if (btnCloseClientRosterBottom) btnCloseClientRosterBottom.addEventListener('click', closeClientRosterModal);

  async function loadClientProfile(clientId) {
    try {
      showToast(`Loading client profile [${clientId}]...`, 'info');
      const res = await fetch(`/api/clients/${clientId}`);
      if (!res.ok) throw new Error('Client record not found');
      const data = await res.json();
      const client = data.client;

      activeClientId = client.client_id;
      populateFormFromClientData(client);
      closeClientRosterModal();

      // Scroll to Initial Assessment if in trainer mode
      if (isTrainer() && secAssessment) {
        secAssessment.scrollIntoView({ behavior: 'smooth' });
        showToast(`Loaded ${client.client_name}. Initial Assessment is ready for trainer evaluation.`, 'success');
      } else {
        showToast(`Loaded profile for ${client.client_name}.`, 'success');
      }
    } catch (e) {
      console.error('Load client error:', e);
      showToast('Error loading client: ' + e.message, 'error');
    }
  }

  function populateFormFromClientData(data) {
    Object.keys(data).forEach(key => {
      const el = form.elements[key];
      if (el && el.type !== 'radio' && el.type !== 'checkbox') {
        el.value = data[key] || '';
      }
    });

    if (clientNotesInput && data.client_notes !== undefined) {
      clientNotesInput.value = data.client_notes || '';
    }

    // Mirror names
    if (parqClientNameInput) parqClientNameInput.value = data.client_name || '';
    if (assessClientNameInput) assessClientNameInput.value = data.client_name || '';

    // PAR-Q Questions
    for (let i = 1; i <= 10; i++) {
      const val = data[`parq_q${i}`] || 'no';
      const r = form.querySelector(`input[name="parq_q${i}"][value="${val}"]`);
      if (r) r.checked = true;
    }

    // Chosen Tests
    const tests = Array.isArray(data.chosen_tests) ? data.chosen_tests : [];
    testChips.forEach(chip => {
      const tVal = chip.getAttribute('data-test');
      if (tests.includes(tVal)) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // Signature
    const sigImg = data.client_signature_image;
    if (sigImg && sigCanvas && sigCtx) {
      const img = new Image();
      img.onload = () => {
        sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
        sigCtx.drawImage(img, 0, 0);
        hasDrawn = true;
        if (sigImageInput) sigImageInput.value = sigImg;
      };
      img.src = sigImg;
      if (tabDrawSig) tabDrawSig.click();
    } else if (data.client_signature) {
      if (tabTypeSig) tabTypeSig.click();
      const typedSig = document.getElementById('client_signature');
      if (typedSig) typedSig.value = data.client_signature;
    }

    calculateBMI();
    checkPARQStatus();
    updateChosenTests();
    updateProgress();
    updateRoleUI();
  }

  // ----------------------------------------------------
  // 5. DATA SYNCHRONIZATION ACROSS SECTIONS
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
      if (instructorNameInput && !instructorNameInput.disabled) {
        instructorNameInput.value = learnerNameInput.value.trim();
      }
    });
  }

  if (screeningDateInput) {
    screeningDateInput.addEventListener('input', () => {
      const d = screeningDateInput.value.trim();
      if (parqDateInput) parqDateInput.value = d;
      if (assessDateInput && !assessDateInput.disabled) assessDateInput.value = d;
      if (clientSigDateInput) clientSigDateInput.value = d;
    });
  }

  // ----------------------------------------------------
  // 6. BMI AUTO-CALCULATOR
  // ----------------------------------------------------
  function calculateBMI() {
    if (!heightInput || !weightInput) return;
    const hRaw = parseFloat(heightInput.value.replace(/[^\d.]/g, ''));
    const wRaw = parseFloat(weightInput.value.replace(/[^\d.]/g, ''));

    if (hRaw > 50 && wRaw > 20) {
      const hM = hRaw / 100.0;
      const bmi = (wRaw / (hM * hM)).toFixed(1);

      if (bmiDisplay) bmiDisplay.textContent = bmi;
      if (bmiBadge) {
        if (bmi < 18.5) {
          bmiBadge.textContent = 'Underweight';
          bmiBadge.style.color = '#60A5FA';
        } else if (bmi < 25.0) {
          bmiBadge.textContent = 'Normal Healthy Weight';
          bmiBadge.style.color = '#34D399';
        } else if (bmi < 30.0) {
          bmiBadge.textContent = 'Overweight';
          bmiBadge.style.color = '#FBBF24';
        } else {
          bmiBadge.textContent = 'Obese Class';
          bmiBadge.style.color = '#F87171';
        }
      }

      if (anthroResultsInput && isTrainer() && !anthroResultsInput.value) {
        anthroResultsInput.value = `BMI: ${bmi}`;
      }
    } else {
      if (bmiDisplay) bmiDisplay.textContent = '--';
      if (bmiBadge) {
        bmiBadge.textContent = 'Awaiting height & weight';
        bmiBadge.style.color = 'var(--text-muted)';
      }
    }
  }

  if (heightInput) heightInput.addEventListener('input', calculateBMI);
  if (weightInput) weightInput.addEventListener('input', calculateBMI);

  // ----------------------------------------------------
  // 7. PAR-Q SAFETY SCREENER VERIFICATION
  // ----------------------------------------------------
  function checkPARQStatus() {
    let hasYes = false;
    let answeredCount = 0;

    for (let i = 1; i <= 10; i++) {
      const checked = form.querySelector(`input[name="parq_q${i}"]:checked`);
      if (checked) {
        answeredCount++;
        if (checked.value === 'yes') hasYes = true;
      }
    }

    if (parqStatusBanner) {
      if (hasYes) {
        parqStatusBanner.className = 'parq-status-card mb-4 alert';
        if (parqIcon) parqIcon.textContent = '⚠️';
        if (parqTitle) parqTitle.textContent = 'MEDICAL REFERRAL ADVICE: PHYSICIAN CLEARANCE RECOMMENDED';
        if (parqSubtitle) parqSubtitle.textContent = 'Client answered YES to one or more questions. Physical activity should be cleared with a doctor prior to high-intensity training.';
      } else {
        parqStatusBanner.className = 'parq-status-card mb-4 safe';
        if (parqIcon) parqIcon.textContent = '🛡️';
        if (parqTitle) parqTitle.textContent = 'CLEARANCE: READY FOR PHYSICAL ACTIVITY';
        if (parqSubtitle) parqSubtitle.textContent = 'All questions answered NO. Client is cleared to proceed with structured baseline physical training.';
      }
    }
  }

  const parqRadios = form.querySelectorAll('input[type="radio"][name^="parq_q"]');
  parqRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      checkPARQStatus();
      updateProgress();
    });
  });

  // ----------------------------------------------------
  // 8. TEST SELECTION CHIPS (TRAINER ONLY INTERACTION)
  // ----------------------------------------------------
  function updateChosenTests() {
    const active = document.querySelectorAll('.test-chip.active');
    const tests = [];
    active.forEach(c => {
      const t = c.getAttribute('data-test');
      if (t) tests.push(t);
    });

    if (chosenTestsInput) chosenTestsInput.value = JSON.stringify(tests);
    if (badgeCountDisplay) badgeCountDisplay.textContent = `${tests.length} Selected`;

    if (chosenTestsCount) {
      chosenTestsCount.textContent = tests.length > 0 ? `${tests.length} Tests Selected` : 'Trainer In-Lab';
    }
  }

  testChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      // Security: Block chip toggling if user is in Client Mode!
      if (!isTrainer()) {
        showToast('Initial Assessment test selection is restricted to authorized trainers.', 'warning');
        return;
      }
      chip.classList.toggle('active');
      updateChosenTests();
      updateProgress();
    });
  });

  // ----------------------------------------------------
  // 9. SIGNATURE CANVAS & TYPED MODE
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
      drawSigBox.classList.remove('hidden');
      typeSigBox.classList.add('hidden');
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
  // 10. PROGRESS TRACKER
  // ----------------------------------------------------
  function updateProgress() {
    const hasName = clientNameInput && clientNameInput.value.trim().length > 0;
    const isDraw = tabDrawSig && tabDrawSig.classList.contains('active');
    const typedSigEl = document.getElementById('client_signature');
    const hasSig = (isDraw && hasDrawn) || (!isDraw && typedSigEl && typedSigEl.value.trim().length > 0);
    const hasNotes = clientNotesInput && clientNotesInput.value.trim().length > 0;

    let percent = 0;
    if (hasName) percent += 35;
    percent += 35; // 10 questions answered / defaulted
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
  }

  // ----------------------------------------------------
  // 11. FORM DATA GATHERING
  // ----------------------------------------------------
  function getFormDataObject() {
    const fd = new FormData(form);
    const data = {};
    fd.forEach((val, key) => { data[key] = val.trim(); });

    // Explicitly grab client notes
    if (clientNotesInput) {
      data.client_notes = clientNotesInput.value.trim();
    }

    // Set Active Client ID if loaded
    if (activeClientId) {
      data.client_id = activeClientId;
    }

    // PAR-Q Radios
    for (let i = 1; i <= 10; i++) {
      const qKey = `parq_q${i}`;
      const checked = form.querySelector(`input[name="${qKey}"]:checked`);
      data[qKey] = checked ? checked.value : 'no';
    }

    const clientName = (clientNameInput ? clientNameInput.value : '').trim();
    data.client_name = clientName;
    data.parq_client_name = clientName;
    data.assessment_client_name = clientName;

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
  // 12. SAVE / REGISTER CLIENT INTAKE PROFILE
  // ----------------------------------------------------
  async function registerClientProfile() {
    const data = getFormDataObject();
    if (!data.client_name) {
      showToast('Please enter the Client Name before saving', 'error');
      if (clientNameInput) clientNameInput.focus();
      return;
    }

    // Role-based Security:
    // If not in Trainer Mode, strip any Initial Assessment fields before calling /api/register
    const assessmentFieldNames = [
      'instructor_name', 'assessment_date', 'chosen_tests',
      'bp_results', 'bp_reasons', 'anthro_results', 'anthro_reasons',
      'body_comp_results', 'body_comp_reasons', 'muscular_results', 'muscular_reasons',
      'cardio_results', 'cardio_reasons', 'rom_results', 'rom_reasons',
      'posture_results', 'posture_reasons'
    ];

    if (!isTrainer()) {
      assessmentFieldNames.forEach(f => {
        delete data[f];
      });
    }

    showToast('Saving client intake registration...', 'info');

    try {
      const headers = isTrainer() ? getTrainerAuthHeaders() : { 'Content-Type': 'application/json' };
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || `HTTP ${res.status}`);
      }

      if (resData.client && resData.client.client_id) {
        activeClientId = resData.client.client_id;
      }

      showToast(`Registration saved for ${data.client_name}! Client Notes stored safely.`, 'success');
      fetchClientRosterCount();
    } catch (err) {
      console.error('Registration error:', err);
      showToast('Registration failed: ' + err.message, 'error');
    }
  }

  if (btnRegisterClient) {
    btnRegisterClient.addEventListener('click', registerClientProfile);
  }

  // ----------------------------------------------------
  // 13. SAVE INITIAL ASSESSMENT (TRAINER ONLY)
  // ----------------------------------------------------
  async function saveInitialAssessment() {
    if (!isTrainer()) {
      showToast('Unauthorized: Only coaches can save Initial Assessment results.', 'error');
      return;
    }

    const data = getFormDataObject();
    if (!data.client_name) {
      showToast('Please assign or load a client first.', 'error');
      if (clientNameInput) clientNameInput.focus();
      return;
    }

    showToast('Saving clinical Initial Assessment results...', 'info');

    try {
      const res = await fetch('/api/trainer/assessment', {
        method: 'POST',
        headers: getTrainerAuthHeaders(),
        body: JSON.stringify(data)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || `HTTP ${res.status}`);
      }

      if (resData.client && resData.client.client_id) {
        activeClientId = resData.client.client_id;
      }

      showToast(`Initial Assessment recorded successfully for ${data.client_name}!`, 'success');
      fetchClientRosterCount();
    } catch (err) {
      console.error('Save assessment error:', err);
      showToast('Failed to save assessment: ' + err.message, 'error');
    }
  }

  if (btnSaveAssessment) {
    btnSaveAssessment.addEventListener('click', saveInitialAssessment);
  }

  // ----------------------------------------------------
  // 14. SAMPLE DATA AUTO-FILL
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
          client_notes: 'Primary goal is preparing for an autumn half-marathon while improving thoracic mobility and lower back stability. Prefer 7 AM sessions.',
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

      populateFormFromClientData(sample);
      showToast('Populated authentic assessment sample data & Client Notes', 'success');
    } catch (e) {
      console.error('Sample data error:', e);
      showToast('Error populating sample data', 'error');
    }
  }

  if (btnSampleData) {
    btnSampleData.addEventListener('click', fillSampleData);
  }

  // ----------------------------------------------------
  // 15. RESET FORM
  // ----------------------------------------------------
  if (btnResetForm) {
    btnResetForm.addEventListener('click', () => {
      if (confirm('Clear all fields across the assessment stages?')) {
        form.reset();
        activeClientId = null;
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
  // 16. LIVE PREVIEW MODAL
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
    if (e.key === 'Escape') {
      if (previewModal && previewModal.classList.contains('show')) closeLivePreview();
      if (trainerAuthModal && trainerAuthModal.classList.contains('show')) closeTrainerAuthModal();
      if (clientRosterModal && clientRosterModal.classList.contains('show')) closeClientRosterModal();
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
  // 17. PDF GENERATION & DOWNLOAD
  // ----------------------------------------------------
  async function downloadPDF() {
    const data = getFormDataObject();
    if (!data.client_name) {
      showToast('Please enter the Client Name before downloading', 'error');
      if (clientNameInput) clientNameInput.focus();
      return;
    }

    showToast('Compiling official Keerthan Strength Lab PDF...', 'info');

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
  // 18. CINEMATIC LOADER
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
  // 19. TOAST NOTIFICATIONS
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
  // 20. SECTION NAVIGATION SCROLLSPY & SMOOTH SCROLL
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
  updateChosenTests();
  updateProgress();
  updateRoleUI();
});
