// Single source of truth for the two core entities (see PRODUCT.md "Core Data Model").

export interface Project {
  id: string;
  title: string;
  goal: string;
  purpose?: string;
  deadline: string; // ISO datetime
  requirements: string[];
  constraints: string[];
  preferences: string[];
  successCriteria: string[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "pending" | "completed";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  // AI-assigned execution order; the first pending task by order is the Next Action.
  order: number;
  estimatedMinutes: number;
  plannedStart?: string; // ISO datetime, AI-suggested, display-only
  plannedEnd?: string;
  reason?: string;
  createdAt: string;
  completedAt?: string;
}

// App phases: intention input → confirm AI understanding → working loop.
export type Phase = "intention" | "confirm" | "working";

export type AiOperation = "extract" | "plan" | "update";
