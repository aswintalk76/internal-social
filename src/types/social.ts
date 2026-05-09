/** Aligns with planned GET /api/v1/social/feed + post payloads */
export type SocialAuthor = {
  id: string;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
};

export type SocialPost = {
  id: string;
  author: SocialAuthor;
  body: string;
  created_at: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
  score?: number;
  liked_by_me?: boolean;
  saved_by_me?: boolean;
  following_author?: boolean;
  /** True when the signed-in user authored this post */
  is_my_post?: boolean;
};

export type SocialComment = {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  body: string;
  created_at: string;
  author: SocialAuthor;
};

export type FeedResponse = {
  items: SocialPost[];
  next_cursor: string | null;
};

/** Row from `social_profiles` + API envelope */
export type SocialProfileRow = {
  id: string;
  user_id: string;
  username: string;
  display_name?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type MeUser = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
};

/** User row for followers / following lists */
export type ProfileMember = {
  user_id: string;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
};

export type ProfileBundle = {
  profile: SocialProfileRow;
  followers_count: number;
  following_count: number;
  posts_count: number;
  following: boolean;
  is_me: boolean;
  user?: MeUser | null;
};
