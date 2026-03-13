"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useMemo } from "react";
import { ChatInput } from "./ChatInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  chatId: string | null;
  onNewChat: () => void;
  onChatUpdated: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

interface DbMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// Wrapper that loads history then mounts the chat
export function ChatArea({
  chatId,
  onNewChat,
  onChatUpdated,
  sidebarOpen,
  onToggleSidebar,
}: ChatAreaProps) {
  const [loaded, setLoaded] = useState(!chatId); // if no chatId, skip loading
  const [historyMessages, setHistoryMessages] = useState<UIMessage[]>([]);

  useEffect(() => {
    if (!chatId) {
      setHistoryMessages([]);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    fetch(`/api/chats/${chatId}`)
      .then((res) => res.json())
      .then((msgs: DbMessage[]) => {
        setHistoryMessages(
          msgs.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            parts: [{ type: "text" as const, text: m.content }],
          }))
        );
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [chatId]);

  // Empty state — no chat selected
  if (!chatId) {
    return (
      <EmptyState
        sidebarOpen={sidebarOpen}
        onToggleSidebar={onToggleSidebar}
        onNewChat={onNewChat}
      />
    );
  }

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <ChatInner
      chatId={chatId}
      initialMessages={historyMessages}
      onChatUpdated={onChatUpdated}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={onToggleSidebar}
    />
  );
}

// The actual chat with useChat hook — only mounts after history is loaded
function ChatInner({
  chatId,
  initialMessages,
  onChatUpdated,
  sidebarOpen,
  onToggleSidebar,
}: {
  chatId: string;
  initialMessages: UIMessage[];
  onChatUpdated: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { chatId },
      }),
    [chatId]
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: initialMessages,
    onFinish: () => {
      onChatUpdated();
    },
  });

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const isStreaming = status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2.5">
        {!sidebarOpen && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={onToggleSidebar}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 4h12M2 8h12M2 12h12" />
            </svg>
          </Button>
        )}
        <div className="flex items-center gap-2 min-w-0">
          {isStreaming && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
          )}
          <span className="truncate text-sm font-medium text-muted-foreground">
            {isStreaming ? "Thinking..." : "Chat"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4">
            <div className="text-3xl">💭</div>
            <p className="text-sm text-muted-foreground">Send a message to get started</p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl px-4 py-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "mb-4 flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs">
                    🧠
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-foreground"
                  )}
                >
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return <span key={i}>{part.text}</span>;
                    }
                    return null;
                  })}
                </div>
                {message.role === "user" && (
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-foreground/10 text-xs">
                    👤
                  </div>
                )}
              </div>
            ))}
            {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="mb-4 flex gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs">
                  🧠
                </div>
                <div className="rounded-xl bg-muted/50 px-4 py-2.5">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/40" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput input={input} setInput={setInput} onSubmit={handleSubmit} isStreaming={isStreaming} />
    </div>
  );
}

// Empty landing state
function EmptyState({
  sidebarOpen,
  onToggleSidebar,
  onNewChat,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      {!sidebarOpen && (
        <Button variant="ghost" size="icon" className="absolute left-3 top-3 h-8 w-8 text-muted-foreground" onClick={onToggleSidebar}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        </Button>
      )}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-3xl">
          🧠
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Second Brain</h1>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Start a conversation to organize your thoughts.
          <br />
          The AI will automatically manage your projects and tasks.
        </p>
      </div>
      <Button onClick={onNewChat} className="mt-2" variant="default">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mr-2">
          <path d="M8 3.5v9M3.5 8h9" />
        </svg>
        New Chat
      </Button>
    </div>
  );
}
