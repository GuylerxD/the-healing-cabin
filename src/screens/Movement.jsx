import { Wind, PlayCircle } from "lucide-react";
import { updateToday, useToday } from "../store";

const WORKOUTS = [
  {
    id: "stretch",
    name: "מתיחות עדינות ושחרור גב 🧘‍♀️",
    minutes: 10,
    cardio: false,
    query: "gentle stretching lower back relief beginner",
  },
  {
    id: "pilates",
    name: "פילאטיס קיר 🧱",
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

const REWARD = 15;

export default function Movement() {
  const today = useToday();
  const heavy = !!today.heavyBreathing;
  const done = today.workouts ?? [];

  const toggleDone = (id) => {
    const isDone = done.includes(id);
    updateToday(
      { workouts: isDone ? done.filter((w) => w !== id) : [...done, id] },
      isDone ? -REWARD : REWARD,
    );
  };

  return (
    <div className="space-y-4">
      <section className="glass flex items-center justify-between gap-3 p-5">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-blush">
            <Wind className="h-5 w-5" aria-hidden /> בדיקת נשימה לפני אימון
          </h2>
          <p className="text-xs text-purple-200">איך הנשימה במנוחה עכשיו?</p>
        </div>
        <button
          aria-pressed={heavy}
          onClick={() => updateToday({ heavyBreathing: !heavy })}
          className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition ${
            heavy ? "bg-blush text-space" : "bg-mint/20 text-mint"
          }`}
        >
          {heavy ? "כבדה 🫁" : "רגילה 🌿"}
        </button>
      </section>

      {heavy && (
        <p className="rounded-2xl border border-blush/40 bg-blush/15 p-3 text-xs text-blush">
          💗 הנשימה כבדה היום — נוותר על אירובי. מתיחות עדינות זה ניצחון מלא, עם
          אותם מטבעות.
        </p>
      )}

      <section className="space-y-3">
        {WORKOUTS.map((w) => {
          const locked = heavy && w.cardio;
          const recommended = heavy && w.id === "stretch";
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
                <span className="text-xs text-purple-300">{w.minutes} דק׳</span>
              </div>
              {recommended && (
                <p className="text-xs text-mint">✨ מומלץ במיוחד להיום</p>
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
      </section>
    </div>
  );
}
