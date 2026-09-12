"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { useUserStore } from "@/lib/store/userStore";

export function DocumentTitle() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { config, fetchDashboardData } = useUserStore();

  // Fetch public config if not loaded yet
  React.useEffect(() => {
    if (!config) {
      void fetchDashboardData();
    }
  }, [config, fetchDashboardData]);

  React.useEffect(() => {
    const siteName =
      config?.title ||
      config?.app_name ||
      config?.app_description ||
      t("common.app_name") ||
      "Aqua VPS (试运营中)";

    let pageTitle = "";
    if (pathname.includes("/dashboard")) {
      pageTitle = t("common.nav.dashboard");
    } else if (pathname.includes("/nodes")) {
      pageTitle = t("common.nav.nodes");
    } else if (pathname.includes("/shop")) {
      pageTitle = t("common.nav.shop");
    } else if (pathname.includes("/knowledge")) {
      pageTitle = t("common.nav.knowledge");
    } else if (pathname.includes("/tickets")) {
      pageTitle = t("common.nav.tickets");
    } else if (pathname.includes("/profile")) {
      pageTitle = t("common.nav.profile");
    } else if (pathname.includes("/login")) {
      pageTitle = t("auth.login_title");
    }

    if (pageTitle) {
      document.title = `${pageTitle} - ${siteName}`;
    } else {
      document.title = siteName;
    }
  }, [pathname, t, config?.title, config?.app_name, config?.app_description]);

  return null;
}
