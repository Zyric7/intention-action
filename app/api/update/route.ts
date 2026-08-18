import { NextResponse } from "next/server";
import { completeJson } from "@/lib/llm";
import { UPDATE_SYSTEM, updateUser } from "@/lib/prompts";
import { minutesBetween } from "@/lib/time";
import { coerceStringList, coerceTaskDrafts, mergeProjectUpdate } from "@/lib/coerce";
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

    // A malformed remaining plan must fail loudly, not silently erase pending
    // tasks. An explicit empty array is a valid "nothing left to do".
    const rawTasks = raw?.tasks;
    if (!Array.isArray(rawTasks)) {
      return NextResponse.json(
        { error: "AI returned a malformed plan; nothing was changed. Please try again." },
        { status: 502 }
      );
    }
    const tasks = coerceTaskDrafts(rawTasks);
    if (rawTasks.length > 0 && tasks.length === 0) {
      return NextResponse.json(
        { error: "AI returned a malformed plan; nothing was changed. Please try again." },
        { status: 502 }
      );
    }

    const merged = mergeProjectUpdate(project, raw?.project);
    const completedTitles = coerceStringList(raw?.completedTitles);
    const note =
      typeof raw?.note === "string" && raw.note.trim()
        ? raw.note.trim()
        : "Project memory and plan updated.";
    return NextResponse.json({ project: merged, tasks, completedTitles, note });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
