import { useState } from "react";
import {
  Bell,
  BellOff,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Pill,
} from "lucide-react";
import {
  triggerInAppPillReminder,
  showPillNotification,
  resetReminderSchedule,
  REMINDER_ENABLED_KEY as STORAGE_KEY_ENABLED,
  REMINDER_TIME_KEY as STORAGE_KEY_TIME,
  DEFAULT_REMINDER_TIME as DEFAULT_TIME,
} from "../lib/pillReminder";
import { todayKey } from "../store";

// The daily schedule itself lives in InAppPillReminder (always mounted); this card only edits settings.

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

  const triggerNotification = async (title, body, tag) => {
    const ok = await showPillNotification(title, body, tag);
    if (ok && onNotificationSent) onNotificationSent();
    return ok;
  };

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
        resetReminderSchedule(reminderTime, todayKey());
        setStatusMessage(`התזכורת היומית הופעלה לשעה ${reminderTime} ⏰`);
        // Trigger small confirmation
        triggerNotification(
          "תזכורת זואלי הופעלה בהצלחה ✨",
          `נזכיר לך לקחת את גלולת זואלי מדי יום בשעה ${reminderTime}.`,
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
    if (newTime) resetReminderSchedule(newTime, todayKey());
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
      "בדיקה: תזכורת גלולת זואלי 💊",
      "כך תיראה התזכורת היומית שלך לנטילת זואלי בזמן! ✨",
      "qlaira-test",
    );
    if (success) {
      setStatusMessage("התראת בדיקה נשלחה כעת לראש המסך!");
    }
  };

  if (!supported) {
    return (
      <div className="glass p-4 text-xs text-muted">
        התראות Web Push אינן נתמכות במכשיר זה או בדפדפן הנוכחי.
      </div>
    );
  }

  return (
    <section className="glass space-y-4 p-5 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl transition ${
              enabled ? "bg-mint/20 text-mint" : "bg-white/10 text-muted"
            }`}
          >
            {enabled ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-moon text-base">
              תזכורת יומית לגלולת זואלי
            </h3>
            <p className="text-xs text-muted">
              התראת Push מקומית מדויקת (Zoely Reminder)
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
        <label className="flex items-center gap-2 text-soft">
          <Clock className="h-4 w-4 text-mint" />
          <span>שעת תזכורת קבועה:</span>
          <input
            type="time"
            value={reminderTime}
            onChange={handleTimeChange}
            className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-1 text-moon text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-lilac"
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
        <div className="flex items-center gap-2 rounded-xl bg-blush/15 p-3 text-xs text-blush border border-blush/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            ההתראות חסומות בדפדפן. יש לפתוח את הגדרות האתר ולאשר קבלת התראות.
          </span>
        </div>
      )}
    </section>
  );
}
