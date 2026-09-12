"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { useUserStore } from "@/lib/store/userStore";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { AppleCloudIcon, AppleAppBadge } from "@/components/ui/apple-icons";
import { ThemeLanguageToggle } from "@/components/layout/theme-language-toggle";

export default function LoginPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { config, fetchDashboardData } = useUserStore();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!config) {
      void fetchDashboardData();
    }
  }, [config, fetchDashboardData]);

  const siteName = config?.title || config?.app_name || "Aqua VPS (试运营中)";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("common.failed"));
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || t("common.network_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeLanguageToggle />
      </div>
      <div className="w-full max-w-md apple-utility-card p-8 sm:p-10 space-y-8 bg-card shadow-sm border border-border">
        <div className="text-center space-y-2">
          <AppleAppBadge size="lg" className="mx-auto mb-2">
            <AppleCloudIcon className="w-6.5 h-6.5 text-[#86868b] dark:text-[#a1a1a6]" />
          </AppleAppBadge>
          <h1 className="text-2xl sm:text-3xl font-semibold apple-headline tracking-tight text-foreground pt-1">
            {t("auth.login_title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("auth.login_subtitle").replace(/Xboard/g, siteName)}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {t("auth.email")}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.email_placeholder")}
                className="w-full h-11 pl-11 pr-4 rounded-full bg-secondary/50 border border-border text-xs sm:text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0066cc] dark:focus:border-[#2997ff] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {t("auth.password")}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.password_placeholder")}
                className="w-full h-11 pl-11 pr-4 rounded-full bg-secondary/50 border border-border text-xs sm:text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0066cc] dark:focus:border-[#2997ff] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full apple-pill-btn bg-[#0066cc] hover:bg-[#0071e3] text-white h-11 flex items-center justify-center gap-2 text-xs sm:text-[13px] font-medium shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("auth.logging_in")}</span>
              </>
            ) : (
              <>
                <span>{t("auth.login_button")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
