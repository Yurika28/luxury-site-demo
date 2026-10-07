"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EVENT, type Pkg } from "@/lib/catalog";
import { fetchPackages } from "@/lib/mockApi";
import { usd } from "@/lib/pricing";
import { useBooking } from "@/store/booking";
import { StepFrame } from "@/components/booking/StepFrame";
import { CheckIcon, ErrorPanel, Notice, Skeleton, Stepper, linkBtn, primaryBtn } from "@/components/booking/ui";

export default function Choose() {
  const { hydrated, guests, packageId, setPackage, setGuests } = useBooking();
  const [pkgs, setPkgs] = useState<Pkg[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [priceNote, setPriceNote] = useState(false);

  useEffect(() => {
    let live = true;
    fetchPackages()
      .then((p) => live && setPkgs(p))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [attempt]);

  const retry = () => {
    setError(false);
    setPkgs(null);
    setAttempt((n) => n + 1);
  };
  const changeGuests = (n: number) => {
    setGuests(n);
    setPriceNote(true);
  };

  const selected = pkgs?.find((p) => p.id === packageId);
  const blocked = !selected || !!selected.soldOut;

  return (
    <StepFrame
      step={1}
      label="Your stay"
      back="/"
      title="Choose your stay"
      lede={`Three ways to spend ${EVENT.dates} in Cap Cana. Prices are per person.`}
      next={{ label: "Continue", href: "/booking/customise", disabled: blocked, onClick: () => useBooking.getState().setMode("package") }}
    >
      <div aria-busy={!pkgs && !error} className="flex flex-col gap-6">
        {hydrated && (
          <div className="flex flex-col gap-3">
            <Stepper label="Guests" sub={`Up to ${EVENT.maxGuests} online`} noun="guests" value={guests} min={1} max={EVENT.maxGuests} onChange={changeGuests} />
            {guests >= EVENT.maxGuests && (
              <p className="text-sm text-muted">
                Planning for more than {EVENT.maxGuests}? <a href="mailto:hello@marecaribe.example" className="text-terracotta underline underline-offset-4">Write to us</a> and we will arrange it.
              </p>
            )}
            {priceNote && <Notice title={`Prices updated for ${guests} ${guests === 1 ? "guest" : "guests"}`} />}
          </div>
        )}

        {error && (
          <ErrorPanel
            title="We could not load the packages"
            actions={<button onClick={retry} className={`${primaryBtn} w-fit`}>Try again</button>}
          >
            This is on our side, not yours. Please try again in a moment. Nothing you have chosen has been lost.
          </ErrorPanel>
        )}

        {!pkgs && !error && [0, 1, 2].map((i) => <Skeleton key={i} className="h-[200px]" />)}

        {pkgs && hydrated && (
          <fieldset className="flex flex-col gap-4">
            <legend className="sr-only">Package</legend>
            {pkgs.map((p) => {
              const on = packageId === p.id && !p.soldOut;
              return (
                <label
                  key={p.id}
                  className={`flex flex-col gap-3 border-2 p-5 ${p.soldOut ? "border-hairline opacity-80" : "cursor-pointer"} ${on ? "border-terracotta bg-paper" : "border-hairline"}`}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="font-display block text-[32px] leading-none">{p.name}</span>
                      <span className="mt-1.5 block text-sm text-muted">{p.sub}</span>
                    </span>
                    {p.soldOut ? (
                      <span className="shrink-0 border border-espresso px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">Sold out</span>
                    ) : (
                      <input
                        type="radio"
                        name="pkg"
                        checked={on}
                        onChange={() => setPackage(p.id)}
                        className="size-6 shrink-0 accent-terracotta"
                      />
                    )}
                  </span>
                  <ul className="flex flex-col gap-1.5 text-[15px]">
                    {p.items.map((i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 text-terracotta"><CheckIcon size={14} /></span>
                        {i}
                      </li>
                    ))}
                  </ul>
                  <span className="font-display text-[30px] leading-none">
                    {usd(p.price)}{" "}
                    <span className="font-sans text-[13px] text-muted">per person · {usd(p.price * guests)} for {guests}</span>
                  </span>
                  {p.left && !p.soldOut && <span className="text-[13px] font-semibold text-terracotta">Only {p.left} places left</span>}
                  {p.soldOut && (
                    <span className="text-sm text-muted">
                      Fully booked for these dates.{" "}
                      <a href="mailto:hello@marecaribe.example?subject=Waitlist" className="text-terracotta underline underline-offset-4">Join the waitlist</a>
                    </span>
                  )}
                </label>
              );
            })}
          </fieldset>
        )}

        <Link href="/booking/build/room" className={`${linkBtn} w-fit`} onClick={() => useBooking.getState().setMode("build")}>
          Prefer to build your own?
        </Link>
      </div>
    </StepFrame>
  );
}
