// app/api/messages/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/messages?personaId=xxx — load chat history
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const personaId = searchParams.get("personaId");
  if (!personaId) return NextResponse.json({ error: "personaId required" }, { status: 400 });

  // Verify ownership
  const persona = await db.persona.findUnique({ where: { id: personaId } });
  if (!persona || persona.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await db.message.findMany({
    where: { personaId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

// POST /api/messages — save a message
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { personaId, role, content } = await req.json();

  // Verify ownership
  const persona = await db.persona.findUnique({ where: { id: personaId } });
  if (!persona || persona.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = await db.message.create({
    data: { personaId, role, content },
  });

  // Update message count
  await db.persona.update({
    where: { id: personaId },
    data: { messageCount: { increment: 1 } },
  });

  return NextResponse.json(message, { status: 201 });
}