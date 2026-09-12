"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { useUserStore } from "@/lib/store/userStore";
import { formatDate } from "@/lib/format";
import { AppleCopyButton } from "@/components/ui/apple-copy-button";
import { appleDialog, openChangePasswordDialog } from "@/components/dialogs";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import {
  Mail,
  KeyRound,
  RefreshCw,
  Send,
  Calendar,
  Wallet,
  LogOut,
  ChevronRight,
  LogIn,
  UserCheck,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { AppleCloudIcon } from "@/components/ui/apple-icons";

export default function ProfilePage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { authenticated, user, subscribe, plans, fetchDashboardData, logout, tickets } = useUserStore();

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derive user's current plan name accurately
  const currentPlan = React.useMemo(() => {
    if (!subscribe && !user) return null;
    if ((subscribe as any)?.plan?.name) return (subscribe as any).plan;
    if ((user as any)?.plan?.name) return (user as any).plan;
    const planId = subscribe?.plan_id || user?.plan_id;
    if (!planId) return null;
    return plans.find((p) => Number(p.id) === Number(planId)) || null;
  }, [subscribe, user, plans]);

  const planDisplayName = React.useMemo(() => {
    if (currentPlan?.name) return currentPlan.name;
    const planId = subscribe?.plan_id || user?.plan_id;
    if (planId) {
      return `VIP ${planId}`;
    }
    return authenticated ? t("dashboard.plan_title") : t("dashboard.no_active_plan");
  }, [currentPlan, subscribe, user, authenticated, t]);

  // Handlers
  const handleLogout = () => {
    appleDialog.confirm({
      title: t("profile.logout"),
      message: t("profile.logout_confirm"),
      confirmButtonContent: t("profile.logout"),
      cancelButtonContent: t("common.cancel"),
      destructive: true,
    }).then(async (confirmed) => {
      if (confirmed) {
        await logout();
        router.push(`/${locale}/login`);
      }
    });
  };

  const handleResetSecret = () => {
    appleDialog.confirm({
      title: t("profile.reset_security"),
      message: t("profile.reset_confirm"),
      confirmButtonContent: t("profile.reset_security_btn"),
      cancelButtonContent: t("common.cancel"),
      destructive: true,
    }).then(async (confirmed) => {
      if (confirmed) {
        try {
          const res = await fetch("/api/xboard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reset_security" }),
          });
          if (res.ok) {
            toast.success(t("profile.reset_success"));
            fetchDashboardData();
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

  const handleChangePassword = () => {
    openChangePasswordDialog(t);
  };

  const handleTelegramBind = () => {
    toast.info(t("profile.telegram_bot_hint"));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      {/* 1. iOS Large Title Header */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-semibold apple-headline tracking-tight text-foreground">
          {t("profile.title")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("profile.subtitle")}
        </p>
      </div>

      {/* Guest State Notice */}
      {!authenticated || !user ? (
        <div className="rounded-[22px] border border-border bg-card p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#0066cc]/10 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center mx-auto select-none">
            <UserCheck className="w-7 h-7 select-none" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-semibold apple-headline text-foreground">
              {t("profile.not_logged_in")}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t("profile.not_logged_in_desc")}
            </p>
          </div>
          <div className="pt-2">
            <Link href={`/${locale}/login`}>
              <button
                type="button"
                className="apple-pill-btn bg-[#0066cc] hover:bg-[#0071e3] text-white text-xs font-medium inline-flex items-center gap-2 shadow-sm py-2.5 px-6 select-none"
              >
                <LogIn className="w-4 h-4 select-none" />
                <span>{t("profile.login_cta")}</span>
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-7">
          {/* 2. Apple Account Top Banner Card */}
          <div className="rounded-[22px] border border-border bg-card p-5 sm:p-6.5 shadow-xs flex items-center justify-between gap-4 sm:gap-5 overflow-hidden">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#0066cc]/20 via-[#0066cc]/10 to-[#2997ff]/20 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center font-bold text-base sm:text-xl border border-[#0066cc]/20 select-none shadow-xs shrink-0">
                {user.email ? user.email.slice(0, 2).toUpperCase() : "AP"}
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="text-[14px] sm:text-base md:text-lg font-semibold apple-headline text-foreground break-all leading-snug select-all">
                  {user.email}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full select-none shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse select-none" />
                    <span>{t("profile.active_account")}</span>
                  </span>
                  <span className="text-[11px] sm:text-xs font-mono text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md border border-border/60 select-none shrink-0">
                    <span className="select-none">UID: #</span>{user.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <AppleCopyButton
                textToCopy={user.email}
                defaultText={t("common.copy")}
                copiedText={t("common.copied")}
                size="sm"
                variant="secondary"
                className="px-3 sm:px-3.5 h-8 shrink-0 text-xs select-none"
              />
            </div>
          </div>

          {/* 3. Inset Group 1: 账户与凭证 (Account & Credentials) */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 select-none">
              {t("profile.account_info")}
            </span>
            <div className="rounded-[20px] border border-border bg-card overflow-hidden shadow-xs divide-y divide-border/60">
              {/* Row 1: Email */}
              <div className="py-4.5 px-5 sm:py-5 sm:px-6 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-[11px] bg-[#0066cc]/10 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center shrink-0 select-none">
                    <Mail className="w-4.5 h-4.5 select-none" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center gap-1 sm:gap-1.5">
                    <p className="text-[13.5px] font-medium text-foreground tracking-tight select-none">
                      {t("profile.email_label")}
                    </p>
                    <p className="text-xs sm:text-[12.5px] text-muted-foreground break-all leading-normal select-all">
                      {user.email}
                    </p>
                  </div>
                </div>

                <AppleCopyButton
                  textToCopy={user.email}
                  defaultText={t("common.copy")}
                  copiedText={t("common.copied")}
                  size="sm"
                  variant="secondary"
                  className="px-3 sm:px-3.5 h-7 shrink-0 text-[11px] select-none"
                />
              </div>

              {/* Row 2: Password */}
              <div className="py-4.5 px-5 sm:py-5 sm:px-6 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 select-none">
                    <KeyRound className="w-4.5 h-4.5 select-none" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center gap-1 sm:gap-1.5">
                    <p className="text-[13.5px] font-medium text-foreground tracking-tight select-none">
                      {t("profile.password_label")}
                    </p>
                    <p className="text-xs sm:text-[12.5px] text-muted-foreground font-mono select-none">
                      ••••••••••••
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="apple-pill-btn relative overflow-hidden inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 h-7 shrink-0 text-[11px] font-medium border border-border/80 bg-secondary/50 text-[#48484a] dark:text-[#d1d1d6] hover:text-foreground hover:bg-secondary select-none active:scale-95 transition-all duration-200 ease-out cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 select-none" />
                  <span className="select-none">{t("profile.change_password")}</span>
                </button>
              </div>

              {/* Row 3: Reset Secret */}
              <div className="py-4.5 px-5 sm:py-5 sm:px-6 flex items-center justify-between gap-3.5 sm:gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-[11px] bg-destructive/10 text-destructive flex items-center justify-center shrink-0 select-none">
                    <RefreshCw className="w-4.5 h-4.5 select-none" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center gap-1 sm:gap-1.5">
                    <p className="text-[13.5px] font-medium text-foreground tracking-tight select-none">
                      {t("profile.reset_security")}
                    </p>
                    <p className="text-xs sm:text-[12.5px] text-muted-foreground leading-normal select-none">
                      {t("profile.reset_security_desc")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetSecret}
                  className="apple-pill-btn text-xs bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/20 flex items-center gap-1.5 py-1 px-3 select-none h-7 shrink-0 transition-all cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 select-none" />
                  <span className="select-none">{t("profile.reset_security_btn")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Inset Group 2: 订阅与资产 (Subscription & Assets) */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 select-none">
              {t("profile.subscription_overview")}
            </span>
            <div className="rounded-[20px] border border-border bg-card overflow-hidden shadow-xs divide-y divide-border/60">
              {/* Row 1: Plan */}
              <div className="py-4.5 px-5 sm:py-5 sm:px-6 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-[11px] bg-[#0066cc]/10 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center shrink-0 select-none">
                    <AppleCloudIcon className="w-4.5 h-4.5 text-[#0066cc] dark:text-[#2997ff]" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center gap-1 sm:gap-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-[13.5px] font-semibold apple-headline text-foreground select-none truncate">
                        {planDisplayName}
                      </p>
                      {authenticated && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-full select-none shrink-0">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse select-none" />
                          <span>{t("common.status.active")}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-[12.5px] text-muted-foreground select-none truncate leading-normal">
                      {t("profile.plan_label")}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/${locale}/shop`}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors select-none shrink-0"
                >
                  <span className="select-none">{t("profile.manage_plan")}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 select-none" />
                </Link>
              </div>

              {/* Row 2: Expiration Date */}
              <div className="py-4.5 px-5 sm:py-5 sm:px-6 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-[11px] bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 select-none">
                    <Calendar className="w-4.5 h-4.5 select-none" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center gap-1 sm:gap-1.5">
                    <p className="text-[13.5px] font-medium text-foreground tracking-tight select-none">
                      {t("profile.expire_label")}
                    </p>
                    <p className="text-xs sm:text-[12.5px] text-muted-foreground font-mono leading-normal">
                      {user.expired_at ? formatDate(user.expired_at) : t("dashboard.never_expire")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 3: Account Balance */}
              <div className="py-4.5 px-5 sm:py-5 sm:px-6 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 select-none">
                    <Wallet className="w-4.5 h-4.5 select-none" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center gap-1 sm:gap-1.5">
                    <p className="text-[13.5px] font-medium text-foreground tracking-tight select-none">
                      {t("profile.balance_label")}
                    </p>
                    <p className="text-xs sm:text-[12.5px] text-muted-foreground font-mono leading-normal">
                      <span className="select-none">¥ </span>{((user.balance || 0) / 100).toFixed(2)}
                      {Boolean(user.commission_balance && user.commission_balance > 0) && (
                        <span>
                          {" "}· <span className="select-none">{t("profile.commission_label")}: ¥ </span>
                          {(user.commission_balance / 100).toFixed(2)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/${locale}/shop`}
                  className="apple-pill-btn text-xs bg-gradient-to-r from-[#0071e3] to-[#0066cc] hover:from-[#0077ed] hover:to-[#005bb5] text-white flex items-center gap-1.5 py-1 px-3.5 select-none h-7 shrink-0 transition-all font-medium shadow-xs shadow-[#0066cc]/25 cursor-pointer"
                >
                  <span className="select-none">{t("dashboard.buy_plan_cta")}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 5. Inset Group 3: 第三方联动与通知 (Integrations & Notifications) */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 select-none">
              {t("profile.third_party_integration")}
            </span>
            <div className="rounded-[20px] border border-border bg-card overflow-hidden shadow-xs">
              <div className="py-4.5 px-5 sm:py-5 sm:px-6 flex items-center justify-between gap-3.5 sm:gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-[11px] bg-sky-500/10 text-sky-500 dark:text-sky-400 flex items-center justify-center shrink-0 select-none">
                    <Send className="w-4.5 h-4.5 select-none" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center gap-1 sm:gap-1.5">
                    <p className="text-[13.5px] font-medium text-foreground tracking-tight select-none">
                      {t("profile.telegram_bind")}
                    </p>
                    <p className="text-xs sm:text-[12.5px] text-muted-foreground leading-normal select-none">
                      {t("profile.telegram_bind_desc")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTelegramBind}
                  className="apple-pill-btn text-xs bg-gradient-to-r from-[#0071e3] to-[#0066cc] hover:from-[#0077ed] hover:to-[#005bb5] text-white flex items-center gap-1.5 py-1 px-3.5 select-none h-7 shrink-0 transition-all cursor-pointer shadow-xs shadow-[#0066cc]/25 font-medium"
                >
                  <Send className="w-3 h-3 select-none text-white" />
                  <span className="select-none">{t("profile.bind_now")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 6. Inset Group: 帮助与服务支持 (Support & Resources) */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 select-none">
              {t("common.nav.tickets")} & {t("common.nav.knowledge")}
            </span>
            <div className="rounded-[20px] border border-border bg-card overflow-hidden shadow-xs divide-y divide-border/60">
              {/* Tickets Entry */}
              <Link
                href={`/${locale}/tickets`}
                className="py-4.5 px-5 sm:py-5 sm:px-6 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20 group cursor-pointer select-none"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-[11px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 select-none">
                    <MessageSquare className="w-4.5 h-4.5 select-none" />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-[13.5px] font-medium text-foreground select-none group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors">
                        {t("common.nav.tickets")}
                      </p>
                      {tickets && tickets.length > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold select-none">
                          {tickets.length}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-[12.5px] text-muted-foreground truncate select-none leading-normal">
                      {t("tickets.subtitle")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors hidden sm:inline select-none">
                    {tickets && tickets.length > 0
                      ? t("tickets.conversations", { count: tickets.length })
                      : t("tickets.create_ticket")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors shrink-0 select-none" />
                </div>
              </Link>

              {/* Knowledge Base */}
              <Link
                href={`/${locale}/knowledge`}
                className="py-4.5 px-5 sm:py-5 sm:px-6 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20 group cursor-pointer select-none"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-[11px] bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 select-none">
                    <BookOpen className="w-4.5 h-4.5 select-none" />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5">
                    <p className="text-[13.5px] font-medium text-foreground select-none group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors">
                      {t("common.nav.knowledge")}
                    </p>
                    <p className="text-xs sm:text-[12.5px] text-muted-foreground truncate select-none leading-normal">
                      {t("knowledge.desc")}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors shrink-0 select-none" />
              </Link>
            </div>
          </div>

          {/* 7. Inset Group: 退出登录 (Sign Out Action) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full h-12 rounded-[18px] border border-destructive/25 bg-destructive/5 hover:bg-destructive/10 text-destructive flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 ios-touch-feedback cursor-pointer select-none active:scale-[0.99]"
            >
              <LogOut className="w-4 h-4 shrink-0 select-none" />
              <span className="select-none font-medium">{t("profile.logout")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}