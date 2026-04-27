import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";

type ReviewResultsShellProps = {
  children: ReactNode;
};

export function ReviewResultsShell({ children }: ReviewResultsShellProps) {
  return (
    <AppShell showNav={false}>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="glass-card sunset-shadow rounded-[2rem] border-0 p-6">
          <div className="inline-flex rounded-full border border-[rgba(255,120,91,0.24)] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--sunset-rose)]">
            Публичный дубликат результатов
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-[var(--ink)]">
            Версия для просмотра преподавателем
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-secondary)]">
            Этот раздел не отображается в основной навигации сайта и предназначен
            только для прямого просмотра результатов исследования по ссылке.
          </p>
        </div>
      </div>
      {children}
    </AppShell>
  );
}
