export const ROUTES = {
  home: "/",
  login: "/login",
  create: "/create",
  saved: "/saved",
  post: (id: string) => `/post/${id}`,
  profile: (username: string) => `/u/${username}`,
} as const;
