/* ============================================================
   landing.js — landing page
   Size presets + the "random world" form. The classic world
   button is a plain link, it needs no JS.
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('world-form');
  const colsInput = document.getElementById('cols-input');
  const rowsInput = document.getElementById('rows-input');
  const presets = [...document.querySelectorAll('.preset')];

  for (const chip of presets) {
    chip.addEventListener('click', () => {
      colsInput.value = chip.dataset.cols;
      rowsInput.value = chip.dataset.rows;
      presets.forEach((p) => p.classList.toggle('selected', p === chip));
    });
  }

  /* Typing a custom size unselects the preset chips. */
  for (const input of [colsInput, rowsInput]) {
    input.addEventListener('input', () => {
      presets.forEach((p) => p.classList.remove('selected'));
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cols = clampInt(colsInput.value, WORLD_LIMITS.minCols, WORLD_LIMITS.maxCols, WORLD_DEFAULT.cols);
    const rows = clampInt(rowsInput.value, WORLD_LIMITS.minRows, WORLD_LIMITS.maxRows, WORLD_DEFAULT.rows);
    window.location.href = `game.html?mode=random&cols=${cols}&rows=${rows}`;
  });
});
