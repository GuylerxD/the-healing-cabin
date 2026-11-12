import { useSyncExternalStore } from "react";

// Single localStorage-backed store. Bump the key version if the shape changes incompatibly.
const KEY = "healing-cabin-v1";
const DEFAULTS = {
  coins: 0,
  days: {}, // { 'YYYY-MM-DD': { acid, qlaira, protein, ... } } — daily quests reset by date key
  weighIns: [], // [{ date, kg }]
  owned: [], // pet accessory ids
  badges: [], // earned badge ids
  walkingMinutes: 65, // total accumulated indoor walking minutes (initial baseline)
  sosMode: false, // low energy / asthma mode
  shift: { start: "08:00", end: "16:00" },
  proteinGoal: 110, // grams/day target (range 100g - 120g)
  calorieGoal: 1650, // kcal/day target (range 1600 - 1700 kcal)
  inventory: [], // ingredient names at home
  prepPlan: [], // recipe ids planned for weekend prep
  recoveryStart: null, // ms timestamp while Active Recovery runs (survives closing the app)
  longGoal: "", // optional free-text long-term goal shown in the header
  collapsedSections: {}, // { [sectionId]: boolean } - persisted collapse state
  customMealPlanDay: null, // optional overridden dayIndex (0..6) for today's nutrition tab
  currentWeight: 99, // Current weight in kg (starting baseline: 99kg)
  startWeight: 99, // Starting weight (99kg)
  goalWeight: 60, // Final goal weight (60kg)
  unlockedWeightMilestones: [], // IDs of claimed / unlocked milestones
};

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) };
  } catch {
    return DEFAULTS;
  }
}

let state = load();
const listeners = new Set();

export function setCabin(fn) {
  state = fn(state);
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const todayKey = () => new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD

export const dateKeyWithOffset = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-CA");
};

export const useCabin = () => useSyncExternalStore(subscribe, () => state);
export const useToday = () => useCabin().days[todayKey()] ?? {};
export const useDay = (dateKey) => useCabin().days[dateKey] ?? {};

export const addCoins = (n) =>
  setCabin((s) => ({ ...s, coins: Math.max(0, s.coins + n) }));

export function updateDay(dateKey, patch, coins = 0) {
  setCabin((s) => {
    return {
      ...s,
      coins: Math.max(0, s.coins + coins),
      days: { ...s.days, [dateKey]: { ...s.days[dateKey], ...patch } },
    };
  });
}

export function toggleSectionCollapsed(id, forcedState = null) {
  setCabin((s) => {
    const current = s.collapsedSections ?? {};
    const nextVal = forcedState !== null ? forcedState : !current[id];
    return {
      ...s,
      collapsedSections: {
        ...current,
        [id]: nextVal,
      },
    };
  });
}

export function setAllSectionsCollapsed(collapsed = true) {
  setCabin((s) => {
    const knownKeys = [
      "quests-shift",
      "quests-acid",
      "quests-qlaira",
      "quests-push-settings",
      "movement-breathing",
      "movement-sos",
      "movement-daily-workout",
      "movement-map",
      "movement-qlaira-28",
      "movement-extra-workouts",
      "nutrition-protein-bar",
      "nutrition-water",
      "nutrition-daily-meals",
      "nutrition-reflux",
      "mealprep-guide",
      "mealprep-grocery",
      "mealprep-weekly-plan",
      "mealprep-guidelines",
      "tracking-quick-check",
      "tracking-weighin",
      "tracking-history",
      "cabin-recovery",
      "cabin-pet-room",
      "cabin-badges",
      "cabin-shop",
    ];
    const updated = { ...(s.collapsedSections ?? {}) };
    knownKeys.forEach((k) => {
      updated[k] = collapsed;
    });
    return {
      ...s,
      collapsedSections: updated,
    };
  });
}

// Optional coin delta is applied in the same write, so quest toggles stay in sync with coins.
export function updateToday(patch, coins = 0) {
  setCabin((s) => {
    const k = todayKey();
    return {
      ...s,
      coins: Math.max(0, s.coins + coins),
      days: { ...s.days, [k]: { ...s.days[k], ...patch } },
    };
  });
}
