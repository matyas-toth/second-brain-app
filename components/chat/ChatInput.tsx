"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp02Icon, BrainIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { MemoriesDialog } from "@/components/memories/MemoriesDialog";

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
  const [memoriesOpen, setMemoriesOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autofocus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Global key capture — focus textarea when user starts typing anywhere
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if already focused on an input, or modifier keys, or special keys
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return; // ignore Escape, Tab, arrows, etc.

      textareaRef.current?.focus();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming) {
        formRef.current?.requestSubmit();
      }
    }
  };

  return (
    <div className="px-3 md:px-0 py-3 mb-2 md:mb-4 pb-[env(safe-area-inset-bottom)]">
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="mx-auto flex max-w-2xl items-end gap-2"
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setInput(e.target.value)
          }
          onKeyDown={onKeyDown}
          placeholder="Tell me what you're working on..."
          disabled={isStreaming}
          rows={1}
          style={{ cornerShape: "superellipse(1.3)" }}
          className="min-h-[44px] max-h-[160px] focus-visible:outline-0 focus-visible:border-border/50 resize-none rounded-3xl border-border/50 bg-muted/30 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
        />
        <Button
          type="submit"
          size="icon-lg"

          disabled={!input.trim() || isStreaming}
          style={{ cornerShape: "superellipse(1.3)" }}
          className="h-[44px] w-[44px] shrink-0 rounded-3xl"
        >
          <HugeiconsIcon className="scale-150" size={64} icon={ArrowUp02Icon} />
        </Button>
      </form>
      <div className="max-w-2xl mx-auto flex flex-row justify-start items-center gap-2 mt-2">
        <Button 
          onClick={() => setMemoriesOpen(true)} 
          className={"rounded-3xl text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/5"} 
          style={{ cornerShape: "superellipse(1.3)" } as any} 
          variant="outline" 
          size="sm"
        >
          <HugeiconsIcon className="mr-1" strokeWidth={2} icon={BrainIcon} /> Memories
        </Button>
      </div>

      <MemoriesDialog open={memoriesOpen} onOpenChange={setMemoriesOpen} />
    </div>
  );
}
