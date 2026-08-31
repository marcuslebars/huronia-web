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

## Status

Phase 0 (foundation) only. Phases are defined in PROJECT_BRIEF.md §10; each one has
acceptance gates that must pass before the next begins.
