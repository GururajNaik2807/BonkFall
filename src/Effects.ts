export interface Effect {
  update(dt: number): boolean;
  draw(ctx: CanvasRenderingContext2D): void;
}

export class DeathSlash implements Effect {
  x: number;
  y: number;
  angle: number;
  progress = 0;
  duration = 250; // milliseconds

  constructor(x: number, y: number, angle: number) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  update(dt: number): boolean {
    this.progress += dt / this.duration;
    return this.progress >= 1; // Returns true when animation is done
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.progress >= 1) return;
    
    const alpha = 1 - this.progress;
    const radius = 15 + this.progress * 35; // Expands outward

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Draw a sharp crescent slash
    ctx.beginPath();
    ctx.arc(0, 0, radius, -Math.PI / 3, Math.PI / 3);
    ctx.lineWidth = 5 * alpha;
    ctx.strokeStyle = `rgba(190, 242, 100, ${alpha})`; // bonkfall green
    ctx.stroke();

    ctx.restore();
  }
}