# Intention Action — working notes for AI agents

- After completing a meaningful feature, bug fix, scope change, or product
  decision, append a short dated entry to DEVLOG.md in the same task.
  Do not log trivial implementation details, and never invent history.
- DEVLOG.md is rendered in-app at /devlog (footer link); keep its format:
  `## YYYY-MM-DD` day headings with `- ` bullets, no inline markdown.
- Stop the dev server before running `next build` — they share .next/ and
  a concurrent build corrupts the running server.
