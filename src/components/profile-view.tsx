"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { PostCard } from "@/components/post-card";
import { SignOutButton } from "@/components/sign-out-button";
import { ROUTES } from "@/config/routes";
import { formatApiError } from "@/lib/format-api-error";
import { cn } from "@/lib/utils";
import { socialService } from "@/services/social.service";
import type { ProfileMember } from "@/types/social";

type Props = { username: string };

type Tab = "posts" | "followers" | "following";

export function ProfileView({ username }: Props) {
  const qc = useQueryClient();
  const isMeShortcut = username === "me";
  const [tab, setTab] = useState<Tab>("posts");

  const query = useQuery({
    queryKey: ["social-profile", isMeShortcut ? "__me__" : username],
    queryFn: () =>
      isMeShortcut ? socialService.getMe() : socialService.getProfile(username),
  });

  const profileHandle =
    username === "me" ? (query.data?.profile.username ?? "") : username;

  const postsQuery = useQuery({
    queryKey: ["profile-posts", profileHandle],
    queryFn: () => socialService.getProfilePosts(profileHandle),
    enabled: Boolean(profileHandle) && query.isSuccess && tab === "posts",
  });

  const followersQuery = useQuery({
    queryKey: ["profile-followers", profileHandle],
    queryFn: () => socialService.getProfileFollowers(profileHandle),
    enabled: Boolean(profileHandle) && query.isSuccess && tab === "followers",
  });

  const followingQuery = useQuery({
    queryKey: ["profile-following", profileHandle],
    queryFn: () => socialService.getProfileFollowing(profileHandle),
    enabled: Boolean(profileHandle) && query.isSuccess && tab === "following",
  });

  const followMut = useMutation({
    mutationFn: async () => {
      if (!query.data) throw new Error("No profile");
      const u = query.data.profile.username;
      if (query.data.following) return socialService.unfollow(u);
      return socialService.follow(u);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["social-profile"] });
      void qc.invalidateQueries({ queryKey: ["profile-posts"] });
      void qc.invalidateQueries({ queryKey: ["profile-followers"] });
      void qc.invalidateQueries({ queryKey: ["profile-following"] });
      void qc.invalidateQueries({ queryKey: ["social-feed"] });
    },
  });

  if (query.isPending) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {formatApiError(
            query.error,
            "Profile not found or you need to sign in again.",
          )}
        </p>
        <Link
          href={ROUTES.home}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to feed
        </Link>
      </div>
    );
  }

  const bundle = query.data;
  const { profile, followers_count, following_count, posts_count, is_me } =
    bundle;
  const label =
    profile.display_name?.trim() || profile.username;
  const initial = label.slice(0, 1).toUpperCase();

  const tabBtn = (t: Tab, count: number, labelText: string) => (
    <button
      type="button"
      onClick={() => setTab(t)}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 rounded-xl border px-2 py-2 text-center transition-colors sm:flex-row sm:justify-center sm:gap-2",
        tab === t
          ? "border-primary/50 bg-primary/10 text-foreground"
          : "border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50",
      )}
    >
      <span className="text-lg font-bold tabular-nums text-foreground">
        {count}
      </span>
      <span className="text-xs font-medium">{labelText}</span>
    </button>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex size-[4.5rem] items-center justify-center rounded-xl bg-muted text-2xl font-semibold text-foreground sm:size-20 sm:text-3xl">
            {initial}
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {label}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            @{profile.username}
          </p>
          {profile.bio ? (
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-card-foreground sm:text-[15px]">
              {profile.bio}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {is_me ? <SignOutButton /> : null}
          {!is_me ? (
            <button
              type="button"
              disabled={followMut.isPending}
              onClick={() => followMut.mutate()}
              className="rounded-full border border-border/80 bg-background/90 px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors hover:bg-muted disabled:opacity-50"
            >
              {followMut.isPending
                ? "…"
                : bundle.following
                  ? "Following"
                  : "Follow"}
            </button>
          ) : null}
        </div>
        </div>
      </div>

      {followMut.isError ? (
        <p className="text-xs text-destructive">
          {formatApiError(followMut.error, "Could not update follow.")}
        </p>
      ) : null}

      <div className="flex gap-2 sm:gap-3">
        {tabBtn("posts", posts_count, "Posts")}
        {tabBtn("followers", followers_count, "Followers")}
        {tabBtn("following", following_count, "Following")}
      </div>

      {tab === "posts" ? (
        <div className="space-y-5 sm:space-y-6">
          {postsQuery.isPending ? (
            <div className="flex justify-center py-12 text-muted-foreground">
              <Loader2 className="size-7 animate-spin" />
            </div>
          ) : null}
          {postsQuery.isError ? (
            <p className="text-sm text-destructive">
              {formatApiError(postsQuery.error, "Could not load posts.")}
            </p>
          ) : null}
          {postsQuery.data?.items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/70 bg-muted/25 py-12 text-center text-sm text-muted-foreground">
              No posts yet.
            </p>
          ) : null}
          <ul className="space-y-5 sm:space-y-6">
            {(postsQuery.data?.items ?? []).map((post) => (
              <li key={post.id}>
                <PostCard post={post} recordViewOnMount />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === "followers" ? (
        <MemberList
          query={followersQuery}
          empty="No followers yet."
        />
      ) : null}

      {tab === "following" ? (
        <MemberList
          query={followingQuery}
          empty="Not following anyone yet."
        />
      ) : null}

      <Link
        href={ROUTES.home}
        className="text-sm font-medium text-primary hover:underline"
      >
        ← Back to feed
      </Link>
    </div>
  );
}

function MemberList({
  query,
  empty,
}: {
  query: UseQueryResult<ProfileMember[], Error>;
  empty: string;
}) {
  if (query.isPending) {
    return (
      <div className="flex justify-center py-12 text-muted-foreground">
        <Loader2 className="size-7 animate-spin" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <p className="text-sm text-destructive">
        {formatApiError(query.error, "Could not load list.")}
      </p>
    );
  }
  const rows = query.data ?? [];
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>
    );
  }
  return (
    <ul className="space-y-2">
      {rows.map((m) => (
        <li key={m.user_id}>
          <Link
            href={ROUTES.profile(m.username)}
            className="flex items-center gap-3 rounded-xl border border-border/80 bg-card px-3 py-2 transition-colors hover:bg-muted/40"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {(m.display_name ?? m.username).slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {m.display_name?.trim() || m.username}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                @{m.username}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
