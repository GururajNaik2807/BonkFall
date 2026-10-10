export interface CharacterConfig {
  id: string;
  name: string;
  tagline: string;
  spriteUrl: string;
  stats: {
    health: number;
    speed: number;
    damage: number;
  };
  color: string;
  icon: string;
}

export const CHARACTERS: CharacterConfig[] = [
  {
    id: "warrior",
    name: "Warrior",
    tagline: "Melee Combatant",
    spriteUrl: "",
    stats: { health: 100, speed: 85, damage: 25 },
    color: "#ef4444",
    icon: "⚔️"
  },
  {
    id: "mage",
    name: "Mage",
    tagline: "Ranged Spellcaster",
    spriteUrl: "",
    stats: { health: 60, speed: 90, damage: 15 },
    color: "#06b6d4",
    icon: "🔮"
  }
];
