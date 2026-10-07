"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EVENT } from "@/lib/catalog";
import { priceLines, totalOf, usd } from "@/lib/pricing";
import { submitBooking } from "@/lib/mockApi";
import { useBooking } from "@/store/booking";
import { StepFrame } from "@/components/booking/StepFrame";
import { AlertBanner } from "@/components/booking/ui";

const edit = "inline-flex min-h-11 min-w-11 items-center justify-end text-sm font-medium text-terracotta underline underline-offset-4";

export default function Review() {
  const router = useRouter();
  const store = useBooking();
  const { hydrated, mode, guest } = store;
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const lines = priceLines(store);
  const total = totalOf(store);

  const confirm = () => {
    setBusy(true);
    setFailed(false);
    submitBooking(store, guest)
      .then((r) => {
        useBooking.getState().setReference(r.reference);
        router.push("/booking/confirmation");
      })
      .catch(() => {
        setBusy(false);
        setFailed(true);
      });
  };

  const stayEdit = mode === "package" ? "/booking/choose" : "/booking/build/room";
  const extrasEdit = mode === "package" ? "/booking/customise" : "/booking/build/experiences";

  return (
    <StepFrame
      step={4}
      label="Review"
      back="/booking/guest"
      title="Review your booking"
      lede="Check everything once more. Nothing is charged in this demo."
      totalLabel="Total"
      next={{
        label: failed ? `Try again · ${usd(total)}` : `Confirm · ${usd(total)}`,
        onClick: confirm,
        disabled: !agreed || !hydrated,
        busy,
      }}
    >
      {failed && (
        <AlertBanner title="We could not confirm your booking">
          Nothing has been booked and you have not been charged. Your details are saved, so you can try again.
        </AlertBanner>
      )}

      {hydrated && (
        <div className="flex max-w-[640px] flex-col gap-8">
          <section className="flex flex-col gap-2 border-t border-hairline pt-5" aria-labelledby="r-stay">
            <div className="flex items-center justify-between">
              <h2 id="r-stay" className="font-display text-[28px] leading-none">Your stay</h2>
              <Link href={stayEdit} className={edit}>Edit<span className="sr-only"> stay</span></Link>
            </div>
            <p className="text-[15px] text-muted">{EVENT.name} · {EVENT.dates} · {EVENT.place}</p>
            <p className="text-[15px]">{lines[0]?.label}</p>
          </section>

          <section className="flex flex-col gap-2 border-t border-hairline pt-5" aria-labelledby="r-extras">
            <div className="flex items-center justify-between">
              <h2 id="r-extras" className="font-display text-[28px] leading-none">Extras</h2>
              <Link href={extrasEdit} className={edit}>Edit<span className="sr-only"> extras</span></Link>
            </div>
            {lines.length > 1 ? (
              <ul className="flex flex-col gap-1.5 text-[15px]">
                {lines.slice(1).map((l) => <li key={l.label}>{l.label}</li>)}
              </ul>
            ) : (
              <p className="text-[15px] text-muted">No extras.</p>
            )}
          </section>

          <section className="flex flex-col gap-2 border-t border-hairline pt-5" aria-labelledby="r-you">
            <div className="flex items-center justify-between">
              <h2 id="r-you" className="font-display text-[28px] leading-none">You</h2>
              <Link href="/booking/guest" className={edit}>Edit<span className="sr-only"> details</span></Link>
            </div>
            <p className="text-[15px]">{guest.name}</p>
            <p className="text-[15px] text-muted">{guest.email} · {guest.phone}</p>
            <p className="text-[15px] text-muted">{guest.nationality} · Flight {guest.flight.toUpperCase()} · {guest.arrivalDate} at {guest.arrivalTime}</p>
          </section>

          <section className="flex flex-col gap-3 border-t border-hairline pt-5" aria-labelledby="r-price">
            <h2 id="r-price" className="font-display text-[28px] leading-none">Price</h2>
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
              <span className="font-display text-[34px] leading-none">{usd(total)}</span>
            </div>
          </section>

          <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[15px] leading-relaxed">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-6 shrink-0 accent-terracotta" />
            I have read and accept the booking terms.
          </label>
        </div>
      )}
    </StepFrame>
  );
}
