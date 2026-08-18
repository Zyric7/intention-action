"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { applyProjectUpdate } from "@/lib/ai-client";

// "Update reality": new requirements, constraints, or progress in natural
// language → project memory updates and the remaining plan is regenerated.
// Completed tasks are always preserved.
export default function UpdateBox() {
  const [text, setText] = useState("");
  const { aiBusy, aiError, lastChangeNote, setAiBusy, setAiError, applyUpdateResult } =
    useAppStore();
  const project = useAppStore((s) => s.project);
  const tasks = useAppStore((s) => s.tasks);

  const submit = async () => {
    if (!text.trim() || aiBusy || !project) return;
    setAiBusy("update");
    try {
      const result = await applyProjectUpdate(text.trim(), project, tasks);
      applyUpdateResult(result.project, result.pendingTasks, result.note);
      setText("");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Update failed. Please try again.");
      return;
    }
    setAiBusy(null);
  };

  return (
    <section className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
      <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        Something changed?
      </label>
      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm placeholder-stone-400 focus:border-stone-400 focus:outline-none"
          placeholder="“Remove calendar from the MVP” · “I only have 3 hours left today”"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          disabled={aiBusy === "update"}
        />
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || aiBusy !== null}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {aiBusy === "update" ? "Re-planning…" : "Update plan"}
        </button>
      </div>
      {aiError && <p className="mt-2 text-xs text-red-600">{aiError}</p>}
      {lastChangeNote && !aiError && (
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
          {lastChangeNote}
        </p>
      )}
    </section>
  );
}
