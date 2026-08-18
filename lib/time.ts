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
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);
}

export function completedWorkMinutes(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);
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
