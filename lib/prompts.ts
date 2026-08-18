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

export const PLAN_SYSTEM = `You turn a structured project context into a realistic, executable action plan.

Return ONLY a JSON object with exactly this shape:
{
  "tasks": [
    {
      "title": string,           // specific, small enough to start immediately
      "description": string,     // one sentence of concrete guidance ("" if the title says it all)
      "estimatedMinutes": number,
      "plannedStart": string,    // ISO 8601 datetime WITH timezone offset
      "plannedEnd": string,      // plannedStart + estimatedMinutes
      "reason": string           // short, useful: why this task, why in this position
    }
  ]
}

Rules:
- REALITY OVER IDEAL PLANS. Generate the most useful achievable plan, not the most complete one. Prefer fewer, clearer tasks — usually 4 to 8. Never pad with unnecessary work.
- The total estimated time must fit comfortably between now and the deadline: leave at least 20% slack, and only schedule within plausible waking hours (roughly 09:00–23:00 local time) unless the deadline forces otherwise.
- If everything the project asks for cannot realistically fit, cut or shrink the least essential items and say what you dropped in the affected task's "reason" or by omission — do not compress estimates to pretend it fits.
- Order tasks by execution order, respecting dependencies. The FIRST task is the user's next action: make it concrete, small (≤45 minutes if possible), and startable right now.
- Planned times must be sequential and non-overlapping, starting no earlier than now, with short breaks between tasks.
- Respect every requirement, constraint, and preference in the project context.
- Estimates should be honest, not optimistic.
- Write all text in the same language as the project context.`;

export function planUser(projectJson: string, nowIso: string, minutesToDeadline: number): string {
  return `Current date and time: ${nowIso}
Minutes until the deadline: ${minutesToDeadline}

Project context:
${projectJson}

Generate the realistic action plan as JSON.`;
}
