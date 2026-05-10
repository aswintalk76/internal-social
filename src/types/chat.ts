export type ChatPeer = {
  user_id: string;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
};

export type ChatLastMessage = {
  body: string;
  created_at: string;
  sender_id: string;
};

export type ChatSummary = {
  id: string;
  peer: ChatPeer;
  last_message: ChatLastMessage | null;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  body: string;
  created_at: string;
  sender_id: string;
  author: {
    username: string;
    display_name: string;
    avatar_url?: string | null;
  };
};
