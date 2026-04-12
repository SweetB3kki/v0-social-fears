"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  calculateAuthorResult,
  calculateLiebowitzResult,
  calculateSocialAnxietyResult,
  type LiebowitzSituationAnswer,
} from "@/lib/assessment";
import { fetchParticipantStatus, submitAssessment } from "@/lib/api";
import {
  AUTHOR_META,
  AUTHOR_OPTIONS,
  AUTHOR_QUESTIONS,
  LIEBOWITZ_META,
  LIEBOWITZ_SITUATIONS,
  SOCIAL_ANXIETY_META,
  SOCIAL_ANXIETY_OPTIONS,
  SOCIAL_ANXIETY_QUESTIONS,
} from "@/lib/instruments";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ParticipantPageProps = {
  params: Promise<{ participantId: string }>;
};

type ParticipantStatus = {
  participantId: string;
  groupId: string;
  groupCode: string;
  displayName: string;
  alreadyCompleted: boolean;
  isAdminRetake: boolean;
};

type StepKey = "socialAnxiety" | "liebowitz" | "author";

type ValidationState = Record<StepKey, string[]>;

type LiebowitzDraftAnswer = Partial<LiebowitzSituationAnswer>;

const steps = [
  { key: "socialAnxiety", title: SOCIAL_ANXIETY_META.shortTitle, subtitle: SOCIAL_ANXIETY_META.title },
  { key: "liebowitz", title: "Либовиц", subtitle: LIEBOWITZ_META.title },
  { key: "author", title: "Авторский", subtitle: AUTHOR_META.title },
] as const;

const emptyValidationState: ValidationState = {
  socialAnxiety: [],
  liebowitz: [],
  author: [],
};

export default function ParticipantTestPage({ params }: ParticipantPageProps) {
  const router = useRouter();
  const startedAtRef = useRef(new Date().toISOString());

  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participant, setParticipant] = useState<ParticipantStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>(emptyValidationState);
  const [socialAnxiety, setSocialAnxiety] = useState<Record<string, number>>({});
  const [liebowitz, setLiebowitz] = useState<Record<string, LiebowitzDraftAnswer>>({});
  const [author, setAuthor] = useState<Record<string, number>>({});

  useEffect(() => {
    params.then(({ participantId }) => setParticipantId(participantId));
  }, [params]);

  useEffect(() => {
    if (!participantId) return;

    let mounted = true;
    fetchParticipantStatus(participantId).then((result) => {
      if (!mounted) return;
      if (!result.success) {
        setLoadError(result.error);
        setLoading(false);
        return;
      }

      setParticipant(result.data);
      setLoadError(null);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [participantId]);

  const preview = useMemo(
    () => ({
      socialAnxiety: calculateSocialAnxietyResult(socialAnxiety),
      liebowitz: calculateLiebowitzResult(normalizeLiebowitzForCalculation(liebowitz)),
      author: calculateAuthorResult(author),
    }),
    [author, liebowitz, socialAnxiety],
  );

  const invalidStepKeys = validationState[steps[stepIndex].key];

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--sunset-orange)]" />
        </div>
      </AppShell>
    );
  }

  if (loadError || !participant) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Card className="glass-card sunset-shadow border-0">
            <CardContent className="p-8">
              <h1 className="text-2xl font-semibold text-[var(--ink)]">Не удалось открыть тестирование</h1>
              <p className="mt-4 text-base leading-8 text-[var(--ink-secondary)]">
                {loadError ?? "Участник не найден."}
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (participant.alreadyCompleted && !participant.isAdminRetake) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Card className="glass-card sunset-shadow border-0">
            <CardContent className="p-8">
              <h1 className="text-2xl font-semibold text-[var(--ink)]">Повторное прохождение закрыто</h1>
              <p className="mt-4 text-base leading-8 text-[var(--ink-secondary)]">
                Для участника {participant.displayName} из группы {participant.groupCode} тестирование уже завершено.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const progressValue = ((stepIndex + 1) / steps.length) * 100;

  function setStepValidation(stepKey: StepKey, keys: string[]) {
    setValidationState((current) => ({ ...current, [stepKey]: keys }));
  }

  function clearQuestionValidation(stepKey: StepKey, questionKey: string) {
    setValidationState((current) => ({
      ...current,
      [stepKey]: current[stepKey].filter((key) => key !== questionKey),
    }));
  }

  function focusFirstInvalidQuestion(keys: string[]) {
    const firstKey = keys[0];
    if (!firstKey) return;
    document.getElementById(`question-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function getInvalidKeys(stepKey: StepKey): string[] {
    if (stepKey === "socialAnxiety") {
      return SOCIAL_ANXIETY_QUESTIONS
        .filter((question) => typeof socialAnxiety[question.key] !== "number")
        .map((question) => question.key);
    }

    if (stepKey === "liebowitz") {
      return LIEBOWITZ_SITUATIONS
        .filter((situation) => {
          const value = liebowitz[situation.key];
          return !isAnsweredLiebowitz(value);
        })
        .map((situation) => situation.key);
    }

    return AUTHOR_QUESTIONS
      .filter((question) => typeof author[question.key] !== "number")
      .map((question) => question.key);
  }

  function validateStep(stepKey: StepKey, options?: { showMessage?: boolean }) {
    const keys = getInvalidKeys(stepKey);
    setStepValidation(stepKey, keys);

    if (keys.length === 0) {
      if (options?.showMessage) {
        setFormError(null);
      }
      return true;
    }

    if (options?.showMessage) {
      setFormError("Заполните все вопросы текущего шага. Неотвеченные блоки выделены красным.");
    }
    focusFirstInvalidQuestion(keys);
    return false;
  }

  function scrollToTopOfTest() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToStep(nextStepIndex: number) {
    setStepIndex(nextStepIndex);
    setFormError(null);
    window.setTimeout(scrollToTopOfTest, 0);
  }

  async function handleSubmit() {
    if (!participant) return;

    const invalidSocialAnxietyKeys = getInvalidKeys("socialAnxiety");
    const invalidLiebowitzKeys = getInvalidKeys("liebowitz");
    const invalidAuthorKeys = getInvalidKeys("author");

    setValidationState({
      socialAnxiety: invalidSocialAnxietyKeys,
      liebowitz: invalidLiebowitzKeys,
      author: invalidAuthorKeys,
    });

    const firstInvalidKeys = invalidSocialAnxietyKeys.length
      ? invalidSocialAnxietyKeys
      : invalidLiebowitzKeys.length
        ? invalidLiebowitzKeys
        : invalidAuthorKeys;

    if (firstInvalidKeys.length > 0) {
      setFormError("Перед отправкой ответьте на все вопросы всех трёх опросников.");
      focusFirstInvalidQuestion(firstInvalidKeys);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const durationSeconds = Math.max(1, Math.round((Date.now() - new Date(startedAtRef.current).getTime()) / 1000));
    const responses = [
      ...SOCIAL_ANXIETY_QUESTIONS.map((question) => ({
        instrument: "SOCIAL_ANXIETY" as const,
        questionKey: question.key,
        answer: { value: socialAnxiety[question.key] },
      })),
      ...LIEBOWITZ_SITUATIONS.map((situation) => {
        const answer = liebowitz[situation.key] as LiebowitzSituationAnswer;
        return {
          instrument: "LIEBOWITZ_MODIFIED" as const,
          questionKey: situation.key,
          answer,
        };
      }),
      ...AUTHOR_QUESTIONS.map((question) => ({
        instrument: "AUTHOR_SOCIAL_FEARS" as const,
        questionKey: question.key,
        answer: { value: author[question.key] },
      })),
    ];

    const result = await submitAssessment({
      participantId: participant.participantId,
      groupId: participant.groupId,
      responses,
      meta: {
        startedAt: startedAtRef.current,
        durationSeconds,
      },
    });

    setSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    router.push("/test/complete");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--sunset-rose)]">Тестирование</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--ink)]">{participant.displayName}</h1>
            <p className="mt-2 text-sm text-[var(--ink-secondary)]">
              Группа: {participant.groupCode}
              {participant.isAdminRetake ? " • режим ретейка администратора" : ""}
            </p>
          </div>
          <div className="min-w-[220px] rounded-3xl border border-white/60 bg-white/60 p-4 backdrop-blur">
            <div className="flex items-center justify-between text-sm text-[var(--ink-secondary)]">
              <span>Шаг {stepIndex + 1} из {steps.length}</span>
              <span>{steps[stepIndex].title}</span>
            </div>
            <Progress value={progressValue} className="mt-3 h-2.5 bg-white/70" />
          </div>
        </div>

        <div className="space-y-6">
          <Card className="glass-card sunset-shadow border-0">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[var(--ink)]">Памятка</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--ink-secondary)]">
                <li>Отвечайте последовательно и не пропускайте ситуации или утверждения.</li>
                <li>Вторая методика оценивает не только страх, но и избегание, и желание участвовать.</li>
                <li>После отправки анкеты результаты скрываются от участника и доступны только администратору.</li>
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {stepIndex === 0 ? (
              <InstrumentCard title={SOCIAL_ANXIETY_META.title} instruction={SOCIAL_ANXIETY_META.instruction}>
                <div className="space-y-4">
                  {SOCIAL_ANXIETY_QUESTIONS.map((question, index) => (
                    <QuestionBlock
                      key={question.key}
                      questionKey={question.key}
                      index={index + 1}
                      text={question.text}
                      invalid={invalidStepKeys.includes(question.key)}
                    >
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {SOCIAL_ANXIETY_OPTIONS.map((option) => (
                          <OptionCard
                            key={option.value}
                            checked={socialAnxiety[question.key] === option.value}
                            label={option.label}
                            onClick={() => {
                              setSocialAnxiety((current) => ({
                                ...current,
                                [question.key]: option.value,
                              }));
                              clearQuestionValidation("socialAnxiety", question.key);
                              setFormError(null);
                            }}
                          />
                        ))}
                      </div>
                    </QuestionBlock>
                  ))}
                </div>
              </InstrumentCard>
            ) : null}

            {stepIndex === 1 ? (
              <InstrumentCard title={LIEBOWITZ_META.title} instruction={LIEBOWITZ_META.instruction}>
                <div className="space-y-4">
                  {LIEBOWITZ_SITUATIONS.map((situation, index) => {
                    const value = liebowitz[situation.key] ?? {};

                    return (
                      <QuestionBlock
                        key={situation.key}
                        questionKey={situation.key}
                        index={index + 1}
                        text={situation.text}
                      invalid={invalidStepKeys.includes(situation.key)}
                    >
                        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                          <SelectField
                            label="Страх"
                            value={value.fear}
                            options={LIEBOWITZ_META.fearOptions}
                            placeholder="Выберите уровень страха"
                            invalid={invalidStepKeys.includes(situation.key) && typeof value.fear !== "number"}
                            onChange={(next) => {
                              setLiebowitz((current) => ({
                                ...current,
                                [situation.key]: { ...value, fear: next },
                              }));
                              if (isAnsweredLiebowitz({ ...value, fear: next })) {
                                clearQuestionValidation("liebowitz", situation.key);
                              }
                              setFormError(null);
                            }}
                          />
                          <SelectField
                            label="Избегание"
                            value={value.avoidance}
                            options={LIEBOWITZ_META.avoidanceOptions}
                            placeholder="Выберите уровень избегания"
                            invalid={invalidStepKeys.includes(situation.key) && typeof value.avoidance !== "number"}
                            onChange={(next) => {
                              setLiebowitz((current) => ({
                                ...current,
                                [situation.key]: { ...value, avoidance: next },
                              }));
                              if (isAnsweredLiebowitz({ ...value, avoidance: next })) {
                                clearQuestionValidation("liebowitz", situation.key);
                              }
                              setFormError(null);
                            }}
                          />
                          <SelectField
                            label="Желание участвовать при успехе"
                            value={value.participationIfSuccess}
                            options={LIEBOWITZ_META.participationOptions}
                            placeholder="Выберите выраженность желания"
                            invalid={
                              invalidStepKeys.includes(situation.key) &&
                              typeof value.participationIfSuccess !== "number"
                            }
                            onChange={(next) => {
                              setLiebowitz((current) => ({
                                ...current,
                                [situation.key]: { ...value, participationIfSuccess: next },
                              }));
                              if (isAnsweredLiebowitz({ ...value, participationIfSuccess: next })) {
                                clearQuestionValidation("liebowitz", situation.key);
                              }
                              setFormError(null);
                            }}
                          />
                        </div>
                      </QuestionBlock>
                    );
                  })}
                </div>
              </InstrumentCard>
            ) : null}

            {stepIndex === 2 ? (
              <InstrumentCard title={AUTHOR_META.title} instruction={AUTHOR_META.instruction}>
                <div className="space-y-4">
                  {AUTHOR_QUESTIONS.map((question, index) => (
                    <QuestionBlock
                      key={question.key}
                      questionKey={question.key}
                      index={index + 1}
                      text={question.text}
                      invalid={invalidStepKeys.includes(question.key)}
                    >
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {AUTHOR_OPTIONS.map((option) => (
                          <OptionCard
                            key={option.value}
                            checked={author[question.key] === option.value}
                            label={option.label}
                            onClick={() => {
                              setAuthor((current) => ({
                                ...current,
                                [question.key]: option.value,
                              }));
                              clearQuestionValidation("author", question.key);
                              setFormError(null);
                            }}
                          />
                        ))}
                      </div>
                    </QuestionBlock>
                  ))}
                </div>
              </InstrumentCard>
            ) : null}

            {formError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {formError}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-between gap-3">
              <Button
                variant="outline"
                className="rounded-2xl border-white/60 bg-white/60 px-6 py-6 text-[var(--ink)]"
                disabled={stepIndex === 0}
                onClick={() => {
                  goToStep(Math.max(0, stepIndex - 1));
                }}
              >
                Назад
              </Button>

              {stepIndex < steps.length - 1 ? (
                <Button
                  className="gradient-btn rounded-2xl px-6 py-6 font-semibold text-white"
                  onClick={() => {
                    const stepKey = steps[stepIndex].key;
                    if (!validateStep(stepKey, { showMessage: true })) {
                      return;
                    }
                    goToStep(Math.min(steps.length - 1, stepIndex + 1));
                  }}
                >
                  Далее
                </Button>
              ) : (
                <Button
                  className="gradient-btn rounded-2xl px-6 py-6 font-semibold text-white"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Завершить и отправить
                </Button>
              )}
            </div>
          </div>
        </div>

        {participant.isAdminRetake ? (
          <div className="pointer-events-none fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
            <div className="group pointer-events-auto relative flex items-center">
              <div className="rounded-l-2xl border border-white/70 bg-white/85 px-3 py-6 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sunset-rose)] shadow-lg [writing-mode:vertical-rl]">
                Прогресс
              </div>
              <div className="absolute right-full mr-3 w-[320px] translate-x-8 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                <Card className="glass-card sunset-shadow border-0">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-[var(--ink)]">Предварительный обзор</h2>
                    <div className="mt-5 space-y-4 text-sm text-[var(--ink-secondary)]">
                      <ResultPreviewCard
                        title="ОСТиСФ"
                        value={`${preview.socialAnxiety.total} баллов`}
                        description={preview.socialAnxiety.levelLabel}
                      />
                      <ResultPreviewCard
                        title="Либовиц"
                        value={`${preview.liebowitz.fearTotal}/${preview.liebowitz.avoidanceTotal}/${preview.liebowitz.participationTotal}`}
                        description={`Зон конфликта: ${preview.liebowitz.conflictZones.length}`}
                      />
                      <ResultPreviewCard
                        title="Авторский"
                        value={`${preview.author.total} баллов`}
                        description={preview.author.profileLabel}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function InstrumentCard({
  title,
  instruction,
  children,
}: {
  title: string;
  instruction: string;
  children: ReactNode;
}) {
  return (
    <Card className="glass-card sunset-shadow border-0">
      <CardContent className="p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-[var(--ink)]">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-secondary)]">{instruction}</p>
        <div className="mt-6">{children}</div>
      </CardContent>
    </Card>
  );
}

function QuestionBlock({
  questionKey,
  index,
  text,
  invalid,
  children,
}: {
  questionKey: string;
  index: number;
  text: string;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      id={`question-${questionKey}`}
      className={`rounded-3xl border bg-white/70 p-5 transition ${
        invalid ? "border-rose-300 bg-rose-50/70 shadow-sm shadow-rose-100" : "border-white/60"
      }`}
    >
      <div className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--sunset-rose)]">Вопрос {index}</div>
      <div className="text-base leading-8 text-[var(--ink)]">{text}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function OptionCard({ checked, label, onClick }: { checked: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
        checked
          ? "border-transparent bg-[rgba(249,115,22,0.14)] text-[var(--ink)] shadow-sm"
          : "border-white/70 bg-white/80 text-[var(--ink-secondary)] hover:border-orange-200 hover:text-[var(--ink)]"
      }`}
    >
      {label}
    </button>
  );
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  invalid,
  onChange,
}: {
  label: string;
  value?: number;
  options: Array<{ value: number; label: string }>;
  placeholder: string;
  invalid?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-[var(--ink-secondary)]">
      <span className="font-medium text-[var(--ink)]">{label}</span>
      <Select value={typeof value === "number" ? String(value) : undefined} onValueChange={(next) => onChange(Number(next))}>
        <SelectTrigger
          className={`h-14 w-full min-w-0 rounded-2xl border bg-white/90 px-4 text-left text-[15px] text-[var(--ink)] shadow-sm ${
            invalid
              ? "border-rose-300 ring-2 ring-rose-100"
              : "border-white/70 hover:border-orange-200 focus-visible:border-orange-300 focus-visible:ring-orange-100"
          }`}
          aria-invalid={invalid}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-white/70 bg-white/95 backdrop-blur">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={String(option.value)}
              className="rounded-xl px-3 py-3 text-[15px] text-[var(--ink)] focus:bg-orange-50 focus:text-[var(--ink)]"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function ResultPreviewCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-2xl bg-white/75 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--sunset-rose)]">{title}</div>
      <div className="mt-2 text-lg font-semibold text-[var(--ink)]">{value}</div>
      <div className="mt-1 leading-6">{description}</div>
    </div>
  );
}

function isAnsweredLiebowitz(value: LiebowitzDraftAnswer | undefined) {
  return (
    typeof value?.fear === "number" &&
    typeof value?.avoidance === "number" &&
    typeof value?.participationIfSuccess === "number"
  );
}

function normalizeLiebowitzForCalculation(answers: Record<string, LiebowitzDraftAnswer>) {
  return Object.fromEntries(
    Object.entries(answers)
      .filter(([, value]) => isAnsweredLiebowitz(value))
      .map(([key, value]) => [key, value as LiebowitzSituationAnswer]),
  ) as Record<string, LiebowitzSituationAnswer>;
}
