export type ApiResponse<T> = {
  data: T;
  message?: string;
  status: number;
}

export type ApiError = {
  message: string;
  code: string;
  status: number;
}
