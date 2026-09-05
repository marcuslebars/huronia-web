# huronia-web

Headless site for Huronia Auto Glass. Shopify is checkout only.

The full specification is [PROJECT_BRIEF.md](./PROJECT_BRIEF.md). Working rules for
contributors and coding agents are in [CLAUDE.md](./CLAUDE.md).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

`src/lib/env.ts` validates the environment eagerly, so the app refuses to start on a
missing or malformed variable rather than failing later at request time.

## Scripts

| Script              | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Development server                                 |
| `npm run build`     | Production build                                   |
| `npm run start`     | Serve the production build                         |
| `npm run typecheck` | `tsc --noEmit`, strict, `noUncheckedIndexedAccess` |
| `npm run lint`      | ESLint — `any` is an error, not a warning          |
| `npm run format`    | Prettier write                                     |
| `npm run test`      | Playwright                                         |

Playwright runs against the **production** build, not `next dev`. Build first:

```bash
npm run build && npm run test
```

## Quality gates (Phase 7)

Most gates run with `npm run test`: axe on every route, a keyboard-only pass
asserting every interactive element paints a focus ring, and no horizontal
scroll at 320, 375, 768, 1024 and 1440.

Lighthouse is separate because it needs a running production server:

```bash
npm run build && npm run start   # one shell
npm run lighthouse               # another
```

It runs the **mobile** profile (the script prints the emulation it used, so this
is verifiable rather than assumed) and fails below the brief's thresholds:
performance 95, accessibility 100, SEO 100.

It is deliberately **not** in CI. Shared GitHub runners give noisy performance
numbers, and a gate that fails randomly gets ignored. Run it before a deploy,
and again against the deployed URL — that is the number that matters:

```bash
LIGHTHOUSE_URL=https://your-domain npm run lighthouse
```

## Deployment

The app is host-neutral: `npm run build` then `npm start`, and Next binds to `PORT`.

### Environment

`src/lib/env.ts` validates eagerly, so a missing or malformed variable stops the
app booting rather than failing later at request time.

`NEXT_PUBLIC_SITE_URL` is needed **at build time**, not just at runtime — Next
inlines it into the bundle, and canonicals, the sitemap, Open Graph URLs and all
JSON-LD are derived from it. Building with the wrong value bakes the wrong
absolute URLs into every page, so set it to the real origin (no trailing slash)
before the first production build.

| Variable                          | Needed for                                        |
| --------------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | canonicals, sitemap, JSON-LD, OG — **build time** |
| `RESEND_API_KEY`                  | the quote form's two emails                       |
| `SHOPIFY_STORE_DOMAIN`            | Phase 3 onward                                    |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Phase 3 onward                                    |
| `SHOPIFY_WEBHOOK_SECRET`          | `POST /api/revalidate`, Phase 3 onward            |

The Shopify variables are validated even though nothing reads them yet, so the
app will not start until they are set. Placeholders are fine until Phase 3.

### The unconfirmed-facts gate

`prebuild` fails a production build if any `<Unconfirmed>` marker is left in
`src/` (§4). It runs strict when `CHECK_UNCONFIRMED=strict`, or when the host
reports production via `RAILWAY_ENVIRONMENT_NAME`, `VERCEL_ENV` or `SITE_ENV`.
This is intentional: it is what stops placeholder text reaching a customer.

### Not yet launch-ready

The site should not be pointed at a public domain as it stands:

- `/shop`, `/shop/[collection]`, `/shop/[collection]/[product]` and `/cart` do
  not exist (Phases 3-4, blocked on Shopify credentials).
- The eight `/services/[slug]` and eight `/areas/[town]` pages do not exist
  (blocked on the draft copy and the mobile service radius).
- The header, mega menu and footer link to all of the above, so those links 404.
- The `/Products` legacy redirect points at `/shop`, which is currently a 404.

The sitemap and `robots.txt` only list routes that exist, so nothing broken is
submitted to Google — but a visitor following the navigation will hit 404s.

## Status

Phase 0 (foundation) only. Phases are defined in PROJECT_BRIEF.md §10; each one has
acceptance gates that must pass before the next begins.
