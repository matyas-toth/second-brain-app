"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { TaskView } from "@/components/tasks/TaskView";
import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [view, setView] = useState<"chat" | "tasks">("chat");
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      redirect("/login");
    }
  }, [session, isPending]);

  // Default sidebar open on desktop, closed on mobile
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Auto-open the latest chat when switching to chat view with nothing selected
  useEffect(() => {
    if (view === "chat" && !activeChat && chats.length > 0) {
      setActiveChat(chats[0].id);
    }
  }, [view, activeChat, chats]);

  const fetchChats = useCallback(async () => {
    const res = await fetch("/api/chats");
    const data = await res.json();
    setChats(data);
  }, []);

  useEffect(() => {
    if (session) {
      fetchChats();
    }
  }, [fetchChats, session]);

  const createChat = async () => {
    const res = await fetch("/api/chats", { method: "POST" });
    const chat = await res.json();
    setChats((prev) => [chat, ...prev]);
    setActiveChat(chat.id);
    setView("chat");
    if (isMobile) setSidebarOpen(false);
  };

  const deleteChat = async (id: string) => {
    await fetch(`/api/chats/${id}`, { method: "DELETE" });
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChat === id) {
      setActiveChat(chats.length > 1 ? chats.find((c) => c.id !== id)?.id ?? null : null);
    }
  };

  const onChatUpdated = () => {
    fetchChats();
  };

  const handleSelectChat = (id: string) => {
    setActiveChat(id);
    setView("chat");
    if (isMobile) setSidebarOpen(false);
  };

  const handleViewChange = (v: "chat" | "tasks") => {
    setView(v);
    if (isMobile) setSidebarOpen(false);
  };

  if (isPending || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-background">
      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        onNewChat={createChat}
        onDeleteChat={deleteChat}
        view={view}
        onViewChange={handleViewChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
      />

      <main className="relative flex flex-1 flex-col overflow-hidden">
        {view === "chat" ? (
          <ChatArea
            key={activeChat ?? "empty"}
            chatId={activeChat}
            onNewChat={createChat}
            onChatUpdated={onChatUpdated}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        ) : (
          <TaskView
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        )}
      </main>
    </div>
  );
}
