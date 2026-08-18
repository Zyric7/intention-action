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
