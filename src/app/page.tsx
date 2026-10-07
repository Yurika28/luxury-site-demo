import Image from "next/image";
import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { SiteHeader } from "@/components/SiteHeader";
import { ScrollMotion } from "@/components/ScrollMotion";
import { HERO, PLACE, PLACES } from "@/lib/assets";
import { EVENT } from "@/lib/catalog";

const cta =
  "flex min-h-[52px] items-center justify-center bg-terracotta px-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-white";
const eyebrow = "text-[11px] font-medium uppercase tracking-[0.22em] md:text-xs";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-espresso focus:px-4 focus:py-3 focus:text-sand"
      >
        Skip to content
      </a>
      <SiteHeader />

      <ScrollMotion className="flex-1">
      <main id="main">
        {/* Hero: a still, with a dark wash so the text keeps AA contrast over the photo. */}
        <section className="relative h-175 overflow-hidden bg-dusk text-sand md:h-205">
          <div data-parallax className="absolute inset-x-0 inset-y-[-10%]">
            <Image src={HERO.src} alt={HERO.alt} fill priority sizes="100vw" className="object-cover" />
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-dusk via-dusk/60 to-dusk/20" />

          <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-360 flex-col gap-5 px-5 pb-8 md:flex-row md:items-end md:justify-between md:gap-16 md:px-30 md:pb-20">
            <div className="flex flex-col gap-5 md:gap-7">
              <p data-hero className={`${eyebrow} text-clay`}>{EVENT.place}</p>
              <h1 data-hero className="font-display text-[60px] leading-[0.95] tracking-[-0.01em] md:text-[clamp(96px,10.5vw,152px)] md:leading-[0.92] md:tracking-[-0.015em]">
                Maré Caribe
                <br />
                <span className="font-normal italic">2026</span>
              </h1>
            </div>
            <div data-hero className="flex flex-col gap-5 md:w-90 md:shrink-0 md:gap-6 md:pb-3">
              <p className={`hidden ${eyebrow} text-clay md:block`}>{EVENT.dates}</p>
              <p className="max-w-[320px] text-base leading-relaxed md:max-w-none md:text-lg">
                Four days of tide, table and warm evenings, from 10 to 13 December. We would love to have you with us.
              </p>
              <Link href="/booking/choose" className={`${cta} md:self-start md:px-8`}>
                Book your experience
              </Link>
            </div>
          </div>
        </section>

        {/* Countdown */}
        <section data-reveal aria-labelledby="until" className="mx-auto flex max-w-360 flex-col gap-5 px-5 pb-2 pt-10 md:flex-row md:items-center md:gap-16 md:px-30 md:pt-18">
          <h2 id="until" className={`${eyebrow} text-terracotta md:w-50`}>
            Until we gather
          </h2>
          <Countdown />
        </section>

        {/* The place */}
        <section aria-labelledby="place" className="mx-auto grid max-w-360 grid-cols-1 gap-7 px-5 pb-20 pt-18 md:grid-cols-12 md:grid-rows-[auto_auto_auto_1fr] md:items-start md:gap-x-6 md:px-30 md:py-40">
          <p data-reveal className={`${eyebrow} text-terracotta md:col-span-4 md:col-start-1 md:mt-16`}>01 · The place</p>
          <h2 data-reveal id="place" className="font-display text-[38px] leading-[1.05] md:col-span-4 md:col-start-1 md:text-[52px]">
            A quiet stretch of coast, set aside for four days.
          </h2>
          <div className="relative h-90 overflow-hidden bg-shell max-md:ml-10 md:col-span-7 md:col-start-6 md:row-span-4 md:row-start-1 md:h-140">
            <div data-parallax className="absolute inset-x-0 inset-y-[-10%]">
              <Image src={PLACE.src} alt={PLACE.alt} fill sizes="(min-width: 768px) 58vw, 90vw" className="object-cover" />
            </div>
          </div>
          <p data-reveal className="text-base leading-[1.65] text-muted md:col-span-4 md:col-start-1 md:text-[17px]">
            Cap Cana is where the Caribbean slows down. Your days here are unhurried, and someone is always close by to look after the details.
          </p>
        </section>

        {/* More places: each reveals on scroll, photo drifts slightly. */}
        {PLACES.map((pl, i) => (
          <section
            key={pl.id}
            aria-labelledby={`place-${pl.id}`}
            className="mx-auto grid max-w-360 grid-cols-1 gap-7 px-5 pb-20 md:grid-cols-12 md:items-center md:gap-x-6 md:px-30 md:pb-40"
          >
            <div className={`relative h-80 overflow-hidden bg-shell md:col-span-7 md:h-130 ${i % 2 === 0 ? "md:col-start-1" : "md:col-start-6 md:row-start-1"}`}>
              <div data-parallax className="absolute inset-x-0 inset-y-[-10%]">
                <Image src={pl.photo.src} alt={pl.photo.alt} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
              </div>
            </div>
            <div className={`flex flex-col gap-5 md:col-span-4 ${i % 2 === 0 ? "md:col-start-9" : "md:col-start-1 md:row-start-1"}`}>
              <p data-reveal className={`${eyebrow} text-terracotta`}>{pl.number}</p>
              <h2 data-reveal id={`place-${pl.id}`} className="font-display text-[38px] leading-[1.05] md:text-[52px]">{pl.title}</h2>
              <p data-reveal className="text-base leading-[1.65] text-muted md:text-[17px]">{pl.text}</p>
            </div>
          </section>
        ))}
      </main>
      </ScrollMotion>
    </>
  );
}
