import { useEffect, useState } from "react";
import { Clock, Pill, Flame, Bell } from "lucide-react";
import { setCabin, updateToday, useCabin, useToday } from "../store";
import { shiftProgress } from "../lib/shift";
import PillReminderToggle from "../components/PillReminderToggle";
import { triggerInAppPillReminder } from "../lib/pillReminder";

function useNowMinutes() {
  const get = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };
  const [now, setNow] = useState(get);
  useEffect(() => {
    const id = setInterval(() => setNow(get()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Quests() {
  const { shift } = useCabin();
  const today = useToday();
  const now = useNowMinutes();
  const { pct, label } = shiftProgress(shift.start, shift.end, now);

  const setShift = (key, value) =>
    value && setCabin((s) => ({ ...s, shift: { ...s.shift, [key]: value } }));

  return (
    <div className="space-y-4">
      <section className="glass space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-bold text-mint">
          <Clock className="h-5 w-5" aria-hidden /> המשמרת שלי
        </h2>
        <div className="flex gap-3 text-sm">
          {[
            ["start", "התחלה"],
            ["end", "סיום"],
          ].map(([key, text]) => (
            <label
              key={key}
              className="flex flex-1 flex-col gap-1 text-purple-200"
            >
              {text}
              <input
                type="time"
                value={shift[key]}
                onChange={(e) => setShift(key, e.target.value)}
                className="rounded-2xl bg-white/10 px-3 py-2 text-moon"
              />
            </label>
          ))}
        </div>
        <div
          className="h-3 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-l from-mint to-lilac transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-purple-200">{label}</p>
      </section>

      <section className="glass space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-bold text-blush">
          <Flame className="h-5 w-5" aria-hidden /> בדיקת חומציות בוקר
        </h2>
        <p className="text-xs text-purple-200">
          1 = רגוע לגמרי • 5 = צורב מאוד (+5 מטבעות על הבדיקה)
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <button
              key={lvl}
              aria-pressed={today.acid === lvl}
              onClick={() => updateToday({ acid: lvl }, today.acid ? 0 : 5)}
              className={`flex-1 rounded-2xl py-2.5 font-bold transition ${
                today.acid === lvl
                  ? "bg-lilac text-space shadow-lg shadow-lilac/30"
                  : "bg-white/5 text-purple-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
        {today.acid >= 4 && (
          <p className="rounded-2xl border border-blush/40 bg-blush/15 p-3 text-xs text-blush">
            💡 החומציות גבוהה היום — מומלץ להתחיל עם מאפין פולנטה רך להרגעת
            הקיבה.
          </p>
        )}
      </section>

      <div
        className={`glass flex w-full items-center justify-between p-5 text-right transition ${
          today.qlaira
            ? "!border-mint/50 !bg-mint/15 text-mint"
            : "text-purple-100"
        }`}
      >
        <button
          type="button"
          aria-pressed={!!today.qlaira}
          onClick={() =>
            updateToday({ qlaira: !today.qlaira }, today.qlaira ? -10 : 10)
          }
          className="flex flex-1 items-center gap-3 text-right"
        >
          <Pill className="h-5 w-5 shrink-0" aria-hidden />
          <span>
            <span className="block font-bold">נטילת קליירה (Qlaira)</span>
            <span className="text-xs opacity-80">
              {today.qlaira ? "נלקחה היום ✨" : "+10 מטבעות ריפוי"}
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          {!today.qlaira && (
            <button
              type="button"
              onClick={triggerInAppPillReminder}
              className="flex items-center gap-1 rounded-xl bg-blush/20 px-2.5 py-1.5 text-xs font-semibold text-blush hover:bg-blush/30 transition active:scale-95"
            >
              <Bell className="h-3.5 w-3.5" />
              <span>הקפץ תזכורת</span>
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              updateToday({ qlaira: !today.qlaira }, today.qlaira ? -10 : 10)
            }
            className="text-xl"
            aria-label={today.qlaira ? "סומן שלקחת" : "סמן שלקחת"}
          >
            {today.qlaira ? "✅" : "⬜"}
          </button>
        </div>
      </div>

      {/* Push Notification Toggle for Qlaira Reminder */}
      <PillReminderToggle />
    </div>
  );
}
