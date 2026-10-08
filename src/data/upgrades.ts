import type { Game } from "../engine/Game";

export interface Upgrade {
  id: string;
  name: string;
  icon: string;
  description: string;
  tier: number;
  maxTier: number;
  category: 'stat' | 'ability';
  apply: (game: Game) => void;
}

export const UPGRADES: Upgrade[] = [
  {
    id: 'vitality',
    name: 'Vitality',
    icon: '❤️',
    description: 'Increases max health by 25% and heals you.',
    tier: 0, maxTier: 5, category: 'stat',
    apply: (game) => {
      const bonus = game.player.maxHp * 0.25;
      game.player.maxHp += bonus;
      game.player.hp += bonus;
    }
  },
  {
    id: 'haste',
    name: 'Haste',
    icon: '👟',
    description: 'Increases movement speed by 15%.',
    tier: 0, maxTier: 5, category: 'stat',
    apply: (game) => {
      game.player.speed *= 1.15;
    }
  },
  {
    id: 'bloodlust',
    name: 'Bloodlust',
    icon: '⚡',
    description: 'Increases attack speed by 20%.',
    tier: 0, maxTier: 5, category: 'stat',
    apply: (game) => {
      if (game.player.windupTime !== undefined) {
        game.player.windupTime *= 0.8;
        game.player.swingTime *= 0.8;
        game.player.recoveryTime *= 0.8;
      }
      if (game.player.attackSpeed !== undefined) {
        game.player.attackSpeed *= 0.8;
      }
    }
  },
  {
    id: 'might',
    name: 'Might',
    icon: '💪',
    description: 'Increases base damage by 25%.',
    tier: 0, maxTier: 5, category: 'stat',
    apply: (game) => {
      game.player.damage *= 1.25;
    }
  },
  {
    id: 'aegis',
    name: 'Aegis Orbs',
    icon: '🛡️',
    description: 'Spawns magical shields that damage enemies on touch.',
    tier: 0, maxTier: 3, category: 'ability',
    apply: (game) => {
      game.abilities.orbCount = (game.abilities.orbCount || 0) + 1;
    }
  },
  {
    id: 'shockwave',
    name: 'Shockwave',
    icon: '💥',
    description: 'Emits an expanding radial burst that knocks back monsters.',
    tier: 0, maxTier: 3, category: 'ability',
    apply: (game) => {
      game.abilities.shockwaveLevel = (game.abilities.shockwaveLevel || 0) + 1;
    }
  },
  {
    id: 'lightning',
    name: 'Conduit',
    icon: '🌩️',
    description: 'Periodically zaps a nearby enemy with lightning.',
    tier: 0, maxTier: 3, category: 'ability',
    apply: (game) => {
      game.abilities.lightningLevel = (game.abilities.lightningLevel || 0) + 1;
    }
  }
];
