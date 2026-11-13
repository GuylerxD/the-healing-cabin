import { useState, useEffect } from "react";
import {
  Wind,
  PlayCircle,
  Flame,
  Timer,
  Sparkles,
  ShieldCheck,
  LifeBuoy,
  Compass,
  Pill,
  Dumbbell,
} from "lucide-react";
import { updateToday, useToday, useCabin, setCabin } from "../store";
import { useDailyPlan } from "../hooks/useDailyPlan";
import CastToTvButton from "../components/CastToTvButton";
import QlairaChallenge28 from "../components/QlairaChallenge28";
import JourneyToEastMap from "../components/JourneyToEastMap";
import CollapsibleCard from "../components/CollapsibleCard";

const WORKOUTS = [
  {
    id: "stretch",
    name: "מתיחות עדינות ושחרור גב 🧘‍♀️",
    minutes: 10,
    cardio: false,
    query: "gentle stretching lower back relief beginner",
  },
  {
    id: "cat-cow",
    name: "חתול-פרה ותנוחת הילד לגב 🐱",
    minutes: 8,
    cardio: false,
    backFocused: true,
    query: "cat cow child pose lower back decompression",
  },
  {
    id: "nerve-glide",
    name: "שחרור עצב סיאטיקה וגב תחתון 🌸",
    minutes: 12,
    cardio: false,
    backFocused: true,
    query: "sciatica nerve flossing lower back relief",
  },
  {
    id: "pilates",
    name: "פילאטיס קיר עדין 🧱",
    minutes: 15,
    cardio: false,
    query: "wall pilates beginner low impact",
  },
  {
    id: "boxing",
    name: "איגרוף קצב POV 🥊",
    minutes: 15,
    cardio: true,
    query: "POV rhythm boxing workout low impact",
  },
  {
    id: "kpop",
    name: "הליכת K-pop 🎧",
    minutes: 20,
    cardio: true,
    query: "kpop walking workout low impact",
  },
];

const REWARD = 6;

export default function Movement() {
  const today = useToday();
  const cabin = useCabin();
  const sosMode = Boolean(cabin.sosMode);
  const { todayPlan, dayNameHe } = useDailyPlan(null, { sosMode });
  const heavy = !!today.heavyBreathing;
  const backPainLevel = today.backPain ?? 0;
  const isBackPainHigh = backPainLevel >= 2; // בינוני או חזק
  const done = today.workouts ?? [];

  // Hot pad timer (10 mins = 600 secs)
  const [timerSeconds, setTimerSeconds] = useState(600);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
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
  }, [timerRunning]);

  const toggleDone = (id) => {
    const isDone = done.includes(id);
    updateToday(
      { workouts: isDone ? done.filter((w) => w !== id) : [...done, id] },
      isDone ? -REWARD : REWARD,
    );
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // If back pain is high, prioritize back stretches and filter/lock cardio
  const visibleWorkouts = isBackPainHigh
    ? WORKOUTS.filter((w) => !w.cardio)
    : WORKOUTS;

  return (
    <div className="space-y-4">
      {/* Back Relief Advice Bubble when back pain is high */}
      {isBackPainHigh && (
        <section className="p-5 rounded-3xl bg-gradient-to-br from-[#c792ea]/20 via-[#ffb7df]/20 to-[#80ffdb]/10 border border-[#ffb7df]/50 backdrop-blur-lg space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-blush animate-pulse" />
            <h2 className="font-bold text-blush text-sm">
              המלצת חימום והקלה לגב להיום 🛋️
            </h2>
          </div>
          <p className="text-xs text-purple-100 leading-relaxed">
            מזוהה כאב גב מוגבר היום. מומלץ להניח **כרית חמה או בקבוק חם** על הגב
            התחתון או הבטן התחתונה כדי להרפות את השרירים ולהקל על הלחץ.
          </p>

          <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 border border-white/10">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-mint" />
              <span className="font-mono text-base font-bold text-mint">
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-xs text-purple-200">
                טיימר כרית חמה (10 דק׳)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  timerRunning ? "bg-blush text-space" : "bg-mint text-space"
                }`}
              >
                {timerRunning
                  ? "השהה"
                  : timerSeconds === 0
                    ? "הסתיים 🎉"
                    : "הפעל טיימר"}
              </button>
              {timerSeconds < 600 && (
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(600);
                  }}
                  className="px-2 py-1.5 rounded-xl text-xs text-purple-300 bg-white/5"
                >
                  איפוס
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pre-workout Breathing Check (Collapsible) */}
      <CollapsibleCard
        id="movement-breathing"
        title="בדיקת נשימה לפני אימון"
        badge={heavy ? "כבדה 🫁" : "רגילה 🌿"}
        icon={Wind}
        defaultOpen={true}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-purple-200">איך הנשימה במנוחה עכשיו?</p>
            <button
              aria-pressed={heavy}
              onClick={() => updateToday({ heavyBreathing: !heavy })}
              className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                heavy ? "bg-blush text-space" : "bg-mint/20 text-mint"
              }`}
            >
              {heavy ? "כבדה 🫁" : "רגילה 🌿"}
            </button>
          </div>
          {heavy && (
            <p className="rounded-2xl border border-blush/40 bg-blush/15 p-3 text-xs text-blush">
              💗 הנשימה כבדה היום — נוותר על אירובי. מתיחות עדינות זה ניצחון
              מלא, עם אותם מטבעות.
            </p>
          )}
        </div>
      </CollapsibleCard>

      {/* SOS Mode Toggle (Low Energy / Asthma Fallback - Collapsible) */}
      <CollapsibleCard
        id="movement-sos"
        title="מצב SOS (עייפות משמרת / אסתמה)"
        badge={sosMode ? "פעיל 🫁" : "כבוי"}
        icon={LifeBuoy}
        defaultOpen={true}
        headerClassName={
          sosMode ? "!border-blush/50 !bg-blush/10 text-blush" : ""
        }
      >
        <div className="flex items-center justify-between p-1 text-right">
          <div className="text-xs text-purple-200">
            החלפה אוטומטית לרוטינת מתיחות עמידה עדינה של 8 דק׳ (100% מוגן גב
            ואסתמה)
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={sosMode}
            onClick={() => setCabin((s) => ({ ...s, sosMode: !s.sosMode }))}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
              sosMode ? "bg-blush" : "bg-white/20"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-space shadow-md transition duration-200 ${
                sosMode ? "-translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </CollapsibleCard>

      {/* Daily Spine-Safe Workout from plansDB (Collapsible) */}
      {todayPlan && todayPlan.workout && (
        <CollapsibleCard
          id="movement-daily-workout"
          title={
            sosMode
              ? "אימון מצב SOS מותאם אישית"
              : `אימון יום ${dayNameHe}: תנועה מותאמת לגב 🌸`
          }
          badge={`${todayPlan.workout.category} • ${todayPlan.workout.durationMinutes} דק׳`}
          icon={ShieldCheck}
          defaultOpen={true}
          headerClassName={sosMode ? "!border-blush/50" : "!border-mint/40"}
        >
          <div className="space-y-3.5">
            <div>
              <h3 className="font-bold text-moon text-sm">
                {todayPlan.workout.title}
              </h3>
              <p className="text-xs text-purple-200 mt-1">
                {todayPlan.workout.description}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-3 space-y-1.5 text-xs">
              <div
                className={`flex items-center gap-2 ${sosMode ? "text-blush" : "text-mint"}`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{todayPlan.workout.spineSafety}</span>
              </div>
              <div className="text-purple-300">
                ⚡ {todayPlan.workout.impact} • ⏱️{" "}
                {todayPlan.workout.durationMinutes} דקות
              </div>
            </div>

            {/* Smart TV Cast Integration */}
            <CastToTvButton
              workoutTitle={todayPlan.workout.title}
              youtubeQuery={todayPlan.workout.youtubeQuery}
            />

            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(todayPlan.workout.youtubeQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold text-space shadow-lg transition active:scale-95 ${
                sosMode ? "bg-blush shadow-blush/20" : "bg-mint shadow-mint/20"
              }`}
            >
              <PlayCircle className="h-4 w-4" />
              <span>
                {sosMode
                  ? "נגן מתיחות SOS עדינות"
                  : `סרטון מודרך ביוטיוב (${todayPlan.workout.durationMinutes} דק׳)`}
              </span>
            </a>
          </div>
        </CollapsibleCard>
      )}

      {/* Virtual Distance Pedometer: Journey to East Map (Collapsible) */}
      <CollapsibleCard
        id="movement-map"
        title="המסע למזרח: בדרך לקוריאה ויפן"
        badge="מד צעדים ומרחק"
        icon={Compass}
        defaultOpen={false}
      >
        <JourneyToEastMap />
      </CollapsibleCard>

      {/* 28-Day Qlaira Challenge Progress Tracker (Collapsible) */}
      <CollapsibleCard
        id="movement-qlaira-28"
        title="אתגר 28 הימים של קלייר"
        badge="סנכרון חפיסת גלולות"
        icon={Pill}
        defaultOpen={false}
      >
        <QlairaChallenge28 />
      </CollapsibleCard>

      {/* Extra Workouts Library (Collapsible) */}
      <CollapsibleCard
        id="movement-extra-workouts"
        title="ספריית אימונים ומתיחות נוספת"
        badge={`${visibleWorkouts.length} תרגילים`}
        icon={Dumbbell}
        defaultOpen={false}
      >
        <div className="space-y-3 pt-1">
          {isBackPainHigh && (
            <div className="flex items-center gap-1.5 text-xs text-mint px-1">
              <Sparkles className="h-4 w-4" />
              <span>האימונים הותאמו להקלה ופריקת עומס מהגב 💆‍♀️</span>
            </div>
          )}
          {visibleWorkouts.map((w) => {
            const locked = heavy && w.cardio;
            const recommended =
              (isBackPainHigh && w.backFocused) ||
              (heavy && w.id === "stretch");
            const isDone = done.includes(w.id);
            return (
              <article
                key={w.id}
                className={`glass space-y-3 p-4 transition ${locked ? "opacity-40" : ""} ${
                  recommended ? "!border-mint/60 ring-2 ring-mint/30" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{w.name}</h3>
                  <span className="text-xs text-purple-300">
                    {w.minutes} דק׳
                  </span>
                </div>
                {recommended && (
                  <p className="text-xs text-mint">
                    {w.backFocused
                      ? "✨ ממוקד להקלה על כאבי גב"
                      : "✨ מומלץ במיוחד להיום"}
                  </p>
                )}
                {locked ? (
                  <p className="text-xs text-purple-200">
                    נשמור לאחרי שהנשימה תירגע 🌙
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(w.query)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-2 text-sm"
                    >
                      <PlayCircle className="h-4 w-4" aria-hidden /> לסרטון
                    </a>
                    <button
                      aria-pressed={isDone}
                      onClick={() => toggleDone(w.id)}
                      className={`flex-1 rounded-2xl py-2 text-sm font-bold transition ${
                        isDone ? "bg-mint/20 text-mint" : "bg-lilac text-space"
                      }`}
                    >
                      {isDone ? "✅ בוצע" : `סיימתי +${REWARD}`}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </CollapsibleCard>
    </div>
  );
}
