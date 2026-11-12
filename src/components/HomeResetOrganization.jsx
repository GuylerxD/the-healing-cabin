import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Lamp,
  Wind,
  Droplets,
  Bot,
  Gift,
} from "lucide-react";
import { useCabin, setCabin } from "../store";

const HOME_TASKS = [
  {
    id: "roborock",
    title: "הפעלת רובורוק 🤖",
    desc: "שאיבה ושטיפה אוטומטית של הרצפות לשמירה על מרחב נקי ללא מאמץ גב",
    icon: Bot,
    color: "text-sky-300",
  },
  {
    id: "air-purifier",
    title: "הפעלת מטהר אוויר שיאומי 🍃",
    desc: "סינון אבק ואלרגנים לנשימה קלה ורגיעה מהאסתמה",
    icon: Wind,
    color: "text-mint",
  },
  {
    id: "plants",
    title: "השקיית צמחים (סינגוניום, גוזמניה, דיפנבכיה) 🪴",
    desc: "טיפוח הצמחים הירוקים בבית להכנסת אנרגיה של צמיחה ושלווה",
    icon: Droplets,
    color: "text-emerald-300",
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

export default function HomeResetOrganization() {
  const { homeResetTasks = {}, unlockedFurniture = [] } = useCabin();
  const [justUnlocked, setJustUnlocked] = useState(null);

  const completedCount = HOME_TASKS.filter(
    (t) => !!homeResetTasks[t.id],
  ).length;
  const isAllCompleted = completedCount === HOME_TASKS.length;

  const handleToggleTask = (taskId) => {
    const isDone = !!homeResetTasks[taskId];
    const nextTasks = { ...homeResetTasks, [taskId]: !isDone };

    // Check if this action completes all tasks and unlocks furniture
    const newlyAllCompleted = HOME_TASKS.every((t) => nextTasks[t.id]);
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
          {completedCount} / {HOME_TASKS.length} בוצעו
        </span>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {HOME_TASKS.map((task) => {
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
