import { setCabin, todayKey } from "../store";
import { daysUntilNextWeighIn } from "./tracking";

export const WEIGHT_MIN = 30;
export const WEIGHT_MAX = 250;
export const WEEKLY_WEIGH_REWARD = 4;

export const WEIGHT_MILESTONE_REWARDS = [
  { id: "m90", kgThreshold: 90, coinsReward: 50 },
  { id: "m80", kgThreshold: 80, coinsReward: 75 },
  { id: "m70", kgThreshold: 70, coinsReward: 100 },
  { id: "m60", kgThreshold: 60, coinsReward: 250 },
];

export const isValidWeight = (kg) =>
  Number.isFinite(kg) && kg >= WEIGHT_MIN && kg <= WEIGHT_MAX;

// Latest logged weight is the source of truth; `currentWeight` is the fallback for old data.
export const latestWeight = (cabin) =>
  cabin.weighIns?.at(-1)?.kg ?? cabin.currentWeight ?? 99;

/**
 * Single entry point for every weight update (weekly weigh-in and the journey map).
 * - A second entry on the same day replaces the first instead of duplicating it.
 * - The weekly reward is paid only when 7 days passed since the previous weigh-in.
 * - Each milestone pays once.
 * Returns { ids, coins } of the milestones unlocked by this weigh-in.
 */
export function recordWeighIn(kg) {
  const unlocked = { ids: [], coins: 0 };
  if (!isValidWeight(kg)) return unlocked;

  setCabin((s) => {
    const k = todayKey();
    const prev = s.weighIns ?? [];
    const weeklyDue = daysUntilNextWeighIn(prev, k) === 0;
    const owned = new Set(s.unlockedWeightMilestones ?? []);

    for (const m of WEIGHT_MILESTONE_REWARDS) {
      if (kg <= m.kgThreshold && !owned.has(m.id)) {
        owned.add(m.id);
        unlocked.ids.push(m.id);
        unlocked.coins += m.coinsReward;
      }
    }

    return {
      ...s,
      currentWeight: kg,
      coins: s.coins + unlocked.coins + (weeklyDue ? WEEKLY_WEIGH_REWARD : 0),
      unlockedWeightMilestones: Array.from(owned),
      weighIns: [...prev.filter((w) => w.date !== k), { date: k, kg }],
    };
  });

  return unlocked;
}
