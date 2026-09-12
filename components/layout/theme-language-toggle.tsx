"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/lib/i18n/context";

export function ThemeLanguageToggle() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useTranslation();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    // 3-state cycle: light -> dark -> system -> light
    let nextTheme = "dark";
    if (theme === "light") {
      nextTheme = "dark";
    } else if (theme === "dark") {
      nextTheme = "system";
    } else {
      nextTheme = "light";
    }

    if (typeof document !== "undefined") {
      document.documentElement.classList.add("theme-transitioning");

      if ("startViewTransition" in document) {
        (document as any).startViewTransition(() => {
          setTheme(nextTheme);
        });
      } else {
        setTheme(nextTheme);
      }

      setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 400);
    } else {
      setTheme(nextTheme);
    }
  };

  const getThemeTitle = () => {
    if (!mounted) return t("common.theme.toggle");
    if (theme === "light") {
      return locale === "zh-CN"
        ? "浅色模式 (点击切换为深色模式)"
        : "Light Mode (Click for Dark)";
    }
    if (theme === "dark") {
      return locale === "zh-CN"
        ? "深色模式 (点击切换为跟随系统)"
        : "Dark Mode (Click for System)";
    }
    return locale === "zh-CN"
      ? "跟随系统 (点击切换为浅色模式)"
      : "Follow System (Click for Light)";
  };

  const getLocaleLabel = (loc: string) => {
    switch (loc) {
      case "zh-CN":
        return "中文";
      case "en-US":
        return "EN";
      case "ja-JP":
        return "日本語";
      case "ko-KR":
        return "한국어";
      default:
        return "中文";
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Language Switcher with iOS 26 Spatial Liquid Popover */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center h-[37px] w-[84px] sm:w-[88px] rounded-full text-xs font-medium text-muted-foreground hover:text-foreground bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.09] border border-black/[0.06] dark:border-white/[0.08] active:scale-95 transition-all duration-200 cursor-pointer outline-none select-none shadow-2xs gap-1.5 shrink-0">
          <Globe className="h-4 w-4 opacity-80 shrink-0" />
          <span className="font-medium text-center">{getLocaleLabel(locale)}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} className="min-w-[136px] p-1 rounded-[16px]">
          <DropdownMenuItem
            onClick={() => setLocale("zh-CN")}
            className="flex items-center justify-between py-2 px-3 rounded-[11px] text-[13px] font-medium text-foreground cursor-pointer transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] select-none"
          >
            <span className={locale === "zh-CN" ? "text-foreground font-medium" : "text-muted-foreground font-normal"}>
              {t("common.language.zh_CN")}
            </span>
            {locale === "zh-CN" && (
              <Check className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff] stroke-[2.5]" />
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setLocale("en-US")}
            className="flex items-center justify-between py-2 px-3 rounded-[11px] text-[13px] font-medium text-foreground cursor-pointer transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] select-none"
          >
            <span className={locale === "en-US" ? "text-foreground font-medium" : "text-muted-foreground font-normal"}>
              {t("common.language.en_US")}
            </span>
            {locale === "en-US" && (
              <Check className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff] stroke-[2.5]" />
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setLocale("ja-JP")}
            className="flex items-center justify-between py-2 px-3 rounded-[11px] text-[13px] font-medium text-foreground cursor-pointer transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] select-none"
          >
            <span className={locale === "ja-JP" ? "text-foreground font-medium" : "text-muted-foreground font-normal"}>
              {t("common.language.ja_JP")}
            </span>
            {locale === "ja-JP" && (
              <Check className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff] stroke-[2.5]" />
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setLocale("ko-KR")}
            className="flex items-center justify-between py-2 px-3 rounded-[11px] text-[13px] font-medium text-foreground cursor-pointer transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] select-none"
          >
            <span className={locale === "ko-KR" ? "text-foreground font-medium" : "text-muted-foreground font-normal"}>
              {t("common.language.ko_KR")}
            </span>
            {locale === "ko-KR" && (
              <Check className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff] stroke-[2.5]" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 3-State Direct Cycle Theme Toggle Button */}
      <button
        type="button"
        onClick={cycleTheme}
        className="relative inline-flex items-center justify-center h-[37px] w-[37px] rounded-full text-muted-foreground hover:text-foreground bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.09] border border-black/[0.06] dark:border-white/[0.08] active:scale-90 cursor-pointer transition-all duration-200 outline-none shadow-2xs"
        aria-label={getThemeTitle()}
        title={getThemeTitle()}
      >
        {/* 1. Sun Icon (Light) */}
        <Sun
          className={`h-4 w-4 absolute inset-0 m-auto transition-all duration-300 ease-out text-foreground ${
            mounted && theme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0 pointer-events-none"
          }`}
        />

        {/* 2. Moon Icon (Dark) */}
        <Moon
          className={`h-4 w-4 absolute inset-0 m-auto transition-all duration-300 ease-out text-foreground ${
            mounted && theme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-0 pointer-events-none"
          }`}
        />

        {/* 3. Laptop Icon (System) */}
        <Laptop
          className={`h-4 w-4 absolute inset-0 m-auto transition-all duration-300 ease-out text-foreground ${
            !mounted || theme === "system"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-45 scale-0 pointer-events-none"
          }`}
        />
      </button>
    </div>
  );
}
