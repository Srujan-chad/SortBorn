/**
 * visualizer.js — Bar Chart Rendering Engine  v2.0
 *
 * Features:
 *  - Bar gradient + glow via CSS data-state attributes
 *  - Smart overlay labels (slow-mode): positioned via clientWidth math
 *  - shimmerComplete(): left-to-right shimmer sweep on sort finish
 *  - updateTheme(): live CSS variable overrides
 */

'use strict';

// ── State text for overlay labels ────────────────────────────────────────────

const LABEL_STATE_TEXT = {
  compare:  'Cmp',
  swap:     'Swap',
  pivot:    'Pivot',
  sorted:   '✓',
};

// ── Visualizer Class ─────────────────────────────────────────────────────────

class Visualizer {
  /**
   * @param {string} chartId     - .bar-chart container ID
   * @param {string} progressId  - .progress-bar element ID
   * @param {string} comparId    - comparisons metric element ID
   * @param {string} accessId    - array accesses metric element ID
   * @param {string} timeId      - execution time metric element ID
   * @param {string} algoNameId  - panel algorithm name element ID
   * @param {string} complexId   - complexity badge element ID
   * @param {string} overlayId   - .bar-overlay container ID (for slow-mode labels)
   */
  constructor(chartId, progressId, comparId, accessId, timeId, algoNameId, complexId, overlayId) {
    this.chart      = document.getElementById(chartId);
    this.progressEl = document.getElementById(progressId);
    this.comparEl   = document.getElementById(comparId);
    this.accessEl   = document.getElementById(accessId);
    this.timeEl     = document.getElementById(timeId);
    this.algoNameEl = document.getElementById(algoNameId);
    this.complexEl  = document.getElementById(complexId);
    this.overlay    = document.getElementById(overlayId);

    this._bars      = [];      // .bar div elements
    this._labels    = [];      // .bar-label span elements in overlay
    this._sorted    = new Set();
    this._array     = [];
    this._maxVal    = 1;
    this._startTime = null;

    // Cache chart padding (must match CSS .bar-chart padding)
    this._padTop  = 32;
    this._padBot  = 8;
    this._padL    = 14;
    this._padR    = 14;
  }

  // ── Initialization ────────────────────────────────────────────────────────

  /**
   * Initialize bar chart and overlay from a new array.
   * @param {number[]} arr
   */
  init(arr) {
    this._array  = arr.slice();
    this._maxVal = Math.max(...arr) || 1;
    this._sorted = new Set();
    this._startTime = null;
    this._buildBars();
    this.resetMetrics();
  }

  _buildBars() {
    const arr = this._array;
    const n   = arr.length;

    // Clear
    this.chart.innerHTML = '';
    if (this.overlay) this.overlay.innerHTML = '';
    this._bars   = [];
    this._labels = [];

    // Gap sizing
    const gapPx = n > 120 ? 0 : n > 60 ? 1 : 2;
    this.chart.style.gap = `${gapPx}px`;

    for (let i = 0; i < n; i++) {
      // Bar element
      const bar = document.createElement('div');
      bar.className    = 'bar';
      bar.style.height = `${(arr[i] / this._maxVal) * 100}%`;
      bar.dataset.state = 'default';
      bar.dataset.idx   = i;
      this._bars.push(bar);
      this.chart.appendChild(bar);

      // Overlay label
      if (this.overlay) {
        const lbl = document.createElement('span');
        lbl.className = 'bar-label';
        this.overlay.appendChild(lbl);
        this._labels.push(lbl);
      } else {
        this._labels.push(null);
      }
    }
  }

  // ── Frame Rendering ───────────────────────────────────────────────────────

  /**
   * Update heights, bar states, overlay labels, progress.
   * @param {number[]} arr       - Current array
   * @param {Array<{index,state}>} highlights
   * @param {object} metrics     - { comparisons, accesses }
   * @param {object} [opts]      - { markSorted?, markAllSorted? }
   */
  renderFrame(arr, highlights = [], metrics = {}, opts = {}) {
    const n = arr.length;

    // 1. Update heights
    for (let i = 0; i < n; i++) {
      const bar = this._bars[i];
      if (!bar) continue;
      const h = `${(arr[i] / this._maxVal) * 100}%`;
      if (bar.style.height !== h) bar.style.height = h;
    }

    // 2. Reset non-sorted bars to default state; clear all labels
    for (let i = 0; i < this._bars.length; i++) {
      if (!this._sorted.has(i)) {
        this._bars[i].dataset.state = 'default';
      }
      if (this._labels[i]) this._labels[i].style.opacity = '0';
    }

    // 3. Apply highlight states
    for (const { index, state } of highlights) {
      const bar = this._bars[index];
      if (!bar) continue;
      if (this._sorted.has(index) && state !== 'sorted') continue;
      bar.dataset.state = state;
    }

    // 4. Sorted markers
    if (opts.markAllSorted) {
      for (let i = 0; i < this._bars.length; i++) {
        this._sorted.add(i);
        this._bars[i].dataset.state = 'sorted';
      }
    } else if (opts.markSorted !== undefined) {
      const idx = opts.markSorted;
      this._sorted.add(idx);
      if (this._bars[idx]) this._bars[idx].dataset.state = 'sorted';
    }

    // 5. Progress bar
    const pct = (this._sorted.size / this._bars.length) * 100;
    if (this.progressEl) this.progressEl.style.width = `${pct}%`;

    // 6. Metrics
    this._updateMetrics(metrics);

    // 7. Overlay labels (slow mode)
    this._updateOverlayLabels(arr, highlights);
  }

  // ── Overlay Labels ────────────────────────────────────────────────────────

  _updateOverlayLabels(arr, highlights) {
    if (!this.overlay || !document.body.classList.contains('slow-mode')) return;
    if (highlights.length === 0) return;

    const chartW  = this.chart.clientWidth;
    const chartH  = this.chart.clientHeight;
    const n       = this._bars.length;
    if (n === 0 || chartW === 0 || chartH === 0) return;

    // Determine gap
    const gapPx   = n > 120 ? 0 : n > 60 ? 1 : 2;
    const vizW    = chartW - this._padL - this._padR;
    const vizH    = chartH - this._padTop - this._padBot;
    const totalGap = gapPx * (n - 1);
    const barW    = (vizW - totalGap) / n;

    for (const { index, state } of highlights) {
      if (state === 'sorted' || state === 'default') continue;
      const lbl = this._labels[index];
      if (!lbl) continue;

      // X: center of bar i
      const x = this._padL + index * (barW + gapPx) + barW / 2;

      // Y: top of bar (from chart top), minus label height
      const pct  = arr[index] / this._maxVal;
      const barH = pct * vizH;
      const y    = this._padTop + (vizH - barH) - 28;

      const stateText = LABEL_STATE_TEXT[state] || state;
      lbl.textContent  = `${arr[index]} · i:${index} · ${stateText}`;
      lbl.dataset.state = state;
      lbl.style.left   = `${x}px`;
      lbl.style.top    = `${Math.max(2, y)}px`;
      lbl.style.opacity = '1';
    }
  }

  // ── Metrics ───────────────────────────────────────────────────────────────

  resetMetrics() {
    this._updateMetrics({ comparisons: 0, accesses: 0 });
    this._updateTime(0);
    if (this.progressEl) this.progressEl.style.width = '0%';
  }

  _updateMetrics({ comparisons = 0, accesses = 0 } = {}) {
    if (this.comparEl) this.comparEl.textContent = comparisons.toLocaleString();
    if (this.accessEl) this.accessEl.textContent = accesses.toLocaleString();
  }

  startTimer()  { this._startTime = performance.now(); }

  stopTimer() {
    if (this._startTime === null) return;
    this._updateTime(performance.now() - this._startTime);
  }

  tickTime() {
    if (this._startTime === null) return;
    this._updateTime(performance.now() - this._startTime);
  }

  _updateTime(ms) {
    if (this.timeEl) this.timeEl.textContent = `${ms.toFixed(1)} ms`;
  }

  // ── Algorithm Display ─────────────────────────────────────────────────────

  setAlgo(algoKey) {
    const meta = ALGO_META[algoKey] || {};
    if (this.algoNameEl) this.algoNameEl.textContent = meta.name || algoKey;
    if (this.complexEl)  this.complexEl.textContent  = meta.complexity || '';
  }

  // ── Completion Animation ──────────────────────────────────────────────────

  /**
   * shimmerComplete — left-to-right shimmer sweep across sorted bars.
   * Replaces the old flashComplete method.
   */
  shimmerComplete() {
    // Ensure all are marked sorted
    for (const bar of this._bars) {
      bar.dataset.state = 'sorted';
    }

    // Staggered shimmer
    const totalDuration = Math.min(1200, this._bars.length * 5);
    const perBar = totalDuration / Math.max(this._bars.length, 1);

    this._bars.forEach((bar, i) => {
      setTimeout(() => {
        bar.classList.add('shimmer');
        setTimeout(() => {
          bar.classList.remove('shimmer');
        }, 600);
      }, Math.floor(i * perBar));
    });
  }

  // Keep alias for backward compat if anything still calls flashComplete
  flashComplete() { this.shimmerComplete(); }

  // ── Theme ─────────────────────────────────────────────────────────────────

  /**
   * Update bar color CSS variables.
   * @param {{ default?: string, compare?: string, swap?: string, sorted?: string }} colors
   */
  static updateTheme(colors) {
    const root = document.documentElement;
    if (colors.default) root.style.setProperty('--color-bar-default', colors.default);
    if (colors.compare) root.style.setProperty('--color-bar-compare', colors.compare);
    if (colors.swap)    root.style.setProperty('--color-bar-swap',    colors.swap);
    if (colors.sorted)  root.style.setProperty('--color-bar-sorted',  colors.sorted);
  }
}
