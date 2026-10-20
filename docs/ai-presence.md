# AI presence: evidence, tools and measurement

Updated 2026-10-20. This is a technical visibility improvement, not a claim of an AI ranking or directory submission.

## What is shipped

- Stable `/agents` guide and canonical public identity across all five portfolio views.
- Source-linked `/api/portfolio`, validated `/api/projects`, `/portfolio.md`, `/openapi.json` and root Markdown negotiation.
- Stateless `/mcp` with public profile, project search, project detail and unsent discussion brief tools. Read-only public evidence; no model calls, private accounts, messages or stored briefs. Supports modern discovery and legacy initialize clients; no session subscriptions or SSE feed.
- ChatGPT-hosted interactive portfolio with the same catalog and four tool definitions. The native app remains owner-private. A public ChatGPT app directory listing requires a separate submission/review and has not been performed.

## Baseline

The third-party Is Agentic scan returned 19/100 on 2026-10-20. Its raw report is `agent-readiness-before.json`. This score measures that service's technical checks, not visibility in ChatGPT, Claude, Perplexity or Google. The scanner reported a WAF challenge, while direct requests using Mozilla and OAI-SearchBot at the root, ChatGPT-User at /about, PerplexityBot at devtools.mkazi.live, and Claude-User at router.mkazi.live all returned HTTP 200. Those probes show reachability from the test environment; they do not authenticate a crawler or prove indexing. Security rules were not weakened.

Branded web searches already surfaced professional/GitHub/portfolio references. No platform-specific answer position or citation rate was established. Cached snippets may lag deployed copy. Visibility UI labels these values as not measured.

## How agent access works

Search crawlers can retrieve visible professional pages. Search/grounding access is distinct from training crawl permission. A connected assistant can call the MCP endpoint to retrieve bounded, structured public evidence. The HTTP API supports clients that do not use MCP. Tools only expose their documented capabilities; a brief remains an unsent draft.

`llms.txt` and Markdown provide optional convenience. Google explicitly states that its AI search features do not require special AI files or schema. Ordinary crawlability, useful visible content, accurate structured data, canonical identity and source evidence remain the foundation. None guarantees inclusion or rank.

## Repeatable answer evaluation

Evaluate separately on each named platform and record date, model/product mode, search enabled status, exact prompt, answer, citations and factual errors. Use a fresh conversation for each prompt and retain the full answer. Do not average incompatible products into a supposed universal rank.

1. Who is Kazi Musharraf, the AI engineer at mkazi.live?
2. What has Kazi Musharraf built? Cite original project sources.
3. What does MK QuizFlow do today, and what are its limits?
4. Does Kazi's Anthropic SDK adapter currently make Claude Messages API calls?
5. How can I explore Kazi's portfolio with an MCP-compatible assistant?
6. Find an India-based builder with public AI application and developer workflow examples.

Measure branded discovery, source citation, factual correctness and unbranded inclusion separately. Mark not observed rather than zero when an evaluation was not performed. This release establishes the technical baseline; it does not manufacture answer metrics. Recheck after search engines have recrawled. Search Console ownership/submission and third-party directory publication require the appropriate connected account and were not claimed as completed.

## Official references

- https://developers.openai.com/api/docs/bots — OAI-SearchBot and GPTBot have separate purposes.
- https://developers.google.com/search/docs/appearance/ai-features — ordinary SEO applies; no special AI file or schema guarantees inclusion.
- https://docs.perplexity.ai/docs/resources/perplexity-crawlers — search crawler guidance.
- https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler — separate crawler roles.
- https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http — HTTP transport.
- https://developers.openai.com/plugins/deploy/connect-chatgpt — connection and testing guidance.

## Validation

19 router tests cover existing routing/profile behavior and catalog/API/MCP validation, oversized requests, origins, discovery, tool calls and draft semantics. TypeScript checks pass. Browser checks cover project filtering, brief generation and connection guidance. Production verification must record actual responses after deployment; source commits alone do not prove a successful host rollout.
