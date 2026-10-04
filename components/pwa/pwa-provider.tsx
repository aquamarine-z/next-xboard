"use client";

import * as React from "react";
import { Share, PlusSquare, X, Download } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { APP_BUILD, APP_VERSION, type VersionInfo } from "@/lib/version";
import { fetchServerVersion, hasNewVersion, forcePwaUpdate, isPwaStandalone } from "@/lib/pwa-update";
import { toast } from "@/components/ui/sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaContextValue {
  isStandalone: boolean;
  isIOS: boolean;
  appVersion: string;
  appBuild: string;
  checkForUpdate: () => Promise<boolean>;
  isUpdating: boolean;
}

const PwaContext = React.createContext<PwaContextValue>({
  isStandalone: true,
  isIOS: false,
  appVersion: APP_VERSION,
  appBuild: APP_BUILD,
  checkForUpdate: async () => false,
  isUpdating: false,
});

export function usePwa() {
  return React.useContext(PwaContext);
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = React.useState(true); // Default true to avoid flash
  const [isIOS, setIsIOS] = React.useState(false);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Check server version and auto-force update if mismatched
  const triggerAutoUpdate = React.useCallback(async (serverVersion: VersionInfo) => {
    setIsUpdating(true);
    toast.loading(
      locale === "zh-CN"
        ? `检测到系统新版本 (v${serverVersion.version})，正在无缝升级...`
        : `New version detected (v${serverVersion.version}), upgrading...`,
      { duration: 4000 }
    );
    await forcePwaUpdate(serverVersion.build);
  }, [locale]);

  const checkForUpdate = React.useCallback(async (): Promise<boolean> => {
    const serverInfo = await fetchServerVersion();
    if (!serverInfo) return false;

    if (hasNewVersion(serverInfo.build, APP_BUILD)) {
      await triggerAutoUpdate(serverInfo);
      return true;
    }
    return false;
  }, [triggerAutoUpdate]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initial version check
    checkForUpdate();

    // 2. Register Service Worker with active update listeners
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for updates periodically
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    console.log("[PWA] New service worker ready, updating...");
                    checkForUpdate();
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn("[PWA] ServiceWorker registration failed:", err);
          });
      });

      // Reload smoothly when new controller takes over
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // 3. Foreground Wakeup Inspection (Crucial for iOS PWA WebClips)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkForUpdate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 4. Periodic polling every 10 minutes
    const intervalTimer = setInterval(() => {
      checkForUpdate();
    }, 10 * 60 * 1000);

    // 5. Standalone & Platform Detection
    const standaloneMode = isPwaStandalone();
    setIsStandalone(standaloneMode);

    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isAppleMobile);

    // Check if user previously dismissed prompt within 7 days
    const lastDismissed = localStorage.getItem("aqua_pwa_prompt_dismissed");
    const isRecentlyDismissed =
      lastDismissed && Date.now() - parseInt(lastDismissed, 10) < 7 * 24 * 60 * 60 * 1000;

    // 6. Listen for Android Chrome beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!standaloneMode && !isRecentlyDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Show iOS prompt after slight delay if on iOS mobile browser
    let promptTimer: NodeJS.Timeout | null = null;
    if (isAppleMobile && !standaloneMode && !isRecentlyDismissed) {
      promptTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 3500);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      if (promptTimer) clearTimeout(promptTimer);
    };
  }, [checkForUpdate]);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("aqua_pwa_prompt_dismissed", Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const contextValue = React.useMemo<PwaContextValue>(
    () => ({
      isStandalone,
      isIOS,
      appVersion: APP_VERSION,
      appBuild: APP_BUILD,
      checkForUpdate,
      isUpdating,
    }),
    [isStandalone, isIOS, checkForUpdate, isUpdating]
  );

  return (
    <PwaContext.Provider value={contextValue}>
      {children}

      {/* Floating iOS / Android Add to Home Screen Guidance Capsule */}
      {showPrompt && !isStandalone && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-sm mx-auto z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
          <div className="relative rounded-[22px] bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl border border-black/10 dark:border-white/15 p-3.5 shadow-2xl shadow-black/25 flex items-start gap-3">
            {/* App Icon preview */}
            <div className="w-11 h-11 rounded-[12px] bg-black shrink-0 overflow-hidden shadow-md border border-white/10 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/icon-192x192.png"
                alt="Aqua VPS"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Instruction text */}
            <div className="flex-1 min-w-0 pr-5">
              <h4 className="text-[13px] font-semibold tracking-tight text-foreground">
                {locale === "zh-CN" ? "添加到主屏幕" : "Add to Home Screen"}
              </h4>
              <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-0.5">
                {isIOS ? (
                  locale === "zh-CN" ? (
                    <>
                      点击底部 <Share className="w-3.5 h-3.5 inline text-[#0071e3] align-baseline -mb-0.5" /> 分享键，选择{" "}
                      <span className="font-semibold text-foreground">“添加到主屏幕”</span>{" "}
                      <PlusSquare className="w-3.5 h-3.5 inline align-baseline -mb-0.5" />，享受秒开原生 App 体验。
                    </>
                  ) : (
                    <>
                      Tap <Share className="w-3.5 h-3.5 inline text-[#0071e3] align-baseline -mb-0.5" /> then select{" "}
                      <span className="font-semibold text-foreground">“Add to Home Screen”</span> for native instant launch.
                    </>
                  )
                ) : (
                  locale === "zh-CN"
                    ? "添加至手机桌面，享受秒级冷启动与全屏沉浸式体验。"
                    : "Add to home screen for instant launch and full-screen experience."
                )}
              </p>

              {/* Android One-click Install Button */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[11px] font-medium transition-all active:scale-95 shadow-sm"
                >
                  <Download className="w-3 h-3" />
                  {locale === "zh-CN" ? "一键安装到桌面" : "Install to Home Screen"}
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground bg-black/5 dark:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}
