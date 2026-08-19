# Development Log

Intention Action is built in an AI-assisted workflow. This log records the meaningful product changes, fixes, and decisions — not every commit.

## 2026-08-18

- Architecture settled before any code: Next.js + TypeScript + Tailwind +
  Zustand, small API routes as the only server, localStorage as the only
  persistence, and a single Project object plus a single Task collection as
  the sole sources of truth (Todo, Done, and Next Action are views of it).
- Scaffold: Project/Task data models, persisted app store, and the
  remaining-time / feasibility math. A pre-implementation review caught that
  the draft project was not persisted alongside the confirm phase — a refresh
  mid-confirm would have lost the AI's interpretation.
- Full UI shell with mock AI: intention input, editable confirm screen,
  working view with Next Action hero, Todo/Done, feasibility line, and
  project-memory sidebar. Task completion worked locally from day one.

## 2026-08-19

- AI provider decision: Alibaba Cloud Bailian (DashScope, qwen-plus) through
  its OpenAI-compatible endpoint — plain fetch with JSON mode, no SDK.
  Real intention extraction replaced the mock; deadlines are resolved
  against the user's local time and timezone.
- Real plan generation. The planning prompt encodes the product principles
  directly: fewer clearer tasks, 20% slack before the deadline, waking-hours
  scheduling, and a small immediately-startable first task with a reason.
- Scope-cut visibility fixed twice in review: cuts may never happen silently,
  and they must land in the first task's reason — the only reason the UI
  always shows.
- Hardening: 60s timeout and readable errors on all AI requests (a hung
  connection previously froze the UI in its loading state).
- The second half of the core loop: /api/update takes new information
  ("deadline moved", "remove X", "I finished Y"), updates only the affected
  project memory, and regenerates only the remaining plan. Completed tasks
  are preserved structurally — the server receives only their title/estimate
  summaries, and its response can only replace the remaining plan.
- Update edge cases fixed after review: malformed AI plans now fail without
  touching client state (an explicit empty plan stays valid); tasks reported
  as finished in an update move to Done instead of disappearing; a changed
  deadline overrides the stale pre-update time budget, and memory text that
  restates the old deadline is kept consistent.
- Layout bug fixed: a long unbroken token in the Next Action stretched the
  grid track and broke the page proportions (minmax(0,1fr), min-w-0,
  break-words).
- New feature: project-aware chat below the Next Action. Work on the current
  task without re-explaining the project; the chat sees the project context
  and task state, survives task completions and refreshes, and routes
  durable decisions through the existing update flow — ordinary conversation
  changes nothing.
- Chat follow-up fixes: state-changing controls now lock while a chat/update
  request is in flight (prevents stale-state overwrites, duplicate tasks,
  and post-reset resurrection), and memory-only updates now preserve the
  existing pending tasks untouched via an explicit planChanged contract —
  re-planning happens only when the plan actually changed.
- Added this development log, rendered in-app at /devlog via a footer link.
- Deployed to Vercel as a private demo at intention-action.vercel.app:
  functions in the hkg1 region, 60s max duration for LLM calls, keys held
  server-side as sensitive environment variables. Debugging production
  failures found the real blocker was stray whitespace in environment values
  entered via piped stdin — an invalid Authorization header or URL makes
  fetch fail instantly, convincingly mimicking a network block. The client
  now trims all configuration values.
- AI provider switched from DashScope to SiliconFlow
  (deepseek-ai/DeepSeek-V4-Flash): the DashScope key is China-region-locked
  (rejected by the international endpoint) while the demo runs on overseas
  serverless infrastructure. Thinking mode is disabled — same JSON contract
  at roughly 10x lower latency (extraction 59s → 10s). The full workflow
  (extraction, planning, chat, update/re-plan) verified on production.
- Switched production back to DashScope (qwen-plus) once the whitespace root
  cause was known. Region probing with clean values: DashScope rejects
  Vercel's Hong Kong region outright (connect timeout), is intermittent from
  Singapore, and is stable from US East — functions now run in iad1
  (extraction ~5.5s). SiliconFlow stays configured as a manual fallback only
  (point the DASHSCOPE_* variables at its endpoint); it is never used
  automatically. Full production workflow re-verified on DashScope.

## 2026-08-20

- Product direction: time is now an optional constraint, not a default part
  of the experience. Precise estimates create false precision (especially
  with AI-assisted work), projects may be long-term or open-ended with no
  deadline at all, and the system must never invent a deadline the user did
  not provide or clearly imply (the current 48-hour default is a bug).
  PRODUCT.md updated across nine touchpoints (core concept, data models,
  time system, views, AI responsibilities, MVP list, success criteria);
  implementation to follow.
- Optional-time implementation: deadline and estimatedMinutes are now truly
  optional end to end. Extraction returns null instead of inventing a
  48-hour deadline; plans for deadline-free projects carry no schedule and
  no fabricated estimates (the 30-minute coercion fallback is gone); the
  deadline, feasibility line, day groupings, and estimate labels render only
  when the data exists. A deadline can be removed both by clearing the
  editor field and by telling the update flow — planned times are dropped
  with it. Verified live in both flows: a no-timeline intention produced an
  unscheduled plan with no deadline anywhere, and the two-day demo intention
  still produced a fully scheduled plan with feasibility (one prompt
  tightening was needed: the model initially stopped scheduling even
  deadline projects until planned times were made explicitly mandatory for
  time-bound plans).
- Follow-up fixes to the same direction: deadline-free plans no longer carry
  routine estimates on every task (an estimate now appears only when knowing
  the duration genuinely helps), and the intention screen's copy and
  placeholder no longer foreground deadlines. Deployment hygiene: added
  .vercelignore after an audit showed the Vercel CLI uploads .env.vercel
  (it does not honor .gitignore); the tainted deployment was removed.
