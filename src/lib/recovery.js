export const RECOVERY_MS_PER_COIN = 5 * 60_000; // 1 coin per 5 resting minutes
export const RECOVERY_DAILY_CAP = 15;

// Coins earned for a rest session, capped by what's left of today's allowance.
export function recoveryCoins(startMs, nowMs, earnedToday = 0) {
  const raw = Math.floor(Math.max(0, nowMs - startMs) / RECOVERY_MS_PER_COIN);
  return Math.max(0, Math.min(raw, RECOVERY_DAILY_CAP - earnedToday));
}
