import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { LoginForm } from "./login-form";

function LoginFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center text-muted-foreground">
      <Loader2 className="size-8 animate-spin" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
