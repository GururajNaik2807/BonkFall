import { Warrior } from "../entities/Warrior";
import { Mage } from "../entities/Mage";
import { Enemy } from "../entities/Enemy";
import { DeathSlash, HitImpact, ScreenShake, FloatingText, BloodSplatter, SparkParticle, type Effect } from "../effects/Effects";
import { EnemyProjectile, MagicMissile } from "../entities/Projectiles";
import { UPGRADES, type Upgrade } from "../data/upgrades";
import { AbilitiesManager } from "../entities/Abilities";
import { Overlay } from "./Overlay";
import type { EnemyType } from "../entities/Enemy";
import type { Snapshot, Result } from "../types";

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  
  player: any; 
  enemies: Enemy[] = [];
  effects: Effect[] = [];
  projectiles: MagicMissile[] = []; 
  enemyProjectiles: EnemyProjectile[] = [];
  
  keys: Record<string, boolean> = {};
  lastTime: number = 0;
  animationId: number = 0;
  
  setS: (s: Snapshot | null) => void;
  setR: (r: Result | null) => void;
  
  kills = 0;
  gameTime = 0;
  isPaused: boolean = false;
  isGameOver: boolean = false;
  isLevelingUp: boolean = false;
  
  xp = 0;
  nextXp = 100;
  level = 1;
  choices: Upgrade[] = [];
  abilities: AbilitiesManager;
  
  screenShake: ScreenShake | null = null;
  
  zoom = 1.5; // Camera zoom
  wave = 1;
  waveTimer = 0;
  
  hitStopTimer: number = 0;
  overlay: Overlay;

  targetFps: number = 144;
  lastFrameTime: number = 0;

  constructor(host: HTMLDivElement, setS: any, setR: any) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
    host.appendChild(this.canvas);
    this.setS = setS; this.setR = setR;
    
    window.addEventListener("keydown", (e) => this.keys[e.key] = true);
    window.addEventListener("keyup", (e) => this.keys[e.key] = false);

    this.resize();
    window.addEventListener("resize", () => this.resize());
    
    this.abilities = new AbilitiesManager(this);
    this.overlay = new Overlay(this);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.imageSmoothingEnabled = false;
  }

  start(characterType: string) {
    this.overlay.show();
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
    this.enemyProjectiles = [];
    this.effects = [];
    this.screenShake = null;
    
    this.kills = 0;
    this.gameTime = 0;
    this.wave = 1;
    this.waveTimer = 0;
    this.xp = 0;
    this.nextXp = 100;
    this.level = 1;
    this.isPaused = false;
    this.isGameOver = false;
    this.isLevelingUp = false;
    this.choices = [];
    
    this.abilities = new AbilitiesManager(this);
    UPGRADES.forEach(u => u.tier = 0);
    
    this.hitStopTimer = 0;

    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  triggerHitStop = (duration: number) => {
    if (this.hitStopTimer < duration) this.hitStopTimer = duration;
  }

  handleHit = (enemy: Enemy, damage: number, attackAngle: number, forceMult: number = 300, isMelee: boolean = false) => {
    enemy.takeDamage(damage, attackAngle, forceMult);
    this.effects.push(new HitImpact(enemy.x, enemy.y));
    this.effects.push(new FloatingText(enemy.x, enemy.y - 20, Math.floor(damage).toString(), damage >= 25 ? '#ef4444' : '#fcd34d'));
    
    if (damage >= 25 && !this.screenShake) {
      this.screenShake = new ScreenShake(isMelee ? 4 : 2);
    }
    
    if (isMelee) {
      this.triggerHitStop(40); // 40ms frame freeze
      // Burst of kinetic sparks
      for(let i = 0; i < 4; i++) {
        this.effects.push(new SparkParticle(enemy.x, enemy.y, attackAngle));
      }
    }

    if (enemy.dead) {
      this.kills++;
      this.xp += 10;
      this.effects.push(new BloodSplatter(enemy.x, enemy.y));
    }
  }

  triggerLevelUp() {
    this.xp -= this.nextXp;
    this.level++;
    this.nextXp = Math.floor(100 * Math.pow(1.25, this.level - 1));
    this.isLevelingUp = true;
    
    // Pick 3 random upgrades
    const available = UPGRADES.filter(u => u.tier < u.maxTier);
    this.choices = [];
    while (this.choices.length < 3 && available.length > 0) {
      const idx = Math.floor(Math.random() * available.length);
      this.choices.push(available.splice(idx, 1)[0]);
    }
    
    // Reset keys to prevent accidental movement
    this.keys = {};
    
    this.updateHUD(); // Trigger UI
  }

  handleShoot = (projectile: MagicMissile) => {
    this.projectiles.push(projectile);
  }

  addEffect = (effect: Effect) => {
    this.effects.push(effect);
  }

  handleEnemyShoot = (x: number, y: number, tx: number, ty: number) => {
    this.enemyProjectiles.push(new EnemyProjectile(x, y, tx, ty));
  }

  damagePlayer = (amount: number) => {
    if (this.player.hitFlashTimer > 0) return; // i-frames
    this.player.hp -= amount;
    this.player.hitFlashTimer = 500;
    this.screenShake = new ScreenShake(5);
    this.effects.push(new FloatingText(this.player.x, this.player.y - 20, Math.floor(amount).toString(), '#ef4444'));
  }

  pause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.lastTime = performance.now(); // Prevent large dt
    }
    this.updateHUD(); // Notify React
  }

  choose(id: string) {
    if (!this.isLevelingUp) return;
    const upgrade = UPGRADES.find(u => u.id === id);
    if (upgrade) {
      upgrade.apply(this);
      upgrade.tier++;
    }
    this.isLevelingUp = false;
    this.choices = [];
    this.lastTime = performance.now(); // Prevent large dt jump
    this.updateHUD();
  }

  loop = (time: number) => {
    this.animationId = requestAnimationFrame(this.loop);
    
    if (this.targetFps < 144) {
      const msPerFrame = 1000 / this.targetFps;
      if (time - this.lastFrameTime < msPerFrame) return;
    }
    this.lastFrameTime = time;

    const dt = time - this.lastTime;
    this.lastTime = time;
    this.overlay.update(time);

    if (this.isPaused || this.isGameOver || this.isLevelingUp) {
      this.draw(); // keep drawing
      return;
    }

    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt;
      this.draw(); // Draw frozen frame
      return;
    }

    this.update(dt);
    this.draw();
    this.updateHUD();
  }

  update(dt: number) {
    if (!this.player) return;
    
    if (this.xp >= this.nextXp && !this.isLevelingUp) {
      this.triggerLevelUp();
      return;
    }
    
    this.gameTime += dt / 1000;

    this.waveTimer += dt / 1000;
    if (this.waveTimer >= 30) {
      this.waveTimer = 0;
      this.wave++;
      this.spawnWave();
    }

    this.player.update(dt, this.enemies, this.keys, this.handleHit, this.handleShoot, this.addEffect);

    this.enemies.forEach(e => {
      e.update(dt, this.player.x, this.player.y, this.enemies, this.handleEnemyShoot);
      
      // Enemy collision with player
      const dist = Math.hypot(e.x - this.player.x, e.y - this.player.y);
      if (dist < e.radius + 10 && this.player.hitFlashTimer <= 0) {
        this.damagePlayer(10);
      }
    });
    
    this.enemies = this.enemies.filter(e => !e.dead);

    // Trickle spawn based on wave
    if (Math.random() < 0.02 + this.wave * 0.005) {
      this.spawnRandomEnemy();
    }

    this.projectiles.forEach(p => p.update(dt, this.enemies, this.handleHit));
    this.projectiles = this.projectiles.filter(p => !p.dead);

    this.enemyProjectiles.forEach(p => p.update(dt, this.player.x, this.player.y, this.damagePlayer));
    this.enemyProjectiles = this.enemyProjectiles.filter(p => !p.dead);

    this.effects = this.effects.filter(effect => !effect.update(dt));
    
    if (this.screenShake) {
      const done = this.screenShake.update(dt);
      if (done) this.screenShake = null;
    }

    this.abilities.update(dt);

    // Check Death
    if (this.player.hp <= 0 && !this.isGameOver) {
      this.isGameOver = true;
      this.overlay.hide();
      this.setR({
        won: false,
        time: this.gameTime,
        kills: this.kills,
        level: 1, // To be implemented later with XP
        power: 1
      });
    }
  }

  spawnRandomEnemy(fixedAngle?: number, fixedDistance?: number) {
    const angle = fixedAngle !== undefined ? fixedAngle : Math.random() * Math.PI * 2;
    const distance = fixedDistance !== undefined ? fixedDistance : 800;
    
    const roll = Math.random();
    let type: EnemyType = 'grunt';
    if (this.wave > 1 && roll < 0.3) type = 'swarmer';
    else if (this.wave > 2 && roll < 0.45) type = 'ranged';
    else if (this.wave > 3 && roll < 0.6) type = 'brute';

    const isElite = Math.random() < 0.02 * this.wave; // 2% chance per wave

    this.enemies.push(new Enemy(
      this.player.x + Math.cos(angle) * distance, 
      this.player.y + Math.sin(angle) * distance,
      type,
      isElite
    ));
  }

  spawnWave() {
    const type = this.wave % 3;
    if (type === 0) {
      // Pincer wave (top and bottom walls)
      for (let i = -5; i <= 5; i++) {
        this.enemies.push(new Enemy(this.player.x + i * 40, this.player.y - 700, 'swarmer'));
        this.enemies.push(new Enemy(this.player.x + i * 40, this.player.y + 700, 'swarmer'));
      }
    } else if (type === 1) {
      // Encirclement ring
      const count = 12 + this.wave * 2;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        this.spawnRandomEnemy(angle, 700);
      }
    } else {
      // Brutal wave
      for (let i = 0; i < 5 + this.wave; i++) {
        const angle = Math.random() * Math.PI * 2;
        this.enemies.push(new Enemy(
          this.player.x + Math.cos(angle) * 700,
          this.player.y + Math.sin(angle) * 700,
          'brute'
        ));
      }
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
    this.enemyProjectiles.forEach(p => p.draw(this.ctx));
    
    this.abilities.draw(this.ctx);
    
    this.effects.forEach(effect => effect.draw(this.ctx));
    this.player.draw(this.ctx);

    this.ctx.restore();
  }
  
  updateHUD() {
    if (!this.player || this.isGameOver) return;
    this.setS({
      hp: this.player.hp, maxHp: this.player.maxHp, xp: this.xp, nextXp: this.nextXp, level: this.level,
      time: this.gameTime, wave: this.wave, mapName: "Verdant Expanse", kills: this.kills,
      powerLevel: this.level, paused: this.isPaused, playerAngle: this.player.targetAngle || 0,
      choices: this.choices
    });
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    this.canvas.remove();
    this.overlay.destroy();
  }
}