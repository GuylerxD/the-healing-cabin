import { useState, useEffect } from "react";
import {
  Coffee,
  BatteryCharging,
  Wind,
  Footprints,
  Check,
  Play,
  Square,
  Sparkles,
  Headphones,
  Flame,
  Volume2,
} from "lucide-react";
import { updateToday, useToday } from "../store";

export default function SmartBubbles({ onNavigateTab, activeTab }) {
  const today = useToday();

  // 1. PCOS Bloating: only on tracking tab
  const showBloat = activeTab === "tracking" && today.fit === "tight";

  // 2. Low Energy: only on tracking tab
  const showLowEnergy =
    activeTab === "tracking" && (today.energy === 1 || today.energy === 2);

  // 3. Low Mood (שפוף 🌧️): shows ONLY on the cabin tab as requested
  const showMoodHaven = activeTab === "cabin" && today.mood === 0;

  // 4. Asthma / Heavy breathing: heavyBreathing is true (shown when relevant)
  const showAsthma = !!today.heavyBreathing;

  // 5. Glucose / PCOS balance: meals logged > 0 (shown on quests/nutrition)
  const showGlucose =
    (activeTab === "quests" || activeTab === "nutrition") &&
    (today.meals ?? 0) > 0;

  // Mood Haven Tab selection
  const [moodTab, setMoodTab] = useState("diffuser"); // diffuser | audio | mindfulness

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

  if (
    !showBloat &&
    !showLowEnergy &&
    !showMoodHaven &&
    !showAsthma &&
    !showGlucose
  ) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Haven Bubble: Low Mood Support (שפוף 🌧️) */}
      {showMoodHaven && (
        <section className="space-y-3 rounded-3xl border border-[#c792ea]/50 bg-gradient-to-br from-[#1e1538] via-[#2d1b4e] to-[#130d26] p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blush animate-pulse" />
              <h3 className="text-sm font-bold text-blush">
                בקתת הרוגע והנפש שלך 💜
              </h3>
            </div>
            <span className="text-[11px] text-purple-200">חיבוק עצמי חם</span>
          </div>
          <p className="text-xs leading-relaxed text-purple-100">
            זה בסדר גמור להרגיש שפוף היום. קחי לעצמך מרחב מוגן, הרפי ציפיות
            והתפנקי באחד מהדברים המרגיעים הבאים:
          </p>

          {/* Sub tabs inside Mood Bubble */}
          <div className="flex gap-1.5 rounded-2xl bg-white/5 p-1 border border-white/10">
            {[
              { id: "diffuser", label: "מכשיר אדים 🌿" },
              { id: "audio", label: "מוזיקה מרגיעה 🎧" },
              { id: "mindfulness", label: "דמיון ומיינדפולנס 🧘‍♀️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMoodTab(tab.id)}
                className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition ${
                  moodTab === tab.id
                    ? "bg-lilac text-space shadow-md"
                    : "text-purple-300 hover:text-moon"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View 1: Diffuser & Essential Oils */}
          {moodTab === "diffuser" && (
            <div className="space-y-2 rounded-2xl bg-white/5 p-3.5 border border-white/10">
              <div className="flex items-center gap-2 font-bold text-xs text-mint">
                <Flame className="h-4 w-4" />
                <span>הדלקת מכשיר אדים ושמנים אתריים מומלצים:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-purple-100 pr-1">
                <li className="flex items-start gap-1.5">
                  <span>🌸</span>
                  <span>
                    <strong>לבנדר (Lavender):</strong> 3-4 טיפות להורדת קורטיזול
                    וחרדה.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span>🍊</span>
                  <span>
                    <strong>תפוז מתוק או ברגמוט:</strong> מעלה חיוניות ומצב רוח
                    עדין.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span>🍃</span>
                  <span>
                    <strong>אקליפטוס / מנטה:</strong> פותח דרכי נשימה ומטהר את
                    האוויר.
                  </span>
                </li>
              </ul>
              <div className="flex justify-end pt-1">
                <button
                  disabled={today.diffuserOn}
                  onClick={() => updateToday({ diffuserOn: true }, 2)}
                  className="flex items-center gap-1.5 rounded-xl bg-mint px-3 py-1.5 text-xs font-bold text-space disabled:opacity-50 transition active:scale-95"
                >
                  <Check className="h-3.5 w-3.5" />
                  {today.diffuserOn
                    ? "הדלקתי אדים (+2 🪙)"
                    : "הדלקתי את המכשיר (+2 🪙)"}
                </button>
              </div>
            </div>
          )}

          {/* View 2: Audio & Calming Sounds */}
          {moodTab === "audio" && (
            <div className="space-y-2 rounded-2xl bg-white/5 p-3.5 border border-white/10">
              <div className="flex items-center gap-2 font-bold text-xs text-blush">
                <Headphones className="h-4 w-4" />
                <span>מוזיקה וצלילים להורדת עומס רגשי:</span>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-1">
                <a
                  href="https://www.youtube.com/results?search_query=cozy+lofi+rain+cabin+chill"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-xs text-moon hover:bg-white/15 transition"
                >
                  <span>☕ מוזיקת Lo-Fi בבקתה חמימה וגשם</span>
                  <Play className="h-3.5 w-3.5 text-blush" />
                </a>
                <a
                  href="https://www.youtube.com/results?search_query=528hz+release+anxiety+healing+frequency"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-xs text-moon hover:bg-white/15 transition"
                >
                  <span>✨ תדר 528Hz לשחרור מתח והרגעת הגוף</span>
                  <Play className="h-3.5 w-3.5 text-mint" />
                </a>
              </div>
            </div>
          )}

          {/* View 3: Mindfulness & Guided Imagery */}
          {moodTab === "mindfulness" && (
            <div className="space-y-2 rounded-2xl bg-white/5 p-3.5 border border-white/10">
              <div className="flex items-center gap-2 font-bold text-xs text-lilac">
                <Volume2 className="h-4 w-4" />
                <span>דמיון מודרך וקרקוע מהיר:</span>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-1">
                <a
                  href="https://www.youtube.com/results?search_query=%D7%93%D7%9E%D7%99%D7%95%D7%9F+%D7%9E%D7%95%D7%93%D7%A8%D7%9A+%D7%9C%D7%94%D7%A8%D7%92%D7%A2%D7%94+%D7%A7%D7%A6%D7%A8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-xs text-moon hover:bg-white/15 transition"
                >
                  <span>🌸 דמיון מודרך קצר להרפיית מתח</span>
                  <Play className="h-3.5 w-3.5 text-lilac" />
                </a>
                <a
                  href="https://www.youtube.com/results?search_query=%D7%9E%D7%99%D7%99%D7%A0%D7%93%D7%A4%D7%55%D7%9C%D7%A0%D7%A1+%D7%9C%D7%A9%D7%97%D7%A8%D7%95%D7%A8+%D7%9E%D7%97%D7%A9%D7%91%D7%95%D7%AA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-xs text-moon hover:bg-white/15 transition"
                >
                  <span>🍃 תרגול מיינדפולנס ושחרור מחשבות מעיקות</span>
                  <Play className="h-3.5 w-3.5 text-mint" />
                </a>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Bubble 1: PCOS Bloating & Insulin Sensitivity (Only on tracking tab) */}
      {showBloat && (
        <section className="space-y-2 rounded-3xl border border-[#ffb7df]/40 bg-gradient-to-l from-[#ffb7df]/20 to-[#c792ea]/15 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-blush" />
              <h3 className="text-sm font-bold text-blush">
                הקלה על נפיחות ועומס ל-PCOS 🍵
              </h3>
            </div>
            {today.teaLogged && (
              <span className="text-xs font-bold text-mint">
                רוויה ונעימה ✨
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-purple-100">
            נפיחות היא תגובה נפוצה לרגישות להורמונים ואינסולין ב-PCOS — זה לא
            שומן ולא כישלון. עברי לבגדים משוחררים, שתי מים מרווים או חליטת
            קינמון/בבונג שעוזרת לאיזון.
          </p>
          <div className="flex justify-end pt-1">
            <button
              disabled={today.teaLogged}
              onClick={() => {
                updateToday({ teaLogged: true }, 2);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-blush px-3 py-1.5 text-xs font-bold text-space disabled:opacity-50 transition active:scale-95"
            >
              {today.teaLogged
                ? "נשתתה חליטה (+2 🪙)"
                : "שתיתי חליטה מרגיעה (+2 🪙)"}
            </button>
          </div>
        </section>
      )}

      {/* Bubble 2: Low Energy Permission to Rest (Only on tracking tab) */}
      {showLowEnergy && (
        <section className="space-y-2 rounded-3xl border border-[#c792ea]/50 bg-gradient-to-l from-[#c792ea]/25 to-white/5 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <BatteryCharging className="h-5 w-5 text-lilac animate-pulse" />
            <h3 className="text-sm font-bold text-lilac">
              היתר רשמי להוריד הילוך 🛋️
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-purple-100">
            רמת האנרגיה שלך נמוכה כרגע — הגוף משקיע משאבים בריפוי פנימי. אין
            צורך לעשות היום וי על כל המשימות.
          </p>
          <div className="flex justify-end pt-1">
            <button
              onClick={() => onNavigateTab("cabin")}
              className="rounded-xl bg-lilac px-3 py-1.5 text-xs font-bold text-space transition active:scale-95"
            >
              מעבר להתאוששות פעילה בחדר 🐾
            </button>
          </div>
        </section>
      )}

      {/* Bubble 3: Asthma & 4-7-8 Breathing Circle */}
      {showAsthma && (
        <section className="space-y-3 rounded-3xl border border-[#80ffdb]/40 bg-gradient-to-l from-[#80ffdb]/20 to-white/5 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-mint" />
              <h3 className="text-sm font-bold text-mint">
                פריקת סטרס נשימתי ואסתמה 🫁
              </h3>
            </div>
            <button
              onClick={() => setBreathingActive(!breathingActive)}
              className="flex items-center gap-1 rounded-xl bg-mint px-2.5 py-1 text-xs font-bold text-space"
            >
              {breathingActive ? (
                <Square className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              {breathingActive ? "סיום" : "נשימת 4-7-8"}
            </button>
          </div>
          <p className="text-xs leading-relaxed text-purple-100">
            נשימה כבדה מעידה על סטרס בריאות. שתי שלוק מים פושרים ותרגלי פריקת
            עומס בנשיפת שפתיים צרות.
          </p>
          {breathingActive && (
            <div className="space-y-1 rounded-2xl border border-white/10 bg-white/10 p-3 text-center">
              <div className="text-xs font-bold text-mint">{breathPhase}</div>
              <div className="font-mono text-2xl font-bold text-moon">
                {breathCount}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Bubble 4: Glucose / PCOS Walk & Balance (Only on Quests / Nutrition) */}
      {showGlucose && (
        <section className="space-y-2 rounded-3xl border border-white/15 bg-white/5 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Footprints className="h-5 w-5 text-mint" />
              <h3 className="text-sm font-bold text-mint">
                איזון סוכר ל-PCOS אחרי ארוחה 🥗
              </h3>
            </div>
            {today.pcosWalk && (
              <span className="text-xs font-bold text-mint">הושלם ✔</span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-purple-100">
            סימנת ארוחה! הליכה נינוחה של 5-10 דקות (או מתיחות קלות) מונעת נפילות
            סוכר וחשקים למתוק.
          </p>
          <div className="flex justify-end pt-1">
            <button
              disabled={today.pcosWalk}
              onClick={() => {
                updateToday({ pcosWalk: true }, 2);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-purple-100 hover:bg-white/20 disabled:opacity-50 transition"
            >
              <Check className="h-3.5 w-3.5 text-mint" />
              {today.pcosWalk
                ? "הליכה קלה סומנה (+2 🪙)"
                : "עשיתי סיבוב קל (+2 🪙)"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
