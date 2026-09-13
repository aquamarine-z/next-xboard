"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Download, ChevronLeft, Check, Copy } from "lucide-react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { openQuickImportDialog } from "@/components/dialogs/quick-import-dialog";
import { useCopy } from "@/hooks/use-copy";

export interface QrCodeModalProps {
  subscribeUrl: string;
  t: (key: string, params?: Record<string, any>) => string;
  close: () => void | Promise<void>;
}

export function QrCodeModal({ subscribeUrl, t, close }: QrCodeModalProps) {
  const [dataUrl, setDataUrl] = React.useState<string>("");
  const { copied, copy } = useCopy();

  React.useEffect(() => {
    if (!subscribeUrl) return;
    QRCode.toDataURL(subscribeUrl, {
      width: 400,
      margin: 1.5,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => {
        setDataUrl(url);
      })
      .catch((err) => {
        console.error("Failed to generate QR Code:", err);
      });
  }, [subscribeUrl]);

  const handleBack = () => {
    void close();
    openQuickImportDialog(subscribeUrl, t);
  };

  const handleDownloadQr = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "subscription-qr.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    void copy(subscribeUrl);
  };

  return (
    <SurfaceDialogContent
      showCloseButton={false}
      className="p-0 gap-0 overflow-hidden sm:max-w-[360px] rounded-[28px] border border-white/60 dark:border-white/12 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl bg-card/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl ios26-glass-modal outline-none"
    >
      {/* Header with Apple Navigation Back Link */}
      <div className="relative pt-7 px-6 pb-2 text-center">
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-5 left-4 flex items-center gap-1 text-[13px] font-medium text-[#0071e3] dark:text-[#2997ff] bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] active:bg-black/[0.1] px-2.5 py-1 rounded-full transition-all ios26-press select-none cursor-pointer outline-none"
        >
          <ChevronLeft className="w-3.5 h-3.5 -ml-0.5" />
          <span>{t("common.back")}</span>
        </button>

        <h3 className="text-[18px] font-semibold text-foreground tracking-[-0.015em] leading-snug pt-4 sm:pt-0">
          {t("dashboard.scan_qr_code")}
        </h3>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground leading-relaxed font-normal px-2">
          {t("dashboard.scan_qr_code_desc")}
        </p>
      </div>

      {/* QR Code Presentation */}
      <div className="flex justify-center px-6 py-4">
        <div className="w-[188px] h-[188px] rounded-[22px] bg-white p-3 shadow-sm border border-black/8 flex items-center justify-center overflow-hidden select-none">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Subscription QR Code"
              className="w-full h-full object-contain pointer-events-none select-none rounded-xl"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              {t("common.loading")}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Pill Bar */}
      <div className="p-4 pt-1 flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleDownloadQr}
          className="flex-1 h-11 flex items-center justify-center text-[15px] font-medium text-foreground/90 bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:bg-black/[0.1] dark:active:bg-white/[0.15] border border-black/5 dark:border-white/10 rounded-full transition-all ios26-press select-none cursor-pointer outline-none gap-1.5"
        >
          <Download className="w-4 h-4 stroke-[1.8]" />
          <span>{t("common.save_image")}</span>
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

export function openQrCodeDialog(
  subscribeUrl: string,
  t: (key: string, params?: Record<string, any>) => string
) {
  return dialog.custom((close) => (
    <QrCodeModal subscribeUrl={subscribeUrl} t={t} close={close} />
  ));
}
