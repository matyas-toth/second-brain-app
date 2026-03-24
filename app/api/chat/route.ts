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
import {
  createProjectInput,
  archiveProjectInput,
  addItemInput,
  updateItemStatusInput,
  updateItemContentInput,
} from "@/lib/ai/schema";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, chatId }: { messages: UIMessage[]; chatId: string } =
    await req.json();

  const systemPrompt = await buildSystemPrompt();

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
            where: { name: projectName },
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
            where: { id: projectId },
          });
          await prisma.project.update({
            where: { id: projectId },
            data: { isActive: false },
          });
          return `Archived project ${project?.name || projectId}`;
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
            where: { name: projectName },
          });
          if (!project) {
            return `Error: Project "${projectName}" not found`;
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
          const item = await prisma.item.findUnique({
            where: { id: itemId },
            include: { project: true },
          });
          if (!item) return `Error: Item not found`;
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
          const item = await prisma.item.findUnique({
            where: { id: itemId },
          });
          if (!item) return `Error: Item not found`;
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
