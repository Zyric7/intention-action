# Intention Action

## Product

Intention Action is an AI-native action planner that helps users turn vague intentions into realistic, executable actions.

Users describe what they want to achieve, along with any requirements, constraints, preferences, or deadlines.

The system remembers this context, builds a structured understanding of the goal, and continuously converts it into a realistic action plan.

The product is not primarily a Todo List.

The Todo List is the execution layer.

The core product is the process of turning:

**Intention → Understanding → Plan → Next Action → Execution**

---

## Core Problem

People often know roughly what they want to achieve but do not know exactly what they should do next.

For example:

> I want to build a small AI Product Builder demo within two days. It should include Todo and Done, show my ability to turn ideas into working products, and be realistic enough to actually finish.

This is not yet a task.

It contains:

* A goal
* A deadline
* Several requirements
* Product preferences
* Scope constraints
* An implicit success criterion

Traditional Todo applications expect the user to break this intention into tasks manually.

Intention Action should perform that translation.

---

## Core Product Question

**Can AI reduce the gap between having an intention and knowing what to do next?**

The product should help users move from:

> I want to do this.

to:

> This is what I should do now.

---

## Core Concept

The user expresses an intention naturally.

The system then:

1. Understands the goal.
2. Extracts important requirements and constraints.
3. Builds persistent project context.
4. Determines what is reasonably achievable given the user's constraints — including time, when a time constraint exists.
5. Generates an executable plan.
6. Highlights the most useful next action.
7. Tracks execution.
8. Updates the plan when reality changes.

The central loop is:

**Intention → Context → Plan → Action → Feedback → Re-plan**

---

## Example Use Case

### Initial Intention

> I want to build a small AI Product Builder demo within two days. I want it to include Todo and Done, remember my requirements, and focus on turning intention into action. It needs to be something I can realistically finish.

The system may understand this as:

### Goal

Build a working AI Product Builder demo.

### Deadline

Two days.

### Purpose

Demonstrate product thinking, AI-assisted development, interaction design, and execution ability.

### Requirements

* Must include Todo.
* Must include Done.
* Must remember user requirements.
* Must provide realistic plans.
* Must focus on intention-to-action transformation.
* Must be a working demo.

### Constraints

* Development time is limited to two days.
* Avoid unnecessary complexity.
* Prefer a web application.
* No authentication required.
* No complex agent architecture.

### Success Criteria

A user can describe a vague project goal and receive a realistic action plan that adapts as the project progresses.

---

## Product Memory

The system should not rely only on chat history to remember what the user wants.

Important information should be extracted and stored as structured project context.

This structured context becomes the persistent memory of the project.

The system should remember information such as:

* Goal
* Deadline
* Purpose
* Requirements
* Constraints
* Preferences
* Success criteria
* Current progress

For example, if the user later says:

> I don't want authentication in the MVP.

The system should update the project context with:

* No authentication

Future plans should respect this requirement.

If the user later says:

> Calendar is too complicated. Remove it from the first version.

The system should remember that decision and update the remaining plan accordingly.

---

## Core Data Model

The MVP has two primary entities:

* `Project`
* `Task`

---

## Project

A Project represents the user's current intention and the system's structured understanding of it.

Suggested fields:

* `id`
* `title`
* `goal`
* `purpose`
* `deadline` (optional — only when the user provides or clearly implies one)
* `requirements`
* `constraints`
* `preferences`
* `successCriteria`
* `createdAt`
* `updatedAt`

Example:

```json
{
  "id": "project_001",
  "title": "AI Product Builder Demo",
  "goal": "Build a working AI action planning demo",
  "purpose": "Use as an application portfolio project",
  "deadline": "2026-08-20T18:00:00",
  "requirements": [
    "Todo view",
    "Done view",
    "Persistent project context",
    "AI-generated realistic action plan"
  ],
  "constraints": [
    "Must be achievable within two days",
    "Web application",
    "No authentication",
    "Avoid over-engineering"
  ],
  "preferences": [
    "Simple interaction",
    "AI should reduce manual planning"
  ],
  "successCriteria": [
    "User can describe a vague goal",
    "System creates an actionable plan",
    "System remembers later requirement changes",
    "System always provides a clear next action"
  ]
}
```

---

## Task

A Task represents an executable action generated from the Project context.

Suggested fields:

* `id`
* `projectId`
* `title`
* `description`
* `status`
* `priority`
* `stage` (optional — groups the tasks of larger goals into stages/categories)
* `estimatedMinutes` (optional — rough, only when meaningful)
* `plannedStart` (optional — only for time-bound projects)
* `plannedEnd` (optional — only for time-bound projects)
* `reason`
* `createdAt`
* `completedAt`

Suggested task statuses:

* `pending`
* `active`
* `completed`

Todo and Done should operate on the same Task data.

### Todo

Shows tasks where:

* `status` is `pending` or `active`

### Done

Shows tasks where:

* `status` is `completed`

Tasks should not be copied into a separate Done data structure.

---

## Core Flow

### 1. Capture Intention

The user describes what they want to achieve in natural language.

Example:

> I want to build a working demo in two days. It should show how AI can turn vague intentions into realistic actions.

---

### 2. Understand

AI extracts structured project information.

The system identifies:

* Goal
* Deadline
* Requirements
* Constraints
* Preferences
* Success criteria

---

### 3. Confirm Understanding

The system shows the interpreted project context.

The user can:

* Confirm it
* Edit it
* Add missing information
* Remove incorrect assumptions

The user remains the final source of truth.

---

### 4. Build a Realistic Plan

The system generates tasks based on:

* Project goal
* Requirements
* Constraints
* Deadline and available time (when a time constraint exists)
* Existing progress

The plan should be realistic rather than exhaustive — but realistic means executable, not few. The number and structure of actions should follow from the goal itself, never from an artificial size limit.

For larger or longer-term goals, the system should divide the work into reasonable stages or categories and break those down into executable sub-actions.

Every action should be specific, reasonably sequenced, and low-cost to start: executable from its own wording, without the user needing to ask "how do I do this?"

---

### 5. Highlight the Next Action

The most important output of the system is not the full task list.

It is the next action.

The interface should prominently show:

**Do this now**

Example:

> Define the Project and Task data models
> Rough estimate (shown only when meaningful): ~25 minutes

The user should not need to inspect a long plan to understand what to do next.

---

### 6. Execute

The user can work on the current task through chat or outside the application.

The chat has access to the existing Project context, so the user does not need to explain the project again.

Relevant progress or changes from the conversation can update the Project context and remaining plan.

Completed tasks move into Done.

---

### 7. Update Reality

The user may provide new information.

Examples:

> That took much longer than expected.

> I only have three hours left today.

> Remove Calendar from the MVP.

> I finished the frontend earlier than expected.

The system should update the relevant project context or task state.

---

### 8. Re-plan

The system recalculates the remaining plan based on:

* Remaining time (when a time constraint exists)
* Completed tasks
* Unfinished tasks
* New requirements
* Changed constraints

The new plan should continue to respect the original intention unless the user explicitly changes it.

---

## Core Interaction Loop

The main product loop is:

```text
User intention
↓
AI understands goal and constraints
↓
Structured project memory
↓
Realistic action plan
↓
Next Action
↓
User executes
↓
Progress or new information
↓
Project memory updates
↓
Remaining plan updates
↓
Next Action
```

---

## Views

The MVP should remain small.

It does not need many separate screens.

---

## 1. Intention

This is the starting point.

The user describes the goal naturally.

Example:

> I want to make an AI Product Builder demo in two days.

The system interprets the intention and creates the initial Project context.

---

## 2. Project

The Project view shows what the system currently understands.

Suggested sections:

### Goal

What the user ultimately wants to achieve.

### Deadline

When the goal needs to be completed. Shown only when the user has provided or clearly implied one.

### Requirements

Things that must be included.

### Constraints

Things that limit the solution.

### Preferences

Things the user would prefer but that are not mandatory.

### Success Criteria

What counts as a successful result.

The user should be able to correct these values.

---

## 3. Plan

The Plan view shows the realistic execution plan.

By default the plan is a simple ordered list. Tasks may be grouped by stage for larger goals, or by time when the project is genuinely time-bound.

Example (time-bound project):

### Today

**19:30–20:00**
Define data model

**20:00–21:00**
Build project state

**21:00–22:30**
Implement AI intention extraction

### Tomorrow

**10:00–12:00**
Build Todo and Done flow

**13:00–14:30**
Implement re-planning

**15:00–17:00**
Polish and deploy

The plan should account for the deadline when one exists, rather than simply generate a generic checklist.

---

## 4. Next Action

The Next Action should be the most visually important element.

A project-aware chat input is available below the Next Action, allowing the user to continue working without re-explaining the project context.

Example:

### Do This Now

**Define the Project data model**

Rough estimate (optional): ~25 minutes

Reason:

> The planning system depends on having a stable representation of the user's goal and constraints.

The reason should be short and useful.

---

## 5. Todo

Todo contains unfinished execution tasks.

The surface emphasizes the Next Action and a small number of relevant upcoming actions; the rest of a larger plan stays accessible without crowding the screen.

Each task may display:

* Title
* Estimated duration
* Planned time
* Priority

Avoid unnecessary fields.

---

## 6. Done

Done shows completed actions.

Completed tasks should not disappear.

Example:

### Today

* Defined Project model
* Built task state
* Implemented intention extraction

Summary:

> 3 tasks completed
> 2h 15m estimated work completed

Advanced productivity analytics are not required.

---

## Time System

Time is an optional constraint, not a default part of the experience.

The main planning question is what the user should reasonably do next — not how to fit everything into a schedule. Precise estimates are often unreliable, especially with AI-assisted work, and many projects are long-term or open-ended.

When the user provides or clearly implies a time constraint, the system should understand:

* Current date and time
* Project deadline
* Rough task estimates
* Remaining available time

and use them to answer: **Can this plan actually fit before the deadline?**

When no time constraint exists, plans carry no schedule, and the system must never invent a deadline.

The MVP does not require a full external calendar integration. A lightweight timeline or schedule is sufficient for time-bound projects.

---

## AI Responsibilities

AI should have a small number of clear responsibilities.

---

### 1. Intention Extraction

Convert natural language into structured Project information.

The AI should extract:

* Goal
* Deadline
* Requirements
* Constraints
* Preferences
* Success criteria

Extract a deadline only when the user provides or clearly implies one. Never invent a deadline.

---

### 2. Context Update

When the user provides new information, determine whether it changes:

* Project context
* Task state
* Deadline
* Requirements
* Constraints
* Preferences

Update only the relevant information.

---

### 3. Plan Generation

Generate a realistic set of executable Tasks from the Project context.

The number and structure of tasks follow from the goal. Larger or longer-term goals are divided into stages or categories, each broken down into executable sub-actions. Every task must clear the activation-cost bar: startable from its own wording, without further "how?" questions.

Planning should consider:

* Deadline (when present)
* Estimated effort
* Dependencies
* Existing progress
* User constraints

The AI should avoid generating unnecessary work.

---

### 4. Next Action Selection

Select the most useful immediate action.

The next action should be:

* Specific
* Small enough to start immediately
* Low activation cost — executable from its wording alone, without the user needing to ask "how do I do this?"
* Relevant to the goal
* Realistically completable

Avoid vague actions such as:

> Work on the project.

Prefer:

> Define the Project and Task schemas.

---

### 5. Re-planning

When reality changes, update the remaining plan.

Re-planning should preserve completed work and avoid rebuilding the entire plan unnecessarily.

---

## Human Control

AI should help users make progress, not take control away from them.

Preferred interaction:

```text
User intention
↓
AI interpretation
↓
User confirmation
↓
Plan
↓
User execution
```

Important assumptions should be visible.

Users should be able to correct the system.

The system should never pretend uncertain information is known.

---

## Product Principle: Reality Over Ideal Plans

The system should optimize for what the user can actually finish.

If the user has two days, the AI should not produce a two-week ideal product roadmap.

If there is not enough time to complete every requested feature, the system should explicitly reduce scope or propose trade-offs.

Example:

> With the remaining time, authentication is unlikely to improve the core demo. I recommend removing it from the MVP.

The goal is not to generate the most complete plan.

The goal is to generate the most useful achievable plan.

---

## Product Principle: Memory Should Be Structured

The system should not treat a long conversation transcript as the primary source of truth.

Important decisions should be converted into structured project context.

Chat is input.

Project context is memory.

---

## Product Principle: Next Action Over Task Explosion

Generating more tasks does not by itself help users make progress — but the answer is presentation discipline, not artificially small plans.

The system may maintain a larger underlying plan when the goal warrants it. The interface stays calm by emphasizing the immediate Next Action and only a small number of relevant upcoming actions.

The system should prefer:

* Clearer tasks over more tasks
* Smaller immediate actions
* Explicit priorities
* A quiet surface over an exhaustive list

The user should always know what to do next.

---

## Product Principle: AI Should Reduce Planning Work

The user should not need to manually convert an idea into:

* Requirements
* Milestones
* Tasks
* Durations
* Priorities
* Schedules

AI should perform as much of this translation as reasonably possible.

The user primarily provides intention and corrections.

---

## Product Principle: One Source of Truth

Project context should have one authoritative representation.

Task state should have one authoritative representation.

Todo and Done are views of the same Task collection.

Avoid duplicated state.

---

## MVP

The two-day MVP should support the complete core loop:

* Natural language intention input
* AI extraction of project context
* User confirmation of AI understanding
* Persistent Project memory
* Generation of a realistic task plan
* Stage breakdown for larger goals (when the goal warrants it)
* Rough task estimates (when meaningful)
* Basic time planning (when a time constraint exists)
* Clear Next Action
* Project-aware chat for working on the current task
* Todo
* Mark task as completed
* Done
* User provides new requirements or constraints
* Project memory updates
* Remaining plan can be regenerated
* Basic loading states
* Basic error handling

The MVP should demonstrate the idea from beginning to end.

---

## Scope Boundaries

The two-day MVP should include only what is necessary to validate the core **Intention → Action** loop.

Do not introduce additional features, systems, or abstractions unless they are directly required by the defined product flow.

When there is a trade-off between completeness and feasibility, prioritize a smaller working flow that can realistically be completed within two days.

---

## Success Criteria

The MVP is successful if a user can:

1. Open the application.
2. Describe a vague goal in natural language.
3. Optionally provide a deadline and any relevant requirements.
4. See what the AI understands about the goal.
5. Correct the AI if necessary.
6. Generate a realistic plan.
7. Immediately understand what to do next.
8. Complete a task.
9. See completed work in Done.
10. Provide a new requirement or constraint.
11. See the Project memory update.
12. Receive an updated remaining plan.

The full workflow should be understandable without instructions.

---

## Design Direction

The interface should feel:

* Clear
* Lightweight
* Calm
* Focused
* Fast
* Intentional

Avoid traditional project-management complexity.

The product should not feel like:

> Configure your productivity system.

It should feel like:

> Tell me what you're trying to accomplish. I'll help you figure out what to do next.

---

## Demo Scenario

The product itself should be its first real use case.

The demo can begin with:

> I want to build a working AI Product Builder demo within two days. It should include Todo and Done, remember my requirements, and demonstrate how AI can turn intention into action.

The application then:

1. Extracts the project goal and constraints.
2. Creates structured project memory.
3. Generates a realistic two-day plan.
4. Shows the first Next Action.
5. Tracks completed work.
6. Accepts changing requirements.
7. Re-plans the remaining work.

This creates a self-referential demonstration:

**Intention Action is used to plan and build Intention Action itself.**

---

## Core Statement

**Intention Action turns “I want to do this” into “this is what I should do next.”**