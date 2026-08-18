"use client";

import {
  selectDone,
  selectNextAction,
  selectTodo,
  useAppStore,
  useHasHydrated,
} from "@/lib/store";
import { assessFeasibility, formatDeadline, formatMinutes } from "@/lib/time";
import { generatePlan } from "@/lib/ai-client";
import IntentionInput from "@/components/IntentionInput";
import ProjectEditor from "@/components/ProjectEditor";
import NextAction from "@/components/NextAction";
import { DoneList, TodoList } from "@/components/TaskList";
import UpdateBox from "@/components/UpdateBox";

export default function Home() {
  const hydrated = useHasHydrated();
  const phase = useAppStore((s) => s.phase);

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center text-stone-400">
        Loading…
      </main>
    );
  }

  if (phase === "intention") return <IntentionInput />;
  if (phase === "confirm") return <ConfirmScreen />;
  return <WorkScreen />;
}

// Phase 2: show the AI's interpretation; the user is the final source of truth.
function ConfirmScreen() {
  const draft = useAppStore((s) => s.draftProject);
  const { editDraftProject, confirmDraft, setTasks, setAiBusy, setAiError, aiBusy, aiError, reset } =
    useAppStore();

  if (!draft) {
    // Defensive: should not happen since draftProject is persisted with phase.
    return <IntentionInput />;
  }

  const confirm = async () => {
    if (aiBusy) return;
    setAiBusy("plan");
    try {
      const tasks = await generatePlan(draft);
      confirmDraft();
      setTasks(tasks);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Planning failed. Please try again.");
      return;
    }
    setAiBusy(null);
  };

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Here’s what I understood
      </h1>
      <p className="mt-1 text-stone-500">
        Correct anything that’s wrong — then I’ll build a realistic plan.
      </p>

      <div className="mt-6 rounded-2xl bg-stone-100 p-6">
        <ProjectEditor project={draft} onEdit={editDraftProject} />
      </div>

      {aiError && <p className="mt-3 text-sm text-red-600">{aiError}</p>}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={reset}
          className="text-sm text-stone-400 hover:text-stone-600"
        >
          Start over
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={aiBusy !== null}
          className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {aiBusy === "plan" ? "Building your plan…" : "Looks right — build my plan"}
        </button>
      </div>
    </main>
  );
}

// Phase 3: the working loop — Next Action, Todo, Done, updates, project memory.
function WorkScreen() {
  const project = useAppStore((s) => s.project);
  const tasks = useAppStore((s) => s.tasks);
  const { completeTask, reopenTask, editProject, reset } = useAppStore();

  if (!project) return <IntentionInput />;

  const todo = selectTodo(tasks);
  const next = selectNextAction(tasks);
  const done = selectDone(tasks);
  const feasibility = assessFeasibility(project.deadline, tasks, new Date().toISOString());

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{project.title}</h1>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Start over? This clears the current project and plan.")) reset();
          }}
          className="text-sm text-stone-400 hover:text-stone-600"
        >
          Start over
        </button>
      </header>

      <p
        className={`mt-1 text-sm ${feasibility.fits ? "text-stone-500" : "text-red-600"}`}
      >
        Deadline {formatDeadline(project.deadline)} ·{" "}
        {formatMinutes(feasibility.pendingMinutes)} of work planned,{" "}
        {formatMinutes(feasibility.minutesToDeadline)} until deadline
        {feasibility.fits ? "" : " — this plan does not fit. Update it below."}
      </p>

      {/* minmax(0,1fr) + min-w-0: long unbroken task text must wrap, not
          stretch the track and break the page proportions. */}
      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <NextAction task={next} onComplete={completeTask} />
          <UpdateBox />
          {/* Next Action is todo[0]; the list below shows what comes after. */}
          <TodoList tasks={todo.slice(1)} onComplete={completeTask} />
          <DoneList tasks={done} onReopen={reopenTask} />
        </div>

        <aside className="rounded-2xl bg-stone-100 p-5 md:sticky md:top-8 md:self-start">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
            Project memory
          </h2>
          <p className="mt-1 text-xs text-stone-400">
            What I currently understand. Edit anything — future plans respect it.
          </p>
          <div className="mt-4">
            <ProjectEditor project={project} onEdit={editProject} compact />
          </div>
        </aside>
      </div>
    </main>
  );
}
