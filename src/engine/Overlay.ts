import { Game } from './Game';

export class Overlay {
  private game: Game;
  
  // FPS Tracking
  private frameCount: number = 0;
  private lastFpsTime: number = 0;
  private currentFps: number = 0;
  
  // Minimap throttling
  private lastMinimapTime: number = 0;
  private minimapCanvas: HTMLCanvasElement;
  private minimapCtx: CanvasRenderingContext2D;
  
  private fpsElement: HTMLDivElement;
  
  // Radar radius (how far minimap sees)
  private readonly radarRadius = 2500; 
  
  constructor(game: Game) {
    this.game = game;
    
    // Create an isolated DOM-mounted canvas to avoid main canvas full-screen redraws
    this.minimapCanvas = document.createElement('canvas');
    this.minimapCanvas.width = 140;
    this.minimapCanvas.height = 140;
    this.minimapCtx = this.minimapCanvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
    
    // Hardware accelerated, positioned fixed overlay
    this.minimapCanvas.style.position = 'absolute';
    this.minimapCanvas.style.top = '105px';
    this.minimapCanvas.style.right = '18px';
    this.minimapCanvas.style.border = '2px solid rgba(255, 255, 255, 0.1)';
    this.minimapCanvas.style.borderRadius = '50%';
    this.minimapCanvas.style.pointerEvents = 'none';
    this.minimapCanvas.style.willChange = 'transform';
    this.minimapCanvas.style.opacity = '0.85';
    this.minimapCanvas.style.zIndex = '100';
    this.minimapCanvas.style.setProperty('width', '140px', 'important');
    this.minimapCanvas.style.setProperty('height', '140px', 'important');
    
    // FPS DOM Element
    this.fpsElement = document.createElement('div');
    this.fpsElement.style.position = 'absolute';
    this.fpsElement.style.top = '105px';
    this.fpsElement.style.left = '18px';
    this.fpsElement.style.color = '#22c55e';
    this.fpsElement.style.font = '700 14px monospace';
    this.fpsElement.style.zIndex = '100';
    this.fpsElement.style.pointerEvents = 'none';
    this.fpsElement.style.textShadow = '0 2px 4px rgba(0,0,0,1)';
    this.fpsElement.textContent = 'FPS: --';
    
    // Hidden by default until game starts
    this.minimapCanvas.style.display = 'none';
    this.fpsElement.style.display = 'none';

    if (this.game.canvas.parentElement) {
        this.game.canvas.parentElement.appendChild(this.minimapCanvas);
        this.game.canvas.parentElement.appendChild(this.fpsElement);
    }
  }

  // Update called every frame
  update(time: number) {
    this.frameCount++;
    
    // FPS throttled to ~500ms
    if (time - this.lastFpsTime >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / (time - this.lastFpsTime));
      this.fpsElement.textContent = `FPS: ${this.currentFps}`;
      this.frameCount = 0;
      this.lastFpsTime = time;
    }

    // Minimap throttled to 33ms (~30 FPS)
    if (time - this.lastMinimapTime >= 33) {
      this.renderMinimap();
      this.lastMinimapTime = time;
    }
  }

  private renderMinimap() {
    if (!this.game.player) return;

    const ctx = this.minimapCtx;
    const width = this.minimapCanvas.width;
    const height = this.minimapCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = (width / 2) / this.radarRadius;

    // Base background (avoids clearRect, just fills)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    
    // Circular clip mask
    ctx.beginPath();
    ctx.arc(centerX, centerY, width/2, 0, Math.PI * 2);
    ctx.clip();

    // Avoid object allocation, use stack variables
    const px = this.game.player.x;
    const py = this.game.player.y;
    const radar = this.radarRadius;

    // Batched rendering for normal enemies
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    for (let i = 0; i < this.game.enemies.length; i++) {
      const e = this.game.enemies[i];
      if (e.dead || e.isElite) continue;
      
      const dx = e.x - px;
      const dy = e.y - py;
      
      // Fast AABB Frustum culling instead of hypot
      if (dx > radar || dx < -radar || dy > radar || dy < -radar) continue;
      
      const mx = centerX + dx * scale;
      const my = centerY + dy * scale;
      
      ctx.rect(mx - 1.5, my - 1.5, 3, 3);
    }
    ctx.fill();

    // Batched rendering for elite enemies
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    for (let i = 0; i < this.game.enemies.length; i++) {
      const e = this.game.enemies[i];
      if (e.dead || !e.isElite) continue;
      
      const dx = e.x - px;
      const dy = e.y - py;
      if (dx > radar || dx < -radar || dy > radar || dy < -radar) continue;
      
      const mx = centerX + dx * scale;
      const my = centerY + dy * scale;
      
      ctx.rect(mx - 2.5, my - 2.5, 5, 5);
    }
    ctx.fill();

    // Draw Player directional indicator
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.translate(centerX, centerY);
    const angle = this.game.player.targetAngle || this.game.player.moveAngle || 0;
    ctx.rotate(angle);
    ctx.moveTo(4, 0);
    ctx.lineTo(-3, 3);
    ctx.lineTo(-3, -3);
    ctx.fill();

    ctx.restore();
  }

  show() {
    this.minimapCanvas.style.display = 'block';
    this.fpsElement.style.display = 'block';
  }

  hide() {
    this.minimapCanvas.style.display = 'none';
    this.fpsElement.style.display = 'none';
  }

  destroy() {
    if (this.minimapCanvas.parentElement) {
      this.minimapCanvas.parentElement.removeChild(this.minimapCanvas);
    }
    if (this.fpsElement.parentElement) {
      this.fpsElement.parentElement.removeChild(this.fpsElement);
    }
  }
}
