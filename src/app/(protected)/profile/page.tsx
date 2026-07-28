import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/features/auth/services/dal";
import { getServerLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getServerLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t.profile.title}</h1>

      <Card>
        <CardContent className="divide-y divide-border pt-6">
          <Row label={t.profile.fullNameLabel} value={user.fullName ?? t.profile.notProvided} />
          <Row
            label={t.profile.phoneLabel}
            value={
              <span dir="ltr" className="font-mono">
                {user.phone}
              </span>
            }
          />
          <Row label={t.profile.emailLabel} value={user.email ?? t.profile.notProvided} />
          <Separator className="my-1" />
          <Row
            label={t.profile.roleLabel}
            value={<Badge variant="secondary">{t.roles[user.role as keyof typeof t.roles]}</Badge>}
          />
        </CardContent>
      </Card>
    </div>
  );
}
