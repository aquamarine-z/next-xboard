"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import NiceModal from "@ebay/nice-modal-react";
import { I18nProvider } from "@/lib/i18n/context";
import type { Dictionary, Locale } from "@/lib/i18n/dictionary";
import { DocumentTitle } from "./document-title";
import { Toaster } from "@/components/ui/sonner";

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
        <DocumentTitle />
        <NiceModal.Provider>
          {children}
          <Toaster />
        </NiceModal.Provider>
      </I18nProvider>
    </NextThemesProvider>
  );
}
