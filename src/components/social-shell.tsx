"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Home, PenSquare, User } from "lucide-react";

import { env } from "@/config/env";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: ROUTES.home, label: "Home", Icon: Home },
  { href: ROUTES.create, label: "Create", Icon: PenSquare },
  { href: ROUTES.saved, label: "Saved", Icon: Bookmark },
  { href: ROUTES.profile("me"), label: "Profile", Icon: User },
] as const;

export function SocialShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4 sm:h-14 sm:px-6">
          <Link
            href={ROUTES.home}
            className="truncate text-[15px] font-semibold tracking-tight text-foreground sm:text-base"
          >
            {env.appName}
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pb-32 sm:pt-8">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-xl safe-area-pb">
        <div className="mx-auto flex max-w-3xl items-stretch justify-around px-2 py-2.5 sm:px-4">
          {nav.map(({ href, label, Icon }) => {
            const active =
              href === ROUTES.home
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition-colors sm:text-xs",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5 sm:size-[1.35rem]" strokeWidth={active ? 2.25 : 1.75} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
