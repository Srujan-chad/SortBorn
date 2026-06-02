/**
 * utils.js — Shared utilities for SortViz
 * delay(), randomArray(), clamp(), AnimationController
 */

'use strict';

// ─── Delay Helper ───────────────────────────────────────────────────────────

/**
 * Async delay that respects the animation controller state.
 * @param {number} ms - Milliseconds to wait
 * @param {AnimationController} ctrl - The controller to check
 * @returns {Promise<void>}
 */
async function delay(ms, ctrl) {
  if (ctrl.stopped) throw new DOMException('Sorting stopped.', 'AbortError');

  return new Promise((resolve, reject) => {
    let rafId = null;
    let timeoutId = null;

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };

    const check = () => {
      if (ctrl.stopped) {
        cleanup();
        reject(new DOMException('Sorting stopped.', 'AbortError'));
        return;
      }
      if (!ctrl.paused) {
        cleanup();
        resolve();
      } else {
        rafId = requestAnimationFrame(check);
      }
    };

    timeoutId = setTimeout(() => {
      if (ctrl.stopped) {
        cleanup();
        reject(new DOMException('Sorting stopped.', 'AbortError'));
        return;
      }
      if (ctrl.paused) {
        rafId = requestAnimationFrame(check);
      } else {
        resolve();
      }
    }, ms);
  });
}

// ─── AnimationController ────────────────────────────────────────────────────

/**
 * Central state machine controlling Play/Pause/Stop lifecycle.
 */
class AnimationController {
  constructor() {
    this.paused  = false;
    this.stopped = false;
  }

  pause()  { this.paused = true;  }
  resume() { this.paused = false; }
  stop()   { this.stopped = true; this.paused = false; }

  reset() {
    this.paused  = false;
    this.stopped = false;
  }

  get isRunning() { return !this.stopped && !this.paused; }
}

// ─── Array Helpers ──────────────────────────────────────────────────────────

/**
 * Generate a random integer array of given size.
 * Values between minVal and maxVal (inclusive).
 */
function randomArray(size, minVal = 5, maxVal = 100) {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal
  );
}

/**
 * Deep clone an array (one level).
 */
function cloneArray(arr) { return arr.slice(); }

/**
 * Clamp a number between min and max.
 */
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

// ─── Algorithm Metadata ─────────────────────────────────────────────────────

const ALGO_META = {
  bubble:    { name: 'Bubble Sort',    complexity: 'O(n²)',        spaceComplexity: 'O(1)' },
  insertion: { name: 'Insertion Sort', complexity: 'O(n²)',        spaceComplexity: 'O(1)' },
  selection: { name: 'Selection Sort', complexity: 'O(n²)',        spaceComplexity: 'O(1)' },
  quick:     { name: 'Quick Sort',     complexity: 'O(n log n)',   spaceComplexity: 'O(log n)' },
  merge:     { name: 'Merge Sort',     complexity: 'O(n log n)',   spaceComplexity: 'O(n)' },
};

// ─── Toast System ───────────────────────────────────────────────────────────

let _toastTimeout = null;

function showToast(msg, type = 'default', duration = 2800) {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(_toastTimeout);
  el.textContent = msg;
  el.className = `toast ${type}`;
  // Force reflow
  el.offsetHeight; // eslint-disable-line no-unused-expressions
  el.classList.add('show');
  _toastTimeout = setTimeout(() => {
    el.classList.remove('show');
  }, duration);
}
