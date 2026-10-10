import { HEROES } from '../../../config/characters';
import type { HeroDefinition } from '../../../config/characters';

interface Props {
  activeHero: HeroDefinition;
  onSelectHero: (id: string) => void;
}

export function HeroSelectView({ activeHero, onSelectHero }: Props) {
  return (
    <div className="view-heroes view-fade-in">
      <h2 className="heroes-view-title">Roster</h2>
      
      <div className="roster-grid">
        {Object.values(HEROES).map(char => (
          <div 
            key={char.id}
            className={`roster-card ${activeHero.id === char.id ? 'active' : ''} ${char.locked ? 'locked' : ''}`}
            onClick={() => !char.locked && onSelectHero(char.id)}
            style={activeHero.id === char.id ? { borderColor: char.accentColor } : {}}
          >
            <img src={char.asset.src} alt={char.name} className="roster-card-img" />
            <div className="roster-card-info">
              <b>{char.name}</b>
              <span>{char.locked ? 'LOCKED' : char.title}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="active-hero-stats" style={{ borderColor: `${activeHero.accentColor}50` }}>
        <h3 style={{ color: activeHero.accentColor }}>Combat Profile</h3>
        <p style={{ color: '#cbd5e1', marginBottom: '20px', fontSize: '14px' }}>
          <b>Starting Perk:</b> {activeHero.startingPerk}
        </p>
        
        <div className="stat-bars">
          <div className="stat-row">
            <span>❤️ Health</span>
            <div className="bar"><div className="fill" style={{ width: `${(activeHero.stats.health / 150) * 100}%`, background: activeHero.accentColor }} /></div>
            <span className="val">{activeHero.stats.health}</span>
          </div>
          <div className="stat-row">
            <span>🥾 Speed</span>
            <div className="bar"><div className="fill" style={{ width: `${activeHero.stats.speed}%`, background: activeHero.accentColor }} /></div>
            <span className="val">{activeHero.stats.speed}</span>
          </div>
          <div className="stat-row">
            <span>⚔️ Damage</span>
            <div className="bar"><div className="fill" style={{ width: `${(activeHero.stats.damage / 30) * 100}%`, background: activeHero.accentColor }} /></div>
            <span className="val">{activeHero.stats.damage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
