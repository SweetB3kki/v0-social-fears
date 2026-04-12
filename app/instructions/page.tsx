import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "1. Опросник социальной тревоги и социофобии",
    body: "29 утверждений с четырёхбалльной шкалой согласия. На сервере рассчитывается общая сумма и определяется уровень выраженности социальной тревоги по установленным порогам.",
  },
  {
    title: "2. Модифицированный тест по типу Либовица",
    body: "18 социальных ситуаций. Для каждой ситуации оцениваются страх, избегание и желание участвовать при условии успеха. Отдельно выделяются зоны внутреннего конфликта.",
  },
  {
    title: "3. Авторский опросник социальных страхов студентов-первокурсников",
    body: "10 утверждений с общей суммой и тремя внутренними шкалами: страх оценки, коммуникативная скованность и избегающее поведение. Итогом становится профиль типа переживания социальных страхов.",
  },
];

export default function InstructionsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Card className="glass-card sunset-shadow border-0">
          <CardContent className="p-8 md:p-10">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--sunset-rose)]">Структура исследования</p>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--ink)] md:text-4xl">
              Что предстоит участнику
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--ink-secondary)]">
              Перед началом тестирования студент указывает ФИ и свою учебную группу. После этого
              открывается последовательность из трёх методик. Все расчёты выполняются на сервере, а
              результаты сохраняются для дальнейшего анализа по группам и отдельным участникам.
            </p>
            <div className="mt-8 grid gap-5">
              {sections.map((section) => (
                <div key={section.title} className="rounded-3xl border border-white/60 bg-white/70 p-6">
                  <h2 className="text-xl font-semibold text-[var(--ink)]">{section.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-secondary)]">{section.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-3xl bg-[rgba(124,58,237,0.08)] p-6 text-sm leading-7 text-[var(--ink-secondary)]">
              Рекомендуется проходить опросники последовательно, не пропуская вопросы и не возвращаясь к
              уже данным ответам. После отправки анкеты повторное прохождение для участника закрывается.
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/privacy">
                <Button
                  variant="outline"
                  className="rounded-2xl border-white/60 bg-white/60 px-6 py-6 text-[var(--ink)]"
                >
                  Политика конфиденциальности
                </Button>
              </Link>
              <Link href="/consent">
                <Button className="gradient-btn rounded-2xl px-6 py-6 font-semibold text-white">
                  Продолжить к согласию
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
