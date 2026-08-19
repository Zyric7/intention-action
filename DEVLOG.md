# Development Log

Intention Action is built in an AI-assisted workflow. This log records the
meaningful product changes, fixes, and decisions — not every commit.

## 2026-08-18

- Architecture settled before any code: Next.js + TypeScript + Tailwind +
  Zustand, small API routes as the only server, localStorage as the only
  persistence, and a single Project object plus a single Task collection as
  the sole sources of truth (Todo, Done, and Next Action are views of it).
- Full working shell in a day: intention input, editable confirm screen,
  working view with Next Action hero, Todo/Done, and project-memory sidebar.
  Task completion and refresh-safe persistence (including the mid-confirm
  draft) worked from the start.

## 2026-08-19

- Real AI throughout, via an OpenAI-compatible endpoint with plain fetch (no
  SDK), JSON mode, a 60s timeout, and defensive coercion of every response.
  Extraction resolves deadlines in the user's timezone; planning encodes the
  product principles directly: few clear tasks, slack before the deadline,
  waking-hours scheduling, and a small immediately-startable first action
  with a reason.
- Scope cuts may never happen silently: anything dropped to fit a constraint
  must be stated in the first task's reason — the only reason the UI always
  shows.
- The update loop completes the core loop: new information updates only the
  affected project memory and regenerates only the remaining plan. Completed
  tasks are preserved structurally; tasks the user reports as finished move
  to Done; malformed AI plans fail without touching client state; deadline
  changes take precedence over stale time budgets; memory-only changes leave
  pending tasks untouched (explicit planChanged contract).
- Project-aware chat below the Next Action: work on the current task without
  re-explaining the project. The transcript survives task completions,
  re-plans, and refreshes; durable decisions route through the existing
  update flow; ordinary conversation changes nothing. State-changing
  controls lock while an AI request is in flight, so a slow response can
  never overwrite newer state.
- Fixed: long unbroken task text stretched the layout grid and broke the
  page proportions.
- Development log added, rendered in-app at /devlog via a footer link.
- Deployed to Vercel as a private demo at intention-action.vercel.app:
  DashScope (qwen-plus) with thinking mode disabled, functions in US East —
  the only region that reaches DashScope reliably — with a 60s max duration
  and keys held server-side as sensitive environment variables. SiliconFlow
  (DeepSeek-V4-Flash) remains configured as a manual fallback only. Lesson
  worth keeping: stray whitespace in piped environment values makes fetch
  fail instantly and convincingly mimics a network block — all configuration
  values are trimmed now.

## 2026-08-20

- Product direction: time is an optional constraint, not a default part of
  the experience. Precise estimates create false precision, projects may be
  long-term or open-ended, and the system must never invent a deadline the
  user did not provide or clearly imply. PRODUCT.md updated accordingly.
- Implemented end to end and verified in both flows: extraction returns no
  deadline unless one is given (the invented 48-hour default is gone);
  deadline-free plans carry no schedule and no routine estimates (the
  30-minute fallback is gone), while deadline projects keep full schedules
  and the feasibility line; a deadline can be removed via the editor or the
  update flow; the deadline, day groupings, and estimate labels render only
  when the data exists; the intention screen's copy no longer foregrounds
  deadlines.
- Deployment hygiene: .vercelignore added — the Vercel CLI does not honor
  .gitignore and had uploaded a local env file into the deployment source.
  The affected deployment was deleted and the credential rotated.
