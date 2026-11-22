import { useState } from "react";
import {
  Plane,
  Train,
  Crown,
  Sparkles,
  Scale,
  X,
  MapPin,
  CheckCircle2,
  PartyPopper,
  Coins,
} from "lucide-react";
import { useCabin } from "../store";
import {
  WEIGHT_MILESTONE_REWARDS,
  WEIGHT_MAX,
  WEIGHT_MIN,
  isValidWeight,
  latestWeight,
  recordWeighIn,
} from "../lib/weight";
import CoinAmount from "./CoinAmount";

// Display data only; thresholds and rewards come from lib/weight.js
const MILESTONE_DISPLAY = [
  {
    id: "m90",
    title: "כרטיסים הוזמנו! ✈️",
    subtitle: "Flight Booked!",
    city: "נמל תעופה בן גוריון 🛫",
    desc: "ירדת ל-90 ק״ג! כרטיסי הטיסה לקוריאה ויפן הוזמנו רשמית ל-2027!",
    icon: Plane,
    color: "from-sky-400 to-blue-500",
    textColor: "text-sky-300",
    bgBadge: "bg-sky-400/20 border-sky-400/40 text-sky-300",
  },
  {
    id: "m80",
    title: "נוחתים בסיאול 🇰🇷",
    subtitle: "Landing in Seoul",
    city: "סיאול, דרום קוריאה",
    desc: "משקל 80 ק״ג הושג! מוצ׳י וצ׳ארלי לובשים צעיפים ונוחתים ברחובות מיונגדונג המוארים!",
    icon: MapPin,
    color: "from-blush to-pink-500",
    textColor: "text-blush",
    bgBadge: "bg-blush/20 border-blush/40 text-blush",
  },
  {
    id: "m70",
    title: "רכבת קליע לקיוטו 🚅",
    subtitle: "Bullet Train to Kyoto",
    city: "קיוטו, יפן (שינקנסן)",
    desc: "70 ק״ג! נוסעים בשינקנסן המהירה בין מקדשי במבוק וגני זן שלווים ביפן!",
    icon: Train,
    color: "from-lilac to-purple-500",
    textColor: "text-lilac",
    bgBadge: "bg-lilac/20 border-lilac/40 text-lilac",
  },
  {
    id: "m60",
    title: "אלופת טוקיו - הגענו ליעד! 🗼🌸",
    subtitle: "Tokyo Champion - Final Goal",
    city: "טוקיו, יפן (היעד הסופי)",
    desc: "60 ק״ג! הניצחון המושלם: 39 ק״ג של ריפוי, בריאות ועוצמה. הגעת ליעד החלומות שלך!",
    icon: Crown,
    color: "from-mint via-emerald-400 to-teal-500",
    textColor: "text-mint",
    bgBadge: "bg-mint/20 border-mint/40 text-mint",
  },
];

const WEIGHT_MILESTONES = MILESTONE_DISPLAY.map((d) => ({
  ...d,
  ...WEIGHT_MILESTONE_REWARDS.find((r) => r.id === d.id),
}));

export default function JourneyToEastWeightTracker() {
  const cabin = useCabin();
  const { startWeight = 99, goalWeight = 60 } = cabin;
  const currentWeight = latestWeight(cabin);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputWeight, setInputWeight] = useState(currentWeight.toString());
  const [celebrationMilestone, setCelebrationMilestone] = useState(null);

  // Calculate Progress
  // Total distance to lose: 99 - 60 = 39kg
  const totalJourneyKg = Math.max(1, startWeight - goalWeight);
  // Weight lost so far: 99 - currentWeight
  const lostKg = Math.max(0, startWeight - currentWeight);
  const progressPct = Math.min(
    100,
    Math.max(0, Math.round((lostKg / totalJourneyKg) * 100)),
  );
  const remainingKg = Math.max(0, currentWeight - goalWeight);

  const handleOpenModal = () => {
    setInputWeight(currentWeight.toString());
    setIsModalOpen(true);
  };

  const handleSaveWeight = (e) => {
    e.preventDefault();
    const newWeight = parseFloat(inputWeight);
    if (!isValidWeight(newWeight)) return;

    const { ids } = recordWeighIn(newWeight);
    setIsModalOpen(false);

    // If milestone unlocked, trigger pet celebration pop-up!
    if (ids.length > 0) {
      setCelebrationMilestone(
        WEIGHT_MILESTONES.find((m) => m.id === ids[ids.length - 1]),
      );
    }
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Main Glassmorphism Card */}
      <section className="glass relative overflow-hidden p-5 space-y-4 border-mint/30 shadow-xl">
        {/* Glow ambient background effect */}
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-lilac/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-mint/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lilac/15 text-lilac border border-white/10 shadow-sm">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-moon text-base flex items-center gap-1.5">
                <span>המסע למזרח 2027: מפת ירידה במשקל</span>
                <Sparkles className="h-4 w-4 text-lilac" />
              </h2>
              <p className="text-2xs text-muted">
                מ-99 ק״ג עד 60 ק״ג • כל קילוגרם מקרב אותך לטוקיו וסיאול
              </p>
            </div>
          </div>

          {/* Edit current weight button */}
          <button
            type="button"
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1.5 text-xs font-bold text-moon transition active:scale-95 shadow-sm"
          >
            <Scale className="h-3.5 w-3.5 text-mint" />
            <span>עדכון משקל</span>
          </button>
        </div>

        {!cabin.weighIns?.length && (
          <button
            type="button"
            onClick={handleOpenModal}
            className="relative flex w-full items-start gap-3 rounded-2xl border border-dashed border-lilac/40 bg-lilac/10 p-4 text-right transition hover:bg-lilac/15"
          >
            <Scale className="mt-0.5 h-5 w-5 shrink-0 text-lilac" aria-hidden />
            <span className="space-y-1">
              <span className="block text-sm font-semibold text-moon">
                המסע מתחיל בשקילה הראשונה
              </span>
              <span className="block text-xs text-muted">
                הזיני את המשקל של היום, והמפה תראה כמה כבר עברת ומה התחנה הבאה.
              </span>
            </span>
          </button>
        )}

        {/* Current Weight & Stats Banner */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-2xl bg-white/5 border border-white/5 p-3">
            <span className="text-2xs text-muted block">
              משקל התחלתי
            </span>
            <span className="font-bold text-moon text-sm">
              {startWeight} ק״ג
            </span>
          </div>
          <div className="rounded-2xl bg-mint/10 border border-mint/30 p-3 scale-105 shadow-sm">
            <span className="text-2xs text-mint block font-semibold">
              משקל נוכחי
            </span>
            <span className="font-extrabold text-mint text-base">
              {currentWeight} ק״ג
            </span>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/5 p-3">
            <span className="text-2xs text-muted block">
              יעד סופי ביפן
            </span>
            <span className="font-bold text-moon text-sm">
              {goalWeight} ק״ג
            </span>
          </div>
        </div>

        {/* Visual Progress Bar (Level Select Bar) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-soft">
              התקדמות במסע: ירדת <strong>{lostKg.toFixed(1)}</strong> מתוך{" "}
              {totalJourneyKg} ק״ג ({progressPct}%)
            </span>
            <span className="text-mint font-bold">
              {remainingKg <= 0
                ? "הגעת ליעד הסופי! 👑"
                : `עוד ${remainingKg.toFixed(1)} ק״ג ליעד 🌸`}
            </span>
          </div>

          <div
            className="h-3.5 overflow-hidden rounded-full bg-white/10 p-0.5 border border-white/10"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-lilac transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Gamified Milestones (Level Select Nodes Map) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-muted px-1 font-semibold">
            <span>תחנות המסע לאורך הדרך (Milestones):</span>
            <span>מוצ׳י & צ׳ארלי בדרך למזרח 🐾</span>
          </div>

          <div className="relative space-y-3 before:absolute before:top-4 before:bottom-4 before:right-5 before:w-0.5 before:bg-white/10">
            {WEIGHT_MILESTONES.map((milestone) => {
              const isUnlocked = currentWeight <= milestone.kgThreshold;
              const Icon = milestone.icon;

              return (
                <div
                  key={milestone.id}
                  className={`relative flex items-start gap-4 rounded-2xl border p-4 transition-all ${
                    isUnlocked
                      ? "bg-white/10 border-mint/50 shadow-md shadow-mint/10"
                      : "bg-white/[0.03] border-white/5 opacity-75"
                  }`}
                >
                  {/* Node Circle */}
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-transform ${
                      isUnlocked
                        ? "bg-lilac text-space border-lilac shadow-md scale-105"
                        : "bg-space border-white/15 text-muted/70"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Node Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-moon text-xs">
                          {milestone.title}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-2xs font-bold border ${milestone.bgBadge}`}
                        >
                          {milestone.kgThreshold} ק״ג
                        </span>
                      </div>
                      <span className="text-2xs text-muted font-mono">
                        <CoinAmount amount={`+${milestone.coinsReward}`} />
                      </span>
                    </div>

                    <p className="text-2xs text-soft leading-snug">
                      {milestone.desc}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-2xs">
                      <span className="text-muted">
                        📍 {milestone.city}
                      </span>
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-mint font-bold mr-auto">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>נפתח בהצלחה!</span>
                        </span>
                      ) : (
                        <span className="text-muted/70 mr-auto font-medium">
                          עוד{" "}
                          {(currentWeight - milestone.kgThreshold).toFixed(1)}{" "}
                          ק״ג לפתיחה
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Weekly Weight Input Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space/80 backdrop-blur-sm animate-fade-in"
          dir="rtl"
        >
          <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-space-light p-5 shadow-2xl space-y-4 text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-white/10 p-1.5 text-muted hover:bg-white/20 transition"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="text-right">
                <h3 className="font-bold text-base text-moon flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-mint" />
                  <span>עדכון משקל שבועי</span>
                </h3>
                <span className="text-2xs text-muted">
                  המסע למזרח: התקדמות לקראת 60 ק״ג
                </span>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div>
                <label className="block text-xs text-soft mb-1.5 font-semibold">
                  הכניסי את המשקל הנוכחי שלך (בק״ג):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min={WEIGHT_MIN}
                    max={WEIGHT_MAX}
                    autoFocus
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    placeholder="למשל: 95.5"
                    className="w-full rounded-2xl bg-white/5 border border-white/20 p-3 text-center text-lg font-bold text-moon focus:outline-none focus:border-lilac transition"
                  />
                  <span className="absolute left-4 top-3.5 text-xs text-muted/70 font-bold">
                    ק״ג
                  </span>
                </div>
                <p className="text-2xs text-muted mt-1 text-center">
                  משקל התחלתי: {startWeight} ק״ג | יעד סופי: {goalWeight} ק״ג
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-2xl bg-white/10 py-2.5 text-xs font-semibold text-soft hover:bg-white/15 transition"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-lilac py-2.5 text-xs font-bold text-space shadow-md shadow-lilac/20 hover:bg-lilac/90 transition active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>עדכון ושמירה</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Celebratory Milestone Unlocked Modal (Confetti / Mochi & Charlie pop-up) */}
      {celebrationMilestone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space/85 backdrop-blur-md animate-fade-in"
          dir="rtl"
        >
          <div className="relative w-full max-w-sm rounded-3xl border border-lilac/50 bg-space-light p-6 shadow-2xl text-center space-y-4">
            {/* Cute celebration header */}
            <div className="flex justify-center -mt-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-lilac shadow-lg shadow-lilac/30 animate-bounce">
                <PartyPopper className="h-8 w-8 text-space" />
              </div>
            </div>

            <div>
              <span className="text-2xs font-bold text-mint tracking-wider uppercase block mb-1">
                🎉 תחנה חדשה נפתחה במסע! 🎉
              </span>
              <h3 className="font-extrabold text-lg text-moon">
                {celebrationMilestone.title}
              </h3>
              <p className="text-xs text-soft mt-1">
                {celebrationMilestone.desc}
              </p>
            </div>

            {/* Pets Mochi & Charlie celebrating */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-around">
              <div className="flex flex-col items-center">
                <span className="text-4xl animate-pulse">🐶</span>
                <span className="text-2xs font-bold text-moon mt-1">
                  מוצ׳י
                </span>
                <span className="text-2xs text-mint">רוקדת משמחה!</span>
              </div>
              <div className="text-xl">🌸 ✈️ 🌸</div>
              <div className="flex flex-col items-center">
                <span className="text-4xl animate-pulse">🐈‍⬛</span>
                <span className="text-2xs font-bold text-moon mt-1">
                  צ׳ארלי
                </span>
                <span className="text-2xs text-lilac">אורז מזוודה!</span>
              </div>
            </div>

            {/* Coins Reward */}
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-mint/15 border border-mint/40 py-2.5 px-4 text-mint font-bold text-sm">
              <Coins className="h-5 w-5" />
              <span>
                הרווחת +{celebrationMilestone.coinsReward} מטבעות לחדר הריפוי!
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCelebrationMilestone(null)}
              className="w-full rounded-2xl bg-lilac py-3 text-xs font-bold text-space shadow-lg shadow-lilac/25 transition active:scale-95"
            >
              איזה כיף, ממשיכים במסע! ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
