import { useState, useEffect } from "react";
import {
  Sparkles,
  Dumbbell,
  Utensils,
  HeartHandshake,
  House,
  Coins,
  ChevronsUp,
  ChevronsDown,
  Compass,
  Settings,
} from "lucide-react";
import SettingsModal from "./components/SettingsModal";
import {
  useCabin,
  setAllSectionsCollapsed,
  areAllSectionsCollapsed,
  rolloverSweetBank,
  tickPets,
  STORAGE_ERROR_EVENT,
} from "./store";
import { PET_IDS, needsAttention } from "./lib/pets";
import { EATEN_LOG_KEY, syncEatenMeals } from "./lib/recipesSync";
import Quests from "./screens/Quests";
import Nutrition from "./screens/Nutrition";
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [storageFull, setStorageFull] = useState(false);

  useEffect(() => {
    const onError = () => setStorageFull(true);
    window.addEventListener(STORAGE_ERROR_EVENT, onError);
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, onError);
  }, []);
  const { coins, longGoal, collapsedSections, pets } = useCabin();
  const { Screen } = TABS.find((t) => t.id === activeTab);

  const isAllCollapsed = areAllSectionsCollapsed(collapsedSections);

  // Time-based updates: weekly sweet-bank reset, pet meters decay and meals eaten in My Recipes.
  // Run on load, every minute while open, and whenever the app returns to the foreground.
  useEffect(() => {
    const tick = () => {
      rolloverSweetBank();
      tickPets();
      syncEatenMeals();
    };
    // Live update when My Recipes is open in another tab of the same origin
    const onStorage = (e) => {
      if (e.key === EATEN_LOG_KEY || e.key === null) syncEatenMeals();
    };
    tick();
    const interval = setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const petsNeedCare =
    pets != null && PET_IDS.some((id) => needsAttention(pets[id]));

  const handleToggleCollapseAll = () => {
    setAllSectionsCollapsed(!isAllCollapsed);
  };

  return (
    <div className="min-h-dvh pb-[calc(7rem+env(safe-area-inset-bottom))] select-none">
      {/* In-App Floating Pill Reminder Popup */}
      <InAppPillReminder />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
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
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="הגדרות"
              title="הגדרות"
              className="flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-2 text-moon transition hover:bg-white/15 active:scale-95"
            >
              <Settings className="h-4 w-4 text-lilac" />
            </button>
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
        {storageFull && (
          <div
            role="alert"
            className="flex items-start justify-between gap-2 rounded-2xl border border-blush/50 bg-blush/15 p-3 text-right text-xs text-blush"
            dir="rtl"
          >
            <span>
              ⚠️ האחסון בדפדפן מלא — השינויים האחרונים לא נשמרו. כדאי לפנות
              מקום (למשל מתכונים ישנים ב-My Recipes) ולרענן.
            </span>
            <button
              type="button"
              onClick={() => setStorageFull(false)}
              aria-label="סגירת ההתראה"
              className="shrink-0 font-bold"
            >
              ✕
            </button>
          </div>
        )}
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
              aria-label={
                id === "cabin" && petsNeedCare
                  ? `${label} — מוצ׳י וצ׳ארלי צריכים טיפול`
                  : undefined
              }
              className={`relative flex flex-col items-center gap-1 rounded-2xl px-1.5 py-1.5 transition ${
                isActive ? "bg-lilac/20 text-mint" : "text-purple-300/70"
              }`}
            >
              {id === "cabin" && petsNeedCare && (
                <span
                  className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-400 ring-2 ring-space-light animate-pulse"
                  aria-hidden
                />
              )}
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
