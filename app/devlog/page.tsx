import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Development Log — Intention Action" };

// Lightweight in-app view of DEVLOG.md. Read server-side; rendered with a
// minimal line-based converter (headings, bullets, paragraphs) — no deps.
export default function DevlogPage() {
  const md = fs.readFileSync(path.join(process.cwd(), "DEVLOG.md"), "utf8");
  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/" className="text-sm text-stone-400 hover:text-stone-600">
        ← Back to the app
      </Link>
      <article className="mt-4">{renderMarkdownLite(md)}</article>
    </main>
  );
}

function renderMarkdownLite(md: string) {
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={blocks.length} className="mb-4 list-disc space-y-2 pl-5 text-sm text-stone-700">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      );
      bullets = [];
    }
  };

  for (const rawLine of md.split("\n")) {
    const line = rawLine.trimEnd();
    if (line.startsWith("- ") || line.startsWith("  ")) {
      // New bullet, or a wrapped continuation of the previous one.
      if (line.startsWith("- ")) bullets.push(line.slice(2));
      else if (bullets.length) bullets[bullets.length - 1] += " " + line.trim();
      continue;
    }
    flush();
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={blocks.length} className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wider text-stone-500">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={blocks.length} className="text-2xl font-semibold tracking-tight">
          {line.slice(2)}
        </h1>
      );
    } else if (line !== "") {
      blocks.push(
        <p key={blocks.length} className="mb-2 text-sm text-stone-500">
          {line}
        </p>
      );
    }
  }
  flush();
  return blocks;
}
