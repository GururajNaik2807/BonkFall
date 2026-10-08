import { Enemy } from "./Enemy";
import type { AttackState } from "../types";

export class Warrior {
  x: number = window.innerWidth / 2;
  y: number = window.innerHeight / 2;
  speed: number = 200;
  attackRange: number = 100; // Increased range
  damage: number = 25;
  damageMult = 1;
  attackSpeedMult = 1;
  
  hp: number = 100;
  maxHp: number = 100;
  hitFlashTimer: number = 0;

  state: AttackState = 'IDLE';
  stateTimer: number = 0;
  targetAngle: number = 0;
  
  dashCooldown: number = 0;

  windupTime = 150;
  swingTime = 150; 
  recoveryTime = 250;
  
  moveAngle: number = 0;

  update(dt: number, enemies: Enemy[], keys: Record<string, boolean>, onHit: Function) {
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;

    let dx = 0; let dy = 0;
    if (keys['w'] || keys['ArrowUp']) dy -= 1;
    if (keys['s'] || keys['ArrowDown']) dy += 1;
    if (keys['a'] || keys['ArrowLeft']) dx -= 1;
    if (keys['d'] || keys['ArrowRight']) dx += 1;

    const mag = Math.hypot(dx, dy);
    
    // Dash / Break-Free
    if (keys[' '] && this.dashCooldown <= 0) {
      this.dashCooldown = 3000;
      this.hitFlashTimer = 500; // I-frames
      for (const e of enemies) {
        if (!e.dead && this.distanceTo(e) < 150) {
          const a = Math.atan2(e.y - this.y, e.x - this.x);
          e.knockbackX = Math.cos(a) * 800 / e.mass;
          e.knockbackY = Math.sin(a) * 800 / e.mass;
          e.stunTimer = 600; 
        }
      }
      this.x += (dx / (mag || 1)) * 150;
      this.y += (dy / (mag || 1)) * 150;
    }

    if (mag > 0) {
      const moveSpeed = this.state === 'IDLE' ? this.speed : this.speed * 0.8; // High mobility during swings
      this.x += (dx / mag) * moveSpeed * (dt / 1000);
      this.y += (dy / mag) * moveSpeed * (dt / 1000);
      this.moveAngle = Math.atan2(dy, dx);
    }

    if (this.state === 'IDLE') {
      const target = this.getClosestEnemy(enemies);
      if (target && this.distanceTo(target) <= this.attackRange) {
        this.state = 'WINDUP';
        this.stateTimer = this.windupTime / this.attackSpeedMult;
        this.targetAngle = Math.atan2(target.y - this.y, target.x - this.x);
      }
    } 
    else if (this.state === 'WINDUP') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = 'SWING';
        this.stateTimer = this.swingTime / this.attackSpeedMult;
        
        // Whirlwind / Wide Cleave
        let hitAny = false;
        for (const target of enemies) {
          if (target.dead) continue;
          const dist = this.distanceTo(target);
          if (dist <= this.attackRange + 20) {
            const angleToTarget = Math.atan2(target.y - this.y, target.x - this.x);
            let diff = Math.abs(angleToTarget - this.targetAngle);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;
            if (diff < Math.PI * 0.6) { // ~210-degree cleave
              onHit(target, this.damage * this.damageMult, this.targetAngle, 600); // 600 force knockback
              hitAny = true;
            }
          }
        }
        if (hitAny) {
          // Bloodlust passive heal
          this.hp = Math.min(this.maxHp, this.hp + 2);
        }
      }
    } 
    else if (this.state === 'SWING') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = 'RECOVERY';
        this.stateTimer = this.recoveryTime / this.attackSpeedMult;
      }
    } 
    else if (this.state === 'RECOVERY') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = 'IDLE';
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    const time = performance.now();
    const bob = Math.sin(time / 150) * 2;
    const tilt = this.state === 'IDLE' ? (Math.cos(this.moveAngle) * 0.1) : 0;
    
    // Weapon recoil
    let recoilX = 0; let recoilY = 0;
    if (this.state === 'RECOVERY') {
       recoilX = Math.cos(this.targetAngle) * 4;
       recoilY = Math.sin(this.targetAngle) * 4;
    }

    ctx.rotate(tilt);
    ctx.translate(recoilX, recoilY + bob);

    // Cape/Cloak
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.quadraticCurveTo(-20 + Math.sin(time/100)*5, 15, -15, 25);
    ctx.lineTo(15, 25);
    ctx.quadraticCurveTo(20 + Math.cos(time/120)*5, 15, 10, -5);
    ctx.fill();

    // Body (Heavy Armor)
    ctx.fillStyle = this.hitFlashTimer > 0 ? '#ffffff' : '#334155';
    ctx.fillRect(-12, -8, 24, 18);
    
    // Pauldrons
    ctx.fillStyle = this.hitFlashTimer > 0 ? '#ffffff' : '#94a3b8';
    ctx.beginPath(); ctx.arc(-14, -6, 6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(14, -6, 6, 0, Math.PI*2); ctx.fill();

    // Head / Spartan Helm
    ctx.fillStyle = this.hitFlashTimer > 0 ? '#ffffff' : '#cbd5e1';
    ctx.fillRect(-8, -18, 16, 14);
    
    // Glowing Visor
    ctx.fillStyle = '#fbbf24';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#fbbf24';
    ctx.fillRect(-5, -14, 10, 4);
    ctx.shadowBlur = 0;
    
    ctx.restore();

    // Weapon Swing Effect
    if (this.state !== 'IDLE') {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.targetAngle);

      let swingProgress = 0;
      if (this.state === 'WINDUP') swingProgress = 0;
      else if (this.state === 'SWING') swingProgress = 1 - (this.stateTimer / (this.swingTime / this.attackSpeedMult));
      else if (this.state === 'RECOVERY') swingProgress = 1;

      if (this.state === 'SWING' || this.state === 'RECOVERY') {
        const startAngle = -Math.PI * 0.6;
        const endAngle = startAngle + (swingProgress * Math.PI * 1.2);
        
        ctx.beginPath();
        ctx.arc(0, 0, this.attackRange, startAngle, endAngle);
        
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0ea5e9';
        const decay = this.state === 'RECOVERY' ? (this.stateTimer / (this.recoveryTime / this.attackSpeedMult)) : 1;
        ctx.lineWidth = 18 * decay;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, this.attackRange, startAngle, endAngle);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6 * decay;
        ctx.stroke();
      }
      ctx.restore();
    }
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