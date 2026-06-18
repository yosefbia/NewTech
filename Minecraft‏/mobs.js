// Simple mobs: passive Pig (drops APPLE as food) and hostile Zombie.

class Mob {
  constructor(x, y, kind) {
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.w = 0.8; this.h = 1.6;
    this.kind = kind;
    this.onGround = false;
    this.attackCD = 0;
    this.wanderCD = 0;
    if (kind === 'pig') { this.hp = 8; this.maxHp = 8; this.speed = 1.5; this.hostile = false; this.color = '#f7b6c5'; }
    else { this.hp = 18; this.maxHp = 18; this.speed = 2.6; this.hostile = true; this.color = '#3a7d3a'; }
  }

  serialize() {
    return { x:this.x, y:this.y, kind:this.kind, hp:this.hp };
  }

  update(dt, world, player) {
    // AI
    if (this.hostile) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 14) {
        this.vx = Math.sign(dx) * this.speed;
        // jump if obstacle ahead
        const ahead = world.isSolid(Math.floor(this.x + Math.sign(dx) * 0.7), Math.floor(this.y + this.h - 0.2));
        if (ahead && this.onGround) this.vy = -8;
        // attack
        if (dist < 1.2 && this.attackCD <= 0) {
          player.hurt(4);
          this.attackCD = 1.0;
        }
      } else {
        this.wander(dt);
      }
    } else {
      this.wander(dt);
    }
    this.attackCD = Math.max(0, this.attackCD - dt);

    // physics
    this.vy += 22 * dt;
    if (this.vy > 30) this.vy = 30;
    this.moveAxis(world, this.vx * dt, 0);
    this.moveAxis(world, 0, this.vy * dt);
  }

  wander(dt) {
    this.wanderCD -= dt;
    if (this.wanderCD <= 0) {
      this.wanderCD = 1 + Math.random() * 2;
      this.vx = (Math.random() < 0.5 ? -1 : 1) * this.speed * 0.4 * (Math.random() < 0.3 ? 0 : 1);
    }
  }

  moveAxis(world, dx, dy) {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 0.2));
    for (let i = 0; i < steps; i++) {
      const sx = dx / steps, sy = dy / steps;
      const nx = this.x + sx, ny = this.y + sy;
      const minX = nx - this.w / 2, maxX = nx + this.w / 2;
      const minY = ny, maxY = ny + this.h;
      let hit = false;
      const fx0 = Math.floor(minX), fx1 = Math.floor(maxX);
      const fy0 = Math.floor(minY), fy1 = Math.floor(maxY);
      for (let bx = fx0; bx <= fx1 && !hit; bx++) {
        for (let by = fy0; by <= fy1 && !hit; by++) {
          if (world.isSolid(bx, by)) hit = true;
        }
      }
      if (hit) {
        if (dy > 0) { this.onGround = true; this.vy = 0; }
        if (dy < 0) this.vy = 0;
        if (dx !== 0) this.vx = 0;
        return;
      }
      this.x = nx; this.y = ny;
      if (dy > 0) this.onGround = false;
    }
  }

  hurt(d) {
    this.hp -= d;
    return this.hp <= 0;
  }

  draw(ctx, camX, camY) {
    const px = (this.x - camX) * BLOCK_SIZE;
    const py = (this.y - camY) * BLOCK_SIZE;
    const w = this.w * BLOCK_SIZE, h = this.h * BLOCK_SIZE;
    ctx.fillStyle = this.color;
    ctx.fillRect(px - w / 2, py, w, h);
    // eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(px - 6, py + 8, 4, 4);
    ctx.fillRect(px + 2, py + 8, 4, 4);
    // hp bar
    if (this.hp < this.maxHp) {
      ctx.fillStyle = '#400';
      ctx.fillRect(px - w / 2, py - 8, w, 4);
      ctx.fillStyle = '#f33';
      ctx.fillRect(px - w / 2, py - 8, w * (this.hp / this.maxHp), 4);
    }
  }
}

class MobManager {
  constructor() { this.mobs = []; }
  spawnAround(world, player) {
    if (this.mobs.length > 12) return;
    const side = Math.random() < 0.5 ? -1 : 1;
    const offset = 16 + Math.random() * 8;
    const x = Math.floor(player.x + side * offset);
    let y = 0;
    for (; y < WORLD_H - 2; y++) if (world.isSolid(x, y)) break;
    const spawnY = y - 2;
    if (spawnY < 0) return;
    const kind = world.isNight() ? (Math.random() < 0.75 ? 'zombie' : 'pig') : (Math.random() < 0.2 ? 'zombie' : 'pig');
    this.mobs.push(new Mob(x + 0.5, spawnY, kind));
  }
  update(dt, world, player) {
    for (const m of this.mobs) m.update(dt, world, player);
    // burn zombies in day
    if (!world.isNight()) {
      for (const m of this.mobs) if (m.kind === 'zombie') m.hp -= dt * 2;
    }
    // cull dead and far
    this.mobs = this.mobs.filter(m => {
      if (m.hp <= 0) return false;
      if (Math.abs(m.x - player.x) > 40) return false;
      return true;
    });
  }
  draw(ctx, camX, camY) { for (const m of this.mobs) m.draw(ctx, camX, camY); }
}
