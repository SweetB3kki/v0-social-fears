import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ConsentPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Card className="glass-card sunset-shadow border-0">
          <CardContent className="p-8 md:p-10">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--sunset-rose)]">Информированное согласие</p>
              <h1 className="mt-4 text-3xl font-semibold text-[var(--ink)] md:text-4xl">
                Участие в исследовании социальных страхов первокурсников
              </h1>
              <div className="mt-6 space-y-4 text-base leading-8 text-[var(--ink-secondary)]">
                <p>
                  Вам предлагается пройти три психологических опросника, направленных на изучение социальной
                  тревоги, избегания социальных ситуаций и особенностей переживания страха оценки в период
                  обучения на первом курсе.
                </p>
                <p>
                  Ответы будут использоваться в учебно-исследовательских целях. Результаты не отображаются
                  участнику после завершения тестирования и доступны только администратору исследования.
                </p>
                <p>
                  Участие является добровольным. Продолжая, Вы подтверждаете, что ознакомились с целью
                  исследования и согласны на обработку введённых данных в рамках курсовой работы.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/instructions">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-white/60 bg-white/60 px-6 py-6 text-[var(--ink)]"
                  >
                    Сначала прочитать инструкцию
                  </Button>
                </Link>
                <Link href="/test">
                  <Button className="gradient-btn rounded-2xl px-6 py-6 font-semibold text-white">
                    Согласен(на), перейти к тестированию
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
