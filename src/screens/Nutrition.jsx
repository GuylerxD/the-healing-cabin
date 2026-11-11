import { useState } from "react";
import {
  Beef,
  ShoppingBasket,
  Trophy,
  Sparkles,
  Droplets,
  GlassWater,
  CheckCircle2,
  Calendar,
  Check,
  BookOpen,
  ChefHat,
} from "lucide-react";
import { setCabin, updateToday, useCabin, useToday } from "../store";
import { useDailyPlan } from "../hooks/useDailyPlan";
import MealRecipeModal from "../components/MealRecipeModal";

const PROTEIN_ADDS = [
  { label: "🐟 דג", grams: 25 },
  { label: "🥚 2 ביצים", grams: 12 },
  { label: "🧈 טופו", grams: 15 },
  { label: "🥣 יוגורט / קוטג'", grams: 15 },
];

const WEEKLY_GROCERY_CATEGORIES = [
  {
    category: "דגים וחלבונים 🐟",
    items: [
      "פילה סלמון",
      "פילה אמנון",
      "טופו קשה",
      "גבינת קוטג' 5%",
      "ביצים",
      "טונה במים",
      "יוגורט מועשר בחלבון",
      "עדשים כתומות",
    ],
  },
  {
    category: "פחמימות מורכבות 🌾",
    items: [
      "קינואה",
      "קמח תירס (פולנטה)",
      "שיבולת שועל עבה",
      "בטטה",
      "תפוחי אדמה",
      "אורז",
      "דפי אורז",
      "לחם מחמצת",
      "קרקר כוסמין",
    ],
  },
  {
    category: "ירקות ופירות מותרים 🥗",
    items: [
      "מלפפונים",
      "זוקיני",
      "עלי תרד",
      "פטריות",
      "עגבניות",
      "אבוקדו",
      "בננה",
    ],
  },
  {
    category: "שמנים, אגוזים ותבלינים 🌰",
    items: [
      "שמן זית כתית מעולה",
      "קינמון ציילוני",
      "זרעי צ'יה",
      "אגוזי מלך",
      "שקדים טבעיים",
      "חלב סויה",
    ],
  },
];

const ALL_GROCERY_ITEMS = WEEKLY_GROCERY_CATEGORIES.flatMap((c) => c.items);
const MAX_MEALS = 3;
const WATER_GOAL_CUPS = 8;

const toggleIn = (list, item) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

const DAYS_SHORT = [
  { idx: 0, label: "א׳", name: "ראשון" },
  { idx: 1, label: "ב׳", name: "שני" },
  { idx: 2, label: "ג׳", name: "שלישי" },
  { idx: 3, label: "ד׳", name: "רביעי" },
  { idx: 4, label: "ה׳", name: "חמישי" },
  { idx: 5, label: "ו׳", name: "שישי" },
  { idx: 6, label: "ש׳", name: "שבת" },
];

export default function Nutrition() {
  const { proteinGoal, inventory } = useCabin();
  const today = useToday();
  const {
    todayIndex,
    selectedPlan,
    selectedDayIndex,
    setSelectedDayIndex,
    isToday,
    dayNameHe,
  } = useDailyPlan();

  const [activeCategory, setActiveCategory] = useState(
    WEEKLY_GROCERY_CATEGORIES[0].category,
  );
  const [activeRecipeMeal, setActiveRecipeMeal] = useState(null);

  const protein = today.protein ?? 0;
  const meals = today.meals ?? 0;
  const waterCups = today.water ?? 0;
  const eatenMeals = today.eatenMeals ?? []; // array of meal IDs/keys e.g. ['breakfast', 'lunch']

  const pct = Math.min(100, Math.round((protein / proteinGoal) * 100));

  const toggleInventory = (item) =>
    setCabin((s) => ({ ...s, inventory: toggleIn(s.inventory || [], item) }));

  // Feature 2: Toggle "Eaten" on meal -> automatically adds/subtracts protein & increments meal count
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
      isEaten ? -5 : 5, // +5 coins reward when logging meal
    );
  };

  // Feature 4: Toggle water cup
  const handleSetWater = (cupIndex) => {
    const targetCups = cupIndex + 1;
    const nextWater = waterCups === targetCups ? cupIndex : targetCups;
    const rewardCoins =
      nextWater === WATER_GOAL_CUPS && waterCups < WATER_GOAL_CUPS ? 5 : 0;
    updateToday({ water: nextWater }, rewardCoins);
  };

  const selectedCategoryItems =
    WEEKLY_GROCERY_CATEGORIES.find((c) => c.category === activeCategory)
      ?.items || [];
  const missingInActiveCategory = selectedCategoryItems.filter(
    (item) => !(inventory || []).includes(item),
  );

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* 1. מד חלבון יומי */}
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
            className="h-full rounded-full bg-gradient-to-l from-mint to-lilac transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-purple-200">
          {protein} / {proteinGoal} גרם{" "}
          {pct >= 100 ? "— הגעת ליעד! 🎉" : "• שומר על שובע ואיזון סוכר ב-PCOS"}
        </p>

        {/* Quick protein buttons */}
        <div className="flex gap-2">
          {PROTEIN_ADDS.map(({ label, grams }) => (
            <button
              key={label}
              onClick={() => updateToday({ protein: protein + grams })}
              className="flex-1 rounded-2xl bg-white/5 py-2 text-xs text-moon transition active:scale-95"
            >
              {label}
              <span className="block text-[10px] text-purple-300">
                +{grams}ג׳
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-purple-300 pt-1">
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
              className="w-16 rounded-xl bg-white/10 px-2 py-1 text-moon text-center"
            />
          </label>
          {protein > 0 && (
            <button
              onClick={() => updateToday({ protein: 0, eatenMeals: [] })}
              className="underline hover:text-blush transition"
            >
              איפוס חלבון
            </button>
          )}
        </div>
      </section>

      {/* 2. מעקב שתיית מים וחליטות מאזנות סוכר (Hydration Tracker) */}
      <section className="glass space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-sky-400" />
            <h2 className="font-bold text-sky-300 text-sm">
              שתיית מים וחליטות מאזנות סוכר 💧
            </h2>
          </div>
          <span className="text-xs text-purple-300">
            {waterCups} / {WATER_GOAL_CUPS} כוסות (2 ליטר)
          </span>
        </div>

        <p className="text-xs text-purple-200">
          חיוני ב-PCOS: שתייה מספקת מונעת עייפות, מאיצה שריפת שומן ומרגיעה
          צרבות.
        </p>

        {/* 8 Interactive Water Cup Bubbles */}
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
      </section>

      {/* 3. תפריט שבועי + מעבר בין ימי השבוע + כפתורי "אכלתי" */}
      {selectedPlan && selectedPlan.nutrition && (
        <section className="glass space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-mint" />
              <h2 className="font-bold text-mint text-sm">
                תפריט שבועי מותאם PCOS 🌱
              </h2>
            </div>
            <span className="rounded-full bg-mint/15 px-2.5 py-0.5 text-[11px] font-bold text-mint">
              פסקטריאני מוקפד
            </span>
          </div>

          {/* Feature 1: Day Selector Bar */}
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1">
            {DAYS_SHORT.map((d) => {
              const isSelected = selectedDayIndex === d.idx;
              const isTodayDay = todayIndex === d.idx;
              return (
                <button
                  key={d.idx}
                  type="button"
                  onClick={() => setSelectedDayIndex(d.idx)}
                  className={`flex flex-1 flex-col items-center justify-center rounded-2xl py-2 text-xs font-bold transition active:scale-95 ${
                    isSelected
                      ? "bg-mint text-space shadow-md shadow-mint/25 scale-105"
                      : "bg-white/5 text-purple-200 hover:bg-white/10"
                  } ${isTodayDay && !isSelected ? "ring-1 ring-blush" : ""}`}
                >
                  <span>{d.label}</span>
                  <span className="text-[9px] font-normal opacity-80">
                    {isTodayDay ? "היום" : d.name.slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl bg-white/5 p-3 text-xs text-purple-200 flex justify-between items-center">
            <span>
              יום {dayNameHe}:{" "}
              <strong>{selectedPlan.nutrition.pcosFocus}</strong>
            </span>
            <span className="font-bold text-mint">
              יעד: {selectedPlan.nutrition.targetProteinGrams}ג׳ חלבון
            </span>
          </div>

          {/* Feature 2: Meal Cards with "אכלתי" Button */}
          <div className="space-y-3 text-xs">
            {/* Breakfast */}
            {selectedPlan.nutrition.meals.breakfast && (
              <div
                className={`rounded-2xl border p-3.5 space-y-2 transition ${
                  eatenMeals.includes(`day-${selectedDayIndex}-breakfast`)
                    ? "border-mint/50 bg-mint/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-blush">
                    <span>ארוחת בוקר:</span>
                    <span>{selectedPlan.nutrition.meals.breakfast.name}</span>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-mint">
                    +{selectedPlan.nutrition.meals.breakfast.proteinGrams}ג׳
                    חלבון
                  </span>
                </div>
                <p className="text-purple-200 text-[11px]">
                  {selectedPlan.nutrition.meals.breakfast.notes}
                </p>

                {/* Meal Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedPlan.nutrition.meals.breakfast.recipe && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveRecipeMeal(
                          selectedPlan.nutrition.meals.breakfast,
                        )
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-lilac/30 bg-lilac/10 px-3 py-1.5 text-xs font-semibold text-lilac hover:bg-lilac/20 transition active:scale-95"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>מתכון והכנה</span>
                    </button>
                  )}

                  {isToday && (
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleMealEaten(
                          `day-${selectedDayIndex}-breakfast`,
                          selectedPlan.nutrition.meals.breakfast.proteinGrams,
                        )
                      }
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                        eatenMeals.includes(`day-${selectedDayIndex}-breakfast`)
                          ? "bg-mint text-space shadow-sm shadow-mint/20"
                          : "bg-white/10 text-moon hover:bg-white/15"
                      }`}
                    >
                      {eatenMeals.includes(
                        `day-${selectedDayIndex}-breakfast`,
                      ) ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>
                            אכלתי! (נוספו{" "}
                            {
                              selectedPlan.nutrition.meals.breakfast
                                .proteinGrams
                            }
                            ג׳ חלבון)
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-mint" />
                          <span>
                            סמן כאכול (+
                            {
                              selectedPlan.nutrition.meals.breakfast
                                .proteinGrams
                            }
                            ג׳ חלבון +5 🪙)
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Lunch */}
            {selectedPlan.nutrition.meals.lunch && (
              <div
                className={`rounded-2xl border p-3.5 space-y-2 transition ${
                  eatenMeals.includes(`day-${selectedDayIndex}-lunch`)
                    ? "border-mint/50 bg-mint/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-lilac">
                    <span>ארוחת צהריים:</span>
                    <span>{selectedPlan.nutrition.meals.lunch.name}</span>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-mint">
                    +{selectedPlan.nutrition.meals.lunch.proteinGrams}ג׳ חלבון
                  </span>
                </div>
                <p className="text-purple-200 text-[11px]">
                  {selectedPlan.nutrition.meals.lunch.notes}
                </p>

                {/* Meal Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedPlan.nutrition.meals.lunch.recipe && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveRecipeMeal(selectedPlan.nutrition.meals.lunch)
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-lilac/30 bg-lilac/10 px-3 py-1.5 text-xs font-semibold text-lilac hover:bg-lilac/20 transition active:scale-95"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>מתכון והכנה</span>
                    </button>
                  )}

                  {isToday && (
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleMealEaten(
                          `day-${selectedDayIndex}-lunch`,
                          selectedPlan.nutrition.meals.lunch.proteinGrams,
                        )
                      }
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                        eatenMeals.includes(`day-${selectedDayIndex}-lunch`)
                          ? "bg-mint text-space shadow-sm shadow-mint/20"
                          : "bg-white/10 text-moon hover:bg-white/15"
                      }`}
                    >
                      {eatenMeals.includes(`day-${selectedDayIndex}-lunch`) ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>
                            אכלתי! (נוספו{" "}
                            {selectedPlan.nutrition.meals.lunch.proteinGrams}ג׳
                            חלבון)
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-mint" />
                          <span>
                            סמן כאכול (+
                            {selectedPlan.nutrition.meals.lunch.proteinGrams}ג׳
                            חלבון +5 🪙)
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Dinner */}
            {selectedPlan.nutrition.meals.dinner && (
              <div
                className={`rounded-2xl border p-3.5 space-y-2 transition ${
                  eatenMeals.includes(`day-${selectedDayIndex}-dinner`)
                    ? "border-mint/50 bg-mint/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-moon">
                    <span>ארוחת ערב:</span>
                    <span>{selectedPlan.nutrition.meals.dinner.name}</span>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-mint">
                    +{selectedPlan.nutrition.meals.dinner.proteinGrams}ג׳ חלבון
                  </span>
                </div>
                <p className="text-purple-200 text-[11px]">
                  {selectedPlan.nutrition.meals.dinner.notes}
                </p>

                {/* Meal Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedPlan.nutrition.meals.dinner.recipe && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveRecipeMeal(selectedPlan.nutrition.meals.dinner)
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-lilac/30 bg-lilac/10 px-3 py-1.5 text-xs font-semibold text-lilac hover:bg-lilac/20 transition active:scale-95"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>מתכון והכנה</span>
                    </button>
                  )}

                  {isToday && (
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleMealEaten(
                          `day-${selectedDayIndex}-dinner`,
                          selectedPlan.nutrition.meals.dinner.proteinGrams,
                        )
                      }
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                        eatenMeals.includes(`day-${selectedDayIndex}-dinner`)
                          ? "bg-mint text-space shadow-sm shadow-mint/20"
                          : "bg-white/10 text-moon hover:bg-white/15"
                      }`}
                    >
                      {eatenMeals.includes(`day-${selectedDayIndex}-dinner`) ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>
                            אכלתי! (נוספו{" "}
                            {selectedPlan.nutrition.meals.dinner.proteinGrams}ג׳
                            חלבון)
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-mint" />
                          <span>
                            סמן כאכול (+
                            {selectedPlan.nutrition.meals.dinner.proteinGrams}ג׳
                            חלבון +5 🪙)
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Snack */}
            {selectedPlan.nutrition.meals.snack && (
              <div
                className={`rounded-2xl border p-3.5 space-y-2 transition ${
                  eatenMeals.includes(`day-${selectedDayIndex}-snack`)
                    ? "border-mint/50 bg-mint/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-purple-300">
                    <span>נשנוש מאזן:</span>
                    <span>{selectedPlan.nutrition.meals.snack.name}</span>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-mint">
                    +{selectedPlan.nutrition.meals.snack.proteinGrams}ג׳ חלבון
                  </span>
                </div>
                <p className="text-purple-200 text-[11px]">
                  {selectedPlan.nutrition.meals.snack.notes}
                </p>

                {/* Meal Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedPlan.nutrition.meals.snack.recipe && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveRecipeMeal(selectedPlan.nutrition.meals.snack)
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-lilac/30 bg-lilac/10 px-3 py-1.5 text-xs font-semibold text-lilac hover:bg-lilac/20 transition active:scale-95"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>מתכון והכנה</span>
                    </button>
                  )}

                  {isToday && (
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleMealEaten(
                          `day-${selectedDayIndex}-snack`,
                          selectedPlan.nutrition.meals.snack.proteinGrams,
                        )
                      }
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                        eatenMeals.includes(`day-${selectedDayIndex}-snack`)
                          ? "bg-mint text-space shadow-sm shadow-mint/20"
                          : "bg-white/10 text-moon hover:bg-white/15"
                      }`}
                    >
                      {eatenMeals.includes(`day-${selectedDayIndex}-snack`) ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>נאכל!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-mint" />
                          <span>
                            סמן כאכול (+
                            {selectedPlan.nutrition.meals.snack.proteinGrams}ג׳)
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-space/60 p-2 text-center text-[11px] text-purple-300">
            🚫 ללא כוסברה • ללא שעועית ירוקה • ללא תורמוס • ללא אדממה
          </div>
        </section>
      )}

      {/* 4. משימות אוכל & שמירה מצרבות */}
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

      {/* 5. סנכרון רשימת קניות שבועית מתוך ה-plansDB האמיתי */}
      <section className="glass space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold text-lilac">
            <ShoppingBasket className="h-5 w-5" aria-hidden /> רשימת קניות
            מסונכרנת לשבוע
          </h2>
          <span className="text-xs text-purple-300">
            {(inventory || []).length} / {ALL_GROCERY_ITEMS.length} יש בבית
          </span>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {WEEKLY_GROCERY_CATEGORIES.map((cat) => (
            <button
              key={cat.category}
              type="button"
              onClick={() => setActiveCategory(cat.category)}
              className={`rounded-2xl px-3 py-1.5 font-semibold shrink-0 transition ${
                activeCategory === cat.category
                  ? "bg-lilac text-space shadow-sm"
                  : "bg-white/5 text-purple-200 hover:bg-white/10"
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Missing items checklist */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-mint">
            מה חסר לקנות ב-{activeCategory}? ({missingInActiveCategory.length})
          </h3>
          {missingInActiveCategory.length === 0 ? (
            <p className="rounded-xl bg-mint/10 p-3 text-xs text-mint">
              הכל מוכן בבית בקטגוריה זו! 🎉
            </p>
          ) : (
            <ul className="space-y-1.5">
              {missingInActiveCategory.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => toggleInventory(item)}
                    className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-2.5 text-xs text-moon hover:bg-white/10 transition"
                  >
                    <span>{item}</span>
                    <span className="flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1 text-[11px] text-mint">
                      <Check className="h-3 w-3" />
                      <span>קניתי / יש בבית</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Toggle what you already have in pantry */}
        <div className="border-t border-white/10 pt-3 space-y-2">
          <h3 className="text-xs font-bold text-purple-200">
            מצרכים שכבר יש במזווה:
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {selectedCategoryItems.map((item) => {
              const have = (inventory || []).includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={have}
                  onClick={() => toggleInventory(item)}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    have
                      ? "bg-mint/20 text-mint border border-mint/40"
                      : "bg-white/5 text-purple-400 opacity-60"
                  }`}
                >
                  {have ? `✔ ${item}` : item}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. בישול מרוכז לסופ״ש (Weekend Meal Prep Guide) */}
      <section className="glass space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-blush" />
            <h2 className="font-bold text-blush text-sm">
              הכנות מרוכזות לסופ״ש (Meal Prep 🍱)
            </h2>
          </div>
          <span className="rounded-full bg-blush/15 px-2.5 py-0.5 text-[10px] font-bold text-blush">
            חוסך 4 שעות בישול בשבוע!
          </span>
        </div>

        <p className="text-xs text-purple-200">
          מתאים ל-ADHD: מכינים 3 עוגנים בסופ&quot;ש, ובאמצע השבוע הארוחות מוכנות
          תוך 5 דקות:
        </p>

        <div className="space-y-2 text-xs">
          <div className="rounded-2xl bg-white/5 p-3 border border-white/5 space-y-1">
            <span className="font-bold text-mint block">
              1. אפיית תבנית מאפינס פולנטה וקוטג' 🧁
            </span>
            <p className="text-purple-300 text-[11.5px]">
              מכינים 6-8 מאפינס לפי המתכון ושומרים בקופסה אטומה במקרר לארוחות
              בוקר של ראשון וחמישי.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-3 border border-white/5 space-y-1">
            <span className="font-bold text-lilac block">
              2. בישול קינואה ואורז בסמטי מראש 🍚
            </span>
            <p className="text-purple-300 text-[11.5px]">
              מבשלים כוס קינואה וכוס אורז בסמטי. מחלקים לקופסאות — מוכן להגשה
              לצד סלמון או טופו.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-3 border border-white/5 space-y-1">
            <span className="font-bold text-moon block">
              3. חיתוך וייבוש קוביות טופו 🍱
            </span>
            <p className="text-purple-300 text-[11.5px]">
              סוחטים נוזלים מחבילת טופו, חותכים לקוביות ושומרים מתובל במקרר —
              ישר לאייר-פרייר!
            </p>
          </div>
        </div>
      </section>

      {/* Modal with exact recipe and cooking timer */}
      <MealRecipeModal
        meal={activeRecipeMeal}
        onClose={() => setActiveRecipeMeal(null)}
      />
    </div>
  );
}
