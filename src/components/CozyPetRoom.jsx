import { useState, useRef, useEffect } from "react";
import { Sparkles, Moon, Sun } from "lucide-react";
import { useCabin, setCabin, petAction } from "../store";
import { RECOVERY_DAILY_CAP } from "../lib/recovery";
import {
  STATS,
  STAT_LABELS,
  LOW_THRESHOLD,
  FOOD_COST,
  VET_COST,
  SEARCH_COST,
  initialPets,
  moodLabel,
} from "../lib/pets";

const HEART_EMOJIS = ["❤️", "💖", "💕", "💗", "💓", "💞", "🩷", "🩵", "💜", "🫶"];

const LIGHTING_MODES = [
  {
    id: "cozy",
    name: "אור חמים 🕯️",
    bgClass: "from-amber-950/40 via-purple-950/40 to-space",
    glowColor: "bg-amber-500/20",
    lampEmoji: "🕯️",
  },
  {
    id: "sunset",
    name: "שקיעה פסטלית 🌅",
    bgClass: "from-pink-950/40 via-purple-900/30 to-space",
    glowColor: "bg-pink-500/20",
    lampEmoji: "🧡",
  },
  {
    id: "lofi",
    name: "Lofi סגלגל 🎧",
    bgClass: "from-indigo-950/50 via-purple-950/50 to-space",
    glowColor: "bg-lilac/25",
    lampEmoji: "💜",
  },
  {
    id: "night",
    name: "לילה שקט 🌙",
    bgClass: "from-slate-950 via-purple-950/40 to-space",
    glowColor: "bg-blue-600/15",
    lampEmoji: "💤",
  },
];

const PETS = {
  mochi: {
    name: "מוצ׳י",
    emoji: "🐶",
    size: "text-5xl",
    accessories: [
      ["mochi-bow", "🎀"],
      ["mochi-scarf", "🧣"],
      ["mochi-bone", "🦴"],
      ["mochi-crown", "👑"],
    ],
    reactions: {
      pet: "האו האו! קשקוש זנב! 🐕",
      feed: "איזה טעים! 🦴✨",
      play: "עוד פעם! 🎾",
      bath: "מבריקה ונקייה! 🫧",
      vet: "מרגישה טוב יותר 💊",
      search: "חזרתי הביתה! 🏡",
    },
    actions: { bath: "🛁 רחצה" },
  },
  charlie: {
    name: "צ׳ארלי",
    emoji: "🐈‍⬛",
    size: "text-6xl",
    accessories: [
      ["charlie-bell", "🔔"],
      ["charlie-hat", "🎩"],
      ["charlie-fish", "🐟"],
    ],
    reactions: {
      pet: "גרררר... גרגור מרגיע 🐾",
      feed: "מיאו! עוד טונה? 🐟",
      play: "תופס את החוט! 🧶",
      bath: "פרווה מבריקה ✨",
      vet: "מרגיש טוב יותר 💊",
      search: "חזרתי לכרית שלי 🏡",
    },
    actions: { bath: "🪮 סירוק" },
  },
};

const STATUS_BADGE = { sad: "😢", sick: "🤒" };

function StatBar({ stat, value }) {
  const v = Math.round(value);
  const low = v < LOW_THRESHOLD;
  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <span className="w-14 shrink-0 text-purple-200">
        {STAT_LABELS[stat].emoji} {STAT_LABELS[stat].label}
      </span>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label={STAT_LABELS[stat].label}
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            low ? "bg-red-400" : "bg-gradient-to-l from-mint to-lilac"
          }`}
          style={{ width: `${v}%` }}
        />
      </div>
      <span className={`w-7 text-left font-mono ${low ? "text-red-300 font-bold" : "text-purple-300"}`}>
        {v}
      </span>
    </div>
  );
}

export default function CozyPetRoom({
  resting,
  elapsedMin,
  pending,
  onToggleRecovery,
}) {
  const cabin = useCabin();
  const {
    owned = [],
    dogTreats = 0,
    unlockedFurniture = [],
    roomLighting = "sunset",
    placedDecor = ["rug", "plant", "salt-lamp"],
  } = cabin;
  const pets = cabin.pets ?? initialPets(cabin.petHappiness);

  const [reaction, setReaction] = useState({}); // { [petId]: text }
  const [notice, setNotice] = useState(null); // { petId, text }
  const [activeTab, setActiveTab] = useState("interact"); // 'interact' | 'decor' | 'nap'
  const [heartBursts, setHeartBursts] = useState([]);
  const [isVibrating, setIsVibrating] = useState(false);
  const burstIdRef = useRef(0);
  const vibrateTimerRef = useRef(null);
  const reactionTimers = useRef({});
  const noticeTimerRef = useRef(null);

  useEffect(() => {
    const timers = reactionTimers.current;
    return () => {
      clearTimeout(vibrateTimerRef.current);
      clearTimeout(noticeTimerRef.current);
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const currentLighting =
    LIGHTING_MODES.find((l) => l.id === roomLighting) || LIGHTING_MODES[1];

  const triggerPetFeedback = (pet) => {
    // Gentle screen vibration + mobile haptic
    setIsVibrating(false);
    requestAnimationFrame(() => setIsVibrating(true));
    clearTimeout(vibrateTimerRef.current);
    vibrateTimerRef.current = setTimeout(() => setIsVibrating(false), 230);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(18);
    }

    // Spawn burst of varied heart emojis
    const count = 8;
    const newHearts = Array.from({ length: count }, () => {
      burstIdRef.current += 1;
      return {
        id: burstIdRef.current,
        pet,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
        drift: Math.round((Math.random() - 0.5) * 90),
        delay: Math.round(Math.random() * 140),
        size: Math.random() > 0.45 ? "text-xl" : "text-base",
      };
    });
    const ids = new Set(newHearts.map((h) => h.id));
    setHeartBursts((prev) => [...prev.slice(-24), ...newHearts]);
    setTimeout(() => {
      setHeartBursts((prev) => prev.filter((h) => !ids.has(h.id)));
    }, 1350);
  };

  const doAction = (petId, action) => {
    const r = petAction(petId, action);
    if (!r.ok) {
      setNotice({ petId, text: r.message });
      clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = setTimeout(() => setNotice(null), 2800);
      return;
    }
    setNotice(null);
    triggerPetFeedback(petId);
    setReaction((prev) => ({ ...prev, [petId]: PETS[petId].reactions[action] }));
    clearTimeout(reactionTimers.current[petId]);
    reactionTimers.current[petId] = setTimeout(
      () => setReaction((prev) => ({ ...prev, [petId]: null })),
      2200,
    );
  };

  // Toggle Decor Item
  const handleToggleDecor = (decorId) => {
    const isPlaced = placedDecor.includes(decorId);
    const updated = isPlaced
      ? placedDecor.filter((d) => d !== decorId)
      : [...placedDecor, decorId];
    setCabin((s) => ({ ...s, placedDecor: updated }));
  };

  // Change room lighting
  const handleSetLighting = (modeId) => {
    setCabin((s) => ({ ...s, roomLighting: modeId }));
  };

  const renderPetOnStage = (petId) => {
    const def = PETS[petId];
    const pet = pets[petId];

    if (pet.status === "away") {
      return (
        <div className="relative flex flex-col items-center opacity-80">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-white/25 text-2xl">
            🏃
          </div>
          <span className="mt-1 block font-bold text-xs text-moon">{def.name}</span>
          <span className="text-[10px] font-bold text-red-300">
            {moodLabel(petId, pet)}
          </span>
        </div>
      );
    }

    const sleepy = resting || pet.energy < LOW_THRESHOLD;
    return (
      <div className="relative flex flex-col items-center">
        {heartBursts
          .filter((h) => h.pet === petId)
          .map((h) => (
            <span
              key={h.id}
              style={{
                "--drift": `${h.drift}px`,
                animationDelay: `${h.delay}ms`,
              }}
              className={`pointer-events-none absolute top-0 left-1/2 z-20 select-none animate-heart-float ${h.size}`}
              aria-hidden
            >
              {h.emoji}
            </span>
          ))}

        <button
          type="button"
          onClick={() => doAction(petId, "pet")}
          title={`לחצי כדי ללטף את ${def.name}!`}
          aria-label={`ליטוף ${def.name}`}
          className={`group relative flex flex-col items-center transition-all duration-300 active:scale-90 ${
            sleepy ? "animate-pulse" : "hover:scale-110"
          } ${pet.status !== "ok" ? "grayscale-[40%]" : ""}`}
        >
          <div className="flex h-5 gap-0.5 text-sm" aria-hidden>
            {def.accessories.map(([id, emoji]) =>
              owned.includes(id) ? <span key={id}>{emoji}</span> : null,
            )}
          </div>

          <span
            className={`${def.size} filter drop-shadow-lg cursor-pointer select-none`}
          >
            {def.emoji}
          </span>

          {STATUS_BADGE[pet.status] && (
            <span className="absolute bottom-0 -left-2 text-xl" aria-hidden>
              {STATUS_BADGE[pet.status]}
            </span>
          )}

          {reaction[petId] ? (
            <span className="absolute -top-7 whitespace-nowrap rounded-full bg-mint px-2 py-0.5 text-[10px] font-extrabold text-space shadow-md animate-fade-in">
              {reaction[petId]}
            </span>
          ) : (
            sleepy && (
              <span className="absolute -top-6 text-xs text-mint font-bold animate-pulse">
                Zzz... 💤
              </span>
            )
          )}
        </button>

        <span className="mt-1 block font-bold text-xs text-moon">{def.name}</span>
        <span
          className={`text-[10px] ${
            pet.status === "ok" ? "text-purple-300" : "font-bold text-red-300"
          }`}
        >
          {moodLabel(petId, pet)}
        </span>
      </div>
    );
  };

  const renderCarePanel = (petId) => {
    const def = PETS[petId];
    const pet = pets[petId];
    const btn =
      "flex-1 rounded-xl border border-white/10 bg-white/5 px-1.5 py-2 text-[11px] font-bold text-moon transition hover:bg-white/10 active:scale-95 disabled:opacity-40";

    return (
      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-moon">
            {def.emoji} {def.name}
          </span>
          <span
            className={`text-[11px] ${
              pet.status === "ok" ? "text-purple-300" : "font-bold text-red-300"
            }`}
          >
            {moodLabel(petId, pet)}
          </span>
        </div>

        {pet.status !== "away" && (
          <div className="space-y-1">
            {STATS.map((s) => (
              <StatBar key={s} stat={s} value={pet[s]} />
            ))}
          </div>
        )}

        {pet.status === "sick" && (
          <button
            type="button"
            onClick={() => doAction(petId, "vet")}
            className="w-full rounded-xl bg-blush px-3 py-2 text-xs font-bold text-space transition active:scale-95"
          >
            💊 וטרינר ותרופה ({VET_COST} 🪙)
          </button>
        )}

        {pet.status === "away" ? (
          <div className="space-y-1.5">
            <p className="text-[11px] text-purple-200">
              {def.name} {petId === "mochi" ? "ברחה" : "ברח"} מהבית כי לא טיפלו
              {petId === "mochi" ? " בה" : " בו"} זמן מה.
              {petId === "mochi" && " טיול אמיתי עם מוצ׳י יחזיר אותה בחינם 🐾"}
            </p>
            <button
              type="button"
              onClick={() => doAction(petId, "search")}
              className="w-full rounded-xl bg-lilac px-3 py-2 text-xs font-bold text-space transition active:scale-95"
            >
              🔦 לחפש את {def.name} ({SEARCH_COST} 🪙)
            </button>
          </div>
        ) : (
          <div className="flex gap-1.5">
            <button type="button" onClick={() => doAction(petId, "feed")} className={btn}>
              🍖 האכלה
              <span className="block text-[9px] font-normal text-purple-300">
                {petId === "mochi" && dogTreats > 0
                  ? `חטיף (${dogTreats})`
                  : `${FOOD_COST} 🪙`}
              </span>
            </button>
            <button
              type="button"
              onClick={() => doAction(petId, "play")}
              disabled={pet.status === "sad"}
              className={btn}
            >
              🎾 משחק
              <span className="block text-[9px] font-normal text-purple-300">
                −אנרגיה
              </span>
            </button>
            <button type="button" onClick={() => doAction(petId, "bath")} className={btn}>
              {def.actions.bath}
              <span className="block text-[9px] font-normal text-purple-300">
                פעם בשעתיים
              </span>
            </button>
            <button type="button" onClick={() => doAction(petId, "pet")} className={btn}>
              🤲 ליטוף
              <span className="block text-[9px] font-normal text-purple-300">
                חינם
              </span>
            </button>
          </div>
        )}

        {notice?.petId === petId && (
          <p className="rounded-xl bg-blush/15 px-2.5 py-1.5 text-[11px] text-blush animate-fade-in">
            {notice.text}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* 3D-Like Cozy Virtual Room Canvas */}
      <div
        className={`relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b ${currentLighting.bgClass} p-5 shadow-2xl transition-all duration-700 min-h-[310px] flex flex-col justify-between ${
          isVibrating ? "animate-gentle-vibrate" : ""
        }`}
      >
        {/* Cozy Lighting Glow Orb */}
        <div
          className={`absolute top-0 right-1/4 h-48 w-48 rounded-full ${currentLighting.glowColor} blur-3xl pointer-events-none transition-all duration-700`}
        />

        {/* Room Header Controls */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-moon flex items-center gap-1.5">
              <span>הבקתה של מוצ׳י וצ׳ארלי</span>
              <Sparkles className="h-3.5 w-3.5 text-lilac" />
            </span>
            {resting && (
              <span className="rounded-full bg-mint/20 border border-mint/40 px-2.5 py-0.5 text-[10px] font-bold text-mint animate-pulse">
                שנ״צ משותף פעיל 💤
              </span>
            )}
          </div>

          {/* Quick Lighting Pill */}
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 border border-white/10 text-xs">
            {LIGHTING_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleSetLighting(mode.id)}
                title={mode.name}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                  roomLighting === mode.id
                    ? "bg-white/20 text-moon shadow-sm scale-105"
                    : "text-purple-300 opacity-60 hover:opacity-100"
                }`}
              >
                {mode.lampEmoji}
              </button>
            ))}
          </div>
        </div>

        {/* Room Decor (Placed Furniture) */}
        <div className="relative z-10 my-2 flex items-center justify-around pointer-events-none">
          {placedDecor.includes("plant") && (
            <div
              className="text-2xl animate-bounce duration-1000"
              title="צמח בית"
            >
              🪴
            </div>
          )}
          {unlockedFurniture.includes("salt-lamp") &&
            placedDecor.includes("salt-lamp") && (
              <div className="text-xl animate-pulse" title="מנורת מלח דולקת">
                🪨✨
              </div>
            )}
          {unlockedFurniture.includes("tarnaby-lamp") &&
            placedDecor.includes("tarnaby-lamp") && (
              <div
                className="text-xl animate-pulse"
                title="מנורת אווירה TÄRNABY"
              >
                🕯️
              </div>
            )}
          {owned.includes("charlie-bed") && (
            <div className="text-2xl" title="כרית ענקית">
              🛏️
            </div>
          )}
        </div>

        {/* Pets in Room Stage (Interactive Play Zone) */}
        <div className="relative z-10 flex items-end justify-around pt-3 pb-2">
          {renderPetOnStage("mochi")}

          {/* Rug between pets */}
          {placedDecor.includes("rug") && (
            <div className="text-4xl opacity-80" title="שטיח חמים">
              🧶
            </div>
          )}

          {renderPetOnStage("charlie")}
        </div>

        {/* Room Floor Ground */}
        <div className="relative z-10 border-t border-white/10 pt-2 text-[11px] text-purple-300">
          {resting
            ? `💤 שנ״צ משותף: נחתן יחד ${elapsedMin} דקות (+${pending} 🪙) • האנרגיה שלהם מתמלאת`
            : "🕯️ לחיצה על מוצ׳י או צ׳ארלי = ליטוף • הם צריכים אוכל, משחק, ניקיון ושינה"}
        </div>
      </div>

      {/* Room Controls Navigation Tabs */}
      <div className="flex gap-1.5 rounded-2xl bg-white/5 p-1 border border-white/10 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("interact")}
          className={`flex-1 rounded-xl py-2 font-bold transition ${
            activeTab === "interact"
              ? "bg-mint text-space shadow-md"
              : "text-purple-300 hover:bg-white/5"
          }`}
        >
          🐾 טיפול ומשחק
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("nap")}
          className={`flex-1 rounded-xl py-2 font-bold transition ${
            activeTab === "nap"
              ? "bg-lilac text-space shadow-md"
              : "text-purple-300 hover:bg-white/5"
          }`}
        >
          🛋️ זמן שנ״צ משותף (Lofi)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("decor")}
          className={`flex-1 rounded-xl py-2 font-bold transition ${
            activeTab === "decor"
              ? "bg-pink-400 text-space shadow-md"
              : "text-purple-300 hover:bg-white/5"
          }`}
        >
          🎨 עיצוב ותאורה
        </button>
      </div>

      {/* Tab 1: Tamagotchi care */}
      {activeTab === "interact" && (
        <div className="space-y-2.5 text-xs">
          {renderCarePanel("mochi")}
          {renderCarePanel("charlie")}
          <p className="px-1 text-[10px] text-purple-300">
            💡 טיול אמיתי עם מוצ׳י ומשימות הסירוק ברולטת הבית מטפלים בהם גם כאן.
            מטר שמתרוקן עלול לגרום לעצב, מחלה או בריחה מהבית!
          </p>
        </div>
      )}

      {/* Tab 2: Sleep Together / Lofi Cozy Mode */}
      {activeTab === "nap" && (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lilac font-bold">
              <Moon className="h-4 w-4" />
              <span>מצב שנת צהריים משותפת (Lofi Cozy Mode)</span>
            </div>
            <span className="text-purple-300">
              עד {RECOVERY_DAILY_CAP} מטבעות ביום
            </span>
          </div>

          <p className="text-purple-200 leading-relaxed text-[11.5px]">
            בהפעלת המנוחה, האורות בבקתה מתעמעמים, מוצ׳י וצ׳ארלי עוברים למצב שינה
            ומתכרבלים יחד איתך — והאנרגיה שלהם מתמלאת. כל 5 דקות מנוחה צוברות
            מטבע לחדר — גם כשהמסך כבוי!
          </p>

          <button
            type="button"
            onClick={onToggleRecovery}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 font-bold transition active:scale-95 shadow-lg ${
              resting
                ? "bg-mint text-space shadow-mint/20"
                : "bg-lilac text-space shadow-lilac/20"
            }`}
          >
            {resting ? (
              <>
                <Sun className="h-4 w-4" />
                <span>התעוררנו מהשנ״צ — לאסוף {pending} 🪙</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>להתכרבל לשנ״צ משותף 🛋️💤</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab 3: Room Decorator & Cozy Lighting */}
      {activeTab === "decor" && (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3 text-xs">
          <span className="font-bold text-moon block">
            התאמת תאורת אווירה בחדר:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {LIGHTING_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleSetLighting(mode.id)}
                className={`flex items-center gap-2 rounded-xl p-2.5 border transition ${
                  roomLighting === mode.id
                    ? "bg-mint/15 border-mint text-mint font-bold"
                    : "bg-white/5 border-white/10 text-purple-200 hover:bg-white/10"
                }`}
              >
                <span className="text-lg">{mode.lampEmoji}</span>
                <span>{mode.name}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 pt-2.5 space-y-2">
            <span className="font-bold text-moon block">
              הצבת רהיטים ואביזרים בחלל החדר:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleToggleDecor("rug")}
                className={`rounded-xl px-3 py-1.5 border text-[11px] font-semibold transition ${
                  placedDecor.includes("rug")
                    ? "bg-pink-400/20 border-pink-400 text-pink-300"
                    : "bg-white/5 border-white/10 text-purple-400"
                }`}
              >
                🧶 שטיח K-pop חמים {placedDecor.includes("rug") ? "✔" : ""}
              </button>

              <button
                type="button"
                onClick={() => handleToggleDecor("plant")}
                className={`rounded-xl px-3 py-1.5 border text-[11px] font-semibold transition ${
                  placedDecor.includes("plant")
                    ? "bg-emerald-400/20 border-emerald-400 text-emerald-300"
                    : "bg-white/5 border-white/10 text-purple-400"
                }`}
              >
                🪴 עציץ שלווה ירוק {placedDecor.includes("plant") ? "✔" : ""}
              </button>

              {unlockedFurniture.includes("salt-lamp") && (
                <button
                  type="button"
                  onClick={() => handleToggleDecor("salt-lamp")}
                  className={`rounded-xl px-3 py-1.5 border text-[11px] font-semibold transition ${
                    placedDecor.includes("salt-lamp")
                      ? "bg-amber-400/20 border-amber-400 text-amber-300"
                      : "bg-white/5 border-white/10 text-purple-400"
                  }`}
                >
                  🪨 מנורת מלח {placedDecor.includes("salt-lamp") ? "✔" : ""}
                </button>
              )}

              {unlockedFurniture.includes("tarnaby-lamp") && (
                <button
                  type="button"
                  onClick={() => handleToggleDecor("tarnaby-lamp")}
                  className={`rounded-xl px-3 py-1.5 border text-[11px] font-semibold transition ${
                    placedDecor.includes("tarnaby-lamp")
                      ? "bg-lilac/20 border-lilac text-lilac"
                      : "bg-white/5 border-white/10 text-purple-400"
                  }`}
                >
                  🕯️ מנורת TÄRNABY{" "}
                  {placedDecor.includes("tarnaby-lamp") ? "✔" : ""}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
