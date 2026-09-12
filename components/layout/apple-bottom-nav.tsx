"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  User,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function AppleBottomNav() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();

  const items = React.useMemo(() => [
    {
      label: t("common.nav.dashboard"),
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
      matches: (p: string) => p.startsWith(`/${locale}/dashboard`) || p.startsWith(`/${locale}/nodes`),
    },
    {
      label: t("common.nav.shop"),
      href: `/${locale}/shop`,
      icon: ShoppingBag,
      matches: (p: string) => p.startsWith(`/${locale}/shop`),
    },
    {
      label: t("common.nav.knowledge"),
      href: `/${locale}/knowledge`,
      icon: BookOpen,
      matches: (p: string) => p.startsWith(`/${locale}/knowledge`),
    },
    {
      label: t("common.nav.profile"),
      href: `/${locale}/profile`,
      icon: User,
      matches: (p: string) => p.startsWith(`/${locale}/profile`) || p.startsWith(`/${locale}/tickets`),
    },
  ], [t, locale]);

  const activeIndex = items.findIndex((item) => item.matches(pathname));

  return (
    <nav className="md:hidden fixed bottom-[max(0.85rem,env(safe-area-inset-bottom))] left-4 right-4 max-w-[390px] mx-auto z-40 select-none">
      {/* Liquid Glass Island Container */}
      <div className="rounded-full liquid-glass-island p-1.5 transition-all">
        {/* Sliding Liquid Active Indicator Pill */}
        {activeIndex >= 0 && (
          <div
            className="liquid-glass-active-pill"
            style={{
              width: "calc((100% - 12px) / 4)",
              left: "6px",
              transform: `translateX(calc(${activeIndex} * 100%))`,
            }}
          />
        )}

        {/* Tab Items Grid */}
        <div className="relative z-10 grid grid-cols-4 items-center">
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-200 select-none ios26-press cursor-pointer",
                  isActive
                    ? "text-[#0071e3] dark:text-[#2997ff] font-semibold"
                    : "text-muted-foreground/75 hover:text-foreground font-medium"
                )}
              >
                <Icon
                  className={cn(
                    "w-[20.5px] h-[20.5px] mb-0.5 transition-all duration-300",
                    isActive
                      ? "scale-110 stroke-[2.2] drop-shadow-[0_2px_8px_rgba(0,113,227,0.35)] dark:drop-shadow-[0_2px_10px_rgba(41,151,255,0.55)]"
                      : "stroke-[1.7] opacity-85"
                  )}
                />
                <span
                  className={cn(
                    "text-[10.5px] tracking-tight leading-none whitespace-nowrap transition-all duration-200",
                    isActive
                      ? "font-semibold opacity-100"
                      : "opacity-80"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

