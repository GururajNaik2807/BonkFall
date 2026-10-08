export interface Snapshot {
  hp: number;
  maxHp: number;
  xp: number;
  nextXp: number;
  level: number;
  time: number;
  wave: number;
  mapName: string;
  kills: number;
  powerLevel: number;
  paused: boolean;
  choices?: any[];
  playerAngle?: number;
}

export interface Result {
  won: boolean;
  time: number;
  kills: number;
  level: number;
  power: number;
}

export type AttackState = 'IDLE' | 'WINDUP' | 'SWING' | 'RECOVERY';
