"use client";

import * as React from "react";
import { useTranslation } from "@/lib/i18n/context";
import { useUserStore } from "@/lib/store/userStore";
import { Check, ShoppingBag, ArrowRight } from "lucide-react";
import { appleDialog } from "@/components/dialogs";
import { toast } from "@/components/ui/sonner";

export default function ShopPage() {
  const { t } = useTranslation();
  const { plans, fetchDashboardData } = useUserStore();
  const [selectedCycle, setSelectedCycle] = React.useState<"month" | "quarter" | "year">("month");

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCheckout = (planName: string, amount: number) => {
    appleDialog.confirm({
      title: t("shop.order_confirm_title"),
      message: `${planName} (${t(`shop.cycle.${selectedCycle}`)}) - ${t("shop.total_price")}: ¥ ${(amount / 100).toFixed(2)}`,
      confirmButtonContent: t("shop.checkout_button"),
      cancelButtonContent: t("common.cancel"),
    }).then((confirmed) => {
      if (confirmed) {
        toast.success(`${planName} - ${t("common.success")}`);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Apple Section Header */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-semibold apple-headline tracking-tight text-foreground">
          {t("shop.title")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("shop.subtitle")}
        </p>
      </div>

      {/* Real Plans from Backend */}
      {availablePlans && availablePlans.length > 0 ? (
        <>
          {/* Cycle Switcher */}
          <div className="inline-flex p-1 rounded-full bg-secondary/80 border border-border select-none">
            {(["month", "quarter", "year"] as const).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setSelectedCycle(cycle)}
                className={`px-5 py-1.5 rounded-full text-xs font-medium transition-all ios-touch-feedback select-none ${
                  selectedCycle === cycle
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(`shop.cycle.${cycle}`)}
              </button>
            ))}
          </div>

          {/* Real Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {availablePlans.map((plan) => {
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
                  className="apple-utility-card flex flex-col justify-between space-y-6"
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
                      onClick={() => handleCheckout(plan.name, rawPrice)}
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
        </>
      ) : (
        <div className="apple-utility-card py-16 text-center space-y-3">
          <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
          <p className="text-sm text-muted-foreground">{t("shop.empty")}</p>
        </div>
      )}
    </div>
  );
}