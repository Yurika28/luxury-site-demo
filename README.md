# Maré Caribe 2026

A two-part luxury event booking demo for a fictional four-day gathering in Cap Cana, Dominican Republic (10–13 December 2026). It is a frontend showcase: a landing page that sells the event, and a five-step booking flow that works end to end against a mock API.

The design is calm and editorial: a sand, espresso and terracotta palette, Cormorant Garamond for display type and Inter for text, one terracotta call to action, and generous space. It is designed mobile-first.

> All names, prices and the booking API are fictional. Nothing is charged or stored on a server.

## What it does

**Landing page (`/`)**
- Sticky header, transparent over the hero and solid once scrolled
- Hero still photo with a live countdown to the event
- "The place", "Spa & wellness" and "Dining terrace" sections
- Subtle GSAP scroll animation (fade-ins, photo parallax), disabled under `prefers-reduced-motion`

**Booking flow (`/booking/…`)**

| Step | Route | What happens |
| --- | --- | --- |
| 1. Choose | `/booking/choose` | Set guest count, pick a package (Marea, Costa or Soberano), or choose to build your own |
| 2. Make it yours | `/booking/customise` | Add experiences to a package |
| 2. Build (alternative) | `/booking/build/room`, `/booking/build/experiences` | Pick a room and nights, then experiences |
| 3. Guest details | `/booking/guest` | Validated form (name, email, phone, nationality, flight, arrival) |
| 4. Review | `/booking/review` | Summary, price breakdown, terms, confirm |
| 5. Confirmation | `/booking/confirmation` | Booking reference |

Also covered: loading skeletons, API error panels with retry, sold-out and low-stock states, a "Welcome back" banner when a saved booking is restored, a live price summary (sticky bar on phones, side panel on desktop) and a 404 page.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16.4 (App Router, `src/` layout, Cache Components, Turbopack) |
| UI | React 19.3, TypeScript 5 |
| Styling | Tailwind CSS 4 with `@theme` design tokens, `next/font` |
| State | Zustand 5 with `persist` middleware (booking survives a refresh) |
| Forms and validation | React Hook Form 7 with Zod 4 via `@hookform/resolvers` |
| Animation | GSAP 3 with ScrollTrigger and `@gsap/react` (`useGSAP`) |
| Images | `next/image` with Unsplash photos |
| Unit tests | Vitest 5, Testing Library (React, DOM, user-event, jest-dom), jsdom |
| End-to-end tests | Playwright (Chromium at 375, 768 and 1440 px) |
| Linting | ESLint 9 with `eslint-config-next` |

## Frontend skills shown

- **Responsive, mobile-first layout.** One design that adapts from 375 px phones to 1440 px desktops, with no horizontal overflow and 44 px minimum touch targets, both enforced by tests.
- **Design system in code.** Colour, type and spacing as Tailwind `@theme` tokens, with AA-contrast text over photos.
- **Accessibility.** Skip link, labelled landmarks, visible focus, `aria-pressed` toggles, `aria-busy` loading regions, error summaries that take focus, and reduced-motion support.
- **Complex state.** A persisted multi-step store with hydration handled by hand (`skipHydration`), a restored-booking flow, derived pricing and clamped inputs.
- **Forms.** Schema-driven validation with Zod, field-level and summary errors, and native date and time inputs.
- **Resilient UX.** Skeletons, retry, "continue without add-ons", and saved add-ons that sold out being removed with a notice. A mock API can be made to fail or sell out on demand.
- **Motion.** Scroll-triggered reveals and parallax with GSAP, cleaned up properly in React 19.
- **Performance.** `next/image` with `priority` on the hero, `sizes` on every image, no layout shift, and server components for static content.
- **Testing.** Unit tests for every component and page, plus Playwright responsiveness and full-flow tests.

## Getting started

Requires Node 22.12 or newer (Vitest 5; Next.js itself needs 20.9+).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:e2e` | Playwright tests (builds the app and serves it on port 3200) |

On Windows, Vitest 5 needs `--configLoader runner`, which the `test` scripts already pass.

## Trying the error and edge states

The mock API reads URL flags (also stored in `localStorage` as `mare:mock-<name>`):

| Flag | Effect |
| --- | --- |
| `?fail=packages`, `?fail=addons`, `?fail=submit`, `?fail=all` | Make that request fail |
| `?soldout=soberano,yacht` | Mark those packages or add-ons as sold out |
| `?low=marea` | Show "Only 2 places left" on that package |

## Project structure

```
src/
  app/                 Routes: landing page, /booking/*, 404
  components/          SiteHeader, Countdown, ScrollMotion
    booking/           StepFrame, AddonsStep, BookingHydrator, shared UI
  lib/                 catalog (data), pricing, schema (Zod), mockApi, assets (photos)
  store/booking.ts     Persisted Zustand store
tests/
  unit/                Vitest + Testing Library
  e2e/                 Playwright responsive and flow tests
docs/PRODUCTION-TODO.md  What is deferred before this could ship
```

## Photos

Images are hotlinked from Unsplash and listed in `src/lib/assets.ts`. Change a photo by swapping its ID there. No hero video is used. Before production, host the images yourself and review the Unsplash licence and photographer credits.

## Not done yet

See [docs/PRODUCTION-TODO.md](docs/PRODUCTION-TODO.md): hover, focus and pressed-state rules, English/Spanish, real payment, a Lighthouse 90+ pass, motion on the booking pages, and deployment.
