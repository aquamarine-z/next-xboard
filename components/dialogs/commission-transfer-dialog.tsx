"use client";

import * as React from "react";
import { ArrowRightLeft, Wallet, Loader2 } from "lucide-react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { toast } from "@/components/ui/sonner";

export interface CommissionTransferModalProps {
  commissionBalance: number; // in cents
  t: (key: string, params?: Record<string, any>) => string;
  close: (result?: boolean) => void | Promise<void>;
  onSuccess?: () => void;
}

export function CommissionTransferModal({
  commissionBalance,
  t,
  close,
  onSuccess,
}: CommissionTransferModalProps) {
  const [amountStr, setAmountStr] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const maxCents = commissionBalance;
  const maxYuan = (maxCents / 100).toFixed(2);

  const numAmount = parseFloat(amountStr) || 0;
  const numCents = Math.round(numAmount * 100);

  const isValid = numCents > 0 && numCents <= maxCents;

  const handleTransferAll = () => {
    setAmountStr((maxCents / 100).toString());
    setErrorMsg(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/xboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "transfer_commission",
          transfer_amount: numCents,
        }),
      });

      const json = await res.json();
      if (res.ok && (json.data === true || json.success)) {
        toast.success(t("invites.transfer_success"));
        onSuccess?.();
        void close(true);
      } else {
        setErrorMsg(json.error || t("common.failed"));
      }
    } catch (err: any) {
      setErrorMsg(err.message || t("common.network_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SurfaceDialogContent
      showCloseButton={false}
      className="p-0 gap-0 overflow-hidden sm:max-w-[380px] rounded-[28px] border border-white/60 dark:border-white/12 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl bg-card/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl ios26-glass-modal outline-none"
    >
      <form onSubmit={handleSubmit}>
        <div className="pt-7 px-6 pb-2 flex flex-col items-center text-center">
          <div className="w-13 h-13 rounded-[20px] bg-gradient-to-b from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3 shadow-xs select-none">
            <ArrowRightLeft className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-[19px] font-semibold text-foreground tracking-tight leading-snug">
            {t("invites.transfer_title")}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed px-2">
            {t("invites.transfer_desc")}
          </p>
        </div>

        <div className="px-5 py-3 space-y-3.5">
          {/* Balance card */}
          <div className="rounded-[18px] border border-border/70 bg-secondary/30 dark:bg-white/[0.02] p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground font-medium">
                {t("invites.commission_balance")}
              </span>
            </div>
            <span className="font-mono font-semibold text-foreground text-sm">
              ¥{maxYuan}
            </span>
          </div>

          {/* Amount input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                {t("invites.transfer_amount")}
              </span>
              <button
                type="button"
                onClick={handleTransferAll}
                className="text-[11px] font-medium text-[#0071e3] dark:text-[#2997ff] hover:underline cursor-pointer"
              >
                {t("invites.transfer_all")}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                ¥
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={maxYuan}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder={t("invites.transfer_placeholder")}
                className="w-full h-11 pl-8 pr-3 rounded-full bg-secondary/60 border border-border text-sm text-foreground placeholder:text-muted-foreground font-mono outline-hidden focus:border-[#0071e3] transition-all"
              />
            </div>
            {errorMsg && (
              <p className="text-[11px] text-destructive px-1">{errorMsg}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="p-5 pt-2 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void close(false)}
            disabled={loading}
            className="w-1/3 h-11 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs transition-all ios-touch-feedback active:scale-[0.98] cursor-pointer select-none border border-border/60"
          >
            {t("common.cancel")}
          </button>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-2/3 h-11 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all ios-touch-feedback active:scale-[0.98] cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>{t("invites.transfer_btn")}</span>
            )}
          </button>
        </div>
      </form>
    </SurfaceDialogContent>
  );
}

export function openCommissionTransferDialog(
  commissionBalance: number,
  t: (key: string, params?: Record<string, any>) => string,
  onSuccess?: () => void
) {
  return dialog.custom<boolean>((close) => (
    <CommissionTransferModal
      commissionBalance={commissionBalance}
      t={t}
      close={close}
      onSuccess={onSuccess}
    />
  ));
}
