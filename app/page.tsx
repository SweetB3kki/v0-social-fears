import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] px-6 py-14 md:py-20">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm text-[var(--ink-secondary)] backdrop-blur">
              <ShieldAlert className="h-4 w-4 text-[var(--sunset-rose)]" />
              Курсовое исследование адаптации студентов первого курса
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[var(--ink)] md:text-6xl">
              Социальные страхи студентов-первокурсников
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-secondary)]">
              Платформа собирает ответы по трём психологическим опросникам, автоматически рассчитывает
              показатели социальной тревоги и помогает выявить зоны выраженного напряжения и избегания
              в первые месяцы обучения в вузе.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/consent">
                <Button className="gradient-btn rounded-2xl px-7 py-6 text-base font-semibold text-white shadow-lg shadow-orange-400/20">
                  Перейти к тестированию
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/instructions">
                <Button
                  variant="outline"
                  className="rounded-2xl border-white/60 bg-white/60 px-7 py-6 text-base text-[var(--ink)] backdrop-blur"
                >
                  Изучить структуру исследования
                </Button>
              </Link>
            </div>
          </div>

          <Card className="glass-card sunset-shadow border-0 lg:mt-1 lg:self-start">
            <CardContent className="space-y-5 p-7">
              <div className="rounded-3xl bg-gradient-to-br from-orange-500 via-rose-400 to-violet-600 p-1.5">
                <div className="rounded-[1.35rem] bg-[rgba(255,247,237,0.92)] p-5">
                  <div className="grid gap-4">
                    <div className="rounded-2xl bg-white/80 p-4">
                      <div className="text-sm font-medium text-[var(--ink-secondary)]">Опросник 1</div>
                      <div className="mt-1 text-lg font-semibold text-[var(--ink)]">
                        Социальная тревога и социофобия
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-4">
                      <div className="text-sm font-medium text-[var(--ink-secondary)]">Опросник 2</div>
                      <div className="mt-1 text-lg font-semibold text-[var(--ink)]">
                        Модифицированный тест по типу Либовица
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-4">
                      <div className="text-sm font-medium text-[var(--ink-secondary)]">Опросник 3</div>
                      <div className="mt-1 text-lg font-semibold text-[var(--ink)]">
                        Авторский опросник социальных страхов
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-7 text-[var(--ink-secondary)]">
                После завершения анкеты ответы сохраняются в базе данных, а результаты становятся доступными
                <strong className="font-semibold text-[var(--ink)]"> только </strong>
                администратору для последующего анализа по группам и отдельным участникам.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
