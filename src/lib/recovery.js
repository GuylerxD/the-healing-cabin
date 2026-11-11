export const RECOVERY_MS_PER_COIN = 2 * 60_000; // 1 coin per 2 resting minutes
export const RECOVERY_DAILY_CAP = 40;

// Coins earned for a rest session, capped by what's left of today's allowance.
export function recoveryCoins(startMs, nowMs, earnedToday = 0) {
  const raw = Math.floor(Math.max(0, nowMs - startMs) / RECOVERY_MS_PER_COIN);
  return Math.max(0, Math.min(raw, RECOVERY_DAILY_CAP - earnedToday));
}
