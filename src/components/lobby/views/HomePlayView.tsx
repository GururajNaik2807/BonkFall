import type { HeroDefinition } from '../../../config/characters';

interface Props {
  activeHero: HeroDefinition;
  onStart: () => void;
}

export function HomePlayView({ activeHero, onStart }: Props) {
  return (
    <div className="view-home view-fade-in">
      <div className="home-info">
        <h2 style={{ color: activeHero.accentColor }}>{activeHero.name}</h2>
        <p>{activeHero.title}</p>
      </div>

      <button className="play-cta-btn" onClick={onStart}>
        <div className="play-glow" />
        <span>START RUN</span>
      </button>
    </div>
  );
}
