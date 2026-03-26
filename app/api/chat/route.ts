import { deepseek } from "@ai-sdk/deepseek";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  stepCountIs,
} from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { getProjectColor } from "@/lib/colors";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createProjectInput,
  archiveProjectInput,
  addItemInput,
  updateItemStatusInput,
  updateItemContentInput,
  saveMemoryInput,
  searchMemoriesInput,
} from "@/lib/ai/schema";

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, chatId }: { messages: UIMessage[]; chatId: string } =
    await req.json();

  const userId = session.user.id;
  const systemPrompt = await buildSystemPrompt(userId);

  // Verify chat ownership
  if (chatId) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId, userId },
    });
    if (!chat) {
      return new Response("Not Found", { status: 404 });
    }
  }

  // Get the last user message content
  const lastUserMessage = messages.filter((m) => m.role === "user").pop();
  let userText = "";
  if (lastUserMessage) {
    for (const part of lastUserMessage.parts) {
      if (part.type === "text") {
        userText += part.text;
      }
    }
  }

  // Save user message to DB
  if (chatId && userText) {
    await prisma.message.create({
      data: { chatId, role: "user", content: userText },
    });

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (chat && chat.title === "New Chat") {
      const title =
        userText.length > 50 ? userText.substring(0, 50) + "..." : userText;
      await prisma.chat.update({ where: { id: chatId }, data: { title } });
    }
  }

  // Single-pass: streamText with tools — AI calls tools inline, then writes a reply
  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      createProject: {
        description:
          "Create a new project. Use when the user mentions a new project or context that doesn't exist yet.",
        inputSchema: createProjectInput,
        execute: async ({ projectName, emoji, description }) => {
          const existing = await prisma.project.findUnique({
            where: { userId_name: { userId, name: projectName } },
          });
          if (existing) {
            await prisma.project.update({
              where: { id: existing.id },
              data: { isActive: true },
            });
            return `Reactivated project ${projectName}`;
          }
          await prisma.project.create({
            data: {
              name: projectName,
              emoji,
              description,
              color: getProjectColor(),
              userId,
            },
          });
          return `Created project ${emoji || ""} ${projectName}`.trim();
        },
      },

      archiveProject: {
        description:
          "Archive a project when the user says they're stepping back, pausing, or stopping work on it.",
        inputSchema: archiveProjectInput,
        execute: async ({ projectId }) => {
          const project = await prisma.project.findUnique({
            where: { id: projectId, userId },
          });
          if (!project) return "Error: Project not found or unauthorized";
          await prisma.project.update({
            where: { id: projectId },
            data: { isActive: false },
          });
          return `Archived project ${project.name}`;
        },
      },

      addItem: {
        description:
          "Add a task, note, or idea to a project. You can create multiple items by calling this tool multiple times.",
        inputSchema: addItemInput,
        execute: async ({
          projectName,
          type,
          title,
          content,
          status,
          dueDate,
        }) => {
          const project = await prisma.project.findUnique({
            where: { userId_name: { userId, name: projectName } },
          });
          if (!project) {
            return `Error: Project "${projectName}" not found or unauthorized`;
          }
          await prisma.item.create({
            data: {
              type,
              title,
              content,
              status: status ?? "TODO",
              dueDate: dueDate ? new Date(dueDate) : undefined,
              projectId: project.id,
            },
          });
          const typeLabel =
            type === "TASK" ? "task" : type === "NOTE" ? "note" : "idea";
          return `Added ${typeLabel} "${title}" to ${projectName}`;
        },
      },

      updateItemStatus: {
        description:
          "Change the status of an existing item. Use when the user says they completed, started, or paused something.",
        inputSchema: updateItemStatusInput,
        execute: async ({ itemId, newStatus }) => {
          const item = await prisma.item.findFirst({
            where: { id: itemId, project: { userId } },
            include: { project: true },
          });
          if (!item) return `Error: Item not found or unauthorized`;
          await prisma.item.update({
            where: { id: itemId },
            data: { status: newStatus },
          });
          const statusMap: Record<string, string> = {
            TODO: "Todo",
            IN_PROGRESS: "In Progress",
            WAITING: "On Hold",
            DONE: "Done",
          };
          return `Moved "${item.title}" to ${statusMap[newStatus] || newStatus}`;
        },
      },

      updateItemContent: {
        description:
          "Update the title or content of an existing item.",
        inputSchema: updateItemContentInput,
        execute: async ({ itemId, newTitle, newContent }) => {
          const item = await prisma.item.findFirst({
            where: { id: itemId, project: { userId } },
          });
          if (!item) return `Error: Item not found or unauthorized`;
          await prisma.item.update({
            where: { id: itemId },
            data: {
              ...(newTitle && { title: newTitle }),
              ...(newContent && { content: newContent }),
            },
          });
          return `Updated "${item.title}"${newTitle ? ` to "${newTitle}"` : ""}`;
        },
      },

      saveMemory: {
        description: "Save an important snippet, note, or fact into the brain for later retrieval.",
        inputSchema: saveMemoryInput,
        execute: async ({ content }) => {
          await prisma.memory.create({ data: { content, userId } });
          return `Memory saved: "${content.substring(0, 30)}..."`;
        },
      },

      searchMemories: {
        description: "Search the brain's Vault for past notes, facts, and snippets.",
        inputSchema: searchMemoriesInput,
        execute: async ({ query }) => {
          // Intense fuzzy search using ILIKE
          const memories = await prisma.memory.findMany({
            where: {
              userId,
              content: { contains: query, mode: "insensitive" },
            },
            take: 5,
            orderBy: { createdAt: "desc" },
          });
          if (memories.length === 0) {
            return `No memories found matching "${query}".`;
          }
          const results = memories.map((m) => `[Date: ${m.createdAt.toISOString()}] ${m.content}`).join("\n\n");
          return `Found ${memories.length} memories:\n\n${results}`;
        },
      },
    },
    stopWhen: stepCountIs(5),
    async onFinish({ text }) {
      if (chatId && text) {
        await prisma.message.create({
          data: { chatId, role: "assistant", content: text },
        });
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
