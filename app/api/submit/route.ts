import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { InstrumentKind, SessionStatus } from "@prisma/client";
import {
  calculateAuthorResult,
  calculateLiebowitzResult,
  calculateSocialAnxietyResult,
  LiebowitzSituationAnswer,
} from "@/lib/assessment";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type SubmitPayload = {
  participantId?: string;
  groupId?: string;
  meta?: {
    startedAt?: string;
    durationSeconds?: number;
  };
  responses?: Array<{
    instrument?: InstrumentKind;
    questionKey?: string;
    answer?: unknown;
  }>;
};

function json(payload: unknown, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let payload: SubmitPayload;
  try {
    payload = (await request.json()) as SubmitPayload;
  } catch {
    return json({ error: "Некорректный запрос." }, 400);
  }

  if (!payload.participantId || !payload.groupId || !Array.isArray(payload.responses) || payload.responses.length === 0) {
    return json({ error: "Недостаточно данных для сохранения тестирования." }, 400);
  }

  const participant = await prisma.participant.findUnique({
    where: { id: payload.participantId },
    select: { id: true, groupId: true },
  });

  if (!participant || participant.groupId !== payload.groupId) {
    return json({ error: "Участник не найден или не соответствует указанной группе." }, 404);
  }

  const cookieStore = await cookies();
  const isAdmin = isAdminAuthenticated(cookieStore);

  const completedSession = await prisma.assessmentSession.findFirst({
    where: {
      participantId: payload.participantId,
      status: SessionStatus.COMPLETED,
    },
    select: { id: true },
  });

  if (completedSession && !isAdmin) {
    return json({ error: "Тест уже был завершён для этого участника." }, 409);
  }

  const responseRows = payload.responses.flatMap((response) => {
    if (!response.instrument || !response.questionKey || typeof response.answer === "undefined") return [];
    return {
      instrument: response.instrument,
      questionKey: response.questionKey,
      answer: response.answer,
    };
  });

  if (responseRows.length === 0) {
    return json({ error: "Не получены ответы на опросники." }, 400);
  }

  const socialAnxietyAnswers = collectScalarAnswers(responseRows, InstrumentKind.SOCIAL_ANXIETY);
  const liebowitzAnswers = collectLiebowitzAnswers(responseRows);
  const authorAnswers = collectScalarAnswers(responseRows, InstrumentKind.AUTHOR_SOCIAL_FEARS);

  const socialAnxiety = calculateSocialAnxietyResult(socialAnxietyAnswers);
  const liebowitz = calculateLiebowitzResult(liebowitzAnswers);
  const author = calculateAuthorResult(authorAnswers);

  const session = await prisma.$transaction(async (tx) => {
    const createdSession = await tx.assessmentSession.create({
      data: {
        participantId: payload.participantId!,
        groupId: payload.groupId!,
        status: SessionStatus.COMPLETED,
        submittedAt: new Date(),
        meta: {
          startedAt: payload.meta?.startedAt ?? null,
          durationSeconds: typeof payload.meta?.durationSeconds === "number" ? payload.meta.durationSeconds : null,
          submittedByAdmin: isAdmin,
        },
      },
    });

    await tx.response.createMany({
      data: responseRows.map((response) => ({
        sessionId: createdSession.id,
        instrument: response.instrument,
        questionKey: response.questionKey,
        answer: response.answer as object,
      })),
    });

    await tx.scoreSnapshot.createMany({
      data: [
        {
          sessionId: createdSession.id,
          instrument: InstrumentKind.SOCIAL_ANXIETY,
          scores: socialAnxiety,
          interpretation: {
            summary: socialAnxiety.interpretation,
          },
        },
        {
          sessionId: createdSession.id,
          instrument: InstrumentKind.LIEBOWITZ_MODIFIED,
          scores: liebowitz,
          interpretation: {
            summary: liebowitz.interpretation,
          },
        },
        {
          sessionId: createdSession.id,
          instrument: InstrumentKind.AUTHOR_SOCIAL_FEARS,
          scores: author,
          interpretation: {
            summary: author.interpretation,
          },
        },
      ],
    });

    return createdSession;
  });

  return json({ sessionId: session.id });
}

function collectScalarAnswers(
  responses: Array<{ instrument: InstrumentKind; questionKey: string; answer: unknown }>,
  instrument: InstrumentKind,
) {
  return Object.fromEntries(
    responses
      .filter((response) => response.instrument === instrument)
      .map((response) => {
        const answer = response.answer as { value?: unknown };
        return [response.questionKey, Number(answer?.value ?? 0)];
      }),
  ) as Record<string, number>;
}

function collectLiebowitzAnswers(
  responses: Array<{ instrument: InstrumentKind; questionKey: string; answer: unknown }>,
) {
  return Object.fromEntries(
    responses
      .filter((response) => response.instrument === InstrumentKind.LIEBOWITZ_MODIFIED)
      .map((response) => {
        const answer = (response.answer as Partial<LiebowitzSituationAnswer>) ?? {};
        return [
          response.questionKey,
          {
            fear: Number(answer.fear ?? 1),
            avoidance: Number(answer.avoidance ?? 1),
            participationIfSuccess: Number(answer.participationIfSuccess ?? 1),
          },
        ];
      }),
  ) as Record<string, LiebowitzSituationAnswer>;
}
