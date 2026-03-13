"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { TaskView } from "@/components/tasks/TaskView";

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function Page() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [view, setView] = useState<"chat" | "tasks">("chat");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchChats = useCallback(async () => {
    const res = await fetch("/api/chats");
    const data = await res.json();
    setChats(data);
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const createChat = async () => {
    const res = await fetch("/api/chats", { method: "POST" });
    const chat = await res.json();
    setChats((prev) => [chat, ...prev]);
    setActiveChat(chat.id);
    setView("chat");
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        onSelectChat={(id) => {
          setActiveChat(id);
          setView("chat");
        }}
        onNewChat={createChat}
        onDeleteChat={deleteChat}
        view={view}
        onViewChange={setView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
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
