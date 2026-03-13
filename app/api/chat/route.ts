import { deepseek } from "@ai-sdk/deepseek";
import {
  streamText,
  generateText,
  Output,
  UIMessage,
  convertToModelMessages,
} from "ai";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { OperationsSchema } from "@/lib/ai/schema";
import { executeOperations } from "@/lib/ai/executor";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, chatId }: { messages: UIMessage[]; chatId: string } =
    await req.json();

  // Build system prompt with current state
  const systemPrompt = await buildSystemPrompt();

  // Get the last user message content
  const lastUserMessage = messages
    .filter((m) => m.role === "user")
    .pop();

  let userText = "";
  if (lastUserMessage) {
    // Extract text from parts
    for (const part of lastUserMessage.parts) {
      if (part.type === "text") {
        userText += part.text;
      }
    }
  }

  // Save user message to DB
  if (chatId && userText) {
    await prisma.message.create({
      data: {
        chatId,
        role: "user",
        content: userText,
      },
    });

    // Update chat title from first message
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });
    if (chat && chat.title === "New Chat") {
      const title =
        userText.length > 50
          ? userText.substring(0, 50) + "..."
          : userText;
      await prisma.chat.update({
        where: { id: chatId },
        data: { title },
      });
    }
  }

  // First pass: extract operations using generateText + Output.object
  try {
    const extractionResult = await generateText({
      model: deepseek("deepseek-chat"),
      system: systemPrompt,
      prompt: `Parse this message and extract all actionable operations:\n\n"${userText}"`,
      output: Output.object({
        schema: OperationsSchema,
      }),
    });

    if (extractionResult.output) {
      const { operations, summary } = extractionResult.output;

      // Execute operations in transaction
      await executeOperations(operations);

      console.log(
        `[AI] Executed ${operations.length} operations: ${summary}`
      );
    }
  } catch (err) {
    console.error("[AI] Operation extraction failed:", err);
    // Continue to conversational reply even if extraction fails
  }

  // Second pass: conversational reply
  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: `${systemPrompt}

You are also having a friendly conversation. Respond naturally in the same language the user writes in (usually Hungarian).
If you extracted and executed operations, briefly confirm what you did.
Be concise and casual — like a smart assistant chatting with a friend.
Don't output JSON — just talk naturally.`,
    messages: await convertToModelMessages(messages),
    async onFinish({ text }) {
      // Save assistant reply to DB
      if (chatId && text) {
        await prisma.message.create({
          data: {
            chatId,
            role: "assistant",
            content: text,
          },
        });
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
