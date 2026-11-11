import { useState } from "react";
import {
  Beef,
  Trophy,
  Droplets,
  GlassWater,
  CheckCircle2,
  Calendar,
  Check,
  BookOpen,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { updateToday, useCabin, useToday, setCabin } from "../store";
import { useDailyPlan } from "../hooks/useDailyPlan";
import MealRecipeModal from "../components/MealRecipeModal";
import CollapsibleCard from "../components/CollapsibleCard";

const PROTEIN_ADDS = [
  { label: "🐟 דג", grams: 25 },
  { label: "🥚 2 ביצים", grams: 12 },
  { label: "🧈 טופו", grams: 15 },
  { label: "🥣 יוגורט / קוטג'", grams: 15 },
];

const WATER_GOAL_CUPS = 8;

export default function Nutrition() {
  const { proteinGoal } = useCabin();
  const today = useToday();
  const { todayPlan, activeNutritionDayName, isCustomDayChosen } =
    useDailyPlan();

  const [activeRecipeMeal, setActiveRecipeMeal] = useState(null);

  const protein = today.protein ?? 0;
  const meals = today.meals ?? 0;
  const waterCups = today.water ?? 0;
  const eatenMeals = today.eatenMeals ?? [];

  const pct = Math.min(100, Math.round((protein / proteinGoal) * 100));

  const handleToggleMealEaten = (mealKey, proteinGrams) => {
    const isEaten = eatenMeals.includes(mealKey);
    const updatedEaten = isEaten
      ? eatenMeals.filter((m) => m !== mealKey)
      : [...eatenMeals, mealKey];

    const proteinDelta = isEaten ? -proteinGrams : proteinGrams;
    const newProtein = Math.max(0, protein + proteinDelta);
    const mealDelta = isEaten ? -1 : 1;
    const newMeals = Math.max(0, meals + mealDelta);

    updateToday(
      {
        protein: newProtein,
        meals: newMeals,
        eatenMeals: updatedEaten,
      },
      isEaten ? -5 : 5,
    );
  };

  const handleSetWater = (cupIndex) => {
    const targetCups = cupIndex + 1;
    const nextWater = waterCups === targetCups ? cupIndex : targetCups;
    const rewardCoins =
      nextWater === WATER_GOAL_CUPS && waterCups < WATER_GOAL_CUPS ? 5 : 0;
    updateToday({ water: nextWater }, rewardCoins);
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* 1. מד חלבון יומי (Collapsible) */}
      <CollapsibleCard
        id="nutrition-protein-bar"
        title="מד חלבון יומי"
        badge={`${protein} / ${proteinGoal} גרם (${pct}%)`}
        icon={Beef}
        defaultOpen={true}
      >
        <div className="space-y-3">
          <div
            className="h-3.5 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-l from-mint to-lilac transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-purple-200">
            {protein} / {proteinGoal} גרם{" "}
            {pct >= 100
              ? "— הגעת ליעד! 🎉"
              : "• שומר על שובע ואיזון סוכר ב-PCOS"}
          </p>

          {/* Quick protein buttons */}
          <div className="flex gap-2">
            {PROTEIN_ADDS.map(({ label, grams }) => (
              <button
                key={label}
                onClick={() => updateToday({ protein: protein + grams })}
                className="flex-1 rounded-2xl bg-white/5 py-2 text-xs text-moon transition active:scale-95 hover:bg-white/10"
              >
                {label}
                <span className="block text-[10px] text-purple-300">
                  +{grams}ג׳
                </span>
              </button>
            ))}
          </div>
        </div>
      </CollapsibleCard>

      {/* 2. מעקב שתיית מים וחליטות (Hydration Tracker - Collapsible) */}
      <CollapsibleCard
        id="nutrition-water"
        title="שתיית מים וחליטות מאזנות סוכר 💧"
        badge={`${waterCups} / ${WATER_GOAL_CUPS} כוסות (2 ליטר)`}
        icon={Droplets}
        defaultOpen={true}
      >
        <div className="space-y-3">
          {/* 8 Water Cup Bubbles */}
          <div className="grid grid-cols-8 gap-2 pt-1">
            {Array.from({ length: WATER_GOAL_CUPS }).map((_, i) => {
              const isFilled = i < waterCups;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSetWater(i)}
                  aria-label={`כוס מים ${i + 1}`}
                  className={`flex flex-col items-center justify-center rounded-2xl py-2.5 transition active:scale-90 ${
                    isFilled
                      ? "bg-sky-400/25 border border-sky-400 text-sky-300 shadow-md shadow-sky-400/20"
                      : "bg-white/5 border border-white/10 text-purple-400 hover:bg-white/10"
                  }`}
                >
                  <GlassWater
                    className={`h-4 w-4 ${isFilled ? "animate-bounce" : ""}`}
                  />
                  <span className="text-[10px] mt-1 font-mono">{i + 1}</span>
                </button>
              );
            })}
          </div>

          {waterCups >= WATER_GOAL_CUPS && (
            <div className="flex items-center gap-1.5 text-xs text-mint font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>הגעת ליעד השתייה היומי! שתית 2 ליטר מלאים 🎉 (+5 🪙)</span>
            </div>
          )}
        </div>
      </CollapsibleCard>

      {/* 3. ארוחות היום (או התפריט שנבחר מה-Meal Prep) */}
      {todayPlan && todayPlan.nutrition && (
        <CollapsibleCard
          id="nutrition-daily-meals"
          title={`ארוחות יום ${activeNutritionDayName} 🍽️`}
          badge={
            isCustomDayChosen
              ? `תפריט מותאם אישית (נבחר מ-Meal Prep)`
              : `יעד: ${todayPlan.nutrition.targetProteinGrams}ג׳ חלבון`
          }
          icon={Calendar}
          defaultOpen={true}
        >
          <div className="space-y-3.5">
            {isCustomDayChosen && (
              <div className="flex items-center justify-between rounded-xl bg-lilac/15 border border-lilac/30 p-2.5 text-xs text-lilac">
                <span>
                  מוצג כעת תפריט יום <strong>{activeNutritionDayName}</strong>{" "}
                  לבקשתך
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCabin((s) => ({ ...s, customMealPlanDay: null }))
                  }
                  className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] text-moon hover:bg-white/15"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>חזור לתפריט היום</span>
                </button>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* Breakfast */}
              {todayPlan.nutrition.meals.breakfast && (
                <div
                  className={`rounded-2xl border p-3.5 space-y-2.5 transition ${
                    eatenMeals.includes("today-breakfast")
                      ? "border-mint/50 bg-mint/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blush text-sm">
                      בוקר: {todayPlan.nutrition.meals.breakfast.name}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-mint">
                      +{todayPlan.nutrition.meals.breakfast.proteinGrams}ג׳
                      חלבון
                    </span>
                  </div>
                  <p className="text-purple-200 text-xs">
                    {todayPlan.nutrition.meals.breakfast.notes}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleMealEaten(
                          "today-breakfast",
                          todayPlan.nutrition.meals.breakfast.proteinGrams,
                        )
                      }
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                        eatenMeals.includes("today-breakfast")
                          ? "bg-mint text-space shadow-sm shadow-mint/20"
                          : "bg-white/10 text-moon hover:bg-white/15"
                      }`}
                    >
                      {eatenMeals.includes("today-breakfast") ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>אכלתי!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-mint" />
                          <span>
                            סמן כאכול (+
                            {todayPlan.nutrition.meals.breakfast.proteinGrams}ג׳
                            חלבון +5 🪙)
                          </span>
                        </>
                      )}
                    </button>

                    {todayPlan.nutrition.meals.breakfast.recipe && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveRecipeMeal(
                            todayPlan.nutrition.meals.breakfast,
                          )
                        }
                        className="flex items-center gap-1.5 rounded-xl border border-lilac/30 bg-lilac/10 px-3 py-1.5 text-xs font-semibold text-lilac hover:bg-lilac/20 transition active:scale-95"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>מתכון</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Lunch */}
              {todayPlan.nutrition.meals.lunch && (
                <div
                  className={`rounded-2xl border p-3.5 space-y-2.5 transition ${
                    eatenMeals.includes("today-lunch")
                      ? "border-mint/50 bg-mint/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lilac text-sm">
                      צהריים: {todayPlan.nutrition.meals.lunch.name}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-mint">
                      +{todayPlan.nutrition.meals.lunch.proteinGrams}ג׳ חלבון
                    </span>
                  </div>
                  <p className="text-purple-200 text-xs">
                    {todayPlan.nutrition.meals.lunch.notes}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleMealEaten(
                          "today-lunch",
                          todayPlan.nutrition.meals.lunch.proteinGrams,
                        )
                      }
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                        eatenMeals.includes("today-lunch")
                          ? "bg-mint text-space shadow-sm shadow-mint/20"
                          : "bg-white/10 text-moon hover:bg-white/15"
                      }`}
                    >
                      {eatenMeals.includes("today-lunch") ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>אכלתי!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-mint" />
                          <span>
                            סמן כאכול (+
                            {todayPlan.nutrition.meals.lunch.proteinGrams}ג׳
                            חלבון +5 🪙)
                          </span>
                        </>
                      )}
                    </button>

                    {todayPlan.nutrition.meals.lunch.recipe && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveRecipeMeal(todayPlan.nutrition.meals.lunch)
                        }
                        className="flex items-center gap-1.5 rounded-xl border border-lilac/30 bg-lilac/10 px-3 py-1.5 text-xs font-semibold text-lilac hover:bg-lilac/20 transition active:scale-95"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>מתכון</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Dinner */}
              {todayPlan.nutrition.meals.dinner && (
                <div
                  className={`rounded-2xl border p-3.5 space-y-2.5 transition ${
                    eatenMeals.includes("today-dinner")
                      ? "border-mint/50 bg-mint/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-moon text-sm">
                      ערב: {todayPlan.nutrition.meals.dinner.name}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-mint">
                      +{todayPlan.nutrition.meals.dinner.proteinGrams}ג׳ חלבון
                    </span>
                  </div>
                  <p className="text-purple-200 text-xs">
                    {todayPlan.nutrition.meals.dinner.notes}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleMealEaten(
                          "today-dinner",
                          todayPlan.nutrition.meals.dinner.proteinGrams,
                        )
                      }
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                        eatenMeals.includes("today-dinner")
                          ? "bg-mint text-space shadow-sm shadow-mint/20"
                          : "bg-white/10 text-moon hover:bg-white/15"
                      }`}
                    >
                      {eatenMeals.includes("today-dinner") ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>אכלתי!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-mint" />
                          <span>
                            סמן כאכול (+
                            {todayPlan.nutrition.meals.dinner.proteinGrams}ג׳
                            חלבון +5 🪙)
                          </span>
                        </>
                      )}
                    </button>

                    {todayPlan.nutrition.meals.dinner.recipe && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveRecipeMeal(todayPlan.nutrition.meals.dinner)
                        }
                        className="flex items-center gap-1.5 rounded-xl border border-lilac/30 bg-lilac/10 px-3 py-1.5 text-xs font-semibold text-lilac hover:bg-lilac/20 transition active:scale-95"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>מתכון</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Snack */}
              {todayPlan.nutrition.meals.snack && (
                <div
                  className={`rounded-2xl border p-3.5 space-y-2.5 transition ${
                    eatenMeals.includes("today-snack")
                      ? "border-mint/50 bg-mint/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 text-sm">
                      נשנוש: {todayPlan.nutrition.meals.snack.name}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-mint">
                      +{todayPlan.nutrition.meals.snack.proteinGrams}ג׳ חלבון
                    </span>
                  </div>
                  <p className="text-purple-200 text-xs">
                    {todayPlan.nutrition.meals.snack.notes}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleMealEaten(
                          "today-snack",
                          todayPlan.nutrition.meals.snack.proteinGrams,
                        )
                      }
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                        eatenMeals.includes("today-snack")
                          ? "bg-mint text-space shadow-sm shadow-mint/20"
                          : "bg-white/10 text-moon hover:bg-white/15"
                      }`}
                    >
                      {eatenMeals.includes("today-snack") ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>נאכל!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-mint" />
                          <span>
                            סמן כאכול (+
                            {todayPlan.nutrition.meals.snack.proteinGrams}ג׳)
                          </span>
                        </>
                      )}
                    </button>

                    {todayPlan.nutrition.meals.snack.recipe && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveRecipeMeal(todayPlan.nutrition.meals.snack)
                        }
                        className="flex items-center gap-1.5 rounded-xl border border-lilac/30 bg-lilac/10 px-3 py-1.5 text-xs font-semibold text-lilac hover:bg-lilac/20 transition active:scale-95"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>מתכון</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CollapsibleCard>
      )}

      {/* 4. שמירה מצרבות (3 שעות לפני שינה - Collapsible) */}
      <CollapsibleCard
        id="nutrition-reflux"
        title="שגרת ערב בריאה (הגנה מצרבות)"
        badge={today.earlyDinner ? "הושלם בהצלחה ✨" : "3 שעות לפני שינה"}
        icon={Trophy}
        defaultOpen={true}
      >
        <button
          aria-pressed={!!today.earlyDinner}
          onClick={() =>
            updateToday(
              { earlyDinner: !today.earlyDinner },
              today.earlyDinner ? -10 : 10,
            )
          }
          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-right text-xs transition ${
            today.earlyDinner
              ? "bg-mint/15 text-mint border border-mint/40"
              : "bg-white/5 text-purple-200"
          }`}
        >
          <span>
            סיימתי ארוחת ערב 3 שעות לפני השינה
            <span className="block text-[11px] opacity-70">
              שומר מצרבת וריפלוקס • +10 מטבעות
            </span>
          </span>
          <span className="text-lg">{today.earlyDinner ? "✅" : "⬜"}</span>
        </button>
      </CollapsibleCard>

      {/* Modal with exact recipe and cooking timer */}
      <MealRecipeModal
        meal={activeRecipeMeal}
        onClose={() => setActiveRecipeMeal(null)}
      />
    </div>
  );
}
