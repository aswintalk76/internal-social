"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { ROUTES } from "@/config/routes";
import { chatService } from "@/services/chat.service";

export default function ChatListPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["social-chats"],
    queryFn: () => chatService.listChats(),
  });

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Could not load conversations.
      </p>
    );
  }

  const items = data.items;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Chats</h1>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
          No conversations yet. Open someone&apos;s profile and tap{" "}
          <span className="font-medium text-foreground">Message</span>.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((c) => {
            const p = c.peer;
            const label = p.display_name?.trim() || p.username;
            const preview = c.last_message?.body ?? "No messages yet";
            const when = c.last_message
              ? formatDistanceToNow(new Date(c.last_message.created_at), {
                  addSuffix: true,
                })
              : "";
            return (
              <li key={c.id}>
                <Link
                  href={ROUTES.chatThread(c.id)}
                  className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                    {label.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-semibold text-foreground">
                        {label}
                      </span>
                      {when ? (
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {when}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{preview}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
