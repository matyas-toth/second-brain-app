"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChatSpinner from "../chat/ChatSpinner";

/* ── Types ─────────────────────────────────────────────── */

interface Item {
  id: string;
  type: "TASK" | "NOTE" | "IDEA";
  title: string;
  content: string | null;
  status: "TODO" | "IN_PROGRESS" | "WAITING" | "DONE";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
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
  refreshTrigger?: number;
  isRightSidebar?: boolean;
  onCloseRightSidebar?: () => void;
}

/* ── Main View ─────────────────────────────────────────── */

export function TaskView({ sidebarOpen, onToggleSidebar, refreshTrigger = 0, isRightSidebar, onCloseRightSidebar }: TaskViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  // Flatten all items with project context attached
  const allItems = projects.flatMap((p) =>
    p.items.map((item) => ({
      ...item,
      projectName: p.name,
      projectEmoji: p.emoji,
      projectColor: p.color || "#fafafa",
    }))
  );

  const now = allItems.filter(
    (i) => i.type === "TASK" && i.status === "IN_PROGRESS"
  );
  const next = allItems.filter(
    (i) => i.type === "TASK" && i.status === "TODO"
  );
  const onHold = allItems.filter(
    (i) => i.type === "TASK" && i.status === "WAITING"
  );
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const done = allItems
    .filter(
      (i) =>
        i.type === "TASK" &&
        i.status === "DONE" &&
        new Date(i.updatedAt) >= sevenDaysAgo
    );
  const knowledge = allItems.filter(
    (i) => i.type === "NOTE" || i.type === "IDEA"
  );

  const totalTasks = allItems.filter((i) => i.type === "TASK").length;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <ChatSpinner name="pulse"></ChatSpinner>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* ── Status Bar ───────────────────────────────── */}
      <header className="shrink-0 flex flex-col gap-2 border-b border-border px-4 md:px-6 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {!sidebarOpen && !isRightSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={onToggleSidebar}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 4h12M2 8h12M2 12h12" />
              </svg>
            </Button>
          )}
          {isRightSidebar && onCloseRightSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={onCloseRightSidebar}
              title="Close Tasks"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4L4 12M4 4l8 8" />
              </svg>
            </Button>
          )}
          <h1 className="text-base font-medium text-muted-foreground tracking-tight">
            {isRightSidebar ? "Tasks" : "Mission Control"}
          </h1>
        </div>
        <div className="text-xs text-muted-foreground w-full md:w-auto overflow-x-auto whitespace-nowrap hide-scrollbar">
          {now.length} active
          <span className="mx-1.5 text-border">·</span>
          {next.length} queued
          <span className="mx-1.5 text-border">·</span>
          {onHold.length} waiting
          <span className="mx-1.5 text-border">·</span>
          {done.length}/{totalTasks} done
        </div>
      </header>

      {/* ── Scrollable Briefing ──────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {totalTasks === 0 && knowledge.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <span className="text-3xl">📡</span>
            <p className="text-sm text-muted-foreground">
              No signals yet. Start chatting to create projects and tasks.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl px-4 md:px-6 py-6 md:py-8">

            {/* ── NOW ─────────────────────────────────── */}
            {now.length > 0 && (
              <section className="mb-10">
                <SectionHeader label="Now" count={now.length} />
                <div className="mt-4 flex flex-col gap-3">
                  {now.map((item) => (
                    <NowCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* ── NEXT ────────────────────────────────── */}
            {next.length > 0 && (
              <section className="mb-10">
                <SectionHeader label="Next" count={next.length} />
                <div className="mt-3 flex flex-col">
                  {next.map((item) => (
                    <CompactRow key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* ── ON HOLD ─────────────────────────────── */}
            {onHold.length > 0 && (
              <section className="mb-10 opacity-50">
                <SectionHeader label="On Hold" count={onHold.length} />
                <div className="mt-3 flex flex-col">
                  {onHold.map((item) => (
                    <CompactRow key={item.id} item={item} dimmed />
                  ))}
                </div>
              </section>
            )}

            {/* ── DONE (recent) ───────────────────────── */}
            {done.length > 0 && (
              <section className="mb-10">
                <SectionHeader label="Done" count={done.length} accent={false} />
                <div className="mt-3 flex flex-col">
                  {done.map((item) => (
                    <CompactRow key={item.id} item={item} strikethrough />
                  ))}
                </div>
              </section>
            )}

            {/* ── Knowledge Bank ──────────────────────── */}
            {knowledge.length > 0 && (
              <KnowledgeBank items={knowledge} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Section Header ────────────────────────────────────── */

function SectionHeader({
  label,
  count,
  accent = true,
}: {
  label: string;
  count: number;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <h2
        className={cn(
          "text-xs font-mono font-medium uppercase tracking-[0.2em]",
          accent ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </h2>
      <span className="text-[10px] font-mono text-muted-foreground">
        {count}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

/* ── NOW Card — large, prominent, alive ───────────────── */

type EnrichedItem = Item & {
  projectName: string;
  projectEmoji: string | null;
  projectColor: string;
};

function NowCard({ item }: { item: EnrichedItem }) {
  return (
    <div className="group relative rounded-lg border border-border bg-card p-5">
      {/* Accent left bar */}


      {/* Pulse indicator */}
      <span className="absolute right-4 top-4 flex h-2 w-2">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ backgroundColor: item.projectColor }}
        />
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: item.projectColor }}
        />
      </span>

      <p className="pr-8 text-sm md:text-[15px] font-medium leading-snug text-card-foreground">
        {item.title}
      </p>

      {item.content && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {item.content}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 md:gap-3">
        <ProjectChip
          name={item.projectName}
          emoji={item.projectEmoji}
          color={item.projectColor}
        />
        {item.dueDate && (
          <span className="text-[10px] font-mono text-muted-foreground">
            due {new Date(item.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Compact Row — for NEXT, ON HOLD, DONE ────────────── */

function CompactRow({
  item,
  dimmed = false,
  strikethrough = false,
}: {
  item: EnrichedItem;
  dimmed?: boolean;
  strikethrough?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 md:gap-3 border-b border-border/50 py-2.5",
        dimmed && "opacity-60"
      )}
    >
      {/* Color dot */}
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: item.projectColor }}
      />

      <span
        className={cn(
          "flex-1 truncate text-sm",
          strikethrough
            ? "text-muted-foreground line-through"
            : "text-foreground"
        )}
      >
        {item.title}
      </span>

      <ProjectChip
        name={item.projectName}
        emoji={item.projectEmoji}
        color={item.projectColor}
        small
      />

      {item.dueDate && (
        <span className="shrink-0 text-[10px] font-mono text-muted-foreground">
          {new Date(item.dueDate).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

/* ── Project Chip — small colored context tag ─────────── */

function ProjectChip({
  name,
  emoji,
  color,
  small = false,
}: {
  name: string;
  emoji: string | null;
  color: string;
  small?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full max-w-[120px] md:max-w-none",
        small ? "px-1.5 md:px-2 py-0.5 text-[10px]" : "px-2 md:px-3 py-0.5 md:py-1 text-[11px]"
      )}
      style={{ backgroundColor: color, boxShadow: "0 2px 10px 0px " + color + "30" }}
    >

      <span className="truncate text-white text-xs md:text-sm font-medium tracking-tight">
        {emoji && <span className="mr-1">{emoji}</span>}
        {name}
      </span>
    </span>
  );
}

/* ── Knowledge Bank — collapsible notes & ideas ──────── */

function KnowledgeBank({ items }: { items: EnrichedItem[] }) {
  const [open, setOpen] = useState(false);

  const notes = items.filter((i) => i.type === "NOTE");
  const ideas = items.filter((i) => i.type === "IDEA");

  return (
    <section className="border-t border-border pt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 text-left"
      >
        <h2 className="text-xs font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Knowledge Bank
        </h2>
        <span className="text-[10px] font-mono text-muted-foreground">
          {items.length}
        </span>
        <div className="h-px flex-1 bg-border" />
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={cn(
            "text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4">
          {notes.length > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                Notes
              </span>
              <div className="mt-2 flex flex-col gap-1">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground"
                  >
                    <span className="text-foreground/60">—</span>
                    <span className="flex-1 truncate">{n.title}</span>
                    <ProjectChip
                      name={n.projectName}
                      emoji={n.projectEmoji}
                      color={n.projectColor}
                      small
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {ideas.length > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                Ideas
              </span>
              <div className="mt-2 flex flex-col gap-1">
                {ideas.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground"
                  >
                    <span className="text-foreground/60">—</span>
                    <span className="flex-1 truncate">{n.title}</span>
                    <ProjectChip
                      name={n.projectName}
                      emoji={n.projectEmoji}
                      color={n.projectColor}
                      small
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
