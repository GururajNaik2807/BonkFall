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
  
  damage: number = 20;

  cooldownTimer: number = 0;
  attackSpeed: number = 600; 
  
  moveAngle: number = 0;

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
      this.moveAngle = Math.atan2(dy, dx);
    }
    
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= dt;
    } else {
      const target = this.getClosestEnemy(enemies);
      if (target && this.distanceTo(target) <= this.attackRange) {
        onShoot(new MagicMissile(this.x, this.y - 10, target, this.damage));
        this.cooldownTimer = this.attackSpeed;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const time = performance.now();
    const bob = Math.sin(time / 200) * 3;
    
    ctx.translate(0, bob);
    
    // Coat Tails (Flowing behind)
    ctx.fillStyle = '#4c1d95';
    ctx.beginPath();
    ctx.moveTo(-8, 5);
    ctx.quadraticCurveTo(-15 - Math.cos(time/150)*4, 20, -25, 25);
    ctx.lineTo(25, 25);
    ctx.quadraticCurveTo(15 + Math.sin(time/120)*4, 20, 8, 5);
    ctx.fill();

    // Body (Sleek Coat)
    ctx.fillStyle = this.hitFlashTimer > 0 ? '#ffffff' : '#5b21b6';
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(10, -10);
    ctx.lineTo(12, 10);
    ctx.lineTo(-12, 10);
    ctx.fill();
    
    // Head / Hood
    ctx.fillStyle = this.hitFlashTimer > 0 ? '#ffffff' : '#2e1065';
    ctx.beginPath();
    ctx.arc(0, -14, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Glowing Visor/Runes on Face
    ctx.fillStyle = '#06b6d4';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#06b6d4';
    ctx.fillRect(-6, -16, 12, 3);
    
    // Energy Accents (Floating Hands)
    const handBob = Math.cos(time/150) * 3;
    ctx.beginPath();
    ctx.arc(-16, -2 + handBob, 4, 0, Math.PI*2);
    ctx.arc(16, -2 - handBob, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Staff / Runic Weapon
    ctx.fillStyle = '#92400e';
    ctx.fillRect(14, -8 - handBob, 3, 24);
    
    // Staff Core Crystal
    ctx.fillStyle = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(15.5, -14 - handBob);
    ctx.lineTo(19, -9 - handBob);
    ctx.lineTo(15.5, -4 - handBob);
    ctx.lineTo(12, -9 - handBob);
    ctx.fill();

    ctx.restore();
  }

  private distanceTo(e: Enemy) { return Math.hypot(e.x - this.x, e.y - this.y); }
  private getClosestEnemy(enemies: Enemy[]): Enemy | null {
    if (enemies.length === 0) return null;
    let min = Infinity;
    let closest = null;
    for (const e of enemies) {
      if (e.dead) continue;
      const d = this.distanceTo(e);
      if (d < min) {
        min = d;
        closest = e;
      }
    }
    return closest;
  }
}