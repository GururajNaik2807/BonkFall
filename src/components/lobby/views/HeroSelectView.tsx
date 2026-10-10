import { CHARACTERS } from '../../../config/characters';

export function HeroSelectView({ selectedHero, onSelectHero }: any) {
  const char = CHARACTERS.find(c => c.id === selectedHero);
  if (!char) return null;

  return (
    <div className="view-heroes fade-in">
      <div className="heroes-left">
        <div className={`large-avatar hero-${char.id}`} style={{ borderColor: char.color, boxShadow: `0 0 50px ${char.color}30` }}>
          <span className="hero-icon">{char.icon}</span>
        </div>
        <div className="hero-detail">
          <h2 style={{ color: char.color }}>{char.name}</h2>
          <p className="hero-tagline">{char.tagline}</p>
          <div className="stat-bars">
            <div className="stat-row">
              <span>Health</span>
              <div className="bar"><div className="fill" style={{ width: `${char.stats.health}%`, background: char.color }} /></div>
              <span className="val">{char.stats.health}</span>
            </div>
            <div className="stat-row">
              <span>Speed</span>
              <div className="bar"><div className="fill" style={{ width: `${char.stats.speed}%`, background: char.color }} /></div>
              <span className="val">{char.stats.speed}</span>
            </div>
            <div className="stat-row">
              <span>Damage</span>
              <div className="bar"><div className="fill" style={{ width: `${(char.stats.damage / 30) * 100}%`, background: char.color }} /></div>
              <span className="val">{char.stats.damage}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="heroes-right">
        <h3>Roster</h3>
        <div className="roster-grid">
          {CHARACTERS.map(c => (
            <button 
              key={c.id} 
              className={`roster-card ${c.id === selectedHero ? 'active' : ''}`}
              onClick={() => onSelectHero(c.id)}
              style={{ '--accent': c.color } as React.CSSProperties}
            >
              <div className="roster-icon">{c.icon}</div>
              <b>{c.name}</b>
            </button>
          ))}
          
          <button className="roster-card locked" disabled>
            <div className="roster-icon">🔒</div>
            <b>Rogue</b>
          </button>
          <button className="roster-card locked" disabled>
            <div className="roster-icon">🔒</div>
            <b>Cleric</b>
          </button>
        </div>
      </div>
    </div>
  );
}
