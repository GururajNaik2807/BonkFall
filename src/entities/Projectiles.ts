import { Enemy } from "./Enemy";

export class MagicMissile {
  x: number;
  y: number;
  target: Enemy;
  speed: number = 400;
  damage: number;
  dead: boolean = false;
  trail: {x: number, y: number}[] = [];

  constructor(x: number, y: number, target: Enemy, damage: number = 20) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
  }

  update(dt: number, onHit: Function) {
    if (this.target.dead) {
      this.dead = true; // Fizzle out if target dies before impact
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const mag = Math.hypot(dx, dy);

    this.trail.push({x: this.x, y: this.y});
    if (this.trail.length > 8) this.trail.shift();

    if (mag < 15) {
      onHit(this.target, this.damage, Math.atan2(dy, dx));
      this.dead = true;
    } else {
      this.x += (dx / mag) * this.speed * (dt / 1000);
      this.y += (dy / mag) * this.speed * (dt / 1000);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#38bdf8';
    
    // Draw trail
    if (this.trail.length > 0) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.strokeStyle = `rgba(56, 189, 248, 0.5)`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // Core
    ctx.fillStyle = '#ffffff'; 
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow
  }
}

export class EnemyProjectile {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number = 200;
  damage: number = 15;
  dead: boolean = false;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    this.x = x;
    this.y = y;
    const dx = targetX - x;
    const dy = targetY - y;
    const mag = Math.hypot(dx, dy);
    this.dx = mag > 0 ? dx / mag : 0;
    this.dy = mag > 0 ? dy / mag : 0;
  }

  update(dt: number, playerX: number, playerY: number, onPlayerHit: Function) {
    this.x += this.dx * this.speed * (dt / 1000);
    this.y += this.dy * this.speed * (dt / 1000);

    const dist = Math.hypot(this.x - playerX, this.y - playerY);
    if (dist < 15) {
      onPlayerHit(this.damage);
      this.dead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#ef4444'; // Red
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
