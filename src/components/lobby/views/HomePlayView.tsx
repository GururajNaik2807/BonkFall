import { CHARACTERS } from '../../../config/characters';

export function HomePlayView({ selectedHero, onStart, onGoToHeroes }: any) {
  const char = CHARACTERS.find(c => c.id === selectedHero);
  if (!char) return null;

  return (
    <div className="view-home">
      <div className="home-stage-container">
        <div className="home-center-stage">
          <div className="stage-glow" style={{ background: `radial-gradient(circle, ${char.color}80 0%, transparent 60%)` }} />
          <div className={`stage-hero hero-${char.id}`} style={{ borderColor: char.color, boxShadow: `0 20px 50px ${char.color}40` }}>
            <span className="hero-icon">{char.icon}</span>
          </div>
        </div>
        
        <div className="home-info">
          <h2 style={{ color: char.color }}>{char.name}</h2>
          <p>{char.tagline}</p>
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
