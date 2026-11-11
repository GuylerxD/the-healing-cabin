import { useState, useEffect } from "react";
import {
  ChefHat,
  Clock,
  Timer,
  ShoppingBag,
  Sparkles,
  X,
  Check,
  Flame,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { setCabin } from "../store";

export default function MealRecipeModal({ meal, onClose }) {
  const recipe = meal?.recipe;
  const initialSeconds = (recipe?.timerMinutes || 0) * 60;

  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(initialSeconds);
  const [addedToCartToast, setAddedToCartToast] = useState(false);

  // Cooking timer countdown
  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  if (!meal || !recipe) return null;

  const toggleCheck = (idx) => {
    setCheckedIngredients((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const handleAddAllToGroceries = () => {
    // Add ingredients to inventory as items to buy
    setCabin((s) => {
      const current = s.inventory || [];
      const cleanItems = recipe.ingredients.map((item) => {
        return item
          .replace(
            /^\d+[/\d]*\s*(כוס|גביע|כפות|כף|כפית|גרם|פרוסה|פרוסות|ביצי|ביצה)?\s*/i,
            "",
          )
          .trim();
      });
      const newInventory = current.filter((item) => !cleanItems.includes(item));
      return { ...s, inventory: newInventory };
    });
    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 2500);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-space-light/95 p-6 shadow-2xl backdrop-blur-xl text-right space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/10 text-purple-300 hover:text-moon transition active:scale-95"
          aria-label="סגור מתכון"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Meal Header */}
        <div className="flex items-start gap-3 pt-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mint to-teal-500 text-space shadow-lg shadow-mint/25">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-mint tracking-wider uppercase">
              מתכון מדויק לארוחה
            </span>
            <h3 className="text-base font-bold text-moon leading-snug">
              {meal.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-purple-300">
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5">
                <Clock className="h-3 w-3 text-mint" />
                <span>{recipe.prepTime}</span>
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5">
                <Flame className="h-3 w-3 text-blush" />
                <span>{recipe.method}</span>
              </span>
              <span className="rounded-full bg-mint/15 px-2.5 py-0.5 font-bold text-mint">
                +{meal.proteinGrams}ג׳ חלבון
              </span>
            </div>
          </div>
        </div>

        {/* Built-in Cooking Timer (if recipe has timer minutes) */}
        {recipe.timerMinutes > 0 && (
          <div className="flex items-center justify-between rounded-2xl bg-white/5 p-3.5 border border-white/10 text-xs">
            <div className="flex items-center gap-2.5">
              <Timer className="h-5 w-5 text-mint" />
              <div>
                <span className="block text-[11px] text-purple-300">
                  טיימר בישול ({recipe.timerMinutes} דק׳)
                </span>
                <span className="font-mono text-base font-bold text-mint">
                  {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTimerRunning(!timerRunning)}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 font-bold text-xs transition active:scale-95 ${
                  timerRunning
                    ? "bg-blush text-space"
                    : timerSeconds === 0
                      ? "bg-mint text-space"
                      : "bg-white/15 text-moon hover:bg-white/20"
                }`}
              >
                {timerRunning ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                <span>
                  {timerRunning
                    ? "השהה"
                    : timerSeconds === 0
                      ? "הסתיים! 🎉"
                      : "התחל טיימר"}
                </span>
              </button>
              {timerSeconds < recipe.timerMinutes * 60 && (
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(recipe.timerMinutes * 60);
                  }}
                  className="p-1.5 rounded-xl bg-white/5 text-purple-300 hover:text-moon"
                  title="איפוס טיימר"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Exact Ingredients Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-moon flex items-center gap-1.5">
              <span>מצרכים וכמויות מדויקות:</span>
            </h4>
            <span className="text-[10px] text-purple-300">
              סמני מה שיש בסיר/קערה
            </span>
          </div>

          <div className="space-y-1.5">
            {recipe.ingredients.map((ing, idx) => {
              const isChecked = checkedIngredients.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleCheck(idx)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition text-right ${
                    isChecked
                      ? "bg-mint/15 text-mint border border-mint/30 line-through opacity-80"
                      : "bg-white/5 text-moon border border-white/5 hover:bg-white/10"
                  }`}
                >
                  <span>{ing}</span>
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border ${
                      isChecked
                        ? "bg-mint border-mint text-space"
                        : "border-white/20"
                    }`}
                  >
                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddAllToGroceries}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-lilac/30 bg-lilac/10 py-2 text-xs font-semibold text-lilac hover:bg-lilac/20 transition active:scale-95"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>סנכרן מצרכי מתכון זה לרשימת הקניות החסרה</span>
          </button>
          {addedToCartToast && (
            <div className="rounded-xl bg-mint/20 p-2 text-center text-[11px] text-mint font-bold animate-pulse">
              הרכיבים נוספו בהצלחה לרשימת הקניות של השבוע! ✨
            </div>
          )}
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-2 pt-1 border-t border-white/10">
          <h4 className="font-bold text-xs text-moon">
            שלבי הכנה פשוטים (בלי בלגן):
          </h4>
          <ol className="space-y-2 text-xs">
            {recipe.steps.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl bg-white/[0.03] p-2.5 border border-white/5"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/20 text-[11px] font-bold text-mint">
                  {idx + 1}
                </span>
                <span className="text-purple-100 leading-relaxed text-[11.5px] pt-0.5">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Health & Acid Reflux Tip */}
        {recipe.acidPcosTip && (
          <div className="flex items-start gap-2 rounded-2xl bg-blush/10 p-3 border border-blush/30 text-xs">
            <Sparkles className="h-4 w-4 shrink-0 text-blush mt-0.5" />
            <div className="text-purple-200 text-[11px] leading-relaxed">
              <strong className="text-blush block mb-0.5">
                טיפ ריפוי ל-PCOS וחומציות:
              </strong>
              {recipe.acidPcosTip}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
