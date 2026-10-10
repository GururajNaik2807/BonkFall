import type { LobbyTab } from '../../hooks/useLobbyNavigation';

interface Props {
  activeTab: LobbyTab;
  onSelectTab: (tab: LobbyTab) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export function NavigationRail({ activeTab, onSelectTab, audioEnabled, onToggleAudio }: Props) {
  const tabs: { id: LobbyTab, label: string, icon: string }[] = [
    { id: 'play', label: 'Play', icon: '🎮' },
    { id: 'heroes', label: 'Heroes', icon: '⚔️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'archives', label: 'Archives', icon: '🏆' },
  ];

  return (
    <nav className="nav-rail">
      <div className="nav-brand">
        <div className="brand-logo">BONKFALL <span>v2</span></div>
      </div>
      
      <div className="nav-menu">
        {tabs.map(t => (
          <button 
            key={t.id} 
            className={`nav-tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => onSelectTab(t.id)}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="nav-footer">
        <button className="nav-audio-btn" onClick={onToggleAudio}>
          <span>{audioEnabled ? '🔊 Audio On' : '🔇 Audio Off'}</span>
        </button>
        <div className="nav-profile">v2.0 • Guest Profile</div>
      </div>
    </nav>
  );
}
