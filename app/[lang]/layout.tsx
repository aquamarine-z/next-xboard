import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/dictionary";
import { AppProviders } from "@/components/layout/providers";
import "../globals.css";

export const metadata: Metadata = {
  title: "Xboard - Next Generation Network Portal",
  description: "Crafted with Apple HIG Design System & Next.js 16",
};

export async function generateStaticParams() {
  return [{ lang: "zh-CN" }, { lang: "en-US" }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <AppProviders locale={locale} dictionary={dictionary}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}