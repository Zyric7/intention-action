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
