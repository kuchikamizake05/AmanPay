"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function Countdown({ deadline, label }: { deadline: number; label?: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    function tick() {
      const now = Math.floor(Date.now() / 1_000);
      const diff = deadline - now;
      if (diff <= 0) {
        setTimeLeft("Batas waktu terlewati");
        return;
      }

      const days = Math.floor(diff / 86_400);
      const hours = Math.floor((diff % 86_400) / 3_600);
      const minutes = Math.floor((diff % 3_600) / 60);
      const seconds = diff % 60;

      const parts = [];
      if (days > 0) parts.push(`${days} hari`);
      if (hours > 0 || days > 0) parts.push(`${hours} jam`);
      parts.push(`${minutes} menit`);
      parts.push(`${seconds} detik`);

      setTimeLeft(parts.join(" "));
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className="countdown-pill">
      <Clock size={15} />
      <span>{label || "Sisa waktu"}: <strong>{timeLeft}</strong></span>
    </div>
  );
}
