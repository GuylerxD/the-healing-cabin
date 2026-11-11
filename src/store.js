import { useSyncExternalStore } from "react";

// Single localStorage-backed store. Bump the key version if the shape changes incompatibly.
const KEY = "healing-cabin-v1";
const DEFAULTS = {
  coins: 0,
  days: {}, // { 'YYYY-MM-DD': { acid, qlaira, protein, ... } } — daily quests reset by date key
  weighIns: [], // [{ date, kg }]
  owned: [], // pet accessory ids
  shift: { start: "08:00", end: "16:00" },
  proteinGoal: 80, // grams/day, editable in Nutrition
  inventory: [], // ingredient names at home
  prepPlan: [], // recipe ids planned for weekend prep
  recoveryStart: null, // ms timestamp while Active Recovery runs (survives closing the app)
  longGoal: "", // optional free-text long-term goal shown in the header
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

export const useCabin = () => useSyncExternalStore(subscribe, () => state);
export const useToday = () => useCabin().days[todayKey()] ?? {};

export const addCoins = (n) =>
  setCabin((s) => ({ ...s, coins: Math.max(0, s.coins + n) }));

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
