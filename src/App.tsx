import { useEffect, useRef, useState } from "react";
import { Game, type Snapshot, type Result } from "./Game";
import "./Styles.css";

const fmt = (n: number) => `${Math.floor(n / 60).toString().padStart(2, "0")}:${Math.floor(n % 60).toString().padStart(2, "0")}`;

export default function App() {
  const host = useRef<HTMLDivElement>(null);
  const game = useRef<Game | null>(null);
  const [s, setS] = useState<Snapshot | null>(null);
  const [r, setR] = useState<Result | null>(null);
  const [started, setStarted] = useState(false);
  const [charSelect, setCharSelect] = useState(false);

  useEffect(() => {
    if (!host.current) return;
    game.current = new Game(host.current, setS, setR);
    return () => game.current?.destroy();
  }, []);

  const openCharacterSelect = () => {
    setCharSelect(true);
  };

  const confirmCharacter = (type: "warrior" | "mage") => {
    setCharSelect(false);
    game.current?.start(type);
    setR(null);
    setStarted(true);
  };

  return (
    <main className="app">
      {!started && !charSelect && (
        <div className="menu">
          <div className="logo">BONKFALL</div>
          <p>2D SURVIVAL ADVENTURE</p>
          <h1>Enter the<br /><em>Verdant Expanse.</em></h1>
          <button onClick={openCharacterSelect}>START RUN</button>
          <div className="hint">WASD / ARROWS · Your hero attacks enemies automatically when they enter range.</div>
        </div>
      )}

      {!started && charSelect && (
        <div className="shade" style={{ pointerEvents: 'auto', zIndex: 40 }}>
          <div className="power">
            <small>NEW RUN</small>
            <h2>Choose your Hero</h2>
            <div className="choices">
              <button onClick={() => confirmCharacter('warrior')}>
                <span>⚔️</span>
                <b>Warrior</b>
                <i>Melee Combatant</i>
                <p>Tough close-quarters survivor with sweeping area damage.</p>
              </button>
              <button onClick={() => confirmCharacter('mage')}>
                <span>🔮</span>
                <b>Mage</b>
                <i>Ranged Spellcaster</i>
                <p>Fragile caster that shoots tracking magic missiles.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {s && started && <HUD s={s} game={game.current} />}

      {s?.choices && (
        <div className="shade">
          <div className="power">
            <small>LEVEL {s.level}</small>
            <h2>Choose your power</h2>
            <div className="choices">
              {s.choices.map(c => (
                <button key={c.id} onClick={() => game.current?.choose(c.id)}>
                  <span>{c.icon}</span><b>{c.name}</b><i>Level {c.level}</i><p>{c.description}</p>
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
            <button onClick={openCharacterSelect}>RUN AGAIN</button>
          </div>
        </div>
      )}

      <div ref={host} className="game" />
    </main>
  );
}

function HUD({ s, game }: { s: Snapshot; game: Game | null }) {
  return (
    <>
      <div className="hud">
        <div className="left">
          <div className="portrait"><div className="minihero">⚔</div></div>
          <div>
            <b>Wanderer</b>
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
          <div>☠ {s.kills}</div>
          <div>⚔ POWER {s.powerLevel}</div>
          <button onClick={() => game?.pause()}>Ⅱ</button>
        </div>
      </div>
      <div className="map">
        <div className="maptitle">WORLD MAP</div>
        <div className="mapworld"><i /><b /></div>
        <small>Verdant Expanse</small>
      </div>
      {s.paused && <div className="paused"><h2>PAUSED</h2><button onClick={() => game?.pause()}>RESUME</button></div>}
    </>
  );
}
