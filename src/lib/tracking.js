const DAY_MS = 864e5;

// Dates are local 'YYYY-MM-DD' keys; parsing both as UTC keeps the day diff exact.
export function daysUntilNextWeighIn(weighIns, today) {
  if (!weighIns.length) return 0;
  const diff = Math.round(
    (Date.parse(today) - Date.parse(weighIns.at(-1).date)) / DAY_MS,
  );
  return Math.max(0, 7 - diff);
}

// Trailing moving average; window 4 weekly points ≈ a monthly trend.
export function smooth(values, window = 4) {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

// Average of `field` on days matching vs not matching `predicate`; null until 3+ days per group.
export function compareBy(days, field, predicate) {
  const yes = [];
  const no = [];
  for (const d of Object.values(days)) {
    if (d[field] == null) continue;
    (predicate(d) ? yes : no).push(d[field]);
  }
  const avg = (a) =>
    a.length >= 3 ? a.reduce((x, y) => x + y, 0) / a.length : null;
  return { yes: avg(yes), no: avg(no) };
}
