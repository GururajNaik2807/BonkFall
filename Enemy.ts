export class Enemy {
  public x: number;
  public y: number;
  public speed: number;
  public hp = 40;
  public radius = 14;
  private color: string;
  private offsetSeed: number;

  constructor(x: number, y: number, waveMultiplier: number) {
    this.x = x;
    this.y = y;
    this.speed = 70 + Math.random() * 40 * waveMultiplier;
    this.hp = 40 * waveMultiplier;
    this.offsetSeed = Math.random() * 100;
    
    const palettes = ["#8b5cf6", "#d946ef", "#f43f5e", "#10b981"];
    this.color = palettes[Math.floor(Math.random() * palettes.length)];
  }

  public update(px: number, py: number, dt: number) {
    const dx = px - this.x;
    const dy = py - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    }
  }

  public draw(ctx: CanvasRenderingContext2D, gameTime: number) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Slime wobble animation
    const wobble = Math.sin(gameTime * 8 + this.offsetSeed) * 0.1;
    ctx.scale(1 + wobble, 1 - wobble);

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(-4, -4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4, -4, 3, 0, Math.PI * 2); ctx.fill();
    
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(-4, -4, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4, -4, 1.5, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }
}
