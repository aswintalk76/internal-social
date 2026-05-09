export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta?: unknown;
};
