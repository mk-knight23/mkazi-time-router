// Shared by Cloudflare and the Vercel fallback. Public biography is identical for all visitors.
const biographyUrl = 'https://devtools.mkazi.live/about.html';
const portraitUrl = 'https://devtools.mkazi.live/kazi-musharraf.jpg';
const githubUrl = 'https://github.com/mk-knight23';
const linkedinUrl = 'https://www.linkedin.com/in/kazi-musharraf-0674871a4';
const portfolios = [
	['AI engineering and developer tools', 'https://devtools.mkazi.live/'],
	['Full-stack development', 'https://fullstack.mkazi.live/'],
	['Frontend engineering', 'https://frontend.mkazi.live/'],
	['Backend systems', 'https://backend.mkazi.live/'],
	['AI interfaces', 'https://ai.mkazi.live/'],
];
const description = 'Kazi Musharraf is an India-based AI Engineer and Full-Stack Developer building AI agents, developer tools and web applications. Former Wipro Project Engineer.';
const structuredData = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'Person', '@id': 'https://mkazi.live/#person', name: 'Kazi Musharraf',
			alternateName: ['Musharraf Ateeque Kazi', 'Musharraf Kazi', 'MK Knight', 'mk-knight23'],
			url: biographyUrl, jobTitle: 'AI Engineer', description,
			image: { '@type': 'ImageObject', url: portraitUrl, width: 450, height: 450, caption: 'Kazi Musharraf — AI Engineer and Full-Stack Developer' },
			sameAs: [githubUrl, linkedinUrl],
		},
		{
			'@type': 'ProfilePage', '@id': biographyUrl + '#profile', url: biographyUrl,
			name: 'About Kazi Musharraf — AI Engineer & Full-Stack Developer',
			mainEntity: { '@id': 'https://mkazi.live/#person' },
		},
	],
};

const biography = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About Kazi Musharraf | AI Engineer &amp; Full-Stack Developer</title>
<meta name="description" content="${description}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${biographyUrl}"><link rel="me" href="${githubUrl}"><link rel="me" href="${linkedinUrl}">
<meta property="og:type" content="profile"><meta property="og:title" content="Kazi Musharraf — AI Engineer &amp; Full-Stack Developer">
<meta property="og:description" content="${description}"><meta property="og:url" content="${biographyUrl}">
<meta property="og:image" content="${portraitUrl}"><meta property="og:image:alt" content="Kazi Musharraf — AI Engineer">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${portraitUrl}">
<script type="application/ld+json">${JSON.stringify(structuredData)}</script>
<style>body{margin:0;background:#0d1421;color:#e8edf5;font:17px/1.75 system-ui,sans-serif}main{max-width:860px;margin:auto;padding:48px 24px}a{color:#7dd3fc}header{display:flex;align-items:center;gap:28px;flex-wrap:wrap}header img{border-radius:20px;object-fit:cover}h1{font-size:clamp(2rem,6vw,3.4rem);line-height:1.15;margin:12px 0}h2{margin-top:40px;font-size:1.35rem}.role{color:#b7c6db}nav{margin-top:28px}li{margin:8px 0}section{border-top:1px solid #29354a;margin-top:32px}footer{margin-top:48px;color:#b7c6db}</style>
</head><body><main>
<header><img src="${portraitUrl}" alt="Kazi Musharraf, AI Engineer and Full-Stack Developer from India" width="180" height="180"><div><p class="role">AI Engineer &amp; Full-Stack Developer</p><h1>Kazi Musharraf</h1><p>India · Remote engineering and consulting</p></div></header>
<nav aria-label="Professional profiles"><a href="https://mkazi.live/">Portfolio home</a> · <a href="${githubUrl}" rel="me">GitHub</a> · <a href="${linkedinUrl}" rel="me">LinkedIn</a></nav>
<section><h2>About me</h2><p>I’m Kazi Musharraf, also known as Musharraf Ateeque Kazi, Musharraf Kazi and <strong>mk-knight23</strong>. I’m an AI engineer and independent full-stack developer based in India. I build AI agents, LLM applications, developer tools, automation and web products.</p><p>My core stack includes TypeScript, JavaScript, Python, React, Next.js, Node.js and PostgreSQL. I use AI coding tools alongside software engineering to take projects from an idea through implementation and deployment.</p></section>
<section><h2>Professional background</h2><p>I worked at <strong>Wipro Technologies as a Project Engineer from July 2022 to July 2025</strong>, following a Project Intern role from February to July 2022. My experience includes enterprise software in banking and fintech.</p><p>I now work independently from India and am open to remote AI engineering, full-stack development and consulting opportunities.</p></section>
<section><h2>Explore my work</h2><ul>${portfolios.map(([name, url]) => `<li><a href="${url}">${name}</a></li>`).join('')}</ul><p>Source code and project documentation are available through my <a href="${githubUrl}?tab=repositories">GitHub repositories</a>.</p></section>
<section><h2>Contact</h2><p><a href="mailto:kazimusharraf1234@gmail.com">kazimusharraf1234@gmail.com</a></p></section>
<footer>Public professional profile of Kazi Musharraf · Updated 18 October 2026</footer>
</main></body></html>`;

const summary = `# Kazi Musharraf\n\n${description}\n\nAlso known as Musharraf Ateeque Kazi, Musharraf Kazi, MK Knight and mk-knight23. Former Project Engineer at Wipro Technologies, July 2022 to July 2025; Project Intern, February to July 2022. Works remotely from India.\n\n- Biography: ${biographyUrl}\n- Portfolio home: https://mkazi.live/\n- GitHub: ${githubUrl}\n- LinkedIn: ${linkedinUrl}\n- Portrait: ${portraitUrl}\n${portfolios.map(([name, url]) => '- ' + name + ': ' + url).join('\n')}\n`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
<url><loc>https://mkazi.live/</loc></url>
<url><loc>https://mkazi.live/about</loc><image:image><image:loc>${portraitUrl}</image:loc></image:image></url>
</urlset>`;

export function profileResponse(request: Request): Response | null {
	const path = new URL(request.url).pathname;
	if (!['/about', '/about/', '/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt'].includes(path)) return null;
	if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405, headers: { allow: 'GET, HEAD' } });
	if (path === '/about/') return Response.redirect(biographyUrl, 301);
	const robots = 'User-agent: *\nAllow: /\n\nSitemap: https://mkazi.live/sitemap.xml\n' + portfolios.map(([, url]) => 'Sitemap: ' + url + 'sitemap.xml').join('\n') + '\n';
	const [body, contentType] = path === '/about' ? [biography, 'text/html']
		: path === '/sitemap.xml' ? [sitemap, 'application/xml']
		: [path === '/robots.txt' ? robots : summary, 'text/plain'];
	return new Response(request.method === 'HEAD' ? null : body, {
		status: 200,
		headers: { 'content-type': contentType + '; charset=utf-8', 'cache-control': 'public, max-age=300', 'x-content-type-options': 'nosniff' },
	});
}
