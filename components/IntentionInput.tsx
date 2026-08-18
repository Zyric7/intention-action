"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { extractProject } from "@/lib/ai-client";

// Phase 1: the user describes what they want to achieve in natural language.
export default function IntentionInput() {
  const [text, setText] = useState("");
  const { setDraftProject, setAiBusy, setAiError, aiBusy, aiError } = useAppStore();

  const submit = async () => {
    if (!text.trim() || aiBusy) return;
    setAiBusy("extract");
    try {
      const draft = await extractProject(text);
      setDraftProject(draft);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      return;
    }
    setAiBusy(null);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center p-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        What are you trying to accomplish?
      </h1>
      <p className="mt-2 text-stone-500">
        Describe it naturally — goal, deadline, must-haves, limits. I’ll help you
        figure out what to do next.
      </p>

      <textarea
        autoFocus
        rows={5}
        className="mt-6 w-full resize-none rounded-xl border border-stone-200 bg-white p-4 text-base shadow-sm placeholder-stone-400 focus:border-stone-400 focus:outline-none"
        placeholder="I want to build a working AI Product Builder demo within two days. It should include Todo and Done, remember my requirements…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
      />

      {aiError && <p className="mt-3 text-sm text-red-600">{aiError}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={!text.trim() || aiBusy !== null}
        className="mt-4 self-end rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
      >
        {aiBusy === "extract" ? "Understanding…" : "Turn this into a plan"}
      </button>
    </main>
  );
}
