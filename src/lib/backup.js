// One backup file for both apps: The Healing Cabin and My Recipes share the
// guylerxd.github.io origin, so they share localStorage and can be saved together.

export const BACKUP_FORMAT = "healing-cabin-backup";
export const BACKUP_VERSION = 1;
export const LAST_BACKUP_KEY = "healing_cabin_last_backup";
export const BACKUP_REMINDER_DAYS = 14;

// Secrets stay out of a file that may be emailed or uploaded somewhere
const EXCLUDED_KEYS = new Set(["gemini_api_key", LAST_BACKUP_KEY]);

const readAll = () => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !EXCLUDED_KEYS.has(key)) data[key] = localStorage.getItem(key);
  }
  return data;
};

const appOf = (key) =>
  key.startsWith("healing-cabin") ||
  key.startsWith("healing_cabin_") ||
  key.startsWith("qlaira_")
    ? "cabin"
    : "recipes";

export function summarize(data) {
  const keys = Object.keys(data);
  const bytes = keys.reduce((n, k) => n + k.length + (data[k]?.length ?? 0), 0);
  return {
    cabinKeys: keys.filter((k) => appOf(k) === "cabin").length,
    recipesKeys: keys.filter((k) => appOf(k) === "recipes").length,
    kb: Math.max(1, Math.round((bytes * 2) / 1024)), // UTF-16 in storage
  };
}

/** Downloads a JSON backup of both apps and records the date. */
export function downloadBackup() {
  const data = readAll();
  const createdAt = new Date();
  const file = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    createdAt: createdAt.toISOString(),
    data,
  };
  const blob = new Blob([JSON.stringify(file)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `healing-cabin-backup-${createdAt.toLocaleDateString("en-CA")}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  try {
    localStorage.setItem(LAST_BACKUP_KEY, String(createdAt.getTime()));
  } catch {
    // storage full: the download itself still worked
  }
  return summarize(data);
}

/**
 * Parses and validates a backup file's text.
 * @returns {{ ok: true, file, summary } | { ok: false, error: string }}
 */
export function parseBackup(text) {
  let file;
  try {
    file = JSON.parse(text);
  } catch {
    return { ok: false, error: "הקובץ לא נקרא — זה לא קובץ גיבוי תקין." };
  }
  if (file?.format !== BACKUP_FORMAT || typeof file.data !== "object" || !file.data) {
    return { ok: false, error: "זה לא קובץ גיבוי של בקתת הריפוי." };
  }
  if (file.version > BACKUP_VERSION) {
    return { ok: false, error: "הגיבוי נוצר בגרסה חדשה יותר של האפליקציה — עדכני ונסי שוב." };
  }
  const entries = Object.entries(file.data).filter(
    ([k, v]) => typeof k === "string" && typeof v === "string" && !EXCLUDED_KEYS.has(k),
  );
  if (!entries.length) return { ok: false, error: "קובץ הגיבוי ריק." };
  return { ok: true, file: { ...file, data: Object.fromEntries(entries) }, summary: summarize(file.data) };
}

/**
 * Replaces the data of both apps with the backup. Keys of the apps that are not in the
 * backup are removed, so the result matches the backup exactly (the Gemini key is kept).
 * The caller must reload right after, so in-memory state doesn't overwrite it.
 */
export function restoreBackup(file) {
  // Write first: if storage fills up midway, nothing was deleted yet.
  Object.entries(file.data).forEach(([k, v]) => localStorage.setItem(k, v));
  const existing = [];
  for (let i = 0; i < localStorage.length; i++) existing.push(localStorage.key(i));
  existing.forEach((k) => {
    if (k && !EXCLUDED_KEYS.has(k) && !(k in file.data)) localStorage.removeItem(k);
  });
}

export function lastBackupAt() {
  try {
    const t = Number(localStorage.getItem(LAST_BACKUP_KEY));
    return Number.isFinite(t) && t > 0 ? t : null;
  } catch {
    return null;
  }
}

export function isBackupDue(now = Date.now()) {
  const t = lastBackupAt();
  return !t || now - t > BACKUP_REMINDER_DAYS * 86_400_000;
}
