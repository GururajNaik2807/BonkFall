import { Enemy } from "./Enemy";
import { MagicMissile } from "./Projectiles";
import { ArcaneBlast } from "../effects/Effects";
import { audioManager } from "../engine/AudioManager";

export class Mage {
  x: number = window.innerWidth / 2;
  y: number = window.innerHeight / 2;
  speed: number = 220; 
  attackRange: number = 300; 
  
  hp: number = 100;
  maxHp: number = 100;
  hitFlashTimer: number = 0;
  
  damage: number = 20;
  damageMult = 1;
  attackSpeedMult = 1;

  cooldownTimer: number = 0;
  attackSpeed: number = 600; 
  
  arcaneBlastTimer: number = 3000;
  
  moveAngle: number = 0;

  update(dt: number, enemies: Enemy[], keys: Record<string, boolean>, onHit: Function, onShoot: Function, addEffect: Function) {
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
    
    // Primary Spread Attack
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= dt;
    } else {
      const target = this.getClosestEnemy(enemies);
      if (target && this.distanceTo(target) <= this.attackRange) {
        const spreadCount = 3;
        const angleToTarget = Math.atan2(target.y - this.y, target.x - this.x);
        for (let i = 0; i < spreadCount; i++) {
          const angle = angleToTarget + (i - Math.floor(spreadCount/2)) * 0.25;
          onShoot(new MagicMissile(this.x, this.y - 10, angle, this.damage * this.damageMult));
        }
        audioManager.playMageAttack(false);
        this.cooldownTimer = this.attackSpeed / this.attackSpeedMult;
      }
    }
    
    // Secondary Arcane Blast
    if (this.arcaneBlastTimer > 0) {
      this.arcaneBlastTimer -= dt;
    } else {
      const cluster = this.findDensestCluster(enemies);
      if (cluster) {
        addEffect(new ArcaneBlast(cluster.x, cluster.y));
        audioManager.playMageAttack(true);
        for (const e of enemies) {
          if (e.dead) continue;
          if (Math.hypot(e.x - cluster.x, e.y - cluster.y) < 150) { // 150 radius blast
             const a = Math.atan2(e.y - cluster.y, e.x - cluster.x);
             onHit(e, this.damage * this.damageMult * 3, a, 400); 
          }
        }
        this.arcaneBlastTimer = 4000 / this.attackSpeedMult; // Every 4s roughly
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const time = performance.now();
    const bob = Math.sin(time / 200) * 3;
    
    ctx.translate(0, bob);
    
    ctx.fillStyle = '#4c1d95';
    ctx.beginPath();
    ctx.moveTo(-8, 5);
    ctx.quadraticCurveTo(-15 - Math.cos(time/150)*4, 20, -25, 25);
    ctx.lineTo(25, 25);
    ctx.quadraticCurveTo(15 + Math.sin(time/120)*4, 20, 8, 5);
    ctx.fill();

    ctx.fillStyle = this.hitFlashTimer > 0 ? '#ffffff' : '#5b21b6';
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(10, -10);
    ctx.lineTo(12, 10);
    ctx.lineTo(-12, 10);
    ctx.fill();
    
    ctx.fillStyle = this.hitFlashTimer > 0 ? '#ffffff' : '#2e1065';
    ctx.beginPath();
    ctx.arc(0, -14, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#06b6d4';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#06b6d4';
    ctx.fillRect(-6, -16, 12, 3);
    
    const handBob = Math.cos(time/150) * 3;
    ctx.beginPath();
    ctx.arc(-16, -2 + handBob, 4, 0, Math.PI*2);
    ctx.arc(16, -2 - handBob, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#92400e';
    ctx.fillRect(14, -8 - handBob, 3, 24);
    
    ctx.fillStyle = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#38bdf8';
    
    // If charging blast, make staff glow intense
    if (this.arcaneBlastTimer < 500) {
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#a855f7';
      ctx.fillStyle = '#d946ef';
    }
    
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
  
  private findDensestCluster(enemies: Enemy[]): Enemy | null {
    if (enemies.length === 0) return null;
    let maxNeighbors = -1;
    let best = null;
    for (const e of enemies) {
      if (e.dead || this.distanceTo(e) > 600) continue; // Out of range for blast
      let neighbors = 0;
      for (const other of enemies) {
        if (other === e || other.dead) continue;
        if (Math.hypot(e.x - other.x, e.y - other.y) < 150) neighbors++;
      }
      if (neighbors > maxNeighbors) {
        maxNeighbors = neighbors;
        best = e;
      }
    }
    return best || this.getClosestEnemy(enemies);
  }
}