import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ExportPage() {
  const cookieStore = await cookies();
  if (!isAdminAuthenticated(cookieStore)) {
    redirect("/admin");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Card className="glass-card sunset-shadow border-0">
          <CardContent className="p-8 md:p-10">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--sunset-rose)]">Экспорт данных</p>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--ink)]">Выгрузка результатов для анализа</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--ink-secondary)]">
              CSV-файл содержит код группы, ФИ участника, факт завершения тестирования и основные
              агрегированные показатели по трём методикам.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="/api/export">
                <Button className="gradient-btn rounded-2xl px-6 py-6 font-semibold text-white">
                  Скачать CSV
                </Button>
              </a>
              <Link href="/results">
                <Button variant="outline" className="rounded-2xl border-white/60 bg-white/60 px-6 py-6 text-[var(--ink)]">
                  Вернуться к результатам
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
