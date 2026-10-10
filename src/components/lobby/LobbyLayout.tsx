import { useLobbyNavigation } from '../../hooks/useLobbyNavigation';
import { HomePlayView } from './views/HomePlayView';
import { HeroSelectView } from './views/HeroSelectView';
import { SettingsView } from './views/SettingsView';
import { ArchivesView } from './views/ArchivesView';
import { HEROES } from '../../config/characters';
import { useEffect } from 'react';
import './lobby.css';

const LogoSVG = () => (
  <svg width="240" height="60" viewBox="0 0 240 60" className="bonkfall-logo">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <text x="10" y="45" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="38" fill="url(#logoGrad)" filter="url(#glow)" letterSpacing="1">BONKFALL</text>
    <text x="215" y="25" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="16" fill="#ef4444">V2</text>
  </svg>
);

export function LobbyLayout({ onStartGame, onSetFps }: { onStartGame: (id: string) => void, onSetFps: (fps: number) => void }) {
  const nav = useLobbyNavigation();
  const activeHero = HEROES[nav.selectedCharacterId as keyof typeof HEROES] || HEROES.warrior;

  useEffect(() => {
    onSetFps(nav.targetFps);
  }, [nav.targetFps, onSetFps]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (nav.activeTab !== 'play') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStartGame(nav.selectedCharacterId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nav.activeTab, nav.selectedCharacterId, onStartGame]);

  return (
    <div className="lobby-spa-container">
      {/* Immersive Game World Background */}
      <div className="lobby-bg-ambience">
         <div className="lobby-bg-grid" />
         <div className="lobby-bg-vignette" />
         {/* Environmental Particles */}
         <div className="particles-layer"></div>
      </div>

      {/* Persistent Character Showcase */}
      <div className={`lobby-persistent-showcase hero-${activeHero.id}`}>
        <div className="stage-glow" style={{ background: `radial-gradient(circle, ${activeHero.accentColor}40 0%, transparent 70%)` }} />
        <div className="stage-pedestal" style={{ borderColor: activeHero.accentColor, boxShadow: `0 0 80px ${activeHero.accentColor}40, inset 0 0 20px ${activeHero.accentColor}20` }}>
           <img key={activeHero.id} src={activeHero.asset.src} alt={activeHero.name} className="hero-sprite" />
        </div>
      </div>

      {/* Foreground UI */}
      <div className="lobby-ui-layer">
        
        {/* Top Header */}
        <header className="lobby-header">
          <LogoSVG />
          <div className="header-controls">
            <button className="icon-btn audio-toggle" onClick={nav.toggleAudio} title="Toggle Audio">
              {nav.audioEnabled ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
              )}
            </button>
          </div>
        </header>

        {/* Main Interface */}
        <main className="lobby-main">
          {/* Handcrafted Game Menu (Bottom Left/Center) */}
          <nav className="game-main-menu">
            {[
              { id: 'play', label: 'Start Run' },
              { id: 'heroes', label: 'Roster' },
              { id: 'settings', label: 'Settings' },
              { id: 'archives', label: 'Archives' },
            ].map(t => (
              <button 
                key={t.id} 
                className={`game-menu-btn ${nav.activeTab === t.id ? 'active' : ''}`}
                onClick={() => nav.setActiveTab(t.id as any)}
              >
                {nav.activeTab === t.id && <span className="menu-cursor">►</span>}
                {t.label}
              </button>
            ))}
          </nav>

          {/* Dynamic Content Pane */}
          <section className="lobby-content-pane">
            {nav.activeTab === 'play' && (
              <HomePlayView 
                activeHero={activeHero}
                onStart={() => onStartGame(nav.selectedCharacterId)}
              />
            )}
            {nav.activeTab === 'heroes' && (
              <HeroSelectView 
                activeHero={activeHero}
                onSelectHero={nav.setSelectedCharacterId}
              />
            )}
            {nav.activeTab === 'settings' && (
              <SettingsView 
                targetFps={nav.targetFps}
                onSetFps={nav.setTargetFps}
              />
            )}
            {nav.activeTab === 'archives' && (
              <ArchivesView />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
