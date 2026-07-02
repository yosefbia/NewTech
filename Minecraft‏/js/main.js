/* ============================================================
   main.js — boot
   Reads the world options from the URL (set by the landing
   page) and starts the game. No params = the classic world.
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  Game.init({
    mode: params.get('mode') === 'random' ? 'random' : 'classic',
    cols: clampInt(params.get('cols'), WORLD_LIMITS.minCols, WORLD_LIMITS.maxCols, WORLD_DEFAULT.cols),
    rows: clampInt(params.get('rows'), WORLD_LIMITS.minRows, WORLD_LIMITS.maxRows, WORLD_DEFAULT.rows),
  });
});
