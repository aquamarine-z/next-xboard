"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { useUserStore } from "@/lib/store/userStore";
import { ThemeLanguageToggle } from "./theme-language-toggle";
import { Zap, LogIn } from "lucide-react";

export function AppleHeader() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const { authenticated, user, config, fetchDashboardData } = useUserStore();

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const navItems = [
    { label: t("common.nav.dashboard"), href: `/${locale}/dashboard` },
    { label: t("common.nav.nodes"), href: `/${locale}/nodes` },
    { label: t("common.nav.shop"), href: `/${locale}/shop` },
    { label: t("common.nav.knowledge"), href: `/${locale}/knowledge` },
    { label: t("common.nav.tickets"), href: `/${locale}/tickets` },
    { label: t("common.nav.profile"), href: `/${locale}/profile` },
  ];

  // Single unified title derived from backend or localization
  const siteTitle = config?.app_description || t("common.app_name");

  return (
    <header className="sticky top-0 z-40 w-full h-[54px] backdrop-blur-2xl bg-[#f5f5f7]/85 dark:bg-[#161617]/85 border-b border-black/[0.08] dark:border-white/[0.08] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        {/* Left: Single Brand Title & Status */}
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity shrink-0"
        >
          <div className="w-6 h-6 rounded-full bg-[#0066cc] text-white flex items-center justify-center shadow-xs">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-[17px] font-semibold tracking-tight apple-headline text-foreground">
            {siteTitle}
          </span>
          {authenticated && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#0066cc] dark:text-[#2997ff] bg-[#0066cc]/10 dark:bg-[#2997ff]/10 px-2 py-0.5 rounded-full font-medium ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t("common.status.online")}
            </span>
          )}
        </Link>

        {/* Center: Single Clean Navigation Items */}
        <nav className="hidden md:flex items-center space-x-7 text-[13px]">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors py-1 ${
                  isActive
                    ? "text-[#0066cc] dark:text-[#2997ff] font-semibold"
                    : "text-[#86868b] hover:text-foreground font-normal"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Persistent Action Blue Button + Theme/Lang + User Info */}
        <div className="flex items-center gap-3 shrink-0">

          {/* User Email or Login Link */}
          {authenticated && user ? (
            <Link
              href={`/${locale}/profile`}
              className="hidden lg:inline-flex items-center gap-1.5 text-[11px] text-[#86868b] hover:text-foreground transition-colors truncate max-w-[140px] px-2.5 py-1 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06] select-none"
              title={user.email}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 select-none" />
              <span className="truncate select-text">{user.email}</span>
            </Link>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="hidden sm:inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground font-medium transition-colors px-2 py-1"
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
