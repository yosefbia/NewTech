// Player: movement, collision, health/hunger, breaking/placing logic.

class Player {
  constructor() {
    this.x = 0; this.y = 0;
    this.vx = 0; this.vy = 0;
    this.w = 0.7; this.h = 1.8;
    this.onGround = false;
    this.facing = 1;
    this.walkTime = 0;
    this.hp = 20; this.maxHp = 20;
    this.hunger = 20; this.maxHunger = 20;
    this.xp = 0; this.level = 0;
    this.breakingPos = null;
    this.breakingProgress = 0;
    this.invulnT = 0;
    this.hungerTick = 0;
    this.healTick = 0;
    this.dead = false;
  }

  serialize() {
    return { x:this.x, y:this.y, hp:this.hp, hunger:this.hunger, xp:this.xp, level:this.level };
  }
  load(d) {
    if (!d) return;
    this.x = d.x; this.y = d.y;
    this.hp = d.hp; this.hunger = d.hunger;
    this.xp = d.xp || 0; this.level = d.level || 0;
  }

  hurt(d) {
    if (this.invulnT > 0) return;
    this.hp = Math.max(0, this.hp - d);
    this.invulnT = 0.6;
    if (this.hp <= 0) this.die();
  }
  die() { this.dead = true; }
  respawn(world) {
    this.hp = this.maxHp; this.hunger = this.maxHunger;
    this.dead = false;
    // find a safe surface near origin
    let x = 0;
    for (let y = 0; y < WORLD_H; y++) {
      if (world.isSolid(x, y)) { this.x = x + 0.5; this.y = y - 2; this.vy = 0; return; }
    }
  }

  addXP(n) {
    this.xp += n;
    const need = (this.level + 1) * 10;
    if (this.xp >= need) { this.xp -= need; this.level++; }
  }

  update(dt, world, input) {
    if (this.dead) return;
    // input -> velocity
    let move = 0;
    if (input.keys['KeyA'] || input.keys['ArrowLeft']) move -= 1;
    if (input.keys['KeyD'] || input.keys['ArrowRight']) move += 1;
    this.vx = move * 5.5;
    if (move !== 0) this.facing = move;
    if (move !== 0 && this.onGround) this.walkTime += dt;

    if ((input.keys['Space'] || input.keys['KeyW'] || input.keys['ArrowUp']) && this.onGround) {
      this.vy = -10.5;
      this.onGround = false;
    }

    // water buoyancy
    const inWater = world.getBlock(Math.floor(this.x), Math.floor(this.y + this.h * 0.5)) === BLOCKS.WATER.id;
    if (inWater) {
      this.vy += 6 * dt; // weaker gravity
      this.vy *= 0.92;
      if (input.keys['Space']) this.vy = -4;
    } else {
      this.vy += 28 * dt;
    }
    if (this.vy > 32) this.vy = 32;

    this.moveAxis(world, this.vx * dt, 0);
    this.moveAxis(world, 0, this.vy * dt);

    // lava damage
    if (world.getBlock(Math.floor(this.x), Math.floor(this.y + 1)) === BLOCKS.LAVA.id) this.hurt(2 * dt);

    // hunger
    this.hungerTick += dt;
    if (this.hungerTick > 6) { this.hungerTick = 0; if (this.hunger > 0) this.hunger -= 1; else this.hurt(1); }
    // regen
    if (this.hunger > 16 && this.hp < this.maxHp) {
      this.healTick += dt; if (this.healTick > 3) { this.healTick = 0; this.hp = Math.min(this.maxHp, this.hp + 1); }
    }
    this.invulnT = Math.max(0, this.invulnT - dt);

    // fall damage
    if (this.onGround && this.fallVy > 14) {
      this.hurt(Math.floor((this.fallVy - 14) * 0.8));
    }
    this.fallVy = Math.max(this.fallVy || 0, this.vy);
    if (this.onGround) this.fallVy = 0;
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

  draw(ctx, camX, camY) {
    const px = (this.x - camX) * BLOCK_SIZE;
    const py = (this.y - camY) * BLOCK_SIZE;
    const w = this.w * BLOCK_SIZE, h = this.h * BLOCK_SIZE;
    // body
    ctx.fillStyle = '#3a73c4';
    ctx.fillRect(px - w / 2, py + h * 0.45, w, h * 0.55);
    // head
    ctx.fillStyle = '#f1c27d';
    ctx.fillRect(px - w / 2 + 4, py, w - 8, h * 0.45);
    // eyes
    ctx.fillStyle = '#000';
    const eyeX = this.facing > 0 ? px + 2 : px - 8;
    ctx.fillRect(eyeX, py + 12, 4, 4);
    // legs (walk anim)
    ctx.fillStyle = '#222';
    const leg = Math.sin(this.walkTime * 12) * 4;
    ctx.fillRect(px - w / 2 + 2, py + h - 6 + leg, 8, 6);
    ctx.fillRect(px + w / 2 - 10, py + h - 6 - leg, 8, 6);
    // tool in hand
    const s = ctx; s.fillStyle = '#aaa';
    s.fillRect(px + this.facing * 8, py + h * 0.55, 4, 14);
  }
}
