"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { useUserStore } from "@/lib/store/userStore";
import { ThemeLanguageToggle } from "./theme-language-toggle";
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  User as UserIcon,
  LogIn,
} from "lucide-react";
import { AppleCloudIcon, AppleAppBadge } from "@/components/ui/apple-icons";
import { cn } from "@/lib/utils";

export function AppleHeader() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const { authenticated, user, config, fetchDashboardData } = useUserStore();

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 4 Primary Pillars: Dashboard (with nodes), Shop, Knowledge (standalone), Settings (with tickets)
  const navItems = React.useMemo(() => [
    {
      id: "dashboard",
      label: t("common.nav.dashboard"),
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
      isActive: (p: string) => p.startsWith(`/${locale}/dashboard`) || p.startsWith(`/${locale}/nodes`),
    },
    {
      id: "shop",
      label: t("common.nav.shop"),
      href: `/${locale}/shop`,
      icon: ShoppingBag,
      isActive: (p: string) => p.startsWith(`/${locale}/shop`),
    },
    {
      id: "knowledge",
      label: t("common.nav.knowledge"),
      href: `/${locale}/knowledge`,
      icon: BookOpen,
      isActive: (p: string) => p.startsWith(`/${locale}/knowledge`),
    },
    {
      id: "profile",
      label: t("common.nav.profile"),
      href: `/${locale}/profile`,
      icon: UserIcon,
      // Active on Settings AND when viewing Tickets
      isActive: (p: string) => p.startsWith(`/${locale}/profile`) || p.startsWith(`/${locale}/tickets`),
    },
  ], [locale, t]);

  const activeIndex = navItems.findIndex((item) => item.isActive(pathname));
  const [optimisticIndex, setOptimisticIndex] = React.useState<number | null>(null);

  const currentIndex = optimisticIndex ?? activeIndex;

  React.useEffect(() => {
    setOptimisticIndex(null);
  }, [pathname]);

  // Single unified title derived from backend or localization
  const siteTitle = config?.title || config?.app_name || config?.app_description || t("common.app_name");

  return (
    <header className="sticky top-2.5 sm:top-3.5 z-40 w-full px-3 sm:px-6 pointer-events-none transition-all duration-300">
      <div className="max-w-6xl w-full mx-auto h-[60px] sm:h-[64px] rounded-full pointer-events-auto liquid-glass-island border border-black/[0.08] dark:border-white/[0.14] px-4 sm:px-5.5 flex items-center justify-between gap-3 sm:gap-4 transition-all">
        {/* Left: Apple Brand Capsule & Status Indicator */}
        <div className="flex-1 flex items-center justify-start min-w-0">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity shrink-0 select-none max-w-full"
          >
            <AppleAppBadge size="sm" className="transition-transform group-hover:scale-105 shrink-0">
              <AppleCloudIcon className="w-4 h-4 text-[#86868b] dark:text-[#a1a1a6]" />
            </AppleAppBadge>
            <span className="text-[15px] sm:text-[16px] font-semibold tracking-tight apple-headline text-foreground truncate max-w-[240px] sm:max-w-[280px] lg:max-w-[320px]">
              {siteTitle}
            </span>
            {authenticated && (
              <span className="hidden xl:inline-flex items-center gap-1 text-[11px] text-[#0066cc] dark:text-[#2997ff] bg-[#0066cc]/10 dark:bg-[#2997ff]/10 px-2 py-0.5 rounded-full font-medium ml-1 select-none shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse select-none" />
                {t("common.status.online")}
              </span>
            )}
          </Link>
        </div>

        {/* Center: iOS 26 Segmented Capsule Dock Runner with Equal Width Tabs & Liquid Sliding Pill */}
        <nav className="relative hidden md:grid grid-cols-4 p-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.08] backdrop-blur-md select-none shrink-0 md:w-[410px] lg:w-[440px]">
          {/* Sliding Liquid Active Indicator Pill */}
          {currentIndex >= 0 && (
            <div
              className="liquid-glass-active-pill"
              style={{
                top: "4px",
                bottom: "4px",
                left: "4px",
                width: "calc((100% - 8px) / 4)",
                transform: `translateX(calc(${currentIndex} * 100%))`,
              }}
            />
          )}

          {navItems.map((item, index) => {
            const active = index === currentIndex;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setOptimisticIndex(index)}
                className={cn(
                  "relative z-10 flex items-center justify-center gap-1.5 h-8 sm:h-[34px] rounded-full text-[12.5px] transition-colors duration-200 select-none cursor-pointer w-full ios26-press",
                  active
                    ? "text-[#0066cc] dark:text-[#2997ff] font-semibold"
                    : "text-muted-foreground/80 hover:text-foreground font-medium"
                )}
              >
                <Icon
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200 shrink-0",
                    active ? "stroke-[2.2] scale-105" : "stroke-[1.8] opacity-75"
                  )}
                />
                <span className="truncate whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: User Profile Pill / Login + Theme & Language Switcher */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-2.5 shrink-0">
          {authenticated && user ? (
            <Link
              href={`/${locale}/profile`}
              className="hidden md:inline-flex items-center gap-2 text-xs text-foreground/90 hover:text-foreground transition-all px-2 sm:px-2.5 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.09] border border-black/[0.04] dark:border-white/[0.06] select-none group"
              title={user.email}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#0066cc]/25 to-[#2997ff]/25 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center font-bold text-[10px] shrink-0">
                {user.email ? user.email.slice(0, 1).toUpperCase() : "U"}
              </div>
              <span className="hidden xl:inline truncate max-w-[110px] text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                {user.email.split("@")[0]}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 select-none animate-pulse" />
            </Link>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-white font-medium transition-all px-3 py-1.5 rounded-full bg-gradient-to-r from-[#0071e3] to-[#0066cc] hover:from-[#0077ed] hover:to-[#005bb5] shadow-xs select-none ios26-press shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t("auth.login_button")}</span>
            </Link>
          )}

          <ThemeLanguageToggle />
        </div>
      </div>
    </header>
  );
}
