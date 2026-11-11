import { useState, useEffect, useCallback } from "react";
import { Pill, CheckCircle2, Clock, X, Sparkles } from "lucide-react";
import { updateToday, useToday } from "../store";

export default function InAppPillReminder() {
  const today = useToday();
  const [isOpen, setIsOpen] = useState(false);
  const [celebration, setCelebration] = useState(false);

  const pillTakenToday = Boolean(today.qlaira);

  // Check scheduled time and listen for custom trigger events
  useEffect(() => {
    const handleCustomTrigger = () => {
      setIsOpen(true);
    };

    window.addEventListener(
      "trigger-qlaira-pill-reminder",
      handleCustomTrigger,
    );

    // Also check every minute if current time equals scheduled time and pill not taken
    const interval = setInterval(() => {
      if (pillTakenToday) return;

      const reminderTime =
        localStorage.getItem("qlaira_reminder_time") || "21:00";
      const isEnabled =
        localStorage.getItem("qlaira_reminder_enabled") === "true";
      if (!isEnabled) return;

      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, "0");
      const currentM = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${currentH}:${currentM}`;

      if (currentTimeStr === reminderTime) {
        setIsOpen(true);
      }
    }, 30_000);

    return () => {
      window.removeEventListener(
        "trigger-qlaira-pill-reminder",
        handleCustomTrigger,
      );
      clearInterval(interval);
    };
  }, [pillTakenToday]);

  const handleMarkAsTaken = useCallback(() => {
    updateToday({ qlaira: true }, pillTakenToday ? 0 : 10);
    setCelebration(true);
    setTimeout(() => {
      setCelebration(false);
      setIsOpen(false);
    }, 1800);
  }, [pillTakenToday]);

  const handleSnooze = () => {
    setIsOpen(false);
    // Re-prompt in 10 minutes
    setTimeout(
      () => {
        if (!today.qlaira) {
          setIsOpen(true);
        }
      },
      10 * 60 * 1000,
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      dir="rtl"
    >
      <div className="relative w-full max-w-sm rounded-3xl border border-blush/40 bg-space-light/95 p-6 shadow-2xl backdrop-blur-xl text-right space-y-4">
        {/* Dismiss Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 text-purple-300 hover:text-moon transition"
          aria-label="סגור תזכורת"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blush to-lilac text-space shadow-lg shadow-blush/30">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-blush tracking-wider uppercase">
              תזכורת פנימית מהאפליקציה
            </span>
            <h3 className="text-base font-bold text-moon">
              זמן לגלולת קלייר (Qlaira) 💊
            </h3>
          </div>
        </div>

        {/* Content */}
        <p className="text-xs text-purple-200 leading-relaxed">
          זהו הזמן הקבוע שלך לנטילת הגלולה היומית לשמירה על רצף מדויק ואיזון
          הורמונלי מיטבי.
        </p>

        {celebration ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-mint/20 p-4 text-sm font-bold text-mint border border-mint/40 animate-pulse">
            <Sparkles className="h-5 w-5" />
            <span>נפלא! נטילת קלייר נרשמה (+10 מטבעות ריפוי ✨)</span>
          </div>
        ) : (
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleMarkAsTaken}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-mint to-teal-400 p-3.5 text-sm font-bold text-space shadow-lg shadow-mint/25 transition active:scale-95"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>לקחתי עכשיו! (+10 🪙)</span>
            </button>

            <button
              type="button"
              onClick={handleSnooze}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-2.5 text-xs font-semibold text-purple-200 hover:bg-white/15 transition"
            >
              <Clock className="h-4 w-4 text-lilac" />
              <span>הזכר לי בעוד 10 דקות</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
