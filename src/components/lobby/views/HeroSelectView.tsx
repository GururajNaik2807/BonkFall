import { HEROES, HERO_LIST } from '../../../config/characters';

export function HeroSelectView({ selectedHero, onSelectHero }: any) {
  const char = HEROES[selectedHero];
  if (!char) return null;

  return (
    <div className="view-heroes fade-in">
      <div className="heroes-left" key={`hero-left-${char.id}`}>
        <div className={`large-avatar hero-${char.id}`} style={{ borderColor: char.accentColor, boxShadow: `0 0 50px ${char.accentColor}30` }}>
          <img src={char.asset.src} alt={char.name} className="hero-sprite" />
        </div>
        <div className="hero-detail">
          <h2 style={{ color: char.accentColor }}>{char.name}</h2>
          <p className="hero-tagline">{char.title}</p>
          <p className="hero-perk"><b>Starting Perk:</b> {char.startingPerk}</p>
          <div className="stat-bars">
            <div className="stat-row">
              <span>❤️ Health</span>
              <div className="bar"><div className="fill" style={{ width: `${(char.stats.health / 150) * 100}%`, background: char.accentColor }} /></div>
              <span className="val">{char.stats.health}</span>
            </div>
            <div className="stat-row">
              <span>🥾 Speed</span>
              <div className="bar"><div className="fill" style={{ width: `${char.stats.speed}%`, background: char.accentColor }} /></div>
              <span className="val">{char.stats.speed}</span>
            </div>
            <div className="stat-row">
              <span>⚔️ Damage</span>
              <div className="bar"><div className="fill" style={{ width: `${(char.stats.damage / 30) * 100}%`, background: char.accentColor }} /></div>
              <span className="val">{char.stats.damage}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="heroes-right">
        <h3>Roster</h3>
        <div className="roster-grid">
          {HERO_LIST.map(c => (
            <button 
              key={c.id} 
              className={`roster-card ${c.id === selectedHero ? 'active' : ''}`}
              onClick={() => onSelectHero(c.id)}
              style={{ '--accent': c.accentColor } as React.CSSProperties}
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
