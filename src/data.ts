export type Upgrade={id:string;name:string;description:string;icon:string;apply:(s:Stats)=>void;max:number};
export type Stats={maxHp:number;hp:number;moveSpeed:number;damage:number;attackRate:number;attackRange:number;projectiles:number;projectileSpeed:number;pickupRadius:number;crit:number};
export const UPGRADES:Upgrade[]=[
{id:"damage",name:"Warrior's Edge",description:"+20% attack damage",icon:"⚔",max:8,apply:s=>s.damage*=1.2},
{id:"speed",name:"Quick Hands",description:"+15% attack speed",icon:"⚡",max:8,apply:s=>s.attackRate*=1.15},
{id:"range",name:"Long Reach",description:"+18% attack range",icon:"◉",max:6,apply:s=>s.attackRange*=1.18},
{id:"projectile",name:"Twin Strike",description:"+1 projectile",icon:"✦",max:4,apply:s=>s.projectiles++},
{id:"health",name:"Vitality",description:"+30 max HP and heal 30",icon:"♥",max:6,apply:s=>{s.maxHp+=30;s.hp=Math.min(s.maxHp,s.hp+30)}},
{id:"move",name:"Fleet Foot",description:"+14% movement speed",icon:"➤",max:7,apply:s=>s.moveSpeed*=1.14},
{id:"magnet",name:"Soul Magnet",description:"+35% XP pickup radius",icon:"✹",max:6,apply:s=>s.pickupRadius*=1.35},
{id:"crit",name:"Critical Core",description:"+7% critical chance",icon:"✸",max:7,apply:s=>s.crit=Math.min(.75,s.crit+.07)}
];
export const ENEMY_DEFS=[
{id:"goblin",name:"Goblin",hp:34,speed:66,damage:9,xp:6,r:17,color:0x65a30d,weight:55},
{id:"wolf",name:"Dire Wolf",hp:26,speed:105,damage:12,xp:7,r:16,color:0x64748b,weight:25},
{id:"orc",name:"Orc",hp:105,speed:43,damage:19,xp:15,r:23,color:0x16a34a,weight:14},
{id:"mage",name:"Void Mage",hp:60,speed:48,damage:15,xp:18,r:18,color:0x7c3aed,weight:6}
] as const;
