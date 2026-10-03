"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  User,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { AppleLiquidTabs } from "@/components/ui/apple-liquid-tabs";

export function AppleBottomNav() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();

  const items = React.useMemo(() => [
    {
      id: "dashboard",
      label: t("common.nav.dashboard"),
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
      matches: (p: string) => p.startsWith(`/${locale}/dashboard`) || p.startsWith(`/${locale}/nodes`),
    },
    {
      id: "shop",
      label: t("common.nav.shop"),
      href: `/${locale}/shop`,
      icon: ShoppingBag,
      matches: (p: string) => p.startsWith(`/${locale}/shop`),
    },
    {
      id: "knowledge",
      label: t("common.nav.knowledge"),
      href: `/${locale}/knowledge`,
      icon: BookOpen,
      matches: (p: string) => p.startsWith(`/${locale}/knowledge`),
    },
    {
      id: "profile",
      label: t("common.nav.profile"),
      href: `/${locale}/profile`,
      icon: User,
      matches: (p: string) => p.startsWith(`/${locale}/profile`) || p.startsWith(`/${locale}/tickets`),
    },
  ], [t, locale]);

  const activeIndex = items.findIndex((item) => item.matches(pathname));
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeItem = items[safeActiveIndex] || items[0];

  return (
    <nav
      className="md:hidden fixed bottom-[max(0.85rem,env(safe-area-inset-bottom))] left-4 right-4 max-w-[390px] mx-auto z-20 sm:z-30 select-none touch-none overflow-visible py-2 -my-2"
      aria-label="Mobile Navigation Bar"
    >
      <AppleLiquidTabs
        size="lg"
        orientation="vertical"
        isRouteNav
        elevateOnDrag={true}
        value={activeItem.id}
        items={items.map((item) => ({
          id: item.id,
          label: item.label,
          icon: item.icon,
          href: item.href,
        }))}
        className="w-full"
      />
    </nav>
  );
}
