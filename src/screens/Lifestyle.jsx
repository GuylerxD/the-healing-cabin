import { Compass, Dog, Home, Heart } from "lucide-react";
import CollapsibleCard from "../components/CollapsibleCard";
import MochiWalkTracker from "../components/MochiWalkTracker";
import HomeResetOrganization from "../components/HomeResetOrganization";
import DateNightRoulette from "../components/DateNightRoulette";

export default function Lifestyle() {
  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Title Banner */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-mint flex items-center gap-2">
            <Compass className="h-5 w-5" />
            <span>אורח חיים, בית ודייטים (Lifestyle)</span>
          </h2>
          <p className="text-xs text-purple-300">
            הרגלי שטח עם מוצ׳י, שגרת סדר בבית ורולטת בילויים זוגית בחיפה
          </p>
        </div>
        <span className="rounded-full bg-lilac/20 border border-lilac/30 px-3 py-1 text-xs font-bold text-lilac">
          חיים בריאים ✨
        </span>
      </div>

      {/* 1. Mochi's Real-World Walks */}
      <CollapsibleCard
        id="lifestyle-mochi-walks"
        title="טיולי שטח עם מוצ׳י בחיפה"
        badge="טיילות חיפה • חטיפי כלבים לחדר הריפוי"
        icon={Dog}
        defaultOpen={true}
      >
        <MochiWalkTracker />
      </CollapsibleCard>

      {/* 2. Home Reset & Organization */}
      <CollapsibleCard
        id="lifestyle-home-reset"
        title="שגרת טיפוח הבית ואיפוס שבועי"
        badge="רובורוק, שיאומי וצמחים • רהיטים לחדר הוירטואלי"
        icon={Home}
        defaultOpen={true}
      >
        <HomeResetOrganization />
      </CollapsibleCard>

      {/* 3. Date Night Roulette */}
      <CollapsibleCard
        id="lifestyle-date-roulette"
        title="רולטת דייטים בחיפה (מוגן גב & אכלנים בררנים)"
        badge="ארקייד, חדר בריחה, באולינג, וולט ומושבה"
        icon={Heart}
        defaultOpen={true}
      >
        <DateNightRoulette />
      </CollapsibleCard>
    </div>
  );
}
