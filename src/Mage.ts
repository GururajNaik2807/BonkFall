import { Enemy } from "./Enemy";

// Tracking Projectile Class
export class MagicMissile {
  x: number;
  y: number;
  target: Enemy;
  speed: number = 400;
  damage: number = 20;
  dead: boolean = false;

  constructor(x: number, y: number, target: Enemy) {
    this.x = x;
    this.y = y;
    this.target = target;
  }

  update(dt: number, onHit: Function) {
    if (this.target.dead) {
      this.dead = true; // Fizzle out if target dies before impact
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const mag = Math.hypot(dx, dy);

    if (mag < 15) {
      onHit(this.target, this.damage, Math.atan2(dy, dx));
      this.dead = true;
    } else {
      this.x += (dx / mag) * this.speed * (dt / 1000);
      this.y += (dy / mag) * this.speed * (dt / 1000);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#38bdf8'; // Glowing blue missile
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow
  }
}

// Mage Character Class
export class Mage {
  x: number = window.innerWidth / 2;
  y: number = window.innerHeight / 2;
  speed: number = 220; 
  attackRange: number = 300; // Much further than Warrior
  
  cooldownTimer: number = 0;
  attackSpeed: number = 600; // ms between shots

  update(dt: number, enemies: Enemy[], keys: Record<string, boolean>, onHit: Function, onShoot: Function) {
    // Movement
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
    
    // Attack Logic
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

    // Robe (Dark Purple)
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(-8, -2, 16, 16);
    
    // Face (Skin tone)
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-5, -10, 10, 8);
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(-3, -8, 2, 2);
    ctx.fillRect(1, -8, 2, 2);

    // Wizard Hat
    ctx.fillStyle = '#5b21b6';
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