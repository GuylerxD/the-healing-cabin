import { useState } from "react";
import {
  Award,
  CheckCircle,
  Check,
  Gift,
  Sparkles,
  Shield,
  Flame,
  Footprints,
  HeartHandshake,
} from "lucide-react";
import { useCabin, setCabin, addCoins } from "../store";
import CoinAmount from "./CoinAmount";

const ALL_BADGES = [
  {
    id: "metabolic-master",
    title: "אלופת המטבוליזם (Metabolic Master)",
    desc: "שמירה על 5 ארוחות עשירות בחלבון ללא כוסברה, ללא שעועית ירוקה וללא תורמוס",
    reward: 20,
    icon: Flame,
    color: "text-amber-400",
    check: (cabin) => {
      const days = Object.values(cabin.days || {});
      const highProteinDays = days.filter(
        (d) => (d.protein || 0) >= (cabin.proteinGoal || 80),
      ).length;
      return (
        highProteinDays >= 3 ||
        days.reduce((acc, d) => acc + (d.meals || 0), 0) >= 5
      );
    },
  },
  {
    id: "spine-guardian",
    title: "שומרת עמוד השדרה (Spine Guardian)",
    desc: "השלמת 3 אימונים מוגני דיסק ללא פיתולים וללא כפיפות בטן",
    reward: 15,
    icon: Shield,
    color: "text-mint",
    check: (cabin) => {
      const totalWorkouts = Object.values(cabin.days || {}).reduce(
        (acc, d) => acc + (d.workouts?.length || 0),
        0,
      );
      return totalWorkouts >= 3;
    },
  },
  {
    id: "qlaira-consistency",
    title: "התמדה הורמונלית (Zoely Streak)",
    desc: "מעקב ונטילת גלולת זואלי לפי השעון לאיזון הורמונלי",
    reward: 15,
    icon: HeartHandshake,
    color: "text-lilac",
    check: (cabin) => {
      const pillCount = Object.values(cabin.days || {}).filter(
        (d) => d.qlaira,
      ).length;
      return pillCount >= 2;
    },
  },
  {
    id: "kpop-pilgrim",
    title: "צועדת למזרח (Seoul Explorer)",
    desc: "צבירת קילומטרים וירטואליים במסע לקוריאה ויפן",
    reward: 20,
    icon: Footprints,
    color: "text-sky-400",
    check: (cabin) => (cabin.walkingMinutes || 0) >= 45,
  },
];

export default function AchievementBadges() {
  const cabin = useCabin();
  const claimedBadges = cabin.badges || [];
  const [justClaimed, setJustClaimed] = useState(null);

  const claimBadge = (badge) => {
    if (claimedBadges.includes(badge.id)) return;

    addCoins(badge.reward);
    setCabin((s) => ({
      ...s,
      badges: [...(s.badges || []), badge.id],
    }));

    setJustClaimed(badge.title);
    setTimeout(() => setJustClaimed(null), 3000);
  };

  return (
    <section className="glass space-y-4 p-5 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-moon text-base">הישגים ותגי גבורה</h3>
            <p className="text-xs text-muted">
              תגים מזכים במטבעות לחנות החיות של מוצ'י וצ'ארלי
            </p>
          </div>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-soft">
          {claimedBadges.length} / {ALL_BADGES.length} נאספו
        </span>
      </div>

      {justClaimed && (
        <div className="flex items-center gap-2 rounded-xl bg-mint/15 p-3 text-xs text-mint border border-mint/30 animate-pulse">
          <Sparkles className="h-4 w-4" />
          <span>
            מזל טוב! השגת את התג: <strong>{justClaimed}</strong> והתווספו מטבעות
            לחשבונך! ✨
          </span>
        </div>
      )}

      <div className="space-y-3">
        {ALL_BADGES.map((badge) => {
          const isClaimed = claimedBadges.includes(badge.id);
          const isEligible = badge.check(cabin);
          const Icon = badge.icon;

          return (
            <div
              key={badge.id}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-4 transition ${
                isClaimed
                  ? "border-white/10 bg-white/5 opacity-80"
                  : isEligible
                    ? `border-lilac/40 bg-lilac/10 ring-1 ring-lilac/40 ${badge.color}`
                    : "border-white/5 bg-white/[0.02] opacity-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 ${isClaimed ? "text-mint" : ""}`}
                >
                  {isClaimed ? (
                    <CheckCircle className="h-4 w-4 text-mint" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-moon">{badge.title}</h4>
                  <p className="text-2xs text-muted leading-tight mt-0.5">
                    {badge.desc}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-left">
                {isClaimed ? (
                  <span className="flex items-center gap-1 text-2xs font-bold text-mint">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    הושג
                  </span>
                ) : isEligible ? (
                  <button
                    type="button"
                    onClick={() => claimBadge(badge)}
                    className="flex items-center gap-1 rounded-xl bg-lilac px-2.5 py-1.5 text-space font-bold text-2xs shadow-sm transition active:scale-95"
                  >
                    <Gift className="h-3 w-3" />
                    <span>אספי <CoinAmount amount={`+${badge.reward}`} /></span>
                  </button>
                ) : (
                  <span className="rounded-lg bg-white/5 px-2 py-1 text-2xs text-muted/70">
                    <CoinAmount amount={`+${badge.reward}`} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
