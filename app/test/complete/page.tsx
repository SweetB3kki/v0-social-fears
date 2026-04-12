import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CompletePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Card className="glass-card sunset-shadow border-0">
          <CardContent className="p-10 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--sunset-rose)]">Тестирование завершено</p>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--ink)] md:text-4xl">
              Спасибо за участие в исследовании
            </h1>
            <p className="mt-5 text-base leading-8 text-[var(--ink-secondary)]">
              Ваши ответы сохранены. Результаты доступны <strong>только</strong> администратору исследования и будут использованы
              для группового и индивидуального анализа в рамках курсовой работы.
            </p>
            <div className="mt-8">
              <Link href="/">
                <Button className="gradient-btn rounded-2xl px-6 py-6 font-semibold text-white">
                  Вернуться на главную
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
