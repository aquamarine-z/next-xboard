"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Server, Check, Copy } from "lucide-react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";

export interface NodeConnectModalProps {
  server: { name: string; type: string; rate?: string | number };
  t: (key: string, params?: Record<string, any>) => string;
  close: () => void | Promise<void>;
}

export function NodeConnectModal({
  server,
  t,
  close,
}: NodeConnectModalProps) {
  const [qrUrl, setQrUrl] = React.useState<string>("");
  const [copied, setCopied] = React.useState(false);
  const nodeUri = `${server.type.toLowerCase()}://${server.name}`;

  React.useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(nodeUri, {
      width: 360,
      margin: 1.5,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (isMounted) setQrUrl(url);
      })
      .catch((e) => console.error("QR Code generate error:", e));

    return () => {
      isMounted = false;
    };
  }, [nodeUri]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(nodeUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SurfaceDialogContent
      showCloseButton={false}
      className="p-0 gap-0 overflow-hidden sm:max-w-[320px] rounded-[22px] border border-black/10 dark:border-white/12 shadow-2xl bg-card/95 backdrop-blur-2xl outline-none"
    >
      {/* Apple Centered Header */}
      <div className="pt-6 px-6 pb-2 flex flex-col items-center text-center">
        <div className="w-11 h-11 rounded-[14px] bg-gradient-to-b from-[#0071e3]/15 to-[#0071e3]/5 dark:from-[#2997ff]/20 dark:to-[#2997ff]/10 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/15 flex items-center justify-center mb-2 shadow-2xs select-none">
          <Server className="w-5 h-5 stroke-[1.75]" />
        </div>
        <h3 className="text-[17px] font-bold text-foreground tracking-tight leading-snug truncate max-w-[260px]">
          {server.name}
        </h3>
        <div className="inline-flex items-center gap-2 mt-1.5 px-2.5 py-0.5 rounded-full bg-secondary/60 border border-black/6 dark:border-white/10 text-xs text-muted-foreground select-none">
          <span className="font-mono font-semibold uppercase text-foreground/90">
            {server.type}
          </span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span>{t("nodes.rate", { rate: server.rate || "1.0" })}</span>
        </div>
      </div>

      {/* QR Code Presentation */}
      <div className="flex justify-center px-6 py-3">
        <div className="p-2.5 bg-white rounded-[18px] shadow-sm border border-black/8 flex items-center justify-center w-[170px] h-[170px] select-none">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt={server.name}
              width={154}
              height={154}
              className="w-[154px] h-[154px] block rounded-lg select-none"
              draggable={false}
            />
          ) : (
            <div className="w-6 h-6 border-2 border-[#0071e3]/30 border-t-[#0071e3] rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Docked Hairline Button Bar */}
      <div className="border-t border-black/10 dark:border-white/10 grid grid-cols-2 divide-x divide-black/10 dark:divide-white/10 h-11 text-[16px]">
        <button
          type="button"
          onClick={() => void close()}
          className="w-full h-full flex items-center justify-center text-[16px] font-normal text-[#0071e3] dark:text-[#2997ff] bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors select-none cursor-pointer outline-none"
        >
          {t("common.cancel")}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="w-full h-full flex items-center justify-center text-[16px] font-semibold text-[#0071e3] dark:text-[#2997ff] bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors select-none cursor-pointer outline-none gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[2.5] text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">
                {t("common.copied")}
              </span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 stroke-[2]" />
              <span>{t("common.copy_link")}</span>
            </>
          )}
        </button>
      </div>
    </SurfaceDialogContent>
  );
}

export function openNodeConnectDialog(
  server: { name: string; type: string; rate?: string | number },
  t: (key: string, params?: Record<string, any>) => string
) {
  return dialog.custom((close) => (
    <NodeConnectModal server={server} t={t} close={close} />
  ));
}
