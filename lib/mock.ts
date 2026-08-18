// Mock AI responses for the Step 2 UI shell.
// These have the exact shapes the real /api routes return, so Steps 3–4
// only swap the implementation behind lib/ai-client.ts.

import type { Project, Task } from "./types";

const uid = () => crypto.randomUUID();

export async function mockExtract(intention: string): Promise<Project> {
  await sleep(700);
  const now = new Date();
  const deadline = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const stamp = now.toISOString();
  return {
    id: uid(),
    title: "AI Product Builder Demo",
    goal: intention.trim() || "Build a working AI action planning demo",
    purpose: "Demonstrate turning intention into action",
    deadline: deadline.toISOString(),
    requirements: [
      "Todo view",
      "Done view",
      "Persistent project context",
      "AI-generated realistic action plan",
    ],
    constraints: ["Achievable within two days", "Web application", "No authentication"],
    preferences: ["Simple interaction", "AI should reduce manual planning"],
    successCriteria: [
      "User can describe a vague goal",
      "System creates an actionable plan",
      "System always provides a clear next action",
    ],
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export async function mockPlan(project: Project): Promise<Task[]> {
  await sleep(700);
  const stamp = new Date().toISOString();
  // Sequential planned times: remaining of today, then tomorrow from 10:00.
  let cursor = nextHalfHour(new Date());
  const tomorrow10 = new Date(cursor);
  tomorrow10.setDate(tomorrow10.getDate() + 1);
  tomorrow10.setHours(10, 0, 0, 0);

  const spec: Array<[title: string, minutes: number, reason: string, day: "today" | "tomorrow"]> = [
    ["Define the Project and Task data models", 25, "The planning system depends on a stable representation of the goal and constraints.", "today"],
    ["Build project state and persistence", 45, "Every later feature reads and writes this single store.", "today"],
    ["Implement AI intention extraction", 90, "This is the core intention-to-structure step the demo must prove.", "today"],
    ["Build the Todo and Done flow", 60, "Execution tracking closes the loop from plan to progress.", "tomorrow"],
    ["Implement re-planning on new information", 90, "Adapting the plan is the second half of the core loop.", "tomorrow"],
    ["Polish and run the full demo scenario", 60, "The end-to-end walkthrough is the success criterion.", "tomorrow"],
  ];

  return spec.map(([title, minutes, reason, day], i) => {
    if (day === "tomorrow" && cursor < tomorrow10) cursor = new Date(tomorrow10);
    const start = new Date(cursor);
    const end = new Date(start.getTime() + minutes * 60000);
    cursor = new Date(end.getTime() + 15 * 60000); // 15 min break between tasks
    return {
      id: uid(),
      projectId: project.id,
      title,
      status: "pending" as const,
      order: i,
      estimatedMinutes: minutes,
      plannedStart: start.toISOString(),
      plannedEnd: end.toISOString(),
      reason,
      createdAt: stamp,
    };
  });
}

function nextHalfHour(d: Date): Date {
  const r = new Date(d);
  r.setSeconds(0, 0);
  r.setMinutes(r.getMinutes() + 30 - (r.getMinutes() % 30));
  return r;
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
