import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Card className="glass-card sunset-shadow border-0">
          <CardContent className="p-8 md:p-10">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--sunset-rose)]">Конфиденциальность</p>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--ink)]">Как используются введённые данные</h1>
            <div className="mt-6 space-y-4 text-base leading-8 text-[var(--ink-secondary)]">
              <p>
                В системе сохраняются ФИ участника, учебная группа, ответы на все вопросы опросников и
                автоматически рассчитанные итоговые показатели.
              </p>
              <p>
                Данные используются исключительно в рамках учебно-исследовательской работы по теме
                социальных страхов студентов первого курса. Участник после завершения тестирования не
                получает доступа к собственным результатам.
              </p>
              <p>
                Доступ к результатам, групповым отчётам и экспорту данных ограничен администратором
                исследования. Сервер не генерирует демонстрационные результаты и не подменяет ответы.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
