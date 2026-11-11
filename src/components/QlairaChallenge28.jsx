import { useMemo, useState } from "react";
import { Pill, Trophy, Sparkles, Check } from "lucide-react";
import { useCabin, addCoins } from "../store";

// Real 28-day Qlaira pill color schedule
function getPillInfo(dayNum) {
  if (dayNum <= 2) {
    return {
      name: "צהובה כהה",
      color: "bg-amber-500 text-amber-950",
      border: "border-amber-400",
    };
  }
  if (dayNum <= 7) {
    return {
      name: "אדומה בינונית",
      color: "bg-rose-500 text-white",
      border: "border-rose-400",
    };
  }
  if (dayNum <= 24) {
    return {
      name: "צהובה בהירה",
      color: "bg-yellow-200 text-yellow-950",
      border: "border-yellow-300",
    };
  }
  if (dayNum <= 26) {
    return {
      name: "אדומה כהה",
      color: "bg-red-700 text-white",
      border: "border-red-600",
    };
  }
  return {
    name: "לבנה",
    color: "bg-white text-space",
    border: "border-gray-200",
  };
}

function calculateCurrentCycleDay() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24),
  );
  return (dayOfYear % 28) + 1;
}

export default function QlairaChallenge28() {
  const { days } = useCabin();
  const [currentCycleDay] = useState(calculateCurrentCycleDay);

  // Compute how many workouts were done in the last 28 days
  const completedDaysInCycle = useMemo(() => {
    const dates = Object.keys(days).sort().slice(-28);
    let count = 0;
    const history = [];

    for (let i = 1; i <= 28; i++) {
      const dateKey = dates[i - 1];
      const hasWorkout = dateKey && days[dateKey]?.workouts?.length > 0;
      if (hasWorkout) count++;
      history.push({
        day: i,
        done: Boolean(hasWorkout),
        isCurrent: i === currentCycleDay,
      });
    }

    return { count, history };
  }, [days, currentCycleDay]);

  const percentage = Math.min(
    100,
    Math.round((completedDaysInCycle.count / 28) * 100),
  );

  const handleClaimChallengeReward = () => {
    addCoins(50);
  };

  return (
    <section className="glass space-y-4 p-5 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lilac/20 text-lilac">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-moon text-sm">
              אתגר 28 הימים של קלייר
            </h3>
            <p className="text-xs text-purple-300">
              סנכרון מדויק עם מחזור 28 הגלולות של Qlaira
            </p>
          </div>
        </div>
        <span className="rounded-full bg-lilac/15 px-3 py-1 text-xs font-bold text-lilac">
          יום {currentCycleDay} מתוך 28
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-purple-200">
          <span>
            {completedDaysInCycle.count} מתוך 28 אימונים הושלמו בסבב זה
          </span>
          <span className="font-bold text-mint">{percentage}%</span>
        </div>
        <div
          className="h-3 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-l from-mint via-lilac to-blush transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* 28-Pill Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-purple-300">
          <span>חפיסת קליירה (4 שורות × 7 ימים)</span>
          <span>✨ גלולה זוהרת = אימון בוצע</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {completedDaysInCycle.history.map((pill) => {
            const info = getPillInfo(pill.day);
            return (
              <div
                key={pill.day}
                title={`יום ${pill.day}: גלולה ${info.name}`}
                className={`relative flex h-9 flex-col items-center justify-center rounded-xl border text-[11px] font-bold transition-all ${
                  pill.done
                    ? "!border-mint bg-mint/25 text-mint shadow-sm shadow-mint/30"
                    : `${info.border} bg-white/5 text-purple-200`
                } ${pill.isCurrent ? "ring-2 ring-blush scale-105" : ""}`}
              >
                {pill.done ? (
                  <Check className="h-3.5 w-3.5 text-mint" />
                ) : (
                  <span className="text-[10px]">{pill.day}</span>
                )}
                <span
                  className={`h-1.5 w-1.5 rounded-full mt-0.5 ${info.color}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {percentage === 100 && (
        <div className="flex items-center justify-between rounded-2xl bg-mint/15 p-3 text-xs text-mint border border-mint/30">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>כל הכבוד! השלמת 28 ימי אימון במחזור הנוכחי! 🎉</span>
          </div>
          <button
            onClick={handleClaimChallengeReward}
            className="flex items-center gap-1 rounded-xl bg-mint px-3 py-1.5 text-space font-bold text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>קבלת 50 מטבעות</span>
          </button>
        </div>
      )}
    </section>
  );
}
