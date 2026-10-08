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

export class HitImpact implements Effect {
  x: number;
  y: number;
  progress = 0;
  duration = 150;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(dt: number): boolean {
    this.progress += dt / this.duration;
    return this.progress >= 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.progress >= 1) return;

    const alpha = 1 - (this.progress * this.progress);
    const size = 3 + this.progress * 8;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.random() * Math.PI * 2);

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(-size / 2, -size / 2, size, size);

    ctx.restore();
  }
}

export class ScreenShake {
  progress = 0;
  duration = 200;
  magnitude: number;
  offsetX = 0;
  offsetY = 0;

  constructor(magnitude: number = 4) {
    this.magnitude = magnitude;
  }

  update(dt: number): boolean {
    this.progress += dt / this.duration;
    if (this.progress >= 1) {
      this.offsetX = 0;
      this.offsetY = 0;
      return true;
    }
    
    const decay = 1 - this.progress;
    this.offsetX = (Math.random() - 0.5) * 2 * this.magnitude * decay;
    this.offsetY = (Math.random() - 0.5) * 2 * this.magnitude * decay;
    return false;
  }
}