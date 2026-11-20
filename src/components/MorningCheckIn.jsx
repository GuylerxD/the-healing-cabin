import { useState } from "react";
import {
  Pill,
  Flame,
  Bell,
  ChevronRight,
  ChevronLeft,
  Calendar,
} from "lucide-react";
import { updateDay, useCabin, dateKeyWithOffset } from "../store";
import { triggerInAppPillReminder } from "../lib/pillReminder";
import CollapsibleCard from "./CollapsibleCard";

const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function getFormattedDayDetails(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const dayName = HEBREW_DAYS[d.getDay()];
  const formatted = d.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "numeric",
  });

  const title =
    dayOffset === 0
      ? `היום (יום ${dayName}, ${formatted})`
      : dayOffset === -1
        ? `אתמול (יום ${dayName}, ${formatted})`
        : `יום ${dayName}, ${formatted}`;

  return { displayDateTitle: title, dayNameHe: dayName };
}

// Morning check-in: acid level + Zoely pill, with a date switcher for marking past days.
// Card ids stay "quests-*" (from the removed הקצב tab) so saved collapse state is kept.
export default function MorningCheckIn() {
  const { days = {} } = useCabin();
  const [dayOffset, setDayOffset] = useState(0); // 0 = today, -1 = yesterday, etc.
  const activeDateKey = dateKeyWithOffset(dayOffset);
  const activeDayData = days[activeDateKey] ?? {};

  const isToday = dayOffset === 0;
  const { displayDateTitle, dayNameHe } = getFormattedDayDetails(dayOffset);

  return (
    <div className="space-y-4">
      {/* Date switcher — applies only to the acid check and the pill */}
      <div className="space-y-1.5 rounded-2xl border border-white/10 bg-white/5 p-2.5 text-xs text-moon">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setDayOffset((prev) => prev - 1)}
            className="flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 text-purple-200 transition hover:bg-white/15 active:scale-95"
            title="יום קודם"
          >
            <ChevronRight className="h-4 w-4" />
            <span>יום קודם</span>
          </button>

          <div className="flex items-center gap-1.5 font-bold">
            <Calendar className="h-4 w-4 text-lilac" />
            <span className={isToday ? "text-mint" : "font-extrabold text-blush"}>
              {displayDateTitle}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {dayOffset < 0 ? (
              <button
                type="button"
                onClick={() => setDayOffset((prev) => Math.min(0, prev + 1))}
                className="flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 text-purple-200 transition hover:bg-white/15 active:scale-95"
                title="יום הבא"
              >
                <span>יום הבא</span>
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-16" />
            )}
          </div>
        </div>
        <p className="text-center text-[11px] text-purple-300">
          📅 צ׳ק-אין בוקר — אפשר לחזור לימים קודמים כדי לסמן חומציות וגלולה
        </p>
      </div>

      {!isToday && (
        <div className="rounded-xl border border-blush/40 bg-blush/10 p-2.5 text-center text-xs font-semibold text-blush">
          💡 את נמצאת בעריכת נתוני עבר ({displayDateTitle}). הסימון של חומציות
          וגלולה יעודכן רטרואקטיבית לתאריך זה.
        </div>
      )}

      {/* Morning acid check */}
      <CollapsibleCard
        id="quests-acid"
        title={`בדיקת חומציות בוקר ${!isToday ? `(${dayNameHe})` : ""}`}
        badge={
          activeDayData.acid
            ? `רמת חומציות: ${activeDayData.acid}`
            : "1 = רגוע • 5 = צורב (+2 🪙)"
        }
        icon={Flame}
        defaultOpen={true}
      >
        <div className="space-y-3">
          <p className="text-xs text-purple-200">
            1 = רגוע לגמרי • 5 = צורב מאוד (+2 מטבעות על הבדיקה)
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                aria-pressed={activeDayData.acid === lvl}
                onClick={() =>
                  updateDay(
                    activeDateKey,
                    { acid: lvl },
                    activeDayData.acid ? 0 : 2,
                  )
                }
                className={`flex-1 rounded-2xl py-2.5 font-bold transition ${
                  activeDayData.acid === lvl
                    ? "bg-lilac text-space shadow-lg shadow-lilac/30"
                    : "bg-white/5 text-purple-200"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          {activeDayData.acid >= 4 && (
            <p className="rounded-2xl border border-blush/40 bg-blush/15 p-3 text-xs text-blush">
              💡 החומציות גבוהה — מומלץ להתחיל עם מאפין פולנטה רך להרגעת הקיבה.
            </p>
          )}
        </div>
      </CollapsibleCard>

      {/* Zoely pill */}
      <CollapsibleCard
        id="quests-qlaira"
        title={`נטילת זואלי (Zoely) ${!isToday ? `(${dayNameHe})` : ""}`}
        badge={
          activeDayData.qlaira
            ? `נלקחה (${displayDateTitle}) ✨`
            : "גלולה יומית (+4 🪙)"
        }
        icon={Pill}
        defaultOpen={true}
        headerClassName={
          activeDayData.qlaira ? "!border-mint/50 !bg-mint/10 text-mint" : ""
        }
      >
        <div className="flex items-center justify-between gap-3 text-right">
          <div className="text-xs text-purple-200">
            {activeDayData.qlaira
              ? `הגלולה עבור ${displayDateTitle} סומנה בהצלחה ✨`
              : `סמני אם נטלת את הגלולה ב-${displayDateTitle}`}
          </div>

          <div className="flex items-center gap-2">
            {!activeDayData.qlaira && isToday && (
              <button
                type="button"
                onClick={triggerInAppPillReminder}
                className="flex items-center gap-1 rounded-xl bg-blush/20 px-2.5 py-1.5 text-xs font-semibold text-blush transition hover:bg-blush/30 active:scale-95"
              >
                <Bell className="h-3.5 w-3.5" />
                <span>הקפץ תזכורת</span>
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                updateDay(
                  activeDateKey,
                  { qlaira: !activeDayData.qlaira },
                  activeDayData.qlaira ? -4 : 4,
                )
              }
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeDayData.qlaira
                  ? "bg-mint text-space"
                  : "bg-white/10 text-moon"
              }`}
            >
              {activeDayData.qlaira ? "✅ נלקחה (+4)" : "סמן שלקחתי 💊"}
            </button>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
