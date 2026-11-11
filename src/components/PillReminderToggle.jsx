import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell,
  BellOff,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Pill,
} from "lucide-react";
import { triggerInAppPillReminder } from "../lib/pillReminder";

const STORAGE_KEY_ENABLED = "qlaira_reminder_enabled";
const STORAGE_KEY_TIME = "qlaira_reminder_time";
const DEFAULT_TIME = "21:00"; // ברירת מחדל: 21:00 בערב

function checkIsSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export default function PillReminderToggle({ onNotificationSent }) {
  const [supported] = useState(checkIsSupported);
  const [permission, setPermission] = useState(() => {
    return checkIsSupported() ? Notification.permission : "default";
  });
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_ENABLED) === "true";
  });
  const [reminderTime, setReminderTime] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_TIME) || DEFAULT_TIME;
  });
  const [statusMessage, setStatusMessage] = useState("");
  const timerRef = useRef(null);

  // Show notification via Service Worker registration
  const triggerNotification = useCallback(
    async (title, body, tag = "qlaira-reminder") => {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body,
            icon: "/the-healing-cabin/icon-192.png",
            badge: "/the-healing-cabin/icon-192.png",
            dir: "rtl",
            lang: "he",
            tag,
            renotify: true,
            vibrate: [200, 100, 200],
            data: { url: "/the-healing-cabin/" },
            actions: [
              { action: "taken", title: "לקחתי! ✨" },
              { action: "snooze", title: "הזכר לי בעוד 10 דק'" },
            ],
          });
          if (onNotificationSent) onNotificationSent();
          return true;
        }
      } catch (err) {
        console.error("שגיאה בהצגת התראה:", err);
      }
      return false;
    },
    [onNotificationSent],
  );

  // Schedule daily recurring reminder
  useEffect(() => {
    if (!enabled || permission !== "granted") {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const [targetHour, targetMinute] = reminderTime.split(":").map(Number);

    const scheduleNext = () => {
      const now = new Date();
      const nextTime = new Date();
      nextTime.setHours(targetHour, targetMinute, 0, 0);

      // If scheduled time has already passed today, set for tomorrow
      if (nextTime <= now) {
        nextTime.setDate(nextTime.getDate() + 1);
      }

      const delayMs = nextTime.getTime() - now.getTime();

      timerRef.current = setTimeout(async () => {
        await triggerNotification(
          "תזכורת גלולת קלייר 💊",
          "הגיע הזמן לקחת את גלולת הקלייר היומית שלך לבריאות ואיזון הורמונלי ✨",
          "qlaira-daily",
        );
        // Repeat next day
        scheduleNext();
      }, delayMs);
    };

    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, reminderTime, permission, triggerNotification]);

  // Handle toggle switch
  const handleToggle = async () => {
    if (!supported) {
      setStatusMessage("הדפדפן אינו תומך בהתראות Push.");
      return;
    }

    if (!enabled) {
      let currentPerm = Notification.permission;
      if (currentPerm === "default") {
        currentPerm = await Notification.requestPermission();
        setPermission(currentPerm);
      }

      if (currentPerm === "granted") {
        setEnabled(true);
        localStorage.setItem(STORAGE_KEY_ENABLED, "true");
        setStatusMessage(`התזכורת היומית הופעלה לשעה ${reminderTime} ⏰`);
        // Trigger small confirmation
        triggerNotification(
          "תזכורת קלייר הופעלה בהצלחה ✨",
          `נזכיר לך לקחת את גלולת קלייר מדי יום בשעה ${reminderTime}.`,
          "qlaira-setup",
        );
      } else {
        setEnabled(false);
        localStorage.setItem(STORAGE_KEY_ENABLED, "false");
        setStatusMessage("ההרשאה להתראות נדחתה בהגדרות הדפדפן.");
      }
    } else {
      setEnabled(false);
      localStorage.setItem(STORAGE_KEY_ENABLED, "false");
      setStatusMessage("התזכורת היומית כבויה.");
    }
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setReminderTime(newTime);
    localStorage.setItem(STORAGE_KEY_TIME, newTime);
    if (enabled) {
      setStatusMessage(`שעת התזכורת עודכנה ל-${newTime}`);
    }
  };

  const handleTestNow = async () => {
    if (permission !== "granted") {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setStatusMessage("יש לאשר קבלת התראות בדפדפן כדי לבדוק.");
        return;
      }
    }
    const success = await triggerNotification(
      "בדיקה: תזכורת גלולת קלייר 💊",
      "כך תיראה התזכורת היומית שלך לנטילת קלייר בזמן! ✨",
      "qlaira-test",
    );
    if (success) {
      setStatusMessage("התראת בדיקה נשלחה כעת לראש המסך!");
    }
  };

  if (!supported) {
    return (
      <div className="glass p-4 text-xs text-purple-300">
        התראות Web Push אינן נתמכות במכשיר זה או בדפדפן הנוכחי.
      </div>
    );
  }

  return (
    <section className="glass space-y-3.5 p-5 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl transition ${
              enabled ? "bg-mint/20 text-mint" : "bg-white/10 text-purple-300"
            }`}
          >
            {enabled ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-moon text-sm">
              תזכורת יומית לגלולת קלייר
            </h3>
            <p className="text-xs text-purple-300">
              התראת Push מקומית מדויקת (Qlaira Reminder)
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            enabled ? "bg-mint" : "bg-white/20"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-space shadow-md ring-0 transition duration-200 ease-in-out ${
              enabled ? "-translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Time Picker & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs">
        <label className="flex items-center gap-2 text-purple-200">
          <Clock className="h-4 w-4 text-mint" />
          <span>שעת תזכורת קבועה:</span>
          <input
            type="time"
            value={reminderTime}
            onChange={handleTimeChange}
            className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-1 text-moon text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-mint"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={triggerInAppPillReminder}
            className="flex items-center gap-1.5 rounded-xl border border-mint/40 bg-mint/15 px-3 py-1.5 text-xs font-medium text-mint hover:bg-mint/25 transition active:scale-95"
          >
            <Pill className="h-3.5 w-3.5" />
            <span>תזכורת באפליקציה</span>
          </button>
          <button
            type="button"
            onClick={handleTestNow}
            className="flex items-center gap-1.5 rounded-xl border border-lilac/40 bg-lilac/15 px-3 py-1.5 text-xs font-medium text-lilac hover:bg-lilac/25 transition active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>התראת Push</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-mint/90">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-mint" />
          <span>{statusMessage}</span>
        </div>
      )}

      {permission === "denied" && (
        <div className="flex items-center gap-2 rounded-xl bg-blush/15 p-2.5 text-xs text-blush border border-blush/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            ההתראות חסומות בדפדפן. יש לפתוח את הגדרות האתר ולאשר קבלת התראות.
          </span>
        </div>
      )}
    </section>
  );
}
