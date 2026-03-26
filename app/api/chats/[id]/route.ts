import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const chat = await prisma.chat.findUnique({
    where: { id, userId: session.user.id }
  });

  if (!chat) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { chatId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  // Verify ownership before delete
  const chat = await prisma.chat.findUnique({
    where: { id, userId: session.user.id }
  });

  if (!chat) {
    return new NextResponse("Not Found", { status: 404 });
  }

  await prisma.chat.delete({
    where: { id },
  });
  return NextResponse.json({ ok: true });
}
