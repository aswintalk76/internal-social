"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { PostCard } from "@/components/post-card";
import { PostComments } from "@/components/post-comments";
import { ROUTES } from "@/config/routes";
import { socialService } from "@/services/social.service";

export function PostDetail({ postId }: { postId: string }) {
  const { data, isPending } = useQuery({
    queryKey: ["social-post", postId],
    queryFn: () => socialService.getPost(postId),
  });

  if (isPending) {
    return (
      <div className="flex min-h-[14rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-card/40 py-16 text-muted-foreground">
        <Loader2 className="size-9 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading post…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-5">
        <Link
          href={ROUTES.home}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <p className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Post not found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <Link
        href={ROUTES.home}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <PostCard post={data} recordViewOnMount />
      <PostComments postId={postId} />
    </div>
  );
}
