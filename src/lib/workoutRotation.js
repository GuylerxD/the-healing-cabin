import { SOS_WORKOUT, WORKOUT_POOL } from "../data/workoutPool";

// Weekly rhythm (Sunday..Saturday) keeps the week balanced; the workout inside
// each type rotates every time that type comes around, so days rarely repeat.
export const WEEK_RHYTHM = [
  "cardio", // ראשון
  "strength", // שני
  "cardio", // שלישי
  "strength", // רביעי
  "mobility", // חמישי
  "cardio", // שישי
  "recovery", // שבת
];

const BY_TYPE = WORKOUT_POOL.reduce((acc, w) => {
  (acc[w.type] ??= []).push(w);
  return acc;
}, {});
const BACK_FOCUSED = WORKOUT_POOL.filter((w) => w.backFocused);

// Local calendar day as an integer (DST-safe)
const dayNumber = (d) =>
  Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
// Sunday-based week number (day 0 = Thursday 1970-01-01)
const weekNumber = (d) => Math.floor((dayNumber(d) + 4) / 7);

const pick = (list, i) => list[((i % list.length) + list.length) % list.length];

/**
 * Today's main workout.
 * @param {Date} date
 * @param {{ swap?: number, sos?: boolean, backPainHigh?: boolean, heavyBreathing?: boolean }} opts
 * @returns {{ workout, type, adaptedReason: string|null }}
 */
export function getDailyWorkout(date = new Date(), opts = {}) {
  const { swap = 0, sos = false, backPainHigh = false, heavyBreathing = false } = opts;
  if (sos) return { workout: SOS_WORKOUT, type: "recovery", adaptedReason: "sos" };

  const weekday = date.getDay();
  const type = WEEK_RHYTHM[weekday];

  if (backPainHigh) {
    return {
      workout: pick(BACK_FOCUSED, dayNumber(date) + swap),
      type: "mobility",
      adaptedReason: "back",
    };
  }
  if (heavyBreathing && type === "cardio") {
    return {
      workout: pick(BY_TYPE.mobility, dayNumber(date) + swap),
      type: "mobility",
      adaptedReason: "breathing",
    };
  }

  const perWeek = WEEK_RHYTHM.filter((t) => t === type).length;
  const occurrence = WEEK_RHYTHM.slice(0, weekday).filter((t) => t === type).length;
  const index = weekNumber(date) * perWeek + occurrence + swap;
  return { workout: pick(BY_TYPE[type], index), type, adaptedReason: null };
}

export function getTomorrowWorkout(date = new Date()) {
  const t = new Date(date);
  t.setDate(t.getDate() + 1);
  return getDailyWorkout(t).workout;
}

/**
 * A rotating daily selection for the extra library: two of each type, never the main workout.
 */
export function getDailyExtras(date = new Date(), excludeId = null, perType = 2) {
  const n = dayNumber(date);
  return Object.values(BY_TYPE).flatMap((list) => {
    const options = list.filter((w) => w.id !== excludeId);
    const start = n * perType;
    return Array.from({ length: Math.min(perType, options.length) }, (_, i) =>
      pick(options, start + i),
    );
  });
}

export const POOL_SIZE = WORKOUT_POOL.length;
