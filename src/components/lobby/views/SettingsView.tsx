export function SettingsView({ targetFps, onSetFps }: { targetFps: number, onSetFps: (fps: number) => void }) {
  return (
    <div className="view-settings view-fade-in">
      <h2>Game Settings</h2>
      <div className="settings-grid">
        <div className="settings-panel">
          <h3>Audio</h3>
          <div className="set-row">
            <span>Master Volume</span>
            <input type="range" disabled defaultValue="100" />
          </div>
          <div className="set-row">
            <span>BGM (Music)</span>
            <input type="range" disabled defaultValue="80" />
          </div>
          <div className="set-row">
            <span>SFX (Effects)</span>
            <input type="range" disabled defaultValue="100" />
          </div>
        </div>
        
        <div className="settings-panel">
          <h3>Gameplay</h3>
          <div className="set-row">
            <span>FPS Limit</span>
            <button 
              className={`toggle-btn ${targetFps === 144 ? 'on' : ''}`} 
              style={targetFps === 60 ? { background: '#f59e0b', color: '#fff' } : undefined}
              onClick={() => onSetFps(targetFps === 144 ? 60 : 144)}
            >
              {targetFps} FPS
            </button>
          </div>
          <div className="set-row">
            <span>Screen Shake</span>
            <button className="toggle-btn on">ON</button>
          </div>
          <div className="set-row">
            <span>Damage Numbers</span>
            <button className="toggle-btn on">ON</button>
          </div>
          <div className="set-row">
            <span>Particle Density</span>
            <button className="toggle-btn disabled" disabled>HIGH</button>
          </div>
        </div>
        
        <div className="settings-panel">
          <h3>Controls</h3>
          <p className="control-help">Movement: <b>W A S D</b> or <b>Arrow Keys</b></p>
          <p className="control-help">Attack: <b>Auto (Proximity)</b></p>
          <p className="control-help">Pause: <b>P</b> or <b>ESC</b></p>
        </div>
      </div>
    </div>
  );
}
