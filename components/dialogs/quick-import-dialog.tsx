"use client";

import * as React from "react";
import Image from "next/image";
import { ExternalLink, QrCode, ChevronRight, Check } from "lucide-react";
import { AppleCopyButton } from "@/components/ui/apple-copy-button";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { openQrCodeDialog } from "@/components/dialogs/qr-code-dialog";
import { useUserStore } from "@/lib/store/userStore";

function safeBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return str;
  }
}

export interface QuickImportModalProps {
  subscribeUrl: string;
  t: (key: string, params?: Record<string, any>) => string;
  close: () => void | Promise<void>;
}

export function QuickImportModal({
  subscribeUrl,
  t,
  close,
}: QuickImportModalProps) {
  const { config } = useUserStore();
  const siteTag = config?.title || config?.app_name || "Aqua VPS";
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [launchedClient, setLaunchedClient] = React.useState<string | null>(
    null
  );
  const [showTip, setShowTip] = React.useState(false);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollLeft = 0;
    }
  }, [subscribeUrl]);

  const shadowrocketScheme = `shadowrocket://add/sub://${safeBase64(
    subscribeUrl
  )}?title=${encodeURIComponent(siteTag)}`;
  const clashScheme = `clash://install-config?url=${encodeURIComponent(
    subscribeUrl
  )}&name=${encodeURIComponent(siteTag)}`;
  const surgeScheme = `surge:///install-config?url=${encodeURIComponent(
    subscribeUrl
  )}`;
  const singboxScheme = `sing-box://import-remote-profile?url=${encodeURIComponent(
    subscribeUrl
  )}#${encodeURIComponent(siteTag)}`;
  const quantumultScheme = `quantumult-x:///add-resource?remote-resource=${encodeURIComponent(
    JSON.stringify({
      server_remote: [`${subscribeUrl}, tag=${siteTag}`],
    })
  )}`;

  const clients = [
    {
      name: "Shadowrocket",
      tag: "iOS / iPadOS",
      scheme: shadowrocketScheme,
      icon: "/images/clients/shadowrocket.png",
    },
    {
      name: "Clash",
      tag: "macOS / Windows / Android",
      scheme: clashScheme,
      icon: "/images/clients/clash.png",
    },
    {
      name: "Surge",
      tag: "macOS / iOS",
      scheme: surgeScheme,
      icon: "/images/clients/surge.png",
    },
    {
      name: "Sing-box",
      tag: "Universal Core",
      scheme: singboxScheme,
      icon: "/images/clients/sing-box.png",
    },
    {
      name: "Quantumult X",
      tag: "iOS / iPadOS",
      scheme: quantumultScheme,
      icon: "/images/clients/quantumult-x.png",
    },
  ];

  const handleLaunchClient = (client: (typeof clients)[number]) => {
    setLaunchedClient(client.name);
    setShowTip(true);

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(subscribeUrl);
      }
    } catch {
      // Ignore clipboard write errors
    }

    try {
      const a = document.createElement("a");
      a.href = client.scheme;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          if (document.body.contains(a)) {
            document.body.removeChild(a);
          }
        } catch {}
      }, 500);
    } catch {
      window.location.href = client.scheme;
    }

    setTimeout(() => {
      setLaunchedClient((prev) => (prev === client.name ? null : prev));
    }, 2500);
  };

  const handleOpenQrModal = () => {
    void close();
    openQrCodeDialog(subscribeUrl, t);
  };

  return (
    <SurfaceDialogContent
      showCloseButton={false}
      className="p-0 gap-0 overflow-hidden sm:max-w-[460px] rounded-[30px] border border-white/60 dark:border-white/12 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl bg-card/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl ios26-glass-modal outline-none"
    >
      {/* Apple Centered Header */}
      <div className="pt-7 px-6 pb-2 text-center">
        <h3 className="text-[19px] font-semibold text-foreground tracking-[-0.015em] leading-snug">
          {t("dashboard.quick_import")}
        </h3>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground leading-relaxed font-normal px-4">
          {t("dashboard.quick_import_desc")}
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div className="max-h-[60vh] overflow-y-auto px-6 py-3 space-y-4">
        {/* Copy Subscription Bar - iOS Inset Group */}
        <div className="space-y-1.5">
          <label className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider px-1 select-none">
            {t("dashboard.copy_subscription")}
          </label>
          <div className="flex items-center gap-2 p-1.5 pl-3.5 rounded-[16px] bg-secondary/50 border border-black/6 dark:border-white/8 focus-within:border-[#0071e3]/40 focus-within:ring-2 focus-within:ring-[#0071e3]/20 transition-all">
            <input
              ref={inputRef}
              disabled
              readOnly
              dir="ltr"
              value={subscribeUrl}
              title={subscribeUrl}
              onFocus={(e) => {
                e.currentTarget.scrollLeft = 0;
              }}
              className="flex-1 min-w-0 bg-transparent text-xs font-mono text-muted-foreground cursor-default outline-none select-all text-left"
            />
            <AppleCopyButton
              textToCopy={subscribeUrl}
              defaultText={t("common.copy")}
              copiedText={t("common.copied")}
              variant="primary"
              className="w-28 sm:w-32 h-8 px-3 text-xs font-semibold rounded-[12px] shrink-0"
            />
          </div>
        </div>

        {/* Clients Inset Grouped Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider select-none">
              {t("dashboard.import_clients")}
            </label>
            <span className="text-[11.5px] text-muted-foreground/80 select-none">
              {t("dashboard.click_to_open")}
            </span>
          </div>

          <div className="rounded-[20px] bg-secondary/40 border border-black/6 dark:border-white/8 divide-y divide-black/6 dark:divide-white/6 overflow-hidden">
            {clients.map((client) => {
              const isLaunched = launchedClient === client.name;
              return (
                <button
                  key={client.name}
                  type="button"
                  onClick={() => handleLaunchClient(client)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] active:bg-black/[0.07] dark:active:bg-white/[0.08] transition-all group cursor-pointer select-none text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-[11px] bg-white dark:bg-zinc-800 p-1 shrink-0 shadow-2xs border border-black/5 dark:border-white/5 flex items-center justify-center">
                      <Image
                        src={client.icon}
                        alt={client.name}
                        width={28}
                        height={28}
                        className="w-full h-full object-contain pointer-events-none select-none rounded-[7px]"
                        draggable={false}
                      />
                    </div>
                    <div className="text-left truncate">
                      <p className="text-[13.5px] font-semibold text-foreground tracking-tight group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors truncate">
                        {client.name}
                      </p>
                      <p className="text-[11.5px] text-muted-foreground truncate font-normal mt-0.5">
                        {client.tag}
                      </p>
                    </div>
                  </div>

                  {isLaunched ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full transition-all shrink-0 ml-2 animate-in fade-in duration-200">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{t("common.launched")}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0071e3] dark:text-[#2997ff] bg-[#0071e3]/10 dark:bg-[#2997ff]/15 group-hover:bg-[#0071e3] group-hover:text-white px-3 py-1 rounded-full transition-all shrink-0 ml-2">
                      <span>{t("common.import")}</span>
                      <ExternalLink className="w-3 h-3 stroke-[2.2]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {showTip && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[14px] bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[12px] animate-in fade-in slide-in-from-top-1 duration-200">
              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="flex-1 font-medium">
                {t("dashboard.import_hint")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Pill Bar */}
      <div className="p-4 pt-1 flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleOpenQrModal}
          className="flex-1 h-11 flex items-center justify-center text-[15px] font-medium text-foreground/90 bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:bg-black/[0.1] dark:active:bg-white/[0.15] border border-black/5 dark:border-white/10 rounded-full transition-all ios26-press select-none cursor-pointer outline-none gap-1.5"
        >
          <QrCode className="w-4 h-4 stroke-[1.8]" />
          <span>{t("dashboard.scan_qr_code")}</span>
        </button>
        <button
          type="button"
          onClick={() => void close()}
          className="flex-1 h-11 flex items-center justify-center text-[15px] font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0062c4] shadow-[0_4px_14px_rgba(0,113,227,0.3)] dark:shadow-[0_4px_18px_rgba(41,151,255,0.25)] rounded-full transition-all ios26-press select-none cursor-pointer outline-none"
        >
          {t("common.confirm")}
        </button>
      </div>
    </SurfaceDialogContent>
  );
}

export function openQuickImportDialog(
  subscribeUrl: string,
  t: (key: string, params?: Record<string, any>) => string
) {
  return dialog.custom((close) => (
    <QuickImportModal subscribeUrl={subscribeUrl} t={t} close={close} />
  ));
}
