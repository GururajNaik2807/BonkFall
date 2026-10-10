import { HEROES } from '../../../config/characters';

export function HomePlayView({ selectedHero, onStart, onGoToHeroes }: any) {
  const char = HEROES[selectedHero];
  if (!char) return null;

  return (
    <div className="view-home">
      <div className="home-stage-container">
        <div className="home-center-stage" key={char.id}>
          <div className="stage-glow" style={{ background: `radial-gradient(circle, ${char.accentColor}80 0%, transparent 60%)` }} />
          <div className={`stage-hero hero-${char.id}`} style={{ borderColor: char.accentColor, boxShadow: `0 20px 50px ${char.accentColor}40` }}>
            <img src={char.asset.src} alt={char.name} className="hero-sprite" />
          </div>
        </div>
        
        <div className="home-info" key={`info-${char.id}`}>
          <h2 style={{ color: char.accentColor }}>{char.name}</h2>
          <p>{char.title}</p>
          <button className="change-hero-link" onClick={onGoToHeroes}>Change Hero ➔</button>
        </div>
      </div>

      <button className="play-cta-btn" onClick={onStart}>
        <div className="play-glow" />
        <span>START RUN</span>
      </button>
    </div>
  );
}
