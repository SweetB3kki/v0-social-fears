import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getParticipantReport } from "@/lib/server-results";

export default async function ParticipantResultsPage({
  params,
}: {
  params: Promise<{ participantId: string }>;
}) {
  const { participantId } = await params;
  const report = await getParticipantReport(participantId);

  if (!report) {
    notFound();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--sunset-rose)]">Индивидуальный отчёт</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">{report.participant.displayName}</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-secondary)]">
            Группа: {report.participant.groupCode}.{" "}
            {report.session ? `Сессия завершена ${formatDate(report.session.submittedAt)}.` : "Тестирование не завершено."}
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <ResultCard
            title="ОСТиСФ"
            headline={report.socialAnxiety?.total ?? "—"}
            subline={report.socialAnxiety?.levelLabel ?? "Нет данных"}
            body={report.socialAnxiety?.interpretation ?? "—"}
          />
          <Card className="glass-card sunset-shadow border-0 xl:col-span-1">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-[var(--ink)]">Либовиц</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <MiniCard label="Страх" value={report.liebowitz?.fearTotal ?? "—"} />
                <MiniCard label="Избегание" value={report.liebowitz?.avoidanceTotal ?? "—"} />
                <MiniCard label="Желание" value={report.liebowitz?.participationTotal ?? "—"} />
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--ink-secondary)]">{report.liebowitz?.interpretation ?? "—"}</p>
            </CardContent>
          </Card>
          <ResultCard
            title="Авторский опросник"
            headline={report.author?.total ?? "—"}
            subline={report.author?.overallLevelLabel ?? "Нет данных"}
            body={`${report.author?.profileLabel ?? "—"}${report.author?.interpretation ? `. ${report.author.interpretation}` : ""}`}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <Card className="glass-card sunset-shadow border-0 xl:col-span-1">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-[var(--ink)]">Внутренние шкалы авторского опросника</h2>
              <div className="mt-4 space-y-3">
                {report.author
                  ? Object.values(report.author.scales).map((scale) => (
                      <div key={scale.code} className="rounded-2xl bg-white/75 p-4">
                        <div className="font-medium text-[var(--ink)]">{scale.label}</div>
                        <div className="mt-1 text-sm text-[var(--ink-secondary)]">
                          {scale.total} баллов • {scale.levelLabel}
                        </div>
                      </div>
                    ))
                  : <div className="text-sm text-[var(--ink-secondary)]">Нет данных.</div>}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card sunset-shadow border-0 xl:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-[var(--ink)]">Конфликтные зоны Либовица</h2>
              <div className="mt-4 space-y-3">
                {report.liebowitz?.conflictZones?.length ? (
                  report.liebowitz.conflictZones.map((zone) => (
                    <div key={zone.key} className="rounded-2xl bg-white/75 p-4">
                      <div className="font-medium text-[var(--ink)]">{zone.text}</div>
                      <div className="mt-1 text-sm text-[var(--ink-secondary)]">{zone.label}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-white/75 p-4 text-sm text-[var(--ink-secondary)]">
                    Зоны максимального мотивационного напряжения не выделены.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6">
          <ResponsesCard title="Ответы по ОСТиСФ" rows={report.responses.socialAnxiety.map((item) => `${item.text} — ${item.value}`)} />
          <ResponsesCard
            title="Ответы по модифицированному Либовицу"
            rows={report.responses.liebowitz.map(
              (item) =>
                `${item.text} — страх: ${item.fear}, избегание: ${item.avoidance}, желание участвовать: ${item.participationIfSuccess}`,
            )}
          />
          <ResponsesCard title="Ответы по авторскому опроснику" rows={report.responses.author.map((item) => `${item.text} — ${item.value}`)} />
        </div>
      </div>
    </AppShell>
  );
}

function ResultCard({
  title,
  headline,
  subline,
  body,
}: {
  title: string;
  headline: string | number;
  subline: string;
  body: string;
}) {
  return (
    <Card className="glass-card sunset-shadow border-0 xl:col-span-1">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-[var(--ink)]">{title}</h2>
        <div className="mt-4 text-4xl font-semibold text-[var(--ink)]">{headline}</div>
        <div className="mt-2 text-sm text-[var(--ink-secondary)]">{subline}</div>
        <p className="mt-4 text-sm leading-7 text-[var(--ink-secondary)]">{body}</p>
      </CardContent>
    </Card>
  );
}

function MiniCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/75 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--ink-secondary)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{value}</div>
    </div>
  );
}

function ResponsesCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <Card className="glass-card sunset-shadow border-0">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-[var(--ink)]">{title}</h2>
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div key={row} className="rounded-2xl bg-white/75 p-4 text-sm leading-7 text-[var(--ink-secondary)]">
              {row}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
