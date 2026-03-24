"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useMemo } from "react";
import { ChatInput } from "./ChatInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChatSpinner from "./ChatSpinner";
import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChatSpark01Icon } from "@hugeicons/core-free-icons";

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

/* ── Helper: extract tool parts from a message ───────── */
interface ToolPart {
  toolCallId: string;
  toolName: string;
  state: string;
  output?: string;
  label: string;
}

function extractToolParts(message: UIMessage): ToolPart[] {
  const parts: ToolPart[] = [];
  if (!message.parts) return parts; // safety check

  for (const part of message.parts) {
    // Tool parts have type "tool-{name}" pattern
    if (typeof part === "object" && part.type && part.type.startsWith("tool-")) {
      const toolName = part.type.substring(5);
      const toolPart = part as any; // Cast to access state, output, input, toolCallId

      // Build a human-readable label from input
      let label = toolName;
      if (toolPart.state === "output-available" && typeof toolPart.output === "string") {
        label = toolPart.output;
      } else if (toolPart.input) {
        const input = toolPart.input;
        switch (toolName) {
          case "createProject":
            label = `Creating project ${input.emoji || ""} ${input.projectName || ""}`.trim();
            break;
          case "addItem":
            label = `Adding ${input.type?.toString().toLowerCase() || "item"} "${input.title}" to ${input.projectName}`;
            break;
          case "updateItemStatus":
            label = `Updating status → ${input.newStatus}`;
            break;
          case "updateItemContent":
            label = `Updating "${input.newTitle || "item"}"`;
            break;
          case "archiveProject":
            label = `Archiving project`;
            break;
          case "saveMemory":
            label = `Saving to memory...`;
            break;
          case "searchMemories":
            label = `Searching vault for "${input.query}"...`;
            break;
        }
      }

      parts.push({
        toolCallId: toolPart.toolCallId,
        toolName: toolName,
        state: toolPart.state,
        output: typeof toolPart.output === "string" ? toolPart.output : undefined,
        label,
      });
    }
  }
  return parts;
}

/* ── Chat Loader ─────────────────────────────────────── */

export function ChatArea({
  chatId,
  onNewChat,
  onChatUpdated,
  sidebarOpen,
  onToggleSidebar,
}: ChatAreaProps) {
  const [loaded, setLoaded] = useState(!chatId);
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

  if (!chatId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <ChatSpinner name="pulse"></ChatSpinner>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <ChatSpinner name="pulse"></ChatSpinner>
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

/* ── Tool Call Notification Stack ─────────────────────── */

function ToolCallStack({
  toolParts,
  isFinished,
}: {
  toolParts: ToolPart[];
  isFinished: boolean;
}) {
  // Only show last 2 tool calls
  const visible = toolParts.slice(-2);

  if (visible.length === 0) return null;

  return (
    <AnimatePresence mode="popLayout">
      {true &&
        visible.map((tool) => (
          <motion.div
            key={tool.toolCallId}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center gap-2.5 py-1 mb-1"
          >
            {tool.state === "output-available" ? (
              <>

                <span className="text-xs text-muted-foreground">
                  {tool.output || tool.label}
                </span>
              </>
            ) : (
              <ChatSpinner name="waverows">
                <span className="ml-2 text-xs text-muted-foreground">
                  {tool.label}
                </span>
              </ChatSpinner>
            )}
          </motion.div>
        ))}
    </AnimatePresence>
  );
}

/* ── Main Chat Component ─────────────────────────────── */

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

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const isStreaming = status === "streaming";
  const isThinking = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const THINKING_OPTIONS = [
    "Pondering", "Vibing", "Cooking", "Brewing", "Marinating", "Scheming",
    "Manifesting", "Neurons firing", "Brain loading", "Deep diving",
    "Thought cooking", "Mind mapping", "Touching grass", "Staring vacantly",
    "Buffering", "Vibing hard", "Not slacking", "Totally focused",
    "Eyes closed", "Almost there", "Enlightening"
  ];

  const [thinkingText, setThinkingText] = useState("Thinking");

  useEffect(() => {
    if (status === "submitted") {
      setThinkingText(THINKING_OPTIONS[Math.floor(Math.random() * THINKING_OPTIONS.length)]);
    }
  }, [status]);

  // Extract tool parts from the last assistant message (active during streaming)
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
  const activeToolParts = lastAssistantMsg ? extractToolParts(lastAssistantMsg) : [];
  const hasText = lastAssistantMsg?.parts.some(
    (p) => p.type === "text" && (p as { text: string }).text.length > 0
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/50 px-4 md:px-6 py-3">
        {!sidebarOpen && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={onToggleSidebar}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 4h12M2 8h12M2 12h12" />
            </svg>
          </Button>
        )}
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-base font-medium tracking-tight text-muted-foreground">
            {isThinking ? "Thinking..." : "Chat"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isThinking ? (
          <div className="flex h-full flex-row items-center justify-center gap-3 px-4">
            <HugeiconsIcon size={32} className="text-muted-foreground" icon={ChatSpark01Icon} />
            <p className="text-sm text-muted-foreground">Dump your thoughts here to get started...</p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl px-3 md:px-0 py-4 md:py-6">
            <AnimatePresence initial={false}>
              {messages.map((message) => {
                const toolParts = extractToolParts(message);
                const textParts = message.parts.filter((p) => p.type === "text");
                const isLastAssistant = message === lastAssistantMsg;

                return (
                  <div key={message.id}>
                    {/* User bubble OR assistant text bubble */}
                    {message.role === "user" ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 flex justify-end gap-3"
                      >
                        <div
                          className="max-w-[85%] rounded-3xl px-4 py-2.5 text-base md:text-sm leading-relaxed whitespace-pre-wrap bg-primary text-primary-foreground"
                          style={{ cornerShape: "superellipse(1.3)" } as any}
                        >
                          {textParts.map((part, i) =>
                            part.type === "text" ? <span key={i}>{part.text}</span> : null
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        {/* Tool call notifications — above the text bubble */}
                        {toolParts.length > 0 && (
                          <div className="mb-2 ml-1">
                            {isLastAssistant && isThinking ? (
                              <ToolCallStack
                                toolParts={toolParts}
                                isFinished={false}
                              />
                            ) : (
                              /* For finished messages in history, show completed tools briefly or not */
                              <ToolCallStack
                                toolParts={toolParts}
                                isFinished={true}
                              />
                            )}
                          </div>
                        )}

                        {/* Assistant text */}
                        {textParts.some(
                          (p) => p.type === "text" && (p as { text: string }).text.length > 0
                        ) && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mb-4 flex justify-start gap-3"
                            >
                              <div
                                className="max-w-[85%] rounded-3xl px-4 py-2.5 text-base md:text-sm leading-relaxed whitespace-pre-wrap bg-muted/50 text-foreground"
                                style={{ cornerShape: "superellipse(1.3)" } as any}
                              >
                                {textParts.map((part, i) =>
                                  part.type === "text" ? <span key={i}>{part.text}</span> : null
                                )}
                              </div>
                            </motion.div>
                          )}
                      </>
                    )}
                  </div>
                );
              })}
            </AnimatePresence>

            {/* Thinking indicator — only when no tool calls and no text yet */}
            <AnimatePresence>
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 flex items-center gap-3"
                >
                  <ChatSpinner name="pulse">{thinkingText}</ChatSpinner>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput input={input} setInput={setInput} onSubmit={handleSubmit} isStreaming={isThinking} />
    </div>
  );
}
