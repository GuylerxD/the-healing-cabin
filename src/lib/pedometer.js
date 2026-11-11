// Virtual Distance & Pedometer conversion for Indoor Walking workouts
// 1 minute of indoor walking = ~110 steps = ~0.083 km (5.0 km/h pace)
export const KM_PER_MINUTE = 0.0833;
export const STEPS_PER_MINUTE = 110;

export const JOURNEY_WAYPOINTS = [
  {
    id: "haifa",
    name: "חיפה (ישראל)",
    km: 0,
    emoji: "🏡",
    desc: "נקודת היציאה מהבקתה",
  },
  {
    id: "dubai",
    name: "דובאי",
    km: 25,
    emoji: "🐪",
    desc: "עצירת ביניים ראשונה",
  },
  {
    id: "mumbai",
    name: "מומבאי (הודו)",
    km: 65,
    emoji: "🫖",
    desc: "תה צ'אי ותבלינים",
  },
  {
    id: "bangkok",
    name: "בנגקוק (תאילנד)",
    km: 110,
    emoji: "🏮",
    desc: "שווקים צפים ורוגע",
  },
  {
    id: "seoul",
    name: "סיאול (דרום קוריאה)",
    km: 160,
    emoji: "🎧",
    desc: "יעד הקיי-פופ המרכזי!",
  },
  {
    id: "tokyo",
    name: "טוקיו (יפן)",
    km: 210,
    emoji: "🌸",
    desc: "גני הזן ופריחת הדובדבן",
  },
];

export const TOTAL_JOURNEY_KM = 210;

export function minutesToKm(minutes) {
  if (!minutes || minutes <= 0) return 0;
  return Number((minutes * KM_PER_MINUTE).toFixed(1));
}

export function kmToMinutes(km) {
  if (!km || km <= 0) return 0;
  return Math.round(km / KM_PER_MINUTE);
}

export function getCurrentWaypoint(currentKm) {
  for (let i = JOURNEY_WAYPOINTS.length - 1; i >= 0; i--) {
    if (currentKm >= JOURNEY_WAYPOINTS[i].km) {
      const current = JOURNEY_WAYPOINTS[i];
      const next = JOURNEY_WAYPOINTS[i + 1] || null;
      return { current, next };
    }
  }
  return { current: JOURNEY_WAYPOINTS[0], next: JOURNEY_WAYPOINTS[1] };
}
