# Huronia Auto Glass — working notes

Headless Next.js site. Shopify is checkout only. Read PROJECT_BRIEF.md for the full spec.

## Commands

npm run dev · npm run build · npm run typecheck · npm run lint · npm run test

## Hard rules

- No marketing copy in components. It lives in src/content/ as typed modules.
- Nothing outside lib/shopify/ imports Shopify types. Transform at the boundary.
- `price: number | null`. null means quote-only. NEVER render "$0.00" or "Free".
- Server Components by default. 'use client' only for genuine interaction.
- URL holds shareable state: filters, sort, pagination, quote step.
- No `any`. TypeScript strict. Zod at every boundary.
- prefers-reduced-motion respected by every animation.
- Never invent a business fact. Use <Unconfirmed>. Production builds fail if any remain.

## Do not

- Add a CMS, a state library, or a component library.
- Touch payment. Checkout is Shopify's hosted flow via cart.checkoutUrl.
- Generate customer reviews. Only real ones ship.
- Add social links beyond the Facebook and Instagram accounts in content/business.ts.

## Definition of done

A phase is done when its gates in PROJECT_BRIEF.md pass and the output has been shown.
Not when the code looks finished.
