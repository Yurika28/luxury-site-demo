"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { EVENT, type AddonId } from "@/lib/catalog";
import { priceLines, totalOf, usd } from "@/lib/pricing";
import { useBooking } from "@/store/booking";
import { Spinner, eyebrow, primaryBtn } from "./ui";

export interface NextAction {
  label: string;
  href?: string;
  onClick?: () => void;
  formId?: string;
  disabled?: boolean;
  busy?: boolean;
}

interface Props {
  step: number;
  label: string;
  back: string;
  title: string;
  lede?: string;
  next: NextAction;
  /** Add-ons that turned out to be unavailable; left out of the total. */
  unavailable?: AddonId[];
  showNoExtras?: boolean;
  /** Replaces the default total label (e.g. "Total · 2 guests"). */
  totalLabel?: string;
  children: ReactNode;
}

function NextButton({ next, className = "" }: { next: NextAction; className?: string }) {
  const cls = `${primaryBtn} ${className}`;
  const inner = (
    <>
      {next.busy && <Spinner />}
      {next.label}
    </>
  );
  if (next.href && !next.disabled) {
    return (
      <Link href={next.href} onClick={next.onClick} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      type={next.formId ? "submit" : "button"}
      form={next.formId}
      onClick={next.onClick}
      disabled={next.disabled || next.busy}
      aria-busy={next.busy}
      className={cls}
    >
      {inner}
    </button>
  );
}

export function StepFrame({ step, label, back, title, lede, next, unavailable = [], showNoExtras, totalLabel, children }: Props) {
  const store = useBooking();
  const [open, setOpen] = useState(false);
  const lines = priceLines(store, unavailable);
  const total = totalOf(store, unavailable);
  const guestsText = `${store.guests} ${store.guests === 1 ? "guest" : "guests"}`;
  const label2 = totalLabel ?? (showNoExtras ? `No extras · ${guestsText}` : `Total · ${guestsText}`);
  const showRestored = store.hydrated && store.restored && !store.restoredDismissed && step <= 2;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-hairline bg-sand">
        <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between px-2 md:h-[72px] md:px-[120px]">
          <Link href={back} aria-label="Back" className="flex size-11 items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4l-6 6 6 6" />
            </svg>
          </Link>
          <Link href="/" className="flex min-h-11 items-center font-display text-[22px] md:text-[26px]">{EVENT.name}</Link>
          <span className="size-11" aria-hidden="true" />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1200px] flex-1 gap-10 px-5 pb-44 pt-6 md:px-[120px] md:pt-12 lg:grid-cols-[1fr_360px] lg:pb-20">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className={`${eyebrow} text-muted`}>Step {step} of 5 · {label}</p>
            <div className="flex gap-1.5" role="presentation">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`h-[3px] flex-1 ${n <= step ? "bg-terracotta" : "bg-hairline"}`} />
              ))}
            </div>
          </div>

          {showRestored && (
            <div role="status" className="flex flex-col gap-1 border border-hairline bg-paper px-5 py-4">
              <strong className="text-[15px] font-semibold">Welcome back. We saved your choices.</strong>
              <div className="flex gap-4">
                <button
                  onClick={() => useBooking.getState().reset()}
                  className="min-h-11 text-sm font-medium text-terracotta underline underline-offset-4"
                >
                  Start again
                </button>
                <button
                  onClick={() => useBooking.getState().dismissRestored()}
                  className="min-h-11 text-sm font-medium text-muted underline underline-offset-4"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h1 className="font-display text-[40px] leading-none md:text-[56px]">{title}</h1>
            {lede && <p className="max-w-[52ch] text-base leading-relaxed text-muted">{lede}</p>}
          </div>

          {children}
        </div>

        {/* Desktop summary */}
        <aside className="hidden lg:block" aria-label="Your booking">
          <div className="sticky top-24 flex flex-col gap-5 border border-hairline bg-paper p-7">
            <h2 className="font-display text-[28px] leading-none">Your booking</h2>
            <ul className="flex flex-col gap-2.5 text-[15px]">
              {lines.length === 0 && <li className="text-muted">Nothing chosen yet.</li>}
              {lines.map((l) => (
                <li key={l.label} className="flex justify-between gap-4">
                  <span>{l.label}</span>
                  <span className="shrink-0">{usd(l.amount)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between border-t border-hairline pt-4">
              <span className="text-sm text-muted">{label2}</span>
              <span className="font-display text-[34px] leading-none">{usd(total)}</span>
            </div>
            <NextButton next={next} className="w-full" />
          </div>
        </aside>
      </main>

      {/* Mobile and tablet bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-paper lg:hidden">
        {open && (
          <ul id="price-lines" className="mx-auto flex max-w-[640px] flex-col gap-2 px-5 pt-4 text-sm">
            {lines.map((l) => (
              <li key={l.label} className="flex justify-between gap-4">
                <span>{l.label}</span>
                <span className="shrink-0">{usd(l.amount)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mx-auto flex max-w-[640px] flex-col gap-3 px-5 py-3">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="price-lines"
            onClick={() => setOpen((o) => !o)}
            className="flex min-h-11 items-center justify-between text-left"
          >
            <span className="text-[13px] text-muted">{label2} {open ? "▴" : "▾"}</span>
            <span className="font-display text-[30px] leading-none">{usd(total)}</span>
          </button>
          <NextButton next={next} />
        </div>
      </div>
    </div>
  );
}
