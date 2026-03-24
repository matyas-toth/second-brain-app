"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Fuse from "fuse.js";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import ChatSpinner from "@/components/chat/ChatSpinner";
import { format } from "date-fns";

interface Memory {
  id: string;
  content: string;
  createdAt: string;
}

interface MemoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemoriesDialog({ open, onOpenChange }: MemoriesDialogProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/api/memories")
        .then((res) => res.json())
        .then((data) => {
          setMemories(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setSearch("");
    }
  }, [open]);

  // Setup intense fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(memories, {
      keys: ["content"],
      threshold: 0.4, // Aggressive fuzzy matching
      ignoreLocation: true,
      includeScore: true,
    });
  }, [memories]);

  const filteredMemories = useMemo(() => {
    if (!search.trim()) return memories;
    return fuse.search(search).map((result) => result.item);
  }, [search, memories, fuse]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl gap-0 p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="px-6 py-4 border-b border-border/50 bg-accent/20">
          <DialogTitle className="flex items-center gap-2 text-xl tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <HugeiconsIcon icon={BrainIcon} size={20} />
            </div>
            Vault Memories
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 border-b border-border/50 bg-background">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memories, snippets, logs..."
              className="pl-9 h-11 bg-accent/5 border-transparent focus-visible:ring-1 focus-visible:bg-transparent"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="h-[50vh] px-4 py-4">
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <ChatSpinner name="pulse" />
              </div>
            ) : filteredMemories.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {search ? "No memories match your intense search." : "The vault is empty. Speak to the AI to save thoughts!"}
              </div>
            ) : (
              // Masonry style layout effect using columns could be here, but flex col is cleaner for text
              <div className="columns-1 md:columns-2 gap-3 space-y-3">
                {filteredMemories.map((memory) => (
                  <div
                    key={memory.id}
                    className="break-inside-avoid rounded-xl border border-border/50 bg-card p-4 transition-colors hover:bg-accent/5 shadow-sm"
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {memory.content}
                    </div>
                    <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      {format(new Date(memory.createdAt), "MMM d, yyyy • h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
