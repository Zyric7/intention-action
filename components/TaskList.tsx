"use client";

import type { Task } from "@/lib/types";
import { completedWorkMinutes, dayLabel, formatMinutes, formatTimeRange } from "@/lib/time";

// Todo and Done: two filtered views of the same task collection.

export function TodoList({
  tasks,
  onComplete,
}: {
  tasks: Task[]; // pending, ordered; first item is the Next Action shown above
  onComplete: (id: string) => void;
}) {
  const groups = groupByDay(tasks);
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Todo</h2>
      {tasks.length === 0 && (
        <p className="mt-2 text-sm text-stone-400">No open tasks.</p>
      )}
      <div className="mt-2 space-y-4">
        {groups.map(([day, dayTasks]) => (
          <div key={day}>
            <h3 className="text-xs font-medium text-stone-400">{day}</h3>
            <ul className="mt-1 space-y-1.5">
              {dayTasks.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 ring-1 ring-stone-200"
                >
                  <button
                    type="button"
                    aria-label={`Mark ${t.title} as done`}
                    onClick={() => onComplete(t.id)}
                    className="h-4 w-4 shrink-0 rounded-full border border-stone-300 transition-colors hover:border-emerald-500 hover:bg-emerald-50"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-stone-400">
                      {formatTimeRange(t.plannedStart, t.plannedEnd)}
                      {t.plannedStart && " · "}
                      {formatMinutes(t.estimatedMinutes)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DoneList({
  tasks,
  onReopen,
}: {
  tasks: Task[]; // completed, most recent first
  onReopen: (id: string) => void;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Done</h2>
      {tasks.length === 0 ? (
        <p className="mt-2 text-sm text-stone-400">Nothing completed yet.</p>
      ) : (
        <>
          <ul className="mt-2 space-y-1.5">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-lg bg-stone-100 px-3 py-2.5"
              >
                <button
                  type="button"
                  aria-label={`Reopen ${t.title}`}
                  title="Reopen"
                  onClick={() => onReopen(t.id)}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white"
                >
                  ✓
                </button>
                <p className="flex-1 truncate text-sm text-stone-500 line-through decoration-stone-300">
                  {t.title}
                </p>
                {t.completedAt && (
                  <span className="text-xs text-stone-400">
                    {dayLabel(t.completedAt)}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-stone-400">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} completed ·{" "}
            {formatMinutes(completedWorkMinutes(tasks))} estimated work completed
          </p>
        </>
      )}
    </section>
  );
}

function groupByDay(tasks: Task[]): Array<[string, Task[]]> {
  const groups: Array<[string, Task[]]> = [];
  for (const t of tasks) {
    const day = t.plannedStart ? dayLabel(t.plannedStart) : "Unscheduled";
    const last = groups[groups.length - 1];
    if (last && last[0] === day) last[1].push(t);
    else groups.push([day, [t]]);
  }
  return groups;
}
