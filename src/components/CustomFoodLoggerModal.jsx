import { useState } from "react";
import { X, Sparkles, Plus, Loader2, KeyRound } from "lucide-react";
import { parseCustomFood } from "../lib/foodLogger";
import { useCabin, setCabin } from "../store";

const SOURCE_LABELS = {
  ai: "✨ חושב ע״י Gemini AI",
  db: "🌐 מאגר תזונה מהאינטרנט (Open Food Facts)",
  local: "📋 הערכה חכמה מקומית",
};

export default function CustomFoodLoggerModal({
  isOpen,
  mealSlotTitle,
  onClose,
  onSaveCustomMeal,
}) {
  const { geminiApiKey = "" } = useCabin();
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [showKeyInput, setShowKeyInput] = useState(false);

  if (!isOpen) return null;

  const handleAnalyzeOrSave = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!estimate) {
      setIsAnalyzing(true);
      try {
        const result = await parseCustomFood(text, geminiApiKey);
        setEstimate(result);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Save directly
      onSaveCustomMeal({
        customName: estimate.name,
        calories: Number(estimate.calories),
        proteinGrams: Number(estimate.protein),
        breakdown: estimate.breakdown || "",
        source: estimate.source || "local",
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setText("");
    setEstimate(null);
    setIsAnalyzing(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space/80 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-space-light p-5 shadow-2xl space-y-4 text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full bg-white/10 p-1.5 text-purple-300 hover:bg-white/20 transition"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-right">
            <h3 className="font-bold text-sm text-moon">
              מה אכלת ב{mealSlotTitle}?
            </h3>
            <span className="text-[11px] text-purple-300">
              חישוב קלוריות וחלבון אוטומטי מהאינטרנט / AI
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleAnalyzeOrSave} className="space-y-3.5">
          <div>
            <label className="block text-xs text-purple-200 mb-1.5">
              מה אכלת בארוחה זו?
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (estimate) setEstimate(null); // Reset preview on edit
              }}
              placeholder="לדוגמה: 2 ביצים קשות, 1 פרוסת לחם שיפון וכף גבינת עיזים"
              className="w-full rounded-2xl bg-white/5 border border-white/15 p-3 text-xs text-moon placeholder:text-purple-400 focus:outline-none focus:border-mint transition"
            />
          </div>

          {/* AI / DB estimate preview */}
          {estimate && (
            <div className="rounded-2xl border border-mint/40 bg-mint/10 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-mint font-bold">
                  <Sparkles className="h-4 w-4" />
                  <span>תוצאת חישוב:</span>
                </div>
                <span className="text-[10px] text-purple-200">
                  {SOURCE_LABELS[estimate.source] || SOURCE_LABELS.local}
                </span>
              </div>
              {estimate.breakdown && (
                <p className="text-[11px] text-purple-100 leading-snug">
                  {estimate.breakdown}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="rounded-xl bg-white/10 p-2">
                  <span className="text-[10px] text-purple-200 block">
                    קלוריות
                  </span>
                  <input
                    type="number"
                    value={estimate.calories}
                    onChange={(e) =>
                      setEstimate({ ...estimate, calories: e.target.value })
                    }
                    className="w-full bg-transparent text-center font-bold text-moon text-sm focus:outline-none"
                  />
                  <span className="text-[9px] text-purple-300">קק״ל</span>
                </div>
                <div className="rounded-xl bg-white/10 p-2">
                  <span className="text-[10px] text-purple-200 block">
                    חלבון
                  </span>
                  <input
                    type="number"
                    value={estimate.protein}
                    onChange={(e) =>
                      setEstimate({ ...estimate, protein: e.target.value })
                    }
                    className="w-full bg-transparent text-center font-bold text-mint text-sm focus:outline-none"
                  />
                  <span className="text-[9px] text-mint">גרם חלבון</span>
                </div>
              </div>
              <p className="text-[10px] text-purple-300 text-center">
                ניתן לערוך ידנית את הערכים לפני האישור
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-2xl bg-white/10 py-2.5 text-xs font-semibold text-purple-200 hover:bg-white/15 transition"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={!text.trim() || isAnalyzing}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-mint py-2.5 text-xs font-bold text-space shadow-md shadow-mint/20 hover:bg-mint/90 transition active:scale-95 disabled:opacity-40"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>מנתח ארוחה...</span>
                </>
              ) : estimate ? (
                <>
                  <Plus className="h-4 w-4" />
                  <span>אשר והזן למדדים</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>חשב קלוריות וחלבון</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Optional Gemini AI Key setup */}
        <div className="border-t border-white/10 pt-2.5">
          <button
            type="button"
            onClick={() => setShowKeyInput((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] text-purple-300 hover:text-lilac transition"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>
              {geminiApiKey
                ? "מפתח Gemini AI מחובר (לחצי לעריכה)"
                : "חיבור מפתח Gemini AI חינמי (אופציונלי)"}
            </span>
          </button>
          {showKeyInput && (
            <div className="mt-2 space-y-1.5">
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) =>
                  setCabin((s) => ({ ...s, geminiApiKey: e.target.value }))
                }
                placeholder="הדביקי מפתח Gemini API (נשמר בדפדפן שלך בלבד)"
                className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-1.5 text-[11px] text-moon placeholder:text-purple-400 focus:outline-none focus:border-lilac"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
