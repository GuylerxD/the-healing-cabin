import { useEffect, useState } from "react";
import { X, Settings, Pill, Star, Check, ShieldCheck } from "lucide-react";
import { setCabin, useCabin } from "../store";
import PillReminderToggle from "./PillReminderToggle";
import BackupSection from "./BackupSection";

function Section({ icon: Icon, title, hint, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-mint">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-moon">{title}</h3>
          {hint && <p className="text-2xs text-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function SettingsModal({ isOpen, onClose }) {
  const { longGoal = "" } = useCabin();
  const [goalDraft, setGoalDraft] = useState(longGoal);
  const [goalSaved, setGoalSaved] = useState(false);

  // Refresh the draft each time the window opens
  useEffect(() => {
    if (isOpen) {
      setGoalDraft(longGoal);
      setGoalSaved(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-space/80 backdrop-blur-sm sm:items-center sm:p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-3xl border border-white/15 bg-space-light text-right shadow-2xl sm:rounded-3xl"
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2
            id="settings-title"
            className="flex items-center gap-2 text-lg font-bold text-moon"
          >
            <Settings className="h-5 w-5 text-lilac" />
            <span>הגדרות</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירת ההגדרות"
            className="rounded-full bg-white/10 p-1.5 text-muted transition hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-6 overflow-y-auto px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <Section
            icon={ShieldCheck}
            title="גיבוי ושחזור"
            hint="כל הנתונים שמורים רק בדפדפן — גיבוי שומר עליהם אם מחליפים טלפון או מנקים נתונים"
          >
            <BackupSection />
          </Section>

          <Section
            icon={Pill}
            title="התראות לגלולת זואלי"
            hint="שעה קבועה, התראת מערכת ותזכורת בתוך האפליקציה"
          >
            <PillReminderToggle />
          </Section>

          <Section
            icon={Star}
            title="המטרה הגדולה שלי"
            hint="אופציונלי — חלום רחוק שיופיע בראש המסך"
          >
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setCabin((s) => ({
                  ...s,
                  longGoal: goalDraft.trim().slice(0, 40),
                }));
                setGoalSaved(true);
              }}
            >
              <input
                value={goalDraft}
                maxLength={40}
                onChange={(e) => {
                  setGoalDraft(e.target.value);
                  setGoalSaved(false);
                }}
                placeholder="למשל: טיול חלומות 🌸"
                className="min-w-0 flex-1 rounded-2xl bg-white/10 px-4 py-2 text-sm text-moon placeholder:text-muted"
              />
              <button className="flex items-center gap-1 rounded-2xl bg-lilac px-4 py-2 text-sm font-bold text-space">
                {goalSaved && <Check className="h-4 w-4" />}
                {goalSaved ? "נשמר" : "שמירה"}
              </button>
            </form>
          </Section>
        </div>
      </div>
    </div>
  );
}
