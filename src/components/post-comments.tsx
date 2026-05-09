"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Loader2, X } from "lucide-react";
import { useMemo, useState } from "react";

import { formatApiError } from "@/lib/format-api-error";
import { socialService } from "@/services/social.service";
import type { SocialComment } from "@/types/social";

function groupByParent(flat: SocialComment[]) {
  const byParent = new Map<string | null, SocialComment[]>();
  for (const c of flat) {
    const k = c.parent_comment_id;
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k)!.push(c);
  }
  return byParent;
}

function CommentTree({
  comment,
  byParent,
  byId,
  onReply,
}: {
  comment: SocialComment;
  byParent: Map<string | null, SocialComment[]>;
  byId: Map<string, SocialComment>;
  onReply: (c: SocialComment) => void;
}) {
  const replies = byParent.get(comment.id) ?? [];
  const parent = comment.parent_comment_id
    ? byId.get(comment.parent_comment_id)
    : undefined;
  const label =
    comment.author.display_name?.trim() ||
    comment.author.username;

  return (
    <li className="rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-sm">
      {parent ? (
        <p className="mb-1 text-xs text-muted-foreground">
          <span className="text-foreground/80">Reply</span>
          {" · "}
          <span className="font-medium text-foreground">
            @{parent.author.username}
          </span>
          <span className="text-muted-foreground">
            {" "}
            ({parent.author.display_name?.trim() || parent.author.username})
          </span>
        </p>
      ) : null}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
        <span className="font-semibold text-card-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          @{comment.author.username}
        </span>
        <span className="text-xs text-muted-foreground">
          · {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
        </span>
      </div>
      <p className="mt-1.5 whitespace-pre-wrap text-card-foreground">{comment.body}</p>
      <button
        type="button"
        onClick={() => onReply(comment)}
        className="mt-2 text-xs font-medium text-primary hover:underline"
      >
        Reply
      </button>
      {replies.length > 0 ? (
        <ul className="mt-3 space-y-2 border-l-2 border-primary/25 pl-3">
          {replies.map((r) => (
            <CommentTree
              key={r.id}
              comment={r}
              byParent={byParent}
              byId={byId}
              onReply={onReply}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function PostComments({ postId }: { postId: string }) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<SocialComment | null>(null);
  const { data, isPending, isError } = useQuery({
    queryKey: ["social-comments", postId],
    queryFn: () => socialService.listComments(postId),
  });

  const flat = data ?? [];
  const { byParent, byId, roots } = useMemo(() => {
    const byParent = groupByParent(flat);
    const byId = new Map(flat.map((c) => [c.id, c]));
    const roots = byParent.get(null) ?? [];
    return { byParent, byId, roots };
  }, [flat]);

  const addMut = useMutation({
    mutationFn: () =>
      socialService.addComment(
        postId,
        body.trim(),
        replyTo?.id ?? null,
      ),
    onSuccess: () => {
      setBody("");
      setReplyTo(null);
      void qc.invalidateQueries({ queryKey: ["social-comments", postId] });
      void qc.invalidateQueries({ queryKey: ["social-post", postId] });
      void qc.invalidateQueries({ queryKey: ["social-feed"] });
    },
  });

  return (
    <section id="comments" className="space-y-4 scroll-mt-24">
      <h2 className="text-lg font-semibold">Comments</h2>

      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim() || addMut.isPending) return;
          addMut.mutate();
        }}
      >
        {replyTo ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              Replying to{" "}
              <span className="font-medium text-foreground">
                {replyTo.author.display_name?.trim() || replyTo.author.username}
              </span>{" "}
              <span className="text-muted-foreground">
                (@{replyTo.author.username})
              </span>
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <X className="size-3.5" />
              Cancel
            </button>
          </div>
        ) : null}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            replyTo
              ? `Reply to @${replyTo.author.username}…`
              : "Write a comment…"
          }
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={!body.trim() || addMut.isPending}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {addMut.isPending ? "Posting…" : replyTo ? "Post reply" : "Post comment"}
        </button>
        {addMut.isError ? (
          <p className="text-xs text-destructive">
            {formatApiError(addMut.error, "Could not post comment.")}
          </p>
        ) : null}
      </form>

      {isPending ? (
        <div className="flex justify-center py-8 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : null}
      {isError ? (
        <p className="text-sm text-destructive">Failed to load comments.</p>
      ) : null}

      <ul className="space-y-3">
        {roots.map((c) => (
          <CommentTree
            key={c.id}
            comment={c}
            byParent={byParent}
            byId={byId}
            onReply={setReplyTo}
          />
        ))}
      </ul>
      {flat.length === 0 && !isPending ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : null}
    </section>
  );
}
