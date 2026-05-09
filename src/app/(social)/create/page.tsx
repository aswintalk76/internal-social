"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatApiError } from "@/lib/format-api-error";
import { ROUTES } from "@/config/routes";
import { socialService } from "@/services/social.service";

export default function CreatePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [body, setBody] = useState("");

  const createMut = useMutation({
    mutationFn: () => socialService.createPost(body.trim()),
    onSuccess: (post) => {
      void qc.invalidateQueries({ queryKey: ["social-feed"] });
      router.push(ROUTES.post(post.id));
    },
  });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        New post
      </h1>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What’s on your mind?"
        rows={8}
        className="min-h-[11rem] w-full resize-y rounded-xl border border-border/70 bg-card px-4 py-3.5 text-[15px] leading-relaxed text-card-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
      />
      {createMut.isError ? (
        <p className="text-sm text-destructive">
          {formatApiError(createMut.error, "Could not publish. Try again.")}
        </p>
      ) : null}
      <button
        type="button"
        disabled={!body.trim() || createMut.isPending}
        onClick={() => createMut.mutate()}
        className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-95 disabled:opacity-50"
      >
        {createMut.isPending ? "Publishing…" : "Publish"}
      </button>
    </div>
  );
}
