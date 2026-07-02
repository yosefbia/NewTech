/* ============================================================
   worlds.js — world data
   The hardcoded classic world, a layout parser, the random
   world generator (extra feature) and small grid helpers.
   A grid is a 2D array: grid[row][col] = tile type name.
   ============================================================ */
'use strict';

const Worlds = {

  /* One character per tile — see LAYOUT_CHARS below.
     24 columns x 14 rows: a valley with a pond, sandy shores,
     five trees, rocky cliffs and two caves under the ground. */
  CLASSIC_LAYOUT: [
    '........................',
    '........................',
    '........................',
    '........................',
    '.T..................T.GR',
    'GGGG.T...........T.GGGDR',
    'DDDDGGG........TGGGDDDDR',
    'DDRDDDDGS....SGGDDDDDDRR',
    'RRRRDDDDDWWWWDDDDDDRRRRR',
    'RRRRRRRDDSWWSDDDRRRRRRRR',
    'RRRRCCCCRDSSDRRRRRRRRRRR',
    'RRRRCCCCRRDDRRDRRCCCRRRR',
    'RRRRRRRRRRRRRRRRRCCCRRRR',
    'RRRRRRRRRRRRRRRRRRRRRRRR',
  ],

  LAYOUT_CHARS: {
    '.': 'sky', 'C': 'cave', 'G': 'grass', 'D': 'dirt',
    'S': 'sand', 'R': 'rock', 'T': 'tree', 'W': 'water',
  },

  /* Turn layout strings into a grid, validating as we go. */
  parseLayout(lines) {
    const cols = lines[0].length;
    return lines.map((line, r) => {
      if (line.length !== cols) {
        throw new Error(`Layout row ${r} has ${line.length} tiles, expected ${cols}`);
      }
      return [...line].map((ch, c) => {
        const type = this.LAYOUT_CHARS[ch];
        if (!type) throw new Error(`Unknown layout char "${ch}" at row ${r}, col ${c}`);
        return type;
      });
    });
  },

  classic() {
    return this.parseLayout(this.CLASSIC_LAYOUT);
  },

  /* ----------------------------------------------------------
     Random world ("Unleash the Ninja"). Rules kept reasonable:
     trees only grow on grass, rocks stay underground, water
     settles in the dips and nothing floats in the air.
     ---------------------------------------------------------- */
  generate(cols, rows) {
    const grid = Array.from({ length: rows }, () => Array(cols).fill('sky'));
    const highest = 3;                          // leave sky room for building
    const lowest = Math.max(highest, rows - 5); // leave ground room for caves

    /* 1) Surface height per column — a gentle random walk. */
    const surface = [];
    let level = this.randInt(highest, lowest);
    for (let c = 0; c < cols; c++) {
      surface.push(level);
      const roll = Math.random();
      if (roll < 0.22) level -= 1;
      else if (roll > 0.78) level += 1;
      level = Math.min(lowest, Math.max(highest, level));
    }

    /* 2) Fill each column: grass cap, some dirt, rock below. */
    for (let c = 0; c < cols; c++) {
      const dirtDepth = 2 + this.randInt(0, 1);
      for (let r = surface[c]; r < rows; r++) {
        if (r === surface[c]) grid[r][c] = 'grass';
        else if (r <= surface[c] + dirtDepth) grid[r][c] = 'dirt';
        else grid[r][c] = Math.random() < 0.9 ? 'rock' : 'dirt';
      }
    }

    /* 3) Water settles below the most common ground level, with
       sandy pond floors and shores. Ponds stay max 3 deep. */
    const waterTop = this.commonestLevel(surface) + 1;
    const wet = new Set();
    for (let c = 0; c < cols; c++) {
      let depth = surface[c] - waterTop;
      if (depth < 1) continue;
      if (depth > 3) {                          // raise deep floors with sand
        for (let r = waterTop + 3; r <= surface[c]; r++) grid[r][c] = 'sand';
        surface[c] = waterTop + 3;
        depth = 3;
      }
      for (let r = waterTop; r < surface[c]; r++) grid[r][c] = 'water';
      grid[surface[c]][c] = 'sand';             // pond floor
      wet.add(c);
    }
    for (const c of wet) {                      // sandy shores next to water
      for (const n of [c - 1, c + 1]) {
        if (n >= 0 && n < cols && !wet.has(n) && grid[surface[n]][n] === 'grass') {
          grid[surface[n]][n] = 'sand';
        }
      }
    }

    /* 4) Trees grow on grass only, never in adjacent columns. */
    let lastTree = -2;
    let planted = 0;
    for (let c = 0; c < cols; c++) {
      const top = surface[c] - 1;
      if (top < 0 || grid[surface[c]][c] !== 'grass') continue;
      if (c - lastTree <= 1) continue;
      if (Math.random() < 0.22) {
        grid[top][c] = 'tree';
        lastTree = c;
        planted += 1;
      }
    }
    if (planted === 0) {                        // guarantee at least one tree
      for (let c = 0; c < cols; c++) {
        const top = surface[c] - 1;
        if (top >= 0 && grid[surface[c]][c] === 'grass') {
          grid[top][c] = 'tree';
          break;
        }
      }
    }

    /* 5) Carve a few caves — deep enough to keep the surface
       crust intact, never under water, never through the
       bottom row. */
    const caveCount = Math.max(1, Math.round((cols * rows) / 160));
    for (let i = 0; i < caveCount; i++) {
      const cx = this.randInt(1, cols - 2);
      if (wet.has(cx)) continue;
      const cyLow = surface[cx] + 3;
      const cyHigh = rows - 2;
      if (cyLow > cyHigh) continue;
      const cy = this.randInt(cyLow, cyHigh);
      const rx = this.randInt(1, 3);
      const ry = this.randInt(1, 2);
      for (let r = cy - ry; r <= cy + ry; r++) {
        for (let c = cx - rx; c <= cx + rx; c++) {
          if (r < 1 || r > rows - 2 || c < 0 || c >= cols) continue;
          if (wet.has(c)) continue;             // keep pond floors solid
          if (r <= surface[c] + 1) continue;    // keep the surface crust
          const dx = (c - cx) / (rx + 0.5);
          const dy = (r - cy) / (ry + 0.5);
          if (dx * dx + dy * dy <= 1) grid[r][c] = 'cave';
        }
      }
    }

    return grid;
  },

  /* Per-column ground level (topmost grass/dirt/sand/rock).
     Emptied cells above it show sky, below it show cave. */
  surfaceRows(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    const surface = [];
    for (let c = 0; c < cols; c++) {
      let r = 0;
      while (r < rows && !this.isGround(grid[r][c])) r += 1;
      surface.push(r);
    }
    return surface;
  },

  isGround(type) {
    return type === 'grass' || type === 'dirt' || type === 'sand' || type === 'rock';
  },

  /* ---------- small helpers ---------- */

  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  commonestLevel(surface) {
    const counts = new Map();
    let best = surface[0];
    let bestCount = 0;
    for (const s of surface) {
      const n = (counts.get(s) || 0) + 1;
      counts.set(s, n);
      if (n > bestCount) {
        best = s;
        bestCount = n;
      }
    }
    return best;
  },
};
