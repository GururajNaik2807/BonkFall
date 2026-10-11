import { HEROES } from '../../../config/characters';
import type { HeroDefinition } from '../../../config/characters';

interface Props {
  activeHero: HeroDefinition;
  onSelectHero: (id: string) => void;
}

export function HeroSelectView({ activeHero, onSelectHero }: Props) {
  return (
    <div className="view-heroes view-fade-in">
      
      <div className="roster-grid">
        {Object.values(HEROES).map(char => (
          <div 
            key={char.id}
            className={`roster-card ${activeHero.id === char.id ? 'active' : ''} ${char.locked ? 'locked' : ''}`}
            onClick={() => !char.locked && onSelectHero(char.id)}
          >
            <img src={char.asset.src} alt={char.name} className="roster-card-img" />
            <div className="roster-card-info">
              <b>{char.name}</b>
              <span>{char.locked ? 'LOCKED' : char.title}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
