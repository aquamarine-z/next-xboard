"use client";

import * as React from "react";
import { useTranslation } from "@/lib/i18n/context";
import { useUserStore } from "@/lib/store/userStore";
import {
  ShoppingBag,
  ArrowRight,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  appleDialog,
  openOrderCheckoutDialog,
  openOrderDetailDialog,
} from "@/components/dialogs";
import { AppleCopyButton } from "@/components/ui/apple-copy-button";
import { formatDate } from "@/lib/format";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { XboardOrder, XboardPlan } from "@/types/xboard";

export default function ShopPage() {
  const { t } = useTranslation();
  const { plans, user, fetchDashboardData } = useUserStore();

  const [shopTab, setShopTab] = React.useState<"plans" | "orders">("plans");
  const [selectedCycle, setSelectedCycle] = React.useState<"month" | "quarter" | "year">("month");

  // Orders State
  const [orders, setOrders] = React.useState<XboardOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [orderFilter, setOrderFilter] = React.useState<"all" | "pending" | "completed" | "cancelled">("all");

  const fetchOrders = React.useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/xboard?type=orders");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  React.useEffect(() => {
    if (shopTab === "orders") {
      fetchOrders();
    }
  }, [shopTab, fetchOrders]);

  const handleOpenCheckout = (plan: XboardPlan, rawPrice: number) => {
    openOrderCheckoutDialog(
      plan,
      selectedCycle,
      rawPrice,
      user?.balance || 0,
      t,
      () => {
        fetchDashboardData();
        fetchOrders();
      }
    );
  };

  const handleCancelOrder = (order: XboardOrder) => {
    appleDialog.confirm({
      title: t("orders.cancel_confirm_title"),
      message: t("orders.cancel_confirm_msg"),
      confirmButtonContent: t("orders.cancel"),
      cancelButtonContent: t("common.cancel"),
      destructive: true,
    }).then(async (confirmed) => {
      if (confirmed) {
        try {
          const res = await fetch("/api/xboard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "cancel_order",
              trade_no: order.trade_no,
            }),
          });
          if (res.ok) {
            toast.success(t("orders.cancel_success"));
            fetchOrders();
          } else {
            const data = await res.json();
            toast.error(data.error || t("common.failed"));
          }
        } catch (err: any) {
          toast.error(err.message || t("common.network_error"));
        }
      }
    });
  };

  const availablePlans = React.useMemo(() => {
    if (!plans || !Array.isArray(plans)) return [];
    return plans.filter((plan) => {
      if (plan.show === 0 || (plan as any).show === "0" || (plan as any).show === false) return false;
      const hasPrice = [
        plan.month_price,
        plan.quarter_price,
        plan.half_year_price,
        plan.year_price,
        plan.two_year_price,
        plan.three_year_price,
        plan.onetime_price,
      ].some((price) => typeof price === "number" && price > 0);
      return hasPrice;
    });
  }, [plans]);

  const parsePlanContent = (content: string, plan: any) => {
    if (!content) return "";
    return content
      .replace(/\{\{\s*transfer\s*\}\}/g, String(plan.transfer_enable ?? 0))
      .replace(/\{\{\s*speed_limit\s*\}\}/g, plan.speed_limit ? String(plan.speed_limit) : "∞");
  };

  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      if (orderFilter === "pending") return o.status === 0;
      if (orderFilter === "completed") return o.status === 1;
      if (orderFilter === "cancelled") return o.status === 2;
      return true;
    });
  }, [orders, orderFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Apple Section Header with Segmented Navigation Pill */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-semibold apple-headline tracking-tight text-foreground">
            {shopTab === "plans" ? t("shop.title") : t("orders.title")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {shopTab === "plans" ? t("shop.subtitle") : t("orders.subtitle")}
          </p>
        </div>

        {/* Primary Segmented Dock: Plans vs Orders */}
        <div className="relative inline-flex p-1 rounded-full liquid-glass-segment-dock select-none self-start sm:self-auto">
          {/* Sliding Liquid Active Indicator Pill */}
          <div
            className="liquid-glass-segment-active"
            style={{
              width: "calc((100% - 7px) / 2)",
              left: "3.5px",
              transform: `translateX(${shopTab === "plans" ? "0%" : "100%"})`,
            }}
          />
          <button
            type="button"
            onClick={() => setShopTab("plans")}
            className={cn(
              "relative z-10 px-5 py-1.5 rounded-full text-xs font-medium transition-all select-none cursor-pointer flex items-center justify-center gap-1.5 ios-touch-feedback min-w-[110px] sm:min-w-[120px]",
              shopTab === "plans"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShoppingBag className={cn("w-3.5 h-3.5 transition-colors", shopTab === "plans" ? "text-[#0071e3] dark:text-[#2997ff]" : "")} />
            <span>{t("orders.tab_plans")}</span>
          </button>
          <button
            type="button"
            onClick={() => setShopTab("orders")}
            className={cn(
              "relative z-10 px-5 py-1.5 rounded-full text-xs font-medium transition-all select-none cursor-pointer flex items-center justify-center gap-1.5 ios-touch-feedback min-w-[110px] sm:min-w-[120px]",
              shopTab === "orders"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Receipt className={cn("w-3.5 h-3.5 transition-colors", shopTab === "orders" ? "text-[#0071e3] dark:text-[#2997ff]" : "")} />
            <span>{t("orders.tab_orders")}</span>
          </button>
        </div>
      </div>

      {shopTab === "plans" ? (
        /* 1. Plans Browsing View */
        availablePlans && availablePlans.length > 0 ? (
          <div key="shop-plans-container" className="space-y-4 animate-fade-in-gradient">
            {/* Cycle Switcher */}
            <div className="relative inline-flex p-1 rounded-full liquid-glass-segment-dock select-none">
              <div
                className="liquid-glass-segment-active"
                style={{
                  width: "calc((100% - 7px) / 3)",
                  left: "3.5px",
                  transform: `translateX(${
                    (selectedCycle === "month" ? 0 : selectedCycle === "quarter" ? 1 : 2) * 100
                  }%)`,
                }}
              />
              {(["month", "quarter", "year"] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setSelectedCycle(cycle)}
                  className={`relative z-10 px-4 sm:px-5 py-1.5 rounded-full text-xs font-medium transition-all ios-touch-feedback select-none cursor-pointer min-w-[70px] sm:min-w-[80px] text-center ${
                    selectedCycle === cycle
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(`shop.cycle.${cycle}`)}
                </button>
              ))}
            </div>

            {/* Real Plan Cards Grid */}
            <div key={`plans-grid-${selectedCycle}`} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {availablePlans.map((plan, idx) => {
                const priceMap: Record<string, number | undefined> = {
                  month: plan.month_price,
                  quarter: plan.quarter_price,
                  year: plan.year_price,
                };
                const rawPrice = priceMap[selectedCycle] ?? plan.month_price ?? 0;
                const formattedPrice = (rawPrice / 100).toFixed(2);

                return (
                  <div
                    key={plan.id}
                    className="apple-utility-card flex flex-col justify-between space-y-6 hover:border-[#0066cc]/40 transition-all animate-fade-in-gradient"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="space-y-5">
                      <div className="flex items-center justify-between select-none">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
                          {plan.transfer_enable} <span className="select-none">GB</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold apple-headline text-foreground">
                          {plan.name}
                        </h3>
                      </div>

                      <div className="py-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl sm:text-4xl font-semibold apple-hero text-foreground tracking-tight">
                            <span className="select-none">¥ </span>{formattedPrice}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            <span className="select-none">/ </span>{t(`shop.cycle.${selectedCycle}`)}
                          </span>
                        </div>
                      </div>

                      {/* Plan content / features */}
                      {plan.content && (
                        <div
                          className="text-xs text-muted-foreground space-y-1.5 pt-3 border-t border-border/60 prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: parsePlanContent(plan.content, plan) }}
                        />
                      )}
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => handleOpenCheckout(plan, rawPrice)}
                        className="w-full apple-pill-btn bg-gradient-to-r from-[#0071e3] to-[#0066cc] hover:from-[#0077ed] hover:to-[#005bb5] text-white flex items-center justify-center gap-2 text-xs font-medium shadow-xs shadow-[#0066cc]/25 transition-all ios-touch-feedback active:scale-[0.98] cursor-pointer"
                      >
                        <span>{t("shop.buy_now")}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="apple-utility-card py-16 text-center space-y-3 animate-fade-in-gradient">
            <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
            <p className="text-sm text-muted-foreground">{t("shop.empty")}</p>
          </div>
        )
      ) : (
        /* 2. My Orders View (Merged) */
        <div key="shop-orders-container" className="space-y-5 animate-fade-in-gradient">
          {/* iOS 26 Liquid Glass Segmented Dock for Order Filters */}
          <div className="relative !grid grid-cols-4 p-1 rounded-full liquid-glass-segment-dock select-none self-start sm:self-auto">
            {/* Sliding Liquid Active Indicator Pill */}
            <div
              className="liquid-glass-segment-active"
              style={{
                width: "calc((100% - 7px) / 4)",
                left: "3.5px",
                transform: `translateX(${
                  (orderFilter === "all" ? 0 : orderFilter === "pending" ? 1 : orderFilter === "completed" ? 2 : 3) * 100
                }%)`,
              }}
            />
            {(["all", "pending", "completed", "cancelled"] as const).map((filter) => {
              const isSelected = orderFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setOrderFilter(filter)}
                  className={cn(
                    "relative z-10 px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 select-none cursor-pointer flex items-center justify-center text-center ios26-press min-w-[62px] sm:min-w-[76px]",
                    isSelected
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(`orders.status_${filter}`)}
                </button>
              );
            })}
          </div>

          <div key={`orders-view-${orderFilter}`} className="space-y-4 animate-fade-in-gradient">
          {ordersLoading ? (
            <div className="p-16 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground animate-fade-in-gradient">
              <Loader2 className="w-6 h-6 animate-spin text-[#0071e3]" />
              <span className="text-xs">{t("common.loading")}</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="apple-utility-card py-16 text-center space-y-3 animate-fade-in-gradient">
              <Receipt className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
              <p className="text-sm text-muted-foreground">{t("orders.empty")}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-[22px] border border-border/80 bg-card overflow-hidden shadow-xs animate-fade-in-gradient">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 bg-secondary/30 text-muted-foreground select-none">
                      <th className="py-3.5 px-5 font-semibold">{t("orders.order_no")}</th>
                      <th className="py-3.5 px-4 font-semibold">{t("orders.period")}</th>
                      <th className="py-3.5 px-4 font-semibold">{t("orders.amount")}</th>
                      <th className="py-3.5 px-4 font-semibold">{t("orders.status")}</th>
                      <th className="py-3.5 px-4 font-semibold">{t("orders.created_at")}</th>
                      <th className="py-3.5 px-5 text-right font-semibold">{t("orders.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredOrders.map((order, idx) => {
                      const isPending = order.status === 0;
                      const isCompleted = order.status === 1;
                      const isCancelled = order.status === 2;

                      return (
                        <tr
                          key={order.id || idx}
                          className="hover:bg-secondary/20 transition-colors animate-fade-in-gradient"
                          style={{ animationDelay: `${Math.min(idx * 30, 240)}ms` }}
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-1.5 font-mono text-foreground">
                              <span className="truncate max-w-[170px] select-all">{order.trade_no}</span>
                              <AppleCopyButton
                                textToCopy={order.trade_no}
                                defaultText=""
                                copiedText=""
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 shrink-0"
                              />
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-secondary/80 text-foreground font-medium text-[11px] border border-border/60 select-none">
                              {order.period.replace("_price", "")}
                            </span>
                          </td>

                          <td className="py-4 px-4 font-mono font-semibold text-foreground">
                            ¥{(order.total_amount / 100).toFixed(2)}
                          </td>

                          <td className="py-4 px-4">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{t("orders.status_completed")}</span>
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>{t("orders.status_pending")}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-[11px] font-medium bg-secondary text-muted-foreground border border-border select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                <span>{t("orders.status_cancelled")}</span>
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 font-mono text-muted-foreground text-[11px]">
                            {formatDate(order.created_at)}
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openOrderDetailDialog(order, t)}
                                className="text-xs font-medium text-[#0071e3] dark:text-[#2997ff] hover:underline cursor-pointer select-none"
                              >
                                {t("orders.view_detail")}
                              </button>

                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelOrder(order)}
                                  className="text-xs font-medium text-destructive hover:underline cursor-pointer select-none"
                                >
                                  {t("orders.cancel")}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden space-y-3">
                {filteredOrders.map((order, idx) => {
                  const isPending = order.status === 0;
                  const isCompleted = order.status === 1;

                  return (
                    <div
                      key={order.id || idx}
                      className="p-4 rounded-[20px] border border-border/80 bg-card space-y-3 shadow-2xs animate-fade-in-gradient"
                      style={{ animationDelay: `${Math.min(idx * 35, 280)}ms` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 font-mono text-xs text-foreground">
                          <span className="truncate max-w-[180px] font-semibold">{order.trade_no}</span>
                          <AppleCopyButton
                            textToCopy={order.trade_no}
                            defaultText=""
                            copiedText=""
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 shrink-0"
                          />
                        </div>

                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{t("orders.status_completed")}</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>{t("orders.status_pending")}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground border border-border shrink-0">
                            <span>{t("orders.status_cancelled")}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                        <span className="px-2 py-0.5 rounded-full bg-secondary/80 text-foreground text-[10px] border border-border/60">
                          {order.period.replace("_price", "")}
                        </span>
                        <span className="font-mono font-bold text-foreground text-sm">
                          ¥{(order.total_amount / 100).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span className="font-mono">{formatDate(order.created_at)}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openOrderDetailDialog(order, t)}
                            className="text-[#0071e3] dark:text-[#2997ff] font-medium hover:underline cursor-pointer"
                          >
                            {t("orders.view_detail")}
                          </button>
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order)}
                              className="text-destructive font-medium hover:underline cursor-pointer"
                            >
                              {t("orders.cancel")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          </div>
        </div>
      )}
    </div>
  );
}