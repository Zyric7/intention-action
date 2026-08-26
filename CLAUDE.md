# Intention Action — working notes for AI agents

## Spec and product changes

- PRODUCT.md is the spec authority. Product-direction changes are proposed
  and approved before editing it, and PRODUCT.md changes before any
  implementation.

## Dev log

- After completing a meaningful feature, bug fix, scope change, or product
  decision, append a short dated entry to DEVLOG.md in the same task.
  Do not log trivial implementation details, and never invent history.
- DEVLOG.md is rendered in-app at /devlog (footer link); keep its format:
  `## YYYY-MM-DD` day headings with `- ` bullets, no inline markdown.

## Build and verification

- Stop the dev server before running `next build` — they share .next/ and
  a concurrent build corrupts the running server.
- Run `npm run typecheck` and `npm run build` before committing.
- When extraction or planning logic changes, verify BOTH flows via curl
  against /api/extract and /api/plan: a deadline-bound intention must yield
  a fully scheduled, estimated plan; an open-ended intention must yield no
  deadline, no schedules, and stages when the goal warrants them. The
  system must never invent a deadline.
- UI or state-layer changes are verified in an automated browser
  (interactions, DOM and localStorage checks) — never by asking the user
  to look. In Claude Code CLI use the Playwright MCP; in the Desktop app
  drive the browser pane with JS evaluation (synthetic clicks can be
  flaky while the pane is hidden).
- Run the dev server as a background shell command (`npm run dev`), not
  via managed preview servers — those have sandboxed away outbound AI
  calls before.

## Git

- Commit with the repo-local identity (Zyric7); push to main.
- On Windows, put commit messages containing quotes in a temp file and use
  `git commit -F <file>` — inline quoting has silently mangled messages.

## Deploy (Vercel)

- Deploy with `npx vercel deploy --prod --yes --token <token>`, reading
  the token from .env.vercel. The token lives ONLY in .env.vercel: the
  Vercel CLI rewrites .env.local during deploys and drops other keys
  stored there.
- Never print, echo, or commit secrets. Never pipe deploy output to null —
  a silently failed deploy once shipped stale code; always read the
  status.
- .vercelignore is authoritative for uploads (the CLI does not honor
  .gitignore). After changing upload-relevant config, audit the deployed
  file list: env-like files must be zero.
- Production: https://intention-action.vercel.app. Functions are pinned to
  iad1 in vercel.json — the only region that reaches DashScope reliably
  (hkg1 times out, sin1 is intermittent).
- Deploys are CLI-only until the Vercel GitHub App is installed on the
  repo; pushes do not auto-deploy.
- After deploying, smoke-test production: one no-deadline extraction (must
  return no deadline) and one deadline extraction.

## AI provider

- Primary: DashScope qwen3.7-plus via its OpenAI-compatible endpoint (code
  defaults in lib/llm.ts). SILICONFLOW_* values are a manual fallback
  only — never switched automatically.
- LLM calls take 5–30s; route maxDuration is 60s; thinking mode stays off
  (qwen3.7 thinks by default — enable_thinking:false is always sent).
- Web search is user-toggled (webSearch flag → enable_search). The old
  qwen-plus generation silently disabled search when enable_thinking was
  present; qwen3.7 supports both together, so that workaround is gone.
- Env values are trimmed in code: stray whitespace in a key or URL makes
  fetch fail instantly and looks exactly like a network block.
