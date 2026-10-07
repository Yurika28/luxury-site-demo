"use client";
import { useEffect, useState } from "react";

const TARGET = new Date("2026-12-10T00:00:00-04:00").getTime();
const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown() {
  // null until mounted, so server and first client render match
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const d = now === null ? null : Math.max(0, TARGET - now);
  const units = [
    { l: "Days", v: d === null ? "--" : pad(Math.floor(d / 864e5)) },
    { l: "Hours", v: d === null ? "--" : pad(Math.floor(d / 36e5) % 24) },
    { l: "Min", v: d === null ? "--" : pad(Math.floor(d / 6e4) % 60) },
    { l: "Sec", v: d === null ? "--" : pad(Math.floor(d / 1e3) % 60) },
  ];

  return (
    <div
      role="timer"
      aria-label={d === null ? "Countdown to 10 December 2026" : `${units[0].v} days and ${units[1].v} hours until we gather`}
      className="grid grid-cols-4 gap-2 border-y border-hairline py-5 md:flex-1 md:gap-6 md:py-8"
    >
      {units.map((u) => (
        <div key={u.l} aria-hidden="true" className="flex flex-col items-center gap-1 md:flex-row md:items-baseline md:justify-center md:gap-3">
          <span className="font-display text-[44px] leading-none tabular-nums md:text-[72px]">{u.v}</span>
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted md:text-xs">{u.l}</span>
        </div>
      ))}
    </div>
  );
}
