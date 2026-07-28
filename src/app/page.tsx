import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function Home() {
  const locale = await getServerLocale();
  const t = getDictionary(locale);

  return (
    <main className="flex-1">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl font-extrabold text-primary">{t.common.brand}</span>
        <nav className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Button asChild>
            <Link href="/login">{t.landing.login}</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-12 text-center">
        <h1 className="text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
          {t.landing.heroTitle}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {t.landing.heroSubtitle}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/login">{t.landing.getStarted}</Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {t.landing.categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground"
            >
              {category}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-muted/50 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-3">
          {t.landing.steps.map((step) => (
            <div key={step.title} className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
              <h3 className="mb-2 text-lg font-bold text-card-foreground">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {t.common.brand} — {t.landing.footer}
      </footer>
    </main>
  );
}
