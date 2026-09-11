"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import NiceModal from "@ebay/nice-modal-react";
import { I18nProvider } from "@/lib/i18n/context";
import type { Dictionary, Locale } from "@/lib/i18n/dictionary";

export function AppProviders({
  children,
  locale,
  dictionary,
}: {
  children: React.ReactNode;
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider initialLocale={locale} initialDictionary={dictionary}>
        <NiceModal.Provider>{children}</NiceModal.Provider>
      </I18nProvider>
    </NextThemesProvider>
  );
}
