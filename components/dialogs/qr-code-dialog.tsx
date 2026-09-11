"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Download, ChevronLeft, Check, Copy } from "lucide-react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { openQuickImportDialog } from "@/components/dialogs/quick-import-dialog";

export interface QrCodeModalProps {
  subscribeUrl: string;
  t: (key: string, params?: Record<string, any>) => string;
  close: () => void | Promise<void>;
}

export function QrCodeModal({ subscribeUrl, t, close }: QrCodeModalProps) {
  const [dataUrl, setDataUrl] = React.useState<string>("");
  const [copied, setCopied] = React.useState(false);

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
    navigator.clipboard.writeText(subscribeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SurfaceDialogContent
      showCloseButton={false}
      className="p-0 gap-0 overflow-hidden sm:max-w-[320px] rounded-[22px] border border-black/10 dark:border-white/12 shadow-2xl bg-card/95 backdrop-blur-2xl outline-none"
    >
      {/* Header with Apple Navigation Back Link */}
      <div className="relative pt-6 px-6 pb-2 text-center">
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-5 left-4 flex items-center gap-0.5 text-[14px] font-normal text-[#0071e3] dark:text-[#2997ff] hover:opacity-80 transition-opacity select-none cursor-pointer outline-none focus:outline-none"
        >
          <ChevronLeft className="w-4 h-4 -ml-1" />
          <span>{t("common.back")}</span>
        </button>

        <h3 className="text-[17px] font-bold text-foreground tracking-tight leading-snug">
          {t("dashboard.scan_qr_code")}
        </h3>
        <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed font-normal">
          {t("dashboard.scan_qr_code_desc")}
        </p>
      </div>

      {/* QR Code Presentation */}
      <div className="flex justify-center px-6 py-3">
        <div className="w-[180px] h-[180px] rounded-[18px] bg-white p-2.5 shadow-sm border border-black/8 flex items-center justify-center overflow-hidden select-none">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Subscription QR Code"
              className="w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              {t("common.loading")}
            </div>
          )}
        </div>
      </div>

      {/* Docked Hairline Button Bar */}
      <div className="border-t border-black/10 dark:border-white/10 grid grid-cols-2 divide-x divide-black/10 dark:divide-white/10 h-11 text-[16px]">
        <button
          type="button"
          onClick={handleDownloadQr}
          className="w-full h-full flex items-center justify-center text-[16px] font-normal text-[#0071e3] dark:text-[#2997ff] bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors select-none cursor-pointer outline-none gap-1.5"
        >
          <Download className="w-4 h-4 stroke-[2]" />
          <span>{t("common.save_image")}</span>
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

export function openQrCodeDialog(
  subscribeUrl: string,
  t: (key: string, params?: Record<string, any>) => string
) {
  return dialog.custom((close) => (
    <QrCodeModal subscribeUrl={subscribeUrl} t={t} close={close} />
  ));
}
