// Tamagotchi logic for Mochi & Charlie. Pure functions only — the store wraps them in setCabin.

export const PET_IDS = ["mochi", "charlie"];
export const STATS = ["hunger", "happiness", "energy", "clean"];

export const STAT_LABELS = {
  hunger: { label: "שובע", emoji: "🍖" },
  happiness: { label: "אושר", emoji: "💖" },
  energy: { label: "אנרגיה", emoji: "⚡" },
  clean: { label: "ניקיון", emoji: "🫧" },
};

// Points lost per hour ("moderate": needs care every few hours)
export const DECAY_PER_HOUR = { hunger: 10, happiness: 8, energy: 6, clean: 4 };
export const NAP_ENERGY_PER_HOUR = 20; // energy recovers during the shared nap
export const LOW_THRESHOLD = 30;
export const SAD_RECOVERY_THRESHOLD = 40;
export const SICK_CAP = 50;
export const PET_HAPPINESS_CAP = 70; // petting alone can't max out happiness

export const FOOD_COST = 2;
export const VET_COST = 15;
export const SEARCH_COST = 20;
export const BATH_COOLDOWN_MS = 2 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const clamp = (v, max = 100) => Math.max(0, Math.min(max, v));

export const freshPet = (happiness = 85) => ({
  hunger: 80,
  happiness: clamp(happiness),
  energy: 80,
  clean: 80,
  status: "ok", // "ok" | "sad" | "sick" | "away"
  lastBath: 0,
});

// One-time migration from the old single happiness meter
export const initialPets = (petHappiness = {}, now = Date.now()) => ({
  mochi: freshPet(petHappiness.mochi ?? 85),
  charlie: freshPet(petHappiness.charlie ?? 85),
  updatedAt: now,
});

export const statCap = (pet) => (pet.status === "sick" ? SICK_CAP : 100);

const OUTCOMES = ["sad", "sick", "away"];

// Status transitions: an empty meter rolls a random outcome once; sadness lifts on its own.
export function settleStatus(pet, rand = Math.random) {
  if (pet.status === "ok" && STATS.some((s) => pet[s] <= 0)) {
    return { ...pet, status: OUTCOMES[Math.floor(rand() * OUTCOMES.length)] };
  }
  if (
    pet.status === "sad" &&
    STATS.every((s) => pet[s] > SAD_RECOVERY_THRESHOLD)
  ) {
    return { ...pet, status: "ok" };
  }
  return pet;
}

function decayFor(pet, hours, resting) {
  if (hours <= 0 || pet.status === "away") return pet; // a runaway pet is frozen until found
  const next = { ...pet };
  for (const s of STATS) {
    next[s] =
      s === "energy" && resting
        ? clamp(pet.energy + NAP_ENERGY_PER_HOUR * hours, statCap(pet))
        : clamp(pet[s] - DECAY_PER_HOUR[s] * hours);
  }
  return next;
}

// Apply the time elapsed since `pets.updatedAt`, splitting it into normal and nap time.
export function advancePets(pets, now, recoveryStart = null) {
  const from = pets.updatedAt ?? now;
  const totalH = Math.max(0, now - from) / HOUR_MS;
  const napFrom = recoveryStart != null ? Math.max(from, recoveryStart) : now;
  const napH = Math.max(0, now - napFrom) / HOUR_MS;
  const normalH = totalH - napH;

  const out = { updatedAt: now };
  for (const id of PET_IDS) {
    let p = decayFor(pets[id], normalH, false);
    p = decayFor(p, napH, true);
    out[id] = settleStatus(p);
  }
  return out;
}

export const needsAttention = (pet) =>
  !!pet &&
  (pet.status !== "ok" || STATS.some((s) => pet[s] < LOW_THRESHOLD));

// Short Hebrew mood label (feminine for Mochi, masculine for Charlie)
export function moodLabel(petId, pet) {
  const f = petId === "mochi";
  if (pet.status === "away") return f ? "ברחה מהבית! 🏃‍♀️" : "ברח מהבית! 🏃";
  if (pet.status === "sick") return f ? "חולה 🤒" : "חולה 🤒";
  if (pet.status === "sad") return f ? "עצובה 😢" : "עצוב 😿";
  if (pet.hunger < LOW_THRESHOLD) return f ? "רעבה 🍖" : "רעב 🍖";
  if (pet.energy < LOW_THRESHOLD) return f ? "עייפה 😴" : "עייף 😴";
  if (pet.clean < LOW_THRESHOLD) return f ? "מלוכלכת 🫧" : "מלוכלך 🫧";
  if (pet.happiness < LOW_THRESHOLD) return f ? "משועממת 🥱" : "משועמם 🥱";
  return f ? "מאושרת 💖" : "מאושר 💖";
}

/**
 * Apply a care action. Returns { state, ok, message } where `state` is the next cabin state.
 * `cabin` must already have up-to-date pets (call advancePets first).
 */
export function applyPetAction(cabin, petId, action, now = Date.now()) {
  const pet = cabin.pets[petId];
  const cap = statCap(pet);
  const fail = (message) => ({ state: cabin, ok: false, message });
  let next = { ...pet };
  let coins = cabin.coins;
  let dogTreats = cabin.dogTreats ?? 0;

  if (pet.status === "away" && action !== "search") {
    return fail("צריך קודם למצוא אותם ולהחזיר הביתה 🏃");
  }

  switch (action) {
    case "feed": {
      if (petId === "mochi" && dogTreats > 0) dogTreats -= 1;
      else if (coins >= FOOD_COST) coins -= FOOD_COST;
      else return fail(`צריך ${FOOD_COST} מטבעות לאוכל`);
      next.hunger = clamp(pet.hunger + 35, cap);
      break;
    }
    case "play": {
      if (pet.status === "sad") return fail("עצובים מדי לשחק — נסי ליטוף, אוכל או רחצה 💗");
      if (pet.energy < 15) return fail("עייפים מדי לשחק — זמן לשנ״צ 💤");
      next.happiness = clamp(pet.happiness + 25, cap);
      next.energy = clamp(pet.energy - 10, cap);
      break;
    }
    case "bath": {
      const wait = BATH_COOLDOWN_MS - (now - (pet.lastBath ?? 0));
      if (wait > 0) return fail(`כבר נקיים! אפשר שוב בעוד ${Math.ceil(wait / 60000)} דק׳`);
      next.clean = clamp(pet.clean + 40, cap);
      next.lastBath = now;
      break;
    }
    case "pet": {
      const limit = Math.min(PET_HAPPINESS_CAP, cap);
      if (pet.happiness < limit) {
        next.happiness = Math.min(limit, pet.happiness + 3);
      }
      break;
    }
    case "vet": {
      if (pet.status !== "sick") return fail("לא חולים כרגע");
      if (coins < VET_COST) return fail(`צריך ${VET_COST} מטבעות לווטרינר`);
      coins -= VET_COST;
      next.status = "ok";
      for (const s of STATS) next[s] = Math.max(pet[s], SAD_RECOVERY_THRESHOLD);
      break;
    }
    case "search": {
      if (pet.status !== "away") return fail("כבר בבית 🏡");
      if (coins < SEARCH_COST) return fail(`צריך ${SEARCH_COST} מטבעות לחיפוש`);
      coins -= SEARCH_COST;
      next = { ...pet, status: "ok", hunger: 50, happiness: 50, energy: 50, clean: 50 };
      break;
    }
    default:
      return fail("פעולה לא מוכרת");
  }

  next = settleStatus(next);
  return {
    ok: true,
    message: "",
    state: {
      ...cabin,
      coins,
      dogTreats,
      pets: { ...cabin.pets, [petId]: next },
    },
  };
}

// Real-life care (a walk with Mochi, brushing in the home roulette) — free boosts.
export function boostPetState(cabin, petId, deltas, { bringHome = false } = {}) {
  let pet = cabin.pets[petId];
  if (pet.status === "away") {
    if (!bringHome) return cabin;
    pet = { ...pet, status: "ok", hunger: 50, happiness: 50, energy: 50, clean: 50 };
  }
  const cap = statCap(pet);
  const next = { ...pet };
  for (const [s, d] of Object.entries(deltas)) next[s] = clamp(pet[s] + d, cap);
  return { ...cabin, pets: { ...cabin.pets, [petId]: settleStatus(next) } };
}
