import { useState, useRef, useEffect } from "react";
import { Sparkles, Moon, Sun } from "lucide-react";
import { useCabin, setCabin } from "../store";
import { RECOVERY_DAILY_CAP } from "../lib/recovery";

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

export default function CozyPetRoom({
  resting,
  elapsedMin,
  pending,
  onToggleRecovery,
}) {
  const {
    owned = [],
    dogTreats = 0,
    unlockedFurniture = [],
    roomLighting = "sunset",
    placedDecor = ["rug", "plant", "salt-lamp"],
    petHappiness = { mochi: 85, charlie: 85 },
  } = useCabin();

  // Interactive interaction states
  const [mochiReaction, setMochiReaction] = useState(null); // 'happy' | 'bark' | 'heart'
  const [charlieReaction, setCharlieReaction] = useState(null); // 'purr' | 'sleep' | 'heart'
  const [activeTab, setActiveTab] = useState("interact"); // 'interact' | 'decor' | 'nap'
  const [heartBursts, setHeartBursts] = useState([]);
  const [isVibrating, setIsVibrating] = useState(false);
  const burstIdRef = useRef(0);
  const vibrateTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(vibrateTimerRef.current);
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

  // Petting Mochi
  const handlePetMochi = () => {
    setMochiReaction("bark");
    triggerPetFeedback("mochi");
    setCabin((s) => ({
      ...s,
      petHappiness: {
        ...s.petHappiness,
        mochi: Math.min(100, (s.petHappiness?.mochi || 85) + 3),
      },
    }));
    setTimeout(() => setMochiReaction(null), 2000);
  };

  // Petting Charlie
  const handlePetCharlie = () => {
    setCharlieReaction("purr");
    triggerPetFeedback("charlie");
    setCabin((s) => ({
      ...s,
      petHappiness: {
        ...s.petHappiness,
        charlie: Math.min(100, (s.petHappiness?.charlie || 85) + 3),
      },
    }));
    setTimeout(() => setCharlieReaction(null), 2000);
  };

  // Give Dog Treat to Mochi
  const handleFeedMochi = () => {
    if (dogTreats <= 0) return;
    setMochiReaction("happy");
    triggerPetFeedback("mochi");
    setCabin((s) => ({
      ...s,
      dogTreats: Math.max(0, s.dogTreats - 1),
      petHappiness: {
        ...s.petHappiness,
        mochi: Math.min(100, (s.petHappiness?.mochi || 85) + 10),
      },
    }));
    setTimeout(() => setMochiReaction(null), 2500);
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
          {/* Mochi (Tiny Chihuahua) */}
          <div className="relative flex flex-col items-center">
            {heartBursts
              .filter((h) => h.pet === "mochi")
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
              onClick={handlePetMochi}
              title="לחצי כדי ללטף את מוצ׳י!"
              className={`group relative flex flex-col items-center transition-all duration-300 active:scale-90 ${
                resting ? "animate-pulse" : "hover:scale-110"
              }`}
            >
              {/* Pet Accessory */}
              <div className="flex h-5 gap-0.5 text-sm" aria-hidden>
                {owned.includes("mochi-bow") && <span>🎀</span>}
                {owned.includes("mochi-scarf") && <span>🧣</span>}
                {owned.includes("mochi-bone") && <span>🦴</span>}
                {owned.includes("mochi-crown") && <span>👑</span>}
              </div>

              {/* Mochi Emoji Body */}
              <span className="text-5xl filter drop-shadow-lg cursor-pointer select-none">
                🐶
              </span>

              {/* Speech / Reaction Bubble */}
              {mochiReaction === "bark" && (
                <span className="absolute -top-7 rounded-full bg-mint px-2 py-0.5 text-[10px] font-extrabold text-space shadow-md animate-fade-in">
                  האו האו! קשקוש זנב! 🐕
                </span>
              )}
              {mochiReaction === "happy" && (
                <span className="absolute -top-7 rounded-full bg-pink-400 px-2 py-0.5 text-[10px] font-extrabold text-space shadow-md animate-fade-in">
                  איזה חטיף טעים! 🦴✨
                </span>
              )}
              {resting && (
                <span className="absolute -top-6 text-xs text-mint font-bold animate-pulse">
                  Zzz... 💤
                </span>
              )}
            </button>

            <span className="mt-1 block font-bold text-xs text-moon">
              מוצ׳י
            </span>
            <span className="text-[10px] text-purple-300">
              אושר: {petHappiness.mochi || 85}% • לטפי אותי!
            </span>
          </div>

          {/* Rug between pets */}
          {placedDecor.includes("rug") && (
            <div className="text-4xl opacity-80" title="שטיח חמים">
              🧶
            </div>
          )}

          {/* Charlie (Big Black Cat) */}
          <div className="relative flex flex-col items-center">
            {heartBursts
              .filter((h) => h.pet === "charlie")
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
              onClick={handlePetCharlie}
              title="לחצי כדי ללטף את צ׳ארלי!"
              className={`group relative flex flex-col items-center transition-all duration-300 active:scale-90 ${
                resting ? "animate-pulse" : "hover:scale-110"
              }`}
            >
              {/* Pet Accessory */}
              <div className="flex h-5 gap-0.5 text-sm" aria-hidden>
                {owned.includes("charlie-bell") && <span>🔔</span>}
                {owned.includes("charlie-hat") && <span>🎩</span>}
                {owned.includes("charlie-fish") && <span>🐟</span>}
              </div>

              {/* Charlie Emoji Body */}
              <span className="text-6xl filter drop-shadow-lg cursor-pointer select-none">
                🐈‍⬛
              </span>

              {/* Speech / Reaction Bubble */}
              {charlieReaction === "purr" && (
                <span className="absolute -top-7 rounded-full bg-lilac px-2 py-0.5 text-[10px] font-extrabold text-space shadow-md animate-fade-in">
                  גרררר... גרגור מרגיע 🐾
                </span>
              )}
              {resting && (
                <span className="absolute -top-6 text-xs text-lilac font-bold animate-pulse">
                  Zzz... 💤
                </span>
              )}
            </button>

            <span className="mt-1 block font-bold text-xs text-moon">
              צ׳ארלי
            </span>
            <span className="text-[10px] text-purple-300">
              אושר: {petHappiness.charlie || 85}% • לטפי אותי!
            </span>
          </div>
        </div>

        {/* Room Floor Ground */}
        <div className="relative z-10 border-t border-white/10 pt-2 flex items-center justify-between text-[11px] text-purple-300">
          <span>
            {resting
              ? `💤 שנ״צ משותף: נחתן יחד ${elapsedMin} דקות (+${pending} 🪙)`
              : "🕯️ מוצ׳י וצ׳ארלי רגועים ומחכים להתכרבל איתך"}
          </span>
          {dogTreats > 0 && (
            <button
              type="button"
              onClick={handleFeedMochi}
              className="flex items-center gap-1 rounded-xl bg-amber-400/20 border border-amber-400/30 px-2 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-400/30 transition active:scale-95"
            >
              <span>🦴 פנקי את מוצ׳י בחטיף ({dogTreats})</span>
            </button>
          )}
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
          🐾 משחק וליטוף
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

      {/* Tab 1: Direct Touch & Play Controls */}
      {activeTab === "interact" && (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 space-y-2.5 text-xs">
          <span className="font-bold text-moon block">
            אינטראקציות מגע ישירות:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePetMochi}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 text-moon transition active:scale-95"
            >
              <span className="text-xl">🐶</span>
              <div className="text-right">
                <span className="font-bold block">לטפי את מוצ׳י</span>
                <span className="text-[10px] text-purple-300">
                  קשקוש בזנב 💛
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={handlePetCharlie}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 text-moon transition active:scale-95"
            >
              <span className="text-xl">🐈‍⬛</span>
              <div className="text-right">
                <span className="font-bold block">לטפי את צ׳ארלי</span>
                <span className="text-[10px] text-purple-300">
                  גרגור מרגיע 💜
                </span>
              </div>
            </button>
          </div>
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
            ומתכרבלים יחד איתך. כל 5 דקות מנוחה צוברות מטבע לחדר — גם כשהמסך
            כבוי!
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
