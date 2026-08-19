import type { Task } from "./types";

export function minutesBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.round(ms / 60000);
}

export function minutesUntilDeadline(deadlineIso: string, nowIso: string): number {
  return minutesBetween(nowIso, deadlineIso);
}

export function pendingWorkMinutes(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);
}

export function completedWorkMinutes(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);
}

export function formatMinutes(totalMinutes: number): string {
  const abs = Math.abs(Math.round(totalMinutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const sign = totalMinutes < 0 ? "-" : "";
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}

const pad = (n: number) => String(n).padStart(2, "0");

// For <input type="datetime-local"> round-tripping.
export function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function localInputToIso(value: string): string {
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}

export function formatClock(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatTimeRange(startIso?: string, endIso?: string): string {
  if (!startIso) return "";
  const start = formatClock(startIso);
  const end = endIso ? formatClock(endIso) : "";
  return end ? `${start}–${end}` : start;
}

export function formatDeadline(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${dayLabel(iso)} ${formatClock(iso)}`;
}

// "Today", "Tomorrow", or a short local date.
export function dayLabel(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(d) - startOfDay(now)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export interface Feasibility {
  minutesToDeadline: number;
  pendingMinutes: number;
  fits: boolean;
}

// Answers PRODUCT.md's time-system question: "Can this plan actually fit before the deadline?"
export function assessFeasibility(
  deadlineIso: string,
  tasks: Task[],
  nowIso: string
): Feasibility {
  const minutesToDeadline = minutesUntilDeadline(deadlineIso, nowIso);
  const pendingMinutes = pendingWorkMinutes(tasks);
  return { minutesToDeadline, pendingMinutes, fits: pendingMinutes <= minutesToDeadline };
}
