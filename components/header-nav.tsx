"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, ClipboardPenLine, Home, LogIn } from "lucide-react";
import { SpiderWebIcon } from "@/components/spider-web-icon";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
};

const navItems: NavItem[] = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/instructions", label: "О проекте", icon: BookOpenText },
  { href: "/consent", label: "Пройти тест", icon: ClipboardPenLine },
  { href: "/admin", label: "Админ", icon: LogIn },
];

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/55 bg-[rgba(255,250,245,0.78)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="gradient-btn flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg shadow-orange-400/20">
            <SpiderWebIcon className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold tracking-wide text-[var(--ink)]">
              Социальные страхи
            </div>
            <div className="text-xs text-[var(--ink-secondary)]">
              Исследование студентов первого курса
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/80 text-[var(--ink)] shadow-sm"
                    : "text-[var(--ink-secondary)] hover:bg-white/50 hover:text-[var(--ink)]",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
