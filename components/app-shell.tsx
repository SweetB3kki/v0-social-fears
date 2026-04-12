import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { HeaderNav } from "@/components/header-nav";

type AppShellProps = {
  children: ReactNode;
  showNav?: boolean;
};

export function AppShell({ children, showNav = true }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-72 bg-[radial-gradient(circle_at_top,rgba(251,113,133,0.14),transparent_58%)]" />
      {showNav ? <HeaderNav /> : null}
      <main id="top" className="relative z-10">{children}</main>
      <Link
        href="#top"
        aria-label="Наверх"
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/75 bg-[rgba(255,255,255,0.88)] text-[var(--ink)] shadow-lg shadow-orange-200/20 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white"
      >
        <ArrowUp className="h-5 w-5" />
      </Link>
    </div>
  );
}
