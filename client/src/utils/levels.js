// src/utils/levels.js
export const LEVELS = [
  { level:1, name:"Novice",      minXP:0,    maxXP:99,   icon:"◎" },
  { level:2, name:"Apprentice",  minXP:100,  maxXP:249,  icon:"◈" },
  { level:3, name:"Scholar",     minXP:250,  maxXP:499,  icon:"⟡" },
  { level:4, name:"Expert",      minXP:500,  maxXP:999,  icon:"✦" },
  { level:5, name:"Master",      minXP:1000, maxXP:1999, icon:"⬡" },
  { level:6, name:"Champion",    minXP:2000, maxXP:4999, icon:"⊕" },
  { level:7, name:"Legend",      minXP:5000, maxXP:Infinity, icon:"★" },
];

export function getLevelInfo(points) {
  let cur = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) { if (points >= LEVELS[i].minXP) { cur = LEVELS[i]; break; } }
  const ni = LEVELS.findIndex(l => l.level === cur.level) + 1;
  const next = ni < LEVELS.length ? LEVELS[ni] : null;
  const pct = next ? Math.min(100, Math.round(((points - cur.minXP) / (next.minXP - cur.minXP)) * 100)) : 100;
  return { level: cur.level, levelName: cur.name, icon: cur.icon, percentage: pct,
    currentXP: points, xpNeeded: next ? next.minXP : points, xpToNext: next ? next.minXP - points : 0,
    nextLevelName: next?.name ?? null, isMaxLevel: !next };
}
export function getLevelMotivation(pct) {
  if (pct >= 90) return "Almost leveling up!";
  if (pct >= 70) return "You're blazing — push through!";
  if (pct >= 50) return "Halfway to the next rank!";
  if (pct >= 25) return "Momentum building...";
  return "Every XP counts. Keep going!";
}