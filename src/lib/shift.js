const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// Handles night shifts that cross midnight.
export function shiftProgress(start, end, nowMin) {
  const s = toMin(start);
  let e = toMin(end);
  let n = nowMin;
  if (e <= s) {
    e += 1440;
    if (n < s) n += 1440;
  }
  if (n < s) return { pct: 0, label: "המשמרת עוד לא התחילה ☕" };
  if (n >= e) return { pct: 100, label: "המשמרת הסתיימה — זמן מנוחה 🌙" };
  const left = e - n;
  return {
    pct: Math.round(((n - s) / (e - s)) * 100),
    label: `נשארו ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")} שעות • זכרי מים והפסקת נשימה`,
  };
}
