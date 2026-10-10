import { useLobbyNavigation } from '../../hooks/useLobbyNavigation';
import { NavigationRail } from './NavigationRail';
import { HomePlayView } from './views/HomePlayView';
import { HeroSelectView } from './views/HeroSelectView';
import { SettingsView } from './views/SettingsView';
import { ArchivesView } from './views/ArchivesView';
import { useEffect } from 'react';
import './lobby.css';

export function LobbyLayout({ onStartGame, onSetFps }: { onStartGame: (id: string) => void, onSetFps: (fps: number) => void }) {
  const nav = useLobbyNavigation();

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
      <NavigationRail 
        activeTab={nav.activeTab} 
        onSelectTab={nav.setActiveTab} 
        audioEnabled={nav.audioEnabled}
        onToggleAudio={nav.toggleAudio}
      />
      
      <div className="lobby-viewport">
        <div className="viewport-content">
          {nav.activeTab === 'play' && (
            <HomePlayView 
              selectedHero={nav.selectedCharacterId} 
              onStart={() => onStartGame(nav.selectedCharacterId)}
              onGoToHeroes={() => nav.setActiveTab('heroes')}
            />
          )}
          {nav.activeTab === 'heroes' && (
            <HeroSelectView 
              selectedHero={nav.selectedCharacterId}
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
        </div>
      </div>
    </div>
  );
}
