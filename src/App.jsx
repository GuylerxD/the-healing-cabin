import { useState, useEffect } from "react";
import {
  Sparkles,
  Dumbbell,
  Utensils,
  HeartHandshake,
  House,
  Coins,
  ChefHat,
  ChevronsUp,
  ChevronsDown,
  Compass,
} from "lucide-react";
import { useCabin, updateToday, setAllSectionsCollapsed } from "./store";
import Quests from "./screens/Quests";
import Nutrition from "./screens/Nutrition";
import MealPrep from "./screens/MealPrep";
import Movement from "./screens/Movement";
import Tracking from "./screens/Tracking";
import Cabin from "./screens/Cabin";
import Lifestyle from "./screens/Lifestyle";
import SmartBubbles from "./components/SmartBubbles";
import InAppPillReminder from "./components/InAppPillReminder";

const TABS = [
  { id: "quests", label: "הקצב", icon: Sparkles, Screen: Quests },
  { id: "movement", label: "אימונים", icon: Dumbbell, Screen: Movement },
  { id: "nutrition", label: "תזונה", icon: Utensils, Screen: Nutrition },
  { id: "mealprep", label: "Meal Prep", icon: ChefHat, Screen: MealPrep },
  {
    id: "lifestyle",
    label: "Lifestyle",
    icon: HeartHandshake,
    Screen: Lifestyle,
  },
  { id: "tracking", label: "מעקב", icon: Compass, Screen: Tracking },
  { id: "cabin", label: "החדר", icon: House, Screen: Cabin },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("quests");
  const { coins, longGoal, collapsedSections } = useCabin();
  const { Screen } = TABS.find((t) => t.id === activeTab);

  // Check if all known sections are currently collapsed
  const isAllCollapsed =
    collapsedSections &&
    Object.keys(collapsedSections).length > 0 &&
    Object.values(collapsedSections).filter(Boolean).length >= 5;

  const handleToggleCollapseAll = () => {
    setAllSectionsCollapsed(!isAllCollapsed);
  };

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;
    const handler = (event) => {
      if (event.data?.type === "QLAIRA_PILL_TAKEN") {
        updateToday({ qlaira: true }, 10);
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handler);
  }, []);

  return (
    <div className="min-h-dvh pb-[calc(7rem+env(safe-area-inset-bottom))] select-none">
      {/* In-App Floating Pill Reminder Popup */}
      <InAppPillReminder />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-space/80 backdrop-blur-md pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-bold text-blush tracking-wide">
              The Healing Cabin ✨
            </h1>
            <p className="text-xs text-purple-300">
              {longGoal ? `🌟 ${longGoal}` : "צעד קטן כל יום 🌱"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* כפתור כווץ הכל / פתח הכל למעלה */}
            <button
              type="button"
              onClick={handleToggleCollapseAll}
              className="flex items-center gap-1 rounded-2xl border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-moon hover:bg-white/15 transition active:scale-95"
              title={
                isAllCollapsed ? "פתח את כל התפריטים" : "כווץ את כל התפריטים"
              }
            >
              {isAllCollapsed ? (
                <>
                  <ChevronsDown className="h-3.5 w-3.5 text-mint" />
                  <span>פתח הכל</span>
                </>
              ) : (
                <>
                  <ChevronsUp className="h-3.5 w-3.5 text-lilac" />
                  <span>כווץ הכל</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3.5 py-1.5">
              <Coins className="h-4 w-4 text-mint" aria-hidden />
              <span className="text-sm font-bold text-mint" aria-label="מטבעות">
                {coins}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        {/* Context-aware Adaptive Health Bubbles */}
        <SmartBubbles onNavigateTab={setActiveTab} activeTab={activeTab} />
        <Screen />
      </main>

      <nav
        aria-label="ניווט ראשי"
        className="fixed inset-x-1 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-md items-center justify-between rounded-3xl border border-white/15 bg-space-light/95 p-1 shadow-2xl backdrop-blur-xl"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = id === activeTab;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center gap-1 rounded-2xl px-1.5 py-1.5 transition ${
                isActive ? "bg-lilac/20 text-mint" : "text-purple-300/70"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="text-[9.5px] font-medium leading-none">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
