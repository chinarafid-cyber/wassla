export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";
export const LOCALE_COOKIE = "wassla_locale";

export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  ar: "rtl",
  en: "ltr",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
