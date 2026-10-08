export class Enemy {
  x: number;
  y: number;
  hp: number = 50;
  speed: number = 80;
  dead: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(dt: number, playerX: number, playerY: number) {
    if (this.dead) return;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const mag = Math.hypot(dx, dy);

    // Only move if they are further than 20 pixels away
    if (mag > 20) {
      this.x += (dx / mag) * this.speed * (dt / 1000);
      this.y += (dy / mag) * this.speed * (dt / 1000);
    }
  }

  takeDamage(amount: number) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.dead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Goblin Ears
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.moveTo(-12, -6); ctx.lineTo(-24, -14); ctx.lineTo(-6, -12); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -6); ctx.lineTo(24, -14); ctx.lineTo(6, -12); ctx.fill();

    // Goblin Head
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    // Red Eyes
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-5, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -4, 2.5, 0, Math.PI * 2); 
    ctx.fill();

    ctx.restore();
  }
}