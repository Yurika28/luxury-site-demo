"use client";
import Link from "next/link";
import { EVENT } from "@/lib/catalog";
import { priceLines, totalOf, usd } from "@/lib/pricing";
import { useBooking } from "@/store/booking";
import { CheckIcon, eyebrow, primaryBtn } from "@/components/booking/ui";

export default function Confirmation() {
  const store = useBooking();
  const { hydrated, reference, guest } = store;

  if (!hydrated) return <main className="mx-auto min-h-dvh max-w-[640px] px-5 py-16" aria-busy="true" />;

  if (!reference) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col items-start gap-5 px-5 py-16">
        <h1 className="font-display text-[40px] leading-none">No booking yet</h1>
        <p className="text-base text-muted">There is nothing to confirm. Start with your stay.</p>
        <Link href="/booking/choose" className={`${primaryBtn} w-full sm:w-fit`}>Choose your stay</Link>
      </main>
    );
  }

  const lines = priceLines(store);
  const first = guest.name.split(" ")[0] || "there";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col gap-8 px-5 py-12 md:py-20">
      <Link href="/" className="flex min-h-11 w-fit items-center font-display text-[26px]">{EVENT.name}</Link>
      <div className="flex flex-col gap-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-terracotta text-white"><CheckIcon size={24} /></span>
        <h1 className="font-display text-[44px] leading-none md:text-[56px]">See you in Cap Cana, {first}.</h1>
        <p className="text-base leading-relaxed text-muted">
          Your booking is confirmed. We have sent the details to {guest.email}.
        </p>
      </div>

      <div className="flex flex-col gap-1 border border-hairline bg-paper p-6">
        <span className={`${eyebrow} text-muted`}>Booking reference</span>
        <span className="font-display text-[36px] leading-none">{reference}</span>
      </div>

      <section className="flex flex-col gap-3" aria-label="Summary">
        <p className="text-[15px] text-muted">{EVENT.dates} · {EVENT.place}</p>
        <ul className="flex flex-col gap-2 text-[15px]">
          {lines.map((l) => (
            <li key={l.label} className="flex justify-between gap-4">
              <span>{l.label}</span>
              <span className="shrink-0">{usd(l.amount)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-hairline pt-3">
          <span className="text-sm text-muted">Total</span>
          <span className="font-display text-[34px] leading-none">{usd(totalOf(store))}</span>
        </div>
        <p className="text-sm text-muted">Arriving {guest.arrivalDate} at {guest.arrivalTime}, flight {guest.flight.toUpperCase()}.</p>
      </section>

      <Link href="/" onClick={() => useBooking.getState().reset()} className={`${primaryBtn} w-full sm:w-fit`}>
        Start a new booking
      </Link>
    </main>
  );
}
