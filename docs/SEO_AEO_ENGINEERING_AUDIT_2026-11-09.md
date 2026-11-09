# SEO, AEO and engineering-evidence audit (2026-11-09)

## Scope and verified repository facts

- The apex domain is routed through this reverse proxy, with DevTools as the stable default in both `middleware.ts` and `src/index.ts`.
- Five portfolio repositories have separate canonical homepages, robots files, sitemaps, existing Person/ProfilePage structured data and newly added WebSite structured data.
- Each portfolio publishes `public/technology-stack.json` derived from package.json and links it from `public/llms.txt`. These inventories evidence repository dependencies, **not** individual proficiency.
- `public/portfolio-map.json` documents the distinct sites and their source repositories.
- Live deployment and Google Search Console results have **not** been verified by this repository audit.

## Priority 0: deployment and indexing correctness

1. Repair and verify the Cloudflare deployment pipeline. A GitHub commit alone is not proof that the live domain has changed.
2. Inspect real HTTP responses for apex, www, each subdomain, /robots.txt, /sitemap.xml, /llms.txt, query variants, 404s, /agents, /dubai and profile routes. Validate content type, status, redirect targets, canonical, robots headers and rendered HTML.
3. Ensure origin fallback does not accidentally serve an unrelated portfolio under the apex canonical. Prefer a temporary 503 over silently returning a different indexable site when DevTools is unavailable.
4. Compare canonical and sitemap URLs to the actual deployed routes; avoid listing soft-404 pages or duplicate URLs. Investigate all Google-selected-different-canonical cases individually.
5. Run unit tests, type checks, builds and deployed smoke tests; request indexing only after live fixes are confirmed.

## Priority 1: content quality and skills evidence

1. For each portfolio, identify 2–4 **working, attributable** projects with links to code, live demos, architecture notes and screenshots; label mockups/prototypes honestly.
2. Separate proven production experience, implemented personal projects, experiments and learning interests. Do not infer expertise from keywords or package dependencies alone.
3. Backend portfolio: show an actual API/service repository, routes, authentication, persistence, tests and deployment evidence before making backend-specific implementation claims.
4. AI portfolio: show model/provider integration, RAG or agent workflows, evaluation, error handling and cost/security boundaries when those capabilities are implemented.
5. Publish clear case studies with problem, role, stack, design decisions, limitations, verifiable outcomes and dates.
6. Use concise human-readable headings and internal links across portfolio specializations.

## Priority 2: technical quality and structured data

- Maintain valid unique titles/descriptions, canonical URLs, social cards, accessible landmarks, meaningful alt text, mobile usability and Core Web Vitals.
- Keep Person/ProfilePage/WebSite structured data consistent with visible content; use SoftwareSourceCode or CreativeWork only for actual attributable projects.
- Check for duplicate root/subdomain pages and whether they warrant distinct indexable content or consolidation.
- Do not create mass-generated near-duplicate pages for city, skill or job-title keyword variants.
- `llms.txt` is an optional machine-readable convenience, **not** a Google AI Search ranking requirement.

## References

- Google Search Central: https://developers.google.com/search/docs/appearance/ai-features
- Google AI optimization guidance: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google Search documentation updates: https://developers.google.com/search/updates


## Search Console November 6, 2026: 9 excluded URLs

Reported categories: 2 page-with-redirect, 1 not-found (404), 1 alternate-with-proper-canonical, and 5 crawled-currently-not-indexed. The report did not include the example URLs, so no individual URL is classified as an error here.

### URL-level triage and acceptance criteria

| Reason | Verify for each example URL | Correct action |
| --- | --- | --- |
| Redirect (2) | HTTP status, destination, loops, canonical of destination, incoming internal links | Keep intentional permanent redirects; update internal links/sitemap to destination |
| Not found (1) | Was the content intentionally removed? Is an internal link or sitemap pointing at it? | Restore real content if required; otherwise retain genuine 404/410 and remove bad internal links |
| Alternate canonical (1) | Does the alternate duplicate the selected canonical? Is that selection intended? | Leave valid consolidation alone; correct only unintended canonical signals |
| Crawled not indexed (5) | Inspect page content, duplication, rendered content, title, canonical, sitemap inclusion and link discovery | Improve useful distinct content and fix technical errors; request indexing after deployment verification |

### Live verification commands

```sh
curl -IL https://www.mkazi.live/
curl -IL https://mkazi.live/
curl -i https://mkazi.live/robots.txt
curl -i https://mkazi.live/sitemap.xml
curl -IL 'https://mkazi.live/?portfolio=03'
curl -IL https://devtools.mkazi.live/blog/stable-portfolio-routing.html
```

Expected: www redirects to apex; canonical homepage returns 200 HTML and apex canonical; robots references apex sitemap; sitemap returns valid XML; override HTML responses send `X-Robots-Tag: noindex, follow`; article returns 200 and self-canonical. Confirm actual statuses before filing Search Console validation.

### Safeguard applied

The Cloudflare and Vercel router implementations no longer substitute a different portfolio at the canonical homepage when the DevTools origin fails. This prevents changing homepage identity under the same URL. A failed primary origin may instead cause a 502, which must be monitored and fixed at the origin/deployment layer.

## Release gate

No claim of successful production SEO remediation until the target deployment has passed smoke tests, the live canonical/sitemap/robots responses have been checked, and Search Console revalidation has been initiated. Indexing and AI citations are not guaranteed.
