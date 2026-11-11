import { useState, useMemo } from "react";
import plansData from "../data/plansDB.json";
import { useCabin } from "../store";

const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

const WEEKLY_PLAN = plansData.weeklyPlan || [];

export const SOS_WORKOUT = {
  id: "sos-stretch",
  title: "מתיחות עדינות בעמידה והסדרת נשימה (מצב SOS) 🫁",
  category: "SOS Standing Stretch",
  durationMinutes: 8,
  impact: "אפס קפיצות, מנוחה מלאה והקלה לאסתמה",
  spineSafety:
    "100% בטוח לעמוד השדרה: ללא כיפוף גב, ללא פיתולים, נשימות סרעפתיות והרפיית שכמות בעמידה זקופה",
  description:
    "רוטינת חירום מרגיעה (8 דק׳) לאחר משמרת מעייפת או קוצר נשימה: סיבובי כתפיים רכים, פתיחת בית חזה ללא הקשתת יתר, והארכת עמוד שדרה ניטרלי.",
  youtubeQuery: "gentle standing stretch spine safe asthma friendly",
};

function getCurrentDayIndex() {
  return new Date().getDay();
}

/**
 * Custom hook to retrieve daily spine-safe workouts and PCOS blood sugar-balanced nutrition plans.
 * @param {number|null} initialDay - Optional day index (0 = Sunday ... 6 = Saturday). Defaults to today or customMealPlanDay.
 * @param {Object} options - { sosMode: boolean }
 */
export function useDailyPlan(initialDay = null, options = {}) {
  const { sosMode = false } = options;
  const { customMealPlanDay } = useCabin();
  const [todayIndex] = useState(getCurrentDayIndex);

  // If initialDay is explicitly provided, use it; otherwise, if user picked a custom meal day in Meal Prep, respect it for nutrition.
  const activeDayIndex =
    initialDay !== null
      ? initialDay
      : customMealPlanDay !== null && customMealPlanDay !== undefined
        ? customMealPlanDay
        : todayIndex;

  const [selectedDayIndex, setSelectedDayIndex] = useState(activeDayIndex);

  const rawTodayPlan = useMemo(() => {
    // If user explicitly chose another day's plan for today's meals, use it
    const effectiveDayIndex =
      customMealPlanDay !== null && customMealPlanDay !== undefined
        ? customMealPlanDay
        : todayIndex;
    return (
      WEEKLY_PLAN.find((d) => d.dayIndex === effectiveDayIndex) ||
      WEEKLY_PLAN[0]
    );
  }, [todayIndex, customMealPlanDay]);

  const rawSelectedPlan = useMemo(() => {
    return (
      WEEKLY_PLAN.find((d) => d.dayIndex === selectedDayIndex) || rawTodayPlan
    );
  }, [selectedDayIndex, rawTodayPlan]);

  // If SOS mode is active, automatically swap workout for the 8-minute gentle standing stretch
  const todayPlan = useMemo(() => {
    if (!sosMode) return rawTodayPlan;
    return {
      ...rawTodayPlan,
      workout: SOS_WORKOUT,
    };
  }, [rawTodayPlan, sosMode]);

  const selectedPlan = useMemo(() => {
    if (!sosMode) return rawSelectedPlan;
    return {
      ...rawSelectedPlan,
      workout: SOS_WORKOUT,
    };
  }, [rawSelectedPlan, sosMode]);

  return {
    todayIndex,
    todayPlan,
    selectedPlan,
    selectedDayIndex,
    setSelectedDayIndex,
    isToday: selectedDayIndex === todayIndex,
    dayNameHe: HEBREW_DAYS[selectedDayIndex] || "",
    activeNutritionDayName:
      HEBREW_DAYS[
        customMealPlanDay !== null && customMealPlanDay !== undefined
          ? customMealPlanDay
          : todayIndex
      ] || "",
    isCustomDayChosen:
      customMealPlanDay !== null &&
      customMealPlanDay !== undefined &&
      customMealPlanDay !== todayIndex,
    weeklyPlan: WEEKLY_PLAN,
    meta: plansData.meta,
    isSosActive: sosMode,
  };
}

export default useDailyPlan;
