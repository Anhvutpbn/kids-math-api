export interface MemoryGameLevelConfig {
  level: number;
  tier: number;
  numBoxes: number;
  displayTimeMs: number;
  mistakesAllowed: number;
}

export const MEMORY_GAME_LEVELS: MemoryGameLevelConfig[] = [
  { level: 1,  tier: 1, numBoxes: 4,  displayTimeMs: 5000,  mistakesAllowed: 1 },
  { level: 2,  tier: 1, numBoxes: 4,  displayTimeMs: 4000,  mistakesAllowed: 1 },
  { level: 3,  tier: 1, numBoxes: 4,  displayTimeMs: 3000,  mistakesAllowed: 1 },
  { level: 4,  tier: 1, numBoxes: 4,  displayTimeMs: 2000,  mistakesAllowed: 1 },
  { level: 5,  tier: 2, numBoxes: 6,  displayTimeMs: 7000,  mistakesAllowed: 2 },
  { level: 6,  tier: 2, numBoxes: 6,  displayTimeMs: 5000,  mistakesAllowed: 2 },
  { level: 7,  tier: 2, numBoxes: 6,  displayTimeMs: 4000,  mistakesAllowed: 2 },
  { level: 8,  tier: 2, numBoxes: 6,  displayTimeMs: 3000,  mistakesAllowed: 2 },
  { level: 9,  tier: 3, numBoxes: 10, displayTimeMs: 8000,  mistakesAllowed: 3 },
  { level: 10, tier: 3, numBoxes: 10, displayTimeMs: 6000,  mistakesAllowed: 3 },
  { level: 11, tier: 3, numBoxes: 10, displayTimeMs: 4000,  mistakesAllowed: 3 },
  { level: 12, tier: 4, numBoxes: 15, displayTimeMs: 10000, mistakesAllowed: 4 },
  { level: 13, tier: 4, numBoxes: 15, displayTimeMs: 7000,  mistakesAllowed: 4 },
  { level: 14, tier: 4, numBoxes: 15, displayTimeMs: 5000,  mistakesAllowed: 4 },
  { level: 15, tier: 5, numBoxes: 20, displayTimeMs: 12000, mistakesAllowed: 5 },
  { level: 16, tier: 5, numBoxes: 20, displayTimeMs: 8000,  mistakesAllowed: 5 },
];

export const MAX_MEMORY_LEVEL = 16;

export const TIER_FIRST_LEVEL: Record<number, number> = { 1: 1, 2: 5, 3: 9, 4: 12, 5: 15 };
