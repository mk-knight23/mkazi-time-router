# MKazi.live Rollback Configuration

## Saved: 2026-06-18T14:55 IST

## Current DNS Configuration (Cloudflare)
- **Nameservers**: derek.ns.cloudflare.com, sharon.ns.cloudflare.com
- **Registrar**: Namecheap, Inc.
- **Zone ID**: a3539a123b65c351d025d3b655afcd20
- **Account ID**: efd891247c0a88f5951ae0588cdd7507

## DNS Records to Preserve
| Type | Name | Content |
|------|------|---------|
| A | mkazi.live | 172.67.195.218 |
| A | mkazi.live | 104.21.44.55 |
| MX | mkazi.live | mx.zoho.in (priority 10) |
| MX | mkazi.live | mx2.zoho.in (priority 20) |
| MX | mkazi.live | mx3.zoho.in (priority 50) |
| TXT | mkazi.live | google-site-verification=9FeE90ahzyaD9D0A-SsG4jLPfRBqsDrfE5I_wLzYWkk |
| TXT | mkazi.live | v=spf1 include:zoho.in ~all |
| TXT | mkazi.live | zoho-verification=zb49793495.zmverify.zoho.in |

## Worker Details
- **Worker Name**: mkazi-time-router
- **Workers.dev URL**: https://mkazi-time-router.mk-knight970.workers.dev
- **GitHub Repo**: https://github.com/mk-knight23/mkazi-time-router

## Rollback Procedure
1. Remove Worker routes from mkazi.live:
   ```bash
   # Remove routes from wrangler.jsonc and redeploy, or:
   # Go to Cloudflare Dashboard → Workers & Pages → mkazi-time-router → Settings → Domains & Routes → Remove mkazi.live routes
   ```
2. Restore previous A records in Cloudflare DNS if they were changed
3. Verify mkazi.live returns HTTP 200 with previous configuration
4. Continue testing through Workers.dev URL
5. Do not leave the main domain connected to a broken deployment
