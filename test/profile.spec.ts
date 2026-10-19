import { describe, it, expect } from 'vitest';
import { profileResponse } from '../src/profile';

describe('stable public profile', () => {
	it('serves identical biographies regardless of cookies, user-agent or portfolio override', async () => {
		const normal = profileResponse(new Request('https://mkazi.live/about?portfolio=03', { headers: { cookie: 'mkazi_active_site=4' } }))!;
		const crawler = profileResponse(new Request('https://mkazi.live/about', { headers: { 'user-agent': 'Googlebot' } }))!;
		expect(normal.status).toBe(200);
		expect(await normal.text()).toBe(await crawler.text());
	});
	it('includes matching visible identity and structured data', async () => {
		const html = await profileResponse(new Request('https://mkazi.live/about'))!.text();
		const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1]);
		expect(schema['@graph'][0].sameAs).toContain('https://www.linkedin.com/in/kazi-musharraf-0674871a4');
		expect(html).toContain('July 2022 to July 2025');
		expect(html).toContain('<img src="https://devtools.mkazi.live/kazi-musharraf.jpg"');
	});
	it('supports HEAD and a single canonical biography URL', async () => {
		const head = profileResponse(new Request('https://mkazi.live/about', { method: 'HEAD' }))!;
		expect(head.status).toBe(200);
		expect(await head.text()).toBe('');
		expect(profileResponse(new Request('https://mkazi.live/about.html'))!.headers.get('location')).toBe('https://devtools.mkazi.live/about');
		expect(profileResponse(new Request('https://mkazi.live/about/'))!.headers.get('location')).toBe('https://devtools.mkazi.live/about');
	});
	it('serves discovery files independently of upstreams and rejects unsupported writes', async () => {
		for (const path of ['/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt']) {
			const response = profileResponse(new Request('https://mkazi.live' + path))!;
			expect(response.status).toBe(200);
			expect(await response.text()).toContain('https://mkazi.live/');
		}
		expect(profileResponse(new Request('https://mkazi.live/about', { method: 'POST' }))!.status).toBe(405);
		expect(profileResponse(new Request('https://mkazi.live/dubai'))).toBeNull();
		expect(profileResponse(new Request('https://mkazi.live/'))).toBeNull();
	});
});
