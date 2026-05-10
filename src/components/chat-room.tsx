"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ROUTES } from "@/config/routes";
import { formatApiError } from "@/lib/format-api-error";
import { chatService } from "@/services/chat.service";
import { cn } from "@/lib/utils";

type Props = { chatId: string };

export function ChatRoom({ chatId }: Props) {
  const qc = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");

  const summaryQuery = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => chatService.getChat(chatId),
  });

  const messagesQuery = useQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: () => chatService.getMessages(chatId),
  });

  const sendMut = useMutation({
    mutationFn: () => chatService.sendMessage(chatId, text.trim()),
    onSuccess: () => {
      setText("");
      void qc.invalidateQueries({ queryKey: ["chat-messages", chatId] });
      void qc.invalidateQueries({ queryKey: ["social-chats"] });
      void qc.invalidateQueries({ queryKey: ["chat", chatId] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQuery.data?.items.length]);

  if (summaryQuery.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <div className="space-y-3">
        <Link
          href={ROUTES.chat}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to chats
        </Link>
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {formatApiError(summaryQuery.error, "Chat not found.")}
        </p>
      </div>
    );
  }

  const peer = summaryQuery.data.peer;
  const peerLabel = peer.display_name?.trim() || peer.username;
  const items = messagesQuery.data?.items ?? [];

  return (
    <div className="flex min-h-[50vh] flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
        <Link
          href={ROUTES.chat}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          <span className="sr-only sm:not-sr-only">Chats</span>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{peerLabel}</p>
          <p className="truncate text-xs text-muted-foreground">@{peer.username}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 rounded-xl border border-border/50 bg-muted/15 p-3 sm:p-4">
        {messagesQuery.isPending ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-7 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet. Say hello.
          </p>
        ) : (
          <ul className="flex max-h-[min(55vh,28rem)] flex-col gap-2 overflow-y-auto pr-1">
            {items.map((m) => {
              const isMine = m.sender_id !== peer.user_id;
              const when = formatDistanceToNow(new Date(m.created_at), {
                addSuffix: true,
              });
              return (
                <li
                  key={m.id}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm sm:max-w-[75%]",
                    isMine
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto border border-border/70 bg-card text-card-foreground",
                  )}
                >
                  {!isMine ? (
                    <p className="mb-0.5 text-[11px] font-semibold text-muted-foreground">
                      {m.author.display_name ?? m.author.username}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px] opacity-80",
                      isMine ? "text-primary-foreground/90" : "text-muted-foreground",
                    )}
                  >
                    {when}
                  </p>
                </li>
              );
            })}
            <div ref={bottomRef} />
          </ul>
        )}
      </div>

      <form
        className="flex flex-col gap-2 border-t border-border/60 pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim() || sendMut.isPending) return;
          sendMut.mutate();
        }}
      >
        {sendMut.isError ? (
          <p className="text-xs text-destructive">
            {formatApiError(sendMut.error, "Could not send.")}
          </p>
        ) : null}
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message…"
            rows={2}
            className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={!text.trim() || sendMut.isPending}
            className="shrink-0 self-end rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {sendMut.isPending ? "…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
