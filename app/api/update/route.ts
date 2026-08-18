import { NextResponse } from "next/server";
import { completeJson } from "@/lib/llm";
import { UPDATE_SYSTEM, updateUser } from "@/lib/prompts";
import { minutesBetween } from "@/lib/time";
import { coerceTaskDrafts, mergeProjectUpdate } from "@/lib/coerce";
import type { Project } from "@/lib/types";

// POST { update: string, project: Project, completed: [], pending: [], now: string }
//   → { project: ProjectDraft, tasks: TaskDraft[], note: string }
export async function POST(req: Request) {
  let update = "";
  let project: Project | null = null;
  let completed: unknown = [];
  let pending: unknown = [];
  let now = "";
  try {
    const body = await req.json();
    update = typeof body.update === "string" ? body.update.trim() : "";
    project = body.project ?? null;
    completed = Array.isArray(body.completed) ? body.completed : [];
    pending = Array.isArray(body.pending) ? body.pending : [];
    now = typeof body.now === "string" ? body.now : "";
  } catch {
    // fall through to validation error
  }
  if (!update || !project || typeof project.deadline !== "string") {
    return NextResponse.json(
      { error: "update message and project with a deadline are required" },
      { status: 400 }
    );
  }
  if (!now) now = new Date().toISOString();

  try {
    const raw = (await completeJson(
      UPDATE_SYSTEM,
      updateUser(
        update,
        JSON.stringify(project, null, 2),
        JSON.stringify(completed, null, 2),
        JSON.stringify(pending, null, 2),
        now,
        minutesBetween(now, project.deadline)
      )
    )) as Record<string, unknown>;

    const merged = mergeProjectUpdate(project, raw?.project);
    // The re-planned schedule must respect an updated deadline, so merge first,
    // then coerce tasks independently of it.
    const tasks = coerceTaskDrafts(raw?.tasks);
    const note =
      typeof raw?.note === "string" && raw.note.trim()
        ? raw.note.trim()
        : "Project memory and plan updated.";
    return NextResponse.json({ project: merged, tasks, note });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
