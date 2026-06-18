// Persists world chunks, player and inventory in LocalStorage.
const SAVE_KEY = 'mc2d_save_v1';

const SaveSystem = {
  save(state) {
    try {
      // Stringify only modified chunks; full world is regenerated from seed for unmodified ones.
      const data = {
        seed: state.world.seed,
        modified: state.world.serializeModified(),
        player: state.player.serialize(),
        inventory: state.inventory.serialize(),
        time: state.world.time,
        achievements: Array.from(state.achievements || []),
        xp: state.player.xp,
        level: state.player.level,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) { console.error('Save failed', e); return false; }
  },
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  },
  clear() { localStorage.removeItem(SAVE_KEY); }
};
