import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { env } from "@/config/env";
import { ROUTES } from "@/config/routes";
import { maybeDecryptResponse } from "@/lib/response-crypto";
import { tokenStorage } from "@/lib/token-storage";

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

let refreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (e: unknown) => void;
}> = [];

async function refreshAccess(): Promise<string> {
  const rt = tokenStorage.getRefresh();
  if (!rt) throw new Error("No refresh token");
  const { data } = await axios.post<{
    success: boolean;
    data: { accessToken: string; refreshToken: string };
  }>(`${env.apiUrl}/auth/refresh-token`, { refresh_token: rt });
  if (!data.success || !data.data?.accessToken || !data.data?.refreshToken) {
    throw new Error("Refresh failed");
  }
  tokenStorage.setTokens(data.data.accessToken, data.data.refreshToken);
  return data.data.accessToken;
}

function redirectSessionExpired() {
  tokenStorage.clear();
  if (typeof window !== "undefined") {
    window.location.href = ROUTES.login;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  async (res) => {
    res.data = await maybeDecryptResponse(res.data, env.responseEncryptionKey);
    return res;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status;

    if (!original || status !== 401) {
      return Promise.reject(error);
    }

    const url = original.url ?? "";
    if (
      url.includes("/auth/refresh-token") ||
      url.includes("/auth/login") ||
      url.includes("/auth/register")
    ) {
      redirectSessionExpired();
      return Promise.reject(error);
    }

    if (original._retry) {
      redirectSessionExpired();
      return Promise.reject(error);
    }
    original._retry = true;

    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (newToken: string) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    refreshing = true;
    try {
      const newAccess = await refreshAccess();
      queue.forEach((p) => p.resolve(newAccess));
      queue = [];
      original.headers.Authorization = `Bearer ${newAccess}`;
      return apiClient(original);
    } catch (e) {
      queue.forEach((p) => p.reject(e));
      queue = [];
      redirectSessionExpired();
      return Promise.reject(error);
    } finally {
      refreshing = false;
    }
  },
);
