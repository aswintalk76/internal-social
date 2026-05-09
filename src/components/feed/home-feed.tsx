"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { PostCard } from "@/components/post-card";
import { socialService } from "@/services/social.service";

export function HomeFeed() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["social-feed"],
    queryFn: () => socialService.getFeed(),
  });

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin opacity-70" aria-hidden />
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Something went wrong. Try again in a moment.
      </p>
    );
  }

  return (
    <ul className="space-y-5 sm:space-y-6">
      {data.items.map((post) => (
        <li key={post.id}>
          <PostCard post={post} recordViewOnMount />
        </li>
      ))}
    </ul>
  );
}
