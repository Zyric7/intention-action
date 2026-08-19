// Single source of truth for the two core entities (see PRODUCT.md "Core Data Model").

export interface Project {
  id: string;
  title: string;
  goal: string;
  purpose?: string;
  // Optional: only when the user provides or clearly implies one. The system
  // must never invent a deadline (PRODUCT.md: Time System).
  deadline?: string; // ISO datetime
  requirements: string[];
  constraints: string[];
  preferences: string[];
  successCriteria: string[];
  createdAt: string;
  updatedAt: string;
}

// What AI extraction produces; the client adds id and timestamps.
export type ProjectDraft = Omit<Project, "id" | "createdAt" | "updatedAt">;

export type TaskStatus = "pending" | "completed";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  // AI-assigned execution order; the first pending task by order is the Next Action.
  order: number;
  estimatedMinutes?: number; // rough, only when meaningful — no fallback value
  plannedStart?: string; // ISO datetime, only for time-bound projects
  plannedEnd?: string;
  reason?: string;
  createdAt: string;
  completedAt?: string;
}

// What AI planning produces; the client adds id, projectId, status, createdAt.
export type TaskDraft = Omit<Task, "id" | "projectId" | "status" | "createdAt" | "completedAt">;

// App phases: intention input → confirm AI understanding → working loop.
export type Phase = "intention" | "confirm" | "working";

export type AiOperation = "extract" | "plan" | "update" | "chat";

// Project-aware chat below the Next Action. The transcript is conversation,
// not memory — the Project object stays the single source of truth.
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
