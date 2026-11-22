import { useState } from "react";
import { Scale, Shirt, Zap, Sparkles, TrendingDown, Lightbulb } from "lucide-react";
import { todayKey, updateToday, useCabin, useToday } from "../store";
import { compareBy, daysUntilNextWeighIn, smooth } from "../lib/tracking";
import {
  isValidWeight,
  recordWeighIn,
  WEEKLY_WEIGH_REWARD as WEIGH_REWARD,
} from "../lib/weight";
import CollapsibleCard from "../components/CollapsibleCard";
import JourneyToEastWeightTracker from "../components/JourneyToEastWeightTracker";
import MorningCheckIn from "../components/MorningCheckIn";
import CoinAmount from "../components/CoinAmount";

const FIT = [
  ["tight", "צמוד"],
  ["comfy", "נוח"],
  ["loose", "משוחרר"],
];
const PAIN = ["אין", "קל", "בינוני", "חזק"]; // index = 0..3
const MOOD = ["שפוף 🌧️", "רגוע ⛅", "טוב ☀️", "קורן ✨"];

function TrendChart({ weighIns }) {
  if (weighIns.length < 2) {
    const first = weighIns.length === 0;
    return (
      <div className="relative flex h-32 flex-col items-start justify-end gap-1 overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4">
        <svg
          viewBox="0 0 300 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full opacity-25"
          dir="ltr"
          aria-hidden
        >
          <polyline
            points="10,12 80,20 150,18 220,30 290,36"
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth="3"
            strokeDasharray="6 8"
            strokeLinecap="round"
          />
        </svg>
        <TrendingDown className="relative h-5 w-5 text-lilac" aria-hidden />
        <p className="relative text-sm font-semibold text-moon">
          {first ? "עוד אין שקילות" : "עוד שקילה אחת והגרף יופיע"}
        </p>
        <p className="relative text-xs text-muted">
          {first
            ? "אחרי שתי שקילות שבועיות יופיע כאן קו המגמה החודשי."
            : "הקו מחליק תנודות של יום־יומיים ומראה רק את הכיוון הכללי."}
        </p>
      </div>
    );
  }
  const pts = smooth(weighIns.slice(-16).map((w) => w.kg));
  const min = Math.min(...pts) - 1;
  const max = Math.max(...pts) + 1;
  const xy = pts.map((v, i) => [
    10 + (i / (pts.length - 1)) * 280,
    90 - ((v - min) / (max - min)) * 80,
  ]);
  return (
    <svg
      viewBox="0 0 300 100"
      className="w-full"
      dir="ltr"
      role="img"
      aria-label="מגמה חודשית מוחלקת"
    >
      <polyline
        points={xy.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="var(--color-mint)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {xy.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="var(--color-lilac)" />
      ))}
    </svg>
  );
}

function Insight({ label, days, predicate }) {
  const pain = compareBy(days, "backPain", predicate);
  const energy = compareBy(days, "energy", predicate);
  const fmt = (n) => (n == null ? "—" : n.toFixed(1));
  return (
    <tr className="border-t border-white/10">
      <td className="py-2">{label}</td>
      <td className="py-2 text-center">
        {fmt(pain.yes)} / {fmt(pain.no)}
      </td>
      <td className="py-2 text-center">
        {fmt(energy.yes)} / {fmt(energy.no)}
      </td>
    </tr>
  );
}

export default function Tracking() {
  const { weighIns, days } = useCabin();
  const today = useToday();
  const [kg, setKg] = useState("");
  const wait = daysUntilNextWeighIn(weighIns, todayKey());
  const kgNum = Number(kg);
  const hasInsights = [
    (d) => d.workouts?.length > 0,
    (d) => !!d.earlyDinner,
  ].some((pred) =>
    ["backPain", "energy"].some((f) => {
      const c = compareBy(days, f, pred);
      return c.yes != null || c.no != null;
    }),
  );
  const trackedDays = Object.values(days).filter(
    (d) => d.energy != null || d.backPain != null,
  ).length;
  const validKg = isValidWeight(kgNum);

  const saveWeight = () => {
    if (!validKg || wait > 0) return;
    recordWeighIn(kgNum);
    setKg("");
  };

  return (
    <div className="space-y-4">
      {/* 1. צ׳ק-אין בוקר: חומציות + זואלי (moved from the removed הקצב tab) */}
      <MorningCheckIn />

      {/* 2. אנרגיה, מצב רוח ו-PCOS (Collapsible) */}
      <CollapsibleCard
        id="tracking-energy"
        title="אנרגיה, מצב רוח ו-PCOS"
        badge={
          today.energy
            ? `אנרגיה: ${today.energy}/5 • גב: ${PAIN[today.backPain ?? 0]}`
            : "מעקב יומי קצר"
        }
        icon={Zap}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-soft">
              רמת אנרגיה (1 = מרוקנת • 5 = מלאת כוח)
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  aria-pressed={today.energy === n}
                  onClick={() => updateToday({ energy: n })}
                  className={`flex-1 rounded-2xl py-2.5 font-bold transition ${
                    today.energy === n
                      ? "bg-lilac text-space"
                      : "bg-white/5 text-soft"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-soft">מצב נפשי ורגשי היום 🧘‍♀️</p>
            <div className="grid grid-cols-4 gap-2">
              {MOOD.map((label, n) => (
                <button
                  key={label}
                  aria-pressed={today.mood === n}
                  onClick={() => updateToday({ mood: n })}
                  className={`rounded-2xl py-2.5 text-xs font-bold transition ${
                    today.mood === n
                      ? "bg-lilac text-space"
                      : "bg-white/5 text-soft"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-soft">כאבי גב היום 🦴</p>
            <div className="grid grid-cols-4 gap-2">
              {PAIN.map((label, n) => (
                <button
                  key={label}
                  aria-pressed={today.backPain === n}
                  onClick={() => updateToday({ backPain: n })}
                  className={`rounded-2xl py-2.5 text-sm font-bold transition ${
                    today.backPain === n
                      ? "bg-lilac text-space"
                      : "bg-white/5 text-soft"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* 3. בגדי היעד (Collapsible) */}
      <CollapsibleCard
        id="tracking-quick-check"
        title="איך מרגישים בגדי היעד היום?"
        badge={
          today.fit
            ? FIT.find(([id]) => id === today.fit)?.[1] || "סומן"
            : "בחירת תחושת בגדים"
        }
        icon={Shirt}
        defaultOpen={true}
      >
        <div className="grid grid-cols-3 gap-2 text-sm font-bold">
          {FIT.map(([id, label]) => (
            <button
              key={id}
              aria-pressed={today.fit === id}
              onClick={() => updateToday({ fit: id })}
              className={`rounded-2xl py-3 transition ${
                today.fit === id
                  ? "bg-mint/20 text-mint ring-1 ring-mint"
                  : "bg-white/5 text-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </CollapsibleCard>

      {/* 4. המסע למזרח 2027: מפת ירידה במשקל (Gamified Weight Tracker) */}
      <CollapsibleCard
        id="tracking-journey-weight"
        title="המסע למזרח 2027: מפת ירידה במשקל"
        badge="מ-99 ק״ג עד 60 ק״ג • תחנות סיאול וטוקיו"
        icon={Scale}
        defaultOpen={true}
      >
        <JourneyToEastWeightTracker />
      </CollapsibleCard>

      {/* 5. שקילה שבועית וגרף מגמה (Collapsible) */}
      <CollapsibleCard
        id="tracking-weighin"
        title="שקילה שבועית רגועה וגרף מגמה"
        badge={
          weighIns.length > 0
            ? `${weighIns[weighIns.length - 1].kg} ק״ג אחרון • ${wait > 0 ? `עוד ${wait} ימים לשקילה` : "מוכנה לשקילה"}`
            : "שקילה אחת לשבוע"
        }
        icon={Scale}
        defaultOpen={true}
      >
        <div className="space-y-3">
          <TrendChart weighIns={weighIns} />
          {wait > 0 ? (
            <p className="rounded-2xl bg-white/5 p-3 text-xs text-soft">
              השקילה הבאה בעוד {wait} ימים 🌙 הגוף משתנה לאט — וזה בסדר גמור.
            </p>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="משקל בק״ג"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                className="min-w-0 flex-1 rounded-2xl bg-white/10 px-4 py-2 text-moon placeholder:text-muted"
              />
              <button
                disabled={!validKg}
                onClick={saveWeight}
                className="flex items-center gap-1 rounded-2xl bg-lilac px-4 py-2 text-sm font-bold text-space disabled:opacity-40"
              >
                שמירה · <CoinAmount amount={`+${WEIGH_REWARD}`} />
              </button>
            </div>
          )}
        </div>
      </CollapsibleCard>

      {/* 6. מה עוזר לי? (Collapsible) */}
      <CollapsibleCard
        id="tracking-history"
        title="מה עוזר לי? (תובנות)"
        badge="ממוצע בימים עם / בלי"
        icon={Sparkles}
        defaultOpen={false}
      >
        {!hasInsights ? (
          <div className="flex items-start gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-lilac" aria-hidden />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-moon">
                התובנות נבנות מהמעקב היומי
              </p>
              <p className="text-xs text-muted">
                אחרי 3 ימים עם אימון ו־3 ימים בלי, תראי כאן אם אימון וארוחת ערב
                מוקדמת משנים את כאבי הגב והאנרגיה שלך.
              </p>
              <p className="text-xs text-soft">
                {trackedDays === 0
                  ? "התחילי בסימון אנרגיה וכאבי גב למעלה."
                  : `עד עכשיו: ${trackedDays} ימי מעקב.`}
              </p>
            </div>
          </div>
        ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted">
            ממוצע בימים עם / בלי (מופיע אחרי 3 ימים בכל קבוצה)
          </p>
          <table className="w-full text-xs text-moon">
            <thead className="text-muted">
              <tr>
                <th className="py-1 text-right font-medium"></th>
                <th className="py-1 font-medium">כאב (0-3)</th>
                <th className="py-1 font-medium">אנרגיה (1-5)</th>
              </tr>
            </thead>
            <tbody>
              <Insight
                label="אימון 🥊"
                days={days}
                predicate={(d) => d.workouts?.length > 0}
              />
              <Insight
                label="ערב מוקדם 🌙"
                days={days}
                predicate={(d) => !!d.earlyDinner}
              />
            </tbody>
          </table>
        </div>
        )}
      </CollapsibleCard>
    </div>
  );
}
