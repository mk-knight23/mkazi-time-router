# MK Router — mkazi.live

[![Live](https://img.shields.io/badge/live-mkazi.live-10b981?style=flat-square)](https://mkazi.live)
[![Backup](https://img.shields.io/badge/backup-router.mkazi.live-6366f1?style=flat-square)](https://router.mkazi.live)

> **Live:** **[mkazi.live](https://mkazi.live)** (Cloudflare) · backup **[router.mkazi.live](https://router.mkazi.live)** (Vercel)

A **portfolio reverse proxy**. The root domain serves **DevTools consistently** for both visitors and search crawlers. Visitors can explore the five portfolios on their own subdomains or use the manual `?portfolio=N` switcher. The public domain stays in the address bar (reverse proxy, not redirect).

## The MK Portfolio Network

| Discipline | Live Site | Repository |
|---|---|---|
| Frontend Engineer | **[frontend.mkazi.live](https://frontend.mkazi.live)** | [`MK-PixelFolio`](https://github.com/mk-knight23/MK-PixelFolio) |
| Backend Systems Architect | **[backend.mkazi.live](https://backend.mkazi.live)** | [`MK-CoreFolio`](https://github.com/mk-knight23/MK-CoreFolio) |
| Full-Stack Developer | **[fullstack.mkazi.live](https://fullstack.mkazi.live)** | [`MK-StackFolio`](https://github.com/mk-knight23/MK-StackFolio) |
| AI Engineer & Dev Tools | **[devtools.mkazi.live](https://devtools.mkazi.live)** | [`MK-DevDeck`](https://github.com/mk-knight23/MK-DevDeck) |
| AI Frontend Engineer | **[ai.mkazi.live](https://ai.mkazi.live)** | [`MK-NeuroFolio`](https://github.com/mk-knight23/MK-NeuroFolio) |
| Primary DevTools homepage and manual portfolio switcher | **[mkazi.live](https://mkazi.live)** | [`mkazi-time-router`](https://github.com/mk-knight23/mkazi-time-router) ← *this repo* |

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

## Stable homepage and portfolio switching

- **Stable default:** `mkazi.live` serves DevTools (slot 01) to visitors and search engines alike. No user-agent-based content selection.
- **Manual override:** `?portfolio=N` (1–5) selects a different portfolio. Override responses send `X-Robots-Tag: noindex, follow` to discourage duplicate query URL indexing.
- **Dedicated subdomains:** The five portfolios remain reachable independently at their named subdomains.
- **Discovery endpoints:** `/robots.txt` advertises `https://mkazi.live/sitemap.xml`; the conservative root sitemap currently lists only the homepage.
- **Canonical homepage:** The router rewrites the DevTools homepage canonical and Open Graph URL to `https://mkazi.live/` for the root-domain homepage response.
- **Resilience:** If an origin is unavailable, the router may fall back to another origin; verify this behavior before deployment.
- **Switcher UI:** A floating portfolio switcher is injected into HTML where supported.

## Endpoints

- `/__router-health` — JSON health check: diagnostic scheduled slot, IST minute-of-day, and a live HEAD-check of all five origins.
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


## Stable professional profile and discovery

`/about` serves the same public biography for all visitors on both router runtimes. `/robots.txt`, `/sitemap.xml`, `/llms.txt` and `/llms-full.txt` are served locally, independently of the hourly portfolio rotation. Portrait and portfolio links use the branded subdomains. The optional text summaries do not guarantee inclusion in AI answers.
