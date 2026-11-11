import { useEffect, useState } from "react";
import { BatteryCharging, ShoppingBag, Star, PawPrint } from "lucide-react";
import { setCabin, todayKey, useCabin, useToday } from "../store";
import { RECOVERY_DAILY_CAP, recoveryCoins } from "../lib/recovery";
import AchievementBadges from "../components/AchievementBadges";
import CollapsibleCard from "../components/CollapsibleCard";

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

const PETS = [
  {
    id: "mochi",
    name: "מוצ׳י",
    emoji: "🐶",
    size: "text-4xl",
    desc: "צ׳יוואווה קטנטנה",
  },
  {
    id: "charlie",
    name: "צ׳ארלי",
    emoji: "🐈‍⬛",
    size: "text-6xl",
    desc: "חתול שחור גדול",
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
      {/* 1. החדר של מוצ׳י וצ׳ארלי (Collapsible) */}
      <CollapsibleCard
        id="cabin-pet-room"
        title="החדר של מוצ׳י וצ׳ארלי 🐾"
        badge={resting ? "מתכרבלים איתך ונחים 💤" : "מוצ׳י & צ׳ארלי בבקתה"}
        icon={PawPrint}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <div className="flex items-end justify-around rounded-2xl bg-gradient-to-t from-lilac/20 to-transparent px-2 pt-6 pb-3">
            {PETS.map((pet) => {
              const items = SHOP.filter(
                (i) => i.pet === pet.id && owned.includes(i.id),
              );
              return (
                <figure
                  key={pet.id}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="flex h-6 gap-0.5 text-lg"
                    aria-label="אביזרים"
                  >
                    {items.map((i) => (
                      <span key={i.id} title={i.name}>
                        {i.emoji}
                      </span>
                    ))}
                  </div>
                  <span
                    className={`${pet.size} ${resting ? "animate-pulse" : ""}`}
                    aria-hidden
                  >
                    {pet.emoji}
                  </span>
                  <figcaption className="text-center text-xs">
                    <span className="block font-bold text-moon">
                      {pet.name}
                    </span>
                    <span className="text-purple-300">{pet.desc}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
          <p className="text-center text-xs text-purple-200">
            {resting ? "מתכרבלים איתך ונחים יחד 💤" : "מחכים לך בבקתה 🕯️"}
          </p>
        </div>
      </CollapsibleCard>

      {/* 2. התאוששות פעילה (Collapsible) */}
      <CollapsibleCard
        id="cabin-recovery"
        title="התאוששות פעילה"
        badge={
          resting ? `נחת ${elapsedMin} דק׳ (+${pending} 🪙)` : "מטבעות במנוחה"
        }
        icon={BatteryCharging}
        defaultOpen={true}
      >
        <div className="space-y-3">
          <p className="text-xs text-purple-200">
            יום כואב? מנוחה היא גם התקדמות. מטבע לכל 2 דקות מנוחה (עד{" "}
            {RECOVERY_DAILY_CAP} ביום) — ממשיך לצבור גם כשהאפליקציה סגורה.
          </p>
          {resting && (
            <p className="text-sm text-mint">
              נחת {elapsedMin} דק׳ • נצברו {pending} מטבעות 🌙
            </p>
          )}
          <button
            aria-pressed={resting}
            onClick={toggleRecovery}
            disabled={!resting && earnedToday >= RECOVERY_DAILY_CAP}
            className={`w-full rounded-2xl py-3 font-bold transition disabled:opacity-40 ${
              resting
                ? "bg-mint text-space"
                : "bg-lilac/20 text-moon ring-1 ring-lilac"
            }`}
          >
            {resting
              ? `סיימתי לנוח — לאסוף ${pending} 🪙`
              : earnedToday >= RECOVERY_DAILY_CAP
                ? "אספת את כל מטבעות המנוחה להיום 💜"
                : "להתחיל מנוחה 🛋️"}
          </button>
        </div>
      </CollapsibleCard>

      {/* 3. מדליות והישגים (Collapsible) */}
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
