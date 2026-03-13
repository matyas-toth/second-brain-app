"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRef, type ChangeEvent, type FormEvent } from "react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  isStreaming: boolean;
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  isStreaming,
}: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming) {
        formRef.current?.requestSubmit();
      }
    }
  };

  return (
    <div className="border-t border-border/50 px-4 py-3">
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="mx-auto flex max-w-2xl items-end gap-2"
      >
        <Textarea
          value={input}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setInput(e.target.value)
          }
          onKeyDown={onKeyDown}
          placeholder="Tell me what you're working on..."
          disabled={isStreaming}
          rows={1}
          className="min-h-[44px] max-h-[160px] resize-none rounded-xl border-border/50 bg-muted/30 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isStreaming}
          className="h-[44px] w-[44px] shrink-0 rounded-xl"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Button>
      </form>
      <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-muted-foreground/40">
        Messages are parsed by AI to automatically manage your projects
        &amp; tasks
      </p>
    </div>
  );
}
