"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Zap, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { appleDialog } from "@/components/dialogs";

export default function LoginPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

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
      void appleDialog.alert({
        title: t("common.failed"),
        message: err.message || t("common.network_error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md apple-utility-card p-8 sm:p-10 space-y-8 bg-card shadow-sm border border-border">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#0066cc]/10 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold apple-headline tracking-tight text-foreground pt-1">
            {t("auth.login_title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("auth.login_subtitle")}
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
