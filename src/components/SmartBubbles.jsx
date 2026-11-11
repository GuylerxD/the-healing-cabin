import { useState, useEffect } from "react";
import {
  Coffee,
  BatteryCharging,
  Wind,
  Footprints,
  Check,
  Play,
  Square,
} from "lucide-react";
import { updateToday, useToday } from "../store";

export default function SmartBubbles({ onNavigateTab }) {
  const today = useToday();

  // 1. PCOS Bloating condition: fit is 'tight'
  const showBloat = today.fit === "tight";

  // 2. Low Energy condition: energy is 1 or 2
  const showLowEnergy = today.energy === 1 || today.energy === 2;

  // 3. Asthma / Heavy breathing: heavyBreathing is true
  const showAsthma = !!today.heavyBreathing;

  // 4. Glucose / PCOS balance: meals logged > 0
  const showGlucose = (today.meals ?? 0) > 0;

  // State for Breathing 4-7-8 exercise
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState("שאיפה דרך האף 👃 (4 שניות)");
  const [breathCount, setBreathCount] = useState(4);

  useEffect(() => {
    if (!breathingActive) return;
    let step = 0; // 0: inhale(4s), 1: hold(7s), 2: exhale(8s)
    let left = 4;

    const interval = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        step = (step + 1) % 3;
        if (step === 0) {
          left = 4;
          setBreathPhase("שאיפה דרך האף 👃 (4 שניות)");
        } else if (step === 1) {
          left = 7;
          setBreathPhase("החזקת נשימה ⏸️ (7 שניות)");
        } else {
          left = 8;
          setBreathPhase("נשיפה איטית דרך הפה 🌬️ (8 שניות)");
        }
      }
      setBreathCount(left);
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive]);

  if (!showBloat && !showLowEnergy && !showAsthma && !showGlucose) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Bubble 1: PCOS Bloating & Insulin Sensitivity */}
      {showBloat && (
        <section className="p-4 rounded-3xl bg-gradient-to-l from-[#ffb7df]/20 to-[#c792ea]/15 border border-[#ffb7df]/40 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-blush" />
              <h3 className="font-bold text-sm text-blush">
                הקלה על נפיחות ועומס ל-PCOS 🍵
              </h3>
            </div>
            {today.teaLogged && (
              <span className="text-xs text-mint font-bold">
                רוויה ונעימה ✨
              </span>
            )}
          </div>
          <p className="text-xs text-purple-100 leading-relaxed">
            נפיחות היא תגובה נפוצה לרגישות להורמונים ואינסולין ב-PCOS — זה לא
            שומן ולא כישלון. עברי לבגדים משוחררים, שתי מים מרווים או חליטת
            קינמון/בבונג שעוזרת לאיזון.
          </p>
          <div className="flex justify-end pt-1">
            <button
              disabled={today.teaLogged}
              onClick={() => {
                updateToday({ teaLogged: true }, 5);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blush text-space disabled:opacity-50 transition active:scale-95"
            >
              {today.teaLogged
                ? "נשתתה חליטה (+5 🪙)"
                : "שתיתי חליטה מרגיעה (+5 🪙)"}
            </button>
          </div>
        </section>
      )}

      {/* Bubble 2: Low Energy Permission to Rest */}
      {showLowEnergy && (
        <section className="p-4 rounded-3xl bg-gradient-to-l from-[#c792ea]/25 to-white/5 border border-[#c792ea]/50 backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2">
            <BatteryCharging className="h-5 w-5 text-lilac animate-pulse" />
            <h3 className="font-bold text-sm text-lilac">
              היתר רשמי להוריד הילוך 🛋️
            </h3>
          </div>
          <p className="text-xs text-purple-100 leading-relaxed">
            רמת האנרגיה שלך נמוכה כרגע — הגוף משקיע משאבים בריפוי פנימי. אין
            צורך לעשות היום וי על כל המשימות.
          </p>
          <div className="flex justify-end pt-1">
            <button
              onClick={() => onNavigateTab("cabin")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-lilac text-space transition active:scale-95"
            >
              מעבר להתאוששות פעילה בחדר 🐾
            </button>
          </div>
        </section>
      )}

      {/* Bubble 3: Asthma & 4-7-8 Breathing Circle */}
      {showAsthma && (
        <section className="p-4 rounded-3xl bg-gradient-to-l from-[#80ffdb]/20 to-white/5 border border-[#80ffdb]/40 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-mint" />
              <h3 className="font-bold text-sm text-mint">
                פריקת סטרס נשימתי ואסתמה 🫁
              </h3>
            </div>
            <button
              onClick={() => setBreathingActive(!breathingActive)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-mint text-space"
            >
              {breathingActive ? (
                <Square className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              {breathingActive ? "סיום" : "נשימת 4-7-8"}
            </button>
          </div>
          <p className="text-xs text-purple-100 leading-relaxed">
            נשימה כבדה מעידה על סטרס בריאות. שתי שלוק מים פושרים ותרגלי פריקת
            עומס בנשיפת שפתיים צרות.
          </p>
          {breathingActive && (
            <div className="p-3 rounded-2xl bg-white/10 text-center space-y-1 border border-white/10">
              <div className="text-xs text-mint font-bold">{breathPhase}</div>
              <div className="text-2xl font-mono font-bold text-moon">
                {breathCount}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Bubble 4: Glucose / PCOS Walk & Balance */}
      {showGlucose && (
        <section className="p-4 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Footprints className="h-5 w-5 text-mint" />
              <h3 className="font-bold text-sm text-mint">
                איזון סוכר ל-PCOS אחרי ארוחה 🥗
              </h3>
            </div>
            {today.pcosWalk && (
              <span className="text-xs text-mint font-bold">הושלם ✔</span>
            )}
          </div>
          <p className="text-xs text-purple-100 leading-relaxed">
            סימנת ארוחה! הליכה נינוחה של 5-10 דקות (או מתיחות קלות) מונעת נפילות
            סוכר וחשקים למתוק.
          </p>
          <div className="flex justify-end pt-1">
            <button
              disabled={today.pcosWalk}
              onClick={() => {
                updateToday({ pcosWalk: true }, 5);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-purple-100 hover:bg-white/20 disabled:opacity-50 transition"
            >
              <Check className="h-3.5 w-3.5 text-mint" />
              {today.pcosWalk
                ? "הליכה קלה סומנה (+5 🪙)"
                : "עשיתי סיבוב קל (+5 🪙)"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
