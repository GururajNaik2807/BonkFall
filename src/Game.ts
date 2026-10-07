import { Warrior } from "./Warrior";
import { Mage } from "./Mage";
import { Enemy } from "./Enemy";

export interface Choice { id: string; icon: string; name: string; level: number; description: string; }
export interface Snapshot { hp: number; maxHp: number; xp: number; nextXp: number; level: number; time: number; wave: number; mapName: string; kills: number; powerLevel: number; paused: boolean; choices?: Choice[]; }
export interface Result { won: boolean; time: number; kills: number; level: number; power: number; }

interface VisualEffect { x: number; y: number; life: number; maxLife: number; color: string; }
interface Projectile { x: number; y: number; target: Enemy; speed: number; damage: number; }

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private host: HTMLDivElement;
  private setS: (s: Snapshot | null) => void;
  private setR: (r: Result | null) => void;

  private isPaused = false;
  private isRunning = false;
  private animationId = 0;
  private keys: Record<string, boolean> = {};

  private player: Warrior | Mage = new Warrior();
  private enemies: Enemy[] = [];
  private effects: VisualEffect[] = [];
  private projectiles: Projectile[] = [];
  
  private lastTime = 0;
  private gameTime = 0;
  private spawnTimer = 0;
  private lastAttackTime = -999;
  
  private stats = { xp: 0, nextXp: 100, level: 1, kills: 0, wave: 1, powerLevel: 1 };

  constructor(host: HTMLDivElement, setS: (s: Snapshot | null) => void, setR: (r: Result | null) => void) {
    this.host = host;
    this.setS = setS;
    this.setR = setR;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
    this.host.appendChild(this.canvas);
    
    this.resize = this.resize.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.loop = this.loop.bind(this);

    window.addEventListener("resize", this.resize);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.resize();
  }

  private resize() {
    this.canvas.width = this.host.clientWidth;
    this.canvas.height = this.host.clientHeight;
    if (!this.isRunning) {
      this.player.x = this.canvas.width / 2;
      this.player.y = this.canvas.height / 2;
    }
  }

  private onKeyDown(e: KeyboardEvent) { this.keys[e.key.toLowerCase()] = true; }
  private onKeyUp(e: KeyboardEvent) { this.keys[e.key.toLowerCase()] = false; }

  public start(heroType: "warrior" | "mage" = "warrior") {
    this.isRunning = true;
    this.isPaused = false;
    this.gameTime = 0;
    
    this.player = heroType === "mage" ? new Mage() : new Warrior();
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height / 2;
    
    this.enemies = [];
    this.effects = [];
    this.projectiles = [];
    this.stats = { xp: 0, nextXp: 100, level: 1, kills: 0, wave: 1, powerLevel: 1 };
    this.lastTime = performance.now();
    this.updateHUD();
    this.animationId = requestAnimationFrame(this.loop);
  }

  public pause() {
    this.isPaused = !this.isPaused;
    this.updateHUD();
    if (!this.isPaused) {
      this.lastTime = performance.now();
      this.animationId = requestAnimationFrame(this.loop);
    }
  }

  public choose(id: string) {
    if (id === "dmg") this.player.damage += 15;
    if (id === "spd") this.player.speed *= 1.15;
    if (id === "rng") this.player.attackRange += 30;
    
    this.stats.powerLevel++;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.updateHUD(); 
    this.animationId = requestAnimationFrame(this.loop);
  }

  public destroy() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.remove();
  }

  private updateHUD(choices?: Choice[]) {
    this.setS({
      hp: this.player.hp, maxHp: this.player.maxHp,
      xp: this.stats.xp, nextXp: this.stats.nextXp,
      level: this.stats.level, time: this.gameTime,
      wave: this.stats.wave, mapName: "Verdant Expanse",
      kills: this.stats.kills, powerLevel: this.stats.powerLevel,
      paused: this.isPaused, choices
    });
  }

  private loop(timestamp: number) {
    if (!this.isRunning || this.isPaused) return;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1); 
    this.lastTime = timestamp;
    this.gameTime += dt;

    this.updateLogic(dt);
    this.draw();
    this.updateHUD();

    this.animationId = requestAnimationFrame(this.loop);
  }

  private handleEnemyDeath(enemy: Enemy) {
    this.enemies = this.enemies.filter(e => e !== enemy);
    this.stats.kills++;
    this.stats.xp += 15;
    if (this.stats.xp >= this.stats.nextXp) {
      this.stats.level++;
      this.stats.xp = 0;
      this.stats.nextXp = Math.floor(this.stats.nextXp * 1.5);
      
      const upgrades: Choice[] = [
        { id: "dmg", icon: "⚔️", name: "Sharp Edge", level: this.stats.level, description: "Increases base attack damage." },
        { id: "spd", icon: "🥾", name: "Swift Boots", level: this.stats.level, description: "Increases movement speed." },
        { id: "rng", icon: "🎯", name: "Long Reach", level: this.stats.level, description: "Widens auto-attack radius." }
      ];
      this.isPaused = true;
      this.updateHUD(upgrades);
    }
  }

  private updateLogic(dt: number) {
    this.player.update(this.keys, dt, { w: this.canvas.width, h: this.canvas.height });
    this.stats.wave = 1 + Math.floor(this.gameTime / 60);
    
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      const margin = 50;
      const side = Math.floor(Math.random() * 4);
      let ex = 0, ey = 0;
      switch (side) {
        case 0: ex = Math.random() * this.canvas.width; ey = -margin; break; 
        case 1: ex = this.canvas.width + margin; ey = Math.random() * this.canvas.height; break; 
        case 2: ex = Math.random() * this.canvas.width; ey = this.canvas.height + margin; break; 
        case 3: ex = -margin; ey = Math.random() * this.canvas.height; break; 
      }
      this.enemies.push(new Enemy(ex, ey, 1 + (this.stats.wave * 0.1)));
      this.spawnTimer = Math.max(0.2, 1.5 - (this.gameTime * 0.005) - (this.stats.wave * 0.1));
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(this.player.x, this.player.y, dt);
      if (Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y) < 20 + enemy.radius) {
        this.player.hp -= 15 * dt; 
        if (this.player.hp <= 0) {
          this.isRunning = false;
          this.setR({ won: false, time: this.gameTime, kills: this.stats.kills, level: this.stats.level, power: this.stats.powerLevel });
          return;
        }
      }
    }

    // Auto-Attack 
    if (this.gameTime - this.lastAttackTime >= this.player.attackCooldown) {
      let closest: Enemy | null = null;
      let minDist = this.player.attackRange;
      for (const enemy of this.enemies) {
        const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
        if (dist <= minDist) { minDist = dist; closest = enemy; }
      }

      if (closest) {
        this.lastAttackTime = this.gameTime;
        if (this.player.type === "warrior") {
          closest.hp -= this.player.damage;
          this.effects.push({ x: closest.x, y: closest.y, life: 0.2, maxLife: 0.2, color: "#ef4444" });
          if (closest.hp <= 0) this.handleEnemyDeath(closest);
        } else if (this.player.type === "mage") {
          this.projectiles.push({
            x: this.player.x, y: this.player.y - 15,
            target: closest, speed: 450, damage: this.player.damage
          });
        }
      }
    }

    // Projectiles Movement
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (p.target.hp <= 0) { this.projectiles.splice(i, 1); continue; } // Target already dead
      
      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < 15) {
        p.target.hp -= p.damage;
        this.effects.push({ x: p.target.x, y: p.target.y, life: 0.2, maxLife: 0.2, color: "#38bdf8" });
        if (p.target.hp <= 0) this.handleEnemyDeath(p.target);
        this.projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * p.speed * dt;
        p.y += (dy / dist) * p.speed * dt;
      }
    }

    this.effects.forEach(e => e.life -= dt);
    this.effects = this.effects.filter(e => e.life > 0);
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 100) { this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.canvas.height); this.ctx.stroke(); }
    for (let y = 0; y < this.canvas.height; y += 100) { this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.canvas.width, y); this.ctx.stroke(); }

    this.enemies.forEach(enemy => enemy.draw(this.ctx, this.gameTime));
    
    // Draw Projectiles
    this.projectiles.forEach(p => {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.fillStyle = "#38bdf8";
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = "#38bdf8";
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    const isMoving = Object.values(this.keys).some(k => k);
    this.player.draw(this.ctx, this.gameTime, isMoving, this.gameTime - this.lastAttackTime);

    this.effects.forEach(effect => {
      this.ctx.save();
      this.ctx.translate(effect.x, effect.y);
      this.ctx.strokeStyle = effect.color;
      this.ctx.globalAlpha = effect.life / effect.maxLife;
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(-15, -15); this.ctx.lineTo(15, 15);
      this.ctx.moveTo(15, -15); this.ctx.lineTo(-15, 15);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }
}
