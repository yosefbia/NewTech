// Main game loop, input, rendering, UI wiring.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const VIEW_W = canvas.width / BLOCK_SIZE;
const VIEW_H = canvas.height / BLOCK_SIZE;

const input = { keys: {}, mouse: { x: 0, y: 0, left: false, right: false } };

window.addEventListener('keydown', e => {
  input.keys[e.code] = true;
  if (e.code === 'KeyE') toggleInventory();
  if (e.code === 'KeyC') toggleCrafting();
  if (e.code === 'Escape') togglePause();
  if (e.code === 'KeyR' && state.player.dead) state.player.respawn(state.world);
  if (e.code.startsWith('Digit')) {
    const n = parseInt(e.code.slice(5)); if (n >= 1 && n <= 9) state.inventory.setActive(n - 1);
  }
});
window.addEventListener('keyup', e => { input.keys[e.code] = false; });
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('mousedown', e => {
  if (e.button === 0) input.mouse.left = true;
  if (e.button === 2) { input.mouse.right = true; tryPlaceBlock(); }
});
canvas.addEventListener('mouseup', e => {
  if (e.button === 0) input.mouse.left = false;
  if (e.button === 2) input.mouse.right = false;
});
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  input.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
  input.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
});
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  state.inventory.setActive(state.inventory.activeIndex + (e.deltaY > 0 ? 1 : -1));
}, { passive: false });

// --- State ---
const state = {
  world: null,
  player: null,
  inventory: null,
  mobs: null,
  drops: [],          // {x,y,vx,vy,key}
  achievements: new Set(),
  paused: false,
  cam: { x: 0, y: 0 },
  mobSpawnT: 0,
  saveT: 0,
};

function init() {
  const saved = SaveSystem.load();
  state.world = new World(saved ? saved.seed : Date.now() & 0xffff);
  state.world.loadModified(saved && saved.modified);
  state.world.time = saved ? saved.time : 0.3;
  state.player = new Player();
  state.inventory = new Inventory();
  state.mobs = new MobManager();
  if (saved) {
    state.player.load(saved.player);
    state.inventory.load(saved.inventory);
    state.achievements = new Set(saved.achievements || []);
  } else {
    state.player.respawn(state.world);
    // starter items
    state.inventory.add('WOOD_PICK', 1);
    state.inventory.add('WOOD_AXE', 1);
  }
  rebuildHotbar();
  rebuildInventoryUI();
  rebuildCraftingUI();
  document.getElementById('resume').onclick = togglePause;
  document.getElementById('save').onclick = () => { SaveSystem.save(state); toast('World saved'); };
  document.getElementById('reset').onclick = () => { if (confirm('Start a new world? Existing save will be lost.')) { SaveSystem.clear(); location.reload(); } };
}

// --- Achievements ---
const ACHIEVEMENTS = {
  WOOD: 'Getting Wood',
  STONE: 'Stone Age',
  IRON: 'Acquire Hardware',
  DIAMOND: 'DIAMONDS!',
  TREE: 'Chop Chop',
  CRAFT: 'Benchmarking',
  KILL: 'Monster Hunter',
};
function unlock(key) {
  if (state.achievements.has(key)) return;
  state.achievements.add(key);
  toast('Achievement: ' + ACHIEVEMENTS[key]);
}
function toast(msg) {
  const div = document.createElement('div'); div.className = 'ach-toast'; div.textContent = msg;
  document.getElementById('achievements').appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

// --- Interaction ---
function worldFromMouse() {
  return {
    x: Math.floor(input.mouse.x / BLOCK_SIZE + state.cam.x),
    y: Math.floor(input.mouse.y / BLOCK_SIZE + state.cam.y),
  };
}
function inReach(bx, by) {
  const px = state.player.x, py = state.player.y + state.player.h * 0.5;
  return Math.hypot(bx + 0.5 - px, by + 0.5 - py) < 6;
}
function nearTable() {
  const px = Math.floor(state.player.x), py = Math.floor(state.player.y);
  for (let dx = -3; dx <= 3; dx++) for (let dy = -3; dy <= 3; dy++) {
    if (state.world.getBlock(px + dx, py + dy) === BLOCKS.CRAFT.id) return true;
  }
  return false;
}

function activeToolStats() {
  const a = state.inventory.active();
  if (!a) return { tool: null, tier: -1, speed: 0.8, damage: 1 };
  const def = itemDef(a.key);
  if (def && def.tool) return { tool: def.tool, tier: def.tier, speed: def.speed || 1, damage: def.damage || 1 };
  return { tool: null, tier: -1, speed: 0.8, damage: 1 };
}

function tryPlaceBlock() {
  const { x, y } = worldFromMouse();
  if (!inReach(x, y)) return;
  if (state.world.getBlock(x, y) !== BLOCKS.AIR.id) return;
  const a = state.inventory.active();
  if (!a) return;
  const def = itemDef(a.key);
  if (!def || !def.block) return;
  // don't place inside player
  const minX = state.player.x - state.player.w / 2, maxX = state.player.x + state.player.w / 2;
  const minY = state.player.y, maxY = state.player.y + state.player.h;
  if (x + 1 > minX && x < maxX && y + 1 > minY && y < maxY) return;
  state.world.setBlock(x, y, BLOCKS[def.block].id);
  state.inventory.consumeActive();
  playSound('place');
  rebuildHotbar();
}

function updateBreaking(dt) {
  if (!input.mouse.left) { state.player.breakingPos = null; state.player.breakingProgress = 0; return; }
  const { x, y } = worldFromMouse();
  if (!inReach(x, y)) return;
  const id = state.world.getBlock(x, y);
  const def = blockById(id);
  if (id === BLOCKS.AIR.id || def.hardness < 0) return;

  if (!state.player.breakingPos || state.player.breakingPos.x !== x || state.player.breakingPos.y !== y) {
    state.player.breakingPos = { x, y };
    state.player.breakingProgress = 0;
  }
  const tool = activeToolStats();
  let speed = (tool.tool === def.tool) ? tool.speed : 0.4;
  const minTier = def.minTier || 0;
  if (def.tool === 'pickaxe' && tool.tier < minTier) speed = 0; // can't mine
  state.player.breakingProgress += dt * speed / def.hardness;
  if (state.player.breakingProgress >= 1) {
    breakBlock(x, y);
    state.player.breakingProgress = 0;
  }
}

function breakBlock(x, y) {
  const id = state.world.getBlock(x, y);
  const def = blockById(id);
  state.world.setBlock(x, y, BLOCKS.AIR.id);
  playSound('break');
  // drops
  if (def.drops) {
    state.drops.push({ x: x + 0.5, y: y + 0.5, vx: (Math.random() - 0.5) * 2, vy: -3, key: def.drops, age: 0 });
  }
  if (def.leaf && Math.random() < 0.1) {
    state.drops.push({ x: x + 0.5, y: y + 0.5, vx: 0, vy: -2, key: 'SAPLING', age: 0 });
  }
  if (def.leaf && Math.random() < 0.05) {
    state.drops.push({ x: x + 0.5, y: y + 0.5, vx: 0, vy: -2, key: 'APPLE', age: 0 });
  }
  // tool durability
  const a = state.inventory.active();
  if (a && itemDef(a.key) && itemDef(a.key).tool) state.inventory.damageActive(1);
  // achievements + xp
  if (id === BLOCKS.WOOD.id) { unlock('WOOD'); unlock('TREE'); state.player.addXP(1); }
  if (id === BLOCKS.STONE.id) { unlock('STONE'); state.player.addXP(1); }
  if (id === BLOCKS.IRON.id) { unlock('IRON'); state.player.addXP(3); }
  if (id === BLOCKS.DIAMOND.id) { unlock('DIAMOND'); state.player.addXP(8); }
  rebuildHotbar();
}

// --- Drops physics + pickup ---
function updateDrops(dt) {
  for (const d of state.drops) {
    d.age += dt;
    d.vy += 22 * dt;
    // x
    const nx = d.x + d.vx * dt;
    if (!state.world.isSolid(Math.floor(nx), Math.floor(d.y))) d.x = nx; else d.vx = 0;
    // y
    const ny = d.y + d.vy * dt;
    if (!state.world.isSolid(Math.floor(d.x), Math.floor(ny))) d.y = ny;
    else { d.vy = 0; d.y = Math.floor(d.y); }
    d.vx *= 0.9;
  }
  state.drops = state.drops.filter(d => {
    if (d.age > 60) return false;
    const dx = d.x - state.player.x, dy = d.y - (state.player.y + state.player.h * 0.5);
    if (d.age > 0.5 && Math.hypot(dx, dy) < 1.8) {
      // pickup
      if (state.inventory.add(d.key, 1) === 0) { playSound('pop'); rebuildHotbar(); return false; }
    }
    return true;
  });
}

// --- Rendering ---
function render() {
  // sky
  ctx.fillStyle = state.world.skyColor();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // sun / moon
  const t = state.world.dayFraction();
  const skyW = canvas.width, skyH = canvas.height * 0.5;
  const sunX = (t) * skyW;
  ctx.fillStyle = '#ffe066';
  ctx.beginPath(); ctx.arc(sunX, skyH - Math.sin(t * Math.PI) * skyH * 0.7, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ddd';
  const mt = (t + 0.5) % 1;
  ctx.beginPath(); ctx.arc(mt * skyW, skyH - Math.sin(mt * Math.PI) * skyH * 0.7, 14, 0, Math.PI * 2); ctx.fill();

  // camera follows player
  state.cam.x = state.player.x - VIEW_W / 2;
  state.cam.y = state.player.y - VIEW_H / 2;

  const x0 = Math.floor(state.cam.x) - 1;
  const x1 = Math.ceil(state.cam.x + VIEW_W) + 1;
  const y0 = Math.max(0, Math.floor(state.cam.y) - 1);
  const y1 = Math.min(WORLD_H, Math.ceil(state.cam.y + VIEW_H) + 1);

  for (let x = x0; x < x1; x++) {
    for (let y = y0; y < y1; y++) {
      const id = state.world.getBlock(x, y);
      if (id === BLOCKS.AIR.id) continue;
      const def = blockById(id);
      const sx = (x - state.cam.x) * BLOCK_SIZE;
      const sy = (y - state.cam.y) * BLOCK_SIZE;
      ctx.fillStyle = def.color;
      ctx.fillRect(sx, sy, BLOCK_SIZE, BLOCK_SIZE);
      if (id === BLOCKS.GRASS.id) { ctx.fillStyle = def.topColor; ctx.fillRect(sx, sy, BLOCK_SIZE, 6); }
      // simple inner detail
      if (id === BLOCKS.COAL.id) { ctx.fillStyle = '#000'; ctx.fillRect(sx + 6, sy + 6, 6, 6); ctx.fillRect(sx + 18, sy + 18, 6, 6); }
      if (id === BLOCKS.IRON.id) { ctx.fillStyle = '#fff3cc'; ctx.fillRect(sx + 8, sy + 8, 5, 5); ctx.fillRect(sx + 18, sy + 16, 5, 5); }
      if (id === BLOCKS.DIAMOND.id) { ctx.fillStyle = '#cffefb'; ctx.fillRect(sx + 8, sy + 10, 5, 5); ctx.fillRect(sx + 18, sy + 16, 5, 5); }
      if (id === BLOCKS.STONE.id) { ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(sx + 4, sy + 4, 4, 4); }
      if (id === BLOCKS.TORCH.id) { ctx.fillStyle = '#ff6'; ctx.fillRect(sx + 12, sy + 4, 8, 8); ctx.fillStyle = '#8b5a2b'; ctx.fillRect(sx + 14, sy + 12, 4, 14); }

      // breaking overlay
      if (state.player.breakingPos && state.player.breakingPos.x === x && state.player.breakingPos.y === y) {
        const p = state.player.breakingProgress;
        ctx.fillStyle = `rgba(0,0,0,${0.2 + p * 0.5})`;
        ctx.fillRect(sx, sy, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }

  // drops
  for (const d of state.drops) {
    const sx = (d.x - state.cam.x) * BLOCK_SIZE - 8;
    const sy = (d.y - state.cam.y) * BLOCK_SIZE - 8;
    drawItemIcon(ctx, d.key, sx, sy, 16);
  }

  // mobs
  state.mobs.draw(ctx, state.cam.x, state.cam.y);

  // player
  state.player.draw(ctx, state.cam.x, state.cam.y);

  // lighting overlay (darkness)
  const light = state.world.brightness();
  if (light < 0.95) {
    ctx.fillStyle = `rgba(0,0,0,${(1 - light) * 0.6})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  // underground shadow gradient
  for (let x = x0; x < x1; x += 2) {
    for (let y = y0; y < y1; y += 2) {
      const id = state.world.getBlock(x, y);
      if (id !== BLOCKS.AIR.id) continue;
      const l = state.world.lightAt(x, y);
      if (l < 0.9) {
        const sx = (x - state.cam.x) * BLOCK_SIZE;
        const sy = (y - state.cam.y) * BLOCK_SIZE;
        ctx.fillStyle = `rgba(0,0,0,${(1 - l) * 0.75})`;
        ctx.fillRect(sx, sy, BLOCK_SIZE * 2, BLOCK_SIZE * 2);
      }
    }
  }

  // crosshair / hover highlight
  const { x: mx, y: my } = worldFromMouse();
  if (inReach(mx, my)) {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
    ctx.strokeRect((mx - state.cam.x) * BLOCK_SIZE, (my - state.cam.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }

  // death overlay
  if (state.player.dead) {
    ctx.fillStyle = 'rgba(80,0,0,0.6)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff'; ctx.font = '40px monospace'; ctx.textAlign = 'center';
    ctx.fillText('You died', canvas.width / 2, canvas.height / 2);
    ctx.font = '18px monospace';
    ctx.fillText('Press R to respawn', canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
  }
}

function drawItemIcon(ctx, key, x, y, size) {
  const def = itemDef(key);
  if (def && def.block) {
    const b = BLOCKS[def.block];
    ctx.fillStyle = b.color || '#999';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#000'; ctx.strokeRect(x, y, size, size);
    return;
  }
  // material/tool: colored square + label
  let c = '#ccc';
  if (key === 'COAL_ITEM') c = '#222';
  else if (key === 'IRON_ITEM') c = '#d9b48b';
  else if (key === 'DIAMOND_ITEM') c = '#7fe';
  else if (key === 'STICK') c = '#a76';
  else if (key === 'SAPLING') c = '#3a7';
  else if (key === 'APPLE') c = '#e33';
  else if (def && def.tool) {
    c = def.tier === 0 ? '#a76' : def.tier === 1 ? '#888' : def.tier === 2 ? '#d9b48b' : '#7fe';
  }
  ctx.fillStyle = c;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = '#000'; ctx.strokeRect(x, y, size, size);
  if (def && def.tool) {
    ctx.fillStyle = '#000';
    ctx.fillRect(x + size * 0.35, y + 2, 3, size - 4);
  }
}

// --- HUD ---
function rebuildHotbar() {
  const bar = document.getElementById('hotbar');
  bar.innerHTML = '';
  for (let i = 0; i < HOTBAR_SIZE; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot' + (i === state.inventory.activeIndex ? ' active' : '');
    const s = state.inventory.slots[i];
    if (s) {
      const c = document.createElement('canvas'); c.width = 32; c.height = 32;
      drawItemIcon(c.getContext('2d'), s.key, 0, 0, 32);
      slot.appendChild(c);
      if (s.count > 1) {
        const cnt = document.createElement('div'); cnt.className = 'count'; cnt.textContent = s.count; slot.appendChild(cnt);
      }
      const label = document.createElement('div'); label.className = 'label'; label.textContent = (itemDef(s.key)?.name || s.key);
      if (i === state.inventory.activeIndex) slot.appendChild(label);
    }
    bar.appendChild(slot);
  }
}

function rebuildInventoryUI() {
  const grid = document.getElementById('inv-grid');
  grid.innerHTML = '';
  for (let i = 0; i < INV_SIZE; i++) {
    const slot = document.createElement('div'); slot.className = 'slot';
    const s = state.inventory.slots[i];
    if (s) {
      const c = document.createElement('canvas'); c.width = 32; c.height = 32;
      drawItemIcon(c.getContext('2d'), s.key, 0, 0, 32);
      slot.appendChild(c);
      if (s.count > 1) {
        const cnt = document.createElement('div'); cnt.className = 'count'; cnt.textContent = s.count; slot.appendChild(cnt);
      }
    }
    slot.title = s ? (itemDef(s.key)?.name + (s.dur ? ` (${s.dur})` : '')) : '';
    grid.appendChild(slot);
  }
}

function rebuildCraftingUI() {
  const root = document.getElementById('recipes');
  root.innerHTML = '';
  const hasTable = nearTable();
  for (const r of RECIPES) {
    const div = document.createElement('div');
    const can = Crafting.canCraft(r, state.inventory, hasTable);
    div.className = 'recipe' + (can ? '' : ' disabled');
    const need = Object.entries(r.req).map(([k, v]) => `${v}x ${itemDef(k)?.name || k}`).join(', ');
    div.innerHTML = `<strong>${itemDef(r.out.key)?.name || r.out.key} x${r.out.count}</strong><br><small>${need}${r.needTable ? ' (needs Crafting Table)' : ''}</small>`;
    div.onclick = () => { if (Crafting.craft(r, state.inventory, nearTable())) { unlock('CRAFT'); rebuildHotbar(); rebuildInventoryUI(); rebuildCraftingUI(); playSound('pop'); } };
    root.appendChild(div);
  }
}

function updateHUD() {
  const hearts = Math.ceil(state.player.hp / 2);
  let s = '';
  for (let i = 0; i < 10; i++) s += i < hearts ? '♥' : '♡';
  document.getElementById('health').textContent = s;
  document.getElementById('health').style.color = '#f33';
  let h = '';
  const fp = Math.ceil(state.player.hunger / 2);
  for (let i = 0; i < 10; i++) h += i < fp ? '▮' : '▯';
  document.getElementById('hunger').textContent = h;
  document.getElementById('hunger').style.color = '#c93';
  const need = (state.player.level + 1) * 10;
  document.getElementById('xpfill').style.width = (state.player.xp / need * 100) + '%';
  document.getElementById('xplabel').textContent = 'Lv ' + state.player.level;
}

function drawMinimap() {
  const mm = document.getElementById('minimap');
  const mctx = mm.getContext('2d');
  const W = mm.width, H = mm.height;
  mctx.fillStyle = '#000'; mctx.fillRect(0, 0, W, H);
  const cx = Math.floor(state.player.x);
  for (let i = 0; i < W; i++) {
    const x = cx - W / 2 + i;
    const h = state.world.heightAt(x);
    const biome = state.world.biomeAt(x);
    let col = '#3a3';
    if (biome === BIOMES.DESERT) col = '#dc7';
    if (biome === BIOMES.MOUNTAINS) col = '#aaa';
    if (biome === BIOMES.FOREST) col = '#270';
    const y = Math.max(0, Math.min(H - 1, H * 0.5 + (h - SEA_LEVEL) * 0.4));
    mctx.fillStyle = '#246';
    mctx.fillRect(i, 0, 1, y);
    mctx.fillStyle = col;
    mctx.fillRect(i, y, 1, H - y);
  }
  mctx.fillStyle = '#fff';
  mctx.fillRect(W / 2 - 1, H / 2 - 1, 2, 2);
}

function toggleInventory() {
  const el = document.getElementById('inventory');
  el.classList.toggle('hidden');
  if (!el.classList.contains('hidden')) rebuildInventoryUI();
}
function toggleCrafting() {
  const el = document.getElementById('crafting');
  el.classList.toggle('hidden');
  if (!el.classList.contains('hidden')) rebuildCraftingUI();
}
function togglePause() {
  state.paused = !state.paused;
  document.getElementById('pause').classList.toggle('hidden', !state.paused);
}

// --- Sounds (procedural via WebAudio, no external assets) ---
let actx = null;
function playSound(kind) {
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(); const g = actx.createGain();
    o.connect(g); g.connect(actx.destination);
    if (kind === 'break') { o.type = 'square'; o.frequency.value = 180; g.gain.value = 0.05; }
    else if (kind === 'place') { o.type = 'triangle'; o.frequency.value = 320; g.gain.value = 0.05; }
    else if (kind === 'pop') { o.type = 'sine'; o.frequency.value = 600; g.gain.value = 0.04; }
    else if (kind === 'hurt') { o.type = 'sawtooth'; o.frequency.value = 100; g.gain.value = 0.08; }
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.15);
    o.stop(actx.currentTime + 0.18);
  } catch (e) {}
}

// --- Main loop ---
let lastT = performance.now(), fpsAcc = 0, fpsCount = 0, fps = 0;
function loop(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;

  if (!state.paused && !state.player.dead) {
    state.world.time = (state.world.time + dt / state.world.dayLength) % 1;
    state.player.update(dt, state.world, input);
    updateBreaking(dt);
    updateDrops(dt);
    state.mobs.update(dt, state.world, state.player);
    state.mobSpawnT += dt;
    if (state.mobSpawnT > 4) { state.mobSpawnT = 0; state.mobs.spawnAround(state.world, state.player); }
    // sword damage on mobs
    if (input.mouse.left) {
      const a = state.inventory.active(); const def = a ? itemDef(a.key) : null;
      if (def && def.tool === 'sword') {
        const { x: mx, y: my } = worldFromMouse();
        for (const m of state.mobs.mobs) {
          if (Math.abs(m.x - (mx + 0.5)) < 1.2 && Math.abs(m.y + m.h * 0.5 - (my + 0.5)) < 1.5 && inReach(m.x, m.y)) {
            if (!m._cd || m._cd <= 0) {
              m._cd = 0.4;
              if (m.hurt(def.damage)) { state.player.addXP(3); unlock('KILL');
                state.drops.push({ x: m.x, y: m.y, vx: 0, vy: -3, key: m.kind === 'pig' ? 'APPLE' : 'STICK', age: 0 });
              }
            }
          }
        }
      }
      for (const m of state.mobs.mobs) if (m._cd) m._cd -= dt;
    }
    // eat APPLE when right-clicking with one selected (handled via Q key shortcut)
    if (input.keys['KeyQ']) {
      const a = state.inventory.active();
      if (a && itemDef(a.key) && itemDef(a.key).food && state.player.hunger < state.player.maxHunger) {
        state.player.hunger = Math.min(state.player.maxHunger, state.player.hunger + itemDef(a.key).food);
        state.inventory.consumeActive(); rebuildHotbar();
        input.keys['KeyQ'] = false;
      }
    }
    // auto-unload distant chunks
    state.world.unloadFar(Math.floor(state.player.x / CHUNK_W), 6);

    // auto-save
    state.saveT += dt;
    if (state.saveT > 30) { state.saveT = 0; SaveSystem.save(state); }
  }

  render();
  updateHUD();
  if (Math.floor(now / 250) % 2 === 0) drawMinimap();

  // fps
  fpsAcc += dt; fpsCount++;
  if (fpsAcc > 0.5) { fps = Math.round(fpsCount / fpsAcc); fpsAcc = 0; fpsCount = 0; document.getElementById('fps').textContent = 'FPS: ' + fps; }

  requestAnimationFrame(loop);
}

init();
requestAnimationFrame(loop);
