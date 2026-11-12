import { useState } from "react";
import {
  Beef,
  Flame,
  Trophy,
  Droplets,
  GlassWater,
  CheckCircle2,
  Calendar,
  Check,
  BookOpen,
  Sparkles,
  RotateCcw,
  Edit3,
} from "lucide-react";
import { updateToday, useCabin, useToday, setCabin } from "../store";
import { useDailyPlan } from "../hooks/useDailyPlan";
import MealRecipeModal from "../components/MealRecipeModal";
import CollapsibleCard from "../components/CollapsibleCard";
import CustomFoodLoggerModal from "../components/CustomFoodLoggerModal";
import SweetBank from "../components/SweetBank";

const PROTEIN_ADDS = [
  { label: "🐟 דג", grams: 25 },
  { label: "🥚 2 ביצים", grams: 12 },
  { label: "🧈 טופו", grams: 15 },
  { label: "🥣 יוגורט / קוטג'", grams: 15 },
];

const WATER_GOAL_CUPS = 8;

const MEAL_SLOTS = [
  { key: "breakfast", label: "בוקר", color: "text-blush" },
  { key: "morningSnack", label: "ביניים בוקר", color: "text-mint" },
  { key: "lunch", label: "צהריים", color: "text-lilac" },
  { key: "afternoonSnack", label: "ביניים אחה״צ", color: "text-sky-300" },
  { key: "dinner", label: "ערב", color: "text-moon" },
];

export default function Nutrition() {
  const { proteinGoal = 110, calorieGoal = 1650 } = useCabin();
  const today = useToday();
  const { todayPlan, activeNutritionDayName, isCustomDayChosen } =
    useDailyPlan();

  const [activeRecipeMeal, setActiveRecipeMeal] = useState(null);
  const [customLoggerSlot, setCustomLoggerSlot] = useState(null);

  const protein = today.protein ?? 0;
  const calories = today.calories ?? 0;
  const meals = today.meals ?? 0;
  const waterCups = today.water ?? 0;
  const eatenMeals = today.eatenMeals ?? [];
  const customMeals = today.customMeals ?? {}; // { [slotKey]: { name, calories, protein } }

  const proteinPct = Math.min(100, Math.round((protein / proteinGoal) * 100));
  const caloriePct = Math.min(100, Math.round((calories / calorieGoal) * 100));

  // Toggle planned meal check-off
  const handleTogglePlannedMeal = (slotKey, mealCalories, mealProtein) => {
    const isEaten = eatenMeals.includes(slotKey);
    const updatedEaten = isEaten
      ? eatenMeals.filter((m) => m !== slotKey)
      : [...eatenMeals, slotKey];

    const proteinDelta = isEaten ? -mealProtein : mealProtein;
    const calorieDelta = isEaten ? -mealCalories : mealCalories;
    const newProtein = Math.max(0, protein + proteinDelta);
    const newCalories = Math.max(0, calories + calorieDelta);
    const mealDelta = isEaten ? -1 : 1;
    const newMeals = Math.max(0, meals + mealDelta);

    updateToday(
      {
        protein: newProtein,
        calories: newCalories,
        meals: newMeals,
        eatenMeals: updatedEaten,
      },
      isEaten ? -5 : 5,
    );
  };

  // Save custom meal deviation for a slot
  const handleSaveCustomMeal = (slotKey, customData) => {
    // If slot had a planned meal or previous custom meal, subtract it first
    const wasPlannedEaten = eatenMeals.includes(slotKey);
    const existingCustom = customMeals[slotKey];

    let currentCal = calories;
    let currentProt = protein;

    if (wasPlannedEaten && todayPlan?.nutrition?.meals?.[slotKey]) {
      const pm = todayPlan.nutrition.meals[slotKey];
      currentCal -= pm.calories ?? 0;
      currentProt -= pm.proteinGrams ?? 0;
    } else if (existingCustom) {
      currentCal -= existingCustom.calories ?? 0;
      currentProt -= existingCustom.proteinGrams ?? 0;
    }

    const nextCalories = Math.max(0, currentCal + customData.calories);
    const nextProtein = Math.max(0, currentProt + customData.proteinGrams);
    const updatedEaten = wasPlannedEaten
      ? eatenMeals.filter((m) => m !== slotKey)
      : eatenMeals;

    updateToday(
      {
        calories: nextCalories,
        protein: nextProtein,
        eatenMeals: updatedEaten,
        customMeals: {
          ...customMeals,
          [slotKey]: customData,
        },
      },
      existingCustom ? 0 : 5,
    );
  };

  const handleRemoveCustomMeal = (slotKey) => {
    const existing = customMeals[slotKey];
    if (!existing) return;

    const nextCalories = Math.max(0, calories - (existing.calories ?? 0));
    const nextProtein = Math.max(0, protein - (existing.proteinGrams ?? 0));
    const nextCustom = { ...customMeals };
    delete nextCustom[slotKey];

    updateToday(
      {
        calories: nextCalories,
        protein: nextProtein,
        customMeals: nextCustom,
      },
      -5,
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
      {/* 1. Nutrition Dashboard: Calories & Protein Progress Bars */}
      <CollapsibleCard
        id="nutrition-protein-bar"
        title="דשבורד תזונה יומי ומדדים"
        badge={`${calories} קק״ל • ${protein}ג׳ חלבון`}
        icon={Flame}
        defaultOpen={true}
      >
        <div className="space-y-3.5">
          {/* Calories Progress Bar (Goal: 1600 - 1700 kcal) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blush flex items-center gap-1.5">
                <Flame className="h-4 w-4" />
                <span>מד קלוריות יומי</span>
              </span>
              <span className="text-purple-200">
                <strong>{calories}</strong> / {calorieGoal} קק״ל (יעד 1600-1700)
              </span>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuenow={caloriePct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  caloriePct >= 100
                    ? "bg-gradient-to-l from-blush to-lilac"
                    : "bg-gradient-to-l from-orange-400 to-blush"
                }`}
                style={{ width: `${caloriePct}%` }}
              />
            </div>
          </div>

          {/* Protein Progress Bar (Goal: 100g - 120g) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-mint flex items-center gap-1.5">
                <Beef className="h-4 w-4" />
                <span>מד חלבון יומי</span>
              </span>
              <span className="text-purple-200">
                <strong>{protein}</strong> / {proteinGoal} גרם (יעד 100-120ג׳)
              </span>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuenow={proteinPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-gradient-to-l from-mint to-lilac transition-all duration-300"
                style={{ width: `${proteinPct}%` }}
              />
            </div>
            <p className="text-[11px] text-purple-300 pt-0.5">
              {proteinPct >= 100
                ? "הגעת ליעד החלבון הגבוה! 🎉 שומר על מסת שריר וממתן אינסולין ב-PCOS"
                : "חלבון ושומן בריא בכל ארוחה מאטים ספיגת סוכר ומאזנים את התיאבון"}
            </p>
          </div>

          {/* Quick protein buttons */}
          <div className="border-t border-white/10 pt-2.5">
            <span className="text-[11px] text-purple-300 block mb-1.5">
              הוספה מהירה של חלבון:
            </span>
            <div className="flex gap-2">
              {PROTEIN_ADDS.map(({ label, grams }) => (
                <button
                  key={label}
                  type="button"
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
        </div>
      </CollapsibleCard>

      {/* 2. קופת המתוקים ואתגר התזמון (Sugar Reduction & Sweet Bank) */}
      <CollapsibleCard
        id="nutrition-sweet-bank"
        title="קופת המתוקים ואתגר התזמון 🍪"
        badge="תקציב 4 אסימונים שבועי • מגן הגלוקוז"
        icon={Sparkles}
        defaultOpen={true}
      >
        <SweetBank />
      </CollapsibleCard>

      {/* 3. מעקב שתיית מים וחליטות (Hydration Tracker) */}
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

      {/* 3. ארוחות היום + יומן אכילה חריגה (Custom Food Logger) */}
      {todayPlan && todayPlan.nutrition && (
        <CollapsibleCard
          id="nutrition-daily-meals"
          title={`ארוחות יום ${activeNutritionDayName} (5 ארוחות)`}
          badge={
            isCustomDayChosen
              ? `תפריט מותאם אישית מ-Meal Prep`
              : `יעד מחושב: ${todayPlan.nutrition.targetCalories} קק״ל • ${todayPlan.nutrition.targetProteinGrams}ג׳ חלבון`
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
              {MEAL_SLOTS.map(({ key: slotKey, label: slotLabel, color }) => {
                const plannedMeal = todayPlan.nutrition.meals?.[slotKey];
                const isPlannedEaten = eatenMeals.includes(slotKey);
                const customMeal = customMeals[slotKey];

                if (!plannedMeal) return null;

                const cals = plannedMeal.calories ?? 0;
                const prot = plannedMeal.proteinGrams ?? 0;

                return (
                  <div
                    key={slotKey}
                    className={`rounded-2xl border p-3.5 space-y-2.5 transition ${
                      customMeal
                        ? "border-lilac/50 bg-lilac/10"
                        : isPlannedEaten
                          ? "border-mint/50 bg-mint/10"
                          : "border-white/10 bg-white/5"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm ${color}`}>
                        {slotLabel}:{" "}
                        {customMeal ? customMeal.customName : plannedMeal.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-moon">
                          {customMeal ? customMeal.calories : cals} קק״ל
                        </span>
                        <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[11px] font-bold text-mint">
                          +{customMeal ? customMeal.proteinGrams : prot}ג׳ חלבון
                        </span>
                      </div>
                    </div>

                    {/* Notes / deviation details */}
                    {customMeal ? (
                      <div className="flex items-center justify-between rounded-xl bg-white/5 px-2.5 py-1.5 text-[11px] text-purple-200">
                        <span>✨ נרשמה ארוחה מותאמת אישית</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomMeal(slotKey)}
                          className="text-blush hover:underline"
                        >
                          הסר וחזור לתפריט המקורי
                        </button>
                      </div>
                    ) : (
                      <p className="text-purple-200 text-xs">
                        {plannedMeal.notes}
                      </p>
                    )}

                    {/* Action Buttons: Check off planned OR Add custom meal */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {!customMeal && (
                        <button
                          type="button"
                          onClick={() =>
                            handleTogglePlannedMeal(slotKey, cals, prot)
                          }
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                            isPlannedEaten
                              ? "bg-mint text-space shadow-sm shadow-mint/20"
                              : "bg-white/10 text-moon hover:bg-white/15"
                          }`}
                        >
                          {isPlannedEaten ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>
                                אכלתי לפי התוכנית! (+{cals} קק״ל, +{prot}ג׳)
                              </span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5 text-mint" />
                              <span>סמן שאכלתי לפי התוכנית (+5 🪙)</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Custom food logger trigger */}
                      <button
                        type="button"
                        onClick={() =>
                          setCustomLoggerSlot({
                            key: slotKey,
                            label: slotLabel,
                          })
                        }
                        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
                          customMeal
                            ? "border-lilac bg-lilac text-space font-bold"
                            : "border-white/15 bg-white/5 text-purple-200 hover:bg-white/10"
                        }`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>
                          {customMeal ? "ערוך ארוחה מותאמת" : "אכלתי משהו אחר"}
                        </span>
                      </button>

                      {/* Recipe modal trigger */}
                      {plannedMeal.recipe && !customMeal && (
                        <button
                          type="button"
                          onClick={() => setActiveRecipeMeal(plannedMeal)}
                          className="flex items-center gap-1.5 rounded-xl border border-lilac/30 bg-lilac/10 px-2.5 py-1.5 text-xs font-semibold text-lilac hover:bg-lilac/20 transition active:scale-95"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>מתכון</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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

      {/* Custom Food Logger Modal */}
      <CustomFoodLoggerModal
        isOpen={!!customLoggerSlot}
        mealSlotTitle={customLoggerSlot ? customLoggerSlot.label : ""}
        onClose={() => setCustomLoggerSlot(null)}
        onSaveCustomMeal={(data) => {
          if (customLoggerSlot) {
            handleSaveCustomMeal(customLoggerSlot.key, data);
          }
        }}
      />
    </div>
  );
}
