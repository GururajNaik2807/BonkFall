export class Enemy {
  x: number;
  y: number;
  hp: number = 50;
  speed: number = 80;
  dead: boolean = false;

  hitFlashTimer: number = 0;
  knockbackX: number = 0;
  knockbackY: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(dt: number, playerX: number, playerY: number, enemies: Enemy[]) {
    if (this.dead) return;
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;

    // Apply knockback
    if (Math.abs(this.knockbackX) > 1 || Math.abs(this.knockbackY) > 1) {
      this.x += this.knockbackX * (dt / 1000);
      this.y += this.knockbackY * (dt / 1000);
      this.knockbackX *= 0.8;
      this.knockbackY *= 0.8;
      return; // Can't move while knocked back
    }

    // Move towards player
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const mag = Math.hypot(dx, dy);

    // Separation forces
    let sepX = 0;
    let sepY = 0;
    let neighbors = 0;
    
    for (const other of enemies) {
      if (other === this || other.dead) continue;
      const dist = Math.hypot(this.x - other.x, this.y - other.y);
      if (dist < 25 && dist > 0) {
        sepX += (this.x - other.x) / dist;
        sepY += (this.y - other.y) / dist;
        neighbors++;
      }
    }
    
    if (neighbors > 0) {
      sepX /= neighbors;
      sepY /= neighbors;
    }

    const dirX = (mag > 0 ? dx / mag : 0) + sepX * 1.5;
    const dirY = (mag > 0 ? dy / mag : 0) + sepY * 1.5;
    const dirMag = Math.hypot(dirX, dirY);

    if (mag > 20) {
      this.x += (dirX / dirMag) * this.speed * (dt / 1000);
      this.y += (dirY / dirMag) * this.speed * (dt / 1000);
    }
  }

  takeDamage(amount: number, angle?: number) {
    this.hp -= amount;
    this.hitFlashTimer = 80; // 80ms flash
    
    if (angle !== undefined) {
      this.knockbackX = Math.cos(angle) * 300;
      this.knockbackY = Math.sin(angle) * 300;
    }

    if (this.hp <= 0) {
      this.dead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const isHit = this.hitFlashTimer > 0;

    // Goblin Ears
    ctx.fillStyle = isHit ? '#fff' : '#14532d';
    ctx.beginPath();
    ctx.moveTo(-12, -6); ctx.lineTo(-24, -14); ctx.lineTo(-6, -12); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -6); ctx.lineTo(24, -14); ctx.lineTo(6, -12); ctx.fill();

    // Goblin Head
    ctx.fillStyle = isHit ? '#ef4444' : '#22c55e';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    // Red Eyes
    ctx.fillStyle = isHit ? '#000' : '#ef4444';
    ctx.shadowColor = isHit ? '#000' : '#ef4444';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-5, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -4, 2.5, 0, Math.PI * 2); 
    ctx.fill();

    ctx.restore();
  }
}