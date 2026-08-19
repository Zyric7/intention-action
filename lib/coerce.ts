// Defensive coercion of AI output. The model is instructed to match the
// shapes, but the UI must never receive malformed data.

import type { Project, ProjectDraft, TaskDraft } from "./types";

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v.trim() : fallback);
const list = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : null;

export const coerceStringList = (v: unknown): string[] => list(v) ?? [];
const validIso = (v: unknown) => {
  const s = str(v);
  return s && !isNaN(new Date(s).getTime()) ? s : null;
};

// For /api/extract: coerce a fresh extraction. No deadline fallback — the
// system must never invent a deadline the user didn't provide or imply.
export function coerceProjectDraft(raw: unknown): ProjectDraft {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    title: str(o.title, "Untitled project"),
    goal: str(o.goal),
    purpose: str(o.purpose) || undefined,
    deadline: validIso(o.deadline) ?? undefined,
    requirements: list(o.requirements) ?? [],
    constraints: list(o.constraints) ?? [],
    preferences: list(o.preferences) ?? [],
    successCriteria: list(o.successCriteria) ?? [],
  };
}

// For /api/update: field-wise merge so a missing or malformed field in the
// AI response keeps the existing memory instead of wiping it. A present,
// valid field (including a deliberately empty list) replaces the old value.
export function mergeProjectUpdate(existing: Project, raw: unknown): ProjectDraft {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    title: str(o.title) || existing.title,
    goal: str(o.goal) || existing.goal,
    purpose: o.purpose === undefined ? existing.purpose : str(o.purpose) || undefined,
    // Explicit null or "" removes an existing deadline; a valid ISO replaces
    // it; anything else (absent/garbled) keeps what the user already had.
    deadline:
      o.deadline === null || o.deadline === ""
        ? undefined
        : validIso(o.deadline) ?? existing.deadline,
    requirements: list(o.requirements) ?? existing.requirements,
    constraints: list(o.constraints) ?? existing.constraints,
    preferences: list(o.preferences) ?? existing.preferences,
    successCriteria: list(o.successCriteria) ?? existing.successCriteria,
  };
}

// For /api/plan and /api/update: coerce the task array; order by position.
export function coerceTaskDrafts(raw: unknown): TaskDraft[] {
  const arr = Array.isArray(raw) ? raw : (raw as Record<string, unknown>)?.tasks;
  if (!Array.isArray(arr)) return [];
  return arr
    .map((t, i): TaskDraft | null => {
      const o = (t ?? {}) as Record<string, unknown>;
      const title = str(o.title);
      if (!title) return null;
      const minutes = Number(o.estimatedMinutes);
      return {
        title,
        description: str(o.description) || undefined,
        order: i,
        stage: str(o.stage) || undefined,
        // Genuinely optional — no fallback value; absent means "no estimate".
        estimatedMinutes:
          Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : undefined,
        plannedStart: validIso(o.plannedStart) ?? undefined,
        plannedEnd: validIso(o.plannedEnd) ?? undefined,
        reason: str(o.reason) || undefined,
      };
    })
    .filter((t): t is TaskDraft => t !== null);
}
