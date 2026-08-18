import { NextResponse } from "next/server";
import { completeJson } from "@/lib/llm";
import { EXTRACT_SYSTEM, extractUser } from "@/lib/prompts";
import type { ProjectDraft } from "@/lib/types";

// POST { intention: string, now: string } → ProjectDraft
export async function POST(req: Request) {
  let intention = "";
  let now = "";
  try {
    const body = await req.json();
    intention = typeof body.intention === "string" ? body.intention.trim() : "";
    now = typeof body.now === "string" ? body.now : "";
  } catch {
    // fall through to validation error
  }
  if (!intention) {
    return NextResponse.json({ error: "intention is required" }, { status: 400 });
  }
  if (!now) now = new Date().toISOString();

  try {
    const raw = await completeJson(EXTRACT_SYSTEM, extractUser(intention, now));
    return NextResponse.json(coerceDraft(raw, now));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

// Defensive coercion: the model is instructed to match the shape, but the UI
// must never receive a malformed Project.
function coerceDraft(raw: unknown, nowIso: string): ProjectDraft {
  const o = (raw ?? {}) as Record<string, unknown>;
  const str = (v: unknown, fallback = "") => (typeof v === "string" ? v.trim() : fallback);
  const list = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];

  let deadline = str(o.deadline);
  if (isNaN(new Date(deadline).getTime())) {
    deadline = new Date(new Date(nowIso).getTime() + 48 * 60 * 60 * 1000).toISOString();
  }

  return {
    title: str(o.title, "Untitled project"),
    goal: str(o.goal),
    purpose: str(o.purpose) || undefined,
    deadline,
    requirements: list(o.requirements),
    constraints: list(o.constraints),
    preferences: list(o.preferences),
    successCriteria: list(o.successCriteria),
  };
}
