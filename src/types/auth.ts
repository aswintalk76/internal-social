import type { User } from "./user";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  sessionId?: string;
};

export type LoginResponse = AuthTokens & {
  user: User;
};
