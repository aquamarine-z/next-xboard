"use client";

import * as React from "react";
import { Receipt, CheckCircle2, Clock, XCircle, AlertCircle, Calendar, CreditCard, Sparkles, Hash } from "lucide-react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { AppleCopyButton } from "@/components/ui/apple-copy-button";
import { formatDate } from "@/lib/format";
import type { XboardOrder } from "@/types/xboard";

export interface OrderDetailModalProps {
  order: XboardOrder;
  t: (key: string, params?: Record<string, any>) => string;
  close: () => void | Promise<void>;
}

export function OrderDetailModal({ order, t, close }: OrderDetailModalProps) {
  const isPending = order.status === 0;
  const isCompleted = order.status === 1;
  const isCancelled = order.status === 2;

  const statusLabel = isCompleted
    ? t("orders.status_completed")
    : isPending
    ? t("orders.status_pending")
    : isCancelled
    ? t("orders.status_cancelled")
    : t("orders.status_abnormal");

  const statusBadge = isCompleted ? (
    <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 select-none">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span>{statusLabel}</span>
    </span>
  ) : isPending ? (
    <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 select-none">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      <span>{statusLabel}</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-secondary text-muted-foreground border border-border select-none">
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
      <span>{statusLabel}</span>
    </span>
  );

  return (
    <SurfaceDialogContent
      showCloseButton={false}
      className="p-0 gap-0 overflow-hidden sm:max-w-[420px] rounded-[28px] border border-white/60 dark:border-white/12 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl bg-card/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl ios26-glass-modal outline-none"
    >
      <div className="pt-7 px-6 pb-2 flex flex-col items-center text-center">
        <div className="w-13 h-13 rounded-[20px] bg-gradient-to-b from-[#0066cc]/15 to-[#0066cc]/5 dark:from-[#2997ff]/20 dark:to-[#2997ff]/10 text-[#0066cc] dark:text-[#2997ff] border border-[#0066cc]/20 flex items-center justify-center mb-3 shadow-xs select-none">
          <Receipt className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h3 className="text-[19px] font-semibold text-foreground tracking-tight leading-snug">
          {t("orders.detail_title")}
        </h3>
        <div className="mt-2.5">{statusBadge}</div>
      </div>

      <div className="px-5 py-4 space-y-3.5">
        {/* Order Amount Hero */}
        <div className="rounded-[20px] border border-border/70 bg-secondary/30 dark:bg-white/[0.02] p-4 text-center space-y-1">
          <span className="text-xs text-muted-foreground font-medium select-none">
            {t("orders.final_price")}
          </span>
          <div className="text-3xl font-semibold apple-hero text-foreground tracking-tight font-mono">
            <span className="select-none font-sans text-xl mr-0.5">¥</span>
            {(order.total_amount / 100).toFixed(2)}
          </div>
        </div>

        {/* Inset List of Attributes */}
        <div className="rounded-[20px] border border-border/80 bg-card overflow-hidden divide-y divide-border/60 text-xs shadow-2xs">
          {/* Trade No */}
          <div className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-muted-foreground shrink-0 select-none">
              <Hash className="w-3.5 h-3.5 text-muted-foreground/80" />
              <span>{t("orders.order_no")}</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-foreground truncate max-w-[160px] sm:max-w-[190px]">
                {order.trade_no}
              </span>
              <AppleCopyButton
                textToCopy={order.trade_no}
                defaultText=""
                copiedText=""
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 shrink-0"
              />
            </div>
          </div>

          {/* Plan Name */}
          <div className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-muted-foreground shrink-0 select-none">
              <Sparkles className="w-3.5 h-3.5 text-[#0066cc] dark:text-[#2997ff]" />
              <span>{t("orders.plan_name")}</span>
            </div>
            <span className="font-semibold text-foreground truncate">
              {order.plan?.name || `Plan #${order.plan_id}`}
            </span>
          </div>

          {/* Cycle */}
          <div className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-muted-foreground shrink-0 select-none">
              <Clock className="w-3.5 h-3.5" />
              <span>{t("orders.period")}</span>
            </div>
            <span className="font-medium text-foreground bg-secondary/70 px-2 py-0.5 rounded-full border border-border/60 select-none">
              {order.period.replace("_price", "")}
            </span>
          </div>

          {/* Created Date */}
          <div className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-muted-foreground shrink-0 select-none">
              <Calendar className="w-3.5 h-3.5" />
              <span>{t("orders.created_at")}</span>
            </div>
            <span className="font-mono text-foreground">
              {formatDate(order.created_at)}
            </span>
          </div>

          {/* Discount if present */}
          {Boolean(order.discount_amount && order.discount_amount > 0) && (
            <div className="p-3.5 flex items-center justify-between gap-3">
              <span className="text-muted-foreground select-none">{t("orders.discount")}</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                -¥{((order.discount_amount || 0) / 100).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Pill */}
      <div className="p-5 pt-2">
        <button
          type="button"
          onClick={() => void close()}
          className="w-full h-11 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-medium text-sm transition-all duration-200 ios-touch-feedback active:scale-[0.98] cursor-pointer select-none border border-border/60"
        >
          {t("common.confirm")}
        </button>
      </div>
    </SurfaceDialogContent>
  );
}

export function openOrderDetailDialog(
  order: XboardOrder,
  t: (key: string, params?: Record<string, any>) => string
) {
  return dialog.custom<void>((close) => (
    <OrderDetailModal order={order} t={t} close={close} />
  ));
}
