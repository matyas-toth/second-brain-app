"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ChatSpinner from "./ChatSpinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiBrain02Icon, AiBrain04Icon, BrainIcon } from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  view: "chat" | "tasks";
  onViewChange: (view: "chat" | "tasks") => void;
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export function ChatSidebar({
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  view,
  onViewChange,
  isOpen,
  onToggle,
  isMobile = false,
}: ChatSidebarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border/50 bg-background transition-all duration-200",
        isMobile
          ? cn(
            "fixed inset-y-0 left-0 z-40 w-[280px] shadow-xl",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )
          : cn(isOpen ? "w-72" : "w-0 overflow-hidden border-r-0")
      )}
    >
      {/* Logo + New Chat */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 dark:bg-primary/15 text-sm">
            <HugeiconsIcon className="text-zinc-700 dark:text-zinc-400" size={28} strokeWidth={1.65} icon={BrainIcon} />
          </div>
          <span className="text-base font-medium tracking-tight text-foreground">
            Second Brain
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={onNewChat}
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
                  <path d="M8 3.5v9M3.5 8h9" />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">New Chat</TooltipContent>
          </Tooltip>
          {/* Mobile close button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onToggle}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 px-4 py-2">
        <button
          onClick={() => onViewChange("chat")}
          className={cn(
            "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            view === "chat"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Chat
        </button>
        <button
          onClick={() => onViewChange("tasks")}
          className={cn(
            "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            view === "tasks"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Tasks
        </button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {chats.length === 0 && (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              No chats yet.
              <br />
              Start a conversation!
            </div>
          )}
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                activeChat === chat.id
                  ? "bg-accent/10 text-foreground"
                  : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <span className="truncate text-[13px]">
                {chat.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="ml-2 hidden shrink-0 rounded p-0.5 text-muted-foreground/50 hover:text-destructive group-hover:block"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-3 border-t border-border/50 p-3">
        {mounted && (
          <div className="flex w-full items-center rounded-md border border-border/50 bg-background/50 p-0.5">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex flex-1 items-center justify-center rounded-sm py-1.5 text-xs transition-colors",
                theme === "light"
                  ? "bg-accent text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
              title="Light Mode"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={cn(
                "flex flex-1 items-center justify-center rounded-sm py-1.5 text-xs transition-colors",
                theme === "system"
                  ? "bg-accent text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
              title="System Mode"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex flex-1 items-center justify-center rounded-sm py-1.5 text-xs transition-colors",
                theme === "dark"
                  ? "bg-accent text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
              title="Dark Mode"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
            </button>
          </div>
        )}
        <div className="text-center text-[11px] text-muted-foreground/60">
          AI-powered task management
        </div>
      </div>
    </aside>
  );
}
