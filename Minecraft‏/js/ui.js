/* ============================================================
   ui.js — all DOM work
   Builds the world grid, paints tiles, renders the pack,
   highlights the toolbar and shows status messages. No game
   rules in here — game.js decides, ui.js displays. All state
   changes are CSS classes, never inline styles.
   ============================================================ */
'use strict';

const UI = {
  els: {},
  cells: [],       // cells[row][col] -> the tile <button>

  init() {
    this.els = {
      world: document.getElementById('world'),
      toolbar: document.getElementById('toolbar'),
      toolButtons: [...document.querySelectorAll('#toolbar .tool')],
      slots: document.getElementById('inventory-slots'),
      packCount: document.getElementById('pack-count'),
      status: document.getElementById('status'),
      worldName: document.getElementById('world-name'),
    };
  },

  /* ---------- world ---------- */

  buildWorld(grid) {
    this.els.world.style.setProperty('--cols', grid[0].length);
    this.els.world.replaceChildren();
    this.cells = grid.map((line, r) => line.map((type, c) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.dataset.row = r;
      cell.dataset.col = c;
      this.els.world.appendChild(cell);
      return cell;
    }));
    grid.forEach((line, r) => line.forEach((type, c) => this.paintTile(r, c, type)));
  },

  paintTile(r, c, type, effect) {
    const cell = this.cells[r][c];
    const tile = TILE_TYPES[type];
    cell.className = `tile tile-${type}${tile.empty ? '' : ' solid'}`;
    const hint = tile.empty
      ? 'Open space — pick a block from your pack to build here'
      : `${tile.label} — harvest it with the ${TOOL_TYPES[tile.tool].label}`;
    cell.title = hint;
    cell.setAttribute('aria-label', hint);
    if (effect === 'pop') this.replay(cell, 'pop-in');
    if (effect === 'burst') this.burst(cell);
  },

  shakeTile(r, c) {
    this.replay(this.cells[r][c], 'shake');
  },

  /* Remove + re-add a class so its animation restarts. */
  replay(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  },

  /* Short white flash over a harvested tile. */
  burst(cell) {
    const b = document.createElement('span');
    b.className = 'burst';
    b.addEventListener('animationend', () => b.remove());
    cell.appendChild(b);
  },

  /* ---------- toolbar (buttons are hardcoded in the HTML) ---------- */

  renderToolbar(selectedTool) {
    for (const btn of this.els.toolButtons) {
      const on = btn.dataset.tool === selectedTool;
      btn.classList.toggle('selected', on);
      btn.setAttribute('aria-pressed', String(on));
    }
  },

  /* ---------- pack / inventory ---------- */

  renderInventory(inv) {
    this.els.packCount.textContent = inv.total();
    this.els.slots.replaceChildren();

    if (inv.order.length === 0) {
      const hint = document.createElement('p');
      hint.className = 'empty-hint';
      hint.textContent = 'Empty — harvest some blocks!';
      this.els.slots.appendChild(hint);
      return;
    }

    for (const type of inv.order) {
      const selected = inv.selected === type;
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = `slot${selected ? ' selected' : ''}`;
      slot.dataset.type = type;
      slot.title = `${TILE_TYPES[type].label} × ${inv.counts[type]}`;
      slot.setAttribute('aria-pressed', String(selected));

      const mini = document.createElement('span');
      mini.className = `tile mini tile-${type}`;
      const count = document.createElement('span');
      count.className = 'count';
      count.textContent = inv.counts[type];

      slot.append(mini, count);
      this.els.slots.appendChild(slot);
    }
  },

  /* ---------- header & status ---------- */

  setWorldMeta(name, cols, rows) {
    this.els.worldName.textContent = `${name} · ${cols} × ${rows}`;
  },

  /* 'mine' | 'build' | 'idle' — drives cursors + hover rings. */
  setMode(mode) {
    this.els.world.dataset.mode = mode;
  },

  setStatus(message, kind = 'info') {
    this.els.status.textContent = message;
    this.els.status.dataset.kind = kind;
    this.replay(this.els.status, 'flash');
  },
};
