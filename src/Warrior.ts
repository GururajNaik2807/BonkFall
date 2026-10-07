export class Warrior {
  public type = "warrior";
  public x = 0;
  public y = 0;
  public speed = 200;
  public hp = 100;
  public maxHp = 100;
  public attackRange = 140;
  public damage = 25;
  public attackCooldown = 0.6; 

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

    ctx.strokeStyle = "rgba(190, 242, 100, 0.15)";
    ctx.beginPath(); ctx.arc(0, 0, this.attackRange, 0, Math.PI * 2); ctx.stroke();

    if (!this.facingRight) ctx.scale(-1, 1);

    const bobOffset = isMoving ? Math.sin(gameTime * 15) * 3 : Math.sin(gameTime * 3) * 1;
    ctx.translate(0, bobOffset);
    ctx.scale(1.5, 1.5);

    ctx.fillStyle = "#334155";
    ctx.fillRect(-6, 10, 5, 12); 
    ctx.fillRect(2, 10, 5, 12);  

    ctx.fillStyle = "#94a3b8"; ctx.fillRect(-9, -5, 18, 16);
    ctx.fillStyle = "#78350f"; ctx.fillRect(-10, 8, 20, 3);
    ctx.fillStyle = "#fbbf24"; ctx.fillRect(-2, 7, 5, 5);

    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath(); ctx.arc(-2, -2, 7, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#ffedd5"; ctx.fillRect(-5, -16, 10, 10);
    ctx.fillStyle = "#475569";
    ctx.beginPath(); ctx.arc(0, -15, 8, 0, Math.PI, true); ctx.fill();
    ctx.fillRect(-9, -15, 18, 4);
    ctx.fillStyle = "#ef4444"; ctx.fillRect(-2, -26, 4, 7);

    ctx.save();
    const isAttacking = timeSinceAttack < 0.15;
    if (isAttacking) {
      ctx.rotate(Math.PI / 2.5); ctx.translate(5, 5);
    } else {
      ctx.rotate(Math.PI / 12);
    }
    
    ctx.fillStyle = "#fbbf24"; ctx.fillRect(8, 0, 4, 4);
    ctx.fillStyle = "#475569"; ctx.fillRect(7, -2, 6, 2); ctx.fillRect(7, 4, 6, 2);
    ctx.fillStyle = "#e2e8f0"; ctx.fillRect(12, 1, 18, 3);
    
    ctx.beginPath(); ctx.moveTo(30, 1); ctx.lineTo(34, 2.5); ctx.lineTo(30, 4); ctx.fill();
    ctx.restore();
    ctx.restore();
  }
}
