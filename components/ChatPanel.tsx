"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { applyProjectUpdate, chatWithProject } from "@/lib/ai-client";
import SearchToggle from "./SearchToggle";

// Project-aware chat below the Next Action: work on the current task without
// re-explaining the project. The transcript survives task completions and
// re-plans; durable changes detected in conversation are synced through the
// existing /api/update flow.
export default function ChatPanel() {
  const [text, setText] = useState("");
  const {
    chatMessages,
    addChatMessage,
    aiBusy,
    setAiBusy,
    setAiError,
    applyUpdateResult,
    completeTask,
  } = useAppStore();
  const project = useAppStore((s) => s.project);
  const tasks = useAppStore((s) => s.tasks);
  const [chatError, setChatError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [chatMessages.length, aiBusy]);

  const send = async () => {
    const content = text.trim();
    if (!content || aiBusy || !project) return;
    setChatError(null);
    const userMsg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content,
      createdAt: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    setText("");
    setAiBusy("chat");
    try {
      const { reply, contextUpdate } = await chatWithProject(
        [...chatMessages, userMsg],
        project,
        tasks
      );
      addChatMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        createdAt: new Date().toISOString(),
      });
      if (contextUpdate) {
        // Durable change detected: reuse the existing update flow (memory
        // diff, selective re-plan, completed-title moves, change note).
        setAiBusy("update");
        const result = await applyProjectUpdate(contextUpdate, project, tasks);
        result.completedTaskIds.forEach(completeTask);
        applyUpdateResult(result.project, result.pendingTasks, result.note);
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Chat failed. Please try again.");
      setAiError(null);
      setAiBusy(null);
      return;
    }
    setAiBusy(null);
  };

  return (
    <section className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Work on it here
        </label>
        <SearchToggle />
      </div>
      {chatMessages.length === 0 ? (
        <p className="mt-2 text-sm text-stone-400">
          Ask anything — I already know this project’s goal, constraints, and plan.
        </p>
      ) : (
        <div ref={scrollRef} className="mt-2 max-h-80 space-y-2 overflow-y-auto pr-1">
          {chatMessages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-8 whitespace-pre-wrap break-words rounded-lg bg-stone-900 px-3 py-2 text-sm text-white"
                  : "mr-8 whitespace-pre-wrap break-words rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-800"
              }
            >
              {m.content}
            </div>
          ))}
          {aiBusy === "chat" && (
            <div className="mr-8 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-400">
              Thinking…
            </div>
          )}
          {aiBusy === "update" && (
            <div className="mr-8 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 ring-1 ring-amber-200">
              Updating project memory and plan…
            </div>
          )}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm placeholder-stone-400 focus:border-stone-400 focus:outline-none"
          placeholder="e.g. “Help me define the MVP scope for this task”"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          type="button"
          onClick={send}
          disabled={!text.trim() || aiBusy !== null}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Send
        </button>
      </div>
      {chatError && <p className="mt-2 text-xs text-red-600">{chatError}</p>}
    </section>
  );
}
