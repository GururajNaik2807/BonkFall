import type { Game } from "../engine/Game";
import { ShockwaveEffect, LightningEffect } from "../effects/Effects";

export class AbilitiesManager {
  game: Game;
  
  orbCount = 0;
  orbAngle = 0;
  
  shockwaveLevel = 0;
  shockwaveTimer = 0;
  
  lightningLevel = 0;
  lightningTimer = 0;

  constructor(game: Game) {
    this.game = game;
  }

  update(dt: number) {
    if (this.orbCount > 0) {
      this.orbAngle += dt * 0.003;
      const r = 60;
      for (let i = 0; i < this.orbCount; i++) {
        const a = this.orbAngle + (i / this.orbCount) * Math.PI * 2;
        const ox = this.game.player.x + Math.cos(a) * r;
        const oy = this.game.player.y + Math.sin(a) * r;
        
        for (const enemy of this.game.enemies) {
          if (!enemy.dead && Math.hypot(enemy.x - ox, enemy.y - oy) < enemy.radius + 10) {
            if (enemy.hitFlashTimer <= 0) {
              this.game.handleHit(enemy, 5, a);
            }
          }
        }
      }
    }

    if (this.shockwaveLevel > 0) {
      this.shockwaveTimer -= dt;
      if (this.shockwaveTimer <= 0) {
        this.shockwaveTimer = 3000;
        this.game.effects.push(new ShockwaveEffect(this.game.player.x, this.game.player.y));
        for (const enemy of this.game.enemies) {
          if (!enemy.dead && Math.hypot(enemy.x - this.game.player.x, enemy.y - this.game.player.y) < 150) {
            const a = Math.atan2(enemy.y - this.game.player.y, enemy.x - this.game.player.x);
            this.game.handleHit(enemy, 15 * this.shockwaveLevel, a);
          }
        }
      }
    }

    if (this.lightningLevel > 0) {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.lightningTimer = 1500;
        const target = this.getClosestEnemy(this.game.enemies);
        if (target && Math.hypot(target.x - this.game.player.x, target.y - this.game.player.y) < 250) {
          this.game.handleHit(target, 30 * this.lightningLevel, 0);
          this.game.effects.push(new LightningEffect(this.game.player.x, this.game.player.y, target.x, target.y));
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.orbCount > 0) {
      const r = 60;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#38bdf8';
      for (let i = 0; i < this.orbCount; i++) {
        const a = this.orbAngle + (i / this.orbCount) * Math.PI * 2;
        const ox = this.game.player.x + Math.cos(a) * r;
        const oy = this.game.player.y + Math.sin(a) * r;
        ctx.beginPath();
        ctx.arc(ox, oy, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
  }
  
  private getClosestEnemy(enemies: any[]): any | null {
    if (enemies.length === 0) return null;
    let min = Infinity;
    let closest = null;
    for (const e of enemies) {
      if (e.dead) continue;
      const d = Math.hypot(e.x - this.game.player.x, e.y - this.game.player.y);
      if (d < min) {
        min = d;
        closest = e;
      }
    }
    return closest;
  }
}
