"use client";

import type { Task } from "@/lib/types";
import { formatMinutes, formatTimeRange, dayLabel } from "@/lib/time";

// The most visually important element: "Do this now."
export default function NextAction({
  task,
  onComplete,
}: {
  task: Task | null;
  onComplete: (id: string) => void;
}) {
  if (!task) {
    return (
      <section className="rounded-2xl bg-emerald-50 p-6 ring-1 ring-emerald-200">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Do this now
        </h2>
        <p className="mt-2 text-lg font-medium text-emerald-900">
          Everything is done. 🎉
        </p>
        <p className="mt-1 text-sm text-emerald-700">
          Add new information below if the project isn’t finished yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-stone-900 p-6 text-white shadow-lg">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
        Do this now
      </h2>
      <p className="mt-2 break-words text-xl font-semibold">{task.title}</p>
      <p className="mt-1 text-sm text-stone-300">
        {formatMinutes(task.estimatedMinutes)}
        {task.plannedStart && (
          <>
            {" · "}
            {dayLabel(task.plannedStart)} {formatTimeRange(task.plannedStart, task.plannedEnd)}
          </>
        )}
      </p>
      {task.reason && (
        <p className="mt-3 break-words border-l-2 border-stone-600 pl-3 text-sm text-stone-300">
          {task.reason}
        </p>
      )}
      <button
        type="button"
        onClick={() => onComplete(task.id)}
        className="mt-5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100"
      >
        Mark as done
      </button>
    </section>
  );
}
