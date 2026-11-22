import { Coins } from "lucide-react";

// A coin amount with the same Lucide icon as the header balance, e.g. <CoinAmount amount="+4" />
export default function CoinAmount({ amount, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 whitespace-nowrap align-middle ${className}`}
    >
      {amount}
      <Coins className="h-3.5 w-3.5" aria-label="מטבעות" />
    </span>
  );
}
