import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { UserNav } from "@/features/auth/components/user-nav";
import { getCurrentUser } from "@/features/auth/services/dal";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const locale = await getServerLocale();
  const t = getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-extrabold text-primary">
            {t.common.brand}
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground sm:flex">
            <Link href="/dashboard" className="hover:text-foreground">
              {t.nav.dashboard}
            </Link>
            <Link href="/profile" className="hover:text-foreground">
              {t.nav.profile}
            </Link>
            {(user.role === "MERCHANT" || user.role === "ADMIN") && (
              <Link href="/merchant" className="hover:text-foreground">
                {t.nav.merchant}
              </Link>
            )}
            {user.role === "ADMIN" && (
              <Link href="/admin" className="hover:text-foreground">
                {t.nav.admin}
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <UserNav user={user} />
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
