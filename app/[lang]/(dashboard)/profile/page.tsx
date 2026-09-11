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
import {
  Mail,
  KeyRound,
  RefreshCw,
  Send,
  Zap,
  Calendar,
  Wallet,
  LogOut,
  ChevronRight,
  LogIn,
  UserCheck,
} from "lucide-react";

export default function ProfilePage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { authenticated, user, subscribe, plans, fetchDashboardData, logout } = useUserStore();

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derive user's current plan name
  const currentPlan = React.useMemo(() => {
    if (!subscribe && !user) return null;
    const planId = subscribe?.plan_id || user?.plan_id;
    if (!planId) return null;
    return plans.find((p) => p.id === planId) || null;
  }, [subscribe, user, plans]);

  const planDisplayName = currentPlan?.name || (subscribe?.plan_id ? `VIP #${subscribe.plan_id}` : "基础会员");

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
            void appleDialog.alert({
              title: t("common.success"),
              message: t("profile.reset_success"),
            });
            fetchDashboardData();
          } else {
            const data = await res.json();
            void appleDialog.alert({
              title: t("common.failed"),
              message: data.error || t("common.failed"),
            });
          }
        } catch (err: any) {
          void appleDialog.alert({
            title: t("common.failed"),
            message: err.message || t("common.network_error"),
          });
        }
      }
    });
  };

  const handleChangePassword = () => {
    openChangePasswordDialog(t);
  };

  const handleTelegramBind = () => {
    void appleDialog.alert({
      title: t("profile.telegram_bind"),
      message: t("profile.telegram_bot_hint"),
    });
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
          <div className="rounded-[22px] border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#0066cc]/20 via-[#0066cc]/10 to-[#2997ff]/20 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center font-bold text-lg sm:text-xl border border-[#0066cc]/20 select-none shadow-xs shrink-0">
                {user.email ? user.email.slice(0, 2).toUpperCase() : "AP"}
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-base sm:text-lg font-semibold apple-headline text-foreground truncate">
                  {user.email}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse select-none" />
                    <span>{t("profile.active_account")}</span>
                  </span>
                  <span className="text-xs font-mono text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md border border-border/60 select-none">
                    <span className="select-none">UID: #</span>{user.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="self-end sm:self-center shrink-0">
              <AppleCopyButton
                textToCopy={user.email}
                defaultText={t("common.copy")}
                copiedText={t("common.copied")}
                size="sm"
                variant="secondary"
                className="w-20 h-8 shrink-0 text-xs select-none"
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
              <div className="p-4 sm:px-5 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-[10px] bg-[#0066cc]/10 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center shrink-0 select-none">
                    <Mail className="w-4 h-4 select-none" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground select-none">
                      {t("profile.email_label")}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
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
                  className="w-20 h-7 shrink-0 text-[11px] select-none"
                />
              </div>

              {/* Row 2: Password */}
              <div className="p-4 sm:px-5 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 select-none">
                    <KeyRound className="w-4 h-4 select-none" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground select-none">
                      {t("profile.password_label")}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono select-none">
                      ••••••••••••
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="apple-pill-btn text-xs bg-secondary hover:bg-secondary/80 border border-border text-foreground flex items-center gap-1.5 py-1 px-3 select-none h-7 shrink-0 transition-all cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 select-none" />
                  <span className="select-none">{t("profile.change_password")}</span>
                </button>
              </div>

              {/* Row 3: Reset Secret */}
              <div className="p-4 sm:px-5 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-[10px] bg-destructive/10 text-destructive flex items-center justify-center shrink-0 select-none">
                    <RefreshCw className="w-4 h-4 select-none" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground select-none">
                      {t("profile.reset_security")}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm truncate sm:whitespace-normal select-none">
                      {t("profile.reset_security_desc")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetSecret}
                  className="apple-pill-btn text-xs bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/20 flex items-center gap-1.5 py-1 px-3 select-none h-7 shrink-0 transition-all cursor-pointer"
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
              <div className="p-4 sm:px-5 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-[10px] bg-[#0066cc]/10 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center shrink-0 select-none">
                    <Zap className="w-4 h-4 fill-current select-none" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground select-none">
                      {t("profile.plan_label")}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-medium">
                      {planDisplayName}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/${locale}/shop`}
                  className="text-xs font-medium text-[#0066cc] dark:text-[#2997ff] flex items-center gap-1 hover:underline select-none shrink-0"
                >
                  <span className="select-none">{t("profile.manage_plan")}</span>
                  <ChevronRight className="w-3.5 h-3.5 select-none" />
                </Link>
              </div>

              {/* Row 2: Expiration Date */}
              <div className="p-4 sm:px-5 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 select-none">
                    <Calendar className="w-4 h-4 select-none" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground select-none">
                      {t("profile.expire_label")}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {user.expired_at ? formatDate(user.expired_at) : t("dashboard.never_expire")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 3: Account Balance */}
              <div className="p-4 sm:px-5 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 select-none">
                    <Wallet className="w-4 h-4 select-none" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground select-none">
                      {t("profile.balance_label")}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
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
                  className="apple-pill-btn text-xs bg-secondary hover:bg-secondary/80 border border-border text-foreground flex items-center gap-1.5 py-1 px-3 select-none h-7 shrink-0 transition-all"
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
              <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-secondary/20">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 select-none">
                    <Send className="w-4 h-4 select-none" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground select-none">
                      {t("profile.telegram_bind")}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed select-none">
                      {t("profile.telegram_bind_desc")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTelegramBind}
                  className="apple-pill-btn text-xs bg-[#0066cc] hover:bg-[#0071e3] text-white flex items-center gap-1.5 py-1.5 px-4 select-none self-start sm:self-center shrink-0 transition-all shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 select-none" />
                  <span className="select-none">{t("profile.bind_now")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 6. Inset Group 4: 退出登录 (Sign Out Action) */}
          <div className="pt-3">
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