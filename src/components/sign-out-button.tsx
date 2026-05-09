"use client";

import { useRouter } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { tokenStorage } from "@/lib/token-storage";
import { authService } from "@/services/auth.service";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    try {
      await authService.logout();
    } catch {
      /* ignore */
    }
    tokenStorage.clear();
    router.push(ROUTES.login);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
    >
      Sign out
    </button>
  );
}
