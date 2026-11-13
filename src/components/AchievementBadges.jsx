import { useState } from "react";
import {
  Award,
  CheckCircle,
  Gift,
  Sparkles,
  Shield,
  Flame,
  Footprints,
  HeartHandshake,
} from "lucide-react";
import { useCabin, setCabin, addCoins } from "../store";

const ALL_BADGES = [
  {
    id: "metabolic-master",
    title: "אלופת המטבוליזם (Metabolic Master)",
    desc: "שמירה על 5 ארוחות עשירות בחלבון ללא כוסברה, ללא שעועית ירוקה וללא תורמוס",
    reward: 20,
    icon: Flame,
    color:
      "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
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
    color: "from-emerald-500/20 to-teal-500/20 text-mint border-mint/30",
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
    title: "התמדה הורמונלית (Qlaira Streak)",
    desc: "מעקב ונטילת גלולת קלייר לפי השעון לאיזון הורמונלי",
    reward: 15,
    icon: HeartHandshake,
    color: "from-purple-500/20 to-pink-500/20 text-lilac border-lilac/30",
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
    color: "from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-400/30",
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
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-moon text-sm">הישגים ותגי גבורה</h3>
            <p className="text-xs text-purple-300">
              תגים מזכים במטבעות לחנות החיות של מוצ'י וצ'ארלי
            </p>
          </div>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-purple-200">
          {claimedBadges.length} / {ALL_BADGES.length} נאספו
        </span>
      </div>

      {justClaimed && (
        <div className="flex items-center gap-2 rounded-xl bg-mint/15 p-2.5 text-xs text-mint border border-mint/30 animate-pulse">
          <Sparkles className="h-4 w-4" />
          <span>
            מזל טוב! השגת את התג: <strong>{justClaimed}</strong> והתווספו מטבעות
            לחשבונך! ✨
          </span>
        </div>
      )}

      <div className="space-y-2.5">
        {ALL_BADGES.map((badge) => {
          const isClaimed = claimedBadges.includes(badge.id);
          const isEligible = badge.check(cabin);
          const Icon = badge.icon;

          return (
            <div
              key={badge.id}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                isClaimed
                  ? "border-white/10 bg-white/5 opacity-80"
                  : isEligible
                    ? `bg-gradient-to-l ${badge.color} ring-1 ring-mint/40`
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
                  <h4 className="font-bold text-xs text-moon">{badge.title}</h4>
                  <p className="text-[11px] text-purple-300 leading-tight mt-0.5">
                    {badge.desc}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-left">
                {isClaimed ? (
                  <span className="text-[11px] text-mint font-bold">
                    הושג ✅
                  </span>
                ) : isEligible ? (
                  <button
                    type="button"
                    onClick={() => claimBadge(badge)}
                    className="flex items-center gap-1 rounded-xl bg-mint px-2.5 py-1.5 text-space font-bold text-[11px] shadow-sm transition active:scale-95"
                  >
                    <Gift className="h-3 w-3" />
                    <span>אספי +{badge.reward} 🪙</span>
                  </button>
                ) : (
                  <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-purple-400">
                    +{badge.reward} 🪙
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
