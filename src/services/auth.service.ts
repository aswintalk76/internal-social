import type { ApiSuccess } from "@/types/api";
import type { LoginResponse } from "@/types/auth";

import { apiClient } from "./api.client";

export type LoginInput = { email: string; password: string };

export const authService = {
  async login(body: LoginInput) {
    const { data } = await apiClient.post<ApiSuccess<LoginResponse>>(
      "/auth/login",
      body,
    );
    return data.data;
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      /* caller clears storage */
    }
  },
};
