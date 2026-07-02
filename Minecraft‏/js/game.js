/* ============================================================
   game.js — the controller
   Holds the world state and the rules of a turn. Everything
   the player does funnels through here:
   click tool -> click tile -> harvest into pack -> place back.
   ============================================================ */
'use strict';

const Game = {
  grid: [],            // current world: grid[row][col] = tile type
  initialGrid: [],     // snapshot used by resetWorld()
  surface: [],         // per-column ground level (sky above, cave below)
  selectedTool: null,
  worldName: '',
  cols: 0,
  rows: 0,

  /* ---------- setup ---------- */

  init(options) {
    UI.init();
    Inventory.onChange = () => {
      UI.renderInventory(Inventory);
      this.syncMode();
    };
    this.bindEvents();
    this.loadWorld(options);
  },

  bindEvents() {
    UI.els.toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.tool');
      if (btn) this.selectTool(btn.dataset.tool);
    });
    UI.els.world.addEventListener('click', (e) => {
      const cell = e.target.closest('.tile');
      if (cell) this.clickTile(Number(cell.dataset.row), Number(cell.dataset.col));
    });
    UI.els.slots.addEventListener('click', (e) => {
      const slot = e.target.closest('.slot');
      if (slot) this.selectFromInventory(slot.dataset.type);
    });
    document.getElementById('reset-btn').addEventListener('click', () => this.resetWorld());
    document.getElementById('new-world-btn').addEventListener('click', () => this.newWorld());
    document.addEventListener('keydown', (e) => this.onKey(e));
  },

  loadWorld({ mode, cols, rows }) {
    if (mode === 'random') {
      this.grid = Worlds.generate(cols, rows);
      this.worldName = 'Random world';
    } else {
      this.grid = Worlds.classic();
      this.worldName = 'Classic valley';
    }
    this.rows = this.grid.length;
    this.cols = this.grid[0].length;
    this.initialGrid = this.grid.map((row) => [...row]);
    this.surface = Worlds.surfaceRows(this.grid);
    this.selectedTool = null;
    Inventory.reset();
    UI.buildWorld(this.grid);
    UI.renderToolbar(null);
    UI.setWorldMeta(this.worldName, this.cols, this.rows);
    this.syncMode();
    UI.setStatus('Pick a tool on the left to start harvesting — keys 1-4 work too.');
  },

  /* ---------- selecting ---------- */

  selectTool(tool) {
    this.selectedTool = this.selectedTool === tool ? null : tool;
    Inventory.clearSelection();          // mining and building don't mix
    UI.renderToolbar(this.selectedTool);
    this.syncMode();
    if (this.selectedTool) {
      const t = TOOL_TYPES[this.selectedTool];
      UI.setStatus(`${t.label} ready — it harvests ${this.listLabels(t.removes)}.`);
    } else {
      UI.setStatus('Tool put away.');
    }
  },

  selectFromInventory(type) {
    this.selectedTool = null;
    UI.renderToolbar(null);
    Inventory.select(type);
    if (Inventory.selected) {
      UI.setStatus(`${TILE_TYPES[type].label} in hand — click any empty spot to place it.`);
    } else {
      UI.setStatus(`${TILE_TYPES[type].label} put back in the pack.`);
    }
  },

  onKey(e) {
    if (e.key === 'Escape') {
      this.selectedTool = null;
      Inventory.clearSelection();
      UI.renderToolbar(null);
      this.syncMode();
      UI.setStatus('Selection cleared.');
      return;
    }
    const index = Number(e.key) - 1;     // keys 1..4 pick tools in order
    if (Number.isInteger(index) && UI.els.toolButtons[index]) {
      this.selectTool(UI.els.toolButtons[index].dataset.tool);
    }
  },

  /* ---------- a turn ---------- */

  clickTile(r, c) {
    const type = this.grid[r][c];
    if (Inventory.selected) {
      this.placeTile(r, c, type);
    } else if (this.selectedTool) {
      this.harvestTile(r, c, type);
    } else {
      UI.setStatus('First pick a tool (left) or a block from your pack (right).');
    }
  },

  harvestTile(r, c, type) {
    const tile = TILE_TYPES[type];
    if (tile.empty) {
      UI.setStatus('Nothing to harvest there — that spot is empty.');
      return;
    }
    const tool = TOOL_TYPES[this.selectedTool];
    if (!tool.removes.includes(type)) {
      UI.shakeTile(r, c);
      UI.setStatus(`The ${tool.label} can't break ${tile.label} — use the ${TOOL_TYPES[tile.tool].label}.`, 'error');
      return;
    }
    this.grid[r][c] = r < this.surface[c] ? 'sky' : 'cave';
    Inventory.add(type);
    UI.paintTile(r, c, this.grid[r][c], 'burst');
    UI.setStatus(`+1 ${tile.label} — added to your pack.`, 'success');
  },

  placeTile(r, c, type) {
    if (!TILE_TYPES[type].empty) {
      UI.shakeTile(r, c);
      UI.setStatus('You can only build on empty space.', 'error');
      return;
    }
    const placed = Inventory.selected;
    if (!Inventory.take(placed)) return;
    this.grid[r][c] = placed;
    UI.paintTile(r, c, placed, 'pop');
    const left = Inventory.counts[placed] || 0;
    UI.setStatus(`${TILE_TYPES[placed].label} placed${left ? ` — ${left} left` : ' — that was the last one'}.`, 'success');
  },

  /* ---------- header buttons ---------- */

  resetWorld() {
    this.grid = this.initialGrid.map((row) => [...row]);
    this.selectedTool = null;
    Inventory.reset();
    UI.buildWorld(this.grid);
    UI.renderToolbar(null);
    this.syncMode();
    UI.setStatus('World restored to its starting state.');
  },

  newWorld() {
    this.loadWorld({ mode: 'random', cols: this.cols, rows: this.rows });
    UI.setStatus('Fresh world generated — trees on grass, rocks below, water in the dips.', 'success');
  },

  /* ---------- helpers ---------- */

  syncMode() {
    UI.setMode(Inventory.selected ? 'build' : this.selectedTool ? 'mine' : 'idle');
  },

  listLabels(types) {
    return types.map((t) => TILE_TYPES[t].label).join(', ');
  },
};
