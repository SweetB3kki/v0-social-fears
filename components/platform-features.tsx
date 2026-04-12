import type { ReactNode } from "react";
import { ChartColumnBig, ShieldAlert, UserRoundCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Самостоятельный вход",
    description: "Студент вводит ФИ и учебную группу. Группа создаётся автоматически при первом прохождении.",
    icon: <UserRoundCheck className="h-5 w-5 text-[var(--sunset-orange)]" />,
  },
  {
    title: "Автоматический расчёт",
    description: "Сервер подсчитывает суммы, шкалы, уровни выраженности и итоговые профили по каждой методике.",
    icon: <ChartColumnBig className="h-5 w-5 text-[var(--sunset-plum)]" />,
  },
  {
    title: "Закрытые результаты",
    description: "Участник не получает доступ к своим результатам после завершения. Просмотр доступен только администратору.",
    icon: <ShieldAlert className="h-5 w-5 text-[var(--sunset-rose)]" />,
  },
] as const;

export function PlatformFeatures() {
  return (
    <section className="grid gap-6 md:grid-cols-3">
      {features.map((feature) => (
        <FeatureCard
          key={feature.title}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="glass-card sunset-shadow border-0">
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80">{icon}</div>
        <h2 className="text-lg font-semibold text-[var(--ink)]">{title}</h2>
        <p className="mt-2 text-sm leading-7 text-[var(--ink-secondary)]">{description}</p>
      </CardContent>
    </Card>
  );
}
