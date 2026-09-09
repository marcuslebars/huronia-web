# Handoff

State of the build as of commit `a442e64` (Phase 7). Working tree clean, in sync
with `origin/main`.

This file exists so a new session can resume without re-reading the transcript.
`PROJECT_BRIEF.md` is the spec; `CLAUDE.md` is the working rules; this is
current status, what is blocked, and what has **not** been verified.

---

## Phase status

| Phase                       | State       | Gate                                                     |
| --------------------------- | ----------- | -------------------------------------------------------- |
| 0 Foundation                | done        | typecheck / lint / build clean, CI green                 |
| 1 Design system and shell   | done        | axe 0 violations, keyboard pass on header and drawer     |
| 2 Content and marketing     | **partial** | copy-in-components and unique-metadata gates pass        |
| 3 Shopify catalogue         | done        | quote-only path, `$0.00` grep, filters survive refresh   |
| 4 Cart and checkout handoff | **partial** | add / quantity / remove pass; live checkout NOT verified |
| 5 Quote flow                | **partial** | four steps and payload pass; real email NOT verified     |
| 6 SEO and structured data   | **partial** | sitemap and 301s pass; Rich Results Test NOT run         |
| 7 Quality                   | done        | Lighthouse mobile, axe, keyboard, no h-scroll, no `any`  |
| 8 Deploy                    | not started | needs a deployed site                                    |

208 tests pass locally across desktop and mobile projects. CI runs a subset
(chromium only) and is green.

---

## Three gates that could not be run

These are **not** passes. They need things that do not exist yet.

1. **Phase 4 — "reach a live Shopify checkout URL."** No products and no
   Storefront token, so there is no live checkout. The fixture cart returns a
   `fixture.invalid` URL on purpose so a green test can never be mistaken for
   proof the handoff works.
2. **Phase 5 — "verify a real email arrives."** Needs a live `RESEND_API_KEY`
   and a verified sending domain. Everything up to the send is tested.
3. **Phase 6 — "validates against Google's Rich Results Test."** A hosted tool
   needing a public URL. Everything that would make it fail is asserted in
   `tests/seo.spec.ts`.

Lighthouse for a **service page** was also not measured — those routes do not
exist. `scripts/lighthouse.mjs` reports that rather than skipping silently.

---

## Blockers, in the order they hurt

### 1. The nav links to 16 pages that do not exist

The header, mega menu and footer link all eight `/services/[slug]` and all eight
`/areas/[town]` routes. **Those are live 404s.** This is the single thing to fix
before any public domain points here.

- Service pages need the draft copy in `content/*.html` (§12). Never supplied.
  The brief says improve those drafts, not start over, so writing from scratch
  would contradict the spec.
- Town pages need the **mobile service radius, travel charge and minimum job
  size** (§4 open item 5). Without them there is nothing real to say, and §6
  explicitly forbids padding.

### 2. Shopify: token, publication, products — three separate problems

The store is connected over the **Admin API via MCP** only.

- Store: `0ygzxg-xc.myshopify.com`, primary domain `hag.tilotto.com`, CAD.
- **No Storefront access token.** The MCP refuses to create one
  (`storefrontAccessTokenCreate`, category `access_escalation`). It must be made
  in Shopify admin: Settings → Apps and sales channels → Develop apps → create
  an app → Storefront API scopes (`unauthenticated_read_product_listings`,
  `unauthenticated_read_product_inventory`, `unauthenticated_read_checkouts`,
  `unauthenticated_write_checkouts`) → install → copy the token.
- **The 8 collections are published to no sales channel** —
  `resourcePublicationsCount: 0` on every one. Only Shopify's default
  `frontpage` collection is published. The Storefront API only returns resources
  published to the token's channel, so **even with a valid token `/shop` comes
  back empty and it will look like the integration is broken.** They need
  publishing to Online Store (`publishablePublish`). Not done — it changes what
  is publicly visible, and permission was never given.
- **Zero products.** The brief's "311 products, all $0.00" describes the old
  ShopCity catalogue; it has not been imported. Decision on record: the import
  is coming, so `/shop` and the routes stay in place.

Until a real token is set, `lib/shopify/client.ts` serves local fixtures. It
switches to the real API with no code change the moment the token is not a
placeholder, and **refuses to serve fixtures in production**.

### 3. Resend

`RESEND_API_KEY` is a placeholder and the sending domain is unverified, so
`POST /api/quote` cannot deliver. The route, both email bodies and all
validation are built and tested.

---

## Local setup

`.env.local` is gitignored and will not exist on a fresh clone. The app
**will not boot** without it — `src/lib/env.ts` validates eagerly by design.

```bash
cp .env.example .env.local
# then set at minimum:
#   SHOPIFY_STORE_DOMAIN=0ygzxg-xc.myshopify.com
#   NEXT_PUBLIC_SITE_URL=http://localhost:3000
# the rest can stay as placeholders until the real credentials exist
```

`NEXT_PUBLIC_SITE_URL` is needed at **build** time, not just runtime: canonicals,
the sitemap, Open Graph URLs and every JSON-LD `@id` bake it in.

---

## Enforcement that is easy to delete by accident

These scripts are the reason several brief rules cannot quietly regress. Each is
wired into `prebuild` or `postbuild`, and each was verified to fail when the
thing it guards is broken.

| Script                       | Guards                                                       |
| ---------------------------- | ------------------------------------------------------------ |
| `check-unconfirmed.mjs`      | No `<Unconfirmed>` marker survives a production build (§4)   |
| `check-component-copy.mjs`   | No marketing copy inside `src/components/` (§3 rule 1)       |
| `check-reviews-verbatim.mjs` | `reviews.ts` matches the brief word for word, count included |
| `check-no-zero-price.mjs`    | No `$0.00` or "Free" in the built output (§3 rule 3)         |
| `lighthouse.mjs`             | Phase 7 thresholds, mobile profile, run manually             |

`check-component-copy.mjs` is built on the TypeScript parser, not regex:
`useState<Foo | null>(null)` is indistinguishable from JSX text to a regex, and
the regex version reported six phantom violations.

---

## Decisions worth not re-litigating

- **`AutoGlassShop` is not a schema.org type.** `schema.org/AutoGlassShop` is a
  404 and `AutomotiveBusiness` has nine subtypes, none of them that. The brief
  §9 is wrong here. Uses `AutoRepair` with `hasOfferCatalog`.
- **Legacy 301s live in `src/proxy.ts`, not `next.config.ts`.** `redirects()`
  matches `source` case-insensitively, so `/Services → /services` also matched
  `/services` and redirected it to itself — an infinite loop on a live page.
- **Zero becomes `null` at the API boundary.** `$0.00` means "not priced yet",
  not "free", so `transforms.ts` maps it to `null` and there is no zero left in
  the domain model to render by accident.
- **No `AggregateRating` anywhere.** Claiming 15 reviews while showing 7 breaches
  Google's structured-data policy. Seven real reviews ship; no total is stated.
- **The homepage FAQ answers only confirmed facts.** Price, ADAS recalibration,
  insurers and mobile radius are all open items and are absent rather than
  guessed. They are the highest-value content on the page once answered.
- **The cart hydrates from `/api/cart`, not the root layout.** Reading cookies
  during render would make every page dynamic and give up static rendering.

## Known small gaps

- Cart lines do not link back to their product: the route is
  `/shop/[collection]/[product]` and a cart line does not carry its collection.
  Fix by storing the collection as a cart line attribute.
- `/kitchen-sink` ships in production builds. It is `noindex` and excluded from
  the sitemap, but Phase 7 intended to drop the route entirely.
- Rate limiting on `/api/quote` is in-memory and per-instance. Documented as not
  a security control; move to a durable store before real traffic.

---

## Next

Phase 8 is deploy, and its gate is a production smoke test, so it needs the site
actually deployed. Before pointing a public domain at it, fix blocker 1 — the 16
missing pages the navigation already links to.
