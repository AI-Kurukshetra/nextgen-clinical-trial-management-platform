import axios, { type AxiosRequestConfig } from "axios";
import type { ApiErrorBody, ApiSuccess } from "@/types/api";

const baseURL =
  typeof window !== "undefined" ? "/api" : process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api` : "/api";

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/** Normalized error thrown by request helpers when API returns error body or non-2xx. */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public body?: ApiErrorBody
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

apiClient.interceptors.response.use(
  (response) => {
    const data = response.data as ApiSuccess<unknown> | undefined;
    if (data && typeof data === "object" && "success" in data && data.success === true) {
      return response;
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const body = error.response.data as ApiErrorBody | undefined;
      if (body && typeof body === "object" && body.success === false && body.error) {
        const msg = body.message ?? body.error.message;
        const apiError = new ApiRequestError(
          msg,
          error.response.status,
          body.error.code,
          body
        );
        if (error.response.status === 401 && typeof window !== "undefined") {
          window.location.href = `/auth/sign-in?redirectTo=${encodeURIComponent(window.location.pathname)}`;
        }
        return Promise.reject(apiError);
      }
    }
    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? String(error.response.data.message)
        : error.message ?? "Request failed";
    return Promise.reject(
      new ApiRequestError(message, error.response?.status)
    );
  }
);

export type ApiRequestConfig = Omit<AxiosRequestConfig, "baseURL"> & {
  signal?: AbortSignal;
};

/** Unwrap data from ApiSuccess or throw ApiRequestError. */
async function unwrap<T>(response: { data: ApiSuccess<T> }): Promise<T> {
  const data = response.data;
  if (data && typeof data === "object" && "success" in data && data.success && "data" in data) {
    return data.data as T;
  }
  return response.data as unknown as T;
}

export async function apiGet<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  const res = await apiClient.get<ApiSuccess<T>>(url, config as AxiosRequestConfig);
  return unwrap(res);
}

export async function apiPost<T>(url: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
  const res = await apiClient.post<ApiSuccess<T>>(url, body, config as AxiosRequestConfig);
  return unwrap(res);
}

export async function apiPut<T>(url: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
  const res = await apiClient.put<ApiSuccess<T>>(url, body, config as AxiosRequestConfig);
  return unwrap(res);
}

export async function apiPatch<T>(url: string, body?: unknown, config?: ApiRequestConfig): Promise<T> {
  const res = await apiClient.patch<ApiSuccess<T>>(url, body, config as AxiosRequestConfig);
  return unwrap(res);
}

export async function apiDelete<T = void>(url: string, config?: ApiRequestConfig): Promise<T> {
  const res = await apiClient.delete<ApiSuccess<T>>(url, config as AxiosRequestConfig);
  return unwrap(res);
}
