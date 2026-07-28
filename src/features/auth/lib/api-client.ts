"use client";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Double-submit CSRF token: fetch it once from `/api/v1/auth/csrf` if the cookie isn't set yet. */
async function ensureCsrfToken(): Promise<string> {
  const existing = readCookie("wassla_csrf_token");
  if (existing) return existing;

  const response = await fetch("/api/v1/auth/csrf");
  const data = (await response.json()) as { csrfToken: string };
  return data.csrfToken;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const csrfToken = await ensureCsrfToken();

  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      typeof data.error === "string" ? data.error : "Request failed",
      response.status,
      data,
    );
  }

  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      typeof data.error === "string" ? data.error : "Request failed",
      response.status,
      data,
    );
  }

  return data as T;
}
