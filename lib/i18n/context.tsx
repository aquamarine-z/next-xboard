"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Dictionary, Locale } from "./dictionary";
import zhCNDict from "@/locales/zh-CN/dictionary.json";

interface I18nContextType {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const SUPPORTED_LOCALES: Locale[] = ["zh-CN", "en-US", "ja-JP", "ko-KR"];

export function I18nProvider({
  children,
  initialLocale,
  initialDictionary,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  initialDictionary?: Dictionary;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [dictionary, setDictionary] = useState<Dictionary>(initialDictionary || (zhCNDict as Dictionary));
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setLocaleState(initialLocale);
    if (initialDictionary) {
      setDictionary(initialDictionary);
    }
    document.cookie = `NEXT_LOCALE=${initialLocale};path=/;max-age=31536000;SameSite=Lax`;
  }, [initialLocale, initialDictionary]);

  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    setLocaleState(newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    
    // Dynamic import to update client dictionary immediately
    switch (newLocale) {
      case "zh-CN":
        import("@/locales/zh-CN/dictionary.json").then((m) => setDictionary(m.default as Dictionary));
        break;
      case "en-US":
        import("@/locales/en-US/dictionary.json").then((m) => setDictionary(m.default as Dictionary));
        break;
      case "ja-JP":
        import("@/locales/ja-JP/dictionary.json").then((m) => setDictionary(m.default as Dictionary));
        break;
      case "ko-KR":
        import("@/locales/ko-KR/dictionary.json").then((m) => setDictionary(m.default as Dictionary));
        break;
    }

    // Update browser URL to reflect the new locale
    const currentPath =
      pathname ||
      (typeof window !== "undefined" ? window.location.pathname : "");

    if (currentPath) {
      const segments = currentPath.split("/").filter(Boolean);
      let targetPath = `/${newLocale}`;

      if (
        segments.length > 0 &&
        SUPPORTED_LOCALES.includes(segments[0] as Locale)
      ) {
        segments[0] = newLocale;
        targetPath = "/" + segments.join("/");
      } else if (segments.length > 0) {
        targetPath = `/${newLocale}/${segments.join("/")}`;
      } else {
        targetPath = `/${newLocale}/dashboard`;
      }

      const search =
        typeof window !== "undefined" ? window.location.search : "";
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const targetUrl = `${targetPath}${search}${hash}`;

      router.replace(targetUrl);
    }
  };

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split(".");
    let current: any = dictionary;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return path;
      }
    }

    if (typeof current !== "string") {
      return path;
    }

    if (!params) return current;

    return Object.entries(params).reduce((str, [paramKey, paramVal]) => {
      return str.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramVal));
    }, current);
  };

  return (
    <I18nContext.Provider value={{ locale, dictionary, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
