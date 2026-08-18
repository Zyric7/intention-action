"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";

// "Update reality": new requirements, constraints, or progress in natural
// language. Wired to /api/update (memory update + re-plan) on Day 2.
export default function UpdateBox() {
  const [text, setText] = useState("");
  const { aiBusy, lastChangeNote } = useAppStore();
  const setNote = useAppStore((s) => s.applyUpdateResult);
  const project = useAppStore((s) => s.project);
  const tasks = useAppStore((s) => s.tasks);

  const submit = () => {
    if (!text.trim() || aiBusy || !project) return;
    // Step 2 stub — real AI update + re-plan lands on Day 2.
    setNote(
      project,
      tasks.filter((t) => t.status === "pending"),
      `Noted: “${text.trim()}” — memory update and re-planning will be wired on Day 2.`
    );
    setText("");
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
      {lastChangeNote && (
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
          {lastChangeNote}
        </p>
      )}
    </section>
  );
}
