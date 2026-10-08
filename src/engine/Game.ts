import { Warrior } from "../entities/Warrior";
import { Mage } from "../entities/Mage";
import { Enemy } from "../entities/Enemy";
import { MagicMissile } from "../entities/Projectiles";
import { DeathSlash, HitImpact, ScreenShake, type Effect } from "../effects/Effects";
import type { Snapshot, Result } from "../types";

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  
  player: any; 
  enemies: Enemy[] = [];
  effects: Effect[] = [];
  projectiles: MagicMissile[] = []; 
  
  keys: Record<string, boolean> = {};
  lastTime: number = 0;
  animationId: number = 0;
  
  setS: (s: Snapshot | null) => void;
  setR: (r: Result | null) => void;
  
  kills = 0;
  gameTime = 0;
  isPaused: boolean = false;
  isGameOver: boolean = false;
  
  screenShake: ScreenShake | null = null;
  
  zoom = 1.5; // Camera zoom

  constructor(host: HTMLDivElement, setS: any, setR: any) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
    host.appendChild(this.canvas);
    this.setS = setS; this.setR = setR;
    
    window.addEventListener("keydown", (e) => this.keys[e.key] = true);
    window.addEventListener("keyup", (e) => this.keys[e.key] = false);

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.imageSmoothingEnabled = false;
  }

  start(characterType: string) {
    if (characterType === 'mage') this.player = new Mage();
    else this.player = new Warrior();

    this.enemies = [];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 600 + Math.random() * 400; 
      this.enemies.push(new Enemy(
        this.player.x + Math.cos(angle) * distance, 
        this.player.y + Math.sin(angle) * distance
      ));
    }
    
    this.projectiles = [];
    this.effects = [];
    this.screenShake = null;
    
    this.kills = 0;
    this.gameTime = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  handleHit = (enemy: Enemy, damage: number, attackAngle: number) => {
    enemy.takeDamage(damage, attackAngle);
    this.effects.push(new HitImpact(enemy.x, enemy.y));
    
    // Tiny screen shake for heavy attacks
    if (damage >= 25 && !this.screenShake) {
      this.screenShake = new ScreenShake(2);
    }

    if (enemy.dead) {
      this.kills++;
      this.effects.push(new DeathSlash(enemy.x, enemy.y, attackAngle));
    }
  }

  handleShoot = (projectile: MagicMissile) => {
    this.projectiles.push(projectile);
  }

  pause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.lastTime = performance.now(); // Prevent large dt
    }
    this.updateHUD(); // Notify React
  }

  choose(id: string) {}

  loop = (time: number) => {
    this.animationId = requestAnimationFrame(this.loop);
    
    const dt = time - this.lastTime;
    this.lastTime = time;

    if (this.isPaused || this.isGameOver) {
      this.draw(); // keep drawing
      return;
    }

    this.update(dt);
    this.draw();
    this.updateHUD();
  }

  update(dt: number) {
    if (!this.player) return;
    this.gameTime += dt / 1000;

    this.player.update(dt, this.enemies, this.keys, this.handleHit, this.handleShoot);

    this.enemies.forEach(e => {
      e.update(dt, this.player.x, this.player.y, this.enemies);
      
      // Enemy collision with player
      const dist = Math.hypot(e.x - this.player.x, e.y - this.player.y);
      if (dist < 20 && this.player.hitFlashTimer <= 0) {
        this.player.hp -= 10;
        this.player.hitFlashTimer = 500; // I-frames
        this.screenShake = new ScreenShake(5); // Shake on hit
      }
    });
    
    this.enemies = this.enemies.filter(e => !e.dead);

    // Spawn more enemies slowly
    if (Math.random() < 0.05) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 800; 
      this.enemies.push(new Enemy(
        this.player.x + Math.cos(angle) * distance, 
        this.player.y + Math.sin(angle) * distance
      ));
    }

    this.projectiles.forEach(p => p.update(dt, this.handleHit));
    this.projectiles = this.projectiles.filter(p => !p.dead);

    this.effects = this.effects.filter(effect => !effect.update(dt));
    
    if (this.screenShake) {
      const done = this.screenShake.update(dt);
      if (done) this.screenShake = null;
    }

    // Check Death
    if (this.player.hp <= 0 && !this.isGameOver) {
      this.isGameOver = true;
      this.setR({
        won: false,
        time: this.gameTime,
        kills: this.kills,
        level: 1, // To be implemented later with XP
        power: 1
      });
    }
  }

  draw() {
    this.ctx.fillStyle = '#0f172a'; // Background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.player) return;

    this.ctx.save();
    
    // Camera Transform
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    
    if (this.screenShake) {
      this.ctx.translate(this.screenShake.offsetX, this.screenShake.offsetY);
    }
    
    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.translate(-this.player.x, -this.player.y);

    // Draw a grid for ground reference
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = 1;
    const grid = 100;
    const startX = Math.floor((this.player.x - this.canvas.width / this.zoom) / grid) * grid;
    const endX = startX + (this.canvas.width / this.zoom) * 2;
    const startY = Math.floor((this.player.y - this.canvas.height / this.zoom) / grid) * grid;
    const endY = startY + (this.canvas.height / this.zoom) * 2;

    this.ctx.beginPath();
    for (let x = startX; x < endX; x += grid) {
      this.ctx.moveTo(x, startY); this.ctx.lineTo(x, endY);
    }
    for (let y = startY; y < endY; y += grid) {
      this.ctx.moveTo(startX, y); this.ctx.lineTo(endX, y);
    }
    this.ctx.stroke();

    // Game Objects
    this.enemies.forEach(e => e.draw(this.ctx));
    this.projectiles.forEach(p => p.draw(this.ctx));
    this.effects.forEach(effect => effect.draw(this.ctx));
    this.player.draw(this.ctx);

    this.ctx.restore();
  }
  
  updateHUD() {
    if (!this.player || this.isGameOver) return;
    this.setS({
      hp: this.player.hp, maxHp: this.player.maxHp, xp: this.kills * 10, nextXp: 100, level: 1,
      time: this.gameTime, wave: 1, mapName: "Verdant Expanse", kills: this.kills,
      powerLevel: 1, paused: this.isPaused
    });
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    this.canvas.remove();
  }
}