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

  hitFlashTimer: number = 0;
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

    if (mag > this.radius + 5) {
      this.x += (dirX / dirMag) * this.speed * (dt / 1000);
      this.y += (dirY / dirMag) * this.speed * (dt / 1000);
    }
  }

  takeDamage(amount: number, angle?: number) {
    this.hp -= amount;
    this.hitFlashTimer = 100;
    
    if (angle !== undefined) {
      // Squash & stretch implied by hitflash visually, knockback affected by mass
      this.knockbackX = (Math.cos(angle) * 300) / this.mass;
      this.knockbackY = (Math.sin(angle) * 300) / this.mass;
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
      ctx.scale(1.2, 0.8);
    }

    if (this.isElite) {
      // Elite Aura
      const pulse = 1 + Math.sin(time / 200) * 0.1;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.8 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fill();
    }

    if (this.type === 'swarmer') {
      ctx.fillStyle = isHit ? '#fff' : '#bef264';
      ctx.beginPath();
      ctx.moveTo(0, -this.radius);
      ctx.lineTo(this.radius, this.radius);
      ctx.lineTo(-this.radius, this.radius);
      ctx.fill();
    } 
    else if (this.type === 'brute') {
      ctx.fillStyle = isHit ? '#fff' : '#334155';
      ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
      // Brute eyes
      ctx.fillStyle = isHit ? '#000' : '#ef4444';
      ctx.fillRect(-this.radius/2 - 2, -4, 4, 4);
      ctx.fillRect(this.radius/2 - 2, -4, 4, 4);
    }
    else if (this.type === 'ranged') {
      ctx.fillStyle = isHit ? '#fff' : '#a855f7';
      ctx.beginPath();
      ctx.moveTo(0, -this.radius);
      ctx.lineTo(this.radius, 0);
      ctx.lineTo(0, this.radius);
      ctx.lineTo(-this.radius, 0);
      ctx.fill();

      // Telegraph indicator
      if (this.attackTimer < 1000 && this.attackTimer > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${1 - this.attackTimer / 1000})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    else {
      // Grunt (Goblin)
      ctx.fillStyle = isHit ? '#fff' : '#14532d';
      ctx.beginPath();
      ctx.moveTo(-12, -6); ctx.lineTo(-24, -14); ctx.lineTo(-6, -12); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(12, -6); ctx.lineTo(24, -14); ctx.lineTo(6, -12); ctx.fill();

      ctx.fillStyle = isHit ? '#ef4444' : '#22c55e';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isHit ? '#000' : '#ef4444';
      ctx.beginPath();
      ctx.arc(-5, -4, 2.5, 0, Math.PI * 2);
      ctx.arc(5, -4, 2.5, 0, Math.PI * 2); 
      ctx.fill();
    }

    ctx.restore();
  }
}