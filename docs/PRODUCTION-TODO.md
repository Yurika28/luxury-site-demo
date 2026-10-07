# Production to-do (deferred from design)

Design direction lives on the Design canvas: https://claude.ai/artifact/F8oLAQRh2f2krzQjETG2Cq
These items were deliberately left as rules, to be built and tuned in code.

## Gap 5

### Hover, focus and pressed states
- Focus on inputs: 2px terracotta border plus a 2px `#EBCDB8` outline.
- Focus on buttons, links and calendar days: 3px espresso outline, 2px offset (already global in `globals.css`).
- Hover on the terracotta CTA: darken one step, text stays white (check AA).
- Pressed: 1px translate, transform only.
- Motion uses transform and opacity only; `prefers-reduced-motion` is already honoured globally.

### EN / ES
- Message files per locale; no hard-coded strings in components.
- Spanish copy runs about 20-30% longer. Check 375px wrapping on buttons, the step label and price rows.
- Keep USD per person in both locales; format numbers with the locale.

### Payment
- Demo takes no payment. Review states this, and Confirm creates the mock booking only.

## Other
- Landing page (mobile first) and sticky header from the canvas.
- Remaining booking routes: customise, build-your-own, guest, review, confirmation, 404, offline.
- Session-restored banner, guest-count price update, sold-out and unavailable handling (see the edge-case boards).
- GSAP motion pass; Lighthouse 90+; QA at 375 / 768 / 1440; deploy on Vercel.
