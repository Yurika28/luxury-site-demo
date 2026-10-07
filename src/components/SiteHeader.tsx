"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EVENT } from "@/lib/catalog";

/**
 * Sticky header. Transparent over the hero, solid sand once the hero's sentinel leaves the viewport.
 * The solid background fades in with opacity only; text colour swaps without animating.
 */
export function SiteHeader() {
  const sentinel = useRef<HTMLDivElement>(null);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setSolid(!entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ink = solid ? "text-espresso" : "text-sand";

  return (
    <>
      {/* Sits 64px below the top; once it scrolls out of view the header turns solid. */}
      <div ref={sentinel} aria-hidden="true" className="pointer-events-none absolute left-0 top-16 h-px w-px" />
      <header className={`fixed inset-x-0 top-0 z-40 ${ink}`}>
        <div
          aria-hidden="true"
          className={`absolute inset-0 border-b border-hairline bg-sand transition-opacity duration-300 ${solid ? "opacity-100" : "opacity-0"}`}
        />
        <div className="relative mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-20 md:px-[120px]">
          <Link href="/" className="flex min-h-11 items-center font-display text-2xl tracking-[0.01em] md:text-[28px]" aria-label="Maré Caribe, home">
            Maré Caribe
          </Link>
          <div className="flex items-center gap-8">
            {/* The hero already shows the dates, so the header only adds them once it is solid. */}
            <span className={`hidden text-[13px] text-muted ${solid ? "lg:block" : ""}`}>
              {EVENT.dates} · Cap Cana
            </span>
            <Link
              href="/booking/choose"
              className={`flex min-h-11 items-center px-[18px] text-xs font-semibold uppercase tracking-[0.16em] md:min-h-12 md:px-7 md:text-[13px] ${
                solid ? "bg-terracotta text-white" : "border border-sand text-sand"
              }`}
            >
              <span className="md:hidden">Book</span>
              <span className="hidden md:inline">Book your experience</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
