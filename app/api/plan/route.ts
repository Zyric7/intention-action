import { NextResponse } from "next/server";
import { completeJson } from "@/lib/llm";
import { PLAN_SYSTEM, planUser } from "@/lib/prompts";
import { minutesBetween } from "@/lib/time";
import type { TaskDraft } from "@/lib/types";

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
    const tasks = coerceTasks(raw);
    if (tasks.length === 0) {
      return NextResponse.json({ error: "AI returned no tasks. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ tasks });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Planning failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function coerceTasks(raw: unknown): TaskDraft[] {
  const arr = (raw as Record<string, unknown>)?.tasks;
  if (!Array.isArray(arr)) return [];
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const iso = (v: unknown) => {
    const s = str(v);
    return s && !isNaN(new Date(s).getTime()) ? s : undefined;
  };
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
        estimatedMinutes: Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : 30,
        plannedStart: iso(o.plannedStart),
        plannedEnd: iso(o.plannedEnd),
        reason: str(o.reason) || undefined,
      };
    })
    .filter((t): t is TaskDraft => t !== null);
}
