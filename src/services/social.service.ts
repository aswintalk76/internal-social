import { demoFeed } from "@/data/demo-feed";
import type { ApiSuccess } from "@/types/api";
import type {
  FeedResponse,
  ProfileBundle,
  ProfileMember,
  SocialComment,
  SocialPost,
} from "@/types/social";

import { apiClient } from "./api.client";

function normalizeFeed(raw: unknown): FeedResponse {
  if (!raw || typeof raw !== "object") return demoFeed;
  const o = raw as Record<string, unknown>;
  const items = (o.items ?? o.posts ?? []) as SocialPost[];
  const next =
    (o.next_cursor as string | null | undefined) ??
    (o.nextCursor as string | null | undefined) ??
    null;
  if (!Array.isArray(items)) return demoFeed;
  if (items.length === 0) return { items: [], next_cursor: next ?? null };
  return { items, next_cursor: next };
}

export const socialService = {
  async getFeed(cursor?: string): Promise<FeedResponse> {
    try {
      const { data } = await apiClient.get<
        ApiSuccess<FeedResponse> | ApiSuccess<{ posts?: SocialPost[] }>
      >("/social/feed", {
        params: cursor ? { cursor } : undefined,
      });
      return normalizeFeed(data.data);
    } catch {
      return demoFeed;
    }
  },

  async getPost(id: string): Promise<SocialPost | null> {
    try {
      const { data } = await apiClient.get<ApiSuccess<SocialPost>>(
        `/social/posts/${id}`,
      );
      return data.data;
    } catch {
      const fromDemo = demoFeed.items.find((p) => p.id === id);
      return fromDemo ?? null;
    }
  },

  async createPost(body: string): Promise<SocialPost> {
    const { data } = await apiClient.post<ApiSuccess<SocialPost>>("/social/posts", {
      body,
    });
    return data.data;
  },

  async likePost(postId: string): Promise<{ liked: boolean; like_count: number }> {
    const { data } = await apiClient.post<
      ApiSuccess<{ liked: boolean; like_count: number }>
    >(`/social/posts/${postId}/like`);
    return data.data;
  },

  async unlikePost(postId: string): Promise<{ liked: boolean; like_count: number }> {
    const { data } = await apiClient.delete<
      ApiSuccess<{ liked: boolean; like_count: number }>
    >(`/social/posts/${postId}/like`);
    return data.data;
  },

  async sharePost(
    postId: string,
    note?: string,
  ): Promise<{ ok: boolean; share_count: number }> {
    const { data } = await apiClient.post<
      ApiSuccess<{ ok: boolean; share_count: number }>
    >(`/social/posts/${postId}/share`, { note: note ?? undefined });
    return data.data;
  },

  async recordView(
    postId: string,
  ): Promise<{ counted: boolean; view_count: number }> {
    const { data } = await apiClient.post<
      ApiSuccess<{ counted: boolean; view_count: number }>
    >(`/social/posts/${postId}/view`);
    return data.data;
  },

  async listComments(postId: string): Promise<SocialComment[]> {
    const { data } = await apiClient.get<ApiSuccess<SocialComment[]>>(
      `/social/posts/${postId}/comments`,
    );
    return data.data;
  },

  async addComment(
    postId: string,
    body: string,
    parent_comment_id?: string | null,
  ): Promise<SocialComment> {
    const { data } = await apiClient.post<ApiSuccess<SocialComment>>(
      `/social/posts/${postId}/comments`,
      { body, parent_comment_id: parent_comment_id ?? null },
    );
    return data.data;
  },

  async getMe(): Promise<ProfileBundle> {
    const { data } = await apiClient.get<ApiSuccess<ProfileBundle>>("/social/me");
    return data.data;
  },

  async getProfile(username: string): Promise<ProfileBundle> {
    const { data } = await apiClient.get<ApiSuccess<ProfileBundle>>(
      `/social/profiles/${encodeURIComponent(username)}`,
    );
    return data.data;
  },

  async follow(username: string): Promise<{ following: boolean }> {
    const { data } = await apiClient.post<ApiSuccess<{ following: boolean }>>(
      `/social/profiles/${encodeURIComponent(username)}/follow`,
    );
    return data.data;
  },

  async unfollow(username: string): Promise<{ following: boolean }> {
    const { data } = await apiClient.delete<ApiSuccess<{ following: boolean }>>(
      `/social/profiles/${encodeURIComponent(username)}/follow`,
    );
    return data.data;
  },

  async getProfilePosts(
    username: string,
    params?: { limit?: number; offset?: number },
  ): Promise<{ items: SocialPost[] }> {
    const { data } = await apiClient.get<ApiSuccess<{ items: SocialPost[] }>>(
      `/social/profiles/${encodeURIComponent(username)}/posts`,
      { params },
    );
    return data.data;
  },

  async getProfileFollowers(username: string): Promise<ProfileMember[]> {
    const { data } = await apiClient.get<ApiSuccess<ProfileMember[]>>(
      `/social/profiles/${encodeURIComponent(username)}/followers`,
    );
    return data.data;
  },

  async getProfileFollowing(username: string): Promise<ProfileMember[]> {
    const { data } = await apiClient.get<ApiSuccess<ProfileMember[]>>(
      `/social/profiles/${encodeURIComponent(username)}/following`,
    );
    return data.data;
  },
};
