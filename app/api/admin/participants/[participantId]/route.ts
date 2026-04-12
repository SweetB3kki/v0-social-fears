import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function json(payload: unknown, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ participantId: string }> },
) {
  const cookieStore = await cookies();
  if (!isAdminAuthenticated(cookieStore)) {
    return json({ error: "Требуется авторизация администратора." }, 401);
  }

  const { participantId } = await params;
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    select: { id: true, lastName: true, firstName: true },
  });

  if (!participant) {
    return json({ error: "Участник не найден." }, 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.assessmentSession.deleteMany({
      where: { participantId },
    });

    await tx.participant.delete({
      where: { id: participantId },
    });
  });

  return json({
    success: true,
    deletedParticipantId: participantId,
    deletedParticipantName: [participant.lastName, participant.firstName].join(" "),
  });
}
