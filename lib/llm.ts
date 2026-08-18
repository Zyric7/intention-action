// Server-side only: minimal DashScope (Alibaba Cloud Bailian) client via the
// OpenAI-compatible endpoint. No SDK — one fetch, JSON mode, parsed result.

const BASE_URL =
  process.env.DASHSCOPE_BASE_URL ??
  "https://dashscope.aliyuncs.com/compatible-mode/v1";
const MODEL = process.env.DASHSCOPE_MODEL ?? "qwen-plus";

export async function completeJson(system: string, user: string): Promise<unknown> {
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) {
    throw new Error("DASHSCOPE_API_KEY is not set. Add it to .env.local and restart the dev server.");
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

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
