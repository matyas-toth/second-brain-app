import { z } from "zod";

const CreateProjectOperation = z.object({
  action: z.literal("CREATE_PROJECT"),
  projectName: z
    .string()
    .describe("The name of the new project to create"),
  emoji: z
    .string()
    .optional()
    .describe("A relevant emoji for this project"),
  description: z.string().optional(),
});

const ArchiveProjectOperation = z.object({
  action: z.literal("ARCHIVE_PROJECT"),
  projectId: z
    .string()
    .describe("The ID of the project to archive (set isActive=false)"),
});

const CreateItemOperation = z.object({
  action: z.literal("CREATE_ITEM"),
  projectName: z
    .string()
    .describe(
      "Name of the project this item belongs to — can be a newly created project from the same batch"
    ),
  type: z.enum(["TASK", "NOTE", "IDEA"]),
  title: z.string(),
  content: z.string().optional(),
  status: z
    .enum(["TODO", "IN_PROGRESS", "WAITING", "DONE"])
    .default("TODO"),
  dueDate: z
    .string()
    .optional()
    .describe("ISO date string if a deadline is mentioned"),
});

const UpdateItemStatusOperation = z.object({
  action: z.literal("UPDATE_ITEM_STATUS"),
  itemId: z
    .string()
    .describe(
      "The ID of the item to update, from the injected state"
    ),
  newStatus: z.enum(["TODO", "IN_PROGRESS", "WAITING", "DONE"]),
});

const UpdateItemContentOperation = z.object({
  action: z.literal("UPDATE_ITEM_CONTENT"),
  itemId: z.string(),
  newTitle: z.string().optional(),
  newContent: z.string().optional(),
});

export const OperationsSchema = z.object({
  operations: z.array(
    z.discriminatedUnion("action", [
      CreateProjectOperation,
      ArchiveProjectOperation,
      CreateItemOperation,
      UpdateItemStatusOperation,
      UpdateItemContentOperation,
    ])
  ),
  summary: z
    .string()
    .describe(
      "A brief human-readable summary in Hungarian of what was done, max 2 sentences."
    ),
});

export type Operations = z.infer<typeof OperationsSchema>;
