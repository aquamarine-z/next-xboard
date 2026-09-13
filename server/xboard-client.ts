import { getSessionToken } from "./session";

export function getXboardBaseUrl(): string {
  return process.env.XBOARD_API_URL || "https://cloud.example.com";
}

export function getXboardBackupBaseUrl(): string {
  return process.env.XBOARD_BACKUP_API_URL || "";
}

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function xboardFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ data: T | null; total?: number; raw?: any; error?: string; status: number }> {
  const { requiresAuth = true, headers = {}, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 NextXboard/1.0",
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = await getSessionToken();
    if (token) {
      const authValue = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      requestHeaders["Authorization"] = authValue;
      requestHeaders["auth-data"] = token;
    }
  }

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const baseUrls = [
    getXboardBaseUrl().replace(/\/$/, ""),
    getXboardBackupBaseUrl().replace(/\/$/, ""),
  ];

  let lastError = "Failed to communicate with Xboard backend";
  let lastStatus = 500;

  for (const baseUrl of baseUrls) {
    const url = `${baseUrl}${normalizedEndpoint}`;
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
        total: typeof json?.total === "number" ? json.total : undefined,
        raw: json,
        status: res.status,
      };
    } catch (err: any) {
      lastError = err?.message || "Failed to communicate with Xboard backend";
      lastStatus = 500;
      // Try next base URL if network error occurred
    }
  }

  return {
    data: null,
    error: lastError,
    status: lastStatus,
  };
}

export interface XboardSiteMeta {
  title: string;
  description: string;
  logo?: string;
}

let cachedSiteMeta: { data: XboardSiteMeta; timestamp: number } | null = null;
const CACHE_TTL = 30 * 1000; // 30 seconds

export async function getXboardSiteMeta(): Promise<XboardSiteMeta> {
  const now = Date.now();
  if (cachedSiteMeta && now - cachedSiteMeta.timestamp < CACHE_TTL) {
    return cachedSiteMeta.data;
  }

  const rootUrl = getXboardBaseUrl().replace(/\/$/, "");
  let title = "Aqua VPS (试运营中)";
  let description = "Aqua的VPS云";
  let logo = "";

  try {
    const res = await fetch(`${rootUrl}/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 NextXboard/1.0",
      },
      next: { revalidate: 30 },
    });

    if (res.ok) {
      const html = await res.text();
      // Match <title>(.*?)</title>
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]?.trim()) {
        title = titleMatch[1].trim();
      }

      // Match window.settings = { title: '...', description: '...' }
      const settingsTitleMatch = html.match(/title:\s*['"]([^'"]+)['"]/i);
      if (settingsTitleMatch && settingsTitleMatch[1]?.trim()) {
        title = settingsTitleMatch[1].trim();
      }

      const settingsDescMatch = html.match(/description:\s*['"]([^'"]+)['"]/i);
      if (settingsDescMatch && settingsDescMatch[1]?.trim()) {
        description = settingsDescMatch[1].trim();
      }

      const logoMatch = html.match(/logo:\s*['"]([^'"]+)['"]/i);
      if (logoMatch && logoMatch[1]?.trim()) {
        logo = logoMatch[1].trim();
      }
    }
  } catch (e) {
    console.error("Failed to fetch Xboard site meta from root:", e);
  }

  const result: XboardSiteMeta = { title, description, logo };
  cachedSiteMeta = { data: result, timestamp: now };
  return result;
}
