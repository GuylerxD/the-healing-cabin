import { useState, useEffect } from "react";
import { ShoppingBag, Star, PawPrint } from "lucide-react";
import { setCabin, todayKey, useCabin, useToday } from "../store";
import { recoveryCoins } from "../lib/recovery";
import AchievementBadges from "../components/AchievementBadges";
import CollapsibleCard from "../components/CollapsibleCard";
import CozyPetRoom from "../components/CozyPetRoom";

const SHOP = [
  { id: "mochi-bow", pet: "mochi", emoji: "🎀", name: "פפיון ורוד", price: 30 },
  {
    id: "mochi-scarf",
    pet: "mochi",
    emoji: "🧣",
    name: "צעיף חורף",
    price: 50,
  },
  {
    id: "mochi-crown",
    pet: "mochi",
    emoji: "👑",
    name: "כתר נסיכה",
    price: 150,
  },
  {
    id: "charlie-fish",
    pet: "charlie",
    emoji: "🐟",
    name: "צעצוע דג",
    price: 40,
  },
  {
    id: "charlie-hat",
    pet: "charlie",
    emoji: "🎩",
    name: "כובע ג׳נטלמן",
    price: 60,
  },
  {
    id: "charlie-bed",
    pet: "charlie",
    emoji: "🛏️",
    name: "כרית ענקית",
    price: 100,
  },
];

function buy(item) {
  setCabin((s) =>
    s.coins < item.price || s.owned.includes(item.id)
      ? s
      : { ...s, coins: s.coins - item.price, owned: [...s.owned, item.id] },
  );
}

function useNow(active) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export default function Cabin() {
  const { coins, owned, recoveryStart, longGoal } = useCabin();
  const today = useToday();
  const resting = recoveryStart != null;
  const now = useNow(resting);
  const earnedToday = today.recoveryCoins ?? 0;
  const pending = resting ? recoveryCoins(recoveryStart, now, earnedToday) : 0;
  const elapsedMin = resting
    ? Math.floor(Math.max(0, now - recoveryStart) / 60_000)
    : 0;
  const [goalDraft, setGoalDraft] = useState(longGoal);

  const toggleRecovery = () =>
    setCabin((s) => {
      if (s.recoveryStart == null) return { ...s, recoveryStart: Date.now() };
      const k = todayKey();
      const day = s.days[k] ?? {};
      const earned = recoveryCoins(
        s.recoveryStart,
        Date.now(),
        day.recoveryCoins ?? 0,
      );
      return {
        ...s,
        recoveryStart: null,
        coins: s.coins + earned,
        days: {
          ...s.days,
          [k]: { ...day, recoveryCoins: (day.recoveryCoins ?? 0) + earned },
        },
      };
    });

  return (
    <div className="space-y-4">
      {/* 1. החדר האינטראקטיבי של מוצ׳י וצ׳ארלי (Cozy Virtual Room Canvas) */}
      <CollapsibleCard
        id="cabin-pet-room"
        title="הבקתה האינטראקטיבית של מוצ׳י וצ׳ארלי 🐾"
        badge={resting ? "שנ״צ משותף בעיצומו 💤" : "מגע, משחק ותאורת אווירה"}
        icon={PawPrint}
        defaultOpen={true}
      >
        <CozyPetRoom
          resting={resting}
          elapsedMin={elapsedMin}
          pending={pending}
          onToggleRecovery={toggleRecovery}
        />
      </CollapsibleCard>

      {/* 2. מדליות והישגים (Collapsible) */}
      <CollapsibleCard
        id="cabin-badges"
        title="מדליות והישגי ריפוי"
        badge="פרסי מטבעות לחדר"
        icon={Star}
        defaultOpen={false}
      >
        <AchievementBadges />
      </CollapsibleCard>

      {/* 4. חנות אביזרים (Collapsible) */}
      <CollapsibleCard
        id="cabin-shop"
        title="חנות אביזרים"
        badge={`${owned.length} מתוך ${SHOP.length} נרכשו`}
        icon={ShoppingBag}
        defaultOpen={false}
      >
        <div className="grid grid-cols-2 gap-2">
          {SHOP.map((item) => {
            const has = owned.includes(item.id);
            const canAfford = coins >= item.price;
            return (
              <button
                key={item.id}
                disabled={has || !canAfford}
                onClick={() => buy(item)}
                className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-xs transition active:scale-95 ${
                  has
                    ? "bg-mint/15 text-mint"
                    : "bg-white/5 text-purple-100 disabled:opacity-40"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {item.emoji}
                </span>
                <span className="font-bold">{item.name}</span>
                <span className="text-purple-300">
                  {item.pet === "mochi" ? "למוצ׳י" : "לצ׳ארלי"} •{" "}
                  {has ? "✨ שלך" : `${item.price} 🪙`}
                </span>
              </button>
            );
          })}
        </div>
      </CollapsibleCard>

      {/* 5. המטרה הגדולה שלי (Collapsible) */}
      <CollapsibleCard
        id="cabin-goal"
        title="המטרה הגדולה שלי"
        badge={longGoal ? `🌟 ${longGoal}` : "הגדרת מטרה ארוכת טווח"}
        icon={Star}
        defaultOpen={false}
      >
        <div className="space-y-3">
          <p className="text-xs text-purple-300">
            אופציונלי — חלום רחוק שיופיע בראש המסך.
          </p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setCabin((s) => ({
                ...s,
                longGoal: goalDraft.trim().slice(0, 40),
              }));
            }}
          >
            <input
              value={goalDraft}
              maxLength={40}
              onChange={(e) => setGoalDraft(e.target.value)}
              placeholder="למשל: טיול חלומות 🌸"
              className="min-w-0 flex-1 rounded-2xl bg-white/10 px-4 py-2 text-sm text-moon placeholder:text-purple-300"
            />
            <button className="rounded-2xl bg-blush px-4 py-2 text-sm font-bold text-space">
              שמירה
            </button>
          </form>
        </div>
      </CollapsibleCard>
    </div>
  );
}
