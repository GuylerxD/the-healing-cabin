import { setCabin, todayKey } from "../store";

// Shared with My Recipes: both apps live on the same GitHub Pages origin,
// so they read the same localStorage. My Recipes writes; we only read.
// Shape: { 'YYYY-MM-DD': { [slotKey]: { title, calories, protein, meal, at } } }
export const EATEN_LOG_KEY = "healing_cabin_eaten_meals";
export const RECIPE_MEAL_REWARD = 2;
export const MY_RECIPES_URL = "https://guylerxd.github.io/my-recipes/";

function readTodayEaten() {
  try {
    const log = JSON.parse(localStorage.getItem(EATEN_LOG_KEY) || "{}");
    const today = log?.[todayKey()];
    return today && typeof today === "object" ? today : {};
  } catch {
    return {};
  }
}

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const sameMeal = (a, b) =>
  a.title === b.title && a.calories === b.calories && a.protein === b.protein;

// Brings today's `recipeMeals` in line with the shared log. Totals change only by the
// difference against what was already counted, so manual additions (quick protein) stay.
export function syncEatenMeals() {
  const incoming = Object.fromEntries(
    Object.entries(readTodayEaten()).map(([k, m]) => [
      k,
      {
        title: String(m?.title ?? "").slice(0, 80),
        meal: String(m?.meal ?? ""),
        calories: Math.max(0, Math.round(num(m?.calories))),
        protein: Math.max(0, Math.round(num(m?.protein) * 10) / 10),
        at: num(m?.at),
      },
    ]),
  );

  setCabin((s) => {
    const k = todayKey();
    const day = s.days[k] ?? {};
    const counted = day.recipeMeals ?? {};

    const keys = new Set([...Object.keys(counted), ...Object.keys(incoming)]);
    let dCal = 0;
    let dProt = 0;
    let dCoins = 0;
    let changed = false;
    keys.forEach((key) => {
      const was = counted[key];
      const now = incoming[key];
      if (was && now && sameMeal(was, now)) return;
      changed = true;
      if (was) {
        dCal -= was.calories;
        dProt -= was.protein;
      }
      if (now) {
        dCal += now.calories;
        dProt += now.protein;
      }
      if (!was && now) dCoins += RECIPE_MEAL_REWARD;
      if (was && !now) dCoins -= RECIPE_MEAL_REWARD;
    });
    if (!changed) return s;

    return {
      ...s,
      coins: Math.max(0, s.coins + dCoins),
      days: {
        ...s.days,
        [k]: {
          ...day,
          calories: Math.max(0, Math.round((day.calories ?? 0) + dCal)),
          protein: Math.max(0, Math.round(((day.protein ?? 0) + dProt) * 10) / 10),
          recipeMeals: incoming,
          meals: Object.keys(incoming).length,
        },
      },
    };
  });
}
