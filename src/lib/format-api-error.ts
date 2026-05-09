import axios, { type AxiosError } from "axios";

type ErrBody = {
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
};

/** Maps Axios / NexusCore error responses to a short user-visible string. */
export function formatApiError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<ErrBody>;
    const data = ax.response?.data;
    if (data?.message && typeof data.message === "string") return data.message;
    const first = data?.errors?.[0]?.message;
    if (first) return first;
    const status = ax.response?.status;
    if (status === 401)
      return "Sign in again to continue.";
    if (status === 403) return "You can’t do that.";
    if (status === 404) return "Not found.";
    if (status === 422) return first ?? "Check your input and try again.";
    if (status === 500) return "Something went wrong on our side.";
    if (ax.code === "ERR_NETWORK" || ax.message === "Network Error")
      return "No connection. Check your network and try again.";
    return fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
