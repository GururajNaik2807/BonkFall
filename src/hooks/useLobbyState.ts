import { useState } from 'react';

export interface LobbyState {
  selectedCharacterId: string;
  isSettingsOpen: boolean;
  audioEnabled: boolean;
  selectCharacter: (id: string) => void;
  openSettings: () => void;
  closeSettings: () => void;
  toggleAudio: () => void;
  startRun: () => void;
}

export function useLobbyState(onStartRun: (id: string) => void): LobbyState {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('warrior');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  return {
    selectedCharacterId,
    isSettingsOpen,
    audioEnabled,
    selectCharacter: (id: string) => setSelectedCharacterId(id),
    openSettings: () => setIsSettingsOpen(true),
    closeSettings: () => setIsSettingsOpen(false),
    toggleAudio: () => setAudioEnabled(a => !a),
    startRun: () => onStartRun(selectedCharacterId)
  };
}
