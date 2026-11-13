import { useState, useRef, useEffect } from "react";
import {
  Check,
  CheckCircle2,
  Lamp,
  Sparkles,
  Flame,
  CakeSlice,
  Dog,
  Cat,
  Droplets,
  Coffee,
  Sun,
  Heart,
  Flower2,
  Gift,
} from "lucide-react";
import { useCabin, setCabin } from "../store";

const HOME_TASKS = [
  {
    id: "facial-care",
    title: "טיפול פנים מפנק ✨",
    desc: "ניקוי עדין, מסכה או לחות לפנים לרגע של טיפוח אישי ורוגע",
    icon: Sparkles,
    color: "text-pink-300",
  },
  {
    id: "candles",
    title: "הדלקת נרות בבית 🕯️",
    desc: "יצירת אווירה חמימה, רכה ומרגיעה ברחבי הבית",
    icon: Flame,
    color: "text-amber-300",
  },
  {
    id: "baking-cake",
    title: "אפיית עוגה מרגיעה 🍰",
    desc: "אפייה בנחת שממלאת את הבית בריח ביתי מתוק ונעים",
    icon: CakeSlice,
    color: "text-orange-300",
  },
  {
    id: "brush-mochi",
    title: "סירוק של מוצ׳י 🐶",
    desc: "טיפוח הפרווה וזמן חיבור רגוע ונעים עם מוצ׳י",
    icon: Dog,
    color: "text-lilac",
  },
  {
    id: "brush-charlie",
    title: "סירוק של צ׳רלי 🐱",
    desc: "הברשה עדינה, גרגורים וזמן פינוק משותף עם צ׳רלי",
    icon: Cat,
    color: "text-sky-300",
  },
  {
    id: "plants",
    title: "השקיית צמחים (סינגוניום, גוזמניה, דיפנבכיה) 🪴",
    desc: "טיפוח הצמחים הירוקים בבית להכנסת אנרגיה של צמיחה ושלווה",
    icon: Droplets,
    color: "text-emerald-300",
  },
  {
    id: "herbal-tea",
    title: "הכנת חליטת תה / משקה חם מרגיע ☕",
    desc: "רגע של הפסקה, חמימות ונשימה עמוקה עם כוס תה נעימה",
    icon: Coffee,
    color: "text-amber-200",
  },
  {
    id: "fresh-air",
    title: "אוורור הבית ופתיחת תריסים לאור טבעי 🪟",
    desc: "הכנסת אוויר צח ואור נעים לרענון האנרגיה בחדר",
    icon: Sun,
    color: "text-yellow-300",
  },
  {
    id: "body-lotion",
    title: "מריחת קרם גוף / ידיים ריחני 🧴",
    desc: "השלמת שגרת הטיפוח האישי בתחושה רכה ונעימה",
    icon: Heart,
    color: "text-rose-300",
  },
];

const UNLOCKABLE_FURNITURE = [
  {
    id: "salt-lamp",
    name: "מנורת מלח הימלאיה 🪨🧡",
    desc: "תאורה כתומה חמימה ויונים מרגיעים לנשימה בחדר",
  },
  {
    id: "tarnaby-lamp",
    name: "מנורת אווירה TÄRNABY 🕯️✨",
    desc: "מנורת רטרו נורדית נעימה לרגעי קריאה והתאוששות",
  },
];

function getDailyTasks(tasks, count = 3) {
  const dateStr = new Date().toLocaleDateString("en-CA");
  let seed = [...dateStr].reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0,
    0,
  );
  const pool = [...tasks];
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) | 0;
    const j = Math.abs(seed) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export default function HomeResetOrganization() {
  const { homeResetTasks = {}, unlockedFurniture = [] } = useCabin();
  const [justUnlocked, setJustUnlocked] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [rouletteTask, setRouletteTask] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const rouletteTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(rouletteTimerRef.current);
  }, []);

  const dailyTasks = getDailyTasks(HOME_TASKS, 3);
  const visibleTasks = showAllTasks ? HOME_TASKS : dailyTasks;
  const completedCount = visibleTasks.filter(
    (t) => !!homeResetTasks[t.id],
  ).length;
  const isAllCompleted = completedCount === visibleTasks.length;

  const handleSpinFlowerRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const undonePool = HOME_TASKS.filter((t) => !homeResetTasks[t.id]);
    const pool = undonePool.length > 0 ? undonePool : HOME_TASKS;
    let counter = 0;
    const totalFlips = 12;

    const flip = () => {
      counter += 1;
      const randomIndex = Math.floor(Math.random() * pool.length);
      setRouletteTask(pool[randomIndex]);

      if (counter < totalFlips) {
        rouletteTimerRef.current = setTimeout(flip, 65 + counter * 15);
      } else {
        setIsSpinning(false);
      }
    };

    flip();
  };

  const handleToggleTask = (taskId) => {
    const isDone = !!homeResetTasks[taskId];
    const nextTasks = { ...homeResetTasks, [taskId]: !isDone };

    // Check if completing daily tasks unlocks furniture
    const newlyAllCompleted = dailyTasks.every((t) => nextTasks[t.id]);
    let nextFurniture = [...unlockedFurniture];
    let unlockedItem = null;

    if (newlyAllCompleted && !isDone) {
      // Find next furniture to unlock
      const remainingToUnlock = UNLOCKABLE_FURNITURE.filter(
        (f) => !unlockedFurniture.includes(f.id),
      );
      if (remainingToUnlock.length > 0) {
        unlockedItem = remainingToUnlock[0];
        nextFurniture.push(unlockedItem.id);
      }
    }

    setCabin((s) => ({
      ...s,
      coins: s.coins + (!isDone ? 15 : -15),
      homeResetTasks: nextTasks,
      unlockedFurniture: nextFurniture,
    }));

    if (unlockedItem) {
      setJustUnlocked(unlockedItem);
      setTimeout(() => setJustUnlocked(null), 6000);
    }
  };

  const handleResetChecklist = () => {
    setCabin((s) => ({
      ...s,
      homeResetTasks: {},
    }));
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Header & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lilac/20 text-lilac">
            <Lamp className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-moon">
              שגרת טיפוח הבית ואיפוס שבועי
            </h4>
            <p className="text-[11px] text-purple-300">
              בית רגוע ומסודר = שקט נפשי וריפוי עמוק
            </p>
          </div>
        </div>

        <span className="rounded-full bg-lilac/15 border border-lilac/30 px-2.5 py-0.5 text-[11px] font-bold text-lilac">
          {completedCount} / {visibleTasks.length} בוצעו
        </span>
      </div>

      {/* Flower Roulette Button & Result */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleSpinFlowerRoulette}
          disabled={isSpinning}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-pink-300/35 bg-gradient-to-r from-pink-400/20 via-lilac/20 to-mint/20 px-4 py-2.5 text-xs font-bold text-moon shadow-sm transition hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
        >
          <Flower2
            className={`h-4 w-4 text-pink-300 ${isSpinning ? "animate-spin" : ""}`}
          />
          <span>
            {isSpinning
              ? "🌸 הפרחים מסתובבים... 🌺"
              : "🌸 רולטת פרחים — תבחרי לי מה לעשות! 🌼"}
          </span>
        </button>

        {rouletteTask && (
          <div className="rounded-2xl border border-pink-300/40 bg-pink-400/10 p-3.5 space-y-2 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-pink-200">
                🌺 רולטת הפרחים בחרה לך:
              </span>
              {!isSpinning && (
                <button
                  type="button"
                  onClick={() => handleToggleTask(rouletteTask.id)}
                  className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition active:scale-95 ${
                    homeResetTasks[rouletteTask.id]
                      ? "bg-mint text-space"
                      : "bg-white/15 text-moon hover:bg-white/25"
                  }`}
                >
                  {homeResetTasks[rouletteTask.id]
                    ? "✅ בוצע!"
                    : "סמן כבוצע (+15 🪙)"}
                </button>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-moon">{rouletteTask.title}</p>
              <p className="text-[11px] text-purple-200 mt-0.5">
                {rouletteTask.desc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Daily rotation toggle */}
      <div className="flex items-center justify-between text-[11px] text-purple-300 px-1">
        <span>
          {showAllTasks
            ? `כל משימות הטיפוח (${HOME_TASKS.length})`
            : "מתחלפות אוטומטית כל יום ✨"}
        </span>
        <button
          type="button"
          onClick={() => setShowAllTasks((v) => !v)}
          className="text-lilac font-semibold hover:underline"
        >
          {showAllTasks ? "הצג רק 3 להיום" : `הצג הכל (${HOME_TASKS.length})`}
        </button>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {visibleTasks.map((task) => {
          const isDone = !!homeResetTasks[task.id];
          const Icon = task.icon;

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => handleToggleTask(task.id)}
              className={`w-full flex items-start justify-between rounded-2xl border p-3.5 transition-all active:scale-[0.98] ${
                isDone
                  ? "bg-mint/15 border-mint/50 text-mint"
                  : "bg-white/5 border-white/10 text-moon hover:bg-white/[0.08]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border mt-0.5 transition ${
                    isDone
                      ? "bg-mint text-space border-mint shadow-md shadow-mint/20"
                      : "bg-white/10 border-white/15 " + task.color
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-xs block">{task.title}</span>
                  <p className="text-[11px] text-purple-200 mt-0.5 leading-snug">
                    {task.desc}
                  </p>
                </div>
              </div>

              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border mt-1 ${
                  isDone
                    ? "bg-mint text-space border-mint"
                    : "border-white/20 bg-white/5"
                }`}
              >
                {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Rewards Status & Unlocked Furniture */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-moon font-semibold">
          <div className="flex items-center gap-1.5 text-purple-200">
            <Gift className="h-4 w-4 text-lilac" />
            <span>פרס חדר הריפוי הוירטואלי:</span>
          </div>
          <span className="text-[11px] text-purple-300">
            {unlockedFurniture.length} רהיטי אווירה נפתחו
          </span>
        </div>

        <p className="text-[11px] text-purple-300">
          השלמת 3 המשימות השבוע פותחת רהיט אסתטי מרגיע לחדר של מוצ׳י וצ׳ארלי 🛋️
        </p>

        {isAllCompleted && (
          <div className="flex items-center justify-between rounded-xl bg-mint/15 border border-mint/40 p-2 text-mint font-bold text-[11px]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>כל משימות הבית הושלמו לשבוע זה! ✨ (+45 🪙)</span>
            </span>
            <button
              type="button"
              onClick={handleResetChecklist}
              className="text-[10px] text-purple-300 hover:underline"
            >
              איפוס לשבוע הבא
            </button>
          </div>
        )}
      </div>

      {/* Celebration Banner if unlocked furniture */}
      {justUnlocked && (
        <div className="rounded-2xl border border-mint/40 bg-gradient-to-r from-mint/20 to-lilac/20 p-3.5 text-xs text-mint text-center space-y-1 animate-fade-in shadow-lg">
          <span className="font-extrabold text-sm block">
            🎉 רהיט חדש נפתח לחדר הריפוי: {justUnlocked.name}!
          </span>
          <p className="text-[11px] text-purple-100">{justUnlocked.desc}</p>
        </div>
      )}
    </div>
  );
}
