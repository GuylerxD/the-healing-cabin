import { useState } from "react";
import { Check, Pencil, Plus, Trash2, Sparkles } from "lucide-react";
import { setCabin, sweetWeekKey, todayKey, useCabin } from "../store";

// Each period resets by its key: an old key simply counts as "nothing done yet".
const PERIODS = [
  {
    id: "daily",
    label: "יומי",
    reward: 1,
    bonus: 3,
    resetNote: "מתאפס כל יום",
    keyFn: () => todayKey(),
  },
  {
    id: "weekly",
    label: "שבועי",
    reward: 3,
    bonus: 5,
    resetNote: "מתאפס בכל יום ראשון",
    keyFn: () => sweetWeekKey(),
  },
  {
    id: "monthly",
    label: "חודשי",
    reward: 5,
    bonus: 10,
    resetNote: "מתאפס ב-1 לכל חודש",
    keyFn: () => todayKey().slice(0, 7),
  },
];

const DEFAULT_TITLES = {
  daily: [
    "ניקוי פנים בבוקר 🧼",
    "קרם לחות + SPF ☀️",
    "הסרת איפור וניקוי ערב 🌙",
    "סרום / קרם לילה ✨",
    "קרם גוף / ידיים 🧴",
    "חוט דנטלי 🦷",
  ],
  weekly: [
    "מסכת פנים 🧖‍♀️",
    "פילינג פנים עדין 🍓",
    "פילינג גוף 🛁",
    "מסכת שיער 💆‍♀️",
    "טיפוח ציפורניים 💅",
    "החלפת ציפית לכרית 🛏️",
  ],
  monthly: [
    "גזירת קצוות / טיפול שיער ✂️",
    "גבות והסרת שיער 🌸",
    "פדיקור ביתי 🦶",
    "ניקוי מברשות וספוגי איפור 🖌️",
    "בדיקת תוקף מוצרים 🧾",
  ],
};

const defaultSelfCare = () => ({
  lists: Object.fromEntries(
    Object.entries(DEFAULT_TITLES).map(([p, titles]) => [
      p,
      titles.map((title, i) => ({ id: `${p}-${i + 1}`, title })),
    ]),
  ),
  done: {},
  bonusPaid: {},
});

const newId = () =>
  `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

function updateSelfCare(fn) {
  setCabin((s) => fn(s, s.selfCare ?? defaultSelfCare()));
}

export default function SelfCareRoutine() {
  const selfCare = useCabin().selfCare ?? defaultSelfCare();
  const [periodId, setPeriodId] = useState("daily");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [bonusMsg, setBonusMsg] = useState(null);

  const period = PERIODS.find((p) => p.id === periodId);
  const key = period.keyFn();
  const list = selfCare.lists[periodId] ?? [];
  const doneIds =
    selfCare.done?.[periodId]?.key === key ? selfCare.done[periodId].ids : [];
  const doneCount = list.filter((t) => doneIds.includes(t.id)).length;
  const pct = list.length ? Math.round((doneCount / list.length) * 100) : 0;

  const toggleTask = (taskId) => {
    let paidBonus = false;
    updateSelfCare((s, sc) => {
      const k = period.keyFn();
      const cur = sc.done?.[periodId]?.key === k ? sc.done[periodId].ids : [];
      const isDone = cur.includes(taskId);
      const ids = isDone ? cur.filter((x) => x !== taskId) : [...cur, taskId];
      const listIds = (sc.lists[periodId] ?? []).map((t) => t.id);
      const allDone =
        listIds.length > 0 && listIds.every((id) => ids.includes(id));

      let coins = s.coins + (isDone ? -period.reward : period.reward);
      let bonusPaid = sc.bonusPaid ?? {};
      if (allDone && bonusPaid[periodId] !== k) {
        coins += period.bonus;
        bonusPaid = { ...bonusPaid, [periodId]: k };
        paidBonus = true;
      }
      return {
        ...s,
        coins: Math.max(0, coins),
        selfCare: {
          ...sc,
          done: { ...sc.done, [periodId]: { key: k, ids } },
          bonusPaid,
        },
      };
    });
    if (paidBonus) {
      setBonusMsg(`השלמת את כל הטיפוח ה${period.label}! +${period.bonus} 🪙 בונוס`);
      setTimeout(() => setBonusMsg(null), 4000);
    }
  };

  const setList = (fn) =>
    updateSelfCare((s, sc) => ({
      ...s,
      selfCare: {
        ...sc,
        lists: { ...sc.lists, [periodId]: fn(sc.lists[periodId] ?? []) },
      },
    }));

  const renameTask = (taskId, title) =>
    setList((l) => l.map((t) => (t.id === taskId ? { ...t, title } : t)));
  const deleteTask = (taskId) => setList((l) => l.filter((t) => t.id !== taskId));
  const addTask = (e) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setList((l) => [...l, { id: newId(), title: title.slice(0, 60) }]);
    setDraft("");
  };

  // Leaving edit mode drops tasks whose title was cleared
  const finishEditing = () => {
    setList((l) => l.filter((t) => t.title.trim()));
    setEditing(false);
  };

  return (
    <div className="space-y-3 text-right text-xs" dir="rtl">
      {/* Period tabs */}
      <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriodId(p.id)}
            aria-pressed={p.id === periodId}
            className={`flex-1 rounded-xl py-1.5 font-bold transition ${
              p.id === periodId
                ? "bg-pink-400 text-space shadow-md"
                : "text-purple-300 hover:bg-white/5"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-purple-200">
            <strong className="text-moon">
              {doneCount} / {list.length}
            </strong>{" "}
            בוצעו • {period.resetNote}
          </span>
          <button
            type="button"
            onClick={() => (editing ? finishEditing() : setEditing(true))}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 font-bold transition active:scale-95 ${
              editing ? "bg-mint text-space" : "bg-white/10 text-purple-200 hover:bg-white/15"
            }`}
          >
            {editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            <span>{editing ? "סיום" : "עריכה"}</span>
          </button>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-l from-pink-400 to-lilac transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-1.5">
        {list.length === 0 && (
          <p className="rounded-2xl bg-white/5 p-3 text-purple-300">
            אין משימות ברשימה — לחצי על ״עריכה״ כדי להוסיף 🌸
          </p>
        )}
        {list.map((task) => {
          const isDone = doneIds.includes(task.id);
          return editing ? (
            <div key={task.id} className="flex items-center gap-2">
              <input
                value={task.title}
                maxLength={60}
                onChange={(e) => renameTask(task.id, e.target.value)}
                aria-label="שם המשימה"
                className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-moon focus:border-lilac focus:outline-none"
              />
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                aria-label={`מחיקת ${task.title}`}
                className="rounded-xl border border-blush/30 bg-blush/10 p-2 text-blush transition hover:bg-blush/20 active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              key={task.id}
              type="button"
              onClick={() => toggleTask(task.id)}
              aria-pressed={isDone}
              className={`flex w-full items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 text-right transition active:scale-[0.99] ${
                isDone
                  ? "border-mint/50 bg-mint/15 text-mint"
                  : "border-white/10 bg-white/5 text-moon hover:bg-white/[0.08]"
              }`}
            >
              <span className={`font-semibold ${isDone ? "line-through decoration-mint/50" : ""}`}>
                {task.title}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-[10px] text-purple-300">+{period.reward} 🪙</span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-lg border ${
                    isDone ? "border-mint bg-mint text-space" : "border-white/20 bg-white/5"
                  }`}
                >
                  {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {editing && (
        <form onSubmit={addTask} className="flex gap-2">
          <input
            value={draft}
            maxLength={60}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`משימה ${period.label}ת חדשה...`}
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-moon placeholder:text-purple-400 focus:border-lilac focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex items-center gap-1 rounded-xl bg-lilac px-3 py-2 font-bold text-space transition active:scale-95 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>הוספה</span>
          </button>
        </form>
      )}

      {bonusMsg ? (
        <div className="flex items-center gap-1.5 rounded-xl border border-mint/40 bg-mint/15 p-2 font-bold text-mint animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>{bonusMsg}</span>
        </div>
      ) : (
        !editing && (
          <p className="text-[11px] text-purple-300">
            השלמת כל הרשימה ה{period.label}ת = בונוס +{period.bonus} 🪙
          </p>
        )
      )}
    </div>
  );
}
