export class Mage {
  public type = "mage";
  public x = 0;
  public y = 0;
  public speed = 180;
  public hp = 70;
  public maxHp = 70;
  public attackRange = 280;
  public damage = 35;
  public attackCooldown = 1.2;

  private facingRight = true;

  public update(keys: Record<string, boolean>, dt: number, canvasBounds: { w: number; h: number }) {
    let dx = 0, dy = 0;
    if (keys["w"] || keys["arrowup"]) dy -= 1;
    if (keys["s"] || keys["arrowdown"]) dy += 1;
    if (keys["a"] || keys["arrowleft"]) dx -= 1;
    if (keys["d"] || keys["arrowright"]) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length; dy /= length;
    }

    if (dx > 0) this.facingRight = true;
    if (dx < 0) this.facingRight = false;

    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;
    this.x = Math.max(20, Math.min(canvasBounds.w - 20, this.x));
    this.y = Math.max(20, Math.min(canvasBounds.h - 20, this.y));
  }

  public draw(ctx: CanvasRenderingContext2D, gameTime: number, isMoving: boolean, timeSinceAttack: number) {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
    ctx.beginPath(); ctx.arc(0, 0, this.attackRange, 0, Math.PI * 2); ctx.stroke();

    if (!this.facingRight) ctx.scale(-1, 1);

    const bobOffset = isMoving ? Math.sin(gameTime * 15) * 3 : Math.sin(gameTime * 3) * 1;
    ctx.translate(0, bobOffset);
    ctx.scale(1.5, 1.5);

    // Robe
    ctx.fillStyle = "#581c87";
    ctx.beginPath();
    ctx.moveTo(-8, -5); ctx.lineTo(8, -5); ctx.lineTo(12, 18); ctx.lineTo(-12, 18); ctx.fill();

    // Belt
    ctx.fillStyle = "#fbbf24"; ctx.fillRect(-9, 4, 18, 2);

    // Head
    ctx.fillStyle = "#ffedd5"; ctx.fillRect(-5, -14, 10, 10);

    // Pointy Hat
    ctx.fillStyle = "#3b0764";
    ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(12, -12); ctx.lineTo(0, -32); ctx.fill();
    ctx.fillRect(-14, -14, 28, 3); // Brim

    // Staff
    ctx.save();
    const isAttacking = timeSinceAttack < 0.2;
    if (isAttacking) {
      ctx.translate(8, 0); ctx.rotate(Math.PI / 6);
    } else {
      ctx.translate(6, 2); ctx.rotate(Math.PI / 12);
    }
    
    // Pole
    ctx.fillStyle = "#78350f"; ctx.fillRect(0, -15, 3, 30);
    // Glowing Gem
    ctx.fillStyle = "#38bdf8";
    ctx.shadowBlur = 10; ctx.shadowColor = "#38bdf8";
    ctx.beginPath(); ctx.arc(1.5, -17, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.restore();
  }
}
