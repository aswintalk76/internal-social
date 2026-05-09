import type { FeedResponse } from "@/types/social";

/** Shown when `/social/feed` is not available yet (backend P0). */
export const demoFeed: FeedResponse = {
  next_cursor: null,
  items: [
    {
      id: "demo-1",
      body: "Ranked feed + engagement signals — wire this card to `GET /api/v1/social/feed` when the module ships.",
      created_at: new Date().toISOString(),
      like_count: 42,
      comment_count: 7,
      share_count: 3,
      view_count: 1200,
      score: 0.92,
      author: {
        id: "author-1",
        username: "nexus_team",
        display_name: "Nexus Team",
      },
    },
    {
      id: "demo-2",
      body: "Follow authors, like, comment — all routes live under `/api/v1/social/*` per the platform spec.",
      created_at: new Date(Date.now() - 3600_000).toISOString(),
      like_count: 18,
      comment_count: 2,
      share_count: 1,
      view_count: 340,
      score: 0.71,
      author: {
        id: "author-2",
        username: "dev_notes",
        display_name: "Dev notes",
      },
    },
  ],
};
