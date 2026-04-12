"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { registerParticipant } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestStartPage() {
  const router = useRouter();
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await registerParticipant({
      lastName,
      firstName,
      groupCode,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (result.data.alreadyCompleted && !result.data.isAdminRetake) {
      setError("Для этого участника тестирование уже завершено. Повторный доступ закрыт.");
      return;
    }

    router.push(`/test/${result.data.participantId}`);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Card className="glass-card sunset-shadow border-0">
          <CardContent className="p-8 md:p-10">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--sunset-rose)]">Регистрация участника</p>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--ink)]">Введите данные перед началом опросников</h1>
            <p className="mt-4 text-base leading-8 text-[var(--ink-secondary)]">
              Укажите ФИ и учебную группу в точности так, как они должны отражаться в итоговом анализе.
              Группа будет создана автоматически, если её ещё нет в базе.
            </p>

            <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="groupCode">Учебная группа</Label>
                <Input
                  id="groupCode"
                  value={groupCode}
                  onChange={(event) => setGroupCode(event.target.value)}
                  placeholder="Например: ПСД/С-24-2-о"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={submitting}
                className="gradient-btn mt-2 rounded-2xl px-6 py-6 text-base font-semibold text-white"
              >
                {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Перейти к опросникам
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
