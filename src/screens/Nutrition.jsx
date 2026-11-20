import {
  Beef,
  Flame,
  Trophy,
  Droplets,
  GlassWater,
  CheckCircle2,
  Sparkles,
  Undo2,
} from "lucide-react";
import { updateToday, useCabin, useToday } from "../store";
import CollapsibleCard from "../components/CollapsibleCard";
import SweetBank from "../components/SweetBank";

const PROTEIN_ADDS = [
  { label: "🐟 דג", grams: 25 },
  { label: "🥚 2 ביצים", grams: 12 },
  { label: "🧈 טופו", grams: 15 },
  { label: "🥣 יוגורט / קוטג'", grams: 15 },
];

const WATER_GOAL_CUPS = 8;

export default function Nutrition() {
  const { proteinGoal = 110, calorieGoal = 1650 } = useCabin();
  const today = useToday();

  const protein = today.protein ?? 0;
  const calories = today.calories ?? 0;
  const waterCups = today.water ?? 0;

  const proteinPct = Math.min(100, Math.round((protein / proteinGoal) * 100));
  const caloriePct = Math.min(100, Math.round((calories / calorieGoal) * 100));


  // Quick protein adds are logged per day so the last one can be undone.
  const quickProtein = today.quickProtein ?? [];
  const handleQuickProtein = (grams) =>
    updateToday({
      protein: protein + grams,
      quickProtein: [...quickProtein, grams],
    });
  const handleUndoQuickProtein = () => {
    if (!quickProtein.length) return;
    const last = quickProtein[quickProtein.length - 1];
    updateToday({
      protein: Math.max(0, protein - last),
      quickProtein: quickProtein.slice(0, -1),
    });
  };

  const handleSetWater = (cupIndex) => {
    const targetCups = cupIndex + 1;
    const nextWater = waterCups === targetCups ? cupIndex : targetCups;
    const rewardCoins =
      nextWater === WATER_GOAL_CUPS && waterCups < WATER_GOAL_CUPS ? 2 : 0;
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
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-purple-300">
                הוספה מהירה של חלבון:
              </span>
              {quickProtein.length > 0 && (
                <button
                  type="button"
                  onClick={handleUndoQuickProtein}
                  className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-moon"
                >
                  <Undo2 className="h-3 w-3" />
                  <span>
                    ביטול +{quickProtein[quickProtein.length - 1]}ג׳ אחרון
                  </span>
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {PROTEIN_ADDS.map(({ label, grams }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuickProtein(grams)}
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
              <span>הגעת ליעד השתייה היומי! שתית 2 ליטר מלאים 🎉 (+2 🪙)</span>
            </div>
          )}
        </div>
      </CollapsibleCard>

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
              today.earlyDinner ? -4 : 4,
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
              שומר מצרבת וריפלוקס • +4 מטבעות
            </span>
          </span>
          <span className="text-lg">{today.earlyDinner ? "✅" : "⬜"}</span>
        </button>
      </CollapsibleCard>
    </div>
  );
}
