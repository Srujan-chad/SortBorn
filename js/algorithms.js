/**
 * algorithms.js — Asynchronous Sorting Algorithm Engine
 *
 * Each algorithm is an async generator-compatible function that:
 *  1. Operates directly on the passed array
 *  2. Calls renderFrame(array, highlights, metrics) to update UI
 *  3. Awaits delay() to respect speed/pause/stop controls
 *
 * Highlight schema: { index, state }
 *   state: 'compare' | 'swap' | 'sorted' | 'pivot'
 *
 * Metrics schema: { comparisons, accesses }
 */

'use strict';

// ─── Common Comparison ──────────────────────────────────────────────────────

/**
 * Compare two values respecting sort order.
 * @param {number} a
 * @param {number} b
 * @param {boolean} ascending
 * @returns {boolean} true if a should come before b
 */
function shouldSwap(a, b, ascending) {
  return ascending ? a > b : a < b;
}

// ──────────────────────────────────────────────────────────────────────────────
// BUBBLE SORT
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Bubble Sort — O(n²) time, O(1) space
 * Optimized with early-exit flag.
 */
async function bubbleSort(arr, renderFrame, ctrl, speedFn, ascending, metrics) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      metrics.comparisons++;
      metrics.accesses += 2;

      await renderFrame(arr, [
        { index: j,     state: 'compare' },
        { index: j + 1, state: 'compare' },
      ], metrics);
      await delay(speedFn(), ctrl);

      if (shouldSwap(arr[j], arr[j + 1], ascending)) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        metrics.accesses += 4;
        swapped = true;

        await renderFrame(arr, [
          { index: j,     state: 'swap' },
          { index: j + 1, state: 'swap' },
        ], metrics);
        await delay(speedFn(), ctrl);
      }
    }

    // Mark the last element of this pass as sorted
    await renderFrame(arr, [
      { index: n - i - 1, state: 'sorted' },
    ], metrics, { markSorted: n - i - 1 });
    await delay(speedFn(), ctrl);

    if (!swapped) break;
  }

  // Mark all remaining as sorted
  await renderFrame(arr, [], metrics, { markAllSorted: true });
}

// ──────────────────────────────────────────────────────────────────────────────
// INSERTION SORT
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Insertion Sort — O(n²) time, O(1) space
 */
async function insertionSort(arr, renderFrame, ctrl, speedFn, ascending, metrics) {
  const n = arr.length;

  await renderFrame(arr, [{ index: 0, state: 'sorted' }], metrics, { markSorted: 0 });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    metrics.accesses++;
    let j = i - 1;

    await renderFrame(arr, [{ index: i, state: 'compare' }], metrics);
    await delay(speedFn(), ctrl);

    while (j >= 0 && shouldSwap(arr[j], key, ascending)) {
      metrics.comparisons++;
      metrics.accesses += 2;

      arr[j + 1] = arr[j];
      metrics.accesses++;
      j--;

      await renderFrame(arr, [
        { index: j + 1, state: 'swap' },
        { index: j + 2, state: 'swap' },
      ], metrics);
      await delay(speedFn(), ctrl);
    }

    arr[j + 1] = key;
    metrics.accesses++;

    await renderFrame(arr, [{ index: j + 1, state: 'sorted' }], metrics, { markSorted: j + 1 });
    await delay(speedFn(), ctrl);
  }

  await renderFrame(arr, [], metrics, { markAllSorted: true });
}

// ──────────────────────────────────────────────────────────────────────────────
// SELECTION SORT
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Selection Sort — O(n²) time, O(1) space
 */
async function selectionSort(arr, renderFrame, ctrl, speedFn, ascending, metrics) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let extremeIdx = i;

    for (let j = i + 1; j < n; j++) {
      metrics.comparisons++;
      metrics.accesses += 2;

      await renderFrame(arr, [
        { index: extremeIdx, state: 'pivot' },
        { index: j,          state: 'compare' },
      ], metrics);
      await delay(speedFn(), ctrl);

      if (shouldSwap(arr[extremeIdx], arr[j], ascending)) {
        extremeIdx = j;
      }
    }

    if (extremeIdx !== i) {
      [arr[i], arr[extremeIdx]] = [arr[extremeIdx], arr[i]];
      metrics.accesses += 4;

      await renderFrame(arr, [
        { index: i,          state: 'swap' },
        { index: extremeIdx, state: 'swap' },
      ], metrics);
      await delay(speedFn(), ctrl);
    }

    await renderFrame(arr, [{ index: i, state: 'sorted' }], metrics, { markSorted: i });
    await delay(speedFn(), ctrl);
  }

  await renderFrame(arr, [], metrics, { markAllSorted: true });
}

// ──────────────────────────────────────────────────────────────────────────────
// QUICK SORT
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Quick Sort — O(n log n) avg, O(n²) worst, O(log n) space
 * Uses Lomuto partition scheme with median-of-three pivot.
 */
async function quickSort(arr, renderFrame, ctrl, speedFn, ascending, metrics) {
  async function partition(low, high) {
    // Median-of-three pivot selection
    const mid = Math.floor((low + high) / 2);
    if (shouldSwap(arr[low], arr[mid], ascending)) {
      [arr[low], arr[mid]] = [arr[mid], arr[low]]; metrics.accesses += 4;
    }
    if (shouldSwap(arr[low], arr[high], ascending)) {
      [arr[low], arr[high]] = [arr[high], arr[low]]; metrics.accesses += 4;
    }
    if (shouldSwap(arr[mid], arr[high], ascending)) {
      [arr[mid], arr[high]] = [arr[high], arr[mid]]; metrics.accesses += 4;
    }
    [arr[mid], arr[high]] = [arr[high], arr[mid]]; metrics.accesses += 4;

    const pivot = arr[high];
    metrics.accesses++;
    let i = low - 1;

    await renderFrame(arr, [{ index: high, state: 'pivot' }], metrics);
    await delay(speedFn(), ctrl);

    for (let j = low; j < high; j++) {
      metrics.comparisons++;
      metrics.accesses++;

      await renderFrame(arr, [
        { index: high, state: 'pivot' },
        { index: j,    state: 'compare' },
      ], metrics);
      await delay(speedFn(), ctrl);

      if (!shouldSwap(arr[j], pivot, ascending)) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        metrics.accesses += 4;

        await renderFrame(arr, [
          { index: high, state: 'pivot' },
          { index: i,    state: 'swap' },
          { index: j,    state: 'swap' },
        ], metrics);
        await delay(speedFn(), ctrl);
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    metrics.accesses += 4;

    await renderFrame(arr, [
      { index: i + 1, state: 'sorted' },
    ], metrics, { markSorted: i + 1 });
    await delay(speedFn(), ctrl);

    return i + 1;
  }

  async function qsort(low, high) {
    if (low < high) {
      const pi = await partition(low, high);
      await qsort(low, pi - 1);
      await qsort(pi + 1, high);
    } else if (low === high) {
      await renderFrame(arr, [{ index: low, state: 'sorted' }], metrics, { markSorted: low });
    }
  }

  await qsort(0, arr.length - 1);
  await renderFrame(arr, [], metrics, { markAllSorted: true });
}

// ──────────────────────────────────────────────────────────────────────────────
// MERGE SORT
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Merge Sort — O(n log n) time, O(n) space
 * Bottom-up iterative variant for cleaner visualization.
 */
async function mergeSort(arr, renderFrame, ctrl, speedFn, ascending, metrics) {
  const n = arr.length;
  const sortedSet = new Set();

  for (let size = 1; size < n; size *= 2) {
    for (let left = 0; left < n - 1; left += 2 * size) {
      const mid   = Math.min(left + size - 1, n - 1);
      const right = Math.min(left + 2 * size - 1, n - 1);

      if (mid < right) {
        await merge(arr, left, mid, right, renderFrame, ctrl, speedFn, ascending, metrics, sortedSet);
      }
    }
  }

  await renderFrame(arr, [], metrics, { markAllSorted: true });
}

async function merge(arr, left, mid, right, renderFrame, ctrl, speedFn, ascending, metrics, sortedSet) {
  const leftArr  = arr.slice(left, mid + 1);
  const rightArr = arr.slice(mid + 1, right + 1);
  metrics.accesses += leftArr.length + rightArr.length;

  let i = 0, j = 0, k = left;

  while (i < leftArr.length && j < rightArr.length) {
    metrics.comparisons++;
    metrics.accesses += 2;

    await renderFrame(arr, [
      { index: left + i, state: 'compare' },
      { index: mid + 1 + j, state: 'compare' },
    ], metrics);
    await delay(speedFn(), ctrl);

    if (!shouldSwap(leftArr[i], rightArr[j], ascending)) {
      arr[k] = leftArr[i++];
    } else {
      arr[k] = rightArr[j++];
    }
    metrics.accesses++;

    await renderFrame(arr, [{ index: k, state: 'swap' }], metrics);
    await delay(speedFn(), ctrl);

    sortedSet.add(k);
    k++;
  }

  while (i < leftArr.length) {
    arr[k] = leftArr[i++];
    metrics.accesses++;
    await renderFrame(arr, [{ index: k, state: 'swap' }], metrics);
    await delay(speedFn(), ctrl);
    sortedSet.add(k);
    k++;
  }

  while (j < rightArr.length) {
    arr[k] = rightArr[j++];
    metrics.accesses++;
    await renderFrame(arr, [{ index: k, state: 'swap' }], metrics);
    await delay(speedFn(), ctrl);
    sortedSet.add(k);
    k++;
  }
}

// ─── Algorithm Dispatch Map ──────────────────────────────────────────────────

const ALGORITHMS = {
  bubble:    bubbleSort,
  insertion: insertionSort,
  selection: selectionSort,
  quick:     quickSort,
  merge:     mergeSort,
};
