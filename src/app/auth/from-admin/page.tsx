"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

import { env } from "@/config/env";
import { ROUTES } from "@/config/routes";
import {
  FLUENT_HANDOFF_REQUEST,
  NEXUS_HANDOFF_TOKENS,
} from "@/lib/admin-handoff";
import { ThemeToggle } from "@/components/theme-toggle";
import { tokenStorage } from "@/lib/token-storage";

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return ROUTES.home;
  return raw;
}

function FromAdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [hint, setHint] = useState<"waiting" | "no_opener" | "timeout">(
    "waiting",
  );

  useEffect(() => {
    const adminOrigin = env.adminAppOrigin;
    let finished = false;

    function onMessage(e: MessageEvent) {
      if (e.origin !== adminOrigin) return;
      if (e.data?.type !== NEXUS_HANDOFF_TOKENS) return;
      const { accessToken, refreshToken } = e.data as {
        accessToken?: unknown;
        refreshToken?: unknown;
      };
      if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
        return;
      }
      finished = true;
      tokenStorage.setTokens(accessToken, refreshToken);
      router.replace(next);
    }

    window.addEventListener("message", onMessage);

    const hasOpener = Boolean(window.opener && !window.opener.closed);
    let t: number | undefined;
    if (hasOpener) {
      try {
        window.opener.postMessage({ type: FLUENT_HANDOFF_REQUEST }, adminOrigin);
        t = window.setTimeout(() => {
          if (!finished) setHint("timeout");
        }, 45_000);
      } catch {
        setHint("no_opener");
      }
    } else {
      setHint("no_opener");
    }

    return () => {
      window.removeEventListener("message", onMessage);
      if (t !== undefined) window.clearTimeout(t);
    };
  }, [next, router]);

  const loginHref = `${ROUTES.login}?next=${encodeURIComponent(next)}`;

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {hint === "waiting"
            ? `Opening ${env.appName}…`
            : "Session handoff failed"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {hint === "waiting"
            ? "Completing sign-in."
            : hint === "no_opener"
              ? "Open this link from the admin directory while signed in, or continue below."
              : "Sign in to continue."}
        </p>
        {hint !== "waiting" ? (
          <Link
            href={loginHref}
            className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Sign in
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function FromAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center text-muted-foreground">
          Loading…
        </div>
      }
    >
      <FromAdminContent />
    </Suspense>
  );
}
