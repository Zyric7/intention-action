// Server-side only: minimal DashScope (Alibaba Cloud Bailian) client via the
// OpenAI-compatible endpoint. No SDK — one fetch, JSON mode, parsed result.
//
// Manual fallback: SiliconFlow (SILICONFLOW_* values kept in the local env
// and in Vercel) — switch by pointing DASHSCOPE_BASE_URL / DASHSCOPE_API_KEY /
// DASHSCOPE_MODEL at the SiliconFlow equivalents. Never switched automatically.

// trim(): env values entered via shells/CLIs can carry stray whitespace; a
// newline inside a header value or URL makes fetch throw instantly.
const BASE_URL = (
  process.env.DASHSCOPE_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1"
).trim();
const MODEL = (process.env.DASHSCOPE_MODEL ?? "qwen-plus").trim();

export type LlmMessage = { role: "user" | "assistant"; content: string };

export async function completeJson(
  system: string,
  user: string | LlmMessage[],
  opts: { search?: boolean } = {}
): Promise<unknown> {
  const key = process.env.DASHSCOPE_API_KEY?.trim();
  if (!key) {
    throw new Error("DASHSCOPE_API_KEY is not set. Add it to .env.local and restart the dev server.");
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        // User-controlled Web Search switch. DashScope quirk (verified):
        // sending enable_thinking — even false — silently disables
        // enable_search, so the two are mutually exclusive here. qwen-plus
        // does not think by default, so omitting enable_thinking when
        // searching is safe. When the switch is off, the body is identical
        // to the previous behavior.
        ...(opts.search
          ? { enable_search: true, search_options: { forced_search: true } }
          : { enable_thinking: false }),
        messages: [
          { role: "system", content: system },
          ...(typeof user === "string" ? [{ role: "user", content: user }] : user),
        ],
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error("The AI took too long to respond. Please try again.");
    }
    throw new Error("Could not reach the AI service. Check your network and try again.");
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AI request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("AI returned an empty response.");
  }
  return JSON.parse(stripCodeFences(content));
}

function stripCodeFences(s: string): string {
  return s.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
}
