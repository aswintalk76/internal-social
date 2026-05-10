const adminAppUrl =
  process.env.NEXT_PUBLIC_ADMIN_APP_URL ?? "http://localhost:3000";

function defaultWsUrl(): string {
  const raw = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (raw) return raw;
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
  try {
    const u = new URL(api);
    return u.origin;
  } catch {
    return "http://localhost:5000";
  }
}

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Ashwani social Book",
  responseEncryptionKey:
    process.env.NEXT_PUBLIC_RESPONSE_ENCRYPTION_KEY ?? "ashwani-social-book",
  /** Origin of Nexus Admin — used to validate session handoff postMessages. */
  adminAppOrigin: new URL(adminAppUrl).origin,
  /** Socket.io origin (same host as API, no /api path). */
  wsUrl: defaultWsUrl(),
} as const;
