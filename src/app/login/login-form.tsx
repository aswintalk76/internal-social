"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { env } from "@/config/env";
import { ROUTES } from "@/config/routes";
import { ThemeToggle } from "@/components/theme-toggle";
import { tokenStorage } from "@/lib/token-storage";
import { authService } from "@/services/auth.service";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? ROUTES.home;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
      router.push(next.startsWith("/") ? next : ROUTES.home);
      router.refresh();
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-16 sm:py-20">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[22rem] space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{env.appName}</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-xl border border-border/60 bg-card p-6 sm:p-7"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/80 px-3 py-3 text-card-foreground outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/80 px-3 py-3 text-card-foreground outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
