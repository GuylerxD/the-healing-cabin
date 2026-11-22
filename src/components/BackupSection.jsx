import { useRef, useState } from "react";
import { Download, Upload, AlertTriangle } from "lucide-react";
import {
  BACKUP_REMINDER_DAYS,
  downloadBackup,
  isBackupDue,
  lastBackupAt,
  parseBackup,
  restoreBackup,
} from "../lib/backup";
import { reloadCabinFromStorage } from "../store";

export const BACKUP_CHANGED_EVENT = "cabin-backup-changed";

const formatDate = (t) =>
  new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(t);

export default function BackupSection() {
  const fileRef = useRef(null);
  const [lastAt, setLastAt] = useState(lastBackupAt);
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }
  const [pending, setPending] = useState(null); // parsed backup waiting for confirmation

  const due = isBackupDue();

  const handleDownload = () => {
    try {
      const s = downloadBackup();
      setLastAt(lastBackupAt());
      setMessage({
        type: "ok",
        text: `הגיבוי ירד ✓ (${s.kb}KB). שמרי אותו במקום בטוח — דרייב, מייל לעצמך או וואטסאפ לעצמך.`,
      });
      window.dispatchEvent(new CustomEvent(BACKUP_CHANGED_EVENT));
    } catch {
      setMessage({ type: "error", text: "הגיבוי נכשל. נסי שוב." });
    }
  };

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again
    if (!f) return;
    const result = parseBackup(await f.text());
    if (!result.ok) {
      setPending(null);
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage(null);
    setPending(result);
  };

  const confirmRestore = () => {
    try {
      restoreBackup(pending.file);
      reloadCabinFromStorage();
    } catch {
      setMessage({
        type: "error",
        text: "השחזור לא הושלם — ייתכן שהאחסון בדפדפן מלא. רענני את הדף, בדקי את הנתונים ונסי שוב.",
      });
      setPending(null);
      return;
    }
    window.location.reload();
  };

  return (
    <div className="space-y-3 text-xs">
      <p className={due ? "text-blush" : "text-muted"}>
        {lastAt
          ? `גיבוי אחרון: ${formatDate(lastAt)}`
          : "עוד לא נשמר גיבוי."}
        {due && ` • מומלץ לגבות כל ${BACKUP_REMINDER_DAYS} יום`}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-lilac px-3 py-2 font-bold text-space transition active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>הורדת גיבוי</span>
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 font-semibold text-moon transition hover:bg-white/10 active:scale-95"
        >
          <Upload className="h-4 w-4 text-lilac" />
          <span>שחזור מקובץ</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFile}
          className="hidden"
          aria-label="בחירת קובץ גיבוי"
        />
      </div>

      {pending && (
        <div
          role="alertdialog"
          aria-label="אישור שחזור"
          className="space-y-2 rounded-2xl border border-blush/40 bg-blush/10 p-3"
        >
          <p className="flex items-start gap-1.5 font-bold text-blush">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              השחזור יחליף את כל הנתונים הנוכחיים בשתי האפליקציות בנתונים מ-
              {formatDate(new Date(pending.file.createdAt))}.
            </span>
          </p>
          <p className="text-soft">
            בקתת הריפוי: {pending.summary.cabinKeys} פריטים • My Recipes:{" "}
            {pending.summary.recipesKeys} פריטים • {pending.summary.kb}KB
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmRestore}
              className="flex-1 rounded-xl bg-blush py-2 font-bold text-space active:scale-95"
            >
              כן, לשחזר
            </button>
            <button
              type="button"
              onClick={() => setPending(null)}
              className="flex-1 rounded-xl bg-white/10 py-2 font-semibold text-moon active:scale-95"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {message && (
        <p
          role="status"
          className={`rounded-xl p-2 ${
            message.type === "ok"
              ? "border border-mint/40 bg-mint/10 text-mint"
              : "border border-blush/40 bg-blush/10 text-blush"
          }`}
        >
          {message.text}
        </p>
      )}

      <p className="text-2xs text-muted">
        קובץ אחד שומר את בקתת הריפוי ואת My Recipes יחד (מטבעות, חיות, משקל,
        מתכונים ותפריט). מפתח ה-Gemini לא נכלל בקובץ.
      </p>
    </div>
  );
}
