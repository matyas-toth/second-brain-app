import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    include: {
      items: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return NextResponse.json(projects);
}
