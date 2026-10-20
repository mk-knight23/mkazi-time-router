import { agentGuide } from './agent-guide.mjs';
/** Public professional facts and bounded, read-only portfolio tools. No account data. */
export const catalog = {
  schema_version: '1.0',
  updated_at: '2026-10-20',
  evidence_reviewed_at: '2026-10-19',
  source: 'https://mkazi.live/api/portfolio',
  person: {
    id: 'https://mkazi.live/#person', name: 'Kazi Musharraf',
    alternate_names: ['Musharraf Ateeque Kazi', 'Musharraf Kazi', 'MK Knight', 'mk-knight23'],
    role: 'AI Engineer & independent builder', location: 'India', work_mode: 'Remote',
    summary: 'AI applications, developer tools and full-stack products. Former Wipro Project Engineer, July 2022–July 2025; previously Project Intern, February–July 2022.',
    interests: ['AI Engineer', 'Applied AI Engineer', 'Full-Stack AI Engineer', 'Developer Tools Engineer', 'Forward Deployed AI Engineer', 'AI Consultant'],
    stack: ['TypeScript', 'JavaScript', 'Python', 'React', 'Next.js', 'Node.js', 'SQL', 'Claude Code', 'Codex', 'Cursor'],
    email: 'kazimusharraf1234@gmail.com',
    links: { biography: 'https://devtools.mkazi.live/about', github: 'https://github.com/mk-knight23', linkedin: 'https://www.linkedin.com/in/kazi-musharraf-0674871a4', contact: 'https://devtools.mkazi.live/contact', work: 'https://devtools.mkazi.live/explore' },
    engagement: 'Remote roles eligible for India-based engineers and scoped international consulting. Discuss availability, overlap, scope and USD/AED compensation before agreeing work.',
    qualification: 'Role interests do not assert previous formal job titles, overseas work authorization, guaranteed availability or production scale.'
  },
  projects: [
    { id: 'quizflow', name: 'MK QuizFlow', discipline: ['ai', 'fullstack'], evidence: 'Product application',
      summary: 'Turn notes and text-based PDFs into editable quizzes and flashcards.',
      stack: ['Next.js', 'TypeScript', 'IndexedDB', 'Vercel AI SDK'],
      implementation: 'Browser-side PDF extraction, local persistence, deterministic Quick mode, optional AI generation and export workflows.',
      limits: 'Quick mode uses heuristics. Scanned PDFs require OCR; cross-device account sync is not included.',
      source_url: 'https://github.com/mk-knight23/MK-QuizFlow', live_url: 'https://www.thequizflow.com/' },
    { id: 'ecosystem', name: 'AI Assistants Ecosystem', discipline: ['tools'], evidence: 'Workflow documentation',
      summary: 'Reusable instructions and workflow conventions across AI coding assistants.',
      stack: ['Claude Code', 'Codex', 'Cursor', 'OpenCode', 'GitHub Copilot'],
      implementation: 'Assistant configurations, reusable skills and verification conventions with a public showcase.',
      limits: 'The documentation and showcase are not evidence of a hosted autonomous agent service.',
      source_url: 'https://github.com/mk-knight23/AI-ASSISTANTS-ECOSYSTEM', live_url: 'https://ai-coding-portfolio.vercel.app/' },
    { id: 'opencode', name: 'OpenCode Workflows', discipline: ['tools'], evidence: 'Workflow documentation',
      summary: 'Tool-specific coding-agent instructions and implementation examples.',
      stack: ['OpenCode', 'Agent instructions', 'Skills'],
      implementation: 'Workflow material organized for inspection and reuse, with a dedicated showcase.',
      limits: 'Provider availability and pricing vary. A showcase is not evidence of a zero-cost production service.',
      source_url: 'https://github.com/mk-knight23/AI-ASSISTANT-OPENCODE', live_url: 'https://ai-opencode-showcase.vercel.app/' },
    { id: 'anthropic', name: 'Anthropic SDK Adapter', discipline: ['ai', 'backend'], evidence: 'Source-available experiment',
      summary: 'Mission routing with consistent API and CLI contracts.',
      stack: ['Python', 'FastAPI', 'pytest', 'Anthropic SDK'],
      implementation: 'Skill-aware routing, health/run endpoints, CLI entry point and lazy SDK client initialization.',
      limits: 'Connecting missions to Claude Messages API calls remains on the roadmap. No hosted demo is promised.',
      source_url: 'https://github.com/mk-knight23/AI-SDK-ANTHROPIC', live_url: null },
    { id: 'router', name: 'Portfolio Time Router', discipline: ['backend', 'fullstack'], evidence: 'Delivery infrastructure',
      summary: 'One domain connects five specialist portfolios and a stable professional identity.',
      stack: ['TypeScript', 'Cloudflare Worker', 'Vercel', 'Routing tests'],
      implementation: 'IST-based rotation, visitor stickiness, manual selection, origin fallback and stable discovery endpoints.',
      limits: 'Demonstrates routing decisions; no measured traffic or business outcome is asserted.',
      source_url: 'https://github.com/mk-knight23/mkazi-time-router', live_url: 'https://mkazi.live/' }
  ]
};

const disciplines = ['all', 'ai', 'tools', 'backend', 'fullstack'];
const string = (maxLength) => ({ type: 'string', maxLength });
const schema = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
export const tools = [
  { name: 'get_kazi_profile', title: 'Read Kazi’s professional profile', description: 'Read Kazi Musharraf’s public professional identity, remote role interests, contact links and evidence date. Use for questions specifically about Kazi; not a general engineer directory.', inputSchema: schema({}) },
  { name: 'search_kazi_projects', title: 'Find relevant engineering work', description: 'Search Kazi’s five documented projects by technology or discipline. Returns source links, implementation notes and current limitations; no inferred client outcomes.', inputSchema: schema({ query: string(160), discipline: { type: 'string', enum: disciplines } }) },
  { name: 'get_kazi_project', title: 'Inspect a project', description: 'Read one project’s implementation, source, live URL if available, and current limits. Get the id from search_kazi_projects.', inputSchema: schema({ id: { type: 'string', enum: catalog.projects.map(p => p.id) } }, ['id']) },
  { name: 'prepare_kazi_project_brief', title: 'Prepare a project discussion', description: 'Prepare a structured project brief and discovery questions for a possible conversation with Kazi. This computes a draft only; it does not send messages, store the brief, reserve availability or make commitments.', inputSchema: schema({ goal: { ...string(1200), minLength: 5 }, discipline: { type: 'string', enum: disciplines.slice(1) } }, ['goal', 'discipline']) }
].map(tool => ({ ...tool, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }));

function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function validate(name, args) {
  const def = tools.find(t => t.name === name);
  if (!def) throw new Error('Unknown tool. Call tools/list for supported tools.');
  if (!object(args)) throw new Error('Arguments must be a JSON object.');
  for (const key of Object.keys(args)) if (!Object.hasOwn(def.inputSchema.properties, key)) throw new Error('Unexpected argument: ' + key);
  for (const key of def.inputSchema.required) if (!Object.hasOwn(args, key)) throw new Error('Missing argument: ' + key);
  for (const [key, value] of Object.entries(args)) {
    const rule = def.inputSchema.properties[key];
    if (typeof value !== 'string' || (rule.maxLength && value.length > rule.maxLength) || (rule.minLength && value.trim().length < rule.minLength) || (rule.enum && !rule.enum.includes(value))) throw new Error('Invalid argument: ' + key);
  }
}
export function searchProjects(query = '', discipline = 'all') {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return catalog.projects.filter(p => (discipline === 'all' || p.discipline.includes(discipline)) && words.every(w => [p.name, p.summary, p.implementation, ...p.stack].join(' ').toLowerCase().includes(w)));
}
export function callTool(name, args = {}) {
  validate(name, args);
  const attribution = { source: catalog.source, updated_at: catalog.updated_at, evidence_reviewed_at: catalog.evidence_reviewed_at };
  if (name === 'get_kazi_profile') return { ...attribution, person: catalog.person };
  if (name === 'search_kazi_projects') { const projects = searchProjects(args.query || '', args.discipline || 'all'); return { ...attribution, count: projects.length, projects }; }
  if (name === 'get_kazi_project') return { ...attribution, project: catalog.projects.find(p => p.id === args.id) };
  return { ...attribution, status: 'draft_only', goal: args.goal.trim(), discipline: args.discipline,
    relevant_projects: searchProjects('', args.discipline).map(p => ({ id: p.id, name: p.name, source_url: p.source_url })),
    discovery_questions: ['Who will use this, and what task should become easier?', 'What data, integrations and access are available?', 'What measurable acceptance criteria define a useful first version?', 'What are the timeline, budget, location eligibility and working-hour overlap?'],
    next_step: catalog.person.links.contact,
    delivery_note: 'Draft for review. No message has been sent; scope, pricing and availability are not agreed.' };
}
export function portfolioMarkdown() {
  return '# Kazi Musharraf — AI Engineer & independent builder\n\n' + catalog.person.summary + '\n\nBased in India. Remote roles and scoped consulting.\n\n' + catalog.person.engagement + '\n\n## Source-linked work\n\n' + catalog.projects.map(p => `### ${p.name}\n${p.summary}\nStack: ${p.stack.join(', ')}\nImplementation: ${p.implementation}\nCurrent limits: ${p.limits}\nSource: ${p.source_url}\n${p.live_url ? 'Site: ' + p.live_url + '\n' : ''}`).join('\n') + '\n## Contact and agent tools\n\n' + Object.values(catalog.person.links).join('\n') + '\nPublic JSON: ' + catalog.source + '\nMCP: https://mkazi.live/mcp\nAgent guide: https://mkazi.live/agents\n\nUpdated: ' + catalog.updated_at + '; project evidence reviewed: ' + catalog.evidence_reviewed_at + '.\n';
}
export const openapi = {
  openapi: '3.1.0', info: { title: 'Kazi Musharraf Public Portfolio API', version: '1.0.0', description: 'Read-only professional profile and five source-linked projects. No account access or private data.' }, servers: [{ url: 'https://mkazi.live' }],
  paths: {
    '/api/portfolio': { get: { operationId: 'getKaziPortfolio', summary: 'Read public professional evidence', description: 'Returns public identity, project details, attribution and review dates.', responses: { '200': { description: 'Public portfolio catalog', content: { 'application/json': { schema: { $ref: '#/components/schemas/Portfolio' } } } } } } },
    '/api/projects': { get: { operationId: 'searchKaziProjects', summary: 'Search documented projects', description: 'Filter by all query terms and one discipline.', parameters: [{ name: 'q', in: 'query', schema: string(160) }, { name: 'discipline', in: 'query', schema: { type: 'string', enum: disciplines } }], responses: { '200': { description: 'Matching source-linked projects', content: { 'application/json': { schema: { type: 'object', properties: { count: { type: 'integer' }, projects: { type: 'array', items: { $ref: '#/components/schemas/Project' } } } } } } }, '400': { description: 'Invalid query', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } } } }
  },
  components: { schemas: {
    Project: { type: 'object', required: ['id', 'name', 'summary', 'source_url', 'limits'], properties: { id: string(80), name: string(120), summary: string(600), discipline: { type: 'array', items: { type: 'string' } }, evidence: string(100), stack: { type: 'array', items: { type: 'string' } }, implementation: string(1000), limits: string(1000), source_url: { type: 'string', format: 'uri' }, live_url: { type: ['string', 'null'], format: 'uri' } } },
    Portfolio: { type: 'object', required: ['person', 'projects', 'updated_at', 'source'], properties: { schema_version: string(20), source: { type: 'string', format: 'uri' }, updated_at: { type: 'string', format: 'date' }, evidence_reviewed_at: { type: 'string', format: 'date' }, person: { type: 'object', description: 'Public professional identity and contact links' }, projects: { type: 'array', items: { $ref: '#/components/schemas/Project' } } } },
    Error: { type: 'object', properties: { error: { type: 'object', properties: { code: string(80), message: string(600), resolution: string(600) } } } }
  } }
};

const versions = ['2026-07-28', '2025-11-25', '2025-06-18', '2025-03-26'];
const headers = { 'content-type': 'application/json; charset=utf-8', 'x-content-type-options': 'nosniff', 'cache-control': 'no-store' };
function json(value, status = 200, extra = {}) { return new Response(JSON.stringify(value), { status, headers: { ...headers, ...extra } }); }
function error(code, message, status = 400) { return json({ error: { code, message, resolution: 'See https://mkazi.live/agents for supported endpoints and inputs.' } }, status); }
function rpcError(id, code, message, status = 400) { return json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } }, status); }
async function readBody(request) {
  const reader = request.body?.getReader(); if (!reader) throw new Error('Empty request');
  const chunks = []; let bytes = 0;
  try { while (true) { const { value, done } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > 16384) { await reader.cancel(); throw new Error('Request exceeds 16 KiB'); } chunks.push(value); } } finally { reader.releaseLock(); }
  const all = new Uint8Array(bytes); let offset = 0; for (const chunk of chunks) { all.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(all));
}
export async function mcpResponse(request) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  const allowed = [url.origin, 'https://chatgpt.com', 'https://chat.openai.com', 'https://claude.ai', 'https://www.perplexity.ai'];
  if (origin && !allowed.includes(origin)) return rpcError(null, -32600, 'Origin is not permitted.', 403);
  if (request.method === 'GET') return new Response(null, { status: 405, headers: { allow: 'POST' } });
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { allow: 'POST' } });
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return error('UNSUPPORTED_MEDIA_TYPE', 'Use application/json.', 415);
  let message;
  try { message = await readBody(request); } catch { return rpcError(null, -32700, 'Invalid JSON or request exceeds 16 KiB.'); }
  if (!object(message) || message.jsonrpc !== '2.0' || typeof message.method !== 'string' || (message.id !== undefined && typeof message.id !== 'string' && typeof message.id !== 'number')) return rpcError(null, -32600, 'Expected a single JSON-RPC 2.0 request.');
  if (message.params !== undefined && !object(message.params)) return rpcError(message.id, -32602, 'params must be an object.');
  const params = message.params || {};
  const version = request.headers.get('mcp-protocol-version');
  if (version && !versions.includes(version)) return rpcError(message.id, -32600, 'Supported versions: ' + versions.join(', '));
  // Modern request metadata is checked when supplied; legacy stateless clients remain supported.
  if (version === '2026-07-28' && params._meta?.['io.modelcontextprotocol/protocolVersion'] !== undefined && params._meta['io.modelcontextprotocol/protocolVersion'] !== version) return rpcError(message.id, -32600, 'Protocol version header and metadata do not match.');
  if (request.headers.has('mcp-method') && request.headers.get('mcp-method') !== message.method) return rpcError(message.id, -32600, 'Mcp-Method header does not match method.');
  if (request.headers.has('mcp-name') && request.headers.get('mcp-name') !== params.name) return rpcError(message.id, -32600, 'Mcp-Name header does not match tool.');
  if (message.id === undefined) {
    if (message.method === 'notifications/initialized' || message.method === 'notifications/cancelled') return new Response(null, { status: 202 });
    return rpcError(null, -32600, 'A request id is required.');
  }
  let result;
  if (message.method === 'server/discover') result = { serverInfo: { name: 'kazi-portfolio', version: '1.0.0' }, supportedVersions: versions, capabilities: { tools: {} } };
  else if (message.method === 'initialize') result = { protocolVersion: versions.includes(params.protocolVersion) ? params.protocolVersion : '2025-11-25', serverInfo: { name: 'kazi-portfolio', version: '1.0.0' }, capabilities: { tools: {} }, instructions: 'Use these tools for Kazi Musharraf’s public professional facts and project evidence. Briefs are drafts only; cite source links and preserve implementation limits.' };
  else if (message.method === 'ping') result = {};
  else if (message.method === 'tools/list') result = { tools };
  else if (message.method === 'tools/call') {
    try { const data = callTool(params.name, params.arguments ?? {}); result = { content: [{ type: 'text', text: JSON.stringify(data) }], structuredContent: data, isError: false }; }
    catch (e) { result = { content: [{ type: 'text', text: e instanceof Error ? e.message : 'Invalid tool arguments' }], isError: true }; }
  } else return rpcError(message.id, -32601, 'Method not found.', 404);
  return json({ jsonrpc: '2.0', id: message.id, result });
}
export async function agentResponse(request) {
  const url = new URL(request.url), path = url.pathname;
  if (path === '/mcp' || path === '/mcp/') return mcpResponse(request);
  const markdown = path === '/portfolio.md' || (path === '/' && request.headers.get('accept')?.includes('text/markdown') && !request.headers.get('accept')?.includes('text/html'));
  if (!markdown && !['/agents', '/api/portfolio', '/api/projects', '/openapi.json'].includes(path) && !path.startsWith('/api/portfolio/') && !path.startsWith('/api/projects/')) return null;
  if (!['GET', 'HEAD'].includes(request.method)) return error('METHOD_NOT_ALLOWED', 'This endpoint is read-only.', 405);
  let response;
  if (path === '/agents') response = new Response(agentGuide, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300', 'x-content-type-options': 'nosniff' } });
  else if (markdown) response = new Response(portfolioMarkdown(), { headers: { 'content-type': 'text/markdown; charset=utf-8', vary: 'Accept', 'cache-control': 'public, max-age=300' } });
  else if (path === '/api/portfolio') response = json(catalog, 200, { 'cache-control': 'public, max-age=300', 'access-control-allow-origin': '*' });
  else if (path === '/api/projects') {
    const query = url.searchParams.get('q') || '', discipline = url.searchParams.get('discipline') || 'all';
    if (query.length > 160 || !disciplines.includes(discipline)) return error('INVALID_QUERY', 'q must have at most 160 characters; discipline must be all, ai, tools, backend or fullstack.');
    const projects = searchProjects(query, discipline); response = json({ updated_at: catalog.updated_at, source: catalog.source, count: projects.length, projects }, 200, { 'access-control-allow-origin': '*' });
  } else if (path === '/openapi.json') response = json(openapi, 200, { 'cache-control': 'public, max-age=300' });
  else return error('NOT_FOUND', 'Public portfolio API route not found.', 404);
  if (request.method === 'HEAD') return new Response(null, { status: response.status, headers: response.headers });
  return response;
}
