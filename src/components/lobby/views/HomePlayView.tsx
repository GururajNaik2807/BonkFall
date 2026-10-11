import type { HeroDefinition } from '../../../config/characters';

interface Props {
  activeHero: HeroDefinition;
  onStart: () => void;
}

export function HomePlayView({ activeHero, onStart }: Props) {
  return (
    <div className="view-home view-fade-in">
      
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
        START RUN
      </button>

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
