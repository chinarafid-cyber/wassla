import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/features/auth/services/dal";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const locale = await getServerLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.admin.title}</h1>
        <p className="mt-1 text-muted-foreground">{t.admin.subtitle}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.dashboard.phoneLabel}</CardTitle>
          <CardDescription dir="ltr">{user.phone}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t.roles.ADMIN}
        </CardContent>
      </Card>
    </div>
  );
}
