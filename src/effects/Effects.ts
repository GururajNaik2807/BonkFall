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

export class FloatingText implements Effect {
  x: number;
  y: number;
  text: string;
  progress = 0;
  duration = 600; // ms
  color: string;

  constructor(x: number, y: number, text: string, color: string = '#fcd34d') {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y + (Math.random() - 0.5) * 10;
    this.text = text;
    this.color = color;
  }

  update(dt: number): boolean {
    this.progress += dt / this.duration;
    this.y -= dt * 0.05; // Float upwards
    return this.progress >= 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.progress >= 1) return;

    const alpha = 1 - Math.pow(this.progress, 2);
    // Squash and stretch: scale up quickly then shrink
    const scale = this.progress < 0.2 ? 1 + (this.progress / 0.2) * 0.5 : 1.5 - ((this.progress - 0.2) / 0.8) * 0.5;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(scale, scale);

    ctx.font = '900 12px Inter';
    ctx.textAlign = 'center';
    
    // Outline
    ctx.strokeStyle = `rgba(15, 23, 42, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.strokeText(this.text, 0, 0);

    // Text
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, 0, 0);

    ctx.restore();
  }
}

export class BloodSplatter implements Effect {
  x: number;
  y: number;
  progress = 0;
  duration = 400;
  particles: {x: number, y: number, vx: number, vy: number, size: number}[] = [];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    const count = 6 + Math.random() * 4;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      this.particles.push({
        x: 0, y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3
      });
    }
  }

  update(dt: number): boolean {
    this.progress += dt / this.duration;
    
    for (const p of this.particles) {
      p.x += p.vx * (dt / 1000);
      p.y += p.vy * (dt / 1000);
      p.vx *= 0.9;
      p.vy *= 0.9;
    }
    return this.progress >= 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.progress >= 1) return;
    const alpha = 1 - Math.pow(this.progress, 2);
    
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Using deep decayed crimson / dark matter
    ctx.fillStyle = `rgba(26, 8, 12, ${alpha})`; 
    
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class ShockwaveEffect implements Effect {
  x: number;
  y: number;
  progress = 0;
  duration = 400;

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
    const alpha = 1 - Math.pow(this.progress, 2);
    const radius = 150 * Math.pow(this.progress, 0.5);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 4 * alpha;
    ctx.stroke();
    ctx.restore();
  }
}

export class LightningEffect implements Effect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress = 0;
  duration = 200;
  points: {x: number, y: number}[] = [];

  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    
    // Generate lightning jagged line
    const dx = x2 - x1;
    const dy = y2 - y1;
    const mag = Math.hypot(dx, dy);
    const segments = Math.floor(mag / 20) + 1;
    
    this.points.push({x: x1, y: y1});
    for (let i = 1; i < segments; i++) {
      const p = i / segments;
      const px = x1 + dx * p;
      const py = y1 + dy * p;
      const offset = (Math.random() - 0.5) * 40;
      this.points.push({
        x: px + (dy / mag) * offset,
        y: py - (dx / mag) * offset
      });
    }
    this.points.push({x: x2, y: y2});
  }

  update(dt: number): boolean {
    this.progress += dt / this.duration;
    return this.progress >= 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.progress >= 1) return;
    const alpha = 1 - this.progress;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#60a5fa';
    ctx.strokeStyle = `rgba(191, 219, 254, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}