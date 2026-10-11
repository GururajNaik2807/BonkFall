import type { HeroDefinition } from '../../../config/characters';

interface Props {
  activeHero: HeroDefinition;
  onStart: () => void;
  onSelectHero?: (id: string) => void;
}

export function HomePlayView({ activeHero, onStart, onSelectHero }: Props) {
  const isWarrior = activeHero.id === 'warrior';

  const playSelectSound = () => {
    try {
      const audio = new Audio('/assets/sfx/hover.wav');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  return (
    <div className="view-home view-fade-in">
      
      {/* Primary Action Button */}
      <button 
        className="play-cta-btn" 
        onClick={onStart}
        onMouseEnter={() => {
          try {
            const audio = new Audio('/assets/sfx/hover.wav');
            audio.volume = 0.2;
            audio.play().catch(() => {});
          } catch(e) {}
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
           <path d="M8 5v14l11-7z" />
        </svg>
        START RUN ({activeHero.name})
      </button>

      {/* Hero Selection & Loadout Overview Card */}
      <div className="home-summary hero-loadout-card">
        <div className="hero-loadout-header">
          <span className="loadout-label">ACTIVE LOADOUT</span>
          <div className="hero-quick-switch">
            <button 
              className={`quick-switch-btn ${isWarrior ? 'active' : ''}`}
              onClick={() => {
                if (!isWarrior && onSelectHero) {
                  playSelectSound();
                  onSelectHero('warrior');
                }
              }}
              title="Select Warrior"
            >
              ⚔️ Warrior
            </button>
            <button 
              className={`quick-switch-btn ${!isWarrior ? 'active' : ''}`}
              onClick={() => {
                if (isWarrior && onSelectHero) {
                  playSelectSound();
                  onSelectHero('mage');
                }
              }}
              title="Select Mage"
            >
              🔮 Mage
            </button>
          </div>
        </div>

        <div className="loadout-details">
          <div className="loadout-title-row">
            <b style={{ color: activeHero.accentColor }}>{activeHero.name}</b>
            <span className="loadout-role">{activeHero.title}</span>
          </div>
          <p className="loadout-desc">
            {isWarrior 
              ? 'Heavy iron plate armor, sweeping melee arc slashes, and high vitality.' 
              : 'Mystic robes, homing magic missiles, and rapid ability cooldowns.'}
          </p>
          <div className="loadout-perk-badge">
            <span className="perk-tag">Starting Perk:</span>
            <span className="perk-val">{activeHero.startingPerk}</span>
          </div>
        </div>
      </div>

      <div className="home-summary">
        <h3>Current Target</h3>
        <p>
          The Verdant Expanse has been overrun by corrupted forces. 
          Clear the waves, survive the swarm, and prove your strength.
        </p>
      </div>

      <div className="home-summary">
        <h3>Controls</h3>
        <p>
          <b>WASD / Arrows:</b> Move <br/>
          <b>Auto:</b> Attack <br/>
          <b>Esc / P:</b> Pause
        </p>
      </div>

    </div>
  );
}
