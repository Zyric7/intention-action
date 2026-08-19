# Development Log

Intention Action is built in an AI-assisted workflow. This log records the
meaningful product changes, fixes, and decisions — not every commit.

## 2026-08-18

- Architecture settled before any code: Next.js + TypeScript + Tailwind +
  Zustand, small API routes as the only server, localStorage as the only
  persistence, one Project object and one Task collection as the sole
  sources of truth (Todo, Done, and Next Action are views of it).
- Full working shell in a day: intention input, editable confirm screen,
  and the working view (Next Action hero, Todo/Done, project-memory
  sidebar), with refresh-safe persistence throughout.

## 2026-08-19

- Real AI on all four operations via an OpenAI-compatible endpoint: plain
  fetch, JSON mode, timeouts, and defensive coercion of every response.
- Planning prompt encodes the product principles: few clear tasks, slack
  before the deadline, a small immediately-startable first action with a
  reason.
- Rule: scope cuts are never silent — anything dropped must be stated in
  the first task's reason, the only reason the UI always shows.
- Update loop completed: new information changes only the affected memory
  and only the remaining plan. Completed work is structurally safe,
  reported-done tasks move to Done, malformed AI output cannot corrupt
  client state, and memory-only changes leave pending tasks untouched.
- Project-aware chat below the Next Action: work on the current task
  without re-explaining the project. Durable decisions route through the
  update flow; the transcript survives completions, re-plans, and
  refreshes; controls lock during AI requests so slow responses cannot
  overwrite newer state.
- Fixed: long unbroken task text broke the page layout.
- Development log added, rendered in-app at /devlog.
- Deployed to Vercel as a private demo (intention-action.vercel.app):
  DashScope qwen-plus with thinking disabled, functions in US East — the
  only region that reaches DashScope reliably — keys held server-side;
  SiliconFlow kept as a manual fallback. Lesson: stray whitespace in piped
  env values makes fetch fail instantly and looks exactly like a network
  block — all configuration is trimmed now.

## 2026-08-20

- Product direction: time is an optional constraint, not a default part of
  the experience. Estimates create false precision, projects may be
  open-ended, and the system must never invent a deadline. PRODUCT.md
  updated.
- Implemented and verified in both flows: no invented deadlines (the
  48-hour default is gone), deadline-free plans carry no schedule and no
  routine estimates (the 30-minute fallback is gone), deadline projects
  keep full schedules and feasibility, deadlines are removable via the
  editor or the update flow, time UI renders only when the data exists,
  and the intention screen no longer foregrounds deadlines.
- Deployment hygiene: the Vercel CLI ignores .gitignore and had uploaded a
  local env file into the deployment source. Added .vercelignore, deleted
  the affected deployment, rotated the credential.
- Product direction: actions are designed for real executability and low
  activation cost — specific, sequenced, startable from their own wording
  without further "how?" questions, and sized around a single concrete
  outcome. Plan size follows the goal instead of
  an artificial limit; larger goals are divided into stages of executable
  sub-actions, while the UI keeps emphasizing the Next Action and only a
  few upcoming actions. PRODUCT.md updated; implementation to follow.
