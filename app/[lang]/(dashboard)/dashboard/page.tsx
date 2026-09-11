"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useUserStore } from "@/lib/store/userStore";
import { formatBytes, formatDate } from "@/lib/format";
import {
  Zap,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  Bell,
  Sparkles,
  Signal,
  LogIn,
  ShoppingBag,
  Copy,
  Check,
  Radio,
  ArrowUp,
  ArrowDown,
  Wallet,
} from "lucide-react";
import { openQuickImportDialog } from "@/components/dialogs";
import { AppleCopyButton } from "@/components/ui/apple-copy-button";

export default function DashboardPage() {
  const { t, locale } = useTranslation();
  const {
    authenticated,
    user,
    subscribe,
    servers,
    notices,
    plans,
    config,
    fetchDashboardData,
  } = useUserStore();

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const u = (user?.u ?? subscribe?.u) || 0;
  const d = (user?.d ?? subscribe?.d) || 0;
  const usedTraffic = u + d;
  const totalTraffic = (user?.transfer_enable ?? subscribe?.transfer_enable) || 1;
  const remainingTraffic = Math.max(0, totalTraffic - usedTraffic);
  const trafficPercent = Math.min(100, Math.round((usedTraffic / totalTraffic) * 100));

  // Find real active plan name from backend plans if matching
  const currentPlan = plans.find(
    (p) => p.id === (user?.plan_id || subscribe?.plan_id)
  );
  const planDisplayName = currentPlan?.name || (authenticated ? t("dashboard.plan_title") : t("dashboard.no_active_plan"));

  // Check real status
  const isExpired = Boolean(
    user?.expired_at && user.expired_at > 0 && user.expired_at * 1000 < Date.now()
  );
  const isExhausted = Boolean(
    user?.transfer_enable && user.transfer_enable > 0 && usedTraffic >= user.transfer_enable
  );

  return (
    <div className="space-y-10 sm:space-y-12 animate-in fade-in duration-300">
      {/* 1. iOS Large Title / User Greeting */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-semibold apple-headline tracking-tight text-foreground">
          {authenticated && user
            ? t("dashboard.greeting", { name: user.email.split("@")[0] })
            : config?.app_description || t("common.app_name")}
        </h1>
        {authenticated && user && (
          <p className="text-sm text-muted-foreground font-normal">
            {user.email}
          </p>
        )}
      </div>

      {/* 2. System Notices (Only if real notices exist) */}
      {notices && notices.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            {t("dashboard.notices_title")}
          </h2>
          <div className="space-y-2.5">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="p-4 rounded-[16px] border border-border bg-card flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-[#0066cc]/10 text-[#0066cc] dark:text-[#2997ff] shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-foreground">
                      {notice.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notice.content}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                  {formatDate(notice.created_at)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Subscription Pass Card (100% Real Data Only) */}
      <section className="rounded-[22px] border border-border bg-card p-6 sm:p-8 space-y-7 shadow-xs">
        {/* Card Header: Plan Name & Real Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#0066cc]/10 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold apple-headline tracking-tight text-foreground">
                {planDisplayName}
              </h2>
              <p className="text-xs text-muted-foreground">
                {config?.app_description || "Aqua VPS"}
              </p>
            </div>
          </div>

          {authenticated ? (
            <div className="flex items-center gap-2">
              {isExpired ? (
                <span className="apple-pill-btn py-1 px-3 text-xs font-medium bg-destructive/10 text-destructive select-none">
                  {t("common.status.expired")}
                </span>
              ) : isExhausted ? (
                <span className="apple-pill-btn py-1 px-3 text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 select-none">
                  {t("common.status.exhausted")}
                </span>
              ) : (
                <span className="apple-pill-btn py-1 px-3 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse select-none" />
                  <span>{t("common.status.active")}</span>
                </span>
              )}
            </div>
          ) : (
            <Link href={`/${locale}/login`}>
              <button
                type="button"
                className="apple-pill-btn bg-[#0066cc] hover:bg-[#0071e3] text-white text-xs flex items-center gap-1.5 select-none"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t("auth.login_button")}</span>
              </button>
            </Link>
          )}
        </div>

        {/* Quota Numbers & Progress Bar */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase select-none">
                {t("dashboard.traffic_used")} / {t("dashboard.traffic_total")}
              </span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl sm:text-5xl font-semibold apple-hero tracking-tight text-foreground">
                  {authenticated && user ? formatBytes(usedTraffic) : "0 B"}
                </span>
                <span className="text-lg sm:text-2xl text-muted-foreground font-normal">
                  <span className="select-none">/ </span>{authenticated && user ? formatBytes(totalTraffic) : "0 B"}
                </span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-2xl sm:text-3xl font-semibold text-[#0066cc] dark:text-[#2997ff]">
                {authenticated && user ? `${trafficPercent}` : "0"}<span className="select-none">%</span>
              </span>
              <p className="text-xs text-muted-foreground mt-0.5 select-none">
                {t("dashboard.traffic_remaining")}:{" "}
                <span className="select-text">
                  {authenticated && user
                    ? formatBytes(Math.max(0, totalTraffic - usedTraffic))
                    : "0 B"}
                </span>
              </p>
            </div>
          </div>

          {/* Segmented Progress Capsule */}
          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden p-0.5 border border-border/80">
            <div
              className="h-full bg-[#0066cc] dark:bg-[#2997ff] rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${authenticated && user ? Math.max(3, trafficPercent) : 0}%`,
              }}
            />
          </div>

          {/* Real Details Grid: Only display cards that have actual data! */}
          {authenticated && user && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              {/* 1. 已用流量 (Always displayed) */}
              <div className="p-3.5 rounded-[14px] bg-secondary/50 border border-border/50 space-y-0.5">
                <span className="text-muted-foreground block text-[11px] select-none">
                  {t("dashboard.traffic_used")}
                </span>
                <span className="font-semibold text-foreground text-[14px] font-mono block">
                  {formatBytes(usedTraffic)}
                </span>
                {(u > 0 || d > 0) && (
                  <span className="text-[10px] text-muted-foreground block truncate font-mono">
                    <span className="select-none">↑ </span>{formatBytes(u)} <span className="select-none">· ↓ </span>{formatBytes(d)}
                  </span>
                )}
              </div>

              {/* 2. 剩余流量 (Always displayed) */}
              <div className="p-3.5 rounded-[14px] bg-secondary/50 border border-border/50 space-y-0.5">
                <span className="text-muted-foreground block text-[11px] select-none">
                  {t("dashboard.traffic_remaining")}
                </span>
                <span className="font-semibold text-foreground text-[14px] font-mono block">
                  {formatBytes(remainingTraffic)}
                </span>
              </div>

              {/* 3. 到期时间 (Always displayed) */}
              <div className="p-3.5 rounded-[14px] bg-secondary/50 border border-border/50 space-y-0.5">
                <span className="text-muted-foreground block text-[11px] select-none">
                  {t("dashboard.expire_time")}
                </span>
                <span className="font-medium text-foreground text-[13px] block">
                  {user.expired_at ? formatDate(user.expired_at) : t("dashboard.never_expire")}
                </span>
              </div>

              {/* 4. 账户余额 (Always displayed) */}
              <div className="p-3.5 rounded-[14px] bg-secondary/50 border border-border/50 space-y-0.5">
                <span className="text-muted-foreground block text-[11px] select-none">
                  {t("dashboard.balance")}
                </span>
                <span className="font-semibold text-foreground text-[14px] block">
                  <span className="select-none">¥ </span>{((user.balance || 0) / 100).toFixed(2)}
                </span>
              </div>

              {/* 5. 重置周期 (ONLY if subscribe.reset_day exists and > 0) */}
              {Boolean(subscribe?.reset_day && subscribe.reset_day > 0) && (
                <div className="p-3.5 rounded-[14px] bg-secondary/50 border border-border/50 space-y-0.5">
                  <span className="text-muted-foreground block text-[11px] select-none">
                    重置周期
                  </span>
                  <span className="font-medium text-foreground text-[13px] block">
                    {t("dashboard.traffic_reset", { days: subscribe?.reset_day || 0 })}
                  </span>
                </div>
              )}

              {/* 6. 佣金余额 (ONLY if > 0) */}
              {Boolean(user.commission_balance && user.commission_balance > 0) && (
                <div className="p-3.5 rounded-[14px] bg-secondary/50 border border-border/50 space-y-0.5">
                  <span className="text-muted-foreground block text-[11px] select-none">
                    {t("dashboard.commission_balance")}
                  </span>
                  <span className="font-medium text-foreground text-[13px] block">
                    <span className="select-none">¥ </span>{(user.commission_balance / 100).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Actions: Quick Import & Copy */}
        <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-border">
          {subscribe?.subscribe_url ? (
            <>
              <button
                type="button"
                onClick={() => openQuickImportDialog(subscribe.subscribe_url, t)}
                className="apple-pill-btn bg-gradient-to-r from-[#0071e3] to-[#0066cc] hover:from-[#0077ed] hover:to-[#005bb5] text-white flex items-center justify-center gap-2 shadow-xs font-medium h-10 px-5 shrink-0 transition-all"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>{t("dashboard.quick_import")}</span>
              </button>

              <AppleCopyButton
                textToCopy={subscribe.subscribe_url}
                defaultText={t("dashboard.copy_subscription")}
                copiedText={t("common.copied")}
                variant="secondary"
                className="h-10 min-w-[130px] sm:min-w-[180px] shrink-0"
              />
            </>
          ) : (
            <Link href={`/${locale}/shop`}>
              <button
                type="button"
                className="apple-pill-btn bg-[#0066cc] hover:bg-[#0071e3] text-white flex items-center gap-2 shadow-sm font-medium"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t("dashboard.buy_plan_cta")}</span>
              </button>
            </Link>
          )}
        </div>
      </section>

      {/* 4. Real Assigned Node Servers (Only display real servers from backend) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("dashboard.available_servers")}
          </h2>
          {servers && servers.length > 0 && (
            <Link
              href={`/${locale}/nodes`}
              className="text-xs font-medium text-[#0066cc] dark:text-[#2997ff] hover:underline flex items-center gap-1"
            >
              <span>{t("dashboard.view_all_nodes")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {servers && servers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {servers.slice(0, 6).map((srv) => (
              <div
                key={srv.id}
                className="p-4 rounded-[16px] border border-border bg-card hover:border-[#0066cc]/40 transition-colors flex items-center justify-between gap-3"
              >
                <div className="space-y-1 truncate">
                  <p className="text-sm font-semibold apple-headline text-foreground truncate">
                    {srv.name}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground select-none">
                    <span className="font-mono uppercase">{srv.type}</span>
                    <span className="select-none">•</span>
                    <span>{t("nodes.rate", { rate: srv.rate || "1.0" })}</span>
                  </div>
                </div>

                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 select-none" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-[18px] border border-border bg-card text-center text-xs text-muted-foreground">
            {authenticated
              ? t("nodes.empty")
              : "登录后即可查看已分配的节点服务器"}
          </div>
        )}
      </section>
    </div>
  );
}