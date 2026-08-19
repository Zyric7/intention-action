import { NextResponse } from "next/server";
import { completeJson } from "@/lib/llm";
import { EXTRACT_SYSTEM, extractUser } from "@/lib/prompts";
import { coerceProjectDraft } from "@/lib/coerce";

// LLM calls can take 20–30s; the serverless default (10s) would cut them off.
export const maxDuration = 60;

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
    const fallbackDeadline = new Date(new Date(now).getTime() + 48 * 60 * 60 * 1000).toISOString();
    return NextResponse.json(coerceProjectDraft(raw, fallbackDeadline));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
