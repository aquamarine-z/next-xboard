import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

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
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: siteName,
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: ["/icons/icon-192x192.png"],
    },
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
  const siteMeta = await getXboardSiteMeta();
  const siteName = siteMeta.title || "Aqua VPS (试运营中)";

  return (
    <html
      lang={locale}
      className={`${sfPro.variable} ${sfProDisplay.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={siteName} />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <AppProviders locale={locale} dictionary={dictionary}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}