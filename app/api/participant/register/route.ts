import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SessionStatus } from "@prisma/client";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type RegisterPayload = {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  groupCode?: string;
};

function json(payload: unknown, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let payload: RegisterPayload;
  try {
    payload = (await request.json()) as RegisterPayload;
  } catch {
    return json({ error: "Некорректный запрос." }, 400);
  }

  const lastName = normalizeNamePart(payload.lastName);
  const firstName = normalizeNamePart(payload.firstName);
  const middleName = normalizeOptionalNamePart(payload.middleName);
  const groupCode = normalizeGroupCode(payload.groupCode);

  if (!lastName || !firstName || !groupCode) {
    return json({ error: "Укажите фамилию, имя и учебную группу." }, 400);
  }

  try {
    const group = await prisma.studyGroup.upsert({
      where: { code: groupCode },
      update: {},
      create: { code: groupCode },
    });

    const participant = await prisma.participant.upsert({
      where: {
        groupId_lastName_firstName_middleName: {
          groupId: group.id,
          lastName,
          firstName,
          middleName,
        },
      },
      update: {},
      create: {
        lastName,
        firstName,
        middleName,
        groupId: group.id,
      },
    });

    const cookieStore = await cookies();
    const isAdmin = isAdminAuthenticated(cookieStore);

    const completedSession = await prisma.assessmentSession.findFirst({
      where: {
        participantId: participant.id,
        status: SessionStatus.COMPLETED,
      },
      orderBy: { submittedAt: "desc" },
      select: { id: true },
    });

    return json({
      participantId: participant.id,
      groupId: group.id,
      groupCode: group.code,
      displayName: [participant.lastName, participant.firstName].filter(Boolean).join(" "),
      alreadyCompleted: Boolean(completedSession),
      isAdminRetake: isAdmin,
    });
  } catch (error) {
    const message =
      error instanceof Error && "code" in error && error.code === "P2024"
        ? "Подключение к базе данных занято. Повторите попытку через несколько секунд."
        : "Не удалось зарегистрировать участника. Повторите попытку.";

    return json({ error: message }, 503);
  }
}

function normalizeNamePart(value: string | undefined) {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeOptionalNamePart(value: string | undefined) {
  const normalized = normalizeNamePart(value);
  return normalized || "";
}

function normalizeGroupCode(value: string | undefined) {
  return (value ?? "").trim().replace(/\s+/g, "").toUpperCase();
}
