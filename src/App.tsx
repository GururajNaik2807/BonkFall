import { useEffect, useRef, useState } from "react";
import { Game } from "./engine/Game";
import type { Snapshot, Result } from "./types";
import { LobbyLayout } from "./components/lobby/LobbyLayout";
import "./styles.css";

const fmt = (n: number) => `${Math.floor(n / 60).toString().padStart(2, "0")}:${Math.floor(n % 60).toString().padStart(2, "0")}`;

export default function App() {
  const host = useRef<HTMLDivElement>(null);
  const game = useRef<Game | null>(null);
  const [s, setS] = useState<Snapshot | null>(null);
  const [r, setR] = useState<Result | null>(null);
  const [started, setStarted] = useState(false);
  const [selectedHero, setSelectedHero] = useState<"warrior" | "mage" | null>(null);

  useEffect(() => {
    if (!host.current) return;
    game.current = new Game(host.current, setS, setR);
    return () => game.current?.destroy();
  }, []);

  const confirmCharacter = (type: string) => {
    setSelectedHero(type as "warrior" | "mage");
    game.current?.start(type);
    setR(null);
    setStarted(true);
  };

  const returnToMainMenu = () => {
    game.current?.stop();
    setR(null);
    setS(null);
    setStarted(false);
    setSelectedHero(null);
  };

  const runAgain = () => {
    if (selectedHero) {
      game.current?.start(selectedHero);
      setR(null);
    } else {
      returnToMainMenu();
    }
  };

  // Keyboard shortcut for pausing during gameplay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!started || !game.current) return;
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        game.current.pause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [started]);

  return (
    <main className="app">
      {!started && (
        <LobbyLayout 
          onStartGame={confirmCharacter} 
          onSetFps={(fps) => { if (game.current) game.current.targetFps = fps; }} 
        />
      )}

      {s && started && (
        <HUD 
          s={s} 
          game={game.current} 
          heroName={selectedHero === "mage" ? "Archmage" : "Iron Vanguard"}
          onReturnToMenu={returnToMainMenu} 
        />
      )}

      {s?.choices && s.choices.length > 0 && started && (
        <div className="shade">
          <div className="power">
            <small>LEVEL {s.level}</small>
            <h2>Choose your power</h2>
            <div className="choices">
              {s.choices.map(c => (
                <button key={c.id} onClick={() => game.current?.choose(c.id)}>
                  <span>{c.icon}</span><b>{c.name}</b><i>Tier {c.tier + 1}</i><p>{c.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {r && (
        <div className="shade">
          <div className="result">
            <small>{r.won ? "RUN COMPLETE" : "DEFEATED"}</small>
            <h2>{r.won ? "The Expanse bows." : "The swarm wins."}</h2>
            <div className="stats">
              <span>TIME<b>{fmt(r.time)}</b></span>
              <span>KILLS<b>{r.kills}</b></span>
              <span>LEVEL<b>{r.level}</b></span>
              <span>POWER<b>{r.power}</b></span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={runAgain}>RUN AGAIN</button>
              <button onClick={returnToMainMenu}>RETURN TO MENU</button>
            </div>
          </div>
        </div>
      )}

      <div 
        ref={host} 
        className="game" 
        style={{ 
          display: started ? 'block' : 'none',
          pointerEvents: started ? 'auto' : 'none'
        }} 
      />
    </main>
  );
}

function HUD({ 
  s, 
  game, 
  heroName,
  onReturnToMenu 
}: { 
  s: Snapshot; 
  game: Game | null; 
  heroName?: string;
  onReturnToMenu: () => void;
}) {
  return (
    <>
      <div className="hud">
        <div className="left">
          <div className="portrait"><div className="minihero">{heroName === "Archmage" ? "🔮" : "⚔"}</div></div>
          <div>
            <b>{heroName || "Wanderer"}</b>
            <div className="health"><i style={{ width: `${s.hp / s.maxHp * 100}%` }} /></div>
            <div className="xp"><i style={{ width: `${s.xp / s.nextXp * 100}%` }} /></div>
          </div>
          <strong>LV {s.level}</strong>
        </div>
        <div className="center">
          <b>{fmt(s.time)}</b>
          <span>WAVE {s.wave} · {s.mapName}</span>
        </div>
        <div className="right">
          <div>💀 {s.kills}</div>
          <div>⚔ POWER {s.powerLevel}</div>
          <button 
            onClick={() => game?.pause()} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontWeight: 'bold' }}
          >
            <span>{s.paused ? '▶' : '⏸'}</span> {s.paused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </div>
      {s.paused && (
        <div className="paused">
          <h2>PAUSED</h2>
          <div className="paused-stats">
            <div><span>Time</span><b>{fmt(s.time)}</b></div>
            <div><span>Kills</span><b>{s.kills}</b></div>
            <div><span>Power Level</span><b>{s.powerLevel}</b></div>
            <div><span>Current Map</span><b>{s.mapName}</b></div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={() => game?.pause()}>RESUME</button>
            <button onClick={onReturnToMenu}>RETURN TO MENU</button>
          </div>
        </div>
      )}
    </>
  );
}


