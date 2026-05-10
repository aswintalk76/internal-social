import type { ApiSuccess } from "@/types/api";
import type { ChatMessage, ChatSummary } from "@/types/chat";

import { apiClient } from "./api.client";

export const chatService = {
  async listChats(): Promise<{ items: ChatSummary[] }> {
    const { data } = await apiClient.get<ApiSuccess<{ items: ChatSummary[] }>>(
      "/social/chats",
    );
    return data.data;
  },

  async openChat(withUsername: string): Promise<ChatSummary> {
    const { data } = await apiClient.post<ApiSuccess<ChatSummary>>("/social/chats", {
      with_username: withUsername,
    });
    return data.data;
  },

  async getChat(chatId: string): Promise<ChatSummary> {
    const { data } = await apiClient.get<ApiSuccess<ChatSummary>>(
      `/social/chats/${chatId}`,
    );
    return data.data;
  },

  async getMessages(
    chatId: string,
    params?: { before?: string; limit?: number },
  ): Promise<{ items: ChatMessage[] }> {
    const { data } = await apiClient.get<ApiSuccess<{ items: ChatMessage[] }>>(
      `/social/chats/${chatId}/messages`,
      { params },
    );
    return data.data;
  },

  async sendMessage(chatId: string, body: string): Promise<ChatMessage> {
    const { data } = await apiClient.post<ApiSuccess<ChatMessage>>(
      `/social/chats/${chatId}/messages`,
      { body },
    );
    return data.data;
  },
};
