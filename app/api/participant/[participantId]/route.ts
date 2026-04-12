import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SessionStatus } from "@prisma/client";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function json(payload: unknown, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ participantId: string }> },
) {
  const { participantId } = await params;

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: {
      group: true,
      sessions: {
        where: { status: SessionStatus.COMPLETED },
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: { id: true },
      },
    },
  });

  if (!participant) {
    return json({ error: "Участник не найден." }, 404);
  }

  const cookieStore = await cookies();

  return json({
    participantId: participant.id,
    groupId: participant.groupId,
    groupCode: participant.group.code,
    displayName: [participant.lastName, participant.firstName].filter(Boolean).join(" "),
    alreadyCompleted: participant.sessions.length > 0,
    isAdminRetake: isAdminAuthenticated(cookieStore),
  });
}
