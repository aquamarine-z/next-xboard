"use client";

import * as React from "react";
import { ShoppingBag, Tag, Check, ArrowRight, Loader2, Wallet, QrCode, ShieldCheck } from "lucide-react";
import { dialog, SurfaceDialogContent } from "@/components/ui/surface";
import { toast } from "@/components/ui/sonner";
import type { XboardPlan } from "@/types/xboard";

export interface OrderCheckoutModalProps {
  plan: XboardPlan;
  period: string;
  price: number; // in cents
  userBalance?: number; // in cents
  t: (key: string, params?: Record<string, any>) => string;
  close: (result?: boolean) => void | Promise<void>;
  onSuccess?: () => void;
}

export function OrderCheckoutModal({
  plan,
  period,
  price,
  userBalance = 0,
  t,
  close,
  onSuccess,
}: OrderCheckoutModalProps) {
  const [couponCode, setCouponCode] = React.useState("");
  const [couponLoading, setCouponLoading] = React.useState(false);
  const [couponDiscount, setCouponDiscount] = React.useState(0);
  const [couponApplied, setCouponApplied] = React.useState(false);
  const [couponError, setCouponError] = React.useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = React.useState<"balance" | "alipay" | "wechat" | "crypto">("balance");
  const [submitting, setSubmitting] = React.useState(false);

  const finalAmount = Math.max(0, price - couponDiscount);

  const handleApplyCoupon = async () => {
    const trimmed = couponCode.trim();
    if (!trimmed) return;
    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/xboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check_coupon",
          code: trimmed,
          plan_id: plan.id,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        const discountVal = json.data?.discount_amount || json.data?.value || 0;
        setCouponDiscount(discountVal);
        setCouponApplied(true);
        toast.success(t("orders.coupon_valid"));
      } else {
        setCouponError(json.error || t("orders.coupon_invalid"));
        setCouponDiscount(0);
        setCouponApplied(false);
      }
    } catch (err: any) {
      setCouponError(err?.message || t("orders.coupon_invalid"));
      setCouponDiscount(0);
      setCouponApplied(false);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async () => {
    setSubmitting(true);
    try {
      // 1. Save order
      const saveRes = await fetch("/api/xboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_order",
          plan_id: plan.id,
          period: `${period}_price`,
          coupon_code: couponApplied ? couponCode.trim() : undefined,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok || (!saveData.data && !saveData.trade_no)) {
        throw new Error(saveData.error || t("common.failed"));
      }
      const tradeNo = saveData.data || saveData.trade_no;

      // 2. Checkout order
      const checkoutRes = await fetch("/api/xboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkout_order",
          trade_no: tradeNo,
          method: paymentMethod === "balance" ? 0 : 1,
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || t("common.failed"));
      }

      if (checkoutData.data === true || paymentMethod === "balance" || checkoutData.success) {
        toast.success(t("orders.pay_success"));
        onSuccess?.();
        void close(true);
      } else if (typeof checkoutData.data === "string" && checkoutData.data.startsWith("http")) {
        toast.success(t("orders.order_created_success"));
        window.open(checkoutData.data, "_blank");
        onSuccess?.();
        void close(true);
      } else {
        toast.success(t("orders.order_created_success"));
        onSuccess?.();
        void close(true);
      }
    } catch (err: any) {
      toast.error(err.message || t("common.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SurfaceDialogContent
      showCloseButton={false}
      className="p-0 gap-0 overflow-hidden sm:max-w-[420px] rounded-[28px] border border-white/60 dark:border-white/12 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl bg-card/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl ios26-glass-modal outline-none"
    >
      {/* Header */}
      <div className="pt-7 px-6 pb-2 flex flex-col items-center text-center">
        <div className="w-13 h-13 rounded-[20px] bg-gradient-to-b from-[#0066cc]/15 to-[#0066cc]/5 dark:from-[#2997ff]/20 dark:to-[#2997ff]/10 text-[#0066cc] dark:text-[#2997ff] border border-[#0066cc]/20 flex items-center justify-center mb-3 shadow-xs select-none">
          <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h3 className="text-[19px] font-semibold text-foreground tracking-tight leading-snug">
          {t("orders.checkout_title")}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {plan.name} · {t(`shop.cycle.${period}`)}
        </p>
      </div>

      <div className="px-5 py-3 space-y-4">
        {/* Total Price Banner */}
        <div className="rounded-[20px] border border-border/70 bg-secondary/30 dark:bg-white/[0.02] p-4 text-center space-y-1">
          <span className="text-[11px] text-muted-foreground font-medium select-none uppercase tracking-wider">
            {t("orders.final_price")}
          </span>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-3xl font-semibold apple-hero text-foreground tracking-tight font-mono">
              <span className="select-none font-sans text-xl mr-0.5">¥</span>
              {(finalAmount / 100).toFixed(2)}
            </span>
            {couponDiscount > 0 && (
              <span className="text-xs text-muted-foreground line-through font-mono">
                ¥{(price / 100).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Coupon Code Inset Input */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground px-1 select-none">
            {t("orders.coupon_label")}
          </span>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  if (couponApplied) {
                    setCouponApplied(false);
                    setCouponDiscount(0);
                  }
                }}
                disabled={couponLoading || couponApplied}
                placeholder={t("orders.coupon_placeholder")}
                className="w-full h-9 pl-9 pr-3 rounded-full bg-secondary/60 border border-border text-xs text-foreground placeholder:text-muted-foreground outline-hidden focus:border-[#0071e3] transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || couponLoading || couponApplied}
              className={`h-9 px-4 rounded-full text-xs font-medium transition-all select-none cursor-pointer flex items-center gap-1 shrink-0 ${
                couponApplied
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-secondary hover:bg-secondary/80 text-foreground border border-border/80"
              }`}
            >
              {couponLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : couponApplied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>{t("orders.apply_coupon")}</span>
                </>
              ) : (
                <span>{t("orders.apply_coupon")}</span>
              )}
            </button>
          </div>
          {couponError && (
            <p className="text-[11px] text-destructive px-1">{couponError}</p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-muted-foreground px-1 select-none">
            {t("orders.payment_method")}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* 1. Account Balance */}
            <button
              type="button"
              onClick={() => setPaymentMethod("balance")}
              className={`p-3 rounded-[16px] border text-left flex items-start gap-2.5 transition-all select-none cursor-pointer ${
                paymentMethod === "balance"
                  ? "border-[#0071e3] bg-[#0071e3]/5 ring-1 ring-[#0071e3]/40"
                  : "border-border/80 bg-card hover:bg-secondary/30"
              }`}
            >
              <Wallet className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-foreground block truncate">
                  {t("orders.balance_pay")}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  ¥{(userBalance / 100).toFixed(2)}
                </span>
              </div>
            </button>

            {/* 2. Alipay */}
            <button
              type="button"
              onClick={() => setPaymentMethod("alipay")}
              className={`p-3 rounded-[16px] border text-left flex items-start gap-2.5 transition-all select-none cursor-pointer ${
                paymentMethod === "alipay"
                  ? "border-[#0071e3] bg-[#0071e3]/5 ring-1 ring-[#0071e3]/40"
                  : "border-border/80 bg-card hover:bg-secondary/30"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                支
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-foreground block truncate">
                  {t("orders.alipay")}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  Online
                </span>
              </div>
            </button>

            {/* 3. WeChat Pay */}
            <button
              type="button"
              onClick={() => setPaymentMethod("wechat")}
              className={`p-3 rounded-[16px] border text-left flex items-start gap-2.5 transition-all select-none cursor-pointer ${
                paymentMethod === "wechat"
                  ? "border-[#0071e3] bg-[#0071e3]/5 ring-1 ring-[#0071e3]/40"
                  : "border-border/80 bg-card hover:bg-secondary/30"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                微
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-foreground block truncate">
                  {t("orders.wechat")}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  Online
                </span>
              </div>
            </button>

            {/* 4. Crypto / USDT */}
            <button
              type="button"
              onClick={() => setPaymentMethod("crypto")}
              className={`p-3 rounded-[16px] border text-left flex items-start gap-2.5 transition-all select-none cursor-pointer ${
                paymentMethod === "crypto"
                  ? "border-[#0071e3] bg-[#0071e3]/5 ring-1 ring-[#0071e3]/40"
                  : "border-border/80 bg-card hover:bg-secondary/30"
              }`}
            >
              <QrCode className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-foreground block truncate">
                  {t("orders.crypto")}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  TRC20 / Web3
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="p-5 pt-2 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => void close(false)}
          disabled={submitting}
          className="w-1/3 h-11 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs transition-all ios-touch-feedback active:scale-[0.98] cursor-pointer select-none border border-border/60"
        >
          {t("common.cancel")}
        </button>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={submitting}
          className="w-2/3 h-11 rounded-full bg-gradient-to-r from-[#0071e3] to-[#0066cc] hover:from-[#0077ed] hover:to-[#005bb5] text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs shadow-[#0066cc]/25 transition-all ios-touch-feedback active:scale-[0.98] cursor-pointer select-none"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>{t("orders.checkout_confirm")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </SurfaceDialogContent>
  );
}

export function openOrderCheckoutDialog(
  plan: XboardPlan,
  period: string,
  price: number,
  userBalance: number,
  t: (key: string, params?: Record<string, any>) => string,
  onSuccess?: () => void
) {
  return dialog.custom<boolean>((close) => (
    <OrderCheckoutModal
      plan={plan}
      period={period}
      price={price}
      userBalance={userBalance}
      t={t}
      close={close}
      onSuccess={onSuccess}
    />
  ));
}
