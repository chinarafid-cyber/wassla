"use client";

import * as React from "react";
import { getDictionary } from "./get-dictionary";
import { localeDirections, LOCALE_COOKIE, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/ar";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dictionary: Dictionary;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = localeDirections[next];
  }, []);

  const dictionary = React.useMemo(() => getDictionary(locale), [locale]);

  const value = React.useMemo(
    () => ({ locale, setLocale, dictionary }),
    [locale, setLocale, dictionary],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}

export function useTranslations() {
  return useLocale().dictionary;
}
