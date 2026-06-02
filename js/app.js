/**
 * app.js — Main Application Controller  v2.0
 *
 * New features:
 *  - Collapsible sidebar section groups
 *  - Custom array input modal with tag-bubble system
 *  - Live color theme picker → CSS variable overrides
 *  - Slow-mode class toggling on body (>200ms delay)
 *  - Algorithm panel icons
 *  - generateNewArray(useExisting) flag
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
//  ALGORITHM PANEL ICONS
// ═══════════════════════════════════════════════════════════════

const ALGO_ICONS = {
  bubble: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
    <circle cx="5.5" cy="9.5" r="3.5"/><circle cx="11" cy="5" r="2.5"/>
    <line x1="8.2" y1="7.8" x2="9.2" y2="6.8"/>
  </svg>`,
  quick: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M9.5 1.5L5 8.5H8.5L7 14.5L13 6.5H9.5z"/>
  </svg>`,
  merge: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 4v3.5l6 3 6-3V4M8 10.5V14"/>
  </svg>`,
  insertion: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <line x1="8" y1="2" x2="8" y2="10"/><path d="M5 7.5l3 3.5 3-3.5"/>
    <line x1="3" y1="13.5" x2="13" y2="13.5"/>
  </svg>`,
  selection: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
    <circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2"/>
    <line x1="8" y1="1" x2="8" y2="2.5"/><line x1="8" y1="13.5" x2="8" y2="15"/>
    <line x1="1" y1="8" x2="2.5" y2="8"/><line x1="13.5" y1="8" x2="15" y2="8"/>
  </svg>`,
};

// ═══════════════════════════════════════════════════════════════
//  GLOBAL APP STATE
// ═══════════════════════════════════════════════════════════════

const AppState = {
  arraySize:   60,
  speed:       50,
  ascending:   true,
  splitMode:   false,
  isRunning:   false,
  sourceArray: [],
  array1:      [],
  array2:      [],
  algo1:       'bubble',
  algo2:       'merge',
  ctrl1:       new AnimationController(),
  ctrl2:       new AnimationController(),
  metrics1:    { comparisons: 0, accesses: 0 },
  metrics2:    { comparisons: 0, accesses: 0 },
  timerTick:   null,
};

// ═══════════════════════════════════════════════════════════════
//  VISUALIZER INSTANCES
// ═══════════════════════════════════════════════════════════════

const viz1 = new Visualizer(
  'bar-chart-primary',   'progress-primary',
  'metric-comparisons-1', 'metric-accesses-1', 'metric-time-1',
  'panel-algo-primary',  'complexity-primary',
  'bar-overlay-primary'
);

const viz2 = new Visualizer(
  'bar-chart-secondary',  'progress-secondary',
  'metric-comparisons-2', 'metric-accesses-2', 'metric-time-2',
  'panel-algo-secondary', 'complexity-secondary',
  'bar-overlay-secondary'
);

// ═══════════════════════════════════════════════════════════════
//  DOM REFERENCES
// ═══════════════════════════════════════════════════════════════

const DOM = {
  // Header
  btnModeToggle:   document.getElementById('btn-mode-toggle'),
  labelMode:       document.getElementById('label-mode'),
  btnAsc:          document.getElementById('btn-asc'),
  btnDesc:         document.getElementById('btn-desc'),

  // Dataset section
  sliderSize:      document.getElementById('slider-size'),
  valSize:         document.getElementById('val-size'),
  sliderSpeed:     document.getElementById('slider-speed'),
  valSpeed:        document.getElementById('val-speed'),
  btnGenerate:     document.getElementById('btn-generate'),
  btnCustomInput:  document.getElementById('btn-custom-input'),

  // Algorithm sections
  algoPrimaryGrid:   document.getElementById('algo-primary-grid'),
  algoSecondaryGrid: document.getElementById('algo-secondary-grid'),
  secondaryPanel:    document.getElementById('secondary-algo-panel'),

  // Panel icons
  panelIconPrimary:   document.getElementById('panel-icon-primary'),
  panelIconSecondary: document.getElementById('panel-icon-secondary'),

  // Playback
  btnPlay:     document.getElementById('btn-play'),
  btnPause:    document.getElementById('btn-pause'),
  btnStop:     document.getElementById('btn-stop'),
  statusDot:   document.getElementById('status-dot'),
  statusText:  document.getElementById('status-text'),
  slowBadge:   document.getElementById('slow-badge'),

  // Metrics
  metricsToggle:    document.getElementById('metrics-toggle'),
  metricsPanel:     document.getElementById('metrics-panel'),
  metricsChevron:   document.querySelector('.metrics-chevron'),
  metricsSecondary: document.getElementById('metrics-secondary'),

  // Canvas
  canvasArea:     document.getElementById('canvas-area'),
  vizPrimary:     document.getElementById('visualizer-primary'),
  vizSecondary:   document.getElementById('visualizer-secondary'),

  // Modal
  modalCustom:     document.getElementById('modal-custom'),
  tagField:        document.getElementById('tag-field'),
  tagRawInput:     document.getElementById('tag-raw-input'),
  modalError:      document.getElementById('modal-error'),
  tagCount:        document.getElementById('tag-count'),
  btnModalClose:   document.getElementById('btn-modal-close'),
  btnModalCancel:  document.getElementById('btn-modal-cancel'),
  btnModalApply:   document.getElementById('btn-modal-apply'),
  btnModalClear:   document.getElementById('btn-modal-clear'),

  // Color swatches
  colorInputs: document.querySelectorAll('.color-input'),
};

// ═══════════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  bindCollapsibleGroups();
  bindSliders();
  bindGenerateBtn();
  bindOrderButtons();
  bindModeToggle();
  bindAlgoGrids();
  bindPlayback();
  bindMetricsToggle();
  bindColorSwatches();
  bindCustomModal();

  syncSliders();
  generateNewArray();
});

// ═══════════════════════════════════════════════════════════════
//  COLLAPSIBLE SIDEBAR GROUPS
// ═══════════════════════════════════════════════════════════════

function bindCollapsibleGroups() {
  document.querySelectorAll('.sb-group-hdr').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const body     = document.getElementById(targetId);
      const chevron  = btn.querySelector('.sb-chevron');
      const isOpen   = btn.getAttribute('aria-expanded') === 'true';

      btn.setAttribute('aria-expanded', String(!isOpen));
      body.classList.toggle('collapsed', isOpen);
      if (chevron) chevron.classList.toggle('rotated', isOpen);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
//  SLIDERS
// ═══════════════════════════════════════════════════════════════

function bindSliders() {
  DOM.sliderSize.addEventListener('input', () => {
    if (AppState.isRunning) return;
    AppState.arraySize = parseInt(DOM.sliderSize.value, 10);
    DOM.valSize.textContent = AppState.arraySize;
    updateSliderFill(DOM.sliderSize);
    generateNewArray();
  });

  DOM.sliderSpeed.addEventListener('input', () => {
    AppState.speed = parseInt(DOM.sliderSpeed.value, 10);
    DOM.valSpeed.textContent = `${AppState.speed}ms`;
    updateSliderFill(DOM.sliderSpeed);
    applySlowMode(AppState.speed);
  });
}

function updateSliderFill(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);
  slider.style.setProperty('--val', `${((val - min) / (max - min)) * 100}%`);
}

function syncSliders() {
  updateSliderFill(DOM.sliderSize);
  updateSliderFill(DOM.sliderSpeed);
  DOM.valSize.textContent  = AppState.arraySize;
  DOM.valSpeed.textContent = `${AppState.speed}ms`;
}

// Slow-mode: activate when delay > 200ms
function applySlowMode(speed) {
  const isSlow = speed > 200;
  document.body.classList.toggle('slow-mode', isSlow);
  if (DOM.slowBadge) DOM.slowBadge.classList.toggle('hidden', !isSlow);
}

// ═══════════════════════════════════════════════════════════════
//  ORDER & MODE
// ═══════════════════════════════════════════════════════════════

function bindOrderButtons() {
  DOM.btnAsc.addEventListener('click',  () => setSortOrder(true));
  DOM.btnDesc.addEventListener('click', () => setSortOrder(false));
}

function setSortOrder(ascending) {
  if (AppState.isRunning) return;
  AppState.ascending = ascending;
  DOM.btnAsc.classList.toggle('active',  ascending);
  DOM.btnDesc.classList.toggle('active', !ascending);
  DOM.btnAsc.setAttribute('aria-pressed',   String(ascending));
  DOM.btnDesc.setAttribute('aria-pressed',  String(!ascending));
}

function bindModeToggle() {
  DOM.btnModeToggle.addEventListener('click', toggleSplitMode);
}

function toggleSplitMode() {
  if (AppState.isRunning) { showToast('Stop the sort first.', 'error'); return; }
  AppState.splitMode = !AppState.splitMode;

  DOM.btnModeToggle.classList.toggle('active', AppState.splitMode);
  DOM.btnModeToggle.setAttribute('aria-pressed', String(AppState.splitMode));
  DOM.labelMode.textContent = AppState.splitMode ? 'Single View' : 'Split View';

  DOM.secondaryPanel.classList.toggle('hidden',   !AppState.splitMode);
  DOM.vizSecondary.classList.toggle('hidden',     !AppState.splitMode);
  DOM.metricsSecondary.classList.toggle('hidden', !AppState.splitMode);
  DOM.canvasArea.classList.toggle('split',        AppState.splitMode);

  generateNewArray();
  showToast(AppState.splitMode ? 'Split-screen enabled!' : 'Single view', 'success');
}

// ═══════════════════════════════════════════════════════════════
//  ALGORITHM SELECTION
// ═══════════════════════════════════════════════════════════════

function bindAlgoGrids() {
  DOM.algoPrimaryGrid.addEventListener('change', e => {
    if (e.target.type === 'radio') {
      AppState.algo1 = e.target.value;
      viz1.setAlgo(AppState.algo1);
      setPanelIcon('primary', AppState.algo1);
    }
  });

  DOM.algoSecondaryGrid.addEventListener('change', e => {
    if (e.target.type === 'radio') {
      AppState.algo2 = e.target.value;
      viz2.setAlgo(AppState.algo2);
      setPanelIcon('secondary', AppState.algo2);
    }
  });
}

function setPanelIcon(which, algoKey) {
  const el = which === 'primary' ? DOM.panelIconPrimary : DOM.panelIconSecondary;
  if (el) el.innerHTML = ALGO_ICONS[algoKey] || '';
}

// ═══════════════════════════════════════════════════════════════
//  ARRAY GENERATION
// ═══════════════════════════════════════════════════════════════

/**
 * @param {boolean} [useExisting=false] - If true, use AppState.sourceArray as-is
 */
function generateNewArray(useExisting = false) {
  if (!useExisting) {
    AppState.sourceArray = randomArray(AppState.arraySize, 5, 100);
  }
  AppState.array1 = cloneArray(AppState.sourceArray);
  AppState.array2 = cloneArray(AppState.sourceArray);

  viz1.init(AppState.array1);
  viz1.setAlgo(AppState.algo1);
  setPanelIcon('primary', AppState.algo1);

  viz2.init(AppState.array2);
  viz2.setAlgo(AppState.algo2);
  setPanelIcon('secondary', AppState.algo2);

  setStatus('idle', 'Ready');
}

// Bind New Array button
function bindGenerateBtn() {
  DOM.btnGenerate.addEventListener('click', () => {
    if (AppState.isRunning) { showToast('Stop the sort first.', 'error'); return; }
    generateNewArray();
    showToast('New array generated!', 'success');
  });
}

// ═══════════════════════════════════════════════════════════════
//  COLOR THEME SWATCHES
// ═══════════════════════════════════════════════════════════════

function bindColorSwatches() {
  DOM.colorInputs.forEach(input => {
    input.addEventListener('input', e => {
      const varName  = e.target.dataset.var;
      const newColor = e.target.value;

      // Apply CSS variable
      document.documentElement.style.setProperty(varName, newColor);

      // Sync swatch circle visual
      const swatchId = e.target.id.replace('color-', 'swatch-');
      const swatch   = document.getElementById(swatchId);
      if (swatch) swatch.style.background = newColor;
    });
  });
}

// ═══════════════════════════════════════════════════════════════
//  PLAYBACK
// ═══════════════════════════════════════════════════════════════

function bindPlayback() {
  DOM.btnPlay.addEventListener('click',  startSorting);
  DOM.btnPause.addEventListener('click', togglePause);
  DOM.btnStop.addEventListener('click',  stopSorting);
}

function setPlaybackState(state) {
  const running = (state === 'running' || state === 'paused');
  AppState.isRunning = running;

  DOM.btnPlay.disabled          = (state === 'running');
  DOM.btnPause.disabled         = (state !== 'running');
  DOM.btnStop.disabled          = !running;
  DOM.sliderSize.disabled       = running;
  DOM.btnGenerate.disabled      = running;
  DOM.btnCustomInput.disabled   = running;
  DOM.btnModeToggle.disabled    = running;
}

function setStatus(type, text) {
  if (DOM.statusDot)  DOM.statusDot.className  = `status-dot ${type}`;
  if (DOM.statusText) DOM.statusText.textContent = text;
}

function speedGetter() { return AppState.speed; }

// ── Start ────────────────────────────────────────────────────

async function startSorting() {
  if (AppState.isRunning) return;

  // Reset working copies
  AppState.array1   = cloneArray(AppState.sourceArray);
  AppState.array2   = cloneArray(AppState.sourceArray);
  AppState.metrics1 = { comparisons: 0, accesses: 0 };
  AppState.metrics2 = { comparisons: 0, accesses: 0 };
  AppState.ctrl1.reset();
  AppState.ctrl2.reset();

  viz1.init(AppState.array1); viz1.setAlgo(AppState.algo1); setPanelIcon('primary',   AppState.algo1);
  viz2.init(AppState.array2); viz2.setAlgo(AppState.algo2); setPanelIcon('secondary', AppState.algo2);

  setPlaybackState('running');
  setStatus('running', 'Sorting…');

  // Live timer tick
  AppState.timerTick = setInterval(() => {
    viz1.tickTime();
    if (AppState.splitMode) viz2.tickTime();
  }, 80);

  viz1.startTimer();
  if (AppState.splitMode) viz2.startTimer();

  // Render closures
  const render1 = (arr, highlights, metrics, opts) =>
    Promise.resolve(viz1.renderFrame(arr, highlights, metrics, opts));
  const render2 = (arr, highlights, metrics, opts) =>
    Promise.resolve(viz2.renderFrame(arr, highlights, metrics, opts));

  const algoFn1 = ALGORITHMS[AppState.algo1];
  const algoFn2 = ALGORITHMS[AppState.algo2];

  const run1 = algoFn1(AppState.array1, render1, AppState.ctrl1, speedGetter, AppState.ascending, AppState.metrics1)
    .then(() => viz1.stopTimer());

  const promises = [run1];

  if (AppState.splitMode) {
    const run2 = algoFn2(AppState.array2, render2, AppState.ctrl2, speedGetter, AppState.ascending, AppState.metrics2)
      .then(() => viz2.stopTimer());
    promises.push(run2);
  }

  try {
    await Promise.allSettled(promises);
  } finally {
    clearInterval(AppState.timerTick);
  }

  if (!AppState.ctrl1.stopped) {
    setPlaybackState('idle');
    setStatus('done', 'Sorted!');
    viz1.shimmerComplete();
    if (AppState.splitMode && !AppState.ctrl2.stopped) viz2.shimmerComplete();
    showToast('✓ Sorting complete!', 'success', 3200);
  } else {
    setPlaybackState('idle');
    setStatus('stopped', 'Stopped');
  }
}

// ── Pause / Resume ──────────────────────────────────────────

function togglePause() {
  if (!AppState.isRunning) return;

  if (AppState.ctrl1.paused) {
    AppState.ctrl1.resume(); AppState.ctrl2.resume();
    DOM.btnPause.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <rect x="2.5" y="2" width="4" height="12" rx="1"/>
        <rect x="9.5" y="2" width="4" height="12" rx="1"/>
      </svg> Pause`;
    setStatus('running', 'Sorting…');
    setPlaybackState('running');
  } else {
    AppState.ctrl1.pause(); AppState.ctrl2.pause();
    DOM.btnPause.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <polygon points="3,2 14,8 3,14"/>
      </svg> Resume`;
    DOM.btnPause.disabled = false;
    DOM.btnPlay.disabled  = true;
    setStatus('paused', 'Paused');
  }
}

// ── Stop ─────────────────────────────────────────────────────

function stopSorting() {
  AppState.ctrl1.stop(); AppState.ctrl2.stop();
  clearInterval(AppState.timerTick);

  DOM.btnPause.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <rect x="2.5" y="2" width="4" height="12" rx="1"/>
      <rect x="9.5" y="2" width="4" height="12" rx="1"/>
    </svg> Pause`;

  setTimeout(() => generateNewArray(), 120);
}

// ═══════════════════════════════════════════════════════════════
//  METRICS TOGGLE
// ═══════════════════════════════════════════════════════════════

function bindMetricsToggle() {
  DOM.metricsToggle.addEventListener('click', () => {
    const expanded = DOM.metricsToggle.getAttribute('aria-expanded') === 'true';
    DOM.metricsToggle.setAttribute('aria-expanded', String(!expanded));
    DOM.metricsPanel.classList.toggle('collapsed', expanded);
    if (DOM.metricsChevron) DOM.metricsChevron.classList.toggle('rotated', expanded);
  });
}

// ═══════════════════════════════════════════════════════════════
//  CUSTOM ARRAY MODAL
// ═══════════════════════════════════════════════════════════════

let _modalTags = [];

function bindCustomModal() {
  // Open
  DOM.btnCustomInput.addEventListener('click', openCustomModal);

  // Close buttons
  DOM.btnModalClose.addEventListener('click',  closeCustomModal);
  DOM.btnModalCancel.addEventListener('click', closeCustomModal);

  // Backdrop click to close
  DOM.modalCustom.addEventListener('click', e => {
    if (e.target === DOM.modalCustom) closeCustomModal();
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !DOM.modalCustom.classList.contains('hidden')) {
      closeCustomModal();
    }
  });

  // Click on tag-field focuses input
  DOM.tagField.addEventListener('click', () => DOM.tagRawInput.focus());

  // Tag input key handling
  DOM.tagRawInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      const raw = DOM.tagRawInput.value.trim().replace(/,/g, '');
      if (raw) {
        if (_addTag(raw)) { DOM.tagRawInput.value = ''; _clearModalError(); }
      }
    } else if (e.key === 'Backspace' && !DOM.tagRawInput.value && _modalTags.length > 0) {
      _modalTags.pop();
      _renderModalTags();
    }
  });

  // Live parse on comma/space input
  DOM.tagRawInput.addEventListener('input', e => {
    const val = e.target.value;
    if (val.includes(',') || (val.includes(' ') && val.trim())) {
      const parts = val.split(/[,\s]+/).filter(Boolean);
      const pending = (val.endsWith(',') || val.endsWith(' ')) ? '' : parts.pop();
      parts.forEach(p => { if (p) _addTag(p); });
      e.target.value = pending || '';
      _clearModalError();
    }
  });

  // Clear all
  DOM.btnModalClear.addEventListener('click', () => {
    _modalTags = [];
    _renderModalTags();
    _clearModalError();
    DOM.tagRawInput.value = '';
  });

  // Apply
  DOM.btnModalApply.addEventListener('click', _applyCustomArray);
}

function openCustomModal() {
  _modalTags = [];
  DOM.tagRawInput.value = '';
  _renderModalTags();
  _clearModalError();
  DOM.modalCustom.classList.remove('hidden');
  requestAnimationFrame(() => DOM.tagRawInput.focus());
}

function closeCustomModal() {
  DOM.modalCustom.classList.add('hidden');
  _modalTags = [];
}

function _addTag(rawVal) {
  const num = parseInt(rawVal, 10);
  if (isNaN(num) || num < 1 || num > 100) {
    _showModalError(`"${rawVal}" is invalid — must be a whole number 1–100`);
    return false;
  }
  if (_modalTags.length >= 200) {
    _showModalError('Maximum 200 values reached');
    return false;
  }
  _modalTags.push(num);
  _renderModalTags();
  return true;
}

function _renderModalTags() {
  // Remove existing tag bubbles
  DOM.tagField.querySelectorAll('.tag-bubble').forEach(t => t.remove());

  // Re-insert before the input
  _modalTags.forEach((num, i) => {
    const bubble = document.createElement('div');
    bubble.className = 'tag-bubble';
    bubble.innerHTML = `
      <span>${num}</span>
      <button class="tag-remove" data-idx="${i}" aria-label="Remove ${num}" type="button">×</button>
    `;
    // Remove on click
    bubble.querySelector('.tag-remove').addEventListener('click', () => {
      _modalTags.splice(i, 1);
      _renderModalTags();
    });
    DOM.tagField.insertBefore(bubble, DOM.tagRawInput);
  });

  DOM.tagCount.textContent = `${_modalTags.length} value${_modalTags.length !== 1 ? 's' : ''}`;
}

function _applyCustomArray() {
  // Parse any pending input
  const raw = DOM.tagRawInput.value.trim().replace(/,/g, '');
  if (raw) { _addTag(raw); DOM.tagRawInput.value = ''; }

  if (_modalTags.length === 0) {
    _showModalError('Please add at least one number');
    return;
  }

  AppState.sourceArray = [..._modalTags];
  AppState.arraySize   = _modalTags.length;

  // Sync size slider (clamped to its range)
  DOM.sliderSize.value     = Math.min(200, Math.max(10, _modalTags.length));
  DOM.valSize.textContent  = _modalTags.length;
  updateSliderFill(DOM.sliderSize);

  generateNewArray(true); // use existing sourceArray
  closeCustomModal();
  showToast(`Custom array of ${_modalTags.length} values applied!`, 'success');
}

function _showModalError(msg) {
  DOM.modalError.textContent = msg;
  DOM.modalError.classList.remove('hidden');
}
function _clearModalError() {
  DOM.modalError.classList.add('hidden');
  DOM.modalError.textContent = '';
}
