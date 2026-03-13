"use client";

import { useEffect, useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface TaskViewProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function TaskView({ sidebarOpen, onToggleSidebar }: TaskViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "archived" | "all">(
    "active"
  );

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    if (filter === "active") return p.isActive;
    if (filter === "archived") return !p.isActive;
    return true;
  });

  const totalTasks = filtered.reduce(
    (acc, p) =>
      acc + p.items.filter((i) => i.type === "TASK").length,
    0
  );
  const doneTasks = filtered.reduce(
    (acc, p) =>
      acc +
      p.items.filter(
        (i) => i.type === "TASK" && i.status === "DONE"
      ).length,
    0
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-3">
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={onToggleSidebar}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M2 4h12M2 8h12M2 12h12" />
              </svg>
            </Button>
          )}
          <div>
            <h1 className="text-sm font-semibold tracking-tight">
              Mission Control
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {filtered.length} projects · {doneTasks}/{totalTasks}{" "}
              tasks done
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-1 rounded-lg bg-muted/30 p-0.5">
          {(["active", "archived", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1 text-[11px] font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
              Loading projects...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="text-4xl">📭</div>
              <p className="text-sm text-muted-foreground">
                No projects yet. Start chatting to create some!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
