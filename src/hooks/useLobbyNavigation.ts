import { useState, useEffect } from 'react';
import { audioManager } from '../engine/AudioManager';

export type LobbyTab = 'play' | 'heroes' | 'settings' | 'archives';

export function useLobbyNavigation() {
  const [activeTab, setActiveTab] = useState<LobbyTab>('play');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('warrior');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [targetFps, setTargetFps] = useState<60 | 144>(144);

  useEffect(() => {
    audioManager.setMuted(!audioEnabled);
  }, [audioEnabled]);

  return {
    activeTab,
    setActiveTab,
    selectedCharacterId,
    setSelectedCharacterId,
    audioEnabled,
    toggleAudio: () => setAudioEnabled(a => !a),
    targetFps,
    setTargetFps
  };
}
