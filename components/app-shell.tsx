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
      {showNav ? <HeaderNav /> : null}
      <main id="top" className="relative z-10">{children}</main>
      <Link
        href="#top"
        aria-label="Наверх"
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white text-[var(--ink)] shadow-lg shadow-orange-200/20 transition hover:-translate-y-0.5 hover:bg-white"
      >
        <ArrowUp className="h-5 w-5" />
      </Link>
    </div>
  );
}
