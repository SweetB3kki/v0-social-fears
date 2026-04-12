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

export async function GET() {
  const cookieStore = await cookies();
  if (!isAdminAuthenticated(cookieStore)) {
    return json({ error: "Требуется авторизация администратора." }, 401);
  }

  const groups = await prisma.studyGroup.findMany({
    orderBy: { code: "asc" },
    include: {
      participants: {
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        include: {
          sessions: {
            where: { status: SessionStatus.COMPLETED },
            select: { id: true, submittedAt: true },
            orderBy: { submittedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  return json({
    groups: groups.map((group) => ({
      id: group.id,
      code: group.code,
      participantCount: group.participants.length,
      completedCount: group.participants.filter((participant) => participant.sessions.length > 0).length,
      participants: group.participants.map((participant) => ({
        id: participant.id,
        displayName: [participant.lastName, participant.firstName].filter(Boolean).join(" "),
        hasCompleted: participant.sessions.length > 0,
        submittedAt: participant.sessions[0]?.submittedAt?.toISOString() ?? null,
      })),
    })),
  });
}
