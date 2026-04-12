import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { listGroupSummaries } from "@/lib/server-results";

export default async function ResultsPage() {
  const groups = await listGroupSummaries();

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--sunset-rose)]">Результаты исследования</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Учебные группы</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-secondary)]">
            Здесь собраны автоматически сформированные группы, количество участников и число завершённых
            тестирований. Выберите группу, чтобы перейти к детальному анализу.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <Link key={group.id} href={`/results/group/${group.id}`}>
              <Card className="glass-card sunset-shadow h-full border-0 transition-transform hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className="text-sm uppercase tracking-[0.18em] text-[var(--sunset-rose)]">Группа</div>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">{group.code}</h2>
                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-[var(--ink-secondary)]">
                    <div className="rounded-2xl bg-white/75 p-4">
                      <div className="text-xs uppercase tracking-[0.18em]">Участников</div>
                      <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{group.participantCount}</div>
                    </div>
                    <div className="rounded-2xl bg-white/75 p-4">
                      <div className="text-xs uppercase tracking-[0.18em]">Завершили</div>
                      <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{group.completedCount}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
