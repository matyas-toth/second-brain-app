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
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-sm">
            <HugeiconsIcon className="text-zinc-700" size={28} strokeWidth={1.65} icon={BrainIcon} />
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
      <div className="border-t border-border/50 px-4 py-3">
        <div className="text-[11px] text-muted-foreground/60">
          AI-powered task management
        </div>
      </div>
    </aside>
  );
}
