import { useLobbyNavigation } from '../../hooks/useLobbyNavigation';
import { HomePlayView } from './views/HomePlayView';
import { HeroSelectView } from './views/HeroSelectView';
import { SettingsView } from './views/SettingsView';
import { ArchivesView } from './views/ArchivesView';
import { HEROES } from '../../config/characters';
import { useEffect } from 'react';
import './lobby.css';

const LogoSVG = () => (
  <svg width="200" height="48" viewBox="0 0 200 48" className="bonkfall-logo">
    <path d="M10,24 L20,10 L30,24 L20,38 Z" fill="#F3B83F" />
    <path d="M20,10 L35,5 L45,15 L30,24 Z" fill="#D96B4B" />
    <text x="50" y="34" fontFamily="'Barlow Condensed', sans-serif" fontWeight="900" fontSize="36" fill="#F5EBD4" letterSpacing="1">BONKFALL</text>
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
      <div className="lobby-bg-art">
         <div className="particles-layer"></div>
      </div>

      {/* Grid Architecture */}
      <div className="lobby-ui-grid">
        
        {/* Region A: Navigation Sidebar */}
        <nav className="lobby-region-nav">
          <div className="bonkfall-brand">
            <LogoSVG />
          </div>

          <div className="game-main-menu">
            {[
              { id: 'play', label: 'Start Run', icon: <path d="M8 5v14l11-7z" /> },
              { id: 'heroes', label: 'Heroes', icon: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/> },
              { id: 'settings', label: 'Settings', icon: <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 C9.65,21.59,9.85,21.76,10.09,21.76h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/> },
              { id: 'archives', label: 'Archives', icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/> },
            ].map(t => (
              <button 
                key={t.id} 
                className={`game-menu-btn ${nav.activeTab === t.id ? 'active' : ''}`}
                onClick={() => nav.setActiveTab(t.id as any)}
              >
                <svg viewBox="0 0 24 24" className="menu-icon">{t.icon}</svg>
                {t.label}
              </button>
            ))}
          </div>

          <div className="nav-footer">
            <button className="icon-btn audio-toggle" onClick={nav.toggleAudio} title="Toggle Audio">
              {nav.audioEnabled ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
              )}
            </button>
            <span className="build-info">Build 0.2.0</span>
          </div>
        </nav>

        {/* Region B: Main Hero Presentation (Only show for Play/Heroes) */}
        {['play', 'heroes'].includes(nav.activeTab) && (
          <div className="lobby-region-hero">
            <div className="hero-presentation-container">
              <div className="stone-pedestal-frame">
                <img key={activeHero.id} src={activeHero.asset.src} alt={activeHero.name} className="hero-sprite" />
                <div className="hero-ground" />
              </div>
            </div>
            
            <div className="hero-nameplate">
              <h2>{activeHero.name}</h2>
              <p>{activeHero.title}</p>
            </div>

            {nav.activeTab === 'heroes' && (
              <div className="active-hero-stats" style={{ marginTop: '20px', width: '100%', maxWidth: '300px' }}>
                <div className="stat-row">
                  <span>Health</span>
                  <div className="bar"><div className="fill" style={{ width: `${(activeHero.stats.health / 150) * 100}%` }} /></div>
                  <span className="val">{activeHero.stats.health}</span>
                </div>
                <div className="stat-row">
                  <span>Speed</span>
                  <div className="bar"><div className="fill" style={{ width: `${activeHero.stats.speed}%` }} /></div>
                  <span className="val">{activeHero.stats.speed}</span>
                </div>
                <div className="stat-row">
                  <span>Damage</span>
                  <div className="bar"><div className="fill" style={{ width: `${(activeHero.stats.damage / 30) * 100}%` }} /></div>
                  <span className="val">{activeHero.stats.damage}</span>
                </div>
                <p style={{ margin: '15px 0 0 0', fontSize: '14px', color: '#D5DDC9' }}>
                  <b>Perk:</b> {activeHero.startingPerk}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Region C: Primary Action / Content */}
        <main className={`lobby-region-content ${['settings', 'archives'].includes(nav.activeTab) ? 'full-width' : ''}`}>
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
        </main>
      </div>
    </div>
  );
}
