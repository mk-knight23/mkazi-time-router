interface Env {}

type Website = {
	id: string;
	name: string;
	origin: string;
};

const WEBSITES: readonly Website[] = [
	{
		id: '01',
		name: 'DevTools',
		origin: 'https://mk-devdeck.vercel.app',
	},
	{
		id: '02',
		name: 'Fullstack',
		origin: 'https://mk-stackfolio.vercel.app',
	},
	{
		id: '03',
		name: 'Frontend',
		origin: 'https://mk-pixelfolio.vercel.app',
	},
	{
		id: '04',
		name: 'Backend',
		origin: 'https://mk-corefolio.vercel.app',
	},
	{
		id: '05',
		name: 'Frontend AI',
		origin: 'https://mk-neurofolio.vercel.app',
	},
] as const;

const MINUTES_PER_DAY = 1440;
// Rotate the served portfolio every hour (IST). With 5 portfolios the cycle repeats
// every 5 hours and follows the same pattern each day (hour % WEBSITES.length).
const SLOT_MINUTES = 60;
const IST_OFFSET_MINUTES = 330;

const SEARCH_BOTS =
	/googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|pinterest|redditbot/i;

const CANONICAL_INDEX = 0;

function getScheduledWebsite(date = new Date()) {
	const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();

	const indiaMinutes = (utcMinutes + IST_OFFSET_MINUTES) % MINUTES_PER_DAY;

	// Hourly rotation that wraps across the portfolio list (e.g. 5 sites → repeats every 5h).
	const index = Math.floor(indiaMinutes / SLOT_MINUTES) % WEBSITES.length;

	return {
		index,
		website: WEBSITES[index],
		indiaMinutes,
	};
}

function getStickyWebsiteIndex(request: Request): number | null {
	const cookieHeader = request.headers.get('cookie');

	if (!cookieHeader) {
		return null;
	}

	const match = cookieHeader.match(/(?:^|;\s*)mkazi_active_site=([0-4])(?:;|$)/);

	if (!match) {
		return null;
	}

	const index = Number(match[1]);

	if (!Number.isInteger(index) || index < 0 || index >= WEBSITES.length) {
		return null;
	}

	return index;
}

function getPortfolioOverride(url: URL): number | null {
	const param = url.searchParams.get('portfolio');
	if (!param) return null;

	const num = Number(param);
	if (num >= 1 && num <= WEBSITES.length) {
		return num - 1;
	}

	const byId = WEBSITES.findIndex((w) => w.id === param);
	if (byId !== -1) return byId;

	return null;
}

function isSearchBot(request: Request): boolean {
	const ua = request.headers.get('user-agent') || '';
	return SEARCH_BOTS.test(ua);
}

function isHtmlNavigation(request: Request): boolean {
	const accept = request.headers.get('accept') || '';

	return request.method === 'GET' && accept.includes('text/html');
}

function getCookieLifetime(indiaMinutes: number): number {
	const position = indiaMinutes % SLOT_MINUTES;

	const remainingMinutes = SLOT_MINUTES - position;

	return Math.max(60, Math.min(Math.floor(remainingMinutes * 60), 600));
}

function rewriteRedirectLocation(location: string, origin: string, publicUrl: URL): string {
	try {
		const targetLocation = new URL(location, origin);

		const originUrl = new URL(origin);

		if (targetLocation.origin !== originUrl.origin) {
			return location;
		}

		targetLocation.protocol = publicUrl.protocol;

		targetLocation.host = publicUrl.host;

		return targetLocation.toString();
	} catch {
		return location;
	}
}

async function fetchWithFallback(
	primaryIndex: number,
	publicUrl: URL,
	requestHeaders: Headers,
	request: Request,
): Promise<{
	response: Response;
	activeIndex: number;
	activeWebsite: Website;
}> {
	const order = [primaryIndex];
	for (let i = 0; i < WEBSITES.length; i++) {
		if (i !== primaryIndex) order.push(i);
	}

	for (const idx of order) {
		const website = WEBSITES[idx];
		const destination = new URL(website.origin);
		destination.pathname = publicUrl.pathname;
		destination.search = publicUrl.search;

		const headers = new Headers(requestHeaders);
		headers.set('x-mkazi-active-site', website.id);

		try {
			const upstreamRequest = new Request(destination.toString(), {
				method: request.method,
				headers,
				body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
				redirect: 'manual',
			});

			const response = await fetch(upstreamRequest);

			if (response.status < 500) {
				return {
					response,
					activeIndex: idx,
					activeWebsite: website,
				};
			}
		} catch {
			continue;
		}
	}

	return {
		response: Response.json(
			{
				ok: false,
				code: 'ALL_ORIGINS_FAILED',
				message: 'All upstream origins are unavailable',
			},
			{ status: 502 },
		),
		activeIndex: primaryIndex,
		activeWebsite: WEBSITES[primaryIndex],
	};
}

class SwitcherInjector {
	private activeIndex: number;
	private websites: readonly Website[];

	constructor(activeIndex: number, websites: readonly Website[]) {
		this.activeIndex = activeIndex;
		this.websites = websites;
	}

	element(element: Element) {
		const buttons = this.websites
			.map((w, i) => {
				const isActive = i === this.activeIndex;
				const cls = isActive ? 'mkr-btn mkr-active' : 'mkr-btn';
				return `<a href="?portfolio=${w.id}" class="${cls}" title="${w.name}">${w.id}</a>`;
			})
			.join('');

		const html = `<div id="mkazi-switcher" style="position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:0;padding:6px 10px;background:rgba(8,12,20,0.85);border:1px solid rgba(255,255,255,0.15);border-radius:30px;backdrop-filter:blur(14px);font-family:-apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.4)">
<span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-right:8px;white-space:nowrap">Portfolio</span>
${buttons}
<style>
.mkr-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);text-decoration:none;transition:all .2s;margin:0 2px}
.mkr-btn:hover{background:rgba(255,255,255,0.12);color:#fff}
.mkr-active{background:rgba(16,185,129,0.9);color:#0a0a0f!important}
.mkr-active:hover{background:rgba(16,185,129,1)}
</style>
</div>`;

		element.append(html, { html: true });
	}
}

export default {
	async fetch(request: Request, _env: Env): Promise<Response> {
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
						const r = await fetch(w.origin, {
							method: 'HEAD',
							signal: AbortSignal.timeout(5000),
						});
						return {
							id: w.id,
							name: w.name,
							status: r.status,
							healthy: r.status < 500,
						};
					} catch {
						return {
							id: w.id,
							name: w.name,
							status: 0,
							healthy: false,
						};
					}
				}),
			);

			return Response.json(
				{
					ok: true,
					router: 'mkazi-cloudflare-router-v2',
					scheduledWebsite: scheduled.website.id,
					scheduledName: scheduled.website.name,
					indiaMinutesSinceMidnight: scheduled.indiaMinutes,
					slotMinutes: SLOT_MINUTES,
					timestamp: new Date().toISOString(),
					origins,
				},
				{
					status: 200,
					headers: {
						'cache-control': 'no-store',
						'x-mkazi-router': 'cloudflare-worker-v2',
					},
				},
			);
		}

		const portfolioOverride = getPortfolioOverride(publicUrl);

		const botDetected = isSearchBot(request);

		const stickyIndex = getStickyWebsiteIndex(request);

		let activeIndex: number;

		if (portfolioOverride !== null) {
			activeIndex = portfolioOverride;
		} else if (botDetected) {
			activeIndex = CANONICAL_INDEX;
		} else if (isHtmlNavigation(request)) {
			activeIndex = scheduled.index;
		} else {
			activeIndex = stickyIndex ?? scheduled.index;
		}

		const requestHeaders = new Headers(request.headers);

		requestHeaders.delete('host');
		requestHeaders.delete('content-length');

		requestHeaders.set('x-forwarded-host', publicUrl.host);

		requestHeaders.set('x-forwarded-proto', publicUrl.protocol.replace(':', ''));

		try {
			const {
				response: upstreamResponse,
				activeIndex: resolvedIndex,
				activeWebsite,
			} = await fetchWithFallback(activeIndex, publicUrl, requestHeaders, request);

			const responseHeaders = new Headers(upstreamResponse.headers);

			responseHeaders.set('x-mkazi-router', 'cloudflare-worker-v2');

			responseHeaders.set('x-mkazi-active-site', activeWebsite.id);

			responseHeaders.set('x-mkazi-active-name', activeWebsite.name);

			if (botDetected) {
				responseHeaders.set('x-mkazi-bot-mode', 'canonical');
			}

			if (portfolioOverride !== null) {
				responseHeaders.set('x-mkazi-override', 'query-param');
			}

			const location = responseHeaders.get('location');

			if (location) {
				responseHeaders.set('location', rewriteRedirectLocation(location, activeWebsite.origin, publicUrl));
			}

			const contentType = responseHeaders.get('content-type') || '';

			if (contentType.includes('text/html') || publicUrl.pathname.startsWith('/api/')) {
				responseHeaders.set('cache-control', 'private, no-store, max-age=0');
			}

			const cookieIndex = portfolioOverride !== null ? portfolioOverride : scheduled.index;

			if (isHtmlNavigation(request)) {
				const cookieLifetime = portfolioOverride !== null ? 3600 : getCookieLifetime(scheduled.indiaMinutes);

				responseHeaders.append(
					'set-cookie',
					[`mkazi_active_site=${cookieIndex}`, `Max-Age=${cookieLifetime}`, 'Path=/', 'Secure', 'HttpOnly', 'SameSite=Lax'].join('; '),
				);
			}

			if (contentType.includes('text/html') && !botDetected && isHtmlNavigation(request)) {
				const rewriter = new HTMLRewriter().on('body', new SwitcherInjector(resolvedIndex, WEBSITES));

				return rewriter.transform(
					new Response(upstreamResponse.body, {
						status: upstreamResponse.status,
						statusText: upstreamResponse.statusText,
						headers: responseHeaders,
					}),
				);
			}

			return new Response(upstreamResponse.body, {
				status: upstreamResponse.status,
				statusText: upstreamResponse.statusText,
				headers: responseHeaders,
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown proxy error';

			console.error('MKazi proxy error', {
				activeWebsite: WEBSITES[activeIndex].id,
				message,
			});

			return Response.json(
				{
					ok: false,
					code: 'UPSTREAM_PROXY_FAILED',
					activeWebsite: WEBSITES[activeIndex].id,
					activeOrigin: WEBSITES[activeIndex].origin,
					message,
				},
				{
					status: 502,
					headers: {
						'cache-control': 'no-store',
						'x-mkazi-router': 'cloudflare-worker-v2',
						'x-mkazi-active-site': WEBSITES[activeIndex].id,
					},
				},
			);
		}
	},
};
