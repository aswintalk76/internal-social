const ACCESS_KEY = "is_access_token";
const REFRESH_KEY = "is_refresh_token";
const AUTH_COOKIE = "is_auth";

function setAuthCookie(active: boolean) {
  if (typeof document === "undefined") return;
  const maxAge = active ? 60 * 60 * 24 * 7 : 0;
  const flag = active ? "1" : "";
  document.cookie = `${AUTH_COOKIE}=${flag}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export const tokenStorage = {
  getAccess(): string | null {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage.getItem(ACCESS_KEY);
  },

  getRefresh(): string | null {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage.getItem(REFRESH_KEY);
  },

  setTokens(access: string, refresh: string) {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(ACCESS_KEY, access);
    sessionStorage.setItem(REFRESH_KEY, refresh);
    setAuthCookie(true);
  },

  clear() {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    setAuthCookie(false);
  },

  hasSession(): boolean {
    return Boolean(tokenStorage.getAccess() && tokenStorage.getRefresh());
  },
};
