// Client-side wrappers for the AI API routes.

import type { Project, ProjectDraft, Task, TaskDraft } from "./types";

export async function extractProject(intention: string): Promise<Project> {
  const draft = await post<ProjectDraft>("/api/extract", {
    intention,
    now: nowWithOffset(),
  });
  const stamp = new Date().toISOString();
  return { ...draft, id: crypto.randomUUID(), createdAt: stamp, updatedAt: stamp };
}

export async function generatePlan(project: Project): Promise<Task[]> {
  const { tasks } = await post<{ tasks: TaskDraft[] }>("/api/plan", {
    project,
    now: nowWithOffset(),
  });
  const stamp = new Date().toISOString();
  return tasks.map((t) => ({
    ...t,
    id: crypto.randomUUID(),
    projectId: project.id,
    status: "pending" as const,
    createdAt: stamp,
  }));
}

export interface UpdateResult {
  project: Project;
  pendingTasks: Task[];
  // Existing pending tasks the user reported as finished in the update
  // message; the caller marks them completed so they move to Done.
  completedTaskIds: string[];
  note: string;
}

// "Update reality": sends the change plus current memory and task state;
// returns updated memory and the replacement remaining plan. Completed tasks
// never leave the client's task collection.
export async function applyProjectUpdate(
  message: string,
  project: Project,
  allTasks: Task[]
): Promise<UpdateResult> {
  const completed = allTasks
    .filter((t) => t.status === "completed")
    .map((t) => ({ title: t.title, estimatedMinutes: t.estimatedMinutes }));
  const pending = allTasks
    .filter((t) => t.status === "pending")
    .sort((a, b) => a.order - b.order)
    .map((t) => ({
      title: t.title,
      description: t.description,
      estimatedMinutes: t.estimatedMinutes,
      plannedStart: t.plannedStart,
      plannedEnd: t.plannedEnd,
      reason: t.reason,
    }));

  const data = await post<{
    project: ProjectDraft;
    tasks: TaskDraft[];
    completedTitles?: string[];
    note: string;
  }>("/api/update", { update: message, project, completed, pending, now: nowWithOffset() });

  const reported = (data.completedTitles ?? []).map((t) => t.trim().toLowerCase());
  const completedTaskIds = allTasks
    .filter((t) => t.status === "pending" && reported.includes(t.title.trim().toLowerCase()))
    .map((t) => t.id);

  const stamp = new Date().toISOString();
  return {
    project: { ...data.project, id: project.id, createdAt: project.createdAt, updatedAt: stamp },
    completedTaskIds,
    pendingTasks: data.tasks.map((t) => ({
      ...t,
      id: crypto.randomUUID(),
      projectId: project.id,
      status: "pending" as const,
      createdAt: stamp,
    })),
    note: data.note,
  };
}

async function post<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Network error — is the server running?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : `Request failed (${res.status})`
    );
  }
  return data as T;
}

// Local time with timezone offset (e.g. 2026-08-19T21:30:00+08:00) so the
// model can resolve "today evening"-style deadlines in the user's timezone.
function nowWithOffset(): string {
  const d = new Date();
  const pad = (n: number) => String(Math.abs(n)).padStart(2, "0");
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(off / 60))}:${pad(off % 60)}`
  );
}
