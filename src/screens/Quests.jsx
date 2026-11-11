import { useEffect, useState } from "react";
import { Clock, Pill, Flame, Bell } from "lucide-react";
import { setCabin, updateToday, useCabin, useToday } from "../store";
import { shiftProgress } from "../lib/shift";
import PillReminderToggle from "../components/PillReminderToggle";
import { triggerInAppPillReminder } from "../lib/pillReminder";
import CollapsibleCard from "../components/CollapsibleCard";

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
      {/* 1. המשמרת שלי (Collapsible) */}
      <CollapsibleCard
        id="quests-shift"
        title="המשמרת שלי"
        badge={label}
        icon={Clock}
        defaultOpen={true}
      >
        <div className="space-y-3">
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
        </div>
      </CollapsibleCard>

      {/* 2. בדיקת חומציות בוקר (Collapsible) */}
      <CollapsibleCard
        id="quests-acid"
        title="בדיקת חומציות בוקר"
        badge={
          today.acid
            ? `רמת חומציות נוכחית: ${today.acid}`
            : "1 = רגוע • 5 = צורב (+5 🪙)"
        }
        icon={Flame}
        defaultOpen={true}
      >
        <div className="space-y-3">
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
        </div>
      </CollapsibleCard>

      {/* 3. נטילת קליירה (Collapsible) */}
      <CollapsibleCard
        id="quests-qlaira"
        title="נטילת קליירה (Qlaira)"
        badge={today.qlaira ? "נלקחה היום ✨" : "גלולה יומית (+10 🪙)"}
        icon={Pill}
        defaultOpen={true}
        headerClassName={
          today.qlaira ? "!border-mint/50 !bg-mint/10 text-mint" : ""
        }
      >
        <div className="flex items-center justify-between gap-3 text-right">
          <div className="text-xs text-purple-200">
            {today.qlaira
              ? "כל הכבוד! הגלולה היומית סומנה בהצלחה ✨"
              : "סמני ברגע שלקחת כדי לשמור על רצף ומחזור מאוזן"}
          </div>

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
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                today.qlaira ? "bg-mint text-space" : "bg-white/10 text-moon"
              }`}
            >
              {today.qlaira ? "✅ נלקחה (+10)" : "סמן שלקחתי 💊"}
            </button>
          </div>
        </div>
      </CollapsibleCard>

      {/* Push Notification Toggle for Qlaira Reminder (Collapsible) */}
      <CollapsibleCard
        id="quests-push-settings"
        title="הגדרות תזכורת יומית (Push)"
        badge="שעת התראה ובדיקה"
        icon={Bell}
        defaultOpen={false}
      >
        <PillReminderToggle />
      </CollapsibleCard>
    </div>
  );
}
