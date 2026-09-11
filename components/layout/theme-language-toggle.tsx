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

  return (
    <div className="flex items-center gap-1.5">
      {/* Language Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 px-2.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer outline-none select-none">
          <Globe className="h-3.5 w-3.5 mr-1.5 opacity-80" />
          <span>{locale === "zh-CN" ? "中文" : "EN"}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[136px] p-1.5">
          <DropdownMenuItem
            onClick={() => setLocale("zh-CN")}
            className="flex items-center justify-between gap-3 text-[13px] py-2 px-2.5 rounded-[8px] cursor-pointer select-none"
          >
            <span className={locale === "zh-CN" ? "font-semibold text-foreground" : "font-normal text-muted-foreground"}>
              {t("common.language.zh_CN")}
            </span>
            {locale === "zh-CN" && (
              <Check className="h-3.5 w-3.5 text-[#0071e3] dark:text-[#2997ff] stroke-[2.5]" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setLocale("en-US")}
            className="flex items-center justify-between gap-3 text-[13px] py-2 px-2.5 rounded-[8px] cursor-pointer select-none"
          >
            <span className={locale === "en-US" ? "font-semibold text-foreground" : "font-normal text-muted-foreground"}>
              {t("common.language.en_US")}
            </span>
            {locale === "en-US" && (
              <Check className="h-3.5 w-3.5 text-[#0071e3] dark:text-[#2997ff] stroke-[2.5]" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 3-State Direct Cycle Theme Toggle Button */}
      <button
        type="button"
        onClick={cycleTheme}
        className="relative inline-flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-90 cursor-pointer transition-all outline-none"
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
