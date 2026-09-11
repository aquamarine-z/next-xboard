"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Dictionary, Locale } from "./dictionary";
import zhCNDict from "@/locales/zh-CN/dictionary.json";

interface I18nContextType {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

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

  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    setLocaleState(newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    
    // Dynamic import to update client dictionary
    if (newLocale === "zh-CN") {
      import("@/locales/zh-CN/dictionary.json").then((m) => setDictionary(m.default as Dictionary));
    } else {
      import("@/locales/en-US/dictionary.json").then((m) => setDictionary(m.default as Dictionary));
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
