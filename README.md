# MK Router

A **time-based portfolio router**. It serves **one of five portfolio sites at the root domain, rotating every hour (IST)** — so a visitor to the main domain sees a different portfolio each hour, cycling through all five. The public domain stays in the address bar (it's a reverse proxy, not a redirect).

Runs two ways from one codebase:

- **Vercel Edge Middleware** — [`middleware.ts`](middleware.ts) (primary / current deploy target)
- **Cloudflare Worker** — [`src/index.ts`](src/index.ts) (original; deploy with `wrangler deploy`)

## The five portfolios

| Slot | Name | Origin |
|------|------|--------|
| 01 | DevTools | `mk-devdeck.vercel.app` |
| 02 | Fullstack | `mk-stackfolio.vercel.app` |
| 03 | Frontend | `mk-pixelfolio.vercel.app` |
| 04 | Backend | `mk-corefolio.vercel.app` |
| 05 | Frontend AI | `mk-neurofolio.vercel.app` |

## How rotation works

- **Hourly, IST.** The active portfolio = `IST_hour % 5`. Same pattern every day (hours 0,5,10,15,20 → slot 01; 1,6,11,16,21 → slot 02; …).
- **Sticky within the hour.** A `mkazi_active_site` cookie (lifetime = time left in the current hour) keeps sub-requests (assets, API) pinned to the same origin the HTML page came from — no mid-page origin flips.
- **Manual override.** `?portfolio=N` (1–5) or `?portfolio=03` pins a specific portfolio for an hour.
- **SEO-safe.** Search-engine bots always get the **canonical** portfolio (slot 01) so crawlers see a stable site.
- **Resilient.** If the scheduled origin is down (5xx / unreachable), it falls back through the other origins automatically.
- **Switcher UI.** A small floating portfolio switcher (01–05) is injected into every HTML page.

## Endpoints

- `/__router-health` — JSON health check: which slot is scheduled now, IST minute-of-day, and a live HEAD-check of all five origins.
- `/*` — everything else is proxied to the active portfolio, preserving path + query.

## Response headers (for debugging)

| Header | Meaning |
|--------|---------|
| `x-mkazi-active-site` | which portfolio (01–05) served this response |
| `x-mkazi-active-name` | its name |
| `x-mkazi-router` | router build id |
| `x-mkazi-bot-mode` | `canonical` when a search bot was detected |
| `x-mkazi-override` | `query-param` when `?portfolio=` forced the choice |

## Configuration

Edit the `WEBSITES` array (origins) and `SLOT_MINUTES` (rotation interval, currently `60`) in `middleware.ts` (Vercel) and/or `src/index.ts` (Cloudflare). To rotate every 30 minutes, set `SLOT_MINUTES = 30`; for every 2 hours, `120`.

## Deploy

**Vercel** (current): push to `main` → Vercel builds and runs the edge middleware. No build step; `public/` holds only a warm-up fallback page (the middleware handles all routes).

**Cloudflare** (optional): `npm install && npx wrangler deploy` (requires a Cloudflare account + `wrangler login`).

## Develop / test

```bash
npm install
npm test        # Cloudflare Worker unit tests (vitest + @cloudflare/vitest-pool-workers)
```
