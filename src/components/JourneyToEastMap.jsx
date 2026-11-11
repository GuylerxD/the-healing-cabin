import { useMemo } from "react";
import {
  Compass,
  Footprints,
  MapPin,
  Sparkles,
  Navigation,
} from "lucide-react";
import { useCabin, setCabin } from "../store";
import {
  minutesToKm,
  JOURNEY_WAYPOINTS,
  TOTAL_JOURNEY_KM,
  getCurrentWaypoint,
} from "../lib/pedometer";

export default function JourneyToEastMap() {
  const { walkingMinutes = 65 } = useCabin();

  const totalKm = useMemo(() => minutesToKm(walkingMinutes), [walkingMinutes]);
  const progressPct = Math.min(
    100,
    Math.round((totalKm / TOTAL_JOURNEY_KM) * 100),
  );
  const { current, next } = useMemo(
    () => getCurrentWaypoint(totalKm),
    [totalKm],
  );

  const addWalkMinutes = (mins) => {
    setCabin((s) => ({
      ...s,
      walkingMinutes: (s.walkingMinutes || 0) + mins,
      coins: s.coins + 10,
    }));
  };

  return (
    <section className="glass space-y-4 p-5 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-mint/20 text-mint">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-moon text-sm">
              המסע למזרח: בדרך לקוריאה ויפן
            </h3>
            <p className="text-xs text-purple-300">
              המרת דקות הליכה ביתית לקילומטרים וירטואליים
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-mint/15 px-3 py-1 text-xs font-bold text-mint">
          <Footprints className="h-3.5 w-3.5" />
          <span>{totalKm} ק״מ</span>
        </div>
      </div>

      {/* Progress & Current Position Info */}
      <div className="rounded-2xl bg-white/5 p-3.5 space-y-2 border border-white/10 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-moon font-semibold">
            <MapPin className="h-4 w-4 text-blush" />
            <span>
              מיקום נוכחי: {current.emoji} {current.name}
            </span>
          </div>
          {next ? (
            <span className="text-purple-300">
              עוד {(next.km - totalKm).toFixed(1)} ק״מ ל-{next.name}
            </span>
          ) : (
            <span className="text-mint font-bold">
              הגעת ליעד הסופי ביפן! 🌸
            </span>
          )}
        </div>

        {/* Journey Progress Bar */}
        <div
          className="h-2.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-l from-mint via-lilac to-blush transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-purple-300">
          <span>{walkingMinutes} דקות הליכה מצטברות</span>
          <span>{progressPct}% מהמסע הושלם</span>
        </div>
      </div>

      {/* Visual Waypoint Nodes */}
      <div className="relative pt-2 pb-1">
        <div className="grid grid-cols-6 gap-1 text-center">
          {JOURNEY_WAYPOINTS.map((wp) => {
            const isVisited = totalKm >= wp.km;
            const isCurrent = current.id === wp.id;
            return (
              <div key={wp.id} className="flex flex-col items-center">
                <span className="text-base">{wp.emoji}</span>
                <span
                  className={`mt-1 text-[10px] truncate max-w-full font-medium ${
                    isCurrent
                      ? "text-blush font-bold"
                      : isVisited
                        ? "text-mint"
                        : "text-purple-300/60"
                  }`}
                >
                  {wp.name.split(" ")[0]}
                </span>
                <span className="text-[9px] text-purple-400">{wp.km} ק״מ</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Walk Log action */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs">
        <span className="text-purple-200">השלמת אימון הליכה עכשיו?</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addWalkMinutes(15)}
            className="flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 text-moon text-xs hover:bg-white/20 transition active:scale-95"
          >
            <Sparkles className="h-3 w-3 text-mint" />
            <span>+15 דק' (+1.2 ק״מ)</span>
          </button>
          <button
            type="button"
            onClick={() => addWalkMinutes(25)}
            className="flex items-center gap-1 rounded-xl bg-mint px-2.5 py-1.5 text-space text-xs font-bold transition active:scale-95"
          >
            <Navigation className="h-3 w-3" />
            <span>+25 דק' קיי-פופ (+2 ק״מ)</span>
          </button>
        </div>
      </div>
    </section>
  );
}
