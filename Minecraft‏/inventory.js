// Inventory with 9-slot hotbar + 27-slot main grid. Items stack up to 64; tools don't stack.
const INV_SIZE = 36;
const HOTBAR_SIZE = 9;
const STACK_MAX = 64;

class Inventory {
  constructor() {
    this.slots = new Array(INV_SIZE).fill(null); // {key, count, dur?}
    this.activeIndex = 0;
  }

  serialize() {
    return { slots: this.slots, active: this.activeIndex };
  }
  load(data) {
    if (!data) return;
    this.slots = data.slots && data.slots.length === INV_SIZE ? data.slots : new Array(INV_SIZE).fill(null);
    this.activeIndex = data.active || 0;
  }

  active() { return this.slots[this.activeIndex]; }
  setActive(i) { this.activeIndex = ((i % HOTBAR_SIZE) + HOTBAR_SIZE) % HOTBAR_SIZE; }

  isTool(key) {
    const def = itemDef(key);
    return def && def.tool;
  }

  add(key, count = 1) {
    const def = itemDef(key);
    if (!def) return count;
    if (this.isTool(key)) {
      // tools don't stack
      for (let i = 0; i < INV_SIZE; i++) {
        if (!this.slots[i]) { this.slots[i] = { key, count: 1, dur: def.durability }; count--; if (count <= 0) return 0; }
      }
      return count;
    }
    // first existing stacks
    for (let i = 0; i < INV_SIZE && count > 0; i++) {
      const s = this.slots[i];
      if (s && s.key === key && s.count < STACK_MAX) {
        const space = STACK_MAX - s.count;
        const put = Math.min(space, count);
        s.count += put; count -= put;
      }
    }
    // then new slots
    for (let i = 0; i < INV_SIZE && count > 0; i++) {
      if (!this.slots[i]) {
        const put = Math.min(STACK_MAX, count);
        this.slots[i] = { key, count: put };
        count -= put;
      }
    }
    return count;
  }

  remove(key, count = 1) {
    for (let i = 0; i < INV_SIZE && count > 0; i++) {
      const s = this.slots[i];
      if (s && s.key === key) {
        const take = Math.min(s.count, count);
        s.count -= take; count -= take;
        if (s.count <= 0) this.slots[i] = null;
      }
    }
    return count === 0;
  }

  countOf(key) {
    let n = 0;
    for (const s of this.slots) if (s && s.key === key) n += s.count;
    return n;
  }

  consumeActive() {
    const s = this.active();
    if (!s) return;
    s.count--;
    if (s.count <= 0) this.slots[this.activeIndex] = null;
  }

  damageActive(amount = 1) {
    const s = this.active();
    if (!s || !this.isTool(s.key)) return;
    s.dur -= amount;
    if (s.dur <= 0) this.slots[this.activeIndex] = null;
  }
}
