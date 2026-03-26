import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const memories = await prisma.memory.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(memories);
  } catch (error) {
    console.error("Error fetching memories:", error);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}
