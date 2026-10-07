"use client";
import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ADDON_PHOTOS } from "@/lib/assets";
import { type Addon, type AddonId } from "@/lib/catalog";
import { fetchAddons } from "@/lib/mockApi";
import { usd } from "@/lib/pricing";
import { useBooking } from "@/store/booking";
import { StepFrame } from "./StepFrame";
import { CheckIcon, ErrorPanel, Notice, Skeleton, primaryBtn } from "./ui";

const GROUPS = ["Arrival", "Evenings", "Days"] as const;

interface Props {
  step: number;
  label: string;
  back: string;
  title: string;
  lede: string;
  nextHref: string;
  nextLabel?: string;
  top?: ReactNode;
}

export function AddonsStep({ step, label, back, title, lede, nextHref, nextLabel = "Continue", top }: Props) {
  const { hydrated, guests, addons, toggleAddon, removeAddon } = useBooking();
  const [list, setList] = useState<Addon[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [removed, setRemoved] = useState<Addon[]>([]);

  useEffect(() => {
    let live = true;
    fetchAddons()
      .then((a) => live && setList(a))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [attempt]);

  // A saved add-on that has since sold out is dropped, and we say so.
  // Reacts to the store and the fetched list rather than setting state in an effect.
  const gone = useMemo(() => (list && hydrated ? list.filter((a) => a.soldOut && addons.includes(a.id)) : []), [list, hydrated, addons]);
  const ids = gone.map((a) => a.id).join(",");
  useEffect(() => {
    if (!ids) return;
    const hit = ids.split(",") as AddonId[];
    hit.forEach((id) => useBooking.getState().removeAddon(id));
    Promise.resolve().then(() => setRemoved((r) => [...r, ...gone.filter((a) => hit.includes(a.id))]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  const retry = () => {
    setError(false);
    setList(null);
    setAttempt((n) => n + 1);
  };

  const noExtras = addons.length === 0;

  return (
    <StepFrame
      step={step}
      label={label}
      back={back}
      title={title}
      lede={lede}
      showNoExtras={noExtras}
      next={{ label: nextLabel, href: nextHref }}
    >
      <div aria-busy={!list && !error} className="flex flex-col gap-8">
        {top}

        {removed.length > 0 && (
          <Notice title={`${removed.map((a) => a.name).join(" and ")} is no longer available`} onDismiss={() => setRemoved([])}>
            We have taken it out of your booking and updated your total.
          </Notice>
        )}

        {error && !skipped && (
          <ErrorPanel
            title="We could not load the add-ons"
            actions={
              <div className="flex flex-wrap items-center gap-4">
                <button onClick={retry} className={primaryBtn}>Try again</button>
                <button onClick={() => setSkipped(true)} className="min-h-11 text-[15px] font-medium text-terracotta underline underline-offset-4">
                  Continue without add-ons
                </button>
              </div>
            }
          >
            This is on our side. Your stay is saved, and you can add extras later.
          </ErrorPanel>
        )}
        {error && skipped && <Notice title="Continuing without add-ons" onDismiss={() => setSkipped(false)} dismissLabel="Change my mind" />}

        {!list && !error && [0, 1, 2].map((i) => <Skeleton key={i} className="h-[300px]" />)}

        {list && hydrated &&
          GROUPS.map((g) => {
            const items = list.filter((a) => a.group === g);
            return (
              <section key={g} className="flex flex-col gap-4" aria-labelledby={`grp-${g}`}>
                <h2 id={`grp-${g}`} className="font-display text-[28px] leading-none">{g}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((a) => {
                    const on = addons.includes(a.id);
                    return (
                      <article key={a.id} className="flex flex-col border border-hairline bg-paper">
                        <div className="relative h-[150px] bg-shell">
                          <Image src={ADDON_PHOTOS[a.id].src} alt={ADDON_PHOTOS[a.id].alt} fill sizes="(min-width: 768px) 360px, 100vw" className="object-cover" />
                          {a.soldOut && (
                            <span className="absolute right-3 top-3 border border-espresso bg-sand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">Fully booked</span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-5">
                          <div className="flex items-baseline justify-between gap-3">
                            <h3 className="font-display text-[28px] leading-none">{a.name}</h3>
                            <span className="shrink-0 text-[15px] font-medium">{usd(a.price)}</span>
                          </div>
                          <p className="text-[15px] leading-relaxed text-muted">{a.desc}</p>
                          <p className="text-[13px] text-muted">Per person · {usd(a.price * guests)} for {guests}</p>
                          {a.soldOut ? (
                            <>
                              <button disabled className={`${primaryBtn} w-full`}>Unavailable</button>
                              <a href={`mailto:hello@marecaribe.example?subject=Notify me: ${encodeURIComponent(a.name)}`} className="min-h-11 text-sm font-medium text-terracotta underline underline-offset-4">
                                Tell me if a place opens
                              </a>
                            </>
                          ) : (
                            <button
                              type="button"
                              aria-pressed={on}
                              onClick={() => (on ? removeAddon(a.id) : toggleAddon(a.id))}
                              className={`flex min-h-[52px] w-full items-center justify-center gap-2 border-2 text-[13px] font-semibold uppercase tracking-[0.16em] ${on ? "border-terracotta bg-terracotta text-white" : "border-espresso text-espresso hover:bg-shell"}`}
                            >
                              {on && <CheckIcon />}
                              {on ? "Added" : "Add"} · {usd(a.price * guests)}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
      </div>
    </StepFrame>
  );
}
