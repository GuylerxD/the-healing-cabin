export const REMINDER_ENABLED_KEY = "qlaira_reminder_enabled";
export const REMINDER_TIME_KEY = "qlaira_reminder_time";
export const REMINDER_LAST_FIRED_KEY = "qlaira_reminder_last_fired";
export const DEFAULT_REMINDER_TIME = "21:00";

const BASE = import.meta.env.BASE_URL;

// Helper to dispatch in-app pill reminder
export function triggerInAppPillReminder() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("trigger-qlaira-pill-reminder"));
  }
}

export const minutesOfDay = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// After enabling or changing the time: if today's slot already passed, wait for tomorrow
// instead of firing right away.
export function resetReminderSchedule(time, todayKeyValue) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin >= minutesOfDay(time)) {
    localStorage.setItem(REMINDER_LAST_FIRED_KEY, todayKeyValue);
  } else {
    localStorage.removeItem(REMINDER_LAST_FIRED_KEY);
  }
}

// System notification via the Service Worker (works while the app is open or in background).
export async function showPillNotification(title, body, tag = "qlaira-reminder") {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    Notification.permission !== "granted"
  ) {
    return false;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: `${BASE}icon-192.png`,
      badge: `${BASE}icon-192.png`,
      dir: "rtl",
      lang: "he",
      tag,
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: BASE },
      actions: [
        { action: "taken", title: "לקחתי! ✨" },
        { action: "snooze", title: "הזכר לי בעוד 10 דק'" },
      ],
    });
    return true;
  } catch (err) {
    console.error("שגיאה בהצגת התראה:", err);
    return false;
  }
}
