"use client";

import { useAppStore, useHasHydrated } from "@/lib/store";

// Placeholder page — Step 2 replaces this with the real UI shell.
// It exercises the store + persistence so the scaffold is verifiable.
export default function Home() {
  const hydrated = useHasHydrated();
  const phase = useAppStore((s) => s.phase);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Intention Action</h1>
      <p className="mt-2 text-stone-500">
        Scaffold ready. {hydrated ? `Current phase: ${phase}` : "Loading…"}
      </p>
    </main>
  );
}
