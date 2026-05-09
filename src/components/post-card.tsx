"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, Eye, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ROUTES } from "@/config/routes";
import { socialService } from "@/services/social.service";
import type { SocialPost } from "@/types/social";
import { cn } from "@/lib/utils";

type Props = {
  post: SocialPost;
  className?: string;
  /** Count a view when the card mounts (deduped per tab session). */
  recordViewOnMount?: boolean;
};

export function PostCard({
  post: initialPost,
  className,
  recordViewOnMount = false,
}: Props) {
  const qc = useQueryClient();
  const [post, setPost] = useState(initialPost);
  const [busy, setBusy] = useState<"like" | "share" | null>(null);
  const [followBusy, setFollowBusy] = useState(false);
  const [followingAuthor, setFollowingAuthor] = useState(
    () => Boolean(initialPost.following_author),
  );
  const [err, setErr] = useState<string | null>(null);
  const viewDone = useRef(false);

  useEffect(() => {
    setPost(initialPost);
    setFollowingAuthor(Boolean(initialPost.following_author));
  }, [initialPost]);

  useEffect(() => {
    if (!recordViewOnMount || viewDone.current) return;
    const k = `social:view:${initialPost.id}`;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(k)) return;
    viewDone.current = true;
    socialService
      .recordView(initialPost.id)
      .then((r) => {
        if (typeof sessionStorage !== "undefined") sessionStorage.setItem(k, "1");
        setPost((p) => ({ ...p, view_count: r.view_count }));
      })
      .catch(() => {
        viewDone.current = false;
      });
  }, [initialPost.id, recordViewOnMount]);

  const when = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setErr(null);
    const nextLiked = !post.liked_by_me;
    const before = post;
    setBusy("like");
    setPost((p) => ({
      ...p,
      liked_by_me: nextLiked,
      like_count: Math.max(
        0,
        (p.like_count ?? 0) + (nextLiked ? 1 : -1),
      ),
    }));
    try {
      const data = nextLiked
        ? await socialService.likePost(before.id)
        : await socialService.unlikePost(before.id);
      setPost((p) => ({
        ...p,
        liked_by_me: data.liked,
        like_count: data.like_count,
      }));
      void qc.invalidateQueries({ queryKey: ["social-feed"] });
      void qc.invalidateQueries({ queryKey: ["social-post", post.id] });
    } catch {
      setPost(before);
      setErr("Could not update like.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleFollow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (post.is_my_post === true) return;
    setErr(null);
    const uname = post.author.username;
    const nextFollowing = !followingAuthor;
    setFollowBusy(true);
    setFollowingAuthor(nextFollowing);
    try {
      if (nextFollowing) await socialService.follow(uname);
      else await socialService.unfollow(uname);
      setPost((p) => ({ ...p, following_author: nextFollowing }));
      void qc.invalidateQueries({ queryKey: ["social-feed"] });
      void qc.invalidateQueries({ queryKey: ["social-profile"] });
      void qc.invalidateQueries({ queryKey: ["social-post", post.id] });
    } catch {
      setFollowingAuthor(!nextFollowing);
      setErr("Follow failed.");
    } finally {
      setFollowBusy(false);
    }
  }

  async function onShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setErr(null);
    setBusy("share");
    try {
      const data = await socialService.sharePost(post.id);
      setPost((p) => ({ ...p, share_count: data.share_count }));
      void qc.invalidateQueries({ queryKey: ["social-feed"] });
      void qc.invalidateQueries({ queryKey: ["social-post", post.id] });
    } catch {
      setErr("Share failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <article
      className={cn(
        "rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3 sm:gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground sm:size-12 sm:text-base">
          {(post.author.display_name ?? post.author.username)
            .slice(0, 1)
            .toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                <Link
                  href={ROUTES.profile(post.author.username)}
                  className="truncate font-semibold text-foreground hover:underline"
                >
                  {post.author.display_name ?? post.author.username}
                </Link>
                <span className="text-sm text-muted-foreground">
                  @{post.author.username}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{when}</p>
            </div>
            {post.is_my_post !== true ? (
              <button
                type="button"
                onClick={toggleFollow}
                disabled={followBusy}
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-60",
                  followingAuthor
                    ? "border-border bg-muted/50 text-foreground"
                    : "border-primary bg-primary/10 text-primary hover:bg-primary/20",
                )}
              >
                {followBusy ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : followingAuthor ? (
                  "Following"
                ) : (
                  "Follow"
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <Link href={ROUTES.post(post.id)} className="block">
        <p className="whitespace-pre-wrap text-[15px] leading-[1.65] text-card-foreground sm:text-base sm:leading-relaxed">
          {post.body}
        </p>
      </Link>

      {err ? (
        <p className="mt-2 text-xs text-destructive">{err}</p>
      ) : null}

      <div
        className="mt-4 flex flex-wrap items-center gap-2 text-muted-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={toggleLike}
          disabled={busy !== null}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm transition-colors hover:bg-muted",
            post.liked_by_me && "text-primary",
          )}
        >
          {busy === "like" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Heart
              className="size-4"
              fill={post.liked_by_me ? "currentColor" : "none"}
            />
          )}
          {post.like_count ?? 0}
        </button>

        <Link
          href={`${ROUTES.post(post.id)}#comments`}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm transition-colors hover:bg-muted"
        >
          <MessageCircle className="size-4" />
          {post.comment_count ?? 0}
        </Link>

        <button
          type="button"
          onClick={onShare}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm transition-colors hover:bg-muted"
        >
          {busy === "share" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Share2 className="size-4" />
          )}
          {post.share_count ?? 0}
        </button>

        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-sm">
          <Eye className="size-4" />
          {post.view_count ?? 0}
        </span>

        {post.score != null ? (
          <span className="ml-auto rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
            score {(post.score * 100).toFixed(0)}
          </span>
        ) : null}
      </div>
    </article>
  );
}
