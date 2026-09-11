"use client";

import * as React from "react";
import Image from "next/image";
import { ExternalLink, QrCode, ChevronRight, Check } from "lucide-react";
import { AppleCopyButton } from "@/components/ui/apple-copy-button";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { openQrCodeDialog } from "@/components/dialogs/qr-code-dialog";

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
  )}?title=${encodeURIComponent("Xboard")}`;
  const clashScheme = `clash://install-config?url=${encodeURIComponent(
    subscribeUrl
  )}&name=${encodeURIComponent("Xboard")}`;
  const surgeScheme = `surge:///install-config?url=${encodeURIComponent(
    subscribeUrl
  )}`;
  const singboxScheme = `sing-box://import-remote-profile?url=${encodeURIComponent(
    subscribeUrl
  )}#${encodeURIComponent("Xboard")}`;
  const quantumultScheme = `quantumult-x:///add-resource?remote-resource=${encodeURIComponent(
    JSON.stringify({
      server_remote: [`${subscribeUrl}, tag=Xboard`],
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
      className="p-0 gap-0 overflow-hidden sm:max-w-[420px] rounded-[22px] border border-black/10 dark:border-white/12 shadow-2xl bg-card/95 backdrop-blur-2xl outline-none"
    >
      {/* Apple Centered Header */}
      <div className="pt-6 px-6 pb-2 text-center">
        <h3 className="text-[18px] font-bold text-foreground tracking-tight leading-snug">
          {t("dashboard.quick_import")}
        </h3>
        <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed font-normal">
          {t("dashboard.quick_import_desc")}
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div className="max-h-[62vh] overflow-y-auto px-5 py-3 space-y-4">
        {/* Copy Subscription Bar - iOS Inset Group */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 select-none">
            {t("dashboard.copy_subscription")}
          </label>
          <div className="flex items-center gap-2 p-1.5 pl-3.5 rounded-[14px] bg-secondary/40 border border-black/8 dark:border-white/10 focus-within:border-[#0071e3]/40 transition-colors">
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
              className="w-28 sm:w-32 h-8 px-3 text-xs font-semibold rounded-[10px] shrink-0"
            />
          </div>
        </div>

        {/* Clients Inset Grouped Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none">
              {t("dashboard.import_clients")}
            </label>
            <span className="text-[11px] text-muted-foreground/80 select-none">
              {t("dashboard.click_to_open")}
            </span>
          </div>

          <div className="rounded-[16px] bg-secondary/35 border border-black/8 dark:border-white/8 divide-y divide-black/6 dark:divide-white/6 overflow-hidden">
            {clients.map((client) => {
              const isLaunched = launchedClient === client.name;
              return (
                <button
                  key={client.name}
                  type="button"
                  onClick={() => handleLaunchClient(client)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] active:bg-black/[0.06] dark:active:bg-white/[0.08] transition-colors group cursor-pointer select-none text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-[9px] bg-white dark:bg-zinc-800 p-1 shrink-0 shadow-2xs border border-black/5 dark:border-white/5 flex items-center justify-center">
                      <Image
                        src={client.icon}
                        alt={client.name}
                        width={26}
                        height={26}
                        className="w-full h-full object-contain pointer-events-none select-none rounded-[6px]"
                        draggable={false}
                      />
                    </div>
                    <div className="text-left truncate">
                      <p className="text-[13px] font-semibold text-foreground tracking-tight group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors truncate">
                        {client.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate font-normal">
                        {client.tag}
                      </p>
                    </div>
                  </div>

                  {isLaunched ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full transition-all shrink-0 ml-2 animate-in fade-in duration-200">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{t("common.launched")}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0071e3] dark:text-[#2997ff] bg-[#0071e3]/10 dark:bg-[#2997ff]/15 group-hover:bg-[#0071e3] group-hover:text-white px-2.5 py-0.5 rounded-full transition-all shrink-0 ml-2">
                      <span>{t("common.import")}</span>
                      <ExternalLink className="w-3 h-3 stroke-[2.2]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {showTip && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-[12px] bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11.5px] animate-in fade-in slide-in-from-top-1 duration-200">
              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="flex-1 font-medium">
                {t("dashboard.import_hint")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Docked Hairline Button Bar */}
      <div className="border-t border-black/10 dark:border-white/10 grid grid-cols-2 divide-x divide-black/10 dark:divide-white/10 h-11 text-[16px]">
        <button
          type="button"
          onClick={handleOpenQrModal}
          className="w-full h-full flex items-center justify-center text-[16px] font-normal text-[#0071e3] dark:text-[#2997ff] bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors select-none cursor-pointer outline-none gap-1.5"
        >
          <QrCode className="w-4 h-4 stroke-[2]" />
          <span>{t("dashboard.scan_qr_code")}</span>
        </button>
        <button
          type="button"
          onClick={() => void close()}
          className="w-full h-full flex items-center justify-center text-[16px] font-semibold text-[#0071e3] dark:text-[#2997ff] bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors select-none cursor-pointer outline-none"
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
