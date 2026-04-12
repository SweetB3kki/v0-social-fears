import {
  AUTHOR_QUESTIONS,
  LIEBOWITZ_SITUATIONS,
  SOCIAL_ANXIETY_QUESTIONS,
} from "@/lib/instruments";

export type SocialAnxietyLevelCode =
  | "NONE"
  | "INTERMEDIATE"
  | "MODERATE"
  | "ELEVATED"
  | "HIGH"
  | "CLINICAL"
  | "DECOMPENSATED";

export type SocialAnxietyResult = {
  total: number;
  levelCode: SocialAnxietyLevelCode;
  levelLabel: string;
  interpretation: string;
};

export type LiebowitzSituationAnswer = {
  fear: number;
  avoidance: number;
  participationIfSuccess: number;
};

export type LiebowitzConflictZone = {
  key: string;
  text: string;
  label: string;
  fear: number;
  avoidance: number;
  participationIfSuccess: number;
};

export type LiebowitzResult = {
  fearTotal: number;
  avoidanceTotal: number;
  participationTotal: number;
  conflictZones: LiebowitzConflictZone[];
  interpretation: string;
};

export type AuthorScaleCode = "fearOfEvaluation" | "communicationConstraint" | "avoidanceBehavior";
export type AuthorScaleLevel = "LOW" | "MODERATE" | "HIGH";
export type AuthorProfileType =
  | "EVALUATIVE_ANXIOUS"
  | "COMMUNICATIVE_CONSTRAINED"
  | "AVOIDANT"
  | "DIFFUSE_ANXIOUS"
  | "MIXED";

export type AuthorScaleResult = {
  code: AuthorScaleCode;
  label: string;
  total: number;
  level: AuthorScaleLevel;
  levelLabel: string;
};

export type AuthorResult = {
  total: number;
  overallLevelLabel: string;
  profileType: AuthorProfileType;
  profileLabel: string;
  interpretation: string;
  scales: Record<AuthorScaleCode, AuthorScaleResult>;
};

const SOCIAL_ANXIETY_LEVELS: Array<{
  max: number;
  code: SocialAnxietyLevelCode;
  label: string;
  interpretation: string;
}> = [
  {
    max: 15,
    code: "NONE",
    label: "Не выраженная социальная тревога",
    interpretation: "Показатели находятся в пределах социальной смелости и не указывают на выраженную дезадаптацию.",
  },
  {
    max: 29,
    code: "INTERMEDIATE",
    label: "Промежуточная зона",
    interpretation: "Возможны эпизодические проявления социальной тревоги в ситуациях оценивания при сохранении общей адаптации.",
  },
  {
    max: 39,
    code: "MODERATE",
    label: "Умеренно повышенная социальная тревога",
    interpretation: "Тревога заметна и может усиливаться в ряде социальных ситуаций, особенно в условиях публичной оценки.",
  },
  {
    max: 49,
    code: "ELEVATED",
    label: "Повышенная социальная тревога",
    interpretation: "Отмечаются выраженная чувствительность к оценке и риск трудностей социальной адаптации.",
  },
  {
    max: 59,
    code: "HIGH",
    label: "Высокая социальная тревога",
    interpretation: "Вероятны выраженные трудности самопредъявления, высокий стресс и склонность избегать сложные социальные ситуации.",
  },
  {
    max: 69,
    code: "CLINICAL",
    label: "Клиническая социофобия",
    interpretation: "Профиль близок к клинически значимой социофобии и требует внимательной профессиональной оценки.",
  },
  {
    max: 999,
    code: "DECOMPENSATED",
    label: "Клиническая социофобия в декомпенсации",
    interpretation: "Очень высокая выраженность социальной тревоги указывает на зону риска дезадаптации и сопутствующих эмоциональных нарушений.",
  },
];

export function calculateSocialAnxietyResult(answers: Record<string, number>): SocialAnxietyResult {
  const total = SOCIAL_ANXIETY_QUESTIONS.reduce((sum, question) => sum + normalizeInt(answers[question.key]), 0);
  const match = SOCIAL_ANXIETY_LEVELS.find((level) => total <= level.max) ?? SOCIAL_ANXIETY_LEVELS[SOCIAL_ANXIETY_LEVELS.length - 1];

  return {
    total,
    levelCode: match.code,
    levelLabel: match.label,
    interpretation: match.interpretation,
  };
}

export function calculateLiebowitzResult(
  answers: Record<string, LiebowitzSituationAnswer>,
): LiebowitzResult {
  let fearTotal = 0;
  let avoidanceTotal = 0;
  let participationTotal = 0;

  const conflictZones: LiebowitzConflictZone[] = [];

  for (const situation of LIEBOWITZ_SITUATIONS) {
    const answer = answers[situation.key];
    if (!answer) continue;

    const fear = normalizeRange(answer.fear, 1, 3);
    const avoidance = normalizeRange(answer.avoidance, 1, 3);
    const participationIfSuccess = normalizeRange(answer.participationIfSuccess, 1, 3);

    fearTotal += fear;
    avoidanceTotal += avoidance;
    participationTotal += participationIfSuccess;

    if (fear === 3 && avoidance === 3 && participationIfSuccess === 3) {
      conflictZones.push({
        key: situation.key,
        text: situation.text,
        label: "Зона максимального мотивационного напряжения: хочу участвовать, но боюсь и избегаю.",
        fear,
        avoidance,
        participationIfSuccess,
      });
    }
  }

  const interpretation =
    conflictZones.length > 0
      ? "Выделены ситуации внутреннего конфликта, в которых одновременно выражены страх, избегание и желание участвовать."
      : "Явных зон максимального мотивационного напряжения не обнаружено, профиль можно анализировать по относительной выраженности трёх шкал.";

  return {
    fearTotal,
    avoidanceTotal,
    participationTotal,
    conflictZones,
    interpretation,
  };
}

const AUTHOR_SCALE_GROUPS: Record<AuthorScaleCode, { label: string; keys: string[] }> = {
  fearOfEvaluation: {
    label: "Страх оценки",
    keys: ["author_2", "author_3", "author_6", "author_7", "author_10"],
  },
  communicationConstraint: {
    label: "Коммуникативная скованность",
    keys: ["author_1", "author_4", "author_8"],
  },
  avoidanceBehavior: {
    label: "Избегающее поведение",
    keys: ["author_5", "author_9"],
  },
};

export function calculateAuthorResult(answers: Record<string, number>): AuthorResult {
  const total = AUTHOR_QUESTIONS.reduce((sum, question) => sum + normalizeRange(answers[question.key], 1, 4), 0);

  const scales = {
    fearOfEvaluation: buildAuthorScaleResult("fearOfEvaluation", sumScale(answers, AUTHOR_SCALE_GROUPS.fearOfEvaluation.keys)),
    communicationConstraint: buildAuthorScaleResult("communicationConstraint", sumScale(answers, AUTHOR_SCALE_GROUPS.communicationConstraint.keys)),
    avoidanceBehavior: buildAuthorScaleResult("avoidanceBehavior", sumScale(answers, AUTHOR_SCALE_GROUPS.avoidanceBehavior.keys)),
  } satisfies Record<AuthorScaleCode, AuthorScaleResult>;

  const overallLevelLabel =
    total <= 16
      ? "Низкая выраженность социальных страхов"
      : total <= 24
        ? "Умеренная выраженность социальных страхов"
        : total <= 32
          ? "Повышенная выраженность социальных страхов"
          : "Высокая выраженность социальных страхов";

  const scaleTotals = Object.values(scales).map((scale) => scale.total);
  const allHigh = Object.values(scales).every((scale) => scale.level === "HIGH");
  const maxTotal = Math.max(...scaleTotals);
  const leaders = Object.values(scales).filter((scale) => scale.total === maxTotal);

  let profileType: AuthorProfileType = "MIXED";
  let profileLabel = "Смешанный профиль";

  if (allHigh) {
    profileType = "DIFFUSE_ANXIOUS";
    profileLabel = "Диффузно-тревожный тип";
  } else if (leaders.length === 1) {
    switch (leaders[0].code) {
      case "fearOfEvaluation":
        profileType = "EVALUATIVE_ANXIOUS";
        profileLabel = "Оценочно-тревожный тип";
        break;
      case "communicationConstraint":
        profileType = "COMMUNICATIVE_CONSTRAINED";
        profileLabel = "Коммуникативно-скованный тип";
        break;
      case "avoidanceBehavior":
        profileType = "AVOIDANT";
        profileLabel = "Избегающий тип";
        break;
    }
  }

  const dominantScale = leaders[0]?.label ?? "Внутренние шкалы";
  const interpretation = allHigh
    ? "Высокие показатели по всем внутренним шкалам указывают на диффузный тревожный профиль с выраженной чувствительностью к оценке, скованностью и тенденцией к избеганию."
    : `${dominantScale} выражен(а) сильнее остальных и определяет основной профиль переживания социальных страхов.`;

  return {
    total,
    overallLevelLabel,
    profileType,
    profileLabel,
    interpretation,
    scales,
  };
}

function buildAuthorScaleResult(code: AuthorScaleCode, total: number): AuthorScaleResult {
  const { label } = AUTHOR_SCALE_GROUPS[code];

  let level: AuthorScaleLevel;
  if (code === "fearOfEvaluation") {
    level = total <= 8 ? "LOW" : total <= 14 ? "MODERATE" : "HIGH";
  } else if (code === "communicationConstraint") {
    level = total <= 4 ? "LOW" : total <= 8 ? "MODERATE" : "HIGH";
  } else {
    level = total <= 3 ? "LOW" : total <= 5 ? "MODERATE" : "HIGH";
  }

  return {
    code,
    label,
    total,
    level,
    levelLabel: level === "LOW" ? "Низкий уровень" : level === "MODERATE" ? "Умеренный уровень" : "Высокий уровень",
  };
}

function sumScale(answers: Record<string, number>, keys: string[]): number {
  return keys.reduce((sum, key) => sum + normalizeRange(answers[key], 1, 4), 0);
}

function normalizeInt(value: unknown): number {
  return Number.isFinite(value) ? Number(value) : 0;
}

function normalizeRange(value: unknown, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(Math.max(parsed, min), max);
}
