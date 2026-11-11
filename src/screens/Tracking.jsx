import { useState } from "react";
import { Scale, Shirt, Zap, Sparkles } from "lucide-react";
import { setCabin, todayKey, updateToday, useCabin, useToday } from "../store";
import { compareBy, daysUntilNextWeighIn, smooth } from "../lib/tracking";
import CollapsibleCard from "../components/CollapsibleCard";

const FIT = [
  ["tight", "צמוד"],
  ["comfy", "נוח"],
  ["loose", "משוחרר"],
];
const PAIN = ["אין", "קל", "בינוני", "חזק"]; // index = 0..3
const MOOD = ["שפוף 🌧️", "רגוע ⛅", "טוב ☀️", "קורן ✨"];
const WEIGH_REWARD = 10;

function TrendChart({ weighIns }) {
  if (weighIns.length < 2)
    return (
      <p className="text-xs text-purple-300">המגמה תופיע אחרי שתי שקילות 🌱</p>
    );
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
  const pain = compareBy(days, "pain", predicate);
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
  const validKg = kgNum >= 30 && kgNum <= 250;

  const saveWeight = () => {
    if (!validKg || wait > 0) return;
    setCabin((s) => ({
      ...s,
      coins: s.coins + WEIGH_REWARD,
      weighIns: [...s.weighIns, { date: todayKey(), kg: kgNum }],
    }));
    setKg("");
  };

  return (
    <div className="space-y-4">
      {/* 1. שקילה שבועית (Collapsible) */}
      <CollapsibleCard
        id="tracking-weighin"
        title="שקילה שבועית רגועה"
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
            <p className="rounded-2xl bg-white/5 p-3 text-xs text-purple-200">
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
                className="min-w-0 flex-1 rounded-2xl bg-white/10 px-4 py-2 text-moon placeholder:text-purple-300"
              />
              <button
                disabled={!validKg}
                onClick={saveWeight}
                className="rounded-2xl bg-mint px-4 py-2 text-sm font-bold text-space disabled:opacity-40"
              >
                שמירה +{WEIGH_REWARD}
              </button>
            </div>
          )}
        </div>
      </CollapsibleCard>

      {/* 2. בגדי היעד (Collapsible) */}
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
                  : "bg-white/5 text-purple-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </CollapsibleCard>

      {/* 3. אנרגיה, מצב רוח ו-PCOS (Collapsible) */}
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
            <p className="text-xs text-purple-200">
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
                      : "bg-white/5 text-purple-200"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-purple-200">מצב נפשי ורגשי היום 🧘‍♀️</p>
            <div className="grid grid-cols-4 gap-2">
              {MOOD.map((label, n) => (
                <button
                  key={label}
                  aria-pressed={today.mood === n}
                  onClick={() => updateToday({ mood: n })}
                  className={`rounded-2xl py-2.5 text-xs font-bold transition ${
                    today.mood === n
                      ? "bg-blush text-space"
                      : "bg-white/5 text-purple-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-purple-200">כאבי גב היום 🦴</p>
            <div className="grid grid-cols-4 gap-2">
              {PAIN.map((label, n) => (
                <button
                  key={label}
                  aria-pressed={today.backPain === n}
                  onClick={() => updateToday({ backPain: n })}
                  className={`rounded-2xl py-2.5 text-sm font-bold transition ${
                    today.backPain === n
                      ? "bg-mint text-space"
                      : "bg-white/5 text-purple-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* 4. מה עוזר לי? (Collapsible) */}
      <CollapsibleCard
        id="tracking-history"
        title="מה עוזר לי? (תובנות)"
        badge="ממוצע בימים עם / בלי"
        icon={Sparkles}
        defaultOpen={false}
      >
        <div className="space-y-2">
          <p className="text-xs text-purple-300">
            ממוצע בימים עם / בלי (מופיע אחרי 3 ימים בכל קבוצה)
          </p>
          <table className="w-full text-xs text-purple-100">
            <thead className="text-purple-300">
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
      </CollapsibleCard>
    </div>
  );
}
