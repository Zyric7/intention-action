// Server-side prompt templates. One prompt per AI responsibility (PRODUCT.md).

export const EXTRACT_SYSTEM = `You turn a user's natural-language intention into structured project information.

Return ONLY a JSON object with exactly these fields:
{
  "title": string,            // short project name
  "goal": string,             // what the user ultimately wants to achieve
  "purpose": string,          // why it matters to them ("" if not stated or clearly implied)
  "deadline": string,         // ISO 8601 datetime WITH timezone offset
  "requirements": string[],   // things that must be included
  "constraints": string[],    // things that limit the solution (time, tech, scope)
  "preferences": string[],    // nice-to-haves, not mandatory
  "successCriteria": string[] // what counts as success
}

Rules:
- Resolve relative deadlines ("in two days", "by Friday evening") against the current time you are given. If no time of day is stated, use 18:00. If no deadline is stated at all, use exactly 48 hours from the current time.
- Extract only what the user stated or clearly implied. Do not invent requirements, features, or criteria they never mentioned.
- Keep every list short and concrete — quality over quantity. Empty arrays are fine.
- Write all extracted text in the same language the user wrote in.
- Never pretend uncertain information is known.`;

export function extractUser(intention: string, nowIso: string): string {
  return `Current date and time: ${nowIso}

The user's intention:
"""
${intention}
"""

Extract the structured project information as JSON.`;
}

// Shared planning rules — used for both the initial plan and re-planning so
// the two can never drift apart.
const PLAN_RULES = `- REALITY OVER IDEAL PLANS. Generate the most useful achievable plan, not the most complete one. Prefer fewer, clearer tasks — usually 4 to 8. Never pad with unnecessary work.
- The total estimated time must fit comfortably between now and the deadline: leave at least 20% slack, and only schedule within plausible waking hours (roughly 09:00–23:00 local time) unless the deadline forces otherwise.
- If everything the project asks for cannot realistically fit, cut or shrink the least essential items — and state every cut in the FIRST task's "reason" (e.g. "Note: dropped the calendar view — not achievable before the deadline"), because only the first task's reason is guaranteed to be visible to the user. Never drop scope silently. Do not compress estimates to pretend it fits.
- Order tasks by execution order, respecting dependencies. The FIRST task is the user's next action: make it concrete, small (≤45 minutes if possible), and startable right now.
- Planned times must be sequential and non-overlapping, starting no earlier than now, with short breaks between tasks.
- Respect every requirement, constraint, and preference in the project context.
- Estimates should be honest, not optimistic.
- Write all text in the same language as the project context.`;

const TASK_SHAPE = `{
      "title": string,           // specific, small enough to start immediately
      "description": string,     // one sentence of concrete guidance ("" if the title says it all)
      "estimatedMinutes": number,
      "plannedStart": string,    // ISO 8601 datetime WITH timezone offset
      "plannedEnd": string,      // plannedStart + estimatedMinutes
      "reason": string           // short, useful: why this task, why in this position
    }`;

export const PLAN_SYSTEM = `You turn a structured project context into a realistic, executable action plan.

Return ONLY a JSON object with exactly this shape:
{
  "tasks": [
    ${TASK_SHAPE}
  ]
}

Rules:
${PLAN_RULES}`;

export function planUser(projectJson: string, nowIso: string, minutesToDeadline: number): string {
  return `Current date and time: ${nowIso}
Minutes until the deadline: ${minutesToDeadline}

Project context:
${projectJson}

Generate the realistic action plan as JSON.`;
}

export const UPDATE_SYSTEM = `You maintain a project's structured memory and its remaining action plan. The user gives you the current project context, completed work, the remaining plan, and a new message describing what changed.

Return ONLY a JSON object with exactly this shape:
{
  "project": {
    "title": string,
    "goal": string,
    "purpose": string,
    "deadline": string,         // ISO 8601 datetime WITH timezone offset
    "requirements": string[],
    "constraints": string[],
    "preferences": string[],
    "successCriteria": string[]
  },
  "tasks": [
    ${TASK_SHAPE}
  ],
  "completedTitles": string[],  // EXACT titles of remaining tasks the user reported as already finished
  "note": string
}

Rules for updating the project memory:
- First decide what the user's message actually changes: project context (goal, deadline, requirements, constraints, preferences, success criteria), the remaining plan, or both. Update ONLY what the message affects; copy every other field verbatim from the input.
- The "minutes until the deadline" figure you are given is computed from the CURRENT stored deadline. If the user's message changes the deadline, update "deadline" in project and schedule the remaining plan against the NEW deadline instead of that figure.
- Preserve the user's original intention unless they explicitly change it.
- Keep the memory internally consistent: if a change makes another field's text stale (e.g. a constraint that restates the old deadline), update that text too.
- Never pretend uncertain information is known.

Rules for the remaining plan:
- "tasks" is the complete replacement for the REMAINING (not yet completed) plan only. Never include completed work — it is preserved automatically.
- Avoid rebuilding the plan unnecessarily: keep remaining tasks that are unaffected by the change (same title, estimate, reason), adjusting only their order and planned times when needed.
- If the user reports a remaining task as already finished, put its EXACT title (copied verbatim from the input) in "completedTitles" and leave it out of "tasks" — it will be moved to Done automatically. Never list the same task in both. Mention it in "note".
${PLAN_RULES}

Rules for "note":
- One or two short sentences stating exactly what changed in the memory and the plan (e.g. "Removed the calendar view from requirements; replanned the remaining 4 tasks into today's 3 available hours."). If the message changes nothing, say so.
- Same language as the user's message.`;

export function updateUser(
  message: string,
  projectJson: string,
  completedJson: string,
  pendingJson: string,
  nowIso: string,
  minutesToDeadline: number
): string {
  return `Current date and time: ${nowIso}
Minutes until the current (pre-update) deadline: ${minutesToDeadline}

Project context:
${projectJson}

Completed tasks (preserved automatically — never include these in your output):
${completedJson}

Remaining planned tasks:
${pendingJson}

The user's new message:
"""
${message}
"""

Update the project memory and the remaining plan as JSON.`;
}
