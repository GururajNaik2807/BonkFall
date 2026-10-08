import { Enemy } from "./Enemy";

export class MagicMissile {
  x: number;
  y: number;
  target: Enemy;
  speed: number = 400;
  damage: number = 20;
  dead: boolean = false;

  constructor(x: number, y: number, target: Enemy) {
    this.x = x;
    this.y = y;
    this.target = target;
  }

  update(dt: number, onHit: Function) {
    if (this.target.dead) {
      this.dead = true; // Fizzle out if target dies before impact
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const mag = Math.hypot(dx, dy);

    if (mag < 15) {
      onHit(this.target, this.damage, Math.atan2(dy, dx));
      this.dead = true;
    } else {
      this.x += (dx / mag) * this.speed * (dt / 1000);
      this.y += (dy / mag) * this.speed * (dt / 1000);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#38bdf8'; // Glowing blue missile
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow
  }
}
