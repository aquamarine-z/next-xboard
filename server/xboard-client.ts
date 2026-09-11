import { getSessionToken } from "./session";

const XBOARD_BASE_URL = process.env.XBOARD_API_URL || "https://demo.xboard.test";

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function xboardFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ data: T | null; error?: string; status: number }> {
  const { requiresAuth = true, headers = {}, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = await getSessionToken();
    if (token) {
      requestHeaders["Authorization"] = token;
    }
  }

  const url = `${XBOARD_BASE_URL.replace(/\/$/, "")}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        data: null,
        error: json?.message || `Xboard API error: ${res.statusText}`,
        status: res.status,
      };
    }

    return {
      data: json?.data !== undefined ? json.data : json,
      status: res.status,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || "Failed to communicate with Xboard backend",
      status: 500,
    };
  }
}
