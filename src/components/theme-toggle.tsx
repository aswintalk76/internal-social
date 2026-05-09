"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const modes = [
  { id: "light" as const, label: "Light", Icon: Sun },
  { id: "dark" as const, label: "Dark", Icon: Moon },
  { id: "system" as const, label: "System", Icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn("h-9 w-[6.25rem] rounded-full bg-muted/50", className)}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-border/50 bg-muted/40 p-0.5",
        className,
      )}
      role="group"
      aria-label="Theme"
    >
      {modes.map(({ id, label, Icon }) => {
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-pressed={active}
            aria-label={`${label} theme`}
            onClick={() => setTheme(id)}
            className={cn(
              "rounded-full p-2 transition-all duration-200",
              active
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" strokeWidth={active ? 2.25 : 1.75} />
          </button>
        );
      })}
    </div>
  );
}
