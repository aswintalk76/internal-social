export const ROUTES = {
  home: "/",
  login: "/login",
  chat: "/chat",
  chatThread: (id: string) => `/chat/${id}`,
  create: "/create",
  saved: "/saved",
  post: (id: string) => `/post/${id}`,
  profile: (username: string) => `/u/${username}`,
} as const;
