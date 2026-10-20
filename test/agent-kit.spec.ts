import { describe, it, expect } from 'vitest';
import { agentResponse, callTool, catalog } from '../src/agent-kit.mjs';

const request = (method: string, params = {}, extra: Record<string,string> = {}) => new Request('https://mkazi.live/mcp', { method: 'POST', headers: {'content-type':'application/json',...extra}, body: JSON.stringify({jsonrpc:'2.0',id:1,method,params}) });

describe('public agent portfolio', () => {
  it('serves a stable catalog independent of cookies and portfolio selection', async () => {
    const response = await agentResponse(new Request('https://mkazi.live/api/portfolio?portfolio=04',{headers:{cookie:'mkazi_active_site=4'}}));
    expect(response!.status).toBe(200);
    const data=await response!.json() as any;
    expect(data.projects).toHaveLength(5);
    expect(data.person.name).toBe('Kazi Musharraf');
    expect(data.person).not.toHaveProperty('salary');
    expect(JSON.stringify(data)).not.toMatch(/clotting|credit.card|father|passport/i);
  });
  it('combines literal query terms and disciplines and returns JSON errors', async () => {
    const response = await agentResponse(new Request('https://mkazi.live/api/projects?q=Python&discipline=backend'));
    expect((await response!.json() as any).projects.map((p:any)=>p.id)).toEqual(['anthropic']);
    expect((await agentResponse(new Request('https://mkazi.live/api/projects?discipline=invalid')))!.status).toBe(400);
    const missing=await agentResponse(new Request('https://mkazi.live/api/projects/invalid'));
    expect(missing!.status).toBe(404);expect(missing!.headers.get('content-type')).toContain('application/json');
  });
  it('negotiates root Markdown with Vary and preserves HTML routing', async () => {
    const markdown=await agentResponse(new Request('https://mkazi.live/',{headers:{accept:'text/markdown'}}));
    expect(markdown!.headers.get('vary')).toBe('Accept');
    expect(markdown!.headers.get('content-type')).toContain('text/markdown');
    expect(await markdown!.text()).toContain('Current limits:');
    expect(await agentResponse(new Request('https://mkazi.live/',{headers:{accept:'text/html'}}))).toBeNull();
    const head=await agentResponse(new Request('https://mkazi.live/portfolio.md',{method:'HEAD'}));
    expect(await head!.text()).toBe('');
  });
  it('supports modern discovery and a legacy initialize/list/call lifecycle', async () => {
    const discovery=await agentResponse(request('server/discover'));
    expect((await discovery!.json() as any).result.supportedVersions).toContain('2026-07-28');
    const init=await agentResponse(request('initialize',{protocolVersion:'2025-06-18'}));
    expect((await init!.json() as any).result.protocolVersion).toBe('2025-06-18');
    const listed=await agentResponse(request('tools/list'));
    expect((await listed!.json() as any).result.tools).toHaveLength(4);
    const called=await agentResponse(request('tools/call',{name:'get_kazi_project',arguments:{id:'anthropic'}}));
    const result=(await called!.json() as any).result;
    expect(result.isError).toBe(false);expect(result.structuredContent.project.limits).toContain('roadmap');
  });
  it('validates protocol headers and Origin without trusting user-agent strings', async () => {
    expect((await agentResponse(request('tools/list',{}, {origin:'https://evil.example'})))!.status).toBe(403);
    expect((await agentResponse(request('tools/list',{}, {'mcp-method':'tools/call'})))!.status).toBe(400);
    expect((await agentResponse(request('tools/list',{}, {'mcp-protocol-version':'2099-01-01'})))!.status).toBe(400);
  });
  it('rejects unknown tools, extra properties and oversized input without side effects', async () => {
    const unknown=await agentResponse(request('tools/call',{name:'send_email',arguments:{}}));
    expect((await unknown!.json() as any).result.isError).toBe(true);
    expect(()=>callTool('get_kazi_profile',{token:'secret'})).toThrow('Unexpected');
    const large=new Request('https://mkazi.live/mcp',{method:'POST',headers:{'content-type':'application/json'},body:'x'.repeat(17000)});
    expect((await agentResponse(large))!.status).toBe(400);
    expect(()=>callTool('prepare_kazi_project_brief',{goal:'   ',discipline:'ai'})).toThrow();
  });
  it('computes a draft without sending or changing catalog data', () => {
    const original=JSON.stringify(catalog);
    const result=callTool('prepare_kazi_project_brief',{goal:'Build a useful training quiz app',discipline:'ai'}) as any;
    expect(result.status).toBe('draft_only');expect(result.delivery_note).toContain('No message');
    expect(JSON.stringify(catalog)).toBe(original);
  });
});
