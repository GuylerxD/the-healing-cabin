// Helper to dispatch in-app pill reminder
export function triggerInAppPillReminder() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("trigger-qlaira-pill-reminder"));
  }
}
