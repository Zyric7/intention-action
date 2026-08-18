"use client";

import type { Project } from "@/lib/types";
import { isoToLocalInput, localInputToIso } from "@/lib/time";

// Shows the system's structured understanding and lets the user correct it.
// Used full-size on the confirm screen and compact in the working sidebar.
export default function ProjectEditor({
  project,
  onEdit,
  compact = false,
}: {
  project: Project;
  onEdit: (patch: Partial<Project>) => void;
  compact?: boolean;
}) {
  const label = compact
    ? "text-xs font-medium uppercase tracking-wide text-stone-500"
    : "text-sm font-medium uppercase tracking-wide text-stone-500";
  const input =
    "w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus:border-stone-400 focus:outline-none";

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div>
        <label className={label}>Title</label>
        <input
          className={`${input} mt-1`}
          value={project.title}
          onChange={(e) => onEdit({ title: e.target.value })}
        />
      </div>

      <div>
        <label className={label}>Goal</label>
        <textarea
          className={`${input} mt-1 resize-none`}
          rows={compact ? 2 : 3}
          value={project.goal}
          onChange={(e) => onEdit({ goal: e.target.value })}
        />
      </div>

      <div>
        <label className={label}>Purpose</label>
        <input
          className={`${input} mt-1`}
          value={project.purpose ?? ""}
          onChange={(e) => onEdit({ purpose: e.target.value })}
        />
      </div>

      <div>
        <label className={label}>Deadline</label>
        <input
          type="datetime-local"
          className={`${input} mt-1`}
          value={isoToLocalInput(project.deadline)}
          onChange={(e) => {
            const iso = localInputToIso(e.target.value);
            if (iso) onEdit({ deadline: iso });
          }}
        />
      </div>

      <ListEditor
        label="Requirements"
        labelClass={label}
        items={project.requirements}
        onChange={(requirements) => onEdit({ requirements })}
      />
      <ListEditor
        label="Constraints"
        labelClass={label}
        items={project.constraints}
        onChange={(constraints) => onEdit({ constraints })}
      />
      <ListEditor
        label="Preferences"
        labelClass={label}
        items={project.preferences}
        onChange={(preferences) => onEdit({ preferences })}
      />
      <ListEditor
        label="Success criteria"
        labelClass={label}
        items={project.successCriteria}
        onChange={(successCriteria) => onEdit({ successCriteria })}
      />
    </div>
  );
}

function ListEditor({
  label,
  labelClass,
  items,
  onChange,
}: {
  label: string;
  labelClass: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const add = (value: string) => {
    const v = value.trim();
    if (v) onChange([...items, v]);
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <ul className="mt-1 space-y-1">
        {items.map((item, i) => (
          <li
            key={`${i}-${item}`}
            className="group flex items-start justify-between gap-2 rounded-md bg-white px-3 py-1.5 text-sm ring-1 ring-stone-200"
          >
            <span>{item}</span>
            <button
              type="button"
              aria-label={`Remove ${item}`}
              className="text-stone-300 transition-colors hover:text-red-500"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <input
        className="mt-1 w-full rounded-md border border-dashed border-stone-300 bg-transparent px-3 py-1.5 text-sm placeholder-stone-400 focus:border-stone-400 focus:outline-none"
        placeholder={`Add ${label.toLowerCase()}…`}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            add(e.currentTarget.value);
            e.currentTarget.value = "";
          }
        }}
      />
    </div>
  );
}
