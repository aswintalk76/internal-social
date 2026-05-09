const adminAppUrl =
  process.env.NEXT_PUBLIC_ADMIN_APP_URL ?? "http://localhost:3000";

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Ashwani social Book",
  responseEncryptionKey:
    process.env.NEXT_PUBLIC_RESPONSE_ENCRYPTION_KEY ?? "ashwani-social-book",
  /** Origin of Nexus Admin — used to validate session handoff postMessages. */
  adminAppOrigin: new URL(adminAppUrl).origin,
} as const;
