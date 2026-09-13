"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Server, Check, Copy } from "lucide-react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { useCopy } from "@/hooks/use-copy";

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
  const { copied, copy } = useCopy();
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
    void copy(nodeUri);
  };

  return (
    <SurfaceDialogContent
      showCloseButton={false}
      className="p-0 gap-0 overflow-hidden sm:max-w-[360px] rounded-[28px] border border-white/60 dark:border-white/12 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl bg-card/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl ios26-glass-modal outline-none"
    >
      {/* Apple Centered Header */}
      <div className="pt-7 px-6 pb-2 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-[18px] bg-gradient-to-b from-[#0071e3]/15 to-[#0071e3]/5 dark:from-[#2997ff]/20 dark:to-[#2997ff]/10 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/20 flex items-center justify-center mb-3 shadow-xs select-none">
          <Server className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h3 className="text-[18px] font-semibold text-foreground tracking-[-0.015em] leading-snug truncate max-w-[280px]">
          {server.name}
        </h3>
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-secondary/70 border border-black/5 dark:border-white/8 text-xs text-muted-foreground select-none">
          <span className="font-mono font-semibold uppercase text-foreground">
            {server.type}
          </span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span>{t("nodes.rate", { rate: server.rate || "1.0" })}</span>
        </div>
      </div>

      {/* QR Code Presentation */}
      <div className="flex justify-center px-6 py-4">
        <div className="p-3 bg-white rounded-[22px] shadow-sm border border-black/8 flex items-center justify-center w-[184px] h-[184px] select-none">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt={server.name}
              width={160}
              height={160}
              className="w-[160px] h-[160px] block rounded-xl select-none"
              draggable={false}
            />
          ) : (
            <div className="w-7 h-7 border-2 border-[#0071e3]/30 border-t-[#0071e3] rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Floating Action Pill Bar */}
      <div className="p-4 pt-1 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => void close()}
          className="flex-1 h-11 flex items-center justify-center text-[15px] font-medium text-foreground/90 bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:bg-black/[0.1] dark:active:bg-white/[0.15] border border-black/5 dark:border-white/10 rounded-full transition-all ios26-press select-none cursor-pointer outline-none"
        >
          {t("common.cancel")}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 h-11 flex items-center justify-center text-[15px] font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0062c4] shadow-[0_4px_14px_rgba(0,113,227,0.3)] dark:shadow-[0_4px_18px_rgba(41,151,255,0.25)] rounded-full transition-all ios26-press select-none cursor-pointer outline-none gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[2.5] text-white" />
              <span>{t("common.copied")}</span>
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
