// Client-side wrappers for the AI API routes.

import type { Project, ProjectDraft } from "./types";

export async function extractProject(intention: string): Promise<Project> {
  const draft = await post<ProjectDraft>("/api/extract", {
    intention,
    now: nowWithOffset(),
  });
  const stamp = new Date().toISOString();
  return { ...draft, id: crypto.randomUUID(), createdAt: stamp, updatedAt: stamp };
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
