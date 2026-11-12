import { useState, useRef } from "react";
import {
  Dices,
  Sparkles,
  Heart,
  UtensilsCrossed,
  ShieldCheck,
} from "lucide-react";

const DATE_IDEAS = [
  {
    id: "arcade",
    title: "ארקייד - Time Machine בקריון 🕹️👾",
    category: "כיף ומשחקים נוסטלגיים",
    foodMatch: "שניצלונים פריכים או המבורגר נקי בקניון",
    spineSafeNote: "משחקי ארקייד בישיבה או עמידה רגועה — אפס עומס על הגב",
    desc: "כרטיסים, מכונות ריקוד, כדורסל ופרסים קטנים — דייט קליל ומלא צחוק!",
  },
  {
    id: "escape-room",
    title: "חדר בריחה בחיפה 🗝️🔍",
    category: "תעלומה וחידות בזוג",
    foodMatch: "פיצה מרגריטה קריספית ופשוטה אחרי החדר",
    spineSafeNote: "חידות מוח בלבד, ללא זחילה וללא טיפוס (חדר נגיש)",
    desc: "משתפים פעולה, פותרים חידות סודיות ובורחים בזמן!",
  },
  {
    id: "bowling",
    title: "באולינג קליל 🎳✨",
    category: "תחרות מתוקה בזוג",
    foodMatch: "צ׳יפס חם ונשנוש נקי במתחם",
    spineSafeNote: "גלגול כדור קל ורגוע, ללא תנועות פיתול חדות",
    desc: "מי מנצח בסטרייק? תחרות ידידותית עם מוזיקה טובה.",
  },
  {
    id: "pc-boardgames",
    title: "ערב PC ומשחקי קופסה בבית עם וולט 🎮🍕",
    category: "הדייט הביתי המושלם",
    foodMatch: "משלוח בוולט: המבורגר עסיסי נקי או פיצה לוהטת (בלי רטבים/ירקות)",
    spineSafeNote: "נוחות מלאה על הספה עם כריות תמיכה לגב",
    desc: "משחקים ב-Co-Op, פותחים משחק קופסה כיפי ואוכלים בנחת בבקתה שלכם.",
  },
  {
    id: "walk-colony-stella",
    title: "הליכה במושבה הגרמנית או סטלה מאריס 🏛️🌊",
    category: "אווירה חיפאית רומנטית",
    foodMatch: "שניצל חם בבאגט / טוסט גבינה צהובה פשוט ונקי",
    spineSafeNote: "הליכה מישורית רגועה בקצב שלכם עם ספסלים בכל פינה",
    desc: "אורות הגנים הבהאיים, רוח ים מסטלה מאריס ושיחות שקטות בזוג.",
  },
];

export default function DateNightRoulette() {
  const [selectedDate, setSelectedDate] = useState(DATE_IDEAS[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const rouletteTimerRef = useRef(null);

  const handleSpinRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinCount((c) => c + 1);

    let counter = 0;
    const totalFlips = 16;
    const intervalTime = 70;

    const flip = () => {
      counter += 1;
      const randomIndex = Math.floor(Math.random() * DATE_IDEAS.length);
      setSelectedDate(DATE_IDEAS[randomIndex]);

      if (counter < totalFlips) {
        rouletteTimerRef.current = setTimeout(
          flip,
          intervalTime + counter * 15,
        );
      } else {
        setIsSpinning(false);
      }
    };

    flip();
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blush/20 text-blush">
            <Heart className="h-5 w-5 fill-blush" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-moon flex items-center gap-1.5">
              <span>רולטת דייטים בחיפה 🎡</span>
              <Sparkles className="h-3.5 w-3.5 text-blush" />
            </h4>
            <p className="text-[11px] text-purple-300">
              מוגן גב 100% • מותאם לאכלנים בררנים (שניצל, פיצה, בורגר בלי
              ירקות/רטבים)
            </p>
          </div>
        </div>

        <span className="rounded-full bg-blush/15 border border-blush/30 px-2.5 py-0.5 text-[11px] font-bold text-blush">
          5 רעיונות מושלמים
        </span>
      </div>

      {/* Selected Date Card Display */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-4 transition-all duration-300 space-y-3 ${
          isSpinning
            ? "border-blush/60 bg-blush/10 scale-95 blur-[0.5px]"
            : "border-mint/50 bg-white/5 shadow-xl"
        }`}
      >
        <div className="flex items-start justify-between">
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-mint">
            {selectedDate.category}
          </span>
          <span className="text-xl">✨</span>
        </div>

        <div className="space-y-1">
          <h3 className="font-extrabold text-moon text-sm">
            {selectedDate.title}
          </h3>
          <p className="text-xs text-purple-200 leading-relaxed">
            {selectedDate.desc}
          </p>
        </div>

        {/* Picky Eater & Spine-Safe Tags */}
        <div className="space-y-1.5 pt-1 border-t border-white/10 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300">
            <UtensilsCrossed className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px]">
              <strong>אוכל מותאם:</strong> {selectedDate.foodMatch}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-mint">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px]">
              <strong>בטיחות גב:</strong> {selectedDate.spineSafeNote}
            </span>
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <button
        type="button"
        disabled={isSpinning}
        onClick={handleSpinRoulette}
        className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition-all active:scale-95 shadow-lg ${
          isSpinning
            ? "bg-blush text-space shadow-blush/30 animate-pulse"
            : "bg-gradient-to-r from-blush via-lilac to-mint text-space shadow-lilac/30 hover:opacity-95"
        }`}
      >
        <Dices className={`h-4 w-4 ${isSpinning ? "animate-spin" : ""}`} />
        <span>
          {isSpinning
            ? "מגלגל את הרולטה..."
            : spinCount === 0
              ? "סובב את הרולטה לדייט הבא! 🎲"
              : "סובב שוב לבחירה אחרת 🎲"}
        </span>
      </button>
    </div>
  );
}
