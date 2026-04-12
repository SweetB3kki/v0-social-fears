import { InstrumentKind, Prisma, SessionStatus } from "@prisma/client";
import { calculateAuthorResult, calculateLiebowitzResult, calculateSocialAnxietyResult } from "@/lib/assessment";
import { AUTHOR_QUESTIONS, LIEBOWITZ_SITUATIONS, SOCIAL_ANXIETY_QUESTIONS } from "@/lib/instruments";
import { prisma } from "@/lib/prisma";

type ScoreMap = Partial<Record<InstrumentKind, Prisma.JsonValue>>;

const sessionInclude = {
  responses: {
    orderBy: { questionKey: "asc" as const },
  },
  scores: true,
} satisfies Prisma.AssessmentSessionInclude;

export type GroupSummary = {
  id: string;
  code: string;
  participantCount: number;
  completedCount: number;
  updatedAt: string;
};

export type GroupParticipantSummary = {
  id: string;
  displayName: string;
  hasCompleted: boolean;
  submittedAt: string | null;
  socialAnxietyTotal: number | null;
  socialAnxietyLevel: string | null;
  authorProfile: string | null;
  liebowitzConflictCount: number | null;
};

export type GroupReport = {
  group: {
    id: string;
    code: string;
    participantCount: number;
    completedCount: number;
  };
  aggregates: {
    socialAnxietyAverage: number | null;
    fearAverage: number | null;
    avoidanceAverage: number | null;
    participationAverage: number | null;
    authorAverage: number | null;
  };
  participants: GroupParticipantSummary[];
};

export type ParticipantReport = {
  participant: {
    id: string;
    displayName: string;
    groupId: string;
    groupCode: string;
  };
  session: {
    id: string;
    submittedAt: string;
  } | null;
  socialAnxiety: ReturnType<typeof calculateSocialAnxietyResult> | null;
  liebowitz: ReturnType<typeof calculateLiebowitzResult> | null;
  author: ReturnType<typeof calculateAuthorResult> | null;
  responses: {
    socialAnxiety: Array<{ key: string; text: string; value: number }>;
    liebowitz: Array<{
      key: string;
      text: string;
      fear: number;
      avoidance: number;
      participationIfSuccess: number;
    }>;
    author: Array<{ key: string; text: string; value: number }>;
  };
};

export async function listGroupSummaries(): Promise<GroupSummary[]> {
  const groups = await prisma.studyGroup.findMany({
    orderBy: { code: "asc" },
    include: {
      participants: {
        select: {
          id: true,
          sessions: {
            where: { status: SessionStatus.COMPLETED },
            select: { id: true },
          },
        },
      },
    },
  });

  return groups.map((group) => ({
    id: group.id,
    code: group.code,
    participantCount: group.participants.length,
    completedCount: group.participants.filter((participant) => participant.sessions.length > 0).length,
    updatedAt: group.updatedAt.toISOString(),
  }));
}

export async function getGroupReport(groupId: string): Promise<GroupReport | null> {
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
    include: {
      participants: {
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        include: {
          sessions: {
            where: { status: SessionStatus.COMPLETED },
            orderBy: { submittedAt: "desc" },
            take: 1,
            include: sessionInclude,
          },
        },
      },
    },
  });

  if (!group) return null;

  const participants = group.participants.map((participant) => {
    const session = participant.sessions[0] ?? null;
    const scores = mapScores(session?.scores);

    const socialAnxiety = scores.SOCIAL_ANXIETY as { total?: number; levelLabel?: string } | undefined;
    const liebowitz = scores.LIEBOWITZ_MODIFIED as { conflictZones?: unknown[] } | undefined;
    const author = scores.AUTHOR_SOCIAL_FEARS as { profileLabel?: string } | undefined;

    return {
      id: participant.id,
      displayName: buildDisplayName(participant.lastName, participant.firstName, participant.middleName),
      hasCompleted: Boolean(session),
      submittedAt: session?.submittedAt?.toISOString() ?? null,
      socialAnxietyTotal: typeof socialAnxiety?.total === "number" ? socialAnxiety.total : null,
      socialAnxietyLevel: typeof socialAnxiety?.levelLabel === "string" ? socialAnxiety.levelLabel : null,
      authorProfile: typeof author?.profileLabel === "string" ? author.profileLabel : null,
      liebowitzConflictCount: Array.isArray(liebowitz?.conflictZones) ? liebowitz.conflictZones.length : null,
    };
  });

  const completedSessions = group.participants.flatMap((participant) => participant.sessions);
  const scoreMaps = completedSessions.map((session) => mapScores(session.scores));

  return {
    group: {
      id: group.id,
      code: group.code,
      participantCount: group.participants.length,
      completedCount: completedSessions.length,
    },
    aggregates: {
      socialAnxietyAverage: averageFromScores(scoreMaps, "SOCIAL_ANXIETY", "total"),
      fearAverage: averageFromScores(scoreMaps, "LIEBOWITZ_MODIFIED", "fearTotal"),
      avoidanceAverage: averageFromScores(scoreMaps, "LIEBOWITZ_MODIFIED", "avoidanceTotal"),
      participationAverage: averageFromScores(scoreMaps, "LIEBOWITZ_MODIFIED", "participationTotal"),
      authorAverage: averageFromScores(scoreMaps, "AUTHOR_SOCIAL_FEARS", "total"),
    },
    participants,
  };
}

export async function getParticipantReport(participantId: string): Promise<ParticipantReport | null> {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: {
      group: true,
      sessions: {
        where: { status: SessionStatus.COMPLETED },
        orderBy: { submittedAt: "desc" },
        take: 1,
        include: sessionInclude,
      },
    },
  });

  if (!participant) return null;

  const session = participant.sessions[0] ?? null;
  const scoreMap = mapScores(session?.scores);
  const answerMap = mapAnswers(session?.responses);

  return {
    participant: {
      id: participant.id,
      displayName: buildDisplayName(participant.lastName, participant.firstName, participant.middleName),
      groupId: participant.groupId,
      groupCode: participant.group.code,
    },
    session: session?.submittedAt
      ? {
          id: session.id,
          submittedAt: session.submittedAt.toISOString(),
        }
      : null,
    socialAnxiety: (scoreMap.SOCIAL_ANXIETY as ReturnType<typeof calculateSocialAnxietyResult>) ?? null,
    liebowitz: (scoreMap.LIEBOWITZ_MODIFIED as ReturnType<typeof calculateLiebowitzResult>) ?? null,
    author: (scoreMap.AUTHOR_SOCIAL_FEARS as ReturnType<typeof calculateAuthorResult>) ?? null,
    responses: {
      socialAnxiety: SOCIAL_ANXIETY_QUESTIONS.map((question) => ({
        key: question.key,
        text: question.text,
        value: Number(answerMap.SOCIAL_ANXIETY[question.key]?.value ?? 0),
      })),
      liebowitz: LIEBOWITZ_SITUATIONS.map((situation) => ({
        key: situation.key,
        text: situation.text,
        fear: Number(answerMap.LIEBOWITZ_MODIFIED[situation.key]?.fear ?? 1),
        avoidance: Number(answerMap.LIEBOWITZ_MODIFIED[situation.key]?.avoidance ?? 1),
        participationIfSuccess: Number(answerMap.LIEBOWITZ_MODIFIED[situation.key]?.participationIfSuccess ?? 1),
      })),
      author: AUTHOR_QUESTIONS.map((question) => ({
        key: question.key,
        text: question.text,
        value: Number(answerMap.AUTHOR_SOCIAL_FEARS[question.key]?.value ?? 0),
      })),
    },
  };
}

function buildDisplayName(lastName: string, firstName: string, _middleName: string | null) {
  return [lastName, firstName].filter(Boolean).join(" ");
}

function mapScores(scores: Array<{ instrument: InstrumentKind; scores: Prisma.JsonValue }> | undefined): ScoreMap {
  return Object.fromEntries((scores ?? []).map((score) => [score.instrument, score.scores])) as ScoreMap;
}

function mapAnswers(
  responses: Array<{ instrument: InstrumentKind; questionKey: string; answer: Prisma.JsonValue }> | undefined,
) {
  const base = {
    SOCIAL_ANXIETY: {} as Record<string, Record<string, unknown>>,
    LIEBOWITZ_MODIFIED: {} as Record<string, Record<string, unknown>>,
    AUTHOR_SOCIAL_FEARS: {} as Record<string, Record<string, unknown>>,
  };

  for (const response of responses ?? []) {
    const answer = typeof response.answer === "object" && response.answer ? (response.answer as Record<string, unknown>) : {};
    base[response.instrument][response.questionKey] = answer;
  }

  return base;
}

function averageFromScores(scoreMaps: ScoreMap[], instrument: InstrumentKind, key: string): number | null {
  const values = scoreMaps
    .map((scoreMap) => {
      const score = scoreMap[instrument];
      if (!score || typeof score !== "object") return null;
      const value = (score as Record<string, unknown>)[key];
      return typeof value === "number" ? value : null;
    })
    .filter((value): value is number => value !== null);

  if (values.length === 0) return null;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}
