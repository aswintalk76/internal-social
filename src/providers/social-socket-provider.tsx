"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";

import { env } from "@/config/env";
import { tokenStorage } from "@/lib/token-storage";

/** Subscribes to Socket.io for live chat; safe if the server is down. */
export function SocialSocketProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  useEffect(() => {
    const access = tokenStorage.getAccess();
    if (!access) return;

    let socket: Socket | undefined;
    try {
      socket = io(env.wsUrl, {
        transports: ["websocket", "polling"],
        auth: { token: access },
        reconnectionAttempts: 5,
      });
    } catch {
      return;
    }

    socket.on("chat:message", (payload: { chat_id?: string }) => {
      const id = payload?.chat_id;
      if (!id) return;
      void qc.invalidateQueries({ queryKey: ["chat-messages", id] });
      void qc.invalidateQueries({ queryKey: ["chat", id] });
      void qc.invalidateQueries({ queryKey: ["social-chats"] });
    });

    socket.on("connect_error", () => {
      /* backend may be offline */
    });

    return () => {
      socket?.disconnect();
    };
  }, [qc]);

  return <>{children}</>;
}
