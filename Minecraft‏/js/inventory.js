/* ============================================================
   inventory.js — the player's pack
   Pure state: which tiles are held (with counts) and which one
   is selected for building. No DOM in here — ui.js renders it,
   game.js subscribes through onChange.
   ============================================================ */
'use strict';

const Inventory = {
  counts: {},        // tile type -> how many are held
  order: [],         // slot order (first collected shows first)
  selected: null,    // tile type currently in hand for building
  onChange: null,    // set by game.js — called after every change

  add(type) {
    this.counts[type] = (this.counts[type] || 0) + 1;
    if (!this.order.includes(type)) this.order.push(type);
    this.emit();
  },

  /* Take one tile out (for placing). Returns false when empty. */
  take(type) {
    if (!this.counts[type]) return false;
    this.counts[type] -= 1;
    if (this.counts[type] === 0) {
      delete this.counts[type];
      this.order = this.order.filter((t) => t !== type);
      if (this.selected === type) this.selected = null;
    }
    this.emit();
    return true;
  },

  /* Click a slot: take it in hand (click again to put it away). */
  select(type) {
    if (!this.counts[type]) return;
    this.selected = this.selected === type ? null : type;
    this.emit();
  },

  clearSelection() {
    if (this.selected === null) return;
    this.selected = null;
    this.emit();
  },

  reset() {
    this.counts = {};
    this.order = [];
    this.selected = null;
    this.emit();
  },

  total() {
    return Object.values(this.counts).reduce((sum, n) => sum + n, 0);
  },

  emit() {
    if (this.onChange) this.onChange(this);
  },
};
