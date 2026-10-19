import { env, createExecutionContext, waitOnExecutionContext, fetchMock } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import worker from '../src/index';

beforeEach(() => {
 fetchMock.activate();
 fetchMock.disableNetConnect();
 for (const host of ['devtools', 'fullstack', 'frontend', 'backend', 'ai']) {
  fetchMock.get(`https://${host}.mkazi.live`).intercept({ path: /.*/ }).reply(200, '<html><body><h1>Portfolio</h1></body></html>', { headers: { 'content-type': 'text/html' } }).persist();
 }
});
afterEach(() => fetchMock.deactivate());

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('mkazi-time-router', () => {
	it('redirects www to non-www', async () => {
		const request = new IncomingRequest('https://www.mkazi.live/test');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(301);
		expect(response.headers.get('location')).toBe('https://mkazi.live/test');
	});

	it('returns health check JSON', async () => {
		const request = new IncomingRequest('https://mkazi.live/__router-health');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.ok).toBe(true);
		expect(data.router).toBe('mkazi-cloudflare-router-v2');
		expect(data.scheduledWebsite).toBeDefined();
		expect(data.origins).toBeDefined();
	});

	it('sets router headers on proxied responses', async () => {
		const request = new IncomingRequest('https://mkazi.live/', {
			headers: {
				accept: 'text/html',
			},
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(await response.text()).toContain('Portfolio');
		expect(response.headers.get('x-mkazi-router')).toBe('cloudflare-worker-v2');
		expect(response.headers.get('x-mkazi-active-site')).toMatch(/^0[1-5]$/);
	});

	it('serves canonical site for search bots', async () => {
		const request = new IncomingRequest('https://mkazi.live/', {
			headers: {
				accept: 'text/html',
				'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
			},
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.headers.get('x-mkazi-active-site')).toBe('01');
		expect(response.headers.get('x-mkazi-bot-mode')).toBe('canonical');
	});

	it('respects ?portfolio= override', async () => {
		const request = new IncomingRequest('https://mkazi.live/?portfolio=03', {
			headers: {
				accept: 'text/html',
			},
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.headers.get('x-mkazi-active-site')).toBe('03');
		expect(response.headers.get('x-mkazi-override')).toBe('query-param');
	});
});
