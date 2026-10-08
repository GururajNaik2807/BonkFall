import { Enemy } from "./Enemy";
import { MagicMissile } from "./Projectiles";
import type { AttackState } from "../types";

export class Mage {
  x: number = window.innerWidth / 2;
  y: number = window.innerHeight / 2;
  speed: number = 220; 
  attackRange: number = 300; 
  
  hp: number = 100;
  maxHp: number = 100;
  hitFlashTimer: number = 0;

  cooldownTimer: number = 0;
  attackSpeed: number = 600; 

  update(dt: number, enemies: Enemy[], keys: Record<string, boolean>, onHit: Function, onShoot: Function) {
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
    
    let dx = 0; let dy = 0;
    if (keys['w'] || keys['ArrowUp']) dy -= 1;
    if (keys['s'] || keys['ArrowDown']) dy += 1;
    if (keys['a'] || keys['ArrowLeft']) dx -= 1;
    if (keys['d'] || keys['ArrowRight']) dx += 1;

    const mag = Math.hypot(dx, dy);
    if (mag > 0) {
      this.x += (dx / mag) * this.speed * (dt / 1000);
      this.y += (dy / mag) * this.speed * (dt / 1000);
    }
    
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= dt;
    } else {
      const target = this.getClosestEnemy(enemies);
      if (target && this.distanceTo(target) <= this.attackRange) {
        onShoot(new MagicMissile(this.x, this.y - 10, target));
        this.cooldownTimer = this.attackSpeed;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.hitFlashTimer > 0) {
      // Hit flash effect: render sprite brighter/red tinted, we'll just tint by setting globalCompositeOperation or fillStyle
    }

    // Robe (Dark Purple)
    ctx.fillStyle = this.hitFlashTimer > 0 ? '#ef4444' : '#7c3aed';
    ctx.fillRect(-8, -2, 16, 16);
    
    // Face (Skin tone)
    ctx.fillStyle = this.hitFlashTimer > 0 ? '#fff' : '#fde047';
    ctx.fillRect(-5, -10, 10, 8);
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(-3, -8, 2, 2);
    ctx.fillRect(1, -8, 2, 2);

    // Wizard Hat
    ctx.fillStyle = this.hitFlashTimer > 0 ? '#ef4444' : '#5b21b6';
    ctx.beginPath();
    ctx.moveTo(0, -24); ctx.lineTo(-7, -10); ctx.lineTo(7, -10); ctx.fill();
    ctx.fillRect(-12, -10, 24, 2);

    // Wooden Staff
    ctx.fillStyle = '#92400e';
    ctx.fillRect(8, -8, 3, 20);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(7, -11, 5, 5);

    ctx.restore();
  }

  private distanceTo(e: Enemy) { return Math.hypot(e.x - this.x, e.y - this.y); }
  private getClosestEnemy(enemies: Enemy[]): Enemy | null {
    if (enemies.length === 0) return null;
    return enemies.reduce((closest, current) => 
      this.distanceTo(current) < this.distanceTo(closest) ? current : closest
    );
  }
}