"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  ShoppingBag,
  BookOpen,
  MessageSquare,
  User,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function AppleBottomNav() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();

  const items = [
    { label: t("common.nav.dashboard"), href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { label: t("common.nav.nodes"), href: `/${locale}/nodes`, icon: Radio },
    { label: t("common.nav.shop"), href: `/${locale}/shop`, icon: ShoppingBag },
    { label: t("common.nav.knowledge"), href: `/${locale}/knowledge`, icon: BookOpen },
    { label: t("common.nav.tickets"), href: `/${locale}/tickets`, icon: MessageSquare },
    { label: t("common.nav.profile"), href: `/${locale}/profile`, icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl bg-[#f5f5f7]/85 dark:bg-[#161617]/85 border-t border-black/[0.08] dark:border-white/[0.1] px-1 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] transition-colors shadow-lg">
      <div className="grid grid-cols-6 items-center">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 rounded-xl ios-touch-feedback transition-all ${
                isActive
                  ? "text-[#0066cc] dark:text-[#2997ff] font-medium"
                  : "text-[#86868b] hover:text-foreground"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-1 transition-transform ${
                  isActive ? "scale-110 stroke-[2.3]" : "stroke-[1.6]"
                }`}
              />
              <span className="text-[10px] tracking-tight font-medium leading-none whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
