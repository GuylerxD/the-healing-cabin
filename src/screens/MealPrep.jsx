import { useState } from "react";
import {
  ChefHat,
  ShoppingBasket,
  Calendar,
  BookOpen,
  Check,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { setCabin, useCabin } from "../store";
import { useDailyPlan } from "../hooks/useDailyPlan";
import MealRecipeModal from "../components/MealRecipeModal";
import CollapsibleCard from "../components/CollapsibleCard";

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

const DAYS_SHORT = [
  { idx: 0, label: "א׳", name: "ראשון" },
  { idx: 1, label: "ב׳", name: "שני" },
  { idx: 2, label: "ג׳", name: "שלישי" },
  { idx: 3, label: "ד׳", name: "רביעי" },
  { idx: 4, label: "ה׳", name: "חמישי" },
  { idx: 5, label: "ו׳", name: "שישי" },
  { idx: 6, label: "ש׳", name: "שבת" },
];

const toggleIn = (list, item) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

export default function MealPrep() {
  const { inventory = [] } = useCabin();
  const {
    todayIndex,
    selectedPlan,
    selectedDayIndex,
    setSelectedDayIndex,
    dayNameHe,
  } = useDailyPlan();

  const [activeCategory, setActiveCategory] = useState(
    WEEKLY_GROCERY_CATEGORIES[0].category,
  );
  const [activeRecipeMeal, setActiveRecipeMeal] = useState(null);

  const toggleInventory = (item) =>
    setCabin((s) => ({ ...s, inventory: toggleIn(s.inventory || [], item) }));

  const selectedCategoryItems =
    WEEKLY_GROCERY_CATEGORIES.find((c) => c.category === activeCategory)
      ?.items || [];
  const missingInActiveCategory = selectedCategoryItems.filter(
    (item) => !inventory.includes(item),
  );

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Screen Title Banner */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-mint flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            <span>מרכז Meal Prep ותכנון שבועי</span>
          </h2>
          <p className="text-xs text-purple-300">
            הכנות מראש, רשימת קניות ותפריט לכל ימות השבוע
          </p>
        </div>
        <span className="rounded-full bg-mint/15 px-3 py-1 text-xs font-bold text-mint">
          PCOS & ריפלוקס
        </span>
      </div>

      {/* 1. הכנות מרוכזות לסופ״ש (Collapsible: open by default) */}
      <CollapsibleCard
        title="תוכנית הכנות לסופ״ש (3 עוגני בישול)"
        badge="חוסך 4 שעות בישול במהלך השבוע"
        icon={Flame}
        defaultOpen={true}
        headerClassName="!border-blush/30"
      >
        <div className="space-y-2.5 text-xs">
          <p className="text-purple-200">
            בסופ&quot;ש מקדישים 45 דקות ומכינים 3 בסיסים מובילים. באמצע השבוע
            הארוחות מוכנות בצלחת תוך 5 דקות בלבד:
          </p>

          <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-mint flex items-center gap-1.5">
                <span>1. אפיית תבנית מאפינס פולנטה וקוטג' 🧁</span>
              </span>
              <span className="text-[10px] text-purple-300">20 דק' תנור</span>
            </div>
            <p className="text-purple-300 text-[11.5px] leading-relaxed">
              מכינים 6-8 מאפינס לפי המתכון. שומרים בקופסה אטומה במקרר — מסדר
              ארוחת בוקר חלבונית מרגיעת קיבה לראשון וחמישי.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lilac flex items-center gap-1.5">
                <span>2. בישול כפול של קינואה ואורז בסמטי 🍚</span>
              </span>
              <span className="text-[10px] text-purple-300">15 דק' סיר</span>
            </div>
            <p className="text-purple-300 text-[11.5px] leading-relaxed">
              מבשלים כוס קינואה וכוס אורז בסמטי. מחלקים ל-2 קופסאות במקרר — נשמר
              מצוין 4-5 ימים, מוכן לחימום מהיר לצד דג או טופו.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-moon flex items-center gap-1.5">
                <span>3. חיתוך, ייבוש ותיבול קוביות טופו 🍱</span>
              </span>
              <span className="text-[10px] text-purple-300">5 דק' עבודה</span>
            </div>
            <p className="text-purple-300 text-[11.5px] leading-relaxed">
              סוחטים נוזלים מבלוק טופו קשה, חותכים לקוביות ומתבלים בסויה
              ופפריקה. שומרים במקרר — ישר לאייר פרייר בערב.
            </p>
          </div>
        </div>
      </CollapsibleCard>

      {/* 2. רשימת קניות שבועית מסונכרנת (Collapsible) */}
      <CollapsibleCard
        title="רשימת קניות שבועית חכמה"
        badge={`${inventory.length} מתוך ${ALL_GROCERY_ITEMS.length} מצרכים במזווה`}
        icon={ShoppingBasket}
        defaultOpen={true}
      >
        <div className="space-y-3">
          {/* Category Tabs */}
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
            <h4 className="text-xs font-bold text-mint">
              מה חסר לקנות ב-{activeCategory}? ({missingInActiveCategory.length}
              )
            </h4>
            {missingInActiveCategory.length === 0 ? (
              <p className="rounded-xl bg-mint/10 p-3 text-xs text-mint">
                הכל מוכן במזווה בקטגוריה זו! 🎉
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

          {/* Already have in pantry */}
          <div className="border-t border-white/10 pt-3 space-y-2">
            <h4 className="text-xs font-bold text-purple-200">
              מצרכים שכבר יש בבית:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedCategoryItems.map((item) => {
                const have = inventory.includes(item);
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
        </div>
      </CollapsibleCard>

      {/* 3. תפריט מלא לכל השבוע ולשבוע הבא (Collapsible) */}
      <CollapsibleCard
        title="תפריט מלא לכל ימי השבוע"
        badge={`יום ${dayNameHe} נבחר כעת • לחצי לפתיחה/סגירה`}
        icon={Calendar}
        defaultOpen={true}
      >
        <div className="space-y-3.5">
          {/* Day Selector */}
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

          {/* Meals for Selected Day with Recipe triggers */}
          <div className="space-y-2.5 text-xs">
            {/* Breakfast */}
            {selectedPlan.nutrition.meals.breakfast && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blush">
                    ארוחת בוקר: {selectedPlan.nutrition.meals.breakfast.name}
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-mint">
                    +{selectedPlan.nutrition.meals.breakfast.proteinGrams}ג׳
                    חלבון
                  </span>
                </div>
                <p className="text-purple-200 text-[11px]">
                  {selectedPlan.nutrition.meals.breakfast.notes}
                </p>
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
                    <span>הצג מתכון, כמויות וזמני הכנה</span>
                  </button>
                )}
              </div>
            )}

            {/* Lunch */}
            {selectedPlan.nutrition.meals.lunch && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lilac">
                    ארוחת צהריים: {selectedPlan.nutrition.meals.lunch.name}
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-mint">
                    +{selectedPlan.nutrition.meals.lunch.proteinGrams}ג׳ חלבון
                  </span>
                </div>
                <p className="text-purple-200 text-[11px]">
                  {selectedPlan.nutrition.meals.lunch.notes}
                </p>
                {selectedPlan.nutrition.meals.lunch.recipe && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveRecipeMeal(selectedPlan.nutrition.meals.lunch)
                    }
                    className="flex items-center gap-1.5 rounded-xl border border-lilac/30 bg-lilac/10 px-3 py-1.5 text-xs font-semibold text-lilac hover:bg-lilac/20 transition active:scale-95"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>הצג מתכון, כמויות וזמני הכנה</span>
                  </button>
                )}
              </div>
            )}

            {/* Dinner */}
            {selectedPlan.nutrition.meals.dinner && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-moon">
                    ארוחת ערב: {selectedPlan.nutrition.meals.dinner.name}
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-mint">
                    +{selectedPlan.nutrition.meals.dinner.proteinGrams}ג׳ חלבון
                  </span>
                </div>
                <p className="text-purple-200 text-[11px]">
                  {selectedPlan.nutrition.meals.dinner.notes}
                </p>
                {selectedPlan.nutrition.meals.dinner.recipe && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveRecipeMeal(selectedPlan.nutrition.meals.dinner)
                    }
                    className="flex items-center gap-1.5 rounded-xl border border-lilac/30 bg-lilac/10 px-3 py-1.5 text-xs font-semibold text-lilac hover:bg-lilac/20 transition active:scale-95"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>הצג מתכון, כמויות וזמני הכנה</span>
                  </button>
                )}
              </div>
            )}

            {/* Snack */}
            {selectedPlan.nutrition.meals.snack && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300">
                    נשנוש מאזן: {selectedPlan.nutrition.meals.snack.name}
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-mint">
                    +{selectedPlan.nutrition.meals.snack.proteinGrams}ג׳ חלבון
                  </span>
                </div>
                <p className="text-purple-200 text-[11px]">
                  {selectedPlan.nutrition.meals.snack.notes}
                </p>
                {selectedPlan.nutrition.meals.snack.recipe && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveRecipeMeal(selectedPlan.nutrition.meals.snack)
                    }
                    className="flex items-center gap-1.5 rounded-xl border border-lilac/30 bg-lilac/10 px-3 py-1.5 text-xs font-semibold text-lilac hover:bg-lilac/20 transition active:scale-95"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>הצג מתכון, כמויות וזמני הכנה</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CollapsibleCard>

      {/* 4. עקרונות תזונה והגבלות (Collapsible: closed by default) */}
      <CollapsibleCard
        title="עקרונות והגבלות תזונה אישיות"
        badge="ללא כוסברה • ללא שעועית ירוקה • ללא תורמוס • ללא אדממה"
        icon={ShieldCheck}
        defaultOpen={false}
      >
        <div className="space-y-2 text-xs text-purple-200">
          <p>
            • <strong>איזון סוכר ל-PCOS:</strong> כל ארוחה משלבת חלבון איכותי
            (דג, טופו, ביצים, קוטג') ושומן בריא כדי להאט את פירוק הפחמימות
            ולמנוע תנודות אינסולין.
          </p>
          <p>
            • <strong>הגנה מצרבות:</strong> הימנעות משום ובצל חי בשעות הערב,
            סיום ארוחת ערב 3 שעות לפני השינה, והגשת תבשילים פושרים ולא רותחים.
          </p>
          <p>
            • <strong>איסורים מוחלטים:</strong> ללא כוסברה (Coriander), ללא
            שעועית ירוקה (Green Beans), ללא תורמוס (Lupin Beans), וללא פולי
            סויה/אדממה (Edamame).
          </p>
        </div>
      </CollapsibleCard>

      {/* Modal with exact recipe and cooking timer */}
      <MealRecipeModal
        meal={activeRecipeMeal}
        onClose={() => setActiveRecipeMeal(null)}
      />
    </div>
  );
}
