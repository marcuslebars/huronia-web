# Huronia Auto Glass — Claude Code build brief

Headless site. Shopify is checkout only. This document is the input to Claude Code.

---

## How to use this

1. Create an empty repo, `huronia-web`.
2. Save this file into it as `PROJECT_BRIEF.md`.
3. Open Claude Code in the repo and send the kickoff prompt below.

Claude Code works best against a written spec it can re-read, not a long chat message it
has to remember. Everything below is the spec. The kickoff prompt is deliberately short.

### Kickoff prompt

> Read `PROJECT_BRIEF.md` in full before writing any code.
>
> Then: write `CLAUDE.md` from the section in the brief, confirm the stack decisions back to
> me in five lines or fewer, and list anything in the brief you think is wrong or
> underspecified. Do not start Phase 0 until I reply.
>
> Work phase by phase. Do not begin a phase until the previous phase's acceptance gates
> pass. Do not mark a phase complete on your own say-so — run the gates and show me the
> output.

That last paragraph matters. Left unconstrained on a build this size, the failure mode is
racing ahead and declaring things done. The gates are the fix.

---

# 1. Context

Huronia Auto Glass is a family-run auto glass and truck accessory shop at 821 Vinden
Street, Midland, Ontario. Founded 1983 by Norm Rumney; run today by his son Adam.

Their current site is a tenant page on a directory platform called ShopCity, running as
`shopmidland.com`. The business owns none of it. It has 311 products, every one priced
$0.00, a services page containing three items, and fifteen five-star reviews going back to
2008 that are buried on a tab.

We are replacing it with a headless site. Shopify holds products, inventory and checkout.
Everything a customer sees, we build.

**The commercial goal is local search.** Someone typing "windshield replacement Midland"
must land on a page that ranks and converts. Every architectural decision defers to that.

---

# 2. Stack

Non-negotiable, and the reasons matter more than the choices:

| Choice | Why |
|---|---|
| **Next.js (App Router)** | Server rendering. A client-rendered SPA is disqualifying for a business whose value case is local search. |
| **TypeScript, strict** | `any` is banned. `strict: true`, `noUncheckedIndexedAccess: true`. |
| **Tailwind** | With design tokens as CSS custom properties, not scattered hex values. |
| **Shopify Storefront API** | Products, collections, cart. Available on every Shopify plan. |
| **Shopify hosted checkout** | We redirect to `cart.checkoutUrl`. We never touch payment. |
| **Resend** | Transactional email for the quote form. |
| **Zod** | Validation at every boundary — form input, API responses, env vars. |
| **Playwright** | Smoke tests on the critical paths. |
| **Vercel** | Deployment. |

Do not add a CMS, a state library, or a component library. The content is small enough to
live in typed modules, and React Server Components plus URL state cover the rest.

---

# 3. Architecture

```
src/
  app/
    (marketing)/                 layout with header + footer
      page.tsx                   home
      services/page.tsx
      services/[slug]/page.tsx
      areas/page.tsx
      areas/[town]/page.tsx
      about/page.tsx
      reviews/page.tsx
      contact/page.tsx
      quote/page.tsx
    (shop)/
      shop/page.tsx
      shop/[collection]/page.tsx
      shop/[collection]/[product]/page.tsx
      cart/page.tsx
    api/
      quote/route.ts
      revalidate/route.ts        Shopify webhook target
    sitemap.ts
    robots.ts
    not-found.tsx
    error.tsx
  components/
    ui/                          primitives: Button, Field, Accordion, Drawer, Dialog
    layout/                      Header, Footer, MobileNav, MegaMenu
    marketing/                   Hero, TrustStrip, ServiceGrid, Reviews, Faq, Areas, Stats
    shop/                        ProductCard, ProductGallery, VariantPicker, Filters, CartDrawer
  content/                       ALL copy. Typed modules. No marketing text in components.
    business.ts services.ts collections.ts reviews.ts faqs.ts areas.ts brands.ts
  lib/
    shopify/
      client.ts                  fetch wrapper, typed, error handling
      queries.ts                 GraphQL documents
      transforms.ts              Shopify shapes -> our domain types
      index.ts                   the only module the app imports
    schema.ts                    JSON-LD builders
    env.ts                       zod-validated environment
  types/
```

### Rules

1. **No marketing copy inside a component.** It lives in `src/content/`. This is what makes
   the copy reviewable by a non-developer and translatable later.
2. **Nothing outside `lib/shopify/` imports Shopify types.** Transform at the boundary into
   our own domain types. If we ever leave Shopify, one directory changes.
3. **`price` is `number | null`.** `null` means quote-only. Most of the real catalogue has
   no price — this is the normal case, not an edge case. Any component that renders a price
   must handle `null` explicitly. **Never render "$0.00" or "Free".**
4. **Server Components by default.** `'use client'` only where interaction genuinely
   requires it: cart drawer, filters, variant picker, quote form, mobile nav.
5. **URL is the state store** for anything shareable — filters, sort, pagination, quote step.

---

# 4. The business — facts, verbatim

Put these in `src/content/business.ts`. **Do not invent anything not listed here.**

```
Name       Huronia Auto Glass
Address    821 Vinden Street, Midland, Ontario, Canada L4R 1A1
Geo        44.752189, -79.904466
Phone      705-526-7631
Fax        705-526-6559
Email      info@huroniaautoglass.com
Hours      Monday–Friday 8:00am–5:00pm. Saturday and Sunday closed.
Founded    1983, by Norm Rumney. Run today by his son Adam Rumney.
Reviews    15 on record, all five stars, 2008–2026.
Payment    Visa, MasterCard, Debit.
Social     facebook.com/huroniaautoglass and instagram.com/huroniaautoglass — these two ONLY.
```

The old site's footer linked to bare `twitter.com`, `youtube.com`, `linkedin.com`,
`pinterest.com`, `tripadvisor.com` and `houzz.com` homepages. Those are not their accounts.
Do not recreate them.

### The unconfirmed-facts rule

Eleven things are genuinely unknown. **Never guess them.** Define:

```ts
// src/components/ui/Unconfirmed.tsx
// Renders an obvious amber block in development.
// In production it renders nothing AND fails the build if any remain.
<Unconfirmed>Chip repair price</Unconfirmed>
```

Add a build-time check: if `NODE_ENV === 'production'` and any `<Unconfirmed>` is reachable,
**fail the build**. This is the mechanism that stops placeholder text reaching a customer.

The eleven open items:

1. Chip repair price, and price per additional chip
2. Windshield replacement pricing, OEM vs aftermarket
3. **Is ADAS recalibration done in-house, sublet, or referred out?** — the highest-value
   question on the site
4. Which insurers the shop direct-bills
5. Mobile service radius, travel charge, minimum job size
6. Marine glass turnaround time
7. Whether fleet accounts and consolidated billing are offered
8. Tint film brands, shades, warranty
9. Tint pricing by vehicle type
10. Remote starter installed pricing and warranty
11. Staff names and roles for the About page

---

# 5. Design

Not a glossy DTC brand. A well-run shop: high contrast, generous space, plain language.
No gradient meshes, no glassmorphism, no pill-shaped everything.

```css
--ink:         #14181A;  /* near-black: body text, dark bands */
--paper:       #FFFFFF;
--muted:       #5D6B6E;  /* secondary text */
--line:        #E2E8E9;  /* borders */
--panel:       #F1F5F6;  /* light section background */
--accent:      #0F7B8A;  /* glass teal: primary buttons, links */
--accent-dark: #0B5F6B;  /* hover */
--signal:      #F2A007;  /* star ratings and alerts ONLY — never a CTA */
```

Four section surfaces used consistently — paper, panel, ink, accent — with buttons, borders
and focus rings adapting to each. Sturdy sans for headings, readable sans for body, tight
heading tracking, `text-wrap: balance`, ~65 character measure.

Motion is restrained: scroll-reveal with a small stagger, card lift on hover, image scale on
hover, animated nav underline. **All of it behind `prefers-reduced-motion`.**

---

# 6. Routes and content

```
/                              Home
/services                      Index
/services/[slug]               8 pages (below)
/shop                          Collections index
/shop/[collection]             Filtered grid
/shop/[collection]/[product]   Product detail
/cart
/quote                         Multi-step quote request
/areas                         Index
/areas/[town]                  8 town pages
/about  /reviews  /contact
```

### Services

| Slug | Title |
|---|---|
| `windshield-repair` | Windshield Chip & Crack Repair |
| `windshield-replacement` | Windshield Replacement |
| `insurance-claims` | Insurance Glass Claims |
| `mobile-service` | Mobile Auto Glass Service |
| `marine-glass` | Boat, RV & Motorhome Glass |
| `heavy-equipment-glass` | Heavy Equipment & Fleet Glass |
| `window-tint` | Window, Headlight & Emblem Tint |
| `remote-starters` | Remote Car Starters |

400–600 words each. Voice: plain, specific, second-person, confident without hype. No
exclamation marks. Explain the actual mechanics — the reader should finish understanding
what happens to their vehicle. Draft copy for all eight already exists in the project
folder as `content/*.html`; use it as the source and improve it, don't start over.

### Collections

`wheels-tires` · `truck-caps-tonneau` · `suspension-lift-kits` · `steps-bars-protection` ·
`towing-hitches` · `snow-plows-spreaders` · `batteries` · `interior-cargo`

The 31→8 mapping from the old catalogue is in `collections.md` in the project folder.

### Towns

Midland · Penetanguishene · Tiny · Victoria Harbour · Port McNicoll · Waubaushene ·
Wyebridge · Coldwater

**Each town page needs 250+ words of genuinely distinct copy** — distance from the shop,
what mobile service means there, local specifics. Eight near-identical pages with the name
swapped is a recognised search penalty and worse than not having them. If you cannot write
something real about a town, say so rather than padding.

### Reviews — real, use verbatim

- **Rob Karnis, Orangeville, July 2026** — "U Haul wasted 2 weeks of my time and didn't accomplish anything. The Toyota dealership wanted twice the price and over a week's notice. These guys did it right, affordable and in one afternoon. These are now MY 'Go-To' Guys. It's Worth the Drive to Midland!"
- **Terry Doyle, Brooklin, June 2025** — "Adam and his team did a great job on a boat side window that was shattered after a tree fell on it. We initially had the boat at a marina for over a year with little attention. They turned the window around in less than a week and I am exceptionally happy with the results."
- **Kenan & Mandy, Port McNicoll, July 2025** — "Amazing service! We were able to drop our vehicle off overnight, pay over the phone and pick up after hours. The vehicle tint looks like it came from the factory."
- **Marilyn, Penetanguishene, December 2025** — "Service was fast and friendly. They were true to the estimate and never tried to oversell me on anything."
- **Carol Jeannotte, Waubaushene** — "Recently had my remote starter installed in my CRV. Fast, friendly and very neat and tidy installation."
- **Cathy, Penetanguishene, June 2026** — "Amazing service! We are always treated with respect and our concerns are dealt with professionally. Adam always makes time to assist, and often fix, our issues."
- **Kurt, Parry Sound, July 2026** — "Had my windshield replaced, they did a great job under the time that they told me and best of all was the price."

**Do not generate additional reviews.** Fabricated testimonials are a trust problem and a
legal one. Seven real ones is enough; the remaining eight can be added from the client's
records later.

---

# 7. Shopify integration

Storefront API, latest stable version. Env vars validated through `lib/env.ts` with zod —
the app must refuse to boot with a missing token rather than failing at request time.

```
SHOPIFY_STORE_DOMAIN=xxx.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=
SHOPIFY_WEBHOOK_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=
```

**Rendering strategy:**

- Collections and products — `generateStaticParams` plus ISR, `revalidate: 3600`.
- Service, area, about, contact pages — fully static.
- Cart — client-side, cart ID in a cookie.
- `POST /api/revalidate` — Shopify webhook target, HMAC-verified, calls `revalidateTag`
  so a price change in Shopify does not wait an hour.

**Cart:** the Cart API, not the deprecated Checkout API. Create on first add, persist the
cart ID in an `httpOnly` cookie, and hand off to `cart.checkoutUrl` for checkout.

**Quote-only products.** When `price === null`:
- No add-to-cart button. A **Request a quote** button linking to
  `/quote?product={handle}`, plus a click-to-call.
- The product still renders fully, and is still indexed — omit the `Offer` from its JSON-LD
  rather than emitting a zero price.

**Images:** `next/image` with `cdn.shopify.com` in `remotePatterns`. Explicit dimensions
everywhere. `priority` on the hero only.

---

# 8. The quote form

The single most valuable thing on the site. Four steps, URL-driven (`?step=2`) so Back
works and a step is linkable.

1. **What do you need** — windshield chip or crack repair · windshield replacement · side or
   rear window · boat, RV or motorhome glass · heavy equipment or farm glass · window or
   headlight tint · remote starter · wheels, tires or accessories · snow plow · something else
2. **Your vehicle** — year, make, model, trim. If the job is glass, also: damage extent
   (small stone chip · crack under 6 inches · crack over 6 inches · shattered or missing) and
   **"Does the vehicle have lane-keep assist, adaptive cruise control or automatic emergency
   braking?"** (yes / no / not sure), with help text explaining this determines whether a
   camera recalibration is needed.
3. **Where and when** — in-shop / mobile / either; urgency; town. Then an optional insurance
   block: a checkbox reveals insurer and claim number. **Conditional fields must not submit
   values when hidden.**
4. **Your details** — name, phone, email, notes, then a review-and-submit summary.

`POST /api/quote`: zod validation, honeypot field, IP rate limit, Resend email to the shop
with every field labelled, and a confirmation email to the customer. Return typed errors the
form renders inline, with focus moved to the error summary.

Support `?product=handle` to prefill step 1 from a product page.

---

# 9. SEO

- Per-route `generateMetadata` — unique title and description written for humans.
- Open Graph and Twitter cards. Canonicals. `app/sitemap.ts` and `app/robots.ts`.
- JSON-LD from `lib/schema.ts`, never inline:
  - **`AutoGlassShop`** sitewide — address, geo, `openingHours: "Mo-Fr 08:00-17:00"`,
    telephone, `areaServed` for the eight towns, `sameAs` for the two real socials.
  - **`Service`** on each service page.
  - **`Product` + `Offer`** on priced products only.
  - **`FAQPage`** on the homepage FAQ.
  - **`BreadcrumbList`** on nested routes.
- **301 redirects** in `next.config.js` from the six legacy URLs — `/Home`, `/Products`,
  `/Services`, `/LatestNews`, `/Testimonials`, `/Contact` — to their new equivalents.
  `/LatestNews` goes to `/` (the blog is retired).

---

# 10. Phases and acceptance gates

Do not start a phase until the previous one's gates pass. Run the gates and show the output.

### Phase 0 — Foundation
Scaffold, TypeScript strict, Tailwind with tokens, `lib/env.ts`, `CLAUDE.md`, ESLint,
Prettier, Playwright, CI running typecheck + lint + test on every push.
**Gate:** `npm run typecheck && npm run lint && npm run build` clean. CI green.

### Phase 1 — Design system and shell
UI primitives, header with mega menu, mobile drawer, footer. Storybook not required, but a
`/kitchen-sink` route rendering every primitive in every state.
**Gate:** keyboard-only pass of header and drawer — focus visible, trap works, Escape
closes, focus returns to trigger. Zero axe violations on `/kitchen-sink`.

### Phase 2 — Content layer and marketing pages
`src/content/`, home, services index and eight detail pages, about, reviews, contact,
areas index and eight town pages.
**Gate:** no marketing string appears in any `components/` file — prove it with a grep.
Every page has unique title and meta. Town pages are 250+ words and materially different.

### Phase 3 — Shopify catalogue
Storefront client, transforms, collections, filtered grids, product pages. Filters in the
URL. Quote-only path working.
**Gate:** a product with `price: null` renders "Request a quote" and no buy button.
Grep the built output for `$0.00` — must return nothing. Filters survive a refresh.

### Phase 4 — Cart and checkout handoff
Cart API, drawer, cart page, checkout redirect.
**Gate:** Playwright test — add to cart, change quantity, remove, reach a live Shopify
checkout URL.

### Phase 5 — Quote flow
Four steps, `/api/quote`, both emails.
**Gate:** Playwright test through all four steps including the insurance branch. Verify
hidden conditional fields are absent from the payload. Verify a real email arrives.

### Phase 6 — SEO and structured data
Metadata, JSON-LD, sitemap, robots, redirects.
**Gate:** every JSON-LD block validates against Google's Rich Results Test. Sitemap
contains every route. All six legacy URLs 301 correctly.

### Phase 7 — Quality
**Gate, all of it:**
- Lighthouse ≥ 95 performance, ≥ 100 accessibility, ≥ 100 SEO on home, a service page, a
  collection and a product page — mobile profile.
- Zero axe violations sitewide.
- Keyboard-only pass of every interactive element.
- No horizontal scroll at 320, 375, 768, 1024, 1440.
- `npm run build` with zero TypeScript errors and zero `any`.
- **Zero `<Unconfirmed>` reachable in a production build** — or the build fails.

### Phase 8 — Deploy
Vercel, custom domain, env vars, Shopify webhook wired to `/api/revalidate`, analytics.
**Gate:** production smoke test — quote submitted, cart reaches checkout, all pages 200.

---

# 11. CLAUDE.md

Write this into the repo root in Phase 0.

```md
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
```

---

# 12. Assets in the project folder

- `content/*.html` — draft copy for all eight service pages plus About, with the
  `CONFIRM WITH CLIENT` markers still in place. These map to the eleven open items.
- `collections.md` — the 31→8 collection mapping and migration notes.
- `Huronia_Auto_Glass_Rebuild_Brief.pdf` — the client-facing brief. Useful context for
  voice and for what was promised.

---

# 13. Known unknowns — do not paper over these

1. **Pricing does not exist.** All 311 products are $0.00 in Shopify. Until the client's
   pricing file arrives, the entire catalogue is quote-only. Build for that as the default
   state, not a fallback.
2. **Wheel variants are prose.** Roughly 160 wheel products carry sizes as a run-on string
   in the description ("17x8.5, 18x9, 20x9…"). They are not variants yet. Parsing them into
   real variants is a Shopify-side data job, not a frontend one.
3. **There is no photography.** Not one photo of the shop, the team, or finished work.
   Every image slot needs a designed placeholder that does not look broken, and the hero
   needs to work without a photograph at all.
4. **The logo is a low-resolution 2000s PNG.** Build the header to tolerate it and to accept
   an SVG later without layout change.
5. **The catalogue is stale.** Products date from 2016–2018. Assume a meaningful share are
   discontinued. Do not build anything that assumes all 311 will survive.
