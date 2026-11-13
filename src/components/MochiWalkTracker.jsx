import { useState, useEffect } from "react";
import { Play, Square, MapPin, Sparkles, Check, Bone } from "lucide-react";
import { useCabin, setCabin, todayKey } from "../store";

const HAIFA_LOCATIONS = [
  {
    id: "louis",
    name: "טיילת לואי 🌅",
    desc: "נוף פנורמי למפרץ, בריזה נעימה ומישור מוגן גב",
  },
  {
    id: "bat-galim",
    name: "טיילת בת גלים 🌊",
    desc: "הליכה רגועה לצד הגלים וספסלי מנוחה",
  },
  {
    id: "dog-park",
    name: "גינת כלבים מרכז הכרמל 🐶",
    desc: "מפגש חברים פריקה אנרגטית למוצ׳י",
  },
  {
    id: "dado",
    name: "טיילת דדו וחוף הכרמל 🏖️",
    desc: "שביל הליכה רחב, שטוח וידידותי לעמוד השדרה",
  },
];

export default function MochiWalkTracker() {
  const { dogTreats = 0, lastMochiWalk } = useCabin();
  const [isWalking, setIsWalking] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    HAIFA_LOCATIONS[0].id,
  );
  const [walkSeconds, setWalkSeconds] = useState(0);
  const [probioticChecked, setProbioticChecked] = useState(false);
  const [walkSuccessMessage, setWalkSuccessMessage] = useState("");

  useEffect(() => {
    let interval = null;
    if (isWalking) {
      interval = setInterval(() => {
        setWalkSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isWalking]);

  const handleToggleWalk = () => {
    if (!isWalking) {
      // Start Walk
      setIsWalking(true);
      setWalkSeconds(0);
      setWalkSuccessMessage("");
    } else {
      // Stop & Complete Walk
      setIsWalking(false);
      const minutesWalked = Math.max(1, Math.round(walkSeconds / 60));
      const treatsEarned = probioticChecked ? 3 : 2;
      const coinsEarned = probioticChecked ? 8 : 5;

      setCabin((s) => ({
        ...s,
        coins: s.coins + coinsEarned,
        dogTreats: (s.dogTreats || 0) + treatsEarned,
        walkingMinutes: (s.walkingMinutes || 0) + minutesWalked,
        lastMochiWalk: {
          date: todayKey(),
          minutes: minutesWalked,
          location:
            HAIFA_LOCATIONS.find((l) => l.id === selectedLocation)?.name ||
            "חיפה",
          hadProbiotic: probioticChecked,
        },
      }));

      setWalkSuccessMessage(
        `טיול נהדר של ${minutesWalked} דק׳! הרווחת +${treatsEarned} חטיפי כלבים ו-+${coinsEarned} 🪙`,
      );
      setProbioticChecked(false);
    }
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Upper Status & Treats Balance */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl animate-bounce">🐶</span>
          <div>
            <h4 className="font-bold text-xs text-moon">
              טיולי שטח עם מוצ׳י בחיפה
            </h4>
            <p className="text-[11px] text-purple-300">
              הליכה בחוץ טובה לגב, לנפש ולמוצ׳י הקטנה
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl bg-amber-400/20 border border-amber-400/30 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-sm">
          <Bone className="h-4 w-4" />
          <span>{dogTreats} חטיפי כלבים</span>
        </div>
      </div>

      {/* Location Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-purple-200 block">
          יעד הטיול בחיפה (מישורי ומוגן גב):
        </label>
        <div className="grid grid-cols-2 gap-2">
          {HAIFA_LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              type="button"
              disabled={isWalking}
              onClick={() => setSelectedLocation(loc.id)}
              className={`rounded-2xl p-2.5 text-right border transition active:scale-95 text-xs ${
                selectedLocation === loc.id
                  ? "bg-mint/20 border-mint text-mint font-bold shadow-md shadow-mint/20"
                  : "bg-white/5 border-white/10 text-purple-200 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blush shrink-0" />
                <span className="font-bold truncate">{loc.name}</span>
              </div>
              <span className="text-[10px] text-purple-300 block mt-1 opacity-80 leading-tight">
                {loc.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Walk Timer & Controls */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center space-y-3">
        {isWalking ? (
          <div className="space-y-1">
            <span className="text-[11px] text-mint font-semibold animate-pulse block">
              🐾 מוצ׳י ואת בטיול כעת...
            </span>
            <div className="text-3xl font-mono font-extrabold text-moon tracking-wider">
              {formatTimer(walkSeconds)}
            </div>
            <span className="text-[11px] text-purple-300">
              {HAIFA_LOCATIONS.find((l) => l.id === selectedLocation)?.name}
            </span>
          </div>
        ) : (
          <div className="text-xs text-purple-200">
            {lastMochiWalk ? (
              <span>
                טיול אחרון: יום {lastMochiWalk.date} • {lastMochiWalk.minutes}{" "}
                דק׳ ב{lastMochiWalk.location} ✨
              </span>
            ) : (
              <span>מוכנות לטיול בחוץ? רתמה, מים ויציאה רגועה 🌸</span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleToggleWalk}
          className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition active:scale-95 shadow-lg ${
            isWalking
              ? "bg-blush text-space shadow-blush/25 hover:bg-blush/90"
              : "bg-mint text-space shadow-mint/25 hover:bg-mint/90"
          }`}
        >
          {isWalking ? (
            <>
              <Square className="h-4 w-4 fill-current" />
              <span>סיום הטיול וקבלת חטיפי כלבים ומטבעות 🦴</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>התחלת טיול עם מוצ׳י (Start Walk) 🦮</span>
            </>
          )}
        </button>
      </div>

      {/* Post-walk Health Checklist for Mochi */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2">
        <span className="text-xs font-bold text-moon block">
          שגרת בריאות לאחר הטיול:
        </span>
        <button
          type="button"
          onClick={() => setProbioticChecked(!probioticChecked)}
          className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition border ${
            probioticChecked
              ? "bg-mint/15 border-mint text-mint"
              : "bg-white/5 border-white/10 text-purple-200 hover:bg-white/10"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">💊🐟</span>
            <span>נתתי למוצ׳י פרוביוטיקה ושמן סלמון (+בונוס חטיף כלבים)</span>
          </div>
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-lg border ${
              probioticChecked
                ? "bg-mint text-space border-mint"
                : "border-white/20 bg-white/5"
            }`}
          >
            {probioticChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
          </div>
        </button>
      </div>

      {/* Feedback Alert */}
      {walkSuccessMessage && (
        <div className="rounded-2xl border border-mint/40 bg-mint/15 p-3 text-xs text-mint font-bold text-center animate-fade-in flex items-center justify-center gap-1.5">
          <Sparkles className="h-4 w-4" />
          <span>{walkSuccessMessage}</span>
        </div>
      )}
    </div>
  );
}
