import { NextResponse } from "next/server";
import { completeJson, type LlmMessage } from "@/lib/llm";
import { chatContext } from "@/lib/prompts";
import { minutesBetween } from "@/lib/time";
import type { Project } from "@/lib/types";

// LLM calls can take 20–30s; the serverless default (10s) would cut them off.
export const maxDuration = 60;

// POST { messages, project, nextAction, pendingTitles, completedTitles, now }
//   → { reply: string, contextUpdate: string }
export async function POST(req: Request) {
  let messages: LlmMessage[] = [];
  let project: Project | null = null;
  let nextAction: unknown = null;
  let pendingTitles: string[] = [];
  let completedTitles: string[] = [];
  let now = "";
  try {
    const body = await req.json();
    messages = Array.isArray(body.messages)
      ? body.messages
          .filter(
            (m: unknown): m is LlmMessage =>
              !!m &&
              typeof (m as LlmMessage).content === "string" &&
              ((m as LlmMessage).role === "user" || (m as LlmMessage).role === "assistant")
          )
          .slice(-20)
          .map((m: LlmMessage) => ({ role: m.role, content: m.content }))
      : [];
    project = body.project ?? null;
    nextAction = body.nextAction ?? null;
    pendingTitles = Array.isArray(body.pendingTitles)
      ? body.pendingTitles.filter((t: unknown): t is string => typeof t === "string")
      : [];
    completedTitles = Array.isArray(body.completedTitles)
      ? body.completedTitles.filter((t: unknown): t is string => typeof t === "string")
      : [];
    now = typeof body.now === "string" ? body.now : "";
  } catch {
    // fall through to validation error
  }
  if (!project || messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "project and a conversation ending in a user message are required" },
      { status: 400 }
    );
  }
  if (!now) now = new Date().toISOString();

  try {
    const system = chatContext(
      JSON.stringify(project, null, 2),
      JSON.stringify(nextAction ?? "(all tasks completed)", null, 2),
      pendingTitles,
      completedTitles,
      now,
      project.deadline ? minutesBetween(now, project.deadline) : null
    );
    const raw = (await completeJson(system, messages)) as Record<string, unknown>;
    const reply = typeof raw?.reply === "string" ? raw.reply.trim() : "";
    if (!reply) {
      return NextResponse.json({ error: "AI returned an empty reply. Please try again." }, { status: 502 });
    }
    const contextUpdate = typeof raw?.contextUpdate === "string" ? raw.contextUpdate.trim() : "";
    return NextResponse.json({ reply, contextUpdate });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
