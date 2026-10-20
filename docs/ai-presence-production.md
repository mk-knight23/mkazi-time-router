# Production verification — 2026-10-20

The ChatGPT-hosted Agent Portfolio published successfully with MCP support. It remains owner-private; no public app directory submission was made. Its generated plugin was reported already installed by the plugin service. Direct calls through that installed plugin were not available to this session; public MCP calls were tested independently.

All five specialist origins (devtools, fullstack, frontend, backend and ai.mkazi.live) returned HTTP 200 for /agents and /api/portfolio, with five documented projects. mkazi.live returned HTTP 200 for /agents, /api/portfolio, /api/projects?q=Python&discipline=backend (one result), /openapi.json and /portfolio.md.

Public /mcp discovery, tools/list (four tools), and calls to profile, search, project detail and draft preparation succeeded. An unapproved Origin returned 403; an invalid discipline returned 400.

## Delivery detail

The Vercel router deployed the new code. The apex still uses an older Cloudflare Worker and this session has no Cloudflare deployment authentication. Explicit rewrites on all five portfolio hosts forward the five public API/Markdown/MCP routes to router.mkazi.live, preserving the canonical apex URLs across rotation. /agents is also served statically by each portfolio host.

The current Cloudflare Worker must be deployed separately to activate direct apex dispatch, the updated apex sitemap/llms copy and root Accept:text/markdown negotiation. The explicit /portfolio.md endpoint is already live. Do not claim the optional root content negotiation was verified on the apex.

The interactive app renders a dated, bundled evidence catalog and checks source availability separately. It falls back clearly when a source check is unavailable. The managed preview's source check remained unavailable; the underlying public catalog and tools were independently verified live. No live search-ranking feed, continuous availability monitor or generative chatbot is claimed.

Local validation: 19 router tests; router and Site TypeScript checks; Site production build; browser project filtering, discussion brief and connection/visibility views; five-site sitemap and navigation checks.
