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
  Dumbbell,
  Shuffle,
  CalendarClock,
} from "lucide-react";
import { updateToday, useToday, useCabin, setCabin } from "../store";
import CastToTvButton from "../components/CastToTvButton";
import JourneyToEastMap from "../components/JourneyToEastMap";
import CollapsibleCard from "../components/CollapsibleCard";
import {
  POST_MEAL_TIP,
  SAFETY_RULES,
  WORKOUT_TYPES,
} from "../data/workoutPool";
import {
  getDailyExtras,
  getDailyWorkout,
  getTomorrowWorkout,
} from "../lib/workoutRotation";

const REWARD = 6;
const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const ADAPTED_NOTE = {
  back: "הותאם להיום בגלל כאב גב — אימון ממוקד הקלה 💆‍♀️",
  breathing: "הנשימה כבדה היום — האירובי הוחלף בתנועה רגועה 🫁",
};

export default function Movement() {
  const today = useToday();
  const cabin = useCabin();
  const sosMode = Boolean(cabin.sosMode);
  const heavy = !!today.heavyBreathing;
  const backPainLevel = today.backPain ?? 0;
  const isBackPainHigh = backPainLevel >= 2; // בינוני או חזק
  const done = today.workouts ?? [];

  const [now] = useState(() => new Date());
  const dayNameHe = HEBREW_DAYS[now.getDay()];
  const swap = today.workoutSwap ?? 0;
  const { workout, type, adaptedReason } = getDailyWorkout(now, {
    swap,
    sos: sosMode,
    backPainHigh: isBackPainHigh,
    heavyBreathing: heavy,
  });
  const typeInfo = WORKOUT_TYPES[type];
  const dailyDoneId = `daily:${workout.id}`;
  const dailyDone = done.includes(dailyDoneId);
  const tomorrow = getTomorrowWorkout(now);
  const extras = getDailyExtras(now, workout.id);

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

  // If back pain is high, prioritize back stretches and hide cardio
  const visibleWorkouts = isBackPainHigh
    ? extras.filter((w) => w.type !== "cardio")
    : extras;

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

      {/* Daily Spine-Safe Workout — rotates every day (lib/workoutRotation.js) */}
      <CollapsibleCard
        id="movement-daily-workout"
        title={
          sosMode
            ? "אימון מצב SOS מותאם אישית"
            : `אימון יום ${dayNameHe}: תנועה מותאמת לגב 🌸`
        }
        badge={`${typeInfo.emoji} ${typeInfo.label} • ${workout.durationMinutes} דק׳`}
        icon={ShieldCheck}
        defaultOpen={true}
        headerClassName={sosMode ? "!border-blush/50" : "!border-mint/40"}
      >
        <div className="space-y-3.5">
          {ADAPTED_NOTE[adaptedReason] && (
            <p className="rounded-xl border border-mint/30 bg-mint/10 px-3 py-2 text-[11px] font-semibold text-mint">
              {ADAPTED_NOTE[adaptedReason]}
            </p>
          )}
          <div>
            <h3 className="font-bold text-moon text-sm">{workout.title}</h3>
            <p className="text-xs text-purple-200 mt-1">{workout.description}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-3 space-y-1.5 text-xs">
            <div
              className={`flex items-center gap-2 ${sosMode ? "text-blush" : "text-mint"}`}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>{workout.spineSafety}</span>
            </div>
            <div className="text-purple-300">
              ⚡ {workout.impact} • ⏱️ {workout.durationMinutes} דקות
            </div>
          </div>

          {/* Why this helps: back + PCOS + weight + cortisol/insulin */}
          <p className="rounded-2xl border border-lilac/30 bg-lilac/10 p-3 text-xs leading-relaxed text-purple-100">
            <strong className="text-lilac">למה זה טוב לך: </strong>
            {typeInfo.benefit}
          </p>

          <details className="group rounded-2xl bg-white/5 px-3 py-2 text-xs">
            <summary className="cursor-pointer select-none font-bold text-mint">
              🛡️ כללי בטיחות לגב ולקורטיזול
            </summary>
            <ul className="mt-2 list-disc space-y-1 pr-4 text-purple-200">
              {SAFETY_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </details>

          {/* Smart TV Cast Integration */}
          <CastToTvButton
            workoutTitle={workout.title}
            youtubeQuery={workout.youtubeQuery}
          />

          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(workout.youtubeQuery)}`}
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
                : `סרטון מודרך ביוטיוב (${workout.durationMinutes} דק׳)`}
            </span>
          </a>

          <div className="flex gap-2">
            {!sosMode && !dailyDone && (
              <button
                type="button"
                onClick={() => updateToday({ workoutSwap: swap + 1 })}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 py-2 text-xs font-semibold text-moon transition hover:bg-white/10 active:scale-95"
              >
                <Shuffle className="h-3.5 w-3.5 text-lilac" />
                <span>אימון אחר</span>
              </button>
            )}
            <button
              type="button"
              aria-pressed={dailyDone}
              onClick={() => toggleDone(dailyDoneId)}
              className={`flex-1 rounded-2xl py-2 text-xs font-bold transition active:scale-95 ${
                dailyDone ? "bg-mint/20 text-mint" : "bg-lilac text-space"
              }`}
            >
              {dailyDone ? "✅ בוצע" : `סיימתי +${REWARD} 🪙`}
            </button>
          </div>

          <p className="text-[11px] leading-relaxed text-mint">
            🍽️ {POST_MEAL_TIP}
          </p>

          {!sosMode && (
            <p className="flex items-center gap-1.5 text-[11px] text-purple-300">
              <CalendarClock className="h-3.5 w-3.5 shrink-0" />
              <span>מחר: {tomorrow.title}</span>
            </p>
          )}
        </div>
      </CollapsibleCard>

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

      {/* Extra Workouts Library (Collapsible) */}
      <CollapsibleCard
        id="movement-extra-workouts"
        title="עוד אפשרויות להיום"
        badge={`${visibleWorkouts.length} אימונים • מתחלפים כל יום`}
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
            const locked = heavy && w.type === "cardio";
            const recommended =
              (isBackPainHigh && w.backFocused) ||
              (heavy && w.type === "recovery");
            const t = WORKOUT_TYPES[w.type];
            const isDone = done.includes(w.id);
            return (
              <article
                key={w.id}
                className={`glass space-y-3 p-4 transition ${locked ? "opacity-40" : ""} ${
                  recommended ? "!border-mint/60 ring-2 ring-mint/30" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block text-[11px] font-semibold text-lilac">
                      {t.emoji} {t.label}
                    </span>
                    <h3 className="font-bold">{w.title}</h3>
                  </div>
                  <span className="shrink-0 text-xs text-purple-300">
                    {w.durationMinutes} דק׳
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
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(w.youtubeQuery)}`}
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
