"use client";

import { useState } from "react";
import { StatusPill } from "./StatusPill";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  type: "TASK" | "NOTE" | "IDEA";
  title: string;
  content: string | null;
  status: "TODO" | "IN_PROGRESS" | "WAITING" | "DONE";
  dueDate: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  color: string | null;
  emoji: string | null;
  items: Item[];
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(true);

  const tasks = project.items.filter((i) => i.type === "TASK");
  const notes = project.items.filter((i) => i.type === "NOTE");
  const ideas = project.items.filter((i) => i.type === "IDEA");

  const todoCount = tasks.filter(
    (t) => t.status === "TODO"
  ).length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const doneCount = tasks.filter(
    (t) => t.status === "DONE"
  ).length;

  const accentColor = project.color || "#6366f1";

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-border/80"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: accentColor,
      }}
    >
      {/* Pulse indicator for active projects */}
      {project.isActive && inProgressCount > 0 && (
        <span className="absolute right-3 top-3 flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
            style={{ backgroundColor: accentColor }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </span>
      )}

      {/* Header */}
      <button
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-lg">{project.emoji || "📁"}</span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">
            {project.name}
          </h3>
          {project.description && (
            <p className="truncate text-[11px] text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {todoCount > 0 && (
            <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-blue-400">
              {todoCount}
            </span>
          )}
          {inProgressCount > 0 && (
            <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-amber-400">
              {inProgressCount}
            </span>
          )}
          {doneCount > 0 && (
            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400">
              {doneCount}
            </span>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={cn(
            "shrink-0 text-muted-foreground/50 transition-transform",
            expanded && "rotate-180"
          )}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border/30 px-4 pb-3 pt-2">
          {/* Tasks */}
          {tasks.length > 0 && (
            <div className="mb-2">
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Tasks
              </div>
              <div className="flex flex-col gap-1">
                {tasks.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] hover:bg-muted/30"
                  >
                    <StatusPill status={item.status} />
                    <span
                      className={cn(
                        "flex-1 truncate",
                        item.status === "DONE" &&
                          "text-muted-foreground line-through"
                      )}
                    >
                      {item.title}
                    </span>
                    {item.dueDate && (
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60">
                        {new Date(
                          item.dueDate
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {notes.length > 0 && (
            <div className="mb-2">
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Notes
              </div>
              <div className="flex flex-col gap-1">
                {notes.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md px-2 py-1.5 text-[13px] text-muted-foreground hover:bg-muted/30"
                  >
                    📝 {item.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ideas */}
          {ideas.length > 0 && (
            <div>
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Ideas
              </div>
              <div className="flex flex-col gap-1">
                {ideas.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md px-2 py-1.5 text-[13px] text-muted-foreground hover:bg-muted/30"
                  >
                    💡 {item.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.items.length === 0 && (
            <p className="py-2 text-center text-[11px] text-muted-foreground/50">
              No items yet
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      {!project.isActive && (
        <div className="border-t border-border/30 px-4 py-1.5">
          <span className="text-[10px] font-medium text-muted-foreground/50">
            ARCHIVED
          </span>
        </div>
      )}
    </div>
  );
}
