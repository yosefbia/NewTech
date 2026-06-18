// Procedural infinite world. Uses value-noise built from a seeded PRNG.
// Chunks are 16 wide, world is 128 tall. Underground caves carved with 2D noise.

const CHUNK_W = 16;
const WORLD_H = 128;
const SEA_LEVEL = 64;

// --- seeded PRNG (mulberry32) ---
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Value noise on integer grid, smoothed with cosine interpolation.
class ValueNoise {
  constructor(seed) {
    this.seed = seed;
    this.cache = new Map();
  }
  hash(x) {
    // 1D deterministic hash -> [0,1)
    let h = (x * 374761393 + this.seed * 668265263) | 0;
    h = (h ^ (h >>> 13)) * 1274126177 | 0;
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  }
  hash2(x, y) {
    let h = ((x * 73856093) ^ (y * 19349663) ^ (this.seed * 83492791)) | 0;
    h = (h ^ (h >>> 13)) * 1274126177 | 0;
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  }
  noise1D(x, freq) {
    const xs = x * freq;
    const xi = Math.floor(xs);
    const f = xs - xi;
    const a = this.hash(xi), b = this.hash(xi + 1);
    const t = f * f * (3 - 2 * f);
    return a * (1 - t) + b * t;
  }
  noise2D(x, y, freq) {
    const xs = x * freq, ys = y * freq;
    const xi = Math.floor(xs), yi = Math.floor(ys);
    const fx = xs - xi, fy = ys - yi;
    const a = this.hash2(xi, yi);
    const b = this.hash2(xi + 1, yi);
    const c = this.hash2(xi, yi + 1);
    const d = this.hash2(xi + 1, yi + 1);
    const tx = fx * fx * (3 - 2 * fx);
    const ty = fy * fy * (3 - 2 * fy);
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  }
  fbm1(x, oct = 4) {
    let v = 0, amp = 1, freq = 0.02, sum = 0;
    for (let i = 0; i < oct; i++) {
      v += this.noise1D(x, freq) * amp;
      sum += amp; amp *= 0.5; freq *= 2;
    }
    return v / sum;
  }
  fbm2(x, y, oct = 4) {
    let v = 0, amp = 1, freq = 0.05, sum = 0;
    for (let i = 0; i < oct; i++) {
      v += this.noise2D(x, y, freq) * amp;
      sum += amp; amp *= 0.5; freq *= 2;
    }
    return v / sum;
  }
}

const BIOMES = {
  PLAINS: 'plains',
  FOREST: 'forest',
  DESERT: 'desert',
  MOUNTAINS: 'mountains',
};

class World {
  constructor(seed = Date.now() & 0xffff) {
    this.seed = seed;
    this.noise = new ValueNoise(seed);
    this.chunks = new Map();           // cx -> Uint8Array(CHUNK_W*WORLD_H)
    this.modified = new Map();         // "x,y" -> blockId (for saving)
    this.time = 0;                     // 0..1 (day cycle)
    this.dayLength = 180;              // seconds
    this.activeTorches = new Set();    // "x,y"
  }

  serializeModified() {
    const out = {};
    for (const [k, v] of this.modified) out[k] = v;
    return out;
  }
  loadModified(obj) {
    this.modified.clear();
    if (!obj) return;
    for (const k in obj) this.modified.set(k, obj[k]);
  }

  biomeAt(x) {
    // low-frequency 1D noise selects biome
    const n = this.noise.fbm1(x + 1000, 3);
    if (n < 0.32) return BIOMES.DESERT;
    if (n < 0.55) return BIOMES.PLAINS;
    if (n < 0.78) return BIOMES.FOREST;
    return BIOMES.MOUNTAINS;
  }

  heightAt(x) {
    const biome = this.biomeAt(x);
    let base = SEA_LEVEL;
    const n = this.noise.fbm1(x, 5);
    if (biome === BIOMES.DESERT)    base = SEA_LEVEL - 2 + Math.floor(n * 8);
    if (biome === BIOMES.PLAINS)    base = SEA_LEVEL + Math.floor(n * 6);
    if (biome === BIOMES.FOREST)    base = SEA_LEVEL + 2 + Math.floor(n * 10);
    if (biome === BIOMES.MOUNTAINS) base = SEA_LEVEL + 8 + Math.floor(n * 28);
    return Math.max(8, Math.min(WORLD_H - 4, base));
  }

  generateChunk(cx) {
    const arr = new Uint8Array(CHUNK_W * WORLD_H);
    for (let lx = 0; lx < CHUNK_W; lx++) {
      const x = cx * CHUNK_W + lx;
      const biome = this.biomeAt(x);
      const h = this.heightAt(x);
      for (let y = 0; y < WORLD_H; y++) {
        let id = BLOCKS.AIR.id;
        if (y === WORLD_H - 1) id = BLOCKS.BEDROCK.id;
        else if (y > h) {
          // underground
          if (y > h + 1) {
            id = BLOCKS.STONE.id;
            // ore generation
            const oreN = this.noise.noise2D(x, y, 0.18);
            if (y > h + 30 && oreN > 0.92) id = BLOCKS.DIAMOND.id;
            else if (y > h + 12 && oreN > 0.88) id = BLOCKS.IRON.id;
            else if (oreN > 0.86) id = BLOCKS.COAL.id;
            // caves
            const cave = this.noise.fbm2(x, y, 4);
            if (cave > 0.62 && y < WORLD_H - 3 && y > h + 3) id = BLOCKS.AIR.id;
            // lava lakes deep down
            if (id === BLOCKS.AIR.id && y > WORLD_H - 15) id = BLOCKS.LAVA.id;
          } else {
            id = (biome === BIOMES.DESERT) ? BLOCKS.SAND.id : BLOCKS.DIRT.id;
          }
        } else if (y === h) {
          if (biome === BIOMES.DESERT) id = BLOCKS.SAND.id;
          else id = BLOCKS.GRASS.id;
        }
        arr[lx * WORLD_H + y] = id;
      }
      // surface water in low spots
      if (this.heightAt(x) < SEA_LEVEL - 4) {
        for (let y = this.heightAt(x); y < SEA_LEVEL - 4; y++) {
          if (arr[lx * WORLD_H + y] === BLOCKS.AIR.id) arr[lx * WORLD_H + y] = BLOCKS.WATER.id;
        }
      }
    }
    // trees in forest/plains
    const rand = mulberry32(this.seed ^ (cx * 9301 + 49297));
    for (let lx = 1; lx < CHUNK_W - 1; lx++) {
      const x = cx * CHUNK_W + lx;
      const biome = this.biomeAt(x);
      if (biome === BIOMES.DESERT || biome === BIOMES.MOUNTAINS) continue;
      const treeChance = biome === BIOMES.FOREST ? 0.25 : 0.06;
      if (rand() < treeChance) {
        const h = this.heightAt(x);
        const trunk = 3 + Math.floor(rand() * 3);
        for (let i = 1; i <= trunk; i++) {
          const yy = h - i;
          if (yy >= 0) arr[lx * WORLD_H + yy] = BLOCKS.WOOD.id;
        }
        const topY = h - trunk;
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 1; dy++) {
            const lxx = lx + dx;
            if (lxx < 0 || lxx >= CHUNK_W) continue;
            const yy = topY + dy;
            if (yy < 0) continue;
            if (Math.abs(dx) + Math.abs(dy) <= 3 && arr[lxx * WORLD_H + yy] === BLOCKS.AIR.id) {
              arr[lxx * WORLD_H + yy] = BLOCKS.LEAVES.id;
            }
          }
        }
      }
    }
    return arr;
  }

  getChunk(cx) {
    let c = this.chunks.get(cx);
    if (!c) {
      c = this.generateChunk(cx);
      // apply modified overrides
      for (let lx = 0; lx < CHUNK_W; lx++) {
        const x = cx * CHUNK_W + lx;
        for (let y = 0; y < WORLD_H; y++) {
          const k = x + ',' + y;
          if (this.modified.has(k)) c[lx * WORLD_H + y] = this.modified.get(k);
        }
      }
      this.chunks.set(cx, c);
      // refresh torch set for newly loaded chunk
      for (let lx = 0; lx < CHUNK_W; lx++) {
        for (let y = 0; y < WORLD_H; y++) {
          if (c[lx * WORLD_H + y] === BLOCKS.TORCH.id) {
            this.activeTorches.add((cx * CHUNK_W + lx) + ',' + y);
          }
        }
      }
    }
    return c;
  }

  unloadFar(centerCX, radius) {
    for (const cx of this.chunks.keys()) {
      if (Math.abs(cx - centerCX) > radius) this.chunks.delete(cx);
    }
  }

  getBlock(x, y) {
    if (y < 0 || y >= WORLD_H) return BLOCKS.AIR.id;
    const cx = Math.floor(x / CHUNK_W);
    const lx = ((x % CHUNK_W) + CHUNK_W) % CHUNK_W;
    return this.getChunk(cx)[lx * WORLD_H + y];
  }

  setBlock(x, y, id) {
    if (y < 0 || y >= WORLD_H) return;
    const cx = Math.floor(x / CHUNK_W);
    const lx = ((x % CHUNK_W) + CHUNK_W) % CHUNK_W;
    const chunk = this.getChunk(cx);
    const prev = chunk[lx * WORLD_H + y];
    chunk[lx * WORLD_H + y] = id;
    this.modified.set(x + ',' + y, id);
    const key = x + ',' + y;
    if (prev === BLOCKS.TORCH.id) this.activeTorches.delete(key);
    if (id === BLOCKS.TORCH.id) this.activeTorches.add(key);
  }

  isSolid(x, y) {
    const def = blockById(this.getBlock(x, y));
    return def && def.solid;
  }

  // Day fraction 0..1: 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset.
  dayFraction() { return this.time % 1; }
  skyColor() {
    const t = this.dayFraction();
    // simple gradient: night dark, day blue, sunset orange
    const palette = [
      [10, 14, 40],   // 0.0 midnight
      [255, 140, 60], // 0.25 sunrise
      [110, 200, 255],// 0.5 noon
      [255, 110, 70], // 0.75 sunset
      [10, 14, 40],   // 1.0 midnight
    ];
    const seg = t * 4;
    const i = Math.floor(seg);
    const f = seg - i;
    const a = palette[i], b = palette[i + 1];
    return `rgb(${a[0]+(b[0]-a[0])*f|0},${a[1]+(b[1]-a[1])*f|0},${a[2]+(b[2]-a[2])*f|0})`;
  }
  brightness() {
    const t = this.dayFraction();
    // 0 at midnight, 1 around noon
    return Math.max(0.15, Math.sin(t * Math.PI) * 1.0);
  }
  isNight() {
    const t = this.dayFraction();
    return t < 0.18 || t > 0.82;
  }

  // Compute light at a block position. Sky light propagates from top; torches add point light.
  lightAt(x, y) {
    // sky light: scan upward — first solid blocks above reduce light
    let light = this.brightness();
    // attenuate underground
    let openCount = 0;
    for (let yy = y - 1; yy >= Math.max(0, y - 12); yy--) {
      const def = blockById(this.getBlock(x, yy));
      if (def.solid) { light *= 0.55; if (light < 0.06) break; }
      else openCount++;
    }
    // torch contribution
    let torchLight = 0;
    for (const key of this.activeTorches) {
      const [tx, ty] = key.split(',').map(Number);
      const d = Math.abs(tx - x) + Math.abs(ty - y);
      if (d <= 10) torchLight = Math.max(torchLight, (10 - d) / 10);
    }
    return Math.min(1, Math.max(light, torchLight));
  }
}
