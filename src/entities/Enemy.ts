export type EnemyType = 'grunt' | 'swarmer' | 'brute' | 'ranged';

export class Enemy {
  x: number;
  y: number;
  type: EnemyType;
  isElite: boolean;

  hp: number = 50;
  maxHp: number = 50;
  speed: number = 80;
  dead: boolean = false;
  radius: number = 14;
  mass: number = 1;
  angle: number = 0;

  hitFlashTimer: number = 0;
  stunTimer: number = 0;
  knockbackX: number = 0;
  knockbackY: number = 0;

  // Ranged specific
  attackTimer: number = 0;

  constructor(x: number, y: number, type: EnemyType = 'grunt', isElite: boolean = false) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.isElite = isElite;

    switch (type) {
      case 'swarmer':
        this.hp = 20; this.speed = 130; this.radius = 8; this.mass = 0.5;
        break;
      case 'brute':
        this.hp = 150; this.speed = 45; this.radius = 22; this.mass = 3;
        break;
      case 'ranged':
        this.hp = 30; this.speed = 60; this.radius = 12; this.mass = 1;
        this.attackTimer = 2000;
        break;
      case 'grunt':
      default:
        this.hp = 50; this.speed = 80; this.radius = 14; this.mass = 1;
        break;
    }

    if (isElite) {
      this.hp *= 4;
      this.radius *= 1.5;
      this.mass *= 2;
    }
    this.maxHp = this.hp;
  }

  update(dt: number, playerX: number, playerY: number, enemies: Enemy[], onEnemyShoot?: Function) {
    if (this.dead) return;
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      if (this.stunTimer < 0) this.stunTimer = 0;
    }

    // Apply knockback
    if (Math.abs(this.knockbackX) > 1 || Math.abs(this.knockbackY) > 1) {
      this.x += this.knockbackX * (dt / 1000);
      this.y += this.knockbackY * (dt / 1000);
      this.knockbackX *= 0.8;
      this.knockbackY *= 0.8;
      return; // Can't move while knocked back
    }

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const mag = Math.hypot(dx, dy);

    if (this.stunTimer > 0) return; // Stunned enemies cannot move or attack

    let isAttacking = false;

    if (this.type === 'ranged') {
      if (mag < 250) {
        isAttacking = true;
        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
          if (onEnemyShoot) onEnemyShoot(this.x, this.y, playerX, playerY);
          this.attackTimer = 2000 + Math.random() * 1000;
        }
      } else {
        this.attackTimer = 2000; // reset
      }
    }

    if (isAttacking) return; // Ranged enemies stop to shoot

    // Separation forces
    let sepX = 0;
    let sepY = 0;
    let neighbors = 0;
    
    for (const other of enemies) {
      if (other === this || other.dead) continue;
      const dist = Math.hypot(this.x - other.x, this.y - other.y);
      const minSep = this.radius + other.radius + 2;
      if (dist < minSep && dist > 0) {
        sepX += (this.x - other.x) / dist;
        sepY += (this.y - other.y) / dist;
        neighbors++;
      }
    }
    
    if (neighbors > 0) {
      sepX /= neighbors;
      sepY /= neighbors;
    }

    const dirX = (mag > 0 ? dx / mag : 0) + sepX * 1.5;
    const dirY = (mag > 0 ? dy / mag : 0) + sepY * 1.5;
    const dirMag = Math.hypot(dirX, dirY);

    if (dirMag > 0.001) {
      this.angle = Math.atan2(dirY, dirX);
    }

    if (mag > this.radius + 5) {
      this.x += (dirX / dirMag) * this.speed * (dt / 1000);
      this.y += (dirY / dirMag) * this.speed * (dt / 1000);
    }
  }

  takeDamage(amount: number, angle?: number, forceMult: number = 300) {
    this.hp -= amount;
    this.hitFlashTimer = 60;
    
    // Apply micro-stun to prevent instant retaliation trading
    this.stunTimer = Math.max(this.stunTimer, 200);
    
    if (angle !== undefined) {
      // Squash & stretch implied by hitflash visually, knockback affected by mass
      this.knockbackX = (Math.cos(angle) * forceMult) / this.mass;
      this.knockbackY = (Math.sin(angle) * forceMult) / this.mass;
    }

    if (this.hp <= 0) {
      this.dead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const isHit = this.hitFlashTimer > 0;
    const time = performance.now();

    if (isHit) {
      // Squash and stretch when hit
      ctx.scale(1.3, 0.7);
    }

    // Rotate to face movement direction
    ctx.rotate(this.angle);

    ctx.shadowBlur = isHit ? 0 : 6;
    ctx.shadowColor = isHit ? 'transparent' : '#ff2200';
    ctx.strokeStyle = '#5c0d11';
    ctx.lineWidth = 2;
    ctx.fillStyle = isHit ? '#ffffff' : '#0d0d11';

    if (this.isElite) {
      const pulse = 1 + Math.sin(time / 200) * 0.1;
      ctx.scale(pulse, pulse);
    }

    ctx.beginPath();
    
    if (this.type === 'swarmer') {
      // Spiky teardrop/arachnid
      const jitter = Math.sin(time / 50) * 2;
      ctx.moveTo(this.radius + jitter, 0);
      ctx.lineTo(-this.radius, -this.radius + jitter);
      ctx.lineTo(-this.radius / 2, 0);
      ctx.lineTo(-this.radius, this.radius - jitter);
      ctx.closePath();
      ctx.fill();
      if (!isHit) ctx.stroke();

      // Twitching legs
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(-this.radius, -this.radius * 1.5 + jitter);
      ctx.moveTo(0, 0); ctx.lineTo(-this.radius, this.radius * 1.5 - jitter);
      ctx.moveTo(-this.radius/2, 0); ctx.lineTo(-this.radius*1.5, -this.radius + jitter);
      ctx.moveTo(-this.radius/2, 0); ctx.lineTo(-this.radius*1.5, this.radius - jitter);
      ctx.strokeStyle = isHit ? '#ffffff' : '#1a080c';
      ctx.stroke();

      // Slit eye
      ctx.fillStyle = isHit ? '#000' : '#f59e0b';
      ctx.shadowBlur = isHit ? 0 : 8;
      ctx.shadowColor = '#f59e0b';
      ctx.fillRect(this.radius / 2, -2, 3, 4);
      
    } else if (this.type === 'brute') {
      // Bulky, asymmetric jagged mass
      const nodes = 7;
      for (let i = 0; i < nodes; i++) {
        const a = (i / nodes) * Math.PI * 2;
        const r = this.radius + Math.sin(time / 150 + i * 2) * 4;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      if (!isHit) ctx.stroke();

      // Multiple pinpoint eyes
      ctx.fillStyle = isHit ? '#000' : '#ef4444';
      ctx.shadowBlur = isHit ? 0 : 10;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();
      ctx.arc(this.radius / 2, -5, 2, 0, Math.PI*2);
      ctx.arc(this.radius / 2, 5, 2, 0, Math.PI*2);
      ctx.arc(this.radius / 3, -10, 1.5, 0, Math.PI*2);
      ctx.fill();

    } else { // 'ranged' or 'grunt' -> Stalker / Lurker
      // Floating parasite/eyeball
      const r = this.radius + Math.sin(time / 100) * 2;
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      if (!isHit) ctx.stroke();
      
      // Undulating tail tendrils behind
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.quadraticCurveTo(-r * 2, Math.sin(time / 80) * 10, -r * 3, Math.sin(time / 100) * 5);
      ctx.moveTo(-r, 5);
      ctx.quadraticCurveTo(-r * 1.5, Math.sin(time / 70 + 1) * 8, -r * 2.5, Math.sin(time / 90 + 1) * 6);
      ctx.strokeStyle = isHit ? '#ffffff' : '#5c0d11';
      ctx.stroke();

      // Giant Eye
      ctx.fillStyle = isHit ? '#000' : '#1a080c';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(2, 0, r * 0.6, 0, Math.PI*2);
      ctx.fill();
      
      // Pupil (pointing forward)
      ctx.fillStyle = isHit ? '#fff' : '#f59e0b';
      ctx.shadowBlur = isHit ? 0 : 8;
      ctx.shadowColor = '#f59e0b';
      ctx.beginPath();
      ctx.arc(4, 0, r * 0.3, 0, Math.PI*2);
      ctx.fill();

      // Telegraph if ranged
      if (this.type === 'ranged' && this.attackTimer < 1000 && this.attackTimer > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${1 - this.attackTimer / 1000})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}