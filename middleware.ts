/**
 * MK Router — Vercel Edge Middleware port of the Cloudflare Worker.
 *
 * Reverse-proxies the root domain to one of five portfolio sites, rotating every hour (IST).
 * Keeps the public domain in the address bar (true proxy, not a redirect), injects a floating
 * portfolio switcher into HTML, supports ?portfolio=N override, sticky cookies, a canonical
 * site for search bots, origin fallback, and a /__router-health endpoint.
 *
 * Runs on the Vercel Edge runtime (Web Fetch APIs only — no Node, no HTMLRewriter).
 */

export const config = {
	// Intercept everything except Vercel internals and static assets served from /public.
	matcher: ['/((?!_next/|_vercel/|favicon.ico).*)'],
};

interface Website {
	id: string;
	name: string;
	origin: string;
}

const WEBSITES: readonly Website[] = [
	{ id: '01', name: 'DevTools', origin: 'https://mk-devdeck.vercel.app' },
	{ id: '02', name: 'Fullstack', origin: 'https://mk-stackfolio.vercel.app' },
	{ id: '03', name: 'Frontend', origin: 'https://mk-pixelfolio.vercel.app' },
	{ id: '04', name: 'Backend', origin: 'https://mk-corefolio.vercel.app' },
	{ id: '05', name: 'Frontend AI', origin: 'https://mk-neurofolio.vercel.app' },
] as const;

const MINUTES_PER_DAY = 1440;
const SLOT_MINUTES = 60; // rotate every hour
const IST_OFFSET_MINUTES = 330;
const CANONICAL_INDEX = 0;
const ROUTER_ID = 'vercel-edge-v1';

const SEARCH_BOTS =
	/googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|pinterest|redditbot/i;

function getScheduledWebsite(date = new Date()) {
	const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
	const indiaMinutes = (utcMinutes + IST_OFFSET_MINUTES) % MINUTES_PER_DAY;
	const index = Math.floor(indiaMinutes / SLOT_MINUTES) % WEBSITES.length;
	return { index, website: WEBSITES[index], indiaMinutes };
}

function getStickyWebsiteIndex(request: Request): number | null {
	const cookie = request.headers.get('cookie');
	const match = cookie?.match(/(?:^|;\s*)mkazi_active_site=([0-4])(?:;|$)/);
	if (!match) return null;
	const index = Number(match[1]);
	return Number.isInteger(index) && index >= 0 && index < WEBSITES.length ? index : null;
}

function getPortfolioOverride(url: URL): number | null {
	const param = url.searchParams.get('portfolio');
	if (!param) return null;
	const num = Number(param);
	if (num >= 1 && num <= WEBSITES.length) return num - 1;
	const byId = WEBSITES.findIndex((w) => w.id === param);
	return byId !== -1 ? byId : null;
}

function isSearchBot(request: Request): boolean {
	return SEARCH_BOTS.test(request.headers.get('user-agent') || '');
}

function isHtmlNavigation(request: Request): boolean {
	return request.method === 'GET' && (request.headers.get('accept') || '').includes('text/html');
}

function getCookieLifetime(indiaMinutes: number): number {
	const remaining = SLOT_MINUTES - (indiaMinutes % SLOT_MINUTES);
	return Math.max(60, Math.min(Math.floor(remaining * 60), 3600));
}

function rewriteRedirectLocation(location: string, origin: string, publicUrl: URL): string {
	try {
		const target = new URL(location, origin);
		if (target.origin !== new URL(origin).origin) return location;
		target.protocol = publicUrl.protocol;
		target.host = publicUrl.host;
		return target.toString();
	} catch {
		return location;
	}
}

function switcherHtml(activeIndex: number): string {
	const buttons = WEBSITES.map((w, i) => {
		const cls = i === activeIndex ? 'mkr-btn mkr-active' : 'mkr-btn';
		return `<a href="?portfolio=${w.id}" class="${cls}" title="${w.name}">${w.id}</a>`;
	}).join('');
	return `<div id="mkazi-switcher" style="position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:0;padding:6px 10px;background:rgba(8,12,20,0.85);border:1px solid rgba(255,255,255,0.15);border-radius:30px;backdrop-filter:blur(14px);font-family:-apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.4)"><span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-right:8px;white-space:nowrap">Portfolio</span>${buttons}<style>.mkr-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);text-decoration:none;transition:all .2s;margin:0 2px}.mkr-btn:hover{background:rgba(255,255,255,0.12);color:#fff}.mkr-active{background:rgba(16,185,129,0.9);color:#0a0a0f!important}.mkr-active:hover{background:rgba(16,185,129,1)}</style></div>`;
}

async function fetchWithFallback(primaryIndex: number, publicUrl: URL, headers: Headers, request: Request) {
	const order = [primaryIndex, ...WEBSITES.map((_, i) => i).filter((i) => i !== primaryIndex)];
	for (const idx of order) {
		const website = WEBSITES[idx];
		const destination = new URL(website.origin);
		destination.pathname = publicUrl.pathname;
		destination.search = publicUrl.search;
		const h = new Headers(headers);
		h.set('x-mkazi-active-site', website.id);
		try {
			const res = await fetch(destination.toString(), {
				method: request.method,
				headers: h,
				body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
				redirect: 'manual',
			});
			if (res.status < 500) return { response: res, activeWebsite: website };
		} catch {
			continue;
		}
	}
	return {
		response: Response.json({ ok: false, code: 'ALL_ORIGINS_FAILED' }, { status: 502 }),
		activeWebsite: WEBSITES[primaryIndex],
	};
}

export default async function middleware(request: Request): Promise<Response> {
	const publicUrl = new URL(request.url);

	if (publicUrl.hostname === 'www.mkazi.live') {
		publicUrl.hostname = 'mkazi.live';
		return Response.redirect(publicUrl.toString(), 301);
	}

	const scheduled = getScheduledWebsite();

	if (publicUrl.pathname === '/__router-health') {
		const origins = await Promise.all(
			WEBSITES.map(async (w) => {
				try {
					const r = await fetch(w.origin, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
					return { id: w.id, name: w.name, status: r.status, healthy: r.status < 500 };
				} catch {
					return { id: w.id, name: w.name, status: 0, healthy: false };
				}
			}),
		);
		return Response.json(
			{
				ok: true,
				router: ROUTER_ID,
				scheduledWebsite: scheduled.website.id,
				scheduledName: scheduled.website.name,
				indiaMinutesSinceMidnight: scheduled.indiaMinutes,
				slotMinutes: SLOT_MINUTES,
				timestamp: new Date().toISOString(),
				origins,
			},
			{ status: 200, headers: { 'cache-control': 'no-store', 'x-mkazi-router': ROUTER_ID } },
		);
	}

	const override = getPortfolioOverride(publicUrl);
	const bot = isSearchBot(request);
	const sticky = getStickyWebsiteIndex(request);

	let activeIndex: number;
	if (override !== null) activeIndex = override;
	else if (bot) activeIndex = CANONICAL_INDEX;
	else if (isHtmlNavigation(request)) activeIndex = scheduled.index;
	else activeIndex = sticky ?? scheduled.index;

	const fwd = new Headers(request.headers);
	fwd.delete('host');
	fwd.delete('content-length');
	fwd.delete('accept-encoding'); // ask origin for uncompressed so we can inject into HTML
	fwd.set('x-forwarded-host', publicUrl.host);
	fwd.set('x-forwarded-proto', publicUrl.protocol.replace(':', ''));

	try {
		const { response: upstream, activeWebsite } = await fetchWithFallback(activeIndex, publicUrl, fwd, request);

		const headers = new Headers(upstream.headers);
		headers.delete('content-encoding');
		headers.delete('content-length');
		headers.set('x-mkazi-router', ROUTER_ID);
		headers.set('x-mkazi-active-site', activeWebsite.id);
		headers.set('x-mkazi-active-name', activeWebsite.name);
		if (bot) headers.set('x-mkazi-bot-mode', 'canonical');
		if (override !== null) headers.set('x-mkazi-override', 'query-param');

		const location = headers.get('location');
		if (location) headers.set('location', rewriteRedirectLocation(location, activeWebsite.origin, publicUrl));

		const contentType = headers.get('content-type') || '';
		if (contentType.includes('text/html') || publicUrl.pathname.startsWith('/api/')) {
			headers.set('cache-control', 'private, no-store, max-age=0');
		}

		if (isHtmlNavigation(request)) {
			const cookieIndex = override !== null ? override : scheduled.index;
			const lifetime = override !== null ? 3600 : getCookieLifetime(scheduled.indiaMinutes);
			headers.append('set-cookie', `mkazi_active_site=${cookieIndex}; Max-Age=${lifetime}; Path=/; Secure; HttpOnly; SameSite=Lax`);
		}

		// Inject the switcher into HTML responses (HTMLRewriter replacement).
		if (contentType.includes('text/html')) {
			const html = await upstream.text();
			const injected = html.includes('</body>')
				? html.replace('</body>', `${switcherHtml(activeIndex)}</body>`)
				: html + switcherHtml(activeIndex);
			return new Response(injected, { status: upstream.status, statusText: upstream.statusText, headers });
		}

		return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown proxy error';
		return Response.json(
			{ ok: false, code: 'UPSTREAM_PROXY_FAILED', activeWebsite: WEBSITES[activeIndex].id, message },
			{ status: 502, headers: { 'cache-control': 'no-store', 'x-mkazi-router': ROUTER_ID } },
		);
	}
}
