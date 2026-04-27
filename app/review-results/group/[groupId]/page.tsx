import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewResultsShell } from "@/components/review-results-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getGroupReport } from "@/lib/server-results";

export default async function ReviewGroupResultsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const report = await getGroupReport(groupId);

  if (!report) {
    notFound();
  }

  return (
    <ReviewResultsShell>
      <div className="mx-auto max-w-6xl px-6 pb-10">
        <div className="mb-8">
          <Link
            href="/review-results"
            className="text-sm font-medium text-[var(--sunset-rose)] transition hover:text-[var(--sunset-orange)]"
          >
            ← Ко всем группам
          </Link>
          <p className="mt-5 text-sm uppercase tracking-[0.24em] text-[var(--sunset-rose)]">
            Публичный групповой отчёт
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--ink)]">
            {report.group.code}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-secondary)]">
            Участников: {report.group.participantCount}. Завершённых тестирований:{" "}
            {report.group.completedCount}.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          <MetricCard label="ОСТиСФ, среднее" value={report.aggregates.socialAnxietyAverage} />
          <MetricCard label="Либовиц: страх" value={report.aggregates.fearAverage} />
          <MetricCard label="Либовиц: избегание" value={report.aggregates.avoidanceAverage} />
          <MetricCard label="Авторский, среднее" value={report.aggregates.authorAverage} />
        </div>

        <div className="mt-8 grid gap-4">
          {report.participants.map((participant) => (
            <Link
              key={participant.id}
              href={`/review-results/participant/${participant.id}`}
            >
              <Card className="glass-card sunset-shadow border-0 transition-transform hover:-translate-y-0.5">
                <CardContent className="grid gap-4 p-6 md:grid-cols-[1.15fr_repeat(4,minmax(0,1fr))] md:items-center">
                  <div>
                    <div className="text-xl font-semibold text-[var(--ink)]">
                      {participant.displayName}
                    </div>
                    <div className="mt-2 text-sm text-[var(--ink-secondary)]">
                      {participant.hasCompleted
                        ? `Завершено: ${formatDate(participant.submittedAt)}`
                        : "Тестирование ещё не завершено"}
                    </div>
                  </div>
                  <SmallMetric label="ОСТиСФ" value={participant.socialAnxietyTotal ?? "—"} />
                  <SmallMetric label="Уровень" value={participant.socialAnxietyLevel ?? "—"} />
                  <SmallMetric label="Профиль" value={participant.authorProfile ?? "—"} />
                  <SmallMetric
                    label="Конфликтные зоны"
                    value={participant.liebowitzConflictCount ?? "—"}
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </ReviewResultsShell>
  );
}

function MetricCard({ label, value }: { label: string; value: number | null }) {
  return (
    <Card className="glass-card sunset-shadow border-0">
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--sunset-rose)]">
          {label}
        </div>
        <div className="mt-3 text-3xl font-semibold text-[var(--ink)]">
          {value ?? "—"}
        </div>
      </CardContent>
    </Card>
  );
}

function SmallMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/75 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--ink-secondary)]">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold leading-6 text-[var(--ink)]">
        {value}
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
