import localFont from "next/font/local";

export const sfPro = localFont({
  src: [
    {
      path: "./fonts/sf-pro-text_light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-text_regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-display_medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-text_semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-display_bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "SF Pro Text",
    "SF Pro Display",
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    "system-ui",
    "sans-serif",
  ],
});

export const sfProDisplay = localFont({
  src: [
    {
      path: "./fonts/sf-pro-display_regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-display_medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-display_semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro-display_bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro-display",
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "SF Pro Display",
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    "system-ui",
    "sans-serif",
  ],
});
