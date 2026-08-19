# Intention Action

**Turns "I want to do this" into "this is what I should do next."**

An AI-native action planner: describe a goal in natural language, confirm what
the AI understood, get a realistic time-planned task list, and always see one
clear next action. When reality changes ("deadline moved up", "I finished X",
"drop that requirement"), the project memory updates and the remaining plan is
regenerated — completed work is never touched.

Built in two days as its own first use case. See [PRODUCT.md](PRODUCT.md) for
the full product definition.

## Stack

Next.js (App Router) · TypeScript · Tailwind · Zustand (localStorage
persistence) · Alibaba Cloud DashScope (`qwen-plus`) via four small API
routes — no SDK, no database, no auth. SiliconFlow works as a manual
fallback by pointing the `DASHSCOPE_*` variables at its endpoint.

## Run it

```bash
npm install
```

Create `.env.local`:

```
DASHSCOPE_API_KEY=sk-...
# optional: DASHSCOPE_BASE_URL (default https://dashscope.aliyuncs.com/compatible-mode/v1),
#           DASHSCOPE_MODEL (default qwen-plus)
```

```bash
npm run dev
```

Open http://localhost:3000 and describe what you're trying to accomplish.

## How it works

- **One source of truth**: a single `Project` object is the structured memory;
  Todo, Done, and the Next Action are all views of one `Task` collection.
- **Chat is input, context is memory**: free text goes through `/api/extract`,
  `/api/plan`, or `/api/update`; only structured state is kept.
- **Reality over ideal plans**: plans must fit the remaining time with slack;
  scope cuts are stated in the visible next-action reason, never silent.
