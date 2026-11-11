import { Beef, ChefHat, ShoppingBasket, Trophy, Sparkles } from "lucide-react";
import { setCabin, updateToday, useCabin, useToday } from "../store";
import { useDailyPlan } from "../hooks/useDailyPlan";

// Rough portion estimates — tweak to her real portions.
const PROTEIN_ADDS = [
  { label: "🐟 דג", grams: 25 },
  { label: "🥚 2 ביצים", grams: 12 },
  { label: "🧈 טופו", grams: 15 },
];

const RECIPES = [
  {
    id: "oats",
    name: "אוברנייט שיבולת שועל 🥣",
    ingredients: ["שיבולת שועל", "יוגורט", "זרעי צ'יה", "פירות יער"],
  },
  {
    id: "polenta",
    name: "מאפיני פולנטה 🧁",
    ingredients: [
      "קמח תירס (פולנטה)",
      "ביצים",
      "יוגורט",
      "גבינה",
      "אבקת אפייה",
    ],
  },
  {
    id: "tofu",
    name: "טופו אפוי 🍱",
    ingredients: ["טופו", "רוטב סויה", "שמן זית"],
  },
];

const MAX_MEALS = 3;

const toggleIn = (list, item) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

export default function Nutrition() {
  const { proteinGoal, inventory, prepPlan } = useCabin();
  const today = useToday();
  const { todayPlan, dayNameHe } = useDailyPlan();
  const protein = today.protein ?? 0;
  const meals = today.meals ?? 0;
  const pct = Math.min(100, Math.round((protein / proteinGoal) * 100));

  const allIngredients = [...new Set(RECIPES.flatMap((r) => r.ingredients))];
  const grocery = [
    ...new Set(
      RECIPES.filter((r) => prepPlan.includes(r.id)).flatMap(
        (r) => r.ingredients,
      ),
    ),
  ].filter((i) => !inventory.includes(i));

  const toggleInventory = (item) =>
    setCabin((s) => ({ ...s, inventory: toggleIn(s.inventory, item) }));

  return (
    <div className="space-y-4">
      <section className="glass space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-bold text-mint">
          <Beef className="h-5 w-5" aria-hidden /> מד חלבון יומי
        </h2>
        <div
          className="h-4 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-l from-mint to-lilac transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-purple-200">
          {protein} / {proteinGoal} גרם{" "}
          {pct >= 100 ? "— הגעת ליעד! 🎉" : "• בלי לספור קלוריות"}
        </p>
        <div className="flex gap-2">
          {PROTEIN_ADDS.map(({ label, grams }) => (
            <button
              key={label}
              onClick={() => updateToday({ protein: protein + grams })}
              className="flex-1 rounded-2xl bg-white/5 py-2.5 text-sm text-moon transition active:scale-95"
            >
              {label}
              <span className="block text-[11px] text-purple-300">
                +{grams}ג׳
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-purple-300">
          <label className="flex items-center gap-2">
            יעד יומי
            <input
              type="number"
              min="20"
              max="250"
              value={proteinGoal}
              onChange={(e) => {
                const g = Number(e.target.value);
                if (g >= 20 && g <= 250)
                  setCabin((s) => ({ ...s, proteinGoal: g }));
              }}
              className="w-16 rounded-xl bg-white/10 px-2 py-1 text-moon"
            />
          </label>
          {protein > 0 && (
            <button
              onClick={() => updateToday({ protein: 0 })}
              className="underline"
            >
              איפוס היום
            </button>
          )}
        </div>
      </section>

      {/* Daily PCOS Balanced Nutrition Plan from plansDB */}
      {todayPlan && todayPlan.nutrition && (
        <section className="glass space-y-3.5 p-5 text-right">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-mint" />
              <h2 className="font-bold text-mint text-sm">
                תפריט יום {dayNameHe}: איזון סוכר ו-PCOS 🌱
              </h2>
            </div>
            <span className="rounded-full bg-mint/15 px-2.5 py-0.5 text-[11px] font-bold text-mint">
              פסקטריאני מוקפד
            </span>
          </div>

          <p className="text-xs text-purple-200">
            {todayPlan.nutrition.pcosFocus} • יעד חלבון יומי מומלץ:{" "}
            {todayPlan.nutrition.targetProteinGrams} גרם
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between font-bold text-blush">
                <span>
                  ארוחת בוקר: {todayPlan.nutrition.meals.breakfast.name}
                </span>
                <span className="text-[11px] text-mint">
                  +{todayPlan.nutrition.meals.breakfast.proteinGrams}ג׳ חלבון
                </span>
              </div>
              <p className="mt-1 text-purple-200">
                {todayPlan.nutrition.meals.breakfast.notes}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between font-bold text-lilac">
                <span>
                  ארוחת צהריים: {todayPlan.nutrition.meals.lunch.name}
                </span>
                <span className="text-[11px] text-mint">
                  +{todayPlan.nutrition.meals.lunch.proteinGrams}ג׳ חלבון
                </span>
              </div>
              <p className="mt-1 text-purple-200">
                {todayPlan.nutrition.meals.lunch.notes}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between font-bold text-moon">
                <span>ארוחת ערב: {todayPlan.nutrition.meals.dinner.name}</span>
                <span className="text-[11px] text-mint">
                  +{todayPlan.nutrition.meals.dinner.proteinGrams}ג׳ חלבון
                </span>
              </div>
              <p className="mt-1 text-purple-200">
                {todayPlan.nutrition.meals.dinner.notes}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between font-bold text-purple-300">
                <span>נשנוש מאזן: {todayPlan.nutrition.meals.snack.name}</span>
                <span className="text-[11px] text-mint">
                  +{todayPlan.nutrition.meals.snack.proteinGrams}ג׳ חלבון
                </span>
              </div>
              <p className="mt-1 text-purple-200">
                {todayPlan.nutrition.meals.snack.notes}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-space/60 p-2 text-center text-[11px] text-purple-300">
            🚫 ללא כוסברה • ללא שעועית ירוקה • ללא תורמוס • ללא אדממה
          </div>
        </section>
      )}

      <section className="glass space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-bold text-blush">
          <Trophy className="h-5 w-5" aria-hidden /> משימות אוכל
        </h2>
        <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
          <span className="text-sm">
            ארוחה מאוזנת ({meals}/{MAX_MEALS})
            <span className="block text-[11px] text-purple-300">
              +5 מטבעות לכל ארוחה
            </span>
          </span>
          <button
            disabled={meals >= MAX_MEALS}
            onClick={() => updateToday({ meals: meals + 1 }, 5)}
            className="rounded-2xl bg-mint px-4 py-2 text-sm font-bold text-space disabled:opacity-40"
          >
            {meals >= MAX_MEALS ? "✨ הושלם" : "רשמתי"}
          </button>
        </div>
        <button
          aria-pressed={!!today.earlyDinner}
          onClick={() =>
            updateToday(
              { earlyDinner: !today.earlyDinner },
              today.earlyDinner ? -10 : 10,
            )
          }
          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-right text-sm transition ${
            today.earlyDinner ? "bg-mint/15 text-mint" : "bg-white/5"
          }`}
        >
          <span>
            סיימתי ארוחת ערב 3 שעות לפני השינה
            <span className="block text-[11px] opacity-70">
              שומר מצרבת • +10 מטבעות
            </span>
          </span>
          <span>{today.earlyDinner ? "✅" : "⬜"}</span>
        </button>
      </section>

      <section className="glass space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-bold text-lilac">
          <ChefHat className="h-5 w-5" aria-hidden /> גיבורת ההכנות — סופ״ש
        </h2>
        <div className="space-y-2">
          {RECIPES.map((r) => {
            const on = prepPlan.includes(r.id);
            return (
              <button
                key={r.id}
                aria-pressed={on}
                onClick={() =>
                  setCabin((s) => ({
                    ...s,
                    prepPlan: toggleIn(s.prepPlan, r.id),
                  }))
                }
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-right text-sm transition ${
                  on ? "bg-lilac/20 text-moon" : "bg-white/5 text-purple-200"
                }`}
              >
                {r.name}
                <span>{on ? "✅" : "➕"}</span>
              </button>
            );
          })}
        </div>

        <h3 className="flex items-center gap-2 pt-2 text-sm font-bold text-mint">
          <ShoppingBasket className="h-4 w-4" aria-hidden /> רשימת קניות חכמה
        </h3>
        {prepPlan.length === 0 ? (
          <p className="text-xs text-purple-300">
            בחרי מתכון להכנה והרשימה תיבנה לבד 🌱
          </p>
        ) : grocery.length === 0 ? (
          <p className="text-xs text-mint">
            יש לך הכל בבית! אפשר להתחיל לבשל 🎉
          </p>
        ) : (
          <ul className="space-y-1.5">
            {grocery.map((item) => (
              <li key={item}>
                <button
                  onClick={() => toggleInventory(item)}
                  className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-2 text-sm"
                >
                  {item}
                  <span className="text-[11px] text-purple-300">קניתי ✔</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <h3 className="pt-2 text-sm font-bold text-purple-200">מה יש בבית?</h3>
        <div className="flex flex-wrap gap-2">
          {allIngredients.map((item) => {
            const have = inventory.includes(item);
            return (
              <button
                key={item}
                aria-pressed={have}
                onClick={() => toggleInventory(item)}
                className={`rounded-full px-3 py-1.5 text-xs transition ${
                  have ? "bg-mint/20 text-mint" : "bg-white/5 text-purple-300"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
