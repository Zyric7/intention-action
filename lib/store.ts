import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { AiOperation, ChatMessage, Phase, Project, Task } from "./types";

interface AppState {
  phase: Phase;
  // AI's interpretation awaiting user confirmation (phase: "confirm").
  // Persisted alongside phase so a refresh mid-confirm cannot restore the
  // phase while losing the draft the user is supposed to confirm.
  draftProject: Project | null;
  // Confirmed project — the single authoritative project memory.
  project: Project | null;
  tasks: Task[];
  // AI's one-line summary of what the last context update changed (transient).
  lastChangeNote: string | null;
  // Project-aware chat transcript. Continuous across task changes; only a
  // full reset clears it. Conversation, not memory.
  chatMessages: ChatMessage[];
  aiBusy: AiOperation | null;
  aiError: string | null;

  setDraftProject: (draft: Project) => void;
  editDraftProject: (patch: Partial<Project>) => void;
  confirmDraft: () => void;
  editProject: (patch: Partial<Project>) => void;
  setTasks: (tasks: Task[]) => void;
  completeTask: (id: string) => void;
  reopenTask: (id: string) => void;
  // Applies an /api/update result: replaces project memory and all pending
  // tasks; completed tasks are always preserved untouched.
  applyUpdateResult: (project: Project, pendingTasks: Task[], note: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setAiBusy: (op: AiOperation | null) => void;
  setAiError: (message: string | null) => void;
  reset: () => void;
}

const nowIso = () => new Date().toISOString();

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      phase: "intention",
      draftProject: null,
      project: null,
      tasks: [],
      lastChangeNote: null,
      chatMessages: [],
      aiBusy: null,
      aiError: null,

      setDraftProject: (draft) =>
        set({ draftProject: draft, phase: "confirm", aiError: null }),

      editDraftProject: (patch) =>
        set((s) =>
          s.draftProject
            ? { draftProject: { ...s.draftProject, ...patch, updatedAt: nowIso() } }
            : s
        ),

      confirmDraft: () =>
        set((s) =>
          s.draftProject
            ? {
                project: { ...s.draftProject, updatedAt: nowIso() },
                draftProject: null,
                phase: "working",
              }
            : s
        ),

      editProject: (patch) =>
        set((s) =>
          s.project
            ? { project: { ...s.project, ...patch, updatedAt: nowIso() } }
            : s
        ),

      setTasks: (tasks) => set({ tasks }),

      completeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status: "completed", completedAt: nowIso() } : t
          ),
        })),

      reopenTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status: "pending", completedAt: undefined } : t
          ),
        })),

      applyUpdateResult: (project, pendingTasks, note) =>
        set((s) => ({
          project,
          tasks: [...s.tasks.filter((t) => t.status === "completed"), ...pendingTasks],
          lastChangeNote: note,
        })),

      // Cap the stored transcript so prompts and localStorage stay bounded.
      addChatMessage: (msg) =>
        set((s) => ({ chatMessages: [...s.chatMessages, msg].slice(-60) })),

      setAiBusy: (op) => set({ aiBusy: op, ...(op ? { aiError: null } : {}) }),

      setAiError: (message) => set({ aiError: message, aiBusy: null }),

      reset: () =>
        set({
          phase: "intention",
          draftProject: null,
          project: null,
          tasks: [],
          lastChangeNote: null,
          chatMessages: [],
          aiBusy: null,
          aiError: null,
        }),
    }),
    {
      name: "intention-action-v1",
      partialize: (s) => ({
        phase: s.phase,
        draftProject: s.draftProject,
        project: s.project,
        tasks: s.tasks,
        chatMessages: s.chatMessages,
      }),
    }
  )
);

// Derived selectors — Todo, Done, and Next Action are views of the same
// task collection (one source of truth, no copies).
export const selectTodo = (tasks: Task[]) =>
  tasks.filter((t) => t.status === "pending").sort((a, b) => a.order - b.order);

export const selectDone = (tasks: Task[]) =>
  tasks
    .filter((t) => t.status === "completed")
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));

export const selectNextAction = (tasks: Task[]): Task | null =>
  selectTodo(tasks)[0] ?? null;

// SSR renders the default (empty) state; persisted state only exists in the
// browser. Components that render persisted values should wait for hydration
// to avoid a server/client mismatch.
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
