import { APP_BUILD, APP_VERSION, VersionInfo } from "./version";

/**
 * 检查服务端最新的发布版本信息
 */
export async function fetchServerVersion(): Promise<VersionInfo | null> {
  try {
    const res = await fetch(`/api/version?_t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    if (!res.ok) return null;
    const data: VersionInfo = await res.json();
    return data;
  } catch (error) {
    console.warn("[PWA-Update] Failed to fetch server version:", error);
    return null;
  }
}

/**
 * 判断是否存在新版本
 */
export function hasNewVersion(serverBuild: string, currentBuild: string = APP_BUILD): boolean {
  return Boolean(serverBuild && serverBuild !== currentBuild);
}

/**
 * 判断当前客户端是否在 PWA 原生桌面独立模式 (Standalone) 运行
 */
export function isPwaStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

/**
 * 彻底清除所有 PWA / ServiceWorker / CacheStorage 本地缓存并强制重载
 */
export async function forcePwaUpdate(targetBuild?: string): Promise<void> {
  if (typeof window === "undefined") return;

  console.log(`[PWA-Update] Initiating force update to build: ${targetBuild || "latest"}...`);

  // 1. 标记更新状态，防止死循环
  try {
    sessionStorage.setItem("aqua_pwa_updating", "true");
    if (targetBuild) {
      localStorage.setItem("aqua_pwa_last_build", targetBuild);
    }
  } catch {}

  // 2. 强力清除 CacheStorage 中所有已缓存的静态资源与 HTML
  if ("caches" in window) {
    try {
      const cacheNames = await window.caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          console.log(`[PWA-Update] Purging CacheStorage: ${cacheName}`);
          return window.caches.delete(cacheName);
        })
      );
    } catch (e) {
      console.warn("[PWA-Update] Error clearing CacheStorage:", e);
    }
  }

  // 3. 通知 Service Worker 跳过等待并执行更新
  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        if (reg.active) {
          reg.active.postMessage({ type: "SKIP_WAITING" });
        }
        await reg.update().catch(() => {});
      }
    } catch (e) {
      console.warn("[PWA-Update] Error signaling ServiceWorker:", e);
    }
  }

  // 4. 带时间戳破坏缓存并执行硬刷新
  setTimeout(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("_v", Date.now().toString());
    window.location.replace(url.toString());
  }, 250);
}
