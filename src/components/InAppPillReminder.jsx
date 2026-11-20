import { useState, useEffect, useRef } from "react";
import { Pill, CheckCircle2, Clock, X, Sparkles } from "lucide-react";
import { getCabin, markPillTaken, todayKey, PILL_REWARD } from "../store";
import {
  DEFAULT_REMINDER_TIME,
  REMINDER_ENABLED_KEY,
  REMINDER_LAST_FIRED_KEY,
  REMINDER_TIME_KEY,
  minutesOfDay,
  showPillNotification,
} from "../lib/pillReminder";

const SNOOZE_MS = 10 * 60 * 1000;

// Read fresh state at call time so timers never act on a stale render.
const isTakenToday = () => Boolean(getCabin().days[todayKey()]?.qlaira);

function notifyPill() {
  showPillNotification(
    "תזכורת גלולת זואלי 💊",
    "הגיע הזמן לקחת את גלולת הזואלי היומית שלך לבריאות ואיזון הורמונלי ✨",
    "qlaira-daily",
  );
}

export default function InAppPillReminder() {
  const [isOpen, setIsOpen] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const snoozeRef = useRef(null);

  const scheduleSnooze = () => {
    clearTimeout(snoozeRef.current);
    snoozeRef.current = setTimeout(() => {
      if (isTakenToday()) return;
      setIsOpen(true);
      notifyPill();
    }, SNOOZE_MS);
  };

  useEffect(() => {
    // "לקחתי!" tapped on a notification while the app was closed → app opened with ?pillTaken=1
    const params = new URLSearchParams(window.location.search);
    if (params.get("pillTaken") === "1") {
      markPillTaken();
      params.delete("pillTaken");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash,
      );
    }

    const open = () => setIsOpen(true);
    window.addEventListener("trigger-qlaira-pill-reminder", open);

    // Fire once per day, any time after the chosen hour (survives throttled timers / reopening).
    const check = () => {
      if (localStorage.getItem(REMINDER_ENABLED_KEY) !== "true") return;
      if (isTakenToday()) return;
      const k = todayKey();
      if (localStorage.getItem(REMINDER_LAST_FIRED_KEY) === k) return;
      const time =
        localStorage.getItem(REMINDER_TIME_KEY) || DEFAULT_REMINDER_TIME;
      const now = new Date();
      if (now.getHours() * 60 + now.getMinutes() < minutesOfDay(time)) return;
      localStorage.setItem(REMINDER_LAST_FIRED_KEY, k);
      setIsOpen(true);
      notifyPill();
    };
    check();
    const interval = setInterval(check, 30_000);
    document.addEventListener("visibilitychange", check);

    // Action buttons on the system notification (relayed by the Service Worker)
    const onSwMessage = (event) => {
      if (event.data?.type === "QLAIRA_PILL_TAKEN") markPillTaken();
      if (event.data?.type === "QLAIRA_PILL_SNOOZE") scheduleSnooze();
    };
    const sw = "serviceWorker" in navigator ? navigator.serviceWorker : null;
    sw?.addEventListener("message", onSwMessage);

    return () => {
      window.removeEventListener("trigger-qlaira-pill-reminder", open);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
      sw?.removeEventListener("message", onSwMessage);
      clearTimeout(snoozeRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAsTaken = () => {
    markPillTaken();
    setCelebration(true);
    setTimeout(() => {
      setCelebration(false);
      setIsOpen(false);
    }, 1800);
  };

  const handleSnooze = () => {
    setIsOpen(false);
    scheduleSnooze();
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
              זמן לגלולת זואלי (Zoely) 💊
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
            <span>נפלא! נטילת זואלי נרשמה (+{PILL_REWARD} מטבעות ריפוי ✨)</span>
          </div>
        ) : (
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleMarkAsTaken}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-mint to-teal-400 p-3.5 text-sm font-bold text-space shadow-lg shadow-mint/25 transition active:scale-95"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>לקחתי עכשיו! (+{PILL_REWARD} 🪙)</span>
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
