import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/features/auth/services/dal";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary, formatMessage } from "@/i18n/get-dictionary";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getServerLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.dashboard.title}</h1>
        <p className="mt-1 text-muted-foreground">
          {user.fullName
            ? formatMessage(t.dashboard.welcome, { name: user.fullName })
            : t.dashboard.welcomeNoName}
        </p>
      </div>

      {!user.profileCompleted && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 text-sm text-destructive">
            {t.dashboard.profileIncomplete}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.dashboard.phoneLabel}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span dir="ltr" className="text-muted-foreground">
            {user.phone}
          </span>
          <Badge>{t.roles[user.role as keyof typeof t.roles]}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
