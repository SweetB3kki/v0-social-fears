"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PlatformFeatures } from "@/components/platform-features";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestJson } from "@/lib/api";

type AdminGroup = {
  id: string;
  code: string;
  participantCount: number;
  completedCount: number;
  participants: Array<{
    id: string;
    displayName: string;
    hasCompleted: boolean;
    submittedAt: string | null;
  }>;
};

export default function AdminPage() {
  const router = useRouter();
  const [login, setLogin] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    requestJson<{ authenticated?: boolean }>("/api/admin/auth", { method: "GET", cache: "no-store" })
      .then((result) => {
        const isAuthenticated = result.success ? Boolean(result.data.authenticated) : false;
        setAuthenticated(isAuthenticated);
        setLoading(false);
        if (isAuthenticated) {
          void loadGroups();
        }
      })
      .catch(() => {
        setAuthenticated(false);
        setLoading(false);
      });
  }, []);

  async function loadGroups() {
    setGroupsLoading(true);
    const result = await requestJson<{ groups?: AdminGroup[] }>("/api/admin/groups", {
      method: "GET",
      cache: "no-store",
    });

    if (!result.success) {
      setActionMessage(result.error ?? "Не удалось загрузить список групп.");
      setGroupsLoading(false);
      return;
    }

    setGroups(result.data.groups ?? []);
    setGroupsLoading(false);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setActionMessage(null);

    const result = await requestJson<{ authenticated?: boolean }>("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Не удалось выполнить вход.");
      return;
    }

    setAuthenticated(true);
    await loadGroups();
    router.refresh();
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setGroups([]);
    setActionMessage(null);
    router.refresh();
  }

  async function handleDeleteGroup(group: AdminGroup) {
    if (!window.confirm(`Удалить группу ${group.code} целиком вместе со всеми участниками и результатами?`)) {
      return;
    }

    setDeletingId(group.id);
    setActionMessage(null);
    const result = await requestJson<{ success?: boolean }>(`/api/admin/groups/${group.id}`, { method: "DELETE" });
    setDeletingId(null);

    if (!result.success) {
      setActionMessage(result.error ?? "Не удалось удалить группу.");
      return;
    }

    setActionMessage(`Группа ${group.code} удалена.`);
    await loadGroups();
    router.refresh();
  }

  async function handleDeleteParticipant(groupCode: string, participant: AdminGroup["participants"][number]) {
    if (!window.confirm(`Удалить участника ${participant.displayName} из группы ${groupCode}?`)) {
      return;
    }

    setDeletingId(participant.id);
    setActionMessage(null);
    const result = await requestJson<{ success?: boolean }>(`/api/admin/participants/${participant.id}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (!result.success) {
      setActionMessage(result.error ?? "Не удалось удалить участника.");
      return;
    }

    setActionMessage(`Участник ${participant.displayName} удалён.`);
    await loadGroups();
    router.refresh();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Card className="glass-card sunset-shadow border-0">
          <CardContent className="p-8 md:p-10">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--sunset-rose)]">Административный доступ</p>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--ink)]">Панель администратора исследования</h1>

            {loading ? (
              <div className="mt-8 flex items-center gap-3 text-[var(--ink-secondary)]">
                <Loader2 className="h-5 w-5 animate-spin" />
                Проверка текущей сессии…
              </div>
            ) : authenticated ? (
              <div className="mt-8 space-y-8">
                <div className="rounded-3xl bg-white/70 p-6 text-sm leading-7 text-[var(--ink-secondary)]">
                  Администратор уже авторизован. Здесь доступны результаты по группам, экспорт и управление
                  автоматически созданными учебными группами и участниками.
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link href="/results">
                    <Button className="gradient-btn rounded-2xl px-6 py-6 font-semibold text-white">
                      Открыть результаты
                    </Button>
                  </Link>
                  <Link href="/export">
                    <Button variant="outline" className="rounded-2xl border-white/60 bg-white/60 px-6 py-6 text-[var(--ink)]">
                      Перейти к экспорту
                    </Button>
                  </Link>
                  <Button variant="outline" className="rounded-2xl border-white/60 bg-white/60 px-6 py-6 text-[var(--ink)]" onClick={handleLogout}>
                    Выйти
                  </Button>
                </div>

                <div>
                  <p className="mb-4 text-sm uppercase tracking-[0.24em] text-[var(--sunset-rose)]">Функции сайта</p>
                  <PlatformFeatures />
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-[var(--sunset-rose)]">Управление группами</p>
                    <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Группы и участники</h2>
                  </div>

                  {actionMessage ? (
                    <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-[var(--ink-secondary)]">
                      {actionMessage}
                    </div>
                  ) : null}

                  {groupsLoading ? (
                    <div className="flex items-center gap-3 rounded-3xl bg-white/70 p-6 text-sm text-[var(--ink-secondary)]">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Обновляю список групп…
                    </div>
                  ) : groups.length === 0 ? (
                    <div className="rounded-3xl bg-white/70 p-6 text-sm leading-7 text-[var(--ink-secondary)]">
                      Пока нет ни одной группы. Они появятся автоматически после первого прохождения тестирования.
                    </div>
                  ) : (
                    <div className="grid gap-5 xl:grid-cols-2">
                      {groups.map((group) => (
                        <Card key={group.id} className="glass-card sunset-shadow border-0">
                          <CardContent className="p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <div className="text-sm uppercase tracking-[0.18em] text-[var(--sunset-rose)]">Группа</div>
                                <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">{group.code}</h3>
                                <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--ink-secondary)]">
                                  <span className="rounded-full bg-white/75 px-3 py-1.5">Участников: {group.participantCount}</span>
                                  <span className="rounded-full bg-white/75 px-3 py-1.5">Завершили: {group.completedCount}</span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                className="rounded-2xl border-rose-200 bg-white/70 px-4 py-2 text-rose-600 hover:bg-rose-50"
                                disabled={deletingId === group.id}
                                onClick={() => handleDeleteGroup(group)}
                              >
                                {deletingId === group.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Удалить группу
                              </Button>
                            </div>

                            <div className="mt-5 space-y-3">
                              {group.participants.map((participant) => (
                                <div
                                  key={participant.id}
                                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/75 p-4"
                                >
                                  <div>
                                    <div className="font-medium text-[var(--ink)]">{participant.displayName}</div>
                                    <div className="mt-1 text-sm text-[var(--ink-secondary)]">
                                      {participant.hasCompleted ? "Прошёл тестирование" : "Ещё не завершил тестирование"}
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    className="rounded-2xl border-rose-200 bg-white/70 px-4 py-2 text-rose-600 hover:bg-rose-50"
                                    disabled={deletingId === participant.id}
                                    onClick={() => handleDeleteParticipant(group.code, participant)}
                                  >
                                    {deletingId === participant.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Удалить
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form className="mt-8 grid gap-5" onSubmit={handleLogin}>
                <div className="grid gap-2">
                  <Label htmlFor="login">Логин</Label>
                  <Input id="login" value={login} onChange={(event) => setLogin(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                </div>
                {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
                <Button type="submit" disabled={submitting} className="gradient-btn rounded-2xl px-6 py-6 font-semibold text-white">
                  {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Войти
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
