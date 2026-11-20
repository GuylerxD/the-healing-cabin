import { useSyncExternalStore } from "react";
import {
  advancePets,
  applyPetAction,
  boostPetState,
  initialPets,
} from "./lib/pets";

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
  sweetTokensSpent: 0, // Weekly used tokens (max allowance: 4)
  sweetBankWeekKey: null, // Sunday date (YYYY-MM-DD) of the week the tokens belong to
  sweetBankClaimedWeek: null, // week key whose leftover-token bonus was already paid  dogTreats: 0, // Virtual Dog Treats for Mochi in the Idle Room
  homeResetTasks: {}, // { [taskId]: boolean } weekly home checklist
  dailyHomeTasks: null, // { date: 'YYYY-MM-DD', ids: string[] } today's 3 home tasks
  unlockedFurniture: [], // aesthetic furniture unlocked for idle cabin (e.g. "salt-lamp", "tarnaby-lamp")
  lastMochiWalk: null, // timestamp or date of last walk
  roomLighting: "sunset", // "sunset" | "lofi" | "cozy" | "night"
  placedDecor: ["rug", "plant", "salt-lamp"], // active decor placed in room
  petHappiness: { mochi: 85, charlie: 85 }, // legacy; migrated into `pets` on first tick
  pets: null, // tamagotchi state, see lib/pets.js: { mochi, charlie, updatedAt }
  selfCare: null, // personal-care routine, see components/SelfCareRoutine.jsx
};

function load() {
  try {
    // eslint-disable-next-line no-unused-vars -- geminiApiKey: dropped with the AI meal logger
    const { geminiApiKey, ...saved } = JSON.parse(localStorage.getItem(KEY)) ?? {};
    return { ...DEFAULTS, ...saved };
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

export const getCabin = () => state;

// ---- Tamagotchi pets ----
const withPetsUpToDate = (s, now) =>
  advancePets(s.pets ?? initialPets(s.petHappiness, now), now, s.recoveryStart);

export function tickPets(now = Date.now()) {
  setCabin((s) => {
    // Skip sub-minute ticks to avoid needless writes
    if (s.pets && now - (s.pets.updatedAt ?? 0) < 60_000) return s;
    return { ...s, pets: withPetsUpToDate(s, now) };
  });
}

// Returns { ok, message } so the UI can explain a refused action.
export function petAction(petId, action) {
  const now = Date.now();
  let result = { ok: false, message: "" };
  setCabin((s) => {
    const r = applyPetAction(
      { ...s, pets: withPetsUpToDate(s, now) },
      petId,
      action,
      now,
    );
    result = { ok: r.ok, message: r.message };
    return r.ok ? r.state : s;
  });
  return result;
}

export function boostPet(petId, deltas, options) {
  const now = Date.now();
  setCabin((s) =>
    boostPetState({ ...s, pets: withPetsUpToDate(s, now) }, petId, deltas, options),
  );
}

// ---- Sweet bank (weekly sweet tokens, week starts Sunday) ----
export const SWEET_TOKENS_PER_WEEK = 4;
export const SWEET_BONUS_PER_TOKEN = 10;

export const sweetWeekKey = (d = new Date()) => {
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - d.getDay());
  return sunday.toLocaleDateString("en-CA");
};

// Motzei Shabbat: Saturday from 18:00
export const isSweetBonusWindow = (d = new Date()) =>
  d.getDay() === 6 && d.getHours() >= 18;

const leftoverTokens = (s) =>
  Math.max(0, SWEET_TOKENS_PER_WEEK - (s.sweetTokensSpent ?? 0));

// New week: reset tokens; leftovers from a week whose bonus wasn't collected convert automatically.
export function rolloverSweetBank() {
  const wk = sweetWeekKey();
  if (state.sweetBankWeekKey === wk) return;
  setCabin((s) => {
    if (s.sweetBankWeekKey === wk) return s;
    if (!s.sweetBankWeekKey) return { ...s, sweetBankWeekKey: wk }; // first run: keep current count
    const bonus =
      s.sweetBankClaimedWeek === s.sweetBankWeekKey
        ? 0
        : leftoverTokens(s) * SWEET_BONUS_PER_TOKEN;
    return {
      ...s,
      coins: s.coins + bonus,
      sweetTokensSpent: 0,
      sweetBankWeekKey: wk,
    };
  });
}

export function claimSweetBankBonus() {
  if (!isSweetBonusWindow()) return 0;
  const wk = sweetWeekKey();
  let bonus = 0;
  setCabin((s) => {
    if (s.sweetBankClaimedWeek === wk) return s;
    bonus = leftoverTokens(s) * SWEET_BONUS_PER_TOKEN;
    if (!bonus) return s;
    return {
      ...s,
      coins: s.coins + bonus,
      sweetTokensSpent: SWEET_TOKENS_PER_WEEK, // leftovers were converted to coins
      sweetBankClaimedWeek: wk,
      sweetBankWeekKey: wk,
    };
  });
  return bonus;
}
export const useCabin = () => useSyncExternalStore(subscribe, () => state);

export const PILL_REWARD = 4;

// Idempotent: coins are granted only the first time the pill is marked for that day.
export function markPillTaken(dateKey = todayKey()) {
  setCabin((s) => {
    const day = s.days[dateKey] ?? {};
    if (day.qlaira) return s;
    return {
      ...s,
      coins: s.coins + PILL_REWARD,
      days: { ...s.days, [dateKey]: { ...day, qlaira: true } },
    };
  });
}
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

// Every CollapsibleCard id in the app. Keep in sync when adding a card.
export const SECTION_IDS = [
  "quests-acid",
  "quests-qlaira",
  "movement-breathing",
  "movement-sos",
  "movement-daily-workout",
  "movement-map",
  "movement-extra-workouts",
  "nutrition-protein-bar",
  "nutrition-sweet-bank",
  "nutrition-water",
  "nutrition-recipes-meals",
  "nutrition-reflux",
  "lifestyle-mochi-walks",
  "lifestyle-selfcare",
  "lifestyle-home-reset",
  "lifestyle-date-roulette",
  "tracking-journey-weight",
  "tracking-weighin",
  "tracking-quick-check",
  "tracking-energy",
  "tracking-history",
  "cabin-pet-room",
  "cabin-badges",
  "cabin-shop",
];

export const areAllSectionsCollapsed = (collapsedSections = {}) =>
  SECTION_IDS.every((id) => collapsedSections[id] === true);

export function setAllSectionsCollapsed(collapsed = true) {
  setCabin((s) => {
    const updated = { ...(s.collapsedSections ?? {}) };
    SECTION_IDS.forEach((k) => {
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
