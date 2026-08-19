# Intention Action：阶段开发记录

> 最初按两日上限控制范围，实际从产生想法到当前 Demo 约 6 小时。项目仍在开发中，本文件只记录截至目前的过程，后续继续追加。

## 当前实现

Intention Action 将模糊意图转成结构化项目信息、执行计划和一个明确的 Next Action：

**Intention → Context → Plan → Action → Feedback → Re-plan**

目前已完成：

- AI 提取目标、deadline、需求、约束和成功标准；
- 用户确认并修改 AI 的理解；
- AI 生成带估时和顺序的计划；
- Next Action、Todo、Done；
- 本地持久化；
- 用户补充现实变化后更新 Project Memory 和剩余计划。

技术栈：Next.js、TypeScript、Tailwind、Zustand、阿里云百炼 qwen-plus。没有数据库、账号和 Agent framework。

## 开发方式

- 我负责产品定义、范围取舍、测试和验收；
- Claude Code 负责主要代码实现；
- 通过 GitHub diff 做阶段审查，不只依赖 AI 的完成报告；
- 只阻塞真实 Bug、状态不一致和核心流程问题，避免为小 Demo 过度设计。

## 已发现并处理的问题

- 刷新 confirm 页面可能丢失 draftProject；
- AI 可以静默删除无法完成的需求；
- scope cut 写在后续任务的 reason 中时，用户实际看不到；
- LLM 请求没有 timeout，可能永久停在 loading；
- malformed tasks 可能被当成空数组并清空计划；
- 用户输入“I finished X”后，X 会从 Todo 消失但不进入 Done；
- 修改 deadline 时，重新规划可能仍参考旧 deadline。
- 特定 Next Action 的长文本会撑开 Grid、改变页面比例；已通过补充宽度和换行约束修复。

## 使用后发现的产品问题

1. **只能保存一个项目**：真实用户通常同时处理多个目标。
2. **强制 deadline**：兴趣项目和长期任务不一定有结束时间，默认 48 小时会制造虚假紧迫感。
3. **Next Action 仍可能不够可执行**：例如系统让用户“定义 MVP scope”，但用户还要打开另一个 AI，重新描述全部背景。这可能让产品变成额外步骤。

目前最重要的产品问题是第 3 点。下一步可考虑让 Next Action 自动生成包含项目背景、交付物和完成标准的 Action Brief / Copy Prompt，让用户可以直接交给 Claude Code 或其他 AI 执行。

## 暂定后续方向

1. 先解决 Next Action 的执行交接问题；
2. 支持无 deadline 的开放式目标；
3. 再考虑多项目；
4. 暂不增加数据库、完整 Agent 或复杂调度系统。
