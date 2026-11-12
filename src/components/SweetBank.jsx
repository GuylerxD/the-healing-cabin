import { useState } from "react";
import {
  Cookie,
  Sparkles,
  ShieldCheck,
  Check,
  Gift,
  Coins,
  RotateCcw,
} from "lucide-react";
import { useCabin, setCabin, useToday, updateToday } from "../store";

const TOTAL_WEEKLY_SWEET_TOKENS = 4;
const IDLE_COIN_BONUS_PER_SAVED_TOKEN = 30; // 30 coins per unspent token on Saturday night

export default function SweetBank() {
  const { sweetTokensSpent = 0 } = useCabin();
  const today = useToday();
  const [conversionBonusClaimed, setConversionBonusClaimed] = useState(false);

  const availableTokens = Math.max(
    0,
    TOTAL_WEEKLY_SWEET_TOKENS - sweetTokensSpent,
  );

  // Spend sweet token
  const handleSpendToken = () => {
    if (availableTokens <= 0) return;
    setCabin((s) => ({
      ...s,
      sweetTokensSpent: Math.min(
        TOTAL_WEEKLY_SWEET_TOKENS,
        (s.sweetTokensSpent || 0) + 1,
      ),
    }));
  };

  // Undo / restore sweet token
  const handleRestoreToken = () => {
    if (sweetTokensSpent <= 0) return;
    setCabin((s) => ({
      ...s,
      sweetTokensSpent: Math.max(0, (s.sweetTokensSpent || 0) - 1),
    }));
  };

  // Convert unused tokens to coins (Saturday night Idle Room reward simulation)
  const handleClaimIdleReward = () => {
    if (availableTokens <= 0) return;
    const bonusCoins = availableTokens * IDLE_COIN_BONUS_PER_SAVED_TOKEN;
    setCabin((s) => ({
      ...s,
      coins: s.coins + bonusCoins,
      sweetTokensSpent: 0, // Reset for new week
    }));
    setConversionBonusClaimed(true);
    setTimeout(() => setConversionBonusClaimed(false), 5000);
  };

  // Timing quest: ate sweet right after full protein meal
  const isTimingQuestDone = !!today.sweetTimingQuest;
  const handleToggleTimingQuest = () => {
    const nextState = !isTimingQuestDone;
    updateToday({ sweetTimingQuest: nextState }, nextState ? 15 : -15);
  };

  return (
    <div className="space-y-3.5 text-right" dir="rtl">
      {/* Upper Bank Display */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-400/20 text-pink-300">
              <Cookie className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-moon flex items-center gap-1.5">
                <span>תקציב מתיקות שבועי: קופת המתוקים</span>
                <Sparkles className="h-3.5 w-3.5 text-pink-300" />
              </h4>
              <p className="text-[11px] text-purple-300">
                4 אסימונים לשבוע • פינוק מודע ומתוזמן במקום איסורים
              </p>
            </div>
          </div>
          <span className="rounded-full bg-pink-400/20 border border-pink-400/30 px-2.5 py-0.5 text-[11px] font-bold text-pink-300">
            {availableTokens} / {TOTAL_WEEKLY_SWEET_TOKENS} נותרו
          </span>
        </div>

        {/* 4 Sweet Tokens Row (K-Pop Pastel Interactive Buttons) */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {Array.from({ length: TOTAL_WEEKLY_SWEET_TOKENS }).map((_, idx) => {
            const isAvailable = idx < availableTokens;
            return (
              <button
                key={idx}
                type="button"
                onClick={isAvailable ? handleSpendToken : handleRestoreToken}
                title={
                  isAvailable
                    ? `אסימון ${idx + 1}: לחצי לשימוש בפינוק מתוק`
                    : `אסימון נוצל: לחצי לביטול והחזרה`
                }
                className={`relative flex flex-col items-center justify-center rounded-2xl py-3 px-2 border transition-all active:scale-95 ${
                  isAvailable
                    ? "bg-gradient-to-t from-pink-400/25 via-pink-300/10 to-purple-400/15 border-pink-300/40 text-pink-200 shadow-md shadow-pink-500/10 hover:border-pink-300 hover:scale-105"
                    : "bg-white/[0.03] border-white/5 text-purple-400/40 opacity-50"
                }`}
              >
                <span className="text-2xl mb-1 filter drop-shadow">
                  {isAvailable ? "🍪" : "✨"}
                </span>
                <span className="text-[10px] font-bold">
                  {isAvailable ? "פנוי לפינוק" : "נוצל"}
                </span>
                {isAvailable && (
                  <span className="text-[9px] text-pink-300/80">
                    לחצי לשימוש
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Subtle undo or instructions */}
        <div className="flex items-center justify-between text-[11px] text-purple-300 pt-1">
          <span>
            {availableTokens > 0
              ? `במוצ״ש כל אסימון שלא נוצל שווה +${IDLE_COIN_BONUS_PER_SAVED_TOKEN} 🪙 למוצ׳י וצ׳ארלי!`
              : "כל אסימוני המתיקות נוצלו לשבוע זה — מעולה, איזנת את החשק!"}
          </span>
          {sweetTokensSpent > 0 && (
            <button
              type="button"
              onClick={handleRestoreToken}
              className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-200"
            >
              <RotateCcw className="h-3 w-3" />
              <span>ביטול שימוש</span>
            </button>
          )}
        </div>

        {/* Saturday Night Idle Conversion Simulation Button */}
        {availableTokens > 0 && (
          <div className="border-t border-white/10 pt-2.5 flex items-center justify-between">
            <span className="text-[11px] text-moon font-medium">
              בונוס סופ״ש: המרת {availableTokens} אסימונים שנותרו
            </span>
            <button
              type="button"
              onClick={handleClaimIdleReward}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-mint/20 to-lilac/20 hover:from-mint/30 hover:to-lilac/30 border border-mint/40 px-3 py-1.5 text-xs font-bold text-mint transition active:scale-95"
            >
              <Gift className="h-3.5 w-3.5" />
              <span>
                איסוף +{availableTokens * IDLE_COIN_BONUS_PER_SAVED_TOKEN}{" "}
                מטבעות
              </span>
            </button>
          </div>
        )}

        {conversionBonusClaimed && (
          <div className="flex items-center gap-1.5 rounded-xl bg-mint/15 border border-mint/40 p-2 text-xs text-mint font-bold animate-fade-in">
            <Coins className="h-4 w-4" />
            <span>הבונוס נאסף בהצלחה לחדר החיות של מוצ׳י וצ׳ארלי! 🎉</span>
          </div>
        )}
      </div>

      {/* The Timing Quest: Glucose Shield Checkbox */}
      <div
        className={`rounded-2xl border p-3.5 transition-all ${
          isTimingQuestDone
            ? "bg-mint/15 border-mint/50 text-mint"
            : "bg-white/5 border-white/10 text-moon hover:bg-white/[0.08]"
        }`}
      >
        <button
          type="button"
          onClick={handleToggleTimingQuest}
          className="flex w-full items-center justify-between text-right"
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                isTimingQuestDone
                  ? "bg-mint text-space border-mint shadow-md shadow-mint/20"
                  : "bg-white/10 border-white/15 text-lilac"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-moon">
                  אתגר התזמון: מגן הגלוקוז (Glucose Shield) 🛡️
                </span>
                <span className="rounded-full bg-lilac/20 border border-lilac/30 px-2 py-0.2 text-[10px] font-bold text-lilac">
                  +15 🪙 קומבו
                </span>
              </div>
              <p className="text-[11px] text-purple-200 mt-0.5">
                אכלתי את המתוק{" "}
                <strong>רק מיד אחרי ארוחה מלאה עשירה בחלבון</strong>
              </p>
            </div>
          </div>

          <div
            className={`flex h-6 w-6 items-center justify-center rounded-xl border transition ${
              isTimingQuestDone
                ? "bg-mint text-space border-mint"
                : "border-white/20 bg-white/5"
            }`}
          >
            {isTimingQuestDone && <Check className="h-4 w-4 stroke-[3]" />}
          </div>
        </button>

        {isTimingQuestDone && (
          <p className="text-[11px] text-mint mt-2 border-t border-mint/20 pt-2">
            ✨ כל הכבוד! אכילת מתוק מיד אחרי חלבון משטחת את קפיצת הסוכר בדם
            (Glucose Spike) ושומרת על יציבות אינסולין ורמת אנרגיה גבוהה ב-PCOS.
          </p>
        )}
      </div>
    </div>
  );
}
