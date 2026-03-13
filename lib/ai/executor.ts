import { prisma } from "@/lib/prisma";
import { Operations } from "./schema";
import { getProjectColor } from "@/lib/colors";

export async function executeOperations(
  operations: Operations["operations"]
): Promise<void> {
  if (operations.length === 0) return;

  // Sort: project creations first so CREATE_ITEM can reference them
  const sorted = [...operations].sort((a, b) => {
    if (a.action === "CREATE_PROJECT") return -1;
    if (b.action === "CREATE_PROJECT") return 1;
    return 0;
  });

  // Track newly created projects by name for cross-referencing in same batch
  const newProjects: Record<string, string> = {};

  await prisma.$transaction(async (tx) => {
    for (const op of sorted) {
      switch (op.action) {
        case "CREATE_PROJECT": {
          const existing = await tx.project.findUnique({
            where: { name: op.projectName },
          });
          if (!existing) {
            const created = await tx.project.create({
              data: {
                name: op.projectName,
                emoji: op.emoji,
                description: op.description,
                color: getProjectColor(),
              },
            });
            newProjects[op.projectName] = created.id;
          } else {
            newProjects[op.projectName] = existing.id;
            // Reactivate if archived
            await tx.project.update({
              where: { id: existing.id },
              data: { isActive: true },
            });
          }
          break;
        }

        case "ARCHIVE_PROJECT": {
          await tx.project.update({
            where: { id: op.projectId },
            data: { isActive: false },
          });
          break;
        }

        case "CREATE_ITEM": {
          let projectId = newProjects[op.projectName];
          if (!projectId) {
            const project = await tx.project.findUnique({
              where: { name: op.projectName },
            });
            if (!project)
              throw new Error(
                `Project not found: ${op.projectName}`
              );
            projectId = project.id;
          }
          await tx.item.create({
            data: {
              type: op.type,
              title: op.title,
              content: op.content,
              status: op.status ?? "TODO",
              dueDate: op.dueDate
                ? new Date(op.dueDate)
                : undefined,
              projectId,
            },
          });
          break;
        }

        case "UPDATE_ITEM_STATUS": {
          await tx.item.update({
            where: { id: op.itemId },
            data: { status: op.newStatus },
          });
          break;
        }

        case "UPDATE_ITEM_CONTENT": {
          await tx.item.update({
            where: { id: op.itemId },
            data: {
              ...(op.newTitle && { title: op.newTitle }),
              ...(op.newContent && { content: op.newContent }),
            },
          });
          break;
        }
      }
    }
  });
}
