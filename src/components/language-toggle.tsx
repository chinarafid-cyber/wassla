"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/context";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const router = useRouter();

  function handleClick() {
    setLocale(locale === "ar" ? "en" : "ar");
    // Server Components (page titles, nav labels, etc.) read the locale
    // cookie at request time — refresh so they re-render in the new
    // language immediately instead of on the next full navigation.
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle language" onClick={handleClick}>
      <Languages />
      <span className="sr-only">{locale === "ar" ? "English" : "العربية"}</span>
    </Button>
  );
}
