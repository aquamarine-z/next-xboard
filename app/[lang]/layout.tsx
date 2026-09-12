import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { sfPro, sfProDisplay } from "@/app/fonts";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/dictionary";
import { AppProviders } from "@/components/layout/providers";
import { getXboardSiteMeta } from "@/server/xboard-client";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const siteMeta = await getXboardSiteMeta();
  const siteName = siteMeta.title || "Aqua VPS (试运营中)";
  const siteDesc = siteMeta.description || "Aqua的VPS云";

  return {
    title: {
      default: siteName,
      template: `%s - ${siteName}`,
    },
    description: siteDesc,
  };
}

export async function generateStaticParams() {
  return [
    { lang: "zh-CN" },
    { lang: "en-US" },
    { lang: "ja-JP" },
    { lang: "ko-KR" },
  ];
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
    <html
      lang={locale}
      className={`${sfPro.variable} ${sfProDisplay.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <AppProviders locale={locale} dictionary={dictionary}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}