import { NextResponse } from "next/server";
import { completeJson } from "@/lib/llm";
import { PLAN_SYSTEM, planUser } from "@/lib/prompts";
import { minutesBetween } from "@/lib/time";
import { coerceTaskDrafts } from "@/lib/coerce";

// LLM calls can take 20–30s; the serverless default (10s) would cut them off.
export const maxDuration = 60;

// POST { project: Project, now: string } → { tasks: TaskDraft[] }
export async function POST(req: Request) {
  let project: unknown = null;
  let now = "";
  try {
    const body = await req.json();
    project = body.project ?? null;
    now = typeof body.now === "string" ? body.now : "";
  } catch {
    // fall through to validation error
  }
  const deadline =
    project && typeof (project as Record<string, unknown>).deadline === "string"
      ? ((project as Record<string, unknown>).deadline as string)
      : "";
  if (!project || !deadline) {
    return NextResponse.json({ error: "project with a deadline is required" }, { status: 400 });
  }
  if (!now) now = new Date().toISOString();

  try {
    const raw = await completeJson(
      PLAN_SYSTEM,
      planUser(JSON.stringify(project, null, 2), now, minutesBetween(now, deadline))
    );
    const tasks = coerceTaskDrafts(raw);
    if (tasks.length === 0) {
      return NextResponse.json({ error: "AI returned no tasks. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ tasks });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Planning failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
