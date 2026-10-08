import { Enemy } from "./Enemy";

type AttackState = 'IDLE' | 'WINDUP' | 'SWING' | 'RECOVERY';

export class Warrior {
  x: number = window.innerWidth / 2;
  y: number = window.innerHeight / 2;
  speed: number = 200;
  attackRange: number = 80;
  damage: number = 25;
  
  state: AttackState = 'IDLE';
  stateTimer: number = 0;
  targetAngle: number = 0;

  windupTime = 150;
  swingTime = 150; 
  recoveryTime = 250;

  update(dt: number, enemies: Enemy[], keys: Record<string, boolean>, onHit: Function) {
    let dx = 0; let dy = 0;
    if (keys['w'] || keys['ArrowUp']) dy -= 1;
    if (keys['s'] || keys['ArrowDown']) dy += 1;
    if (keys['a'] || keys['ArrowLeft']) dx -= 1;
    if (keys['d'] || keys['ArrowRight']) dx += 1;

    const mag = Math.hypot(dx, dy);
    if (mag > 0) {
      const moveSpeed = this.state === 'IDLE' ? this.speed : this.speed * 0.4;
      this.x += (dx / mag) * moveSpeed * (dt / 1000);
      this.y += (dy / mag) * moveSpeed * (dt / 1000);
    }

    if (this.state === 'IDLE') {
      const target = this.getClosestEnemy(enemies);
      if (target && this.distanceTo(target) <= this.attackRange) {
        this.state = 'WINDUP';
        this.stateTimer = this.windupTime;
        this.targetAngle = Math.atan2(target.y - this.y, target.x - this.x);
      }
    } 
    else if (this.state === 'WINDUP') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = 'SWING';
        this.stateTimer = this.swingTime;
        const target = this.getClosestEnemy(enemies);
        if (target && this.distanceTo(target) <= this.attackRange) {
           onHit(target, this.damage, this.targetAngle);
        }
      }
    } 
    else if (this.state === 'SWING') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = 'RECOVERY';
        this.stateTimer = this.recoveryTime;
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

    // --- Blocky Warrior Body ---
    // Torso (Blue Tunic/Armor)
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-7, -2, 14, 12);
    
    // Legs (Dark Grey)
    ctx.fillStyle = '#475569';
    ctx.fillRect(-5, 10, 4, 5);
    ctx.fillRect(1, 10, 4, 5);

    // Head (Silver Helmet)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-6, -12, 12, 10);
    
    // Helmet Visor/Eyes (Black)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -9, 8, 3);
    // ---------------------------

    ctx.restore();

    // Draw Curved Sword Slash (anchored to character center)
    if (this.state !== 'IDLE') {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.targetAngle);

      let swingProgress = 0;
      if (this.state === 'WINDUP') swingProgress = 0;
      else if (this.state === 'SWING') swingProgress = 1 - (this.stateTimer / this.swingTime);
      else if (this.state === 'RECOVERY') swingProgress = 1;

      if (this.state === 'SWING' || this.state === 'RECOVERY') {
        ctx.beginPath();
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (swingProgress * Math.PI);
        
        ctx.arc(0, 0, 45, startAngle, endAngle);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 12 * (1 - (swingProgress === 1 ? this.stateTimer/this.recoveryTime : 0));
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private distanceTo(e: Enemy) { return Math.hypot(e.x - this.x, e.y - this.y); }
  private getClosestEnemy(enemies: Enemy[]): Enemy | null {
    if (enemies.length === 0) return null;
    return enemies.reduce((closest, current) => 
      this.distanceTo(current) < this.distanceTo(closest) ? current : closest
    );
  }
}