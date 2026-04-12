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
  { params }: { params: Promise<{ groupId: string }> },
) {
  const cookieStore = await cookies();
  if (!isAdminAuthenticated(cookieStore)) {
    return json({ error: "Требуется авторизация администратора." }, 401);
  }

  const { groupId } = await params;
  const existingGroup = await prisma.studyGroup.findUnique({
    where: { id: groupId },
    select: { id: true, code: true },
  });

  if (!existingGroup) {
    return json({ error: "Группа не найдена." }, 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.assessmentSession.deleteMany({
      where: { groupId },
    });

    await tx.participant.deleteMany({
      where: { groupId },
    });

    await tx.studyGroup.delete({
      where: { id: groupId },
    });
  });

  return json({ success: true, deletedGroupId: groupId, deletedGroupCode: existingGroup.code });
}
