import type zhCNDict from "@/locales/zh-CN/dictionary.json";

export type Dictionary = typeof zhCNDict;
export type Locale = "zh-CN" | "en-US";

export const defaultLocale: Locale = "zh-CN";
export const locales: Locale[] = ["zh-CN", "en-US"];

const dictionaries = {
  "zh-CN": () => import("@/locales/zh-CN/dictionary.json").then((module) => module.default),
  "en-US": () => import("@/locales/en-US/dictionary.json").then((module) => module.default),
};

export const hasLocale = (locale: string): locale is Locale => {
  return (locales as string[]).includes(locale);
};

export const getDictionary = async (locale: Locale = defaultLocale): Promise<Dictionary> => {
  const loader = dictionaries[locale] || dictionaries[defaultLocale];
  return loader();
};
