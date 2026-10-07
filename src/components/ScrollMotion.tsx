"use client";
import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Subtle scroll motion for the landing page. Wrap the page content once and mark elements:
 *   data-hero      staggered entrance on load
 *   data-reveal    fade and rise as it enters the viewport
 *   data-parallax  a photo that drifts slightly inside its overflow-hidden frame
 * Content stays visible without JS, and nothing moves under prefers-reduced-motion.
 */
export function ScrollMotion({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-hero]", { opacity: 0, y: 24, duration: 0.9, ease: "power2.out", stagger: 0.12, delay: 0.1 });

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 32,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -7 },
            { yPercent: 7, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      });
    },
    { scope: root },
  );

  return <div ref={root} className={className}>{children}</div>;
}
