"use client";

import { useAppStore } from "@/lib/store";

// User-controlled Web Search switch. When on, AI requests may use web search
// for current information; when off, behavior is unchanged. The user decides —
// there is no automatic routing.
export default function SearchToggle() {
  const on = useAppStore((s) => s.webSearch);
  const toggle = useAppStore((s) => s.toggleWebSearch);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      title="When on, AI requests may use web search for current information."
      className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
        on
          ? "border-stone-900 bg-stone-900 text-white"
          : "border-stone-200 text-stone-400 hover:text-stone-600"
      }`}
    >
      Web search: {on ? "On" : "Off"}
    </button>
  );
}
