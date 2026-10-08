import { Warrior } from "./Warrior";
import { Mage } from "./Mage";
import { Enemy } from "./Enemy";
import { DeathSlash, type Effect } from "./Effects";
export interface Snapshot { hp: number; maxHp: number; xp: number; nextXp: number; level: number; time: number; wave: number; mapName: string; kills: number; powerLevel: number; paused: boolean; choices?: any[]; }
export interface Result { won: boolean; time: number; kills: number; level: number; power: number; }

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  
  player: any; 
  enemies: Enemy[] = [];
  effects: Effect[] = [];
  projectiles: any[] = []; // Tracks Mage missiles
  
  keys: Record<string, boolean> = {};
  lastTime: number = 0;
  animationId: number = 0;
  
  setS: (s: Snapshot | null) => void;
  setR: (r: Result | null) => void;
  
  kills = 0;
  gameTime = 0;

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
  }

  start(characterType: string) {
    if (characterType === 'mage') this.player = new Mage();
    else this.player = new Warrior();

    // Spawn goblins in a wide circle safely off-screen
    this.enemies = [];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 600 + Math.random() * 400; // 600 to 1000 pixels away
      this.enemies.push(new Enemy(
        this.player.x + Math.cos(angle) * distance, 
        this.player.y + Math.sin(angle) * distance
      ));
    }
    
    this.kills = 0;
    this.gameTime = 0;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  handleHit = (enemy: Enemy, damage: number, attackAngle: number) => {
    enemy.takeDamage(damage);
    if (enemy.dead) {
      this.kills++;
      this.effects.push(new DeathSlash(enemy.x, enemy.y, attackAngle));
    }
  }

  // Callback for Mage to spawn a missile
  handleShoot = (projectile: any) => {
    this.projectiles.push(projectile);
  }

  pause() {}
  choose(id: string) {}

  loop = (time: number) => {
    const dt = time - this.lastTime;
    this.lastTime = time;

    this.update(dt);
    this.draw();
    this.updateHUD();

    this.animationId = requestAnimationFrame(this.loop);
  }

  update(dt: number) {
    if (!this.player) return;
    this.gameTime += dt / 1000;

    // Pass both callbacks so either character type can attack
    this.player.update(dt, this.enemies, this.keys, this.handleHit, this.handleShoot);

    this.enemies.forEach(e => e.update(dt, this.player.x, this.player.y));
    this.enemies = this.enemies.filter(e => !e.dead);

    // Update projectiles (Magic Missiles)
    this.projectiles.forEach(p => p.update(dt, this.handleHit));
    this.projectiles = this.projectiles.filter(p => !p.dead);

    this.effects = this.effects.filter(effect => !effect.update(dt));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.player) this.player.draw(this.ctx);
    this.enemies.forEach(e => e.draw(this.ctx));
    this.projectiles.forEach(p => p.draw(this.ctx));
    this.effects.forEach(effect => effect.draw(this.ctx));
  }
  
  updateHUD() {
    this.setS({
      hp: 100, maxHp: 100, xp: this.kills * 10, nextXp: 100, level: 1,
      time: this.gameTime, wave: 1, mapName: "Verdant Expanse", kills: this.kills,
      powerLevel: 1, paused: false
    });
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    this.canvas.remove();
  }
}