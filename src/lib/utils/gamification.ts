export const calculateLevelFromXp = (xp: number) => {
  if (xp < 150) return 1;
  if (xp < 350) return 2;
  if (xp < 650) return 3;
  if (xp < 1000) return 4;
  if (xp < 1450) return 5;
  if (xp < 1950) return 6;
  return Math.floor(xp / 350) + 1;
};

export const getNextLevelXp = (level: number) => {
  if (level <= 1) return 150;
  if (level === 2) return 350;
  if (level === 3) return 650;
  if (level === 4) return 1000;
  if (level === 5) return 1450;
  if (level === 6) return 1950;
  return level * 350;
};

export const getXpProgress = (xp: number) => {
  const level = calculateLevelFromXp(xp);
  const nextLevelAt = getNextLevelXp(level);
  const prevLevelAt = level <= 1 ? 0 : getNextLevelXp(level - 1);
  const progress = Math.min(
    100,
    Math.round(((xp - prevLevelAt) / (nextLevelAt - prevLevelAt || 1)) * 100),
  );

  return {
    level,
    nextLevelAt,
    progress,
  };
};
