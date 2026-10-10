export interface HeroDefinition {
  id: 'warrior' | 'mage' | 'rogue';
  name: string;
  title: string;
  accentColor: string;
  icon: string;
  asset: {
    type: 'sprite' | 'svg' | 'canvas';
    src: string;
    frameSize?: { width: number; height: number };
  };
  stats: {
    health: number;
    speed: number;
    damage: number;
    range: string;
  };
  startingPerk: string;
}

export const HEROES: Record<string, HeroDefinition> = {
  warrior: {
    id: 'warrior',
    name: 'WARRIOR',
    title: 'Melee Combatant',
    accentColor: '#ef4444',
    icon: '⚔️',
    asset: {
      type: 'sprite',
      src: '/assets/characters/warrior_idle.jpg',
    },
    stats: { health: 120, speed: 85, damage: 25, range: 'Short' },
    startingPerk: 'Iron Skin (+20% Defense)',
  },
  mage: {
    id: 'mage',
    name: 'MAGE',
    title: 'Arcane Spellcaster',
    accentColor: '#818cf8',
    icon: '🔮',
    asset: {
      type: 'sprite',
      src: '/assets/characters/mage_idle.jpg',
    },
    stats: { health: 75, speed: 90, damage: 15, range: 'Long' },
    startingPerk: 'Arcane Surge (Cooldown Reduction)',
  },
};

export const HERO_LIST = Object.values(HEROES);
